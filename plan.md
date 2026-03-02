# ChatScope — AI-Powered Research Assistant

## Context

Build a full-stack portfolio project that directly maps to every requirement in the OpenAI Applied Engineering Internship posting. The project demonstrates: React + JavaScript frontend, Python (FastAPI) backend, PostgreSQL with pgvector, OpenAI API integration (streaming, embeddings, moderation), end-to-end product quality, speed/scale optimization, and safety/reliability features.

**Why this project wins:** It's literally a mini-ChatGPT clone with RAG — the exact product the Applied team builds. It shows you can build what they ship.

## Tech Stack

- **Frontend:** React 18 + Vite + TanStack Query + Zustand + Tailwind CSS
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy 2.0 (async) + AsyncPG
- **Database:** PostgreSQL 16 + pgvector extension
- **AI:** OpenAI API (GPT-4o chat, text-embedding-3-small, Moderation API)
- **Infra:** Docker Compose (postgres + redis + backend + frontend)

## Phases

### Phase 1: Scaffolding + Database + Auth
- FastAPI app factory, Pydantic Settings, async SQLAlchemy
- User model, JWT auth (bcrypt + access/refresh tokens)
- Auth endpoints, rate limiting, error handling
- React + Vite + Tailwind, Zustand auth store, login/register UI

### Phase 2: Core Chat with OpenAI Streaming
- Conversation + Message models
- SSE streaming chat endpoint with OpenAI GPT-4o
- Full chat UI: streaming messages, markdown, code highlighting
- Conversation sidebar, model selector

### Phase 3: RAG Document Upload & Retrieval
- Document + DocumentChunk models (pgvector)
- PDF parsing, text chunking, batch embedding
- Vector similarity search for context injection
- Drag-and-drop upload UI, document management

### Phase 4: Sharing, Templates & Polish
- Conversation sharing via public links
- Prompt templates gallery with categories
- Mobile-responsive navigation

### Phase 5: Safety, Optimization & Production
- OpenAI Moderation API for content safety
- Performance: lazy loading, connection pooling, caching
- Dark mode, accessibility, comprehensive README
