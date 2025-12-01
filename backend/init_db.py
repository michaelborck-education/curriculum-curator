#!/usr/bin/env python3
"""
Database initialization script for Curriculum Curator
Creates tables and loads sample data for development
"""

import sys
import traceback
import uuid
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash

# Import all models to register them with SQLAlchemy
from app.models import (
    PedagogyType,
    TeachingPhilosophy,
    Unit,
    UnitStatus,
    User,
    UserRole,
)


def init_db():
    """Initialize database with tables and sample data"""
    print("🚀 Initializing Curriculum Curator Database...")

    # Ensure data directory exists for SQLite
    if "sqlite" in settings.DATABASE_URL:
        db_path = settings.DATABASE_URL.replace("sqlite:///", "").replace("./", "")
        db_dir = Path(db_path).parent
        if db_dir and str(db_dir) != ".":
            db_dir = Path(__file__).parent / db_dir
            db_dir.mkdir(parents=True, exist_ok=True)
            print(f"📁 Ensured data directory exists: {db_dir}")

    # Create all tables
    print("📊 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")

    # Create a session
    db = SessionLocal()

    try:
        # Check if we already have data
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(
                f"[INFO] Database already contains {existing_users} users. Skipping sample data."
            )
            return

        print("\n📝 Creating sample data...")

        # Create sample users
        print("👥 Creating users...")

        # Admin user
        admin = User(
            id=uuid.uuid4(),
            email="admin@curriculum-curator.edu.au",
            password_hash=get_password_hash("admin123"),
            name="System Administrator",
            role=UserRole.ADMIN.value,
            is_verified=True,
            is_active=True,
            institution="Curriculum Curator",
            teaching_philosophy=TeachingPhilosophy.MIXED_APPROACH.value,
            language_preference="en-AU",
        )
        db.add(admin)

        # Sample lecturer
        lecturer = User(
            id=uuid.uuid4(),
            email="lecturer@university.edu.au",
            password_hash=get_password_hash("password123"),
            name="Dr. Sarah Chen",
            role=UserRole.LECTURER.value,
            is_verified=True,
            is_active=True,
            institution="University of Technology",
            department="Computer Science",
            position_title="Senior Lecturer",
            teaching_philosophy=TeachingPhilosophy.FLIPPED_CLASSROOM.value,
            language_preference="en-AU",
        )
        db.add(lecturer)

        db.commit()
        print("✅ Users created")

        # Create sample unit
        print("\n📚 Creating sample unit...")

        unit = Unit(
            id=uuid.uuid4(),
            title="Introduction to Python Programming",
            code="CS101",
            description="Learn Python fundamentals through hands-on practice",
            pedagogy_type=PedagogyType.INQUIRY_BASED.value,
            status=UnitStatus.ACTIVE.value,
            semester="2024-S1",
            year=2024,
            credit_points=6,
            duration_weeks=12,
            owner_id=lecturer.id,
            created_by_id=lecturer.id,
        )
        db.add(unit)
        db.commit()
        print("✅ Unit created")

        print("\n🎉 Database initialization complete!")
        print("\n📊 Summary:")
        print(f"  - Users: {db.query(User).count()}")
        print(f"  - Units: {db.query(Unit).count()}")

        print("\n🔑 Test Credentials:")
        print("  Admin: admin@curriculum-curator.edu.au / admin123")
        print("  Lecturer: lecturer@university.edu.au / password123")

    except Exception as e:
        print(f"\n❌ Error during initialization: {e}")
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


def reset_db():
    """Drop all tables and recreate them"""
    print("⚠️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ Tables dropped")
    init_db()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Initialize Curriculum Curator database"
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Reset database (delete all data and recreate)",
    )
    args = parser.parse_args()

    if args.reset:
        print("⚠️  WARNING: This will delete all existing data!")
        response = input("Are you sure? Type 'yes' to continue: ")
        if response.lower() == "yes":
            reset_db()
        else:
            print("Aborted.")
    else:
        init_db()
