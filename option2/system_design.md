# System Design — Timing at Scale

## The Problem
Design a system that supports 1 million users, each with up to 1,000 contacts, and generates personalized daily recommendations for each user.

At peak that's **1 billion contact records** and **1 million recommendation jobs per day**.

---

## Architecture Overview
```
Client (Web / Mobile)
        ↓
   API Gateway
        ↓
  Application Layer (Next.js / REST API)
        ↓
  ┌─────────────────────────────────┐
  │  Recommendation Engine (async)  │
  └─────────────────────────────────┘
        ↓
  ┌──────────────┐    ┌──────────────┐
  │  Primary DB  │    │  LLM Service │
  │ (PostgreSQL) │    │  (Gemini /   │
  └──────────────┘    │   OpenAI)    │
                      └──────────────┘
```

---

## Data Storage

**PostgreSQL** as the primary database with two core tables:
```sql
users (id, email, created_at)
contacts (id, user_id, name, email, company, last_contacted_date, notes, priority_score)
```

**Indexing strategy:**
- Index on `(user_id, last_contacted_date)` — the most common query pattern
- Index on `(user_id, notes)` for keyword filtering
- Partition the contacts table by `user_id` range for horizontal scalability

**Caching:**
- Redis for storing pre-computed recommendation results per user
- Cache invalidated when a contact is updated or a new one is added
- TTL of 24 hours since recommendations are daily

---

## Compute Strategy

Daily recommendations cannot run synchronously — they need to run as **background batch jobs**.

**Flow:**
1. A cron job fires at 2am every night
2. It enqueues one job per active user into a message queue (e.g. AWS SQS or BullMQ)
3. A pool of background workers pull jobs off the queue
4. Each worker queries that user's contacts, applies recommendation logic, calls the LLM for message drafts, and writes results to the cache
5. When the user opens the app, recommendations are served instantly from cache

**Why not on-demand?**
At 1M users, generating recommendations on page load would be too slow and too expensive. Pre-computing overnight keeps the user experience instant.

---

## Hyper Personalization

**Short term — prompt engineering with persistent memory:**
- Store a memory object per user: relationship history, past messages sent, topics discussed
- Inject this context into every LLM prompt
- Cheap, fast, no model training required

**Long term — fine-tuned model:**
- Once enough interaction data exists, fine-tune a smaller model (e.g. Llama 3) on user-specific communication style
- Host on dedicated inference infrastructure per user tier
- Reserved for power users / enterprise tier due to cost

---

## Scaling

| Challenge | Solution |
|---|---|
| 1B contact records | Partition PostgreSQL by user_id, archive cold data to S3 |
| 1M daily jobs | Distributed worker pool (e.g. AWS ECS), autoscale based on queue depth |
| LLM cost | Batch API calls, cache generated messages, only regenerate when context changes |
| Read-heavy API | Redis cache in front of DB, CDN for static assets |
| Single points of failure | Multi-AZ database, redundant workers, health checks on all services |

---

## Summary

The core insight is separating **read** (fast, cached) from **compute** (async, batched overnight). Users get instant recommendations because the heavy lifting already happened. The LLM layer stays cheap because we only generate messages when needed and cache aggressively.