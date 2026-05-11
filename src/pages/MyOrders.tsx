import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders, Order } from '../lib/db';
import { PackageOpen, Clock, CheckCircle, PackageCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    async function loadOrders() {
      try {
        const data = await getUserOrders(user!.uid);
        setOrders(data || []);
      } catch (err) {
        console.error("Siparişler yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadOrders();
  }, [user, navigate]);

  if (!user) return null;

  if (loading) {
     return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-500"></div></div>;
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'bekliyor':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Bekliyor</span>;
      case 'onaylandı':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" /> Onaylandı</span>;
      case 'tamamlandı':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><PackageCheck className="w-3 h-3 mr-1" /> Tamamlandı</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-natural-900 tracking-tight">Geçmiş Siparişlerim</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-natural-300">
           <PackageOpen className="mx-auto h-12 w-12 text-natural-400" />
           <h3 className="mt-2 text-sm font-semibold text-natural-900">Sipariş bulunamadı</h3>
           <p className="mt-1 text-sm text-natural-400">Henüz hiç sipariş vermemişsiniz.</p>
           <div className="mt-6">
             <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-moss-500 hover:bg-moss-600">
               Alışverişe Başla
             </Link>
           </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-natural-300 p-6">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-natural-100 pb-4 mb-4">
                 <div>
                   <p className="text-sm text-natural-500">Sipariş ID: <span className="font-mono">{order.id}</span></p>
                   <p className="text-sm font-medium text-natural-900 mt-1">
                     {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bilinmeyen Tarih'}
                   </p>
                 </div>
                 <div className="flex flex-col sm:items-end">
                   {getStatusBadge(order.status)}
                   <p className="text-lg font-bold text-terracotta-500 mt-2">{order.totalAmount.toLocaleString('tr-TR')} TL</p>
                 </div>
               </div>
               
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-natural-900 uppercase tracking-wide">Ürünler</h4>
                 <ul className="divide-y divide-natural-100">
                   {order.items.map((item, idx) => (
                     <li key={idx} className="py-2 flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-natural-900">{item.quantity}x {item.name}</p>
                          {Object.entries(item.selectedOptions || {}).length > 0 && (
                            <p className="text-xs text-natural-400 mt-0.5">
                              {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-medium text-natural-900">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</p>
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
