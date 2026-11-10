import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Supabase auth storage backed by SecureStore on iOS/Android (chunked for
 * the ~2KB SecureStore value limit) and AsyncStorage on web.
 */
const CHUNK = 1800;

async function setSecure(key: string, value: string) {
  const count = Math.ceil(value.length / CHUNK);
  await SecureStore.setItemAsync(`${key}_chunks`, String(count));
  const writes: Promise<void>[] = [];
  for (let i = 0; i < count; i += 1) {
    writes.push(
      SecureStore.setItemAsync(
        `${key}_${i}`,
        value.slice(i * CHUNK, (i + 1) * CHUNK)
      )
    );
  }
  await Promise.all(writes);
}

async function getSecure(key: string): Promise<string | null> {
  const countRaw = await SecureStore.getItemAsync(`${key}_chunks`);
  if (!countRaw) {
    // Legacy / single-value fallback
    return SecureStore.getItemAsync(key);
  }
  const count = Number(countRaw);
  if (!Number.isFinite(count) || count <= 0) return null;
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const part = await SecureStore.getItemAsync(`${key}_${i}`);
    if (part == null) return null;
    parts.push(part);
  }
  return parts.join('');
}

async function deleteSecure(key: string) {
  const countRaw = await SecureStore.getItemAsync(`${key}_chunks`);
  const count = countRaw ? Number(countRaw) : 0;
  const deletes: Promise<void>[] = [SecureStore.deleteItemAsync(`${key}_chunks`)];
  if (Number.isFinite(count) && count > 0) {
    for (let i = 0; i < count; i += 1) {
      deletes.push(SecureStore.deleteItemAsync(`${key}_${i}`));
    }
  }
  deletes.push(SecureStore.deleteItemAsync(key));
  await Promise.all(deletes.map((p) => p.catch(() => undefined)));
}

export const supabaseSecureStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return getSecure(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
    return setSecure(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
    return deleteSecure(key);
  },
};

export const BIOMETRIC_ENABLED_KEY = 'sts_biometric_unlock_enabled';

export async function getBiometricEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') {
    const v = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return v === '1';
  }
  const v = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return v === '1';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (Platform.OS === 'web') {
    if (enabled) await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, '1');
    else await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    return;
  }
  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, '1');
  } else {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY).catch(() => undefined);
  }
}
