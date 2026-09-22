import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Percent,
  Search,
  ShoppingBag,
  Users,
  AlertCircle,
  BookOpen,
  PlusCircle,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  MapPin,
  ChevronRight,
} from 'lucide-react';

import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type {
  Assignment,
  AttendanceSubject,
  LostFoundItem,
  MarketplaceItem,
  TeamProfile,
  Complaint,
  WikiArticle,
  AssignmentPriority,
  ComplaintCategory,
} from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Storage states
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSubject[]>([]);
  const [lostFound, setLostFound] = useState<LostFoundItem[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<TeamProfile[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);

  // Quick Action Modal states
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  // New assignment form state
  const [newAsgSubject, setNewAsgSubject] = useState('Data Structures');
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDate, setNewAsgDate] = useState('');
  const [newAsgPriority, setNewAsgPriority] = useState<AssignmentPriority>('high');

  // New complaint form state
  const [newCmpTitle, setNewCmpTitle] = useState('');
  const [newCmpCategory, setNewCmpCategory] = useState<ComplaintCategory>('Wi-Fi');
  const [newCmpLocation, setNewCmpLocation] = useState('');
  const [newCmpDesc, setNewCmpDesc] = useState('');

  const loadData = () => {
    setAssignments(StorageService.getAssignments());
    setAttendance(StorageService.getAttendance());
    setLostFound(StorageService.getLostFound());
    setMarketplace(StorageService.getMarketplace());
    setTeamProfiles(StorageService.getTeamProfiles());
    setComplaints(StorageService.getComplaints());
    setWikiArticles(StorageService.getWikiArticles());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campushub_storage_updated', handleUpdate);
    return () => window.removeEventListener('campushub_storage_updated', handleUpdate);
  }, []);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculations for dashboard metrics
  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const overdueAssignments = pendingAssignments.filter(
    (a) => new Date(a.dueDate).getTime() < Date.now()
  );

  const totalClassesAttended = attendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const totalClassesHeld = attendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const overallAttendance = totalClassesHeld > 0 ? (totalClassesAttended / totalClassesHeld) * 100 : 100;
  const criticalSubjects = attendance.filter((s) => {
    const metric = StorageService.calculateAttendanceMetrics(s);
    return !metric.isSafe;
  });

  const handleToggleAssignment = (id: string) => {
    StorageService.toggleAssignmentStatus(id);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim() || !newAsgDate) return;

    StorageService.addAssignment({
      userId: user?.id || 'usr_student_1',
      subject: newAsgSubject,
      title: newAsgTitle.trim(),
      dueDate: new Date(newAsgDate).toISOString(),
      priority: newAsgPriority,
      status: 'pending',
    });

    setNewAsgTitle('');
    setNewAsgDate('');
    setAssignmentModalOpen(false);
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmpTitle.trim() || !newCmpDesc.trim()) return;

    StorageService.addComplaint({
      userId: user?.id || 'usr_student_1',
      userName: user?.name || 'Student',
      title: newCmpTitle.trim(),
      category: newCmpCategory,
      location: newCmpLocation.trim(),
      description: newCmpDesc.trim(),
      status: 'Submitted',
    });

    setNewCmpTitle('');
    setNewCmpLocation('');
    setNewCmpDesc('');
    setComplaintModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcome Message Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" size="sm">
                🎓 {user?.university || 'University Campus'}
              </Badge>
              <span className="text-xs text-slate-400">
                • {user?.branch} ({user?.year})
              </span>
              <Badge variant={user?.role === 'admin' ? 'warning' : 'neutral'} size="sm">
                {user?.role === 'admin' ? 'Admin Access' : 'Student Mode'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Here is your centralized campus briefing. You have{' '}
              <strong className="text-indigo-400">{pendingAssignments.length} pending assignments</strong>{' '}
              {overdueAssignments.length > 0 && (
                <span className="text-rose-400 font-semibold">
                  ({overdueAssignments.length} overdue!)
                </span>
              )}{' '}
              and your overall attendance stands at{' '}
              <strong className={overallAttendance >= 75 ? 'text-emerald-400' : 'text-rose-400'}>
                {overallAttendance.toFixed(1)}%
              </strong>
              .
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button
              size="sm"
              onClick={() => setAssignmentModalOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Add Assignment
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setComplaintModalOpen(true)}
              leftIcon={<AlertCircle className="w-4 h-4" />}
            >
              Report Issue
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assignments Metric */}
        <Link to="/assignments">
          <Card hover className="p-4 space-y-1 group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Pending Tasks</span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{pendingAssignments.length}</span>
              {overdueAssignments.length > 0 && (
                <Badge variant="danger" size="sm">
                  {overdueAssignments.length} Overdue
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Across all registered subjects</p>
          </Card>
        </Link>

        {/* Attendance Metric */}
        <Link to="/attendance">
          <Card hover className="p-4 space-y-1 group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Average Attendance</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                overallAttendance >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{overallAttendance.toFixed(1)}%</span>
              <Badge variant={overallAttendance >= 75 ? 'success' : 'danger'} size="sm">
                {overallAttendance >= 75 ? 'Safe' : 'Action Needed'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              {criticalSubjects.length > 0
                ? `${criticalSubjects.length} subject(s) below 75%`
                : 'All courses safe'}
            </p>
          </Card>
        </Link>

        {/* Lost & Found Metric */}
        <Link to="/lost-found">
          <Card hover className="p-4 space-y-1 group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Open Lost & Found</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {lostFound.filter((i) => i.status === 'open').length}
              </span>
              <Badge variant="primary" size="sm">Active Posts</Badge>
            </div>
            <p className="text-[11px] text-slate-500">Reported on campus today</p>
          </Card>
        </Link>

        {/* Marketplace Deals Metric */}
        <Link to="/marketplace">
          <Card hover className="p-4 space-y-1 group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Marketplace Deals</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {marketplace.filter((m) => m.status === 'available').length}
              </span>
              <Badge variant="success" size="sm">Available</Badge>
            </div>
            <p className="text-[11px] text-slate-500">Books, cycles & calculators</p>
          </Card>
        </Link>
      </div>

      {/* 3. Quick Action Launchpad */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <button
            onClick={() => setAssignmentModalOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <CheckSquare className="w-4 h-4 text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Add Assignment</span>
          </button>

          <Link
            to="/lost-found"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all group"
          >
            <Search className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Create Lost Item</span>
          </Link>

          <Link
            to="/marketplace"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all group"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Sell Item</span>
          </Link>

          <Link
            to="/team-finder"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all group"
          >
            <Users className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Find Teammate</span>
          </Link>

          <Link
            to="/attendance"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all group"
          >
            <Percent className="w-4 h-4 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Check Attendance</span>
          </Link>

          <button
            onClick={() => setComplaintModalOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <AlertCircle className="w-4 h-4 text-slate-300 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Report Issue</span>
          </button>

          <Link
            to="/wiki"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all group"
          >
            <BookOpen className="w-4 h-4 text-violet-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Open Wiki</span>
          </Link>
        </div>
      </div>

      {/* 4. Main Two-Column Operational Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Urgent Tasks & Attendance Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Assignments Widget */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Upcoming Assignments</h3>
              </div>
              <Link to="/assignments" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {assignments.slice(0, 4).map((asg) => {
                const isOverdue = new Date(asg.dueDate).getTime() < Date.now() && asg.status === 'pending';
                const isSubmitted = asg.status === 'submitted';

                return (
                  <div
                    key={asg.id}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                      isSubmitted
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : isOverdue
                        ? 'bg-rose-500/5 border-rose-500/20'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleAssignment(asg.id)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                          isSubmitted
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-indigo-400 bg-slate-900'
                        }`}
                        title={isSubmitted ? 'Mark as pending' : 'Mark as submitted'}
                      >
                        {isSubmitted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {asg.subject}
                          </span>
                          <Badge
                            variant={
                              asg.priority === 'high'
                                ? 'danger'
                                : asg.priority === 'medium'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {asg.priority.toUpperCase()}
                          </Badge>
                          {isOverdue && (
                            <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <h4
                          className={`text-xs font-semibold ${
                            isSubmitted ? 'line-through text-slate-400' : 'text-slate-200'
                          }`}
                        >
                          {asg.title}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Due: {new Date(asg.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Attendance Health Gauge & Warning Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Attendance Health (75% Rule)</h3>
              </div>
              <Link to="/attendance" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                <span>Calculator Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {criticalSubjects.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Attendance Advisory: </span>
                  You are below the mandatory 75% threshold in{' '}
                  <strong>{criticalSubjects[0].subject}</strong>. Attend the next{' '}
                  <strong className="underline">
                    {StorageService.calculateAttendanceMetrics(criticalSubjects[0]).classesToAttend} consecutive classes
                  </strong>{' '}
                  to safely qualify for semester exams!
                </div>
              </div>
            )}

            <div className="space-y-3">
              {attendance.slice(0, 4).map((sub) => {
                const metric = StorageService.calculateAttendanceMetrics(sub);
                return (
                  <div key={sub.id} className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{sub.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">
                          {sub.attendedClasses}/{sub.totalClasses} classes
                        </span>
                        <Badge
                          variant={metric.status === 'safe' ? 'success' : metric.status === 'warning' ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {metric.percentage}%
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          metric.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, metric.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{metric.isSafe ? `Can safely miss: ${metric.classesCanMiss} lectures` : `Must attend: ${metric.classesToAttend} more lectures`}</span>
                      <span className={metric.isSafe ? 'text-emerald-400' : 'text-rose-400'}>
                        {metric.isSafe ? '✓ Exam eligible' : '⚠️ Below 75%'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Campus Issues Progress */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-300" />
                <h3 className="text-sm font-bold text-white tracking-tight">Recent Campus Issues</h3>
              </div>
              <Link to="/issues" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                <span>View Desk</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {complaints.slice(0, 3).map((cmp) => (
                <div key={cmp.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">{cmp.category}</Badge>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{cmp.location}</span>
                      </span>
                    </div>
                    <Badge
                      variant={
                        cmp.status === 'Resolved'
                          ? 'success'
                          : cmp.status === 'In Review'
                          ? 'warning'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {cmp.status}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{cmp.title}</h4>
                  {cmp.adminNotes && (
                    <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      <strong>Admin update:</strong> {cmp.adminNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Feeds for Lost & Found, Marketplace & Team Finder */}
        <div className="space-y-6">
          {/* Lost & Found Live Highlights */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Recent Lost & Found</h3>
              </div>
              <Link to="/lost-found" className="text-xs font-semibold text-indigo-400 hover:underline">
                Explore
              </Link>
            </div>

            <div className="space-y-3">
              {lostFound.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                    />
                  )}
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        {item.type.toUpperCase()} • {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-white truncate">{item.title}</h5>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{item.location}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Marketplace Highlights */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Marketplace Deals</h3>
              </div>
              <Link to="/marketplace" className="text-xs font-semibold text-indigo-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {marketplace.slice(0, 2).map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex gap-3">
                    {m.imageUrl && (
                      <img
                        src={m.imageUrl}
                        alt={m.title}
                        className="w-16 h-16 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="success" size="sm">₹{m.price}</Badge>
                        <span className="text-[10px] text-slate-400 capitalize">{m.condition.replace('_', ' ')}</span>
                      </div>
                      <h5 className="text-xs font-semibold text-white mt-1 line-clamp-1">{m.title}</h5>
                      <span className="text-[10px] text-slate-500 block">Seller: {m.sellerName}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate">{m.sellerContact}</span>
                    <Link to="/marketplace" className="text-indigo-400 font-semibold hover:underline">
                      Contact
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Team Finder Suggestions */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Teammate Suggestions</h3>
              </div>
              <Link to="/team-finder" className="text-xs font-semibold text-indigo-400 hover:underline">
                Find More
              </Link>
            </div>

            <div className="space-y-3">
              {teamProfiles.slice(0, 2).map((tp) => (
                <div key={tp.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{tp.name}</h5>
                      <span className="text-[10px] text-slate-400">
                        {tp.branch} • {tp.year}
                      </span>
                    </div>
                    <Badge variant="warning" size="sm">Looking for {tp.lookingFor}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tp.skills.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>

                  <Link
                    to="/team-finder"
                    className="block text-center text-xs text-indigo-400 font-semibold py-1 rounded bg-indigo-600/10 hover:bg-indigo-600/20 transition-colors"
                  >
                    View Profile & Connect
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Survival Wiki Articles Spotlight */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Essential Wiki Guides</h3>
              </div>
              <Link to="/wiki" className="text-xs font-semibold text-indigo-400 hover:underline">
                All Guides
              </Link>
            </div>

            <div className="space-y-2.5">
              {wikiArticles.slice(0, 2).map((w) => (
                <Link
                  key={w.id}
                  to="/wiki"
                  className="block p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">{w.category}</Badge>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h5 className="text-xs font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                    {w.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {w.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL 1: Quick Add Assignment */}
      <Modal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        title="Add New Assignment"
        description="Save your homework deadline and set urgency tracking."
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              required
              value={newAsgSubject}
              onChange={(e) => setNewAsgSubject(e.target.value)}
              placeholder="e.g. Data Structures, Operating Systems..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={newAsgTitle}
              onChange={(e) => setNewAsgTitle(e.target.value)}
              placeholder="e.g. Lab Manual 3 or Practice Sheet 2"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={newAsgDate}
                onChange={(e) => setNewAsgDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Urgency Priority
              </label>
              <select
                value={newAsgPriority}
                onChange={(e) => setNewAsgPriority(e.target.value as AssignmentPriority)}
                className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="high">High (Urgent)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAssignmentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Quick Report Campus Issue */}
      <Modal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        title="Report Campus Issue"
        description="Submit an official maintenance grievance for fast resolution."
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Issue Category
            </label>
            <select
              value={newCmpCategory}
              onChange={(e) => setNewCmpCategory(e.target.value as ComplaintCategory)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Wi-Fi">Wi-Fi & Internet</option>
              <option value="Hostel">Hostel Maintenance</option>
              <option value="Mess">Mess Food Quality</option>
              <option value="Classroom">Classroom & Projector</option>
              <option value="Laboratory">Lab Equipment</option>
              <option value="Electricity">Electricity & Water</option>
              <option value="Library">Library Facilities</option>
              <option value="Cleanliness">Cleanliness & Hygiene</option>
              <option value="Other">Other Grievance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Specific Location
            </label>
            <input
              type="text"
              required
              value={newCmpLocation}
              onChange={(e) => setNewCmpLocation(e.target.value)}
              placeholder="e.g. Block C, Room 314 or CS Lab 2"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Problem Summary
            </label>
            <input
              type="text"
              required
              value={newCmpTitle}
              onChange={(e) => setNewCmpTitle(e.target.value)}
              placeholder="Brief description of the problem..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={3}
              required
              value={newCmpDesc}
              onChange={(e) => setNewCmpDesc(e.target.value)}
              placeholder="Provide exact details so technicians can diagnose quickly..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setComplaintModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="danger">
              Submit Grievance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
