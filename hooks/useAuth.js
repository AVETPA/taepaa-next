// src/hooks/useAuth.js (Supabase-only version)
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      let { data: { session }, error } = await supabase.auth.getSession();

      // Retry once if session is null (needed after OAuth redirect)
      if (!session) {
        await new Promise((res) => setTimeout(res, 500));
        session = (await supabase.auth.getSession()).data.session;
      }

      if (error) {
        console.error('❌ Session fetch error:', error.message);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    getCurrentUser();

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const loadProfile = async (user) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      const fallbackProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '/img/default-avatar.png',
        role: 'member',
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from('users').insert(fallbackProfile);
      if (insertError) {
        console.error('❌ Failed to create user profile:', insertError.message);
      } else {
        console.log('✅ Created new user profile');
        setProfile(fallbackProfile);
      }
    } else if (data) {
      setProfile(data);
    } else if (error) {
      console.error('❌ Profile fetch error:', error.message);
    }
  };

  return {
    user,
    profile,
    loading,
    uid: user?.id || null,
    isLoggedIn: !!user?.id
  };
}
