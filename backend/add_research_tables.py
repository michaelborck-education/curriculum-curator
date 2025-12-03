"""
Script to add research source and citation tables to the database.
Run this after dropping the database to create the new tables.
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import Base, engine
from app.models.research_source import ResearchSource, ContentCitation
from app.models.user import User
from app.models.unit import Unit
from app.models.content import Content


def create_research_tables():
    """Create research source and citation tables."""
    print("Creating research source and citation tables...")

    # Create all tables
    Base.metadata.create_all(bind=engine)

    print("✅ Research source and citation tables created successfully!")
    print("")
    print("Tables created:")
    print("  - research_sources")
    print("  - content_citations")
    print("")
    print("Relationships added:")
    print("  - User.research_sources")
    print("  - Unit.research_sources")
    print("  - Content.citations")


if __name__ == "__main__":
    create_research_tables()
