import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Power, X, FolderTree } from 'lucide-react';
import { AdminCategory } from '../types';

interface CategoriesPageProps {
  categories: AdminCategory[];
  onAddCategory: (cat: Omit<AdminCategory, 'id' | 'productCount'>) => void;
  onEditCategory: (cat: AdminCategory) => void;
  onDeleteCategory: (id: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onShowToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '/src/assets/images/lfora_zee_peach_organza_1790851132811.jpg',
    status: 'Enabled' as 'Enabled' | 'Disabled',
    description: '',
  });

  const openAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      image: '/src/assets/images/lfora_zee_peach_organza_1790851132811.jpg',
      status: 'Enabled',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      status: cat.status,
      description: cat.description,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (cat: AdminCategory) => {
    const updated: AdminCategory = {
      ...cat,
      status: cat.status === 'Enabled' ? 'Disabled' : 'Enabled',
    };
    onEditCategory(updated);
    onShowToast(
      'Category Status Updated',
      `${cat.name} is now ${updated.status}`,
      'info'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');

    if (editingCategory) {
      onEditCategory({
        ...editingCategory,
        name: formData.name,
        slug,
        image: formData.image,
        status: formData.status,
        description: formData.description,
      });
      onShowToast('Category Updated', `Updated ${formData.name}`, 'success');
    } else {
      onAddCategory({
        name: formData.name,
        slug,
        image: formData.image,
        status: formData.status,
        description: formData.description,
      });
      onShowToast('Category Created', `Created ${formData.name}`, 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
            Store Categories
          </h1>
          <p className="text-xs text-stone-500">Organize Noir Luxury, Formals, Chiffon, and Couture lines</p>
        </div>

        <button
          onClick={openAdd}
          className="px-5 py-2.5 bg-stone-950 text-white font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                <th className="p-3.5">Banner Image</th>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Products Count</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-3.5">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg border border-stone-200 bg-[#F2EDE4]"
                    />
                  </td>

                  <td className="p-3.5">
                    <p className="font-bold text-stone-950 uppercase">{cat.name}</p>
                    <p className="text-[11px] text-stone-500 max-w-xs truncate">{cat.description}</p>
                  </td>

                  <td className="p-3.5 font-mono text-stone-600">{cat.slug}</td>

                  <td className="p-3.5">
                    <span className="font-bold text-stone-900 px-2 py-1 bg-stone-100 rounded-md">
                      {cat.productCount} Ensembles
                    </span>
                  </td>

                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleStatus(cat)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full flex items-center gap-1.5 cursor-pointer transition-colors ${
                        cat.status === 'Enabled'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{cat.status}</span>
                    </button>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 transition-colors rounded-lg cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onDeleteCategory(cat.id);
                          onShowToast('Category Removed', `Deleted ${cat.name}`, 'warning');
                        }}
                        className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 transition-colors rounded-lg cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FAF8F5] border border-stone-200 shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-serif-luxury text-lg text-stone-950 uppercase">
                {editingCategory ? 'Edit Store Category' : 'Add Store Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-500 hover:text-stone-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Velvet Festive"
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Category Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for category banner..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900"
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-800 font-semibold rounded-xl uppercase hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-950 text-white font-semibold rounded-xl uppercase hover:bg-stone-800 cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
