import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  getTodayUsage,
  isAuthorized,
  requestPermission,
  type TodayUsage,
} from '../lib/deviceUsage';
import {
  loadDeviceLink,
  saveDeviceLink,
  type DeviceLinkState,
} from '../lib/deviceLinkStorage';

export function LinkDeviceScreen() {
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<DeviceLinkState | null>(null);
  const [usage, setUsage] = useState<TodayUsage | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await loadDeviceLink();
      setLink(stored);
      if (Platform.OS === 'ios') {
        const ok = await isAuthorized();
        setAuthorized(ok);
        if (ok) {
          const today = await getTodayUsage();
          setUsage(today);
          if (!stored.linked) {
            const next = await saveDeviceLink({
              linked: true,
              platform: 'ios',
              linkedAt: stored.linkedAt ?? new Date().toISOString(),
              lastStatus: 'approved',
            });
            setLink(next);
          }
        }
      } else {
        setAuthorized(false);
        setUsage(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onLinkApple = async () => {
    setBusy(true);
    try {
      const result = await requestPermission();
      if (result.status === 'approved') {
        const today = await getTodayUsage();
        setUsage(today);
        setAuthorized(true);
        const next = await saveDeviceLink({
          linked: true,
          platform: 'ios',
          linkedAt: new Date().toISOString(),
          lastStatus: result.status,
        });
        setLink(next);
        Alert.alert(
          'Device linked',
          'Screen Time access is authorized. Daily aggregates fill in after the DeviceActivity monitor runs on this device.'
        );
      } else {
        await saveDeviceLink({
          linked: false,
          platform: 'ios',
          lastStatus: result.status,
        });
        Alert.alert(
          'Not authorized',
          result.message ??
            `FamilyControls status: ${result.status}. Use a real device with the approved entitlement.`
        );
        await refresh();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Link failed', message);
    } finally {
      setBusy(false);
    }
  };

  const onLinkAndroid = () => {
    Alert.alert(
      'Android coming soon',
      'UsageStats device linking is not implemented yet. iOS FamilyControls is available now; Android lands in a later slice.'
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Link this device</Text>
      <Text style={styles.body}>
        Screen Time Scorer reads daily screen time (and pickups when the OS
        exposes them) on this phone only — not other people’s devices.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Platform</Text>
        <Text style={styles.cardValue}>
          {Platform.OS === 'ios'
            ? 'Apple (FamilyControls)'
            : Platform.OS === 'android'
              ? 'Android (UsageStats — stub)'
              : Platform.OS}
        </Text>
        <Text style={[styles.cardLabel, { marginTop: 12 }]}>Status</Text>
        <Text style={styles.cardValue}>
          {Platform.OS === 'ios'
            ? authorized || link?.linked
              ? 'Linked / authorized'
              : 'Not linked'
            : Platform.OS === 'android'
              ? 'Not implemented'
              : 'Unavailable'}
        </Text>
        {link?.linkedAt ? (
          <Text style={styles.meta}>
            Linked at {new Date(link.linkedAt).toLocaleString()}
          </Text>
        ) : null}
      </View>

      {Platform.OS === 'ios' ? (
        <>
          <PrimaryButton
            label={
              authorized || link?.linked
                ? 'Re-check Screen Time access'
                : 'Link with Apple Screen Time'
            }
            onPress={onLinkApple}
            loading={busy}
          />
          <Text style={styles.hint}>
            Requires a physical iPhone/iPad, development build (not Expo Go),
            and Family Controls enabled on App ID
            com.sampritchard.screentimescorer. Simulator cannot authorize.
          </Text>
          {usage ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Today ({usage.date})</Text>
              <Text style={styles.cardValue}>
                Screen time: {usage.screenTimeMinutes} min
              </Text>
              <Text style={styles.cardValue}>
                Pickups:{' '}
                {usage.pickups === null ? 'not available yet' : usage.pickups}
              </Text>
              <Text style={styles.meta}>
                Source: {usage.source}
                {usage.authorized ? ' · authorized' : ''}
              </Text>
            </View>
          ) : null}
        </>
      ) : Platform.OS === 'android' ? (
        <>
          <PrimaryButton
            label="Link with Android UsageStats"
            variant="secondary"
            onPress={onLinkAndroid}
          />
          <Text style={styles.hint}>
            Android path is stubbed and returns “not implemented”. PACKAGE_USAGE_STATS
            will land in a later engineering slice.
          </Text>
        </>
      ) : (
        <Text style={styles.hint}>
          Device linking is only available in the iOS or Android app.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardValue: {
    color: colors.text,
    fontSize: 16,
    marginTop: 4,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 16,
  },
});
