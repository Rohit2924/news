import { toast } from 'sonner';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

export class ToastManager {
  static success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      duration: options?.duration || 4000,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      action: options?.action,
      cancel: options?.cancel,
    });
  }

  static error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      duration: options?.duration || 6000,
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      action: options?.action,
      cancel: options?.cancel,
    });
  }

  static warning(message: string, options?: ToastOptions) {
    return toast.warning(message, {
      duration: options?.duration || 5000,
      icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      action: options?.action,
      cancel: options?.cancel,
    });
  }

  static info(message: string, options?: ToastOptions) {
    return toast.info(message, {
      duration: options?.duration || 4000,
      icon: <Info className="h-4 w-4 text-blue-600" />,
      action: options?.action,
      cancel: options?.cancel,
    });
  }

  static promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string;
      error: string;
    }
  ) {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  }

  static dismiss() {
    toast.dismiss();
  }

  static dismissAll() {
    toast.dismiss();
  }
}

// Convenience functions
export const showSuccess = ToastManager.success;
export const showError = ToastManager.error;
export const showWarning = ToastManager.warning;
export const showInfo = ToastManager.info;
export const showPromise = ToastManager.promise;
