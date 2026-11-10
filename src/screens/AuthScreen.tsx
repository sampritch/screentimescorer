import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const { signIn, signUp, configured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const action = mode === 'signin' ? signIn : signUp;
    const result = await action(email.trim(), password);
    setLoading(false);
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
    marginBottom: 28,
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
