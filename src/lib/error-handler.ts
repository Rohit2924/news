export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const ErrorCodes = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Database errors
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // General errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NOT_FOUND: 'NOT_FOUND',
} as const;

import { NextResponse } from 'next/server';

export function createApiError(
  code: keyof typeof ErrorCodes,
  message: string,
  statusCode: number = 500,
  details?: any
): ApiError {
  return {
    code: ErrorCodes[code],
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
}

export function handleApiError(error: unknown) {
  let apiError: ApiError;
  
  if (error instanceof AppError) {
    apiError = createApiError(
      error.code as keyof typeof ErrorCodes,
      error.message,
      error.statusCode,
      error.details
    );
  } else if (error instanceof Error) {
    apiError = createApiError(
      'INTERNAL_SERVER_ERROR',
      error.message,
      500,
      { originalError: error.name }
    );
  } else {
    apiError = createApiError(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      500,
      { originalError: String(error) }
    );
  }
  
  return NextResponse.json(
    { success: false, error: apiError },
    { status: apiError.statusCode }
  );
}

export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : String(error)
  };

  console.error('Application Error:', errorInfo);
  
  // In production, you might want to send this to a logging service
  // like Sentry, LogRocket, or your own logging system
}

export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.statusCode < 500;
  }
  return false;
}
