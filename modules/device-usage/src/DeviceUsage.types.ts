export type UsagePermissionStatus =
  | 'approved'
  | 'denied'
  | 'notDetermined'
  | 'notImplemented'
  | 'unknown';

export type PermissionResult = {
  status: UsagePermissionStatus;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  message?: string;
};

export type TodayUsage = {
  date: string;
  screenTimeMinutes: number;
  /** null when the OS / bridge does not expose a pickup count yet */
  pickups: number | null;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  source: 'device' | 'pending' | 'unavailable' | 'not_implemented';
  authorized: boolean;
  appGroupId?: string;
};

export type DeviceUsageNativeModule = {
  requestPermission(): Promise<{ status: string; platform?: string }>;
  isAuthorized(): Promise<boolean>;
  getAuthorizationStatus(): Promise<string>;
  getTodayUsage(): Promise<Record<string, unknown>>;
  startDailyMonitoring(): Promise<boolean>;
};
