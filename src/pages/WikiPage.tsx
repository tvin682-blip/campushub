import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Bookmark,
  ThumbsUp,
  Clock,
  User,
  Tag,
  X,
  Edit2,
  Trash2,
  HelpCircle,
  Share2,
  Check,
  Compass,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type { WikiArticle, WikiCategory } from '../types';

const WIKI_CATEGORIES: { name: WikiCategory; icon: string; description: string }[] = [
  { name: 'Freshers Guide', icon: '🎒', description: 'Essential survival tips, Wi-Fi keys, curfews & orientation' },
  { name: 'Exams', icon: '📝', description: 'Attendance rules, hall tickets, previous year question vaults' },
  { name: 'Academics', icon: '🎓', description: 'Grading scales, credit requirements & CGPA calculators' },
  { name: 'Library', icon: '📚', description: 'RFID borrowing, 24/7 study halls & digital paper repos' },
  { name: 'Hostel', icon: '🏢', description: 'Room rules, curfew relaxations, mess rebates & laundry' },
  { name: 'Clubs', icon: '🚀', description: 'Technical societies, cultural fests & recruitment guidelines' },
  { name: 'Campus Facilities', icon: '☕', description: 'Canteens, gyms, medical center & student convenience stores' },
  { name: 'Departments', icon: '🏛️', description: 'Head of Departments, staff rooms & lab locations' },
  { name: 'Important Offices', icon: '📑', description: 'Registrar, scholarship desk, accounts & exam controllers' },
  { name: 'FAQs', icon: '❓', description: 'Frequently asked student questions answered in plain language' },
  { name: 'General Student Tips', icon: '💡', description: 'Budgeting, laptop advice, local city transit & hackathon prep' },
  { name: 'Faculty', icon: '👨‍🏫', description: 'Consultation hours, faculty advisors & project mentors' },
];

