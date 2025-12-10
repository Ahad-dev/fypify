'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Hash, Building } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthContext } from '@/contexts/AuthContext';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import { cn } from '@/lib/utils';

// Departments list - can be fetched from API later
const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Other',
];

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      rollNumber: '',
      department: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        rollNumber: data.rollNumber,
        department: data.department,
      });
    } catch {
      // Error is handled in AuthContext
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join FYPIFY to manage your final year project"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                placeholder="John"
                className={cn(
                  'pl-10',
                  errors.firstName && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('firstName')}
                disabled={isLoading}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              className={cn(
                errors.lastName && 'border-destructive focus-visible:ring-destructive'
              )}
              {...register('lastName')}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              className={cn(
                'pl-10',
                errors.email && 'border-destructive focus-visible:ring-destructive'
              )}
              {...register('email')}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Roll Number & Department Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Roll Number */}
          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number (Optional)</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="rollNumber"
                placeholder="21F-1234"
                className={cn(
                  'pl-10',
                  errors.rollNumber && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('rollNumber')}
                disabled={isLoading}
              />
            </div>
            {errors.rollNumber && (
              <p className="text-xs text-destructive">{errors.rollNumber.message}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department (Optional)</Label>
            <Select
              onValueChange={(value) => setValue('department', value)}
              disabled={isLoading}
            >
              <SelectTrigger
                className={cn(
                  errors.department && 'border-destructive focus-visible:ring-destructive'
                )}
              >
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-xs text-destructive">{errors.department.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className={cn(
                'pl-10 pr-10',
                errors.password && 'border-destructive focus-visible:ring-destructive'
              )}
              {...register('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Must be 8+ characters with uppercase, lowercase, and number.
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className={cn(
                'pl-10 pr-10',
                errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
              )}
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Agreement */}
        <p className="text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-primary hover:underline font-medium"
          >
            Sign in to your account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
