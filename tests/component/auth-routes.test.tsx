import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { axe } from "jest-axe";

// ─── Mocks ─────────────────────────────────────────────────────────────

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("lucide-react", () => ({
  ArrowLeft: (props: Record<string, unknown>) =>
    React.createElement("svg", { ...props, "data-testid": "arrow-left-icon" }),
  Eye: (props: Record<string, unknown>) =>
    React.createElement("svg", { ...props, "data-testid": "eye-icon" }),
  EyeOff: (props: Record<string, unknown>) =>
    React.createElement("svg", { ...props, "data-testid": "eye-off-icon" }),
  AlertCircle: (props: Record<string, unknown>) =>
    React.createElement("svg", { ...props, "data-testid": "alert-circle-icon" }),
  Loader2: (props: Record<string, unknown>) =>
    React.createElement("svg", { ...props, "data-testid": "loader-icon" }),
}));

const mockSignInEmail = vi.fn();
const mockSignInSocial = vi.fn();
const mockSignUpEmail = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    email: (...args: unknown[]) => mockSignInEmail(...args),
    social: (...args: unknown[]) => mockSignInSocial(...args),
  },
  signUp: {
    email: (...args: unknown[]) => mockSignUpEmail(...args),
  },
}));

// ─── Imports (after mocks) ─────────────────────────────────────────────

import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";

// ─── Helpers ───────────────────────────────────────────────────────────

function fillLoginForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
}

function fillSignupForm(name: string, email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
}

function submitForm() {
  const submitBtn = screen.getByRole("button", { name: /log in|create account/i });
  fireEvent.click(submitBtn);
}

function mockFetchSession(role: string | null) {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ user: { role } }),
  });
}

// ─── Setup ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockReset();
  mockSignInEmail.mockReset();
  mockSignInSocial.mockReset();
  mockSignUpEmail.mockReset();
  global.fetch = vi.fn();
});

// ─── Login Page Renders ────────────────────────────────────────────────

describe("Login Page – Renders at /login", () => {
  it("renders h1, email, password fields, and submit button without errors", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });
});

// ─── Signup Page Renders ───────────────────────────────────────────────

describe("Signup Page – Renders at /signup", () => {
  it("renders h1, name, email, password fields, and submit button without errors", () => {
    render(<SignupPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });
});

// ─── Invalid Fields Without API Calls ──────────────────────────────────

describe("Auth Pages – Invalid fields show inline errors without API calls", () => {
  it("login: shows errors for empty fields without calling signIn", () => {
    render(<LoginPage />);
    submitForm();

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mockSignInEmail).not.toHaveBeenCalled();
  });

  it("login: shows invalid email error without calling signIn", () => {
    render(<LoginPage />);
    fillLoginForm("notanemail", "password123");
    submitForm();

    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(mockSignInEmail).not.toHaveBeenCalled();
  });

  it("login: shows password too short error without calling signIn", () => {
    render(<LoginPage />);
    fillLoginForm("user@example.com", "short");
    submitForm();

    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(mockSignInEmail).not.toHaveBeenCalled();
  });

  it("signup: shows errors for empty fields without calling signUp", () => {
    render(<SignupPage />);
    submitForm();

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mockSignUpEmail).not.toHaveBeenCalled();
  });

  it("signup: shows invalid email error without calling signUp", () => {
    render(<SignupPage />);
    fillSignupForm("John Doe", "invalid-email", "password123");
    submitForm();

    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(mockSignUpEmail).not.toHaveBeenCalled();
  });
});

// ─── API Errors Display Above Form ────────────────────────────────────

describe("Auth Pages – API errors display above the form via banner", () => {
  it("login: shows API error in role=alert banner", async () => {
    mockSignInEmail.mockResolvedValueOnce({
      error: { message: "Invalid email or password." },
    });

    render(<LoginPage />);
    fillLoginForm("user@example.com", "password123");
    submitForm();

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Invalid email or password.");
    });
    expect(mockSignInEmail).toHaveBeenCalledOnce();
  });

  it("login: shows generic error for unknown API errors", async () => {
    mockSignInEmail.mockRejectedValueOnce(new Error("Internal server error"));

    render(<LoginPage />);
    fillLoginForm("user@example.com", "password123");
    submitForm();

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("signup: shows API error in role=alert banner", async () => {
    mockSignUpEmail.mockResolvedValueOnce({
      error: { message: "Email already in use." },
    });

    render(<SignupPage />);
    fillSignupForm("Jane Doe", "jane@example.com", "password123");
    submitForm();

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Email already in use.");
    });
  });
});

