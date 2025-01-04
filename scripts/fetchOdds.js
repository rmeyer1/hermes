import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

const SPORTS = {
  NFL: 'americanfootball_nfl',
  NCAAF: 'americanfootball_ncaaf',
  NBA: 'basketball_nba',
  NCAAB: 'basketball_ncaab',
  NHL: 'icehockey_nhl'
};

const formatPrivateKey = (key) => {
  if (!key) throw new Error('Private key is undefined');
  const unquoted = key.replace(/^["']|["']$/g, '');
  return unquoted.replace(/\\n/g, '\n');
};

const API_KEYS = {
  primary: process.env.VITE_ODDS_API_KEY,
  secondary: process.env.VITE_ODDS_API_KEY_2
};

async function makeApiRequest(apiKey, sport) {
  const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds/`, {
    params: {
      apiKey,
      regions: 'us,us2',
      markets: 'h2h,spreads,totals',
      oddsFormat: 'american',
      includeLinks: true
    }
  });

  const remainingRequests = parseInt(response.headers['x-requests-remaining'], 10);
  const usedRequests = parseInt(response.headers['x-requests-used'], 10);
  
  return {
    data: response.data,
    remainingRequests,
    usedRequests,
    sport
  };
}

async function fetchSportOdds(db, currentKey, sport) {
  try {
    const result = await makeApiRequest(currentKey, sport);
    console.log(`${sport} - API Requests Remaining: ${result.remainingRequests}`);

    await db.collection('odds').add({
      data: result.data,
      sport: sport,
      timestamp: new Date(),
      apiRequestsRemaining: result.remainingRequests,
      apiRequestsUsed: result.usedRequests,
      apiKeyUsed: currentKey === API_KEYS.primary ? 'primary' : 'secondary'
    });

    return {
      success: true,
      remainingRequests: result.remainingRequests,
      currentKey
    };
  } catch (error) {
    console.error(`Error fetching ${sport}:`, error);
    return {
      success: false,
      error
    };
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

  initializeApp({
    credential: cert(firebaseConfig)
  });

  console.log('Firebase initialized');
  const db = getFirestore();

  async function fetchAllOdds() {
    try {
      let currentKey = API_KEYS.primary;
      
      for (const [sportName, sportCode] of Object.entries(SPORTS)) {
        console.log(`Fetching ${sportName} odds...`);
        
        const result = await fetchSportOdds(db, currentKey, sportCode);
        
        if (!result.success && currentKey === API_KEYS.primary) {
          console.log(`Switching to secondary key for ${sportName}`);
          currentKey = API_KEYS.secondary;
          await fetchSportOdds(db, currentKey, sportCode);
        }
        
        if (result.success && result.remainingRequests === 0 && currentKey === API_KEYS.primary) {
          console.log('Primary API key depleted, switching to secondary key');
          currentKey = API_KEYS.secondary;
        }
      }

      console.log('Successfully fetched all odds data');
    } catch (error) {
      console.error('Error in fetchAllOdds:', error);
      process.exit(1);
    }
  }

  fetchAllOdds();
} catch (error) {
  console.error('Error in setup:', error);
  process.exit(1);
} 