// src/lib/types/auth.ts
import type { JwtPayload } from 'jsonwebtoken';

export interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'USER' | 'EDITOR' | 'ADMIN';
  iat?: number;
  exp?: number;
}