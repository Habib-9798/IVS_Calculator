import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Get the currently logged-in user's profile from the profiles table
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

// Sign in with email + password
export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

// Sign out
export async function signOut() {
  return await supabase.auth.signOut();
}
