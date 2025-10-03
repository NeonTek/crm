"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Server, Globe, Check } from "lucide-react";
import type { Notification } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/portal/notifications", {
        cache: "no-store",
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark as read");

      toast({ title: "Success", description: "Notification marked as read." });
      fetchNotifications(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update notification.",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    if (type === "hosting-expiry")
      return <Server className="h-5 w-5 text-primary" />;
    if (type === "domain-expiry")
      return <Globe className="h-5 w-5 text-primary" />;
    return <Bell className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Notifications</h2>
      </div>
      <p className="text-muted-foreground">
        Important alerts and announcements about your services.
      </p>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <p>Loading notifications...</p>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg flex items-start gap-4 ${
                    notification.isRead ? "bg-muted/50" : "bg-card border"
                  }`}
                >
                  <div>{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Notifications Yet</h3>
              <p className="text-muted-foreground mt-2">
                You're all caught up!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
