"""
API endpoints for accreditation mappings (Graduate Capabilities and AoL)
"""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api import deps
from app.models.accreditation_mappings import (
    ULOGraduateCapabilityMapping,
    UnitAoLMapping,
)
from app.models.learning_outcome import UnitLearningOutcome
from app.models.unit import Unit
from app.models.user import User
from app.schemas.accreditation import (
    AoLMappingCreate,
    AoLMappingResponse,
    AoLMappingSummary,
    BulkAoLMappingCreate,
    BulkGraduateCapabilityMappingCreate,
    GraduateCapabilityMappingCreate,
    GraduateCapabilityMappingResponse,
)

router = APIRouter()


# ============= Graduate Capability Mappings (ULO-level) =============


@router.get(
    "/ulos/{ulo_id}/graduate-capabilities",
    response_model=list[GraduateCapabilityMappingResponse],
)
async def get_ulo_graduate_capabilities(
    ulo_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all Graduate Capability mappings for a ULO"""
    # Verify ULO exists
    ulo = db.execute(
        select(UnitLearningOutcome).where(UnitLearningOutcome.id == str(ulo_id))
    ).scalar_one_or_none()

    if not ulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ULO not found",
        )

    mappings = (
        db.execute(
            select(ULOGraduateCapabilityMapping).where(
                ULOGraduateCapabilityMapping.ulo_id == str(ulo_id)
            )
        )
        .scalars()
        .all()
    )

    return [
        GraduateCapabilityMappingResponse(
            id=str(m.id),
            ulo_id=str(m.ulo_id),
            capability_code=m.capability_code,
            is_ai_suggested=m.is_ai_suggested,
            notes=m.notes,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
        for m in mappings
    ]


@router.post(
    "/ulos/{ulo_id}/graduate-capabilities",
    response_model=GraduateCapabilityMappingResponse,
)
async def add_ulo_graduate_capability(
    ulo_id: UUID,
    mapping_data: GraduateCapabilityMappingCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Add a Graduate Capability mapping to a ULO"""
    # Verify ULO exists
    ulo = db.execute(
        select(UnitLearningOutcome).where(UnitLearningOutcome.id == str(ulo_id))
    ).scalar_one_or_none()

    if not ulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ULO not found",
        )

    # Check if mapping already exists
    existing = db.execute(
        select(ULOGraduateCapabilityMapping).where(
            ULOGraduateCapabilityMapping.ulo_id == str(ulo_id),
            ULOGraduateCapabilityMapping.capability_code
            == mapping_data.capability_code.value,
        )
    ).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ULO already mapped to {mapping_data.capability_code.value}",
        )

    # Create mapping
    mapping = ULOGraduateCapabilityMapping(
        ulo_id=str(ulo_id),
        capability_code=mapping_data.capability_code.value,
        is_ai_suggested=mapping_data.is_ai_suggested,
        notes=mapping_data.notes,
    )
    db.add(mapping)
    db.commit()
    db.refresh(mapping)

    return GraduateCapabilityMappingResponse(
        id=str(mapping.id),
        ulo_id=str(mapping.ulo_id),
        capability_code=mapping.capability_code,
        is_ai_suggested=mapping.is_ai_suggested,
        notes=mapping.notes,
        created_at=mapping.created_at,
        updated_at=mapping.updated_at,
    )


@router.put(
    "/ulos/{ulo_id}/graduate-capabilities",
    response_model=list[GraduateCapabilityMappingResponse],
)
async def update_ulo_graduate_capabilities(
    ulo_id: UUID,
    bulk_data: BulkGraduateCapabilityMappingCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Replace all Graduate Capability mappings for a ULO"""
    # Verify ULO exists
    ulo = db.execute(
        select(UnitLearningOutcome).where(UnitLearningOutcome.id == str(ulo_id))
    ).scalar_one_or_none()

    if not ulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ULO not found",
        )

    # Delete existing mappings
    db.execute(
        delete(ULOGraduateCapabilityMapping).where(
            ULOGraduateCapabilityMapping.ulo_id == str(ulo_id)
        )
    )

    # Create new mappings
    new_mappings = []
    for code in bulk_data.capability_codes:
        mapping = ULOGraduateCapabilityMapping(
            ulo_id=str(ulo_id),
            capability_code=code.value,
            is_ai_suggested=bulk_data.is_ai_suggested,
        )
        db.add(mapping)
        new_mappings.append(mapping)

    db.commit()

    # Refresh all mappings
    for m in new_mappings:
        db.refresh(m)

    return [
        GraduateCapabilityMappingResponse(
            id=str(m.id),
            ulo_id=str(m.ulo_id),
            capability_code=m.capability_code,
            is_ai_suggested=m.is_ai_suggested,
            notes=m.notes,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
        for m in new_mappings
    ]


@router.delete("/ulos/{ulo_id}/graduate-capabilities/{capability_code}")
async def remove_ulo_graduate_capability(
    ulo_id: UUID,
    capability_code: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Remove a Graduate Capability mapping from a ULO"""
    # First check if mapping exists
    existing = db.execute(
        select(ULOGraduateCapabilityMapping).where(
            ULOGraduateCapabilityMapping.ulo_id == str(ulo_id),
            ULOGraduateCapabilityMapping.capability_code == capability_code.upper(),
        )
    ).scalar_one_or_none()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mapping not found",
        )

    db.delete(existing)
    db.commit()

    return {"message": "Mapping removed successfully"}


