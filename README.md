# AI Contact Reminder — Timing Engineering Assessment

A web app that helps you stay on top of your professional network by surfacing who you should reach out to and generating personalized messages for each contact.

---

## How to Run

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root:
```
GEMINI_API_KEY=your_key_here
```
If no key is provided, the app falls back to template-based message generation automatically.

3. Start the dev server:
```bash
npm run dev
```

4. Open `http://localhost:3000`

---

## What It Does

- **All Contacts** — view, search, filter, and sort your contacts
- **Recommendations** — automatically surfaces who you should reach out to based on how long it's been and your relationship type
- **Contact Profiles** — click any contact to see their details and generate a personalized outreach message
- **Full CRUD** — add, edit, and delete contacts via a clean modal UI

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | Returns all contacts |
| POST | `/api/contacts` | Adds a new contact |
| PUT | `/api/contacts/:id` | Updates a contact |
| DELETE | `/api/contacts/:id` | Deletes a contact |
| GET | `/api/recommendations` | Returns prioritized list of who to reach out to |
| POST | `/api/generate-message` | Generates a personalized outreach message |

---

## Recommendation Logic

A contact is recommended if:
- They haven't been contacted in **30+ days**
- OR their notes contain: `mentor`, `investor`, `advisor`, or `friend`

Results are sorted by relationship priority (investor → mentor → advisor → friend), then by longest time since contact.

---

## Key Design Decisions

- **Next.js App Router** — single repo for both frontend and API, no need for a separate backend
- **In-memory store** — contacts are seeded from `data/contacts.json` and kept in memory. Simple, fast, and appropriate for a prototype
- **Gemini API with simulation fallback** — if no API key is present, the app generates clean template-based messages so the feature always works
- **No external database** — deliberately avoided to keep setup friction near zero

---

## Assumptions

- Contacts are scoped to a single user (no auth)
- In-memory storage is acceptable for a prototype; a real implementation would use a database
- "Last contacted date" is self-reported by the user

---

## What I'd Improve With More Time

- Persist contacts to a database (PostgreSQL or SQLite)
- Add user authentication
- Use a production LLM with better prompt tuning for more varied messages
- Add email sending directly from the app
- Write unit tests for recommendation logic
- Deploy to Vercel

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Google Gemini API (with simulation fallback)