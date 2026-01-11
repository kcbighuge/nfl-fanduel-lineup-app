import type { Player, NewsIndicator, NewsItem } from '../types';

/**
 * Simulated news analysis for players.
 * In production, this would integrate with real news APIs, RSS feeds, etc.
 */

// // Sample news data types for reference (used in production with real APIs)
// const _SAMPLE_NEWS_DATA: Record<string, { indicator: NewsIndicator; adjustment: number; news: string }> = {
//     'smash': { indicator: 'smash', adjustment: 4.1, news: 'Multiple positive factors align - weak opponent, good weather, increased role' },
//     'upgrade': { indicator: 'upgrade', adjustment: 2.5, news: 'Teammate ruled OUT, increased target share expected' },
//     'monitor': { indicator: 'monitor', adjustment: 0, news: 'Questionable with injury, practiced limited Friday' },
//     'downgrade': { indicator: 'downgrade', adjustment: -2.0, news: 'Key defensive player healthy, tough matchup expected' },
//     'weather_risk': { indicator: 'weather_risk', adjustment: -1.5, news: 'Wind 15+ mph expected, outdoor stadium' },
// };

// // Weather data by team (simulated)
const OUTDOOR_TEAMS = ['BUF', 'GB', 'CHI', 'NE', 'CLE', 'PIT', 'DEN', 'KC', 'TEN', 'JAX', 'CAR', 'WAS', 'PHI', 'NYG', 'NYJ', 'MIA', 'BAL', 'CIN', 'SF', 'SEA', 'TB'];
// const _DOME_TEAMS = ['MIN', 'DET', 'IND', 'HOU', 'NO', 'ATL', 'LV', 'ARI', 'LAR', 'LAC', 'DAL']; // For reference

// Matchup rankings (simulated - lower is better for defense)
const DEFENSE_RANKINGS: Record<string, Record<string, number>> = {
    'QB': { 'CAR': 30, 'DEN': 28, 'NE': 25, 'LV': 24, 'NYG': 22, 'BUF': 5, 'SF': 3, 'DAL': 4 },
    'RB': { 'LAC': 29, 'DET': 27, 'MIA': 26, 'HOU': 24, 'TB': 22, 'NO': 3, 'BAL': 4, 'SF': 5 },
    'WR': { 'CAR': 32, 'NYG': 30, 'DEN': 28, 'CIN': 26, 'TEN': 25, 'BUF': 4, 'SF': 2, 'NE': 6 },
    'TE': { 'MIN': 30, 'KC': 28, 'SEA': 27, 'DET': 25, 'CLE': 23, 'PHI': 3, 'SF': 4, 'CHI': 5 },
};

// function _getRandomIndicator(): NewsIndicator | undefined {
//     const indicators: (NewsIndicator | undefined)[] = [
//         'smash', 'upgrade', 'monitor', 'downgrade', 'weather_risk', undefined, undefined, undefined
//     ];
//     return indicators[Math.floor(Math.random() * indicators.length)];
// }

