import { useState } from 'react';
import { Bell, Eye, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TacticalCard, { CardHeader } from '../components/TacticalCard';

function Toggle({ label, description, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked ?? true);
  return (
    <div className="flex items-center justify-between py-3 border-b border-tac-cyan/5 last:border-0">
      <div>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && (
          <p className="text-[10px] font-mono mt-0.5 opacity-50" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => setChecked(c => !c)}
        className={`relative inline-flex w-10 h-5 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-tac-cyan/30 border border-tac-cyan/50' : 'bg-tac-800 border border-tac-cyan/10'
        }`}
      >
        <span className={`inline-block w-4 h-4 rounded-full absolute top-0.5 transition-transform ${
          checked ? 'bg-tac-cyan translate-x-5' : 'bg-tac-muted translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4 enter-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-orb text-white text-xs font-bold tracking-widest uppercase">System Settings</p>
          <p className="text-[10px] font-mono mt-0.5 opacity-50" style={{ color: 'var(--text-secondary)' }}>
            Manage account and operational preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            saved
              ? 'bg-tac-green/20 text-tac-green border border-tac-green/40'
              : 'bg-tac-cyan/15 text-tac-cyan border border-tac-cyan/40 hover:bg-tac-cyan/25'
          }`}
        >
          <Save size={13} />
          {saved ? 'SAVED' : 'SAVE CHANGES'}
        </button>
      </div>

      {/* Account */}
      <TacticalCard>
        <CardHeader icon={Shield} title="Account" sub="Your identity and clearance level" />
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-orb text-[9px] tracking-widest mb-1.5 opacity-50" style={{ color: 'var(--text-secondary)' }}>
                USER ID
              </label>
              <input
                defaultValue={user?.username}
                readOnly
                className="w-full glass-inset rounded-lg px-3 py-2 text-sm font-mono outline-none cursor-not-allowed opacity-60"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-orb text-[9px] tracking-widest mb-1.5 opacity-50" style={{ color: 'var(--text-secondary)' }}>
                CLEARANCE
              </label>
              <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold ${
                user?.role === 'admin'
                  ? 'bg-tac-cyan/10 text-tac-cyan border border-tac-cyan/30'
                  : 'glass-inset text-tac-green'
              }`}>
                <Shield size={11} />
                {user?.role === 'admin' ? 'ADMIN — FULL ACCESS' : 'OPERATOR'}
              </div>
            </div>
          </div>
        </div>
      </TacticalCard>

      {/* Notifications */}
      <TacticalCard>
        <CardHeader icon={Bell} title="Notifications" sub="Alert delivery preferences" />
        <div className="p-5">
          <Toggle label="Critical Alerts"      description="Receive immediate notification for CRITICAL severity alerts" />
          <Toggle label="High Severity Alerts" description="Notify on HIGH severity detections" />
          <Toggle label="Dark Ship Detections" description="Alert when a vessel goes dark near the harbor" />
          <Toggle label="Zone Violations"      description="Notify when a vessel enters a restricted zone" defaultChecked={false} />
          <Toggle label="SAR Image Analysis"   description="Notify when a SAR scan is complete" defaultChecked={false} />
        </div>
      </TacticalCard>

      {/* Display */}
      <TacticalCard>
        <CardHeader icon={Eye} title="Display" sub="Map and table rendering options" />
        <div className="p-5">
          <Toggle label="Show Vessel Trails"         description="Draw movement history on the live map" defaultChecked={false} />
          <Toggle label="Animate Dark Ship Markers"  description="Pulsing glow for dark ship detections" />
          <Toggle label="Auto-refresh Alerts"        description="Refresh alert list every 30 seconds" />
          <Toggle label="Compact Table View"         description="Reduce row height in vessel and alert tables" defaultChecked={false} />
        </div>
      </TacticalCard>
    </div>
  );
}
