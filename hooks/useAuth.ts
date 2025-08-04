import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: string;
  created_at: string;
}

export default function useAuth(): {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  uid: string | null;
  isLoggedIn: boolean;
} {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      let {
        data: { session },
        error,
      } = await supabase.auth.getSession();

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

  const loadProfile = async (user: User) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      const fallbackProfile: UserProfile = {
  id: user.id,
  email: user.email ?? "", // ✅ FIXED HERE
  name: user.user_metadata?.full_name ?? "",
  avatar_url: user.user_metadata?.avatar_url ?? "/img/default-avatar.png",
  role: "member",
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
    isLoggedIn: !!user?.id,
  };
}
