
import { Patient, UserRole, User, AppView } from './types';
import {
  LayoutDashboard,
  Stethoscope,
  Pill,
  Siren,
  FileText,
  Users,
  Settings,
  ShieldAlert,
} from 'lucide-react';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P001',
    name: 'Budi Santoso',
    age: 45,
    gender: 'Male',
    bpjsNumber: '000123456789',
    lastVisit: '2024-01-15',
    history: ['Hipertensi', 'Diabetes Tipe 2']
  },
  {
    id: 'P002',
    name: 'Siti Aminah',
    age: 28,
    gender: 'Female',
    bpjsNumber: '000987654321',
    lastVisit: '2024-02-10',
    history: ['Asma', 'Alergi Musiman']
  },
  {
    id: 'P003',
    name: 'Ahmad Rizki',
    age: 8,
    gender: 'Male',
    bpjsNumber: '000555666777',
    lastVisit: '2024-03-01',
    history: ['Demam', 'Batuk']
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'D001',
    name: 'Dr. Sarah Wijaya',
    email: 'sarah@healthtown.com',
    role: UserRole.DOCTOR,
    status: 'ACTIVE',
    clinic: 'Klinik Sehat HealthTown',
    specialization: 'Dokter Umum',
    strNumber: 'STR-1234567890',
    experienceYears: 8,
    password: 'password123'
  },
  {
    id: 'D002',
    name: 'Dr. Andi Pratama',
    email: 'andi@healthtown.com',
    role: UserRole.DOCTOR,
    status: 'PENDING',
    clinic: 'Puskesmas Kota',
    specialization: 'Dokter Anak',
    strNumber: 'STR-0987654321',
    experienceYears: 5,
    password: 'password123'
  },
  {
    id: 'D003',
    name: 'Dr. Bambang Hartono',
    email: 'bambang@healthtown.com',
    role: UserRole.DOCTOR,
    status: 'ACTIVE',
    clinic: 'RS Jantung Jakarta',
    specialization: 'Spesialis Jantung',
    strNumber: 'STR-1122334455',
    experienceYears: 15,
    password: 'password123'
  },
  {
    id: 'D004',
    name: 'Dr. Lina Sucipto',
    email: 'lina@healthtown.com',
    role: UserRole.DOCTOR,
    status: 'ACTIVE',
    clinic: 'Klinik Kulit Indah',
    specialization: 'Spesialis Kulit',
    strNumber: 'STR-5566778899',
    experienceYears: 12,
    password: 'password123'
  },
  {
    id: 'D005',
    name: 'Dr. Eka Putri',
    email: 'eka@healthtown.com',
    role: UserRole.DOCTOR,
    status: 'ACTIVE',
    clinic: 'Klinik Mata Sejahtera',
    specialization: 'Spesialis Mata',
    strNumber: 'STR-3344556677',
    experienceYears: 7,
    password: 'password123'
  },
  {
    id: 'D006',
    name: 'Dr. Fajar Nugraha',
    email: 'fajar@healthtown.com',
    role: UserRole.DOCTOR,
    status: 'ACTIVE',
    clinic: 'RS Bedah Sentosa',
    specialization: 'Bedah Umum',
    strNumber: 'STR-9988776655',
    experienceYears: 10,
    password: 'password123'
  },
  {
    id: 'A001',
    name: 'Admin Sistem',
    email: 'admin@healthtown.com',
    role: UserRole.ADMIN,
    status: 'ACTIVE',
    password: 'admin'
  },
  {
    id: 'U001',
    name: 'Budi Santoso',
    email: 'budi@email.com',
    role: UserRole.PATIENT,
    status: 'ACTIVE',
    password: 'password'
  },
  {
    id: 'U002',
    name: 'Siti Aminah',
    email: 'siti@email.com',
    role: UserRole.PATIENT,
    status: 'ACTIVE',
    password: 'password'
  },
  {
    id: 'U003',
    name: 'Rudi Hermawan',
    email: 'rudi@email.com',
    role: UserRole.PATIENT,
    status: 'ACTIVE',
    password: 'password'
  }
];

export const NAV_ITEMS = {
  [UserRole.ADMIN]: [
    { id: AppView.DASHBOARD, label: 'Beranda Admin', icon: LayoutDashboard },
    { id: AppView.ADMIN_TRANSPARENCY, label: 'Audit & Transparansi', icon: ShieldAlert },
    { id: AppView.ADMIN_DOCTORS, label: 'Kelola Dokter', icon: Stethoscope },
    { id: AppView.ADMIN_PATIENTS, label: 'Database Pasien', icon: Users },
    { id: AppView.ADMIN_SETTINGS, label: 'Pengaturan Sistem', icon: Settings },
  ],
  [UserRole.DOCTOR]: [
    { id: AppView.DASHBOARD, label: 'Beranda', icon: LayoutDashboard },
    { id: AppView.DOCTOR_PATIENTS, label: 'Pasien Saya', icon: Users },
    { id: AppView.CONSULTATION, label: 'Asisten Medis AI', icon: Stethoscope },
    { id: AppView.PRESCRIPTION, label: 'Tulis Resep', icon: Pill },
    { id: AppView.RECORDS, label: 'Rekam Medis', icon: FileText },
  ],
  [UserRole.PATIENT]: [
    { id: AppView.DASHBOARD, label: 'Beranda', icon: LayoutDashboard },
    { id: AppView.CONSULTATION, label: 'Konsultasi AI', icon: Stethoscope },
    { id: AppView.PRESCRIPTION, label: 'Resep Saya', icon: Pill },
    { id: AppView.RECORDS, label: 'Riwayat Medis', icon: FileText },
    { id: AppView.EMERGENCY, label: 'Gawat Darurat', icon: Siren },
  ]
};
