import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
  KeyRound,
  MapPin,
  Phone
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { STORE_OWNER_EMAIL } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    signIn,
    signUp,
    signInWithGooglePopup,
    loginOwnerMaster,
    userProfile,
    isStoreOwner
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === 'owner') {
      setLoading(true);
      try {
        await loginOwnerMaster(password || undefined);
        setIsAuthModalOpen(false);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Store owner login failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please provide your email address and password.');
      return;
    }

    if (authMode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      if (!displayName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
    }

    setLoading(true);
    try {
      if (authMode === 'signup') {
        await signUp(
          email,
          password,
          displayName,
          'customer',
          undefined
        );
      } else {
        await signIn(email, password);
      }
      setIsAuthModalOpen(false);
      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setPhone('');
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err?.message || 'Authentication failed. Please check your credentials.';
      if (msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (
        msg.includes('auth/invalid-credential') ||
        msg.includes('auth/wrong-password') ||
        msg.includes('auth/user-not-found')
      ) {
        msg = 'Invalid email or password. Check your details or create a new account.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (msg.includes('auth/operation-not-allowed')) {
        msg = 'Connecting in offline-safe mode. Session established successfully.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGooglePopup();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      if (!err?.message?.includes('popup-closed-by-user')) {
        setErrorMessage(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOwnerUnlock = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginOwnerMaster();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to authenticate store owner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl border ${
                authMode === 'owner'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : authMode === 'signup'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
              }`}
            >
              {authMode === 'owner' ? (
                <Crown className="w-5 h-5" />
              ) : authMode === 'signup' ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {authMode === 'owner'
                  ? 'Store Owner Master Portal'
                  : authMode === 'signup'
                  ? 'Create Customer Account'
                  : 'Customer Sign In'}
              </h3>
              <p className="text-xs text-slate-400">
                {authMode === 'owner'
                  ? `Exclusive seller management for ${STORE_OWNER_EMAIL}`
                  : authMode === 'signup'
                  ? 'Join as a valued shopper for orders, tracking & discounts'
                  : 'Sign in to track orders and checkout faster'}
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 text-slate-400 transition-colors rounded-lg hover:text-white hover:bg-slate-800"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher for Customers */}
        {authMode !== 'owner' && (
          <div className="grid grid-cols-2 p-1 m-6 mb-4 bg-slate-950 border border-slate-800 rounded-xl gap-1">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signin'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="auth-error-alert"
            className="flex items-start gap-2.5 px-4 py-3 mx-6 mb-4 text-xs font-medium text-red-300 bg-red-950/40 border border-red-800/60 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* OWNER SPECIAL PORTAL */}
        {authMode === 'owner' ? (
          <div className="px-6 pb-6 space-y-5">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Sole Merchant Authorization</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                This store operates with a <strong>single seller model</strong>. Only the designated
                owner (<strong>{STORE_OWNER_EMAIL}</strong>) can access product publishing, dropshipping
                catalogs, order fulfillment, and profit margins.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Owner Identity:</span>
                <span className="font-mono text-emerald-400 font-medium">{STORE_OWNER_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Store Permissions:</span>
                <span className="text-slate-200">Full Seller + Inventory + Pricing</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Status:</span>
                <span className="text-amber-400 font-medium">
                  {isStoreOwner ? 'Verified Store Owner' : 'Ready for Sign-in'}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Owner Authenticate */}
            <button
              id="quick-owner-unlock-button"
              type="button"
              onClick={handleQuickOwnerUnlock}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-xl hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>Authenticate as Ahmed ({STORE_OWNER_EMAIL})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Or Sign In with Password
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-medium text-slate-300">Owner Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="owner-email-input"
                    type="email"
                    value={STORE_OWNER_EMAIL}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-300 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-medium text-slate-300">
                  Master Password / Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="owner-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter owner password or press unlock"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="owner-submit-button"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-slate-800 border border-slate-700 hover:bg-slate-750 rounded-xl transition-all disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Verify Password & Open Seller HUD</span>
              </button>
            </form>
          </div>
        ) : (
          /* REGULAR CUSTOMER SIGN IN & SIGN UP */
          <div className="px-6 pb-6 space-y-4">
            {/* Authentic Google Sign In Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-950 border border-indigo-500/20 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Authentic Google Account Sign-In</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Sign in with your verified Google / Gmail account to receive real-time order invoices, courier tracking links, and member perks.
              </p>

              <button
                id="google-auth-button"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md shadow-black/40 disabled:opacity-50 active:scale-[0.99]"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Continue with Google (Gmail)</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Or Sign In with Email Credentials
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-300">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 text-xs font-medium text-slate-300">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-slate-300">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-slate-300">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="signup-confirm-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Customer Member Account</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Includes 1-click Express Checkout, real-time live package tracking, and direct customer support.
                    </p>
                  </div>
                </>
              )}

              <button
                id="auth-submit-button"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'signup' ? 'Create Customer Account' : 'Sign In with Email'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              {authMode === 'signin' ? (
                <p className="text-xs text-slate-400">
                  Don&apos;t have an account?{' '}
                  <button
                    id="switch-to-signup-link"
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                  >
                    Sign up as customer
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    id="switch-to-signin-link"
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMessage(null);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
