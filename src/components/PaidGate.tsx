import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { PrimaryButton } from './PrimaryButton';
import { useSubscription } from '../context/SubscriptionContext';
import { TRIAL_COPY } from '../lib/subscription';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  featureName: string;
  children: React.ReactNode;
};

export function PaidGate({ featureName, children }: Props) {
  const { isPaid } = useSubscription();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (isPaid) return <>{children}</>;

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>Paid feature</Text>
      <Text style={styles.title}>{featureName}</Text>
      <Text style={styles.body}>
        Free includes today’s score and one tip. Unlock {featureName.toLowerCase()} with{' '}
        {TRIAL_COPY}.
      </Text>
      <PrimaryButton
        label="View paywall"
        onPress={() => navigation.navigate('Paywall')}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    justifyContent: 'center',
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  body: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
});
