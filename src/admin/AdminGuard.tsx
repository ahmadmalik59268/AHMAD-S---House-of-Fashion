import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowLeft, LogIn, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminGuardProps {
  onCancelToStore: () => void;
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  onCancelToStore,
  children,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
  const [nonAdminUserEmail, setNonAdminUserEmail] = useState<string | null>(null);

  // Check existing Supabase session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkCurrentSession() {
      try {
        setIsLoadingAuth(true);

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          if (isMounted) {
            setIsAuthenticatedAdmin(false);
            setIsLoadingAuth(false);
          }
          return;
        }

        // Auto-promote store owner emails or check role
        const userEmail = (authData.user.email || '').toLowerCase();
        const superAdmins = ['ahmadmalik59268@gmail.com', 'malik59223@gmail.com'];
        if (superAdmins.includes(userEmail)) {
          await supabase.from('user_profiles').upsert({
            id: authData.user.id,
            full_name: 'Ahmad Malik (Super Admin)',
            email: authData.user.email,
            role: 'admin',
            is_active: true,
          });
          if (isMounted) {
            setIsAuthenticatedAdmin(true);
            setNonAdminUserEmail(null);
            setIsLoadingAuth(false);
          }
          return;
        }

        // Check role in user_profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, is_active, full_name, email')
          .eq('id', authData.user.id)
          .single();

        if (profileError || !profile) {
          if (isMounted) {
            setNonAdminUserEmail(authData.user.email || null);
            setIsAuthenticatedAdmin(false);
            setIsLoadingAuth(false);
          }
          return;
        }

        if (profile.role === 'admin' && profile.is_active) {
          if (isMounted) {
            setIsAuthenticatedAdmin(true);
            setNonAdminUserEmail(null);
            setIsLoadingAuth(false);
          }
        } else {
          if (isMounted) {
            setNonAdminUserEmail(authData.user.email || null);
            setIsAuthenticatedAdmin(false);
            setIsLoadingAuth(false);
          }
        }
      } catch (err) {
        console.error('Admin auth check error:', err);
        if (isMounted) {
          setIsAuthenticatedAdmin(false);
          setIsLoadingAuth(false);
        }
      }
    }

    checkCurrentSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthenticatedAdmin(false);
        setNonAdminUserEmail(null);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setErrorMsg(error.message || 'Authentication failed. Please verify your credentials.');
        setIsSubmitting(false);
        return;
      }

      if (!data.user) {
        setErrorMsg('No user returned from Supabase.');
        setIsSubmitting(false);
        return;
      }

      const userEmail = (data.user.email || '').toLowerCase();
      const superAdmins = ['ahmadmalik59268@gmail.com', 'malik59223@gmail.com'];
      if (superAdmins.includes(userEmail)) {
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          full_name: 'Ahmad Malik (Super Admin)',
          email: data.user.email,
          role: 'admin',
          is_active: true,
        });
        setIsAuthenticatedAdmin(true);
        setNonAdminUserEmail(null);
        return;
      }

      // Check role in user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, is_active')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setErrorMsg('User profile not found in public.user_profiles. Access denied.');
        setIsSubmitting(false);
        return;
      }

      if (profile.role !== 'admin') {
        await supabase.auth.signOut();
        setErrorMsg(`Access Denied: Your account role is "${profile.role}". Only users with role "admin" can access the Admin Panel.`);
        setIsSubmitting(false);
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setErrorMsg('Access Denied: This administrator account has been deactivated.');
        setIsSubmitting(false);
        return;
      }

      setIsAuthenticatedAdmin(true);
      setNonAdminUserEmail(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticatedAdmin(false);
    setNonAdminUserEmail(null);
    setErrorMsg('');
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#E2D1B3]" />
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
            Verifying Supabase Admin Role...
          </p>
        </div>
      </div>
    );
  }

  // If user is verified as an active admin -> render full admin panel
  if (isAuthenticatedAdmin) {
    return <>{children}</>;
  }

  // If user is logged in as a normal customer (non-admin)
  if (nonAdminUserEmail) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 selection:bg-stone-800 selection:text-white">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-800 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="font-serif-luxury text-2xl uppercase tracking-[0.2em] text-white">
              Access Denied
            </h1>
            <p className="text-xs text-stone-400">
              Authenticated as: <span className="text-stone-200 font-medium">{nonAdminUserEmail}</span>
            </p>
          </div>

          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-300 text-left space-y-2">
            <p className="font-semibold text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Administrator Privileges Required
            </p>
            <p className="text-stone-400 leading-relaxed">
              Your account has the role of a regular customer. Only users whose <code className="text-[#E2D1B3] bg-stone-900 px-1 py-0.5 rounded">user_profiles.role</code> is set to <strong className="text-white">&apos;admin&apos;</strong> in Supabase can access this portal.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out &amp; Use Admin Account</span>
            </button>

            <button
              onClick={onCancelToStore}
              className="w-full py-3 bg-stone-950 hover:bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to AHMAD&apos;S Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Render /admin/login form
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 selection:bg-stone-800 selection:text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-stone-950 via-[#181614] to-stone-950 opacity-90 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-stone-900 border border-stone-800 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mx-auto text-[#E2D1B3] shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="font-serif-luxury text-2xl sm:text-3xl uppercase tracking-[0.2em] font-normal text-white">
            AHMAD&apos;S ADMIN
          </h1>
          <p className="text-xs uppercase tracking-widest text-stone-400">
            Protected Management Gateway · /admin/login
          </p>
        </div>

        <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl text-xs text-stone-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Strict Supabase RBAC Enforcement: Authenticates with Supabase Auth and validates <code className="text-[#E2D1B3]">role = &apos;admin&apos;</code> in PostgreSQL.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-400 mb-1.5 font-medium uppercase tracking-wider">
              Supabase Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ahmads.pk"
                className="w-full p-3 pl-10 bg-stone-950 border border-stone-700 focus:border-[#E2D1B3] rounded-xl text-white focus:outline-none transition-colors"
              />
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-stone-400 mb-1.5 font-medium uppercase tracking-wider">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-3 pl-10 bg-stone-950 border border-stone-700 focus:border-[#E2D1B3] rounded-xl text-white focus:outline-none transition-colors"
              />
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#FAF8F5] hover:bg-stone-200 text-stone-950 font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Role in Supabase...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>LOGIN AS ADMIN</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-stone-800">
          <button
            onClick={onCancelToStore}
            className="text-stone-400 hover:text-white text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to AHMAD&apos;S Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
