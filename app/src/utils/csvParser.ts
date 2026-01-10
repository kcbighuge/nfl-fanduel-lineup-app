import Papa from 'papaparse';
import type { Player, Lineup } from '../types';

/**
 * Parse FanDuel's lineup upload template CSV.
 * The actual player data starts at column K (index 10) after the lineup columns.
 * Headers are on row 7 (index 6), and player data starts on row 8 (index 7).
 */

interface FanDuelRow {
    // Raw array of values - FanDuel CSVs have complex structure
    [key: string]: string;
}

export function parsePlayerCSV(csvText: string): Player[] {
    const result = Papa.parse<string[]>(csvText, {
        skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
    }

    const rows = result.data;

    // Find the header row - look for "Player ID + Player Name" or "Id,Position"
    let headerRowIndex = -1;
    let playerColStart = -1;

    for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const row = rows[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j]?.toString().trim();
            if (cell === 'Player ID + Player Name' || cell === 'Id' || cell === 'Position') {
                // Check if this looks like a header
                const nextCells = row.slice(j, j + 5).map(c => c?.toString().trim());
                if (nextCells.includes('Position') || nextCells.includes('Salary') || nextCells.includes('FPPG')) {
                    headerRowIndex = i;
                    playerColStart = j;
                    break;
                }
            }
            // Also check for simple format where headers are at the start
            if (i === 0 && (cell === 'Id' || cell === 'Position') && row.length > 5) {
                const simplified = row.map(c => c?.toString().trim());
                if (simplified.includes('Position') && simplified.includes('Salary')) {
                    headerRowIndex = 0;
                    playerColStart = 0;
                    break;
                }
            }
        }
        if (headerRowIndex >= 0) break;
    }

    // If we couldn't find headers in the template format, try simple CSV format
    if (headerRowIndex < 0) {
        return parseSimpleCSV(csvText);
    }

    const headerRow = rows[headerRowIndex].slice(playerColStart);
    const headers = headerRow.map(h => h?.toString().trim() || '');

    // Map header names to indices
    const colMap: Record<string, number> = {};
    headers.forEach((header, idx) => {
        colMap[header.toLowerCase().replace(/\s+/g, '')] = idx;
    });

    // Helper to get column index
    const getCol = (names: string[]): number => {
        for (const name of names) {
            const key = name.toLowerCase().replace(/\s+/g, '');
            if (colMap[key] !== undefined) return colMap[key];
        }
        return -1;
    };

    // Column indices
    const idCol = getCol(['Id', 'PlayerID']);
    const posCol = getCol(['Position', 'Pos']);
    const firstNameCol = getCol(['First Name', 'FirstName']);
    const lastNameCol = getCol(['Last Name', 'LastName']);
    const nicknameCol = getCol(['Nickname', 'Player ID + Player Name']);
    const fppgCol = getCol(['FPPG', 'FantasyPointsPerGame']);
    const playedCol = getCol(['Played', 'Games']);
    const salaryCol = getCol(['Salary', 'Cost']);
    const gameCol = getCol(['Game', 'Matchup']);
    const teamCol = getCol(['Team']);
    const oppCol = getCol(['Opponent', 'Opp']);
    const injuryIndicatorCol = getCol(['Injury Indicator', 'InjuryIndicator', 'Injury']);
    const injuryDetailsCol = getCol(['Injury Details', 'InjuryDetails']);
    const rosterPosCol = getCol(['Roster Position', 'RosterPosition']);

    const players: Player[] = [];

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i].slice(playerColStart);

        // Skip empty rows
        if (!row || row.length < 5) continue;

        const id = row[idCol]?.toString().trim() || '';
        let position = row[posCol]?.toString().trim().toUpperCase() || '';
        const salary = parseInt(row[salaryCol]?.toString().replace(/[,$]/g, '')) || 0;

        // Skip rows without essential data
        if (!id || !position || !salary) continue;

        // Normalize position - FanDuel uses "D" for defense
        if (position === 'D') position = 'DEF';

        // Skip invalid positions
        if (!['QB', 'RB', 'WR', 'TE', 'DEF'].includes(position)) continue;

        const firstName = row[firstNameCol]?.toString().trim() || '';
        const lastName = row[lastNameCol]?.toString().trim() || '';
        const fppg = parseFloat(row[fppgCol]?.toString()) || 0;
        const played = parseInt(row[playedCol]?.toString()) || 0;
        const game = row[gameCol]?.toString().trim() || '';
        const team = row[teamCol]?.toString().trim() || '';
        const opponent = row[oppCol]?.toString().trim() || '';
        const injuryIndicator = row[injuryIndicatorCol]?.toString().trim() || '';
        const injuryDetails = row[injuryDetailsCol]?.toString().trim() || '';
        const rosterPosition = row[rosterPosCol]?.toString().trim() || position;

        players.push({
            id,
            position: position as Player['position'],
            firstName,
            lastName,
            fppg,
            played,
            salary,
            game,
            team,
            opponent,
            injuryIndicator,
            injuryDetails,
            rosterPosition,
            projection: fppg,
            projectionAdjustment: 0,
            isLocked: false,
            isExcluded: false,
            exposureLimit: 100,
            newsItems: [],
        });
    }

    return players;
}

/**
 * Parse a simple CSV format with headers in first row
 */
function parseSimpleCSV(csvText: string): Player[] {
    const result = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
    }

    return result.data
        .filter(row => {
            const id = row['Id'] || row['id'] || row['ID'] || '';
            const salary = row['Salary'] || row['salary'] || '0';
            return id && parseInt(salary.replace(/[,$]/g, '')) > 0;
        })
        .map((row) => {
            let position = (row['Position'] || row['Pos'] || '').toUpperCase().trim();
            if (position === 'D') position = 'DEF';

            const fppg = parseFloat(row['FPPG'] || row['fppg'] || '0') || 0;
            const projection = row['Projection'] ? parseFloat(row['Projection']) : fppg;

            return {
                id: (row['Id'] || row['id'] || row['ID'] || '').trim(),
                position: position as Player['position'],
                firstName: (row['First Name'] || row['FirstName'] || '').trim(),
                lastName: (row['Last Name'] || row['LastName'] || '').trim(),
                fppg,
                played: parseInt(row['Played'] || row['Games'] || '0') || 0,
                salary: parseInt((row['Salary'] || '0').replace(/[,$]/g, '')) || 0,
                game: (row['Game'] || row['Matchup'] || '').trim(),
                team: (row['Team'] || '').trim(),
                opponent: (row['Opponent'] || row['Opp'] || '').trim(),
                injuryIndicator: (row['Injury Indicator'] || row['Injury'] || '').trim(),
                injuryDetails: (row['Injury Details'] || '').trim(),
                rosterPosition: (row['Roster Position'] || position).trim(),
                projection,
                projectionAdjustment: 0,
                isLocked: false,
                isExcluded: false,
                exposureLimit: 100,
                newsItems: [],
            };
        })
        .filter(player => ['QB', 'RB', 'WR', 'TE', 'DEF'].includes(player.position));
}

export function exportLineupsToCSV(lineups: Lineup[]): string {
    const header = 'QB,RB,RB,WR,WR,WR,TE,FLEX,DEF';
    const rows = lineups.map(lineup => {
        return [
            lineup.qb.id,
            lineup.rb1.id,
            lineup.rb2.id,
            lineup.wr1.id,
            lineup.wr2.id,
            lineup.wr3.id,
            lineup.te.id,
            lineup.flex.id,
            lineup.def.id
        ].join(',');
    });

    return [header, ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
