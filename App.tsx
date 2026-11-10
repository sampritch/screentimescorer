import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { BiometricProvider } from './src/context/BiometricContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <BiometricProvider>
            <SubscriptionProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </SubscriptionProvider>
          </BiometricProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
