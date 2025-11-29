# Curriculum Curator

> A pedagogically-aware course content platform that empowers educators to create, curate, and enhance educational materials aligned with their unique teaching philosophy.

![Python](https://img.shields.io/badge/python-3.12%2B-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

Curriculum Curator is an AI-powered platform designed to help educators create and manage course content. By aligning with different pedagogical philosophies and leveraging LLMs, it helps teachers generate high-quality, pedagogically-sound educational materials.

**Note**: This application uses Australian university terminology where a **Unit** is an individual subject (e.g., "Programming 101") and a **Course** is a degree program.

## Key Features

- **9 Teaching Philosophies**: Traditional, Inquiry-Based, Project-Based, Collaborative, Game-Based, Flipped, Differentiated, Constructivist, Experiential
- **AI-Powered Content**: Generation, enhancement, and validation using multiple LLM providers (OpenAI, Anthropic, Ollama)
- **Multi-Scale Workflows**: Create 12-week unit structures, weekly modules, or individual materials
- **Rich Text Editing**: TipTap-based editor with tables, code blocks, and formatting
- **Plugin System**: Extensible validators and remediators for content quality (planned)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, SQLAlchemy, LiteLLM |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Editor | TipTap |
| Database | SQLite (PostgreSQL ready) |
| Auth | JWT with email verification |

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/curriculum-curator.git
cd curriculum-curator

# Start backend (handles venv, deps, and server)
./backend.sh

# In a new terminal, start frontend
./frontend.sh
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Docker Deployment

```bash
./setup.sh                    # Create data directories and configure
docker compose up --build -d  # Build and run
```

For production deployment, see [docs/guides/docker-vps-deployment.md](docs/guides/docker-vps-deployment.md).

## Project Structure

```
curriculum-curator/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── core/            # Config, security, database
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic, LLM service
│   │   └── plugins/         # Validators & remediators (planned)
│   └── tests/
├── frontend/                # React frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── features/        # Feature modules (auth, units, content)
│       ├── services/        # API integration
│       └── hooks/           # Custom React hooks
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── tasks/                   # Planning & task tracking
└── docker-compose.yml
```

## Development

### Code Quality

```bash
# Backend
cd backend
uv run ruff check .          # Linting
uv run ruff format .         # Formatting  
uv run basedpyright          # Type checking
uv run pytest                # Tests

# Frontend
cd frontend
npm run lint                 # ESLint
npm run format               # Prettier
npm run type-check           # TypeScript
npm test                     # Tests
```

### API Examples

```bash
# Generate content
POST /api/ai/generate
{
  "content_type": "lecture",
  "pedagogy_style": "inquiry-based",
  "topic": "Introduction to Python",
  "stream": true
}

# Enhance content
POST /api/ai/enhance
{
  "content": "...",
  "enhancement_type": "improve",
  "pedagogy_style": "constructivist"
}

# Unit management
GET /api/units
POST /api/units
```

## Configuration

Create `.env` in the backend directory:

```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./curriculum_curator.db
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## Documentation

- [Getting Started](docs/guides/getting-started.md)
- [Architecture](docs/concepts/architecture.md)
- [Development Guide](docs/development/DEVELOPMENT_GUIDE.md)
- [API Reference](docs/api/README.md)
- [Security](docs/SECURITY.md)

## License

MIT License - see [LICENSE](LICENSE)
