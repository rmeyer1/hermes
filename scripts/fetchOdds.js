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
    try {
      console.log('Fetching odds data...');
      const response = await axios.get('https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/', {
        params: {
          apiKey: process.env.VITE_ODDS_API_KEY,
          regions: 'us,us2',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          includeLinks: true
        }
      });

      console.log('Odds data fetched, saving to Firestore...');
      await db.collection('odds').add({
        data: response.data,
        timestamp: new Date()
      });

      console.log('Successfully fetched and saved odds data');
    } catch (error) {
      console.error('Error in fetchOdds:', error);
      process.exit(1);
    }
  }

  fetchOdds();
} catch (error) {
  console.error('Error in setup:', error);
  process.exit(1);
} 