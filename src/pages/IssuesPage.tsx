import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ThumbsUp,
  X,
  Edit2,
  Trash2,
  ShieldCheck,
  Building,
  Wifi,
  Utensils,
  Lightbulb,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '../types';

const CATEGORIES: ComplaintCategory[] = [
  'Hostel',
  'Mess',
  'Classroom',
  'Wi-Fi',
  'Electricity',
  'Cleanliness',
  'Library',
  'Laboratory',
  'Transport',
  'Administration',
  'Other',
];

const PRESET_COMPLAINT_IMAGES = [
  { label: 'Wi-Fi / Network Issue', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80' },
  { label: 'Air Conditioning / HVAC', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80' },
  { label: 'Water / Plumbing', url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&auto=format&fit=crop&q=80' },
  { label: 'Hostel Room Maintenance', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&auto=format&fit=crop&q=80' },
  { label: 'Electrical / Lights', url: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?w=500&auto=format&fit=crop&q=80' },
  { label: 'Classroom / Projector', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&auto=format&fit=crop&q=80' },
];

export const IssuesPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [myIssuesOnly, setMyIssuesOnly] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingComplaintId, setEditingComplaintId] = useState<string | null>(null);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);

  // Admin status update modal state
  const [adminStatusModalComplaint, setAdminStatusModalComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Review');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  // Local upvotes tracking (set of complaint IDs upvoted in this browser)
  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_upvoted_issues');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ComplaintCategory>('Hostel');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  const loadComplaints = () => {
    const list = StorageService.getComplaints();
    setComplaints(list);
  };

  useEffect(() => {
    loadComplaints();
    const handleStorageUpdate = () => loadComplaints();
    window.addEventListener('campushub_storage_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('campushub_storage_updated', handleStorageUpdate);
    };
  }, []);

  const handleToggleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (upvotedIds.includes(id)) {
      updated = upvotedIds.filter((item) => item !== id);
    } else {
      updated = [...upvotedIds, id];
    }
    setUpvotedIds(updated);
    localStorage.setItem('campushub_upvoted_issues', JSON.stringify(updated));
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('Hostel');
    setFormLocation('');
    setFormDescription('');
    setFormImageUrl('');
    setFormError('');
    setEditingComplaintId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (c: Complaint, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingComplaintId(c.id);
    setFormTitle(c.title);
    setFormCategory(c.category);
    setFormLocation(c.location);
    setFormDescription(c.description);
    setFormImageUrl(c.imageUrl || '');
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Issue title is required.');
      return;
    }
    if (!formLocation.trim()) {
      setFormError('Specific location is required (e.g. Hostel Block B, Room 204).');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Description of the issue is required.');
      return;
    }

    if (editingComplaintId) {
      StorageService.updateComplaint(editingComplaintId, {
        title: formTitle.trim(),
        category: formCategory,
        location: formLocation.trim(),
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim() || undefined,
      });
    } else {
      StorageService.addComplaint({
        userId: user?.id || 'usr_anonymous',
        userName: user?.name || 'Anonymous Student',
        title: formTitle.trim(),
        category: formCategory,
        location: formLocation.trim(),
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim() || undefined,
        status: 'Submitted',
      });
    }

    setIsCreateModalOpen(false);
    loadComplaints();
  };

  const confirmDelete = () => {
    if (!complaintToDelete) return;
    StorageService.deleteComplaint(complaintToDelete.id);
    setComplaintToDelete(null);
    if (selectedComplaint?.id === complaintToDelete.id) {
      setIsDetailModalOpen(false);
      setSelectedComplaint(null);
    }
    loadComplaints();
  };

  // Open Admin Status Updater
  const openAdminStatusModal = (c: Complaint, e: React.MouseEvent) => {
    e.stopPropagation();
    setAdminStatusModalComplaint(c);
    setNewStatus(c.status);
    setAdminNotesInput(c.adminNotes || '');
  };

  const handleSaveAdminStatus = () => {
    if (!adminStatusModalComplaint) return;
    StorageService.updateComplaintStatus(
      adminStatusModalComplaint.id,
      newStatus,
      adminNotesInput.trim() || undefined
    );
    setAdminStatusModalComplaint(null);
    loadComplaints();
    if (selectedComplaint?.id === adminStatusModalComplaint.id) {
      setSelectedComplaint({
        ...selectedComplaint,
        status: newStatus,
        adminNotes: adminNotesInput.trim() || undefined,
      });
    }
  };

  const openDetailModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setIsDetailModalOpen(true);
  };

  // Filters
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesMine = !myIssuesOnly || c.userId === user?.id;

    return matchesSearch && matchesCategory && matchesStatus && matchesMine;
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return (
          <Badge variant="warning" size="sm" className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Submitted
          </Badge>
        );
      case 'In Review':
        return (
          <Badge variant="info" size="sm" className="flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-sky-400 animate-spin" />
            In Review
          </Badge>
        );
      case 'Resolved':
        return (
          <Badge variant="success" size="sm" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: ComplaintCategory) => {
    switch (category) {
      case 'Wi-Fi':
        return <Wifi className="w-4 h-4 text-sky-400" />;
      case 'Mess':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'Electricity':
        return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case 'Hostel':
      case 'Classroom':
      case 'Laboratory':
      case 'Library':
        return <Building className="w-4 h-4 text-indigo-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  // Metrics
  const totalCount = complaints.length;
  const submittedCount = complaints.filter((c) => c.status === 'Submitted').length;
  const inReviewCount = complaints.filter((c) => c.status === 'In Review').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900 border border-rose-500/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="danger" size="sm">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                Module 6: Campus Grievance System
              </Badge>
              <Badge variant="primary" size="sm">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Transparent Resolution
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Campus Issues & Maintenance
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Report campus infrastructure issues, track live technician updates, and hold campus administration accountable with verified resolution notes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={openCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-lg shadow-rose-500/20 bg-rose-600 hover:bg-rose-500 text-white border-0"
            >
              Report an Issue
            </Button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Complaints</span>
            <p className="text-xl font-bold text-white">{totalCount}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Action Pending</span>
            <p className="text-xl font-bold text-amber-400">{submittedCount}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Under Investigation</span>
            <p className="text-xl font-bold text-sky-400">{inReviewCount}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Resolved Issues</span>
            <p className="text-xl font-bold text-emerald-400">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 space-y-4 bg-slate-900/80 border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search issues, location, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="all">Category: All Areas</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="all">Status: All Statuses</option>
              <option value="Submitted">Submitted (Pending)</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* My Issues Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setMyIssuesOnly(!myIssuesOnly)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                myIssuesOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              {myIssuesOnly ? 'Showing My Reports' : 'Filter: My Reports Only'}
            </button>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            Quick Categories:
          </span>
          {['Hostel', 'Mess', 'Wi-Fi', 'Classroom', 'Electricity', 'Cleanliness'].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive ? 'all' : cat)}
                className={`text-xs px-2.5 py-1 rounded-md shrink-0 transition-all font-medium ${
                  isActive
                    ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery || myIssuesOnly) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchQuery('');
                setMyIssuesOnly(false);
              }}
              className="text-xs px-2.5 py-1 rounded-md text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 shrink-0 font-medium transition-colors ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Issues List */}
      {filteredComplaints.length === 0 ? (
        <Card className="text-center py-16 px-4 bg-slate-900/40 border-dashed border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No complaints found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            There are currently no reported issues matching your filter criteria. If you are experiencing a maintenance problem, let the campus team know.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchQuery('');
                setMyIssuesOnly(false);
              }}
            >
              Clear Filters
            </Button>
            <Button variant="primary" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
              Report an Issue
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((c) => {
            const isOwner = user?.id === c.userId;
            const canManage = isOwner || isAdmin;
            const isUpvoted = upvotedIds.includes(c.id);

            return (
              <Card
                key={c.id}
                onClick={() => openDetailModal(c)}
                className="group relative flex flex-col justify-between p-5 bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-rose-500/40 transition-all duration-300 shadow-lg cursor-pointer"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {getCategoryIcon(c.category)}
                      <span className="font-semibold text-slate-300">{c.category}</span>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2 mb-2">
                    {c.title}
                  </h3>

                  {/* Location Pin */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="line-clamp-1">{c.location}</span>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                    {c.description}
                  </p>

                  {/* Image preview thumbnail if present */}
                  {c.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-slate-800 h-28 w-full bg-slate-950">
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Admin Notes Callout if present */}
                  {c.adminNotes && (
                    <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <span className="font-bold text-emerald-400 block mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Admin Resolution Note:
                      </span>
                      <p className="text-slate-300 line-clamp-2 italic">
                        "{c.adminNotes}"
                      </p>
                    </div>
                  )}

                  {/* 3-Step Visual Progress Stepper */}
                  <div className="mb-4 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-medium">
                      <span className={c.status === 'Submitted' ? 'text-amber-400 font-bold' : ''}>1. Submitted</span>
                      <span className={c.status === 'In Review' ? 'text-sky-400 font-bold' : ''}>2. In Review</span>
                      <span className={c.status === 'Resolved' ? 'text-emerald-400 font-bold' : ''}>3. Resolved</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className={`h-full ${c.status === 'Submitted' ? 'w-1/3 bg-amber-400' : c.status === 'In Review' ? 'w-2/3 bg-sky-400' : 'w-full bg-emerald-400'} transition-all duration-500`} />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    {/* Upvote / Me Too */}
                    <button
                      onClick={(e) => handleToggleUpvote(c.id, e)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-semibold transition-all ${
                        isUpvoted
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700/60'
                      }`}
                      title="Affects me too"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'text-rose-400 fill-rose-400/30' : ''}`} />
                      <span>{isUpvoted ? 'Endorsed' : 'Affects Me'}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={(e) => openAdminStatusModal(c, e)}
                        className="px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-medium transition-colors"
                        title="Update Status"
                      >
                        Update Status
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {canManage && (
                      <>
                        <button
                          onClick={(e) => openEditModal(c, e)}
                          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                          title="Edit Issue"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setComplaintToDelete(c);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Issue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className="text-[11px] text-slate-500 ml-1">
                      {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedComplaint && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Complaint Details"
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">
                    {selectedComplaint.category}
                  </Badge>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedComplaint.title}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {selectedComplaint.location}
                </p>
              </div>

              {isAdmin && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => openAdminStatusModal(selectedComplaint, e)}
                >
                  Change Status
                </Button>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Description</span>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Attached Photo */}
            {selectedComplaint.imageUrl && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attached Photo</span>
                <div className="rounded-xl overflow-hidden border border-slate-700 max-h-72 bg-slate-950">
                  <img
                    src={selectedComplaint.imageUrl}
                    alt={selectedComplaint.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Admin Response Note */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Administrative Response & Resolution Status
              </span>
              {selectedComplaint.adminNotes ? (
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-200 text-sm">
                  "{selectedComplaint.adminNotes}"
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  This issue has been routed to the maintenance estate supervisor. Official remarks will appear once technicians inspect the location.
                </p>
              )}
            </div>

            {/* Emergency Hotline Assistance */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-rose-300 block">Critical Emergency?</span>
                <span className="text-xs text-slate-400">For major water pipe leaks, electric sparking, or medical distress:</span>
              </div>
              <span className="text-xs font-bold text-white bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/30 shrink-0">
                Estates Desk: ext. 4102 / 4103
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                Filed by {selectedComplaint.userName} on{' '}
                {new Date(selectedComplaint.createdAt).toLocaleDateString()}
              </span>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT COMPLAINT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingComplaintId ? 'Update Maintenance Issue' : 'Report a Campus Issue'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitComplaint} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Water purifier leaking on 2nd floor corridor"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Precise Location *
              </label>
              <input
                type="text"
                required
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. Hostel Block C, 3rd Floor, Room 314"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              required
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Explain what the issue is, when it started, and how it impacts students..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Photo Preset Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Attach Photo / Issue Type Preset (optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_COMPLAINT_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setFormImageUrl(preset.url)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center gap-2 ${
                    formImageUrl === preset.url
                      ? 'bg-rose-500/20 border-rose-500 text-white font-medium shadow-sm'
                      : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  <img src={preset.url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                  <span className="line-clamp-1">{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="url"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="Or paste custom image URL..."
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-rose-600 hover:bg-rose-500 border-0">
              {editingComplaintId ? 'Save Changes' : 'Submit Issue'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADMIN STATUS MODAL */}
      {adminStatusModalComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setAdminStatusModalComplaint(null)}
          title="Update Complaint Resolution"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resolution Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Submitted">Submitted (Pending Review)</option>
                <option value="In Review">In Review (Technician Assigned)</option>
                <option value="Resolved">Resolved (Work Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Administrative Notes / Action Taken
              </label>
              <textarea
                rows={3}
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="e.g. Electrician team repaired wiring in Room 314 on Tuesday afternoon. Verified working."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setAdminStatusModalComplaint(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAdminStatus}>
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {complaintToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setComplaintToDelete(null)}
          title="Delete Complaint"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to remove the report for <strong className="text-white">{complaintToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setComplaintToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete}>
                Delete Complaint
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
