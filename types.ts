export type Gender = 'Male' | 'Female';
export type Category = 'General' | 'EWS' | 'OBC' | 'SC' | 'ST' | 'PWD';
export type DVStatus = 'Yes' | 'No';

export interface Candidate {
  id: string;
  fullName: string;
  registrationNumber: string;
  phoneNumber: string;
  email: string;
  gender: Gender;
  categoryApplied: Category;
  category: Category;
  shortlistedDV: DVStatus;
  appliedOtherPost: DVStatus;
  shortlistedOtherPost: DVStatus;
  tier1Marks: number;
  tier2Marks: number;
  photoDataUrl: string | null;
  createdAt: string;
}

export type ViewKey = 'leaderboard' | 'analytics' | 'submit' | 'admin';
