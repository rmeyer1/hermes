import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

// Format private key by replacing literal \n with actual newlines
const formatPrivateKey = (key) => {
  if (!key) throw new Error('Private key is undefined');
  // Remove any quotes from the beginning and end
  const unquoted = key.replace(/^["']|["']$/g, '');
  return unquoted.replace(/\\n/g, '\n');
};

let currentApiKey = process.env.VITE_ODDS_API_KEY;
const MIN_REQUESTS_THRESHOLD = 5; // Buffer to switch before hitting 0

async function checkAndRotateApiKey() {
    try {
      console.log('Checking API key...');
      const checkResponse = await axios.get('https://api.the-odds-api.com/v4/sports', {
        params: { apiKey: currentApiKey }
      });
            
      const remainingRequests = checkResponse.headers['x-requests-remaining'];
      console.log(`Remaining requests: ${remainingRequests}`);
      
      if (parseInt(remainingRequests) <= MIN_REQUESTS_THRESHOLD) {
        if (currentApiKey === process.env.VITE_ODDS_API_KEY) {
          console.log('Approaching request limit, switching to backup API key...');
          currentApiKey = process.env.VITE_ODDS_API_KEY_2;
        } else {
          console.error('All API keys near limit. Consider increasing threshold or adding more keys.');
        }
      }
    } catch (error) {
      // If first key fails, try the backup
      if (currentApiKey === process.env.VITE_ODDS_API_KEY) {
        console.log('Primary key failed, switching to backup API key...');
        currentApiKey = process.env.VITE_ODDS_API_KEY_2;
      }
    }
  }

try {
  console.log('Initializing Firebase config...');
  
  const firebaseConfig = {
    type: "service_account",
    project_id: process.env.VITE_FIREBASE_PROJECT_ID,
    private_key_id: process.env.VITE_FIREBASE_PRIVATE_KEY_ID,
    private_key: formatPrivateKey(process.env.VITE_FIREBASE_PRIVATE_KEY),
    client_email: process.env.VITE_FIREBASE_CLIENT_EMAIL,
    client_id: process.env.VITE_FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.VITE_FIREBASE_CERT_URL
  };

  console.log('Config created, initializing Firebase...');
  console.log('Project ID:', firebaseConfig.project_id);
  console.log('Client Email:', firebaseConfig.client_email);
  console.log('Private Key format check:', 
    firebaseConfig.private_key.startsWith('-----BEGIN PRIVATE KEY-----') && 
    firebaseConfig.private_key.endsWith('-----END PRIVATE KEY-----\n')
  );

  // Initialize Firebase Admin
  initializeApp({
    credential: cert(firebaseConfig)
  });

  console.log('Firebase initialized, getting Firestore...');
  const db = getFirestore();

  async function fetchOdds() {
    const sports = [
        'americanfootball_nfl',
        'americanfootball_ncaaf',
        'basketball_nba',
        'basketball_ncaab',
        'icehockey_nhl'
      ];
    try {
     console.log('Checking API key...');
      await checkAndRotateApiKey();
      console.log('Fetching odds data...');
      for (const sport of sports) { 
        console.log(`Fetching odds for ${sport}...`);
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds/`, {
            params: {
              apiKey: process.env.VITE_ODDS_API_KEY,
            regions: 'us,us2',
            markets: 'h2h,spreads,totals',
            oddsFormat: 'american',
            includeLinks: true
          }
        });
        console.log('Odds data fetched, saving to Firestore...');
        const timestamp = new Date();
        
        if (sport === 'basketball_ncaab') {
          const data = response.data;
          const midPoint = Math.ceil(data.length / 2);
          
          await Promise.all([
            db.collection('odds').add({
              sport,
              data: data.slice(0, midPoint),
              timestamp,
              part: 1,
              total_parts: 2
            }),
            db.collection('odds').add({
              sport,
              data: data.slice(midPoint),
              timestamp,
              part: 2,
              total_parts: 2
            })
          ]);
        } else {
          await db.collection('odds').add({
            sport,
            data: response.data,
            timestamp
          });
        }
      }

      console.log('Successfully fetched and saved odds data');
    } catch (error) {
      console.error('Error in fetchOdds:', error);
      throw error;
    }
  }

  fetchOdds();
} catch (error) {
  console.error('Error in setup:', error);
  process.exit(1);
} 