# ============= AoL Mappings (Unit-level) =============


@router.get("/units/{unit_id}/aol-mappings", response_model=AoLMappingSummary)
async def get_unit_aol_mappings(
    unit_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all AoL mappings for a unit"""
    # Verify unit exists
    unit = db.execute(select(Unit).where(Unit.id == str(unit_id))).scalar_one_or_none()

    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )

    mappings = (
        db.execute(select(UnitAoLMapping).where(UnitAoLMapping.unit_id == str(unit_id)))
        .scalars()
        .all()
    )

    mapping_responses = [
        AoLMappingResponse(
            id=str(m.id),
            unit_id=str(m.unit_id),
            competency_code=m.competency_code,
            level=m.level,
            is_ai_suggested=m.is_ai_suggested,
            notes=m.notes,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
        for m in mappings
    ]

    return AoLMappingSummary(
        unit_id=str(unit_id),
        mapped_count=len(mapping_responses),
        total_competencies=7,
        mappings=mapping_responses,
    )


@router.post("/units/{unit_id}/aol-mappings", response_model=AoLMappingResponse)
async def add_unit_aol_mapping(
    unit_id: UUID,
    mapping_data: AoLMappingCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Add an AoL mapping to a unit"""
    # Verify unit exists
    unit = db.execute(select(Unit).where(Unit.id == str(unit_id))).scalar_one_or_none()

    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )

    # Check if mapping already exists for this competency
    existing = db.execute(
        select(UnitAoLMapping).where(
            UnitAoLMapping.unit_id == str(unit_id),
            UnitAoLMapping.competency_code == mapping_data.competency_code.value,
        )
    ).scalar_one_or_none()

    if existing:
        # Update existing mapping
        existing.level = mapping_data.level.value
        existing.is_ai_suggested = mapping_data.is_ai_suggested
        existing.notes = mapping_data.notes
        db.commit()
        db.refresh(existing)
        mapping = existing
    else:
        # Create new mapping
        mapping = UnitAoLMapping(
            unit_id=str(unit_id),
            competency_code=mapping_data.competency_code.value,
            level=mapping_data.level.value,
            is_ai_suggested=mapping_data.is_ai_suggested,
            notes=mapping_data.notes,
        )
        db.add(mapping)
        db.commit()
        db.refresh(mapping)

    return AoLMappingResponse(
        id=str(mapping.id),
        unit_id=str(mapping.unit_id),
        competency_code=mapping.competency_code,
        level=mapping.level,
        is_ai_suggested=mapping.is_ai_suggested,
        notes=mapping.notes,
        created_at=mapping.created_at,
        updated_at=mapping.updated_at,
    )


@router.put("/units/{unit_id}/aol-mappings", response_model=AoLMappingSummary)
async def update_unit_aol_mappings(
    unit_id: UUID,
    bulk_data: BulkAoLMappingCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Replace all AoL mappings for a unit"""
    # Verify unit exists
    unit = db.execute(select(Unit).where(Unit.id == str(unit_id))).scalar_one_or_none()

    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )

    # Delete existing mappings
    db.execute(delete(UnitAoLMapping).where(UnitAoLMapping.unit_id == str(unit_id)))

    # Create new mappings
    new_mappings = []
    for mapping_data in bulk_data.mappings:
        mapping = UnitAoLMapping(
            unit_id=str(unit_id),
            competency_code=mapping_data.competency_code.value,
            level=mapping_data.level.value,
            is_ai_suggested=mapping_data.is_ai_suggested,
            notes=mapping_data.notes,
        )
        db.add(mapping)
        new_mappings.append(mapping)

    db.commit()

    # Refresh all mappings
    for m in new_mappings:
        db.refresh(m)

    mapping_responses = [
        AoLMappingResponse(
            id=str(m.id),
            unit_id=str(m.unit_id),
            competency_code=m.competency_code,
            level=m.level,
            is_ai_suggested=m.is_ai_suggested,
            notes=m.notes,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
        for m in new_mappings
    ]

    return AoLMappingSummary(
        unit_id=str(unit_id),
        mapped_count=len(mapping_responses),
        total_competencies=7,
        mappings=mapping_responses,
    )


@router.delete("/units/{unit_id}/aol-mappings/{competency_code}")
async def remove_unit_aol_mapping(
    unit_id: UUID,
    competency_code: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Remove an AoL mapping from a unit"""
    # First check if mapping exists
    existing = db.execute(
        select(UnitAoLMapping).where(
            UnitAoLMapping.unit_id == str(unit_id),
            UnitAoLMapping.competency_code == competency_code.upper(),
        )
    ).scalar_one_or_none()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mapping not found",
        )

    db.delete(existing)
    db.commit()

    return {"message": "Mapping removed successfully"}
