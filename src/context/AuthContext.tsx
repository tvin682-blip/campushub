import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { UNIVERSITY_CONFIG } from '../config/university';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  registeredUsers: User[];
  login: (email: string, password?: string) => { success: boolean; message?: string };
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  logout: () => void;
  loginAsDemoStudent: () => void;
  loginAsDemoAdmin: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const DEMO_STUDENT: User = {
  id: 'usr_student_1',
  name: UNIVERSITY_CONFIG.demoStudent.name,
  email: UNIVERSITY_CONFIG.demoStudent.email,
  role: 'student',
  university: UNIVERSITY_CONFIG.name,
  branch: 'Computer Science & Engineering',
  year: '3rd Year',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bio: 'Full-stack builder passionate about React, AI tools, and campus tech. Active contributor to student community projects.',
  skills: ['React', 'Python', 'UI/UX Design', 'Tailwind CSS', 'TypeScript', 'Node.js'],
  githubUrl: 'https://github.com/student-demo',
  linkedinUrl: 'https://linkedin.com/in/student-demo-campus',
  phone: UNIVERSITY_CONFIG.demoStudent.phone,
  createdAt: '2026-08-15T10:00:00Z',
};

export const DEMO_ADMIN: User = {
  id: 'usr_admin_1',
  name: UNIVERSITY_CONFIG.demoAdmin.name,
  email: UNIVERSITY_CONFIG.demoAdmin.email,
  role: 'admin',
  university: UNIVERSITY_CONFIG.name,
  branch: 'Dean of Student Affairs & Academic Oversight',
  year: 'Faculty / Staff',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  bio: 'Dean of Student Affairs overseeing campus grievance redressal, student welfare, academic compliance, and hostel facilities.',
  skills: ['Campus Governance', 'Student Welfare', 'Dispute Resolution', 'Academic Policy'],
  githubUrl: `https://github.com/${UNIVERSITY_CONFIG.shortName.toLowerCase()}-campus`,
  linkedinUrl: 'https://linkedin.com/in/campus-admin-oversight',
  phone: UNIVERSITY_CONFIG.demoAdmin.phone,
  createdAt: '2026-01-01T08:00:00Z',
};

const INITIAL_USERS: User[] = [DEMO_STUDENT, DEMO_ADMIN];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('campushub_all_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Upgrade any legacy demo records
          return parsed.map((u) => {
            if (u.id === 'usr_student_1' || u.name === 'Alex Rivera') return DEMO_STUDENT;
            if (u.id === 'usr_admin_1' || u.name === 'Dr. Sarah Mitchell') return DEMO_ADMIN;
            return { ...u, university: UNIVERSITY_CONFIG.name };
          });
        }
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return INITIAL_USERS;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campushub_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'usr_admin_1' || parsed.role === 'admin' || parsed.name === 'Dr. Sarah Mitchell') {
          return DEMO_ADMIN;
        }
        if (parsed.id === 'usr_student_1' || parsed.name === 'Alex Rivera') {
          return DEMO_STUDENT;
        }
        return { ...parsed, university: UNIVERSITY_CONFIG.name };
      } catch (e) {
        return DEMO_STUDENT;
      }
    }
    return DEMO_STUDENT;
  });

  // Sync current user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('campushub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campushub_user');
    }
  }, [user]);

  // Sync registered users to localStorage
  useEffect(() => {
    localStorage.setItem('campushub_all_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const login = (email: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // Direct fast demo matching
    if (
      cleanEmail === 'alex.rivera@university.edu' ||
      cleanEmail === UNIVERSITY_CONFIG.demoStudent.email.toLowerCase() ||
      cleanEmail === 'student.demo@hi-tech.edu' ||
      cleanEmail === 'student@hi-tech.edu'
    ) {
      setUser(DEMO_STUDENT);
      return { success: true };
    }

    if (
      cleanEmail === 'admin.mitchell@university.edu' ||
      cleanEmail === UNIVERSITY_CONFIG.demoAdmin.email.toLowerCase() ||
      cleanEmail === 'admin@hi-tech.edu' ||
      cleanEmail === 'admin@university.edu'
    ) {
      setUser(DEMO_ADMIN);
      return { success: true };
    }

    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      setUser(existing);
      return { success: true };
    }

    // Auto-generate student account if not found for seamless testing
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Student',
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'admin' : 'student',
      university: UNIVERSITY_CONFIG.name,
      branch: 'Computer Science',
      year: '2nd Year',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanEmail}&backgroundColor=4f46e5`,
      skills: ['Web Development', 'Problem Solving'],
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const signup = (userData: Omit<User, 'id' | 'createdAt'>): { success: boolean; message?: string } => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const alreadyExists = registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail);

    if (alreadyExists) {
      return { success: false, message: 'An account with this email address already exists. Please log in.' };
    }

    const newUser: User = {
      ...userData,
      email: cleanEmail,
      id: `usr_${Date.now()}`,
      avatarUrl:
        userData.avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=4f46e5`,
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const loginAsDemoStudent = () => {
    setUser(DEMO_STUDENT);
  };

  const loginAsDemoAdmin = () => {
    setUser(DEMO_ADMIN);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setRegisteredUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        registeredUsers,
        login,
        signup,
        logout,
        loginAsDemoStudent,
        loginAsDemoAdmin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
