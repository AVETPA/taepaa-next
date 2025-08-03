import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/auth-helpers-nextjs";

interface UserProfile {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at?: string;
  [key: string]: any;
}

const useUserProfile = (): {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
} => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setAuthUser(null);
        setProfile(null);
        return;
      }

      setAuthUser(user);

      const { data, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("uid", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      if (data) {
        setProfile(data);
      } else {
        const nameParts = user.user_metadata?.full_name?.split(" ") || [];
        const newProfile: UserProfile = {
          uid: user.id,
          email: user.email ?? "",
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from("users").insert(newProfile);
        if (insertError) throw insertError;

        setProfile(newProfile);
      }
    } catch (err: any) {
      console.error("🔴 Supabase profile error:", err);
      setError(err.message || "Error loading user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { user: authUser, profile, loading, error, refreshProfile: fetchProfile };
};

export default useUserProfile;
