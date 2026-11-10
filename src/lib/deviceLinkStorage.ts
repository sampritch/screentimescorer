import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'deviceLink.v1';

export type DeviceLinkState = {
  linked: boolean;
  platform: 'ios' | 'android' | 'unknown';
  linkedAt: string | null;
  lastStatus: string | null;
};

const EMPTY: DeviceLinkState = {
  linked: false,
  platform: 'unknown',
  linkedAt: null,
  lastStatus: null,
};

export async function loadDeviceLink(): Promise<DeviceLinkState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) } as DeviceLinkState;
  } catch {
    return { ...EMPTY };
  }
}

export async function saveDeviceLink(
  partial: Partial<DeviceLinkState>
): Promise<DeviceLinkState> {
  const current = await loadDeviceLink();
  const next: DeviceLinkState = {
    ...current,
    ...partial,
    platform:
      partial.platform ??
      (Platform.OS === 'ios'
        ? 'ios'
        : Platform.OS === 'android'
          ? 'android'
          : 'unknown'),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearDeviceLink(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
