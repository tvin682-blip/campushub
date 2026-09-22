export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  university: string;
  branch: string;
  year: string;
  avatarUrl?: string;
  bio?: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  phone?: string;
  createdAt: string;
}


export type LostFoundType = 'lost' | 'found';
export type LostFoundCategory = 
  | 'ID Card'
  | 'Wallet'
  | 'Electronics'
  | 'Books'
  | 'Keys'
  | 'Bags'
  | 'Clothing'
  | 'Other';

export interface LostFoundItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  date: string;
  imageUrl?: string;
  contactInfo: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export type AssignmentPriority = 'low' | 'medium' | 'high';
export type AssignmentStatus = 'pending' | 'submitted';

export interface Assignment {
  id: string;
  userId: string;
  subject: string;
  title: string;
  dueDate: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  notes?: string;
  createdAt: string;
}

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair';
export type MarketplaceCategory = 
  | 'Textbooks'
  | 'Calculators'
  | 'Electronics'
  | 'Hostel Items'
  | 'Bicycles'
  | 'Stationery'
  | 'Other';

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerContact: string;
  title: string;
  description: string;
  price: number;
  condition: ItemCondition;
  category: MarketplaceCategory;
  imageUrl?: string;
  status: 'available' | 'sold';
  createdAt: string;
}

export type ProjectInterest = 
  | 'Hackathon'
  | 'College Project'
  | 'Competition'
  | 'Startup'
  | 'Open Source'
  | 'Other';

export interface TeamProfile {
  id: string;
  userId: string;
  name: string;
  branch: string;
  year: string;
  skills: string[];
  interests: string;
  githubUrl?: string;
  linkedinUrl?: string;
  lookingFor: ProjectInterest;
  contactInfo: string;
  bio?: string;
  createdAt: string;
}

export interface AttendanceSubject {
  id: string;
  userId: string;
  subject: string;
  attendedClasses: number;
  totalClasses: number;
  updatedAt: string;
}

export type ComplaintCategory = 
  | 'Hostel'
  | 'Mess'
  | 'Classroom'
  | 'Wi-Fi'
  | 'Electricity'
  | 'Cleanliness'
  | 'Library'
  | 'Laboratory'
  | 'Transport'
  | 'Administration'
  | 'Other';

export type ComplaintStatus = 'Submitted' | 'In Review' | 'Resolved';

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  title: string;
  category: ComplaintCategory;
  location: string;
  description: string;
  imageUrl?: string;
  status: ComplaintStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type WikiCategory = 
  | 'Academics'
  | 'Exams'
  | 'Departments'
  | 'Faculty'
  | 'Hostel'
  | 'Library'
  | 'Clubs'
  | 'Campus Facilities'
  | 'Important Offices'
  | 'Freshers Guide'
  | 'FAQs'
  | 'General Student Tips';

export interface WikiArticle {
  id: string;
  title: string;
  category: WikiCategory;
  shortDescription: string;
  content: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: 'lost_found' | 'marketplace' | 'user';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed';
  createdAt: string;
}
