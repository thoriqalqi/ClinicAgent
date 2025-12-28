
import { SystemSettings } from '../types';

const DEFAULT_SETTINGS: SystemSettings = {
  clinicName: 'HealthTown Clinic',
  supportEmail: 'support@healthtown.com',
  maintenanceMode: false,
  enableAiConsultation: true,
  enableNewRegistrations: true,
  globalAnnouncement: '',
  aiModel: 'gemini-1.5-flash'
};

// In-memory store for simulated database
let localSettings = { ...DEFAULT_SETTINGS };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    await delay(300); // Simulate network latency
    return { ...localSettings };
  },

  updateSettings: async (updates: Partial<SystemSettings>): Promise<SystemSettings> => {
    await delay(600); // Simulate write latency
    localSettings = { ...localSettings, ...updates };
    return { ...localSettings };
  }
};
