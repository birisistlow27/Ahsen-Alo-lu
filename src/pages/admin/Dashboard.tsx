import { useEffect, useState } from 'react';
import { getProducts, Order, Product } from '../../lib/db';
import { db, auth } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Package, ShoppingCart, Loader2, DollarSign, Menu, ExternalLink, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

import AdminOrders from './Orders';
import AdminProducts from './Products';
import AdminAccessories from './Accessories';
import AdminCategories from './Categories';

import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const pData = getProducts().then(data => setProducts(data || []));
    
    const unsubscribeOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
      setLoading(false);
    });

    // Switch to dark theme for admin overall
    document.body.classList.add('bg-zinc-900', 'text-zinc-100');
    return () => {
      unsubscribeOrders();
      document.body.classList.remove('bg-zinc-900', 'text-zinc-100');
    };
  }, []);

  if (loading) return <div className="flex justify-center p-12 min-h-screen bg-zinc-900"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;

  const pendingOrders = orders.filter(o => o.status === 'bekliyor').length;
  const totalRevenue = orders.filter(o => o.status === 'tamamlandı').reduce((sum, o) => sum + o.totalAmount, 0);

  const calculateTotalProducts = () => {
    let total = 0;
    for (const p of products) {
      if (!p.options || p.options.length === 0) {
        total += 1;
      } else {
        const countPath = (currentSelections: Record<string, string>): number => {
           const visibleOpts = p.options!.filter(opt => 
             !opt.dependsOn || Object.values(currentSelections).includes(opt.dependsOn)
           );
           const nextOpt = visibleOpts.find(opt => !currentSelections[opt.name]);
           if (!nextOpt) return 1; 
           
           let sum = 0;
           for (const choice of nextOpt.choices) {
               const choiceName = typeof choice === 'string' ? choice : choice.name;
               sum += countPath({ ...currentSelections, [nextOpt.name]: choiceName });
           }
           return sum;
        };
        total += countPath({});
      }
    }
    return total;
  };
  const totalProductVariations = calculateTotalProducts();

  // Group orders by month
  const monthlyData = orders.reduce((acc, order) => {
    if (order.status !== 'tamamlandı' || !order.createdAt) return acc;
    const date = new Date(order.createdAt.seconds * 1000);
    const month = date.toLocaleString('tr-TR', { month: 'short' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += order.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyData).map(([name, Ciro]) => ({ name, Ciro }));

  // Dummy data if real data is empty just for cool visuals
  const finalChartData = chartData.length > 0 ? chartData : [
    { name: 'Oca', Ciro: 0 }, { name: 'Şub', Ciro: 0 }, { name: 'Mar', Ciro: 0 }
  ];

  return (
    <div className="bg-zinc-900 text-zinc-100 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            {isMenuOpen && (
              <div className="absolute top-12 left-0 w-48 bg-zinc-800 rounded-xl shadow-xl border border-zinc-700/50 py-2 z-50">
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center justify-between"
                >
                  <span>Siteye Dön</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
                <div className="h-px bg-zinc-700/50 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300 flex items-center justify-between"
                >
                  <span>Çıkış Yap</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Yönetim Paneli</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5 space-y-6 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
              <div className="bg-zinc-800/50 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-zinc-700/50 p-4 transform transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-emerald-500/10 rounded-xl p-3">
                    <ShoppingCart className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">Bekleyen Siparişler</dt>
                      <dd className="text-2xl font-black text-white">{pendingOrders}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/50 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-zinc-700/50 p-4 transform transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500/10 rounded-xl p-3">
                    <Package className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">Toplam Ürün (Seçeneklerle)</dt>
                      <dd className="text-2xl font-black text-white">{totalProductVariations}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/50 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-zinc-700/50 p-4 transform transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center">
                   <div className="flex-shrink-0 bg-amber-500/10 rounded-xl p-3">
                      <DollarSign className="h-6 w-6 text-amber-400" />
                   </div>
                   <div className="ml-4 w-0 flex-1">
                     <dl>
                       <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">Ciro (Tamamlanan)</dt>
                       <dd className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                         {totalRevenue.toLocaleString('tr-TR')} ₺
                       </dd>
                     </dl>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-zinc-700/50 p-4 sm:p-6 flex-grow min-h-[300px]">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Aylık Ciro Grafiği</h2>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={finalChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickMargin={8} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(val) => `₺${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} 
                    itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }} 
                  />
                  <Line type="monotone" dataKey="Ciro" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="xl:col-span-7 bg-zinc-800/30 rounded-2xl border border-zinc-700/50 p-4 flex flex-col h-[750px]">
             <h2 className="text-lg font-bold text-white mb-4 px-2">Siparişler</h2>
             <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
               <AdminOrders />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-zinc-800/30 rounded-2xl border border-zinc-700/50 p-4 h-[600px] flex flex-col items-stretch">
             <h2 className="text-lg font-bold text-white mb-4 px-2">Ürünler</h2>
             <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
               <AdminProducts />
             </div>
          </div>
          
          <div className="bg-zinc-800/30 rounded-2xl border border-zinc-700/50 p-4 h-[600px] flex flex-col items-stretch">
             <h2 className="text-lg font-bold text-white mb-4 px-2">Aksesuarlar</h2>
             <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
               <AdminAccessories />
             </div>
          </div>
          
          <div className="xl:col-span-2 bg-zinc-800/30 rounded-2xl border border-zinc-700/50 p-4 flex flex-col items-stretch max-h-[600px]">
             <h2 className="text-lg font-bold text-white mb-4 px-2">Kategoriler</h2>
             <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
               <AdminCategories />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
