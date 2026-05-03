import React, { useState } from 'react';
import { useAuth } from '../lib/auth';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message?.includes('401') || /unauth/i.test(err?.message) ? 'Invalid credentials' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-display text-5xl text-zinc-900 mb-2">CARVO</div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-zinc-400 font-bold">Admin Console</div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm">
          <h1 className="font-bold text-2xl text-zinc-900 mb-6">Sign in</h1>

          <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl mb-5 focus:outline-none focus:border-zinc-900"
            required
          />

          <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl mb-5 focus:outline-none focus:border-zinc-900"
            required
          />

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-zinc-900 text-white rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-zinc-800 transition disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Default credentials are printed in the backend log on first run.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
