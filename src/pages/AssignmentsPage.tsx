import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Check,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type { Assignment, AssignmentPriority } from '../types';

type TimelineFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'overdue' | 'submitted';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineFilter>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubject, setFormSubject] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formPriority, setFormPriority] = useState<AssignmentPriority>('high');
  const [formNotes, setFormNotes] = useState('');

  const loadAssignments = () => {
    setAssignments(StorageService.getAssignments());
  };

  useEffect(() => {
    loadAssignments();
    const handleUpdate = () => loadAssignments();
    window.addEventListener('campushub_storage_updated', handleUpdate);
    return () => window.removeEventListener('campushub_storage_updated', handleUpdate);
  }, []);

  // Timeline Helper Logic
  const isDueToday = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    return (
      due.getDate() === now.getDate() &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear()
    );
  };

  const isDueTomorrow = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      due.getDate() === tomorrow.getDate() &&
      due.getMonth() === tomorrow.getMonth() &&
      due.getFullYear() === tomorrow.getFullYear()
    );
  };

  const isDueThisWeek = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = Date.now();
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;
    return due >= now && due <= weekFromNow;
  };

  const isOverdue = (asg: Assignment) => {
    return asg.status === 'pending' && new Date(asg.dueDate).getTime() < Date.now();
  };

  // Filtered List
  const filteredAssignments = assignments.filter((a) => {
    // Priority filter
    if (selectedPriority !== 'all' && a.priority !== selectedPriority) return false;

    // Timeline filter
    if (selectedTimeline === 'today' && (!isDueToday(a.dueDate) || a.status === 'submitted')) return false;
    if (selectedTimeline === 'tomorrow' && (!isDueTomorrow(a.dueDate) || a.status === 'submitted')) return false;
    if (selectedTimeline === 'week' && (!isDueThisWeek(a.dueDate) || a.status === 'submitted')) return false;
    if (selectedTimeline === 'overdue' && !isOverdue(a)) return false;
    if (selectedTimeline === 'submitted' && a.status !== 'submitted') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = a.subject.toLowerCase().includes(q);
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchNotes = (a.notes || '').toLowerCase().includes(q);
      if (!matchSubject && !matchTitle && !matchNotes) return false;
    }
    return true;
  });

  // Modal Handlers
  const openCreateModal = () => {
    setEditingId(null);
    setFormSubject('Data Structures & Algorithms');
    setFormTitle('');
    // Default to tomorrow 11:59 PM
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(23, 59, 0, 0);
    setFormDate(tmrw.toISOString().slice(0, 16));
    setFormPriority('high');
    setFormNotes('');
    setModalOpen(true);
  };

  const openEditModal = (asg: Assignment) => {
    setEditingId(asg.id);
    setFormSubject(asg.subject);
    setFormTitle(asg.title);
    setFormDate(new Date(asg.dueDate).toISOString().slice(0, 16));
    setFormPriority(asg.priority);
    setFormNotes(asg.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    if (editingId) {
      StorageService.updateAssignment(editingId, {
        subject: formSubject.trim(),
        title: formTitle.trim(),
        dueDate: new Date(formDate).toISOString(),
        priority: formPriority,
        notes: formNotes.trim(),
      });
    } else {
      StorageService.addAssignment({
        userId: user?.id || 'usr_student_1',
        subject: formSubject.trim(),
        title: formTitle.trim(),
        dueDate: new Date(formDate).toISOString(),
        priority: formPriority,
        status: 'pending',
        notes: formNotes.trim(),
      });
    }

    setModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    StorageService.toggleAssignmentStatus(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      StorageService.deleteAssignment(id);
    }
  };

  // Counts for pills
  const dueTodayCount = assignments.filter((a) => isDueToday(a.dueDate) && a.status === 'pending').length;
  const dueTomorrowCount = assignments.filter((a) => isDueTomorrow(a.dueDate) && a.status === 'pending').length;
  const dueWeekCount = assignments.filter((a) => isDueThisWeek(a.dueDate) && a.status === 'pending').length;
  const overdueCount = assignments.filter(isOverdue).length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">Module 2</Badge>
            <span className="text-xs text-slate-400">Academic Task & Deadline Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Assignment Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Organize coursework, problem sheets, and lab submissions with deadline urgency indicators.
          </p>
        </div>

        <Button size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Assignment
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => setSelectedTimeline('today')}
          hover
          className={`p-4 cursor-pointer border ${selectedTimeline === 'today' ? 'border-amber-500 bg-amber-500/10' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Due Today</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{dueTodayCount}</p>
          <p className="text-[11px] text-slate-500">Requires immediate attention</p>
        </Card>

        <Card
          onClick={() => setSelectedTimeline('tomorrow')}
          hover
          className={`p-4 cursor-pointer border ${selectedTimeline === 'tomorrow' ? 'border-sky-500 bg-sky-500/10' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Due Tomorrow</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{dueTomorrowCount}</p>
          <p className="text-[11px] text-slate-500">Coming up next 24h</p>
        </Card>

        <Card
          onClick={() => setSelectedTimeline('overdue')}
          hover
          className={`p-4 cursor-pointer border ${selectedTimeline === 'overdue' ? 'border-rose-500 bg-rose-500/10' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1">{overdueCount}</p>
          <p className="text-[11px] text-rose-400/80">Deadline passed</p>
        </Card>

        <Card
          onClick={() => setSelectedTimeline('submitted')}
          hover
          className={`p-4 cursor-pointer border ${selectedTimeline === 'submitted' ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{submittedCount}</p>
          <p className="text-[11px] text-slate-500">Successfully submitted</p>
        </Card>
      </div>

      {/* Filter and Timeline Navigation */}
      <Card className="p-4 space-y-4">
        {/* Timeline Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedTimeline('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedTimeline === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setSelectedTimeline('today')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedTimeline === 'today'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Due Today ({dueTodayCount})
          </button>
          <button
            onClick={() => setSelectedTimeline('tomorrow')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedTimeline === 'tomorrow'
                ? 'bg-sky-600 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Due Tomorrow ({dueTomorrowCount})
          </button>
          <button
            onClick={() => setSelectedTimeline('week')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedTimeline === 'week'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            This Week ({dueWeekCount})
          </button>
          <button
            onClick={() => setSelectedTimeline('overdue')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedTimeline === 'overdue'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setSelectedTimeline('submitted')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedTimeline === 'submitted'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Submitted ({submittedCount})
          </button>
        </div>

        {/* Search & Priority Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-850">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, title, or problem sheet..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assignment Items List */}
      {filteredAssignments.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No assignments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You're all caught up! Select "All" to view all coursework or create a new assignment above.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setSelectedTimeline('all');
              setSelectedPriority('all');
              setSearchQuery('');
            }}
            variant="outline"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((asg) => {
            const overdue = isOverdue(asg);
            const isSubmitted = asg.status === 'submitted';
            const dueDateObj = new Date(asg.dueDate);

            return (
              <Card
                key={asg.id}
                hover
                className={`p-4 sm:p-5 transition-all border ${
                  isSubmitted
                    ? 'bg-slate-950/40 border-slate-850 opacity-60'
                    : overdue
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Checkbox + Title Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(asg.id)}
                      className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isSubmitted
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600 bg-slate-950 hover:border-indigo-500'
                      }`}
                      title={isSubmitted ? 'Mark as Pending' : 'Mark as Submitted'}
                    >
                      {isSubmitted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{asg.subject}</span>
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
                          {asg.priority.toUpperCase()} PRIORITY
                        </Badge>

                        {overdue && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            OVERDUE
                          </span>
                        )}

                        {isSubmitted && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            SUBMITTED
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold tracking-tight ${
                          isSubmitted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {asg.title}
                      </h3>

                      {asg.notes && (
                        <p className="text-xs text-slate-400 pt-0.5 leading-relaxed">
                          {asg.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Due Date & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-semibold text-slate-200 block">
                        {dueDateObj.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {dueDateObj.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(asg)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Assignment"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(asg.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Assignment' : 'Add New Assignment'}
        description="Set course name, deadline, and urgency level."
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              required
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              placeholder="e.g. Data Structures, Engineering Mathematics, Operating Systems"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Problem Sheet 3: Fourier Transforms"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority Urgency
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as AssignmentPriority)}
                className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="high">High (Urgent)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Submission Notes / Question Details
            </label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Submit on Moodle before midnight. Include problem 4 bonus question."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingId ? 'Save Changes' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
