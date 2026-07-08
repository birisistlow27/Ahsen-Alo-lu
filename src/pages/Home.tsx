import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getCategories, Product, Category } from '../lib/db';
import { PackageOpen, X, ShoppingCart, Info, Sparkles } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if instructions were seen
    const hasSeen = localStorage.getItem('ahsen-instructions-seen');
    if (!hasSeen) {
      setShowInstructions(true);
    }

    async function loadData() {
      try {
        const [pData, cData] = await Promise.all([getProducts(), getCategories()]);
        setProducts(pData);
        setCategories(cData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const closeInstructions = () => {
    localStorage.setItem('ahsen-instructions-seen', 'true');
    setShowInstructions(false);
  };

  const handleProductClick = (product: Product) => {
    const hasOptions = product.options && product.options.length > 0;
    if (!hasOptions) {
      setQuickViewProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleAddToCart = () => {
    if (quickViewProduct) {
      addToCart({
        productId: quickViewProduct.id,
        name: quickViewProduct.name,
        price: quickViewProduct.price,
        quantity: 1,
        selectedOptions: {},
        imageUrl: quickViewProduct.imageUrl
      });
      setQuickViewProduct(null);
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

  const filteredProducts = selectedCategory 
    ? products.filter(p => {
        if (p.categoryId === selectedCategory) return true;
        const productCat = categories.find(c => c.id === selectedCategory);
        if (productCat && productCat.parentId === selectedCategory) return true;
        return false;
      })
    : products;

  return (
    <div className="space-y-10 fade-in">
      {/* Informative Banner */}
      <div className="bg-moss-50/60 border border-moss-500/20 text-natural-900 px-5 py-3.5 rounded-2xl flex items-center justify-center text-sm font-medium shadow-[0_2px_12px_rgba(140,154,126,0.06)] backdrop-blur-sm">
        <span className="flex items-center text-center">
          <Sparkles className="w-4 h-4 mr-2.5 text-moss-500 flex-shrink-0 animate-pulse" />
          <span className="font-semibold text-natural-900 mr-1">Not:</span> Tüm ürünlerimiz el yapımı olup, şu an için yalnızca beyaz renkte üretilmektedir.
        </span>
      </div>

      {/* Hero Header */}
      <header className="text-center py-16 bg-white rounded-3xl border border-natural-300/60 shadow-[0_4px_24px_rgba(74,74,50,0.02)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-moss-500/30 to-transparent"></div>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-natural-900 tracking-tight">Koleksiyonu Keşfet</h1>
        <p className="mt-4 text-base sm:text-lg text-natural-400 max-w-2xl mx-auto leading-relaxed px-4">
          Ahsen'in büyük bir özen ve işçilikle hazırladığı özel tasarım ürünleri inceleyin. 
          <br />Siparişinizi buradan oluşturun, <strong className="text-moss-600 font-semibold">ödeme ve teslimatı okulda yüz yüze</strong> tamamlayalım.
        </p>
      </header>

      {/* Categories Navigator */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-4 items-center">
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                selectedCategory === null 
                  ? 'bg-moss-500 text-white shadow-md shadow-moss-500/10 border border-moss-600' 
                  : 'bg-white text-natural-900 hover:bg-natural-50 hover:text-moss-600 border border-natural-300/70 shadow-sm'
              }`}
            >
              Tümü
            </button>
            {categories.filter(c => !c.parentId).map(cat => {
               const isActive = selectedCategory === cat.id || categories.find(c => c.id === selectedCategory)?.parentId === cat.id;
               return (
                 <button 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                     isActive 
                       ? 'bg-moss-500 text-white shadow-md shadow-moss-500/10 border border-moss-600' 
                       : 'bg-white text-natural-900 hover:bg-natural-50 hover:text-moss-600 border border-natural-300/70 shadow-sm'
                   }`}
                 >
                   {cat.name}
                 </button>
               );
            })}
          </div>

          {/* Subcategories (only show if a main category is active) */}
          {(() => {
             const activeMainCat = selectedCategory ? (categories.find(c => c.id === selectedCategory)?.parentId ? categories.find(c => c.id === selectedCategory)?.parentId : selectedCategory) : null;
             if (!activeMainCat) return null;
             const subcats = categories.filter(c => c.parentId === activeMainCat);
             if (subcats.length === 0) return null;

             return (
               <div className="flex flex-wrap gap-2 justify-center fade-in">
                 {subcats.map(subCat => (
                   <button 
                     key={subCat.id}
                     onClick={() => setSelectedCategory(subCat.id)}
                     className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                       selectedCategory === subCat.id 
                         ? 'bg-natural-900 text-white shadow-sm' 
                         : 'bg-natural-200/60 text-natural-900 hover:bg-natural-200 border border-natural-300/60'
                     }`}
                   >
                     {subCat.name}
                   </button>
                 ))}
               </div>
             );
          })()}
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => handleProductClick(product)} 
              className="cursor-pointer group relative bg-white border border-natural-300/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-moss-400/40 transition-all duration-300 flex flex-col h-full"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-natural-200/50 relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="h-64 w-full flex flex-col items-center justify-center text-natural-400/60">
                    <PackageOpen className="h-12 w-12 mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-widest">Görsel Yok</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-natural-300/50 shadow-sm">
                  <p className="text-sm font-bold text-moss-600">{product.price.toLocaleString('tr-TR')} TL</p>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-natural-900 group-hover:text-moss-500 transition-colors line-clamp-1">{product.name}</h3>
                {product.description && <p className="mt-2 text-sm text-natural-400 line-clamp-2 leading-relaxed flex-grow">{product.description}</p>}
                
                {product.options && product.options.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-natural-100 flex items-center justify-between text-xs font-semibold text-natural-400">
                    <span>Özelleştirilebilir</span>
                    <Sparkles className="h-3.5 w-3.5 text-clay-500" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-natural-300/80">
          <PackageOpen className="mx-auto h-12 w-12 text-natural-400" />
          <h3 className="mt-3 text-base font-bold text-natural-900">Ürün bulunamadı</h3>
          <p className="mt-1 text-sm text-natural-400">Bu kategoride henüz ürün eklenmemiş.</p>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-900/60 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 scale-in text-center relative border border-natural-200">
             <div className="mx-auto bg-moss-50 text-moss-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-moss-200/50">
               <Sparkles className="h-8 w-8 text-moss-500 animate-pulse" />
             </div>
             <h2 className="text-2xl font-serif font-bold text-natural-900 mb-3 tracking-tight">Hoş Geldiniz!</h2>
             <p className="text-natural-600 text-sm mb-8 leading-relaxed">
               Bu platform üzerinden Ahsen'in özenle hazırladığı ürünleri inceleyebilirsiniz. İlk olarak istediğiniz <strong>ürünü</strong> seçin, ardından isterseniz <strong>ek aksesuarları</strong> sepetinize ekleyebilirsiniz. Aksesuarlar tek başına satılmamaktadır.
               <br/><br/>
               Siparişinizi oluşturduktan sonra <strong>ödeme ve teslimat işlemleri okulda yüz yüze</strong> yapılacaktır.
             </p>
             <button 
               onClick={closeInstructions}
               className="w-full bg-moss-600 hover:bg-moss-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-moss-500/30 transition-all border-b-4 border-moss-800 active:border-b-0 active:mt-1 focus:outline-none cursor-pointer"
             >
               Anladım, Alışverişe Başla
             </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-900/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] scale-in border border-natural-200">
            <div className="relative">
               {quickViewProduct.imageUrl ? (
                 <img src={quickViewProduct.imageUrl} alt={quickViewProduct.name} className="w-full h-64 object-cover" />
               ) : (
                 <div className="h-64 w-full flex items-center justify-center bg-natural-200/60">
                   <PackageOpen className="h-16 w-16 text-natural-400 opacity-50" />
                 </div>
               )}
               <button 
                 onClick={() => setQuickViewProduct(null)}
                 className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-natural-900 rounded-full shadow-sm backdrop-blur transition-colors cursor-pointer"
               >
                 <X className="h-5 w-5" />
               </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
               <div>
                 <h2 className="text-2xl font-bold text-natural-900">{quickViewProduct.name}</h2>
                 <p className="text-2xl font-black text-moss-500 mt-2">{quickViewProduct.price.toLocaleString('tr-TR')} TL</p>
               </div>
               
               {quickViewProduct.description && (
                 <div className="prose prose-sm text-natural-600 bg-natural-100/50 p-4 rounded-2xl border border-natural-300/30">
                    <p>{quickViewProduct.description}</p>
                 </div>
               )}
               
               <button
                  onClick={handleAddToCart}
                  className="mt-4 w-full bg-moss-600 hover:bg-moss-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-moss-500/30 flex items-center justify-center transition-all focus:ring-4 focus:ring-moss-500/20 active:scale-[0.98] cursor-pointer"
               >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Sepete Ekle
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
