"""
Content repository - coordinates SQLAlchemy metadata with Git content storage

Each unit has its own Git repository. The content body (markdown) is stored
in Git for version control. The database stores metadata and references to
the Git content.

Repository structure per unit:
    content_repos/{unit_id}/
    ├── .git/
    ├── weeks/
    │   └── week-01/
    │       └── lecture-{content_id}.md
    ├── assessments/
    │   └── assignment-{content_id}.md
    └── resources/
        └── notes-{content_id}.md
"""

import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.content import Content
from app.schemas.content import (
    ContentCreate,
    ContentMetadata,
    ContentResponse,
    ContentUpdate,
    ContentVersion,
)
from app.services.git_content_service import get_git_service


def _generate_git_path(
    content_type: str, content_id: str, week_number: int | None = None
) -> str:
    """
    Generate a path within unit repository for content.

    Args:
        content_type: Type of content (lecture, worksheet, assessment, etc.)
        content_id: Content identifier
        week_number: Optional week number for weekly content

    Returns:
        Relative path within unit repo
    """
    if week_number is not None:
        return f"weeks/week-{week_number:02d}/{content_type}-{content_id}.md"
    if content_type in ("assessment", "exam", "quiz", "assignment"):
        return f"assessments/{content_type}-{content_id}.md"
    return f"resources/{content_type}-{content_id}.md"


def _get_enum_value(value) -> str | None:
    """Safely get the value from an Enum or return the string as-is"""
    if value is None:
        return None
    return value.value if hasattr(value, "value") else str(value)


def _content_to_response(content: Content, body: str = "") -> ContentResponse:
    """Convert Content model to ContentResponse schema"""
    return ContentResponse(
        id=str(content.id),
        unit_id=str(content.unit_id),
        title=content.title,
        content_type=content.type,
        body=body,
        summary=content.summary,
        order_index=content.order_index,
        week_number=content.week_number,
        status=content.status,
        estimated_duration_minutes=content.estimated_duration_minutes,
        current_commit=content.current_commit,
        created_at=content.created_at,
        updated_at=content.updated_at,
    )


def _content_to_metadata(content: Content) -> ContentMetadata:
    """Convert Content model to ContentMetadata schema (no body)"""
    return ContentMetadata(
        id=str(content.id),
        unit_id=str(content.unit_id),
        title=content.title,
        content_type=content.type,
        summary=content.summary,
        order_index=content.order_index,
        week_number=content.week_number,
        status=content.status,
        estimated_duration_minutes=content.estimated_duration_minutes,
        created_at=content.created_at,
        updated_at=content.updated_at,
    )


def create_content(
    db: Session, unit_id: str, data: ContentCreate, user_email: str
) -> ContentResponse:
    """
    Create new content: saves to unit's Git repo and records metadata in SQLAlchemy.

    Args:
        db: Database session
        unit_id: The unit this content belongs to
        data: Content creation data (title, type, body, etc.)
        user_email: Email of user creating the content

    Returns:
        ContentResponse with body and metadata
    """
    content_id = str(uuid.uuid4())
    content_type = _get_enum_value(data.content_type) or "lecture"
    git_path = _generate_git_path(content_type, content_id, data.week_number)

    # Save content to unit's Git repository
    git_service = get_git_service()
    commit_hash = git_service.save_content(
        unit_id=unit_id,
        path=git_path,
        content=data.body,
        user_email=user_email,
        message=f"Created {content_type}: {data.title}",
    )

    # Save metadata to database
    content = Content(
        id=content_id,
        unit_id=unit_id,
        title=data.title,
        type=content_type,
        git_path=git_path,
        current_commit=commit_hash,
        summary=data.summary,
        order_index=data.order_index,
        week_number=data.week_number,
        estimated_duration_minutes=data.estimated_duration_minutes,
    )
    db.add(content)
    db.commit()
    db.refresh(content)

    return _content_to_response(content, body=data.body)


def get_content_by_id(
    db: Session, content_id: str, include_body: bool = True
) -> ContentResponse | None:
    """
    Get content by ID.

    Args:
        db: Database session
        content_id: Content ID
        include_body: Whether to fetch body from Git (default True)

    Returns:
        ContentResponse with body, or None if not found
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return None

    body = ""
    if include_body and content.git_path:
        try:
            git_service = get_git_service()
            body = git_service.get_content(str(content.unit_id), content.git_path)
        except FileNotFoundError:
            body = ""

    return _content_to_response(content, body=body)


def get_content_by_unit(
    db: Session, unit_id: str, week_number: int | None = None
) -> list[ContentMetadata]:
    """
    Get all content metadata for a unit (without bodies - for listings).

    Args:
        db: Database session
        unit_id: Unit ID
        week_number: Optional filter by week

    Returns:
        List of ContentMetadata (no body - faster for listings)
    """
    query = db.query(Content).filter(Content.unit_id == unit_id)

    if week_number is not None:
        query = query.filter(Content.week_number == week_number)

    # Order by week_number (nulls last), then order_index
    contents = query.order_by(
        Content.week_number.is_(None),
        Content.week_number,
        Content.order_index,
    ).all()

    return [_content_to_metadata(content) for content in contents]


def update_content(
    db: Session, content_id: str, data: ContentUpdate, user_email: str
) -> ContentResponse | None:
    """
    Update content: saves body to Git (if changed) and updates metadata.

    Args:
        db: Database session
        content_id: Content ID to update
        data: Fields to update
        user_email: Email of user making the update

    Returns:
        Updated ContentResponse, or None if not found
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return None

    unit_id = str(content.unit_id)

    # If body is being updated, save to Git
    if data.body is not None and content.git_path:
        git_service = get_git_service()
        commit_hash = git_service.save_content(
            unit_id=unit_id,
            path=content.git_path,
            content=data.body,
            user_email=user_email,
            message=f"Updated: {data.title or content.title}",
        )
        content.current_commit = commit_hash

    # Update non-None metadata fields
    if data.title is not None:
        content.title = data.title
    if data.summary is not None:
        content.summary = data.summary
    if data.order_index is not None:
        content.order_index = data.order_index
    if data.week_number is not None:
        content.week_number = data.week_number
    if data.status is not None:
        status_val = _get_enum_value(data.status)
        if status_val:
            content.status = status_val
    if data.estimated_duration_minutes is not None:
        content.estimated_duration_minutes = data.estimated_duration_minutes

    content.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(content)

    # Get body from Git
    body = ""
    if content.git_path:
        try:
            git_service = get_git_service()
            body = git_service.get_content(unit_id, content.git_path)
        except FileNotFoundError:
            pass

    return _content_to_response(content, body=body)


