-- ============================
-- FYPIFY: Seed Data
-- Run after V1__Initial_Schema.sql
-- ============================

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'System Administrator with full access'),
('STUDENT', 'Student user who can form groups and submit projects'),
('SUPERVISOR', 'Project supervisor who reviews submissions'),
('FYP_COMMITTEE', 'FYP Committee member who approves/rejects projects'),
('EVALUATION_COMMITTEE', 'Evaluation Committee member who reviews and scores submissions')
ON CONFLICT (name) DO NOTHING;

-- Insert Admin User (password: admin123)
INSERT INTO users (full_name, email, password_hash, role_id, is_active) 
VALUES (
  'System Administrator',
  'admin@fypify.com',
  '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
  (SELECT id FROM roles WHERE name = 'ADMIN'),
  true
)
ON CONFLICT (email) DO NOTHING;

-- Insert Test Supervisor (password: supervisor123)
INSERT INTO users (full_name, email, password_hash, role_id, is_active) 
VALUES (
  'Dr. John Smith',
  'supervisor@fypify.com',
  '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
  (SELECT id FROM roles WHERE name = 'SUPERVISOR'),
  true
)
ON CONFLICT (email) DO NOTHING;

-- Insert Test Students (password: student123)
INSERT INTO users (full_name, email, password_hash, role_id, is_active) VALUES
('Alice Johnson', 'alice@fypify.com', '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K', 
 (SELECT id FROM roles WHERE name = 'STUDENT'), true),
('Bob Williams', 'bob@fypify.com', '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
 (SELECT id FROM roles WHERE name = 'STUDENT'), true),
('Charlie Brown', 'charlie@fypify.com', '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
 (SELECT id FROM roles WHERE name = 'STUDENT'), true),
('Diana Prince', 'diana@fypify.com', '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
 (SELECT id FROM roles WHERE name = 'STUDENT'), true)
ON CONFLICT (email) DO NOTHING;

-- Insert Test FYP Committee Member (password: fyp123)
INSERT INTO users (full_name, email, password_hash, role_id, is_active) 
VALUES (
  'Prof. Sarah Miller',
  'fyp@fypify.com',
  '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
  (SELECT id FROM roles WHERE name = 'FYP_COMMITTEE'),
  true
)
ON CONFLICT (email) DO NOTHING;

-- Insert Test Evaluation Committee Members (password: eval123)
INSERT INTO users (full_name, email, password_hash, role_id, is_active) VALUES
('Dr. Michael Davis', 'eval1@fypify.com', '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
 (SELECT id FROM roles WHERE name = 'EVALUATION_COMMITTEE'), true),
('Dr. Emily Wilson', 'eval2@fypify.com', '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
 (SELECT id FROM roles WHERE name = 'EVALUATION_COMMITTEE'), true),
('Dr. James Taylor', 'eval3@fypify.com', '$2a$10$8K1p/a0dL3.SYU7oZbdXf.ZhFyNvSVWn5kXaVHvFLVQxz7LQEqR9K',
 (SELECT id FROM roles WHERE name = 'EVALUATION_COMMITTEE'), true)
ON CONFLICT (email) DO NOTHING;

-- Insert System Settings
INSERT INTO system_settings (key, value) VALUES
('group_min_size', '{"value": 2, "description": "Minimum number of members in a group"}'),
('group_max_size', '{"value": 4, "description": "Maximum number of members in a group"}'),
('supervisor_weight', '{"value": 20, "description": "Supervisor review weight percentage"}'),
('committee_weight', '{"value": 80, "description": "Committee review weight percentage"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insert Document Types
INSERT INTO document_types (code, title, weight_supervisor, weight_committee) VALUES
('PROPOSAL', 'Project Proposal', 20, 80),
('SRS', 'Software Requirements Specification', 20, 80),
('DESIGN', 'System Design Document', 20, 80),
('MID_TERM', 'Mid-Term Report', 20, 80),
('FINAL_THESIS', 'Final Thesis', 20, 80)
ON CONFLICT (code) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE 'Test Accounts Created:';
  RAISE NOTICE '- Admin: admin@fypify.com / admin123';
  RAISE NOTICE '- Supervisor: supervisor@fypify.com / supervisor123';
  RAISE NOTICE '- FYP Committee: fyp@fypify.com / fyp123';
  RAISE NOTICE '- Students: alice@fypify.com, bob@fypify.com, charlie@fypify.com, diana@fypify.com / student123';
  RAISE NOTICE '- Evaluators: eval1@fypify.com, eval2@fypify.com, eval3@fypify.com / eval123';
END $$;
