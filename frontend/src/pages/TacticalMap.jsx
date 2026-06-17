import { useEffect, useState } from 'react';
import { AlertTriangle, Ship, Layers, ExternalLink, Crosshair, X } from 'lucide-react';
import api from '../lib/api';
import { flagEmoji } from '../lib/utils';

const F4MAP_URL =
  'https://demo.f4map.com/#lat=31.1791031&lon=29.8752085&zoom=13&camera.theta=0.9';

const VESSEL_FINDER_URL =
  'https://www.vesselfinder.com/?latitude=31.2001&longitude=29.9187&zoom=12';

export default function TacticalMap() {
  const [vessels, setVessels]     = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [target, setTarget]       = useState(null);
  const [showLayers, setShowLayers] = useState(false);
  const [layers, setLayers]       = useState({ ais: true, sar: true, zones: true });
  const [mapView, setMapView]     = useState('3d'); // '3d' | 'ais'

  useEffect(() => {
    api.get('/vessels').then(r => setVessels(r.data)).catch(() => {});
    api.get('/alerts').then(r => setAlerts(r.data)).catch(() => {});
  }, []);

  const darkShips  = vessels.filter(v => v.status === 'dark');
  const authorized = vessels.filter(v => v.status === 'authorized');
  const traffic    = vessels.filter(v => v.status === 'traffic');

  const toggleLayer = k => setLayers(l => ({ ...l, [k]: !l[k] }));

  const statusColor = s =>
    s === 'dark'       ? '#ff0055' :
    s === 'violation'  ? '#ffaa00' :
    s === 'authorized' ? '#00ff9d' : '#00f2ff';

  return (
    <div className="h-full flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Status bar */}
      <div
        className="glass-sm border-b flex items-center gap-6 px-5 py-2.5 shrink-0 z-20"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex items-center gap-2">
          <span className="live-blink w-2 h-2 rounded-full bg-tac-red inline-block" />
          <span className="text-tac-red font-mono text-[10px] font-bold tracking-widest">LIVE SURVEILLANCE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-tac-red" />
          <span className="font-mono text-sm font-bold text-tac-red">{darkShips.length}</span>
          <span className="text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>Dark Ships</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-tac-green font-mono text-sm font-bold">{authorized.length}</span>
          <span className="text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>Authorized</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Ship size={13} className="text-tac-cyan" />
          <span className="font-mono text-sm font-bold text-tac-cyan">{traffic.length}</span>
          <span className="text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>Traffic</span>
        </div>

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 glass-sm rounded-lg p-1">
          {[{ v: '3d', label: '3D F4Map' }, { v: 'ais', label: 'AIS View' }].map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setMapView(v)}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                mapView === v ? 'bg-tac-cyan/20 text-tac-cyan border border-tac-cyan/30' : 'opacity-40 hover:opacity-70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* VesselFinder link */}
        <a
          href={VESSEL_FINDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 glass-sm rounded-lg text-tac-cyan text-[10px] font-mono hover:glow-cyan transition-all"
        >
          <ExternalLink size={11} /> VesselFinder
        </a>
      </div>

      {/* Map container */}
      <div className="flex-1 relative overflow-hidden">

        {/* ─── 3D F4Map iframe ─── */}
        {mapView === '3d' && (
          <iframe
            src={F4MAP_URL}
            className="w-full h-full border-0"
            title="Alexandria Port 3D Map"
            allowFullScreen
          />
        )}

        {/* ─── AIS grid view ─── */}
        {mapView === 'ais' && (
          <div className="w-full h-full p-4 overflow-y-auto">
            <p className="text-orb text-tac-cyan text-[10px] tracking-widest mb-4">
              AIS VESSEL TRACKING — SECTOR ALEXANDRIA
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {vessels.map(v => (
                <div
                  key={v.id}
                  onClick={() => setTarget(v)}
                  className="glass rounded-xl p-4 cursor-pointer transition-all hover:glow-cyan"
                  style={{ borderColor: `${statusColor(v.status)}30` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{v.name}</p>
                      <p className="font-mono text-[10px] text-tac-cyan opacity-70">{v.mmsi}</p>
                    </div>
                    <span
                      className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase"
                      style={{ color: statusColor(v.status), borderColor: `${statusColor(v.status)}40` }}
                    >
                      {v.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    {[
                      ['LAT', `${v.lat.toFixed(4)}°N`],
                      ['LON', `${v.lng.toFixed(4)}°E`],
                      ['SPD', `${v.speed} kn`],
                      ['HDG', `${v.heading}°`],
                    ].map(([k, val]) => (
                      <div key={k}>
                        <span className="text-[8px] font-mono opacity-40" style={{ color: 'var(--text-secondary)' }}>{k} </span>
                        <span className="text-[10px] font-mono text-data">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-base">{flagEmoji(v.flag)}</span>
                    <span className="text-[10px] opacity-50" style={{ color: 'var(--text-secondary)' }}>{v.type}</span>
                    <a
                      href={`https://www.vesselfinder.com/vessels/${v.mmsi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="ml-auto text-tac-cyan text-[9px] flex items-center gap-0.5 hover:opacity-70"
                    >
                      <ExternalLink size={9} /> Track
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Targeting reticle (3D view only) ─── */}
        {mapView === '3d' && (
          <div className="reticle pointer-events-none">
            <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="36" y1="0"  x2="36" y2="20" stroke="#00f2ff" strokeWidth="1" strokeOpacity="0.5"/>
              <line x1="36" y1="52" x2="36" y2="72" stroke="#00f2ff" strokeWidth="1" strokeOpacity="0.5"/>
              <line x1="0"  y1="36" x2="20" y2="36" stroke="#00f2ff" strokeWidth="1" strokeOpacity="0.5"/>
              <line x1="52" y1="36" x2="72" y2="36" stroke="#00f2ff" strokeWidth="1" strokeOpacity="0.5"/>
              <path d="M20 4 L4 4 L4 20"  stroke="#00f2ff" strokeWidth="1.5" fill="none"/>
              <path d="M52 4 L68 4 L68 20" stroke="#00f2ff" strokeWidth="1.5" fill="none"/>
              <path d="M20 68 L4 68 L4 52" stroke="#00f2ff" strokeWidth="1.5" fill="none"/>
              <path d="M52 68 L68 68 L68 52" stroke="#00f2ff" strokeWidth="1.5" fill="none"/>
              <circle cx="36" cy="36" r="4" stroke="#00f2ff" strokeWidth="1" strokeOpacity="0.6" fill="none"/>
            </svg>
          </div>
        )}

        {/* ─── Layer toggles ─── */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setShowLayers(v => !v)}
            className="glass rounded-lg px-3 py-2 flex items-center gap-2 text-tac-cyan text-[10px] font-mono mb-2 hover:glow-cyan transition-all"
          >
            <Layers size={13} /> LAYERS
          </button>
          {showLayers && (
            <div className="glass rounded-xl p-3 min-w-[150px]">
              {[
                { key: 'ais',   label: 'AIS Tracks',   color: 'bg-tac-cyan'  },
                { key: 'sar',   label: 'SAR Overlays', color: 'bg-tac-red'   },
                { key: 'zones', label: 'Restricted',   color: 'bg-tac-amber' },
              ].map(({ key, label, color }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer py-1.5">
                  <input type="checkbox" checked={layers[key]} onChange={() => toggleLayer(key)} className="hidden" />
                  <div className={`w-3 h-3 rounded-sm transition-all ${layers[key] ? color : 'bg-tac-muted'}`} />
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ─── Target data card ─── */}
        {target && (
          <div className="absolute bottom-4 left-4 z-20 glass rounded-xl p-4 w-64">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-orb text-tac-cyan text-[9px] tracking-widest mb-1">TARGET DATA</p>
                <p className="text-white font-bold text-sm">{target.name}</p>
              </div>
              <button onClick={() => setTarget(null)} className="text-tac-muted hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1.5">
              {[
                ['MMSI',    target.mmsi],
                ['TYPE',    target.type],
                ['FLAG',    `${flagEmoji(target.flag)} ${target.flag}`],
                ['LAT',     `${target.lat}°N`],
                ['LON',     `${target.lng}°E`],
                ['SPEED',   `${target.speed} kn`],
                ['HEADING', `${target.heading}°`],
                ['THREAT',  target.status.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[9px] font-mono opacity-40" style={{ color: 'var(--text-secondary)' }}>{k}</span>
                  <span className={`text-[10px] font-mono ${k === 'THREAT' && (target.status === 'dark' || target.status === 'violation') ? 'text-tac-red' : 'text-tac-cyan'}`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={`https://www.vesselfinder.com/vessels/${target.mmsi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 glass-inset rounded-lg text-tac-cyan text-[10px] font-mono hover:glow-cyan transition-all"
            >
              <ExternalLink size={11} /> Track on VesselFinder
            </a>
          </div>
        )}

        {/* ─── Coord overlay (3D view) ─── */}
        {mapView === '3d' && (
          <div className="absolute bottom-4 right-4 z-20 glass-sm rounded-lg px-3 py-2">
            <p className="font-mono text-tac-cyan text-[10px] opacity-60">
              31.1791°N · 29.8752°E
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
