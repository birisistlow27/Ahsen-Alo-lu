import React, { useEffect, useState } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory, Category } from '../../lib/db';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', parentId: '' });

  const loadData = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        ...(formData.parentId && { parentId: formData.parentId })
      };
      
      if (editingId) {
        await updateCategory(editingId, dataToSave);
      } else {
        await addCategory(dataToSave);
      }
      setFormData({ name: '', description: '', parentId: '' });
      setIsFormOpen(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteCategory(id);
      await loadData();
    } catch (err) {
      alert("Silinirken hata oluştu.");
    }
  };

  const openEdit = (cat: Category) => {
    setFormData({ name: cat.name, description: cat.description || '', parentId: cat.parentId || '' });
    setEditingId(cat.id);
    setIsFormOpen(true);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData({name: '', description: '', parentId: ''}); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center font-medium transition"
        >
          <Plus className="h-5 w-5 mr-2" /> Yeni Kategori Ekle
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-natural-300">
           <h2 className="text-xl font-bold mb-4 text-natural-900">{editingId ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-sm font-semibold text-natural-900 mb-1">Kategori Adı</label>
               <input
                 required
                 type="text"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                 className="w-full rounded-xl border border-natural-300 bg-natural-100 px-4 py-2 focus:ring-2 focus:ring-moss-500 focus:border-moss-500 text-natural-900"
               />
             </div>
             <div>
               <label className="block text-sm font-semibold text-natural-900 mb-1">Üst Kategori (Opsiyonel)</label>
               <select
                 value={formData.parentId}
                 onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                 className="w-full rounded-xl border border-natural-300 bg-natural-100 px-4 py-2 focus:ring-2 focus:ring-moss-500 focus:border-moss-500 text-natural-900"
               >
                 <option value="">-- Ana Kategori --</option>
                 {categories.filter(c => c.id !== editingId).map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-sm font-semibold text-natural-900 mb-1">Açıklama (Opsiyonel)</label>
               <input
                 type="text"
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                 className="w-full rounded-xl border border-natural-300 bg-natural-100 px-4 py-2 focus:ring-2 focus:ring-moss-500 focus:border-moss-500 text-natural-900"
               />
             </div>
             <div className="flex space-x-3 pt-2">
               <button type="submit" className="bg-moss-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-moss-600 shadow-sm">Kaydet</button>
               <button type="button" onClick={() => setIsFormOpen(false)} className="bg-natural-200 text-natural-900 px-6 py-2 rounded-xl font-medium hover:bg-natural-300 border border-natural-300">İptal</button>
             </div>
           </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-natural-300 overflow-hidden">
        <table className="min-w-full divide-y divide-natural-300 whitespace-nowrap">
          <thead className="bg-natural-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-natural-400 uppercase">İsim</th>
              <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-natural-400 uppercase">Üst Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-natural-400 uppercase">Açıklama</th>
              <th className="px-6 py-3 text-right text-xs font-bold tracking-wider text-natural-400 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-natural-300 bg-white">
             {categories.map((cat) => (
               <tr key={cat.id}>
                 <td className="px-6 py-4 text-sm font-bold text-natural-900">{cat.name}</td>
                 <td className="px-6 py-4 text-sm text-natural-500">
                   {cat.parentId ? categories.find(c => c.id === cat.parentId)?.name || '-' : '-'}
                 </td>
                 <td className="px-6 py-4 text-sm text-natural-400">{cat.description || '-'}</td>
                 <td className="px-6 py-4 text-right text-sm font-medium">
                   <button onClick={() => openEdit(cat)} className="text-moss-500 hover:text-moss-700 mx-2"><Edit2 className="h-4 w-4" /></button>
                   <button onClick={() => handleDelete(cat.id)} className="text-terracotta-500 hover:text-red-700 mx-2"><Trash2 className="h-4 w-4" /></button>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
        {categories.length === 0 && <div className="p-6 text-center text-natural-400">Hiç kategori bulunamadı.</div>}
      </div>
    </div>
  );
}
