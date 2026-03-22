import { Contact, Recommendation } from './types';

const KEYWORDS = ['investor', 'mentor', 'advisor', 'friend'];
const THRESHOLD = 30;

function getDaysSince(dateStr: string): number {
  if (!dateStr) return -1;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return -1;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function getPriority(notes: string): number {
  const n = notes.toLowerCase();
  if (n.includes('investor')) return 1;
  if (n.includes('mentor')) return 2;
  if (n.includes('advisor')) return 3;
  if (n.includes('friend')) return 4;
  return 5;
}

export function getRecommendations(contacts: Contact[]): Recommendation[] {
  const results: Recommendation[] = [];

  for (const c of contacts) {
    const days = getDaysSince(c.lastContactedDate);
    const notes = c.notes?.toLowerCase() || '';
    const keyword = KEYWORDS.find(k => notes.includes(k));
    const overdue = days >= THRESHOLD;

    if (!overdue && !keyword) continue;

    let reason = '';
    if (keyword && overdue) {
      reason = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} and not contacted in ${days} days`;
    } else if (keyword) {
      reason = `Important ${keyword} — reach out to stay connected`;
    } else {
      reason = `Not contacted in ${days} days`;
    }

    results.push({ name: c.name, reason, daysSince: days });
  }

  return results.sort((a, b) => {
    const ca = contacts.find(c => c.name === a.name)!;
    const cb = contacts.find(c => c.name === b.name)!;
    const pa = getPriority(ca.notes);
    const pb = getPriority(cb.notes);
    if (pa !== pb) return pa - pb;
    return b.daysSince - a.daysSince;
  });
}