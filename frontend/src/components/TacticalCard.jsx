export default function TacticalCard({ children, className = '', glow, onClick }) {
  const glowClass =
    glow === 'cyan'  ? 'glow-cyan'  :
    glow === 'red'   ? 'glow-red'   :
    glow === 'green' ? 'glow-green' :
    glow === 'amber' ? 'glow-amber' : '';

  return (
    <div
      onClick={onClick}
      className={`glass rounded-xl ${glowClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, sub, right, icon: Icon }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-glass)]">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={15} className="text-tac-cyan opacity-80" />}
        <div>
          <p className="text-orb text-white text-xs font-semibold tracking-wider uppercase">{title}</p>
          {sub && <p style={{ color: 'var(--text-secondary)' }} className="text-[10px] mt-0.5">{sub}</p>}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
