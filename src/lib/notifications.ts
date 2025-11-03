import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50 notifications
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: state.unreadCount - 1,
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

export class NotificationService {
  private static eventSource: EventSource | null = null;
  private static isConnecting: boolean = false;

  static connect() {
    if (this.eventSource || this.isConnecting) return;

    this.isConnecting = true;
    try {
      this.eventSource = new EventSource('/api/notifications/sse');

      this.eventSource.onopen = () => {
        console.log('SSE Connection established');
        this.isConnecting = false;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            useNotificationStore.getState().addNotification({
              type: data.notificationType,
              message: data.message,
            });
          }
        } catch (error) {
          console.error('Error processing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        this.disconnect();
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 3000);
      };

    } catch (error) {
      console.error('Error establishing SSE connection:', error);
      this.isConnecting = false;
    }
  }

  static disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnecting = false;
  }
}