def delete_content(db: Session, content_id: str, user_email: str) -> bool:
    """
    Delete content from both Git and database.

    Args:
        db: Database session
        content_id: Content ID to delete
        user_email: Email of user performing deletion

    Returns:
        True if deleted, False if not found
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return False

    unit_id = str(content.unit_id)

    # Delete from Git
    if content.git_path:
        try:
            git_service = get_git_service()
            git_service.delete_content(unit_id, content.git_path, user_email)
        except FileNotFoundError:
            pass  # File already gone from Git

    # Delete from database
    db.delete(content)
    db.commit()
    return True


def get_content_history(
    db: Session, content_id: str, limit: int = 10
) -> list[ContentVersion]:
    """
    Get version history for content from Git.

    Args:
        db: Database session
        content_id: Content ID
        limit: Maximum number of versions to return

    Returns:
        List of ContentVersion objects
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content or not content.git_path:
        return []

    git_service = get_git_service()
    history = git_service.get_history(
        str(content.unit_id), content.git_path, limit=limit
    )

    return [
        ContentVersion(
            commit=entry["commit"],
            date=entry["date"],
            message=entry["message"],
            author_email=entry.get("author_email"),
        )
        for entry in history
    ]


def get_content_at_version(db: Session, content_id: str, commit: str) -> str | None:
    """
    Get content body at a specific version.

    Args:
        db: Database session
        content_id: Content ID
        commit: Git commit hash

    Returns:
        Content body at that version, or None if not found
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content or not content.git_path:
        return None

    try:
        git_service = get_git_service()
        return git_service.get_content(
            str(content.unit_id), content.git_path, commit=commit
        )
    except (FileNotFoundError, Exception):
        return None


def revert_content(
    db: Session, content_id: str, commit: str, user_email: str
) -> ContentResponse | None:
    """
    Revert content to a previous version.

    Args:
        db: Database session
        content_id: Content ID
        commit: Git commit hash to revert to
        user_email: Email of user performing revert

    Returns:
        Updated ContentResponse, or None if not found
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content or not content.git_path:
        return None

    unit_id = str(content.unit_id)
    git_service = get_git_service()
    new_commit = git_service.revert_to_commit(
        unit_id, content.git_path, commit, user_email
    )

    # Update current_commit
    content.current_commit = new_commit
    content.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(content)

    return get_content_by_id(db, content_id)


def get_content_diff(
    db: Session, content_id: str, old_commit: str, new_commit: str = "HEAD"
) -> str | None:
    """
    Get diff between two versions.

    Args:
        db: Database session
        content_id: Content ID
        old_commit: Old commit hash
        new_commit: New commit hash (default HEAD)

    Returns:
        Diff string, or None if not found
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content or not content.git_path:
        return None

    git_service = get_git_service()
    return git_service.diff(
        str(content.unit_id), content.git_path, old_commit, new_commit
    )


def content_exists(db: Session, content_id: str) -> bool:
    """Check if content exists"""
    return db.query(Content).filter(Content.id == content_id).first() is not None


def get_content_unit_id(db: Session, content_id: str) -> str | None:
    """Get the unit_id for a content item"""
    content = db.query(Content).filter(Content.id == content_id).first()
    return str(content.unit_id) if content else None


def get_content_count_by_unit(db: Session, unit_id: str) -> int:
    """Get count of content items for a unit"""
    return db.query(Content).filter(Content.unit_id == unit_id).count()


def reorder_content(db: Session, unit_id: str, content_ids: list[str]) -> bool:
    """Reorder content items for a unit"""
    for index, content_id in enumerate(content_ids):
        db.query(Content).filter(
            Content.id == content_id,
            Content.unit_id == unit_id,
        ).update({"order_index": index})

    db.commit()
    return True


def delete_unit_content(db: Session, unit_id: str, user_email: str) -> int:
    """
    Delete all content for a unit (including Git repository).

    Args:
        db: Database session
        unit_id: Unit ID
        user_email: Email of user performing deletion

    Returns:
        Number of content items deleted
    """
    # Count content items
    count = db.query(Content).filter(Content.unit_id == unit_id).count()

    # Delete from database
    db.query(Content).filter(Content.unit_id == unit_id).delete()
    db.commit()

    # Delete Git repository
    git_service = get_git_service()
    git_service.delete_unit_repo(unit_id)

    return count


def get_unit_content_stats(db: Session, unit_id: str) -> dict:
    """
    Get statistics for a unit's content.

    Args:
        db: Database session
        unit_id: Unit ID

    Returns:
        Dictionary with content statistics
    """
    content_count = db.query(Content).filter(Content.unit_id == unit_id).count()

    # Get Git repository stats
    git_service = get_git_service()
    git_stats = git_service.get_unit_stats(unit_id)

    return {
        "content_count": content_count,
        "git_stats": git_stats,
    }
