import { io, Socket } from "socket.io-client";

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type MessagePayload = {
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
};

class SocketService {
  private socket: Socket | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl: string = DEFAULT_URL) {
    this.baseUrl = baseUrl;
  }

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io(this.baseUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: { userId },
    });

    this.socket.on("connect", () => {
      this.socket?.emit("user-join", userId);
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  private emitEvent(event: string, payload?: unknown) {
    if (!this.socket) {
      console.warn(`Socket not ready. Skipped event: ${event}`);
      return;
    }

    this.socket.emit(event, payload);
  }

  sendMessage(payload: MessagePayload) {
    this.emitEvent("send-message", payload);
  }

  loadConversation(conversationId: string, limit = 50) {
    this.emitEvent("load-conversation", { conversationId, limit });
  }

  loadConversations(userId: string) {
    this.emitEvent("load-conversations", { userId });
  }

  markAsRead(messageId: string, userId: string) {
    this.emitEvent("mark-as-read", { messageId, userId });
  }

  userTyping(conversationId: string, userId: string, userName: string) {
    this.emitEvent("user-typing", { conversationId, userId, userName });
  }

  userStopTyping(conversationId: string, userId: string) {
    this.emitEvent("user-stop-typing", { conversationId, userId });
  }

  deleteMessage(messageId: string, conversationId: string) {
    this.emitEvent("delete-message", { messageId, conversationId });
  }

  on<T = any>(event: string, handler: (data: T) => void) {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    this.socket?.off(event, handler);
  }

  get instance() {
    return this.socket;
  }

  get connected() {
    return this.socket?.connected ?? false;
  }
}

export default SocketService;
