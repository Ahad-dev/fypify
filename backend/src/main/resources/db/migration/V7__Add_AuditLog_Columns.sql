-- Add missing columns to audit_logs table for entity tracking

-- Add entity_type column
ALTER TABLE audit_logs ADD COLUMN entity_type VARCHAR(100);

-- Add entity_id column (UUID type to match Java entity)
ALTER TABLE audit_logs ADD COLUMN entity_id UUID;

-- Add ip_address column
ALTER TABLE audit_logs ADD COLUMN ip_address VARCHAR(50);

-- Add indexes for better query performance
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
