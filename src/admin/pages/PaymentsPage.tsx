import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  DollarSign,
} from 'lucide-react';
import { PaymentTransaction, PaymentStatus } from '../types';

interface PaymentsPageProps {
  payments: PaymentTransaction[];
  onUpdatePaymentStatus: (txnId: string, status: PaymentStatus) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  payments,
  onUpdatePaymentStatus,
  onShowToast,
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Refunded' | 'Failed'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const totalPaidPKR = payments
    .filter((p) => p.paymentStatus === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPendingPKR = payments
    .filter((p) => p.paymentStatus === 'Pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    const matchesQuery =
      p.transactionId.toLowerCase().includes(query.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      p.customerName.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesMethod && matchesQuery;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'cod':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase font-bold rounded-full flex items-center gap-1 w-fit">
            <Banknote className="w-3 h-3" />
            <span>COD</span>
          </span>
        );
      case 'card':
        return (
          <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 text-[10px] uppercase font-bold rounded-full flex items-center gap-1 w-fit">
            <CreditCard className="w-3 h-3" />
            <span>Card</span>
          </span>
        );
      case 'easypaisa_jazzcash':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] uppercase font-bold rounded-full flex items-center gap-1 w-fit">
            <Smartphone className="w-3 h-3" />
            <span>EasyPaisa / JazzCash</span>
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] uppercase font-bold rounded-full flex items-center gap-1 w-fit">
            <Building2 className="w-3 h-3" />
            <span>Bank Transfer</span>
          </span>
        );
      default:
        return <span className="uppercase text-stone-600 font-semibold">{method}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
          Payments & Payment Gateway Records
        </h1>
        <p className="text-xs text-stone-500">View payment methods, COD pending balances, and transaction logs</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-stone-900 text-white rounded-2xl shadow-md border border-stone-800 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Verified Collections</p>
          <p className="text-2xl font-bold text-[#E2D1B3]">Rs. {totalPaidPKR.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 font-medium">Cleared through Cards & Mobile Banking</p>
        </div>

        <div className="p-5 bg-white border border-amber-200 bg-amber-50/20 rounded-2xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Pending COD Receipts</p>
          <p className="text-2xl font-bold text-amber-950">Rs. {totalPendingPKR.toLocaleString()}</p>
          <p className="text-[10px] text-amber-700">Awaiting courier dispatch delivery clearance</p>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Payment Gateway Security</p>
          <p className="text-lg font-bold text-stone-950">Active SSL 256-Bit</p>
          <p className="text-[10px] text-stone-500">Visa, Mastercard, EasyPaisa, JazzCash, COD</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transaction ID, order #, customer..."
            className="w-full p-2.5 pl-9 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="p-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 bg-white font-medium"
          >
            <option value="all">All Payment Methods</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="card">Credit/Debit Card</option>
            <option value="easypaisa_jazzcash">EasyPaisa / JazzCash</option>
            <option value="bank_transfer">Direct Bank Transfer</option>
          </select>

          <div className="flex items-center gap-1">
            {(['all', 'Paid', 'Pending', 'Refunded'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5">Transaction Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-stone-900">{pay.transactionId}</td>
                  <td className="p-3.5 font-mono text-stone-700">{pay.orderNumber}</td>
                  <td className="p-3.5 font-semibold text-stone-950">{pay.customerName}</td>
                  <td className="p-3.5">{getMethodBadge(pay.paymentMethod)}</td>
                  <td className="p-3.5 font-bold text-stone-950">Rs. {pay.amount.toLocaleString()}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${
                        pay.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pay.paymentStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {pay.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-stone-500">{pay.date}</td>
                  <td className="p-3.5 text-right">
                    {pay.paymentStatus === 'Pending' && (
                      <button
                        onClick={() => {
                          onUpdatePaymentStatus(pay.id, 'Paid');
                          onShowToast('Payment Marked Paid', `Transaction ${pay.transactionId} updated to Paid`, 'success');
                        }}
                        className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                    {pay.paymentStatus === 'Paid' && (
                      <button
                        onClick={() => {
                          onUpdatePaymentStatus(pay.id, 'Refunded');
                          onShowToast('Payment Refunded', `Transaction ${pay.transactionId} marked as Refunded`, 'warning');
                        }}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[10px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                      >
                        Issue Refund
                      </button>
                    )}
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
