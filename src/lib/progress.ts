// src/lib/progress.ts
export type CaseStatus = 'unread' | 'in-progress' | 'solved';
const STORAGE_KEY = 'inferred_progress';

interface ProgressData { [slug: string]: CaseStatus; }

export function getAllProgress(): ProgressData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getCaseStatus(slug: string): CaseStatus {
  return getAllProgress()[slug] || 'unread';
}

export function setCaseStatus(slug: string, status: CaseStatus): void {
  if (typeof window === 'undefined') return;
  const progress = getAllProgress();
  progress[slug] = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markAsInProgress(slug: string): void {
  if (getCaseStatus(slug) === 'unread') setCaseStatus(slug, 'in-progress');
}

export function markAsSolved(slug: string): void {
  setCaseStatus(slug, 'solved');
}

export function getSolvedCount(): number {
  return Object.values(getAllProgress()).filter(s => s === 'solved').length;
}

export function getProgressSummary(totalCases: number) {
  const solved = getSolvedCount();
  return {
    solved,
    total: totalCases,
    percentage: totalCases > 0 ? Math.round((solved / totalCases) * 100) : 0
  };
}
