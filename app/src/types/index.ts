// Player data from FanDuel CSV export
export interface Player {
  id: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'DEF';
  firstName: string;
  lastName: string;
  fppg: number;
  played: number;
  salary: number;
  game: string;
  team: string;
  opponent: string;
  injuryIndicator: string;
  injuryDetails: string;
  rosterPosition: string;
  
  // Optimizer fields
  projection: number;
  projectionAdjustment: number;
  isLocked: boolean;
  isExcluded: boolean;
  exposureLimit: number;
  newsIndicator?: NewsIndicator;
  newsItems: NewsItem[];
}

export type NewsIndicator = 'smash' | 'upgrade' | 'monitor' | 'downgrade' | 'weather_risk';

export interface NewsItem {
  id: string;
  playerId: string;
  text: string;
  source: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number; // -5 to +5
}

export interface OptimizationSettings {
  numberOfLineups: number;
  maxPlayerExposure: number;
  minSalaryUsed: number;
  randomness: number;
  minUniquePlayers: number;
  allowQBWithOppDef: boolean;
  newsMode: 'auto' | 'suggested' | 'off';
}

export interface StackingRule {
  id: string;
  type: 'qb_pass_catcher' | 'rb_opp_def' | 'bring_back' | 'same_game';
  enabled: boolean;
  minPlayers?: number;
  maxPlayers?: number;
}

export interface Lineup {
  id: string;
  players: Player[];
  totalSalary: number;
  totalProjection: number;
  qb: Player;
  rb1: Player;
  rb2: Player;
  wr1: Player;
  wr2: Player;
  wr3: Player;
  te: Player;
  flex: Player;
  def: Player;
}

export interface ExposureData {
  playerId: string;
  player: Player;
  count: number;
  percentage: number;
}

export const SALARY_CAP = 60000;
export const MIN_SALARY_DEFAULT = 59000;
export const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'DEF'] as const;
export const FLEX_POSITIONS = ['RB', 'WR', 'TE'] as const;
