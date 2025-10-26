// Types for JWT payloads
export interface JWTPayload {
  id: string;
  email: string;
  name?: string;
  role: string;
  image?: string;
}

// Types for token validation results
export interface TokenValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
}