export const timeAgo = (dateStr) => {
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
};

export const flagEmoji = (code) => {
  if (!code) return '';
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 0x1F1E0 - 0x41))
    .join('');
};

export const severityClasses = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return { dot: 'bg-red-500',   pill: 'bg-red-500/15 text-red-400 border border-red-500/30',    text: 'text-red-400' };
    case 'HIGH':     return { dot: 'bg-orange-500', pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/30', text: 'text-orange-400' };
    case 'MEDIUM':   return { dot: 'bg-blue-500',   pill: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',   text: 'text-blue-400' };
    case 'LOW':      return { dot: 'bg-slate-500',  pill: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',  text: 'text-slate-400' };
    default:         return { dot: 'bg-slate-500',  pill: 'bg-slate-500/15 text-slate-400', text: 'text-slate-400' };
  }
};
