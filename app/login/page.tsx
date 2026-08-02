"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { signIn } from "@/lib/auth-client";
import {
  validateLogin,
  deriveAuthFormPolicy,
  canInvokeAuthentication,
  type LoginValues,
  type FieldErrors,
  type AuthFormState,
} from "@/lib/landing/auth-form";
import { resolveDashboardPath } from "@/lib/landing/auth-routing";
import {
  AuthTextField,
  PasswordField,
  ApiErrorBanner,
  GoogleOAuthButton,
  LoadingIndicator,
  SubmitButton,
  normalizeAuthError,
} from "@/components/auth";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <LoadingIndicator visible label="Loading login…" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginValues>>({});
  const [formState, setFormState] = useState<AuthFormState>({
    kind: "idle",
    apiError: null,
  });

  const policy = deriveAuthFormPolicy(formState);

  function handleFieldChange(
    field: keyof LoginValues,
    value: string,
    setter: (v: string) => void,
  ) {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    // Reset from invalid/apiError to idle when user edits
    if (formState.kind === "invalid" || formState.kind === "apiError") {
      setFormState({ kind: "idle", apiError: null });
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateLogin({ email, password });
    setFieldErrors(validation.fieldErrors);

    if (!canInvokeAuthentication(validation, formState)) {
      if (!validation.isValid) {
        setFormState({ kind: "invalid", apiError: null });
      }
      return;
    }

    setFormState({ kind: "submitting", apiError: null });

    try {
      const result = await signIn.email({
        email: validation.values.email,
        password: validation.values.password,
      });

      if (result.error) {
        const message = normalizeAuthError(result.error);
        setFormState({ kind: "apiError", apiError: message });
        return;
      }

      // Retrieve session for role-based redirect
      try {
        const sessionRes = await fetch("/api/auth/get-session");
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          const role = session?.user?.role ?? null;
          setFormState({ kind: "redirecting", apiError: null });
          router.push(resolveDashboardPath(role));
        } else {
          // Fallback to /dashboard if session retrieval fails
          setFormState({ kind: "redirecting", apiError: null });
          router.push("/dashboard");
        }
      } catch {
        // Fallback to /dashboard if session retrieval fails
        setFormState({ kind: "redirecting", apiError: null });
        router.push("/dashboard");
      }
    } catch (err) {
      const message = normalizeAuthError(err);
      setFormState({ kind: "apiError", apiError: message });
    }
  }

  async function handleGoogleLogin() {
    setFormState({ kind: "oauthRedirecting", apiError: null });
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      const message = normalizeAuthError(err);
      setFormState({ kind: "apiError", apiError: message });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-[var(--spacing-4)] py-[var(--spacing-8)] bg-canvas">
      <div className="w-full max-w-md">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-[var(--spacing-2)] text-sm text-ink-muted hover:text-ink transition-colors mb-[var(--spacing-6)] group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            aria-hidden="true"
          />
          Back to home
        </Link>

        {/* Card */}
        <div className="rounded-[var(--radius-md)] border border-surface-alt bg-surface shadow-md px-[var(--spacing-8)] py-[var(--spacing-8)] sm:px-[var(--spacing-12)] sm:py-[var(--spacing-12)]">
          {/* Header */}
          <div className="mb-[var(--spacing-8)]">
            <h1 className="font-serif text-h2 font-bold text-ink leading-tight">
              Welcome back
            </h1>
            <p className="text-sm text-ink-muted mt-[var(--spacing-2)]">
              Sign in to your Goa Startup Festival account
            </p>
          </div>

          {/* API Error Banner */}
          <ApiErrorBanner message={formState.apiError} />

          {/* Loading Indicator */}
          <LoadingIndicator visible={policy.showLoadingIndicator} />

          <form className="space-y-[var(--spacing-4)]" onSubmit={handleEmailLogin} noValidate>
            {/* Email Field */}
            <AuthTextField
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
              error={fieldErrors.email}
              disabled={policy.controlsDisabled}
              autoComplete="email"
            />

            {/* Password Field */}
            <PasswordField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
              error={fieldErrors.password}
              disabled={policy.controlsDisabled}
              autoComplete="current-password"
            />

            {/* Links row */}
            <div className="flex flex-wrap justify-between items-center text-sm pt-[var(--spacing-1)] gap-[var(--spacing-2)]">
              <span className="text-ink-muted">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:text-primary-strong hover:underline font-medium"
                >
                  Sign up
                </Link>
              </span>
              <Link
                href="/forgot-password"
                className="text-ink-muted hover:text-ink text-xs transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Google OAuth */}
            <div className="pt-[var(--spacing-2)]">
              <GoogleOAuthButton
                onClick={handleGoogleLogin}
                loading={formState.kind === "oauthRedirecting"}
                disabled={policy.controlsDisabled}
              />
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-[var(--spacing-2)]">
              <div className="flex-grow border-t border-surface-alt" />
              <span className="flex-shrink-0 mx-[var(--spacing-4)] text-ink-muted text-xs uppercase tracking-wider">
                Or
              </span>
              <div className="flex-grow border-t border-surface-alt" />
            </div>

            {/* Submit Button */}
            <SubmitButton
              loading={formState.kind === "submitting"}
              disabled={policy.controlsDisabled}
            >
              Log in
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
