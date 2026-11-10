import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/AuthScreen';
import { BiometricLockScreen } from '../screens/BiometricLockScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { LinkDeviceScreen } from '../screens/LinkDeviceScreen';
import { MainTabs } from './MainTabs';
import { useAuth } from '../context/AuthContext';
import { useBiometric } from '../context/BiometricContext';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export function RootNavigator() {
  const { session, loading } = useAuth();
  const { locked, ready: biometricReady } = useBiometric();

  if (loading || (session && !biometricReady)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (session && locked) {
    return <BiometricLockScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        {session ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ title: 'Upgrade', presentation: 'modal' }}
            />
            <Stack.Screen
              name="LinkDevice"
              component={LinkDeviceScreen}
              options={{ title: 'Link device' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
