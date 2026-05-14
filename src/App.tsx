import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';

import Accessories from './pages/Accessories';
import AdminDashboard from './pages/admin/Dashboard';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-natural-100 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-500"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function RequireAdmin({ children }: { children: React.ReactElement }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-natural-100 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-500"></div></div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/*" element={
              <div className="min-h-screen bg-natural-100 flex flex-col font-sans text-natural-900">
                <Navbar />
                <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                  <Routes>
                    <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
                    <Route path="/product/:id" element={<RequireAuth><ProductDetails /></RequireAuth>} />
                    <Route path="/accessories" element={<RequireAuth><Accessories /></RequireAuth>} />
                    <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
                    <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
                    <Route path="/checkout-success" element={<RequireAuth><CheckoutSuccess /></RequireAuth>} />
                    <Route path="/my-orders" element={<RequireAuth><MyOrders /></RequireAuth>} />
                  </Routes>
                </main>
              </div>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
