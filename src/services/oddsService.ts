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
  },
  async getGameById(gameId: string): Promise<any> {
    try {
      // First, find the specific game to get its sport
      const initialQuery = query(
        collection(db, 'odds'),
        orderBy('timestamp', 'desc')
      );
      
      const initialSnapshot = await getDocs(initialQuery);
      let currentGame = null;
      let gameSport = null;

      // Find the first document that contains our game
      for (const doc of initialSnapshot.docs) {
        const game = doc.data().data.find((g: any) => g.id === gameId);
        if (game) {
          currentGame = game;
          gameSport = game.sport_key;
          break;
        }
      }
      
      if (!currentGame || !gameSport) {
        throw new Error('Game not found');
      }

      console.log('[oddsService] Found initial game:', {
        id: gameId,
        sport: gameSport,
        sport_key: currentGame.sport_key  // Added for debugging
      });

      // Now query with sport filter
      const sportQuery = query(
        collection(db, 'odds'),
        where('sport', '==', gameSport),
        orderBy('timestamp', 'desc'),
        limit(8)
      );
      
      const querySnapshot = await getDocs(sportQuery);
      const allDocs = querySnapshot.docs;
      
      // Find documents containing our game and sort by timestamp
      const relevantDocs = allDocs
        .filter(doc => {
          const hasGame = doc.data().data.some((g: any) => g.id === gameId);
          console.log('[oddsService] Checking doc:', {
            id: doc.id,
            timestamp: doc.data().timestamp,
            hasGame
          });
          return hasGame;
        })
        .sort((a, b) => b.data().timestamp - a.data().timestamp);

      console.log('[oddsService] Found relevant docs:', {
        count: relevantDocs.length,
        docs: relevantDocs.map(doc => ({
          id: doc.id,
          timestamp: doc.data().timestamp,
          gamesCount: doc.data().data.length
        }))
      });

      if (relevantDocs.length === 0) {
        throw new Error('Game not found');
      }

      // Get current game - update existing variable instead of redeclaring
      const currentDoc = relevantDocs[0];
      currentGame = currentDoc.data().data.find((g: any) => g.id === gameId);

      // Get previous game from older document
      let previousGame = null;
      if (relevantDocs.length > 1) {
        const previousDoc = relevantDocs[1];
        previousGame = previousDoc.data().data.find((g: any) => g.id === gameId);
        
        console.log('[oddsService] Historical data comparison:', {
          currentTimestamp: currentDoc.data().timestamp,
          previousTimestamp: previousDoc.data().timestamp,
          currentBookmakers: currentGame?.bookmakers?.length,
          previousBookmakers: previousGame?.bookmakers?.length
        });
      } else {
        console.log('[oddsService] No historical data found - only one document contains the game');
      }

      // Return processed game data
      const processedGame = {
        ...currentGame,
        previousOdds: previousGame?.bookmakers || []
      };

      console.log('[oddsService] Processed game data:', {
        id: processedGame.id,
        hasBookmakers: !!processedGame.bookmakers,
        bookmakersCount: processedGame.bookmakers?.length,
        hasPreviousOdds: !!processedGame.previousOdds,
        previousOddsCount: processedGame.previousOdds?.length
      });

      return processedGame;
      
    } catch (error) {
      console.error('[oddsService] Error getting game:', error);
      throw error;
    }
  }
}; 