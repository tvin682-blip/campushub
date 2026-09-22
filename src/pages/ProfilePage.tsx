import React, { useState } from 'react';
import {
  Save,
  Plus,
  X,
  Phone,
  CheckCircle2,
  Code2,
  Globe,
} from 'lucide-react';

import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [year, setYear] = useState(user?.year || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_OPTIONS[0]);
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      university,
      branch,
      year,
      bio,
      avatarUrl,
      skills,
      githubUrl,
      linkedinUrl,
      phone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={user?.role === 'admin' ? 'warning' : 'primary'} size="sm">
              {user?.role === 'admin' ? '🛡️ Administrator Profile' : '🎓 Verified Student'}
            </Badge>
            <span className="text-xs text-slate-400">Account Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control your student public card, team matching skills, and contact channels.
          </p>
        </div>

        {/* Quick Persona Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={loginAsDemoStudent}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              user?.role === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Student
          </button>
          <button
            onClick={loginAsDemoAdmin}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              user?.role === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Admin
          </button>
        </div>
      </div>

      {/* Save Notification */}
      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully! Your profile card is now up-to-date.</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card & Avatar */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-white mb-4">Personal Identity</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-xl"
              />
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Choose Photo Preset
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  {AVATAR_OPTIONS.map((av, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAvatarUrl(av)}
                      className={`w-9 h-9 rounded-xl overflow-hidden ring-2 transition-all cursor-pointer ${
                        avatarUrl === av ? 'ring-indigo-500 scale-105' : 'ring-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Or provide custom image link:
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full sm:max-w-md px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950/60 border border-slate-800/60 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                University Name
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                About / Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell peers what you are working on or what you hope to build..."
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* Skills Tag Management */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Skills & Specializations</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These tags appear on your profile in the Team Finder module.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 min-h-10 items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-500">No skills added yet. Add one below!</span>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="e.g. Flutter, GraphQL, Docker, Next.js..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSkill}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Tag
            </Button>
          </div>
        </Card>

        {/* Contact Links */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Collaboration & Social Links</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Allow teammates and marketplace buyers to reach you easily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-400" />
                <span>GitHub Profile</span>
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>LinkedIn Profile</span>
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>


            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>WhatsApp / Phone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765-XXXXX (Sample)"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
