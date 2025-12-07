# FYPIFY - Final Year Project Management System
## Complete System Documentation

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Responsibilities](#user-roles--responsibilities)
3. [Functional Requirements](#functional-requirements)
4. [System Flow (10 Stages)](#system-flow-10-stages)
5. [API Structure](#api-structure)
6. [Frontend Structure](#frontend-structure)
7. [Tech Stack](#tech-stack)
8. [Key Features](#key-features)

---

## 🎯 System Overview

**FYPIFY** is a comprehensive Final Year Project Management System designed to manage the entire lifecycle of FYP projects in a university setting.

**Core Capabilities:**
- Role-based dashboards and access control (5 user types)
- Document submission with versioning (v1, v2, v3...)
- Multi-stage review and approval workflows
- Rubric-based grading system with weighted criteria
- Deadline management and tracking
- Real-time notifications
- Audit logging for compliance
- Cloud-based file storage (Cloudinary)
- PDF report generation

---

## 👥 User Roles & Responsibilities

### 1. **Student**
- Creates and registers FYP projects
- Submits documents (Proposal, SRS, Design, Thesis)
- Responds to revision requests
- Views evaluations and final grades
- Tracks deadlines and notifications

### 2. **Supervisor**
- Reviews student submissions
- Approves or rejects submissions
- Sends revision requests with comments
- Uploads annotated PDFs (optional)
- Oversees student progress
- Monitors submission status

### 3. **Evaluator**
- Grades student submissions using rubrics
- Enters marks with weighted criteria
- Adds evaluator comments
- Saves draft evaluations
- Finalizes and locks marks

### 4. **FYP Committee**
- Manages system-wide deadlines
- Assigns supervisors to students
- Assigns evaluators to projects
- Monitors all project progress
- Tracks delays and late submissions
- Compiles and releases final results
- Generates reports (PDF)
- Views system analytics

### 5. **System Administrator**
- Manages users (CRUD operations)
- Assigns roles
- Configures system settings
- Database backup and restore
- Monitors system health
- Manages email/SMTP configuration
- Manages Cloudinary storage

---

## 📊 Functional Requirements

### 3.1 Student Requirements (12 Total)

| Req ID | Title | Description | Tools/Tech |
|--------|-------|-------------|------------|
| STU-01 | User Login | Student authentication | Spring Security, JWT, BCrypt |
| STU-02 | View Dashboard | Status, deadlines, notifications | React, Next.js, React Query |
| STU-03 | Register FYP Project | Submit title, abstract, domain, supervisor | Spring Boot, JPA, PostgreSQL |
| STU-04 | Upload Submission | Upload documents (Proposal/Design/SRS/Thesis) | Cloudinary, Presigned URLs, axios |
| STU-05 | Versioning | Each upload creates v1, v2, v3 | Database versioning, JPA |
| STU-06 | Mark as Final Submit | Locks submission for review | Entity status transitions |
| STU-07 | View Revision Comments | View supervisor feedback | REST API, React Components |
| STU-08 | Submit Revision | Upload new version after revision | Cloudinary Upload, DB Update |
| STU-09 | View Grades | See marks after release | React Table, API endpoint |
| STU-10 | View Deadlines | See all submission deadlines | Calendar UI, Backend deadline table |
| STU-11 | View Notifications | Alerts for deadlines, revisions, approvals | Web notifications, DB notifications |
| STU-12 | Download Files | Download submitted files | Cloudinary signed URLs |

### 3.2 Supervisor Requirements (9 Total)

| Req ID | Title | Description | Tools/Tech |
|--------|-------|-------------|------------|
| SUP-01 | Login | Supervisor authentication with RBAC | Spring Security (RBAC) |
| SUP-02 | View Assigned Students | List all supervised projects | Backend filtering, React tables |
| SUP-03 | View Student Submissions | Access all document versions | Cloudinary fetch URLs, JPA queries |
| SUP-04 | Approve Submission | Approve for next stage | Controller + Service layer |
| SUP-05 | Request Revision | Add comments & request re-upload | Comment model, Notification system |
| SUP-06 | Upload Annotated PDF | Upload edited/commented PDF | Cloudinary file upload API |
| SUP-07 | Submission Status Tracking | View approved/pending/revision status | Dashboard charts |
| SUP-08 | Comment on Documents | Provide feedback | Comment entity, API |
| SUP-09 | Progress Monitoring | Visual overview of student progress | Dashboard analytics |

### 3.3 Evaluator Requirements (7 Total)

| Req ID | Title | Description | Tools/Tech |
|--------|-------|-------------|------------|
| EVA-01 | Login | Evaluator authentication | JWT, RBAC |
| EVA-02 | View Assigned Projects | List of projects for evaluation | Filtering queries |
| EVA-03 | Grade Submission | Enter marks using rubric | Rubric Forms, React Hook Form |
| EVA-04 | Rubric-based Evaluation | Weighted marks and criteria | JSONB in PostgreSQL |
| EVA-05 | Enter Comments | Add evaluator feedback | Text fields + DB |
| EVA-06 | Save Draft Evaluation | Save partially before finalizing | Additional status field |
| EVA-07 | Finalize Marks | Lock marks to prevent changes | DB lock functionality |

### 3.4 FYP Committee Requirements (10 Total)

| Req ID | Title | Description | Tools/Tech |
|--------|-------|-------------|------------|
| FYP-01 | Login | Authentication with elevated privileges | RBAC |
| FYP-02 | Create/Modify Deadlines | Manage all submission deadlines | Deadline entity, datetime pickers |
| FYP-03 | Assign Supervisors | Allocate supervisors to students | Admin UI |
| FYP-04 | Assign Evaluators | Assign evaluators to projects | JPA relations |
| FYP-05 | Release Results | Lock and publish final results | Status update logic |
| FYP-06 | Overall Dashboard | View stats, progress, late submissions | Analytics, charts.js |
| FYP-07 | Generate Reports | Export progress, marksheets, lists (PDF) | PDF generation, iText/PDFBox |
| FYP-08 | View All Submissions | System-level visibility | Super admin privileges |
| FYP-09 | Track Delays | Identify late submissions | Cron jobs/date comparisons |
| FYP-10 | View Audit Logs | Oversight of system changes | Logback JSON logs |

### 3.5 Admin Requirements (8 Total)

| Req ID | Title | Description | Tools/Tech |
|--------|-------|-------------|------------|
| ADM-01 | Manage Users | Add, edit, delete users | CRUD + JPA |
| ADM-02 | Assign Roles | Manage role mappings | RBAC setup |
| ADM-03 | System Settings | Configure system-level settings | ENV variables |
| ADM-04 | Backup Data | Export database backups | pg_dump/cron |
| ADM-05 | Restore Data | Restore past backup | DB restore operations |
| ADM-06 | Monitor System Health | Use monitoring tools | Prometheus + Grafana |
| ADM-07 | Email Configuration | Configure SMTP for notifications | JavaMail/SendGrid API |
| ADM-08 | Manage Storage | Clean old files, manage uploads | Cloudinary Admin API/CLI |

---

## 🔄 System Flow (10 Stages)

### Stage 1: System Login (All Roles)
**User Actions:**
1. User enters email + password
2. System validates credentials
3. System detects user role

**System Response:**
- Redirects to role-specific dashboard:
  - Student → `/student/dashboard`
  - Supervisor → `/supervisor/dashboard`
  - Evaluator → `/evaluator/dashboard`
  - Committee → `/committee/dashboard`
  - Admin → `/admin/dashboard`

---

### Stage 2: Project Registration (Student + Committee)

**Student Flow:**
1. Student logs in
2. Opens "Register Project" page
3. Enters: Title, Abstract, Domain, Proposed Supervisor
4. Submits project

**System Action:**
- Saves project as "Draft" or "Waiting for Approval"
- Notifies Committee/Admin

**Committee Flow:**
1. Reviews student project list
2. Approves or assigns different supervisor
3. Status becomes "Registered"

---

### Stage 3: Supervisor Assignment (Committee)

**Committee Flow:**
1. Opens supervisor assignment page
2. Selects student → assigns supervisor
3. System updates project entity
4. Notifications sent to Student + Supervisor

---

### Stage 4: Document Submission (Student)

**Student Flow:**
For each document type (Proposal, SRS, Design, Test, Thesis):
1. Opens "My Submissions" page
2. Uploads file → System stores as **v1**
3. Clicks "Mark as Final" → locks document

**System Action:**
- Stores file in Cloudinary
- Creates version history (v1, v2, v3...)
- Updates status: "Pending Supervisor Review"
- Notifies supervisor

---

### Stage 5: Supervisor Review (Supervisor + Student)

**Supervisor Flow:**
1. Views pending submissions
2. Reviews: student name, document version, deadline status
3. Takes action:
   - **Approve** → Moves to evaluation stage
   - **Request Revision** → Adds comments
   - **Upload Annotated PDF** (optional)
4. Tracks student progress

**Student Response to Revision:**
1. Receives notification
2. Opens "Revision Comments" page
3. Uploads new version → System creates v2, v3, etc.
4. Marks as Final → Returns to supervisor

---

### Stage 6: Evaluator Assignment (Committee)

**Committee Flow:**
1. Opens evaluator assignment page
2. Assigns evaluator(s) to each project
3. System displays evaluator names + assigned projects
4. Evaluator notified

---

### Stage 7: Evaluation Process (Evaluator + Student + System)

**Evaluator Flow:**
1. Opens "Rubric Grading Page"
2. Enters scores for each rubric item (Criteria, Weight, Score)
3. Actions:
   - Save draft
   - Add comments
   - Finalize marks (locked)

**System Action:**
- Stores rubric as JSON
- Calculates weighted score
- Notifies Committee when evaluation completed

**Student Flow:**
- Student cannot see marks until Committee releases them

---

### Stage 8: Final Result Compilation (Committee)

**Committee Flow:**
1. Collects:
   - Supervisor decisions
   - Evaluator scores
   - Late penalties
   - Weight formulas
2. Actions:
   - Combine scores
   - Re-evaluate if needed
   - Finalize marks
   - Click "Release Results"

**System Action:**
- Locks final results
- Updates student marks table
- Notifies students + supervisors

---

### Stage 9: Student Results Publication

**Student Flow:**
1. Opens "Results Page"
2. Views:
   - Final marks
   - Rubric breakdown
   - Supervisor comments
   - Evaluator comments
   - Total score
3. Downloads marksheet (PDF) and final project report

---

### Stage 10: Admin System Management

**Admin Flow:**
- Add, update, delete users
- Generate database backups
- Restore backups
- Manage Cloudinary storage
- Configure system settings
- View system logs
- Manage user roles
- **Note:** Admin doesn't interact with projects directly

---

## 🚀 Complete Lifecycle Diagram

```
STUDENT
  ↓ Register Project
  ↓ Upload Documents (v1)
  ↓ Mark as Final
  ↓ Wait for Supervisor Review
  ↓
  ← Revision Request? → Upload New Version (v2, v3...)
  ↓
  ↓ Supervisor Approved
  ↓ Evaluator Assigned
  ↓ Evaluator Grades (Rubric)
  ↓ Committee Compiles Results
  ↓ Results Released
  ↓ Student Views Marks
```

---

## 🔌 API Structure

### Standard Response Format

**✅ Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**❌ Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

---

### API Categories

#### 1. AUTH APIs
- `POST /auth/login` - User authentication, returns JWT token

#### 2. USER MANAGEMENT (Admin)
- `GET /users` - Fetch all users
- `POST /users` - Create new user
- `PATCH /users/{id}/role` - Assign role

#### 3. PROJECT APIs
- `POST /projects` - Register new project (Student)
- `GET /projects/my` - Get student's project
- `GET /projects/students` - Get supervisor's assigned students
- `GET /projects/all` - Get all projects (Committee)
- `PATCH /projects/{id}/assign-supervisor` - Assign supervisor
- `PATCH /projects/{id}/assign-evaluators` - Assign evaluators

#### 4. SUBMISSION APIs (Student)
- `POST /submissions` - Upload submission
- `GET /submissions/project/:projectId` - Get project submissions
- `PATCH /submissions/{id}/mark-final` - Lock submission

#### 5. SUPERVISOR REVIEW APIs
- `POST /reviews/{submissionId}/approve` - Approve submission
- `POST /reviews/{submissionId}/request-revision` - Request revision
- `GET /reviews/submission/:id` - Get review comments

#### 6. EVALUATION APIs (Evaluator)
- `POST /evaluations` - Create/save evaluation (draft or final)
- `PATCH /evaluations/{id}/finalize` - Finalize and lock marks
- `GET /evaluations/submission/:id` - Get evaluation details

#### 7. DEADLINE APIs (Committee)
- `POST /deadlines` - Create deadline
- `GET /deadlines` - Get all deadlines
- `PATCH /deadlines/{id}` - Update deadline

#### 8. RESULTS APIs
- `PATCH /results/{projectId}/release` - Release final results
- `GET /results/student` - Get student's final result

#### 9. NOTIFICATION APIs
- `GET /notifications` - Fetch user notifications
- `PATCH /notifications/{id}/mark-read` - Mark as read

#### 10. AUDIT LOG APIs
- `GET /audit` - Retrieve system audit logs

#### 11. CLOUDINARY STORAGE APIs
- `POST /files/upload` - Upload file to Cloudinary
- `GET /files/{id}` - Get file details
- `DELETE /files/{id}` - Delete file

---

## 🎨 Frontend Structure

### Route Structure

```
/login                              # Login page (all roles)

/student
  /dashboard                        # Student dashboard
  /project/register                 # Project registration
  /submissions                      # Submissions list
  /submissions/upload               # Upload new submission
  /submissions/history/:type        # Version history
  /notifications                    # Notifications
  /results                          # Final results

/supervisor
  /dashboard                        # Supervisor dashboard
  /students                         # Assigned students list
  /review/:submissionId             # Review submission
  /progress                         # Progress tracking

/evaluator
  /dashboard                        # Evaluator dashboard
  /projects                         # Assigned projects
  /evaluate/:submissionId           # Rubric grading

/committee
  /dashboard                        # Analytics dashboard
  /assign-supervisors               # Supervisor assignment
  /assign-evaluators                # Evaluator assignment
  /deadlines                        # Deadline management
  /results                          # Result compilation

/admin
  /dashboard                        # System dashboard
  /users                            # User management
  /storage                          # Cloudinary management
  /settings                         # System settings & backups
```

---

### Page-to-API Mapping

#### Student Module (9 Pages)

| Page | Route | APIs Used | Purpose |
|------|-------|-----------|---------|
| Login | `/login` | `POST /auth/login` | Authentication |
| Dashboard | `/student/dashboard` | `GET /projects/my`, `GET /deadlines`, `GET /notifications` | Overview |
| Register Project | `/student/project/register` | `POST /projects` | Create new project |
| My Submissions | `/student/submissions` | `GET /submissions/project/:projectId` | View all submissions |
| Upload Submission | `/student/submissions/upload` | `POST /files/upload`, `POST /submissions`, `PATCH /submissions/{id}/mark-final` | Upload documents |
| Submission History | `/student/submissions/history/:type` | `GET /submissions/project/:projectId`, `GET /reviews/submission/:id` | View versions & comments |
| Revision Comments | `/student/revision-comments` | `GET /reviews/submission/:id` | View supervisor feedback |
| Notifications | `/student/notifications` | `GET /notifications`, `PATCH /notifications/:id/mark-read` | Manage notifications |
| Results | `/student/results` | `GET /results/student` | View final grades |

#### Supervisor Module (4 Pages)

| Page | Route | APIs Used | Purpose |
|------|-------|-----------|---------|
| Dashboard | `/supervisor/dashboard` | `GET /projects/students` | Overview of assigned students |
| Assigned Students | `/supervisor/students` | `GET /projects/students` | List all supervised projects |
| Review Submission | `/supervisor/review/:submissionId` | `GET /submissions/project/:projectId`, `POST /reviews/{id}/approve`, `POST /reviews/{id}/request-revision` | Review & approve/revise |
| Progress Tracking | `/supervisor/progress` | `GET /submissions/project/:projectId` | Monitor student progress |

#### Evaluator Module (3 Pages)

| Page | Route | APIs Used | Purpose |
|------|-------|-----------|---------|
| Dashboard | `/evaluator/dashboard` | `GET /projects/evaluator/:id` | Overview of assigned projects |
| Assigned Projects | `/evaluator/projects` | `GET /projects/evaluator/:id` | List projects to evaluate |
| Rubric Grading | `/evaluator/evaluate/:submissionId` | `POST /evaluations`, `PATCH /evaluations/{id}/finalize` | Grade using rubric |

#### FYP Committee Module (5 Pages)

| Page | Route | APIs Used | Purpose |
|------|-------|-----------|---------|
| Dashboard | `/committee/dashboard` | `GET /projects/all`, `GET /deadlines`, `GET /evaluations` | System-wide analytics |
| Assign Supervisors | `/committee/assign-supervisors` | `PATCH /projects/{id}/assign-supervisor` | Assign supervisors to students |
| Assign Evaluators | `/committee/assign-evaluators` | `PATCH /projects/{id}/assign-evaluators` | Assign evaluators to projects |
| Deadline Management | `/committee/deadlines` | `POST /deadlines`, `GET /deadlines`, `PATCH /deadlines/{id}` | Manage submission deadlines |
| Result Compilation | `/committee/results` | `PATCH /results/{projectId}/release` | Compile & release final results |

#### Admin Module (4 Pages)

| Page | Route | APIs Used | Purpose |
|------|-------|-----------|---------|
| Dashboard | `/admin/dashboard` | `GET /audit` | System logs & stats |
| User Management | `/admin/users` | `GET /users`, `POST /users`, `PATCH /users/{id}/role` | CRUD operations on users |
| Storage Management | `/admin/storage` | `GET /files` | Manage Cloudinary storage |
| Settings & Backup | `/admin/settings` | `PATCH /settings` | System configuration |

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Security:** Spring Security + JWT
- **ORM:** Spring Data JPA
- **Database:** PostgreSQL (with JSONB support)
- **Password Hashing:** BCrypt
- **File Storage:** Cloudinary SDK
- **PDF Generation:** iText or Apache PDFBox
- **Email:** JavaMail or SendGrid API
- **Monitoring:** Prometheus + Grafana
- **Logging:** Logback (JSON logs)

### Frontend
- **Framework:** Next.js 14+ (React 18+)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Charts:** Chart.js or Recharts
- **Date Handling:** date-fns or dayjs
- **PDF Viewer:** react-pdf or pdf.js
- **Notifications:** React Toastify or similar

### DevOps & Infrastructure
- **Version Control:** Git
- **Cloud Storage:** Cloudinary
- **Database Backups:** pg_dump + cron jobs
- **Environment Management:** .env files
- **API Documentation:** Swagger/OpenAPI (optional)

---

## ⭐ Key Features

### 1. **Document Versioning System**
- Every file upload creates a new version (v1, v2, v3...)
- Full version history maintained
- Previous versions accessible for review
- "Mark as Final" locks version for review

### 2. **Rubric-Based Grading**
- Customizable rubric criteria
- Weighted scoring system
- Stored as JSONB in PostgreSQL
- Draft and finalized states
- Locked after finalization

### 3. **Multi-Stage Approval Workflow**
```
Upload → Supervisor Review → Approval/Revision → Evaluation → Result Compilation → Release
```

### 4. **Role-Based Access Control (RBAC)**
- 5 distinct user roles
- Role-specific dashboards
- Permission-based API access
- JWT token authentication

### 5. **Cloudinary Integration**
- Secure file uploads
- Presigned URLs for downloads
- PDF viewing in browser
- Storage management via Admin API

### 6. **Notification System**
- Real-time alerts for:
  - Deadline reminders
  - Revision requests
  - Approval notifications
  - Evaluation completion
  - Result releases
- Mark as read functionality

### 7. **Deadline Management**
- Committee sets deadlines per submission type
- Automatic late submission detection
- Deadline tracking on dashboards
- Calendar views for students

### 8. **Analytics & Reporting**
- Committee dashboard with system-wide stats
- Progress tracking for supervisors
- Late submission monitoring
- PDF report generation (marksheets, progress reports)

### 9. **Audit Logging**
- All system actions logged
- User action tracking
- Timestamp recording
- Committee/Admin oversight

### 10. **Revision Cycle**
- Supervisor can request revisions with comments
- Student uploads new version
- Maintains full revision history
- Optional annotated PDF uploads

---

## 📝 Implementation Notes

### Authentication Flow
1. User logs in → Backend validates credentials
2. JWT token generated and returned
3. Frontend stores token in localStorage/sessionStorage
4. Token included in Authorization header for all subsequent requests
5. Backend validates token and extracts user role
6. Role-based access control enforced

### File Upload Flow
1. Frontend selects file
2. Upload to Cloudinary via `POST /files/upload`
3. Cloudinary returns secure URL + file ID
4. Frontend sends file ID to backend via `POST /submissions`
5. Backend stores file metadata in database
6. Cloudinary URL used for viewing/downloading

### Version Control Logic
1. Each new upload increments version number
2. Previous versions remain accessible
3. "Mark as Final" sets `isFinal: true` and `status: PENDING_SUPERVISOR`
4. Revisions create new versions but maintain link to original submission

### Status Transitions
```
DRAFT → PENDING_SUPERVISOR → APPROVED/REVISION_REQUESTED → PENDING_EVALUATION → EVALUATED → FINAL_RESULT_RELEASED
```

### Notification Triggers
- Project registration → Notify Committee
- Submission uploaded → Notify Supervisor
- Revision requested → Notify Student
- Submission approved → Notify Student + Committee
- Evaluator assigned → Notify Evaluator
- Evaluation complete → Notify Committee
- Results released → Notify Student + Supervisor

---

## 🎯 Development Roadmap

### Phase 1: Setup & Authentication
- [ ] Initialize Spring Boot backend
- [ ] Initialize Next.js frontend
- [ ] Setup PostgreSQL database
- [ ] Implement user authentication (JWT)
- [ ] Create user management APIs
- [ ] Build login page

### Phase 2: Student Module
- [ ] Project registration
- [ ] Document submission with Cloudinary
- [ ] Versioning system
- [ ] Student dashboard
- [ ] Notifications

### Phase 3: Supervisor Module
- [ ] View assigned students
- [ ] Review submissions
- [ ] Approve/request revision
- [ ] Upload annotated PDFs
- [ ] Progress tracking

### Phase 4: Evaluator Module
- [ ] View assigned projects
- [ ] Rubric grading system
- [ ] Draft/finalize evaluations
- [ ] Evaluator dashboard

### Phase 5: Committee Module
- [ ] Supervisor/evaluator assignment
- [ ] Deadline management
- [ ] Analytics dashboard
- [ ] Result compilation
- [ ] PDF report generation

### Phase 6: Admin Module
- [ ] User management CRUD
- [ ] System settings
- [ ] Backup/restore
- [ ] Storage management
- [ ] Audit logs

### Phase 7: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Deployment setup

---

## 📚 Additional Considerations

### Security
- Password hashing with BCrypt
- JWT token expiration
- Role-based route protection
- Input validation and sanitization
- SQL injection prevention (JPA parameterized queries)
- XSS protection
- CORS configuration

### Performance
- Database indexing on frequently queried fields
- Pagination for large datasets
- Lazy loading for file lists
- Caching for static data (deadlines, user roles)
- Cloudinary CDN for fast file delivery

### Scalability
- Microservices architecture (optional future enhancement)
- Load balancing
- Database replication
- Cloudinary handles file storage scaling
- Stateless backend design (JWT)

### Error Handling
- Consistent error response format
- Descriptive error codes
- User-friendly error messages
- Backend validation
- Frontend form validation
- Network error handling

---

## 🎓 Summary

**FYPIFY** is a complete, production-ready FYP Management System with:
- **5 user roles** with distinct responsibilities
- **46 functional requirements** across all roles
- **10-stage workflow** covering complete project lifecycle
- **Standardized API structure** with 11 categories
- **25+ frontend pages** with clear API mappings
- **Modern tech stack** (Spring Boot + Next.js + PostgreSQL + Cloudinary)
- **Enterprise features** (RBAC, versioning, rubrics, notifications, audit logs)

This documentation serves as the complete blueprint for implementation.

---

*Last Updated: December 7, 2025*
