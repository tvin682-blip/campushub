import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITY_CONFIG } from '../config/university';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide your university email address.');
      return;
    }

    const res = login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 items-center justify-center text-indigo-400 mb-2 shadow-lg shadow-indigo-600/10">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sign in to CampusHub
          </h1>
          <p className="text-xs text-slate-400">
            Enter your student or faculty email, or use instant demo access below
          </p>
        </div>

        {/* Demo Fast Login Ribbon for Presentation */}
        <Card className="border-indigo-500/40 bg-gradient-to-b from-indigo-950/40 to-slate-900/90 p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Instant Presentation Demo Access</span>
            </p>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              No typing needed
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                loginAsDemoStudent();
                navigate('/dashboard');
              }}
              className="text-xs w-full hover:border-indigo-500/50"
              leftIcon={<UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
            >
              Demo Student
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                loginAsDemoAdmin();
                navigate('/admin');
              }}
              className="text-xs w-full hover:border-amber-500/50"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
            >
              Demo Admin
            </Button>
          </div>
        </Card>

        {/* Standard Email Login Form */}
        <Card className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                University Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={UNIVERSITY_CONFIG.demoStudent.email}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSuccess(false);
                    setForgotModalOpen(true);
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="md"
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Account
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Create an account
            </Link>
          </div>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset University Password"
        description="We'll send password recovery instructions to your campus email."
      >
        {forgotSuccess ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">Reset Link Dispatched!</p>
            <p className="text-xs text-slate-400">
              A temporary password reset link was sent to <strong>{forgotEmail}</strong>. Please check your student inbox.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setForgotModalOpen(false)}
              className="w-full mt-2"
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Student Email
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder={`student.name@${UNIVERSITY_CONFIG.domain}`}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
