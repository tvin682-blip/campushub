import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  CheckCircle,
  Flag,
  Edit2,
  Trash2,
  Phone,
} from 'lucide-react';

import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { UNIVERSITY_CONFIG } from '../config/university';
import type {
  LostFoundItem,
  LostFoundType,
  LostFoundCategory,
} from '../types';

const CATEGORIES: LostFoundCategory[] = [
  'ID Card',
  'Wallet',
  'Electronics',
  'Books',
  'Keys',
  'Bags',
  'Clothing',
  'Other',
];

const PRESET_IMAGES = [
  { label: 'Student ID', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&auto=format&fit=crop&q=80' },
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80' },
  { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80' },
  { label: 'Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80' },
];

export const LostFoundPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'resolved'>('all');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState<LostFoundItem | null>(null);
  const [reportModalItem, setReportModalItem] = useState<LostFoundItem | null>(null);
  const [reportReason, setReportReason] = useState('Duplicate or Spam');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Form states for Create/Edit
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formType, setFormType] = useState<LostFoundType>('lost');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<LostFoundCategory>('ID Card');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formContact, setFormContact] = useState('');
  const [formImageUrl, setFormImageUrl] = useState(PRESET_IMAGES[0].url);
  const [formDesc, setFormDesc] = useState('');

  const loadItems = () => {
    setItems(StorageService.getLostFound());
  };

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener('campushub_storage_updated', handleUpdate);
    return () => window.removeEventListener('campushub_storage_updated', handleUpdate);
  }, []);

  // Filtered Items logic
  const filteredItems = items.filter((item) => {
    // Type filter
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    // Status filter
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    // Location filter
    if (selectedLocation !== 'all' && !item.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchUser = item.userName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchUser) return false;
    }
    return true;
  });

  // Open Create Modal
  const openCreateModal = (defaultType: LostFoundType = 'lost') => {
    setEditingItemId(null);
    setFormType(defaultType);
    setFormTitle('');
    setFormCategory('ID Card');
    setFormLocation('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormContact(user?.phone || user?.email || '');
    setFormImageUrl(PRESET_IMAGES[0].url);
    setFormDesc('');
    setCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: LostFoundItem) => {
    setEditingItemId(item.id);
    setFormType(item.type);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormLocation(item.location);
    setFormDate(item.date);
    setFormContact(item.contactInfo);
    setFormImageUrl(item.imageUrl || PRESET_IMAGES[0].url);
    setFormDesc(item.description);
    setCreateModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formLocation.trim()) return;

    if (editingItemId) {
      StorageService.updateLostFoundItem(editingItemId, {
        type: formType,
        title: formTitle.trim(),
        category: formCategory,
        location: formLocation.trim(),
        date: formDate,
        contactInfo: formContact.trim(),
        imageUrl: formImageUrl,
        description: formDesc.trim(),
      });
    } else {
      StorageService.addLostFoundItem({
        userId: user?.id || 'usr_student_1',
        userName: user?.name || 'Student',
        userEmail: user?.email || UNIVERSITY_CONFIG.demoStudent.email,
        type: formType,
        title: formTitle.trim(),
        category: formCategory,
        location: formLocation.trim(),
        date: formDate,
        contactInfo: formContact.trim(),
        imageUrl: formImageUrl,
        description: formDesc.trim(),
        status: 'open',
      });
    }

    setCreateModalOpen(false);
  };

  const handleResolve = (id: string) => {
    StorageService.markLostFoundResolved(id);
    if (detailModalItem?.id === id) {
      setDetailModalItem(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      StorageService.deleteLostFoundItem(id);
      if (detailModalItem?.id === id) {
        setDetailModalItem(null);
      }
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalItem) return;

    StorageService.addReport({
      reporterId: user?.id || 'usr_student_1',
      targetType: 'lost_found',
      targetId: reportModalItem.id,
      reason: reportReason,
      status: 'pending',
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalItem(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">Module 1</Badge>
            <span className="text-xs text-slate-400">Campus Recovery & Reunification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Lost & Found Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Report misplaced student belongings or browse found property across campus departments and buildings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="danger"
            onClick={() => openCreateModal('lost')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Report Lost Item
          </Button>
          <Button
            size="sm"
            onClick={() => openCreateModal('found')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Post Found Item
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        {/* Type & Status Switchers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Lost vs Found tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setSelectedType('lost')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedType === 'lost'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lost ({items.filter((i) => i.type === 'lost').length})
            </button>
            <button
              onClick={() => setSelectedType('found')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedType === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Found ({items.filter((i) => i.type === 'found').length})
            </button>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="open">Active / Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Search & Category Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-850">
          {/* Keyword Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword, ID number, title..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Campus Locations</option>
              <option value="Library">Central Library</option>
              <option value="Lab">Academic Labs</option>
              <option value="Cafeteria">Cafeteria / Food Court</option>
              <option value="Sports">Sports Complex</option>
              <option value="Hostel">Hostel Blocks</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No items found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Categories", or post a new lost/found report.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedCategory('all');
              setSelectedLocation('all');
              setSelectedStatus('all');
            }}
            variant="outline"
          >
            Clear All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isOwner = user?.id === item.userId || isAdmin;
            const isResolved = item.status === 'resolved';

            return (
              <Card
                key={item.id}
                hover
                className={`flex flex-col justify-between overflow-hidden group border ${
                  item.type === 'lost' ? 'hover:border-rose-500/40' : 'hover:border-emerald-500/40'
                } ${isResolved ? 'opacity-70 bg-slate-950/40' : ''}`}
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-44 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-4 overflow-hidden bg-slate-950">
                    <img
                      src={item.imageUrl || PRESET_IMAGES[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge variant={item.type === 'lost' ? 'danger' : 'success'} size="sm">
                        {item.type.toUpperCase()}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {item.category}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isResolved ? (
                        <Badge variant="success" size="sm">
                          ✓ Resolved
                        </Badge>
                      ) : (
                        <Badge variant="primary" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>

                    {/* Date Tag */}
                    <div className="absolute bottom-2.5 left-3 text-[11px] text-slate-300 flex items-center gap-1 font-medium bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  {/* Title and details */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setDetailModalItem(item)}
                    className="text-xs flex-1"
                  >
                    View Details
                  </Button>

                  {isOwner && !isResolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(item.id)}
                      className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      title="Mark as resolved"
                    >
                      Resolve
                    </Button>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit listing"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isOwner && (
                    <button
                      onClick={() => setReportModalItem(item)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Report this listing"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Create or Edit Item */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={editingItemId ? 'Edit Listing' : formType === 'lost' ? 'Report Lost Item' : 'Post Found Item'}
        description="Provide accurate location and contact info to speed up recovery."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Report Category
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFormType('lost')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  formType === 'lost' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🔴 Lost Item
              </button>
              <button
                type="button"
                onClick={() => setFormType('found')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  formType === 'found' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🟢 Found Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Item Title
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. University ID Card or Casio Calculator"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as LostFoundCategory)}
                className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Location on Campus
            </label>
            <input
              type="text"
              required
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="e.g. Central Library 2nd Floor or Cafeteria"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contact Information
            </label>
            <input
              type="text"
              required
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
              placeholder="e.g. WhatsApp: +91 98765-XXXXX (Sample) or Library Helpdesk"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Photo presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Photo Thumbnail
            </label>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {PRESET_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormImageUrl(img.url)}
                  className={`w-11 h-11 rounded-lg overflow-hidden ring-2 shrink-0 cursor-pointer ${
                    formImageUrl === img.url ? 'ring-indigo-500 scale-105' : 'ring-slate-800 opacity-60'
                  }`}
                  title={img.label}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Identifying Marks
            </label>
            <textarea
              rows={3}
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Provide color, brand, stickers, serial number, or exact spot it was left..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingItemId ? 'Save Changes' : 'Publish Listing'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Item Details & Contact */}
      <Modal
        isOpen={!!detailModalItem}
        onClose={() => setDetailModalItem(null)}
        title={detailModalItem?.title || 'Item Details'}
        description={`Reported by ${detailModalItem?.userName} • ${detailModalItem?.date}`}
      >
        {detailModalItem && (
          <div className="space-y-4 py-2">
            <div className="relative h-56 rounded-xl overflow-hidden bg-slate-950">
              <img
                src={detailModalItem.imageUrl || PRESET_IMAGES[0].url}
                alt={detailModalItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <Badge variant={detailModalItem.type === 'lost' ? 'danger' : 'success'} size="sm">
                  {detailModalItem.type.toUpperCase()}
                </Badge>
                <Badge variant="neutral" size="sm">
                  {detailModalItem.category}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Full Description
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {detailModalItem.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Location</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {detailModalItem.location}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Status</span>
                <span className="text-white font-semibold capitalize">
                  {detailModalItem.status}
                </span>
              </div>
            </div>

            {/* Contact Box */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Phone className="w-4 h-4" />
                <span>Contact & Handover Details</span>
              </div>
              <p className="text-xs text-slate-200 font-medium">
                {detailModalItem.contactInfo}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  const itm = detailModalItem;
                  setDetailModalItem(null);
                  setReportModalItem(itm);
                }}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Inappropriate Post</span>
              </button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailModalItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: Report Listing */}
      <Modal
        isOpen={!!reportModalItem}
        onClose={() => setReportModalItem(null)}
        title="Report Campus Listing"
        description="Flag this post for administrator moderation."
      >
        {reportSuccess ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Report Submitted</h4>
            <p className="text-xs text-slate-400">
              Thank you for keeping CampusHub clean and safe. Our student moderation team has received the report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reason for Reporting
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Duplicate or Spam">Duplicate or Spam</option>
                <option value="False Information">False Information</option>
                <option value="Already Claimed / Resolved">Already Claimed / Resolved</option>
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Wrong Contact Details">Wrong Contact Details</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReportModalItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="danger">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
