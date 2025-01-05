import React, { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Outcome {
  name: string
  price: number
  point?: number
  link?: string
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

  const findBestPrices = () => {
    const market = game.bookmakers
      .map(b => b.markets.find(m => m.key === marketType))
      .filter(Boolean);

    if (marketType === 'h2h') {  // moneyline
      const awayPrices = market.map(m => m?.outcomes.find(o => o.name === game.away_team))
        .filter(Boolean);
      const homePrices = market.map(m => m?.outcomes.find(o => o.name === game.home_team))
        .filter(Boolean);

      const bestAway = awayPrices.reduce((best, current) => {
        if (!best || !current) return best;
        const isUnderdog = current.price > 0;
        
        if (isUnderdog) {
          // For underdogs, want highest positive number
          return current.price > best.price ? current : best;
        } else {
          // For favorites, want smallest negative number (closest to zero)
          return Math.abs(current.price) < Math.abs(best.price) ? current : best;
        }
      });

      const bestHome = homePrices.reduce((best, current) => {
        if (!best || !current) return best;
        const isUnderdog = current.price > 0;
        
        if (isUnderdog) {
          // For underdogs, want highest positive number
          return current.price > best.price ? current : best;
        } else {
          // For favorites, want smallest negative number (closest to zero)
          return Math.abs(current.price) < Math.abs(best.price) ? current : best;
        }
      });

      return { bestAway, bestHome };
    }

    if (marketType === 'totals') {
      const overPrices = market.map(m => m?.outcomes.find(o => o.name === 'Over'))
        .filter(Boolean);
      const underPrices = market.map(m => m?.outcomes.find(o => o.name === 'Under'))
        .filter(Boolean);

      const bestOver = overPrices.reduce((best, current) => {
        if (!best || !current) return best;
        if (current.point! < best.point!) return current;
        if (current.point === best.point) {
          return current.price > best.price ? current : best;
        }
        return best;
      });

      const bestUnder = underPrices.reduce((best, current) => {
        if (!best || !current) return best;
        if (current.point! > best.point!) return current;
        if (current.point === best.point) {
          return current.price > best.price ? current : best;
        }
        return best;
      });

      return { bestOver, bestUnder };
    }

    if (marketType === 'spreads') {
      const awayPrices = market.map(m => m?.outcomes.find(o => o.name === game.away_team))
        .filter(Boolean);
      const homePrices = market.map(m => m?.outcomes.find(o => o.name === game.home_team))
        .filter(Boolean);

      const bestAway = awayPrices.reduce((best, current) => {
        if (!best || !current) return best;
        const isFavorite = current.point! < 0;
        
        if (isFavorite) {
          if (Math.abs(current.point!) < Math.abs(best.point!)) return current;
          if (Math.abs(current.point!) === Math.abs(best.point!)) {
            return current.price > best.price ? current : best;
          }
        } else {
          if (current.point! > best.point!) return current;
          if (current.point === best.point) {
            return current.price > best.price ? current : best;
          }
        }
        return best;
      });

      const bestHome = homePrices.reduce((best, current) => {
        if (!best || !current) return best;
        const isFavorite = current.point! < 0;
        
        if (isFavorite) {
          if (Math.abs(current.point!) < Math.abs(best.point!)) return current;
          if (Math.abs(current.point!) === Math.abs(best.point!)) {
            return current.price > best.price ? current : best;
          }
        } else {
          if (current.point! > best.point!) return current;
          if (current.point === best.point) {
            return current.price > best.price ? current : best;
          }
        }
        return best;
      });

      return { bestAway, bestHome };
    }

    const awayPrices = market.map(m => m?.outcomes.find(o => o.name === game.away_team))
      .filter(Boolean);
    const homePrices = market.map(m => m?.outcomes.find(o => o.name === game.home_team))
      .filter(Boolean);

    const bestAway = awayPrices.reduce((best, current) => {
      if (!best || !current) return best;
      const isUnderdog = current.price > 0;
      return isUnderdog 
        ? (current.price > best.price ? current : best)
        : (current.price > best.price ? best : current);
    });

    const bestHome = homePrices.reduce((best, current) => {
      if (!best || !current) return best;
      const isUnderdog = current.price > 0;
      return isUnderdog 
        ? (current.price > best.price ? current : best)
        : (current.price > best.price ? best : current);
    });

    return { bestAway, bestHome };
  }

  const renderOutcome = (outcome: Outcome, bookmakerKey: string) => {
    const bestPrices = findBestPrices();
    let isBestPrice = false;

    if (marketType === 'totals') {
      const { bestOver, bestUnder } = bestPrices;
      isBestPrice = (
        (outcome.name === 'Over' && outcome.point === bestOver?.point && outcome.price === bestOver?.price) ||
        (outcome.name === 'Under' && outcome.point === bestUnder?.point && outcome.price === bestUnder?.price)
      );
    } else {
      const { bestAway, bestHome } = bestPrices;
      isBestPrice = (
        (outcome.name === game.away_team && outcome.price === bestAway?.price && outcome.point === bestAway?.point) ||
        (outcome.name === game.home_team && outcome.price === bestHome?.price && outcome.point === bestHome?.point)
      );
    }

    const content = (
      <>
        {marketType === 'totals' || marketType === 'spreads' 
          ? outcome.point && (
              marketType === 'spreads'
                ? `${outcome.point > 0 ? '+' : ''}${outcome.point} `
                : `${outcome.point} `
            )
          : ''}
        {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
      </>
    );

    const className = `inline-block px-2 py-1 rounded ${
      isBestPrice 
        ? 'text-green-500 bg-green-500/10' 
        : 'text-[var(--text-accent)]'
    } ${outcome.link ? 'cursor-pointer hover:opacity-80' : ''}`;

    return outcome.link ? (
      <a 
        href={outcome.link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    ) : (
      <div className={className}>
        {content}
      </div>
    );
  }

  const getMarketOutcomes = (bookmaker: Bookmaker) => {
    const market = bookmaker.markets.find(m => m.key === marketType)
    if (!market) return null

    if (marketType === 'totals') {
      const overOutcome = market.outcomes.find(o => o.name === 'Over')
      const underOutcome = market.outcomes.find(o => o.name === 'Under')
      
      return (
        <React.Fragment key={bookmaker.key}>
          <div className="text-sm text-[var(--text-primary)] px-4 whitespace-nowrap truncate">
            {bookmaker.title}
          </div>
          <div className="text-right whitespace-nowrap">
            {overOutcome && renderOutcome(overOutcome, bookmaker.key)}
          </div>
          <div className="text-right whitespace-nowrap">
            {underOutcome && renderOutcome(underOutcome, bookmaker.key)}
          </div>
        </React.Fragment>
      )
    }

    const awayOutcome = market.outcomes.find(o => o.name === game.away_team)
    const homeOutcome = market.outcomes.find(o => o.name === game.home_team)

    return (
      <React.Fragment key={bookmaker.key}>
        <div className="text-sm text-[var(--text-primary)] px-2 whitespace-nowrap truncate">
          {bookmaker.title}
        </div>
        <div className="text-right whitespace-nowrap">
          {awayOutcome && renderOutcome(awayOutcome, bookmaker.key)}
        </div>
        <div className="text-right whitespace-nowrap">
          {homeOutcome && renderOutcome(homeOutcome, bookmaker.key)}
        </div>
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
        <div className="flex justify-between items-center text-lg mt-2 min-w-[300px] overflow-x-auto">
          <div className="text-[var(--text-primary)] whitespace-nowrap">{game.away_team}</div>
          <div className="text-[var(--text-primary)] mx-4 whitespace-nowrap">@</div>
          <div className="text-[var(--text-primary)] whitespace-nowrap">{game.home_team}</div>
        </div>
      </div>

      <div 
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: isExpanded ? '800px' : '0' }}
      >
        <div className="p-4">
          <div className="min-w-[300px] overflow-x-auto">
            <div className="grid grid-cols-[140px,100px,100px] gap-x-3">
              <div className="text-sm font-semibold text-[var(--text-secondary)] px-2 whitespace-nowrap">Bookmaker</div>
              <div className="text-sm font-semibold text-[var(--text-secondary)] text-right whitespace-nowrap">
                {marketType === 'totals' ? 'Over' : game.away_team}
              </div>
              <div className="text-sm font-semibold text-[var(--text-secondary)] text-right pl-4 whitespace-nowrap truncate">
                {marketType === 'totals' ? 'Under' : game.home_team}
              </div>

              {game.bookmakers.map((bookmaker) => getMarketOutcomes(bookmaker))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameCard 