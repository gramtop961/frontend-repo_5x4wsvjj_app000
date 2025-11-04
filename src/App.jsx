import React, { useEffect, useMemo, useState } from 'react';
import { Settings, ServerCog, X } from 'lucide-react';
import ThresholdSettings from './components/ThresholdSettings.jsx';
import ServiceGrid from './components/ServiceGrid.jsx';
import ServicesTable from './components/ServicesTable.jsx';
import NotificationsPanel from './components/NotificationsPanel.jsx';

function Sparkline({ data, color = '#0ea5e9', width = 300, height = 80 }) {
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

export default function App() {
  const [thresholds, setThresholds] = useState({ cpu: 75, ram: 80, traffic: 120 });
  const [webhooks, setWebhooks] = useState({ slack: '', teams: '' });
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);

  const [services, setServices] = useState(() => {
    const base = [
      { id: 'svc-auth', name: 'auth-service' },
      { id: 'svc-api', name: 'api-gateway' },
      { id: 'svc-pay', name: 'payments' },
      { id: 'svc-rec', name: 'recommender' },
      { id: 'svc-feed', name: 'feed' },
      { id: 'svc-cdn', name: 'edge-cdn' },
    ];
    return base.map((b, i) => ({
      ...b,
      cpu: 40 + (i * 7) % 20,
      ram: 45 + (i * 5) % 25,
      traffic: 60 + (i * 13) % 80,
      replicas: 2 + (i % 2),
      desiredReplicas: 2 + (i % 2),
      status: 'Healthy',
      cpuHistory: Array.from({ length: 24 }, (_, j) => 30 + ((i + j) * 5) % 60),
      ramHistory: Array.from({ length: 24 }, (_, j) => 35 + ((i + j) * 7) % 50),
      trafficHistory: Array.from({ length: 24 }, (_, j) => 40 + ((i + j) * 11) % 140),
      events: [],
      logs: ['Service started', 'Probe passed', 'Ready to serve'],
    }));
  });

  // Utility to push notification
  const pushNotification = (payload) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const n = { id, ...payload };
    setNotifications((prev) => [n, ...prev].slice(0, 6));
  };

  const clearNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  // Simulate metrics updates and auto-scaling decisions
  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) => prev.map((s) => {
        const jitter = () => (Math.random() - 0.5) * 12;
        const cpu = Math.max(0, Math.min(100, s.cpu + jitter()));
        const ram = Math.max(0, Math.min(100, s.ram + jitter()));
        const traffic = Math.max(0, s.traffic + (Math.random() - 0.5) * 40);

        const cpuHistory = [...s.cpuHistory.slice(-23), cpu];
        const ramHistory = [...s.ramHistory.slice(-23), ram];
        const trafficHistory = [...s.trafficHistory.slice(-23), traffic];

        let desiredReplicas = s.desiredReplicas;
        let status = 'Healthy';
        let newEvents = s.events;

        const shouldScaleUp = cpu > thresholds.cpu || ram > thresholds.ram || traffic > thresholds.traffic;
        const shouldScaleDown = cpu < thresholds.cpu * 0.45 && ram < thresholds.ram * 0.5 && traffic < thresholds.traffic * 0.4;

        if (shouldScaleUp) {
          desiredReplicas = Math.min(s.desiredReplicas + 1, 20);
          status = 'Degraded';
          if (desiredReplicas !== s.desiredReplicas) {
            const evt = { ts: new Date().toISOString(), type: 'scale', message: `Auto scale-up to ${desiredReplicas}` };
            newEvents = [evt, ...newEvents];
            pushNotification({ type: 'warning', title: `${s.name}`, message: evt.message });
          }
        } else if (shouldScaleDown) {
          desiredReplicas = Math.max(s.desiredReplicas - 1, 1);
          status = 'Healthy';
          if (desiredReplicas !== s.desiredReplicas) {
            const evt = { ts: new Date().toISOString(), type: 'scale', message: `Auto scale-down to ${desiredReplicas}` };
            newEvents = [evt, ...newEvents];
            pushNotification({ type: 'success', title: `${s.name}`, message: evt.message });
          }
        } else {
          status = s.status === 'Unhealthy' ? 'Degraded' : s.status;
        }

        // Simulate reconciliation towards desired
        const replicas = s.replicas + Math.sign(desiredReplicas - s.replicas);
        if (replicas !== s.replicas) {
          const evt = { ts: new Date().toISOString(), type: 'reconcile', message: `Replicas now ${replicas} (target ${desiredReplicas})` };
          newEvents = [evt, ...newEvents];
        }

        return {
          ...s,
          cpu, ram, traffic,
          cpuHistory, ramHistory, trafficHistory,
          desiredReplicas,
          replicas,
          status,
          events: newEvents.slice(0, 50),
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [thresholds]);

  const handleScale = (id, delta) => {
    setServices((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const desired = Math.max(1, Math.min(50, s.desiredReplicas + delta));
      const evt = { ts: new Date().toISOString(), type: 'manual', message: `Manual scale ${delta > 0 ? 'up' : 'down'} to ${desired}` };
      pushNotification({ type: delta > 0 ? 'warning' : 'success', title: s.name, message: evt.message });
      return { ...s, desiredReplicas: desired, events: [evt, ...s.events] };
    }));
  };

  const overall = useMemo(() => {
    const cpu = services.reduce((a, b) => a + b.cpu, 0) / services.length;
    const ram = services.reduce((a, b) => a + b.ram, 0) / services.length;
    const traffic = services.reduce((a, b) => a + b.traffic, 0) / services.length;
    return { cpu, ram, traffic };
  }, [services]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ServerCog className="w-6 h-6 text-slate-800" />
            <h1 className="text-xl font-semibold text-slate-900">Auto-Scaling Control Plane</h1>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-700">
            <div>Avg CPU: <span className="font-semibold text-slate-900">{overall.cpu.toFixed(0)}%</span></div>
            <div>Avg RAM: <span className="font-semibold text-slate-900">{overall.ram.toFixed(0)}%</span></div>
            <div>Avg Traffic: <span className="font-semibold text-slate-900">{overall.traffic.toFixed(0)} r/s</span></div>
            <div className="hidden md:flex items-center gap-2 text-slate-600"><Settings className="w-4 h-4" /> Live</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <ThresholdSettings
          thresholds={thresholds}
          onChange={setThresholds}
          webhooks={webhooks}
          onWebhookChange={setWebhooks}
        />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Real-time Service Metrics</h2>
          <ServiceGrid services={services} onSelect={setSelected} />
        </section>

        <section>
          <ServicesTable services={services} onScale={handleScale} onViewLogs={setSelected} />
        </section>
      </main>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSelected(null)} />
          <div className="relative z-50 w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ServerCog className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-semibold text-slate-900">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded-md hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-sm font-medium text-slate-700 mb-2">CPU</div>
                <Sparkline data={selected.cpuHistory} color="#10b981" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-sm font-medium text-slate-700 mb-2">RAM</div>
                <Sparkline data={selected.ramHistory} color="#6366f1" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-sm font-medium text-slate-700 mb-2">Traffic</div>
                <Sparkline data={selected.trafficHistory} color="#0ea5e9" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Event History</h4>
                <div className="h-40 overflow-auto border border-slate-200 rounded-lg bg-slate-50">
                  <ul className="text-sm divide-y divide-slate-200">
                    {selected.events.length === 0 && (
                      <li className="p-2 text-slate-500">No recent events</li>
                    )}
                    {selected.events.map((e, idx) => (
                      <li key={idx} className="p-2">
                        <div className="text-slate-700">{e.message}</div>
                        <div className="text-xs text-slate-500">{new Date(e.ts).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Status Logs</h4>
                <div className="h-40 overflow-auto border border-slate-200 rounded-lg bg-slate-50">
                  <ul className="text-sm divide-y divide-slate-200">
                    {selected.logs.map((l, idx) => (
                      <li key={idx} className="p-2 text-slate-700">{l}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-600">Replicas: <span className="font-medium text-slate-900">{selected.replicas}</span> (desired {selected.desiredReplicas})</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => {
                  setServices((prev) => prev.map((s) => s.id === selected.id ? { ...s, desiredReplicas: s.desiredReplicas + 1 } : s));
                  pushNotification({ type: 'warning', title: selected.name, message: `Manual scale up to ${selected.desiredReplicas + 1}` });
                }}>Scale up</button>
                <button className="px-3 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-500" onClick={() => {
                  setServices((prev) => prev.map((s) => s.id === selected.id ? { ...s, desiredReplicas: Math.max(1, s.desiredReplicas - 1) } : s));
                  pushNotification({ type: 'success', title: selected.name, message: `Manual scale down to ${Math.max(1, selected.desiredReplicas - 1)}` });
                }}>Scale down</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationsPanel notifications={notifications} onClear={clearNotification} />

      <footer className="py-8 text-center text-xs text-slate-500">
        Pub/Sub and webhook integrations are simulated in this UI. Connect your backend to drive real metrics, scaling triggers, and outbound Slack/Teams notifications.
      </footer>
    </div>
  );
}
