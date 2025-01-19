import React, { useState } from 'react'
import '../index.css'
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react'
import { cleanSportsUrl } from '@utils/formatUrl'

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
  previousOdds?: Bookmaker[]
}

interface GameWithHistory extends Game {
  previousOdds: Bookmaker[];
}

interface GameCardProps {
  game: Game
  marketType: 'h2h' | 'spreads' | 'totals'
  teamPosition: 'home' | 'away'
}

const GameCard: React.FC<GameCardProps> = ({ game, marketType, teamPosition }) => {
  const teamName = teamPosition === 'home' ? game.home_team : game.away_team;

  console.log('[GameCard] Rendering with:', {
    teamName,
    marketType,
    bookmakers: game.bookmakers?.length,
    hasPreviousOdds: !!game.previousOdds,
    previousOddsCount: game.previousOdds?.length
  });

  // Find best price for the selected team
  const findBestPrice = () => {
    if (!game.bookmakers?.length) {
      console.log('[GameCard] No bookmakers available');
      return null;
    }

    const market = game.bookmakers
      .map(b => b.markets?.find(m => m.key === marketType))
      .filter(Boolean);

    if (!market.length) {
      console.log('[GameCard] No markets found for type:', marketType);
      return null;
    }

    if (marketType === 'totals') {
      const prices = market.map(m => m?.outcomes.find(o => o.name === (teamPosition === 'home' ? 'Over' : 'Under')))
        .filter(Boolean)

      return prices.reduce((best, current) => {
        if (!best || !current) return best
        if (current.point! < best.point!) return current
        if (current.point === best.point) {
          return current.price > best.price ? current : best
        }
        return best
      })
    }

    const prices = market.map(m => m?.outcomes.find(o => 
      teamPosition === 'home' ? o.name === game.home_team : o.name === game.away_team
    )).filter(Boolean)

    if (marketType === 'spreads') {
      return prices.reduce((best, current) => {
        if (!best || !current) return best
        const isFavorite = current.point! < 0
        
        if (isFavorite) {
          if (Math.abs(current.point!) < Math.abs(best.point!)) return current
          if (Math.abs(current.point!) === Math.abs(best.point!)) {
            return current.price > best.price ? current : best
          }
        } else {
          if (current.point! > best.point!) return current
          if (current.point === best.point) {
            return current.price > best.price ? current : best
          }
        }
        return best
      })
    }

    return prices.reduce((best, current) => {
      if (!best || !current) return best
      const isUnderdog = current.price > 0
      return isUnderdog 
        ? (current.price > best.price ? current : best)
        : (current.price > best.price ? best : current)
    })
  }

  const getPriceMovement = (outcome: Outcome, bookmaker: Bookmaker) => {
    if (!game.previousOdds?.length) {
      console.log('[GameCard] No historical odds available for:', bookmaker.key);
      return null;
    }

    const previousBookmaker = game.previousOdds.find(b => b.key === bookmaker.key);
    if (!previousBookmaker?.markets) {
      console.log('[GameCard] No previous markets for bookmaker:', bookmaker.key);
      return null;
    }

    const previousMarket = previousBookmaker.markets.find(m => m.key === marketType);
    if (!previousMarket?.outcomes) {
      console.log('[GameCard] No previous outcomes for market type:', marketType);
      return null;
    }

    let previousOutcome;
    if (marketType === 'totals') {
      previousOutcome = previousMarket.outcomes.find(o => 
        o.name === (teamPosition === 'home' ? 'Over' : 'Under')
      );
    } else {
      console.log('[GameCard] Looking for previous outcome:', {
        currentTeam: outcome.name,
        currentPoint: outcome.point,
        availableOutcomes: previousMarket.outcomes
      });

        // For moneyline (h2h), and spreads just match the team name
        previousOutcome = previousMarket.outcomes.find(o => {
        return o.name === outcome.name;
      });
    }

    if (!previousOutcome) {
      console.log('[GameCard] No matching previous outcome found for:', {
        team: outcome.name,
        point: outcome.point,
        market: marketType
      });
      return null;
    }

    // For American odds, a higher negative number is worse odds
    const currentPrice = Number(outcome.price);
    const previousPrice = Number(previousOutcome.price);

    console.log('[GameCard] Found price movement:', {
      bookmaker: bookmaker.key,
      team: outcome.name,
      current: currentPrice,
      previous: previousPrice
    });

    if (currentPrice > previousPrice) {
      return <ArrowUp className="w-4 h-4 text-green-500" />;
    } else if (currentPrice < previousPrice) {
      return <ArrowDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const renderOutcome = (outcome: Outcome, bookmaker: Bookmaker) => {
    if (!outcome) return null;

    const bestPrice = findBestPrice();
    const isBestPrice = bestPrice && (
      outcome.price === bestPrice.price && 
      (marketType === 'spreads' ? Math.abs(outcome.point!) === Math.abs(bestPrice.point!) : true)
    );

    const priceMovement = getPriceMovement(outcome, bookmaker);
    
    const content = marketType === 'spreads' 
      ? `${outcome.point > 0 ? '+' : ''}${outcome.point} ${outcome.price > 0 ? '+' : ''}${outcome.price}`
      : outcome.point 
        ? `${outcome.point} ${outcome.price > 0 ? '+' : ''}${outcome.price}` 
        : `${outcome.price > 0 ? '+' : ''}${outcome.price}`;

    const className = `text-[var(--text-primary)] ${isBestPrice ? 'font-bold text-green-500' : ''}`;

    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          {content}
          {priceMovement}
        </div>
      </div>
    );
  };

  if (!game.bookmakers?.length) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
        <div className="text-xl font-bold mb-4 text-[var(--text-primary)]">
          {teamName}
        </div>
        <div className="text-[var(--text-primary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
      <div className="text-xl font-bold mb-4 text-[var(--text-primary)]">
        {teamName}
      </div>
      
      <div className="text-lg font-bold mb-2 text-[var(--text-secondary)]">
        Bookmaker
      </div>
      
      <div className="space-y-2">
        {game.bookmakers.map(bookmaker => {
          const market = bookmaker.markets?.find(m => m.key === marketType);
          if (!market) return null;

          const outcome = marketType === 'totals'
            ? market.outcomes?.find(o => o.name === (teamPosition === 'home' ? 'Over' : 'Under'))
            : market.outcomes?.find(o => 
                teamPosition === 'home' ? o.name === game.home_team : o.name === game.away_team
              );

          if (!outcome) return null;

          return (
            <div key={bookmaker.key} className="flex justify-between items-center">
              <div className="text-[var(--text-primary)]">
                {bookmaker.title}
              </div>
              {renderOutcome(outcome, bookmaker)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GameCard 