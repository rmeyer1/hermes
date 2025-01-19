import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameCard from '@components/GameCard';
import { oddsService } from '@services/oddsService';

interface Bookmaker {
  key: string;
  title: string;
  markets: any[];
}

interface Game {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
  previousOdds: Bookmaker[];
}

const GameDetails: React.FC = () => {
  const { gameId, teamPosition } = useParams<{ gameId: string; teamPosition: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<'h2h' | 'spreads' | 'totals'>('spreads');

  // Fetch game data using gameId
  useEffect(() => {
    const loadGame = async () => {
      try {
        if (!gameId) return;
        
        const gameData = await oddsService.getGameById(gameId);
        console.log('[GameDetails] Raw game data:', {
          id: gameData?.id,
          hasBookmakers: !!gameData?.bookmakers,
          bookmakersLength: gameData?.bookmakers?.length,
          hasPreviousOdds: !!gameData?.previousOdds,
          previousOddsLength: gameData?.previousOdds?.length
        });

        if (!gameData?.bookmakers) {
          console.log('[GameDetails] No bookmakers data available');
          setGame(null);
          return;
        }

        setGame(gameData);
      } catch (error) {
        console.error('[GameDetails] Error loading game:', error);
        navigate('/');
      }
    };

    loadGame();
  }, [gameId, navigate]);

  if (!game || !game.bookmakers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="text-[var(--text-primary)] hover:text-[var(--text-accent)]"
          >
            ← Back
          </button>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
          <div className="text-[var(--text-primary)]">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="text-[var(--text-primary)] hover:text-[var(--text-accent)]"
        >
          ← Back
        </button>
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value as 'h2h' | 'spreads' | 'totals')}
          className="bg-[var(--bg-secondary)] text-[var(--text-primary)] px-4 py-2 rounded cursor-pointer border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent"
        >
          <option value="spreads">Spread</option>
          <option value="h2h">Moneyline</option>
          <option value="totals">Totals</option>
        </select>
      </div>

      <GameCard 
        game={game}
        marketType={selectedMarket}
        teamPosition={teamPosition as 'home' | 'away'}
      />
    </div>
  );
};

export default GameDetails;
