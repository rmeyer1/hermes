// src/pages/GameDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameCard from '@components/GameCard';
import { oddsService } from '@services/oddsService';
import OddsTrendChart from '@/components/OddsTrendChart';

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
interface ChartData {
    labels: string[] | undefined;
    datasets: {
      label: string;
      data: number[] | undefined;
      borderColor: string;
      backgroundColor: string;
    }[];
  }

const GameDetails: React.FC = () => {
  const { gameId, teamPosition } = useParams<{ gameId: string; teamPosition: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<'h2h' | 'spreads' | 'totals'>('spreads');
  const [historicalOdds, setHistoricalOdds] = useState<any[]>([]);
  const [selectedBookmaker, setSelectedBookmaker] = useState<string>('');

  // Fetch game data and historical odds
  useEffect(() => {
    const loadGameAndOdds = async () => {
      try {
        if (!gameId) return;

        // Fetch current game data
        const gameData = await oddsService.getGameById(gameId);
        setGame(gameData);

        // Fetch historical odds data
        const historicalData = await oddsService.getHistoricalOdds(gameId);
        setHistoricalOdds(historicalData);
      } catch (error) {
        console.error('[GameDetails] Error loading game:', error);
        navigate('/');
      }
    };

    loadGameAndOdds();
  }, [gameId, navigate]);

  // Get unique bookmakers for the dropdown
  const bookmakers = Array.from(new Set(historicalOdds.flatMap(entry => 
    entry.bookmakers?.map((b: any) => b.title) || []
  )));

  // Transform historical odds data for the chart
  // src/pages/GameDetails.tsx
const chartData: ChartData = {
    labels: historicalOdds.map((entry) => {
      // Use the last_update field from the first bookmaker (or selected bookmaker)
      const bookmaker = selectedBookmaker
        ? entry.bookmakers.find((b: any) => b.title === selectedBookmaker)
        : entry.bookmakers[0]; // Default to the first bookmaker if no filter is applied
  
      if (!bookmaker || !bookmaker.last_update) return 'Invalid Date';
  
      // Format the date as MM/DD/YYYY
      const date = new Date(bookmaker.last_update);
      if (isNaN(date.getTime())) return 'Invalid Date';
  
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
  
      return `${month}/${day}/${year}`;
    }),
    datasets: [
      {
        label: teamPosition === 'home' ? game?.home_team || 'Home Team' : game?.away_team || 'Away Team',
        data: historicalOdds.map((entry) => {
          if (!entry.bookmakers?.length) return 0;
  
          // Filter bookmakers if a specific one is selected
          const bookmaker = selectedBookmaker
            ? entry.bookmakers.find((b: any) => b.title === selectedBookmaker)
            : entry.bookmakers[0]; // Default to the first bookmaker if no filter is applied
  
          if (!bookmaker) return 0;
  
          const market = bookmaker.markets.find((m: any) => m.key === selectedMarket);
          if (!market || !market.outcomes?.length) return 0;
  
          const outcome = market.outcomes.find((o: any) =>
            teamPosition === 'home' ? o.name === entry.home_team : o.name === entry.away_team
          );
  
          return selectedMarket === 'h2h' ? outcome?.price : outcome?.point || 0;
        }).filter(Boolean), // Remove null values
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

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
      <div className="max-w-2xl mx-auto">
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

        {/* Odds Trend Chart */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Odds Trends</h2>
            <select
              value={selectedBookmaker}
              onChange={(e) => setSelectedBookmaker(e.target.value)}
              className="bg-[var(--bg-secondary)] text-[var(--text-primary)] px-4 py-2 rounded cursor-pointer border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent"
            >
              {bookmakers.map((bookmaker) => (
                <option key={bookmaker} value={bookmaker}>
                  {bookmaker}
                </option>
              ))}
            </select>
          </div>
          <OddsTrendChart 
            data={chartData} 
            bookmakerFilter={selectedBookmaker}
            marketType={selectedMarket}
          />
        </div>
      </div>
    </div>
  );
};

export default GameDetails;