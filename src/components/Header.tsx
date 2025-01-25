import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import logo from '../assets/yb.jpg';
import { useTheme } from '@context/ThemeContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-[var(--bg-secondary)] shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-8 w-8" />
          </Link>

          {/* Desktop Navigation and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/nfl" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">NFL</Link>
            <Link to="/ncaafb" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">NCAAFB</Link>
            <Link to="/nba" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">NBA</Link>
            <Link to="/nhl" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">NHL</Link>
            <button 
              onClick={toggleTheme} 
              className="text-[var(--text-primary)] hover:text-[var(--text-accent)] ml-4"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="text-[var(--text-primary)]"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[var(--text-primary)]"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col items-center space-y-6">
              <Link 
                to="/nfl" 
                className="text-[var(--text-primary)] hover:text-[var(--text-accent)]"
                onClick={() => setIsMenuOpen(false)}
              >
                NFL
              </Link>
              <Link 
                to="/ncaafb" 
                className="text-[var(--text-primary)] hover:text-[var(--text-accent)]"
                onClick={() => setIsMenuOpen(false)}
              >
                NCAAFB
              </Link>
              <Link 
                to="/nba" 
                className="text-[var(--text-primary)] hover:text-[var(--text-accent)]"
                onClick={() => setIsMenuOpen(false)}
              >
                NBA
              </Link>
              <Link 
                to="/nhl" 
                className="text-[var(--text-primary)] hover:text-[var(--text-accent)]"
                onClick={() => setIsMenuOpen(false)}
              >
                NHL
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header; 