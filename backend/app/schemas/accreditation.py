"""
Pydantic schemas for accreditation mappings (Graduate Capabilities and AoL)
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.base import CamelModel

# ============= Graduate Capability Enums and Schemas =============


class GraduateCapabilityCode(str, Enum):
    """Curtin University Graduate Capability codes"""

    GC1 = "GC1"  # Apply knowledge, skills and capabilities
    GC2 = "GC2"  # Innovative, creative and/or entrepreneurial
    GC3 = "GC3"  # Effective communicators with digital competence
    GC4 = "GC4"  # Globally engaged and responsive
    GC5 = "GC5"  # Culturally competent (First Peoples & diverse cultures)
    GC6 = "GC6"  # Industry-connected and career-capable


class GraduateCapabilityMappingBase(CamelModel):
    """Base schema for Graduate Capability mappings"""

    capability_code: GraduateCapabilityCode = Field(
        ..., description="Graduate Capability code (GC1-GC6)"
    )
    is_ai_suggested: bool = Field(
        default=False, description="Whether this mapping was AI-suggested"
    )
    notes: str | None = Field(None, description="Optional notes/justification")


class GraduateCapabilityMappingCreate(GraduateCapabilityMappingBase):
    """Schema for creating a Graduate Capability mapping"""


class GraduateCapabilityMappingUpdate(CamelModel):
    """Schema for updating a Graduate Capability mapping"""

    capability_code: GraduateCapabilityCode | None = None
    is_ai_suggested: bool | None = None
    notes: str | None = None


class GraduateCapabilityMappingResponse(CamelModel):
    """Schema for Graduate Capability mapping response"""

    id: str
    ulo_id: str
    capability_code: str  # GC1-GC6 as string from database
    is_ai_suggested: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BulkGraduateCapabilityMappingCreate(BaseModel):
    """Schema for creating/updating all GC mappings for a ULO at once"""

    capability_codes: list[GraduateCapabilityCode] = Field(
        default_factory=list,
        description="List of Graduate Capability codes to map to this ULO",
    )
    is_ai_suggested: bool = Field(
        default=False, description="Whether these mappings were AI-suggested"
    )


# ============= AoL (Assurance of Learning) Enums and Schemas =============


class AoLCompetencyCode(str, Enum):
    """AACSB Assurance of Learning competency codes"""

    AOL1 = "AOL1"  # Knowledge of Business and Discipline Content
    AOL2 = "AOL2"  # Critical Thinking and Problem-Solving
    AOL3 = "AOL3"  # Communication Skills
    AOL4 = "AOL4"  # Ethical and Social Responsibility
    AOL5 = "AOL5"  # Teamwork and Interpersonal Skills
    AOL6 = "AOL6"  # Global and Cultural Awareness
    AOL7 = "AOL7"  # Quantitative and Technological Skills


class AoLLevel(str, Enum):
    """Assurance of Learning progression levels"""

    INTRODUCE = "I"  # First exposure, basic understanding
    REINFORCE = "R"  # Practice and deepen skills
    MASTER = "M"  # Demonstrate proficiency at graduation level


class SDGCode(str, Enum):
    """UN Sustainable Development Goals codes (SDG1-SDG17)"""

    SDG1 = "SDG1"  # No Poverty
    SDG2 = "SDG2"  # Zero Hunger
    SDG3 = "SDG3"  # Good Health and Well-being
    SDG4 = "SDG4"  # Quality Education
    SDG5 = "SDG5"  # Gender Equality
    SDG6 = "SDG6"  # Clean Water and Sanitation
    SDG7 = "SDG7"  # Affordable and Clean Energy
    SDG8 = "SDG8"  # Decent Work and Economic Growth
    SDG9 = "SDG9"  # Industry, Innovation and Infrastructure
    SDG10 = "SDG10"  # Reduced Inequalities
    SDG11 = "SDG11"  # Sustainable Cities and Communities
    SDG12 = "SDG12"  # Responsible Consumption and Production
    SDG13 = "SDG13"  # Climate Action
    SDG14 = "SDG14"  # Life Below Water
    SDG15 = "SDG15"  # Life on Land
    SDG16 = "SDG16"  # Peace, Justice and Strong Institutions
    SDG17 = "SDG17"  # Partnerships for the Goals


class AoLMappingBase(CamelModel):
    """Base schema for AoL mappings"""

    competency_code: AoLCompetencyCode = Field(
        ..., description="AoL Competency code (AOL1-AOL7)"
    )
    level: AoLLevel = Field(..., description="Learning level (I/R/M)")
    is_ai_suggested: bool = Field(
        default=False, description="Whether this mapping was AI-suggested"
    )
    notes: str | None = Field(None, description="Optional notes/justification")


class AoLMappingCreate(AoLMappingBase):
    """Schema for creating an AoL mapping"""


class AoLMappingUpdate(CamelModel):
    """Schema for updating an AoL mapping"""

    competency_code: AoLCompetencyCode | None = None
    level: AoLLevel | None = None
    is_ai_suggested: bool | None = None
    notes: str | None = None


class AoLMappingResponse(CamelModel):
    """Schema for AoL mapping response"""

    id: str
    unit_id: str
    competency_code: str  # AOL1-AOL7 as string from database
    level: str  # I/R/M as string from database
    is_ai_suggested: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BulkAoLMappingCreate(BaseModel):
    """Schema for creating/updating all AoL mappings for a unit at once"""

    mappings: list[AoLMappingCreate] = Field(
        default_factory=list,
        description="List of AoL mappings (competency code + level)",
    )


class AoLMappingSummary(CamelModel):
    """Summary of AoL mappings for a unit"""

    unit_id: str
    mapped_count: int = Field(description="Number of competencies mapped")
    total_competencies: int = Field(
        default=7, description="Total possible competencies"
    )
    mappings: list[AoLMappingResponse] = Field(default_factory=list)


# ============= SDG (Sustainable Development Goals) Schemas =============


class SDGMappingBase(CamelModel):
    """Base schema for SDG mappings"""

    sdg_code: SDGCode = Field(..., description="SDG code (SDG1-SDG17)")
    is_ai_suggested: bool = Field(
        default=False, description="Whether this mapping was AI-suggested"
    )
    notes: str | None = Field(None, description="Optional notes/justification")


class SDGMappingCreate(SDGMappingBase):
    """Schema for creating an SDG mapping"""


class SDGMappingUpdate(CamelModel):
    """Schema for updating an SDG mapping"""

    sdg_code: SDGCode | None = None
    is_ai_suggested: bool | None = None
    notes: str | None = None


class SDGMappingResponse(CamelModel):
    """Schema for SDG mapping response"""

    id: str
    unit_id: str
    sdg_code: str  # SDG1-SDG17 as string from database
    is_ai_suggested: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BulkSDGMappingCreate(BaseModel):
    """Schema for creating/updating all SDG mappings for a unit at once"""

    mappings: list[SDGMappingCreate] = Field(
        default_factory=list,
        description="List of SDG mappings",
    )


class SDGMappingSummary(CamelModel):
    """Summary of SDG mappings for a unit"""

    unit_id: str
    mapped_count: int = Field(description="Number of SDGs mapped")
    total_sdgs: int = Field(default=17, description="Total possible SDGs")
    mappings: list[SDGMappingResponse] = Field(default_factory=list)


# ============= Combined Response Schemas =============


class ULOWithCapabilities(CamelModel):
    """ULO response including Graduate Capability mappings"""

    id: str
    code: str
    description: str
    bloom_level: str
    order_index: int
    unit_id: str
    created_at: datetime
    updated_at: datetime
    graduate_capabilities: list[GraduateCapabilityMappingResponse] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True
