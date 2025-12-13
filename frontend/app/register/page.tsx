'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * Registration is admin-only in FYPIFY.
 * This page informs users to contact their administrator.
 */
export default function RegisterPage() {
  return (
    <AuthLayout
      title="Registration Restricted"
      subtitle="Account creation is managed by administrators"
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-muted-foreground">
            User registration is not available for self-service.
          </p>
          <p className="text-muted-foreground">
            Please contact your administrator or FYP coordinator to get an account.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
