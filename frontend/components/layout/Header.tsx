'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Menu,
  X,
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
import { NotificationPanel } from './NotificationPanel';
import { cn } from '@/lib/utils';

// Navigation items based on user role
const getNavigationItems = (isAdmin: boolean, isSupervisor: boolean, isStudent: boolean, isFypCommittee: boolean) => {
  const items: { name: string; href: string; icon: typeof LayoutDashboard; roles: string[] }[] = [];

  // Add role-specific dashboard
  if (isAdmin) {
    items.push({
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN'],
    });
  } else if (isFypCommittee) {
    items.push({
      name: 'Dashboard',
      href: '/committee/fyp/dashboard',
      icon: LayoutDashboard,
      roles: ['FYP_COMMITTEE'],
    });
  } else if (isSupervisor) {
    items.push({
      name: 'Dashboard',
      href: '/supervisor/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPERVISOR'],
    });
  } else if (isStudent) {
    items.push({
      name: 'Dashboard',
      href: '/student/dashboard',
      icon: LayoutDashboard,
      roles: ['STUDENT'],
    });
  }

  // Common items
  items.push({
    name: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    roles: ['all'],
  });

  if (isStudent) {
    items.push({
      name: 'My Group',
      href: '/student/group',
      icon: Users,
      roles: ['STUDENT'],
    });
    items.push({
      name: 'Proposals',
      href: '/student/proposals',
      icon: FileText,
      roles: ['STUDENT'],
    });
  }

  if (isSupervisor && !isAdmin) {
    items.push({
      name: 'Groups',
      href: '/supervisor/groups',
      icon: Users,
      roles: ['SUPERVISOR'],
    });
    items.push({
      name: 'Proposals',
      href: '/supervisor/proposals',
      icon: FileText,
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
  const { user, logout, isAdmin, isSupervisor, isStudent, isFypCommittee } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const navigationItems = getNavigationItems(isAdmin, isSupervisor, isStudent, isFypCommittee);

  // GSAP animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header entrance
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      });

      // Animate logo
      gsap.from(logoRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        delay: 0.2,
        ease: 'back.out(1.7)',
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);



  const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = () => {
    if (!user?.role) return null;
    const roleLabels: Record<string, { label: string; variant: 'destructive' | 'default' | 'secondary' }> = {
      ADMIN: { label: 'Admin', variant: 'destructive' },
      SUPERVISOR: { label: 'Supervisor', variant: 'default' },
      STUDENT: { label: 'Student', variant: 'secondary' },
      FYP_COMMITTEE: { label: 'FYP Committee', variant: 'default' },
      EVALUATION_COMMITTEE: { label: 'Evaluator', variant: 'default' },
    };
    return roleLabels[user.role] || null;
  };

  const roleBadge = getRoleBadge();

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div 
            ref={logoRef}
            className="flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105"
          >
            <Image
              src="/Logo.png"
              alt="FYPIFY Logo"
              width={36}
              height={36}
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline-block">
            FYPIFY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav ref={navRef} className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-neutral-600 hover:bg-primary/5 hover:text-primary'
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
          <NotificationPanel />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center p-6 gap-2  hover:bg-primary/5 focus:bg-primary/5 transition-colors duration-200 "
              >
                <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm font-medium">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.fullName}
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
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuLabel className="pb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 cursor-pointer rounded-md transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link 
                  href="/settings" 
                  className="flex items-center gap-2 cursor-pointer rounded-md transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive cursor-pointer rounded-md transition-colors duration-150 hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
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
            className="md:hidden hover:bg-primary/5 focus:bg-primary/5 transition-colors duration-200"
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
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
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
