/**
 * Normalizes provider/network errors into safe user-facing text.
 * Prevents leaking stack traces, provider payloads, or internal details.
 */

const GENERIC_ERROR = "Something went wrong. Please try again.";
const NETWORK_ERROR = "Unable to connect. Please check your internet and try again.";

/**
 * Known safe error messages that can be shown directly to users.
 * All other messages are replaced with a generic fallback.
 */
const SAFE_MESSAGES = new Set([
  "Invalid email or password.",
  "User already exists.",
  "Email already in use.",
  "Account not found.",
  "Too many requests. Please try again later.",
  "Invalid credentials.",
  "Registration failed. Please try again.",
  "Google sign-in failed. Please try again.",
  "Google sign-up failed. Please try again.",
]);

/**
 * Checks if the error looks like a network/connectivity issue.
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("fetch") ||
      msg.includes("network") ||
      msg.includes("failed to fetch") ||
      msg.includes("load failed")
    );
  }
  return false;
}

/**
 * Normalizes any auth error (API response error, caught exception, or string)
 * into a safe user-facing message. Never exposes technical details.
 */
export function normalizeAuthError(error: unknown): string {
  // Network/connectivity errors
  if (isNetworkError(error)) {
    return NETWORK_ERROR;
  }

  // Better Auth API error objects with a message field
  if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const msg = (error as { message: string }).message;
    if (SAFE_MESSAGES.has(msg)) {
      return msg;
    }
    // Check for common partial matches from providers
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("invalid") && lowerMsg.includes("password")) {
      return "Invalid email or password.";
    }
    if (lowerMsg.includes("already exists") || lowerMsg.includes("already in use")) {
      return "Email already in use.";
    }
    if (lowerMsg.includes("too many") || lowerMsg.includes("rate limit")) {
      return "Too many requests. Please try again later.";
    }
    return GENERIC_ERROR;
  }

  // Plain string errors
  if (typeof error === "string") {
    if (SAFE_MESSAGES.has(error)) {
      return error;
    }
    return GENERIC_ERROR;
  }

  return GENERIC_ERROR;
}
