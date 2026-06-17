import { useEffect, useState } from 'react';
import { AlertTriangle, Ship, Radar, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { timeAgo, severityClasses, flagEmoji } from '../lib/utils';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Overview() {
  const [alerts, setAlerts]   = useState([]);
  const [vessels, setVessels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/alerts').then(r => setAlerts(r.data)).catch(() => {});
    api.get('/vessels').then(r => setVessels(r.data)).catch(() => {});
  }, []);

  const openAlerts   = alerts.filter(a => a.status === 'Open');
  const darkShips    = vessels.filter(v => v.status === 'dark');
  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="p-6 max-w-5xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Alexandria Port — Dark Ship Detection System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={AlertTriangle} label="Active Alerts"   value={openAlerts.length}  sub="Open incidents"    color="bg-orange-600" />
        <StatCard icon={Radar}         label="Dark Ships"       value={darkShips.length}   sub="No AIS signal"     color="bg-red-600" />
        <StatCard icon={Ship}          label="Total Vessels"    value={vessels.length}     sub="Tracked vessels"   color="bg-blue-600" />
        <StatCard icon={Activity}      label="SAR Scans"        value={2}                  sub="Analyzed images"   color="bg-teal-600" />
      </div>

      {/* Recent Alerts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold text-sm">Recent Alerts</h2>
          <button onClick={() => navigate('/alerts')} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors">
            View all <ChevronRight size={14} />
          </button>
        </div>
        {recentAlerts.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No alerts</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentAlerts.map(alert => {
              const sc = severityClasses(alert.severity);
              return (
                <div key={alert.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate('/alerts')}>
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${sc.text}`}>{alert.severity}</span>
                    <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-100 text-sm font-medium truncate">{alert.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{alert.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-slate-400 text-xs">{timeAgo(alert.time)}</p>
                    <p className={`text-xs mt-1 ${alert.status === 'Open' ? 'text-green-400' : alert.status === 'Acknowledged' ? 'text-yellow-400' : 'text-slate-500'}`}>
                      {alert.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vessel Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold text-sm">Vessel Status</h2>
          <button onClick={() => navigate('/vessels')} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-800 text-center py-4">
          <div>
            <p className="text-2xl font-bold text-green-400">{vessels.filter(v => v.status === 'authorized').length}</p>
            <p className="text-slate-500 text-xs mt-1">Authorized</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{vessels.filter(v => v.status === 'traffic').length}</p>
            <p className="text-slate-500 text-xs mt-1">Traffic</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{vessels.filter(v => v.status === 'dark' || v.status === 'violation').length}</p>
            <p className="text-slate-500 text-xs mt-1">Suspicious</p>
          </div>
        </div>
      </div>
    </div>
  );
}