export const WikiPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [articles, setArticles] = useState<WikiArticle[]>([]);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals & Reader state
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<WikiArticle | null>(null);

  // Bookmarks & Likes (local state)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_wiki_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_wiki_likes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [copiedLink, setCopiedLink] = useState(false);

  // Form State for creating/editing article
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<WikiCategory>('Freshers Guide');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formError, setFormError] = useState('');

  const loadArticles = () => {
    const list = StorageService.getWikiArticles();
    setArticles(list);
  };

  useEffect(() => {
    loadArticles();
    const handleStorageUpdate = () => loadArticles();
    window.addEventListener('campushub_storage_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('campushub_storage_updated', handleStorageUpdate);
    };
  }, []);

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter((item) => item !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('campushub_wiki_bookmarks', JSON.stringify(updated));
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (likedIds.includes(id)) {
      updated = likedIds.filter((item) => item !== id);
    } else {
      updated = [...likedIds, id];
    }
    setLikedIds(updated);
    localStorage.setItem('campushub_wiki_likes', JSON.stringify(updated));
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('Freshers Guide');
    setFormShortDescription('');
    setFormContent('');
    setFormTags(['Campus Life', 'Survival Guide']);
    setFormTagInput('');
    setFormAuthor(user?.name || 'Student Contributor');
    setFormError('');
    setEditingArticleId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (art: WikiArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticleId(art.id);
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormShortDescription(art.shortDescription);
    setFormContent(art.content);
    setFormTags(art.tags || []);
    setFormTagInput('');
    setFormAuthor(art.author);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!formTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setFormTags([...formTags, trimmed]);
    }
    setFormTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmitArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Article title is required.');
      return;
    }
    if (!formShortDescription.trim()) {
      setFormError('Short summary description is required.');
      return;
    }
    if (!formContent.trim()) {
      setFormError('Article content / guide instructions are required.');
      return;
    }

    if (editingArticleId) {
      StorageService.updateWikiArticle(editingArticleId, {
        title: formTitle.trim(),
        category: formCategory,
        shortDescription: formShortDescription.trim(),
        content: formContent.trim(),
        tags: formTags,
        author: formAuthor.trim() || user?.name || 'Student Contributor',
      });
    } else {
      StorageService.addWikiArticle({
        title: formTitle.trim(),
        category: formCategory,
        shortDescription: formShortDescription.trim(),
        content: formContent.trim(),
        author: formAuthor.trim() || user?.name || 'Student Contributor',
        tags: formTags,
        isPublished: true,
      });
    }

    setIsCreateModalOpen(false);
    loadArticles();
  };

  const confirmDelete = () => {
    if (!articleToDelete) return;
    StorageService.deleteWikiArticle(articleToDelete.id);
    setArticleToDelete(null);
    if (selectedArticle?.id === articleToDelete.id) {
      setIsReaderModalOpen(false);
      setSelectedArticle(null);
    }
    loadArticles();
  };

  const openReader = (art: WikiArticle) => {
    setSelectedArticle(art);
    setCopiedLink(false);
    setIsReaderModalOpen(true);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Collect all unique tags
  const allTags = Array.from(
    new Set(articles.flatMap((a) => a.tags || []))
  ).slice(0, 12);

  // Filter articles
  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      searchQuery === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.tags && art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesTag = !selectedTag || (art.tags && art.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

    return matchesSearch && matchesCategory && matchesTag;
  });

  // Calculate read time
  const getReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 180);
    return `${minutes} min read`;
  };

  // Render markdown with nice simple styles
  const renderFormattedContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-indigo-300 mt-4 mb-1.5">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-slate-100 mt-4 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="text-sm text-slate-300 ml-4 list-disc mb-1 leading-relaxed">
            {line.substring(2)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-sm text-slate-300 leading-relaxed mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                Module 7: Knowledge Base
              </Badge>
              <Badge variant="success" size="sm">
                <Compass className="w-3.5 h-3.5 mr-1" />
                Peer-Verified Guides
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              College Survival Wiki
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Crowdsourced guides on exam strategies, hostel rules, lab locations, Wi-Fi credentials, and campus hacks that seniors wish they knew earlier.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={openCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 text-white border-0"
            >
              Write a Guide
            </Button>
          </div>
        </div>

        {/* Quick Category Jump Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Popular Vaults:</span>
          {WIKI_CATEGORIES.slice(0, 6).map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)}
              className={`text-xs px-2.5 py-1 rounded-md shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.name
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter Panel */}
      <Card className="p-4 sm:p-5 space-y-4 bg-slate-900/80 border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search wiki articles, exams, hostel rules, labs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">Vault: All Categories ({articles.length})</option>
              {WIKI_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Popular Tags Filter */}
        {allTags.length > 0 && (
          <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              Tags:
            </span>
            {allTags.map((tag) => {
              const isActive = selectedTag?.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isActive ? null : tag)}
                  className={`text-xs px-2 py-0.5 rounded transition-all font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}

            {(selectedTag || selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="text-xs px-2 py-0.5 rounded text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 shrink-0 font-medium ml-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <Card className="text-center py-16 px-4 bg-slate-900/40 border-dashed border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No wiki guides found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            We couldn't find any guides matching your search terms. Know the answer? Help fellow students by contributing a guide.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTag(null);
                setSearchQuery('');
              }}
            >
              Reset Search
            </Button>
            <Button variant="primary" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
              Contribute Guide
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const isBookmarked = bookmarkedIds.includes(art.id);
            const isLiked = likedIds.includes(art.id);
            const canManage = isAdmin || user?.name === art.author;

            return (
              <Card
                key={art.id}
                onClick={() => openReader(art)}
                className="group relative flex flex-col justify-between p-5 bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-blue-500/40 transition-all duration-300 shadow-lg cursor-pointer"
              >
                <div>
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="primary" size="sm">
                      {art.category}
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {getReadTime(art.content)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 mb-2 leading-snug">
                    {art.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                    {art.shortDescription}
                  </p>

                  {/* Tags */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {art.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
                        >
                          #{tag}
                        </span>
                      ))}
                      {art.tags.length > 3 && (
                        <span className="text-[10px] px-1 py-0.5 text-slate-500">
                          +{art.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Author & Bookmark */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 line-clamp-1">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{art.author}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleToggleLike(art.id, e)}
                      className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                        isLiked ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-blue-400' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleToggleBookmark(art.id, e)}
                      className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                        isBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    {canManage && (
                      <>
                        <button
                          onClick={(e) => openEditModal(art, e)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Guide"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setArticleToDelete(art);
                          }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Guide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ARTICLE READER MODAL */}
      {selectedArticle && (
        <Modal
          isOpen={isReaderModalOpen}
          onClose={() => setIsReaderModalOpen(false)}
          title={selectedArticle.title}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm">
                  {selectedArticle.category}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  {selectedArticle.author}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {getReadTime(selectedArticle.content)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => handleToggleBookmark(selectedArticle.id, e)}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded border transition-colors ${
                    bookmarkedIds.includes(selectedArticle.id)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(selectedArticle.id) ? 'fill-amber-400' : ''}`} />
                  <span>{bookmarkedIds.includes(selectedArticle.id) ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Formatted Content */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              {renderFormattedContent(selectedArticle.content)}
            </div>

            {/* Tags footer */}
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs text-slate-400 mr-1">Related Topics:</span>
                {selectedArticle.tags.map((tag, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => setIsReaderModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT ARTICLE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingArticleId ? 'Edit Wiki Guide' : 'Contribute a Campus Guide'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitArticle} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Guide Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Complete Guide to 24/7 Library Study Rooms & Bookings"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category Vault *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as WikiCategory)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {WIKI_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Author Name / Club *
              </label>
              <input
                type="text"
                required
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="e.g. Student Demo or Coding Club"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Summary Description (1-2 sentences) *
            </label>
            <input
              type="text"
              required
              value={formShortDescription}
              onChange={(e) => setFormShortDescription(e.target.value)}
              placeholder="Brief preview of what students will learn from this guide..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Guide Content (Markdown Supported) *
            </label>
            <textarea
              rows={6}
              required
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="### Heading&#10;* Key bullet point 1&#10;* Key bullet point 2&#10;&#10;Detailed explanation and advice for students..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tags manager */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Topic Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formTagInput}
                onChange={(e) => setFormTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(formTagInput);
                  }
                }}
                placeholder="Type tag and press Enter (e.g. Library, Study Rooms)..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Button type="button" variant="secondary" size="sm" onClick={() => handleAddTag(formTagInput)}>
                Add Tag
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              {formTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30"
                >
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-500 border-0">
              {editingArticleId ? 'Save Changes' : 'Publish Guide'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      {articleToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setArticleToDelete(null)}
          title="Delete Article"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <strong className="text-white">{articleToDelete.title}</strong>? This guide will be removed from the public wiki.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setArticleToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete}>
                Delete Guide
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
