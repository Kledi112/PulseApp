"""add is_pool_funded flag to active_services

Revision ID: 1b9e5a2337a0
Revises: d3c9bd43f5f8
Create Date: 2026-06-21 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '1b9e5a2337a0'
down_revision: Union[str, None] = 'd3c9bd43f5f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('active_services', sa.Column('is_pool_funded', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('active_services', 'is_pool_funded')
