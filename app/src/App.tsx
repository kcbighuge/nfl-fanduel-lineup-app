import { useState, useCallback } from 'react';
import type { Player, Lineup, OptimizationSettings } from './types';
import { FileUpload } from './components/FileUpload';
import { PlayerTable } from './components/PlayerTable';
import { PlayerDetails } from './components/PlayerDetails';
import { SettingsPanel } from './components/SettingsPanel';
import { LineupResults } from './components/LineupResults';
import { optimizeLineups } from './utils/optimizer';
import { analyzePlayerNews } from './utils/newsAnalyzer';
import './App.css';

const DEFAULT_SETTINGS: OptimizationSettings = {
  numberOfLineups: 20,
  maxPlayerExposure: 100,
  minSalaryUsed: 59000,
  randomness: 5,
  minUniquePlayers: 3,
  allowQBWithOppDef: false,
  newsMode: 'auto',
};

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [settings, setSettings] = useState<OptimizationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handlePlayersLoaded = useCallback((loadedPlayers: Player[]) => {
    setPlayers(loadedPlayers);
    setLineups([]);
    setSelectedPlayer(null);
  }, []);

  const handlePlayerUpdate = useCallback((playerId: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, ...updates } : p
    ));

    if (selectedPlayer?.id === playerId) {
      setSelectedPlayer(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedPlayer]);

  const handleOptimize = useCallback(async () => {
    if (players.length === 0) return;

    setIsOptimizing(true);

    // Give UI time to update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const result = optimizeLineups(players, settings);
      setLineups(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [players, settings]);

  const handleRefreshNews = useCallback(() => {
    if (players.length === 0) return;

    const updatedPlayers = analyzePlayerNews(players);
    setPlayers(updatedPlayers);
  }, [players]);

  const handleClearLineups = useCallback(() => {
    setLineups([]);
  }, []);

  const handleReset = useCallback(() => {
    setPlayers([]);
    setLineups([]);
    setSelectedPlayer(null);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Stats for header
  const lockedCount = players.filter(p => p.isLocked).length;
  const excludedCount = players.filter(p => p.isExcluded).length;
  const upgradeCount = players.filter(p => p.newsIndicator === 'smash' || p.newsIndicator === 'upgrade').length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <h1>NFL DFS Optimizer</h1>
          </div>

          {players.length > 0 && (
            <div className="header-stats">
              <div className="stat">
                <span className="stat-value">{players.length}</span>
                <span className="stat-label">Players</span>
              </div>
              <div className="stat">
                <span className="stat-value">{lockedCount}</span>
                <span className="stat-label">Locked</span>
              </div>
              <div className="stat">
                <span className="stat-value">{excludedCount}</span>
                <span className="stat-label">Excluded</span>
              </div>
              <div className="stat highlight">
                <span className="stat-value">{upgradeCount}</span>
                <span className="stat-label">🔥 Opportunities</span>
              </div>
            </div>
          )}

          <div className="header-actions">
            {players.length > 0 && (
              <>
                <button className="refresh-btn" onClick={handleRefreshNews}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  Refresh News
                </button>
                <button className="reset-btn" onClick={handleReset}>
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {players.length === 0 ? (
          <div className="upload-section">
            <FileUpload
              onPlayersLoaded={handlePlayersLoaded}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Smart Optimization</h3>
                <p>Generate mathematically optimal lineups using advanced algorithms</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📰</div>
                <h3>News Intelligence</h3>
                <p>AI-powered analysis of player news, injuries, and matchups</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Exposure Control</h3>
                <p>Fine-tune player exposure limits for diversified lineups</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📤</div>
                <h3>FanDuel Export</h3>
                <p>Download lineups ready for direct upload to FanDuel</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="optimizer-layout">
            <div className="sidebar">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                onOptimize={handleOptimize}
                isOptimizing={isOptimizing}
                playerCount={players.length}
              />
            </div>

            <div className="main-content">
              <PlayerTable
                players={players}
                onPlayerUpdate={handlePlayerUpdate}
                onPlayerSelect={setSelectedPlayer}
                selectedPlayer={selectedPlayer}
              />

              <LineupResults
                lineups={lineups}
                onClear={handleClearLineups}
              />
            </div>

            {selectedPlayer && (
              <div className="details-sidebar">
                <PlayerDetails
                  player={selectedPlayer}
                  onClose={() => setSelectedPlayer(null)}
                  onUpdate={handlePlayerUpdate}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          <strong>Disclaimer:</strong> This tool is for entertainment purposes only.
          Daily fantasy sports involve risk. Please play responsibly.
        </p>
      </footer>
    </div>
  );
}

export default App;
