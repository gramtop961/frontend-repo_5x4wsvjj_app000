import React, { useState } from 'react';
import { SlidersHorizontal, Bell, Save } from 'lucide-react';

export default function ThresholdSettings({ thresholds, onChange, webhooks, onWebhookChange }) {
  const [local, setLocal] = useState(thresholds);
  const [localHooks, setLocalHooks] = useState(webhooks);

  const handleSave = () => {
    onChange(local);
    onWebhookChange(localHooks);
  };

  return (
    <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Auto-Scaling Policies</h2>
        </div>
        <button onClick={handleSave} className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition">
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">CPU threshold (%)</label>
          <input type="number" className="w-full rounded-lg border-slate-300 focus:border-slate-500 focus:ring-slate-500" value={local.cpu}
            onChange={(e) => setLocal({ ...local, cpu: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">RAM threshold (%)</label>
          <input type="number" className="w-full rounded-lg border-slate-300 focus:border-slate-500 focus:ring-slate-500" value={local.ram}
            onChange={(e) => setLocal({ ...local, ram: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">Traffic threshold (req/s)</label>
          <input type="number" className="w-full rounded-lg border-slate-300 focus:border-slate-500 focus:ring-slate-500" value={local.traffic}
            onChange={(e) => setLocal({ ...local, traffic: Number(e.target.value) })} />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-slate-600" />
          <h3 className="text-md font-semibold text-slate-800">Notifications</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Slack Webhook URL</label>
            <input type="url" placeholder="https://hooks.slack.com/services/..." className="w-full rounded-lg border-slate-300 focus:border-slate-500 focus:ring-slate-500" value={localHooks.slack}
              onChange={(e) => setLocalHooks({ ...localHooks, slack: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Teams Webhook URL</label>
            <input type="url" placeholder="https://outlook.office.com/webhook/..." className="w-full rounded-lg border-slate-300 focus:border-slate-500 focus:ring-slate-500" value={localHooks.teams}
              onChange={(e) => setLocalHooks({ ...localHooks, teams: e.target.value })} />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Webhooks will receive real-time scaling events and alerts.</p>
      </div>
    </div>
  );
}
