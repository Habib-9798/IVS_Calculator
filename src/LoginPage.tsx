import React, { useState } from 'react';
import { GraduationCap, Lock, LogIn, AlertCircle } from 'lucide-react';
import { signIn } from './utils/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    const { error } = await signIn(email.trim(), password);

    if (error) {
      setError('Incorrect email or password. Please try again.');
      setLoading(false);
      return;
    }

    /*
      Login succeeded.

      AuthContext should receive the Supabase SIGNED_IN event,
      fetch the user profile, and move the user away from /login.

      We still stop this button spinner so the page does not appear stuck
      if profile loading or redirecting takes longer than expected.
    */
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">

        {/* Logo + School Name */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#7a1f2b] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">IQRA VIRTUAL SCHOOL</h1>
          <p className="text-slate-500 text-sm mt-1">Fee Calculator — Staff Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#7a1f2b]/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#7a1f2b]" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Sign In</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7a1f2b] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7a1f2b] focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7a1f2b] hover:bg-[#651923] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Contact admin if you forgot your password
        </p>
      </div>
    </div>
  );
}
