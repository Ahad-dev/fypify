# FYPify - Detailed Architecture Diagram

## Project Overview

**FYPify** is a Final Year Project (FYP) Management System that enables universities to manage student projects, committee evaluations, and academic workflows. The application follows a modern full-stack architecture with a Spring Boot backend and Next.js frontend.

---

## High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["🌐 Client Layer"]
        Browser["Web Browser"]
    end
    
    subgraph Frontend["⚛️ Frontend (Next.js)"]
        Pages["App Router Pages"]
        Components["UI Components"]
        Contexts["React Contexts"]
        Services["API Services"]
        Hooks["Custom Hooks"]
    end
    
    subgraph Backend["☕ Backend (Spring Boot)"]
        Controllers["REST Controllers"]
        ServiceLayer["Service Layer"]
        Repositories["JPA Repositories"]
        Security["Security (JWT)"]
    end
    
    subgraph External["☁️ External Services"]
        Cloudinary["Cloudinary (File Storage)"]
        Email["Email Service (SMTP)"]
    end
    
    subgraph Database["🗄️ Database Layer"]
        PostgreSQL["PostgreSQL"]
    end
    
    Browser --> Pages
    Pages --> Components
    Pages --> Contexts
    Services --> Controllers
    Hooks --> Services
    Controllers --> Security
    Controllers --> ServiceLayer
    ServiceLayer --> Repositories
    ServiceLayer --> Cloudinary
    ServiceLayer --> Email
    Repositories --> PostgreSQL
```

---

## Backend Architecture (Spring Boot)

### Package Structure

```
backend/src/main/java/com/fypify/backend/
├── BackendApplication.java          # Main entry point
├── common/                           # Shared utilities
│   ├── controller/                   # Base controller
│   ├── exception/                    # Global exception handling
│   └── response/                     # API response DTOs
├── config/                           # Configuration classes
│   ├── AsyncConfig.java              # Async processing
│   ├── CloudinaryConfig.java         # File upload config
│   ├── DataSeeder.java               # Initial data setup
│   ├── OpenApiConfig.java            # Swagger/OpenAPI
│   ├── SecurityConfig.java           # Security configuration
│   └── WebSocketConfig.java          # Real-time notifications
├── security/                         # Security layer
│   ├── CustomUserDetailsService.java
│   ├── SecurityService.java
│   ├── UserPrincipal.java
│   └── jwt/                          # JWT token handling
└── modules/                          # Feature modules
    ├── admin/                        # Admin management
    ├── auth/                         # Authentication
    ├── committee/                    # Committee operations
    ├── email/                        # Email notifications
    ├── evaluation/                   # Project evaluation
    ├── file/                         # File management
    ├── group/                        # Student groups
    ├── notification/                 # Notifications
    ├── project/                      # Project management
    ├── submission/                   # Document submissions
    └── user/                         # User management
```

### Module Layered Architecture

```mermaid
flowchart LR
    subgraph Module["📦 Each Backend Module"]
        direction TB
        C["Controller"]
        D["DTOs"]
        S["Service"]
        R["Repository"]
        E["Entity"]
    end
    
    HTTP["HTTP Request"] --> C
    C --> D
    C --> S
    S --> R
    R --> E
    E --> DB[(Database)]
```

### Backend Modules Detail

```mermaid
flowchart TB
    subgraph Modules["🔧 Backend Modules"]
        direction LR
        
        subgraph Core["Core Modules"]
            Auth["auth<br/>Login/Register/JWT"]
            User["user<br/>User Profiles"]
            Admin["admin<br/>System Admin"]
        end
        
        subgraph Business["Business Modules"]
            Group["group<br/>Student Groups"]
            Project["project<br/>FYP Projects"]
            Submission["submission<br/>Document Upload"]
            Evaluation["evaluation<br/>Project Scoring"]
            Committee["committee<br/>Evaluation Panels"]
        end
        
        subgraph Support["Support Modules"]
            Email["email<br/>Email Service"]
            File["file<br/>Cloudinary Storage"]
            Notification["notification<br/>WebSocket/Push"]
        end
    end
    
    Auth --> User
    User --> Group
    Group --> Project
    Project --> Submission
    Committee --> Evaluation
    Evaluation --> Project
    Notification --> Email
    File --> Submission
