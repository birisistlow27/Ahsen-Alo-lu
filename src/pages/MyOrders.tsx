import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders, deleteOrder, Order } from '../lib/db';
import { PackageOpen, Clock, CheckCircle, PackageCheck, Info, Trash2, Ban } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await getUserOrders(user!.uid);
      setOrders(data || []);
    } catch (err) {
      console.error("Siparişler yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const handleCancelOrder = async (orderId: string, isPaid?: boolean, status?: string) => {
    if (isPaid || status === 'tamamlandı') {
      alert("Sipariş iptal edilemez (ödeme yapılmış veya tamamlanmış).");
      return;
    }

    if (window.confirm("Siparişinizi iptal etmek istediğinizden emin misiniz?")) {
      try {
        await deleteOrder(orderId);
        await loadOrders();
      } catch (err: any) {
        console.error("deleteOrder failed:", err);
        alert("İptal işlemi başarısız oldu. Lütfen konsola bakın.");
      }
    }
  };

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
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-natural-300 p-6 relative">
               
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-natural-100 pb-4 mb-4">
                 <div>
                   <p className="text-sm text-natural-500">Sipariş ID: <span className="font-mono">{order.id}</span></p>
                   <p className="text-sm font-medium text-natural-900 mt-1">
                     {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bilinmeyen Tarih'}
                   </p>
                 </div>
                 <div className="flex flex-col sm:items-end">
                   <div className="flex gap-2 items-center">
                     {getStatusBadge(order.status)}
                     {order.isPaid && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Ödendi</span>}
                   </div>
                   <p className="text-lg font-bold text-terracotta-500 mt-2">{order.totalAmount.toLocaleString('tr-TR')} TL</p>
                 </div>
               </div>

               {order.status === 'tamamlandı' ? (
                 <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start">
                   <Info className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                   <div>
                     <h4 className="text-sm font-bold text-emerald-800">Siparişiniz Hazır!</h4>
                     <p className="text-sm text-emerald-700 mt-1">Okulda Ahsen Aloğlu'dan ürünü teslim alabilirsiniz.</p>
                   </div>
                 </div>
               ) : order.isPaid ? (
                 <div className="mb-4 bg-natural-50 border border-natural-200 rounded-xl p-3 flex items-start">
                   <Ban className="h-5 w-5 text-natural-400 mt-0.5 mr-3 flex-shrink-0" />
                   <div>
                     <p className="text-sm text-natural-600 mt-0.5">İptal edemezsiniz çünkü ücreti ödediniz.</p>
                   </div>
                 </div>
               ) : (
                 <div className="mb-4 flex justify-end">
                    <button
                      onClick={() => handleCancelOrder(order.id, order.isPaid, order.status)}
                      className="inline-flex items-center text-sm font-medium text-terracotta-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" /> Siparişi İptal Et
                    </button>
                 </div>
               )}
               
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-natural-900 uppercase tracking-wide">Ürünler</h4>
                 <ul className="divide-y divide-natural-100">
                   {order.items.map((item, idx) => (
                     <li key={idx} className="py-2 flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-natural-900">
                            {item.quantity}x {item.name}
                            {item.isAccessory && <span className="text-natural-500 font-normal ml-1">({item.linkedProductName} için)</span>}
                          </p>
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
