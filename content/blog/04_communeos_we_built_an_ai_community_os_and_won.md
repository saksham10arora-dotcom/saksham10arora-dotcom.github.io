---
title: "We Built an AI Community OS in 48 Hours. We Won."
date: 2026-06-27
tags: [hackathon, ai, fastapi, nextjs, llm, python, sqlite, chromadb]
---

> Six AI agents. A live SQLite backend. Four teammate resumes uploaded live in front of judges — all four parsed correctly and personalized on the spot. Here's everything that happened.

---

## The Problem We Were Actually Solving

Discord servers are full of unanswered questions. New members join excited and go silent within three days. Knowledge is scattered across pinned messages nobody reads and Notion wikis that haven't been touched since Q1.

The problem isn't that people don't want to connect. It's that no platform is smart enough to know *who should connect to whom, about what, and when.*

That's what we built CommuneOS to fix — an AI-powered community OS where six specialized agents work together to personalize every member's experience in real time. No manual tagging. No static onboarding surveys. Upload your resume, and the platform figures the rest out.

The team: me (Saksham), Satyansh Gaur, Suraj Samanta, and Vaibhav Kandpal.

---

## The Stack

Before getting into the story, here's what we shipped:

- **Frontend:** Next.js 16 — single `page.tsx`, ~1750 lines, all state in one file
- **Backend:** FastAPI + Python 3.12, async, rate-limited, 8 route files
- **LLM:** Groq (`llama-3.3-70b-versatile`) as primary, OpenRouter as fallback, mock data as last resort
- **Vector DB:** ChromaDB — resume embeddings + 54-item community memory seed
- **Relational DB:** SQLite (built-in `sqlite3`, no ORM) — communities, channels, events, resources
- **PDF parsing:** PyMuPDF (`fitz`) for text extraction
- **Auth:** SHA-256 token auth, no Supabase dependency

---

## Hour 0: The Environment Broke Before We Even Started

First blocker hit before a single line of feature code was written.

The backend required `pydantic-core`, which doesn't ship pre-built wheels for Python 3.14 — the default Homebrew python on macOS. Switched to Python 3.12. Then discovered `chromadb`, `pymupdf`, and `pydantic[email]` were all missing from `requirements.txt`. Installed them manually. Forty minutes of environment debugging before the server printed a single startup log.

Classic.

The lesson I've learned from every hackathon: **spend the first 30 minutes making sure the dev loop works before you write anything.** We didn't. We paid for it.

---

## The Six-Agent Architecture

The central bet was that one monolithic LLM call wouldn't cut it. We split the intelligence into six agents, each with one job:

| Agent | What it does |
|---|---|
| **Identity** | Infers skills, maps expertise areas, assigns confidence score |
| **Discovery** | Ranks channels and resources against the user's skill profile |
| **Learning** | Generates an 8-week personalized roadmap with milestones |
| **Mentor** | Matches the user to the best mentor with a compatibility score |
| **Health** | Flags at-risk members, unanswered threads, churn signals |
| **Organizer** | Suggests intervention actions, events, mentor invites |

`orchestrator.py` chains them, caches the result for an hour, and falls back to mock data if Groq goes down. The whole pipeline runs in about 3 seconds on a warm Groq call.

The key design decision: agents share a ChromaDB memory store. When a user uploads a resume, it gets chunked and embedded. Every subsequent agent call queries that memory first. The Identity Agent doesn't just read profile fields — it reads the semantic content of your actual resume.

---

## The Resume Pipeline: Upload a PDF, Get a Personalized Platform

This was the demo moment we built everything else around.

When a user onboards, they upload their resume as a PDF. Here's what happens:

1. **PyMuPDF extracts raw text** — handles multi-page, mixed layouts, any real-world PDF
2. **LLM parses it into structured JSON** — skills, frameworks, experience level, projects, career goals
3. **`chunk_resume_json` splits it** into five semantic chunks: Education, Projects, Skills, Experience, Career Goals
4. **ChromaDB embeds and stores** each chunk, keyed by user ID
5. **Every agent now has context** — the Identity Agent sees your actual projects, the Discovery Agent matches resources against your real skill set

The fallback if the LLM fails: a keyword detection pass over the raw text against pools of known languages, frameworks, databases, and tools. Not as good, but it never returns empty.

---

## The Real Test: Four Teammate Resumes, Live in Front of the Judges

We didn't use fake demo users. We uploaded our actual resumes.

