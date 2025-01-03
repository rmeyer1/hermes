import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
      <div className="container mx-auto px-4 py-3">
        <p className="text-sm text-[var(--text-secondary)] text-center">
          © {new Date().getFullYear()} Hermes. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer 