import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, Package, LayoutDashboard, Menu as MenuIcon, X, CheckSquare, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const NavLink = ({ to, icon: Icon, children }: { to: string, icon: any, children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setIsMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
          isActive ? 'bg-moss-50 text-moss-600 font-semibold border border-moss-100' : 'text-natural-600 hover:bg-natural-50 hover:text-natural-900 border border-transparent'
        }`}
      >
        <Icon className={`h-5 w-5 ${isActive ? 'text-moss-500' : 'text-natural-400'}`} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-natural-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -ml-2 mr-2 text-natural-500 hover:bg-natural-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-moss-500"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              
              <Link to={isAdmin ? "/admin" : "/"} className="flex flex-col ml-2">
                 <span className="font-serif font-black text-xl leading-none text-natural-900 tracking-tight">ASN</span>
                 <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-moss-500 font-bold ml-0.5">Studio</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isAdmin && (
                <Link to="/cart" className="relative p-2 text-natural-500 hover:bg-natural-100 rounded-lg transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-5 px-1.5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-terracotta-500 border-2 border-white rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              
              {user ? (
                <div className="hidden sm:flex px-3 py-1.5 bg-natural-50 rounded-full border border-natural-200 divide-x divide-natural-200">
                  <div className="px-2">
                    <span className="text-xs font-semibold text-natural-600 truncate max-w-[120px] block">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="px-2 text-natural-400 hover:text-terracotta-500 transition-colors" title="Çıkış Yap">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-xs font-bold text-white bg-moss-600 hover:bg-moss-700 px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors cursor-pointer border border-moss-700">
                  <span className="hidden sm:inline mr-2">Giriş Yap</span>
                  <LogIn className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-natural-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative flex w-full max-w-xs flex-col bg-white shadow-2xl h-full slide-right">
            <div className="flex items-center justify-between p-4 border-b border-natural-200">
              <div className="flex flex-col">
                 <span className="font-serif font-black text-xl leading-none text-natural-900 tracking-tight">ASN</span>
                 <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-moss-500 font-bold ml-0.5">Menu</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-natural-400 hover:bg-natural-100 rounded-lg transition-colors focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
               <NavLink to="/" icon={Package}>Ürünler</NavLink>
               <NavLink to="/accessories" icon={ShoppingCart}>Ek Aksesuarlar</NavLink>
               
               {user && !isAdmin && (
                  <NavLink to="/my-orders" icon={CheckSquare}>Siparişlerim</NavLink>
               )}
               
               {user && isAdmin && (
                 <>
                   <div className="my-4 border-t border-natural-200 pt-4"></div>
                   <NavLink to="/admin" icon={Settings}>Admin Paneli</NavLink>
                 </>
               )}
            </div>
            
            {user && (
               <div className="p-4 border-t border-natural-200 bg-natural-50">
                 <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-xs font-medium text-natural-500">Giriş yapıldı</span>
                     <span className="text-sm font-bold text-natural-900 truncate w-40">{user.email?.split('@')[0]}</span>
                   </div>
                   <button 
                     onClick={handleLogout} 
                     className="p-2 text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition-colors border border-transparent hover:border-terracotta-200" title="Çıkış Yap"
                   >
                     <LogOut className="h-5 w-5" />
                   </button>
                 </div>
               </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
