-- ============================
-- FYPIFY: Migration to UUID Primary Keys
-- V3__UUID_Migration.sql
-- ============================

-- Note: This migration converts all primary keys from SERIAL/BIGSERIAL to UUID
-- Since we're early in development, we'll recreate tables with UUID PKs

-- Drop all dependent objects first (triggers, views, etc.)
DROP VIEW IF EXISTS project_scores CASCADE;
DROP VIEW IF EXISTS submission_scores CASCADE;
DROP VIEW IF EXISTS latest_submissions CASCADE;

DROP TRIGGER IF EXISTS trg_notify_result_released ON final_results;
DROP TRIGGER IF EXISTS trg_notify_eval_finalized ON evaluation_marks;
DROP TRIGGER IF EXISTS trg_notify_submission_locked ON document_submissions;
DROP TRIGGER IF EXISTS trg_notify_project_approval ON projects;
DROP TRIGGER IF EXISTS trg_document_types_weights ON document_types;
DROP TRIGGER IF EXISTS projects_set_updated_at ON projects;
DROP TRIGGER IF EXISTS users_set_updated_at ON users;

-- Drop functions
DROP FUNCTION IF EXISTS notify_on_result_released() CASCADE;
DROP FUNCTION IF EXISTS notify_on_eval_finalized() CASCADE;
DROP FUNCTION IF EXISTS notify_on_submission_locked() CASCADE;
DROP FUNCTION IF EXISTS notify_on_project_approval() CASCADE;
DROP FUNCTION IF EXISTS next_submission_version(BIGINT, INT) CASCADE;
DROP FUNCTION IF EXISTS check_doc_weights() CASCADE;

-- Drop all tables (CASCADE will handle dependencies)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS final_results CASCADE;
DROP TABLE IF EXISTS evaluation_marks CASCADE;
DROP TABLE IF EXISTS supervisor_marks CASCADE;
DROP TABLE IF EXISTS supervisor_reviews CASCADE;
DROP TABLE IF EXISTS document_submissions CASCADE;
DROP TABLE IF EXISTS cloudinary_files CASCADE;
DROP TABLE IF EXISTS project_deadlines CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS document_types CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS student_groups CASCADE;
DROP TABLE IF EXISTS eval_committee_members CASCADE;
DROP TABLE IF EXISTS fyp_committee_members CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Keep the trigger function for updated_at
DROP FUNCTION IF EXISTS trg_set_updated_at() CASCADE;

/* ========== RECREATE SCHEMA WITH UUID PKs ========== */

/* ---------- Extensions ---------- */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/* ---------- Roles ---------- */
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(40) NOT NULL UNIQUE,
  description TEXT
);

/* ---------- Users ---------- */
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON UPDATE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_email ON users(email);

/* Update timestamp trigger */
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trg_set_updated_at();


/* ---------- System Settings ---------- */
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);


/* ---------- Committee Membership ---------- */
CREATE TABLE fyp_committee_members (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE eval_committee_members (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now()
);


/* ---------- Student Groups ---------- */
CREATE TABLE student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200),
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_groups_leader ON student_groups(leader_id);

CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, student_id)
);

CREATE INDEX idx_group_members_student ON group_members(student_id);
-- Ensure student can only be in one group
CREATE UNIQUE INDEX idx_student_single_group ON group_members(student_id);


/* ---------- Document Types ---------- */
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  weight_supervisor INT NOT NULL DEFAULT 20 CHECK (weight_supervisor >= 0 AND weight_supervisor <= 100),
  weight_committee INT NOT NULL DEFAULT 80 CHECK (weight_committee >= 0 AND weight_committee <= 100),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION check_doc_weights() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.weight_supervisor + NEW.weight_committee <> 100 THEN
    RAISE EXCEPTION 'document_types: weights must sum to 100 (supervisor + committee)';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_document_types_weights
BEFORE INSERT OR UPDATE ON document_types
FOR EACH ROW EXECUTE PROCEDURE check_doc_weights();


/* ---------- Projects ---------- */
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID UNIQUE REFERENCES student_groups(id) ON DELETE SET NULL,
  title VARCHAR(400) NOT NULL,
  abstract TEXT,
  domain VARCHAR(200),
  proposed_supervisors UUID[],
  supervisor_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING_APPROVAL',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_supervisor ON projects(supervisor_id);
CREATE INDEX idx_projects_group ON projects(group_id);

CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE trg_set_updated_at();


/* ---------- Project Deadlines ---------- */
CREATE TABLE project_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type_id UUID NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, doc_type_id)
);

