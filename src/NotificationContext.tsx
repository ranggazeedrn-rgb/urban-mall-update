import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from './types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Midnight Sale Event',
    message: 'Join us tonight at 10 PM for exclusive deals across all high-end luxury stores.',
    type: 'event',
    timestamp: new Date().toISOString(),
    isRead: false,
    link: '/stores'
  },
  {
    id: '2',
    title: 'New Collection Alert',
    message: 'Streetwear iteration v2.0 is now available at the Central Plaza.',
    type: 'promotion',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
    link: '/shop'
  }
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('urban_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : MOCK_NOTIFICATIONS;
      }
    } catch (e) {
      console.error('Failed to load notifications from storage:', e);
    }
    return MOCK_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('urban_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      addNotification, 
      markAsRead, 
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
