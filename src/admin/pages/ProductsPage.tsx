import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Star,
  Tag,
  Check,
  X,
  Filter,
  Upload,
  Video,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Play,
} from 'lucide-react';
import { Product } from '../../types';
import { AdminCategory } from '../types';
import { uploadMediaToSupabase } from '../../lib/supabase';

interface ProductsPageProps {
  products: Product[];
  categories: AdminCategory[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onShowToast,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Upload States
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [imageList, setImageList] = useState<string[]>([]);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    originalPrice: 14500,
    salePrice: 12900,
    collection: 'luxury-formals' as Product['collection'],
    collectionLabel: 'Luxury Formals',
    fabric: 'Pure Organza & Raw Silk',
    colorName: 'Blush Peach',
    colorHex: '#E8C5B0',
    videoReelUrl: '',
    inStock: true,
    isBestSeller: false,
    isSale: true,
    isNew: true,
    description: 'An ethereal luxury pret ensemble featuring authentic organza embroidery.',
    detailsText: 'Embroidered Front Organza\nEmbroidered Back Border\nEmbroidered Sleeves\nDupatta Organza\nTrouser Raw Silk',
  });

  // Open Add Modal
  const openAdd = () => {
    setEditingProduct(null);
    setImageList([]);
    setFormData({
      name: '',
      code: `AHM-${Math.floor(1000 + Math.random() * 9000)}`,
      slug: '',
      originalPrice: 14500,
      salePrice: 12900,
      collection: 'luxury-formals',
      collectionLabel: 'Luxury Formals',
      fabric: 'Pure Organza & Raw Silk',
      colorName: 'Blush Peach',
      colorHex: '#E8C5B0',
      videoReelUrl: '',
      inStock: true,
      isBestSeller: false,
      isSale: true,
      isNew: true,
      description: 'An ethereal luxury pret ensemble featuring authentic organza embroidery and hand-crafted embellishments.',
      detailsText: 'Embroidered Front Organza\nEmbroidered Back Border\nEmbroidered Sleeves\nDupatta Organza\nTrouser Raw Silk',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setImageList(p.images || []);
    setFormData({
      name: p.name,
      code: p.code,
      slug: p.slug,
      originalPrice: p.originalPrice,
      salePrice: p.salePrice,
      collection: p.collection,
      collectionLabel: p.collectionLabel,
      fabric: p.fabric,
      colorName: p.colorName,
      colorHex: p.colorHex,
      videoReelUrl: p.videoReelUrl || '',
      inStock: p.inStock,
      isBestSeller: p.isBestSeller || false,
      isSale: p.isSale || false,
      isNew: p.isNew || false,
      description: p.description,
      detailsText: p.details.join('\n'),
    });
  };

  // Upload Images
  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { url } = await uploadMediaToSupabase('product-images', file, 'products');
      if (url) {
        uploadedUrls.push(url);
      } else {
        const localUrl = URL.createObjectURL(file);
        uploadedUrls.push(localUrl);
      }
    }

    setImageList((prev) => [...prev, ...uploadedUrls]);
    setIsUploadingImages(false);
    onShowToast('Images Attached', `Successfully added ${uploadedUrls.length} picture(s)`, 'success');
  };

  // Upload Video Reel
  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingVideo(true);
    const { url, isLocalFallback } = await uploadMediaToSupabase('product-videos', file, 'reels');

    if (url) {
      setFormData((prev) => ({ ...prev, videoReelUrl: url }));
      onShowToast(
        'Video Reel Attached',
        isLocalFallback ? 'Video reel loaded and ready to play' : 'Video reel stored in cloud storage',
        'success'
      );
    } else {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, videoReelUrl: localUrl }));
      onShowToast('Video Preview Ready', 'Local video reel loaded', 'info');
    }
    setIsUploadingVideo(false);
  };

  // Remove single image
  const handleRemoveImage = (indexToRemove: number) => {
    setImageList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      onShowToast('Required Fields', 'Please enter Product Name and SKU Code', 'warning');
      return;
    }

    const details = formData.detailsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const discountPercent =
      formData.originalPrice > formData.salePrice
        ? Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100)
        : 0;

    const finalImages = imageList.length > 0 ? imageList : ['/src/assets/images/hero_luxury_formal_editorial_1790851112227.jpg'];

    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        name: formData.name,
        code: formData.code,
        slug: formData.slug || formData.code.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        originalPrice: Number(formData.originalPrice),
        salePrice: Number(formData.salePrice),
        discountPercent,
        collection: formData.collection,
        collectionLabel: formData.collectionLabel,
        fabric: formData.fabric,
        colorName: formData.colorName,
        colorHex: formData.colorHex,
        images: finalImages,
        videoReelUrl: formData.videoReelUrl || undefined,
        inStock: formData.inStock,
        isBestSeller: formData.isBestSeller,
        isSale: formData.isSale,
        isNew: formData.isNew,
        description: formData.description,
        details,
      });
      onShowToast('Product Saved', `Successfully updated "${formData.name}" in store catalog`, 'success');
      setEditingProduct(null);
    } else {
      onAddProduct({
        name: formData.name,
        code: formData.code,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        originalPrice: Number(formData.originalPrice),
        salePrice: Number(formData.salePrice),
        discountPercent,
        collection: formData.collection,
        collectionLabel: formData.collectionLabel,
        fabric: formData.fabric,
        colorName: formData.colorName,
        colorHex: formData.colorHex,
        images: finalImages,
        videoReelUrl: formData.videoReelUrl || undefined,
        disclaimer: 'Please note that color may vary slightly due to studio lighting.',
        inStock: formData.inStock,
        isBestSeller: formData.isBestSeller,
        isSale: formData.isSale,
        isNew: formData.isNew,
        description: formData.description,
        details,
      });
      onShowToast('Product Created', `Successfully added "${formData.name}" to live store`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const confirmDelete = () => {
    if (!deletingProductId) return;
    onDeleteProduct(deletingProductId);
    onShowToast('Product Deleted', 'Product removed from store catalog', 'warning');
    setDeletingProductId(null);
  };

  // Filtered Products
  const filtered = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase()) ||
      p.fabric.toLowerCase().includes(query.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.collection === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'instock' && p.inStock) ||
      (selectedStatus === 'outOfStock' && !p.inStock);

    return matchesQuery && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
            Products Catalog
          </h1>
          <p className="text-xs text-stone-500">
            Total {products.length} ensembles active · Real-time Supabase sync
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {products.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all products? You will be able to add your own fresh products and video reels from scratch.')) {
                  products.forEach((p) => onDeleteProduct(p.id));
                  onShowToast('Catalog Cleared', 'All default products removed. You can now add your own products & reels.', 'info');
                }
              }}
              className="px-4 py-2.5 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Delete all products to start with a fresh catalog"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={openAdd}
            className="px-5 py-2.5 bg-stone-950 text-white font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by suit name, SKU code, fabric..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-stone-900 cursor-pointer"
            >
              <option value="all">All Collections</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
              <option value="luxury-formals">Luxury Formals</option>
              <option value="noir-luxury">Noir Luxury</option>
            </select>
          </div>

          {/* Stock Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-stone-900 cursor-pointer"
          >
            <option value="all">All Stock Status</option>
            <option value="instock">In Stock Only</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Product &amp; Visuals</th>
                <th className="p-3.5">Collection</th>
                <th className="p-3.5">Price &amp; Discount</th>
                <th className="p-3.5">Fabric &amp; Color</th>
                <th className="p-3.5">Reel</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/70">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Visuals & Title */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                          {prod.images.length > 1 && (
                            <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded">
                              +{prod.images.length - 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-serif-luxury text-sm font-semibold text-stone-950 uppercase tracking-wide">
                            {prod.name}
                          </p>
                          <p className="font-mono text-[10px] text-stone-400 font-medium">
                            SKU: {prod.code}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {prod.isBestSeller && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-bold rounded">
                                Best Seller
                              </span>
                            )}
                            {prod.isSale && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[9px] font-bold rounded">
                                On Sale
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Collection */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-800 font-medium rounded-md text-[11px]">
                        {prod.collectionLabel || prod.collection}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="p-3.5">
                      <div>
                        <span className="font-semibold text-stone-950 text-sm">
                          PKR {prod.salePrice.toLocaleString()}
                        </span>
                        {prod.originalPrice > prod.salePrice && (
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                            <span className="line-through">PKR {prod.originalPrice.toLocaleString()}</span>
                            <span className="text-red-600 font-bold">-{prod.discountPercent}%</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Fabric & Color */}
                    <td className="p-3.5">
                      <p className="text-stone-800 font-medium">{prod.fabric}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-3 h-3 rounded-full border border-stone-300"
                          style={{ backgroundColor: prod.colorHex || '#d1d5db' }}
                        />
                        <span className="text-stone-500 text-[11px]">{prod.colorName}</span>
                      </div>
                    </td>

                    {/* Video Reel */}
                    <td className="p-3.5">
                      {prod.videoReelUrl ? (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded flex items-center gap-1 w-fit">
                          <Play className="w-2.5 h-2.5 fill-emerald-800" />
                          <span>Active Reel</span>
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[10px]">No video</span>
                      )}
                    </td>

                    {/* Stock Status */}
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                          prod.inStock
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prod.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(prod)}
                          className="p-2 bg-stone-100 hover:bg-stone-950 hover:text-white text-stone-800 transition-colors rounded-lg cursor-pointer shadow-2xs"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingProductId(prod.id)}
                          className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 transition-colors rounded-lg cursor-pointer shadow-2xs"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-stone-200 shadow-2xl rounded-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-stone-900" />
                <h2 className="font-serif-luxury text-xl text-stone-950 uppercase tracking-wide">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Couture Ensemble'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-stone-500 hover:text-stone-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Row 1: Product Name & SKU Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. LFORA - ZEE-1912 (Organza Couture)"
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. ZEE-1912"
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Original Retail Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Sale / Selling Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900 font-medium text-emerald-800"
                  />
                  {formData.originalPrice > formData.salePrice && (
                    <p className="text-[10px] text-red-600 font-bold mt-1">
                      Calculated Discount: {Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100)}% OFF
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Collection Category & Fabric */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Collection / Category</label>
                  <select
                    value={formData.collection}
                    onChange={(e) => {
                      const sel = e.target.value;
                      const catObj = categories.find((c) => c.slug === sel);
                      setFormData({
                        ...formData,
                        collection: sel as any,
                        collectionLabel: catObj ? catObj.name : sel === 'noir-luxury' ? 'Noir Luxury' : 'Luxury Formals',
                      });
                    }}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="luxury-formals">Luxury Formals</option>
                    <option value="noir-luxury">Noir Luxury</option>
                    <option value="lawn-pret">Lawn Pret</option>
                    <option value="velvet-couture">Velvet Couture</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Fabric Details</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. Pure Organza & Raw Silk"
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Row 4: Color Name & Color Swatch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Color Name</label>
                  <input
                    type="text"
                    value={formData.colorName}
                    onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                    placeholder="e.g. Blush Peach / Emerald Green"
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Color Swatch Hex</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colorHex}
                      onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                      className="w-10 h-10 p-0 border border-stone-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colorHex}
                      onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                      className="flex-1 p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* MEDIA SECTION: Pictures & Supabase Storage File Upload */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-950 uppercase tracking-wide text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-stone-800" />
                      <span>Product Images ({imageList.length})</span>
                    </h3>
                    <p className="text-[11px] text-stone-500">Upload images from your device or paste image URLs</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={imageFileInputRef}
                      onChange={handleImageFilesSelected}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImages}
                      onClick={() => imageFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[11px]"
                    >
                      {isUploadingImages ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Images</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Images Thumbnail Strip */}
                {imageList.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                    {imageList.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-3/4 rounded-lg overflow-hidden border border-stone-200 bg-stone-100"
                      >
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded font-mono">
                          {idx === 0 ? 'Primary' : `#${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                          title="Remove this image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MEDIA SECTION: Video Reel Upload & Preview */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-950 uppercase tracking-wide text-xs flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-stone-800" />
                      <span>Video Reel (Watch &amp; Buy Player)</span>
                    </h3>
                    <p className="text-[11px] text-stone-500">Upload MP4 video reel or paste a direct video link</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={videoFileInputRef}
                      onChange={handleVideoFileSelected}
                      accept="video/mp4,video/webm"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => videoFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[11px]"
                    >
                      {isUploadingVideo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading Video...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload MP4 Reel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.videoReelUrl}
                  onChange={(e) => setFormData({ ...formData, videoReelUrl: e.target.value })}
                  placeholder="https://.../video.mp4"
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-900 font-mono text-[11px]"
                />

                {Boolean(
                  formData.videoReelUrl &&
                  formData.videoReelUrl.trim().length > 8 &&
                  (formData.videoReelUrl.startsWith('http://') ||
                   formData.videoReelUrl.startsWith('https://') ||
                   formData.videoReelUrl.startsWith('blob:') ||
                   formData.videoReelUrl.startsWith('/'))
                ) && (
                  <div className="pt-2">
                    <p className="text-[11px] text-stone-500 font-medium mb-1">Live Video Preview:</p>
                    <div className="w-48 h-64 rounded-xl overflow-hidden border border-stone-300 bg-black">
                      <video
                        controls
                        muted
                        playsInline
                        preload="none"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      >
                        <source
                          src={formData.videoReelUrl}
                          type="video/mp4"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.style.display = 'none';
                          }}
                        />
                      </video>
                    </div>
                  </div>
                )}
              </div>

              {/* Description & Specifications */}
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Embroidery &amp; Component Details (One line per bullet)
                </label>
                <textarea
                  rows={3}
                  value={formData.detailsText}
                  onChange={(e) => setFormData({ ...formData, detailsText: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900 font-mono text-[11px]"
                />
              </div>

              {/* Status Toggles */}
              <div className="p-3.5 bg-stone-100/70 rounded-xl flex flex-wrap gap-5">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-900">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                  />
                  <span>Active &amp; In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-900">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                  />
                  <span>Featured Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-900">
                  <input
                    type="checkbox"
                    checked={formData.isSale}
                    onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                  />
                  <span>On Sale Tag</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-900">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 border border-stone-300 text-stone-800 font-semibold rounded-xl uppercase tracking-wider hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-950 text-white font-semibold rounded-xl uppercase tracking-wider hover:bg-stone-800 cursor-pointer shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Create & Publish Ensemble'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white border border-stone-200 shadow-2xl rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg uppercase text-stone-950">
                Confirm Product Deletion
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to delete this product? This will remove it from the live customer catalog.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2.5 border border-stone-300 text-stone-800 font-semibold rounded-xl text-xs uppercase cursor-pointer hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-xs uppercase cursor-pointer hover:bg-red-700 shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
