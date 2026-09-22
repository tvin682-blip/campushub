import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CheckSquare,
  ShoppingBag,
  Users,
  Percent,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const modules = [
    {
      id: 'lost-found',
      title: 'Lost & Found',
      subtitle: 'Recover missing items in minutes',
      description: 'Report lost IDs, keys, calculators, and electronics. Upload photos and search campus locations with instant status resolution.',
      icon: Search,
      tag: 'Campus Recovery',
      badgeColor: 'primary' as const,
      path: '/lost-found',
    },
    {
      id: 'assignments',
      title: 'Assignment Hub',
      subtitle: 'Stay ahead of deadlines',
      description: 'Visual urgency tracking for every subject. Sort by Due Today, Tomorrow, or This Week with automated overdue indicators.',
      icon: CheckSquare,
      tag: 'Academic Flow',
      badgeColor: 'info' as const,
      path: '/assignments',
    },
    {
      id: 'marketplace',
      title: 'Campus Marketplace',
      subtitle: 'Student-to-student commerce',
      description: 'Buy & sell textbooks, lab coats, bicycles, and hostel electronics directly with campus peers. No middlemen, zero fees.',
      icon: ShoppingBag,
      tag: 'Zero-Fee Exchange',
      badgeColor: 'success' as const,
      path: '/marketplace',
    },
    {
      id: 'team-finder',
      title: 'Team Finder',
      subtitle: 'Build dream hackathon squads',
      description: 'Search peers by skills (React, Python, UI/UX, AI), branch, and project goals. Form winning teams without chaotic group chats.',
      icon: Users,
      tag: 'Collaboration',
      badgeColor: 'warning' as const,
      path: '/team-finder',
    },
    {
      id: 'attendance',
      title: 'Attendance Tracker',
      subtitle: 'Never breach the 75% rule',
      description: 'Mathematical safety calculator. Instantly see how many classes you can afford to miss or how many you must attend to stay safe.',
      icon: Percent,
      tag: '75% Smart Engine',
      badgeColor: 'danger' as const,
      path: '/attendance',
    },
    {
      id: 'issues',
      title: 'Campus Grievance Desk',
      subtitle: 'Transparent problem resolution',
      description: 'Submit issues for hostel Wi-Fi, mess hygiene, lab equipment, or classrooms. Track real-time progress through admin resolution.',
      icon: AlertCircle,
      tag: 'Direct Action',
      badgeColor: 'neutral' as const,
      path: '/issues',
    },
    {
      id: 'wiki',
      title: 'College Survival Wiki',
      subtitle: 'The ultimate campus handbook',
      description: 'Exams, department contacts, hostel guidelines, library timings, and fresher cheat-sheets curated by students and staff.',
      icon: BookOpen,
      tag: 'Knowledge Vault',
      badgeColor: 'primary' as const,
      path: '/wiki',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/10 via-indigo-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 sm:pt-28 sm:pb-28 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-medium text-slate-200">The Modern Operating System for University Life</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-400 font-semibold">100% Free for Students</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Your university,{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
            organized in one place.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          One simple platform for everything students need on campus. Track assignments, prevent attendance penalties, trade textbooks, and find hackathon teammates—all without the chaos of 50 WhatsApp groups.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
            </Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore 7 Modules
            </Button>
          </a>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-800/60 max-w-3xl mx-auto">
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">7</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Core Campus Modules</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">75%</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Smart Attendance Logic</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">$0</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Always Free & Open</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-violet-400">100%</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Student Powered</p>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid (7 Modules) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-3">
            Complete Suite
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Everything your campus life demands
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            No more fragmented apps or missed college notifications. Every essential student workflow is integrated right here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.id} hover className="flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={m.badgeColor} size="sm">
                      {m.tag}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 tracking-tight group-hover:text-indigo-300 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mb-2.5">
                    {m.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    to={m.path}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  >
                    <span>Launch Module</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How CampusHub Helps Students (3 Pillars) */}
      <section className="py-20 bg-slate-950/60 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="info" className="mb-3">
              Workflow Revolution
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              How CampusHub simplifies your semester
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Built by university students who understand the real friction points of daily campus survival.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">Centralized Campus Command</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stop hunting across WhatsApp groups, Telegram channels, and noticeboards. Check lost items, homework deadlines, and complaints from one clean dashboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">Mathematical Academic Safety</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never guess whether you can skip a lecture. The attendance calculator computes exact safe bunk margins and tells you how many classes you must attend to maintain 75%.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">Frictionless Peer Network</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sell last semester's textbooks to incoming juniors and team up with developers and designers who have the exact skills you need for upcoming hackathons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to experience a better campus life?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
            Join students across departments who use CampusHub to stay organized, connected, and stress-free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Student Account
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary" size="lg">
                Explore Demo Live
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
