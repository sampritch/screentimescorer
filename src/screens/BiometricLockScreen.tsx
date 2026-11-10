import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useBiometric } from '../context/BiometricContext';
import { useAuth } from '../context/AuthContext';

export function BiometricLockScreen() {
  const { biometryLabel, unlock } = useBiometric();
  const { signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tryUnlock = async () => {
    setError(null);
    setBusy(true);
    const { error: err } = await unlock();
    setBusy(false);
    if (err) setError(err);
  };

  useEffect(() => {
    // Auto-prompt once when the lock screen mounts.
    void tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>Screen Time Scorer</Text>
      <Text style={styles.title}>Locked</Text>
      <Text style={styles.copy}>
        Use {biometryLabel} to unlock. Your session stays on this device in Secure Store.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label={`Unlock with ${biometryLabel}`}
        onPress={tryUnlock}
        loading={busy}
        style={{ marginTop: 24, alignSelf: 'stretch' }}
      />
      <PrimaryButton
        label="Log out"
        variant="secondary"
        onPress={() => {
          void signOut();
        }}
        style={{ marginTop: 12, alignSelf: 'stretch' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  copy: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});
