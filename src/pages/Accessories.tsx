import React, { useEffect, useState } from 'react';
import { getAccessories, Accessory } from '../lib/db';
import { useCart } from '../contexts/CartContext';
import { Plus, ShoppingBag, X, Sparkles, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Accessories() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [quickViewAccessory, setQuickViewAccessory] = useState<Accessory | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAccessories();
        setAccessories(data || []);
      } catch (err) {
        console.error("Aksesuarlar yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = (item: Accessory) => {
    const productsInCart = items.filter(cartItem => !cartItem.isAccessory);

    if (productsInCart.length === 0) {
      alert("Aksesuar satın alabilmek için önce sepette bir ürün olmalı.");
      return;
    }

    if (productsInCart.length === 1) {
      // Add directly linked to the only product in the cart
      addToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        selectedOptions: {},
        isAccessory: true,
        linkedProductName: productsInCart[0].name,
        imageUrl: item.imageUrl
      });
      navigate('/cart');
    } else {
      // Prompt user to select which product in the cart this accessory belongs to
      setSelectedAccessory(item);
    }
  };

  const handleSelectProduct = (productName: string) => {
    if (selectedAccessory) {
      addToCart({
        productId: selectedAccessory.id,
        name: selectedAccessory.name,
        price: selectedAccessory.price,
        quantity: 1,
        selectedOptions: {},
        isAccessory: true,
        linkedProductName: productName,
        imageUrl: selectedAccessory.imageUrl
      });
      setSelectedAccessory(null);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-moss-500"></div>
      </div>
    );
  }

  const productsInCart = items.filter(cartItem => !cartItem.isAccessory);

  return (
    <div className="space-y-10 fade-in relative">
      {/* Dynamic warning if cart is empty */}
      {productsInCart.length === 0 && (
        <div className="bg-clay-50 border border-clay-500/20 text-clay-900 px-5 py-3.5 rounded-2xl flex items-center justify-center text-sm font-semibold shadow-sm animate-pulse">
          <Info className="w-5 h-5 mr-2.5 text-clay-500 flex-shrink-0" />
          <span>Aksesuar satın alabilmek için önce sepetinizde en az bir ana ürün olmalıdır.</span>
        </div>
      )}

      {/* Hero Header */}
      <header className="text-center py-16 bg-white rounded-3xl border border-natural-300/60 shadow-[0_4px_24px_rgba(74,74,50,0.02)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-moss-500/30 to-transparent"></div>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-natural-900 tracking-tight">Özel Aksesuarlar</h1>
        <p className="mt-4 text-base sm:text-lg text-natural-400 max-w-2xl mx-auto leading-relaxed px-4">
          Ürünlerinizi daha da özelleştirmek ve tamamlamak için şık detaylar ekleyin.
          <br /><span className="text-xs font-semibold text-clay-500 uppercase tracking-widest bg-clay-50 px-2.5 py-1 rounded-md border border-clay-500/10 mt-2 inline-block">Aksesuarlar tek başına satılamaz</span>
        </p>
      </header>

      {accessories.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-natural-300/80">
          <div className="bg-natural-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-natural-300" />
          </div>
          <h3 className="text-base font-bold text-natural-900">Henüz hiç aksesuar yok</h3>
          <p className="mt-1 text-sm text-natural-400">Yakında yeni aksesuarlar eklenecektir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accessories.map((acc) => (
            <div 
              key={acc.id} 
              onClick={() => setQuickViewAccessory(acc)}
              className="cursor-pointer group relative bg-white border border-natural-300/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-moss-400/40 transition-all duration-300 flex flex-col h-full"
            >
              <div className="aspect-[4/5] bg-natural-200/50 relative overflow-hidden">
                {acc.imageUrl ? (
                  <img src={acc.imageUrl} alt={acc.name} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-natural-400/60">
                    <ShoppingBag className="h-12 w-12 mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-widest">Görsel Yok</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-natural-300/50 shadow-sm">
                  <p className="text-sm font-bold text-moss-600">{acc.price.toLocaleString('tr-TR')} TL</p>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-natural-900 group-hover:text-moss-500 transition-colors line-clamp-1">{acc.name}</h3>
                {acc.description && (
                  <p className="mt-2 text-sm text-natural-400 line-clamp-2 leading-relaxed flex-grow">{acc.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick View Accessory Modal */}
      {quickViewAccessory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-900/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] scale-in border border-natural-200">
            <div className="relative">
               {quickViewAccessory.imageUrl ? (
                 <img src={quickViewAccessory.imageUrl} alt={quickViewAccessory.name} className="w-full h-64 object-cover" />
               ) : (
                 <div className="h-64 w-full flex items-center justify-center bg-natural-200/60">
                   <ShoppingBag className="h-16 w-16 text-natural-400 opacity-50" />
                 </div>
               )}
               <button 
                 onClick={() => setQuickViewAccessory(null)}
                 className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-natural-900 rounded-full shadow-sm backdrop-blur transition-colors cursor-pointer"
               >
                 <X className="h-5 w-5" />
               </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
               <div>
                 <h2 className="text-2xl font-bold text-natural-900">{quickViewAccessory.name}</h2>
                 <p className="text-2xl font-black text-moss-500 mt-2">{quickViewAccessory.price.toLocaleString('tr-TR')} TL</p>
               </div>
               
               {quickViewAccessory.description && (
                 <div className="prose prose-sm text-natural-600 bg-natural-100/50 p-4 rounded-2xl border border-natural-300/30">
                    <p>{quickViewAccessory.description}</p>
                 </div>
               )}
               
               <button
                  onClick={() => {
                    const acc = quickViewAccessory;
                    setQuickViewAccessory(null);
                    handleAddToCart(acc);
                  }}
                  className="mt-4 w-full bg-moss-600 hover:bg-moss-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-moss-500/30 flex items-center justify-center transition-all focus:ring-4 focus:ring-moss-500/20 active:scale-[0.98] cursor-pointer"
               >
                  <Plus className="h-5 w-5 mr-3" />
                  Sepete Ekle
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {selectedAccessory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-900/60 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 scale-in relative border border-natural-200">
             <button 
               onClick={() => setSelectedAccessory(null)} 
               className="absolute top-4 right-4 text-natural-400 hover:text-natural-700 bg-natural-100 rounded-full p-2 transition-colors cursor-pointer"
             >
               <X className="h-5 w-5" />
             </button>
             <div className="mx-auto bg-moss-50 text-moss-600 w-14 h-14 rounded-full flex items-center justify-center mb-5 border border-moss-200/50">
               <Sparkles className="h-6 w-6 text-moss-500" />
             </div>
             <h2 className="text-2xl font-serif font-bold text-natural-900 mb-2 text-center">Uyumlu Ürünü Seçin</h2>
             <p className="text-natural-500 text-sm mb-6 text-center leading-relaxed">
               Hangi ürüne <strong>{selectedAccessory.name}</strong> eklemek istiyorsunuz?
             </p>
             <div className="space-y-3">
                {productsInCart.map((item) => (
                  <button 
                    key={item.cartItemId}
                    onClick={() => handleSelectProduct(item.name)}
                    className="w-full text-left px-5 py-4 rounded-2xl border border-natural-300 hover:border-moss-500 hover:bg-moss-50/50 transition-all duration-300 flex justify-between items-center group/btn cursor-pointer"
                  >
                    <span className="font-semibold text-natural-900 group-hover/btn:text-moss-600 transition-colors">{item.name}</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-natural-200/60 rounded-md text-natural-500">Miktar: {item.quantity}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
