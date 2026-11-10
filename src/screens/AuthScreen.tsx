import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const {
    signIn,
    signUp,
    signInWithApple,
    signInWithGoogle,
    configured,
    appleAvailable,
  } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialBusy, setSocialBusy] = useState<'apple' | 'google' | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const action = mode === 'signin' ? signIn : signUp;
    const result = await action(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  const onGoogle = async () => {
    setError(null);
    setSocialBusy('google');
    const result = await signInWithGoogle();
    setSocialBusy(null);
    if (result.error) setError(result.error);
  };

  const onApple = async () => {
    setError(null);
    setSocialBusy('apple');
    const result = await signInWithApple();
    setSocialBusy(null);
    if (result.error) setError(result.error);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <Text style={styles.brand}>Screen Time Scorer</Text>
        <Text style={styles.tagline}>
          Turn pickups and screen time into a Phone Health Score — then tip yourself toward better habits.
        </Text>
      </View>

      {!configured ? (
        <Text style={styles.warn}>
          Supabase env vars missing. Copy `.env.example` → `.env` before signing up.
        </Text>
      ) : null}

      <View style={styles.social}>
        {appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={styles.appleBtn}
            onPress={onApple}
          />
        ) : null}
        <PrimaryButton
          label="Continue with Google"
          variant="secondary"
          onPress={onGoogle}
          loading={socialBusy === 'google'}
          disabled={socialBusy === 'apple' || loading}
          style={{ marginTop: appleAvailable ? 10 : 0 }}
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or email</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={mode === 'signin' ? 'Log in' : 'Sign up'}
          onPress={onSubmit}
          loading={loading}
          disabled={socialBusy !== null}
          style={{ marginTop: 12 }}
        />
        <PrimaryButton
          label={
            mode === 'signin'
              ? 'Need an account? Sign up'
              : 'Have an account? Log in'
          }
          variant="secondary"
          onPress={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
          }}
          style={{ marginTop: 10 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    justifyContent: 'center',
  },
  hero: {
    marginBottom: 24,
  },
  brand: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  warn: {
    color: colors.warning,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  social: {
    marginBottom: 8,
  },
  appleBtn: {
    width: '100%',
    height: 48,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  form: {
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: colors.danger,
    marginTop: 8,
    fontSize: 14,
  },
});
