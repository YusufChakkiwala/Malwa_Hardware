import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/chats', label: 'Chats' },
  { to: '/admin/queries', label: 'Queries' },
  { to: '/admin/faqs', label: 'FAQs' }
];

function AdminNav() {
  return (
    <aside className="surface-panel h-fit p-4">
      <h3 className="mb-3 font-heading text-2xl text-slate-900">Admin Panel</h3>
      <nav className="space-y-2 text-sm">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2 font-semibold ${
                isActive
                  ? 'border border-orange-200 bg-orange-50 text-orange-700'
                  : 'border border-transparent text-slate-700 hover:border-cyan-200 hover:bg-cyan-50'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AdminNav;
