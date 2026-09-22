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
import { UNIVERSITY_CONFIG } from '../config/university';

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_1',
    userId: 'usr_student_1',
    subject: 'Data Structures & Algorithms',
    title: 'Doubly Linked List Implementation & Benchmark [Sample]',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), // Due today in 6 hours
    priority: 'high',
    status: 'pending',
    notes: 'Implement insertion, deletion, and reverse traversal in C++ with unit tests.',
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'asg_2',
    userId: 'usr_student_1',
    subject: 'Operating Systems',
    title: 'Process Scheduling Simulation (Round Robin & SJF) [Sample]',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(), // Due tomorrow
    priority: 'high',
    status: 'pending',
    notes: 'Compare average waiting time and turnaround time metrics with Gantt charts.',
    createdAt: '2026-09-19T14:30:00Z',
  },
  {
    id: 'asg_3',
    userId: 'usr_student_1',
    subject: 'Database Management Systems',
    title: 'SQL Normalization & B+ Tree Indexing Report [Sample]',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // In 3 days
    priority: 'medium',
    status: 'pending',
    notes: 'Complete 3NF and BCNF decomposition proofs for sample university schema.',
    createdAt: '2026-09-18T09:15:00Z',
  },
  {
    id: 'asg_4',
    userId: 'usr_student_1',
    subject: 'Computer Networks',
    title: 'Wireshark Packet Analysis on TCP 3-Way Handshake [Sample]',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // Overdue by 14 hours
    priority: 'high',
    status: 'pending',
    notes: 'Capture SYN, SYN-ACK, and ACK packets and highlight sequence numbering.',
    createdAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'asg_5',
    userId: 'usr_student_1',
    subject: 'Discrete Mathematics',
    title: 'Graph Theory & Dijkstra Algorithm Proofs [Sample]',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    priority: 'low',
    status: 'submitted',
    notes: 'Submitted on campus portal ahead of deadline.',
    createdAt: '2026-09-14T08:00:00Z',
  },
];

export const SEED_ATTENDANCE: AttendanceSubject[] = [
  {
    id: 'att_1',
    userId: 'usr_student_1',
    subject: 'Operating Systems',
    attendedClasses: 14,
    totalClasses: 20, // 70.0% - In danger zone (<75%)
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'att_2',
    userId: 'usr_student_1',
    subject: 'Data Structures & Algorithms',
    attendedClasses: 22,
    totalClasses: 24, // 91.7% - Safe
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'att_3',
    userId: 'usr_student_1',
    subject: 'Database Management Systems',
    attendedClasses: 15,
    totalClasses: 20, // 75.0% - Exact border line
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'att_4',
    userId: 'usr_student_1',
    subject: 'Theory of Computation',
    attendedClasses: 11,
    totalClasses: 18, // 61.1% - Critical danger (<75%)
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'att_5',
    userId: 'usr_student_1',
    subject: 'Computer Networks',
    attendedClasses: 19,
    totalClasses: 22, // 86.4% - Safe
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'lf_1',
    userId: 'usr_student_2',
    userName: 'Rohan Sharma',
    userEmail: `rohan.s@${UNIVERSITY_CONFIG.domain}`,
    type: 'lost',
    title: 'Blue RFID Campus ID Card [Sample]',
    description: 'Lost near Ramanujan Central Library 2nd floor reading hall. Name: Rohan Sharma, CSE Dept.',
    category: 'ID Card',
    location: 'Central Library, 2nd Floor',
    date: '2026-09-22',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400&auto=format&fit=crop&q=80',
    contactInfo: 'Campus Helpdesk / Telegram: @helpdesk_desk (Sample)',
    status: 'open',
    createdAt: '2026-09-22T14:00:00Z',
  },
  {
    id: 'lf_2',
    userId: 'usr_student_3',
    userName: 'Ananya Verma',
    userEmail: `ananya.v@${UNIVERSITY_CONFIG.domain}`,
    type: 'found',
    title: 'Casio Scientific Calculator (fx-991CW) [Sample]',
    description: 'Found on desk 14 in Electronics Lab 2 after the 3 PM practical batch.',
    category: 'Electronics',
    location: 'VLSI Lab, Academic Block 3',
    date: '2026-09-22',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&auto=format&fit=crop&q=80',
    contactInfo: 'Handed over to VLSI Lab Assistant Desk (Sample)',
    status: 'open',
    createdAt: '2026-09-22T16:30:00Z',
  },
  {
    id: 'lf_3',
    userId: 'usr_student_1',
    userName: UNIVERSITY_CONFIG.demoStudent.name,
    userEmail: UNIVERSITY_CONFIG.demoStudent.email,
    type: 'lost',
    title: 'Black Leather Wallet with Student Metro Pass [Sample]',
    description: 'Misplaced around the campus cafeteria food court during lunch rush.',
    category: 'Wallet',
    location: 'Main Cafeteria / Food Court',
    date: '2026-09-21',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=80',
    contactInfo: `Telegram: @student_demo (Sample Contact)`,
    status: 'open',
    createdAt: '2026-09-21T13:15:00Z',
  },
  {
    id: 'lf_4',
    userId: 'usr_student_4',
    userName: 'Kabir Patel',
    userEmail: `kabir.p@${UNIVERSITY_CONFIG.domain}`,
    type: 'found',
    title: 'Milton Stainless Steel Blue Water Bottle [Sample]',
    description: 'Left on the bench near Basketball Court after evening practice.',
    category: 'Other',
    location: 'Sports Complex / Basketball Court',
    date: '2026-09-20',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
    contactInfo: 'Sports Complex Security Desk (Sample)',
    status: 'resolved',
    createdAt: '2026-09-20T18:45:00Z',
  },
];

