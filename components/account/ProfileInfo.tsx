import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import useUserProfile from "../../hooks/useUserProfile";

export default function ProfileInfo() {
  const { profile, loading, error, refreshProfile } = useUserProfile();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ✅ This goes here:
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log("🟡 Authenticated user:", user);
      if (error) console.error("🔴 Error getting user:", error);
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({ ...profile });
      setAvatarPreview(profile.photoURL || "");
    } else {
      setForm({
        first_name: "",
        last_name: "",
        address: "",
        suburb: "",
        state: "",
        postcode: "",
        phone: "",
        mobile_number: "",
        photoURL: "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data.user;
      if (!user) throw new Error("User not found.");

      const updateData = {
        ...form,
        uid: user.id,
        email: user.email,
        name: `${form.first_name || ""} ${form.last_name || ""}`.trim(),
      };

      // Upload avatar
      if (avatarFile) {
        const filePath = `avatars/${user.id}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        updateData.photoURL = urlData.publicUrl;
        setAvatarPreview(urlData.publicUrl);
      }

      // Check if user profile exists by uid
      const { data: existingProfile, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("uid", user.id)
        .single();

      let dbError;
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from("users")
          .update(updateData)
          .eq("uid", user.id);
        dbError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("users")
          .insert(updateData);
        dbError = insertError;
      }

      if (dbError) throw dbError;

      if (newPassword) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (pwError) throw pwError;
      }

      setSaved(true);
      refreshProfile?.();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile:", err.message || err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!form) return <p>No profile found.</p>;

  return (
    <div className="max-w-4xl ml-8">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={avatarPreview || "/img/default-avatar.png"}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>

      {[
        "first_name",
        "last_name",
        "address",
        "suburb",
        "state",
        "postcode",
        "phone",
        "mobile_number",
      ].map((field) => (
        <div key={field} className="mb-4">
          <label className="block text-sm font-medium mb-1 capitalize">
            {field.replace("_", " ")}
          </label>
          <input
            type="text"
            name={field}
            value={form[field] || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      ))}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Leave blank to keep current password"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-500"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {saved && <p className="mt-3 text-green-600">Profile updated ✅</p>}
    </div>
  );
}