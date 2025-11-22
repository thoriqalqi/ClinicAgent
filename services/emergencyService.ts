import { Hospital, EmergencyUnit } from '../types';

const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'H001',
    name: 'Central City Hospital',
    distance: '2.5 km',
    eta: '8 mins',
    type: 'General',
    availableBeds: 12,
    coordinates: { lat: -6.2088, lng: 106.8456 }
  },
  {
    id: 'H002',
    name: 'HealthTown Emergency Center',
    distance: '4.1 km',
    eta: '15 mins',
    type: 'Specialized',
    availableBeds: 5,
    coordinates: { lat: -6.2188, lng: 106.8556 }
  },
  {
    id: 'H003',
    name: 'Westside Medical Clinic',
    distance: '1.2 km',
    eta: '4 mins',
    type: 'Clinic',
    availableBeds: 0, // Full
    coordinates: { lat: -6.1988, lng: 106.8356 }
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const emergencyService = {
  /**
   * Find nearest hospitals based on user location (Simulated)
   */
  findNearbyHospitals: async (): Promise<Hospital[]> => {
    await delay(800);
    return MOCK_HOSPITALS;
  },

  /**
   * Simulate contacting the on-call doctor
   */
  notifyOnCallDoctor: async (patientName: string, condition: string): Promise<string> => {
    await delay(1500);
    // In a real app, this would trigger a push notification to the doctor's app
    return "Dr. Sarah Wijaya (On-Call) has been notified and is reviewing your vitals.";
  },

  /**
   * Dispatch an ambulance
   */
  dispatchAmbulance: async (): Promise<EmergencyUnit> => {
    await delay(2000);
    return {
        id: `AMB-${Math.floor(Math.random() * 1000)}`,
        plateNumber: 'B 1191 SH',
        status: 'DISPATCHED',
        eta: '6 Minutes',
        crew: ['Paramedic John', 'Driver Mike']
    };
  }
};
