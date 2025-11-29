# Curriculum Curator Documentation

Documentation for Curriculum Curator - an AI-powered tool for creating pedagogically-sound course materials.

## Documentation Structure

```
docs/
├── adr/              # Architecture Decision Records
├── api/              # API reference documentation
├── concepts/         # Conceptual overviews
├── development/      # Development guides
├── guides/           # How-to guides
├── reference/        # Reference material
├── mocks/            # UI mockups
├── PRD-Development/  # PRD workflow process
└── archive/          # Historical planning docs
```

## Quick Links

| Document | Description |
|----------|-------------|
| [Getting Started](guides/getting-started.md) | Setup and first steps |
| [Architecture](concepts/architecture.md) | System design overview |
| [Deployment](guides/deployment.md) | Production deployment |
| [Development Guide](development/DEVELOPMENT_GUIDE.md) | Contributing to the project |
| [Security](SECURITY.md) | Security considerations |

## Key Documentation

### Architecture Decision Records (ADRs)
Located in [`adr/`](adr/) - documents important architectural decisions and their rationale.

### Product Requirements
- [PRD-Curriculum-Curator.md](PRD-Curriculum-Curator.md) - Main product requirements document

### Guides
- [Authentication & Security](guides/authentication-security.md)
- [Docker VPS Deployment](guides/docker-vps-deployment.md)
- [Email Configuration](guides/email-configuration.md)
- [Teaching Styles](guides/teaching-styles.md)

### Development
- [Development Guide](development/DEVELOPMENT_GUIDE.md)
- [Testing Guide](development/TESTING_GUIDE.md)
- [Git Migration Plan](development/GIT_MIGRATION_PLAN.md)

## Archive

Historical planning documents and migration plans are preserved in [`archive/`](archive/) for reference.
These include early UX analysis, migration plans from previous frameworks, and completed refactoring tasks.

## Related

- [CLAUDE.md](../CLAUDE.md) - AI assistant instructions for this project
- [backend/BACKEND_STATUS.md](../backend/BACKEND_STATUS.md) - Backend code status tracking
