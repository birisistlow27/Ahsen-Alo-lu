import React, { useEffect, useState } from 'react';
import { getAccessories, addAccessory, updateAccessory, deleteAccessory, Accessory } from '../../lib/db';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminAccessories() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const loadData = async () => {
    try {
      const accData = await getAccessories();
      setAccessories(accData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openForm = (acc?: Accessory) => {
    if (acc) {
      setEditingId(acc.id);
      setName(acc.name);
      setDescription(acc.description || '');
      setPrice(acc.price.toString());
      setImageUrl(acc.imageUrl || '');
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
    }
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Aksesuarı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteAccessory(id);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Hata oluştu.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name || isNaN(parsedPrice)) {
      alert("Lütfen ad ve fiyatı doğru girin.");
      return;
    }

    const data = {
      name,
      description,
      price: parsedPrice,
      imageUrl
    };

    try {
      if (editingId) {
        await updateAccessory(editingId, data);
      } else {
        await addAccessory(data);
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      alert("Kaydedilirken hata oluştu.");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tüm Aksesuarlar</h2>
        <button 
          onClick={() => openForm()}
          className="flex items-center text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aksesuar Ekle
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 relative shadow-xl">
           <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
             <X className="h-6 w-6" />
           </button>
           <h3 className="text-lg font-bold mb-4">{editingId ? 'Aksesuar Düzenle' : 'Yeni Aksesuar'}</h3>
           
           <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Ad <span className="text-red-400">*</span></label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)} 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Açıklama</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Fiyat (TL) <span className="text-red-400">*</span></label>
                  <input 
                    type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Görsel URL</label>
                  <input 
                    type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors">
                  {editingId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
           </form>
        </div>
      )}

      <div className="bg-zinc-800/50 rounded-2xl border border-zinc-700/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800 border-b border-zinc-700/50 text-xs uppercase tracking-wider text-zinc-400">
              <th className="px-6 py-4 font-semibold">Görsel</th>
              <th className="px-6 py-4 font-semibold">Ad</th>
              <th className="px-6 py-4 font-semibold">Fiyat</th>
              <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700/50">
             {accessories.map(acc => (
               <tr key={acc.id} className="hover:bg-zinc-700/20 transition-colors">
                 <td className="px-6 py-4">
                    {acc.imageUrl ? (
                      <img src={acc.imageUrl} alt={acc.name} className="w-12 h-12 object-cover rounded-lg border border-zinc-700" />
                    ) : (
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500 border border-zinc-700">Yok</div>
                    )}
                 </td>
                 <td className="px-6 py-4">
                    <p className="font-bold text-white">{acc.name}</p>
                 </td>
                 <td className="px-6 py-4 text-sm text-zinc-400">{acc.price.toLocaleString('tr-TR')} TL</td>
                 <td className="px-6 py-4 text-right text-sm font-medium">
                   <button onClick={() => openForm(acc)} className="text-emerald-400 hover:text-emerald-300 mx-2"><Edit2 className="h-4 w-4" /></button>
                   <button onClick={() => handleDelete(acc.id)} className="text-red-400 hover:text-red-300 mx-2"><Trash2 className="h-4 w-4" /></button>
                 </td>
               </tr>
             ))}
             {accessories.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                   Hiç aksesuar bulunamadı.
                 </td>
               </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
