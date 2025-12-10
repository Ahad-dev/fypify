-- ============================
-- FYPIFY: Production-grade schema
-- PostgreSQL DDL (tested on 13+)
-- ============================

/* Notes:
 - Use UTF8 encoding database.
 - Use role-based DB users for app vs admin.
*/

/* ---------- Extensions ---------- */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- for gen_random_uuid()

/* ---------- Roles (app-level roles stored in users.role) ---------- */
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL UNIQUE, -- e.g., 'STUDENT','SUPERVISOR','ADMIN','FYP_COMMITTEE','EVAL_COMMITTEE'
  description TEXT
);

-- Seed roles expected: ADMIN, STUDENT, SUPERVISOR, FYP_COMMITTEE, EVALUATION_COMMITTEE


/* ---------- Users ---------- */
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role_id);

/* update timestamp trigger */
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trg_set_updated_at();


/* ---------- Admin-config / system settings ---------- */
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Example keys: "group_min_size", "group_max_size", "supervisor_weight", "committee_weight"


/* ---------- Committees membership (fixed sets) ---------- */
/* FYP Committee members */
CREATE TABLE fyp_committee_members (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fyp_members_user ON fyp_committee_members(user_id);

/* Evaluation Committee members */
CREATE TABLE eval_committee_members (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_eval_members_user ON eval_committee_members(user_id);


/* ---------- Student Groups ---------- */
CREATE TABLE student_groups (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200),
  leader_id BIGINT REFERENCES users(id) ON DELETE SET NULL, -- the leader account (must be a student)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_groups_leader ON student_groups(leader_id);

/* Group membership: students may belong to exactly one group (enforced in app) */
CREATE TABLE group_members (
  group_id BIGINT NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, student_id)
);

CREATE INDEX idx_group_members_student ON group_members(student_id);


/* ---------- Document types (admin configurable) ---------- */
CREATE TABLE document_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'PROPOSAL','SRS','DESIGN','THESIS'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  weight_supervisor INT NOT NULL DEFAULT 20 CHECK (weight_supervisor >= 0 AND weight_supervisor <= 100),
  weight_committee INT NOT NULL DEFAULT 80 CHECK (weight_committee >= 0 AND weight_committee <= 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure supervisor + committee weight sums to 100 for a doc if required by policy
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


/* ---------- Projects (one per group) ---------- */
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT UNIQUE REFERENCES student_groups(id) ON DELETE SET NULL, -- one project per group
  title VARCHAR(400) NOT NULL,
  abstract TEXT,
  domain VARCHAR(200),
  proposed_supervisors INT[] , -- array of user IDs (can be NULL / emails handled at app level)
  supervisor_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL, -- final assigned supervisor
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL / APPROVED / REJECTED / ARCHIVED
  approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_supervisor ON projects(supervisor_id);

/* trigger updated_at */
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE trg_set_updated_at();


/* ---------- Deadlines per project + document type ---------- */
CREATE TABLE project_deadlines (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type_id INT NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  locked BOOLEAN NOT NULL DEFAULT FALSE, -- becomes true when due_date passes or committee locks it
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, doc_type_id)
);

CREATE INDEX idx_deadlines_due_date ON project_deadlines(due_date);
CREATE INDEX idx_deadlines_project ON project_deadlines(project_id);


/* ---------- Cloudinary file metadata ---------- */
CREATE TABLE cloudinary_files (
  id BIGSERIAL PRIMARY KEY,
  public_id TEXT NOT NULL,       -- cloudinary public id
  secure_url TEXT NOT NULL,
  resource_type VARCHAR(50),     -- raw, image, video
  format VARCHAR(20),
  bytes BIGINT,
  width INT,
  height INT,
  uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cloudinary_publicid ON cloudinary_files(public_id);


/* ---------- Document submissions (versions) ---------- */
CREATE TABLE document_submissions (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type_id INT NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  version INT NOT NULL,
  file_id BIGINT REFERENCES cloudinary_files(id) ON DELETE SET NULL,
  uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL, -- should be group leader
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING_SUPERVISOR', 
    -- PENDING_SUPERVISOR / REVISION_REQUESTED / APPROVED_BY_SUPERVISOR / LOCKED_FOR_EVAL / EVAL_IN_PROGRESS / EVAL_FINALIZED
  is_final BOOLEAN NOT NULL DEFAULT FALSE, -- leader marks final
  supervisor_reviewed_at TIMESTAMPTZ,
  UNIQUE (project_id, doc_type_id, version)
);

-- index for quick lookup
CREATE INDEX idx_submissions_project_doc ON document_submissions(project_id, doc_type_id);
CREATE INDEX idx_submissions_status ON document_submissions(status);

/* ---------- Helper: auto-increment version per (project_id, doc_type_id) ---------- */
CREATE OR REPLACE FUNCTION next_submission_version(p_project_id BIGINT, p_doc_type INT)
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


-- Example usage in backend:
-- version := next_submission_version(project_id, doc_type_id);
-- then insert with that version
-- (We keep incrementing logic in backend to avoid contention; alternative: use advisory locks)

/* ---------- Supervisor reviews/comments ---------- */
CREATE TABLE supervisor_reviews (
  id BIGSERIAL PRIMARY KEY,
  submission_id BIGINT NOT NULL REFERENCES document_submissions(id) ON DELETE CASCADE,
  supervisor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comments TEXT,
  status VARCHAR(30) NOT NULL CHECK (status IN ('APPROVED','REVISION_REQUIRED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_supervisor_reviews_submission ON supervisor_reviews(submission_id);


/* ---------- Supervisor marks (20%) ---------- */
CREATE TABLE supervisor_marks (
  id BIGSERIAL PRIMARY KEY,
  submission_id BIGINT NOT NULL REFERENCES document_submissions(id) ON DELETE CASCADE,
  supervisor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100), -- store as percent of the doc component (0-100)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (submission_id, supervisor_id)
);

CREATE INDEX idx_supervisor_marks_submission ON supervisor_marks(submission_id);


/* ---------- Evaluation committee marks (per evaluator member) ---------- */
CREATE TABLE evaluation_marks (
  id BIGSERIAL PRIMARY KEY,
  submission_id BIGINT NOT NULL REFERENCES document_submissions(id) ON DELETE CASCADE,
  evaluator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(7,4) NOT NULL CHECK (score >= 0 AND score <= 100), -- percent scale (0-100)
  comments TEXT,
  is_final BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (submission_id, evaluator_id)
);

CREATE INDEX idx_evaluation_marks_submission ON evaluation_marks(submission_id);


/* ---------- Final results (per project) ---------- */
CREATE TABLE final_results (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  total_score NUMERIC(7,4) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  details JSONB, -- breakdown by doc type, supervisor avg, committee avg etc
  released BOOLEAN DEFAULT FALSE,
  released_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_final_results_project ON final_results(project_id);


/* ---------- Notifications (inserted by triggers or app) ---------- */
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(80) NOT NULL, -- e.g., 'PROJECT_APPROVED','SUBMISSION_LOCKED','EVAL_READY','RESULT_RELEASED'
  payload JSONB,             -- useful structured payload: { project_id, submission_id, doc_type, message, ... }
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);


/* ---------- Audit logs ---------- */
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);


/* ---------- Useful views ---------- */
-- A view that gives latest submission per project/doc_type
CREATE OR REPLACE VIEW latest_submissions AS
SELECT ds.*
FROM document_submissions ds
JOIN (
    SELECT project_id, doc_type_id, MAX(version) AS max_v
    FROM document_submissions
    GROUP BY project_id, doc_type_id
) t ON ds.project_id = t.project_id AND ds.doc_type_id = t.doc_type_id AND ds.version = t.max_v;


-- A view to compute aggregated scores per submission (supervisor average, eval committee average)
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
  GROUP BY submission_id
) em ON em.submission_id = ds.id;


-- A view to compute final project score (weights applied by doc type)
CREATE OR REPLACE VIEW project_scores AS
SELECT
  p.id AS project_id,
  p.title,
  jsonb_agg(jsonb_build_object(
    'doc_type_id', dt.id,
    'doc_code', dt.code,
    'supervisor_weight', dt.weight_supervisor,
    'committee_weight', dt.weight_committee,
    'supervisor_avg', s.supervisor_avg,
    'committee_avg', s.eval_avg
  )) FILTER (WHERE s.submission_id IS NOT NULL) AS docs,
  -- total_score calculation can be computed in app or as simplified aggregation:
  NULL::numeric AS computed_total -- compute in backend to control rounding & policy
FROM projects p
LEFT JOIN document_types dt ON TRUE
LEFT JOIN (
  SELECT ds.project_id, ds.doc_type_id, ds.id AS submission_id, sm.supervisor_avg, em.eval_avg
  FROM document_submissions ds
  LEFT JOIN (
    SELECT submission_id, AVG(score) supervisor_avg
    FROM supervisor_marks GROUP BY submission_id
  ) sm ON sm.submission_id = ds.id
  LEFT JOIN (
    SELECT submission_id, AVG(score) eval_avg
    FROM evaluation_marks GROUP BY submission_id
  ) em ON em.submission_id = ds.id
) s ON s.project_id = p.id AND s.doc_type_id = dt.id
GROUP BY p.id, p.title;



/* ---------- Triggers / Procedures for notifications ---------- */

-- 1) Notify eval committee & others when project approved
CREATE OR REPLACE FUNCTION notify_on_project_approval()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  fyp_member RECORD;
  eval_member RECORD;
  msg JSONB;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'APPROVED' AND OLD.status <> 'APPROVED' THEN
    -- notify all group members
    INSERT INTO audit_logs(actor_id, action, details)
      VALUES (NEW.approved_by, 'PROJECT_APPROVED', jsonb_build_object('project_id', NEW.id, 'group_id', NEW.group_id));

    msg = jsonb_build_object(
      'project_id', NEW.id,
      'project_title', NEW.title,
      'group_id', NEW.group_id,
      'supervisor_id', NEW.supervisor_id,
      'message', 'Project approved by FYP Committee'
    );

    -- notify evaluation committee members
    FOR eval_member IN SELECT user_id FROM eval_committee_members LOOP
      INSERT INTO notifications(user_id, type, payload) VALUES (eval_member.user_id, 'PROJECT_APPROVED', msg);
    END LOOP;

    -- notify FYP committee members (optional)
    FOR fyp_member IN SELECT user_id FROM fyp_committee_members LOOP
      INSERT INTO notifications(user_id, type, payload) VALUES (fyp_member.user_id, 'PROJECT_APPROVED', msg);
    END LOOP;

    -- notify group members (via group_members)
    INSERT INTO notifications(user_id, type, payload)
    SELECT gm.student_id, 'PROJECT_APPROVED', msg FROM group_members gm WHERE gm.group_id = NEW.group_id;

    -- notify supervisor if present
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

-- 2) When document becomes locked (deadline passed or marked locked), notify evaluation committee
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

    -- notify eval committee
    FOR eval_member IN SELECT user_id FROM eval_committee_members LOOP
      INSERT INTO notifications(user_id, type, payload) VALUES (eval_member.user_id, 'SUBMISSION_LOCKED', msg);
    END LOOP;

    -- notify FYP committee and supervisor optionally
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


-- 3) When evaluation finalized for a submission, notify FYP Committee
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


-- 4) When final result released, notify students & supervisor
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

    -- notify group members
    INSERT INTO notifications(user_id, type, payload)
      SELECT gm.student_id, 'RESULT_RELEASED', msg
      FROM group_members gm
      JOIN student_groups sg ON sg.id = gm.group_id
      JOIN projects p ON p.group_id = sg.id
      WHERE p.id = NEW.project_id;

    -- notify supervisor and committees
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


/* ---------- Index and performance suggestions ---------- */
/*
 - Add partial indexes for frequent queries, e.g. notifications WHERE is_read = false
 - Consider partitioning document_submissions by project_id or by uploaded_at for huge data volumes
 - Use connection pool (PgBouncer) in production
 - VACUUM / AUTOVAC settings according to workload
*/

CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;


/* ---------- Security & housekeeping ---------- */
/*
 - Do NOT store raw passwords; use bcrypt & salt in app
 - Use roles at DB user level for migrations vs runtime
 - Keep sensitive settings in environment variables
 - Backups: configure pg_dump and point-in-time recovery
*/

/* ---------- End of schema ---------- */
