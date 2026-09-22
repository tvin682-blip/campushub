/**
 * CAMPUSHUB — CENTRAL UNIVERSITY CONFIGURATION
 * 
 * Edit this file to change the university name, acronym, domain, 
 * and emergency contact information across the entire application.
 */

export const UNIVERSITY_CONFIG = {
  // Primary university name displayed in header, footer, signup, and emails
  name: 'Hi-Tech Institute of Engineering & Technology',

  // Short acronym or abbreviation (e.g. for badges or mobile views)
  shortName: 'HIET',

  // Official student and faculty domain
  domain: 'hi-tech.edu',

  // Tagline
  tagline: 'One simple platform for everything students need on campus.',

  // Official campus helpline and emergency desk (safe sample extensions)
  emergencyContact: 'Campus Control Desk: ext. 100 / ext. 101',
  studentAffairsEmail: 'studentaffairs@hi-tech.edu',
  itHelpdeskEmail: 'ithelp@hi-tech.edu',

  // Neutral demo persona credentials for live presentations
  demoStudent: {
    name: 'Student Demo',
    email: 'student.demo@hi-tech.edu',
    phone: '+91 98765-XXXXX (Sample Contact)',
  },
  demoAdmin: {
    name: 'Campus Admin',
    email: 'admin@hi-tech.edu',
    phone: 'ext. 2001 (Dean Office)',
  },

  // Version banner
  version: 'Campus Version 1.0 (Presentation Demo)',
} as const;

export default UNIVERSITY_CONFIG;
