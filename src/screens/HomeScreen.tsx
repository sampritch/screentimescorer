import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useSubscription } from '../context/SubscriptionContext';
import {
  DEMO_TODAY_METRICS,
  computeHealthScore,
  freeTip,
  scoreLabel,
} from '../lib/score';
import type { RootStackParamList } from '../navigation/types';

export function HomeScreen() {
  const { isPaid, planLabel } = useSubscription();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const score = useMemo(() => computeHealthScore(DEMO_TODAY_METRICS), []);
  const tip = useMemo(() => freeTip(), []);
  const label = scoreLabel(score);
  const scoreColor =
    score <= 35 ? colors.scoreGood : score <= 65 ? colors.scoreOk : colors.scoreBad;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>Screen Time Scorer</Text>
      <Text style={styles.plan}>{planLabel} · today</Text>

      <View style={styles.scoreBlock}>
        <Text style={[styles.score, { color: scoreColor }]}>{score}</Text>
        <Text style={styles.scoreCaption}>Phone Health Score</Text>
        <Text style={styles.scoreLabel}>{label} · lower is better</Text>
      </View>

      <View style={styles.metrics}>
        <Metric
          label="Screen time"
          value={`${DEMO_TODAY_METRICS.screenTimeMinutes} min`}
        />
        <Metric label="Pickups" value={`${DEMO_TODAY_METRICS.pickups}`} />
      </View>
      <Text style={styles.demoNote}>
        Demo metrics until UsageStats / FamilyControls bridges ship.
      </Text>

      <View style={styles.tipCard}>
        <Text style={styles.tipEyebrow}>Today’s tip</Text>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipBody}>{tip.body}</Text>
        <Text style={styles.tipWhy}>{tip.why}</Text>
      </View>

      {!isPaid ? (
        <PrimaryButton
          label="Unlock trends & more tips"
          onPress={() => navigation.navigate('Paywall')}
          style={{ marginTop: 20 }}
        />
      ) : (
        <Text style={styles.paidNote}>
          Paid unlocks: trends, history, multiple tips, expert-team advice.
        </Text>
      )}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40 },
  brand: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  plan: {
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  scoreBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  score: {
    fontSize: 72,
    fontWeight: '800',
    lineHeight: 80,
  },
  scoreCaption: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  scoreLabel: {
    color: colors.textMuted,
    marginTop: 4,
  },
  metrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  metricLabel: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 13,
  },
  demoNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipEyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tipTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipBody: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  tipWhy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  paidNote: {
    color: colors.textMuted,
    marginTop: 20,
    fontSize: 14,
  },
});
