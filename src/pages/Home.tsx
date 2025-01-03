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
          <h1 className="text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Welcome to Hermes
          </h1>
        </div>

        {/* Call to Action Section */}
        <div className="pt-8">
          <button
            className="px-8 py-3 bg-[var(--button-primary)] text-white font-medium rounded-lg hover:bg-[var(--button-hover)] transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home 