import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  getBiometricEnabled,
  setBiometricEnabled as persistBiometricEnabled,
} from '../lib/secureStorage';
import { useAuth } from './AuthContext';

type BiometricContextValue = {
  /** Preference loaded from SecureStore. */
  enabled: boolean;
  /** Preference hydrate complete. */
  ready: boolean;
  /** True when a session exists, biometrics are on, and the user has not unlocked yet. */
  locked: boolean;
  /** Hardware + enrollment available. */
  hardwareAvailable: boolean;
  /** Human label: Face ID / Touch ID / biometrics. */
  biometryLabel: string;
  enable: () => Promise<{ error: string | null }>;
  disable: () => Promise<{ error: string | null }>;
  unlock: () => Promise<{ error: string | null }>;
  lock: () => void;
};

const BiometricContext = createContext<BiometricContextValue | undefined>(
  undefined
);

function labelForTypes(types: LocalAuthentication.AuthenticationType[]): string {
  if (Platform.OS === 'ios') {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'face unlock';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'fingerprint';
  }
  return 'biometrics';
}

export function BiometricProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [hardwareAvailable, setHardwareAvailable] = useState(false);
  const [biometryLabel, setBiometryLabel] = useState('biometrics');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [pref, hasHw, enrolled, types] = await Promise.all([
        getBiometricEnabled(),
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]);
      if (!mounted) return;
      setEnabled(pref);
      setHardwareAvailable(hasHw && enrolled);
      setBiometryLabel(labelForTypes(types));
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // When session disappears, clear unlock state.
  useEffect(() => {
    if (!session) setUnlocked(false);
  }, [session]);

  // Re-lock when returning from background if biometrics are enabled.
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        if (enabled && session) setUnlocked(false);
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [enabled, session]);

  const prompt = useCallback(async (reason: string) => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use passcode',
    });
    return result;
  }, []);

  const enable = useCallback(async () => {
    const hasHw = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHw || !enrolled) {
      return {
        error: `No ${biometryLabel} enrolled on this device. Set one up in system Settings first.`,
      };
    }
    const result = await prompt(`Enable ${biometryLabel} unlock`);
    if (!result.success) {
      return { error: result.error === 'user_cancel' ? null : 'Authentication failed.' };
    }
    await persistBiometricEnabled(true);
    setEnabled(true);
    setUnlocked(true);
    setHardwareAvailable(true);
    return { error: null };
  }, [biometryLabel, prompt]);

  const disable = useCallback(async () => {
    if (enabled) {
      const result = await prompt(`Disable ${biometryLabel} unlock`);
      if (!result.success) {
        return { error: result.error === 'user_cancel' ? null : 'Authentication failed.' };
      }
    }
    await persistBiometricEnabled(false);
    setEnabled(false);
    setUnlocked(true);
    return { error: null };
  }, [enabled, biometryLabel, prompt]);

  const unlock = useCallback(async () => {
    const result = await prompt(`Unlock Screen Time Scorer`);
    if (!result.success) {
      return { error: result.error === 'user_cancel' ? null : 'Unlock failed.' };
    }
    setUnlocked(true);
    return { error: null };
  }, [prompt]);

  const lock = useCallback(() => {
    setUnlocked(false);
  }, []);

  const locked = Boolean(session) && enabled && ready && !unlocked;

  const value = useMemo<BiometricContextValue>(
    () => ({
      enabled,
      ready,
      locked,
      hardwareAvailable,
      biometryLabel,
      enable,
      disable,
      unlock,
      lock,
    }),
    [
      enabled,
      ready,
      locked,
      hardwareAvailable,
      biometryLabel,
      enable,
      disable,
      unlock,
      lock,
    ]
  );

  return (
    <BiometricContext.Provider value={value}>{children}</BiometricContext.Provider>
  );
}

export function useBiometric() {
  const ctx = useContext(BiometricContext);
  if (!ctx) throw new Error('useBiometric must be used within BiometricProvider');
  return ctx;
}
