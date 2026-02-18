"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore, type AppNotification } from "@/stores/notification-store";

export function useNotifications() {
  const setNotifications = useNotificationStore((state) => state.setNotifications);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", { method: "GET" });
      const result = (await response.json()) as { data?: AppNotification[]; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Could not load notifications");
      }

      const notifications = result.data || [];
      setNotifications(notifications);
      return notifications;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not mark notification");
      return result;
    },
    onSuccess: (_result, id) => {
      markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, read: true }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not mark all notifications");
      return result;
    },
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
