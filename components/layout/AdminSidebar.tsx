import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/admindashboard' },
  { label: 'Users', to: '/admin/userlist' },
  { label: 'PD Calendar', to: '/admin/pdcalendar' },
  { label: 'PD Manager', to: '/admin/pdmanagerdetail' },
  { label: 'Uploads', to: '/admin/uploads' },
  { label: 'Memberships', to: '/admin/members' },
  { label: 'Subscriptions', to: '/admin/subscriptions' },
];

export default function AdminSidebar() {
  return (
    <aside className="w-46 bg-[#909191] text-white flex flex-col">
      <div className="px-6 py-4 text-xl font-bold">Admin Panel</div>
      <nav className="flex-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-6 py-3 hover:bg-teal-600 ${
                isActive ? 'bg-teal-800' : ''
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
