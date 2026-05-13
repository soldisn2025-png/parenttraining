export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function getErrorCauseMessage(error: unknown) {
  return error instanceof Error && error.cause instanceof Error
    ? error.cause.message
    : "";
}

export function classifyDatabaseError(error: unknown) {
  const combined = `${getErrorMessage(error)} ${getErrorCauseMessage(error)}`.toLowerCase();

  if (combined.includes("password authentication failed")) return "database_auth";
  if (combined.includes("relation") && combined.includes("does not exist")) return "database_schema";
  if (combined.includes("permission denied") || combined.includes("row-level security")) {
    return "database_permission";
  }
  if (combined.includes("violates not-null") || combined.includes("invalid input syntax")) {
    return "database_data_shape";
  }
  if (combined.includes("connection") || combined.includes("timeout")) return "database_connection";
  return "unknown";
}
