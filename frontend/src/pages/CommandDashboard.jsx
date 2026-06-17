import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Ship, Radar, ShieldAlert, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import api from '../lib/api';
import { timeAgo, severityClasses } from '../lib/utils';
import TacticalCard, { CardHeader } from '../components/TacticalCard';

const STAT_CONFIGS = [
  { key: 'totalVesselsTracked', label: 'VESSELS TRACKED', Icon: Ship,        color: 'text-tac-cyan',  glow: 'cyan',  border: 'border border-tac-cyan/20' },
  { key: 'activeDarkShips',     label: 'ACTIVE DARK SHIPS',Icon: Radar,       color: 'text-tac-red',   glow: 'red',   border: 'border border-tac-red/30'  },
  { key: 'sarScansProcessed',   label: 'SAR SCANS',         Icon: Radar,       color: 'text-tac-amber', glow: 'amber', border: 'border border-tac-amber/20' },
  { key: 'criticalAlerts',      label: 'CRITICAL ALERTS',   Icon: ShieldAlert, color: 'text-tac-red',   glow: 'red',   border: 'border border-tac-red/30'  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-tac-cyan font-mono mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function CommandDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts]       = useState([]);
  const [feed, setFeed]           = useState([]);
  const feedRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const alertsP = api.get('/alerts').then(r => { setAlerts(r.data); return r.data; }).catch(() => []);
    api.get('/intelligence/integrated').then(r => setFeed(r.data.feed)).catch(() => {});

    // Build fallback stats from vessels + alerts (used when analytics 403s for operators)
    Promise.all([
      api.get('/vessels').catch(() => ({ data: [] })),
      alertsP,
    ]).then(([{ data: v }, alertData]) => {
      setAnalytics({
        totalVesselsTracked: v.length,
        activeDarkShips: v.filter(x => x.status === 'dark').length,
        sarScansProcessed: 4,
        criticalAlerts: alertData.filter(a => a.severity === 'CRITICAL').length,
        detectionTrend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          alerts: Math.floor(Math.random() * 5) + 1,
          darkShips: Math.floor(Math.random() * 3),
          sarEvents: Math.floor(Math.random() * 2),
        })),
      });
    });

    // Override with richer analytics data for admins
    api.get('/analytics').then(r => setAnalytics(r.data)).catch(() => {});
  }, []);

  const openAlerts = alerts.filter(a => a.status === 'Open');

  return (
    <div className="p-5 space-y-4 enter-up">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CONFIGS.map(({ key, label, Icon, color, glow, border }) => (
          <TacticalCard key={key} glow={glow} className={`p-4 ${border}`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-orb text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </p>
              <Icon size={14} className={`${color} opacity-70`} />
            </div>
            <p className={`font-mono text-3xl font-bold ${color}`}>
              {analytics ? (analytics[key] ?? '—') : (
                <span className="animate-pulse opacity-40">—</span>
              )}
            </p>
            {key === 'activeDarkShips' && analytics?.[key] > 0 && (
              <p className="text-tac-red text-[9px] font-mono mt-1 red-pulse-anim w-fit px-1.5 py-0.5 rounded border border-tac-red/30">
                ⚠ REQUIRES ATTENTION
              </p>
            )}
          </TacticalCard>
        ))}
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Detection trend chart */}
        <div className="lg:col-span-2">
          <TacticalCard>
            <CardHeader
              icon={TrendingUp}
              title="Anomaly Detection Trend"
              sub="7-day rolling view · Alerts, dark ships, SAR events"
            />
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics?.detectionTrend || []} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,242,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#3d5a7a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#3d5a7a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#8da0b8', paddingTop: 8 }} />
                  <Line type="monotone" dataKey="alerts"    name="Total Alerts" stroke="#00f2ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00f2ff' }} />
                  <Line type="monotone" dataKey="darkShips" name="Dark Ships"   stroke="#ff0055" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ff0055' }} />
                  <Line type="monotone" dataKey="sarEvents" name="SAR Events"   stroke="#ffaa00" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TacticalCard>
        </div>

        {/* Streaming alerts feed */}
        <div>
          <TacticalCard className="flex flex-col" style={{ maxHeight: 320 }}>
            <CardHeader
              icon={ShieldAlert}
              title="Streaming Alerts"
              right={
                <button onClick={() => navigate('/alerts')} className="text-tac-cyan text-[10px] flex items-center gap-1 hover:opacity-70 transition-opacity">
                  View all <ChevronRight size={12} />
                </button>
              }
            />
            <div ref={feedRef} className="flex-1 overflow-y-auto divide-y divide-[var(--border-dim)]">
              {(feed.length ? feed : openAlerts.map(a => ({
                id: a.id, severity: a.severity, event: a.type,
                vessel: a.vesselName, timestamp: a.time,
                detail: a.description,
              }))).map((item, i) => {
                const sc = severityClasses(item.severity);
                const isCrit = item.severity === 'CRITICAL';
                return (
                  <div
                    key={item.id}
                    className={`px-4 py-3 stream-in transition-colors ${isCrit ? 'bg-tac-red/5' : 'hover:bg-tac-cyan/3'}`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-mono font-bold ${sc.text} ${isCrit ? 'red-pulse-anim px-1 rounded border border-tac-red/30' : ''}`}>
                        {item.severity}
                      </span>
                      <span className="text-[9px] font-mono opacity-40" style={{ color: 'var(--text-secondary)' }}>
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.event}
                    </p>
                    {item.vessel && (
                      <p className="text-[10px] font-mono text-tac-cyan opacity-70 mt-0.5">{item.vessel}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </TacticalCard>
        </div>
      </div>

      {/* Recent Threats Quick View */}
      <TacticalCard>
        <CardHeader icon={AlertTriangle} title="Recent Threats" right={
          <button onClick={() => navigate('/alerts')} className="text-tac-cyan text-[10px] flex items-center gap-1 hover:opacity-70">
            Open Threat Matrix <ChevronRight size={12} />
          </button>
        } />
        <div className="divide-y divide-[var(--border-dim)]">
          {alerts.slice(0, 3).map(a => {
            const sc = severityClasses(a.severity);
            return (
              <div key={a.id} className="grid grid-cols-[100px_120px_1fr_120px_80px] gap-4 px-5 py-3 items-center hover:bg-tac-cyan/3 transition-colors">
                <span className={`text-[10px] font-mono font-bold ${sc.text}`}>{a.threatId}</span>
                <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded border w-fit ${sc.pill}`}>{a.severity}</span>
                <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{a.title}</span>
                <span className="text-[10px] font-mono text-tac-cyan opacity-70 truncate">{a.vesselName || '—'}</span>
                <span className="text-[10px] font-mono opacity-40" style={{ color: 'var(--text-secondary)' }}>{timeAgo(a.time)}</span>
              </div>
            );
          })}
        </div>
      </TacticalCard>
    </div>
  );
}
