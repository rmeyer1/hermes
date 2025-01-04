import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
initializeApp({
  credential: cert(firebaseConfig),
});

const db = getFirestore();

async function fetchOdds() {
  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/', {
      params: {
        apiKey: process.env.VITE_ODDS_API_KEY,
        regions: 'us,us2',
        markets: 'h2h,spreads,totals',
        oddsFormat: 'american',
        includeLinks: true
      }
    });

    await db.collection('odds').add({
      data: response.data,
      timestamp: new Date()
    });

    console.log('Successfully fetched and saved odds data');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fetchOdds(); 