// ─── Loading/Disabled State ────────────────────────────────────────────

describe("Auth Pages – Loading/disabled controls during submission", () => {
  it("login: disables all controls while submitting email login", async () => {
    let resolveSignIn: (value: unknown) => void;
    mockSignInEmail.mockReturnValueOnce(
      new Promise((resolve) => { resolveSignIn = resolve; }),
    );

    render(<LoginPage />);
    fillLoginForm("user@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeDisabled();
      expect(screen.getByLabelText("Password")).toBeDisabled();
      expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeDisabled();
    });

    // Cleanup: resolve the promise
    await act(async () => {
      resolveSignIn!({ error: null });
    });
  });

  it("login: shows loading indicator while submitting", async () => {
    let resolveSignIn: (value: unknown) => void;
    mockSignInEmail.mockReturnValueOnce(
      new Promise((resolve) => { resolveSignIn = resolve; }),
    );

    render(<LoginPage />);
    fillLoginForm("user@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    await act(async () => {
      resolveSignIn!({ error: null });
    });
  });

  it("signup: disables all controls while submitting email signup", async () => {
    let resolveSignUp: (value: unknown) => void;
    mockSignUpEmail.mockReturnValueOnce(
      new Promise((resolve) => { resolveSignUp = resolve; }),
    );

    render(<SignupPage />);
    fillSignupForm("John Doe", "john@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(screen.getByLabelText("Full Name")).toBeDisabled();
      expect(screen.getByLabelText("Email")).toBeDisabled();
      expect(screen.getByLabelText("Password")).toBeDisabled();
      expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeDisabled();
    });

    await act(async () => {
      resolveSignUp!({ error: null });
    });
  });
});

// ─── Email Login Flow – Role Redirect ──────────────────────────────────

describe("Auth Pages – Email login flow: success → role-based redirect", () => {
  it("redirects Admin role to /dashboard/admin", async () => {
    mockSignInEmail.mockResolvedValueOnce({ error: null });
    mockFetchSession("Admin");

    render(<LoginPage />);
    fillLoginForm("admin@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/admin");
    });
  });

  it("redirects Lead role to /dashboard/admin", async () => {
    mockSignInEmail.mockResolvedValueOnce({ error: null });
    mockFetchSession("Lead");

    render(<LoginPage />);
    fillLoginForm("lead@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/admin");
    });
  });

  it("redirects Volunteer role to /dashboard/volunteer", async () => {
    mockSignInEmail.mockResolvedValueOnce({ error: null });
    mockFetchSession("Volunteer");

    render(<LoginPage />);
    fillLoginForm("volunteer@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/volunteer");
    });
  });

  it("redirects Faculty role to /dashboard/volunteer", async () => {
    mockSignInEmail.mockResolvedValueOnce({ error: null });
    mockFetchSession("Faculty");

    render(<LoginPage />);
    fillLoginForm("faculty@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/volunteer");
    });
  });

  it("redirects Attendee role to /dashboard/user", async () => {
    mockSignInEmail.mockResolvedValueOnce({ error: null });
    mockFetchSession("Attendee");

    render(<LoginPage />);
    fillLoginForm("attendee@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/user");
    });
  });

  it("redirects unknown/missing role to /dashboard/user", async () => {
    mockSignInEmail.mockResolvedValueOnce({ error: null });
    mockFetchSession(null);

    render(<LoginPage />);
    fillLoginForm("unknown@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/user");
    });
  });

  it("falls back to /dashboard if session retrieval fails", async () => {
    mockSignInEmail.mockResolvedValueOnce({ error: null });
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network error"));

    render(<LoginPage />);
    fillLoginForm("user@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});

// ─── Email Signup Flow ─────────────────────────────────────────────────

describe("Auth Pages – Email signup flow: success → /dashboard/user", () => {
  it("redirects to /dashboard/user on successful signup", async () => {
    mockSignUpEmail.mockResolvedValueOnce({ error: null });

    render(<SignupPage />);
    fillSignupForm("Jane Doe", "jane@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/user");
    });
  });
});

// ─── Google OAuth Flow ─────────────────────────────────────────────────

describe("Auth Pages – Google OAuth flow", () => {
  it("login: calls signIn.social with provider=google and callbackURL=/dashboard", async () => {
    mockSignInSocial.mockResolvedValueOnce(undefined);

    render(<LoginPage />);
    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "/dashboard",
      });
    });
  });

  it("signup: calls signIn.social with provider=google and callbackURL=/dashboard", async () => {
    mockSignInSocial.mockResolvedValueOnce(undefined);

    render(<SignupPage />);
    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "/dashboard",
      });
    });
  });

  it("login: shows error banner if Google OAuth initiation fails", async () => {
    mockSignInSocial.mockRejectedValueOnce(new Error("OAuth unavailable"));

    render(<LoginPage />);
    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("login: disables controls during Google OAuth redirect", async () => {
    let resolveOAuth: (value: unknown) => void;
    mockSignInSocial.mockReturnValueOnce(
      new Promise((resolve) => { resolveOAuth = resolve; }),
    );

    render(<LoginPage />);
    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeDisabled();
      expect(screen.getByLabelText("Password")).toBeDisabled();
      expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();
    });

    await act(async () => {
      resolveOAuth!(undefined);
    });
  });
});

