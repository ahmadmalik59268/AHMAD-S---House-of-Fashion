import React, { useState } from 'react';
import { User, Mail, Shield, KeyRound, LogOut, Save, CheckCircle2, Lock } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminProfilePageProps {
  adminUser: AdminUser;
  onUpdateAdminProfile: (updated: Partial<AdminUser>) => void;
  onLogoutAdmin: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AdminProfilePage: React.FC<AdminProfilePageProps> = ({
  adminUser,
  onUpdateAdminProfile,
  onLogoutAdmin,
  onShowToast,
}) => {
  const [name, setName] = useState(adminUser.name);
  const [email, setEmail] = useState(adminUser.email);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminProfile({ name, email });
    onShowToast('Profile Updated', 'Admin credentials and full name updated', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      onShowToast('Password Error', 'New passwords do not match', 'error');
      return;
    }
    onShowToast('Password Changed', 'Security password successfully changed', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
            Admin Profile & Security Center
          </h1>
          <p className="text-xs text-stone-500">Manage super administrator account identity and authorization</p>
        </div>

        <button
          onClick={onLogoutAdmin}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin Session</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-xl border border-stone-800 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={adminUser.avatarUrl || '/src/assets/images/hero_luxury_formal_editorial_1790851112227.jpg'}
          alt={adminUser.name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E2D1B3] shadow-lg shrink-0"
        />

        <div className="space-y-1 text-center sm:text-left flex-1">
          <span className="px-2.5 py-0.5 bg-[#E2D1B3] text-stone-950 text-[10px] font-bold uppercase tracking-widest rounded-full">
            {adminUser.role.replace('_', ' ')}
          </span>
          <h2 className="font-serif-luxury text-2xl font-normal uppercase tracking-wide mt-1">
            {adminUser.name}
          </h2>
          <p className="text-xs text-stone-400 font-mono">{adminUser.email}</p>
          <p className="text-[11px] text-stone-500 pt-1">
            Last authenticated active session: <span className="text-stone-300">{adminUser.lastLogin}</span>
          </p>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Account Info Form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-stone-800" />
            <h3 className="font-serif-luxury text-lg uppercase font-normal text-stone-950">
              Account Personal Information
            </h3>
          </div>

          <form onSubmit={handleUpdateDetails} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Assigned Role
              </label>
              <input
                type="text"
                disabled
                value="Super Administrator (Full System Scope)"
                className="w-full p-2.5 border border-stone-200 bg-stone-100 rounded-xl text-stone-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Profile Info</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-800" />
            <h3 className="font-serif-luxury text-lg uppercase font-normal text-stone-950">
              Security Credentials
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
