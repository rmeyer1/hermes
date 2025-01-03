import React, { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Outcome {
  name: string
  price: number
  point?: number
}

interface Market {
  key: string
  outcomes: Outcome[]
}

interface Bookmaker {
  key: string
  title: string
  markets: Market[]
}

interface Game {
  id: string
  sport_key: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: Bookmaker[]
}

interface GameCardProps {
  game: Game
  marketType: 'h2h' | 'spreads' | 'totals'
}

const GameCard: React.FC<GameCardProps> = ({ game, marketType }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg overflow-hidden">
      {/* Game Header - Now Clickable */}
      <div 
        className="p-4 border-b border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-hover)]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="text-sm text-[var(--text-secondary)]">
            {format(new Date(game.commence_time), 'MMM d, yyyy - h:mm a')}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
          )}
        </div>
        <div className="flex justify-between items-center text-lg mt-2">
          <div className="text-[var(--text-primary)]">{game.away_team}</div>
          <div className="text-[var(--text-primary)] mx-4">@</div>
          <div className="text-[var(--text-primary)]">{game.home_team}</div>
        </div>
      </div>

      {/* Collapsible Bookmakers Grid */}
      <div className={`transition-all duration-200 ease-in-out ${
        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="p-4">
          <div className="grid grid-cols-[auto,1fr,1fr] gap-4">
            {/* Headers */}
            <div className="text-sm font-semibold text-[var(--text-secondary)]">Bookmaker</div>
            <div className="text-sm font-semibold text-[var(--text-secondary)] text-right">{game.away_team}</div>
            <div className="text-sm font-semibold text-[var(--text-secondary)] text-right">{game.home_team}</div>

            {/* Bookmaker rows */}
            {game.bookmakers.map((bookmaker) => {
              const market = bookmaker.markets.find(m => m.key === marketType)
              if (!market) return null

              const awayOutcome = market.outcomes.find(o => o.name === game.away_team)
              const homeOutcome = market.outcomes.find(o => o.name === game.home_team)

              return (
                <React.Fragment key={bookmaker.key}>
                  <div className="text-sm text-[var(--text-primary)]">
                    {bookmaker.title}
                  </div>
                  <div className="text-[var(--text-accent)] text-right">
                    {awayOutcome?.point !== undefined && `${awayOutcome.point > 0 ? '+' : ''}${awayOutcome.point} `}
                    {awayOutcome?.price > 0 ? `+${awayOutcome.price}` : awayOutcome?.price}
                  </div>
                  <div className="text-[var(--text-accent)] text-right">
                    {homeOutcome?.point !== undefined && `${homeOutcome.point > 0 ? '+' : ''}${homeOutcome.point} `}
                    {homeOutcome?.price > 0 ? `+${homeOutcome.price}` : homeOutcome?.price}
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameCard 