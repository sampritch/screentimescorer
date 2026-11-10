/**
 * Phone Health Score sketch (lower = better, 0–100).
 * Inputs are stubbed until native usage modules land.
 */

export type DailyMetrics = {
  screenTimeMinutes: number;
  pickups: number;
  nightShare: number;
  fragmentation: number;
};

export type Tip = {
  id: string;
  title: string;
  body: string;
  why: string;
  expert?: boolean;
};

const SCREEN_BUDGET_MIN = 180;
const PICKUP_BUDGET = 40;

export function computeHealthScore(metrics: DailyMetrics): number {
  const S = Math.min(1, metrics.screenTimeMinutes / SCREEN_BUDGET_MIN);
  const P = Math.min(1, metrics.pickups / PICKUP_BUDGET);
  const N = Math.min(1, metrics.nightShare);
  const A = Math.min(1, metrics.fragmentation);
  return Math.round(100 * Math.min(1, 0.45 * S + 0.35 * P + 0.15 * N + 0.05 * A));
}

export function scoreLabel(score: number): string {
  if (score <= 35) return 'Healthy';
  if (score <= 65) return 'Needs attention';
  return 'Heavy use';
}

/** Demo metrics until UsageStats / FamilyControls bridges ship. */
export const DEMO_TODAY_METRICS: DailyMetrics = {
  screenTimeMinutes: 210,
  pickups: 52,
  nightShare: 0.18,
  fragmentation: 0.4,
};

export const DEMO_TIPS: Tip[] = [
  {
    id: 'batch-checks',
    title: 'Batch your checks',
    body: 'Leave your phone in another room for 25 minutes, then check messages in one pass.',
    why: 'Driven by elevated pickup count vs your daily budget.',
  },
  {
    id: 'cap-social',
    title: 'Cap social after dinner',
    body: 'Set a hard stop on social apps after 7pm to reclaim evening attention.',
    why: 'Driven by high screen time with social-heavy patterns.',
  },
  {
    id: 'charge-elsewhere',
    title: 'Charge outside the bedroom',
    body: 'Plug in overnight in the kitchen or hallway so night pickups drop naturally.',
    why: 'Driven by night usage share.',
  },
  {
    id: 'expert-focus',
    title: 'Expert focus block',
    body: 'Our expert team recommends two 45-minute focus blocks with phone in another room before noon.',
    why: 'Personalized coaching available on paid plans.',
    expert: true,
  },
];

export function freeTip(tips: Tip[] = DEMO_TIPS): Tip {
  return tips.find((t) => !t.expert) ?? tips[0];
}

export function paidTips(tips: Tip[] = DEMO_TIPS): Tip[] {
  return tips.filter((t) => !t.expert);
}

export function expertTips(tips: Tip[] = DEMO_TIPS): Tip[] {
  return tips.filter((t) => t.expert);
}
