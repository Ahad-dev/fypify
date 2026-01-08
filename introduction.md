# FYPify - Introduction

## Project Overview

**FYPify** is a comprehensive **Final Year Project (FYP) Management System** designed to streamline and automate the academic project lifecycle in universities. The platform provides a centralized solution for managing student projects, supervisor assignments, committee evaluations, and document submissions.

---

## Problem Statement

Universities face significant challenges in managing Final Year Projects:

| Challenge | Description |
|-----------|-------------|
| **Manual Processes** | Paper-based submissions, manual tracking, and fragmented communication |
| **Lack of Transparency** | Students unaware of evaluation criteria or project status |
| **Coordination Issues** | Difficulty scheduling evaluations and managing committee members |
| **Document Management** | Lost submissions, version control issues, deadline tracking |
| **Evaluation Inconsistency** | No standardized rubrics or evaluation history |

---

## Solution

FYPify addresses these challenges through a modern web-based platform with:

- **Role-Based Access Control** - Dedicated portals for Students, Supervisors, Committee Members, and Administrators
- **Automated Workflows** - Streamlined submission, evaluation, and approval processes
- **Real-Time Notifications** - WebSocket-powered updates for immediate communication
- **Document Management** - Cloud-based file storage with version tracking
- **Evaluation System** - Draft and finalize evaluations with scoring rubrics

---

## Key Features

### For Students
- ✅ Create and join project groups
- ✅ Submit project proposals
- ✅ Upload documents (reports, code, presentations)
- ✅ View evaluation results and feedback
- ✅ Track submission deadlines

### For Supervisors
- ✅ Review and approve student groups
- ✅ Manage assigned projects
- ✅ Evaluate student submissions
- ✅ Provide feedback on proposals

### For Committee Members
- ✅ Evaluate assigned projects
- ✅ Score based on evaluation criteria
- ✅ Draft and finalize evaluations
- ✅ Access project documents and history

### For Administrators
- ✅ Manage users and roles
- ✅ Configure system settings
- ✅ Create evaluation committees
- ✅ Define document types and deadlines
- ✅ Generate reports and audit logs

---

## Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Java 17** | Programming Language |
| **Spring Boot 3.x** | Application Framework |
| **Spring Security + JWT** | Authentication & Authorization |
| **Spring Data JPA** | Database ORM |
| **PostgreSQL** | Relational Database |
| **Cloudinary** | Cloud File Storage |
| **WebSocket** | Real-Time Notifications |
| **Maven** | Build Tool |
| **Docker** | Containerization |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React Framework (App Router) |
| **TypeScript** | Type-Safe JavaScript |
| **TailwindCSS** | Utility-First CSS |
| **shadcn/ui** | UI Component Library |
| **Axios** | HTTP Client |
| **React Query** | Server State Management |

---

## Architecture Overview

FYPify follows a **Clean Layered Architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              FRONTEND (Next.js)                          │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐   │
│  │  Pages  │  │Components│  │ Contexts│  │ Services │   │
│  └─────────┘  └──────────┘  └─────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────┐
│              BACKEND (Spring Boot)                       │
│  ┌────────────┐  ┌─────────┐  ┌────────────┐            │
│  │ Controllers│→ │ Services│→ │Repositories│            │
│  └────────────┘  └─────────┘  └────────────┘            │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  DATABASE (PostgreSQL)                   │
└─────────────────────────────────────────────────────────┘
```

---

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | System administrator with full access | Manage users, committees, settings, reports |
| **Student** | Registered students working on FYPs | Groups, projects, submissions, results |
| **Supervisor** | Faculty members supervising projects | Assigned groups, proposals, evaluations |
| **Committee** | Evaluation committee members | Project evaluations, scoring |

---

## Project Structure

```
FYPify/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/fypify/backend/
│   │       ├── config/      # Configuration classes
│   │       ├── security/    # JWT & Security
│   │       ├── common/      # Shared utilities
│   │       └── modules/     # Feature modules
│   │           ├── admin/
│   │           ├── auth/
│   │           ├── committee/
│   │           ├── evaluation/
│   │           ├── file/
│   │           ├── group/
│   │           ├── notification/
│   │           ├── project/
│   │           ├── submission/
│   │           └── user/
│   └── src/main/resources/
│       ├── application.yml
│       └── templates/       # Email templates
│
└── frontend/                # Next.js Frontend
    ├── app/                 # App Router pages
    │   ├── admin/
    │   ├── student/
    │   ├── supervisor/
    │   └── committee/
    ├── components/          # Reusable UI components
    ├── contexts/            # React contexts
    ├── shared/              # Shared utilities
    │   ├── services/
    │   ├── hooks/
    │   └── types/
    └── public/              # Static assets
```

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [Architecture Diagram](./architecture_diagram.md) | Detailed system architecture with Mermaid diagrams |
| [Design Patterns](./design_patterns.md) | GoF design patterns used in the backend |

---

## Team

**Course**: Software Construction & Development (SCD)  
**Semester**: 5th Semester  
**Institution**: University

---

## License

This project is developed for academic purposes as part of the Software Construction & Development course.
