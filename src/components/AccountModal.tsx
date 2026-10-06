import React, { useState, useEffect } from 'react';
import { X, User, Package, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onOpenAdmin }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'orders'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check current user session on mount
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser(data.user);
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profile) setUserProfile(profile);
      }
    }
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (tab === 'register') {
        // Sign Up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim(),
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Explicitly ensure user_profiles record is created/updated
          await supabase.from('user_profiles').upsert({
            id: data.user.id,
            full_name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
            role: 'customer',
            is_active: true,
          });

          setSuccessMessage('Account created successfully in Supabase! You are now registered.');
          setCurrentUser(data.user);
          setUserProfile({
            full_name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role: 'customer',
          });
          setTab('orders');
        }
      } else {
        // Sign In with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMessage(
              'Email not confirmed yet. Please check your inbox or disable "Confirm email" in Supabase Dashboard (Auth -> Providers -> Email).'
            );
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          setCurrentUser(data.user);
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) setUserProfile(profile);
          setTab('orders');
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address above.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Confirmation email resent! Please check your inbox / spam folder.');
        setErrorMessage('');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resend confirmation email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    setTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FAF8F5] shadow-2xl p-6 border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-stone-900" />
            <h2 className="font-serif-luxury text-xl text-stone-950 uppercase font-normal">
              {currentUser ? 'Client Portal' : tab === 'login' ? 'Customer Sign In' : 'Create Account'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-stone-500 hover:text-stone-950 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
            {errorMessage.toLowerCase().includes('not confirmed') && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                className="self-start text-[11px] underline font-semibold text-stone-900 hover:text-stone-700 cursor-pointer"
              >
                Click here to resend verification email
              </button>
            )}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}

        {currentUser ? (
          <div className="py-6 space-y-4 text-xs">
            <div className="p-4 bg-white border border-stone-200">
              <p className="text-stone-500">Logged in as:</p>
              <p className="font-semibold text-stone-900 text-sm">
                {userProfile?.full_name || currentUser.email}
              </p>
              <p className="text-stone-500 mt-0.5 font-mono text-[11px]">{currentUser.email}</p>
              <p className="text-stone-500 mt-1">Role: {userProfile?.role || 'customer'} · Verified Client</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>Recent Orders</span>
              </h3>
              <div className="p-3 bg-white border border-stone-200 space-y-1">
                <p className="text-stone-500">No active orders found for this account.</p>
              </div>
            </div>

            {onOpenAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full py-2.5 bg-stone-900 text-white uppercase font-semibold text-xs hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🛡️</span>
                <span>Open Admin Control Panel</span>
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 border border-stone-300 text-stone-700 uppercase font-semibold text-xs hover:bg-stone-100 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="py-6 space-y-4 text-xs">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-stone-600 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fatima Malik"
                      className="w-full p-2.5 pl-9 border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full p-2.5 pl-9 border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-stone-600 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 pl-9 border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-stone-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 pl-9 border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-stone-950 text-white font-semibold uppercase tracking-widest text-xs hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Supabase...</span>
                </>
              ) : (
                <span>{tab === 'login' ? 'Sign In' : 'Create My Account'}</span>
              )}
            </button>

            <div className="text-center pt-2 space-y-2">
              <div>
                {tab === 'login' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setErrorMessage('');
                    }}
                    className="text-stone-600 hover:text-stone-950 underline cursor-pointer"
                  >
                    Don&apos;t have an account? Sign up
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setErrorMessage('');
                    }}
                    className="text-stone-600 hover:text-stone-950 underline cursor-pointer"
                  >
                    Already have an account? Sign in
                  </button>
                )}
              </div>

              {onOpenAdmin && (
                <div className="pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] uppercase tracking-wider text-stone-700 hover:text-stone-950 font-semibold cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <span>🛡️</span>
                    <span>Admin &amp; Staff Login</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
