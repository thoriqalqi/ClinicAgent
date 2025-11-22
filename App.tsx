
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard'; // Treating as Doctor Dashboard
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDoctors } from './pages/AdminDoctors';
import { AdminPatients } from './pages/AdminPatients';
import { AdminSettings } from './pages/AdminSettings';
import { AdminTransparency } from './pages/AdminTransparency'; // Import new page
import { PatientDashboard } from './pages/PatientDashboard';
import { Consultation } from './pages/Consultation';
import { Prescription } from './pages/Prescription';
import { Emergency } from './pages/Emergency';
import { MedicalRecords } from './pages/MedicalRecords';
import { DoctorAssessment } from './pages/DoctorAssessment';
import { DoctorPatients } from './pages/DoctorPatients';
import { Profile } from './pages/Profile'; // Import new page
import { AppView, User, UserRole } from './types';
import { settingsService } from './services/settingsService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [clinicName, setClinicName] = useState('ClinicAgent');

  // State to pass patient data from DoctorPatients -> Prescription
  const [prescriptionTarget, setPrescriptionTarget] = useState<{
      patientId: string;
      patientName: string;
      diagnosis?: string;
  } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
        try {
            const settings = await settingsService.getSettings();
            setClinicName(settings.clinicName || 'ClinicAgent');
        } catch(e) {
            console.error(e);
        }
    };
    loadSettings();

    // Listen for real-time updates from Admin Settings
    const handleSettingsUpdate = () => {
        loadSettings();
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  // When user logs in, reset view to their default dashboard
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.DASHBOARD);
    setPrescriptionTarget(null);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Handler to switch to prescription view with data
  const handleWritePrescription = (data: { patientId: string; patientName: string; diagnosis?: string }) => {
      setPrescriptionTarget(data);
      setCurrentView(AppView.PRESCRIPTION);
  };

  const renderView = () => {
    if (!currentUser) return null;

    // Role-Based Routing Protection & Rendering
    switch (currentView) {
      case AppView.DASHBOARD:
        if (currentUser.role === UserRole.ADMIN) return <AdminDashboard />;
        if (currentUser.role === UserRole.PATIENT) return <PatientDashboard currentUser={currentUser} onChangeView={setCurrentView} onProfileUpdate={handleProfileUpdate} />;
        // Pass currentUser AND onChangeView to Dashboard
        return <Dashboard currentUser={currentUser} onChangeView={setCurrentView} />; 

      case AppView.CONSULTATION:
        // DOCTOR gets the Medical Chatbot
        if (currentUser.role === UserRole.DOCTOR) {
            return <DoctorAssessment currentUser={currentUser} />;
        }
        // PATIENT gets the Smart Assessment Form
        return <Consultation currentUser={currentUser} />;

      case AppView.PRESCRIPTION:
        return <Prescription 
            currentUser={currentUser} 
            preFilledData={prescriptionTarget}
            onClearPreFilledData={() => setPrescriptionTarget(null)}
        />;

      case AppView.EMERGENCY:
        return <Emergency />;

      case AppView.RECORDS:
        return <MedicalRecords currentUser={currentUser} />;

      case AppView.PROFILE:
        return <Profile currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />;

      case AppView.ADMIN_DOCTORS:
        if (currentUser.role !== UserRole.ADMIN) {
            return <div className="text-red-500 text-center p-10">Access Denied</div>;
        }
        return <AdminDoctors />;

      case AppView.ADMIN_PATIENTS:
        if (currentUser.role !== UserRole.ADMIN) {
            return <div className="text-red-500 text-center p-10">Access Denied</div>;
        }
        return <AdminPatients />;

      case AppView.ADMIN_SETTINGS:
        if (currentUser.role !== UserRole.ADMIN) {
            return <div className="text-red-500 text-center p-10">Access Denied</div>;
        }
        return <AdminSettings />;
        
      case AppView.ADMIN_TRANSPARENCY:
        if (currentUser.role !== UserRole.ADMIN) {
            return <div className="text-red-500 text-center p-10">Access Denied</div>;
        }
        return <AdminTransparency />;
      
      // Doctor specific view for My Patients (Booked)
      case AppView.DOCTOR_PATIENTS:
        if (currentUser.role !== UserRole.DOCTOR) {
             return <div className="text-red-500 text-center p-10">Access Denied</div>;
        }
        return <DoctorPatients currentUser={currentUser} onWritePrescription={handleWritePrescription} />;

      // Fallback for legacy DOCTOR_ASSESSMENT links, redirect to same chatbot logic
      case 'DOCTOR_ASSESSMENT' as AppView: 
        if (currentUser.role !== UserRole.DOCTOR) return <Dashboard currentUser={currentUser} onChangeView={setCurrentView} />;
        return <DoctorAssessment currentUser={currentUser} />;

      default:
        return <Dashboard currentUser={currentUser} onChangeView={setCurrentView} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      setCurrentView={setCurrentView}
      onLogout={handleLogout}
      systemName={clinicName}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
