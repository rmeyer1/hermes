import React, { useState, useEffect } from 'react'
import './index.css'
import { Routes, Route } from 'react-router-dom'
import Layout from '@layouts/Layout'
import Home from '@pages/Home'
import About from '@pages/About'
import NFL from '@pages/NFL'
import NBA from '@pages/NBA'
import NCAAFB from '@pages/NCAAFB'
import NHL from '@pages/NHL'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="nfl" element={<NFL />} />
        <Route path="ncaafb" element={<NCAAFB />} />
        <Route path="nba" element={<NBA />} />
        <Route path="nhl" element={<NHL />} />
      </Route>
    </Routes>
  )
}

export default App
