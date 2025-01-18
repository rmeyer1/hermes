// src/components/GameScheduleCard.tsx
import React from 'react';
import '../index.css';
import { teamAbbreviations } from '@constants/teamAbbreviations';
import { useNavigate } from 'react-router-dom';

interface GameScheduleCardProps {
  game: {
    id: string;
    home_team: string;
    away_team: string;
    commence_time: string;
    bookmakers: any[];
  };
  marketType: 'h2h' | 'spreads' | 'totals';
}

const GameScheduleCard: React.FC<GameScheduleCardProps> = ({ game, marketType }) => {
  const { home_team, away_team, commence_time, bookmakers } = game;
  const navigate = useNavigate();

  // Format date/time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    
    // Format MM/DD/YYYY
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    
    // Format HH:MM
    const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    
    return `${mm}/${dd}/${yyyy} ${hours}:${minutes} ${ampm} EST`;
  };

  // Extract odds data
  const market = bookmakers[0]?.markets.find((market: any) => market.key === marketType);
  const outcomes = market?.outcomes || [];

  // Helper function to get the price based on position and market type
  const getPrice = (position: 'home' | 'away') => {
    const outcome = marketType === 'totals'
      ? outcomes.find((o: any) => o.name === (position === 'home' ? 'Over' : 'Under'))
      : outcomes.find((o: any) => 
          position === 'home' 
            ? teamAbbreviations[o.name] === game.home_team 
            : teamAbbreviations[o.name] === game.away_team
        );

    if (!outcome) return '-';

    switch (marketType) {
      case 'spreads':
        return outcome.point || '-';
      case 'totals':
        return `${outcome.name} ${outcome.point}`; // Shows "Over X.X" or "Under X.X"
      case 'h2h':
        return outcome.price || '-'; // Shows moneyline odds
      default:
        return '-';
    }
  };

  const handleOddsClick = (teamPosition: 'home' | 'away') => {
    // We'll implement the navigation/details logic later
    navigate(`/game/${game.id}/${teamPosition}`);
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 shadow-lg">
      {/* Date/Time centered at top */}
      <div className="text-center mb-4 text-sm text-[var(--text-secondary)]">
        {formatDateTime(commence_time)}
      </div>

      {/* Teams and Odds Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Away Team Column */}
        <div className="flex flex-col items-center">
          <div className="text-xl font-bold mb-2 text-[var(--text-primary)]">
            {away_team}
          </div>
          <button
            onClick={() => handleOddsClick('away')}
            className="px-4 py-2 border-2 border-[var(--border-color)] rounded-lg 
                     hover:border-[var(--text-accent)] transition-colors duration-200
                     text-lg text-[var(--text-primary)] min-w-[80px] text-center"
          >
            {getPrice('away')}
          </button>
        </div>

        {/* Home Team Column */}
        <div className="flex flex-col items-center">
          <div className="text-xl font-bold mb-2 text-[var(--text-primary)]">
            {home_team}
          </div>
          <button
            onClick={() => handleOddsClick('home')}
            className="px-4 py-2 border-2 border-[var(--border-color)] rounded-lg 
                     hover:border-[var(--text-accent)] transition-colors duration-200
                     text-lg text-[var(--text-primary)] min-w-[80px] text-center"
          >
            {getPrice('home')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameScheduleCard;