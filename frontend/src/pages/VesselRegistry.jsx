import { useEffect, useState } from 'react';
import { Search, ExternalLink, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { flagEmoji } from '../lib/utils';
import TacticalCard, { CardHeader } from '../components/TacticalCard';
import { Ship } from 'lucide-react';

const STATUS_CFG = {
  authorized: { label: 'AUTHORIZED', color: 'text-tac-green', border: 'border-tac-green/30', dot: 'bg-tac-green' },
  traffic:    { label: 'TRAFFIC',    color: 'text-tac-cyan',  border: 'border-tac-cyan/30',  dot: 'bg-tac-cyan'  },
  dark:       { label: 'DARK',       color: 'text-tac-red',   border: 'border-tac-red/30',   dot: 'bg-tac-red',   glow: true },
  violation:  { label: 'VIOLATION',  color: 'text-tac-amber', border: 'border-tac-amber/30', dot: 'bg-tac-amber', glow: true },
};

function StatPill({ label, value, color }) {
  return (
    <div className="glass-inset rounded-lg px-4 py-2 text-center">
      <p className={`font-mono text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[9px] font-mono opacity-50 mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}

export default function VesselRegistry() {
  const [vessels, setVessels]   = useState([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [view, setView]         = useState('table'); // 'table' | 'grid'

  useEffect(() => {
    api.get('/vessels', { params: { search } }).then(r => setVessels(r.data)).catch(() => {});
  }, [search]);

  const counts = {
    total:      vessels.length,
    authorized: vessels.filter(v => v.status === 'authorized').length,
    traffic:    vessels.filter(v => v.status === 'traffic').length,
    dark:       vessels.filter(v => v.status === 'dark').length,
    violation:  vessels.filter(v => v.status === 'violation').length,
  };

  return (
    <div className="p-5 space-y-4 enter-up">
      {/* Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatPill label="TOTAL"      value={counts.total}      color="text-tac-cyan"  />
        <StatPill label="AUTHORIZED" value={counts.authorized} color="text-tac-green" />
        <StatPill label="TRAFFIC"    value={counts.traffic}    color="text-tac-cyan"  />
        <StatPill label="DARK"       value={counts.dark}       color="text-tac-red"   />
        <StatPill label="VIOLATION"  value={counts.violation}  color="text-tac-amber" />
      </div>

      <TacticalCard>
        <CardHeader icon={Ship} title="Vessel Registry" sub={`${vessels.length} vessels in sector`}
          right={
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tac-cyan opacity-40" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Name, MMSI, IMO…"
                  className="glass-inset rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-mono outline-none w-44"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-1 glass-sm rounded-lg p-1">
                {['table', 'grid'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      view === v ? 'bg-tac-cyan/15 text-tac-cyan' : 'opacity-30 hover:opacity-60'
                    }`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          }
        />

        {/* Table view */}
        {view === 'table' && (
          <>
            <div
              className="grid gap-3 px-5 py-2 border-b"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 60px 24px', borderColor: 'var(--border-dim)' }}
            >
              {['VESSEL', 'MMSI', 'TYPE', 'FLAG', 'DARK', 'ALERTS', ''].map(h => (
                <span key={h} className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</span>
              ))}
            </div>
            <div className="divide-y divide-tac-cyan/5">
              {vessels.map((v, i) => {
                const sc = STATUS_CFG[v.status] || STATUS_CFG.traffic;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelected(selected?.id === v.id ? null : v)}
                    className={`grid gap-3 px-5 py-3.5 items-center cursor-pointer hover:bg-tac-cyan/3 transition-all ${
                      selected?.id === v.id ? 'bg-tac-cyan/5' : ''
                    }`}
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 60px 24px', animationDelay: `${i * 30}ms` }}
                  >
                    <div>
                      <p className="text-xs font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{v.name}</p>
                      <p className="font-mono text-[9px] text-tac-cyan opacity-50">IMO {v.imo}</p>
                    </div>
                    <span className="font-mono text-[10px] text-tac-cyan">{v.mmsi}</span>
                    <span className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>{v.type}</span>
                    <div className="flex items-center gap-1.5">
                      <span>{flagEmoji(v.flag)}</span>
                      <span className="text-[10px] opacity-60" style={{ color: 'var(--text-secondary)' }}>{v.flag}</span>
                    </div>
                    <span className={`font-mono text-xs font-bold text-center ${v.darkPeriods > 0 ? 'text-tac-red' : 'opacity-30 text-[var(--text-secondary)]'}`}>
                      {v.darkPeriods > 0 ? `[${v.darkPeriods}]` : '0'}
                    </span>
                    <span className={`font-mono text-xs font-bold text-center ${v.alerts > 0 ? 'text-tac-red' : 'opacity-30 text-[var(--text-secondary)]'}`}>
                      {v.alerts > 0 ? `[${v.alerts}]` : '0'}
                    </span>
                    <ChevronRight size={13} className="opacity-20 text-tac-cyan" />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Grid view */}
        {view === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
            {vessels.map(v => {
              const sc = STATUS_CFG[v.status] || STATUS_CFG.traffic;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelected(selected?.id === v.id ? null : v)}
                  className={`glass-inset rounded-xl p-4 cursor-pointer transition-all hover:border-tac-cyan/30 border ${sc.border} ${sc.glow ? (v.status === 'dark' ? 'glow-red' : 'glow-amber') : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${sc.dot} ${sc.glow ? 'red-pulse-anim' : ''}`} />
                      <span className={`text-[9px] font-mono font-bold ${sc.color}`}>{sc.label}</span>
                    </div>
                    <span className="text-base">{flagEmoji(v.flag)}</span>
                  </div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{v.name}</p>
                  <p className="font-mono text-[10px] text-tac-cyan opacity-60 mb-3">{v.mmsi}</p>
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                    <span className="opacity-40">{v.type}</span>
                    <span className="opacity-40">{v.speed} kn</span>
                    {v.darkPeriods > 0 && <span className="text-tac-red col-span-2">⚠ {v.darkPeriods} dark period{v.darkPeriods > 1 ? 's' : ''}</span>}
                  </div>
                  <a
                    href={`https://www.vesselfinder.com/vessels/${v.mmsi}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="mt-3 flex items-center gap-1 text-tac-cyan text-[9px] hover:opacity-70 transition-opacity"
                  >
                    <ExternalLink size={9} /> Track on VesselFinder
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </TacticalCard>

      {/* Detail panel */}
      {selected && (
        <TacticalCard className="enter-up">
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{flagEmoji(selected.flag)}</span>
                <div>
                  <p className="text-white font-bold text-lg">{selected.name}</p>
                  <p className="font-mono text-tac-cyan text-xs opacity-70">{selected.type} · IMO {selected.imo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://www.vesselfinder.com/vessels/${selected.mmsi}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 glass-inset rounded-lg text-tac-cyan text-[10px] font-mono hover:glow-cyan transition-all"
                >
                  <ExternalLink size={11} /> VesselFinder
                </a>
                <button onClick={() => setSelected(null)} className="text-tac-muted hover:text-white text-xl px-2">×</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['MMSI',        selected.mmsi],
                ['Flag',        `${flagEmoji(selected.flag)} ${selected.flag}`],
                ['Speed',       `${selected.speed} kn`],
                ['Heading',     `${selected.heading}°`],
                ['LAT',         `${selected.lat}°N`],
                ['LON',         `${selected.lng}°E`],
                ['Dark Periods',selected.darkPeriods],
                ['Status',      selected.status.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} className="glass-inset rounded-lg p-3">
                  <p className="text-[9px] font-mono opacity-40 mb-1" style={{ color: 'var(--text-secondary)' }}>{k}</p>
                  <p className="font-mono text-xs text-tac-cyan">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </TacticalCard>
      )}
    </div>
  );
}
