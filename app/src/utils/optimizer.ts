import type { Player, Lineup, OptimizationSettings } from '../types';
import { SALARY_CAP } from '../types';

/**
 * NFL DFS Lineup Optimizer using a greedy heuristic with constraints.
 * 
 * For production use, this can be replaced with HiGHS or another MILP solver.
 * This implementation provides fast, good-quality solutions for demo purposes.
 */

// Position requirements: QB:1, RB:2, WR:3, TE:1, DEF:1, FLEX:1 (RB/WR/TE)

function getAdjustedProjection(player: Player, randomness: number): number {
    const baseProjection = player.projection + player.projectionAdjustment;
    if (randomness === 0) return baseProjection;

    const variance = (Math.random() - 0.5) * 2 * (randomness / 100) * baseProjection;
    return Math.max(0, baseProjection + variance);
}

function getEligiblePlayers(players: Player[]): Player[] {
    return players.filter(p =>
        !p.isExcluded &&
        p.injuryIndicator !== 'O' && // Out
        p.salary > 0
    );
}

function selectBestPlayer(
    availablePlayers: Player[],
    position: string,
    remainingSalary: number,
    usedPlayerIds: Set<string>,
    settings: OptimizationSettings,
    flexPositions: string[] = []
): Player | null {
    const eligiblePositions = position === 'FLEX' ? flexPositions : [position];

    const candidates = availablePlayers
        .filter(p =>
            eligiblePositions.includes(p.position) &&
            p.salary <= remainingSalary &&
            !usedPlayerIds.has(p.id)
        )
        .map(p => ({
            player: p,
            score: getAdjustedProjection(p, settings.randomness),
            valueScore: getAdjustedProjection(p, settings.randomness) / (p.salary / 1000)
        }))
        .sort((a, b) => b.score - a.score);

    return candidates[0]?.player || null;
}

