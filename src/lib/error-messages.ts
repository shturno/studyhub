/**
 * Helper for mapping HTTP status codes to translation keys
 */

export function getApiErrorKey(
  status: number,
  data?: { error?: string },
): string {
  if (status === 401) return "Errors.unauthorized";
  if (status === 413) return "Errors.fileTooLarge";
  if (status === 404) return "Errors.unknownError";
  if (status === 400) return data?.error ? "Errors.validationError" : "Errors.unknownError";
  if (status >= 500) return "Errors.serverError";
  return "Errors.unknownError";
}

/**
 * Helper for handling network errors
 */
export function handleNetworkError(): string {
  return "Errors.networkError";
}

/**
 * Extract safe error message from API response
 * Never expose internal error details to client
 */
export function getSafeErrorMessage(
  error: unknown,
  defaultKey: string = "Errors.unknownError",
): string {
  if (error instanceof Error) {
    // Only expose certain error messages
    if (error.message.includes("network")) return "Errors.networkError";
    if (error.message.includes("timeout")) return "Errors.networkError";
    return defaultKey;
  }
  return defaultKey;
}
