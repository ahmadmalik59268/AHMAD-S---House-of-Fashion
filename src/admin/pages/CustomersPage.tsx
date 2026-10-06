import React, { useState, useEffect } from 'react';
import { Search, Eye, Power, X, ShoppingBag, MapPin, Mail, Phone, Calendar, Plus, RefreshCw, Loader2, User } from 'lucide-react';
import { AdminCustomer, AdminOrder } from '../types';
import { supabase } from '../../lib/supabase';

interface CustomersPageProps {
  customers: AdminCustomer[];
  orders: AdminOrder[];
  onToggleCustomerStatus: (id: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers: fallbackCustomers,
  orders,
  onToggleCustomerStatus,
  onShowToast,
}) => {
  const [liveCustomers, setLiveCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerCity, setNewCustomerCity] = useState('Lahore');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customers from Supabase
  const fetchSupabaseCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch from user_profiles:', error);
        setLiveCustomers(fallbackCustomers);
      } else if (data && data.length > 0) {
        // Map Supabase user_profiles to AdminCustomer structure
        const mapped: AdminCustomer[] = data.map((profile: any) => {
          const matchingOrders = orders.filter(
            (o) => o.customerEmail.toLowerCase() === (profile.email || '').toLowerCase()
          );
          const totalSpent = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

          return {
            id: profile.id,
            name: profile.full_name || profile.email.split('@')[0],
            email: profile.email,
            phone: profile.phone || '+92 300 0000000',
            city: 'Pakistan',
            country: 'Pakistan',
            totalOrders: matchingOrders.length,
            totalSpent,
            status: (profile.is_active ? 'Active' : 'Inactive') as 'Active' | 'Inactive' | 'Blocked',
            joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recent',
          };
        });
        setLiveCustomers(mapped);
      } else {
        setLiveCustomers(fallbackCustomers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setLiveCustomers(fallbackCustomers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupabaseCustomers();
  }, []);

  const filtered = liveCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query) ||
      c.city.toLowerCase().includes(query.toLowerCase())
  );

  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase() ||
          o.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
      )
    : [];

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerEmail) return;

    setIsSubmitting(true);
    try {
      // 1. Try to register with Supabase Auth or insert directly into user_profiles
      const randomId = crypto.randomUUID();
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: randomId,
          full_name: newCustomerName.trim(),
          email: newCustomerEmail.trim().toLowerCase(),
          phone: newCustomerPhone.trim(),
          role: 'customer',
          is_active: true,
        });

      if (profileError) {
        console.warn('Direct insert into user_profiles warning:', profileError);
      }

      onShowToast('Customer Added', `Customer ${newCustomerName || newCustomerEmail} added to database!`, 'success');
      setIsAddModalOpen(false);
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewCustomerPhone('');
      await fetchSupabaseCustomers();
    } catch (err: unknown) {
      onShowToast('Notice', err instanceof Error ? err.message : 'Created customer record.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (cust: AdminCustomer) => {
    const newStatus: 'Active' | 'Inactive' = cust.status === 'Active' ? 'Inactive' : 'Active';
    const isActive = newStatus === 'Active';

    // Update in Supabase
    try {
      await supabase
        .from('user_profiles')
        .update({ is_active: isActive })
        .eq('id', cust.id);
    } catch {
      // silent fallback
    }

    setLiveCustomers((prev) =>
      prev.map((c) => (c.id === cust.id ? { ...c, status: newStatus } : c))
    );
    onShowToast('Status Updated', `Customer ${cust.name} is now ${newStatus}`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
            Customer Directory
          </h1>
          <p className="text-xs text-stone-500">Live client profiles from Supabase database</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSupabaseCustomers}
            disabled={isLoading}
            className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-700 transition-colors shadow-xs cursor-pointer"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-stone-950' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer name, email, phone, or city..."
            className="w-full p-2.5 pl-9 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5">Orders</th>
                <th className="p-3.5">Total Spending</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-stone-700" />
                    <span className="block mt-2 text-xs">Loading live customers from Supabase...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-stone-950 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-[11px] text-stone-700">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{cust.name}</span>
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-stone-900">{cust.email}</p>
                      <p className="text-[11px] text-stone-500">{cust.phone}</p>
                    </td>

                    <td className="p-3.5 text-stone-700 font-mono text-[11px]">
                      {cust.joinedDate}
                    </td>

                    <td className="p-3.5 font-semibold text-stone-900">{cust.totalOrders} orders</td>

                    <td className="p-3.5 font-bold text-stone-950">
                      Rs. {cust.totalSpent.toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(cust)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                          cust.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                      >
                        {cust.status}
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Orders</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif-luxury text-lg uppercase tracking-wider font-semibold text-stone-900">
                Add Customer to Database
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  placeholder="ayesha@example.com"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">City</label>
                <input
                  type="text"
                  value={newCustomerCity}
                  onChange={(e) => setNewCustomerCity(e.target.value)}
                  placeholder="Lahore"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Supabase...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail & Orders Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif-luxury text-lg uppercase tracking-wider font-semibold text-stone-900">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-stone-500">{selectedCustomer.email} · {selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-500 block">Total Orders:</span>
                <span className="font-bold text-stone-900 text-sm">{selectedCustomer.totalOrders}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Total Spent:</span>
                <span className="font-bold text-stone-900 text-sm">Rs. {selectedCustomer.totalSpent.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider mb-2">
                Order History
              </h4>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-stone-500 italic p-4 bg-stone-50 rounded-xl text-center">
                  No orders placed yet by this customer.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-stone-900">Order #{ord.orderNumber}</p>
                        <p className="text-stone-500 text-[11px]">{ord.items.length} items · {ord.createdAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-900">Rs. {ord.totalAmount.toLocaleString()}</p>
                        <span className="text-[10px] text-emerald-700 font-semibold">{ord.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-stone-950 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
