import { useEffect, useState } from 'react';
import { updateOrderStatus, Order } from '../../lib/db';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Loader2, CheckSquare, Square } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/error';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleStatus = async (id: string, isCompleted: boolean) => {
    try {
      const newStatus = isCompleted ? 'tamamlandı' : 'bekliyor';
      // Optimistic update
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      await updateOrderStatus(id, newStatus);
    } catch (err) {
      alert("Hata oluştu.");
      // Real-time listener will revert it automatically if it fails
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;

  const sortedOrders = [...orders].sort((a, b) => {
    const aCompleted = a.status === 'tamamlandı';
    const bCompleted = b.status === 'tamamlandı';
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      {sortedOrders.length === 0 ? (
        <div className="bg-zinc-800/50 p-8 rounded-2xl border border-zinc-700/50 text-center text-zinc-400">
           Henüz sipariş yok.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => {
            const isCompleted = order.status === 'tamamlandı';
            return (
              <div 
                key={order.id} 
                className={`bg-zinc-800 rounded-2xl shadow-lg border border-zinc-700 overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-50' : ''}`}
              >
                <div className="px-5 py-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800/80">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleStatus(order.id, !isCompleted)}
                      className={`flex-shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {isCompleted ? <CheckSquare className="h-8 w-8" /> : <Square className="h-8 w-8" />}
                    </button>
                    <div>
                      <h3 className={`text-lg font-bold text-white ${isCompleted ? 'line-through text-zinc-400' : ''}`}>
                        {order.customerName}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('tr-TR') : 'Tarih Bilinmiyor'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                     }`}>
                       {isCompleted ? 'Tamamlandı' : 'Bekliyor'}
                     </span>
                  </div>
                </div>
                <div className={`px-6 py-4 ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                  <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                         <div>
                            <span className="font-semibold">{item.quantity}x {item.name}</span>
                            {Object.entries(item.selectedOptions || {}).map(([k, v]) => (
                               <span key={k} className="ml-2 inline-block px-2 py-0.5 bg-zinc-700/50 text-xs rounded">
                                 {k}: {v}
                               </span>
                            ))}
                         </div>
                         <span className="font-medium">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-zinc-700 flex justify-between items-center text-lg font-bold">
                    <span>Toplam Tutar:</span>
                    <span className={isCompleted ? "" : "text-amber-400"}>
                      {order.totalAmount.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
