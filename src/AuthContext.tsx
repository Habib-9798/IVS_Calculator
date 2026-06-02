import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { UserProfile } from './types';

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  logout: async () => {},
});

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Failed to load profile:', error);
    return null;
  }

  return data as UserProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!mounted) return;

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userProfile = await fetchProfile(user.id);

      if (!mounted) return;

      setProfile(userProfile);
      setLoading(false);
    }

    loadCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user;

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);

        fetchProfile(user.id).then((userProfile) => {
          if (!mounted) return;

          setProfile(userProfile);
          setLoading(false);
        });
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setProfile(null);
    setLoading(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
