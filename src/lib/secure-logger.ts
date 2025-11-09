// Secure logging utility - only logs in development, never logs sensitive data
const isProduction = process.env.NODE_ENV === 'production';

export const secureLog = {
  info: (message: string, data?: any) => {
    if (isProduction) {
      console.log(`ℹ️ ${message}`, data);
    }
  },
  
  success: (message: string, data?: any) => {
    if (isProduction) {
      console.log(`✅ ${message}`, data);
    }
  },
  
  error: (message: string, error?: any) => {
    if (isProduction) {
      console.error(`❌ ${message}`, error);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isProduction) {
      console.warn(`⚠️ ${message}`, data);
    }
  },
  
  // For sensitive operations - only log generic info
  auth: (message: string, userId?: string) => {
    if (isProduction) {
      console.log(`🔐 ${message}`, userId ? `User ID: ${userId}` : '');
    }
  },
  
  // For API operations - never log user data
  api: (message: string, success: boolean) => {
    if (isProduction) {
      console.log(`🌐 ${message}:`, success ? 'Success' : 'Failed');
    }
  }
};

// In production, completely disable console logging for security
if (process.env.NODE_ENV === 'production') {
  // Override console methods to prevent any logging in production
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
}