export const SEED_MARKETPLACE: MarketplaceItem[] = [
  {
    id: 'mkt_1',
    sellerId: 'usr_student_4',
    sellerName: 'Kabir Patel',
    sellerContact: 'Telegram: @kabir_dev or Campus Hostel Desk (Sample)',
    title: 'Data Structures Using C — Reema Thareja (2nd Ed) [Sample]',
    description: 'Clean textbook in mint condition. No highlighted markings. Perfect for 2nd and 3rd year CSE/IT students.',
    price: 320,
    condition: 'like_new',
    category: 'Textbooks',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    status: 'available',
    createdAt: '2026-09-21T11:00:00Z',
  },
  {
    id: 'mkt_2',
    sellerId: 'usr_student_3',
    sellerName: 'Ananya Verma',
    sellerContact: `Email: ananya.v@${UNIVERSITY_CONFIG.domain} (Sample)`,
    title: 'Casio fx-991EX ClassWiz Calculator [Sample]',
    description: 'Original solar powered calculator with matrix, calculus, and polynomial equation solvers. Battery 100%.',
    price: 650,
    condition: 'good',
    category: 'Calculators',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&auto=format&fit=crop&q=80',
    status: 'available',
    createdAt: '2026-09-22T09:30:00Z',
  },
  {
    id: 'mkt_3',
    sellerId: 'usr_student_2',
    sellerName: 'Rohan Sharma',
    sellerContact: 'Hostel Block A Desk / Telegram: @rohan_eng (Sample)',
    title: 'Hercules Roadeo 21-Speed Gear Bicycle [Sample]',
    description: 'Great campus cycle with front suspension and dual disc brakes. Moving out of hostel, need to sell quickly.',
    price: 3800,
    condition: 'good',
    category: 'Bicycles',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&auto=format&fit=crop&q=80',
    status: 'available',
    createdAt: '2026-09-20T16:00:00Z',
  },
  {
    id: 'mkt_4',
    sellerId: 'usr_student_5',
    sellerName: 'Priya Nair',
    sellerContact: 'Telegram: @priya_tech or WhatsApp: +91 98765-XXXXX (Sample)',
    title: 'Cosmic Byte RGB Mechanical Keyboard (Red Switches) [Sample]',
    description: 'Tenkeyless compact mechanical keyboard. Quiet red switches, great for late night hostel coding sessions.',
    price: 1200,
    condition: 'like_new',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
    status: 'available',
    createdAt: '2026-09-18T10:00:00Z',
  },
];

