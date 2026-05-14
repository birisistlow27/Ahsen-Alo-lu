import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addOrder } from '../lib/db';
import { serverTimestamp } from 'firebase/firestore';
import { CheckCircle, Info } from 'lucide-react';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    setSubmitting(true);
    
    try {
      const orderData: any = {
        customerName: customerName.trim(),
        items,
        totalAmount: total,
        status: 'bekliyor',
        note: '',
        createdAt: serverTimestamp(),
      };

      if (user) {
        orderData.userId = user.uid;
      }

      await addOrder(orderData);
      clearCart();
      navigate('/checkout-success');
    } catch (err) {
      console.error('Order failed', err);
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-natural-900 tracking-tight">Şiparişi Tamamla</h1>

      <div className="bg-natural-200 border border-terracotta-500/20 rounded-2xl p-6 flex items-start space-x-4">
         <Info className="h-6 w-6 text-terracotta-500 flex-shrink-0 mt-0.5" />
         <div>
            <h3 className="text-lg font-bold text-natural-900">Ödeme ve Teslimat Notu</h3>
            <p className="mt-2 text-natural-900 text-sm leading-relaxed italic">
              Siparişiniz tamamlandığında size onay bilgisi verilecektir. 
              <strong> Ahsen Aloğlu</strong>'yla ödeme ve ürün teslimi için yüz yüze buluşabilirsiniz.
            </p>
         </div>
      </div>

      <div className="bg-white shadow-sm border border-natural-300 rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-semibold text-natural-900 mb-2">
              Adınız ve Soyadınız <span className="text-terracotta-500">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              required
              placeholder="Örn: Ayşe Yılmaz"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="block w-full rounded-xl border border-natural-300 bg-natural-100 px-4 py-3 text-natural-900 focus:border-moss-500 focus:ring-2 focus:ring-moss-500"
            />
          </div>

          <div className="border-t border-natural-300 pt-6 mt-6">
            <h3 className="text-lg font-bold text-natural-900 mb-4">Sipariş Özeti</h3>
             <ul className="space-y-3 mb-4">
                {items.map((item) => (
                  <li key={item.cartItemId} className="flex justify-between text-sm text-natural-400">
                     <span>
                       {item.quantity}x {item.name}
                       {item.isAccessory && <span className="opacity-75 ml-1">({item.linkedProductName} için)</span>}
                     </span>
                     <span className="font-medium text-natural-900">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                  </li>
                ))}
             </ul>
             <div className="flex border-t border-natural-300 pt-4 justify-between items-center text-xl font-bold text-natural-900">
               <span>Toplam:</span>
               <span className="text-terracotta-500">{total.toLocaleString('tr-TR')} TL</span>
             </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !customerName.trim()}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-moss-500 hover:bg-moss-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Gönderiliyor...' : 'Siparişi Gönder'} <CheckCircle className="ml-2 h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
