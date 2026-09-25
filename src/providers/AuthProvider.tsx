import type { Session, User } from '@supabase/supabase-js';
import { createContext, type PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (next: Session | null) => {
    if (next) setLoading(true);
    const nextProfile = next ? await fetchProfile(next.user.id) : null;
    setProfile(nextProfile);
    setSession(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
      // Diferido para no bloquear el callback de auth de Supabase con otra consulta
      setTimeout(() => applySession(newSession), 0);
    });

    return () => subscription.subscription.unsubscribe();
  }, [applySession]);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? 'Correo o contraseña incorrectos.' : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const active = profile?.active ? profile : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile: active,
        isAdmin: active?.role === 'encargado',
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
