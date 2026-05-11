import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-natural-900 tracking-tight">Sepetiniz</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-natural-300">
          <ShoppingBag className="mx-auto h-16 w-16 text-natural-400 mb-4" />
          <h2 className="text-xl font-bold text-natural-900">Sepetiniz Boş</h2>
          <p className="mt-2 text-natural-400">Görünüşe göre henüz bir ürün eklemediniz.</p>
          <Link to="/" className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-moss-500 hover:bg-moss-600 transition">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-natural-300 rounded-3xl overflow-hidden">
          <ul className="divide-y divide-natural-300">
            {items.map((item) => (
              <li key={item.cartItemId} className="p-6 flex flex-col sm:flex-row sm:items-center">
                <div className="flex-shrink-0 w-24 h-24 bg-natural-200 rounded-2xl flex items-center justify-center border border-natural-300 overflow-hidden">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                   ) : (
                     <ShoppingBag className="h-8 w-8 text-natural-400" />
                   )}
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-natural-900"><Link to={`/product/${item.productId}`} className="hover:text-moss-500">{item.name}</Link></h3>
                      <p className="mt-1 text-sm font-medium text-natural-400">Miktar: {item.quantity}</p>
                    </div>
                    <p className="text-lg font-bold text-terracotta-500">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</p>
                  </div>
                  
                  {Object.entries(item.selectedOptions).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                       {Object.entries(item.selectedOptions).map(([key, val]) => (
                         <span key={key} className="inline-flex items-center px-2.5 py-0.5 border border-natural-300 rounded-md text-xs font-medium bg-natural-200 text-natural-900">
                           {key}: {val}
                         </span>
                       ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex items-center justify-end">
                   <button
                     onClick={() => removeFromCart(item.cartItemId)}
                     className="text-natural-400 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-red-50"
                     title="Sepetten Çıkar"
                   >
                     <Trash2 className="h-5 w-5" />
                   </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="p-6 bg-natural-200 border-t border-natural-300">
            <div className="flex justify-between items-center text-xl font-bold text-natural-900 mb-6">
              <span>Genel Toplam:</span>
              <span className="text-terracotta-500">{total.toLocaleString('tr-TR')} TL</span>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
               <Link to="/" className="inline-flex justify-center items-center px-6 py-3 border border-natural-300 shadow-sm text-base font-medium rounded-xl text-natural-900 bg-white hover:bg-natural-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss-500 transition-colors">
                  Alışverişe Devam Et
               </Link>
               <button
                 onClick={() => navigate('/checkout')}
                 className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-base font-bold rounded-xl text-white bg-moss-500 hover:bg-moss-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss-500 transition-colors"
               >
                  Şiparişi Tamamla <ArrowRight className="ml-2 h-5 w-5" />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
