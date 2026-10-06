import React, { useState, useEffect } from 'react';
import {
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Clock,
  LogOut,
  User,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Currency } from '../types';
import { formatPrice } from '../data/currencies';

interface AccountPageViewProps {
  onBackToStore: () => void;
  onOpenAdmin: () => void;
  currency: Currency;
  onSelectProduct?: (product: any) => void;
}

export const AccountPageView: React.FC<AccountPageViewProps> = ({
  onBackToStore,
  onOpenAdmin,
  currency,
}) => {
  // Mode: 'login' | 'register' | 'forgot' | 'track'
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'forgot' | 'track'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Track order form
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [isSearchingOrder, setIsSearchingOrder] = useState(false);
  const [trackError, setTrackError] = useState('');

  // User session
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load user session on mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        setIsLoadingSession(true);
        const { data } = await supabase.auth.getUser();

        if (data?.user && isMounted) {
          setCurrentUser(data.user);

          // Fetch profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile && isMounted) {
            setUserProfile(profile);
          }

          // Fetch user's orders
          const { data: orders } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (*)
            `)
            .or(`user_id.eq.${data.user.id},customer_email.eq.${data.user.email}`)
            .order('created_at', { ascending: false });

          if (orders && isMounted) {
            setUserOrders(orders);
          }
        }
      } catch {
        // Safe fallback
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    }

    loadUser();

    // Listen to Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMounted) {
        setCurrentUser(session.user);
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile && isMounted) setUserProfile(profile);
      } else if (isMounted) {
        setCurrentUser(null);
        setUserProfile(null);
        setUserOrders([]);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle Login or Register
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (viewMode === 'login') {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Incorrect email or password. Please try again.');
          }
          throw error;
        }

        if (data.user) {
          setCurrentUser(data.user);
          setSuccessMessage('Successfully signed in.');
        }
      } else if (viewMode === 'register') {
        // Sign Up
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName || 'Valued Client',
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('user_profiles').upsert({
            id: data.user.id,
            email: email.trim(),
            full_name: fullName || 'Valued Client',
            role: 'customer',
          });

          setCurrentUser(data.user);
          setUserProfile({
            full_name: fullName || 'Valued Client',
            email: email.trim(),
            role: 'customer',
          });
          setSuccessMessage('Your account has been created successfully!');
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());
      if (error) throw error;
      setSuccessMessage(`We have sent a password reset link to ${resetEmail.trim()}. Please check your inbox.`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    setUserOrders([]);
    setIsLoading(false);
    setViewMode('login');
  };

  // Track Guest Order
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    setIsSearchingOrder(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .ilike('order_number', `%${trackOrderNumber.trim()}%`)
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setTrackError('No order found matching the entered Order Number.');
      } else {
        setTrackedOrder(data);
      }
    } catch {
      setTrackError('Error connecting to order server.');
    } finally {
      setIsSearchingOrder(false);
    }
  };

  const isSuperAdminUser =
    userProfile?.role === 'admin' ||
    ['ahmadmalik59268@gmail.com', 'malik59223@gmail.com'].includes(
      (currentUser?.email || '').toLowerCase()
    );

  // If loading session on first visit
  if (isLoadingSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="w-6 h-6 animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-20">
      {/* If logged in: Show luxury customer account portal & admin switch */}
      {currentUser ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-[0.16em] text-stone-950 font-normal">
                MY ACCOUNT
              </h1>
              <p className="text-xs text-stone-600 font-light mt-1">
                Welcome back, <strong>{userProfile?.full_name || currentUser.email}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isSuperAdminUser && (
                <button
                  onClick={onOpenAdmin}
                  className="px-4 py-2 bg-stone-950 text-amber-300 border border-amber-300/40 text-xs font-medium tracking-wider uppercase flex items-center gap-2 hover:bg-stone-900 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span>Admin Panel</span>
                </button>
              )}

              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-stone-300 bg-white text-stone-700 text-xs tracking-wider uppercase hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>

          {/* Admin Notice Banner */}
          {isSuperAdminUser && (
            <div className="my-6 p-4 bg-stone-900 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Administrator account active ({currentUser.email})</span>
              </div>
              <button
                onClick={onOpenAdmin}
                className="underline hover:text-amber-300 uppercase tracking-widest text-[11px] cursor-pointer"
              >
                Manage Store &rarr;
              </button>
            </div>
          )}

          {/* Orders Section */}
          <div className="mt-8 space-y-6">
            <h2 className="font-heading text-lg uppercase tracking-[0.14em] text-stone-900 font-normal">
              Order History
            </h2>

            {userOrders.length === 0 ? (
              <div className="text-center py-12 bg-white border border-stone-200">
                <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs text-stone-600">You haven&apos;t placed any orders yet.</p>
                <button
                  onClick={onBackToStore}
                  className="mt-4 px-6 py-2 bg-stone-950 text-white text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-stone-200 p-4 sm:p-5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <span className="font-semibold text-stone-950">Order #{order.order_number}</span>
                        <span className="text-stone-400 ml-2">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-stone-100 text-stone-800 uppercase text-[10px] font-semibold tracking-wider">
                        {order.order_status || 'Confirmed'}
                      </span>
                    </div>

                    <div className="pt-3 flex items-center justify-between">
                      <div className="text-stone-600">
                        <span>Items: {order.order_items?.length || 1}</span>
                        <span className="mx-2">·</span>
                        <span>Payment: {order.payment_status || 'Pending'}</span>
                      </div>
                      <span className="font-semibold text-stone-950 font-mono">
                        PKR {Number(order.total_amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EXACT SHOPIFY LOGIN / REGISTER / FORGOT PASSWORD UI MATCHING SCREENSHOT */
        <div className="max-w-[440px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
          {/* Alerts */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN VIEW (1:1 Exact Match with Screenshot) */}
          {viewMode === 'login' && (
            <div>
              {/* Heading */}
              <h1 className="font-heading text-xl sm:text-2xl tracking-[0.16em] text-stone-900 uppercase font-normal text-center mb-8">
                LOGIN
              </h1>

              <form onSubmit={handleAuth} className="space-y-4">
                {/* EMAIL Field */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-stone-900 uppercase mb-1.5">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-stone-800 bg-transparent px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-0 rounded-none transition-colors"
                  />
                </div>

                {/* PASSWORD Field + Forgot password? link */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-stone-900 uppercase">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-[11px] text-stone-600 hover:text-stone-950 hover:underline cursor-pointer font-normal"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-stone-300 bg-[#FAF8F5]/40 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-800 rounded-none transition-colors"
                  />
                </div>

                {/* SIGN IN Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#000000] text-[#FFFFFF] text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-none disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>SIGN IN</span>
                    )}
                  </button>
                </div>

                {/* Create Account Link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-stone-700 hover:text-stone-950 hover:underline cursor-pointer font-normal"
                  >
                    Create account
                  </button>
                </div>
              </form>

              {/* Discreet Footer Utilities (Track Order & Admin Access) */}
              <div className="mt-12 pt-6 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                <button
                  onClick={() => {
                    setViewMode('track');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="hover:text-stone-900 underline cursor-pointer"
                >
                  Track Order without login
                </button>

                <button
                  onClick={onOpenAdmin}
                  className="hover:text-stone-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Shield className="w-3 h-3 text-stone-700" />
                  <span>Admin Login</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. CREATE ACCOUNT VIEW */}
          {viewMode === 'register' && (
            <div>
              <h1 className="font-heading text-xl sm:text-2xl tracking-[0.16em] text-stone-900 uppercase font-normal text-center mb-8">
                CREATE ACCOUNT
              </h1>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-stone-900 uppercase mb-1.5">
                    FIRST NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-stone-300 bg-transparent px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-800 rounded-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-stone-900 uppercase mb-1.5">
                    LAST NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-stone-300 bg-transparent px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-800 rounded-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-stone-900 uppercase mb-1.5">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-stone-800 bg-transparent px-3 py-2 text-xs text-stone-900 focus:outline-none rounded-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-stone-900 uppercase mb-1.5">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-stone-300 bg-transparent px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-800 rounded-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#000000] text-[#FFFFFF] text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>CREATE</span>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-stone-700 hover:text-stone-950 hover:underline cursor-pointer font-normal"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. FORGOT PASSWORD VIEW */}
          {viewMode === 'forgot' && (
            <div>
              <h1 className="font-heading text-xl sm:text-2xl tracking-[0.16em] text-stone-900 uppercase font-normal text-center mb-3">
                RESET YOUR PASSWORD
              </h1>
              <p className="text-xs text-stone-600 text-center mb-8 font-light">
                We will send you an email to reset your password.
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-stone-900 uppercase mb-1.5">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full border border-stone-800 bg-transparent px-3 py-2 text-xs text-stone-900 focus:outline-none rounded-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#000000] text-[#FFFFFF] text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>SUBMIT</span>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-stone-700 hover:text-stone-950 hover:underline cursor-pointer font-normal"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. TRACK ORDER VIEW */}
          {viewMode === 'track' && (
            <div>
              <h1 className="font-heading text-xl sm:text-2xl tracking-[0.16em] text-stone-900 uppercase font-normal text-center mb-3">
                TRACK DISPATCH
              </h1>
              <p className="text-xs text-stone-600 text-center mb-8 font-light">
                Enter your order number from your receipt to check real-time status.
              </p>

              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-stone-900 uppercase mb-1.5">
                    ORDER NUMBER
                  </label>
                  <input
                    type="text"
                    required
                    value={trackOrderNumber}
                    onChange={(e) => setTrackOrderNumber(e.target.value)}
                    placeholder="e.g. AHM-84920"
                    className="w-full border border-stone-800 bg-transparent px-3 py-2 text-xs text-stone-900 focus:outline-none font-mono rounded-none"
                  />
                </div>

                {trackError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs">
                    {trackError}
                  </div>
                )}

                {trackedOrder && (
                  <div className="p-4 bg-white border border-stone-300 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-900">Order #{trackedOrder.order_number}</span>
                      <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] uppercase font-bold">
                        {trackedOrder.order_status || 'Processing'}
                      </span>
                    </div>
                    <p className="text-stone-600">Recipient: {trackedOrder.customer_name}</p>
                    <p className="text-stone-900 font-semibold font-mono">
                      Amount: PKR {Number(trackedOrder.total_amount).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSearchingOrder}
                    className="w-full py-3 bg-[#000000] text-[#FFFFFF] text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-none"
                  >
                    {isSearchingOrder ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <span>TRACK STATUS</span>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-stone-700 hover:text-stone-950 hover:underline cursor-pointer font-normal"
                  >
                    &larr; Back to Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
