import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductConfig, Product } from '../lib/db';
import { useCart } from '../contexts/CartContext';
import { PackageOpen, ArrowLeft, Check, ShoppingCart, Sparkles } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        const p = await getProductConfig(id);
        setProduct(p);
        // User must select them step-by-step
        if (p?.options) {
          setSelectedOptions({});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-moss-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-natural-900 max-w-sm mx-auto">
        <PackageOpen className="mx-auto h-16 w-16 text-natural-300 mb-4" />
        <h3 className="text-xl font-bold font-serif">Ürün bulunamadı</h3>
        <button onClick={() => navigate('/')} className="mt-6 inline-flex px-5 py-2.5 bg-moss-600 text-white rounded-xl font-bold hover:bg-moss-700 transition">
          Koleksiyona Dön
        </button>
      </div>
    );
  }

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions({ [optionName]: value }); // Only allow 1 selection total as per requirements
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      selectedOptions,
      imageUrl: product.imageUrl
    });
    navigate('/cart');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-natural-400 hover:text-natural-900 transition-colors cursor-pointer group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Geri Dön
      </button>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(74,74,50,0.02)] border border-natural-300/60 overflow-hidden flex flex-col md:flex-row gap-0">
        {/* Left Side: Image Presentation */}
        <div className="md:w-1/2 bg-natural-200/40 flex items-center justify-center p-8 min-h-[350px] relative border-r border-natural-100">
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-natural-300/30 text-xs font-bold text-natural-500 uppercase tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-moss-500 animate-pulse" /> El Yapımı Tasarım
          </div>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-contain rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)]" />
          ) : (
            <div className="flex flex-col items-center justify-center text-natural-400/60">
              <PackageOpen className="h-20 w-20 mb-4 opacity-50" />
              <span className="text-sm font-bold uppercase tracking-wider">Görsel Yok</span>
            </div>
          )}
        </div>
        
        {/* Right Side: Product Configuration */}
        <div className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-natural-900 tracking-tight">{product.name}</h1>
              <p className="mt-4 text-3xl font-serif font-black text-moss-600">{product.price.toLocaleString('tr-TR')} TL</p>
            </div>
            
            {product.description && (
              <div className="text-sm text-natural-600 leading-relaxed bg-natural-100/50 p-5 rounded-2xl border border-natural-300/30">
                <p className="font-medium italic text-natural-900/80">{product.description}</p>
              </div>
            )}

            <div className="space-y-6">
              {product.options?.map((option) => (
                <div key={option.name} className="space-y-3">
                  <h3 className="text-xs font-bold text-natural-400 uppercase tracking-widest">{option.name}</h3>
                  <div className="flex flex-wrap gap-3">
                    {option.choices.map((choice, idx) => {
                      const choiceName = typeof choice === 'string' ? choice : choice.name;
                      const choiceImage = typeof choice === 'string' ? null : choice.image;
                      const isSelected = selectedOptions[option.name] === choiceName;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionChange(option.name, choiceName)}
                          className={`relative overflow-hidden flex flex-col items-center justify-center border transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-moss-500 bg-moss-50/20 text-moss-600 ring-2 ring-moss-500/80 shadow-sm' 
                              : 'border-natural-300 bg-white text-natural-900 hover:border-moss-400 hover:bg-natural-50'
                          } ${choiceImage ? 'rounded-2xl p-2.5 w-24' : 'rounded-xl px-4 py-3 text-sm font-bold min-w-[5rem]'}`}
                        >
                           {isSelected && (
                             <div className="absolute top-1 right-1 z-10 bg-moss-500 rounded-full p-0.5 shadow-sm">
                               <Check className="h-3 w-3 text-white" />
                             </div>
                           )}
                           {choiceImage && (
                             <div className={`w-16 h-16 mb-2 rounded-xl overflow-hidden border ${isSelected ? 'border-moss-300' : 'border-natural-200'} bg-natural-100`}>
                                <img src={choiceImage} alt={choiceName} className="w-full h-full object-cover" />
                             </div>
                           )}
                           <span className={choiceImage ? "text-xs font-bold text-center leading-tight mt-1" : "font-bold text-sm"}>{choiceName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-natural-100">
             {(() => {
                const allOptions = product.options || [];
                const isReadyToBuy = allOptions.length === 0 || Object.keys(selectedOptions).length > 0;

                if (!isReadyToBuy) {
                  return (
                    <div className="text-center p-5 bg-natural-100/50 rounded-2xl border border-dashed border-natural-300/80 text-natural-500 text-sm font-semibold">
                      Lütfen sepete eklemek için yukarıdan bir seçenek belirleyin.
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-3 w-full">
                      <div className="w-24 flex-shrink-0">
                        <label htmlFor="quantity" className="sr-only">Miktar</label>
                        <select
                          id="quantity"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="block w-full h-14 px-4 rounded-xl border border-natural-300 text-natural-900 font-bold focus:ring-2 focus:ring-moss-500 focus:border-moss-500 bg-white cursor-pointer text-sm"
                        >
                          {[...Array(5)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-moss-600 flex items-center justify-center space-x-2 text-white h-14 px-6 rounded-xl font-bold hover:bg-moss-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss-500 transition-all shadow-md shadow-moss-500/10 active:scale-[0.98] cursor-pointer"
                      >
                        <ShoppingCart className="h-5 w-5 mr-1" />
                        <span>Sepete Ekle</span>
                      </button>
                    </div>
                  </div>
                );
             })()}
          </div>
        </div>
      </div>
    </div>
  );
}
