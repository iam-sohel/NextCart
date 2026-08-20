/**
 * NEXTCART — Auth form validators
 *
 * Pure functions that return either an empty string (valid) or a human-readable
 * error message. They are deliberately tiny and dependency-free:
 *
 *   - We do NOT add Formik / react-hook-form / Zod (the project doesn't use one
 *     yet). Adding a dep just for two forms would over-engineer the requirement.
 *   - Components own their own state and run these validators on submit (and
 *     on blur for nicer UX).
 *
 * Each page builds its own `errors` object so it can render inline
 * `<FormHelperText error>` next to each MUI field.
 */

export type ValidationResult = string | null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian mobile numbers are the most common case for NextCart, but we accept
// any 8-15 digit string (with optional leading + and spaces) since the backend
// only requires `@NotBlank`.
const PHONE_REGEX = /^[+]?[\d\s-]{8,15}$/;

export const isValidEmail = (value: string): boolean =>
  EMAIL_REGEX.test(value.trim());

export const isValidPhone = (value: string): boolean =>
  PHONE_REGEX.test(value.trim());

export const validateEmail = (raw: string): ValidationResult => {
  const value = raw.trim();
  if (!value) return "Email is required.";
  if (!isValidEmail(value)) return "Enter a valid email address.";
  return null;
};

export const validatePhone = (raw: string): ValidationResult => {
  const value = raw.trim();
  if (!value) return "Mobile number is required.";
  if (!isValidPhone(value)) return "Enter a valid mobile number.";
  return null;
};

export const validateFullName = (raw: string): ValidationResult => {
  const value = raw.trim();
  if (!value) return "Full name is required.";
  if (value.length < 2) return "Full name must be at least 2 characters.";
  return null;
};

export const validatePassword = (raw: string): ValidationResult => {
  const value = raw;
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Password needs an uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password needs a lowercase letter.";
  if (!/\d/.test(value)) return "Password needs a number.";
  if (!/[@#$%^&+=!]/.test(value))
    return "Password needs a special character (@#$%^&+=!).";
  return null;
};

/**
 * Confirm password validator — handles the case where one of the two fields
 * has not been entered yet (the parent page disables the submit until both
 * are populated, but defensive checks here avoid a TypeError edge case).
 */
export const validateConfirmPassword = (
  raw: string,
  password: string,
): ValidationResult => {
  if (!raw) return "Please confirm your password.";
  if (raw !== password) return "Passwords do not match.";
  return null;
};

export const validateTermsAccepted = (accepted: boolean): ValidationResult => {
  if (!accepted) return "You must agree to the Terms & Conditions.";
  return null;
};

export const validateLoginEmail = (raw: string): ValidationResult =>
  validateEmail(raw);

export const validateLoginPassword = (raw: string): ValidationResult => {
  if (!raw) return "Password is required.";
  return null;
};

/* ─────────────────────────────────────────────────────────────────────
   Address validators
   ---------------------------------------------------------------------
   The backend's AddressRequestDTO enforces these as @Pattern annotations:

     phoneNumber: ^[0-9]{10}$
     postalCode:  ^[0-9]{6}$

   We mirror them on the client so the user sees the same error before
   a round-trip, and we never submit an invalid payload.
   ───────────────────────────────────────────────────────────────────── */

const ADDRESS_PHONE_REGEX = /^[0-9]{10}$/;
const ADDRESS_POSTAL_REGEX = /^[0-9]{6}$/;

/**
 * Validates an address phone number. Strict 10-digit numeric string —
 * matches the backend's `@Pattern(regexp = "^[0-9]{10}$")`.
 */
export const validateAddressPhone = (raw: string): ValidationResult => {
  const value = raw.trim();
  if (!value) return "Phone number is required.";
  if (!ADDRESS_PHONE_REGEX.test(value)) {
    return "Phone number must be a valid 10-digit number.";
  }
  return null;
};

/**
 * Validates an Indian (or any 6-digit) PIN/postal code. Strict 6-digit
 * numeric string — matches the backend's `@Pattern(regexp = "^[0-9]{6}$")`.
 */
export const validatePostalCode = (raw: string): ValidationResult => {
  const value = raw.trim();
  if (!value) return "Postal code is required.";
  if (!ADDRESS_POSTAL_REGEX.test(value)) {
    return "Postal code must be a valid 6-digit PIN code.";
  }
  return null;
};
