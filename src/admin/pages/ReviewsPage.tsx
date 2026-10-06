import React, { useState } from 'react';
import { Star, CheckCircle, EyeOff, Trash2, Search, Filter } from 'lucide-react';
import { Review } from '../../types';

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Ayesha Khan',
    city: 'Lahore',
    country: 'Pakistan',
    rating: 5,
    date: '2026-03-28',
    productCode: 'ZEE-1916',
    productName: 'Jahanara - ZEE-1916',
    title: 'Exquisite hand-embellished craftsmanship!',
    comment: 'Ordered Jahanara for a family wedding in Lahore. The real zardozi tilla and delicate pearl spray exceeded every expectation. Delivery was fast and customs was completely stress-free.',
    verifiedBuyer: true,
  },
  {
    id: 'rev-2',
    author: 'Saman Tariq',
    city: 'Dubai',
    country: 'UAE',
    rating: 5,
    date: '2026-03-24',
    productCode: 'ZEE-1918',
    productName: 'Meheka - ZEE-1918',
    title: 'Flawless stitching & gorgeous emerald shade',
    comment: 'Custom stitching fit like a glove! Delivered directly to Dubai Marina in under 7 days. Excellent packaging and luxury lining.',
    verifiedBuyer: true,
  },
  {
    id: 'rev-3',
    author: 'Fatima Malik',
    city: 'London',
    country: 'UK',
    rating: 5,
    date: '2026-03-19',
    productCode: 'ZEE-1912',
    productName: 'Lfora - ZEE-1912',
    title: 'True luxury Pakistani pret in London',
    comment: 'The organza dupatta with scalloped borders is breathtaking. AHMAD\'S has become my go-to luxury fashion house.',
    verifiedBuyer: true,
  },
  {
    id: 'rev-4',
    author: 'Zainab Ahmed',
    city: 'Karachi',
    country: 'Pakistan',
    rating: 4,
    date: '2026-03-12',
    productCode: 'TBR-0004',
    productName: 'Naqsh - TBR-0004',
    title: 'Very rich velvet and heavy embroidery',
    comment: 'Fabric quality is 10/10. The embroidery is heavy and authentic. Minor delay of 1 day due to courier, but customer service was very helpful.',
    verifiedBuyer: true,
  },
];

interface ReviewsPageProps {
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onShowToast }) => {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [query, setQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const filtered = reviews.filter((r) => {
    const matchesQuery =
      r.author.toLowerCase().includes(query.toLowerCase()) ||
      r.productName.toLowerCase().includes(query.toLowerCase()) ||
      r.comment.toLowerCase().includes(query.toLowerCase());
    const matchesRating = filterRating === 'all' || r.rating === filterRating;
    return matchesQuery && matchesRating;
  });

  const handleDelete = (id: string, author: string) => {
    if (confirm(`Delete review from "${author}"?`)) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      onShowToast('Review Deleted', `Removed review from ${author}`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl uppercase tracking-wider text-stone-900">
          Customer Reviews &amp; Ratings
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Review, approve, and manage customer product testimonials.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search author, dress, or feedback..."
            className="w-full p-2.5 pl-9 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="p-2 border border-stone-300 rounded-xl bg-white focus:outline-none text-stone-800"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-800 text-xs">
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-xs">{rev.author}</span>
                    {rev.verifiedBuyer && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {rev.city}, {rev.country} · {rev.date}
                  </span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rev.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Product & Title */}
            <div>
              <p className="text-[11px] text-stone-500 font-mono">Product: {rev.productName}</p>
              <h4 className="font-semibold text-xs text-stone-900 mt-1">{rev.title}</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{rev.comment}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleDelete(rev.id, rev.author)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Review</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