```

---

## Frontend Architecture (Next.js)

### Directory Structure

```
frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   ├── globals.css                   # Global styles
│   ├── admin/                        # Admin pages
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── committees/
│   │   ├── document-types/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── audit-logs/
│   ├── student/                      # Student pages
│   │   ├── dashboard/
│   │   ├── group/
│   │   ├── project/
│   │   ├── submissions/
│   │   └── results/
│   ├── supervisor/                   # Supervisor pages
│   │   ├── dashboard/
│   │   ├── groups/
│   │   ├── proposals/
│   │   ├── submissions/
│   │   └── evaluation/
│   ├── committee/                    # Committee pages
│   │   ├── fyp/
│   │   └── eval/
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── components/                       # Reusable components
│   ├── ui/                           # 54 UI components (shadcn/ui)
│   ├── layout/                       # Layout components
│   ├── auth/                         # Auth components
│   ├── project/                      # Project components
│   ├── supervisor/                   # Supervisor components
│   └── submission/                   # Submission components
├── contexts/                         # React Contexts
│   ├── AuthContext.tsx               # Auth state
│   └── SystemSettingsContext.tsx     # App settings
├── shared/                           # Shared utilities
│   ├── api/                          # API client config
│   ├── services/                     # API service functions
│   ├── hooks/                        # Custom React hooks
│   ├── types/                        # TypeScript types
│   └── constants/                    # App constants
├── providers/                        # React providers
├── lib/                              # Utility libraries
└── public/                           # Static assets
```

### Role-Based Routing Architecture

```mermaid
flowchart TB
    subgraph Auth["🔐 Authentication"]
        Login["login/"]
        Register["register/"]
        ForgotPwd["forgot-password/"]
        ResetPwd["reset-password/"]
    end
    
    subgraph Admin["👑 Admin Role"]
        AD["admin/dashboard"]
        AU["admin/users"]
        AC["admin/committees"]
        ADT["admin/document-types"]
        AR["admin/reports"]
        AS["admin/settings"]
        AAL["admin/audit-logs"]
    end
    
    subgraph Student["🎓 Student Role"]
        SD["student/dashboard"]
        SG["student/group"]
        SP["student/project"]
        SS["student/submissions"]
        SR["student/results"]
    end
    
    subgraph Supervisor["👨‍🏫 Supervisor Role"]
        SVD["supervisor/dashboard"]
        SVG["supervisor/groups"]
        SVP["supervisor/proposals"]
        SVS["supervisor/submissions"]
        SVE["supervisor/evaluation"]
    end
    
    subgraph Committee["📋 Committee Role"]
        CF["committee/fyp"]
        CE["committee/eval"]
    end
    
    Login --> AD & SD & SVD & CF
```

### Frontend Data Flow

```mermaid
flowchart LR
    subgraph UI["UI Layer"]
        Page["Page Component"]
        UIComp["UI Components"]
    end
    
    subgraph State["State Management"]
        Context["React Context"]
        Hook["Custom Hooks"]
    end
    
    subgraph Data["Data Layer"]
        Service["Service Layer"]
        API["API Client (Axios)"]
    end
    
    Page --> Context
    Page --> Hook
    Page --> UIComp
    Hook --> Service
    Service --> API
    API --> BE["Backend API"]
