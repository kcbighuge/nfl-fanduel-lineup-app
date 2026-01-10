import React from 'react';
import type { Player } from '../types';
import { getIndicatorEmoji, getIndicatorLabel } from '../utils/newsAnalyzer';

interface Props {
    player: Player;
    onClose: () => void;
    onUpdate: (playerId: string, updates: Partial<Player>) => void;
}

export const PlayerDetails: React.FC<Props> = ({ player, onClose, onUpdate }) => {
    const adjustedProjection = player.projection + player.projectionAdjustment;

    return (
        <div className="player-details-panel">
            <div className="panel-header">
                <h2>
                    {player.firstName} {player.lastName}
                    <span className={`position-badge ${player.position.toLowerCase()}`}>
                        {player.position}
                    </span>
                </h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="panel-content">
                <div className="player-info-grid">
                    <div className="info-item">
                        <label>Team</label>
                        <span>{player.team}</span>
                    </div>
                    <div className="info-item">
                        <label>Opponent</label>
                        <span>vs {player.opponent}</span>
                    </div>
                    <div className="info-item">
                        <label>Game</label>
                        <span>{player.game}</span>
                    </div>
                    <div className="info-item">
                        <label>Salary</label>
                        <span className="salary-value">${player.salary.toLocaleString()}</span>
                    </div>
                </div>

                <div className="projection-breakdown">
                    <h3>Projection Breakdown</h3>
                    <div className="projection-row">
                        <span>Baseline (FPPG)</span>
                        <span>{player.fppg.toFixed(1)}</span>
                    </div>
                    <div className="projection-row">
                        <span>Custom Projection</span>
                        <span>{player.projection.toFixed(1)}</span>
                    </div>

                    {player.newsItems.length > 0 && (
                        <>
                            <div className="projection-separator">News Adjustments</div>
                            {player.newsItems.map(item => (
                                <div key={item.id} className={`projection-row modifier ${item.sentiment}`}>
                                    <span>{item.text}</span>
                                    <span className="impact">
                                        {item.impact > 0 ? '+' : ''}{item.impact.toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </>
                    )}

                    <div className="projection-row total">
                        <span>Adjusted Projection</span>
                        <span className={`total-value ${player.projectionAdjustment > 0 ? 'positive' : player.projectionAdjustment < 0 ? 'negative' : ''}`}>
                            {adjustedProjection.toFixed(1)}
                        </span>
                    </div>
                </div>

                {player.newsIndicator && (
                    <div className={`news-alert ${player.newsIndicator}`}>
                        <div className="alert-header">
                            <span className="indicator-emoji">{getIndicatorEmoji(player.newsIndicator)}</span>
                            <span className="indicator-label">{getIndicatorLabel(player.newsIndicator)}</span>
                            <span className="adjustment-badge">
                                {player.projectionAdjustment > 0 ? '+' : ''}{player.projectionAdjustment.toFixed(1)} pts
                            </span>
                        </div>
                        <ul className="news-list">
                            {player.newsItems.map(item => (
                                <li key={item.id}>
                                    <span className="news-text">{item.text}</span>
                                    <span className="news-source">{item.source}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="manual-controls">
                    <h3>Manual Adjustments</h3>

                    <div className="control-row">
                        <label>Custom Projection</label>
                        <input
                            type="number"
                            step="0.5"
                            value={player.projection}
                            onChange={(e) => onUpdate(player.id, { projection: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="control-row">
                        <label>Additional Modifier (-5 to +5)</label>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.5"
                            value={player.projectionAdjustment}
                            onChange={(e) => onUpdate(player.id, { projectionAdjustment: parseFloat(e.target.value) })}
                        />
                        <span className="modifier-value">
                            {player.projectionAdjustment > 0 ? '+' : ''}{player.projectionAdjustment.toFixed(1)}
                        </span>
                    </div>

                    <div className="control-row">
                        <label>Exposure Limit %</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={player.exposureLimit}
                            onChange={(e) => onUpdate(player.id, { exposureLimit: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="toggle-controls">
                        <label className={`toggle-btn ${player.isLocked ? 'active' : ''}`}>
                            <input
                                type="checkbox"
                                checked={player.isLocked}
                                onChange={(e) => onUpdate(player.id, {
                                    isLocked: e.target.checked,
                                    isExcluded: false
                                })}
                            />
                            🔒 Lock Player
                        </label>
                        <label className={`toggle-btn ${player.isExcluded ? 'active' : ''}`}>
                            <input
                                type="checkbox"
                                checked={player.isExcluded}
                                onChange={(e) => onUpdate(player.id, {
                                    isExcluded: e.target.checked,
                                    isLocked: false
                                })}
                            />
                            ⛔ Exclude Player
                        </label>
                    </div>
                </div>

                {player.injuryIndicator && (
                    <div className={`injury-info ${player.injuryIndicator.toLowerCase()}`}>
                        <span className="injury-status">
                            Injury Status: <strong>{player.injuryIndicator}</strong>
                        </span>
                        {player.injuryDetails && (
                            <span className="injury-details">{player.injuryDetails}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
