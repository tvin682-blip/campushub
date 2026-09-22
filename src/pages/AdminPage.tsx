import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Check,
  BookOpen,
  Layers,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { UNIVERSITY_CONFIG } from '../config/university';
import type {
  Complaint,
  ComplaintStatus,
  ReportItem,
  WikiArticle,
  WikiCategory,
} from '../types';

const WIKI_CATEGORIES: WikiCategory[] = [
  'Freshers Guide',
  'Exams',
  'Academics',
  'Library',
  'Hostel',
  'Clubs',
  'Campus Facilities',
  'Departments',
  'Important Offices',
  'FAQs',
  'General Student Tips',
  'Faculty',
];

type AdminTab = 'grievances' | 'reports' | 'wiki' | 'system';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('grievances');

  // Data states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);

  // Filters for grievances
  const [grievanceSearch, setGrievanceSearch] = useState('');
  const [grievanceStatusFilter, setGrievanceStatusFilter] = useState<string>('all');
  const [grievanceCategoryFilter, setGrievanceCategoryFilter] = useState<string>('all');

  // Grievance resolution modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<ComplaintStatus>('In Review');
  const [resolutionNote, setResolutionNote] = useState('');

  // Wiki create/edit modal
  const [isWikiModalOpen, setIsWikiModalOpen] = useState(false);
  const [editingWikiId, setEditingWikiId] = useState<string | null>(null);
  const [wikiTitle, setWikiTitle] = useState('');
  const [wikiCategory, setWikiCategory] = useState<WikiCategory>('Freshers Guide');
  const [wikiShortDesc, setWikiShortDesc] = useState('');
  const [wikiContent, setWikiContent] = useState('');
  const [wikiAuthor, setWikiAuthor] = useState('');
  const [wikiError, setWikiError] = useState('');

  // Confirmation modals
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  const [wikiToDelete, setWikiToDelete] = useState<WikiArticle | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

  // Load all admin data
  const loadData = () => {
    setComplaints(StorageService.getComplaints());
    setReports(StorageService.getReports());
    setWikiArticles(StorageService.getWikiArticles());
  };

  useEffect(() => {
    loadData();
    const handleStorageUpdate = () => loadData();
    window.addEventListener('campushub_storage_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('campushub_storage_updated', handleStorageUpdate);
    };
  }, []);

  // Grievance resolution handlers
  const openResolveModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setResolutionStatus(c.status);
    setResolutionNote(c.adminNotes || '');
  };

  const handleSaveResolution = () => {
    if (!selectedComplaint) return;
    StorageService.updateComplaintStatus(
      selectedComplaint.id,
      resolutionStatus,
      resolutionNote.trim() || undefined
    );
    setSelectedComplaint(null);
    loadData();
  };

  const confirmDeleteComplaint = () => {
    if (!complaintToDelete) return;
    StorageService.deleteComplaint(complaintToDelete.id);
    setComplaintToDelete(null);
    loadData();
  };

  // Report resolution handlers
  const handleMarkReportReviewed = (reportId: string) => {
    StorageService.updateReportStatus(reportId, 'reviewed');
    loadData();
  };

  const handleRemoveReportedItem = (report: ReportItem) => {
    if (report.targetType === 'marketplace') {
      StorageService.deleteMarketplaceItem(report.targetId);
    } else if (report.targetType === 'lost_found') {
      StorageService.deleteLostFoundItem(report.targetId);
    }
    StorageService.updateReportStatus(report.id, 'reviewed');
    loadData();
  };

  const handleDismissReport = (reportId: string) => {
    StorageService.deleteReport(reportId);
    loadData();
  };

  // Wiki handlers
  const openCreateWikiModal = () => {
    setEditingWikiId(null);
    setWikiTitle('');
    setWikiCategory('Freshers Guide');
    setWikiShortDesc('');
    setWikiContent('');
    setWikiAuthor(user?.name || 'Academic Affairs Office');
    setWikiError('');
    setIsWikiModalOpen(true);
  };

  const openEditWikiModal = (art: WikiArticle) => {
    setEditingWikiId(art.id);
    setWikiTitle(art.title);
    setWikiCategory(art.category);
    setWikiShortDesc(art.shortDescription);
    setWikiContent(art.content);
    setWikiAuthor(art.author);
    setWikiError('');
    setIsWikiModalOpen(true);
  };

  const handleSaveWiki = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wikiTitle.trim()) {
      setWikiError('Title is required.');
      return;
    }
    if (!wikiShortDesc.trim()) {
      setWikiError('Summary description is required.');
      return;
    }
    if (!wikiContent.trim()) {
      setWikiError('Guide content is required.');
      return;
    }

    if (editingWikiId) {
      StorageService.updateWikiArticle(editingWikiId, {
        title: wikiTitle.trim(),
        category: wikiCategory,
        shortDescription: wikiShortDesc.trim(),
        content: wikiContent.trim(),
        author: wikiAuthor.trim() || 'Academic Affairs Office',
      });
    } else {
      StorageService.addWikiArticle({
        title: wikiTitle.trim(),
        category: wikiCategory,
        shortDescription: wikiShortDesc.trim(),
        content: wikiContent.trim(),
        author: wikiAuthor.trim() || 'Academic Affairs Office',
        tags: ['Official', 'Administration'],
        isPublished: true,
      });
    }

    setIsWikiModalOpen(false);
    loadData();
  };

  const confirmDeleteWiki = () => {
    if (!wikiToDelete) return;
    StorageService.deleteWikiArticle(wikiToDelete.id);
    setWikiToDelete(null);
    loadData();
  };

  const handleTogglePublishWiki = (art: WikiArticle) => {
    StorageService.updateWikiArticle(art.id, {
      isPublished: !art.isPublished,
    });
    loadData();
  };

  // Database Reset
  const handleResetDatabase = () => {
    StorageService.resetToDefaults();
    setIsResetModalOpen(false);
    setResetSuccessMessage(true);
    setTimeout(() => setResetSuccessMessage(false), 3000);
    loadData();
  };

  // Filtered grievances
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      grievanceSearch === '' ||
      c.title.toLowerCase().includes(grievanceSearch.toLowerCase()) ||
      c.location.toLowerCase().includes(grievanceSearch.toLowerCase()) ||
      c.userName.toLowerCase().includes(grievanceSearch.toLowerCase());

    const matchesStatus = grievanceStatusFilter === 'all' || c.status === grievanceStatusFilter;
    const matchesCategory = grievanceCategoryFilter === 'all' || c.category === grievanceCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Metrics
  const pendingGrievances = complaints.filter((c) => c.status === 'Submitted').length;
  const inReviewGrievances = complaints.filter((c) => c.status === 'In Review').length;
  const resolvedGrievances = complaints.filter((c) => c.status === 'Resolved').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-900 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Staff Administration
              </Badge>
              <Badge variant="primary" size="sm">
                Academic & Facility Governance
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Admin Control Center</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Manage campus grievances, moderate student marketplace flags, and publish official academic guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="warning" size="md" className="py-1.5 px-3">
              Admin: {user?.name || UNIVERSITY_CONFIG.demoAdmin.name}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
            >
              Reset Demo Data
            </Button>
          </div>
        </div>

        {/* Success alert banner on reset */}
        {resetSuccessMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>CampusHub database successfully restored to pristine initial seed state!</span>
          </div>
        )}

        {/* Metrics Row */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Pending Grievances</span>
            <p className="text-2xl font-bold text-amber-400">{pendingGrievances}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">In Investigation</span>
            <p className="text-2xl font-bold text-sky-400">{inReviewGrievances}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Resolved Issues</span>
            <p className="text-2xl font-bold text-emerald-400">{resolvedGrievances}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Flagged Reports Queue</span>
            <p className="text-2xl font-bold text-rose-400">{pendingReports}</p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('grievances')}
          className={`py-2.5 px-4 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'grievances'
              ? 'bg-slate-800 text-white border-b-2 border-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Grievance Resolution Desk ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-2.5 px-4 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'reports'
              ? 'bg-slate-800 text-white border-b-2 border-rose-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Flagged Content Queue ({reports.length})</span>
          {pendingReports > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
              {pendingReports}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('wiki')}
          className={`py-2.5 px-4 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'wiki'
              ? 'bg-slate-800 text-white border-b-2 border-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Wiki Publishing Desk ({wikiArticles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`py-2.5 px-4 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'system'
              ? 'bg-slate-800 text-white border-b-2 border-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>System & Module Stats</span>
        </button>
      </div>

      {/* TAB 1: GRIEVANCE RESOLUTION DESK */}
      {activeTab === 'grievances' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="p-4 bg-slate-900/80 border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search grievance or student..."
                  value={grievanceSearch}
                  onChange={(e) => setGrievanceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <select
                  value={grievanceStatusFilter}
                  onChange={(e) => setGrievanceStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Status: All Statuses</option>
                  <option value="Submitted">Submitted (Pending Action)</option>
                  <option value="In Review">In Review (Investigating)</option>
                  <option value="Resolved">Resolved (Completed)</option>
                </select>
              </div>

              <div>
                <select
                  value={grievanceCategoryFilter}
                  onChange={(e) => setGrievanceCategoryFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Category: All Areas</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Mess">Mess</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Wi-Fi">Wi-Fi</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Library">Library</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Grievance Table */}
          {filteredComplaints.length === 0 ? (
            <Card className="text-center py-12 text-slate-400">
              No grievances found matching the selected filter criteria.
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <Card
                  key={c.id}
                  className="p-5 bg-slate-900 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {c.category}
                      </Badge>
                      {c.status === 'Submitted' && (
                        <Badge variant="warning" size="sm">
                          Submitted (Pending)
                        </Badge>
                      )}
                      {c.status === 'In Review' && (
                        <Badge variant="info" size="sm">
                          In Review
                        </Badge>
                      )}
                      {c.status === 'Resolved' && (
                        <Badge variant="success" size="sm">
                          Resolved
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500">
                        • Reported by <strong className="text-slate-300">{c.userName}</strong> on {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                    <p className="text-xs text-indigo-400 font-medium">📍 {c.location}</p>

                    {c.adminNotes && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                        <strong>Official Note:</strong> "{c.adminNotes}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openResolveModal(c)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Update Status & Notes
                    </Button>
                    <button
                      onClick={() => setComplaintToDelete(c)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLAGGED CONTENT QUEUE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <Card className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-white">No Flagged Items in Queue</p>
              <p className="text-xs text-slate-400 mt-1">
                All student reports and flagged marketplace items have been reviewed.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <Card
                  key={rep.id}
                  className="p-5 bg-slate-900 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={rep.targetType === 'marketplace' ? 'warning' : 'primary'}
                        size="sm"
                      >
                        Target: {rep.targetType.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={rep.status === 'pending' ? 'danger' : 'success'}
                        size="sm"
                      >
                        {rep.status === 'pending' ? 'Pending Review' : 'Reviewed & Resolved'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Item ID: {rep.targetId} • {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-rose-300">
                      Reason: "{rep.reason}"
                    </h4>
                    <p className="text-xs text-slate-400">
                      Reported by user token: {rep.reporterId}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {rep.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRemoveReportedItem(rep)}
                          className="text-xs"
                        >
                          Remove Offending Item
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMarkReportReviewed(rep.id)}
                          className="text-xs"
                        >
                          Dismiss / Mark Safe
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Handled
                      </span>
                    )}
                    <button
                      onClick={() => handleDismissReport(rep.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete Report Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WIKI PUBLISHING DESK */}
      {activeTab === 'wiki' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Campus Knowledge Base Articles</h3>
            <Button
              size="sm"
              variant="primary"
              onClick={openCreateWikiModal}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs bg-blue-600 hover:bg-blue-500 border-0"
            >
              Create Official Guide
            </Button>
          </div>

          <div className="space-y-3">
            {wikiArticles.map((art) => (
              <Card
                key={art.id}
                className="p-5 bg-slate-900 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {art.category}
                    </Badge>
                    <Badge
                      variant={art.isPublished ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {art.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      Author: {art.author} • Updated {new Date(art.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{art.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{art.shortDescription}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={art.isPublished ? 'outline' : 'secondary'}
                    onClick={() => handleTogglePublishWiki(art)}
                    className="text-xs"
                  >
                    {art.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => openEditWikiModal(art)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <button
                    onClick={() => setWikiToDelete(art)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete Guide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM OVERVIEW & MODULE STATS */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-5 bg-slate-900 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Module 1</span>
              <Badge variant="primary" size="sm">Lost & Found</Badge>
            </div>
            <p className="text-2xl font-bold text-white">
              {StorageService.getLostFound().length} Items
            </p>
            <p className="text-xs text-slate-400">
              Open claims: {StorageService.getLostFound().filter((i) => i.status === 'open').length}
            </p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Module 2</span>
              <Badge variant="primary" size="sm">Assignments</Badge>
            </div>
            <p className="text-2xl font-bold text-white">
              {StorageService.getAssignments().length} Records
            </p>
            <p className="text-xs text-slate-400">
              Pending tasks: {StorageService.getAssignments().filter((a) => a.status === 'pending').length}
            </p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Module 3</span>
              <Badge variant="primary" size="sm">Marketplace</Badge>
            </div>
            <p className="text-2xl font-bold text-white">
              {StorageService.getMarketplace().length} Listings
            </p>
            <p className="text-xs text-slate-400">
              Available: {StorageService.getMarketplace().filter((m) => m.status === 'available').length}
            </p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Module 4</span>
              <Badge variant="primary" size="sm">Team Finder</Badge>
            </div>
            <p className="text-2xl font-bold text-white">
              {StorageService.getTeamProfiles().length} Profiles
            </p>
            <p className="text-xs text-slate-400">
              Hackathons: {StorageService.getTeamProfiles().filter((p) => p.lookingFor === 'Hackathon').length}
            </p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Module 5</span>
              <Badge variant="primary" size="sm">Attendance</Badge>
            </div>
            <p className="text-2xl font-bold text-white">
              {StorageService.getAttendance().length} Courses
            </p>
            <p className="text-xs text-slate-400">
              Enrolled students: {UNIVERSITY_CONFIG.demoStudent.name} (usr_student_1)
            </p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Module 6 & 7</span>
              <Badge variant="primary" size="sm">Issues & Wiki</Badge>
            </div>
            <p className="text-2xl font-bold text-white">
              {complaints.length} Grievances / {wikiArticles.length} Guides
            </p>
            <p className="text-xs text-slate-400">
              Grievance resolution rate: {complaints.length > 0 ? Math.round((resolvedGrievances / complaints.length) * 100) : 0}%
            </p>
          </Card>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          title="Update Grievance Resolution"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Issue Summary
              </span>
              <p className="text-sm font-semibold text-white">{selectedComplaint.title}</p>
              <p className="text-xs text-slate-400">
                {selectedComplaint.category} • {selectedComplaint.location}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resolution Workflow State
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Submitted">Submitted (Pending Inspection)</option>
                <option value="In Review">In Review (Technician Assigned)</option>
                <option value="Resolved">Resolved (Completed & Verified)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Administrative / Technician Remarks
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Detail the action taken, technician dispatch date, or verification outcome..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveResolution}>
                Save Resolution
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT WIKI MODAL */}
      <Modal
        isOpen={isWikiModalOpen}
        onClose={() => setIsWikiModalOpen(false)}
        title={editingWikiId ? 'Edit Official Guide' : 'Publish Official University Guide'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveWiki} className="space-y-4">
          {wikiError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {wikiError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Guide Title *
            </label>
            <input
              type="text"
              required
              value={wikiTitle}
              onChange={(e) => setWikiTitle(e.target.value)}
              placeholder="e.g. End-Semester Examination & Admit Card Guidelines"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={wikiCategory}
                onChange={(e) => setWikiCategory(e.target.value as WikiCategory)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {WIKI_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Author / Issuing Office *
              </label>
              <input
                type="text"
                required
                value={wikiAuthor}
                onChange={(e) => setWikiAuthor(e.target.value)}
                placeholder="e.g. Controller of Examinations"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Summary Description *
            </label>
            <input
              type="text"
              required
              value={wikiShortDesc}
              onChange={(e) => setWikiShortDesc(e.target.value)}
              placeholder="Brief summary of guidelines for student noticeboard..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official Instructions (Markdown Supported) *
            </label>
            <textarea
              rows={6}
              required
              value={wikiContent}
              onChange={(e) => setWikiContent(e.target.value)}
              placeholder="### 1. Mandatory Attendance Rule&#10;As per university rules, students must have 75% attendance..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsWikiModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-500 border-0">
              {editingWikiId ? 'Save Changes' : 'Publish Official Guide'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE COMPLAINT MODAL */}
      {complaintToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setComplaintToDelete(null)}
          title="Delete Grievance Record"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete the complaint record for{' '}
              <strong className="text-white">{complaintToDelete.title}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setComplaintToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDeleteComplaint}>
                Delete Record
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE WIKI MODAL */}
      {wikiToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setWikiToDelete(null)}
          title="Delete Wiki Article"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete the guide{' '}
              <strong className="text-white">{wikiToDelete.title}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setWikiToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDeleteWiki}>
                Delete Guide
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* RESET DATABASE MODAL */}
      {isResetModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsResetModalOpen(false)}
          title="Restore Demo Database"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <strong>Caution:</strong> This will reset all 7 module tables (Lost & Found, Assignments, Marketplace, Team Profiles, Grievances, Wiki, and Reports) to their original default seed data.
            </div>
            <p className="text-sm text-slate-300">
              This is ideal for restarting your presentation or evaluation from a clean slate. Proceed?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleResetDatabase} className="bg-amber-600 hover:bg-amber-500 text-white border-0">
                Confirm Reset
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
