"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { signUp, signIn } from "@/lib/auth-client";
import {
  validateSignup,
  deriveAuthFormPolicy,
  canInvokeAuthentication,
  type SignupValues,
  type FieldErrors,
  type AuthFormState,
} from "@/lib/landing/auth-form";
import {
  AuthTextField,
  PasswordField,
  ApiErrorBanner,
  GoogleOAuthButton,
  LoadingIndicator,
  SubmitButton,
  normalizeAuthError,
} from "@/components/auth";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignupValues>>({});
  const [formState, setFormState] = useState<AuthFormState>({
    kind: "idle",
    apiError: null,
  });

  const policy = deriveAuthFormPolicy(formState);

  function handleFieldChange(
    field: keyof SignupValues,
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
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateSignup({ name, email, password });
    setFieldErrors(validation.fieldErrors);

    if (!canInvokeAuthentication(validation, formState)) {
      if (!validation.isValid) {
        setFormState({ kind: "invalid", apiError: null });
      }
      return;
    }

    setFormState({ kind: "submitting", apiError: null });

    try {
      const result = await signUp.email({
        name: validation.values.name,
        email: validation.values.email,
        password: validation.values.password,
      });

      if (result.error) {
        const message = normalizeAuthError(result.error);
        setFormState({ kind: "apiError", apiError: message });
        return;
      }

      setFormState({ kind: "redirecting", apiError: null });
      router.push("/dashboard/user");
    } catch (err) {
      const message = normalizeAuthError(err);
      setFormState({ kind: "apiError", apiError: message });
    }
  }

  async function handleGoogleSignup() {
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
              Create an account
            </h1>
            <p className="text-sm text-ink-muted mt-[var(--spacing-2)]">
              Sign up for Goa Startup Festival 2026
            </p>
          </div>

          {/* API Error Banner */}
          <ApiErrorBanner message={formState.apiError} />

          {/* Loading Indicator */}
          <LoadingIndicator visible={policy.showLoadingIndicator} />

          <form className="space-y-[var(--spacing-4)]" onSubmit={handleEmailSignup} noValidate>
            {/* Google OAuth — primary quick action */}
            <GoogleOAuthButton
              onClick={handleGoogleSignup}
              loading={formState.kind === "oauthRedirecting"}
              disabled={policy.controlsDisabled}
            />

            {/* Divider */}
            <div className="relative flex items-center py-[var(--spacing-2)]">
              <div className="flex-grow border-t border-surface-alt" />
              <span className="flex-shrink-0 mx-[var(--spacing-4)] text-ink-muted text-xs uppercase tracking-wider">
                Or sign up with email
              </span>
              <div className="flex-grow border-t border-surface-alt" />
            </div>

            {/* Name Field */}
            <AuthTextField
              type="text"
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => handleFieldChange("name", e.target.value, setName)}
              error={fieldErrors.name}
              disabled={policy.controlsDisabled}
              autoComplete="name"
            />

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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
              error={fieldErrors.password}
              disabled={policy.controlsDisabled}
              autoComplete="new-password"
            />

            {/* Submit Button */}
            <SubmitButton
              loading={formState.kind === "submitting"}
              disabled={policy.controlsDisabled}
            >
              Create Account
            </SubmitButton>

            {/* Login link */}
            <p className="text-sm text-ink-muted text-center pt-[var(--spacing-1)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary-strong hover:underline font-medium"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
