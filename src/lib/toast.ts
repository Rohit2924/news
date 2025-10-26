// Simple toast notification system
export const toast = {
  success: (message: string) => {
    console.log('✅ SUCCESS:', message);
    if (typeof window !== 'undefined') {
      alert(`✅ ${message}`);
    }
  },
  error: (message: string) => {
    console.log('❌ ERROR:', message);
    if (typeof window !== 'undefined') {
      alert(`❌ ${message}`);
    }
  },
  info: (message: string) => {
    console.log('ℹ️ INFO:', message);
    if (typeof window !== 'undefined') {
      alert(`ℹ️ ${message}`);
    }
  }
};

export { toast as sonner };
