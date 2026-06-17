import { useEffect, useState } from 'react';
import { Download, TrendingUp, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import api from '../lib/api';
import TacticalCard, { CardHeader } from '../components/TacticalCard';

const PERIODS = [7, 30, 90];

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

export default function Analytics() {
  const [data, setData]       = useState(null);
  const [period, setPeriod]   = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/analytics', { params: { period } })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const handleExport = () => window.open('/api/analytics/export', '_blank');

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-4 enter-up">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 glass-sm rounded-lg p-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                period === p
                  ? 'bg-tac-cyan/15 text-tac-cyan border border-tac-cyan/30'
                  : 'opacity-40 hover:opacity-70'
              }`}
            >
              {p}D
            </button>
          ))}
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 glass-sm rounded-lg px-4 py-2 text-tac-cyan text-[10px] font-mono font-bold hover:glow-cyan transition-all"
        >
          <Download size={13} /> EXPORT CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-tac-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Detection Trend */}
          <TacticalCard>
            <CardHeader
              icon={TrendingUp}
              title={`Detection Trend — ${period} Days`}
              sub="Total alerts and dark ship detections per day"
            />
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.detectionTrend} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,242,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#3d5a7a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false} tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#3d5a7a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#8da0b8', paddingTop: 8 }} />
                  <Line type="monotone" dataKey="alerts"    name="Total Alerts" stroke="#00f2ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00f2ff' }} />
                  <Line type="monotone" dataKey="darkShips" name="Dark Ships"   stroke="#ff0055" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ff0055' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TacticalCard>

          {/* Distribution cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Severity Distribution */}
            <TacticalCard>
              <CardHeader icon={BarChart2} title="Severity Distribution" sub="All alerts by severity level" />
              <div className="p-5 space-y-3">
                {data.severityDistribution.map(({ severity, count }) => {
                  const colors = { Critical: '#ff0055', High: '#ffaa00', Medium: '#00f2ff', Low: '#3d5a7a' };
                  const max = Math.max(...data.severityDistribution.map(s => s.count));
                  const color = colors[severity] || '#3d5a7a';
                  return (
                    <div key={severity} className="flex items-center gap-3">
                      <span className="font-mono text-[10px] w-14" style={{ color }}>{severity.toUpperCase()}</span>
                      <div className="flex-1 h-1.5 bg-tac-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(count / max) * 100}%`, background: color }} />
                      </div>
                      <span className="font-mono text-[11px] font-bold w-4 text-right" style={{ color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </TacticalCard>

            {/* Alert Types */}
            <TacticalCard>
              <CardHeader icon={BarChart2} title="Alert Types" sub="Breakdown by detection category" />
              <div className="p-5 space-y-3">
                {data.alertTypes.map(({ type, count }) => {
                  const max = Math.max(...data.alertTypes.map(t => t.count));
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="font-mono text-[10px] w-28 opacity-70" style={{ color: 'var(--text-secondary)' }}>{type}</span>
                      <div className="flex-1 h-1.5 bg-tac-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-tac-cyan transition-all" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-tac-cyan w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </TacticalCard>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'TOTAL ALERTS',     value: data.totalAlerts,       color: 'text-tac-cyan' },
              { label: 'DARK SHIPS FOUND', value: data.darkShipsDetected, color: 'text-tac-red'   },
              { label: 'RESOLVED',         value: data.resolvedAlerts,    color: 'text-tac-green' },
              { label: 'ACTIVE VESSELS',   value: data.activeVessels,     color: 'text-tac-cyan'  },
            ].map(({ label, value, color }) => (
              <TacticalCard key={label} className="p-4 text-center">
                <p className={`font-mono text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-orb text-[9px] font-bold tracking-widest mt-1 opacity-50" style={{ color: 'var(--text-secondary)' }}>
                  {label}
                </p>
              </TacticalCard>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center py-10 font-mono text-[11px] opacity-30" style={{ color: 'var(--text-secondary)' }}>
          ANALYTICS DATA UNAVAILABLE
        </p>
      )}
    </div>
  );
}
