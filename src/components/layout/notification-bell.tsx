"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, useMarkAllNotificationsRead } from "@/queries/notifications";
import { useNotificationStore } from "@/stores/notification-store";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

export function NotificationBell() {
  useNotifications();
  useRealtimeNotifications();
  const items = useNotificationStore((state) => state.notifications).slice(0, 8);
  const unread = useNotificationStore((state) => state.unreadCount);
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unread > 0) {
          markAllRead.mutate();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-[10px] text-white">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
        ) : (
          items.map((item) => (
            <DropdownMenuItem key={item.id} className="block py-2">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
