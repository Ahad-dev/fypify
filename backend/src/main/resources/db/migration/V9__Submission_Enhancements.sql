-- ============================
-- FYPIFY: Submission Enhancements
-- V9__Submission_Enhancements.sql
-- ============================

-- Add original_filename column to cloudinary_files if not exists
ALTER TABLE cloudinary_files 
ADD COLUMN IF NOT EXISTS original_filename VARCHAR(500);

-- Add comments column to document_submissions if not exists
ALTER TABLE document_submissions 
ADD COLUMN IF NOT EXISTS comments TEXT;

-- ==================== Additional Indexes for Performance ====================

-- Index for finding submissions by uploaded_by (user dashboard)
CREATE INDEX IF NOT EXISTS idx_submissions_uploaded_by 
ON document_submissions(uploaded_by);

-- Index for finding submissions by upload date (sorting)
CREATE INDEX IF NOT EXISTS idx_submissions_uploaded_at 
ON document_submissions(uploaded_at DESC);

-- Partial index for pending supervisor submissions (frequently queried)
CREATE INDEX IF NOT EXISTS idx_submissions_pending_supervisor 
ON document_submissions(status, uploaded_at DESC) 
WHERE status = 'PENDING_SUPERVISOR';

-- Partial index for final submissions (checking if final exists)
CREATE INDEX IF NOT EXISTS idx_submissions_final 
ON document_submissions(project_id, doc_type_id) 
WHERE is_final = true;

-- Index for cloudinary files by uploader
CREATE INDEX IF NOT EXISTS idx_cloudinary_files_uploader 
ON cloudinary_files(uploaded_by);

-- ==================== Update version function for UUID ====================

-- Drop existing function if any (was for BIGINT)
DROP FUNCTION IF EXISTS next_submission_version(UUID, UUID);

-- Create function to get next version with advisory lock
-- This is an alternative to pessimistic row-level locking
CREATE OR REPLACE FUNCTION next_submission_version(p_project_id UUID, p_doc_type_id UUID)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    v INT;
    lock_key BIGINT;
BEGIN
    -- Create a unique lock key from project_id and doc_type_id
    -- Using hashtext to convert UUIDs to a consistent integer
    lock_key := abs(hashtext(p_project_id::text || '_' || p_doc_type_id::text));
    
    -- Acquire advisory lock (blocks other transactions trying same key)
    PERFORM pg_advisory_xact_lock(lock_key);
    
    -- Get the next version
    SELECT COALESCE(MAX(version), 0) + 1 INTO v
    FROM document_submissions
    WHERE project_id = p_project_id
      AND doc_type_id = p_doc_type_id;
    
    RETURN v;
END;
$$;

-- ==================== Trigger for Submission Notifications ====================

-- Update the notification trigger for new submissions
CREATE OR REPLACE FUNCTION notify_on_submission_created()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    msg JSONB;
    supervisor_id UUID;
    doc_title VARCHAR;
BEGIN
    -- Get supervisor and document type info
    SELECT p.supervisor_id INTO supervisor_id
    FROM projects p WHERE p.id = NEW.project_id;
    
    SELECT dt.title INTO doc_title
    FROM document_types dt WHERE dt.id = NEW.doc_type_id;
    
    IF supervisor_id IS NOT NULL THEN
        msg = jsonb_build_object(
            'submission_id', NEW.id,
            'project_id', NEW.project_id,
            'doc_type_id', NEW.doc_type_id,
            'doc_title', doc_title,
            'version', NEW.version,
            'message', 'New submission uploaded and pending review'
        );
        
        INSERT INTO notifications(user_id, type, payload)
        VALUES (supervisor_id, 'SUBMISSION_UPLOADED', msg);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new submissions (if not exists)
DROP TRIGGER IF EXISTS trg_notify_submission_created ON document_submissions;

CREATE TRIGGER trg_notify_submission_created
AFTER INSERT ON document_submissions
FOR EACH ROW
EXECUTE PROCEDURE notify_on_submission_created();

-- ==================== Comments ====================

COMMENT ON COLUMN cloudinary_files.original_filename IS 'Original filename as uploaded by user';
COMMENT ON COLUMN document_submissions.comments IS 'Comments or notes about this submission';
COMMENT ON FUNCTION next_submission_version(UUID, UUID) IS 'Computes next version with advisory lock to prevent race conditions';

