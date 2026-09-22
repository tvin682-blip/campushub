import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield } from 'lucide-react';

import { UNIVERSITY_CONFIG } from '../../config/university';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CampusHub</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              {UNIVERSITY_CONFIG.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Student Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/lost-found" className="hover:text-indigo-400 transition-colors">
                  Lost & Found
                </Link>
              </li>
              <li>
                <Link to="/assignments" className="hover:text-indigo-400 transition-colors">
                  Assignment Hub
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-indigo-400 transition-colors">
                  Campus Marketplace
                </Link>
              </li>
              <li>
                <Link to="/team-finder" className="hover:text-indigo-400 transition-colors">
                  Team Finder
                </Link>
              </li>
              <li>
                <Link to="/attendance" className="hover:text-indigo-400 transition-colors">
                  Attendance Tracker (75% Engine)
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Campus Services */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Governance & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/issues" className="hover:text-indigo-400 transition-colors">
                  Campus Issues & Grievance Desk
                </Link>
              </li>
              <li>
                <Link to="/wiki" className="hover:text-indigo-400 transition-colors">
                  College Survival Wiki
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <span>Administrative Control</span>
                  <Shield className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Helpline & Quick Info */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Campus Resources
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="font-medium text-slate-400">Emergency Desk:</span>
                <span className="text-white font-medium">{UNIVERSITY_CONFIG.emergencyContact}</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="font-medium text-slate-400">Student Affairs:</span>
                <span>{UNIVERSITY_CONFIG.studentAffairsEmail}</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="font-medium text-slate-400">IT Helpdesk:</span>
                <span>{UNIVERSITY_CONFIG.itHelpdeskEmail}</span>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                  <span>{UNIVERSITY_CONFIG.name} • {UNIVERSITY_CONFIG.version}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusHub. Free, open, and built for students everywhere.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with precision for University presentations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
