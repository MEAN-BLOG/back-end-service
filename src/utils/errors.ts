/**
 * Custom error class for forbidden (403) errors
 */
export class ForbiddenError extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForbiddenError);
    }
  }
}

/**
 * Custom error class for not found (404) errors
 */
export class NotFoundError extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}

/**
 * Custom error class for unauthorized (401) errors
 */
export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnauthorizedError);
    }
  }
}

/**
 * Custom error class for validation (400) errors
 */
export class ValidationError extends Error {
  statusCode: number;
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message?: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
