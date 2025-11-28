#!/bin/bash

# Curriculum Curator Setup Script
# This script prepares the environment for first-time deployment

set -e  # Exit on error

echo "=================================="
echo "Curriculum Curator Setup"
echo "=================================="
echo ""

# Create data directories
echo "📁 Creating data directories..."
mkdir -p data/{db,uploads,logs,content_repo}

# Set permissions for Docker container user (UID 1000)
# Try to set ownership, but don't fail if user doesn't have permission
if chown -R 1000:1000 data/ 2>/dev/null; then
    echo "✓ Created data/{db,uploads,logs,content_repo} with correct permissions"
else
    echo "✓ Created data/{db,uploads,logs,content_repo}"
    echo "⚠️  Could not set ownership to UID 1000 - you may need to run:"
    echo "   sudo chown -R 1000:1000 data/"
fi
echo ""

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "🔐 Generating backend/.env file..."

    # Generate a secure random secret key
    SECRET_KEY=$(openssl rand -hex 32)

    cat > backend/.env <<EOF
# Auto-generated environment file
# Edit this file to configure SMTP and other settings

# Security - CHANGE IN PRODUCTION!
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./data/curriculum_curator.db

# Debug mode
DEBUG=false

# Email Settings (Optional)
# EMAIL_PROVIDER=dev
# SMTP_HOST=
# SMTP_PORT=587
# SMTP_USERNAME=
# SMTP_PASSWORD=
# FROM_EMAIL=noreply@curriculum-curator.com
# FROM_NAME=Curriculum Curator

# LLM API Keys (Optional - can be configured in app)
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
EOF

    echo "✓ Created backend/.env with generated SECRET_KEY"
    echo ""
else
    echo "✓ backend/.env already exists"
    echo ""
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Summary
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Review and edit backend/.env if you want to configure SMTP or LLM API keys"
echo "2. Build and start the container:"
echo "   docker compose build"
echo "   docker compose up -d"
echo "3. Check the logs:"
echo "   docker compose logs -f"
echo ""
echo "The app will be available at http://localhost:8081"
echo ""
echo "For production deployment with Caddy reverse proxy,"
echo "see DEPLOYMENT.md for detailed instructions."
echo ""
