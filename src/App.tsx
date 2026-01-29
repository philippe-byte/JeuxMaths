import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { LevelSelect } from './pages/LevelSelect';
import { Game } from './pages/Game';
import { Stats } from './pages/Stats';
import { Options } from './pages/Options';
import { AddLanguage } from './pages/AddLanguage';
import { Leaderboard } from './pages/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/level" element={<LevelSelect />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/options" element={<Options />} />
          <Route path="/options/add-language" element={<AddLanguage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
