"""Add accreditation mapping tables for Graduate Capabilities and AoL

Revision ID: add_accreditation_mappings
Revises: 916afda7d070
Create Date: 2025-12-02

"""

from alembic import op
import sqlalchemy as sa
from app.models.common import GUID

# revision identifiers
revision = "add_accreditation_mappings"
down_revision = "916afda7d070"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ulo_graduate_capability_mappings table
    # Maps ULOs to Curtin Graduate Capabilities (GC1-GC6)
    op.create_table(
        "ulo_graduate_capability_mappings",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("ulo_id", GUID(), nullable=False),
        sa.Column("capability_code", sa.String(10), nullable=False),
        sa.Column(
            "is_ai_suggested", sa.Boolean(), nullable=False, server_default="false"
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.ForeignKeyConstraint(
            ["ulo_id"],
            ["unit_learning_outcomes.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_ulo_graduate_capability_mappings_ulo_id"),
        "ulo_graduate_capability_mappings",
        ["ulo_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_ulo_graduate_capability_mappings_capability_code"),
        "ulo_graduate_capability_mappings",
        ["capability_code"],
        unique=False,
    )

    # Create unit_aol_mappings table
    # Maps Units to AACSB AoL Competencies (AOL1-AOL7) with I/R/M levels
    op.create_table(
        "unit_aol_mappings",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("unit_id", GUID(), nullable=False),
        sa.Column("competency_code", sa.String(10), nullable=False),
        sa.Column("level", sa.String(1), nullable=False),  # I, R, or M
        sa.Column(
            "is_ai_suggested", sa.Boolean(), nullable=False, server_default="false"
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.ForeignKeyConstraint(
            ["unit_id"],
            ["units.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_unit_aol_mappings_unit_id"),
        "unit_aol_mappings",
        ["unit_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_unit_aol_mappings_competency_code"),
        "unit_aol_mappings",
        ["competency_code"],
        unique=False,
    )


def downgrade() -> None:
    # Drop unit_aol_mappings
    op.drop_index(
        op.f("ix_unit_aol_mappings_competency_code"), table_name="unit_aol_mappings"
    )
    op.drop_index(op.f("ix_unit_aol_mappings_unit_id"), table_name="unit_aol_mappings")
    op.drop_table("unit_aol_mappings")

    # Drop ulo_graduate_capability_mappings
    op.drop_index(
        op.f("ix_ulo_graduate_capability_mappings_capability_code"),
        table_name="ulo_graduate_capability_mappings",
    )
    op.drop_index(
        op.f("ix_ulo_graduate_capability_mappings_ulo_id"),
        table_name="ulo_graduate_capability_mappings",
    )
    op.drop_table("ulo_graduate_capability_mappings")
