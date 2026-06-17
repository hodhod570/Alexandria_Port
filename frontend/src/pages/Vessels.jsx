import { useEffect, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { flagEmoji } from '../lib/utils';

function Badge({ count, danger }) {
  if (count === 0) return <span className="text-slate-600 text-sm">0</span>;
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
      danger ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'
    }`}>
      {count}
    </span>
  );
}

export default function Vessels() {
  const [vessels, setVessels]   = useState([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/vessels', { params: { search } })
      .then(r => setVessels(r.data))
      .catch(() => {});
  }, [search]);

  return (
    <div className="p-6 fade-in">
      {/* Search + count */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-1 max-w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by vessel name, MMSI, or IMO"
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <span className="text-slate-500 text-xs">{vessels.length} vessels</span>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_100px_80px_24px] gap-4 px-5 py-3 border-b border-slate-800">
          {['VESSEL', 'MMSI', 'TYPE', 'FLAG', 'DARK PERIODS', 'ALERTS', ''].map(h => (
            <span key={h} className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {vessels.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">No vessels found</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {vessels.map(v => (
              <div
                key={v.id}
                onClick={() => setSelected(selected?.id === v.id ? null : v)}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_100px_80px_24px] gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer items-center"
              >
                {/* Name */}
                <div>
                  <p className="text-slate-100 text-sm font-bold tracking-wide">{v.name}</p>
                  <p className="text-slate-500 text-xs">IMO: {v.imo}</p>
                </div>

                <span className="text-slate-400 text-sm font-mono">{v.mmsi}</span>
                <span className="text-slate-400 text-sm">{v.type}</span>

                {/* Flag */}
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{flagEmoji(v.flag)}</span>
                  <span className="text-slate-400 text-sm">{v.flag}</span>
                </div>

                {/* Dark periods */}
                <div className="flex justify-center">
                  <Badge count={v.darkPeriods} danger={v.darkPeriods > 0} />
                </div>

                {/* Alerts */}
                <div className="flex justify-center">
                  <Badge count={v.alerts} danger={v.alerts > 0} />
                </div>

                <ChevronRight size={14} className="text-slate-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-5 fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{flagEmoji(selected.flag)}</span>
                <h3 className="text-white font-bold text-lg">{selected.name}</h3>
              </div>
              <p className="text-slate-400 text-sm">{selected.type} · IMO {selected.imo}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-lg">&times;</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'MMSI',         value: selected.mmsi },
              { label: 'Flag',         value: `${flagEmoji(selected.flag)} ${selected.flag}` },
              { label: 'Speed',        value: `${selected.speed} kn` },
              { label: 'Heading',      value: `${selected.heading}°` },
              { label: 'Position',     value: `${selected.lat}°N, ${selected.lng}°E` },
              { label: 'Dark Periods', value: selected.darkPeriods },
              { label: 'Active Alerts',value: selected.alerts },
              { label: 'Status',       value: selected.status },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-slate-100 text-sm font-semibold capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
