"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  AuthTextField,
  ApiErrorBanner,
  LoadingIndicator,
  SubmitButton,
} from "@/components/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});

  function validateForm(): boolean {
    const errors: { email?: string } = {};

    if (!email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setError("");
    setLoading(true);

    try {
      // @ts-expect-error - forgetPassword is available via Better Auth
      const { error: resetError } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset email.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-canvas">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors mb-6 group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            aria-hidden="true"
          />
          Back to login
        </Link>

        {/* Card */}
        <div className="rounded-md border border-surface-alt bg-surface shadow-md px-8 py-8 sm:px-12 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-h2 font-bold text-ink leading-tight">
              Reset password
            </h1>
            <p className="text-sm text-ink-muted mt-2">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* API Error */}
          <ApiErrorBanner message={error || null} />

          {/* Loading Indicator */}
          <LoadingIndicator visible={loading} />

          {/* Success State */}
          {success ? (
            <div className="text-center">
              <div className="rounded-md bg-secondary/10 border border-secondary/20 p-4 mb-6">
                <CheckCircle className="w-8 h-8 text-secondary mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-secondary font-medium">Check your email</p>
                <p className="text-xs text-ink-muted mt-1">
                  We&apos;ve sent a password reset link to {email}. Check your spam folder if you don&apos;t see it.
                </p>
              </div>
              <Link
                href="/login"
                className="text-sm text-primary hover:text-primary-strong hover:underline font-medium"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <AuthTextField
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({});
                }}
                error={fieldErrors.email}
                disabled={loading}
                autoComplete="email"
              />

              <div className="pt-2">
                <SubmitButton loading={loading} disabled={loading}>
                  Send Reset Link
                </SubmitButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
