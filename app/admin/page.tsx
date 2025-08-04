"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import useAuth from "@/hooks/useAuth";
import AdminLayout from "@/components/layout/AdminLayout";

interface SupabaseUser {
  id: string;
  email?: string; // ✅ allow undefined
  name?: string;
  is_admin?: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading }: { user: SupabaseUser | null; loading: boolean } = useAuth();

  const [members, setMembers] = useState<SupabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error || !profile?.is_admin) {
        router.push("/dashboard");
        return;
      }

      const { data: membersData, error: membersError } = await supabase
        .from("users")
        .select("*");

      if (membersError) {
        console.error("Error loading users:", membersError.message);
      } else {
        setMembers(membersData as SupabaseUser[]);
      }

      setCheckingAdmin(false);
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [user, authLoading, router]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="text-center mt-20 text-lg text-teal-600">
        Verifying admin access...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-20 text-lg text-teal-600">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-[#044b4f] mb-6">✅ Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card title="Total Users" value={members.length} />
          <Card title="Completed Profiles" value="—" />
          <Card title="PD Activities" value="—" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AdminLink title="User Management" href="/admin/userlist" />
          <AdminLink title="Trainer Profiles" href="/admin/trainers" />
          <AdminLink title="PD Calendar" href="/admin/pdcalendar" />
          <AdminLink title="PD Events" href="/admin/pdmanagerdetail" />
          <AdminLink title="Memberships" href="/admin/members" />
          <AdminLink title="Subscriptions" href="/admin/subscriptions" />
        </div>
      </div>
    </AdminLayout>
  );
}

const Card = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-white p-6 rounded-xl shadow text-center">
    <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
    <p className="text-4xl font-bold text-[#007a7c] mt-2">{value}</p>
  </div>
);

const AdminLink = ({ title, href }: { title: string; href: string }) => (
  <Link
    href={href}
    className="block bg-white border border-teal-300 p-5 text-center rounded-lg shadow hover:bg-teal-50 transition"
  >
    <h3 className="text-xl font-semibold text-[#044b4f]">{title}</h3>
  </Link>
);
