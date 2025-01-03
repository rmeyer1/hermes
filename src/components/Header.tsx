import React from 'react'
import { Link } from 'react-router-dom'
import ybLogo from '@assets/yb.jpg'

const Header: React.FC = () => {
  return (
    <header className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center pl-2">
            <img
              src={ybLogo}
              alt="Hermes Logo"
              className="h-8 w-8 rounded"
            />
            <span className="ml-2 text-xl font-semibold text-[var(--text-primary)]">
              Hermes
            </span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="flex space-x-6">
            <Link 
              to="/nfl" 
              className="text-[var(--text-primary)] hover:text-[var(--text-accent)] transition-colors"
            >
              NFL
            </Link>
            <Link 
              to="/about" 
              className="text-[var(--text-primary)] hover:text-[var(--text-accent)] transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header 