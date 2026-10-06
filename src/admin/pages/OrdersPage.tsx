import React, { useState } from 'react';
import {
  Eye,
  Search,
  Printer,
  X,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  Mail,
  Filter,
} from 'lucide-react';
import { AdminOrder, OrderStatus, PaymentStatus } from '../types';

interface OrdersPageProps {
  orders: AdminOrder[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  selectedOrderForModal?: AdminOrder | null;
  onCloseOrderModal?: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onShowToast,
  selectedOrderForModal,
  onCloseOrderModal,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(selectedOrderForModal || null);

  // Sync if prop changed
  React.useEffect(() => {
    if (selectedOrderForModal) {
      setSelectedOrder(selectedOrderForModal);
    }
  }, [selectedOrderForModal]);

  const handleClose = () => {
    setSelectedOrder(null);
    if (onCloseOrderModal) onCloseOrderModal();
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
    onShowToast('Order Status Updated', `Order #${selectedOrder?.orderNumber || orderId} status changed to ${newStatus}`, 'info');
  };

  const handlePaymentChange = (orderId: string, newStatus: PaymentStatus) => {
    onUpdatePaymentStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
    }
    onShowToast('Payment Status Updated', `Payment marked as ${newStatus}`, 'success');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Filtered Orders
  const filtered = orders.filter((o) => {
    const matchesTab =
      activeTab === 'all' || o.orderStatus.toLowerCase() === activeTab.toLowerCase();

    const matchesQuery =
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.customerPhone.includes(query) ||
      o.city.toLowerCase().includes(query.toLowerCase());

    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
            Order Management
          </h1>
          <p className="text-xs text-stone-500">Track dispatches, payment verification, and customer delivery receipts</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-stone-100 pb-3 text-xs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order #, customer name, phone, or city..."
            className="w-full p-2.5 pl-9 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-500">
                    No orders found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-stone-950">{ord.orderNumber}</td>

                    <td className="p-3.5">
                      <p className="font-semibold text-stone-900">{ord.customerName}</p>
                      <p className="text-[11px] text-stone-500">{ord.customerPhone} · {ord.city}</p>
                    </td>

                    <td className="p-3.5 text-stone-600 whitespace-nowrap">{ord.createdAt}</td>

                    <td className="p-3.5">
                      <span className="font-medium text-stone-900">
                        {ord.items.reduce((s, i) => s + i.quantity, 0)} Pcs
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-stone-950">
                      Rs. {ord.totalAmount.toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className="uppercase text-[11px] font-semibold text-stone-800 block">
                          {ord.paymentMethod.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            ord.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'Shipped'
                            ? 'bg-sky-100 text-sky-800'
                            : ord.orderStatus === 'Processing'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-stone-200 shadow-2xl rounded-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto my-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                  Order Details &amp; Dispatch
                </span>
                <h2 className="font-serif-luxury text-2xl text-stone-950 uppercase font-normal">
                  Order #{selectedOrder.orderNumber}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-3 py-1.5 border border-stone-300 text-stone-800 font-semibold rounded-lg text-xs uppercase flex items-center gap-1.5 hover:bg-stone-100 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>

                <button onClick={handleClose} className="p-1.5 text-stone-500 hover:text-stone-950 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status Update Controllers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-stone-200 bg-white p-4 rounded-xl my-4">
              <div>
                <label className="block font-bold text-stone-900 uppercase text-[11px] mb-1">
                  Update Order Status
                </label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#FAF8F5] font-semibold text-stone-900 focus:outline-none focus:border-stone-950 text-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-900 uppercase text-[11px] mb-1">
                  Update Payment Status
                </label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handlePaymentChange(selectedOrder.id, e.target.value as PaymentStatus)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#FAF8F5] font-semibold text-stone-900 focus:outline-none focus:border-stone-950 text-xs"
                >
                  <option value="Pending">Pending Payment</option>
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-stone-950 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-stone-700" />
                  <span>Client Profile</span>
                </h3>
                <p><strong className="text-stone-900">Name:</strong> {selectedOrder.customerName}</p>
                <p><strong className="text-stone-900">Email:</strong> {selectedOrder.customerEmail}</p>
                <p><strong className="text-stone-900">Phone:</strong> {selectedOrder.customerPhone}</p>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-stone-950 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-stone-700" />
                  <span>Shipping Destination</span>
                </h3>
                <p><strong className="text-stone-900">Address:</strong> {selectedOrder.shippingAddress}</p>
                <p><strong className="text-stone-900">City &amp; Country:</strong> {selectedOrder.city}, {selectedOrder.country}</p>
                {selectedOrder.orderNotes && (
                  <p className="text-stone-600 italic"><strong className="text-stone-900">Note:</strong> {selectedOrder.orderNotes}</p>
                )}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-stone-950 text-xs">
                Ordered Products ({selectedOrder.items.length})
              </h3>

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 uppercase tracking-wider text-stone-700">
                      <th className="p-3">Item</th>
                      <th className="p-3">Type &amp; Options</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 flex items-center gap-2.5">
                          <img
                            src={it.image}
                            alt={it.productName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-12 object-cover rounded border border-stone-200 bg-[#F2EDE4]"
                          />
                          <div>
                            <p className="font-bold text-stone-950 uppercase">{it.productName}</p>
                            <p className="text-[11px] text-stone-500">Code: {it.productCode}</p>
                          </div>
                        </td>

                        <td className="p-3">
                          <p className="uppercase font-medium text-stone-800">{it.selectedType}</p>
                          {it.selectedSize && <p className="text-[11px] text-stone-500">Size: {it.selectedSize}</p>}
                          <p className="text-[10px] text-stone-400">Sleeves: {it.sleeveLining}</p>
                        </td>

                        <td className="p-3 font-semibold text-stone-900">{it.quantity}</td>

                        <td className="p-3 text-right font-semibold text-stone-950">
                          Rs. {(it.unitPrice * it.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1.5 text-xs text-right max-w-xs ml-auto">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount:</span>
                    <span>-Rs. {selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping:</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'FREE' : `Rs. ${selectedOrder.shippingFee}`}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-950 text-sm pt-2 border-t border-stone-200">
                  <span>Total Amount:</span>
                  <span>Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
