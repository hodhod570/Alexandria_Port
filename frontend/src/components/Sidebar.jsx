import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Globe2, ShieldAlert, Satellite, Ship,
  BarChart2, Settings, ChevronLeft, ChevronRight,
  Radio, Anchor, Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',                 label: 'Command Dashboard', short: 'CMD',   Icon: LayoutGrid  },
  { to: '/map',              label: '3D Tactical Map',   short: 'MAP',   Icon: Globe2      },
  { to: '/alerts',           label: 'Threat Matrix',     short: 'THR',   Icon: ShieldAlert, live: true },
  { to: '/sar',              label: 'SAR Intelligence',  short: 'SAR',   Icon: Satellite   },
  { to: '/vessels',          label: 'Vessel Registry',   short: 'VES',   Icon: Ship        },
  { to: '/integrated-feed',  label: 'Integrated Feed',   short: 'INT',   Icon: Activity    },
  { to: '/analytics',        label: 'Analytics',         short: 'ANLY',  Icon: BarChart2,   adminOnly: true },
  { to: '/settings',         label: 'Settings',          short: 'SET',   Icon: Settings    },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { isAdmin } = useAuth();
  const navItems = NAV.filter(n => !n.adminOnly || isAdmin);

  return (
    <aside
      className="flex flex-col border-r shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-glass)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-3 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border-glass)', minHeight: 64 }}
      >
        <div className="shrink-0 w-9 h-9 rounded-lg glass-inset flex items-center justify-center glow-pulse-anim">
          <Anchor size={16} className="text-tac-cyan" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-orb text-white text-[11px] font-bold tracking-wider whitespace-nowrap leading-tight">
              ALEX PORT
            </p>
            <p className="text-tac-cyan text-[9px] tracking-widest uppercase whitespace-nowrap opacity-70">
              C2 PORTAL
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
        {navItems.map(({ to, label, short, Icon, live }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-150 group
               ${isActive
                 ? 'bg-tac-cyan/10 border border-tac-cyan/20 text-tac-cyan'
                 : 'text-[var(--text-secondary)] hover:bg-tac-cyan/5 hover:text-[var(--text-primary)] border border-transparent'
               }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-tac-cyan rounded-r-full" />
                )}
                <Icon size={16} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-xs font-medium whitespace-nowrap tracking-wide">{label}</span>
                    {live && (
                      <span className="ml-auto flex items-center gap-1 bg-tac-red/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        <span className="live-blink w-1 h-1 rounded-full bg-white inline-block" />
                        LIVE
                      </span>
                    )}
                  </>
                )}
                {collapsed && (
                  <span className="sr-only">{short}</span>
                )}
                {collapsed && live && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-tac-red live-blink" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* AI Agent Status */}
      <div
        className="border-t px-3 py-3"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="glass-inset rounded-lg px-2.5 py-2 flex items-center gap-2">
          <span className="relative flex shrink-0">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-tac-green opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tac-green" />
          </span>
          {!collapsed && (
            <div>
              <p className="text-tac-green text-[9px] font-mono font-bold tracking-wider">AI AGENT ACTIVE</p>
              <p className="text-[9px] opacity-50 font-mono" style={{ color: 'var(--text-secondary)' }}>
                Scanning Sector 4-B
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="mt-2 flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-tac-cyan/5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {collapsed
            ? <ChevronRight size={15} className="mx-auto" />
            : <><ChevronLeft size={15} /><span className="text-[11px]">Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}
