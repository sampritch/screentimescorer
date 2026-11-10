import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useBiometric } from '../context/BiometricContext';
import { useSubscription } from '../context/SubscriptionContext';
import type { RootStackParamList } from '../navigation/types';

export function AccountScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const {
    enabled: biometricOn,
    hardwareAvailable,
    biometryLabel,
    enable,
    disable,
  } = useBiometric();
  const { planLabel, restoreFreeStub } = useSubscription();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [busy, setBusy] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  const onLogout = async () => {
    setBusy(true);
    const { error } = await signOut();
    setBusy(false);
    if (error) Alert.alert('Log out failed', error);
  };

  const onDelete = () => {
    Alert.alert(
      'Delete account?',
      'This will attempt to purge your auth user and related data, then sign you out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const { error } = await deleteAccount();
            setBusy(false);
            restoreFreeStub();
            if (error) Alert.alert('Account deletion', error);
          },
        },
      ]
    );
  };

  const onToggleBiometric = async (next: boolean) => {
    setBioBusy(true);
    const result = next ? await enable() : await disable();
    setBioBusy(false);
    if (result.error) Alert.alert(`${biometryLabel} unlock`, result.error);
  };

  const provider =
    (user?.app_metadata?.provider as string | undefined) ??
    (user?.identities?.[0]?.provider as string | undefined) ??
    'email';

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.email}>{user?.email ?? 'Signed in'}</Text>
      <Text style={styles.meta}>Plan: {planLabel}</Text>
      <Text style={styles.meta}>Signed in via: {provider}</Text>
      <Text style={styles.meta}>
        Bundle: com.sampritchard.screentimescorer
      </Text>

      <View style={styles.bioRow}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.bioTitle}>
            Unlock with {biometryLabel}
          </Text>
          <Text style={styles.bioCopy}>
            {Platform.OS === 'web'
              ? 'Biometric unlock is available on iOS and Android builds.'
              : hardwareAvailable
                ? `Require ${biometryLabel} after launch and when returning from background. Session stays in Secure Store.`
                : `Set up ${biometryLabel} in system Settings to enable this.`}
          </Text>
        </View>
        <Switch
          value={biometricOn}
          onValueChange={onToggleBiometric}
          disabled={bioBusy || Platform.OS === 'web' || (!hardwareAvailable && !biometricOn)}
          trackColor={{ false: colors.border, true: colors.accentDim }}
          thumbColor={biometricOn ? colors.accent : colors.textMuted}
        />
      </View>

      <PrimaryButton
        label="Link this device"
        onPress={() => navigation.navigate('LinkDevice')}
        style={{ marginTop: 24 }}
      />
      <PrimaryButton
        label="Manage subscription / paywall"
        variant="secondary"
        onPress={() => navigation.navigate('Paywall')}
        style={{ marginTop: 12 }}
      />
      <PrimaryButton
        label="Log out"
        onPress={onLogout}
        loading={busy}
        style={{ marginTop: 12 }}
      />
      <PrimaryButton
        label="Delete account"
        variant="danger"
        onPress={onDelete}
        disabled={busy}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  email: {
    color: colors.accent,
    fontSize: 16,
    marginBottom: 8,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bioCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
