import { useEffect, useState, useRef } from 'react';
import { Search, Sun, Moon, User, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function UtcClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(time.getUTCHours()).padStart(2, '0');
  const mm = String(time.getUTCMinutes()).padStart(2, '0');
  const ss = String(time.getUTCSeconds()).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 glass-sm rounded-lg">
      <span className="live-blink w-1.5 h-1.5 rounded-full bg-tac-green inline-block" />
      <span className="font-mono text-tac-cyan text-xs tracking-widest">
        {hh}:{mm}:{ss} <span className="text-[10px] opacity-60">UTC</span>
      </span>
    </div>
  );
}

export default function TopNav() {
  const { user, logout, isAdmin } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Cmd+K focus
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header
      className="glass-sm border-b h-14 flex items-center px-4 gap-4 shrink-0 z-30"
      style={{ borderColor: 'var(--border-glass)' }}
    >
      {/* Global Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text-data)' }} />
        <input
          id="global-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vessels, MMSI, alerts…"
          className="w-full glass-inset rounded-lg pl-9 pr-20 py-2 text-xs outline-none placeholder:opacity-40 transition-all focus:border-tac-cyan"
          style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono opacity-30 border rounded px-1"
          style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
        >
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* UTC Clock */}
        <UtcClock />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="glass-sm rounded-lg p-2 transition-all hover:border-tac-cyan/30"
          title={isDark ? 'Switch to day mode' : 'Switch to dark mode'}
        >
          {isDark
            ? <Sun size={15} className="text-tac-amber" />
            : <Moon size={15} className="text-tac-cyan" />
          }
        </button>

        {/* User profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2 glass-sm rounded-lg px-3 py-1.5 transition-all hover:border-tac-cyan/30"
          >
            <div className="w-6 h-6 rounded-full bg-tac-muted flex items-center justify-center">
              <User size={12} className="text-tac-cyan" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                {user?.username}
              </p>
              <p className="text-[10px] mt-0.5 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                {isAdmin ? 'Port Authority Admin' : 'Port Operator'}
              </p>
            </div>
            <ChevronDown size={12} className="opacity-40" style={{ color: 'var(--text-secondary)' }} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 glass rounded-xl p-1 z-50"
              style={{ border: '1px solid var(--border-glass)' }}
            >
              <div className="px-3 py-2.5 border-b mb-1" style={{ borderColor: 'var(--border-glass)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.username}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Shield size={10} className="text-tac-cyan" />
                  <span className="text-[10px] text-tac-cyan font-mono">
                    {isAdmin ? 'ADMIN ACCESS' : 'OPERATOR'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-tac-muted/30 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-tac-red/10 text-tac-red transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
