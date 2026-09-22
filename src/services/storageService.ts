import type {
  Assignment,
  AttendanceSubject,
  LostFoundItem,
  MarketplaceItem,
  TeamProfile,
  Complaint,
  WikiArticle,
  ReportItem,
} from '../types';
import {
  SEED_ASSIGNMENTS,
  SEED_ATTENDANCE,
  SEED_LOST_FOUND,
  SEED_MARKETPLACE,
  SEED_TEAM_PROFILES,
  SEED_COMPLAINTS,
  SEED_WIKI,
  SEED_REPORTS,
} from '../data/seedData';

// Helper for local storage with seed fallbacks
function getStored<T>(key: string, seed: T[]): T[] {
  const data = localStorage.getItem(`campushub_${key}`);
  if (!data) {
    localStorage.setItem(`campushub_${key}`, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return seed;
  }
}

function setStored<T>(key: string, items: T[]): void {
  localStorage.setItem(`campushub_${key}`, JSON.stringify(items));
  window.dispatchEvent(new Event('campushub_storage_updated'));
}

export const StorageService = {
  // Assignments
  getAssignments(): Assignment[] {
    return getStored<Assignment>('assignments', SEED_ASSIGNMENTS);
  },

  addAssignment(item: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
    const all = this.getAssignments();
    const newItem: Assignment = {
      ...item,
      id: `asg_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStored('assignments', [newItem, ...all]);
    return newItem;
  },

  toggleAssignmentStatus(id: string): void {
    const all = this.getAssignments();
    const updated = all.map((a) =>
      a.id === id ? { ...a, status: (a.status === 'pending' ? 'submitted' : 'pending') as Assignment['status'] } : a
    );
    setStored('assignments', updated);
  },

  updateAssignment(id: string, updates: Partial<Assignment>): void {
    const all = this.getAssignments();
    const updated = all.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setStored('assignments', updated);
  },

  deleteAssignment(id: string): void {
    const all = this.getAssignments();
    setStored('assignments', all.filter((a) => a.id !== id));
  },

  // Attendance
  getAttendance(): AttendanceSubject[] {
    return getStored<AttendanceSubject>('attendance', SEED_ATTENDANCE);
  },

  addAttendanceSubject(item: Omit<AttendanceSubject, 'id' | 'updatedAt'>): AttendanceSubject {
    const all = this.getAttendance();
    const newItem: AttendanceSubject = {
      ...item,
      id: `att_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setStored('attendance', [...all, newItem]);
    return newItem;
  },

  updateAttendance(id: string, attended: number, total: number, subjectName?: string): void {
    const all = this.getAttendance();
    const updated = all.map((s) =>
      s.id === id
        ? {
            ...s,
            subject: subjectName ?? s.subject,
            attendedClasses: attended,
            totalClasses: total,
            updatedAt: new Date().toISOString(),
          }
        : s
    );
    setStored('attendance', updated);
  },

  deleteAttendanceSubject(id: string): void {
    const all = this.getAttendance();
    setStored('attendance', all.filter((s) => s.id !== id));
  },


  // Attendance Mathematics & 75% Rule Engine
  calculateAttendanceMetrics(subject: AttendanceSubject) {
    const attended = subject.attendedClasses;
    const total = subject.totalClasses;
    const percentage = total > 0 ? (attended / total) * 100 : 100;
    const isSafe = percentage >= 75;

    // Consecutive classes needed to reach 75%
    // (attended + x) / (total + x) >= 0.75 => x >= (0.75 * total - attended) / 0.25
    let classesToAttend = 0;
    if (percentage < 75 && total > 0) {
      classesToAttend = Math.ceil((0.75 * total - attended) / 0.25);
    }

    // Classes you can miss while keeping >= 75%
    // attended / (total + y) >= 0.75 => total + y <= attended / 0.75 => y <= (attended - 0.75 * total) / 0.75
    let classesCanMiss = 0;
    if (percentage >= 75 && total > 0) {
      classesCanMiss = Math.floor((attended - 0.75 * total) / 0.75);
    }

    return {
      percentage: Number(percentage.toFixed(1)),
      isSafe,
      classesToAttend: Math.max(0, classesToAttend),
      classesCanMiss: Math.max(0, classesCanMiss),
      status: percentage >= 80 ? 'safe' : percentage >= 75 ? 'warning' : 'danger',
    };
  },

  // Lost & Found
  getLostFound(): LostFoundItem[] {
    return getStored<LostFoundItem>('lost_found', SEED_LOST_FOUND);
  },

  addLostFoundItem(item: Omit<LostFoundItem, 'id' | 'createdAt'>): LostFoundItem {
    const all = this.getLostFound();
    const newItem: LostFoundItem = {
      ...item,
      id: `lf_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStored('lost_found', [newItem, ...all]);
    return newItem;
  },

  updateLostFoundItem(id: string, updates: Partial<LostFoundItem>): void {
    const all = this.getLostFound();
    const updated = all.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setStored('lost_found', updated);
  },

  markLostFoundResolved(id: string): void {
    const all = this.getLostFound();
    const updated = all.map((item) => (item.id === id ? { ...item, status: 'resolved' as const } : item));
    setStored('lost_found', updated);
  },

  deleteLostFoundItem(id: string): void {
    const all = this.getLostFound();
    setStored('lost_found', all.filter((i) => i.id !== id));
  },


  // Marketplace
  getMarketplace(): MarketplaceItem[] {
    return getStored<MarketplaceItem>('marketplace', SEED_MARKETPLACE);
  },

  addMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'createdAt'>): MarketplaceItem {
    const all = this.getMarketplace();
    const newItem: MarketplaceItem = {
      ...item,
      id: `mkt_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStored('marketplace', [newItem, ...all]);
    return newItem;
  },

  updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): void {
    const all = this.getMarketplace();
    const updated = all.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setStored('marketplace', updated);
  },

  markMarketplaceSold(id: string): void {
    const all = this.getMarketplace();
    const updated = all.map((item) => (item.id === id ? { ...item, status: 'sold' as const } : item));
    setStored('marketplace', updated);
  },

  deleteMarketplaceItem(id: string): void {
    const all = this.getMarketplace();
    setStored('marketplace', all.filter((i) => i.id !== id));
  },

  // Team Profiles
  getTeamProfiles(): TeamProfile[] {
    return getStored<TeamProfile>('team_profiles', SEED_TEAM_PROFILES);
  },

  addTeamProfile(item: Omit<TeamProfile, 'id' | 'createdAt'>): TeamProfile {
    const all = this.getTeamProfiles();
    const newItem: TeamProfile = {
      ...item,
      id: `tp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStored('team_profiles', [newItem, ...all]);
    return newItem;
  },

  updateTeamProfile(id: string, updates: Partial<TeamProfile>): void {
    const all = this.getTeamProfiles();
    const updated = all.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setStored('team_profiles', updated);
  },

  deleteTeamProfile(id: string): void {
    const all = this.getTeamProfiles();
    setStored('team_profiles', all.filter((p) => p.id !== id));
  },


  // Complaints / Campus Issues
  getComplaints(): Complaint[] {
    return getStored<Complaint>('complaints', SEED_COMPLAINTS);
  },

  addComplaint(item: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>): Complaint {
    const all = this.getComplaints();
    const newItem: Complaint = {
      ...item,
      id: `cmp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStored('complaints', [newItem, ...all]);
    return newItem;
  },

  updateComplaint(id: string, updates: Partial<Complaint>): void {
    const all = this.getComplaints();
    const updated = all.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    setStored('complaints', updated);
  },

  updateComplaintStatus(id: string, status: Complaint['status'], adminNotes?: string): void {
    const all = this.getComplaints();
    const updated = all.map((c) =>
      c.id === id ? { ...c, status, adminNotes: adminNotes ?? c.adminNotes, updatedAt: new Date().toISOString() } : c
    );
    setStored('complaints', updated);
  },

  deleteComplaint(id: string): void {
    const all = this.getComplaints();
    setStored('complaints', all.filter((c) => c.id !== id));
  },

  // Wiki Articles
  getWikiArticles(): WikiArticle[] {
    return getStored<WikiArticle>('wiki', SEED_WIKI);
  },

  addWikiArticle(item: Omit<WikiArticle, 'id' | 'createdAt' | 'updatedAt'>): WikiArticle {
    const all = this.getWikiArticles();
    const newItem: WikiArticle = {
      ...item,
      id: `wiki_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStored('wiki', [newItem, ...all]);
    return newItem;
  },

  updateWikiArticle(id: string, updates: Partial<WikiArticle>): void {
    const all = this.getWikiArticles();
    const updated = all.map((w) =>
      w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
    );
    setStored('wiki', updated);
  },

  deleteWikiArticle(id: string): void {
    const all = this.getWikiArticles();
    setStored('wiki', all.filter((w) => w.id !== id));
  },

  // Reports
  getReports(): ReportItem[] {
    return getStored<ReportItem>('reports', SEED_REPORTS);
  },

  addReport(report: Omit<ReportItem, 'id' | 'createdAt'>): ReportItem {
    const all = this.getReports();
    const newItem: ReportItem = {
      ...report,
      id: `rep_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStored('reports', [newItem, ...all]);
    return newItem;
  },

  updateReportStatus(id: string, status: ReportItem['status']): void {
    const all = this.getReports();
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r));
    setStored('reports', updated);
  },

  deleteReport(id: string): void {
    const all = this.getReports();
    setStored('reports', all.filter((r) => r.id !== id));
  },

  // Reset all module tables to initial demo seed data
  resetToDefaults(): void {
    localStorage.setItem('campushub_assignments', JSON.stringify(SEED_ASSIGNMENTS));
    localStorage.setItem('campushub_attendance', JSON.stringify(SEED_ATTENDANCE));
    localStorage.setItem('campushub_lost_found', JSON.stringify(SEED_LOST_FOUND));
    localStorage.setItem('campushub_marketplace', JSON.stringify(SEED_MARKETPLACE));
    localStorage.setItem('campushub_team_profiles', JSON.stringify(SEED_TEAM_PROFILES));
    localStorage.setItem('campushub_complaints', JSON.stringify(SEED_COMPLAINTS));
    localStorage.setItem('campushub_wiki', JSON.stringify(SEED_WIKI));
    localStorage.setItem('campushub_reports', JSON.stringify(SEED_REPORTS));
    window.dispatchEvent(new Event('campushub_storage_updated'));
  },
};
