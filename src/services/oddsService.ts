import axios from 'axios';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface OddsData {
  // Add type definitions based on your API response
  [key: string]: any;
}

export const oddsService = {
  async getLatestOdds(): Promise<OddsData> {
    try {
      const oddsCollection = collection(db, 'odds');
      const q = query(oddsCollection, orderBy('timestamp', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('No odds data found');
      }

      return querySnapshot.docs[0].data().data;
    } catch (error) {
      console.error('Error getting latest odds:', error);
      throw error;
    }
  }
}; 