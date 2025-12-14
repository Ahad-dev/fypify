-- V5: Add missing columns to document_types table for Admin CRUD

-- Add display_order column for ordering document types in UI
ALTER TABLE document_types
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add is_active column for soft delete functionality
ALTER TABLE document_types
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index for active document types ordering
CREATE INDEX IF NOT EXISTS idx_document_types_active_order 
ON document_types(is_active, display_order);
