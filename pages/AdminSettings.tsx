import React, { useState, useEffect } from 'react';
import { Save, Settings, Bell, Shield, Database, Globe, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { SystemSettings } from '../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof SystemSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (key: keyof SystemSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await settingsService.updateSettings(settings);
      setSuccessMsg('Settings updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error) {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-12 text-center text-slate-400 font-bold">Loading configuration...</div>;
  }

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl"><Settings size={24} /></div>
              System Configuration
            </h1>
            <p className="text-slate-500 font-medium mt-2 ml-1">Manage global application parameters and feature flags.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 flex items-center gap-3 transition-all disabled:opacity-70 hover:-translate-y-1"
          >
            {isSaving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-fade-in mb-8 font-bold shadow-sm">
            <CheckCircle2 size={24} /> {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* General Settings */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><Globe size={22} /></div>
                General Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Clinic / Application Name</label>
                  <input
                    type="text"
                    value={settings.clinicName}
                    onChange={(e) => handleChange('clinicName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Support Contact Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Bell size={22} /></div>
                Global Announcements
              </h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">System Message Banner</label>
                <textarea
                  rows={3}
                  value={settings.globalAnnouncement}
                  onChange={(e) => handleChange('globalAnnouncement', e.target.value)}
                  placeholder="Enter a message to display on all user dashboards..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none text-slate-900 font-medium"
                />
                <p className="text-xs text-slate-400 mt-2 font-bold pl-1">Leave empty to disable the global banner.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-violet-50 text-violet-500 rounded-xl"><Cpu size={22} /></div>
                AI Engine Configuration
              </h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Primary Model (Gemini)</label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => handleChange('aiModel', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all text-slate-900 font-bold cursor-pointer"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Optimized for Speed)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced Reasoning)</option>
                </select>
                <p className="text-xs text-slate-400 mt-2 font-bold pl-1">Controls the inference engine for Smart Consult & Prescriptions.</p>
              </div>
            </div>
          </div>

          {/* Toggles & Status */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Shield size={22} /></div>
                Feature Control
              </h2>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">AI Consultation</p>
                    <p className="text-xs text-slate-500 font-medium">Enable patient chatbot</p>
                  </div>
                  <button
                    onClick={() => handleToggle('enableAiConsultation')}
                    className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${settings.enableAiConsultation ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.enableAiConsultation ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Registration</p>
                    <p className="text-xs text-slate-500 font-medium">Allow new signups</p>
                  </div>
                  <button
                    onClick={() => handleToggle('enableNewRegistrations')}
                    className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${settings.enableNewRegistrations ? 'bg-blue-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.enableNewRegistrations ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div>
                    <p className="text-sm font-bold text-red-800">Maintenance Mode</p>
                    <p className="text-xs text-red-600/80 font-medium">Disable public access</p>
                  </div>
                  <button
                    onClick={() => handleToggle('maintenanceMode')}
                    className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-500 rounded-xl"><Database size={22} /></div>
                Data Management
              </h2>
              <div className="space-y-4">
                <button className="w-full py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2">
                  Backup Database
                </button>
                <button className="w-full py-4 border-2 border-red-50 bg-red-50 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-100 hover:border-red-100 transition-all flex items-center justify-center gap-2">
                  <AlertTriangle size={18} /> Factory Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};