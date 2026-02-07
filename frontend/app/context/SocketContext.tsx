"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import SocketService from "../services/socket";

interface SocketContextType {
  socketService: SocketService | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SocketProvider({ children, userId }: SocketProviderProps) {
  const [socketService, setSocketService] = useState<SocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const service = new SocketService();
    service.connect(userId);

    service.on("connect", () => setIsConnected(true));
    service.on("disconnect", () => setIsConnected(false));
    service.on("connect_error", (err) =>
      console.error("Socket error:", err)
    );

    setSocketService(service);

    return () => {
      service.disconnect();
      setSocketService(null);
      setIsConnected(false);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socketService, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
}
