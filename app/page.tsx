'use client';

import { useState, useEffect, useMemo } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  lastContactedDate: string;
  notes: string;
}

interface Recommendation {
  name: string;
  reason: string;
  daysSince: number;
}

const EMPTY = { name: '', email: '', company: '', lastContactedDate: '', notes: '' };

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [search, setSearch] = useState('');
  const [filterNote, setFilterNote] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [activeTab, setActiveTab] = useState<'contacts' | 'recommendations'>('contacts');

  useEffect(() => { load(); }, []);

  async function load() {
    const [c, r] = await Promise.all([
      fetch('/api/contacts').then(r => r.json()),
      fetch('/api/recommendations').then(r => r.json()),
    ]);
    setContacts(c);
    setRecommendations(r);
  }

  async function handleSave() {
    if (!form.name || !form.email) return alert('Name and email required');
    if (editContact) {
      await fetch(`/api/contacts/${editContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    setEditContact(null);
    setForm(EMPTY);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    if (selected?.id === id) setSelected(null);
    load();
  }

  async function generateMessage() {
    if (!selected) return;
    setLoadingMsg(true);
    setMessage('');
    const res = await fetch('/api/generate-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactName: selected.name,
        relationshipContext: selected.notes || 'professional contact',
        lastConversation: `Last contacted on ${selected.lastContactedDate || 'unknown date'}`,
      }),
    });
    const data = await res.json();
    setMessage(data.message || data.error || 'Error generating message');
    setLoadingMsg(false);
  }

  function openAdd() { setEditContact(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(c: Contact) { setEditContact(c); setForm({ name: c.name, email: c.email, company: c.company, lastContactedDate: c.lastContactedDate, notes: c.notes }); setShowModal(true); }

  const filtered = useMemo(() => {
    let list = [...contacts];
    if (search) list = list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
    if (filterNote) list = list.filter(c => c.notes.toLowerCase().includes(filterNote.toLowerCase()));
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'date') list.sort((a, b) => new Date(a.lastContactedDate || 0).getTime() - new Date(b.lastContactedDate || 0).getTime());
    return list;
  }, [contacts, search, filterNote, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Contact Reminder</h1>
            <p className="text-sm text-gray-500">Stay on top of your professional network</p>
          </div>
          <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Add Contact
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['contacts', 'recommendations'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:border-blue-400'}`}>
              {tab === 'contacts' ? `All Contacts (${contacts.length})` : `Recommended (${recommendations.length})`}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Left Panel */}
          <div className="flex-1 min-w-0">
            {activeTab === 'contacts' && (
              <>
                <div className="flex gap-2 mb-4">
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, company, email..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={filterNote} onChange={e => setFilterNote(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Types</option>
                    <option value="mentor">Mentor</option>
                    <option value="investor">Investor</option>
                    <option value="advisor">Advisor</option>
                    <option value="friend">Friend</option>
                  </select>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'date')}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="name">Sort: Name</option>
                    <option value="date">Sort: Date</option>
                  </select>
                </div>

                <div className="space-y-2">
                  {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-12">No contacts found.</p>}
                  {filtered.map(c => (
                    <div key={c.id} onClick={() => { setSelected(c); setMessage(''); }}
                      className={`bg-white border rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors ${selected?.id === c.id ? 'border-blue-500 ring-1 ring-blue-200' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-sm text-gray-500 truncate">{c.company} · {c.email}</p>
                          <div className="flex gap-2 mt-1">
                            {c.notes && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{c.notes}</span>}
                            {c.lastContactedDate && <span className="text-xs text-gray-400">{c.lastContactedDate}</span>}
                          </div>
                        </div>
                        <div className="flex gap-3 ml-3 shrink-0">
                          <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Edit</button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-2">
                {recommendations.length === 0 && <p className="text-gray-400 text-sm text-center py-12">No recommendations right now — you're all caught up!</p>}
                {recommendations.map((r, i) => (
                  <div key={i}
                    onClick={() => { const c = contacts.find(x => x.name === r.name); if (c) { setSelected(c); setMessage(''); setActiveTab('contacts'); } }}
                    className="bg-white border rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600 font-bold text-sm w-6">#{i + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{r.name}</p>
                        <p className="text-sm text-gray-500">{r.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel — Profile */}
          {selected && (
            <div className="w-80 shrink-0">
              <div className="bg-white border rounded-xl p-5 sticky top-6">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-3">
                    {selected.name.charAt(0)}
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.company}</p>
                </div>
                <div className="space-y-2 text-sm mb-5 border-t pt-4">
                  <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-gray-700 text-right max-w-[160px] truncate">{selected.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Last Contact</span><span className="text-gray-700">{selected.lastContactedDate || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Notes</span><span className="text-gray-700">{selected.notes || '—'}</span></div>
                </div>
                <button onClick={generateMessage} disabled={loadingMsg}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loadingMsg ? 'Generating...' : '✨ Generate Message'}
                </button>
                {message && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">Suggested Message</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{editContact ? 'Edit Contact' : 'Add Contact'}</h2>
            <div className="space-y-3">
              {([
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'company', label: 'Company', type: 'text' },
                { key: 'lastContactedDate', label: 'Last Contacted Date', type: 'date' },
                { key: 'notes', label: 'Notes (e.g. mentor, investor)', type: 'text' },
              ] as const).map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 font-medium">{label}</label>
                  <input type={type} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ```

// ---

// Now create `.env.local` in the root:
// ```
// GROQ_API_KEY=paste_your_key_here