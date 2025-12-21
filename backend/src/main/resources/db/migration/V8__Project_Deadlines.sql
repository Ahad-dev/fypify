-- ============================================
-- V8: Project Deadlines and Deadline Batches
-- ============================================
-- This migration is idempotent - safe to run multiple times

-- Drop tables if they exist (in correct order due to FK constraints)
DROP TABLE IF EXISTS project_deadlines CASCADE;
DROP TABLE IF EXISTS deadline_batches CASCADE;

-- Remove the column from projects if it exists
ALTER TABLE projects DROP COLUMN IF EXISTS deadline_batch_id;

-- Deadline batches represent a set of deadlines that apply to projects approved within a date range
CREATE TABLE deadline_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    applies_from TIMESTAMP WITH TIME ZONE NOT NULL,
    applies_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project deadlines linked to document types and deadline batches
CREATE TABLE project_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES deadline_batches(id) ON DELETE CASCADE,
    document_type_id UUID NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
    deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, document_type_id)
);

-- Index for efficient queries
CREATE INDEX idx_deadline_batches_applies ON deadline_batches(applies_from, applies_until);
CREATE INDEX idx_deadline_batches_active ON deadline_batches(is_active);
CREATE INDEX idx_project_deadlines_batch ON project_deadlines(batch_id);
CREATE INDEX idx_project_deadlines_document_type ON project_deadlines(document_type_id);
CREATE INDEX idx_project_deadlines_date ON project_deadlines(deadline_date);

-- Add deadline_batch reference to projects (to know which batch applies to this project)
ALTER TABLE projects ADD COLUMN deadline_batch_id UUID REFERENCES deadline_batches(id);
