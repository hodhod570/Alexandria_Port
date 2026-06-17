import { useEffect, useState, useRef } from 'react';
import { Activity, RefreshCw, Map, Radio, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../lib/api';
import { timeAgo, severityClasses, flagEmoji } from '../lib/utils';
import TacticalCard, { CardHeader } from '../components/TacticalCard';

/* ─── Constants ─────────────────────────────────────── */
const CARTO_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ALEX_CENTER = [31.2001, 29.9187];

const STATUS_CFG = {
  dark:       { color: '#ff0055', label: 'DARK',       pulse: true  },
  authorized: { color: '#00ff9d', label: 'AUTHORIZED', pulse: false },
  traffic:    { color: '#00f2ff', label: 'TRAFFIC',    pulse: false },
  violation:  { color: '#ffaa00', label: 'VIOLATION',  pulse: true  },
};

/* ─── Leaflet marker factory ─────────────────────────── */
function makeMarkerIcon(status, selected) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.traffic;
  const r   = selected ? 10 : 7;
  const c   = cfg.color;
  const rings = cfg.pulse ? `
    <div style="position:absolute;inset:-8px;border-radius:50%;border:1.5px solid ${c};animation:ringPulse 1.8s ease-out infinite;opacity:0"></div>
    <div style="position:absolute;inset:-4px;border-radius:50%;border:1px solid ${c};animation:ringPulse 1.8s ease-out 0.5s infinite;opacity:0"></div>
  ` : '';
  const selRing = selected
    ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(255,255,255,0.6)"></div>`
    : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${r*2}px;height:${r*2}px">
      ${rings}${selRing}
      <div style="width:${r*2}px;height:${r*2}px;border-radius:50%;background:${c};
           border:1.5px solid rgba(255,255,255,0.25);
           box-shadow:0 0 10px ${c},0 0 24px ${c}60"></div>
    </div>`,
    iconSize:   [r * 2, r * 2],
    iconAnchor: [r, r],
  });
}

/* ─── Flies map to selected vessel ──────────────────── */
function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 13), { duration: 0.9 });
  }, [target, map]);
  return null;
}

/* ─── Feed filters ───────────────────────────────────── */
const TYPE_FILTERS = ['All', 'AIS', 'SAR'];
const SEV_FILTERS  = ['All', 'Critical', 'High', 'Medium', 'Low'];

function TypeBadge({ type }) {
  const cfg = type === 'AIS'
    ? 'text-tac-cyan border-tac-cyan/40 bg-tac-cyan/10'
    : 'text-tac-amber border-tac-amber/40 bg-tac-amber/10';
  return <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${cfg}`}>{type}</span>;
}

