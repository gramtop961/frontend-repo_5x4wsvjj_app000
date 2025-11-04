import React from 'react';
import { ArrowUpRight, ArrowDownRight, Scale, Terminal } from 'lucide-react';

export default function ServicesTable({ services, onScale, onViewLogs }) {
  return (
    <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-800">Microservices</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-4">Service</th>
              <th className="py-2 pr-4">CPU</th>
              <th className="py-2 pr-4">RAM</th>
              <th className="py-2 pr-4">Traffic</th>
              <th className="py-2 pr-4">Replicas</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t border-slate-200">
                <td className="py-3 pr-4 font-medium text-slate-800">{s.name}</td>
                <td className="py-3 pr-4">{s.cpu.toFixed(0)}%</td>
                <td className="py-3 pr-4">{s.ram.toFixed(0)}%</td>
                <td className="py-3 pr-4">{s.traffic.toFixed(0)} r/s</td>
                <td className="py-3 pr-4">{s.replicas} <span className="text-slate-500">(desired {s.desiredReplicas})</span></td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onScale(s.id, 1)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500">
                      <ArrowUpRight className="w-4 h-4" /> Scale up
                    </button>
                    <button onClick={() => onScale(s.id, -1)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-500">
                      <ArrowDownRight className="w-4 h-4" /> Scale down
                    </button>
                    <button onClick={() => onViewLogs(s)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
                      <Terminal className="w-4 h-4" /> Logs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
