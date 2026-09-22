# 🎓 CampusHub

> **"One simple platform for everything students need on campus."**

CampusHub is an all-in-one, modern, university-focused student web application designed to solve common campus challenges in a single, unified, startup-grade platform.

---

## 🌟 The 7 Core Campus Modules

### 1. 🔍 Lost & Found
* **Community Retrieval**: Report lost items or submit found belongings across campus.
* **Granular Filtering**: Search by category (*ID Cards, Wallets, Electronics, Keys, Books, Bags*), location, and status (*Open* vs *Resolved*).
* **Safe Handover Details**: Verified contact details with 1-click **"Copy Contact Info"** and photo previews.
* **Resolution Tracking**: Mark items as resolved once reclaimed.

### 2. 📅 Assignment Hub
* **Coursework Manager**: Track homework, lab reports, capstone deliverables, and problem sets.
* **Timeline Urgency Filters**: *Due Today, Due Tomorrow, This Week, Overdue, Submitted*.
* **1-Click Completion Checkbox**: Instant task strikethrough and visual progress tracking.
* **Priority Pills**: High, Medium, and Low urgency badges.

### 3. 🛍️ Campus Marketplace
* **Peer-to-Peer Trading**: Textbooks, scientific calculators, bicycles, hostel gear, electronics, and stationery.
* **Condition Badges**: *Brand New, Like New (Mint), Good, Fair*.
* **Seller Controls**: 1-Click **"Mark as Sold"** to archive listings, plus a **"Report Listing"** modal for flagging suspicious items.
* **Direct Handover Card**: Verified seller contact with 1-click copy feedback.

### 4. 👥 Team Finder & Talent Directory
* **Peer Collaboration**: Find teammates for hackathons, engineering capstones, competitions, and startups.
* **Skill-Based Quick Filters**: Instant 1-click filtering by technical and design skills (*React, Python, Figma, Machine Learning, Docker, Flutter, C++, Java*).
* **Direct Student Cards**: Academic year, branch, elevator bio, GitHub, and LinkedIn links.
* **Icebreaker Message Generator**: Automatically drafts a polite, customized outreach template with a 1-click **"Copy Template"** button so students never hesitate to reach out.

### 5. 📊 Attendance Tracker & 75% Rule Engine
* **Course Attendance Monitoring**: Track total lectures held vs. attended for each enrolled course.
* **Mathematical Safety Margins**:
  * Attendance percentage: $P = (A / T) \times 100$
  * **Consecutive classes needed to reach 75%**: $\lceil \frac{0.75 \times T - A}{0.25} \rceil$
  * **Safe classes you can afford to miss**: $\lfloor \frac{A - 0.75 \times T}{0.75} \rfloor$
* **Visual Progress Bars**: Color-coded progress with a white vertical guideline indicating the mandatory 75% university threshold.
* **Live Quick-Simulate Buttons**: `+ Attended` and `+ Missed` buttons for instant testing.
* **Interactive Bunk Calculator**: Slider to test custom target criteria (60%, 75%, 80%, 90%).

### 6. 🚨 Campus Issues & Grievance Tracker
* **Maintenance & Welfare Management**: Report hostel, mess, classroom, Wi-Fi, electricity, or cleanliness issues.
* **3-Step Visual Progress Stepper**: `[1. Submitted] ➔ [2. In Review] ➔ [3. Resolved]`.
* **Transparent Administrative Notes**: Official technician and estate office remarks displayed on each issue.
* **"Affects Me Too" Peer Endorsements**: Students can upvote shared breakdowns to demonstrate collective impact.

### 7. 📖 College Survival Wiki
* **12 Category Knowledge Vaults**: *Freshers Guide, Exams, Academics, Library, Hostel, Clubs, Campus Facilities, Departments, Important Offices, FAQs, General Student Tips, Faculty*.
* **Rich Markdown Reader**: Clear guide layout with headings, bullet lists, tips, and estimated read time.
* **Crowdsourced Submissions**: Students and club leads can publish guides, hacks, and advice with topic tags.
* **Bookmarks & Likes**: Save essential guides for quick offline access.

