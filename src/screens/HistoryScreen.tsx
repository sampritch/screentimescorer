import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaidGate } from '../components/PaidGate';
import { colors } from '../theme/colors';

const DEMO_HISTORY = [
  { day: 'Mon', score: 48, screen: '3h 12m', pickups: 44 },
  { day: 'Tue', score: 41, screen: '2h 50m', pickups: 38 },
  { day: 'Wed', score: 55, screen: '4h 05m', pickups: 61 },
  { day: 'Thu', score: 37, screen: '2h 20m', pickups: 33 },
  { day: 'Fri', score: 62, screen: '4h 40m', pickups: 70 },
  { day: 'Sat', score: 58, screen: '4h 10m', pickups: 65 },
  { day: 'Sun', score: 44, screen: '3h 00m', pickups: 49 },
];

export function HistoryScreen() {
  return (
    <PaidGate featureName="History & trends">
      <View style={styles.root}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.sub}>
          Multi-day scores, screen time, and pickups (paid stub).
        </Text>
        {DEMO_HISTORY.map((row) => (
          <View key={row.day} style={styles.row}>
            <Text style={styles.day}>{row.day}</Text>
            <Text style={styles.cell}>Score {row.score}</Text>
            <Text style={styles.cell}>{row.screen}</Text>
            <Text style={styles.cell}>{row.pickups} pickups</Text>
          </View>
        ))}
        <Text style={styles.note}>
          Charts + RevenueCat entitlement sync land in a later slice.
        </Text>
      </View>
    </PaidGate>
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
    marginBottom: 6,
  },
  sub: {
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  day: {
    width: 40,
    color: colors.accent,
    fontWeight: '700',
  },
  cell: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  note: {
    color: colors.textMuted,
    marginTop: 20,
    fontSize: 13,
  },
});
