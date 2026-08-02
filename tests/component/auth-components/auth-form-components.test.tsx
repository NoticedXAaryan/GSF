import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AuthTextField,
  PasswordField,
  ApiErrorBanner,
  GoogleOAuthButton,
  LoadingIndicator,
  SubmitButton,
} from "@/components/auth";

describe("AuthTextField", () => {
  it("renders label linked to input", () => {
    render(<AuthTextField label="Email" type="email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "email");
  });

  it("shows inline error with aria-describedby association", () => {
    render(<AuthTextField label="Email" error="Email is required." />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    const errorEl = document.getElementById(errorId!);
    expect(errorEl).toHaveTextContent("Email is required.");
  });

  it("does not show error markup when no error", () => {
    render(<AuthTextField label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("disables the input when disabled prop is true", () => {
    render(<AuthTextField label="Email" disabled />);
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });
});

describe("PasswordField", () => {
  it("renders as password type by default", () => {
    render(<PasswordField label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles visibility on button click", () => {
    render(<PasswordField label="Password" />);
    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("shows inline error with aria-describedby", () => {
    render(<PasswordField label="Password" error="Password too short." />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent("Password too short.");
  });

  it("disables input and toggle when disabled", () => {
    render(<PasswordField label="Password" disabled />);
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled();
  });
});

describe("ApiErrorBanner", () => {
  it("renders nothing when message is null", () => {
    const { container } = render(<ApiErrorBanner message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when message is empty string", () => {
    const { container } = render(<ApiErrorBanner message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error with role=alert and aria-live=assertive", () => {
    render(<ApiErrorBanner message="Invalid credentials." />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Invalid credentials.");
  });
});

describe("GoogleOAuthButton", () => {
  it("renders 'Continue with Google' label", () => {
    render(<GoogleOAuthButton onClick={() => {}} />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<GoogleOAuthButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables button when loading", () => {
    render(<GoogleOAuthButton onClick={() => {}} loading />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables button when disabled prop is true", () => {
    render(<GoogleOAuthButton onClick={() => {}} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<GoogleOAuthButton onClick={onClick} disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("LoadingIndicator", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(<LoadingIndicator visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders spinner with status role when visible", () => {
    render(<LoadingIndicator visible />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("uses custom label for screen readers", () => {
    render(<LoadingIndicator visible label="Signing in…" />);
    expect(screen.getByText("Signing in…")).toBeInTheDocument();
  });
});

describe("SubmitButton", () => {
  it("renders children as button label", () => {
    render(<SubmitButton>Log in</SubmitButton>);
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("has type=submit", () => {
    render(<SubmitButton>Submit</SubmitButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("disables when loading", () => {
    render(<SubmitButton loading>Log in</SubmitButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables when disabled prop is true", () => {
    render(<SubmitButton disabled>Log in</SubmitButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    const { container } = render(<SubmitButton loading>Log in</SubmitButton>);
    const svg = container.querySelector("svg.animate-spin");
    expect(svg).toBeInTheDocument();
  });
});
