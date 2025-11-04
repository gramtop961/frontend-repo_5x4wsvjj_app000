import React from 'react';
import { BellRing, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function NotificationsPanel({ notifications, onClear }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {notifications.map((n) => (
        <div key={n.id} className={`rounded-lg shadow-lg p-3 border ${n.type === 'success' ? 'bg-emerald-50/90 border-emerald-200' : n.type === 'warning' ? 'bg-amber-50/90 border-amber-200' : 'bg-rose-50/90 border-rose-200'}`}>
          <div className="flex items-start gap-2">
            {n.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : n.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <BellRing className="w-5 h-5 text-rose-600" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-800">{n.title}</div>
              <div className="text-xs text-slate-600">{n.message}</div>
            </div>
            <button onClick={() => onClear(n.id)} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
          </div>
        </div>
      ))}
    </div>
  );
}
