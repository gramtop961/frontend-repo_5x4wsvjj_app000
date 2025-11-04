import React from 'react';
import { Activity, Cpu, MemoryStick, Network } from 'lucide-react';

function Sparkline({ data, color = '#0ea5e9' }) {
  const width = 120;
  const height = 36;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

export default function ServiceGrid({ services, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((s) => (
        <button key={s.id} onClick={() => onSelect(s)} className="text-left bg-white/70 backdrop-blur border border-slate-200 rounded-xl p-4 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-slate-400">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-800">{s.name}</h3>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : s.status === 'Degraded' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{s.status}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
              <div className="flex items-center gap-1 text-slate-600"><Cpu className="w-4 h-4" /> CPU</div>
              <div className="text-slate-900 font-semibold">{s.cpu.toFixed(0)}%</div>
              <Sparkline data={s.cpuHistory} color="#10b981" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
              <div className="flex items-center gap-1 text-slate-600"><MemoryStick className="w-4 h-4" /> RAM</div>
              <div className="text-slate-900 font-semibold">{s.ram.toFixed(0)}%</div>
              <Sparkline data={s.ramHistory} color="#6366f1" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
              <div className="flex items-center gap-1 text-slate-600"><Network className="w-4 h-4" /> Traffic</div>
              <div className="text-slate-900 font-semibold">{s.traffic.toFixed(0)} r/s</div>
              <Sparkline data={s.trafficHistory} color="#0ea5e9" />
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-600">Replicas: <span className="font-medium text-slate-900">{s.replicas}</span> (desired: {s.desiredReplicas})</div>
        </button>
      ))}
    </div>
  );
}
