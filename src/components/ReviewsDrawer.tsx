import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle,
  SlidersHorizontal,
  ChevronDown,
  Camera,
  Image as ImageIcon,
  MessageSquarePlus,
  ArrowLeft,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { Review } from '../types';
import { REVIEWS } from '../data/reviews';

interface ReviewsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productCode: string) => void;
}

export const ReviewsDrawer: React.FC<ReviewsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);
  const [activeSort, setActiveSort] = useState<'recent' | 'highest' | 'photos'>('photos');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Lightbox Modal for clicking customer photos
  const [lightboxReview, setLightboxReview] = useState<{
    review: Review;
    activeImageIndex: number;
  } | null>(null);

  // Write Review form
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newProductCode, setNewProductCode] = useState('Nazuk B-2003');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter & Sort Logic
  const processedReviews = [...reviewsList]
    .filter((rev) => (filterVerifiedOnly ? rev.verifiedBuyer : true))
    .sort((a, b) => {
      if (activeSort === 'highest') return b.rating - a.rating;
      if (activeSort === 'photos') return (b.images?.length || 0) - (a.images?.length || 0);
      return b.id.localeCompare(a.id);
    });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: `${newAuthor.trim().split(' ')[0]} ${newAuthor.trim().split(' ')[1]?.[0] || 'M'}.`,
      city: 'Pakistan',
      country: 'Pakistan',
      rating: newRating,
      date: new Date().toLocaleDateString('en-GB'),
      productCode: newProductCode,
      productName: newProductCode,
      title: 'Verified Customer Experience',
      comment: newComment.trim(),
      verifiedBuyer: true,
      images: uploadedPreview
        ? [uploadedPreview]
        : ['/src/assets/images/review_unboxing_peach_1791020979149.jpg'],
      productImage: '/src/assets/images/lfora_zee_peach_organza_1790851132811.jpg',
      imageCountBadge: uploadedPreview ? '+1' : undefined,
    };

    setReviewsList([newRev, ...reviewsList]);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowWriteModal(false);
      setNewAuthor('');
      setNewComment('');
      setUploadedPreview(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Center-Stage Full Reviews Modal matching reference screenshot */}
      <div className="relative w-full max-w-7xl max-h-[92vh] bg-[#FAF8F5] rounded-xl sm:rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden border border-stone-300/80">
        {/* Top Header Bar matching screenshot */}
        <div className="px-4 sm:px-6 py-4 bg-white border-b border-stone-200/90 flex items-center justify-between gap-4">
          {/* Close button on top left */}
          <button
            onClick={onClose}
            aria-label="Close reviews"
            className="p-1.5 -ml-1 text-stone-800 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Center Rating & Dropdown */}
          <div className="relative flex items-center gap-2 text-stone-900">
            <div className="flex items-center text-stone-950">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-stone-950 text-stone-950" />
              ))}
            </div>

            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1 font-semibold text-xs sm:text-sm uppercase tracking-wider text-stone-950 hover:text-stone-600 transition-colors cursor-pointer"
            >
              <span>{reviewsList.length + 176} Reviews</span>
              <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            {/* Sort Dropdown Menu */}
            {sortDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    setActiveSort('photos');
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center justify-between ${
                    activeSort === 'photos' ? 'font-bold text-stone-950 bg-stone-50' : 'text-stone-700'
                  }`}
                >
                  <span>With Photos First</span>
                  <Camera className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button
                  onClick={() => {
                    setActiveSort('recent');
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-stone-50 ${
                    activeSort === 'recent' ? 'font-bold text-stone-950 bg-stone-50' : 'text-stone-700'
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => {
                    setActiveSort('highest');
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-stone-50 ${
                    activeSort === 'highest' ? 'font-bold text-stone-950 bg-stone-50' : 'text-stone-700'
                  }`}
                >
                  Highest Rating (5★)
                </button>
              </div>
            )}
          </div>

          {/* Right Action: Filters & Write Review button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWriteModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Write Review</span>
            </button>

            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                filterVerifiedOnly
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
              title="Filter Verified Reviews"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar if opened */}
        {filterDropdownOpen && (
          <div className="px-6 py-2.5 bg-[#F2EDE4] border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-700 font-medium">Filter Options:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterVerifiedOnly}
                onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                className="rounded text-stone-950 focus:ring-stone-900"
              />
              <span className="font-semibold text-stone-900">Show Verified Buyers Only</span>
            </label>
          </div>
        )}

        {/* Main Customer Photo Reviews Grid matching reference image */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {processedReviews.map((rev) => {
              const mainImage = rev.images?.[0] || rev.productImage;
              return (
                <div
                  key={rev.id}
                  className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Photo at the top with unboxing view & count badge */}
                  {mainImage && (
                    <div
                      onClick={() => setLightboxReview({ review: rev, activeImageIndex: 0 })}
                      className="relative w-full aspect-[4/5] bg-stone-100 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={mainImage}
                        alt={`${rev.author} unboxing review`}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />

                      {/* Multiple photo badge (+1, +2) on top right */}
                      {rev.imageCountBadge && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded text-[10px] font-bold flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          <span>{rev.imageCountBadge}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Content */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    <div className="space-y-1.5">
                      {/* Customer Name & Verified badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-950 tracking-tight">
                          {rev.author}
                        </span>
                        {rev.verifiedBuyer && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-stone-900">
                            <CheckCircle className="w-3 h-3 text-stone-900 fill-stone-100" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>

                      {/* Date */}
                      <p className="text-[10px] text-stone-400 font-mono">
                        {rev.date}
                      </p>

                      {/* Star Rating */}
                      <div className="flex items-center text-stone-950 py-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-stone-950 text-stone-950'
                                : 'text-stone-300 fill-stone-100'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Comment Text */}
                      <p className="text-[11px] text-stone-700 leading-relaxed line-clamp-4 pt-0.5 font-light">
                        {rev.comment}
                      </p>
                    </div>

                    {/* Tagged Product Thumbnail and Name at the bottom */}
                    {rev.productName && (
                      <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                        {rev.productImage && (
                          <img
                            src={rev.productImage}
                            alt={rev.productName}
                            className="w-7 h-9 object-cover rounded-xs border border-stone-200 shrink-0"
                          />
                        )}
                        <span className="text-[10px] font-medium text-stone-700 truncate hover:text-stone-950">
                          {rev.productName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Write Review Floating Button */}
        <div className="sm:hidden p-3 bg-white border-t border-stone-200">
          <button
            onClick={() => setShowWriteModal(true)}
            className="w-full py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Customer Review</span>
          </button>
        </div>
      </div>

      {/* LIGHTBOX PHOTO MODAL */}
      {lightboxReview && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxReview(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-3/5 bg-stone-950 flex items-center justify-center max-h-[70vh] md:max-h-[80vh] overflow-hidden">
              <img
                src={
                  lightboxReview.review.images?.[lightboxReview.activeImageIndex] ||
                  lightboxReview.review.productImage
                }
                alt="Enlarged review photograph"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="md:w-2/5 p-6 flex flex-col justify-between space-y-4 bg-white">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-stone-950">
                      {lightboxReview.review.author}
                    </span>
                    <span className="text-xs text-stone-800 font-semibold flex items-center gap-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    {lightboxReview.review.date}
                  </span>
                </div>

                <div className="flex items-center text-stone-950">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < lightboxReview.review.rating
                          ? 'fill-stone-950 text-stone-950'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {lightboxReview.review.comment}
                </p>
              </div>

              {/* Tagged Product */}
              <div className="pt-4 border-t border-stone-200 flex items-center gap-3">
                {lightboxReview.review.productImage && (
                  <img
                    src={lightboxReview.review.productImage}
                    alt={lightboxReview.review.productName}
                    className="w-10 h-12 object-cover rounded border border-stone-200"
                  />
                )}
                <div>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider">
                    Purchased Dress:
                  </p>
                  <p className="text-xs font-semibold text-stone-900">
                    {lightboxReview.review.productName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {showWriteModal && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif-luxury text-base uppercase text-stone-950 font-semibold">
                Submit Unboxing &amp; Review
              </h3>
              <button
                onClick={() => setShowWriteModal(false)}
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-serif-luxury text-lg text-stone-900">Thank You!</h4>
                <p className="text-xs text-stone-600">
                  Your review &amp; photos have been verified and added to the gallery.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateReview} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Fatima Tariq"
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setNewRating(s)}
                        className="cursor-pointer p-0.5"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= newRating ? 'fill-stone-950 text-stone-950' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Select Dress *</label>
                  <select
                    value={newProductCode}
                    onChange={(e) => setNewProductCode(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-900"
                  >
                    <option value="Nazuk B-2003">Nazuk B-2003</option>
                    <option value="B-2004 Shamal">B-2004 Shamal</option>
                    <option value="Mehka-ZEE-1918">Mehka-ZEE-1918</option>
                    <option value="Serene">Serene</option>
                    <option value="Willow">Willow</option>
                    <option value="Pernia B-2004">Pernia B-2004</option>
                    <option value="Naqsh TBR-0004">Naqsh TBR-0004</option>
                    <option value="Jahanara ZEE-1916">Jahanara ZEE-1916</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Attach Unboxing Photo</label>
                  <label className="w-full p-3 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-stone-900 transition-colors bg-stone-50">
                    <Upload className="w-4 h-4 text-stone-500" />
                    <span className="text-[11px] text-stone-600 font-medium">
                      {uploadedPreview ? 'Photo Selected ✓' : 'Upload Client Dress Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Your Feedback *</label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share details about stitching, fabric quality, and packaging..."
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-950 text-white rounded-xl font-semibold uppercase tracking-widest text-xs hover:bg-stone-800 transition-colors cursor-pointer shadow-md"
                >
                  Submit Verified Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
