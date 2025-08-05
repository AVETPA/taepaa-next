"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaCog,
  FaUserCircle,
  FaChartBar
} from 'react-icons/fa';
import AdminAddEvent from "@/components/admin/AdminAddEvent";
import useAuth from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [showAddEvent, setShowAddEvent] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-40 bg-[#1f2937] text-white flex flex-col">
        <div className="px-6 py-4 text-lg font-bold border-b border-gray-700">AVETPA Admin</div>

        <nav className="flex-1 overflow-y-auto">
          <Section title="Main">
            <NavItem icon={<FaChartBar />} href="/admin" label="Dashboard" />
          </Section>

          <Section title="Directories">
            <NavItem icon={<FaUsers />} href="/admin/userlist" label="Users" />
            <NavItem icon={<FaCalendarAlt />} href="/admin/pdcalendar" label="PD Calendar" />
            <NavItem icon={<FaCalendarAlt />} label="Add Event" onClick={() => setShowAddEvent(true)} />
            <NavItem icon={<FaFileAlt />} href="/admin/uploads" label="Uploads" />
          </Section>

          <Section title="System">
            <NavItem icon={<FaCog />} href="/admin/settings" label="Settings" />
          </Section>
        </nav>

        <div className="p-4 border-t border-gray-700 flex items-center gap-3">
          <FaUserCircle className="text-2xl" />
          <div>
            <p className="text-sm">{user?.user_metadata?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-400">{user?.email || 'avetpaassociation@gmail.com'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>

      {/* Modal Popup */}
      {showAddEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddEvent(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddEvent(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <AdminAddEvent />
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, href, label, onClick }: {
  icon: React.ReactNode;
  href?: string;
  label: string;
  onClick?: () => void;
}) {
  const baseClasses = 'flex items-center gap-3 px-6 py-3 text-sm hover:bg-gray-700';

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClasses} text-gray-300 w-full text-left`}>
        {icon}
        {label}
      </button>
    );
  }

  return (
    <Link
      href={href || '#'}
      className={baseClasses + ' text-gray-300 block'}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="px-6 mb-2 text-xs uppercase tracking-wide text-gray-400">{title}</p>
      {children}
    </div>
  );
}
