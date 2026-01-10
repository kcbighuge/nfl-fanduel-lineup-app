import React, { useState } from 'react';
import type { Lineup, Player } from '../types';
import { exportLineupsToCSV, downloadCSV } from '../utils/csvParser';
import { calculateExposures } from '../utils/optimizer';

interface Props {
    lineups: Lineup[];
    onClear: () => void;
}

export const LineupResults: React.FC<Props> = ({ lineups, onClear }) => {
    const [selectedLineup, setSelectedLineup] = useState<number>(0);
    const [showExposure, setShowExposure] = useState(false);

    const exposures = React.useMemo(() => calculateExposures(lineups), [lineups]);

    const handleExport = () => {
        const csv = exportLineupsToCSV(lineups);
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(csv, `fanduel-lineups-${timestamp}.csv`);
    };

    const currentLineup = lineups[selectedLineup];

    const sortedExposures = React.useMemo(() => {
        const entries: Array<{ player: Player; count: number; percentage: number }> = [];
        lineups.forEach(lineup => {
            lineup.players.forEach(player => {
                const existing = entries.find(e => e.player.id === player.id);
                if (!existing) {
                    const exp = exposures.get(player.id);
                    if (exp) {
                        entries.push({ player, ...exp });
                    }
                }
            });
        });
        return entries.sort((a, b) => b.percentage - a.percentage);
    }, [lineups, exposures]);

    if (lineups.length === 0) {
        return null;
    }

    return (
        <div className="lineup-results">
            <div className="results-header">
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Generated Lineups
                </h2>
                <div className="results-actions">
                    <button className="toggle-btn" onClick={() => setShowExposure(!showExposure)}>
                        {showExposure ? 'Show Lineups' : 'Show Exposure'}
                    </button>
                    <button className="export-btn" onClick={handleExport}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                    </button>
                    <button className="clear-btn" onClick={onClear}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        Clear
                    </button>
                </div>
            </div>

            <div className="results-summary">
                <div className="summary-stat">
                    <span className="stat-value">{lineups.length}</span>
                    <span className="stat-label">Lineups</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-value">{lineups[0]?.totalProjection.toFixed(1)}</span>
                    <span className="stat-label">Max Proj</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-value">
                        {(lineups.reduce((sum, l) => sum + l.totalProjection, 0) / lineups.length).toFixed(1)}
                    </span>
                    <span className="stat-label">Avg Proj</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-value">
                        ${Math.round(lineups.reduce((sum, l) => sum + l.totalSalary, 0) / lineups.length).toLocaleString()}
                    </span>
                    <span className="stat-label">Avg Salary</span>
                </div>
            </div>

            {!showExposure ? (
                <div className="lineup-viewer">
                    <div className="lineup-nav">
                        <button
                            disabled={selectedLineup === 0}
                            onClick={() => setSelectedLineup(s => s - 1)}
                        >
                            ← Prev
                        </button>
                        <select
                            value={selectedLineup}
                            onChange={(e) => setSelectedLineup(parseInt(e.target.value))}
                        >
                            {lineups.map((_, i) => (
                                <option key={i} value={i}>
                                    Lineup {i + 1} - {lineups[i].totalProjection.toFixed(1)} pts
                                </option>
                            ))}
                        </select>
                        <button
                            disabled={selectedLineup === lineups.length - 1}
                            onClick={() => setSelectedLineup(s => s + 1)}
                        >
                            Next →
                        </button>
                    </div>

                    {currentLineup && (
                        <div className="lineup-card">
                            <div className="lineup-header">
                                <span className="lineup-number">Lineup #{selectedLineup + 1}</span>
                                <span className="lineup-stats">
                                    <span className="proj">{currentLineup.totalProjection.toFixed(1)} pts</span>
                                    <span className="salary">${currentLineup.totalSalary.toLocaleString()}</span>
                                    <span className="remaining">(${(60000 - currentLineup.totalSalary).toLocaleString()} left)</span>
                                </span>
                            </div>

                            <table className="lineup-table">
                                <thead>
                                    <tr>
                                        <th>Pos</th>
                                        <th>Player</th>
                                        <th>Team</th>
                                        <th>Salary</th>
                                        <th>Proj</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { pos: 'QB', player: currentLineup.qb },
                                        { pos: 'RB', player: currentLineup.rb1 },
                                        { pos: 'RB', player: currentLineup.rb2 },
                                        { pos: 'WR', player: currentLineup.wr1 },
                                        { pos: 'WR', player: currentLineup.wr2 },
                                        { pos: 'WR', player: currentLineup.wr3 },
                                        { pos: 'TE', player: currentLineup.te },
                                        { pos: 'FLEX', player: currentLineup.flex },
                                        { pos: 'DEF', player: currentLineup.def },
                                    ].map((slot, i) => (
                                        <tr key={i}>
                                            <td>
                                                <span className={`position-badge ${slot.pos.toLowerCase()}`}>
                                                    {slot.pos}
                                                </span>
                                            </td>
                                            <td className="player-cell">
                                                {slot.player.firstName} {slot.player.lastName}
                                                {slot.pos === 'FLEX' && (
                                                    <span className="flex-actual">({slot.player.position})</span>
                                                )}
                                            </td>
                                            <td>{slot.player.team}</td>
                                            <td>${slot.player.salary.toLocaleString()}</td>
                                            <td>{(slot.player.projection + slot.player.projectionAdjustment).toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3}>Total</td>
                                        <td>${currentLineup.totalSalary.toLocaleString()}</td>
                                        <td>{currentLineup.totalProjection.toFixed(1)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="exposure-view">
                    <h3>Player Exposure</h3>
                    <div className="exposure-list">
                        {sortedExposures.slice(0, 30).map(({ player, count, percentage }) => (
                            <div key={player.id} className="exposure-item">
                                <div className="exposure-player">
                                    <span className={`position-badge ${player.position.toLowerCase()} small`}>
                                        {player.position}
                                    </span>
                                    <span className="exposure-name">
                                        {player.firstName} {player.lastName}
                                    </span>
                                </div>
                                <div className="exposure-bar-container">
                                    <div
                                        className="exposure-bar"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <span className="exposure-text">{count}/{lineups.length} ({percentage.toFixed(0)}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