// ─── Navigation Links ──────────────────────────────────────────────────

describe("Auth Pages – Navigation links", () => {
  it("login page has signup link", () => {
    render(<LoginPage />);
    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("login page has home link", () => {
    render(<LoginPage />);
    const homeLink = screen.getByRole("link", { name: /back to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("signup page has login link", () => {
    render(<SignupPage />);
    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("signup page has home link", () => {
    render(<SignupPage />);
    const homeLink = screen.getByRole("link", { name: /back to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});

// ─── Accessibility Scans ───────────────────────────────────────────────

describe("Auth Pages – Accessibility scans", () => {
  it("login: idle state passes axe audit", async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("login: invalid state passes axe audit", async () => {
    const { container } = render(<LoginPage />);
    submitForm();
    await waitFor(() => {
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("login: busy state passes axe audit", async () => {
    let resolveSignIn: (value: unknown) => void;
    mockSignInEmail.mockReturnValueOnce(
      new Promise((resolve) => { resolveSignIn = resolve; }),
    );

    const { container } = render(<LoginPage />);
    fillLoginForm("user@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeDisabled();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    await act(async () => {
      resolveSignIn!({ error: null });
    });
  });

  it("login: API-error state passes axe audit", async () => {
    mockSignInEmail.mockResolvedValueOnce({
      error: { message: "Invalid email or password." },
    });

    const { container } = render(<LoginPage />);
    fillLoginForm("user@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("signup: idle state passes axe audit", async () => {
    const { container } = render(<SignupPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("signup: invalid state passes axe audit", async () => {
    const { container } = render(<SignupPage />);
    submitForm();
    await waitFor(() => {
      expect(screen.getByText("Name is required.")).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("signup: busy state passes axe audit", async () => {
    let resolveSignUp: (value: unknown) => void;
    mockSignUpEmail.mockReturnValueOnce(
      new Promise((resolve) => { resolveSignUp = resolve; }),
    );

    const { container } = render(<SignupPage />);
    fillSignupForm("Jane Doe", "jane@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeDisabled();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    await act(async () => {
      resolveSignUp!({ error: null });
    });
  });

  it("signup: API-error state passes axe audit", async () => {
    mockSignUpEmail.mockResolvedValueOnce({
      error: { message: "Email already in use." },
    });

    const { container } = render(<SignupPage />);
    fillSignupForm("Jane Doe", "jane@example.com", "password123");
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