export const SEED_TEAM_PROFILES: TeamProfile[] = [
  {
    id: 'tp_1',
    userId: 'usr_student_3',
    name: 'Ananya Verma',
    branch: 'Information Technology',
    year: '3rd Year',
    skills: ['UI/UX Design', 'Figma', 'React', 'Tailwind CSS', 'User Research'],
    interests: 'Building intuitive EdTech, accessible interfaces, and design systems.',
    githubUrl: 'https://github.com/ananya-designs',
    linkedinUrl: 'https://linkedin.com/in/ananya-verma-ui',
    lookingFor: 'Hackathon',
    contactInfo: `Email: ananya.v@${UNIVERSITY_CONFIG.domain} (Sample)`,
    bio: 'Award-winning designer with 2 national hackathon wins. Looking for backend/ML devs for Smart India Hackathon 2026.',
    createdAt: '2026-09-18T12:00:00Z',
  },
  {
    id: 'tp_2',
    userId: 'usr_student_4',
    name: 'Kabir Patel',
    branch: 'Computer Science & AI',
    year: '4th Year',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'FastAPI', 'Data Science'],
    interests: 'Natural Language Processing, Computer Vision, Agentic AI architectures.',
    githubUrl: 'https://github.com/kabir-ai-labs',
    linkedinUrl: 'https://linkedin.com/in/kabir-patel-ml',
    lookingFor: 'Startup',
    contactInfo: 'Telegram: @kabir_ml_dev (Sample)',
    bio: 'Published paper in IEEE student conference. Seeking full-stack frontend engineer to co-found a campus micro-SaaS.',
    createdAt: '2026-09-15T15:00:00Z',
  },
  {
    id: 'tp_3',
    userId: 'usr_student_5',
    name: 'Priya Nair',
    branch: 'Computer Science',
    year: '2nd Year',
    skills: ['Cybersecurity', 'Linux', 'Python', 'Networking', 'Docker'],
    interests: 'Capture The Flag (CTF) challenges, network security, penetration testing.',
    githubUrl: 'https://github.com/priyanair-sec',
    linkedinUrl: 'https://linkedin.com/in/priya-nair-cyber',
    lookingFor: 'Competition',
    contactInfo: 'Telegram: @priya_cyber or WhatsApp: +91 98765-XXXXX (Sample)',
    bio: 'Active member of Campus Ethical Hacking Club. Looking for 2 teammates for the Inter-College Cyber Defense Contest.',
    createdAt: '2026-09-20T10:30:00Z',
  },
  {
    id: 'tp_4',
    userId: 'usr_student_2',
    name: 'Rohan Sharma',
    branch: 'Computer Science & Eng',
    year: '3rd Year',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'AWS'],
    interests: 'High-concurrency backend systems, distributed databases, fintech.',
    githubUrl: 'https://github.com/rohan-sharma-backend',
    linkedinUrl: 'https://linkedin.com/in/rohan-sharma-eng',
    lookingFor: 'College Project',
    contactInfo: `Email: rohan.s@${UNIVERSITY_CONFIG.domain} (Sample)`,
    bio: 'Backend specialist with experience building scalable REST APIs. Looking for React frontend dev for Capstone Project.',
    createdAt: '2026-09-21T09:00:00Z',
  },
];

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp_1',
    userId: 'usr_student_1',
    userName: UNIVERSITY_CONFIG.demoStudent.name,
    title: 'Intermittent Wi-Fi Dropout in Hostel Block C (3rd Floor) [Sample]',
    category: 'Wi-Fi',
    location: 'Hostel Block C, Rooms 301-320',
    description: 'High packet loss and DNS timeouts during peak evening hours (7 PM to 11 PM), preventing coursework and video lectures.',
    status: 'In Review',
    adminNotes: 'Network technician scheduled to replace the 3rd floor access point switch on Thursday morning.',
    createdAt: '2026-09-21T18:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z',
  },
  {
    id: 'cmp_2',
    userId: 'usr_student_3',
    userName: 'Ananya Verma',
    title: 'AC unit in Computer Science Lab 3 blowing warm air [Sample]',
    category: 'Classroom',
    location: 'Academic Block 2, Ground Floor CS Lab 3',
    description: 'The central unit is not cooling properly, causing lab workstations to overheat during the afternoon practicals.',
    status: 'Submitted',
    createdAt: '2026-09-22T11:30:00Z',
    updatedAt: '2026-09-22T11:30:00Z',
  },
  {
    id: 'cmp_3',
    userId: 'usr_student_4',
    userName: 'Kabir Patel',
    title: 'Water filter maintenance and filter replacement in Mess 2 [Sample]',
    category: 'Mess',
    location: 'Main Dining Hall / Mess 2',
    description: 'The RO drinking water dispenser indicator turned amber signaling filter replacement is due.',
    status: 'Resolved',
    adminNotes: 'Filters replaced and water purity tested by Estate Office on Sept 21. TDS level tested normal.',
    createdAt: '2026-09-19T08:00:00Z',
    updatedAt: '2026-09-21T15:00:00Z',
  },
];

