import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITY_CONFIG } from '../config/university';

import type { UserRole } from '../types';

const POPULAR_SKILLS = [
  'React',
  'Python',
  'JavaScript',
  'C++',
  'Java',
  'UI/UX Design',
  'Figma',
  'Machine Learning',
  'Node.js',
  'Tailwind CSS',
  'Data Science',
  'Cybersecurity',
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState<string>(UNIVERSITY_CONFIG.name);
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('1st Year');
  const [role, setRole] = useState<UserRole>('student');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'Python']);
  const [error, setError] = useState<string | null>(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and university email.');
      return;
    }

    const res = signup({
      name: name.trim(),
      email: email.trim(),
      university: university.trim(),
      branch,
      year,
      role,
      avatarUrl: selectedAvatar,
      skills: selectedSkills,
      bio: `Student at ${university}, focusing on ${branch}.`,
    });

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 items-center justify-center text-indigo-400 mb-2 shadow-lg shadow-indigo-600/10">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Your Campus Profile
          </h1>
          <p className="text-xs text-slate-400">
            One account connects you to all 7 campus modules
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Account Role Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    role === 'student'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎓 University Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    role === 'admin'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ Administrator / Staff
                </button>
              </div>
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Profile Avatar
              </label>
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {AVATAR_PRESETS.map((av, index) => {
                  const isSelected = selectedAvatar === av;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`relative w-11 h-11 rounded-xl overflow-hidden ring-2 transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'ring-indigo-500 scale-105'
                          : 'ring-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Preset Avatar" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohan Sharma"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  University Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`student@${UNIVERSITY_CONFIG.domain}`}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                University Name
              </label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder={UNIVERSITY_CONFIG.name}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Department / Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science & Engineering">Computer Science</option>
                  <option value="Information Technology">Information Tech</option>
                  <option value="Electronics & Communication">Electronics & Comm</option>
                  <option value="Mechanical Engineering">Mechanical Eng</option>
                  <option value="Civil Engineering">Civil Eng</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Business Administration">Business Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Faculty / Staff">Faculty / Staff</option>
                </select>
              </div>
            </div>

            {/* Skills Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Select Your Key Skills (For Team Finder)</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {selectedSkills.length} selected
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl max-h-32 overflow-y-auto">
                {POPULAR_SKILLS.map((skill) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white font-medium shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {active ? `✓ ${skill}` : `+ ${skill}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <Button
              type="submit"
              size="md"
              className="w-full mt-3"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Profile & Enter CampusHub
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
