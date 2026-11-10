import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useSubscription } from '../context/SubscriptionContext';
import {
  FREE_FEATURES,
  PAID_FEATURES,
  TRIAL_COPY,
} from '../lib/subscription';

export function PaywallScreen() {
  const navigation = useNavigation();
  const { isPaid, startPaidTrialStub, restoreFreeStub } = useSubscription();

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>Screen Time Scorer</Text>
      <Text style={styles.title}>Go deeper for {TRIAL_COPY}</Text>
      <Text style={styles.sub}>
        Stub paywall — wire RevenueCat / StoreKit / Play Billing later. Trial copy must stay
        explicit in store metadata.
      </Text>

      <Text style={styles.section}>Free</Text>
      {FREE_FEATURES.map((f) => (
        <Text key={f} style={styles.item}>
          · {f}
        </Text>
      ))}

      <Text style={styles.section}>Paid</Text>
      {PAID_FEATURES.map((f) => (
        <Text key={f} style={styles.item}>
          · {f}
        </Text>
      ))}

      {!isPaid ? (
        <PrimaryButton
          label={`Start stub trial (${TRIAL_COPY})`}
          onPress={() => {
            startPaidTrialStub();
            navigation.goBack();
          }}
          style={{ marginTop: 24 }}
        />
      ) : (
        <PrimaryButton
          label="Restore free stub (dev)"
          variant="secondary"
          onPress={restoreFreeStub}
          style={{ marginTop: 24 }}
        />
      )}

      <PrimaryButton
        label="Close"
        variant="secondary"
        onPress={() => navigation.goBack()}
        style={{ marginTop: 10 }}
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
  brand: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  sub: {
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    color: colors.text,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  item: {
    color: colors.textMuted,
    marginBottom: 4,
    lineHeight: 20,
  },
});
