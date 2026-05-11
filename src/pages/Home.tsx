import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getCategories, Product, Category } from '../lib/db';
import { PackageOpen, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
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
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-500"></div></div>;
  }

  const filteredProducts = selectedCategory 
    ? products.filter(p => {
        if (p.categoryId === selectedCategory) return true;
        const productCat = categories.find(c => c.id === p.categoryId);
        if (productCat && productCat.parentId === selectedCategory) return true;
        
        return false;
      })
    : products;

  return (
    <div className="space-y-8">
      <div className="bg-sage-100 border border-sage-300 text-sage-800 px-4 py-3 rounded-2xl flex items-center justify-center text-sm font-medium shadow-sm">
        <span className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-sage-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Not: Henüz renk seçeneğimiz yoktur, ürünlerimiz yalnızca beyaz renkte üretilmektedir.
        </span>
      </div>

      <header className="text-center py-12 bg-white rounded-3xl shadow-sm border border-natural-300">
        <h1 className="text-4xl font-extrabold text-natural-900 tracking-tight sm:text-5xl">Göz At & Sipariş Ver</h1>
        <p className="mt-4 text-lg text-natural-400 max-w-2xl mx-auto">
          Ahsen'in özel tasarım ürünlerini hemen inceleyin ve siparişinizi oluşturun. 
          Teslimat ve ödemeler okulda yüz yüze yapılacaktır.
        </p>
      </header>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-4 items-center">
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-moss-500 text-white' : 'bg-white text-natural-900 hover:bg-natural-100 border border-natural-300 shadow-sm'}`}
            >
              Tümü
            </button>
            {categories.filter(c => !c.parentId).map(cat => {
               const isActive = selectedCategory === cat.id || categories.find(c => c.id === selectedCategory)?.parentId === cat.id;
               return (
                 <button 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-moss-500 text-white shadow-sm' : 'bg-white text-natural-900 hover:bg-natural-100 border border-natural-300 shadow-sm'}`}
                 >
                   {cat.name}
                 </button>
               )
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
                     className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === subCat.id ? 'bg-natural-900 text-white shadow-sm' : 'bg-natural-100 text-natural-900 hover:bg-natural-200 border border-natural-300'}`}
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
              className="cursor-pointer group relative bg-white border border-natural-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-natural-200">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-48 w-full flex flex-col items-center justify-center text-natural-400">
                    <PackageOpen className="h-10 w-10 mb-2 opacity-50" />
                    <span className="text-sm font-medium uppercase tracking-widest text-natural-400">Görsel Yok</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-natural-900 group-hover:text-moss-500 transition-colors">{product.name}</h3>
                {product.description && <p className="mt-1 text-sm text-natural-400 line-clamp-2">{product.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-bold text-moss-500">{product.price.toLocaleString('tr-TR')} TL</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-natural-300">
          <PackageOpen className="mx-auto h-12 w-12 text-natural-400" />
          <h3 className="mt-2 text-sm font-semibold text-natural-900">Ürün bulunamadı</h3>
          <p className="mt-1 text-sm text-natural-400">Bu kategoride henüz ürün eklenmemiş.</p>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-900/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] slide-up">
            <div className="relative">
               {quickViewProduct.imageUrl ? (
                 <img src={quickViewProduct.imageUrl} alt={quickViewProduct.name} className="w-full h-64 object-cover" />
               ) : (
                 <div className="h-64 w-full flex items-center justify-center bg-natural-200">
                   <PackageOpen className="h-16 w-16 text-natural-400 opacity-50" />
                 </div>
               )}
               <button 
                 onClick={() => setQuickViewProduct(null)}
                 className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-natural-900 rounded-full shadow-sm backdrop-blur transition-colors"
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
                 <div className="prose prose-sm text-natural-600">
                    <p>{quickViewProduct.description}</p>
                 </div>
               )}
               
               <button
                  onClick={handleAddToCart}
                  className="mt-4 w-full bg-moss-600 hover:bg-moss-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-moss-500/30 flex items-center justify-center transition-all focus:ring-4 focus:ring-moss-500/20 active:scale-[0.98]"
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
