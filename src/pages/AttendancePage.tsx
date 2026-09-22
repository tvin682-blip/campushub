import React, { useState, useEffect } from 'react';
import {
  Percent,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Calculator,
  BookOpen,
  Info,
} from 'lucide-react';

import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type { AttendanceSubject } from '../types';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<AttendanceSubject[]>([]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [formSubject, setFormSubject] = useState('');
  const [formAttended, setFormAttended] = useState(0);
  const [formTotal, setFormTotal] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Standalone Simulator Calculator states
  const [calcAttended, setCalcAttended] = useState<number>(22);
  const [calcTotal, setCalcTotal] = useState<number>(30);
  const [calcTarget, setCalcTarget] = useState<number>(75);

  const loadAttendance = () => {
    setSubjects(StorageService.getAttendance());
  };

  useEffect(() => {
    loadAttendance();
    const handleUpdate = () => loadAttendance();
    window.addEventListener('campushub_storage_updated', handleUpdate);
    return () => window.removeEventListener('campushub_storage_updated', handleUpdate);
  }, []);

  // Overall Statistics
  const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
  const totalHeld = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const overallPct = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 100;
  const criticalSubjects = subjects.filter(
    (s) => StorageService.calculateAttendanceMetrics(s).percentage < 75
  );

  // Modal open helpers
  const openAddModal = () => {
    setEditingSubjectId(null);
    setFormSubject('');
    setFormAttended(0);
    setFormTotal(0);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (sub: AttendanceSubject) => {
    setEditingSubjectId(sub.id);
    setFormSubject(sub.subject);
    setFormAttended(sub.attendedClasses);
    setFormTotal(sub.totalClasses);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formSubject.trim()) {
      setFormError('Please enter a subject name.');
      return;
    }
    if (formTotal < 0 || formAttended < 0) {
      setFormError('Classes cannot be negative numbers.');
      return;
    }
    if (formAttended > formTotal) {
      setFormError('Attended classes cannot exceed total classes conducted.');
      return;
    }

    if (editingSubjectId) {
      StorageService.updateAttendance(editingSubjectId, formAttended, formTotal, formSubject.trim());
    } else {
      StorageService.addAttendanceSubject({
        userId: user?.id || 'usr_student_1',
        subject: formSubject.trim(),
        attendedClasses: formAttended,
        totalClasses: formTotal,
      });
    }

    setModalOpen(false);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Are you sure you want to remove this course from your attendance tracker?')) {
      StorageService.deleteAttendanceSubject(id);
    }
  };

  // Quick increment/decrement helpers for testing in real-time
  const handleQuickMark = (id: string, attendedDelta: number, totalDelta: number) => {
    const sub = subjects.find((s) => s.id === id);
    if (!sub) return;

    const newAttended = Math.max(0, sub.attendedClasses + attendedDelta);
    const newTotal = Math.max(newAttended, sub.totalClasses + totalDelta);

    StorageService.updateAttendance(id, newAttended, newTotal);
  };

  // Standalone Simulator Math Calculation
  const calculateSimulator = () => {
    if (calcTotal <= 0) {
      return {
        pct: 100,
        isValid: false,
        error: 'Total classes must be greater than 0.',
        canMiss: 0,
        toAttend: 0,
      };
    }
    if (calcAttended < 0 || calcTotal < 0) {
      return {
        pct: 0,
        isValid: false,
        error: 'Values cannot be negative.',
        canMiss: 0,
        toAttend: 0,
      };
    }
    if (calcAttended > calcTotal) {
      return {
        pct: 0,
        isValid: false,
        error: 'Attended classes cannot exceed total classes.',
        canMiss: 0,
        toAttend: 0,
      };
    }

    const pct = (calcAttended / calcTotal) * 100;
    const targetRatio = calcTarget / 100;

    let toAttend = 0;
    if (pct < calcTarget) {
      // (A + x) / (T + x) >= targetRatio
      // x * (1 - targetRatio) >= targetRatio * T - A
      toAttend = Math.ceil((targetRatio * calcTotal - calcAttended) / (1 - targetRatio));
    }

    let canMiss = 0;
    if (pct >= calcTarget) {
      // A / (T + y) >= targetRatio
      // y * targetRatio <= A - targetRatio * T
      canMiss = Math.floor((calcAttended - targetRatio * calcTotal) / targetRatio);
    }

    return {
      pct: Number(pct.toFixed(1)),
      isValid: true,
      error: null,
      canMiss: Math.max(0, canMiss),
      toAttend: Math.max(0, toAttend),
    };
  };

  const simResult = calculateSimulator();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="danger" size="sm">Module 5</Badge>
            <span className="text-xs text-slate-400">75% Policy Mathematical Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Attendance Tracker & Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Real-time semester attendance monitoring, safe skip allowances, and consecutive attendance requirements.
          </p>
        </div>

        <Button size="sm" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Course Subject
        </Button>
      </div>

      {/* Critical Advisory Banner if any subject < 75% */}
      {criticalSubjects.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border border-rose-500/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Attendance Warning: Examination Eligibility Risk Detected</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            You currently have{' '}
            <strong className="text-rose-400 font-semibold">{criticalSubjects.length} subject(s)</strong>{' '}
            below the mandatory 75% university criteria. Review the required consecutive classes needed below to regain exam clearance.
          </p>
        </div>
      )}

      {/* Overall Semester Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cumulative Attendance</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <p className={`text-2xl font-bold ${overallPct >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {overallPct.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500">
            {overallPct >= 75 ? '✓ Overall semester safe' : '⚠️ Action required overall'}
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Classes Held</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalHeld}</p>
          <p className="text-[11px] text-slate-500">Across {subjects.length} registered subjects</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Lectures Attended</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{totalAttended}</p>
          <p className="text-[11px] text-slate-500">{totalHeld - totalAttended} absences recorded</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Courses at Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className={`text-2xl font-bold ${criticalSubjects.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {criticalSubjects.length}
          </p>
          <p className="text-[11px] text-slate-500">Below 75% threshold</p>
        </Card>
      </div>

      {/* Two-Column Layout: Subject Cards List (Left) + Interactive Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Registered Subjects (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Registered Courses & Live Status</span>
            </h2>
            <span className="text-xs text-slate-400">{subjects.length} Courses Tracked</span>
          </div>

          <div className="space-y-4">
            {subjects.map((sub) => {
              const metric = StorageService.calculateAttendanceMetrics(sub);
              const isSafe = metric.isSafe;

              return (
                <Card
                  key={sub.id}
                  hover
                  className={`p-5 transition-all border ${
                    !isSafe
                      ? 'border-rose-500/40 bg-slate-900/90'
                      : metric.percentage === 75
                      ? 'border-amber-500/30'
                      : 'border-slate-800 bg-slate-900/70'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">{sub.subject}</h3>
                          <Badge
                            variant={isSafe ? (metric.percentage > 80 ? 'success' : 'warning') : 'danger'}
                            size="sm"
                          >
                            {isSafe ? '✓ Exam Eligible' : '⚠️ Below 75%'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sub.attendedClasses} attended out of {sub.totalClasses} total lectures conducted
                        </p>
                      </div>

                      {/* Percentage Badge */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl font-extrabold ${
                            isSafe ? (metric.percentage > 80 ? 'text-emerald-400' : 'text-amber-400') : 'text-rose-400'
                          }`}
                        >
                          {metric.percentage}%
                        </span>

                        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                          <button
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="relative w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        {/* 75% target marker line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10"
                          style={{ left: '75%' }}
                          title="75% Requirement Threshold"
                        />
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSafe ? (metric.percentage > 80 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, metric.percentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0%</span>
                        <span className="text-slate-400 font-semibold">75% (Pass Line)</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Mathematics Explanation Box */}
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                        isSafe
                          ? 'bg-emerald-500/5 text-emerald-300 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30 font-medium'
                      }`}
                    >
                      {isSafe ? (
                        <span>
                          Safe Margin: You can miss up to{' '}
                          <strong className="underline">{metric.classesCanMiss} upcoming lectures</strong>{' '}
                          and still stay above 75%.
                        </span>
                      ) : (
                        <span>
                          Action Required: You must attend the next{' '}
                          <strong className="underline">{metric.classesToAttend} consecutive lectures</strong>{' '}
                          without skipping to reach 75%.
                        </span>
                      )}

                      {/* Fast +1 Attendance Buttons for live simulation during presentation */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <button
                          type="button"
                          onClick={() => handleQuickMark(sub.id, 1, 1)}
                          className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-semibold transition-colors cursor-pointer"
                          title="Attended today (+1 Attended, +1 Total)"
                        >
                          + Attended
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickMark(sub.id, 0, 1)}
                          className="px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-[10px] font-semibold transition-colors cursor-pointer"
                          title="Missed today (+0 Attended, +1 Total)"
                        >
                          + Missed
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Attendance Calculator & Bunk Simulator */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5 border-indigo-500/30 bg-slate-900/90 shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Interactive Bunk Calculator</h3>
                <p className="text-[11px] text-slate-400">Simulate skips & attendance goals</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Total Classes Conducted
                </label>
                <input
                  type="number"
                  min={1}
                  value={calcTotal}
                  onChange={(e) => setCalcTotal(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Classes You Attended
                </label>
                <input
                  type="number"
                  min={0}
                  value={calcAttended}
                  onChange={(e) => setCalcAttended(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Target Criteria (%)
                  </label>
                  <span className="text-xs font-bold text-indigo-400">{calcTarget}%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={90}
                  step={5}
                  value={calcTarget}
                  onChange={(e) => setCalcTarget(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>60%</span>
                  <span>75% (Standard)</span>
                  <span>90%</span>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            {simResult.error ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {simResult.error}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Current Percentage:</span>
                  <span
                    className={`text-lg font-extrabold ${
                      simResult.pct >= calcTarget ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {simResult.pct}%
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-850 text-xs space-y-2">
                  {simResult.pct >= calcTarget ? (
                    <div className="space-y-1">
                      <span className="text-emerald-400 font-bold block flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>You can afford to miss:</span>
                      </span>
                      <p className="text-xl font-extrabold text-white">
                        {simResult.canMiss} classes
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Skipping up to {simResult.canMiss} classes will keep your attendance above {calcTarget}%.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-rose-400 font-bold block flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Consecutive classes needed:</span>
                      </span>
                      <p className="text-xl font-extrabold text-white">
                        {simResult.toAttend} classes
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Attend {simResult.toAttend} lectures consecutively without skipping to attain {calcTarget}%.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Academic Policy Explainer */}
          <Card className="p-5 space-y-2.5 text-xs text-slate-400">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>University 75% Rule FAQ</span>
            </h4>
            <p className="leading-relaxed">
              University regulations dictate that students must maintain a minimum of 75% attendance in theory and practicals. Medical leaves with hospital verification grant a 10% concession upon warden approval.
            </p>
          </Card>
        </div>
      </div>

      {/* Add / Edit Course Subject Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubjectId ? 'Edit Course Attendance' : 'Add Course Subject'}
        description="Enter total classes conducted and classes attended."
      >
        <form onSubmit={handleSaveSubject} className="space-y-4 py-2">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              required
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              placeholder="e.g. Artificial Intelligence or Microprocessors"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Classes Held
              </label>
              <input
                type="number"
                min={0}
                required
                value={formTotal}
                onChange={(e) => setFormTotal(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Classes Attended
              </label>
              <input
                type="number"
                min={0}
                required
                value={formAttended}
                onChange={(e) => setFormAttended(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {formTotal > 0 && formAttended <= formTotal && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
              <span className="text-slate-400">Calculated Percentage:</span>
              <span className="font-bold text-white">
                {((formAttended / formTotal) * 100).toFixed(1)}%
              </span>
            </div>
          )}

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
              {editingSubjectId ? 'Update Subject' : 'Add Subject'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
