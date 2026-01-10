import React from 'react';
import type { OptimizationSettings } from '../types';

interface Props {
    settings: OptimizationSettings;
    onSettingsChange: (settings: OptimizationSettings) => void;
    onOptimize: () => void;
    isOptimizing: boolean;
    playerCount: number;
}

export const SettingsPanel: React.FC<Props> = ({
    settings,
    onSettingsChange,
    onOptimize,
    isOptimizing,
    playerCount
}) => {
    const updateSetting = <K extends keyof OptimizationSettings>(
        key: K,
        value: OptimizationSettings[K]
    ) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className="settings-panel">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-4" />
                </svg>
                Optimization Settings
            </h2>

            <div className="settings-grid">
                <div className="setting-group">
                    <label>Number of Lineups</label>
                    <input
                        type="number"
                        min="1"
                        max="150"
                        value={settings.numberOfLineups}
                        onChange={(e) => updateSetting('numberOfLineups', parseInt(e.target.value) || 1)}
                    />
                    <span className="setting-hint">Generate 1-150 unique lineups</span>
                </div>

                <div className="setting-group">
                    <label>Max Player Exposure %</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.maxPlayerExposure}
                        onChange={(e) => updateSetting('maxPlayerExposure', parseInt(e.target.value) || 0)}
                    />
                    <span className="setting-hint">Max % of lineups for any player</span>
                </div>

                <div className="setting-group">
                    <label>Min Salary Used</label>
                    <input
                        type="number"
                        min="50000"
                        max="60000"
                        step="100"
                        value={settings.minSalaryUsed}
                        onChange={(e) => updateSetting('minSalaryUsed', parseInt(e.target.value) || 59000)}
                    />
                    <span className="setting-hint">$50,000 - $60,000 cap</span>
                </div>

                <div className="setting-group">
                    <label>Randomness %</label>
                    <div className="range-input">
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={settings.randomness}
                            onChange={(e) => updateSetting('randomness', parseInt(e.target.value))}
                        />
                        <span className="range-value">{settings.randomness}%</span>
                    </div>
                    <span className="setting-hint">Add variance for lineup diversity</span>
                </div>

                <div className="setting-group">
                    <label>Min Unique Players</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={settings.minUniquePlayers}
                        onChange={(e) => updateSetting('minUniquePlayers', parseInt(e.target.value) || 1)}
                    />
                    <span className="setting-hint">Different players between lineups</span>
                </div>

                <div className="setting-group">
                    <label>News Intelligence</label>
                    <select
                        value={settings.newsMode}
                        onChange={(e) => updateSetting('newsMode', e.target.value as OptimizationSettings['newsMode'])}
                    >
                        <option value="auto">Auto-Adjust</option>
                        <option value="suggested">Suggested Only</option>
                        <option value="off">Off</option>
                    </select>
                    <span className="setting-hint">How to use news analysis</span>
                </div>
            </div>

            <div className="setting-toggles">
                <label className="toggle-option">
                    <input
                        type="checkbox"
                        checked={!settings.allowQBWithOppDef}
                        onChange={(e) => updateSetting('allowQBWithOppDef', !e.target.checked)}
                    />
                    <span>Prevent QB + Opposing DEF</span>
                </label>
            </div>

            <button
                className="optimize-btn"
                onClick={onOptimize}
                disabled={isOptimizing || playerCount === 0}
            >
                {isOptimizing ? (
                    <>
                        <div className="btn-spinner"></div>
                        Optimizing...
                    </>
                ) : (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        Generate {settings.numberOfLineups} Lineup{settings.numberOfLineups !== 1 ? 's' : ''}
                    </>
                )}
            </button>

            {playerCount === 0 && (
                <p className="no-players-warning">Upload a player CSV to get started</p>
            )}
        </div>
    );
};
