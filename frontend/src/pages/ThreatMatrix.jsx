import { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import api from '../lib/api';
import { timeAgo, severityClasses, flagEmoji } from '../lib/utils';
import TacticalCard, { CardHeader } from '../components/TacticalCard';
import { ShieldAlert } from 'lucide-react';

const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES   = ['All', 'Open', 'Acknowledged', 'Resolved'];
const COLS = ['Threat ID', 'Severity', 'Location', 'Vessel', 'Confidence', 'Status', 'Time'];

function SortIcon({ col, sort }) {
  if (sort.col !== col) return <ChevronsUpDown size={11} className="opacity-20" />;
  return sort.dir === 'asc' ? <ChevronUp size={11} className="text-tac-cyan" /> : <ChevronDown size={11} className="text-tac-cyan" />;
}

function ConfidenceBar({ value }) {
  const color = value >= 90 ? '#ff0055' : value >= 70 ? '#ffaa00' : '#00f2ff';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-tac-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px]" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function ThreatMatrix() {
  const [alerts, setAlerts]     = useState([]);
  const [search, setSearch]     = useState('');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus]     = useState('Open');
  const [sort, setSort]         = useState({ col: 'Time', dir: 'desc' });
  const [selected, setSelected] = useState(null);

  const load = () => {
    api.get('/alerts', { params: { severity, status, search } })
      .then(r => setAlerts(r.data))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [severity, status, search]);

  const handleSort = (col) => {
    setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const sorted = [...alerts].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.col === 'Severity') {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return dir * ((order[a.severity] ?? 4) - (order[b.severity] ?? 4));
    }
    if (sort.col === 'Confidence') return dir * (a.confidence - b.confidence);
    if (sort.col === 'Time') return dir * (new Date(a.time) - new Date(b.time));
    if (sort.col === 'Threat ID') return dir * a.threatId.localeCompare(b.threatId);
    return 0;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/alerts/${id}/status`, { status: newStatus });
      load();
      setSelected(null);
    } catch {}
  };

  return (
    <div className="p-5 space-y-4 enter-up">
      <TacticalCard>
        <CardHeader icon={ShieldAlert} title="Threat Matrix" sub="Sortable dark-ship intelligence feed" />

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'var(--border-glass)' }}>
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-tac-cyan opacity-40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vessel, MMSI, threat ID…"
              className="glass-inset rounded-lg pl-8 pr-3 py-2 text-xs outline-none w-56"
              style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>

          {/* Severity dropdown */}
          <div className="relative">
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="glass-inset rounded-lg px-3 py-2 text-[11px] font-mono outline-none appearance-none pr-8 cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              {SEVERITIES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Severity' : s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-tac-cyan" />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1 glass-sm rounded-lg p-1">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                  status === s
                    ? 'bg-tac-cyan/15 text-tac-cyan border border-tac-cyan/30'
                    : 'opacity-40 hover:opacity-70'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <span className="ml-auto font-mono text-[10px] text-tac-cyan opacity-60">
            {sorted.length} THREAT{sorted.length !== 1 ? 'S' : ''}
          </span>
        </div>

        {/* Table header */}
        <div
          className="grid gap-3 px-5 py-2 border-b"
          style={{ gridTemplateColumns: '90px 90px 160px 1fr 120px 100px 80px', borderColor: 'var(--border-dim)' }}
        >
          {COLS.map(col => (
            <button
              key={col}
              onClick={() => handleSort(col)}
              className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider hover:text-tac-cyan transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {col} <SortIcon col={col} sort={sort} />
            </button>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-tac-cyan/5">
          {sorted.length === 0 ? (
            <p className="text-center py-12 text-xs font-mono opacity-30" style={{ color: 'var(--text-secondary)' }}>
              NO THREATS MATCH FILTER CRITERIA
            </p>
          ) : sorted.map((alert, i) => {
            const sc = severityClasses(alert.severity);
            const isCrit = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id}
                onClick={() => setSelected(selected?.id === alert.id ? null : alert)}
                className={`grid gap-3 px-5 py-3.5 items-center cursor-pointer transition-all hover:bg-tac-cyan/3 ${
                  isCrit ? 'bg-tac-red/4' : ''
                } ${selected?.id === alert.id ? 'bg-tac-cyan/5' : ''}`}
                style={{ gridTemplateColumns: '90px 90px 160px 1fr 120px 100px 80px', animationDelay: `${i * 40}ms` }}
              >
                {/* Threat ID */}
                <span className="font-mono text-[10px] text-tac-cyan opacity-80">{alert.threatId}</span>

                {/* Severity */}
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border w-fit ${sc.pill} ${isCrit ? 'red-pulse-anim' : ''}`}>
                  {alert.severity}
                </span>

                {/* Location */}
                <span className="font-mono text-[10px] text-tac-cyan">
                  {alert.lat.toFixed(4)}°N {alert.lng.toFixed(4)}°E
                </span>

                {/* Vessel */}
                <div>
                  {alert.vesselName
                    ? <><p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {flagEmoji(alert.vesselFlag)} {alert.vesselName}
                      </p>
                      {alert.mmsi && <p className="font-mono text-[9px] text-tac-cyan opacity-50">{alert.mmsi}</p>}
                      </>
                    : <span className="opacity-30 text-xs" style={{ color: 'var(--text-secondary)' }}>UNIDENTIFIED</span>
                  }
                </div>

                {/* Confidence */}
                <ConfidenceBar value={alert.confidence} />

                {/* Status */}
                <span className={`text-[10px] font-mono font-bold ${
                  alert.status === 'Open'         ? 'text-tac-green' :
                  alert.status === 'Acknowledged' ? 'text-tac-amber' : 'opacity-40 text-[var(--text-secondary)]'
                }`}>
                  {alert.status.toUpperCase()}
                </span>

                {/* Time */}
                <span className="font-mono text-[10px] opacity-40" style={{ color: 'var(--text-secondary)' }}>
                  {timeAgo(alert.time)}
                </span>
              </div>
            );
          })}
        </div>
      </TacticalCard>

      {/* Detail panel */}
      {selected && (
        <TacticalCard className="enter-up">
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-tac-cyan text-sm font-bold">{selected.threatId}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${severityClasses(selected.severity).pill}`}>
                    {selected.severity}
                  </span>
                </div>
                <p className="text-white font-semibold">{selected.title}</p>
                <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--text-secondary)' }}>{selected.description}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-tac-muted hover:text-white text-xl leading-none">×</button>
            </div>
            {selected.status !== 'Resolved' && (
              <div className="flex gap-2">
                {selected.status === 'Open' && (
                  <button
                    onClick={() => handleStatusChange(selected.id, 'Acknowledged')}
                    className="px-4 py-2 rounded-lg text-xs font-mono font-bold border border-tac-amber/40 text-tac-amber hover:bg-tac-amber/10 transition-colors"
                  >
                    ACKNOWLEDGE
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange(selected.id, 'Resolved')}
                  className="px-4 py-2 rounded-lg text-xs font-mono font-bold border border-tac-green/40 text-tac-green hover:bg-tac-green/10 transition-colors"
                >
                  RESOLVE THREAT
                </button>
              </div>
            )}
          </div>
        </TacticalCard>
      )}
    </div>
  );
}
