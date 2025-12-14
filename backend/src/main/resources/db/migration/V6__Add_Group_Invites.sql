-- ============================
-- FYPIFY: Group Invites Table
-- V6__Add_Group_Invites.sql
-- ============================

-- Group invites table for tracking member invitations
CREATE TABLE group_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    message VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT now(),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Ensure one pending invite per group/invitee combination
    CONSTRAINT uk_group_invites_group_invitee UNIQUE (group_id, invitee_id)
);

-- Indexes
CREATE INDEX idx_group_invites_invitee ON group_invites(invitee_id);
CREATE INDEX idx_group_invites_group ON group_invites(group_id);
CREATE INDEX idx_group_invites_status ON group_invites(status);
CREATE INDEX idx_group_invites_pending ON group_invites(invitee_id) WHERE status = 'PENDING';

-- Add rejection_reason column to projects table if not exists
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(1000);
