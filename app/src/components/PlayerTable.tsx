import React, { useState, useMemo } from 'react';
import type { Player } from '../types';
import { POSITIONS } from '../types';
import { getIndicatorEmoji, getIndicatorLabel } from '../utils/newsAnalyzer';

interface Props {
    players: Player[];
    onPlayerUpdate: (playerId: string, updates: Partial<Player>) => void;
    onPlayerSelect: (player: Player | null) => void;
    selectedPlayer: Player | null;
}

export const PlayerTable: React.FC<Props> = ({
    players,
    onPlayerUpdate,
    onPlayerSelect,
    selectedPlayer
}) => {
    const [sortField, setSortField] = useState<keyof Player>('salary');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [positionFilter, setPositionFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyIndicators, setShowOnlyIndicators] = useState(false);

    const sortedAndFilteredPlayers = useMemo(() => {
        let result = [...players];

        // Filter by position
        if (positionFilter !== 'ALL') {
            result = result.filter(p => p.position === positionFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.firstName.toLowerCase().includes(term) ||
                p.lastName.toLowerCase().includes(term) ||
                p.team.toLowerCase().includes(term)
            );
        }

        // Filter by news indicators
        if (showOnlyIndicators) {
            result = result.filter(p => p.newsIndicator);
        }

        // Sort
        result.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            const aComp = typeof aVal === 'string' ? aVal.toLowerCase() : aVal ?? 0;
            const bComp = typeof bVal === 'string' ? bVal.toLowerCase() : bVal ?? 0;

            if (aComp < bComp) return sortDirection === 'asc' ? -1 : 1;
            if (aComp > bComp) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [players, sortField, sortDirection, positionFilter, searchTerm, showOnlyIndicators]);

    const handleSort = (field: keyof Player) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getSortIndicator = (field: keyof Player) => {
        if (sortField !== field) return '';
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    const getAdjustedProjection = (player: Player) => {
        return (player.projection + player.projectionAdjustment).toFixed(1);
    };

    return (
        <div className="player-table-container">
            <div className="table-controls">
                <div className="search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="position-filters">
                    <button
                        className={`filter-btn ${positionFilter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setPositionFilter('ALL')}
                    >
                        All
                    </button>
                    {POSITIONS.map(pos => (
                        <button
                            key={pos}
                            className={`filter-btn ${positionFilter === pos ? 'active' : ''}`}
                            onClick={() => setPositionFilter(pos)}
                        >
                            {pos}
                        </button>
                    ))}
                </div>

                <label className="indicator-toggle">
                    <input
                        type="checkbox"
                        checked={showOnlyIndicators}
                        onChange={(e) => setShowOnlyIndicators(e.target.checked)}
                    />
                    <span>Show news alerts only</span>
                </label>
            </div>

            <div className="table-wrapper">
                <table className="player-table">
                    <thead>
                        <tr>
                            <th className="sticky-col">Actions</th>
                            <th onClick={() => handleSort('position')}>Pos{getSortIndicator('position')}</th>
                            <th onClick={() => handleSort('lastName')}>Player{getSortIndicator('lastName')}</th>
                            <th onClick={() => handleSort('team')}>Team{getSortIndicator('team')}</th>
                            <th onClick={() => handleSort('salary')}>Salary{getSortIndicator('salary')}</th>
                            <th onClick={() => handleSort('fppg')}>FPPG{getSortIndicator('fppg')}</th>
                            <th>Proj</th>
                            <th>News</th>
                            <th onClick={() => handleSort('exposureLimit')}>Exp%{getSortIndicator('exposureLimit')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredPlayers.map(player => (
                            <tr
                                key={player.id}
                                className={`
                  ${player.isLocked ? 'locked' : ''} 
                  ${player.isExcluded ? 'excluded' : ''}
                  ${selectedPlayer?.id === player.id ? 'selected' : ''}
                  ${player.injuryIndicator === 'O' ? 'injured-out' : ''}
                `}
                                onClick={() => onPlayerSelect(player)}
                            >
                                <td className="sticky-col actions-cell">
                                    <button
                                        className={`action-btn lock-btn ${player.isLocked ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPlayerUpdate(player.id, {
                                                isLocked: !player.isLocked,
                                                isExcluded: false
                                            });
                                        }}
                                        title="Lock player into all lineups"
                                    >
                                        🔒
                                    </button>
                                    <button
                                        className={`action-btn exclude-btn ${player.isExcluded ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPlayerUpdate(player.id, {
                                                isExcluded: !player.isExcluded,
                                                isLocked: false
                                            });
                                        }}
                                        title="Exclude from all lineups"
                                    >
                                        ⛔
                                    </button>
                                </td>
                                <td>
                                    <span className={`position-badge ${player.position.toLowerCase()}`}>
                                        {player.position}
                                    </span>
                                </td>
                                <td className="player-name-cell">
                                    <span className="player-name">{player.firstName} {player.lastName}</span>
                                    {player.injuryIndicator && (
                                        <span className={`injury-badge ${player.injuryIndicator.toLowerCase()}`}>
                                            {player.injuryIndicator}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className="team-matchup">
                                        {player.team} <span className="vs">vs</span> {player.opponent}
                                    </span>
                                </td>
                                <td className="salary-cell">${player.salary.toLocaleString()}</td>
                                <td>{player.fppg.toFixed(1)}</td>
                                <td className={`projection-cell ${player.projectionAdjustment > 0 ? 'positive' : player.projectionAdjustment < 0 ? 'negative' : ''}`}>
                                    {getAdjustedProjection(player)}
                                    {player.projectionAdjustment !== 0 && (
                                        <span className="adjustment">
                                            ({player.projectionAdjustment > 0 ? '+' : ''}{player.projectionAdjustment.toFixed(1)})
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {player.newsIndicator && (
                                        <span className={`news-indicator ${player.newsIndicator}`} title={getIndicatorLabel(player.newsIndicator)}>
                                            {getIndicatorEmoji(player.newsIndicator)}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={player.exposureLimit}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onPlayerUpdate(player.id, { exposureLimit: parseInt(e.target.value) || 0 });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="exposure-input"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                <span>Showing {sortedAndFilteredPlayers.length} of {players.length} players</span>
            </div>
        </div>
    );
};