function generatePlayerNews(player: Player): { indicator?: NewsIndicator; adjustment: number; newsItems: NewsItem[] } {
    const newsItems: NewsItem[] = [];
    let adjustment = 0;
    let indicator: NewsIndicator | undefined;

    // Check for weather risk (outdoor teams)
    const isOutdoor = OUTDOOR_TEAMS.includes(player.team);
    const hasWeatherRisk = isOutdoor && Math.random() > 0.7;

    // Check matchup
    const defenseRank = DEFENSE_RANKINGS[player.position]?.[player.opponent];
    const hasGoodMatchup = defenseRank && defenseRank >= 24;
    const hasBadMatchup = defenseRank && defenseRank <= 6;

    // Generate news based on factors
    if (hasGoodMatchup && !hasWeatherRisk && Math.random() > 0.4) {
        indicator = Math.random() > 0.5 ? 'smash' : 'upgrade';
        adjustment = indicator === 'smash' ? 3.0 + Math.random() * 2 : 1.5 + Math.random() * 2;

        newsItems.push({
            id: `news-${player.id}-matchup`,
            playerId: player.id,
            text: `Facing ${player.opponent} defense allowing most ${player.position} points (${(20 + Math.random() * 15).toFixed(1)} PPG)`,
            source: 'Matchup Analysis',
            timestamp: new Date(),
            sentiment: 'positive',
            impact: adjustment * 0.5,
        });
    } else if (hasBadMatchup && Math.random() > 0.5) {
        indicator = 'downgrade';
        adjustment = -1.0 - Math.random() * 2;

        newsItems.push({
            id: `news-${player.id}-matchup`,
            playerId: player.id,
            text: `Tough matchup against ${player.opponent} - top 5 defense vs ${player.position}s`,
            source: 'Matchup Analysis',
            timestamp: new Date(),
            sentiment: 'negative',
            impact: adjustment,
        });
    }

    if (hasWeatherRisk && ['QB', 'WR', 'TE'].includes(player.position)) {
        if (!indicator || indicator === 'upgrade') {
            indicator = 'weather_risk';
        }
        const weatherAdjust = -1.0 - Math.random() * 1.5;
        adjustment += weatherAdjust;

        newsItems.push({
            id: `news-${player.id}-weather`,
            playerId: player.id,
            text: `Outdoor game with ${Math.floor(12 + Math.random() * 10)}mph wind expected`,
            source: 'Weather Report',
            timestamp: new Date(),
            sentiment: 'negative',
            impact: weatherAdjust,
        });
    }

    // Random injury/role news
    if (Math.random() > 0.85) {
        const isPositive = Math.random() > 0.4;
        if (isPositive) {
            const teammateNews = Math.random() > 0.5;
            if (teammateNews) {
                indicator = indicator || 'upgrade';
                const roleAdjust = 1.5 + Math.random() * 2;
                adjustment += roleAdjust;

                newsItems.push({
                    id: `news-${player.id}-role`,
                    playerId: player.id,
                    text: 'Teammate ruled OUT - increased target share expected',
                    source: 'Injury Report',
                    timestamp: new Date(),
                    sentiment: 'positive',
                    impact: roleAdjust,
                });
            }
        } else {
            indicator = 'monitor';
            newsItems.push({
                id: `news-${player.id}-injury`,
                playerId: player.id,
                text: 'Questionable designation - monitor practice reports',
                source: 'Injury Report',
                timestamp: new Date(),
                sentiment: 'neutral',
                impact: 0,
            });
        }
    }

    // DEF specific news
    if (player.position === 'DEF') {
        if (Math.random() > 0.7) {
            const hasGoodOpp = Math.random() > 0.5;
            if (hasGoodOpp) {
                indicator = 'upgrade';
                adjustment = 1.5 + Math.random() * 1.5;
                newsItems.push({
                    id: `news-${player.id}-opp`,
                    playerId: player.id,
                    text: `Facing ${player.opponent} - high turnover rate offense`,
                    source: 'Opponent Analysis',
                    timestamp: new Date(),
                    sentiment: 'positive',
                    impact: adjustment,
                });
            }
        }
    }

    return {
        indicator: newsItems.length > 0 ? indicator : undefined,
        adjustment: Math.round(adjustment * 10) / 10,
        newsItems,
    };
}

export function analyzePlayerNews(players: Player[]): Player[] {
    return players.map(player => {
        const analysis = generatePlayerNews(player);

        return {
            ...player,
            newsIndicator: analysis.indicator,
            projectionAdjustment: analysis.adjustment,
            newsItems: analysis.newsItems,
        };
    });
}

export function getIndicatorEmoji(indicator?: NewsIndicator): string {
    switch (indicator) {
        case 'smash': return '🔥';
        case 'upgrade': return '📈';
        case 'monitor': return '⚠️';
        case 'downgrade': return '📉';
        case 'weather_risk': return '❄️';
        default: return '';
    }
}

export function getIndicatorLabel(indicator?: NewsIndicator): string {
    switch (indicator) {
        case 'smash': return 'Smash Spot';
        case 'upgrade': return 'Upgrade';
        case 'monitor': return 'Monitor';
        case 'downgrade': return 'Downgrade';
        case 'weather_risk': return 'Weather Risk';
        default: return '';
    }
}
