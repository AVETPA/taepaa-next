'use client';

import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarDivider,
  NavbarSpacer,
} from '@/components/navbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { InboxIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { adminEmails } from '@/config/admin';

export default function Header() {
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [viewedUserName, setViewedUserName] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const isAdminUser = user && adminEmails.includes(user.email);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user;

      if (currentUser) {
        setUser(currentUser);

        // Fetch avatar from 'users' table
        const { data: profile } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', currentUser.id)
          .single();

        const avatarPath = profile?.avatar_url;
        if (avatarPath) {
          const { data: image } = supabase.storage
            .from('avatars')
            .getPublicUrl(avatarPath);
          setAvatarUrl(image?.publicUrl || null);
        }
      }

      // Admin mode detection
      const segments = pathname.split('/');
      if (segments.includes('trainerprofile')) {
        const uid = segments[segments.indexOf('trainerprofile') + 1];
        setUserId(uid);
        setIsAdminMode(true);

        const { data: viewedUser } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', uid)
          .single();

        setViewedUserName(viewedUser?.name || viewedUser?.email || '(unknown user)');
      }
    };

    fetchData();
  }, [pathname, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {isAdminUser && (
        <div className="bg-teal-100 border-l-4 border-teal-500 text-teal-800 px-4 py-2 text-sm flex justify-between items-center">
          <span>
            <strong>Welcome Admin:</strong> You have elevated access.
          </span>
          <Link href="/admindashboard" className="text-blue-700 hover:underline text-sm">
            🛠 Access Admin Dashboard
          </Link>
        </div>
      )}

      {isAdminMode && (
        <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 px-4 py-2 text-sm flex justify-between items-center">
          <span>
            <strong>Admin Mode:</strong> Viewing profile for{' '}
            <strong className="text-teal-700">{viewedUserName}</strong>{' '}
            <code className="bg-yellow-50 px-1 py-0.5 rounded text-xs">{userId}</code>
          </span>
          <Link href="/admin/userlist" className="text-blue-700 hover:underline text-sm">
            ⬅ Return to Admin
          </Link>
        </div>
      )}

      <Navbar>
        <NavbarItem href="/">
          <img src="/img/logo.png" alt="TAEPAA" className="h-10 w-auto" />
        </NavbarItem>

        <NavbarDivider className="max-lg:hidden" />

        <NavbarSection className="max-lg:hidden">
          <NavbarItem href="/" current={pathname === '/'}>
            Home
          </NavbarItem>
          <NavbarItem href="/resources" current={pathname === '/resources'}>
            Resources
          </NavbarItem>
          <NavbarItem href="/membership" current={pathname === '/membership'}>
            Join TAEPAA
          </NavbarItem>
        </NavbarSection>

        <NavbarSpacer />

        <NavbarSection>
          {user && (
            <>
              <NavbarItem href="/search" aria-label="Search">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </NavbarItem>
              <NavbarItem href="/inbox" aria-label="Inbox">
                <InboxIcon className="h-5 w-5" />
              </NavbarItem>

              {/* Avatar Dropdown */}
              <div className="relative group">
                <img
                  src={avatarUrl || '/img/user-avatar.png'}
                  alt="User"
                  className="h-10 w-10 rounded-full border-2 border-teal-600 object-cover cursor-pointer"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block z-50 text-sm">
                  <Link href="/myaccount" className="block px-4 py-2 hover:bg-gray-100">
                    My Account
                  </Link>
                  <Link href="/mysubscription" className="block px-4 py-2 hover:bg-gray-100">
                    My Subscription
                  </Link>
                  <hr />
                  <Link href="/trainerprofile" className="block px-4 py-2 hover:bg-gray-100">
                    Trainer Profile
                  </Link>
                  <Link href="/events" className="block px-4 py-2 hover:bg-gray-100">
                    My Events
                  </Link>
                  <hr />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}

          {!user && (
            <NavbarItem
              href="/login"
              className="ml-2 bg-white text-[#008080] px-4 py-1 rounded hover:bg-gray-100"
            >
              Login
            </NavbarItem>
          )}
        </NavbarSection>
      </Navbar>
    </>
  );
}
