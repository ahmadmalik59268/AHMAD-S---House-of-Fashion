import React, { useState } from 'react';
import { Mail, Copy, Check, Search, Download, Trash2, Calendar } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const INITIAL_SUBSCRIBERS: Subscriber[] = [
  { id: 'sub-1', email: 'sara.ahmed@gmail.com', is_active: true, created_at: '2026-10-01 11:20' },
  { id: 'sub-2', email: 'ayesha.couture@yahoo.com', is_active: true, created_at: '2026-09-29 17:45' },
  { id: 'sub-3', email: 'fatima.london@hotmail.co.uk', is_active: true, created_at: '2026-09-27 08:30' },
  { id: 'sub-4', email: 'zainab.tariq@outlook.com', is_active: true, created_at: '2026-09-25 19:12' },
  { id: 'sub-5', email: 'noor.bridal@gmail.com', is_active: true, created_at: '2026-09-20 14:05' },
];

interface NewsletterPageProps {
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const NewsletterPage: React.FC<NewsletterPageProps> = ({ onShowToast }) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(INITIAL_SUBSCRIBERS);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleCopyAll = () => {
    const list = subscribers.filter((s) => s.is_active).map((s) => s.email).join(', ');
    navigator.clipboard.writeText(list);
    setCopied(true);
    onShowToast('Copied', 'All active subscriber emails copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleActive = (id: string) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const handleDelete = (id: string, email: string) => {
    if (confirm(`Remove "${email}" from subscribers?`)) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      onShowToast('Removed', `Unsubscribed ${email}`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl uppercase tracking-wider text-stone-900">
            Newsletter Subscribers
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Audience subscribed to AHMAD&apos;S exclusive campaigns and seasonal launches.
          </p>
        </div>

        <button
          onClick={handleCopyAll}
          className="px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>Copy All Active ({subscribers.filter((s) => s.is_active).length})</span>
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subscriber email..."
              className="w-full p-2.5 pl-9 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
          <span className="text-xs text-stone-500">
            Total: {subscribers.length} subscribers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                <th className="p-4">Email Address</th>
                <th className="p-4">Subscribed Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-medium text-stone-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span>{sub.email}</span>
                  </td>
                  <td className="p-4 text-stone-500 font-mono text-[11px]">
                    {sub.created_at}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(sub.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        sub.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {sub.is_active ? 'Subscribed' : 'Unsubscribed'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(sub.id, sub.email)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