CREATE INDEX idx_deadlines_due_date ON project_deadlines(due_date);
CREATE INDEX idx_deadlines_project ON project_deadlines(project_id);
CREATE INDEX idx_deadlines_unlocked ON project_deadlines(due_date) WHERE locked = FALSE;


/* ---------- Cloudinary Files ---------- */
CREATE TABLE cloudinary_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  resource_type VARCHAR(50),
  format VARCHAR(20),
  bytes BIGINT,
  width INT,
  height INT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cloudinary_publicid ON cloudinary_files(public_id);


/* ---------- Document Submissions ---------- */
CREATE TABLE document_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type_id UUID NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  version INT NOT NULL,
  file_id UUID REFERENCES cloudinary_files(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING_SUPERVISOR',
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  supervisor_reviewed_at TIMESTAMPTZ,
  UNIQUE (project_id, doc_type_id, version)
);

CREATE INDEX idx_submissions_project_doc ON document_submissions(project_id, doc_type_id);
CREATE INDEX idx_submissions_status ON document_submissions(status);

/* Helper function for auto-incrementing version */
CREATE OR REPLACE FUNCTION next_submission_version(p_project_id UUID, p_doc_type UUID)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
  v INT;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1 INTO v
   FROM document_submissions
   WHERE project_id = p_project_id
     AND doc_type_id = p_doc_type;
  RETURN v;
END;
$$;


