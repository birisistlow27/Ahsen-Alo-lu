import React, { useEffect, useState } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories, Product, Category } from '../../lib/db';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [options, setOptions] = useState<{name: string, choices: {name: string, image: string}[]}[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setter(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const loadData = async () => {
    try {
      const pData = await getProducts();
      const cData = await getCategories();
      setProducts(pData || []);
      setCategories(cData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(opt => opt.choices.length === 0)) {
      alert("Her seçeneğin en az 1 alt seçimi olmak zorundadır!");
      return;
    }
    if (options.some(opt => opt.choices.some(c => !c.name.trim()))) {
      alert("Tüm alt seçim isimleri doldurulmalıdır!");
      return;
    }
    const data = {
      name, description, price, imageUrl, categoryId, options
    };
    try {
      if (editingId) {
        await updateProduct(editingId, data);
      } else {
        await addProduct(data);
      }
      setIsFormOpen(false);
      await loadData();
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const openForm = (p?: Product) => {
    if (p) {
      setEditingId(p.id);
      setName(p.name);
      setDescription(p.description || '');
      setPrice(p.price);
      setImageUrl(p.imageUrl || '');
      
      let singleCatId = p.categoryId || '';
      setCategoryId(singleCatId);
      
      setOptions(p.options?.map(opt => ({
        name: opt.name,
        choices: opt.choices.map(c => typeof c === 'string' ? { name: c, image: '' } : { name: c.name, image: c.image || '' })
      })) || []);
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
      setPrice(0);
      setImageUrl('');
      setCategoryId('');
      setOptions([]);
    }
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await deleteProduct(id);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Hata oluştu.");
    }
  };

  // Option Handlers
  const addOption = () => setOptions([...options, { name: '', choices: [] }]);
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  const updateOptionName = (idx: number, optName: string) => {
    const newOps = [...options];
    newOps[idx].name = optName;
    setOptions(newOps);
  };
  const addChoice = (idx: number) => {
    const newOps = [...options];
    newOps[idx].choices.push({ name: '', image: '' });
    setOptions(newOps);
  };
  const updateChoiceName = (idx: number, cIdx: number, val: string) => {
    const newOps = [...options];
    newOps[idx].choices[cIdx].name = val;
    setOptions(newOps);
  };
  const updateChoiceImage = (idx: number, cIdx: number, val: string) => {
    const newOps = [...options];
    newOps[idx].choices[cIdx].image = val;
    setOptions(newOps);
  };
  const removeChoice = (idx: number, cIdx: number) => {
     const newOps = [...options];
     newOps[idx].choices.splice(cIdx, 1);
     setOptions(newOps);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-moss-500 h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={() => openForm()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center font-medium transition"
        >
          <Plus className="h-5 w-5 mr-2" /> Yeni Ürün Ekle
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-natural-300">
           <h2 className="text-xl font-bold mb-6 text-natural-900">{editingId ? 'Ürün Düzenle' : 'Yeni Ürün'}</h2>
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-semibold text-natural-900 mb-1">Ürün Adı</label>
                 <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-natural-100 rounded-xl border border-natural-300 px-4 py-2 text-natural-900 focus:border-moss-500 focus:ring-moss-500" />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-natural-900 mb-1">Kategori</label>
                 <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-natural-100 rounded-xl border border-natural-300 px-4 py-2 text-natural-900 focus:border-moss-500 focus:ring-moss-500">
                   <option value="" className="text-natural-900">Kategori Seçin</option>
                   {categories.filter(c => !c.parentId).map(mainCat => (
                     <optgroup key={mainCat.id} label={mainCat.name}>
                       <option value={mainCat.id}>{mainCat.name} (Ana Kategori)</option>
                       {categories.filter(c => c.parentId === mainCat.id).map(subCat => (
                         <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                       ))}
                     </optgroup>
                   ))}
                   {categories.filter(c => c.parentId && !categories.find(p => p.id === c.parentId)).map(orphan => (
                      <option key={orphan.id} value={orphan.id}>{orphan.name}</option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-semibold text-natural-900 mb-1">Fiyat (TL)</label>
                 <input required type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-natural-100 rounded-xl border border-natural-300 px-4 py-2 text-natural-900 focus:border-moss-500 focus:ring-moss-500" />
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-semibold text-natural-900 mb-1">Açıklama</label>
               <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-natural-100 rounded-xl border border-natural-300 px-4 py-2 text-natural-900 focus:border-moss-500 focus:ring-moss-500" />
             </div>
             <div>
               <label className="block text-sm font-semibold text-natural-900 mb-1">Görsel (İsteğe Bağlı)</label>
               <div className="flex items-center gap-4">
                 {imageUrl && <img src={imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-natural-300" />}
                 <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setImageUrl)} className="w-full bg-natural-100 rounded-xl border border-natural-300 px-4 py-2 text-natural-900 focus:border-moss-500 focus:ring-moss-500" />
               </div>
             </div>

             <div className="border-t border-natural-300 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-natural-900">Özel Seçenekler (Varyantlar)</h3>
                  <button type="button" onClick={addOption} className="text-sm bg-natural-200 text-moss-600 px-3 py-1 rounded-lg font-medium hover:bg-natural-300 border border-natural-300">+ Seçenek Ekle (Örn: Model, Yazı Tipi)</button>
                </div>
                
                <div className="space-y-4">
                  {options.map((opt, oIdx) => (
                    <div key={oIdx} className="bg-natural-200 p-4 rounded-xl border border-natural-300">
                      <div className="flex flex-col sm:flex-row gap-2 mb-2">
                         <input required placeholder="Seçenek Adı (Örn: Renk, Beden)" value={opt.name} onChange={e => updateOptionName(oIdx, e.target.value)} className="flex-1 bg-white rounded-lg border border-natural-300 px-3 py-1 text-natural-900" />
                         <button type="button" onClick={() => removeOption(oIdx)} className="text-terracotta-500 hover:text-red-700 p-1 bg-white rounded-md border border-natural-300"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="pl-4 border-l-2 border-natural-400 space-y-3">
                         {opt.choices.map((choice, cIdx) => (
                            <div key={cIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                               <input required placeholder={`Seçim Adı (Örn: Kırmızı)`} value={choice.name} onChange={e => updateChoiceName(oIdx, cIdx, e.target.value)} className="w-full sm:w-48 bg-white rounded-lg border border-natural-300 px-2 py-1 text-sm text-natural-900" />
                               <div className="flex items-center gap-2 w-full sm:w-64">
                                 {choice.image && <img src={choice.image} alt="Preview" className="h-8 w-8 object-cover rounded-md border border-natural-300" />}
                                 <input type="file" accept="image/*" onChange={e => handleImageUpload(e, (url) => updateChoiceImage(oIdx, cIdx, url))} className="w-full bg-white rounded-lg border border-natural-300 px-2 py-1 text-xs text-natural-900" />
                               </div>
                               <button type="button" onClick={() => removeChoice(oIdx, cIdx)} className="text-natural-400 hover:text-terracotta-500 self-end sm:self-auto p-1"><X className="h-4 w-4" /></button>
                            </div>
                         ))}
                         <button type="button" onClick={() => addChoice(oIdx)} className="text-xs text-moss-600 font-medium hover:text-moss-700 mt-2 block">+ Yeni Seçim Ekle</button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="flex space-x-3 pt-6">
               <button type="submit" className="bg-moss-500 text-white px-6 py-2 rounded-xl font-medium shadow-sm hover:bg-moss-600">Kaydet</button>
               <button type="button" onClick={() => setIsFormOpen(false)} className="bg-natural-200 text-natural-900 px-6 py-2 rounded-xl font-medium hover:bg-natural-300 border border-natural-300">İptal</button>
             </div>
           </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-natural-300 overflow-hidden">
        <table className="min-w-full divide-y divide-natural-300 whitespace-nowrap">
          <thead className="bg-natural-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-natural-400 uppercase">Ürün Adı</th>
              <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-natural-400 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-natural-400 uppercase">Fiyat</th>
              <th className="px-6 py-3 text-right text-xs font-bold tracking-wider text-natural-400 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-natural-300 bg-white">
             {products.map((p) => (
               <tr key={p.id}>
                 <td className="px-6 py-4">
                    <div className="flex items-center">
                       {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-xl object-cover mr-3 border border-natural-300" /> : <div className="h-10 w-10 rounded-xl bg-natural-200 mr-3 border border-natural-300"></div>}
                       <span className="text-sm font-bold text-natural-900">{p.name}</span>
                    </div>
                 </td>
                 <td className="px-6 py-4 text-sm text-natural-400">
                    {categories.find(c => c.id === p.categoryId)?.name || '-'}
                 </td>
                 <td className="px-6 py-4 text-sm text-natural-400">{p.price.toLocaleString('tr-TR')} TL</td>
                 <td className="px-6 py-4 text-right text-sm font-medium">
                   <button onClick={() => openForm(p)} className="text-moss-500 hover:text-moss-700 mx-2"><Edit2 className="h-4 w-4" /></button>
                   <button onClick={() => handleDelete(p.id)} className="text-terracotta-500 hover:text-red-700 mx-2"><Trash2 className="h-4 w-4" /></button>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="p-6 text-center text-natural-400">Hiç ürün bulunamadı.</div>}
      </div>
    </div>
  );
}
