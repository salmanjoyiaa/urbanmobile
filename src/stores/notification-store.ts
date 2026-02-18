"use client";

import { create } from "zustand";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  metadata: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

type NotificationState = {
  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
    }),
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      );
      return {
        notifications,
        unreadCount: notifications.filter((item) => !item.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => {
      const notifications = state.notifications.map((item) => ({ ...item, read: true }));
      return { notifications, unreadCount: 0 };
    }),
}));
