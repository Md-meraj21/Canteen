export const money = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export const page = 'app-page mx-auto w-full max-w-7xl px-2 py-3 sm:px-6 sm:py-6 lg:px-8';

export const panel = 'app-panel rounded-lg border border-slate-200 bg-white shadow-sm';

export const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

export const labelClass = 'grid gap-1.5 text-sm font-semibold text-slate-700';

export const muted = 'text-sm text-slate-500';

export const statusTone = (status = '') => {
  const value = status.toLowerCase();
  if (['delivered', 'verified', 'approved', 'confirmed'].includes(value)) return 'success';
  if (['pending', 'shipped'].includes(value)) return 'warning';
  if (['rejected', 'cancelled', 'failed'].includes(value)) return 'error';
  return 'default';
};
