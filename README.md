# ChatScope

An AI-powered research assistant built with React, FastAPI, PostgreSQL, and the OpenAI API.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, TanStack Query, Zustand |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 + pgvector |
| AI | OpenAI API (GPT-4o, Embeddings, Moderation) |
| Infra | Docker Compose |

## Features

- Real-time AI chat with SSE streaming
- RAG: Upload documents and chat with them (pgvector)
- JWT authentication with refresh tokens
- Conversation history and sharing
- Prompt templates gallery
- Rate limiting and content moderation
- Responsive design with dark mode

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
# Edit .env and add your OPENAI_API_KEY

# 3. Start everything
docker compose up --build

# 4. Open the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API docs: http://localhost:8000/docs
```

## Project Structure

```
chatscope/
├── frontend/          # React + Vite + Tailwind
├── backend/           # FastAPI + SQLAlchemy
├── docker-compose.yml # PostgreSQL + Redis + App
└── .env.example       # Environment variables
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Create conversation |
| POST | `/api/chat/stream` | Send message (SSE streaming) |
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents` | List documents |
| GET | `/api/templates` | List prompt templates |
| GET | `/api/share/{slug}` | View shared conversation |
| GET | `/health` | Health check |
