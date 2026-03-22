import { Contact } from './types';
import seedContacts from '../data/contacts.json';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const g = global as typeof global & { contacts?: Contact[] };

if (!g.contacts) {
  g.contacts = (seedContacts as Omit<Contact, 'id'>[]).map(c => ({
    ...c,
    id: makeId(),
  }));
}

export function getContacts(): Contact[] {
  return g.contacts!;
}

export function addContact(data: Omit<Contact, 'id'>): Contact {
  const contact: Contact = { ...data, id: makeId() };
  g.contacts!.push(contact);
  return contact;
}

export function updateContact(id: string, data: Partial<Omit<Contact, 'id'>>): Contact | null {
  const idx = g.contacts!.findIndex(c => c.id === id);
  if (idx === -1) return null;
  g.contacts![idx] = { ...g.contacts![idx], ...data };
  return g.contacts![idx];
}

export function deleteContact(id: string): boolean {
  const idx = g.contacts!.findIndex(c => c.id === id);
  if (idx === -1) return false;
  g.contacts!.splice(idx, 1);
  return true;
}