```

### Services & Hooks Mapping

| Service File | Hook File | Purpose |
|-------------|-----------|---------|
| `auth.service.ts` | `useAuth.ts` | Authentication & session |
| `admin.service.ts` | `useAdmin.ts` | Admin operations |
| `committee.service.ts` | `useCommittee.ts` | Committee management |
| `evaluation.service.ts` | `useEvaluation.ts` | Project evaluations |
| `file.service.ts` | `useFile.ts` | File upload/download |
| `group.service.ts` | `useGroup.ts` | Student groups |
| `notification.service.ts` | `useNotification.ts` | Notifications |
| `project.service.ts` | `useProject.ts` | Project CRUD |
| `submission.service.ts` | `useSubmission.ts` | Document submissions |

---

## Security Architecture

```mermaid
flowchart TB
    subgraph Client["Client"]
        Req["HTTP Request"]
    end
    
    subgraph Security["Security Layer"]
        JWTFilter["JWT Authentication Filter"]
        UserDetails["CustomUserDetailsService"]
        SecurityConfig["SecurityConfig"]
    end
    
    subgraph Auth["Authorization"]
        RoleCheck["Role-Based Access"]
        Principal["UserPrincipal"]
    end
    
    Req --> JWTFilter
    JWTFilter --> |"Valid Token"| UserDetails
    UserDetails --> Principal
    Principal --> RoleCheck
    RoleCheck --> |"Authorized"| Controller["Controller"]
    JWTFilter --> |"Invalid"| Reject["401 Unauthorized"]
```

---

## Database Entity Relationships

```mermaid
erDiagram
    USER ||--o{ GROUP_MEMBER : "belongs to"
    USER ||--o| SUPERVISOR : "can be"
    USER ||--o| COMMITTEE_MEMBER : "can be"
    
    GROUP ||--|{ GROUP_MEMBER : "has"
    GROUP ||--o| PROJECT : "owns"
    GROUP ||--o{ SUBMISSION : "submits"
    
    PROJECT ||--o{ EVALUATION : "receives"
    PROJECT }o--|| SUPERVISOR : "supervised by"
    
    COMMITTEE ||--|{ COMMITTEE_MEMBER : "includes"
    COMMITTEE ||--o{ EVALUATION : "performs"
    
    SUBMISSION ||--o{ FILE : "contains"
    SUBMISSION }o--|| DOCUMENT_TYPE : "of type"
    
    USER {
        uuid id PK
        string email
        string password
        string role
        string firstName
        string lastName
    }
    
    GROUP {
        uuid id PK
        string name
        string status
    }
    
    PROJECT {
        uuid id PK
        string title
        string description
        string status
    }
    
    SUBMISSION {
        uuid id PK
        datetime submittedAt
        string status
    }
    
    EVALUATION {
        uuid id PK
        decimal score
        string feedback
        boolean isDraft
    }
```

---

## Complete Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Java 17+** | Programming language |
| **Spring Boot 3.x** | Application framework |
| **Spring Security** | Authentication & authorization |
| **Spring Data JPA** | Database ORM |
| **PostgreSQL** | Relational database |
| **JWT** | Token-based authentication |
| **Cloudinary** | Cloud file storage |
| **WebSocket** | Real-time notifications |
| **Maven** | Build tool |
| **Docker** | Containerization |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework (App Router) |
| **TypeScript** | Type-safe JavaScript |
| **React 18** | UI library |
| **TailwindCSS** | Utility-first CSS |
| **shadcn/ui** | UI component library |
| **Axios** | HTTP client |
| **React Hook Form** | Form handling |
| **React Query** | Server state management |

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Production["☁️ Production Environment"]
        subgraph FrontendDeploy["Frontend"]
            Vercel["Vercel / Netlify"]
        end
        
        subgraph BackendDeploy["Backend"]
            Render["Render.com"]
            Docker["Docker Container"]
        end
        
        subgraph Services["External Services"]
            CloudDB["PostgreSQL (Cloud)"]
            CloudinaryProd["Cloudinary CDN"]
            SMTP["SMTP Server"]
        end
    end
    
    Users["Users"] --> Vercel
    Vercel --> Render
    Render --> Docker
    Docker --> CloudDB
    Docker --> CloudinaryProd
    Docker --> SMTP
```

---

## Summary

The **FYPify** system follows a clean, modular architecture:

1. **Backend**: Spring Boot with modular package structure following Controller → Service → Repository pattern
2. **Frontend**: Next.js with App Router, role-based routing, and shared services/hooks pattern
3. **Security**: JWT-based authentication with role-based access control
4. **External Services**: Cloudinary for file storage, WebSocket for real-time features
5. **Database**: PostgreSQL with JPA/Hibernate ORM

The application supports four primary user roles: **Admin**, **Student**, **Supervisor**, and **Committee Member**, each with dedicated pages and functionalities.
