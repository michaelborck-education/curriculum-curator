"""Add SDG mapping table for UN Sustainable Development Goals

Revision ID: add_sdg_mappings
Revises: add_accreditation_mappings
Create Date: 2025-12-03

"""

from alembic import op
import sqlalchemy as sa
from app.models.common import GUID

# revision identifiers
revision = "add_sdg_mappings"
down_revision = "add_accreditation_mappings"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create unit_sdg_mappings table
    # Maps Units to UN Sustainable Development Goals (SDG1-SDG17)
    op.create_table(
        "unit_sdg_mappings",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("unit_id", GUID(), nullable=False),
        sa.Column("sdg_code", sa.String(10), nullable=False),  # SDG1-SDG17
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
        op.f("ix_unit_sdg_mappings_id"),
        "unit_sdg_mappings",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_unit_sdg_mappings_unit_id"),
        "unit_sdg_mappings",
        ["unit_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_unit_sdg_mappings_sdg_code"),
        "unit_sdg_mappings",
        ["sdg_code"],
        unique=False,
    )


def downgrade() -> None:
    # Drop unit_sdg_mappings
    op.drop_index(op.f("ix_unit_sdg_mappings_sdg_code"), table_name="unit_sdg_mappings")
    op.drop_index(op.f("ix_unit_sdg_mappings_unit_id"), table_name="unit_sdg_mappings")
    op.drop_index(op.f("ix_unit_sdg_mappings_id"), table_name="unit_sdg_mappings")
    op.drop_table("unit_sdg_mappings")
