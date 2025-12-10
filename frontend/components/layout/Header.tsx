'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Navigation items based on user role
const getNavigationItems = (isAdmin: boolean, isSupervisor: boolean, isStudent: boolean) => {
  const items = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['all'],
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderKanban,
      roles: ['all'],
    },
  ];

  if (isStudent) {
    items.push({
      name: 'My Group',
      href: '/groups/my',
      icon: Users,
      roles: ['STUDENT'],
    });
    items.push({
      name: 'Proposals',
      href: '/proposals',
      icon: FileText,
      roles: ['STUDENT'],
    });
  }

  if (isSupervisor) {
    items.push({
      name: 'Groups',
      href: '/groups',
      icon: Users,
      roles: ['SUPERVISOR'],
    });
    items.push({
      name: 'Meetings',
      href: '/meetings',
      icon: Calendar,
      roles: ['SUPERVISOR'],
    });
  }

  if (isAdmin) {
    items.push({
      name: 'Users',
      href: '/admin/users',
      icon: User,
      roles: ['ADMIN'],
    });
    items.push({
      name: 'Semesters',
      href: '/admin/semesters',
      icon: GraduationCap,
      roles: ['ADMIN'],
    });
  }

  return items;
};

export function Header() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isSupervisor, isStudent } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = getNavigationItems(isAdmin, isSupervisor, isStudent);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Admin', variant: 'destructive' as const };
    if (isSupervisor) return { label: 'Supervisor', variant: 'default' as const };
    if (isStudent) return { label: 'Student', variant: 'secondary' as const };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-primary hidden sm:inline-block">
            FYPIFY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  {roleBadge && (
                    <Badge variant={roleBadge.variant} className="text-xs px-1 py-0">
                      {roleBadge.label}
                    </Badge>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container px-4 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
