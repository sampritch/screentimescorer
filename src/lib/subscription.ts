/**
 * Paid entitlement stubs.
 * Free tier: today's Phone Health Score + one tip only.
 * Paid ($1 / 7-day trial then subscription): trends, history, multiple tips, expert-team advice.
 *
 * Wire RevenueCat (or Adapty) here later; for now entitlement is local/demo.
 */

export type EntitlementState = {
  /** True when user has active paid trial or subscription. */
  isPaid: boolean;
  /** Display label for UI gates. */
  planLabel: 'Free' | 'Paid trial' | 'Paid';
};

export const FREE_ENTITLEMENT: EntitlementState = {
  isPaid: false,
  planLabel: 'Free',
};

export const PAID_FEATURES = [
  'Trends (week-over-week)',
  'History (multi-day scores)',
  'Multiple tips',
  'Advice from our expert team',
] as const;

export const FREE_FEATURES = [
  "Today's Phone Health Score",
  'One tip only',
] as const;

export const TRIAL_COPY = '$1 for a 7-day paid trial';
