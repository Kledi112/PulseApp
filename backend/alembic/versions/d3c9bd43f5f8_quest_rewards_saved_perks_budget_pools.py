"""quest rewards, saved perks, budget bonuses, budget pools

Revision ID: d3c9bd43f5f8
Revises: 37f34d2a0ba2
Create Date: 2026-06-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd3c9bd43f5f8'
down_revision: Union[str, None] = '37f34d2a0ba2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('active_services', sa.Column('is_reward', sa.Boolean(), nullable=False, server_default='false'))

    op.create_table(
        'saved_perks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('service_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id']),
        sa.ForeignKeyConstraint(['service_id'], ['services.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('employee_id', 'service_id', name='uq_saved_perks_employee_service'),
    )

    op.create_table(
        'budget_bonuses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('amount_all', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(length=255), nullable=False),
        sa.Column('granted_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'perk_pools',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('service_id', sa.Integer(), nullable=False),
        sa.Column('host_employee_id', sa.Integer(), nullable=False),
        sa.Column('target_amount_all', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('active_service_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['service_id'], ['services.id']),
        sa.ForeignKeyConstraint(['host_employee_id'], ['employees.id']),
        sa.ForeignKeyConstraint(['active_service_id'], ['active_services.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'perk_pool_contributions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('pool_id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('amount_all', sa.Integer(), nullable=False),
        sa.Column('contributed_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['pool_id'], ['perk_pools.id']),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('pool_id', 'employee_id', name='uq_perk_pool_contributions_pool_employee'),
    )

    op.create_table(
        'quest_reward_distributions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('month', sa.Date(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=True),
        sa.Column('reward_type', sa.String(length=20), nullable=True),
        sa.Column('active_service_id', sa.Integer(), nullable=True),
        sa.Column('budget_bonus_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id']),
        sa.ForeignKeyConstraint(['active_service_id'], ['active_services.id']),
        sa.ForeignKeyConstraint(['budget_bonus_id'], ['budget_bonuses.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('month', 'rank', name='uq_quest_reward_distributions_month_rank'),
    )


def downgrade() -> None:
    op.drop_table('quest_reward_distributions')
    op.drop_table('perk_pool_contributions')
    op.drop_table('perk_pools')
    op.drop_table('budget_bonuses')
    op.drop_table('saved_perks')
    op.drop_column('active_services', 'is_reward')