**Saksham (me)** — resumevx5.pdf. One page, 3,833 characters. The pipeline picked up: CUDA, C++, Rust, Python, IMC Prosperity 4 (Global Rank 154, 18,800+ teams), Cimplifie internship, IIT Madras. Surfaced Systems & HFT community, CUDA Shared Memory guide, C++ Memory Management, Quantitative Finance Green Book, Lock-Free Queues in C++. Mentor match: Sarah Chen, Senior GPU Engineer at NVIDIA.

**Suraj** — SURAJ RESUME.pdf. One page, 4,733 characters. Detected: Java, Python, JavaScript, TypeScript, Spring Boot, Kafka, gRPC, FastAPI, Django, PostgreSQL, MySQL, TimescaleDB, Redis, Pinecone. CGPA 9.4. Surfaced Cloud & DevOps community, System Design Primer, FastAPI tutorial, Docker & Kubernetes. Mentor match pivoted to distributed systems profile.

**Satyansh** — his backend/AI stack detected cleanly. AI Builders community. LangChain, Groq, ChromaDB resources surfaced.

**Vaibhav** — his profile, his recommendations. Different from all three of ours.

Four teammates. Four completely different dashboards. Zero manual tagging. The judges uploaded a profile live, watched the spinner, and saw a personalized roadmap appear in under five seconds. That was the moment.

---

## Midpoint: The Judge Gave Us Three Feature Requests

About halfway through, a judge looked at what we had and said three things:

1. Add hardcoded communities with a sidebar switcher
2. Replace the "Direct Message" button with a Google Calendar-style availability widget
3. Add a community admin view

We said yes to all three and started building immediately.

---

## Building the GCal Widget in JSX (No External Library)

The mentor card had a "Direct Message" button. We replaced it with a weekly availability calendar that looks exactly like Google Calendar.

The trick: an IIFE inside JSX computes real Mon–Fri dates from `new Date()` at render time. Blue event blocks with left border accent — same visual pattern Google uses. Three mentors with different availability patterns. Click any slot and a booking modal fires with the full session details.

No external calendar library. No extra dependency. Just JavaScript and some careful CSS.

---

## The SQLite Migration

Judges asked: "is this community data in a database?"

It wasn't. It was a hardcoded JavaScript constant at the top of `page.tsx`.

Within an hour it was in SQLite. Built `db_service.py` with four tables:

```sql
communities          (id, name, icon, description, members)
community_channels   (id, community_id, channel_name)
community_events     (id, community_id, name, date)
resources            (resource_id, title, url, type, reason, duration, difficulty, relevance_score)
```

Seeding is idempotent — runs on startup, skips if already populated. Added `GET /api/communities` as a new endpoint. The frontend fetches it on mount with the hardcoded array as an instant fallback so there's no flash of empty content while the request is in flight.

37 real learning resources. 8 communities. All in a 150KB SQLite file. `sqlite3` is in the Python standard library — zero new dependencies.

---

## The Fallback Chain That Won Us the Hackathon

Honestly: it wasn't the six-agent architecture. It wasn't the GCal widget. The thing that won was the fallback chain.

Every layer of the system has a fallback:

- Groq rate-limited → switch to OpenRouter silently
- OpenRouter fails → return mock data
- Communities API slow → hardcoded array renders instantly
- Resume LLM parsing fails → keyword detection pass
- No resume uploaded → profile tags used directly

During the demo, Groq rate-limited mid-presentation. The system switched to OpenRouter without a flicker. The judges didn't notice. We didn't say anything.

A system that degrades gracefully looks more production-ready than a system with more features that occasionally crashes. Build the fallback before you build the feature.

---

## The Numbers

| Metric | Value |
|---|---|
| AI agents | 6 |
| Pipeline latency | ~3s (Groq), ~5s (OpenRouter) |
| Learning resources | 37 (all real URLs) |
| Communities | 8 |
| Data stores | 4 (SQLite, ChromaDB, users.json, tokens.json) |
| Mocked resource URLs | 0 |
| Resumes parsed correctly live | 4/4 |

---

## What I'd Do Differently

**Spend more time on the demo flow, less on features.** We added the SQLite migration because a judge asked. We should have anticipated that question and shipped it earlier.

**The compat layer was the right call.** Writing a shim between the agent output and the frontend contract meant we could iterate the agents without ever touching the frontend. That separation saved us probably two hours of cascading refactors.

**Four real resumes was the killer demo move.** Don't demo with fake data if you can demo with real data. The moment the judges saw their teammate's actual resume being parsed live, the conversation shifted from "interesting idea" to "this actually works."

---

*CommuneOS is open source. The repo is at [github.com/Satyanshgaur/CommuneOS](https://github.com/Satyanshgaur/CommuneOS). The tag `v1.0.0` is the hackathon build.*