/* ---------- Supervisor Reviews ---------- */
CREATE TABLE supervisor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES document_submissions(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comments TEXT,
  status VARCHAR(30) NOT NULL CHECK (status IN ('APPROVED','REVISION_REQUIRED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_supervisor_reviews_submission ON supervisor_reviews(submission_id);


/* ---------- Supervisor Marks ---------- */
CREATE TABLE supervisor_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES document_submissions(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (submission_id, supervisor_id)
);

CREATE INDEX idx_supervisor_marks_submission ON supervisor_marks(submission_id);


/* ---------- Evaluation Marks ---------- */
CREATE TABLE evaluation_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES document_submissions(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(7,4) NOT NULL CHECK (score >= 0 AND score <= 100),
  rubric JSONB,
  comments TEXT,
  is_final BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (submission_id, evaluator_id)
);

CREATE INDEX idx_evaluation_marks_submission ON evaluation_marks(submission_id);
CREATE INDEX idx_evaluation_marks_final ON evaluation_marks(submission_id) WHERE is_final = TRUE;


/* ---------- Final Results ---------- */
CREATE TABLE final_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  total_score NUMERIC(7,4) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  details JSONB,
  released BOOLEAN DEFAULT FALSE,
  released_by UUID REFERENCES users(id) ON DELETE SET NULL,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_final_results_project ON final_results(project_id);


/* ---------- Notifications ---------- */
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(80) NOT NULL,
  payload JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;


/* ---------- Audit Logs ---------- */
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);


/* ========== VIEWS ========== */

CREATE OR REPLACE VIEW latest_submissions AS
SELECT ds.*
FROM document_submissions ds
JOIN (
    SELECT project_id, doc_type_id, MAX(version) AS max_v
    FROM document_submissions
    GROUP BY project_id, doc_type_id
) t ON ds.project_id = t.project_id 
   AND ds.doc_type_id = t.doc_type_id 
   AND ds.version = t.max_v;


CREATE OR REPLACE VIEW submission_scores AS
SELECT
  ds.id AS submission_id,
  ds.project_id,
  ds.doc_type_id,
  COALESCE(sm.supervisor_avg, NULL) AS supervisor_avg_percent,
  COALESCE(em.eval_avg, NULL) AS eval_committee_avg_percent
FROM document_submissions ds
LEFT JOIN (
  SELECT submission_id, AVG(score) AS supervisor_avg
  FROM supervisor_marks
  GROUP BY submission_id
) sm ON sm.submission_id = ds.id
LEFT JOIN (
  SELECT submission_id, AVG(score) AS eval_avg
  FROM evaluation_marks
  WHERE is_final = TRUE
  GROUP BY submission_id
) em ON em.submission_id = ds.id;


/* ========== NOTIFICATION TRIGGERS ========== */

-- Project approval notification
CREATE OR REPLACE FUNCTION notify_on_project_approval()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  fyp_member RECORD;
  eval_member RECORD;
  msg JSONB;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'APPROVED' AND OLD.status <> 'APPROVED' THEN
    INSERT INTO audit_logs(actor_id, action, details)
      VALUES (NEW.approved_by, 'PROJECT_APPROVED', jsonb_build_object('project_id', NEW.id, 'group_id', NEW.group_id));

    msg = jsonb_build_object(
      'project_id', NEW.id,
      'project_title', NEW.title,
      'group_id', NEW.group_id,
      'supervisor_id', NEW.supervisor_id,
      'message', 'Project approved by FYP Committee'
    );

    FOR eval_member IN SELECT user_id FROM eval_committee_members LOOP
      INSERT INTO notifications(user_id, type, payload) VALUES (eval_member.user_id, 'PROJECT_APPROVED', msg);
    END LOOP;

    FOR fyp_member IN SELECT user_id FROM fyp_committee_members LOOP
      INSERT INTO notifications(user_id, type, payload) VALUES (fyp_member.user_id, 'PROJECT_APPROVED', msg);
    END LOOP;

    INSERT INTO notifications(user_id, type, payload)
    SELECT gm.student_id, 'PROJECT_APPROVED', msg FROM group_members gm WHERE gm.group_id = NEW.group_id;

    IF NEW.supervisor_id IS NOT NULL THEN
      INSERT INTO notifications(user_id, type, payload) VALUES (NEW.supervisor_id, 'PROJECT_APPROVED', msg);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_project_approval
AFTER UPDATE ON projects
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE PROCEDURE notify_on_project_approval();


-- Submission locked notification
CREATE OR REPLACE FUNCTION notify_on_submission_locked()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  msg JSONB;
  eval_member RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'LOCKED_FOR_EVAL' AND OLD.status <> 'LOCKED_FOR_EVAL' THEN
    msg = jsonb_build_object(
      'submission_id', NEW.id,
      'project_id', NEW.project_id,
      'doc_type_id', NEW.doc_type_id,
      'version', NEW.version,
      'message', 'Submission locked and ready for evaluation'
    );

    FOR eval_member IN SELECT user_id FROM eval_committee_members LOOP
      INSERT INTO notifications(user_id, type, payload) VALUES (eval_member.user_id, 'SUBMISSION_LOCKED', msg);
    END LOOP;

    INSERT INTO notifications(user_id, type, payload)
      SELECT p.supervisor_id, 'SUBMISSION_LOCKED', msg FROM projects p WHERE p.id = NEW.project_id AND p.supervisor_id IS NOT NULL;

    INSERT INTO notifications(user_id, type, payload)
      SELECT user_id, 'SUBMISSION_LOCKED', msg FROM fyp_committee_members;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_submission_locked
AFTER UPDATE ON document_submissions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE PROCEDURE notify_on_submission_locked();


-- Evaluation finalized notification
CREATE OR REPLACE FUNCTION notify_on_eval_finalized()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  msg JSONB;
  fyp_member RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.is_final = TRUE AND OLD.is_final IS DISTINCT FROM TRUE THEN
    msg = jsonb_build_object(
      'submission_id', NEW.submission_id,
      'project_id', (SELECT ds.project_id FROM document_submissions ds WHERE ds.id = NEW.submission_id),
      'message', 'An evaluation finalized'
    );

    FOR fyp_member IN SELECT user_id FROM fyp_committee_members LOOP
      INSERT INTO notifications(user_id, type, payload) VALUES (fyp_member.user_id, 'EVALUATION_FINALIZED', msg);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_eval_finalized
AFTER UPDATE ON evaluation_marks
FOR EACH ROW
WHEN (OLD.is_final IS DISTINCT FROM NEW.is_final)
EXECUTE PROCEDURE notify_on_eval_finalized();


-- Result released notification
CREATE OR REPLACE FUNCTION notify_on_result_released()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  msg JSONB;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.released = TRUE AND OLD.released IS DISTINCT FROM TRUE THEN
    msg = jsonb_build_object(
      'project_id', NEW.project_id,
      'total_score', NEW.total_score,
      'message', 'Final result released'
    );

    INSERT INTO notifications(user_id, type, payload)
      SELECT gm.student_id, 'RESULT_RELEASED', msg
      FROM group_members gm
      JOIN student_groups sg ON sg.id = gm.group_id
      JOIN projects p ON p.group_id = sg.id
      WHERE p.id = NEW.project_id;

    INSERT INTO notifications(user_id, type, payload)
      SELECT p.supervisor_id, 'RESULT_RELEASED', msg FROM projects p WHERE p.id = NEW.project_id AND p.supervisor_id IS NOT NULL;

    INSERT INTO notifications(user_id, type, payload)
      SELECT user_id, 'RESULT_RELEASED', msg FROM fyp_committee_members;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_result_released
AFTER UPDATE ON final_results
FOR EACH ROW
WHEN (OLD.released IS DISTINCT FROM NEW.released)
EXECUTE PROCEDURE notify_on_result_released();


/* ========== END OF MIGRATION ========== */
