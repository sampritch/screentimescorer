import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useSubscription } from '../context/SubscriptionContext';
import { DEMO_TIPS, expertTips, freeTip, paidTips } from '../lib/score';
import type { RootStackParamList } from '../navigation/types';

export function TipsScreen() {
  const { isPaid } = useSubscription();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const single = freeTip(DEMO_TIPS);
  const many = paidTips(DEMO_TIPS);
  const experts = expertTips(DEMO_TIPS);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tips</Text>
      <Text style={styles.sub}>
        Free: one tip. Paid: multiple tips + advice from our expert team.
      </Text>

      {!isPaid ? (
        <>
          <TipBlock tip={single} />
          <PrimaryButton
            label="Unlock more tips"
            onPress={() => navigation.navigate('Paywall')}
            style={{ marginTop: 16 }}
          />
        </>
      ) : (
        <>
          <Text style={styles.section}>Your tips</Text>
          {many.map((tip) => (
            <TipBlock key={tip.id} tip={tip} />
          ))}
          <Text style={styles.section}>Expert team</Text>
          {experts.map((tip) => (
            <TipBlock key={tip.id} tip={tip} badge="Expert" />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function TipBlock({
  tip,
  badge,
}: {
  tip: { title: string; body: string; why: string };
  badge?: string;
}) {
  return (
    <View style={styles.card}>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      <Text style={styles.cardTitle}>{tip.title}</Text>
      <Text style={styles.cardBody}>{tip.body}</Text>
      <Text style={styles.cardWhy}>{tip.why}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40 },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  sub: {
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 22,
  },
  section: {
    color: colors.accent,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  badge: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBody: {
    color: colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  cardWhy: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
