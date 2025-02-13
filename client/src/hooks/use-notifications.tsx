import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

type Notification = {
  type: "NEW_REPORT" | "NEW_EVIDENCE" | "STATUS_CHANGE";
  data: any;
};

type NotificationsContextType = {
  notifications: Notification[];
  connected: boolean;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("WebSocket disconnected");
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };

    ws.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications

      // Show toast notification based on type
      switch (notification.type) {
        case "NEW_REPORT":
          toast({
            title: "New Report Submitted",
            description: `A new report has been submitted in the ${notification.data.category} category.`,
          });
          break;
        case "STATUS_CHANGE":
          toast({
            title: "Report Status Updated",
            description: `Report status has been changed to ${notification.data.status}.`,
          });
          break;
        case "NEW_EVIDENCE":
          toast({
            title: "New Evidence Added",
            description: `New ${notification.data.fileType} evidence has been uploaded.`,
          });
          break;
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [toast]);

  return (
    <NotificationsContext.Provider value={{ notifications, connected }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
