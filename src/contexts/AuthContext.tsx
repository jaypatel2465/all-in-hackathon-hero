import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

interface SignupData {
  employeeId: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'admin@dayflow.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'Sarah',
    lastName: 'Johnson',
    avatar: '',
    phone: '+1 234 567 8900',
    address: '123 Corporate Ave, New York, NY 10001',
    department: 'Human Resources',
    position: 'HR Manager',
    dateOfJoining: '2022-01-15',
    salary: 85000,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    email: 'employee@dayflow.com',
    password: 'employee123',
    role: 'employee',
    firstName: 'John',
    lastName: 'Smith',
    avatar: '',
    phone: '+1 234 567 8901',
    address: '456 Worker St, New York, NY 10002',
    department: 'Engineering',
    position: 'Software Developer',
    dateOfJoining: '2023-03-20',
    salary: 72000,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('dayflow_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('dayflow_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if email already exists
    if (mockUsers.some(u => u.email === data.email)) {
      return false;
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      employeeId: data.employeeId,
      email: data.email,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      department: 'Unassigned',
      position: 'New Employee',
      dateOfJoining: new Date().toISOString().split('T')[0],
      salary: 0,
    };

    setUser(newUser);
    localStorage.setItem('dayflow_user', JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('dayflow_user');
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('dayflow_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