function ConfBar({ value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1 bg-tac-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[9px]" style={{ color }}>{value}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SAR MAP VIEW
═══════════════════════════════════════════════════════ */
function SarMapView({ vessels, alerts }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('All');
  const sidebarRef = useRef(null);

  const displayed  = filter === 'All' ? vessels : vessels.filter(v => v.status === filter);
  const openAlerts = alerts.filter(a => a.status === 'Open');

  const counts = {
    dark:       vessels.filter(v => v.status === 'dark').length,
    violation:  vessels.filter(v => v.status === 'violation').length,
    authorized: vessels.filter(v => v.status === 'authorized').length,
    traffic:    vessels.filter(v => v.status === 'traffic').length,
  };

  const handleSelect = v => setSelected(s => s?.id === v.id ? null : v);

  useEffect(() => {
    if (!selected || !sidebarRef.current) return;
    sidebarRef.current
      .querySelector(`[data-vid="${selected.id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selected]);

  return (
    <div className="flex" style={{ height: 'calc(100vh - 56px - 48px)' }}>

      {/* AIS Sidebar */}
      <aside
        className="flex flex-col shrink-0 border-r overflow-hidden"
        style={{ width: 288, background: 'var(--bg-panel)', borderColor: 'var(--border-glass)' }}
      >
        {/* Header */}
        <div className="p-4 border-b shrink-0" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Radio size={13} className="text-tac-cyan" />
            <span className="text-orb text-tac-cyan text-[10px] font-bold tracking-widest">AIS VESSEL FEED</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="live-blink w-1.5 h-1.5 rounded-full bg-tac-red inline-block" />
              <span className="text-tac-red font-mono text-[9px] font-bold">LIVE</span>
            </div>
          </div>

          {/* Counts — click to filter */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              { key: 'dark',       label: 'DARK',       color: 'text-tac-red'   },
              { key: 'violation',  label: 'VIOLATION',  color: 'text-tac-amber' },
              { key: 'authorized', label: 'AUTHORIZED', color: 'text-tac-green' },
              { key: 'traffic',    label: 'TRAFFIC',    color: 'text-tac-cyan'  },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(f => f === key ? 'All' : key)}
                className={`glass-inset rounded-lg px-2 py-1.5 text-center transition-all hover:border-tac-cyan/20 ${
                  filter === key ? 'border border-tac-cyan/30' : ''
                }`}
              >
                <p className={`font-mono text-base font-bold ${color}`}>{counts[key]}</p>
                <p className="text-[8px] font-mono opacity-40" style={{ color: 'var(--text-secondary)' }}>{label}</p>
              </button>
            ))}
          </div>

          {/* Filter strip */}
          <div className="flex gap-1 flex-wrap items-center">
            {['All', 'dark', 'violation', 'traffic', 'authorized'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                  filter === f
                    ? 'bg-tac-cyan/15 text-tac-cyan border border-tac-cyan/30'
                    : 'opacity-30 hover:opacity-60'
                }`}
              >
                {f === 'All' ? 'ALL' : f.toUpperCase()}
              </button>
            ))}
            <span className="ml-auto font-mono text-[8px] opacity-30 text-tac-cyan">
              {displayed.length}/{vessels.length}
            </span>
          </div>
        </div>

        {/* Vessel list */}
        <div ref={sidebarRef} className="flex-1 overflow-y-auto divide-y divide-tac-cyan/5">
          {displayed.map(v => {
            const cfg      = STATUS_CFG[v.status] || STATUS_CFG.traffic;
            const isSel    = selected?.id === v.id;
            const hasAlert = openAlerts.some(a => a.mmsi === v.mmsi);
            return (
              <div
                key={v.id}
                data-vid={v.id}
                onClick={() => handleSelect(v)}
                className={`px-4 py-3 cursor-pointer transition-all hover:bg-tac-cyan/5 ${isSel ? 'bg-tac-cyan/10' : ''}`}
                style={{ borderLeft: `3px solid ${isSel ? cfg.color : 'transparent'}` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: cfg.color,
                        boxShadow: `0 0 6px ${cfg.color}`,
                        animation: cfg.pulse ? 'redPulse 2s ease-in-out infinite' : 'none',
                      }}
                    />
                    <span className="text-[11px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {v.name}
                    </span>
                  </div>
                  <span
                    className="shrink-0 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ml-1"
                    style={{ color: cfg.color, background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] text-tac-cyan opacity-60">{v.mmsi}</span>
                  <span className="text-[10px]">{flagEmoji(v.flag)}</span>
                  <span className="font-mono text-[9px] opacity-35 truncate" style={{ color: 'var(--text-secondary)' }}>{v.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-tac-cyan opacity-70">{v.speed} kn</span>
                  <span className="font-mono text-[9px] opacity-30" style={{ color: 'var(--text-secondary)' }}>{v.heading}° HDG</span>
                  <span className="font-mono text-[9px] opacity-30" style={{ color: 'var(--text-secondary)' }}>{v.lat.toFixed(3)}°N</span>
                  {hasAlert && (
                    <span className="ml-auto flex items-center gap-0.5 text-tac-red text-[8px] font-mono font-bold">
                      <AlertTriangle size={8} /> ALERT
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {displayed.length === 0 && (
            <p className="text-center py-10 font-mono text-[10px] opacity-30" style={{ color: 'var(--text-secondary)' }}>
              NO VESSELS MATCH FILTER
            </p>
          )}
        </div>

        <div className="px-4 py-2 border-t shrink-0" style={{ borderColor: 'var(--border-glass)' }}>
          <p className="font-mono text-[8px] opacity-25 text-tac-cyan">SOURCE: AIS TRANSPONDER · SENTINEL-1 SAR</p>
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        {/* Top badges */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 pointer-events-none">
          <div className="glass-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="live-blink w-1.5 h-1.5 rounded-full bg-tac-red inline-block" />
            <span className="text-[9px] font-mono font-bold text-tac-red tracking-widest">SAR SURVEILLANCE ACTIVE</span>
          </div>
          {counts.dark > 0 && (
            <div className="glass-sm rounded-lg px-3 py-1.5 flex items-center gap-2 red-pulse-anim border border-tac-red/30">
              <AlertTriangle size={11} className="text-tac-red" />
              <span className="font-mono text-tac-red text-[9px] font-bold">
                {counts.dark} DARK SHIP{counts.dark > 1 ? 'S' : ''} DETECTED
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute top-3 right-3 z-[1000] glass-sm rounded-xl p-3 space-y-1.5">
          <p className="text-orb text-[8px] text-tac-cyan tracking-widest opacity-60 mb-1">LEGEND</p>
          {Object.entries(STATUS_CFG).map(([key, { color, label, pulse }]) => (
            <div key={key} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}`, animation: pulse ? 'redPulse 2s ease-in-out infinite' : 'none' }} />
              <span className="font-mono text-[9px] opacity-60" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Target card */}
        {selected && (
          <div className="absolute bottom-4 left-4 z-[1000] glass rounded-xl p-4 w-56 enter-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-orb text-tac-cyan text-[9px] tracking-widest mb-0.5">TARGET DATA</p>
                <p className="text-white font-bold text-sm leading-tight">{selected.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-tac-muted hover:text-white shrink-0 ml-2">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1.5 mb-3">
              {[
                ['MMSI',   selected.mmsi],
                ['FLAG',   `${flagEmoji(selected.flag)} ${selected.flag}`],
                ['POS',    `${selected.lat.toFixed(4)}°N  ${selected.lng.toFixed(4)}°E`],
                ['SPEED',  `${selected.speed} kn`],
                ['STATUS', selected.status.toUpperCase()],
              ].map(([k, val]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[9px] font-mono opacity-35" style={{ color: 'var(--text-secondary)' }}>{k}</span>
                  <span className={`text-[9px] font-mono ${k === 'STATUS' && (selected.status === 'dark' || selected.status === 'violation') ? 'text-tac-red font-bold' : 'text-tac-cyan'}`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={`https://www.vesselfinder.com/vessels/${selected.mmsi}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 glass-inset rounded-lg text-tac-cyan text-[9px] font-mono hover:glow-cyan transition-all"
            >
              <ExternalLink size={10} /> Track on VesselFinder
            </a>
          </div>
        )}

        <MapContainer
          center={ALEX_CENTER}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={CARTO_DARK} />
          <MapFlyTo target={selected} />
          {vessels.map(v => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={makeMarkerIcon(v.status, selected?.id === v.id)}
              eventHandlers={{ click: () => handleSelect(v) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEED TABLE VIEW (original)
═══════════════════════════════════════════════════════ */
function FeedTableView({ vessels, alerts: _alerts }) {
  const [data, setData]        = useState({ feed: [], summary: {} });
  const [typeFilter, setType]  = useState('All');
  const [sevFilter, setSev]    = useState('All');
  const [loading, setLoading]  = useState(true);
  const [autoRefresh, setAuto] = useState(true);
  const timerRef = useRef(null);

  const load = () => {
    setLoading(true);
    api.get('/intelligence/integrated', {
      params: {
        type:     typeFilter === 'All' ? undefined : typeFilter,
        severity: sevFilter  === 'All' ? undefined : sevFilter,
      },
    })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (autoRefresh) timerRef.current = setInterval(load, 15000);
    return () => clearInterval(timerRef.current);
  }, [typeFilter, sevFilter, autoRefresh]);

  const feed    = data.feed    || [];
  const summary = data.summary || {};

  return (
    <div className="p-5 space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'TOTAL EVENTS', value: summary.total         ?? 0, color: 'text-tac-cyan'  },
          { label: 'AIS EVENTS',   value: summary.aisEvents     ?? 0, color: 'text-tac-cyan'  },
          { label: 'SAR EVENTS',   value: summary.sarEvents     ?? 0, color: 'text-tac-amber' },
          { label: 'CRITICAL',     value: summary.criticalEvents ?? 0, color: 'text-tac-red'  },
        ].map(({ label, value, color }) => (
          <TacticalCard key={label} className="p-4">
            <p className="text-[9px] font-mono opacity-40 mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
          </TacticalCard>
        ))}
      </div>

      <TacticalCard>
        <CardHeader
          icon={Activity}
          title="Integrated AIS / SAR Intelligence Feed"
          sub="Combined real-time vessel and satellite data stream"
          right={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuto(v => !v)}
                className={`text-[9px] font-mono px-2 py-1 rounded border transition-colors ${
                  autoRefresh ? 'border-tac-green/40 text-tac-green' : 'border-[var(--border-glass)] opacity-40'
                }`}
              >AUTO</button>
              <button onClick={load} className="glass-sm rounded-lg p-1.5 text-tac-cyan hover:glow-cyan transition-all">
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center gap-1 glass-sm rounded-lg p-1">
            {TYPE_FILTERS.map(f => (
              <button key={f} onClick={() => setType(f)}
                className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                  typeFilter === f ? 'bg-tac-cyan/15 text-tac-cyan border border-tac-cyan/30' : 'opacity-30 hover:opacity-60'
                }`}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-1 glass-sm rounded-lg p-1">
            {SEV_FILTERS.map(f => {
              const colors = { Critical: 'text-tac-red', High: 'text-tac-amber', Medium: 'text-tac-cyan', Low: 'opacity-50' };
              return (
                <button key={f} onClick={() => setSev(f)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                    sevFilter === f ? `bg-tac-cyan/10 ${colors[f] || 'text-white'} border border-tac-cyan/20` : 'opacity-25 hover:opacity-50'
                  }`}>{f}</button>
              );
            })}
          </div>
          <span className="ml-auto font-mono text-[9px] opacity-40 text-tac-cyan">{feed.length} EVENTS</span>
        </div>

        {/* Column headers */}
        <div className="grid gap-3 px-5 py-2 border-b text-[9px] font-mono font-bold tracking-wider"
          style={{ gridTemplateColumns: '60px 80px 140px 1fr 140px 100px 80px', borderColor: 'var(--border-dim)', color: 'var(--text-muted)' }}>
          {['TYPE', 'SEVERITY', 'TIMESTAMP', 'EVENT / DETAIL', 'VESSEL', 'CONFIDENCE', 'LAT/LON'].map(h => (
            <span key={h}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-tac-cyan/5 max-h-[calc(100vh-460px)] overflow-y-auto">
          {loading && feed.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-tac-cyan border-t-transparent rounded-full animate-spin" />
            </div>
          ) : feed.length === 0 ? (
            <p className="text-center py-10 font-mono text-[11px] opacity-30" style={{ color: 'var(--text-secondary)' }}>
              NO EVENTS MATCH FILTER
            </p>
          ) : feed.map((item, i) => {
            const sc      = severityClasses(item.severity);
            const isCrit  = item.severity === 'CRITICAL';
            const confColor = item.confidence >= 90 ? '#ff0055' : item.confidence >= 70 ? '#ffaa00' : '#00f2ff';
            return (
              <div key={item.id}
                className={`grid gap-3 px-5 py-3.5 items-start hover:bg-tac-cyan/3 transition-all stream-in ${isCrit ? 'bg-tac-red/4' : ''}`}
                style={{ gridTemplateColumns: '60px 80px 140px 1fr 140px 100px 80px', animationDelay: `${i * 50}ms` }}>
                <TypeBadge type={item.type} />
                <span className={`text-[9px] font-mono font-bold ${sc.text} ${isCrit ? 'red-pulse-anim' : ''}`}>{item.severity}</span>
                <div>
                  <p className="font-mono text-[9px] text-tac-cyan opacity-70">{timeAgo(item.timestamp)}</p>
                  <p className="font-mono text-[8px] opacity-30" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(item.timestamp).toUTCString().split(' ').slice(1, 5).join(' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.event}</p>
                  <p className="text-[10px] opacity-50 mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{item.detail}</p>
                </div>
                <div>
                  {item.vessel
                    ? <><p className="font-mono text-[10px] text-tac-cyan">{item.vessel}</p>
                        {item.mmsi && <p className="font-mono text-[9px] opacity-40">{item.mmsi}</p>}</>
                    : <span className="font-mono text-[10px] opacity-20">UNIDENTIFIED</span>}
                </div>
                <ConfBar value={item.confidence} color={confColor} />
                <div className="font-mono text-[9px] text-tac-cyan opacity-60">
                  <p>{item.lat.toFixed(4)}°N</p>
                  <p>{item.lng.toFixed(4)}°E</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-2.5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-dim)' }}>
          <span className="font-mono text-[9px] opacity-30 text-tac-cyan">
            {autoRefresh ? '↻ Auto-refreshing every 15s' : 'Auto-refresh paused'}
          </span>
          <span className="font-mono text-[9px] opacity-20" style={{ color: 'var(--text-secondary)' }}>
            SOURCE: AIS TRANSPONDER + SAR SENTINEL-1
          </span>
        </div>
      </TacticalCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function IntegratedFeed() {
  const [view, setView]       = useState('map'); // 'map' | 'feed'
  const [vessels, setVessels] = useState([]);
  const [alerts, setAlerts]   = useState([]);

  useEffect(() => {
    api.get('/vessels').then(r => setVessels(r.data)).catch(() => {});
    api.get('/alerts').then(r  => setAlerts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Tab bar */}
      <div
        className="flex items-center gap-1 px-5 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-panel)' }}
      >
        <div className="flex items-center gap-1 glass-sm rounded-lg p-1">
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all ${
              view === 'map'
                ? 'bg-tac-cyan/15 text-tac-cyan border border-tac-cyan/30'
                : 'opacity-40 hover:opacity-70'
            }`}
          >
            <Map size={12} /> SAR MAP
          </button>
          <button
            onClick={() => setView('feed')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all ${
              view === 'feed'
                ? 'bg-tac-cyan/15 text-tac-cyan border border-tac-cyan/30'
                : 'opacity-40 hover:opacity-70'
            }`}
          >
            <Activity size={12} /> INTEL FEED
          </button>
        </div>
        <span className="ml-3 font-mono text-[9px] opacity-30 text-tac-cyan">
          {view === 'map' ? 'Leaflet · CartoDB Dark · AIS overlay' : 'AIS + SAR intelligence stream'}
        </span>
      </div>

      {/* Content */}
      {view === 'map'
        ? <SarMapView vessels={vessels} alerts={alerts} />
        : <div className="overflow-y-auto flex-1"><FeedTableView vessels={vessels} alerts={alerts} /></div>
      }
    </div>
  );
}
