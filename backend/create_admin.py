#!/usr/bin/env python3
"""Create an admin user for testing"""

import sys
import traceback
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core import security
from app.core.database import Base, SessionLocal, engine
from app.models import TeachingPhilosophy, User, UserRole


def ensure_tables():
    """Ensure database tables exist"""
    # Import all models to register them

    Base.metadata.create_all(bind=engine)


def create_admin(email: str, password: str, name: str):
    """Create an admin user"""
    ensure_tables()
    db = SessionLocal()

    try:
        # Check if user exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            # Update to admin
            existing.role = UserRole.ADMIN.value
            existing.is_verified = True
            existing.is_active = True
            db.commit()
            print(f"✅ User {email} updated to admin!")
            return

        # Create admin user
        user = User(
            id=uuid.uuid4(),
            email=email,
            name=name,
            password_hash=security.get_password_hash(password),
            is_active=True,
            is_verified=True,
            role=UserRole.ADMIN.value,
            teaching_philosophy=TeachingPhilosophy.MIXED_APPROACH.value,
        )

        db.add(user)
        db.commit()
        print(f"✅ Admin user {email} created successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Create admin user")
    parser.add_argument(
        "--email", default="admin@curriculum-curator.com", help="Admin email"
    )
    parser.add_argument("--password", default="Admin123!Pass", help="Admin password")
    parser.add_argument("--name", default="Admin User", help="Admin name")
    args = parser.parse_args()

    create_admin(args.email, args.password, args.name)
