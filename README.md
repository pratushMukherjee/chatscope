# ChatScope

A full-stack AI-powered research assistant that demonstrates production-quality engineering with React, FastAPI, PostgreSQL, and the OpenAI API.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, TanStack Query, Zustand |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), AsyncPG |
| Database | PostgreSQL 16 + pgvector (vector embeddings) |
| AI | OpenAI API (GPT-4o, text-embedding-3-small, Moderation API) |
| Infra | Docker Compose (PostgreSQL, Redis, Backend, Frontend) |

## Features

### Core
- **Real-time AI Chat** — SSE streaming with token-by-token response rendering
- **RAG (Retrieval Augmented Generation)** — Upload documents (PDF, TXT, MD), automatically chunk and embed them, then chat with context-aware responses using pgvector cosine similarity search
- **Conversation Management** — Create, list, rename, delete conversations with persistent history

### Productivity
- **Prompt Templates** — Browse pre-built templates (coding, writing, analysis, research, learning) or create custom ones with `{{variable}}` placeholders
- **Conversation Sharing** — Generate public links to share conversations read-only
- **Model Selection** — Toggle between GPT-4o (most capable) and GPT-4o-mini (fast)

### Security & Reliability
- **JWT Authentication** — Bcrypt password hashing, access/refresh token rotation, silent refresh on 401
- **Content Moderation** — OpenAI Moderation API checks all user messages before processing
- **Rate Limiting** — SlowAPI with Redis backend, per-endpoint configurable limits
- **Input Validation** — Max message length, file type/size restrictions, Pydantic schemas

### UX
- **Markdown Rendering** — GitHub-Flavored Markdown with syntax-highlighted code blocks and copy button
- **Dark Mode** — Toggle between light and dark themes
- **Responsive Design** — Mobile-first with bottom navigation, collapsible sidebar
- **Optimistic Updates** — Immediate UI feedback before server confirmation

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React 18   │────>│   FastAPI    │────>│ PostgreSQL   │
│   Vite       │ SSE │   Python     │     │ + pgvector   │
│   Tailwind   │<────│   Async      │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │    Redis     │
                     │ Rate Limiting│
                     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  OpenAI API  │
                     │ GPT-4o, Emb  │
                     │ Moderation   │
                     └──────────────┘
```

## Quick Start

### Prerequisites

- Docker Desktop
- OpenAI API key

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/chatscope.git
cd chatscope

# 2. Create .env from example
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY and a JWT_SECRET_KEY

# 3. Start everything
docker compose up --build

# 4. Open the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs (Swagger): http://localhost:8000/docs
```

### Local Development (without Docker)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
chatscope/
├── docker-compose.yml          # PostgreSQL + Redis + Backend + Frontend
├── .env.example                # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios API client + endpoint functions
│   │   ├── hooks/              # useChat (SSE), useConversations, useDocuments
│   │   ├── store/              # Zustand: auth, chat, UI state
│   │   ├── components/
│   │   │   ├── auth/           # Login, Register, ProtectedRoute
│   │   │   ├── chat/           # ChatWindow, MessageBubble, StreamingMessage, ChatInput
│   │   │   ├── documents/      # Upload, List, Chip
│   │   │   ├── templates/      # Gallery, Card, Editor
│   │   │   ├── conversations/  # ConversationItem, ShareDialog
│   │   │   ├── layout/         # AppLayout, Sidebar, Header, MobileNav
│   │   │   └── ui/             # Button, Input, Spinner, ErrorBoundary
│   │   ├── pages/              # Login, Register, Chat, Documents, Templates, Shared, 404
│   │   └── utils/              # Markdown config, formatters, validators
│   └── package.json
│
├── backend/
│   └── app/
│       ├── main.py             # FastAPI app factory with middleware stack
│       ├── config.py           # Pydantic Settings (all env vars)
│       ├── core/               # Database, Security (JWT), OpenAI client, Redis
│       ├── models/             # User, Conversation, Message, Document, DocumentChunk, Template
│       ├── schemas/            # Pydantic request/response models
│       ├── api/                # Route handlers (auth, chat, conversations, documents, templates, share)
│       ├── services/           # Business logic (chat streaming, document processing, RAG, moderation)
│       ├── middleware/         # Rate limiting, content safety, error handling, request logging
│       └── utils/              # Text splitter, PDF parser, token counter
│
└── scripts/
    └── seed_templates.py       # Seed default prompt templates
```

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Get JWT tokens | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/conversations` | List conversations (paginated) | Yes |
| POST | `/api/conversations` | Create conversation | Yes |
| GET | `/api/conversations/:id` | Get conversation detail | Yes |
| PATCH | `/api/conversations/:id` | Update title | Yes |
| DELETE | `/api/conversations/:id` | Delete conversation | Yes |
| GET | `/api/conversations/:id/messages` | Get messages (cursor-paginated) | Yes |
| POST | `/api/conversations/:id/share` | Toggle sharing | Yes |
| POST | `/api/chat/stream` | Send message + stream response (SSE) | Yes |
| POST | `/api/documents/upload` | Upload document (multipart) | Yes |
| GET | `/api/documents` | List documents | Yes |
| DELETE | `/api/documents/:id` | Delete document | Yes |
| GET | `/api/templates` | List prompt templates | Yes |
| POST | `/api/templates` | Create custom template | Yes |
| DELETE | `/api/templates/:id` | Delete custom template | Yes |
| GET | `/api/share/:slug` | View shared conversation | No |
| GET | `/health` | Health check | No |

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| SSE over WebSocket | Simpler for unidirectional streaming, no connection upgrade needed, works through proxies |
| pgvector over dedicated vector DB | Keeps everything in PostgreSQL, reduces infrastructure, SQL-based querying |
| Zustand over Redux | Minimal boilerplate, no providers needed, perfect for small-medium state |
| TanStack Query for server state | Automatic caching, background refetching, optimistic updates |
| AsyncPG over psycopg2 | True async I/O for FastAPI, better performance under concurrent load |
| Cursor pagination for messages | More efficient than offset for append-only data, no skipping issues |

## Safety Features

- **Content Moderation**: All user messages are checked via OpenAI's Moderation API before processing
- **Rate Limiting**: Configurable per-minute limits per endpoint with Redis-backed tracking
- **Input Validation**: Maximum message length (4000 chars), file size limits (10MB), allowed file types only
- **JWT Security**: Short-lived access tokens (30min), refresh rotation, bcrypt password hashing
- **CORS**: Configurable allowed origins
- **Error Boundaries**: React ErrorBoundary prevents white screens, FastAPI global exception handler returns consistent JSON errors
