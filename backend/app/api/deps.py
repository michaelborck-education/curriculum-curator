"""
Database and authentication dependencies for FastAPI routes
"""

import logging
from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models import Content, Unit, User, UserRole

# Set up logger
logger = logging.getLogger(__name__)

# Use HTTPBearer instead of OAuth2PasswordBearer - simpler, no OAuth2 complexity
security = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Get current user from JWT token."""
    logger.info("[AUTH] ===== STARTING AUTHENTICATION =====")
    logger.info(f"[AUTH] Credentials type: {type(credentials)}")
    logger.info(f"[AUTH] Credentials: {credentials}")
    token = credentials.credentials
    logger.info(f"[AUTH] Got token: {token[:20]}...")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token - no IP verification for now
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str | None = payload.get("sub")
        logger.info(f"[AUTH] Decoded user_id: {user_id}")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        # JWT decode error - invalid token
        logger.exception("[AUTH] JWT decode failed")
        raise credentials_exception from None

    # Fetch the user from the database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        logger.error(f"[AUTH] User not found for id: {user_id}")
        raise credentials_exception

    logger.info(f"[AUTH] Found user: {user.email}, role: {user.role}")
    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_admin_user(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """Get current user and verify admin role."""
    logger.info(
        f"[ADMIN CHECK] User {current_user.email} has role: '{current_user.role}', expected: '{UserRole.ADMIN.value}'"
    )

    # Re-enable admin check
    if current_user.role != UserRole.ADMIN.value:
        logger.error(
            f"[ADMIN DENIED] {current_user.email} role '{current_user.role}' != '{UserRole.ADMIN.value}'"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required"
        )
    logger.info(f"[ADMIN ALLOWED] User {current_user.email} has admin privileges")
    return current_user


def get_user_or_admin_override(
    resource_owner_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> bool:
    """
    Check if user owns resource or is admin.
    Returns True if access should be granted.
    """
    # Admin can access everything
    if current_user.role == UserRole.ADMIN.value:
        return True

    # User can only access their own resources
    return str(current_user.id) == str(resource_owner_id)


# =============================================================================
# Resource Ownership Dependencies
# =============================================================================


def get_user_unit(
    unit_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> Unit:
    """
    Get a unit that belongs to the current user.
    Raises 404 if unit not found or user doesn't own it.
    """
    unit = (
        db.query(Unit)
        .filter(Unit.id == unit_id)
        .filter(Unit.owner_id == current_user.id)
        .first()
    )

    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or access denied",
        )

    return unit


def get_user_content(
    content_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> Content:
    """
    Get content that belongs to the current user (via unit ownership).
    Raises 404 if content not found or user doesn't own the parent unit.
    """
    content = (
        db.query(Content)
        .join(Unit, Content.unit_id == Unit.id)
        .filter(Content.id == content_id)
        .filter(Unit.owner_id == current_user.id)
        .first()
    )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found or access denied",
        )

    return content


def get_user_unit_by_path(
    unit_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> Unit:
    """
    Alias for get_user_unit - use when unit_id comes from path parameter.
    """
    return get_user_unit(unit_id, db, current_user)
