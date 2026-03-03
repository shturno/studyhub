/**
 * Result Pattern for Server Actions
 * Provides type-safe error handling without throwing
 */

export type ActionSuccess<T = void> = {
  success: true;
  data: T;
};

export type ActionError = {
  success: false;
  error: string;
  field?: string;
};

export type ActionResult<T = void> = ActionSuccess<T> | ActionError;

/**
 * Helper to create a success result
 */
export function ok<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

/**
 * Helper to create an error result
 */
export function err(error: string, field?: string): ActionError {
  return { success: false, error, field };
}
