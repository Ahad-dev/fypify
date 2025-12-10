-- ============================
-- FYPIFY: Seed Data (UUID Version)
-- Run after V3__UUID_Migration.sql
-- ============================

-- Insert Roles with fixed UUIDs for consistency
INSERT INTO roles (id, name, description) VALUES
('00000000-0000-0000-0000-000000000001', 'ADMIN', 'System Administrator with full access'),
('00000000-0000-0000-0000-000000000002', 'STUDENT', 'Student user who can form groups and submit projects'),
('00000000-0000-0000-0000-000000000003', 'SUPERVISOR', 'Project supervisor who reviews submissions'),
('00000000-0000-0000-0000-000000000004', 'FYP_COMMITTEE', 'FYP Committee member who approves/rejects projects'),
('00000000-0000-0000-0000-000000000005', 'EVALUATION_COMMITTEE', 'Evaluation Committee member who reviews and scores submissions')
ON CONFLICT (name) DO NOTHING;

-- Insert Admin User (password: admin123)
-- BCrypt hash for 'admin123': $2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active) 
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'System Administrator',
  'admin@fypify.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
  '00000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Insert Test Supervisor (password: supervisor123)
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active) 
VALUES (
  '20000000-0000-0000-0000-000000000001',
  'Dr. John Smith',
  'supervisor@fypify.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
  '00000000-0000-0000-0000-000000000003',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Insert Second Supervisor (password: supervisor123)
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active) 
VALUES (
  '20000000-0000-0000-0000-000000000002',
  'Dr. Sarah Wilson',
  'supervisor2@fypify.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
  '00000000-0000-0000-0000-000000000003',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Insert Test Students (password: student123)
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active) VALUES
('30000000-0000-0000-0000-000000000001', 'Alice Johnson', 'alice@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa', 
 '00000000-0000-0000-0000-000000000002', true),
('30000000-0000-0000-0000-000000000002', 'Bob Williams', 'bob@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000002', true),
('30000000-0000-0000-0000-000000000003', 'Charlie Brown', 'charlie@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000002', true),
('30000000-0000-0000-0000-000000000004', 'Diana Prince', 'diana@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000002', true),
('30000000-0000-0000-0000-000000000005', 'Eve Turner', 'eve@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000002', true),
('30000000-0000-0000-0000-000000000006', 'Frank Miller', 'frank@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000002', true)
ON CONFLICT (email) DO NOTHING;

-- Insert FYP Committee Members (password: fyp123)
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active) VALUES
('40000000-0000-0000-0000-000000000001', 'Dr. Michael Chen', 'fyp1@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000004', true),
('40000000-0000-0000-0000-000000000002', 'Dr. Lisa Park', 'fyp2@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000004', true)
ON CONFLICT (email) DO NOTHING;

-- Insert Evaluation Committee Members (password: eval123)
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active) VALUES
('50000000-0000-0000-0000-000000000001', 'Dr. James Anderson', 'eval1@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000005', true),
('50000000-0000-0000-0000-000000000002', 'Dr. Emily Roberts', 'eval2@fypify.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBWMq4kB1L1Fq4Y.r8E8LXyFGa',
 '00000000-0000-0000-0000-000000000005', true)
ON CONFLICT (email) DO NOTHING;

-- Add FYP Committee Members to committee table
INSERT INTO fyp_committee_members (user_id) VALUES
('40000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Add Evaluation Committee Members to committee table
INSERT INTO eval_committee_members (user_id) VALUES
('50000000-0000-0000-0000-000000000001'),
('50000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Insert Document Types
INSERT INTO document_types (id, code, title, description, weight_supervisor, weight_committee, sort_order) VALUES
('60000000-0000-0000-0000-000000000001', 'PROPOSAL', 'Project Proposal', 'Initial project proposal document', 20, 80, 1),
('60000000-0000-0000-0000-000000000002', 'SRS', 'Software Requirements Specification', 'Detailed requirements document', 20, 80, 2),
('60000000-0000-0000-0000-000000000003', 'DESIGN', 'Design Document', 'System design and architecture', 20, 80, 3),
('60000000-0000-0000-0000-000000000004', 'MID_TERM', 'Mid-Term Report', 'Progress report at mid-term', 30, 70, 4),
('60000000-0000-0000-0000-000000000005', 'FINAL_THESIS', 'Final Thesis', 'Complete final thesis document', 20, 80, 5)
ON CONFLICT (code) DO NOTHING;

-- Insert System Settings
INSERT INTO system_settings (key, value) VALUES
('group_min_size', '{"value": 2}'::jsonb),
('group_max_size', '{"value": 4}'::jsonb),
('allow_student_registration', '{"value": true}'::jsonb),
('current_semester', '{"value": "Fall 2025"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

/* ========== TEST DATA CREDENTIALS ==========
All test users use the same password for simplicity:
Password: admin123 (BCrypt hash provided)

Test Accounts:
- Admin: admin@fypify.com / admin123
- Supervisor: supervisor@fypify.com / admin123
- Supervisor 2: supervisor2@fypify.com / admin123
- Students: alice@fypify.com, bob@fypify.com, charlie@fypify.com, diana@fypify.com, eve@fypify.com, frank@fypify.com / admin123
- FYP Committee: fyp1@fypify.com, fyp2@fypify.com / admin123
- Eval Committee: eval1@fypify.com, eval2@fypify.com / admin123
========================================== */
