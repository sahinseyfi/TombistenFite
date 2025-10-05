'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

const THEME_STORAGE_KEY = 'tombistenfite-theme';
const THEMES = ['light', 'dark'] as const;

export type ThemePreference = (typeof THEMES)[number];

type ThemeContextValue = {
  theme: ThemePreference;
  updateTheme: (next: ThemePreference) => Promise<void>;
  loading: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEMES.includes(value as ThemePreference);
}

function readStoredTheme(): ThemePreference | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : null;
}

function readSystemTheme(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>('light');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const themeRef = useRef<ThemePreference>('light');

  const applyTheme = useCallback((next: ThemePreference) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    }
  }, []);

  useEffect(() => {
    themeRef.current = theme;
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const stored = readStoredTheme();
      const fallback = stored ?? readSystemTheme();
      if (active) {
        setTheme(fallback);
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      const session = data.session;
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', uid)
          .maybeSingle();
        if (!active) return;
        if (!error && isTheme(profile?.theme_preference)) {
          setTheme(profile.theme_preference);
        }
      }

      setLoading(false);
    }

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', uid)
          .maybeSingle();
        if (!active) return;
        if (!error && isTheme(profile?.theme_preference)) {
          setTheme(profile.theme_preference);
          return;
        }
      }

      const fallback = readStoredTheme() ?? readSystemTheme();
      setTheme(fallback);
    });

    return () => {
      active = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const updateTheme = useCallback(
    async (next: ThemePreference) => {
      const previous = themeRef.current;
      if (next === previous) return;
      setTheme(next);
      if (!userId) {
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            theme_preference: next,
          },
          { onConflict: 'id' },
        );
      if (error) {
        setTheme(previous);
        applyTheme(previous);
        throw new Error('Tema tercihi kaydedilemedi.');
      }
    },
    [applyTheme, userId],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      updateTheme,
      loading,
    }),
    [theme, updateTheme, loading],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used within ThemeProvider');
  }
  return ctx;
}
