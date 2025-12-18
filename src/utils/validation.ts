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

/**
 * Date validation
 */
export function validateDate(date: Date | string, fieldName: string = 'Date'): ValidationResult {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} is not a valid date` };
  }

  return { isValid: true };
}

/**
 * Date range validation with maximum allowed range
 */
export function validateDateRange(
  startDate: Date | string,
  endDate: Date | string,
  options?: {
    maxDays?: number;
    allowFuture?: boolean;
    fieldNames?: { start?: string; end?: string };
  }
): ValidationResult {
  const {
    maxDays = 365, // Default: 1 year maximum
    allowFuture = false,
    fieldNames = { start: 'Start date', end: 'End date' }
  } = options || {};

  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today

  // Validate dates are valid
  const startValidation = validateDate(startDateObj, fieldNames.start);
  if (!startValidation.isValid) {
    return startValidation;
  }

  const endValidation = validateDate(endDateObj, fieldNames.end);
  if (!endValidation.isValid) {
    return endValidation;
  }

  // Check if start date is after end date
  if (startDateObj > endDateObj) {
    return {
      isValid: false,
      error: `${fieldNames.start} cannot be after ${fieldNames.end}`
    };
  }

  // Check if dates are in the future (if not allowed)
  if (!allowFuture) {
    if (startDateObj > now) {
      return {
        isValid: false,
        error: `${fieldNames.start} cannot be in the future`
      };
    }
    if (endDateObj > now) {
      return {
        isValid: false,
        error: `${fieldNames.end} cannot be in the future`
      };
    }
  }

  // Check if date range exceeds maximum
  const diffTime = endDateObj.getTime() - startDateObj.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > maxDays) {
    return {
      isValid: false,
      error: `Date range cannot exceed ${maxDays} days. Selected range: ${diffDays} days`
    };
  }

  return { isValid: true };
}

/**
 * Pagination parameters validation
 */
export function validatePaginationParams(
  page: number,
  limit: number,
  options?: {
    maxLimit?: number;
    minLimit?: number;
  }
): ValidationResult {
  const { maxLimit = 100, minLimit = 1 } = options || {};

  if (!Number.isInteger(page) || page < 1) {
    return { isValid: false, error: 'Page must be a positive integer' };
  }

  if (!Number.isInteger(limit) || limit < minLimit) {
    return { isValid: false, error: `Limit must be at least ${minLimit}` };
  }

  if (limit > maxLimit) {
    return { isValid: false, error: `Limit cannot exceed ${maxLimit} items` };
  }

  return { isValid: true };
}
