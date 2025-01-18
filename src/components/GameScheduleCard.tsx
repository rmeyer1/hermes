// src/components/GameScheduleCard.tsx
import React from 'react';
import '../index.css';
import { NBA, NFL, NHL, NCAAF } from '@constants/teamAbbreviations';
import { useNavigate } from 'react-router-dom';

// Type for team mappings
type TeamMappings = {
  [key: string]: string;
};

interface GameScheduleCardProps {
  game: {
    id: string;
    home_team: string;
    away_team: string;
    commence_time: string;
    bookmakers: any[];
    sport_key: string;
  };
  marketType: 'h2h' | 'spreads' | 'totals';
}

const GameScheduleCard: React.FC<GameScheduleCardProps> = ({ game, marketType }) => {
  const { home_team, away_team, commence_time, bookmakers, sport_key } = game;
  const navigate = useNavigate();

  // Helper function to get the correct abbreviation mapping based on sport
  const getTeamMapping = (): TeamMappings => {
    switch (sport_key) {
      case 'basketball_nba':
        return NBA as TeamMappings;
      case 'americanfootball_nfl':
        return NFL;
      case 'icehockey_nhl':
        return NHL as TeamMappings;
      case 'americanfootball_ncaaf':
        return NCAAF as TeamMappings;
      default:
        return {};
    }
  };

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
    const teamMapping = getTeamMapping();
    
    const outcome = marketType === 'totals'
      ? outcomes.find((o: any) => o.name === (position === 'home' ? 'Over' : 'Under'))
      : outcomes.find((o: any) => {
          if (!o.name) return false;

          // Special handling for NFL since its mapping is reversed
          if (sport_key === 'americanfootball_nfl') {
            // For NFL, o.name is the full team name, and we need to look up its abbreviation
            const teamAbbr = teamMapping[o.name];
            return position === 'home' 
              ? teamAbbr === game.home_team 
              : teamAbbr === game.away_team;
          } else {
            // For other sports, we look up the full name and check if it's in the outcome name
            const outcomeTeamAbbr = Object.entries(teamMapping)
              .find(([_, name]) => o.name.includes(name))?.[0];
            
            return position === 'home' 
              ? outcomeTeamAbbr === game.home_team 
              : outcomeTeamAbbr === game.away_team;
          }
      });

    if (!outcome) return '-';

    switch (marketType) {
      case 'spreads':
        return outcome.point || '-';
      case 'totals':
        return `${outcome.name} ${outcome.point}`;
      case 'h2h':
        return outcome.price || '-';
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