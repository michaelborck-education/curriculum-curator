"""
Content API routes - CRUD operations for unit content (lectures, worksheets, etc.)

Content bodies are stored in Git for version control.
Metadata is stored in SQLAlchemy for fast querying.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.repositories import content_repo, unit_repo
from app.schemas.content import (
    ContentCreate,
    ContentDiff,
    ContentHistory,
    ContentList,
    ContentResponse,
    ContentRevertRequest,
    ContentUpdate,
)
from app.schemas.user import UserResponse

router = APIRouter()


# =============================================================================
# Content CRUD Operations
# =============================================================================


@router.post("", response_model=ContentResponse)
async def create_content(
    unit_id: str,
    data: ContentCreate,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
):
    """
    Create new content for a unit.

    The content body (markdown) is saved to Git for version control.
    Metadata is saved to the database.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    return content_repo.create_content(
        db,
        unit_id=unit_id,
        data=data,
        user_email=current_user.email,
    )


@router.get("", response_model=ContentList)
async def list_content(
    unit_id: str,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
    week: int | None = None,
):
    """
    List all content for a unit.

    Returns metadata only (no bodies) for faster loading.
    Optionally filter by week number.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    contents = content_repo.get_content_by_unit(db, unit_id, week_number=week)
    return ContentList(contents=contents, total=len(contents))


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    unit_id: str,
    content_id: str,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
):
    """
    Get a single content item with its body.

    The body is fetched from Git.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    content = content_repo.get_content_by_id(db, content_id)
    if not content or content.unit_id != unit_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    return content


@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    unit_id: str,
    content_id: str,
    data: ContentUpdate,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
):
    """
    Update content.

    If the body is changed, a new version is saved to Git.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    # Verify content belongs to this unit
    existing = content_repo.get_content_by_id(db, content_id, include_body=False)
    if not existing or existing.unit_id != unit_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    content = content_repo.update_content(
        db,
        content_id=content_id,
        data=data,
        user_email=current_user.email,
    )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update content",
        )

    return content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    unit_id: str,
    content_id: str,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
):
    """
    Delete content.

    Removes from both Git and database.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    # Verify content belongs to this unit
    existing_unit_id = content_repo.get_content_unit_id(db, content_id)
    if existing_unit_id != unit_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    if not content_repo.delete_content(db, content_id, current_user.email):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )


# =============================================================================
# Version History Operations
# =============================================================================


@router.get("/{content_id}/history", response_model=ContentHistory)
async def get_content_history(
    unit_id: str,
    content_id: str,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
    limit: int = 10,
):
    """
    Get version history for content.

    Returns a list of previous versions from Git.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    # Verify content belongs to this unit
    existing_unit_id = content_repo.get_content_unit_id(db, content_id)
    if existing_unit_id != unit_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    versions = content_repo.get_content_history(db, content_id, limit=limit)
    return ContentHistory(content_id=content_id, versions=versions)


@router.get("/{content_id}/version/{commit}")
async def get_content_at_version(
    unit_id: str,
    content_id: str,
    commit: str,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
):
    """
    Get content body at a specific version.

    Returns the markdown content at the specified Git commit.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    # Verify content belongs to this unit
    existing_unit_id = content_repo.get_content_unit_id(db, content_id)
    if existing_unit_id != unit_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    body = content_repo.get_content_at_version(db, content_id, commit)
    if body is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found",
        )

    return {"commit": commit, "body": body}


@router.get("/{content_id}/diff", response_model=ContentDiff)
async def get_content_diff(
    unit_id: str,
    content_id: str,
    old_commit: str,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
    new_commit: str = "HEAD",
):
    """
    Get diff between two versions.

    Returns a Git-style diff between two commits.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    # Verify content belongs to this unit
    existing_unit_id = content_repo.get_content_unit_id(db, content_id)
    if existing_unit_id != unit_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    diff = content_repo.get_content_diff(db, content_id, old_commit, new_commit)
    if diff is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not generate diff",
        )

    return ContentDiff(
        content_id=content_id,
        old_commit=old_commit,
        new_commit=new_commit,
        diff=diff,
    )


@router.post("/{content_id}/revert", response_model=ContentResponse)
async def revert_content(
    unit_id: str,
    content_id: str,
    data: ContentRevertRequest,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[UserResponse, Depends(deps.get_current_active_user)],
):
    """
    Revert content to a previous version.

    Creates a new commit that restores the content from the specified version.
    """
    # Verify user has access to this unit
    unit = unit_repo.get_unit_by_id(db, unit_id)
    if not unit or (unit.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    # Verify content belongs to this unit
    existing_unit_id = content_repo.get_content_unit_id(db, content_id)
    if existing_unit_id != unit_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    content = content_repo.revert_content(
        db, content_id, data.commit, current_user.email
    )
    if not content:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revert content",
        )

    return content
