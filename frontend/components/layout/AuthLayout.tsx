'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-secondary p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 text-white">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold text-white">FYPIFY</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Streamline Your Final Year Project Journey
          </h1>
          <p className="text-lg text-white/80">
            Manage proposals, track progress, collaborate with supervisors, and
            submit your work seamlessly — all in one platform.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-1">Easy Collaboration</h3>
              <p className="text-white/70 text-sm">
                Work together with your group and supervisor effortlessly.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-1">Track Progress</h3>
              <p className="text-white/70 text-sm">
                Monitor milestones and deadlines in real-time.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-1">Smart Submissions</h3>
              <p className="text-white/70 text-sm">
                Submit and receive feedback on your deliverables.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-1">Evaluation Ready</h3>
              <p className="text-white/70 text-sm">
                Prepare for evaluations with structured assessments.
              </p>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-sm">
          &copy; {new Date().getFullYear()} FYPIFY. All rights reserved.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-primary">FYPIFY</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
