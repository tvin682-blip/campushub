import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Search,
  CheckSquare,
  ShoppingBag,
  Users,
  Percent,
  AlertCircle,
  BookOpen,
  ShieldAlert,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

import { UNIVERSITY_CONFIG } from '../../config/university';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Lost & Found', path: '/lost-found', icon: Search },
    { name: 'Assignments', path: '/assignments', icon: CheckSquare },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { name: 'Team Finder', path: '/team-finder', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: Percent },
    { name: 'Campus Issues', path: '/issues', icon: AlertCircle },
    { name: 'Wiki', path: '/wiki', icon: BookOpen },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Portal', path: '/admin', icon: ShieldAlert });
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  CampusHub
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-medium hidden sm:block">
                  {UNIVERSITY_CONFIG.shortName} Campus Portal • Demo
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        active
                          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Navigation / Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Role Switcher for Presentations */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-xs">
              <button
                onClick={loginAsDemoStudent}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  user?.role === 'student'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Switch to Student (${UNIVERSITY_CONFIG.demoStudent.name}) view`}
              >
                Student Demo
              </button>
              <button
                onClick={loginAsDemoAdmin}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  user?.role === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Switch to Admin (${UNIVERSITY_CONFIG.demoAdmin.name}) view`}
              >
                Campus Admin
              </button>
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-800/80 transition-colors border border-slate-800/60"
                  aria-expanded={profileDropdownOpen}
                >
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50"
                  />
                  <div className="text-left hidden md:block">
                    <span className="text-xs font-semibold text-white block leading-tight">{user?.name}</span>
                    <span className="text-[10px] text-slate-400 block capitalize">{user?.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white text-sm">{user?.name}</p>
                      <p className="text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-2">
                        <Badge variant={user?.role === 'admin' ? 'warning' : 'primary'} size="sm">
                          {user?.role === 'admin' ? '🛡️ Administrator' : '🎓 Student Account'}
                        </Badge>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Admin Control Panel</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {/* Quick Role Switcher Mobile */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Demo Role:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  loginAsDemoStudent();
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-lg font-medium ${
                  user?.role === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  loginAsDemoAdmin();
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-lg font-medium ${
                  user?.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {isAuthenticated ? (
            <>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      active
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-slate-300"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-200 bg-slate-900 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
