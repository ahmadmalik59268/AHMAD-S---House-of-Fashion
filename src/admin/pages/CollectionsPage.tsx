import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Image, Check, X, Eye, Upload, Loader2 } from 'lucide-react';
import { uploadMediaToSupabase } from '../../lib/supabase';

export interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner_image_url: string;
  is_active: boolean;
  sort_order: number;
}

const DEFAULT_COLLECTIONS: AdminCollection[] = [
  {
    id: 'col-1',
    name: 'ZEENAT',
    slug: 'luxury-formals',
    description: 'Regal hand-embellished festive bridals with zardozi tilla work',
    banner_image_url: '/src/assets/images/meheka_emerald_bridal_1790851149166.jpg',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'col-2',
    name: 'NOIR LUXE',
    slug: 'noir-luxury',
    description: 'Black velvet and rich dark silk luxury couture',
    banner_image_url: '/src/assets/images/seraphina_black_formal_1790851270198.jpg',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'col-3',
    name: 'TABEER',
    slug: 'chiffon',
    description: 'Pure flowing chiffon and organza festive formals',
    banner_image_url: '/src/assets/images/naqsh_navy_velvet_1790851164132.jpg',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'col-4',
    name: 'AARZU LUXURY',
    slug: 'aarzu-luxury',
    description: 'Handcrafted champagne gold and blush bridal peshwas',
    banner_image_url: '/src/assets/images/jahanara_champagne_kalidar_1790851177196.jpg',
    is_active: true,
    sort_order: 4,
  },
];

interface CollectionsPageProps {
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onShowToast }) => {
  const [collections, setCollections] = useState<AdminCollection[]>(DEFAULT_COLLECTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<AdminCollection | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    banner_image_url: '',
    is_active: true,
    sort_order: 1,
  });

  const handleOpenAdd = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      banner_image_url: '',
      is_active: true,
      sort_order: collections.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: AdminCollection) => {
    setEditingCollection(col);
    setFormData({
      name: col.name,
      slug: col.slug,
      description: col.description,
      banner_image_url: col.banner_image_url,
      is_active: col.is_active,
      sort_order: col.sort_order,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { url, error } = await uploadMediaToSupabase('collection-banners', file);
    setIsUploading(false);

    if (error || !url) {
      onShowToast('Upload Failed', error?.message || 'Could not upload banner to Supabase.', 'error');
      return;
    }

    setFormData((prev) => ({ ...prev, banner_image_url: url }));
    onShowToast('Uploaded', 'Banner image uploaded to collection-banners bucket.', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingCollection) {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === editingCollection.id
            ? { ...c, ...formData, slug }
            : c
        )
      );
      onShowToast('Collection Updated', `Updated collection ${formData.name}`, 'success');
    } else {
      const newCol: AdminCollection = {
        id: `col-${Date.now()}`,
        ...formData,
        slug,
      };
      setCollections((prev) => [...prev, newCol]);
      onShowToast('Collection Created', `Created collection ${formData.name}`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete collection "${name}"?`)) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
      onShowToast('Deleted', `Collection ${name} removed.`, 'info');
    }
  };

  const handleToggleActive = (id: string) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl uppercase tracking-wider text-stone-900">
            Collections Management
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Manage high-fashion collections (ZEENAT, NOIR LUXE, TABEER, AARZU LUXURY).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Collection</span>
        </button>
      </div>

      {/* Grid of Collection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs flex flex-col group"
          >
            {/* Banner Image Preview */}
            <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
              {col.banner_image_url ? (
                <img
                  src={col.banner_image_url}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <Image className="w-8 h-8 opacity-40" />
                </div>
              )}

              {/* Status Badge */}
              <button
                onClick={() => handleToggleActive(col.id)}
                className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs ${
                  col.is_active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-500 text-white'
                }`}
              >
                {col.is_active ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif-luxury text-base font-bold uppercase tracking-wider text-stone-900">
                  {col.name}
                </h3>
                <p className="text-[11px] font-mono text-stone-500 mt-0.5">/{col.slug}</p>
                <p className="text-xs text-stone-600 mt-2 line-clamp-2">{col.description}</p>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-medium">Order: #{col.sort_order}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(col)}
                    className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Collection"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(col.id, col.name)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif-luxury text-lg uppercase tracking-wider font-semibold text-stone-900">
                {editingCollection ? 'Edit Collection' : 'Create New Collection'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ZEENAT"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. luxury-formals"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-mono text-stone-700"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the aesthetic and fabric style..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Image Upload using Supabase Storage */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Banner Image (Supabase Storage)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.banner_image_url}
                      onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                      placeholder="Image URL or upload below"
                      className="flex-1 p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-mono text-[11px]"
                    />
                  </div>

                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-stone-300 hover:border-stone-900 rounded-xl cursor-pointer text-stone-600 hover:text-stone-950 transition-colors">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                        <span>Uploading to Supabase Storage (collection-banners)...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Banner File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span className="font-medium text-stone-800">Active &amp; Visible in Store</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-stone-600 font-medium">Sort Order:</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-16 p-2 border border-stone-300 rounded-lg text-center"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {editingCollection ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
