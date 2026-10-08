import type { Candidate, Gender, Category, DVStatus } from '@/types';
import { supabase } from '@/lib/supabase';

const AUTH_KEY = 'emrs_admin_auth';

function dbRowToCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    registrationNumber: row.registration_number as string,
    phoneNumber: row.phone_number as string,
    email: row.email as string,
    gender: row.gender as Gender,
    categoryApplied: row.category_applied as Category,
    category: row.category as Category,
    shortlistedDV: row.shortlisted_dv as DVStatus,
    appliedOtherPost: row.applied_other_post as DVStatus,
    shortlistedOtherPost: row.shortlisted_other_post as DVStatus,
    tier1Marks: Number(row.tier1_marks),
    tier2Marks: Number(row.tier2_marks),
    photoDataUrl: (row.photo_data_url as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

function candidateToDbRow(c: Candidate): Record<string, unknown> {
  return {
    id: c.id,
    full_name: c.fullName,
    registration_number: c.registrationNumber,
    phone_number: c.phoneNumber,
    email: c.email,
    gender: c.gender,
    category_applied: c.categoryApplied,
    category: c.category,
    shortlisted_dv: c.shortlistedDV,
    applied_other_post: c.appliedOtherPost,
    shortlisted_other_post: c.shortlistedOtherPost,
    tier1_marks: c.tier1Marks,
    tier2_marks: c.tier2Marks,
    photo_data_url: c.photoDataUrl,
    created_at: c.createdAt,
  };
}

export async function loadCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load candidates:', error.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map(dbRowToCandidate);
}

export async function addCandidate(candidate: Candidate): Promise<Candidate[]> {
  const { error } = await supabase
    .from('candidates')
    .insert(candidateToDbRow(candidate));

  if (error) {
    console.error('Failed to add candidate:', error.message);
    throw error;
  }

  return loadCandidates();
}

export async function deleteCandidate(id: string): Promise<Candidate[]> {
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete candidate:', error.message);
    throw error;
  }

  return loadCandidates();
}

export function isAuthed(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function setAuthed(value: boolean): void {
  if (value) localStorage.setItem(AUTH_KEY, 'true');
  else localStorage.removeItem(AUTH_KEY);
}

/**
 * Ranks candidates by Tier-2 marks (tie-break: Tier-1).
 * Ranking is scoped within a specific DV-status + gender group.
 */
export function rankCandidates(
  candidates: Candidate[]
): Map<string, number> {
  const sorted = [...candidates].sort((a, b) => {
    if (b.tier2Marks !== a.tier2Marks) return b.tier2Marks - a.tier2Marks;
    return b.tier1Marks - a.tier1Marks;
  });

  const rankMap = new Map<string, number>();
  let rank = 0;
  let prevTier2: number | null = null;
  let prevTier1: number | null = null;

  sorted.forEach((c, idx) => {
    if (
      prevTier2 !== null &&
      prevTier2 === c.tier2Marks &&
      prevTier1 === c.tier1Marks
    ) {
      rankMap.set(c.id, rank);
    } else {
      rank = idx + 1;
      rankMap.set(c.id, rank);
    }
    prevTier2 = c.tier2Marks;
    prevTier1 = c.tier1Marks;
  });

  return rankMap;
}

/**
 * Returns a rank map where each candidate is ranked within their
 * own DV-status + gender cohort.
 */
export function rankByGroup(
  candidates: Candidate[]
): Map<string, number> {
  const result = new Map<string, number>();
  const groups = new Map<string, Candidate[]>();

  candidates.forEach((c) => {
    const key = `${c.shortlistedDV}|${c.gender}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  });

  groups.forEach((group) => {
    const ranks = rankCandidates(group);
    ranks.forEach((rank, id) => result.set(id, rank));
  });

  return result;
}

export const CATEGORIES: Category[] = [
  'General',
  'EWS',
  'OBC',
  'SC',
  'ST',
  'PWD',
];

export const DV_STATUSES: DVStatus[] = ['Yes', 'No'];

const PASSWORD_KEY = 'emrs_admin_password';
const DEFAULT_PASSWORD = 'Maneet@517';

export function getAdminPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) ?? DEFAULT_PASSWORD;
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(PASSWORD_KEY, newPassword);
}

export function verifyAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}

export type { Gender, DVStatus };
