import React, { useState, useEffect } from 'react'
import GameCard from '@components/GameCard'
import { oddsService } from '@services/oddsService'

type MarketType = 'h2h' | 'spreads' | 'totals'


const NFL: React.FC = () => {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMarket, setSelectedMarket] = useState<MarketType>('spreads')

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true)
        const data = await oddsService.getLatestOdds('basketball_nba')
        console.log('Loaded games:', data)
        setGames(data)
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
          NBA Games
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
            <GameCard 
              game={game} 
              marketType={selectedMarket}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default NFL 