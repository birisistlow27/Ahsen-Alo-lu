import React, { useEffect, useState } from 'react';
import { getAccessories, Accessory } from '../lib/db';
import { useCart } from '../contexts/CartContext';
import { Loader2, Plus, ShoppingBag, X } from 'lucide-react';
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
      // Add directly
      addToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        selectedOptions: {},
        imageUrl: item.imageUrl,
        isAccessory: true,
        linkedProductName: productsInCart[0].name
      });
      alert(`${productsInCart[0].name} ürünü için ${item.name} sepete eklendi!`);
    } else {
      // Open selection modal
      setSelectedAccessory(item);
    }
  };

  const handleSelectProduct = (productName: string) => {
    if (!selectedAccessory) return;

    addToCart({
      productId: selectedAccessory.id,
      name: selectedAccessory.name,
      price: selectedAccessory.price,
      quantity: 1,
      selectedOptions: {},
      imageUrl: selectedAccessory.imageUrl,
      isAccessory: true,
      linkedProductName: productName
    });
    alert(`${productName} ürünü için ${selectedAccessory.name} sepete eklendi!`);
    setSelectedAccessory(null);
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-moss-500 h-8 w-8" /></div>;
  }

  const productsInCart = items.filter(cartItem => !cartItem.isAccessory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="text-center space-y-4 max-w-2xl mx-auto py-8">
        <h1 className="text-3xl md:text-5xl font-serif text-natural-900">Aksesuarlar</h1>
        <p className="text-natural-500 max-w-xl mx-auto">
          Aksesuar satın alabilmek için önce sepette bir ürün olmalı.
        </p>
      </div>

      {accessories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-natural-200">
          <div className="bg-natural-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-natural-300" />
          </div>
          <h2 className="text-xl font-bold text-natural-800">Henüz hiç aksesuar yok</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {accessories.map((acc) => (
            <div 
              key={acc.id} 
              onClick={() => setQuickViewAccessory(acc)}
              className="cursor-pointer group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-natural-200 flex flex-col"
            >
              <div className="aspect-[4/5] bg-natural-100 relative overflow-hidden">
                {acc.imageUrl ? (
                  <img src={acc.imageUrl} alt={acc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-natural-400">
                    <ShoppingBag className="h-12 w-12 mb-2 opacity-50" />
                    <span className="text-sm font-medium">Görsel Yok</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-sm font-bold text-natural-900 border border-white/20">
                  {acc.price.toLocaleString('tr-TR')} TL
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-natural-900 text-lg mb-1 group-hover:text-moss-500 transition-colors">{acc.name}</h3>
                {acc.description && (
                  <p className="text-natural-500 text-sm mb-4 line-clamp-2">{acc.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick View Accessory Modal */}
      {quickViewAccessory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-900/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] slide-up">
            <div className="relative">
               {quickViewAccessory.imageUrl ? (
                 <img src={quickViewAccessory.imageUrl} alt={quickViewAccessory.name} className="w-full h-64 object-cover" />
               ) : (
                 <div className="h-64 w-full flex items-center justify-center bg-natural-200">
                   <ShoppingBag className="h-16 w-16 text-natural-400 opacity-50" />
                 </div>
               )}
               <button 
                 onClick={() => setQuickViewAccessory(null)}
                 className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-natural-900 rounded-full shadow-sm backdrop-blur transition-colors"
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
                 <div className="prose prose-sm text-natural-600">
                    <p>{quickViewAccessory.description}</p>
                 </div>
               )}
               
               <button
                  onClick={() => {
                    const acc = quickViewAccessory;
                    setQuickViewAccessory(null);
                    handleAddToCart(acc);
                  }}
                  className="mt-4 w-full bg-moss-600 hover:bg-moss-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-moss-500/30 flex items-center justify-center transition-all focus:ring-4 focus:ring-moss-500/20 active:scale-[0.98]"
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 slide-up relative border border-natural-200">
             <button onClick={() => setSelectedAccessory(null)} className="absolute top-4 right-4 text-natural-400 hover:text-natural-700 bg-natural-100 rounded-full p-1 transition-colors">
               <X className="h-5 w-5" />
             </button>
             <h2 className="text-xl font-bold text-natural-900 mb-2">Ürün Seçimi</h2>
             <p className="text-natural-500 text-sm mb-6">
               Hangi ürüne <strong>{selectedAccessory.name}</strong> eklemek istiyorsunuz?
             </p>
             <div className="space-y-2">
               {productsInCart.map((item) => (
                 <button 
                   key={item.cartItemId}
                   onClick={() => handleSelectProduct(item.name)}
                   className="w-full text-left px-4 py-3 rounded-xl border border-natural-200 hover:border-moss-400 hover:bg-moss-50 transition-colors flex justify-between items-center"
                 >
                   <span className="font-medium text-natural-900">{item.name}</span>
                   <span className="text-sm text-natural-500">Miktar: {item.quantity}</span>
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
