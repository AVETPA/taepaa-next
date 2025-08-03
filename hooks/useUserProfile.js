import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Ignore "No rows" error if you're okay with empty state
        throw profileError;
      }

      if (data) {
        setProfile(data);
      } else {
        // If no profile exists, you can auto-create it (optional)
        const nameParts = user.user_metadata?.full_name?.split(" ") || [];
        const newProfile = {
          uid: user.id,
          email: user.email,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert(newProfile);

        if (insertError) throw insertError;

        setProfile(newProfile);
      }
    } catch (err) {
      console.error("🔴 Supabase profile error:", err);
      setError(err.message || "Error loading user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { authUser, profile, loading, error, refreshProfile: fetchProfile };
};

export default useUserProfile;
