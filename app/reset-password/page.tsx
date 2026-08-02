"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  ApiErrorBanner,
  PasswordField,
  LoadingIndicator,
  SubmitButton,
} from "@/components/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <LoadingIndicator visible label="Loading…" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam || (!token ? "Invalid or missing reset token." : ""));
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  function validateForm(): boolean {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    if (!token) {
      setError("Invalid reset token. Please request a new link.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
      });

      if (resetError) {
        setError(resetError.message || "Failed to reset password.");
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
              Set new password
            </h1>
            <p className="text-sm text-ink-muted mt-2">
              Create a new, strong password for your account.
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
                <p className="text-sm text-secondary font-medium">Password updated</p>
                <p className="text-xs text-ink-muted mt-1">
                  Your password has been successfully reset.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-pill bg-primary px-8 py-3 text-base font-semibold text-surface shadow-md transition-colors hover:bg-primary-strong w-full"
              >
                Sign in now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <PasswordField
                label="New Password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={fieldErrors.password}
                disabled={loading || !token}
                autoComplete="new-password"
              />

              <PasswordField
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                error={fieldErrors.confirmPassword}
                disabled={loading || !token}
                autoComplete="new-password"
              />

              <div className="pt-2">
                <SubmitButton loading={loading} disabled={loading || !token}>
                  Update Password
                </SubmitButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
