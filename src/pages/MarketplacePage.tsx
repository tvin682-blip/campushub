import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Phone,
  CheckCircle,
  Flag,
  Edit2,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type {
  MarketplaceItem,
  MarketplaceCategory,
  ItemCondition,
} from '../types';

const CATEGORIES: MarketplaceCategory[] = [
  'Textbooks',
  'Calculators',
  'Electronics',
  'Hostel Items',
  'Bicycles',
  'Stationery',
  'Other',
];

const CONDITIONS: { label: string; value: ItemCondition }[] = [
  { label: 'Brand New', value: 'new' },
  { label: 'Like New (Mint)', value: 'like_new' },
  { label: 'Good Condition', value: 'good' },
  { label: 'Fair Condition', value: 'fair' },
];

const PRESET_MARKETPLACE_IMAGES = [
  { label: 'Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80' },
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80' },
  { label: 'Bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80' },
  { label: 'Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80' },
  { label: 'Stationery / Tools', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=80' },
  { label: 'Hostel Gear', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80' },
];

export const MarketplacePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold'>('available');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState<MarketplaceItem | null>(null);
  const [contactModalItem, setContactModalItem] = useState<MarketplaceItem | null>(null);
  const [reportModalItem, setReportModalItem] = useState<MarketplaceItem | null>(null);
  const [reportReason, setReportReason] = useState('Misleading Price or Fake Item');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);

  // Form State for Create / Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState<number>(350);
  const [formCategory, setFormCategory] = useState<MarketplaceCategory>('Textbooks');
  const [formCondition, setFormCondition] = useState<ItemCondition>('like_new');
  const [formContact, setFormContact] = useState('');
  const [formImageUrl, setFormImageUrl] = useState(PRESET_MARKETPLACE_IMAGES[0].url);

  const loadItems = () => {
    setItems(StorageService.getMarketplace());
  };

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener('campushub_storage_updated', handleUpdate);
    return () => window.removeEventListener('campushub_storage_updated', handleUpdate);
  }, []);

  // Filtered Listings
  const filteredItems = items.filter((item) => {
    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;

    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // Condition filter
    if (selectedCondition !== 'all' && item.condition !== selectedCondition) return false;

    // Price range filter
    if (priceRange === 'under500' && item.price >= 500) return false;
    if (priceRange === '500to1500' && (item.price < 500 || item.price > 1500)) return false;
    if (priceRange === 'above1500' && item.price <= 1500) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSeller = item.sellerName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSeller) return false;
    }

    return true;
  });

  const openCreateModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDesc('');
    setFormPrice(350);
    setFormCategory('Textbooks');
    setFormCondition('like_new');
    setFormContact(user?.phone || user?.email || 'WhatsApp: +91 98765-XXXXX (Sample)');
    setFormImageUrl(PRESET_MARKETPLACE_IMAGES[0].url);
    setCreateModalOpen(true);
  };

  const openEditModal = (item: MarketplaceItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormDesc(item.description);
    setFormPrice(item.price);
    setFormCategory(item.category);
    setFormCondition(item.condition);
    setFormContact(item.sellerContact);
    setFormImageUrl(item.imageUrl || PRESET_MARKETPLACE_IMAGES[0].url);
    setCreateModalOpen(true);
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || formPrice < 0) return;

    if (editingId) {
      StorageService.updateMarketplaceItem(editingId, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        price: formPrice,
        category: formCategory,
        condition: formCondition,
        sellerContact: formContact.trim(),
        imageUrl: formImageUrl,
      });
    } else {
      StorageService.addMarketplaceItem({
        sellerId: user?.id || 'usr_student_1',
        sellerName: user?.name || 'Student Seller',
        sellerContact: formContact.trim(),
        title: formTitle.trim(),
        description: formDesc.trim(),
        price: formPrice,
        category: formCategory,
        condition: formCondition,
        imageUrl: formImageUrl,
        status: 'available',
      });
    }

    setCreateModalOpen(false);
  };

  const handleMarkSold = (id: string) => {
    StorageService.markMarketplaceSold(id);
    if (detailModalItem?.id === id) {
      setDetailModalItem(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      StorageService.deleteMarketplaceItem(id);
      if (detailModalItem?.id === id) {
        setDetailModalItem(null);
      }
    }
  };

  const handleCopyContact = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(true);
    setTimeout(() => setCopiedContact(false), 2000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalItem) return;

    StorageService.addReport({
      reporterId: user?.id || 'usr_student_1',
      targetType: 'marketplace',
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">Module 3</Badge>
            <span className="text-xs text-slate-400">Zero-Fee Peer-to-Peer Student Exchange</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Campus Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Buy and sell course textbooks, scientific calculators, bicycles, and hostel electronics directly with fellow students.
          </p>
        </div>

        <Button size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create Listing
        </Button>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Student Safety Guarantee:</strong> No online payment fees. Inspect items in person on campus (e.g. Library foyer or Cafeteria) before paying.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        {/* Availability Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'available'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available Now ({items.filter((i) => i.status === 'available').length})
            </button>
            <button
              onClick={() => setStatusFilter('sold')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'sold'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sold Items ({items.filter((i) => i.status === 'sold').length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredItems.length}</strong> listings
          </div>
        </div>

        {/* Search & Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-850">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search textbook, calculator, cycle..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category */}
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

          {/* Price Range */}
          <div>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Prices</option>
              <option value="under500">Under ₹500</option>
              <option value="500to1500">₹500 – ₹1,500</option>
              <option value="above1500">Above ₹1,500</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Conditions</option>
              {CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Product Listings Grid */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No listings found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your price filter, search terms, or create a new student listing above.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedCondition('all');
              setPriceRange('all');
              setStatusFilter('all');
            }}
            variant="outline"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOwner = user?.id === item.sellerId || isAdmin;
            const isSold = item.status === 'sold';

            return (
              <Card
                key={item.id}
                hover
                className={`flex flex-col justify-between overflow-hidden group border border-slate-800/80 ${
                  isSold ? 'opacity-60 bg-slate-950/40' : 'hover:border-emerald-500/40'
                }`}
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-48 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-4 overflow-hidden bg-slate-950">
                    <img
                      src={item.imageUrl || PRESET_MARKETPLACE_IMAGES[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="neutral" size="sm">
                        {item.category}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isSold ? (
                        <span className="text-[10px] font-bold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-full border border-slate-700">
                          SOLD OUT
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
                          ₹{item.price}
                        </span>
                      )}
                    </div>

                    {/* Condition pill */}
                    <div className="absolute bottom-2.5 left-3 text-[10px] text-slate-300 capitalize font-medium bg-black/70 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      {item.condition.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Seller: {item.sellerName}</span>
                      <span>₹{item.price}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setDetailModalItem(item)}
                    className="text-xs flex-1"
                  >
                    Details
                  </Button>

                  {!isSold && (
                    <Button
                      size="sm"
                      onClick={() => setContactModalItem(item)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                      leftIcon={<Phone className="w-3.5 h-3.5" />}
                    >
                      Contact
                    </Button>
                  )}

                  {isOwner && !isSold && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkSold(item.id)}
                      className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
                      title="Mark as sold"
                    >
                      Sold
                    </Button>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Edit listing"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isOwner && (
                    <button
                      onClick={() => setReportModalItem(item)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Report listing"
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

      {/* MODAL 1: Create or Edit Marketplace Listing */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={editingId ? 'Edit Marketplace Listing' : 'Sell Course Item / Gear'}
        description="List textbook, calculator, bicycle, or room supplies."
      >
        <form onSubmit={handleSaveListing} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Item Title
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Casio fx-991EX Calculator or C Programming Book"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Asking Price (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formPrice}
                onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as MarketplaceCategory)}
                className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Item Condition
            </label>
            <select
              value={formCondition}
              onChange={(e) => setFormCondition(e.target.value as ItemCondition)}
              className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Seller Contact Details
            </label>
            <input
              type="text"
              required
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
              placeholder="e.g. WhatsApp: +91 98765-XXXXX (Sample) or Room 314"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Photo presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Photo Thumbnail
            </label>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {PRESET_MARKETPLACE_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormImageUrl(img.url)}
                  className={`w-11 h-11 rounded-lg overflow-hidden ring-2 shrink-0 cursor-pointer ${
                    formImageUrl === img.url ? 'ring-emerald-500 scale-105' : 'ring-slate-800 opacity-60'
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
              Item Description
            </label>
            <textarea
              rows={3}
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Edition, battery life, wear and tear, or reason for selling..."
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
              {editingId ? 'Save Changes' : 'Publish Marketplace Listing'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: View Item Details */}
      <Modal
        isOpen={!!detailModalItem}
        onClose={() => setDetailModalItem(null)}
        title={detailModalItem?.title || 'Listing Details'}
        description={`Listed by ${detailModalItem?.sellerName}`}
      >
        {detailModalItem && (
          <div className="space-y-4 py-2">
            <div className="relative h-60 rounded-xl overflow-hidden bg-slate-950">
              <img
                src={detailModalItem.imageUrl || PRESET_MARKETPLACE_IMAGES[0].url}
                alt={detailModalItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="neutral" size="sm">
                  {detailModalItem.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 text-sm font-extrabold text-white bg-emerald-600 px-3 py-1 rounded-full shadow-md">
                ₹{detailModalItem.price}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Item Description
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {detailModalItem.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Condition</span>
                <span className="text-white font-semibold capitalize">
                  {detailModalItem.condition.replace('_', ' ')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Listing Status</span>
                <span className="text-white font-semibold capitalize">
                  {detailModalItem.status}
                </span>
              </div>
            </div>

            {/* Seller Contact Box */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>Direct Seller Contact</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyContact(detailModalItem.sellerContact)}
                  className="text-emerald-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedContact ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedContact ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-white font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                {detailModalItem.sellerContact}
              </p>
            </div>

            <div className="flex justify-end pt-2">
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

      {/* MODAL 3: Direct Contact Seller Modal */}
      <Modal
        isOpen={!!contactModalItem}
        onClose={() => setContactModalItem(null)}
        title="Contact Seller"
        description={`Reach out to ${contactModalItem?.sellerName} regarding "${contactModalItem?.title}"`}
      >
        {contactModalItem && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-bold">Price: ₹{contactModalItem.price}</span>
                <Badge variant="neutral" size="sm">{contactModalItem.category}</Badge>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Verified Seller Contact Info:</span>
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-white">
                  <span>{contactModalItem.sellerContact}</span>
                  <button
                    onClick={() => handleCopyContact(contactModalItem.sellerContact)}
                    className="text-emerald-400 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
                  >
                    {copiedContact ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedContact ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              💡 <strong>Tip:</strong> Send a polite message mentioning that you found their listing on CampusHub. Arrange to meet in a public campus area (like Central Library or Main Mess) to inspect the item.
            </p>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setContactModalItem(null)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: Report Listing */}
      <Modal
        isOpen={!!reportModalItem}
        onClose={() => setReportModalItem(null)}
        title="Report Marketplace Listing"
        description="Notify university moderators of a policy violation or suspicious listing."
      >
        {reportSuccess ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Report Submitted</h4>
            <p className="text-xs text-slate-400">
              Thank you. The listing will be reviewed by campus administrators.
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
                <option value="Misleading Price or Fake Item">Misleading Price or Fake Item</option>
                <option value="Duplicate or Spam Post">Duplicate or Spam Post</option>
                <option value="Inappropriate or Prohibited Item">Inappropriate or Prohibited Item</option>
                <option value="Item Already Sold">Item Already Sold</option>
                <option value="Unreachable Seller">Unreachable Seller</option>
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
