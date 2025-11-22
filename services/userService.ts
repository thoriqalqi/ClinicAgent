
import { User, UserRole, UserStatus } from '../types';
import { MOCK_USERS } from '../constants';

// Simulating a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store initialized with constants
let localUsers = [...MOCK_USERS];

// Helper for systematic IDs
const generateId = (role: UserRole) => {
    const prefix = role === UserRole.PATIENT ? 'P' : role === UserRole.DOCTOR ? 'D' : 'A';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `${prefix}-${year}-${random}`;
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    await delay(500);
    return [...localUsers];
  },

  // For Admin use (creating doctors/admins)
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    await delay(800);
    const newUser = {
      ...user,
      id: generateId(user.role),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
    };
    localUsers.push(newUser);
    return newUser;
  },

  // For Public use (Patient Signup)
  registerPatient: async (name: string, email: string, password?: string): Promise<User> => {
    await delay(1000);
    
    // Simple check if email exists
    if (localUsers.some(u => u.email === email)) {
        throw new Error("Email already registered");
    }

    const newUser: User = {
        id: generateId(UserRole.PATIENT),
        name,
        email,
        password: password || 'password', // Default if not provided
        role: UserRole.PATIENT,
        status: 'ACTIVE',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        age: undefined,
        phone: ''
    };
    localUsers.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    await delay(600);
    const index = localUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    // Handle Password Update logic if needed securely
    const updatedUser = { ...localUsers[index], ...updates };
    localUsers[index] = updatedUser;
    return updatedUser;
  },

  deleteUser: async (id: string): Promise<void> => {
    await delay(600);
    localUsers = localUsers.filter(u => u.id !== id);
  },

  login: async (email: string, password: string, role: UserRole): Promise<User | undefined> => {
    await delay(800);
    // Verify email, role AND password
    return localUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.role === role && 
        (u.password === password || (!u.password && password === 'password')) // Backward compatibility for mocks
    );
  }
};
