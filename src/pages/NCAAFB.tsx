import React, { useState, useEffect } from 'react'
import GameScheduleCard from '@components/GameScheduleCard'
import { oddsService } from '@services/oddsService'
import { NCAAF } from '@constants/teamAbbreviations'

interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: any[];
}

type MarketType = 'h2h' | 'spreads' | 'totals'


const NCAAFB: React.FC = () => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMarket, setSelectedMarket] = useState<MarketType>('spreads')

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true)
        const data = await oddsService.getLatestOdds('americanfootball_ncaaf')
        
        const gamesWithAbbreviations = data.map((game: Game) => {
          // Helper function to find abbreviation by matching API team name
          const findTeamAbbr = (apiTeamName: string) => {
            // Find the entry where the API team name includes our full team name
            const entry = Object.entries(NCAAF).find(([abbr, fullName]) => {
              return apiTeamName.toLowerCase().includes(fullName.toLowerCase());
            });
            
            return entry?.[0] || apiTeamName;
          };

          return {
            ...game,
            home_team: findTeamAbbr(game.home_team),
            away_team: findTeamAbbr(game.away_team)
          };
        });
        
        console.log('Loaded games:', gamesWithAbbreviations);
        setGames(gamesWithAbbreviations as Game[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!games.length) return <div>No games available</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          NCAA Football Games
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
  )
}

export default NCAAFB 