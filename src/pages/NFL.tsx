import React, { useState } from 'react'
import GameCard from '@components/GameCard'
import sampleData from '@assets/sample.json'

type MarketType = 'h2h' | 'spreads' | 'totals'

const NFL: React.FC = () => {
  const [games] = useState(sampleData)
  const [selectedMarket, setSelectedMarket] = useState<MarketType>('h2h')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          NFL Games
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedMarket('h2h')}
            className={`px-4 py-2 rounded ${
              selectedMarket === 'h2h'
                ? 'bg-[var(--text-accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            Moneyline
          </button>
          <button
            onClick={() => setSelectedMarket('spreads')}
            className={`px-4 py-2 rounded ${
              selectedMarket === 'spreads'
                ? 'bg-[var(--text-accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            Spread
          </button>
          <button
            onClick={() => setSelectedMarket('totals')}
            className={`px-4 py-2 rounded ${
              selectedMarket === 'totals'
                ? 'bg-[var(--text-accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            Totals
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            marketType={selectedMarket}
          />
        ))}
      </div>
    </div>
  )
}

export default NFL 