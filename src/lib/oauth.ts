import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { isSupabaseConfigured, supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const notConfigured =
  'Supabase is not configured. Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.';

/** Deep-link back into the app after OAuth (scheme from app.json). */
export function getAuthRedirectUri() {
  return makeRedirectUri({
    scheme: 'screentimescorer',
    path: 'auth/callback',
  });
}

function getQueryParams(url: string): {
  errorCode: string | null;
  params: Record<string, string>;
} {
  const parsed = new URL(url);
  const raw =
    parsed.hash?.startsWith('#') && parsed.hash.length > 1
      ? parsed.hash.slice(1)
      : parsed.search?.startsWith('?')
        ? parsed.search.slice(1)
        : parsed.search ?? '';
  const params: Record<string, string> = {};
  for (const part of raw.split('&')) {
    if (!part) continue;
    const [k, ...rest] = part.split('=');
    if (!k) continue;
    params[decodeURIComponent(k)] = decodeURIComponent(rest.join('=') || '');
  }
  const errorCode = params.error_description || params.error || null;
  return { errorCode, params };
}

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token, code } = params;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  if (!access_token) {
    throw new Error('OAuth callback missing access_token and code.');
  }

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });
  if (error) throw error;
}

/**
 * Google via Supabase OAuth + expo-auth-session / expo-web-browser.
 * Works on iOS and Android (dev client / production builds).
 */
export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: notConfigured };

  try {
    const redirectTo = getAuthRedirectUri();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) return { error: error.message };
    if (!data.url) return { error: 'No OAuth URL returned from Supabase.' };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') {
      return { error: result.type === 'cancel' ? null : 'Google sign-in was dismissed.' };
    }

    await createSessionFromUrl(result.url);
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Google sign-in failed.';
    return { error: message };
  }
}

/**
 * Native Sign in with Apple (iOS). Uses expo-apple-authentication +
 * supabase.auth.signInWithIdToken. Not shown on Android.
 */
export async function signInWithAppleNative(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: notConfigured };
  if (Platform.OS !== 'ios') {
    return { error: 'Sign in with Apple is available on iOS only.' };
  }

  try {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      return { error: 'Sign in with Apple is not available on this device.' };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { error: 'Apple did not return an identity token.' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) return { error: error.message };

    // Apple only sends the name on first authorization — stash if present.
    if (credential.fullName) {
      const parts = [
        credential.fullName.givenName,
        credential.fullName.middleName,
        credential.fullName.familyName,
      ].filter(Boolean);
      if (parts.length) {
        await supabase.auth.updateUser({
          data: {
            full_name: parts.join(' '),
            given_name: credential.fullName.givenName,
            family_name: credential.fullName.familyName,
          },
        });
      }
    }

    return { error: null };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err?.code === 'ERR_REQUEST_CANCELED') return { error: null };
    return { error: err?.message ?? 'Apple sign-in failed.' };
  }
}

export async function isAppleAuthAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}
