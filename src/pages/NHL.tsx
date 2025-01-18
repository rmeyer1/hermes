import React, { useState, useEffect } from 'react';
import GameScheduleCard from '@components/GameScheduleCard';
import { oddsService } from '@services/oddsService';
import { NHL } from '@constants/teamAbbreviations';

interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: any[];
}

type MarketType = 'h2h' | 'spreads' | 'totals';

const NHLPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketType>('spreads');

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const data = await oddsService.getLatestOdds('icehockey_nhl');
        // Transform the data to use abbreviations
        const gamesWithAbbreviations = data.map((game: Game) => {
          // Find the abbreviation by matching the full team name
          const homeAbbr = Object.entries(NHL).find(([_, name]) => name === game.home_team)?.[0] || game.home_team;
          const awayAbbr = Object.entries(NHL).find(([_, name]) => name === game.away_team)?.[0] || game.away_team;
          
          return {
            ...game,
            home_team: homeAbbr,
            away_team: awayAbbr
          };
        });
        console.log('Loaded games:', gamesWithAbbreviations);
        setGames(gamesWithAbbreviations as Game[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!games.length) return <div>No games available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          NHL Games
        </h1>
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value as MarketType)}
          className="bg-[var(--bg-secondary)] text-[var(--text-primary)] px-4 py-2 rounded cursor-pointer border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent"
        >
          <option value="spreads">Spread</option>
          <option value="h2h">Moneyline</option>
          <option value="totals">Totals</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [&>*]:break-inside-avoid">
        {games.map((game) => (
          <div key={game.id} className="inline-block w-full">
            <GameScheduleCard 
              game={game} 
              marketType={selectedMarket}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NHLPage;