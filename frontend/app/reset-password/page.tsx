'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, ArrowLeft, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/shared/services';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Validation schema for reset password form
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const password = watch('newPassword');

  // Password strength indicators
  const passwordChecks = {
    length: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    lowercase: /[a-z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error: any) {
      const message = error?.message || 'Failed to reset password. The link may have expired.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // No token provided
  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <Link href="/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout title="Password Reset!" subtitle="">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              Your password has been reset successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              You can now sign in with your new password.
            </p>
          </div>

          <Link href="/login">
            <Button className="w-full">Continue to Sign In</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be different from previous passwords"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* New Password Field */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              className={cn(
                'pl-10 pr-10',
                errors.newPassword && 'border-destructive focus-visible:ring-destructive'
              )}
              {...register('newPassword')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          )}

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2 mt-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      passwordStrength >= level
                        ? passwordStrength <= 2
                          ? 'bg-destructive'
                          : passwordStrength === 3
                          ? 'bg-warning'
                          : 'bg-success'
                        : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <ul className="text-xs space-y-1">
                <li className={cn(passwordChecks.length ? 'text-success' : 'text-muted-foreground')}>
                  {passwordChecks.length ? '✓' : '○'} At least 8 characters
                </li>
                <li className={cn(passwordChecks.uppercase ? 'text-success' : 'text-muted-foreground')}>
                  {passwordChecks.uppercase ? '✓' : '○'} One uppercase letter
                </li>
                <li className={cn(passwordChecks.lowercase ? 'text-success' : 'text-muted-foreground')}>
                  {passwordChecks.lowercase ? '✓' : '○'} One lowercase letter
                </li>
                <li className={cn(passwordChecks.number ? 'text-success' : 'text-muted-foreground')}>
                  {passwordChecks.number ? '✓' : '○'} One number
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              className={cn(
                'pl-10 pr-10',
                errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
              )}
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Loading..." subtitle="">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