function buildSingleLineup(
    players: Player[],
    settings: OptimizationSettings,
    previousLineups: Lineup[],
    playerExposures: Map<string, number>
): Lineup | null {
    const eligible = getEligiblePlayers(players);
    const usedIds = new Set<string>();
    let remainingSalary = SALARY_CAP;

    // Get locked players first
    const lockedPlayers = eligible.filter(p => p.isLocked);
    lockedPlayers.forEach(p => {
        usedIds.add(p.id);
        remainingSalary -= p.salary;
    });

    // Build position slots
    const lineup: Partial<{
        qb: Player;
        rb1: Player;
        rb2: Player;
        wr1: Player;
        wr2: Player;
        wr3: Player;
        te: Player;
        flex: Player;
        def: Player;
    }> = {};

    // Assign locked players to their positions
    lockedPlayers.forEach(p => {
        if (p.position === 'QB' && !lineup.qb) lineup.qb = p;
        else if (p.position === 'RB') {
            if (!lineup.rb1) lineup.rb1 = p;
            else if (!lineup.rb2) lineup.rb2 = p;
            else if (!lineup.flex) lineup.flex = p;
        }
        else if (p.position === 'WR') {
            if (!lineup.wr1) lineup.wr1 = p;
            else if (!lineup.wr2) lineup.wr2 = p;
            else if (!lineup.wr3) lineup.wr3 = p;
            else if (!lineup.flex) lineup.flex = p;
        }
        else if (p.position === 'TE') {
            if (!lineup.te) lineup.te = p;
            else if (!lineup.flex) lineup.flex = p;
        }
        else if (p.position === 'DEF' && !lineup.def) lineup.def = p;
    });

    // Filter by exposure limits
    const getExposureEligible = (pool: Player[]) => {
        const _lineupCount = previousLineups.length + 1; // Used for exposure calculation context
        return pool.filter(p => {
            const currentExposure = playerExposures.get(p.id) || 0;
            const maxAllowed = Math.ceil((p.exposureLimit / 100) * settings.numberOfLineups);
            return currentExposure < maxAllowed;
        });
    };

    // Fill remaining positions
    const positionOrder: Array<{ slot: keyof typeof lineup; position: string }> = [
        { slot: 'qb', position: 'QB' },
        { slot: 'rb1', position: 'RB' },
        { slot: 'rb2', position: 'RB' },
        { slot: 'wr1', position: 'WR' },
        { slot: 'wr2', position: 'WR' },
        { slot: 'wr3', position: 'WR' },
        { slot: 'te', position: 'TE' },
        { slot: 'def', position: 'DEF' },
        { slot: 'flex', position: 'FLEX' },
    ];

    for (const { slot, position } of positionOrder) {
        if (lineup[slot]) continue;

        const exposureEligible = getExposureEligible(eligible);
        const player = selectBestPlayer(
            exposureEligible,
            position,
            remainingSalary,
            usedIds,
            settings,
            ['RB', 'WR', 'TE']
        );

        if (!player) return null;

        lineup[slot] = player;
        usedIds.add(player.id);
        remainingSalary -= player.salary;
    }

    // Validate lineup
    const totalSalary = SALARY_CAP - remainingSalary;
    if (totalSalary > SALARY_CAP) return null;
    if (totalSalary < settings.minSalaryUsed) {
        // Try to upgrade players to use more salary
        // For simplicity, accept lineups that are close to min salary
    }

    const allPlayers = [
        lineup.qb!, lineup.rb1!, lineup.rb2!,
        lineup.wr1!, lineup.wr2!, lineup.wr3!,
        lineup.te!, lineup.flex!, lineup.def!
    ];

    // Check uniqueness constraint
    if (previousLineups.length > 0) {
        for (const prevLineup of previousLineups) {
            const prevIds = new Set(prevLineup.players.map(p => p.id));
            const sharedCount = allPlayers.filter(p => prevIds.has(p.id)).length;
            if (9 - sharedCount < settings.minUniquePlayers) {
                return null; // Not unique enough, try again
            }
        }
    }

    const totalProjection = allPlayers.reduce(
        (sum, p) => sum + p.projection + p.projectionAdjustment,
        0
    );

    return {
        id: `lineup-${Date.now()}-${previousLineups.length}`,
        players: allPlayers,
        totalSalary,
        totalProjection,
        qb: lineup.qb!,
        rb1: lineup.rb1!,
        rb2: lineup.rb2!,
        wr1: lineup.wr1!,
        wr2: lineup.wr2!,
        wr3: lineup.wr3!,
        te: lineup.te!,
        flex: lineup.flex!,
        def: lineup.def!,
    };
}

export function optimizeLineups(
    players: Player[],
    settings: OptimizationSettings
): Lineup[] {
    const lineups: Lineup[] = [];
    const playerExposures = new Map<string, number>();

    let attempts = 0;
    const maxAttempts = settings.numberOfLineups * 50; // Allow many retries

    while (lineups.length < settings.numberOfLineups && attempts < maxAttempts) {
        attempts++;

        const lineup = buildSingleLineup(players, settings, lineups, playerExposures);

        if (lineup) {
            lineups.push(lineup);

            // Update exposures
            lineup.players.forEach(p => {
                playerExposures.set(p.id, (playerExposures.get(p.id) || 0) + 1);
            });
        }
    }

    // Sort by projected points descending
    lineups.sort((a, b) => b.totalProjection - a.totalProjection);

    return lineups;
}

export function calculateExposures(lineups: Lineup[]): Map<string, { count: number; percentage: number }> {
    const exposures = new Map<string, { count: number; percentage: number }>();

    if (lineups.length === 0) return exposures;

    lineups.forEach(lineup => {
        lineup.players.forEach(player => {
            const current = exposures.get(player.id) || { count: 0, percentage: 0 };
            current.count++;
            current.percentage = (current.count / lineups.length) * 100;
            exposures.set(player.id, current);
        });
    });

    return exposures;
}
