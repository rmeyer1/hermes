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

  const handleClick = () => {
    console.log('Game ID:', game.id)
    setIsExpanded(!isExpanded)
  }

  const renderOutcome = (outcome: Outcome) => {
    if (marketType === 'totals') {
      return (
        <div className="text-[var(--text-accent)] text-right">
          {outcome.point && `${outcome.point} `}
          {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
        </div>
      )
    }

    return (
      <div className="text-[var(--text-accent)] text-right">
        {outcome.point !== undefined && `${outcome.point > 0 ? '+' : ''}${outcome.point} `}
        {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
      </div>
    )
  }

  const getMarketOutcomes = (bookmaker: Bookmaker) => {
    const market = bookmaker.markets.find(m => m.key === marketType)
    if (!market) return null

    if (marketType === 'totals') {
      const overOutcome = market.outcomes.find(o => o.name === 'Over')
      const underOutcome = market.outcomes.find(o => o.name === 'Under')
      
      return (
        <React.Fragment key={bookmaker.key}>
          <div className="text-sm text-[var(--text-primary)]">
            {bookmaker.title}
          </div>
          {overOutcome && renderOutcome(overOutcome)}
          {underOutcome && renderOutcome(underOutcome)}
        </React.Fragment>
      )
    }

    const awayOutcome = market.outcomes.find(o => o.name === game.away_team)
    const homeOutcome = market.outcomes.find(o => o.name === game.home_team)

    return (
      <React.Fragment key={bookmaker.key}>
        <div className="text-sm text-[var(--text-primary)]">
          {bookmaker.title}
        </div>
        {awayOutcome && renderOutcome(awayOutcome)}
        {homeOutcome && renderOutcome(homeOutcome)}
      </React.Fragment>
    )
  }

  return (
    <div 
      className="bg-[var(--bg-secondary)] rounded-lg overflow-hidden"
      data-game-id={game.id}
    >
      <div 
        className="p-4 cursor-pointer hover:bg-[var(--bg-hover)] border-b border-[var(--border-color)]"
        onClick={handleClick}
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

      <div 
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: isExpanded ? '800px' : '0' }}
      >
        <div className="p-4">
          <div className="grid grid-cols-[auto,1fr,1fr] gap-4">
            {/* Headers */}
            <div className="text-sm font-semibold text-[var(--text-secondary)]">Bookmaker</div>
            <div className="text-sm font-semibold text-[var(--text-secondary)] text-right">
              {marketType === 'totals' ? 'Over' : game.away_team}
            </div>
            <div className="text-sm font-semibold text-[var(--text-secondary)] text-right">
              {marketType === 'totals' ? 'Under' : game.home_team}
            </div>

            {/* Bookmaker rows */}
            {game.bookmakers.map((bookmaker) => getMarketOutcomes(bookmaker))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameCard 