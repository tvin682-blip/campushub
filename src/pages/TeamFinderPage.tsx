import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Sparkles,
  Code2,
  Globe,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  GraduationCap,
  Tag,
  X,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type { TeamProfile, ProjectInterest } from '../types';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const PROJECT_INTERESTS: { label: string; value: ProjectInterest; badgeVariant: BadgeVariant }[] = [
  { label: 'Hackathon', value: 'Hackathon', badgeVariant: 'success' },
  { label: 'College Project', value: 'College Project', badgeVariant: 'primary' },
  { label: 'Competition', value: 'Competition', badgeVariant: 'info' },
  { label: 'Startup', value: 'Startup', badgeVariant: 'warning' },
  { label: 'Open Source', value: 'Open Source', badgeVariant: 'neutral' },
  { label: 'Other', value: 'Other', badgeVariant: 'primary' },
];

const POPULAR_SKILLS = [
  'React',
  'Python',
  'Figma',
  'Machine Learning',
  'FastAPI',
  'Node.js',
  'Docker',
  'Cybersecurity',
  'Tailwind CSS',
  'TypeScript',
  'Flutter',
  'Java',
  'C++',
  'Solidity',
  'UI/UX Design',
];

const BRANCH_OPTIONS = [
  'Computer Science',
  'Computer Science & AI',
  'Information Technology',
  'Electronics & Comm.',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science',
  'Other',
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export const TeamFinderPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [activeSkillFilter, setActiveSkillFilter] = useState<string | null>(null);

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<TeamProfile | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<TeamProfile | null>(null);

  // Copy feedbacks
  const [copiedContact, setCopiedContact] = useState(false);
  const [copiedIcebreaker, setCopiedIcebreaker] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBranch, setFormBranch] = useState(BRANCH_OPTIONS[0]);
  const [formYear, setFormYear] = useState(YEAR_OPTIONS[2]);
  const [formLookingFor, setFormLookingFor] = useState<ProjectInterest>('Hackathon');
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [formSkillInput, setFormSkillInput] = useState('');
  const [formInterests, setFormInterests] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formContactInfo, setFormContactInfo] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formLinkedinUrl, setFormLinkedinUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Load profiles
  const loadProfiles = () => {
    const list = StorageService.getTeamProfiles();
    setProfiles(list);
  };

  useEffect(() => {
    loadProfiles();
    const handleStorageUpdate = () => loadProfiles();
    window.addEventListener('campushub_storage_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('campushub_storage_updated', handleStorageUpdate);
    };
  }, []);

  // Check if current user already has a published profile
  const userProfile = profiles.find((p) => p.userId === user?.id);

  // Reset form
  const resetForm = () => {
    setFormName(user?.name || '');
    setFormBranch(user?.branch || BRANCH_OPTIONS[0]);
    setFormYear(user?.year || YEAR_OPTIONS[2]);
    setFormLookingFor('Hackathon');
    setFormSkills(user?.skills || ['React', 'TypeScript']);
    setFormSkillInput('');
    setFormInterests('');
    setFormBio('');
    setFormContactInfo(user?.email || '');
    setFormGithubUrl('');
    setFormLinkedinUrl('');
    setFormError('');
    setEditingProfileId(null);
  };

  // Open Create Modal
  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (profile: TeamProfile) => {
    setEditingProfileId(profile.id);
    setFormName(profile.name);
    setFormBranch(profile.branch);
    setFormYear(profile.year);
    setFormLookingFor(profile.lookingFor);
    setFormSkills(profile.skills || []);
    setFormSkillInput('');
    setFormInterests(profile.interests || '');
    setFormBio(profile.bio || '');
    setFormContactInfo(profile.contactInfo);
    setFormGithubUrl(profile.githubUrl || '');
    setFormLinkedinUrl(profile.linkedinUrl || '');
    setFormError('');
    setIsCreateModalOpen(true);
  };

  // Skill tag add/remove
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!formSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormSkills([...formSkills, trimmed]);
    }
    setFormSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormSkills(formSkills.filter((s) => s !== skillToRemove));
  };

  // Submit Profile Form
  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (formSkills.length === 0) {
      setFormError('Please add at least one technical or design skill.');
      return;
    }
    if (!formContactInfo.trim()) {
      setFormError('Contact info (Email, Phone, Discord, or Telegram) is required.');
      return;
    }

    if (editingProfileId) {
      StorageService.updateTeamProfile(editingProfileId, {
        name: formName.trim(),
        branch: formBranch,
        year: formYear,
        lookingFor: formLookingFor,
        skills: formSkills,
        interests: formInterests.trim(),
        bio: formBio.trim(),
        contactInfo: formContactInfo.trim(),
        githubUrl: formGithubUrl.trim() || undefined,
        linkedinUrl: formLinkedinUrl.trim() || undefined,
      });
    } else {
      StorageService.addTeamProfile({
        userId: user?.id || 'usr_anonymous',
        name: formName.trim(),
        branch: formBranch,
        year: formYear,
        lookingFor: formLookingFor,
        skills: formSkills,
        interests: formInterests.trim(),
        bio: formBio.trim(),
        contactInfo: formContactInfo.trim(),
        githubUrl: formGithubUrl.trim() || undefined,
        linkedinUrl: formLinkedinUrl.trim() || undefined,
      });
    }

    setIsCreateModalOpen(false);
    loadProfiles();
  };

  // Delete Profile
  const confirmDelete = () => {
    if (!profileToDelete) return;
    StorageService.deleteTeamProfile(profileToDelete.id);
    setProfileToDelete(null);
    if (selectedProfile?.id === profileToDelete.id) {
      setIsConnectModalOpen(false);
      setSelectedProfile(null);
    }
    loadProfiles();
  };

  // Open Connect / Detail Modal
  const openConnectModal = (profile: TeamProfile) => {
    setSelectedProfile(profile);
    setCopiedContact(false);
    setCopiedIcebreaker(false);
    setIsConnectModalOpen(true);
  };

  const copyToClipboard = (text: string, type: 'contact' | 'icebreaker') => {
    navigator.clipboard.writeText(text);
    if (type === 'contact') {
      setCopiedContact(true);
      setTimeout(() => setCopiedContact(false), 2500);
    } else {
      setCopiedIcebreaker(true);
      setTimeout(() => setCopiedIcebreaker(false), 2500);
    }
  };

  // Filter profiles
  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      searchQuery === '' ||
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.bio && profile.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      profile.interests.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesInterest = selectedInterest === 'all' || profile.lookingFor === selectedInterest;
    const matchesYear = selectedYear === 'all' || profile.year === selectedYear;
    const matchesBranch = selectedBranch === 'all' || profile.branch.toLowerCase().includes(selectedBranch.toLowerCase());
    const matchesSkill =
      !activeSkillFilter ||
      profile.skills.some((s) => s.toLowerCase() === activeSkillFilter.toLowerCase());

    return matchesSearch && matchesInterest && matchesYear && matchesBranch && matchesSkill;
  });

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Helper to get interest badge variant
  const getInterestVariant = (interest: ProjectInterest): BadgeVariant => {
    const match = PROJECT_INTERESTS.find((p) => p.value === interest);
    return match ? match.badgeVariant : 'primary';
  };

  // Generate friendly icebreaker text
  const generateIcebreaker = (target: TeamProfile) => {
    const skillMention = target.skills[0] || 'tech stack';
    return `Hi ${target.name.split(' ')[0]}! I saw your profile on CampusHub Team Finder. I'm putting together a team for ${target.lookingFor} projects, and your skills in ${skillMention} caught my attention. Would love to discuss collaborating! Let me know if you're open to a quick chat.`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                <Users className="w-3.5 h-3.5 mr-1" />
                Module 4: Peer Collaboration
              </Badge>
              <Badge variant="success" size="sm">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Live Matching
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Campus Team Finder
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Connect with talented developers, UI/UX designers, and domain experts for hackathons, engineering capstones, and startup ventures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {userProfile ? (
              <Button
                variant="primary"
                onClick={() => openEditModal(userProfile)}
                leftIcon={<Edit2 className="w-4 h-4" />}
                className="shadow-lg shadow-indigo-500/20"
              >
                Edit My Team Profile
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={openCreateModal}
                leftIcon={<Plus className="w-4 h-4" />}
                className="shadow-lg shadow-indigo-500/20"
              >
                Publish My Profile
              </Button>
            )}
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Students Listed</span>
            <p className="text-xl font-bold text-white">{profiles.length}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Hackathon Ready</span>
            <p className="text-xl font-bold text-emerald-400">
              {profiles.filter((p) => p.lookingFor === 'Hackathon').length}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Startup Co-founders</span>
            <p className="text-xl font-bold text-amber-400">
              {profiles.filter((p) => p.lookingFor === 'Startup').length}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Capstones & Projects</span>
            <p className="text-xl font-bold text-indigo-400">
              {profiles.filter((p) => p.lookingFor === 'College Project' || p.lookingFor === 'Competition').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <Card className="p-4 sm:p-5 space-y-4 bg-slate-900/80 border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, skill, bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
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

          {/* Looking For Dropdown */}
          <div>
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">Goal: All Categories</option>
              {PROJECT_INTERESTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">Year: All Years</option>
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">Branch: All Branches</option>
              {BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Popular Skills Quick-Filter Ribbon */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            Quick Skills:
          </span>

          {POPULAR_SKILLS.map((skill) => {
            const isActive = activeSkillFilter?.toLowerCase() === skill.toLowerCase();
            return (
              <button
                key={skill}
                onClick={() => setActiveSkillFilter(isActive ? null : skill)}
                className={`text-xs px-2.5 py-1 rounded-md shrink-0 transition-all font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {skill}
              </button>
            );
          })}

          {(activeSkillFilter || selectedInterest !== 'all' || selectedYear !== 'all' || selectedBranch !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setActiveSkillFilter(null);
                setSelectedInterest('all');
                setSelectedYear('all');
                setSelectedBranch('all');
                setSearchQuery('');
              }}
              className="text-xs px-2.5 py-1 rounded-md text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 shrink-0 font-medium transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Profiles Grid */}
      {filteredProfiles.length === 0 ? (
        <Card className="text-center py-16 px-4 bg-slate-900/40 border-dashed border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No student profiles found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            We couldn't find any profiles matching your search filters. Try adjusting your keywords or clearing the active skill tag.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedInterest('all');
                setSelectedYear('all');
                setSelectedBranch('all');
                setActiveSkillFilter(null);
              }}
            >
              Clear All Filters
            </Button>
            <Button variant="primary" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
              Add Your Profile
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            const isOwner = user?.id === profile.userId;
            const canManage = isOwner || isAdmin;

            return (
              <Card
                key={profile.id}
                className="group relative flex flex-col justify-between p-5 bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-indigo-500/40 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  {/* Card Header: Avatar & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        {getInitials(profile.name)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {profile.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {profile.branch} • {profile.year}
                        </p>
                      </div>
                    </div>

                    <Badge variant={getInterestVariant(profile.lookingFor)} size="sm">
                      {profile.lookingFor}
                    </Badge>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                      "{profile.bio}"
                    </p>
                  )}

                  {/* Project Interests */}
                  {profile.interests && (
                    <div className="mb-4">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Focus Areas & Ideas:
                      </span>
                      <p className="text-xs text-indigo-300/90 line-clamp-2">
                        {profile.interests}
                      </p>
                    </div>
                  )}

                  {/* Skills Pill List */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Skills & Tech Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/70 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 5 && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 font-medium">
                          +{profile.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Social Links & Connect Button */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="GitHub Profile"
                      >
                        <Code2 className="w-4 h-4" />
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="LinkedIn Profile"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {canManage && (
                      <div className="flex items-center gap-1 ml-1 border-l border-slate-700/80 pl-2">
                        <button
                          onClick={() => openEditModal(profile)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProfileToDelete(profile)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => openConnectModal(profile)}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="text-xs py-1.5"
                  >
                    Connect
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CONNECT / PROFILE DETAIL MODAL */}
      {selectedProfile && (
        <Modal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          title="Student Talent Card"
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                {getInitials(selectedProfile.name)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedProfile.name}</h3>
                  <Badge variant={getInterestVariant(selectedProfile.lookingFor)} size="sm">
                    {selectedProfile.lookingFor}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  {selectedProfile.branch} • {selectedProfile.year}
                </p>
              </div>
            </div>

            {/* Bio & Vision */}
            {selectedProfile.bio && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">About Me</span>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                  {selectedProfile.bio}
                </p>
              </div>
            )}

            {/* Focus Areas */}
            {selectedProfile.interests && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Interests & Ideas</span>
                <p className="text-sm text-indigo-300 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                  {selectedProfile.interests}
                </p>
              </div>
            )}

            {/* Complete Skills List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills & Tech Stack</span>
              <div className="flex flex-wrap gap-2">
                {selectedProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="neutral" size="md">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Links */}
            {(selectedProfile.githubUrl || selectedProfile.linkedinUrl) && (
              <div className="flex items-center gap-3 pt-2">
                {selectedProfile.githubUrl && (
                  <a
                    href={selectedProfile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>GitHub Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </a>
                )}
                {selectedProfile.linkedinUrl && (
                  <a
                    href={selectedProfile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </a>
                )}
              </div>
            )}

            {/* Direct Contact Card */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  Direct Contact Info:
                </span>
                <button
                  onClick={() => copyToClipboard(selectedProfile.contactInfo, 'contact')}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {copiedContact ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Info</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-base font-semibold text-white select-all">
                {selectedProfile.contactInfo}
              </p>
            </div>

            {/* Friendly Icebreaker Copy Tool */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Suggested Icebreaker Message:
                </span>
                <button
                  onClick={() => copyToClipboard(generateIcebreaker(selectedProfile), 'icebreaker')}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {copiedIcebreaker ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Icebreaker!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                "{generateIcebreaker(selectedProfile)}"
              </p>
              <p className="text-[11px] text-slate-400">
                Tip: Copy and paste this into WhatsApp, Telegram, or Email to start a natural collaboration conversation!
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsConnectModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT PROFILE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingProfileId ? 'Update Team Profile' : 'Publish Student Profile'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitProfile} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Student Demo"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Looking For */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Goal / Looking For *
              </label>
              <select
                value={formLookingFor}
                onChange={(e) => setFormLookingFor(e.target.value as ProjectInterest)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {PROJECT_INTERESTS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department / Branch *
              </label>
              <select
                value={formBranch}
                onChange={(e) => setFormBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Academic Year *
              </label>
              <select
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills Tag Management */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Technical & Creative Skills *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formSkillInput}
                onChange={(e) => setFormSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(formSkillInput);
                  }
                }}
                placeholder="Type a skill and hit Enter (e.g. Next.js, PyTorch)..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddSkill(formSkillInput)}
              >
                Add Skill
              </Button>
            </div>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              {formSkills.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No skills added yet. Click suggestions below or type your own.</span>
              ) : (
                formSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Tag Suggestions */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Add:</span>
              {POPULAR_SKILLS.slice(0, 10).map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => handleAddSkill(skill)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  +{skill}
                </button>
              ))}
            </div>
          </div>

          {/* Elevator Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Elevator Bio / Pitch (2-3 sentences)
            </label>
            <textarea
              rows={2}
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              placeholder="e.g. 2x hackathon winner focused on full-stack web applications and modern cloud architectures. Looking for ML devs to build an AI student assistant."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Focus Areas & Project Interests */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Ideas & Focus Areas
            </label>
            <input
              type="text"
              value={formInterests}
              onChange={(e) => setFormInterests(e.target.value)}
              placeholder="e.g. EdTech, Generative AI, Campus Robotics, FinTech micro-tools"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Contact Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contact Information *
            </label>
            <input
              type="text"
              required
              value={formContactInfo}
              onChange={(e) => setFormContactInfo(e.target.value)}
              placeholder="e.g. WhatsApp: +91 98765-XXXXX (Sample) or Telegram: @student_demo"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub Profile URL (optional)
              </label>
              <input
                type="url"
                value={formGithubUrl}
                onChange={(e) => setFormGithubUrl(e.target.value)}
                placeholder="https://github.com/yourhandle"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                LinkedIn Profile URL (optional)
              </label>
              <input
                type="url"
                value={formLinkedinUrl}
                onChange={(e) => setFormLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourhandle"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProfileId ? 'Save Changes' : 'Publish Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      {profileToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setProfileToDelete(null)}
          title="Delete Profile"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to remove <strong className="text-white">{profileToDelete.name}</strong>'s talent card from the Team Finder? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setProfileToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete}>
                Delete Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