---

## 🛡️ Administrative Control Center (`/admin`)

* **Role-Based Access Control**: Strict route guard separating Students from University Staff.
* **Grievance Resolution Desk**: Inspect, assign technicians, update resolution status, and write official remarks.
* **Content Moderation Queue**: Review student flags on marketplace items and purge violating content with 1 click.
* **Wiki Publishing Desk**: Approve, edit, publish, or draft official university guides.
* **Demo Database Reset**: 1-Click reset utility to restore all 7 tables to initial seed data for clean live presentations.

---

## 💻 Tech Stack & Architecture

* **Frontend**: React 19, TypeScript, Vite 8
* **Styling**: Tailwind CSS v4, Plus Jakarta Sans typography, sleek dark-first slate theme
* **Icons**: Lucide React
* **Routing**: React Router v7 (`react-router-dom`)
* **State & Storage**: Reactive Client-side `localStorage` Engine (`StorageService`) with custom event bus (`campushub_storage_updated`) for multi-tab synchronization and reactivity.
* **Cost**: **100% Free** — Zero paid API keys, zero paid cloud subscriptions.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Local Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## ⚙️ Central University Configuration

To customize CampusHub for any college or institution, simply edit a single central file:
👉 **[`src/config/university.ts`](file:///c:/Users/vineet%20tiwari/Downloads/campushub/src/config/university.ts)**

```typescript
export const UNIVERSITY_CONFIG = {
  name: 'Hi-Tech Institute of Engineering & Technology',
  shortName: 'HIET',
  domain: 'hi-tech.edu',
  emergencyContact: 'Campus Control Desk: ext. 100 / ext. 101',
  studentAffairsEmail: 'studentaffairs@hi-tech.edu',
  itHelpdeskEmail: 'itdesk@hi-tech.edu',
  ...
};
```
Updating this single file automatically refreshes the university branding across the entire portal, navbar, footer, auth, seed data, and placeholders without touching any component code.

---

## 🔑 Pre-Configured Demo Accounts

For college presentations and viva demonstrations, CampusHub includes one-click presentation ribbons on the login page and navbar:

| Role | Name | Email | Password | Access Level |
|---|---|---|---|---|
| **Student** | Student Demo | `student.demo@hi-tech.edu` | `student123` | Full access to all 7 student modules, marketplace posting, team profiles, and grievance reporting. |
| **Admin** | Campus Admin | `admin@hi-tech.edu` | `admin123` | Full access + Admin Control Center (`/admin`), grievance resolution, content moderation, and wiki management. |

*(Note: Legacy emails `alex.rivera@university.edu` and `admin@university.edu` remain automatically supported and mapped for zero-friction backwards compatibility).*

---

## 🎤 Viva & Presentation Talking Points

When presenting CampusHub to professors, evaluators, or hackathon judges, highlight these key design decisions:

1. **Integrated Student Experience vs. Fragmented Apps**:
   * *Problem*: Students typically juggle 5 different WhatsApp groups, a clunky ERP portal, paper noticeboards, and untracked lost-and-found posts.
   * *Solution*: CampusHub aggregates the entire campus lifecycle into one responsive portal.
2. **Attendance Math Engine**:
   * Explain the recovery vs. safety margin formulas:
     * When attendance drops below 75%, it calculates how many *future consecutive classes* the student must attend without missing a single lecture.
     * When above 75%, it calculates how many classes the student can safely skip while staying strictly at or above the threshold.
3. **Role-Based Security**:
   * Demonstrate the `ProtectedRoute` component: show how a student is prevented from accessing `/admin`, and demonstrate the 1-click persona switch to show the staff perspective.
4. **Data Resilience & Reset Tool**:
   * Show that all CRUD actions persist in `localStorage`, and demonstrate the **"Reset Demo Data"** button in `/admin` to prove system recoverability.
