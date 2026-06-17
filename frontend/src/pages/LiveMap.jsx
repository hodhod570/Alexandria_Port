import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Ship } from 'lucide-react';
import api from '../lib/api';

// Alexandria harbor center
const ALEX_CENTER = [31.2001, 29.9187];
const ALEX_ZOOM   = 12;

const makeIcon = (color, size = 14, glow = false) =>
  L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid rgba(255,255,255,0.85);
      border-radius:50%;
      box-shadow:0 0 ${glow ? '12px 4px' : '4px 1px'} ${color};
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: '',
  });

const VESSEL_ICONS = {
  authorized: makeIcon('#22c55e'),
  traffic:    makeIcon('#3b82f6'),
  dark:       makeIcon('#ef4444', 16, true),
  violation:  makeIcon('#f97316', 15, true),
};

const DETECTION_ICON = makeIcon('#ef4444', 12, true);

// Restricted zone 4-B (military, near Abu Qir naval base area)
const ZONE_4B = [
  [31.12, 29.60], [31.18, 29.60], [31.18, 29.75], [31.12, 29.75],
];

// Analysis area (main harbor surveillance polygon)
const ANALYSIS_AREA = [
  [31.14, 29.80], [31.27, 29.80], [31.27, 30.05], [31.14, 30.05],
];

function FlyToLayer({ vessels, showLayers }) {
  const map = useMap();
  useEffect(() => { map.setView(ALEX_CENTER, ALEX_ZOOM); }, []);
  return null;
}

export default function LiveMap() {
  const [vessels, setVessels] = useState([]);
  const [alerts, setAlerts]   = useState([]);
  const [layers, setLayers]   = useState({
    traffic: true,
    detections: true,
    analysis: true,
  });

  useEffect(() => {
    api.get('/vessels').then(r => setVessels(r.data)).catch(() => {});
    api.get('/alerts').then(r => setAlerts(r.data)).catch(() => {});
  }, []);

  const darkShips   = vessels.filter(v => v.status === 'dark' || v.status === 'violation');
  const authorized  = vessels.filter(v => v.status === 'authorized');
  const traffic     = vessels.filter(v => v.status === 'traffic');

  const toggleLayer = (key) => setLayers(l => ({ ...l, [key]: !l[key] }));

  return (
    <div className="h-full p-4 flex flex-col gap-4">
      {/* Info bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <span className="live-pulse w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Live Surveillance</span>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-400">
          <AlertTriangle size={16} />
          <span className="font-bold text-sm">{darkShips.length}</span>
          <span className="text-slate-400 text-sm">Dark Ships</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-400">
          <span className="text-lg">♡</span>
          <span className="font-bold text-sm">{authorized.length}</span>
          <span className="text-slate-400 text-sm">Authorized</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-400">
          <Ship size={16} />
          <span className="font-bold text-sm">{traffic.length}</span>
          <span className="text-slate-400 text-sm">Traffic</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-800">
        <MapContainer
          center={ALEX_CENTER}
          zoom={ALEX_ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <FlyToLayer />

          {/* Dark tile layer — CartoDB dark matter */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Analysis Area polygon */}
          {layers.analysis && (
            <Polygon
              positions={ANALYSIS_AREA}
              pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.05, weight: 1, dashArray: '6 4' }}
            />
          )}

          {/* Restricted zone 4-B */}
          {layers.detections && (
            <Polygon
              positions={ZONE_4B}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 1.5, dashArray: '4 3' }}
            >
            </Polygon>
          )}

          {/* Vessel markers */}
          {layers.traffic && vessels.map(v => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={VESSEL_ICONS[v.status] || VESSEL_ICONS.traffic}
            >
              <Popup className="dark-popup">
                <div style={{ minWidth: 180, background: '#1e293b', color: '#f1f5f9', borderRadius: 8, padding: '8px 12px' }}>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{v.name}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>MMSI: {v.mmsi}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>Type: {v.type}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>Flag: {v.flag}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>Speed: {v.speed} kn</p>
                  <p style={{ color: v.status === 'dark' ? '#ef4444' : v.status === 'violation' ? '#f97316' : '#22c55e', fontSize: 12, marginTop: 4, textTransform: 'capitalize', fontWeight: 600 }}>
                    {v.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Detection markers (alerts) */}
          {layers.detections && alerts.filter(a => a.severity === 'CRITICAL' || a.type === 'DarkShip').map(a => (
            <Circle
              key={`alert-${a.id}`}
              center={[a.lat, a.lng]}
              radius={800}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.12, weight: 1.5 }}
            >
              <Popup>
                <div style={{ minWidth: 200, background: '#1e293b', color: '#f1f5f9', borderRadius: 8, padding: '8px 12px' }}>
                  <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{a.severity}</p>
                  <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{a.title}</p>
                  <p style={{ color: '#94a3b8', fontSize: 11 }}>{a.description}</p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>

        {/* Layer toggle panel */}
        <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-700 rounded-xl p-3 z-[1000] min-w-[160px]">
          <p className="text-slate-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
            <span>⊞</span> Layers
          </p>
          {[
            { key: 'traffic',    label: 'Traffic & AIS', color: 'bg-blue-500' },
            { key: 'detections', label: 'Detections',    color: 'bg-red-500' },
            { key: 'analysis',   label: 'Analysis Area', color: 'bg-yellow-500' },
          ].map(({ key, label, color }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer py-1 group">
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={() => toggleLayer(key)}
                className="hidden"
              />
              <div className={`w-3.5 h-3.5 rounded-sm ${layers[key] ? color : 'bg-slate-700'} transition-colors shrink-0`} />
              <span className="text-slate-300 text-xs">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
