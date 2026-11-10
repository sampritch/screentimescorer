import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';
import type {
  DeviceUsageNativeModule,
  PermissionResult,
  TodayUsage,
  UsagePermissionStatus,
} from './DeviceUsage.types';

export type {
  DeviceUsageNativeModule,
  PermissionResult,
  TodayUsage,
  UsagePermissionStatus,
} from './DeviceUsage.types';

const NOT_IMPLEMENTED =
  'Android UsageStats device linking is not implemented yet.';

function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getNativeOrNull(): DeviceUsageNativeModule | null {
  try {
    return requireNativeModule<DeviceUsageNativeModule>('DeviceUsage');
  } catch {
    return null;
  }
}

function asStatus(value: string | undefined): UsagePermissionStatus {
  switch (value) {
    case 'approved':
    case 'denied':
    case 'notDetermined':
    case 'notImplemented':
    case 'unknown':
      return value;
    default:
      return 'unknown';
  }
}

function mapTodayUsage(raw: Record<string, unknown>): TodayUsage {
  const pickupsRaw = raw.pickups;
  const pickups =
    pickupsRaw === null || pickupsRaw === undefined
      ? null
      : typeof pickupsRaw === 'number'
        ? pickupsRaw
        : Number(pickupsRaw);

  return {
    date: String(raw.date ?? todayDateKey()),
    screenTimeMinutes: Number(raw.screenTimeMinutes ?? 0),
    pickups: Number.isFinite(pickups as number) ? (pickups as number) : null,
    platform: (raw.platform as TodayUsage['platform']) ?? 'ios',
    source: (raw.source as TodayUsage['source']) ?? 'pending',
    authorized: Boolean(raw.authorized),
    appGroupId:
      typeof raw.appGroupId === 'string' ? raw.appGroupId : undefined,
  };
}

/**
 * Request Screen Time / FamilyControls authorization (iOS).
 * Android returns a not-implemented result (does not throw by default).
 */
export async function requestPermission(): Promise<PermissionResult> {
  if (Platform.OS === 'android') {
    return {
      status: 'notImplemented',
      platform: 'android',
      message: NOT_IMPLEMENTED,
    };
  }
  if (Platform.OS !== 'ios') {
    return {
      status: 'notImplemented',
      platform: 'web',
      message: 'Device usage linking is only available on iOS (and later Android).',
    };
  }

  const native = getNativeOrNull();
  if (!native) {
    return {
      status: 'notDetermined',
      platform: 'ios',
      message:
        'Native DeviceUsage module missing. Use a development build (`npx expo run:ios`), not Expo Go.',
    };
  }

  const result = await native.requestPermission();
  return {
    status: asStatus(result.status),
    platform: 'ios',
  };
}

/** True when FamilyControls authorizationStatus === approved (iOS only). */
export async function isAuthorized(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  const native = getNativeOrNull();
  if (!native) return false;
  return native.isAuthorized();
}

export async function getAuthorizationStatus(): Promise<UsagePermissionStatus> {
  if (Platform.OS === 'android') return 'notImplemented';
  if (Platform.OS !== 'ios') return 'notImplemented';
  const native = getNativeOrNull();
  if (!native) return 'notDetermined';
  return asStatus(await native.getAuthorizationStatus());
}

/**
 * Daily aggregates from the DeviceActivity monitor App Group (iOS).
 * Android rejects with a not-implemented shaped result (no throw).
 */
export async function getTodayUsage(): Promise<TodayUsage> {
  if (Platform.OS === 'android') {
    return {
      date: todayDateKey(),
      screenTimeMinutes: 0,
      pickups: null,
      platform: 'android',
      source: 'not_implemented',
      authorized: false,
    };
  }
  if (Platform.OS !== 'ios') {
    return {
      date: todayDateKey(),
      screenTimeMinutes: 0,
      pickups: null,
      platform: 'web',
      source: 'not_implemented',
      authorized: false,
    };
  }

  const native = getNativeOrNull();
  if (!native) {
    return {
      date: todayDateKey(),
      screenTimeMinutes: 0,
      pickups: null,
      platform: 'ios',
      source: 'unavailable',
      authorized: false,
    };
  }

  const raw = await native.getTodayUsage();
  return mapTodayUsage(raw);
}

export async function startDailyMonitoring(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  const native = getNativeOrNull();
  if (!native) return false;
  return native.startDailyMonitoring();
}

const DeviceUsage = {
  requestPermission,
  isAuthorized,
  getAuthorizationStatus,
  getTodayUsage,
  startDailyMonitoring,
};

export default DeviceUsage;