export const SEED_WIKI: WikiArticle[] = [
  {
    id: 'wiki_1',
    title: `Freshers Guide: Navigating ${UNIVERSITY_CONFIG.shortName} in Your First 30 Days [Sample Guide]`,
    category: 'Freshers Guide',
    shortDescription: 'Essential survival tips: Wi-Fi credentials, hostel curfews, mess rebate procedures, and club inductions.',
    content: `# Welcome to ${UNIVERSITY_CONFIG.name}!

Welcome to campus! Here is everything the official orientation won't tell you:

### 1. Campus Wi-Fi Setup
* Network SSID: \`${UNIVERSITY_CONFIG.shortName}_Student_5G\`
* Login portal: Use your University Roll Number and the default password provided on your fee receipt.
* Change your password immediately at \`wifi.${UNIVERSITY_CONFIG.domain}\`.

### 2. Hostel Timings & Gates
* Main campus gates close at 10:30 PM on weekdays and 11:00 PM on weekends.
* Late entry slips require prior warden sign-off via the CampusHub Grievance desk.

### 3. Medical Emergency & Helpdesk
* Campus Health Centre is operational 24/7 next to Sports Complex.
* Sample Campus Emergency: \`${UNIVERSITY_CONFIG.emergencyContact}\`.
`,
    author: 'Student Council Academic Committee',
    tags: ['Freshers', 'Campus Life', 'Hostel', 'Wi-Fi'],
    isPublished: true,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-15T12:00:00Z',
  },
  {
    id: 'wiki_2',
    title: 'End-Semester Exam Registration & Admit Card Guidelines [Sample Guide]',
    category: 'Exams',
    shortDescription: 'Step-by-step walkthrough for subject verification, exam hall tickets, and the mandatory 75% attendance criterion.',
    content: `# Examination Portal Guidelines

### 1. Mandatory Attendance Rule
As per academic council regulations, a minimum of **75% cumulative attendance** is strictly required in each theory and lab course to appear for end-semester exams.

### 2. Admit Card Clearance
* Clear all pending library books at least 7 days before exams start.
* Verify your internal assessment marks on the university portal.
* Download your hall ticket through the student dashboard.
`,
    author: 'Controller of Examinations',
    tags: ['Exams', 'Attendance', 'Academics'],
    isPublished: true,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-18T14:00:00Z',
  },
  {
    id: 'wiki_3',
    title: 'Central Library Timings, RFID Borrowing & Digital Repositories [Sample Guide]',
    category: 'Library',
    shortDescription: 'How to reserve IEEE papers, borrow physical textbooks, and book private group study discussion rooms.',
    content: `# Ramanujan Central Library

### Operating Hours
* **Monday – Friday:** 8:00 AM – 11:00 PM
* **Saturdays & Sundays:** 9:00 AM – 8:00 PM
* **Exam Weeks:** 24/7 Open Reading Hall (Ground Floor)

### Book Borrowing Rules
* Undergraduate students may borrow up to 4 books simultaneously for 14 days.
* Renewals can be done online up to 2 times without late fees.
`,
    author: 'Chief Librarian Dr. M. Iyer',
    tags: ['Library', 'Research', 'Study Rooms'],
    isPublished: true,
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-10T11:00:00Z',
  },
];

export const SEED_REPORTS: ReportItem[] = [
  {
    id: 'rep_1',
    reporterId: 'usr_student_2',
    targetType: 'marketplace',
    targetId: 'mkt_1',
    reason: 'Price gouging or unresponsive seller for semester 3 textbook [Sample Report].',
    status: 'pending',
    createdAt: '2026-09-22T08:30:00Z',
  },
  {
    id: 'rep_2',
    reporterId: 'usr_student_3',
    targetType: 'lost_found',
    targetId: 'lf_2',
    reason: 'Duplicate listing; item has already been retrieved from the VLSI lab assistant [Sample Report].',
    status: 'reviewed',
    createdAt: '2026-09-21T14:15:00Z',
  },
];
