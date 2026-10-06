import React, { useState } from 'react';
import { Mail, Phone, Calendar, Check, Search, CheckCheck, Clock, Trash2 } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  created_at: string;
}

const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Maryam Raza',
    email: 'maryam.raza@gmail.com',
    phone: '+92 321 4455667',
    subject: 'Custom Bridal Measurements for December Wedding',
    message: 'Hello, I want to order the Jahanara Peshwas with custom measurements and full sleeves lining for my sister\'s rukhsati in December. Can you advise on the delivery timeline to DHA Lahore?',
    status: 'new',
    created_at: '2026-10-02 14:32',
  },
  {
    id: 'msg-2',
    name: 'Hina Siddiqui',
    email: 'hina.siddiqui@yahoo.com',
    phone: '+44 7700 900123',
    subject: 'International Delivery to Manchester UK',
    message: 'Are customs and duties fully prepaid for UK orders? I want to make sure no extra courier fee is demanded upon arrival.',
    status: 'read',
    created_at: '2026-09-30 09:15',
  },
  {
    id: 'msg-3',
    name: 'Bilal Chaudhry',
    email: 'bilal.chaudhry@outlook.com',
    phone: '+92 300 8899112',
    subject: 'Gift Box Packaging Request',
    message: 'I have ordered MEHEKA ZEE-1918 as a wedding gift for my wife. Please make sure the AHMAD\'S signature hard-box luxury packaging is used.',
    status: 'resolved',
    created_at: '2026-09-28 18:40',
  },
];

interface MessagesPageProps {
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ onShowToast }) => {
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL_MESSAGES);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'resolved'>('all');

  const filtered = messages.filter((m) => {
    const matchesQuery =
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase()) ||
      m.message.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: 'new' | 'read' | 'resolved') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    onShowToast('Status Updated', `Message marked as ${newStatus}`, 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this message?')) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      onShowToast('Deleted', 'Contact inquiry removed.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl uppercase tracking-wider text-stone-900">
          Customer Contact Inquiries
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Review and resolve direct inquiries submitted via the website contact form.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full p-2.5 pl-9 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5 text-xs bg-stone-100 p-1 rounded-xl">
          {(['all', 'new', 'read', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className={`bg-white border rounded-2xl p-5 shadow-xs space-y-3 transition-colors ${
              msg.status === 'new' ? 'border-[#E2D1B3] bg-stone-50/50' : 'border-stone-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-800 text-xs">
                  {msg.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-stone-900">{msg.name}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {msg.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {msg.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {msg.created_at}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    msg.status === 'new'
                      ? 'bg-red-100 text-red-700'
                      : msg.status === 'read'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {msg.status}
                </span>
              </div>
            </div>

            <div>
              <p className="font-semibold text-xs text-stone-900">{msg.subject}</p>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                {msg.message}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {msg.status !== 'read' && (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, 'read')}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark as Read</span>
                  </button>
                )}

                {msg.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, 'resolved')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDelete(msg.id)}
                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                title="Delete Inquiry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
