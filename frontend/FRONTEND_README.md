# FYPIFY Frontend

Modern, beautiful frontend for the FYPIFY Final Year Project Management System built with Next.js 16, React Query, and Shadcn UI.

## 🚀 Tech Stack

- **Framework**: Next.js 16.0.7 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom theme
- **UI Components**: Shadcn UI
- **State Management**: React Query (TanStack Query) 5.90.12
- **HTTP Client**: Axios 1.13.2 with interceptors
- **Authentication**: JWT with auto token refresh

## 🎨 Features

- **Beautiful UI**: Purple-themed design with custom animations
- **Type-Safe**: Full TypeScript support
- **Responsive**: Mobile-first responsive design
- **Modular**: Reusable components and custom hooks
- **Secure**: JWT authentication with refresh token rotation
- **Optimized**: React Query for caching and state management

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── login/               # Login page
│   ├── dashboard/           # Dashboard page
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page (redirects to login/dashboard)
│   └── globals.css          # Global styles with custom theme
├── components/              # React components
│   ├── auth/               # Authentication components
│   │   └── LoginForm.tsx   # Beautiful login form
│   ├── guards/             # Route guards
│   │   └── AuthGuard.tsx   # Protected route wrapper
│   └── ui/                 # Shadcn UI components
├── contexts/               # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── providers/              # Provider wrappers
│   └── ReactQueryProvider.tsx # React Query setup
├── shared/                # Shared utilities
│   ├── api/              # API layer
│   │   ├── apiHandler.ts # Axios instance with interceptors
│   │   └── https.ts      # HTTP method wrappers
│   ├── services/         # API services
│   │   └── auth.service.ts # Authentication API calls
│   ├── hooks/            # Custom hooks
│   │   └── useAuth.ts    # Authentication hooks (useLogin, useLogout)
│   └── types/            # TypeScript types
│       └── api.types.ts  # API response/request types
└── public/               # Static assets
```

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Custom Theme

The application uses a custom purple-themed design defined in `globals.css`:

- **Primary**: `#9A22B5` (Purple)
- **Secondary**: `#2563EB` (Blue)
- **Accent**: `#F59E0B` (Yellow)
- **Success**: `#10B981` (Green)
- **Warning**: `#FACC15` (Yellow)
- **Danger**: `#EF4444` (Red)
- **Info**: `#3B82F6` (Blue)

## 🔐 Authentication

### Login Credentials (Demo)

| Role       | Email                  | Password   |
|------------|------------------------|------------|
| Admin      | admin@fypify.com       | Admin@123  |
| Student    | student@fypify.com     | Student@123 |
| Supervisor | supervisor@fypify.com  | Supervisor@123 |
| Evaluator  | evaluator@fypify.com   | Evaluator@123 |
| Committee  | committee@fypify.com   | Committee@123 |

### Token Management

- **Access Token**: 15 minutes expiry, stored in localStorage
- **Refresh Token**: 7 days expiry, sent as httpOnly cookie
- **Auto Refresh**: Axios interceptor automatically refreshes tokens on 401 errors
- **Logout on Invalid**: Redirects to login if refresh token is invalid

## 🔌 API Integration

### Base URL
Backend API runs on: `http://localhost:8080/api`

### Axios Interceptors

**Request Interceptor**:
- Automatically adds `Authorization: Bearer <token>` header

**Response Interceptor**:
- Catches 401 errors
- Attempts token refresh
- Retries failed request with new token
- Redirects to login if refresh fails

### Example API Call

```typescript
import { useLogin } from '@/shared/hooks/useAuth';

function LoginComponent() {
  const loginMutation = useLogin();

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      // User is logged in, tokens stored, redirects to dashboard
    } catch (error) {
      // Handle login error
    }
  };
}
```

## 🧩 Key Components

### AuthContext
Manages user authentication state across the application.

```typescript
const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

### AuthGuard
Protects routes from unauthenticated access.

```typescript
<AuthGuard>
  <ProtectedPage />
</AuthGuard>
```

### Custom Hooks

- `useLogin()`: React Query mutation for login
- `useLogout()`: React Query mutation for logout
- `useAuth()`: Access authentication context

## 🎯 Best Practices

- ✅ TypeScript everywhere with strict typing
- ✅ Modular component architecture
- ✅ Separation of concerns (components, hooks, services)
- ✅ React Query for server state management
- ✅ Context for client state management
- ✅ Custom hooks for reusable logic
- ✅ Consistent error handling
- ✅ Responsive design with Tailwind CSS
- ✅ Accessibility considerations

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🌐 Pages

### `/` (Home)
- Redirects to `/login` if not authenticated
- Redirects to `/dashboard` if authenticated

### `/login`
- Beautiful login form with animations
- Email and password validation
- Loading states
- Error handling
- Quick access credentials display

### `/dashboard`
- Protected route (requires authentication)
- User profile card with role badge
- Statistics cards
- Recent activity section
- Logout functionality

## 🔮 Future Enhancements

- User profile management
- Project creation and management
- Supervisor assignment
- Evaluation system
- File uploads
- Notifications
- Real-time updates with WebSockets

---

Built with ❤️ for FYPIFY
