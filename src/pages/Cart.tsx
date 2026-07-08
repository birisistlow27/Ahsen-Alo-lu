import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-10 fade-in">
      <header className="border-b border-natural-300/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-natural-900 tracking-tight">Alışveriş Sepetiniz</h1>
        <p className="mt-2 text-sm text-natural-400">Sepetinizdeki ürünleri kontrol edebilir, adetlerini düzenleyebilirsiniz.</p>
      </header>
      
      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-natural-300/80 shadow-[0_4px_24px_rgba(74,74,50,0.01)]">
          <ShoppingBag className="mx-auto h-16 w-16 text-natural-400 mb-5 opacity-80" />
          <h2 className="text-2xl font-serif font-bold text-natural-900">Sepetiniz Boş</h2>
          <p className="mt-2 text-sm text-natural-400 max-w-sm mx-auto">Görünüşe göre henüz sepetinize bir tasarım ürün eklememişsiniz.</p>
          <Link to="/" className="mt-8 inline-flex items-center px-6 py-3.5 border border-transparent text-sm font-bold rounded-2xl text-white bg-moss-600 hover:bg-moss-700 shadow-md shadow-moss-500/10 transition cursor-pointer">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-[0_4px_24px_rgba(74,74,50,0.02)] border border-natural-300/60 rounded-[2rem] overflow-hidden">
          <ul className="divide-y divide-natural-100">
            {items.map((item) => (
              <li key={item.cartItemId} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-shrink-0 w-24 h-24 bg-natural-200/40 rounded-2xl flex items-center justify-center border border-natural-300/40 overflow-hidden relative">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                   ) : (
                     <ShoppingBag className="h-8 w-8 text-natural-400/60" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-natural-900">
                        {item.isAccessory ? (
                          <span>
                            {item.name} 
                            <span className="text-xs font-semibold text-moss-600 bg-moss-50 px-2 py-0.5 rounded ml-2 border border-moss-500/10">
                              {item.linkedProductName} için
                            </span>
                          </span>
                        ) : (
                          <Link to={`/product/${item.productId}`} className="hover:text-moss-500 transition-colors font-serif">{item.name}</Link>
                        )}
                      </h3>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <label htmlFor={`qty-${item.cartItemId}`} className="text-xs font-bold uppercase tracking-wider text-natural-400">Miktar:</label>
                        <select
                          id={`qty-${item.cartItemId}`}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.cartItemId, Number(e.target.value))}
                          className="text-xs font-semibold rounded-lg border border-natural-300 px-2.5 py-1 text-natural-900 focus:ring-2 focus:ring-moss-500 focus:border-moss-500 bg-natural-50/50 cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-terracotta-500 flex-shrink-0">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</p>
                  </div>
                  
                  {Object.entries(item.selectedOptions).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                       {Object.entries(item.selectedOptions).map(([key, val]) => (
                         <span key={key} className="inline-flex items-center px-2.5 py-0.5 border border-natural-300 rounded-lg text-xs font-semibold bg-natural-200/50 text-natural-900">
                           {key}: {val}
                         </span>
                       ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center justify-end">
                   <button
                     onClick={() => removeFromCart(item.cartItemId)}
                     className="text-natural-400 hover:text-red-500 p-2.5 transition-colors rounded-xl hover:bg-red-50 cursor-pointer border border-transparent hover:border-red-100"
                     title="Sepetten Çıkar"
                   >
                     <Trash2 className="h-5 w-5" />
                   </button>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="p-8 bg-natural-100/50 border-t border-natural-100">
            <div className="flex justify-between items-center text-xl font-bold text-natural-900 mb-8">
              <span className="font-serif">Genel Toplam:</span>
              <span className="text-2xl text-terracotta-500">{total.toLocaleString('tr-TR')} TL</span>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
               <Link to="/" className="inline-flex justify-center items-center px-6 py-4 border border-natural-300/80 shadow-sm text-sm font-semibold rounded-2xl text-natural-900 bg-white hover:bg-natural-100 transition-colors cursor-pointer">
                  Alışverişe Devam Et
               </Link>
               <button
                 onClick={() => navigate('/checkout')}
                 className="inline-flex justify-center items-center px-6 py-4 border border-transparent shadow-md shadow-moss-500/10 text-sm font-bold rounded-2xl text-white bg-moss-600 hover:bg-moss-700 transition-all cursor-pointer"
               >
                  Siparişi Tamamla <ArrowRight className="ml-2 h-5 w-5" />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
