/**
 * Input Validation Utilities
 * Centralized validation logic for forms and user inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
}

/**
 * Phone number validation
 */
export function validatePhone(phone: string): ValidationResult {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = trimmedPhone.replace(/\D/g, '');

  if (digitsOnly.length !== 10) {
    return { isValid: false, error: 'Phone number must be 10 digits' };
  }

  return { isValid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName: string = 'This field'): ValidationResult {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Number validation
 */
export function validateNumber(
  value: string,
  options?: { min?: number; max?: number; fieldName?: string }
): ValidationResult {
  const { min, max, fieldName = 'Value' } = options || {};

  if (!value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { isValid: true };
}

/**
 * ZIP code validation
 */
export function validateZipCode(zipCode: string): ValidationResult {
  const trimmedZip = zipCode.trim();

  if (!trimmedZip) {
    return { isValid: false, error: 'ZIP code is required' };
  }

  // US ZIP code validation (5 digits or 5+4 format)
  const zipRegex = /^\d{5}(-\d{4})?$/;

  if (!zipRegex.test(trimmedZip)) {
    return { isValid: false, error: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)' };
  }

  return { isValid: true };
}

/**
 * Confirm password match validation
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
}

/**
 * Store name validation
 */
export function validateStoreName(name: string): ValidationResult {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, error: 'Store name is required' };
  }

  if (trimmedName.length < 3) {
    return { isValid: false, error: 'Store name must be at least 3 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Store name must be less than 100 characters' };
  }

  return { isValid: true };
}

/**
 * Lottery account validation (8 digits)
 */
export function validateLotteryAccount(account: string): ValidationResult {
  const trimmedAccount = account.trim();

  if (!trimmedAccount) {
    return { isValid: false, error: 'Lottery account is required' };
  }

  if (!/^\d{8}$/.test(trimmedAccount)) {
    return { isValid: false, error: 'Lottery account must be exactly 8 digits' };
  }

  return { isValid: true };
}

/**
 * Lottery password validation (4 digits)
 */
export function validateLotteryPassword(password: string): ValidationResult {
  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    return { isValid: false, error: 'Lottery password is required' };
  }

  if (!/^\d{4}$/.test(trimmedPassword)) {
    return { isValid: false, error: 'Lottery password must be exactly 4 digits' };
  }

  return { isValid: true };
}
