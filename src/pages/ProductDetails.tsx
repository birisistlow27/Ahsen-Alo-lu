import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductConfig, Product } from '../lib/db';
import { useCart } from '../contexts/CartContext';
import { PackageOpen, ArrowLeft, Check, ShoppingCart } from 'lucide-react';

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
        // DO NOT set default options, user must select them step-by-step
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
     return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-500"></div></div>;
  }

  if (!product) {
    return <div className="text-center py-24 text-natural-900">Ürün bulunamadı.</div>;
  }

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions({ [optionName]: value }); // Only allow 1 selection total
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
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-natural-400 hover:text-natural-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Geri Dön
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-natural-300 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-natural-200 flex items-center justify-center p-8 min-h-[300px]">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-contain rounded-2xl shadow-sm" />
          ) : (
            <div className="flex flex-col items-center justify-center text-natural-400">
              <PackageOpen className="h-24 w-24 mb-4 opacity-50" />
              <span className="text-lg font-medium">Görsel Yok</span>
            </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col">
          <h1 className="font-serif text-3xl font-bold text-natural-900 tracking-tight">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-terracotta-500">{product.price.toLocaleString('tr-TR')} TL</p>
          
          {product.description && (
            <p className="mt-4 text-base text-natural-900 leading-relaxed bg-natural-200 p-4 rounded-xl">
              {product.description}
            </p>
          )}

          <div className="mt-8 flex-grow space-y-6">
            {product.options?.map((option, oIdx) => (
              <div key={option.name} className="transition-all duration-500">
                <h3 className="text-sm font-semibold text-natural-900 uppercase tracking-wide mb-3">{option.name}</h3>
                <div className="flex flex-wrap gap-3">
                  {option.choices.map((choice, idx) => {
                    const choiceName = typeof choice === 'string' ? choice : choice.name;
                    const choiceImage = typeof choice === 'string' ? null : choice.image;
                    const isSelected = selectedOptions[option.name] === choiceName;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionChange(option.name, choiceName)}
                        className={`relative overflow-hidden flex flex-col items-center justify-center border transition-all ${
                          isSelected 
                            ? 'border-moss-500 bg-[#FDFCF0] text-moss-600 ring-2 ring-moss-500 shadow-sm' 
                            : 'border-natural-300 bg-white text-natural-900 hover:border-moss-400 hover:bg-natural-50'
                        } ${choiceImage ? 'rounded-2xl p-2 w-24' : 'rounded-xl px-4 py-3 text-sm font-medium min-w-[4rem]'}`}
                      >
                         {isSelected && <div className="absolute top-1 right-1 z-10 bg-moss-500 rounded-full p-0.5"><Check className="h-3 w-3 text-white" /></div>}
                         {choiceImage && (
                           <div className={`w-20 h-20 mb-2 rounded-xl overflow-hidden border ${isSelected ? 'border-moss-300' : 'border-natural-200'} bg-natural-100`}>
                              <img src={choiceImage} alt={choiceName} className="w-full h-full object-cover" />
                           </div>
                         )}
                         <span className={choiceImage ? "text-xs font-bold text-center leading-tight" : ""}>{choiceName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-natural-300">
             {(() => {
                const allOptions = product.options || [];
                // User can select exactly ONE option
                const isReadyToBuy = allOptions.length === 0 || Object.keys(selectedOptions).length > 0;

                if (!isReadyToBuy) {
                  return (
                    <div className="text-center p-6 bg-natural-50 rounded-2xl border border-dashed border-natural-300 text-natural-500 text-sm font-medium">
                      Lütfen sepete eklemek için bir seçenek belirleyin.
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col sm:flex-row gap-4 fade-in">
                    <div className="flex gap-4 w-full sm:w-auto">
                      <div className="w-24 flex-shrink-0">
                        <label htmlFor="quantity" className="sr-only">Miktar</label>
                        <select
                          id="quantity"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="block w-full h-12 px-4 rounded-xl border border-natural-300 text-natural-900 focus:ring-2 focus:ring-moss-500 focus:border-moss-500 bg-white font-medium"
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-moss-600 flex items-center justify-center space-x-2 text-white h-12 px-6 rounded-xl font-bold hover:bg-moss-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss-500 transition-all shadow-md active:scale-[0.98]"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>Sepete Ekle</span>
                      </button>
                    </div>
                    <button
                      onClick={() => navigate(-1)}
                      className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center text-sm font-medium text-natural-500 hover:text-natural-900 transition-colors h-12 px-4 rounded-xl border border-natural-200 bg-natural-50 hover:bg-natural-100"
                    >
                      Önceki Sayfaya Dön
                    </button>
                  </div>
                );
             })()}
          </div>
        </div>
      </div>
    </div>
  );
}
