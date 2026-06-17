import { useEffect, useState, useRef } from 'react';
import { Upload, Cloud, AlertTriangle, Clock } from 'lucide-react';
import api from '../lib/api';
import { timeAgo } from '../lib/utils';

function SarCard({ image }) {
  const isArchive = !['SIMULATED', 'YOLO'].includes(image.type);
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors cursor-pointer group">
      {/* Thumbnail placeholder */}
      <div className="h-32 bg-slate-900 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-900" />
        {image.url ? (
          <img src={image.url} alt={image.displayName} className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded border border-slate-600 bg-slate-800 flex items-center justify-center">
              <span className="text-slate-500 text-xs">SAR</span>
            </div>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 z-10">
          <span className="bg-slate-700/90 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
            {image.type}
          </span>
        </div>
        {image.darkShips > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-yellow-600/80 text-yellow-100 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle size={9} /> {image.darkShips} dark
            </span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-slate-200 text-xs font-medium truncate">{image.displayName}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-slate-500 text-xs">{image.detections} detections</span>
          <span className="text-slate-600 text-xs flex items-center gap-1">
            <Clock size={10} /> {timeAgo(image.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SarImages() {
  const [images, setImages]     = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef(null);

  const load = () => api.get('/sar').then(r => setImages(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/sar/upload', fd);
      setUploadMsg('Upload successful — SAR image analyzed.');
      load();
    } catch (err) {
      setUploadMsg(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const recentScans  = images.filter(i => ['SIMULATED', 'YOLO'].includes(i.type));
  const archiveScans = images.filter(i => !['SIMULATED', 'YOLO'].includes(i.type));

  return (
    <div className="p-6 max-w-5xl mx-auto fade-in">
      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-6 ${
          dragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".png,.jpg,.jpeg,.tif,.tiff"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />
        <div className="flex justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center">
            <Cloud size={24} className="text-slate-400" />
          </div>
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
            <Upload size={24} className="text-white" />
          </div>
        </div>

        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Analyzing SAR image...</span>
          </div>
        ) : (
          <>
            <p className="text-white font-semibold mb-1">Upload a SAR image for dark-ship analysis</p>
            <p className="text-slate-400 text-sm">
              Drag &amp; drop or click to browse · GeoTIFF, PNG, JPG · Alexandria Western Harbour
            </p>
            <p className="text-slate-600 text-xs mt-2 flex items-center justify-center gap-1">
              <span>⚙</span> Model: best.pt (YOLOv8) · pixel→GPS · AIS cross-reference
            </p>
          </>
        )}

        {uploadMsg && (
          <p className={`mt-3 text-sm ${uploadMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {uploadMsg}
          </p>
        )}
      </div>

      {/* Your Analyzed Scans */}
      {recentScans.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>📡</span> Your Analyzed Scans
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentScans.map(img => <SarCard key={img.id} image={img} />)}
          </div>
        </div>
      )}

      {/* Archive Imagery */}
      {archiveScans.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3">Archive Imagery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {archiveScans.map(img => <SarCard key={img.id} image={img} />)}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-8">No SAR images yet. Upload one above.</p>
      )}
    </div>
  );
}
