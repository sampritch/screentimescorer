import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import type { RootStackParamList } from '../navigation/types';

export function AccountScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const { planLabel, restoreFreeStub } = useSubscription();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [busy, setBusy] = useState(false);

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

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.email}>{user?.email ?? 'Signed in'}</Text>
      <Text style={styles.meta}>Plan: {planLabel}</Text>
      <Text style={styles.meta}>
        Bundle: com.sampritchard.screentimescorer
      </Text>

      <PrimaryButton
        label="Manage subscription / paywall"
        variant="secondary"
        onPress={() => navigation.navigate('Paywall')}
        style={{ marginTop: 24 }}
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
});
