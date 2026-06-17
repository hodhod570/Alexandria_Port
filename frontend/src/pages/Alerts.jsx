import { useEffect, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { timeAgo, severityClasses, flagEmoji } from '../lib/utils';

const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES   = ['All', 'Open', 'Acknowledged', 'Resolved'];

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-slate-700 text-white'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

export default function Alerts() {
  const [alerts, setAlerts]         = useState([]);
  const [search, setSearch]         = useState('');
  const [severity, setSeverity]     = useState('All');
  const [status, setStatus]         = useState('Open');
  const [selected, setSelected]     = useState(null);

  const load = () => {
    api.get('/alerts', { params: { severity, status, search } })
      .then(r => setAlerts(r.data))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [severity, status, search]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/alerts/${id}/status`, { status: newStatus });
      load();
      setSelected(null);
    } catch {}
  };

  return (
    <div className="p-6 fade-in">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vessel, MMSI, alert..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Severity */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {SEVERITIES.map(s => (
            <FilterPill key={s} label={s} active={severity === s} onClick={() => setSeverity(s)} />
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {STATUSES.map(s => (
            <FilterPill key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
          ))}
        </div>

        <span className="text-slate-500 text-xs ml-auto">{alerts.length} alerts</span>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_120px_1fr_180px_100px_80px_24px] gap-4 px-5 py-3 border-b border-slate-800">
          {['SEVERITY', 'TYPE', 'ALERT', 'VESSEL', 'STATUS', 'TIME', ''].map(h => (
            <span key={h} className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {alerts.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">No alerts match your filters</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {alerts.map(alert => {
              const sc = severityClasses(alert.severity);
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelected(selected?.id === alert.id ? null : alert)}
                  className="grid grid-cols-[80px_120px_1fr_180px_100px_80px_24px] gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer items-start"
                >
                  {/* Severity */}
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${sc.text}`}>
                      {alert.severity}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} mt-0.5`} />
                  </div>

                  {/* Type */}
                  <span className="inline-flex">
                    <span className="bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded font-medium">
                      {alert.type === 'ZoneViolation' ? 'Zone Violation' : alert.type}
                    </span>
                  </span>

                  {/* Alert text */}
                  <div>
                    <p className="text-slate-100 text-sm font-medium">{alert.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{alert.description}</p>
                  </div>

                  {/* Vessel */}
                  <div>
                    {alert.vesselName ? (
                      <>
                        <p className="text-slate-300 text-xs font-semibold">
                          {alert.vesselFlag && <span className="mr-1">{flagEmoji(alert.vesselFlag)} {alert.vesselFlag}</span>}
                          {alert.vesselName}
                        </p>
                        {alert.mmsi && <p className="text-slate-500 text-xs">{alert.mmsi}</p>}
                      </>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <span className={`text-xs font-medium ${
                    alert.status === 'Open'         ? 'text-green-400' :
                    alert.status === 'Acknowledged' ? 'text-yellow-400' : 'text-slate-500'
                  }`}>
                    {alert.status}
                  </span>

                  {/* Time */}
                  <span className="text-slate-500 text-xs">{timeAgo(alert.time)}</span>

                  {/* Arrow */}
                  <ChevronRight size={14} className="text-slate-600 mt-0.5" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-5 fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">{selected.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{selected.description}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">&times;</button>
          </div>
          {selected.status !== 'Resolved' && (
            <div className="flex gap-2">
              {selected.status === 'Open' && (
                <button
                  onClick={() => handleStatusChange(selected.id, 'Acknowledged')}
                  className="px-4 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded-lg text-xs font-semibold hover:bg-yellow-600/30 transition"
                >
                  Acknowledge
                </button>
              )}
              <button
                onClick={() => handleStatusChange(selected.id, 'Resolved')}
                className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-xs font-semibold hover:bg-green-600/30 transition"
              >
                Mark Resolved
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
