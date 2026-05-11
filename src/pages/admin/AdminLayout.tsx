import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ListTree, ShoppingCart, LogOut } from 'lucide-react';
import { logout } from '../../lib/firebase';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-500"></div></div>;

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', end: true, icon: LayoutDashboard },
    { name: 'Siparişler', path: '/admin/orders', end: false, icon: ShoppingCart },
    { name: 'Ürünler', path: '/admin/products', end: false, icon: Package },
    { name: 'Kategoriler', path: '/admin/categories', end: false, icon: ListTree },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-natural-300 p-4 sticky top-24">
          <h2 className="text-xs font-black text-natural-400 uppercase tracking-wider mb-4 px-3">Admin Paneli</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-natural-200 text-moss-600 border border-natural-300'
                      : 'text-natural-900 hover:bg-natural-100'
                  }`
                }
              >
                <item.icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
