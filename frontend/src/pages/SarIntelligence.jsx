import { useEffect, useState, useRef } from 'react';
import { Upload, Cloud, X, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { timeAgo } from '../lib/utils';
import TacticalCard, { CardHeader } from '../components/TacticalCard';
import { Satellite } from 'lucide-react';

function DetectionModal({ scan, onClose }) {
  if (!scan) return null;
  const boxes = scan.detectionBoxes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-tac-950/90 backdrop-blur-sm" />
      <div
        className="glass rounded-2xl w-full max-w-3xl relative z-10 enter-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-glass)' }}>
          <div>
            <p className="text-orb text-tac-cyan text-[10px] tracking-widest mb-1">YOLOv8 DETECTION ANALYSIS</p>
            <p className="text-white font-semibold text-sm">{scan.displayName}</p>
            <p className="text-xs opacity-50 font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {boxes.length} objects detected · {boxes.filter(b => b.label === 'Dark Ship').length} dark ships
            </p>
          </div>
          <button onClick={onClose} className="glass-sm rounded-lg p-2 text-tac-cyan hover:glow-cyan transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-0">
          {/* Image simulation with bounding boxes */}
          <div className="relative p-5 border-r" style={{ borderColor: 'var(--border-glass)' }}>
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #010c1a 0%, #021528 50%, #010c1a 100%)',
                height: 280,
              }}
            >
              {/* Simulated SAR texture */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 35%, rgba(0,242,255,0.15) 0%, transparent 40%), radial-gradient(circle at 75% 65%, rgba(0,200,255,0.1) 0%, transparent 35%)',
                }}
              />
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0,242,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Detection bounding boxes */}
              {boxes.map(box => {
                const isDark = box.label === 'Dark Ship';
                const color  = isDark ? '#ff0055' : box.label === 'Wake' ? '#ffaa00' : '#00ff9d';
                return (
                  <div
                    key={box.id}
                    className={isDark ? 'detection-box' : 'detection-box-green'}
                    style={{
                      left:   `${box.x}%`,
                      top:    `${box.y}%`,
                      width:  `${box.w}%`,
                      height: `${box.h}%`,
                      borderColor: color,
                      boxShadow: `0 0 8px ${color}60`,
                    }}
                  >
                    <div
                      className="absolute -top-4 left-0 text-[8px] font-mono font-bold px-1 whitespace-nowrap"
                      style={{ background: color, color: '#000' }}
                    >
                      {box.id} {Math.round(box.conf * 100)}%
                    </div>
                  </div>
                );
              })}

              {/* Scan line animation */}
              <div
                className="absolute left-0 right-0 h-px pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,242,255,0.6), transparent)',
                  animation: 'scanLine 3s linear infinite',
                  top: 0,
                }}
              />
            </div>
            <p className="text-[9px] font-mono opacity-30 mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
              Synthetic Aperture Radar · Pixel → GPS projection active
            </p>
          </div>

          {/* Detection list */}
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 340 }}>
            <p className="text-orb text-[9px] tracking-widest text-tac-cyan mb-3">DETECTION LOG</p>
            <div className="space-y-2">
              {boxes.map(box => {
                const isDark  = box.label === 'Dark Ship';
                const isWake  = box.label === 'Wake';
                const color   = isDark ? 'text-tac-red' : isWake ? 'text-tac-amber' : 'text-tac-green';
                const border  = isDark ? 'border-tac-red/30' : isWake ? 'border-tac-amber/30' : 'border-tac-green/30';
                return (
                  <div key={box.id} className={`glass-inset rounded-lg p-3 border ${border}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-[9px] font-bold ${color}`}>{box.id}</span>
                      <span className="font-mono text-[9px] opacity-50" style={{ color: 'var(--text-secondary)' }}>
                        conf: {Math.round(box.conf * 100)}%
                      </span>
                    </div>
                    <p className={`text-xs font-semibold ${color}`}>{box.label}</p>
                    <div className="w-full h-1 bg-tac-900 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${box.conf * 100}%`,
                          background: isDark ? '#ff0055' : isWake ? '#ffaa00' : '#00ff9d',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 glass-inset rounded-lg p-3">
              <p className="text-orb text-[9px] tracking-widest text-tac-cyan mb-2">MODEL INFO</p>
              <div className="space-y-1">
                {[
                  ['Model',      'best.pt (YOLOv8)'],
                  ['Projection', 'pixel → GPS'],
                  ['Source',     scan.type],
                  ['Objects',    boxes.length],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[9px] font-mono opacity-40" style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span className="text-[10px] font-mono text-tac-cyan">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanCard({ image, onClick }) {
  const darkCount = image.detectionBoxes?.filter(b => b.label === 'Dark Ship').length ?? image.darkShips;
  return (
    <div
      onClick={onClick}
      className="glass rounded-xl overflow-hidden cursor-pointer hover:glow-cyan transition-all group"
    >
      <div
        className="h-28 relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #010c1a, #021528)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,242,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,1) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <span className="text-tac-cyan opacity-20 font-mono text-[10px] tracking-widest">SAR DATA</span>
        {/* Type badge */}
        <span className="absolute top-2 left-2 glass-sm text-[9px] font-mono font-bold px-2 py-0.5 rounded text-tac-cyan">
          {image.type}
        </span>
        {/* Dark ship badge */}
        {darkCount > 0 && (
          <span className="absolute top-2 right-2 bg-tac-red/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            <AlertTriangle size={9} /> {darkCount}
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-tac-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-tac-cyan text-[10px] font-mono font-bold">ANALYZE →</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{image.displayName}</p>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] font-mono text-tac-cyan opacity-60">{image.detections} detections</span>
          <span className="text-[9px] font-mono opacity-30" style={{ color: 'var(--text-secondary)' }}>{timeAgo(image.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

export default function SarIntelligence() {
  const [images, setImages]       = useState([]);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [modal, setModal]         = useState(null);
  const fileRef = useRef(null);

  const load = () => api.get('/sar').then(r => setImages(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true); setUploadMsg('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/sar/upload', fd);
      setUploadMsg('Analysis complete. YOLOv8 model processed image successfully.');
      load();
    } catch (err) {
      setUploadMsg(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const recent  = images.filter(i => ['SIMULATED', 'YOLO'].includes(i.type));
  const archive = images.filter(i => !['SIMULATED', 'YOLO'].includes(i.type));

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5 enter-up">
      {/* Upload zone */}
      <TacticalCard
        className={`transition-all ${dragging ? 'glow-cyan border-tac-cyan/40' : ''}`}
        glow={dragging ? 'cyan' : undefined}
      >
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center py-10 cursor-pointer"
        >
          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />

          <div className="flex gap-4 mb-5">
            <div className="w-14 h-14 glass-inset rounded-xl flex items-center justify-center">
              <Cloud size={22} className="opacity-40" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${dragging ? 'bg-tac-cyan glow-cyan' : 'bg-tac-cyan/20 border border-tac-cyan/30'}`}>
              <Upload size={22} className={dragging ? 'text-tac-950' : 'text-tac-cyan'} />
            </div>
          </div>

          {uploading ? (
            <div className="flex items-center gap-2 text-tac-cyan">
              <div className="w-4 h-4 border-2 border-tac-cyan border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-sm">Processing SAR image via YOLOv8…</span>
            </div>
          ) : (
            <>
              <p className="text-white font-semibold mb-1">Upload a SAR image for dark-ship analysis</p>
              <p className="opacity-50 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Drag &amp; drop or click to browse · GeoTIFF, PNG, JPG · Alexandria Western Harbour
              </p>
              <p className="font-mono text-[10px] text-tac-cyan opacity-50 mt-2">
                ⚙ Model: best.pt (YOLOv8) · pixel→GPS · AIS cross-reference
              </p>
            </>
          )}

          {uploadMsg && (
            <p className={`mt-3 text-sm font-mono ${uploadMsg.includes('complete') ? 'text-tac-green' : 'text-tac-red'}`}>
              {uploadMsg}
            </p>
          )}
        </div>
      </TacticalCard>

      {/* Your Analyzed Scans */}
      {recent.length > 0 && (
        <div>
          <p className="text-orb text-tac-cyan text-[10px] tracking-widest mb-3">📡 YOUR ANALYZED SCANS</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {recent.map(img => <ScanCard key={img.id} image={img} onClick={() => setModal(img)} />)}
          </div>
        </div>
      )}

      {/* Archive Imagery */}
      {archive.length > 0 && (
        <div>
          <p className="text-orb text-tac-cyan text-[10px] tracking-widest mb-3">🗄 ARCHIVE IMAGERY</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {archive.map(img => <ScanCard key={img.id} image={img} onClick={() => setModal(img)} />)}
          </div>
        </div>
      )}

      {/* Detection Modal */}
      {modal && <DetectionModal scan={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
