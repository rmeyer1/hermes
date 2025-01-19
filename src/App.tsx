import './index.css'
import { Routes, Route } from 'react-router-dom'
import Layout from '@layouts/Layout'
import Home from '@pages/Home'
import NFL from '@pages/NFL'
import NBA from '@pages/NBA'
import NCAAFB from '@pages/NCAAFB'
import NHL from '@pages/NHL'
import GameDetails from '@pages/GameDetails'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="nfl" element={<NFL />} />
        <Route path="ncaafb" element={<NCAAFB />} />
        <Route path="nba" element={<NBA />} />
        <Route path="nhl" element={<NHL />} />
        <Route path="/game/:gameId/:teamPosition" element={<GameDetails />} />
      </Route>
    </Routes>
  )
}

export default App
