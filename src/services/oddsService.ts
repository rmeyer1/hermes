import axios from 'axios';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

export interface OddsData {
  // Add type definitions based on your API response
  [key: string]: any;
}

export const oddsService = {
  async getLatestOdds(sport: string): Promise<OddsData> {
    try {
      const oddsCollection = collection(db, 'odds');
      const q = query(
        oddsCollection,
        orderBy('timestamp', 'desc'),
        where('sport', '==', sport),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`No odds data found for sport: ${sport}`);
      }

      return querySnapshot.docs[0].data().data;
    } catch (error) {
      console.error(`Error getting latest odds for ${sport}:`, error);
      throw error;
    }
  }
}; 