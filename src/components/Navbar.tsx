import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-natural-300 sticky top-0 md:static z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAdmin ? "/admin" : "/"} className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-natural-100 shadow-sm">
                <img src="/logo.png" alt="ASN studio Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <Package className="h-6 w-6 text-moss-500 hidden" />
              </div>
              <span className="font-serif font-regular text-2xl text-natural-900 tracking-tight">ASN studio</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link to="/admin" className="text-natural-400 hover:text-moss-500 font-medium text-sm flex items-center space-x-1">
                <LayoutDashboard className="h-5 w-5" />
                <span className="hidden sm:inline">Admin Paneli</span>
              </Link>
            )}
            
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-natural-400 hover:text-moss-500 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-terracotta-500 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-1 border-l border-natural-200 pl-4 ml-2">
                {!isAdmin && (
                  <Link to="/my-orders" className="text-xs sm:text-sm font-medium text-natural-600 hover:text-moss-600 mr-2 sm:mr-3">
                    Siparişlerim
                  </Link>
                )}
                <div className="flex px-3 py-1.5 bg-natural-100 rounded-full border border-natural-200">
                  <span className="text-xs font-semibold text-natural-600 mr-3 truncate max-w-[100px] hidden sm:block">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <button onClick={handleLogout} className="text-natural-400 hover:text-terracotta-500 transition-colors" title="Çıkış Yap">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-white bg-moss-500 hover:bg-moss-600 px-4 py-2 rounded-xl flex items-center space-x-1 shadow-sm transition-colors">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Giriş Yap</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
