'use client';

import clsx from 'clsx';
import Link from 'next/link';

export const Navbar = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <nav className={clsx('w-full bg-white border-b border-gray-200 px-4 py-2 flex items-center', className)}>
    {children}
  </nav>
);

export const NavbarSpacer = () => <div className="flex-1" />;

export const NavbarSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('flex items-center gap-4', className)}>{children}</div>
);

export const NavbarItem = ({
  href,
  children,
  current = false,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  [key: string]: any;
}) => (
  <Link
    href={href}
    className={clsx(
      'text-sm font-medium px-3 py-2 rounded hover:bg-teal-50 transition',
      current ? 'text-teal-600' : 'text-gray-700'
    )}
    {...props}
  >
    {children}
  </Link>
);

export const NavbarLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-2 text-sm font-semibold">{children}</span>
);

export const NavbarDivider = ({ className = '' }: { className?: string }) => (
  <div className={clsx('h-6 border-l border-gray-300 mx-3', className)} />
);
