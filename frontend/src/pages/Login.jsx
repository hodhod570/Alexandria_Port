import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, ShieldCheck, Anchor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Login() {
  const [form, setForm]           = useState({ username: '', password: '', keypass: '' });
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showKp, setShowKp]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { username: form.username, password: form.password };
      if (showAdmin && form.keypass) payload.keypass = form.keypass;
      const { data } = await api.post('/auth/login', payload);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,242,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,102,255,0.08) 0%, transparent 65%)' }}
      />

      <div className="relative w-full max-w-sm enter-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-4 glow-pulse-anim">
            <Anchor size={28} className="text-tac-cyan" />
          </div>
          <h1 className="text-orb text-white text-xl font-bold tracking-wider">ALEXANDRIA PORT</h1>
          <p className="text-tac-cyan text-[10px] font-mono tracking-widest mt-1 opacity-70">
            C2 PORTAL — DARK SHIP DETECTION
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block font-mono text-[10px] tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                USER ID
              </label>
              <input
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full glass-inset rounded-lg px-3 py-2.5 text-sm outline-none transition-all font-mono focus:border-tac-cyan"
                style={{ color: 'var(--text-primary)' }}
                placeholder="Enter user ID"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono text-[10px] tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                PASSPHRASE
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full glass-inset rounded-lg px-3 py-2.5 pr-10 text-sm outline-none transition-all font-mono focus:border-tac-cyan"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Enter passphrase"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Admin Access toggle */}
            <div>
              <button
                type="button"
                onClick={() => { setShowAdmin(v => !v); setForm(f => ({ ...f, keypass: '' })); }}
                className={`flex items-center gap-2 text-[10px] font-mono font-bold tracking-wider transition-colors ${
                  showAdmin ? 'text-tac-cyan' : 'opacity-30 hover:opacity-60'
                }`}
              >
                <ShieldCheck size={13} />
                ADMIN ACCESS {showAdmin ? '[ ENABLED ]' : '[ DISABLED ]'}
              </button>

              {showAdmin && (
                <div className="mt-3 enter-up">
                  <label className="block font-mono text-[10px] tracking-widest mb-1.5 text-tac-cyan">
                    ADMIN KEYPASS
                  </label>
                  <div className="relative">
                    <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-tac-cyan opacity-50" />
                    <input
                      type={showKp ? 'text' : 'password'}
                      value={form.keypass}
                      onChange={e => setForm(f => ({ ...f, keypass: e.target.value }))}
                      className="w-full glass-inset rounded-lg pl-9 pr-10 py-2.5 text-sm outline-none transition-all font-mono tracking-widest focus:border-tac-cyan"
                      style={{ color: 'var(--text-data)' }}
                      placeholder="XXXX-XXXX-XXXX"
                    />
                    <button type="button" onClick={() => setShowKp(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-secondary)' }}>
                      {showKp ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="border rounded-lg px-3 py-2 font-mono text-[11px] text-tac-red border-tac-red/30 bg-tac-red/5">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-mono font-bold text-sm tracking-wider transition-all
                         bg-tac-cyan/15 text-tac-cyan border border-tac-cyan/40 hover:bg-tac-cyan/25
                         hover:glow-cyan disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-tac-cyan border-t-transparent rounded-full animate-spin" />}
              {loading ? 'AUTHENTICATING…' : 'AUTHENTICATE'}
            </button>
          </form>

          {/* Credentials hint */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-glass)' }}>
            <p className="font-mono text-[9px] opacity-30 mb-1" style={{ color: 'var(--text-secondary)' }}>DEMO ACCESS</p>
            <p className="font-mono text-[9px] opacity-40" style={{ color: 'var(--text-secondary)' }}>
              Operator: operator / port2024
            </p>
            <p className="font-mono text-[9px] opacity-40" style={{ color: 'var(--text-secondary)' }}>
              Admin: admin / admin123 + keypass
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
