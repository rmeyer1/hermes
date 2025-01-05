import React from 'react'
import hermesLogo from '@assets/hermes-logo.jpeg'

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Main Content Container */}
      <div className="max-w-4xl w-full space-y-16 text-center">
        {/* Logo Section */}
        <div className="flex justify-center">
          <img
            src={hermesLogo}
            alt="Hermes Logo"
            className="w-96 h-96 object-cover rounded-lg shadow-2xl"
          />
        </div>

        {/* Title Section */}
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
            Hermes
          </h1>
          <p className="text-medium font-medium text-[var(--text-secondary)] tracking-wide">
            Helping you beat the book
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home 