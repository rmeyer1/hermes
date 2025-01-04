import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import logo from '../assets/yb.jpg';
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[var(--bg-secondary)] shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-8 w-8" />
            <span className="text-[var(--text-primary)] font-bold"></span>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[var(--text-primary)] md:hidden"
          >
            <Menu size={24} />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <Link to="/nfl" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">NFL</Link>
            <Link to="/ncaafb" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">NCAAFB</Link>
            <Link to="/nba" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">NBA</Link>
            <Link to="/nhl" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">NHL</Link>
            <Link to="/about" className="text-[var(--text-primary)] hover:text-[var(--text-accent)]">About</Link>
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
              <Link 
                to="/about" 
                className="text-[var(--text-primary)] hover:text-[var(--text-accent)]"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header; 