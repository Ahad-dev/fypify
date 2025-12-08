"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/shared/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles, Shield, Users } from "lucide-react";
import Logo from "@/components/common/Logo";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-6xl relative z-10 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8 animate-fade-in-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-neutral-100">
              <Logo size="lg" showTagline={true} />
            </div>

            <div className="space-y-6 mt-12">
              <h2 className="text-4xl font-bold text-neutral-900 leading-tight">
                Manage Your Final Year Projects{" "}
                <span className="text-primary">Efficiently</span>
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                A comprehensive platform for students, supervisors, and evaluators to collaborate seamlessly on academic projects.
              </p>

              <div className="space-y-4 pt-6">
                <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Secure & Reliable</h3>
                    <p className="text-sm text-neutral-600">JWT authentication with role-based access control</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Collaborative Platform</h3>
                    <p className="text-sm text-neutral-600">Connect students with supervisors and evaluators</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Modern Interface</h3>
                    <p className="text-sm text-neutral-600">Beautiful, intuitive design for better productivity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-down">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-neutral-100 inline-block mb-4">
              <Logo size="lg" showTagline={true} />
            </div>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl animate-fade-in-up">
            <CardHeader className="space-y-1 pb-6 pt-8">
              <CardTitle className="text-2xl font-bold text-center text-neutral-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-neutral-600">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Alert */}
                {loginMutation.isError && (
                  <Alert variant="destructive" className="animate-shake border-danger bg-danger-light">
                    <AlertDescription className="text-danger-dark font-medium">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(loginMutation.error as any)?.response?.data?.error?.message ||
                        "Invalid credentials. Please check your email and password."}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-neutral-700">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 text-base border-neutral-200 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={loginMutation.isPending}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-neutral-700">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 text-base border-neutral-200 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={loginMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-50"
                      disabled={loginMutation.isPending}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary/20 cursor-pointer" 
                    />
                    <span className="text-neutral-600 group-hover:text-neutral-900 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <a href="#" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-linear-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-base"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Access Demo */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <p className="text-xs font-semibold text-neutral-500 text-center mb-4 uppercase tracking-wide">
                  Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 p-3 rounded-lg transition-colors cursor-pointer"
                       onClick={() => { setEmail("admin@fypify.com"); setPassword("Admin@123"); }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-danger/10 flex items-center justify-center">
                        <span className="text-danger text-xs font-bold">A</span>
                      </div>
                      <p className="font-semibold text-neutral-900">Admin</p>
                    </div>
                    <p className="text-neutral-500 truncate">admin@fypify.com</p>
                  </div>
                  <div className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 p-3 rounded-lg transition-colors cursor-pointer"
                       onClick={() => { setEmail("student@fypify.com"); setPassword("Student@123"); }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-success/10 flex items-center justify-center">
                        <span className="text-success text-xs font-bold">S</span>
                      </div>
                      <p className="font-semibold text-neutral-900">Student</p>
                    </div>
                    <p className="text-neutral-500 truncate">student@fypify.com</p>
                  </div>
                </div>
                <p className="text-center text-xs text-neutral-500 mt-3 font-medium">
                  Click any card to auto-fill credentials
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-neutral-600 mt-6">
            © 2025 FYPIFY. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
