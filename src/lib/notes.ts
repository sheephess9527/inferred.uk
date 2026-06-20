// src/lib/notes.ts
const NOTES_KEY = 'inferred_detective_notes';

export interface Note {
  id: string;
  content: string;
  timestamp: number;
  caseSlug?: string;
}

export function getNotes(caseSlug?: string): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const allNotes: Note[] = raw ? JSON.parse(raw) : [];
    return caseSlug ? allNotes.filter(n => n.caseSlug === caseSlug) : allNotes;
  } catch { return []; }
}

export function addNote(content: string, caseSlug?: string): Note {
  if (typeof window === 'undefined') return { id: '', content, timestamp: Date.now(), caseSlug };
  const notes = getNotes();
  const newNote: Note = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    content: content.trim(),
    timestamp: Date.now(),
    caseSlug
  };
  notes.unshift(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  window.dispatchEvent(new CustomEvent('inferred:notes-updated'));
  return newNote;
}

export function removeNote(id: string): void {
  if (typeof window === 'undefined') return;
  const notes = getNotes().filter(n => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  window.dispatchEvent(new CustomEvent('inferred:notes-updated'));
}
