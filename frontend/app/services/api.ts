import { create } from "domain";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T = any>(
  path: string,
  config: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(config.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...config,
    headers,
  });

  let payload: any = null;

  try {
    payload = await res.json();
  } catch {
    // ignore JSON parse error
  }

  if (!res.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

function post(path: string, body?: unknown) {
  return request(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function put(path: string, body?: unknown) {
  return request(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function del(path: string) {
  return request(path, { method: "DELETE" });
}

function get(path: string) {
  return request(path);
}

/* ================= OWNER AUTH ================= */

export const ownerAuth = {
  sendPhoneCode(phoneNumber: string) {
    return post("/api/owner/auth/send-code", { phoneNumber });
  },

  validatePhoneCode(phoneNumber: string, accessCode: string) {
    return post("/api/owner/auth/validate-code", {
      phoneNumber,
      accessCode,
    });
  },

  sendCode(email: string) {
    return post("/api/owner/auth/send-code", { email });
  },

  validateCode(email: string, code: string) {
    return post("/api/owner/auth/validate-code", { email, code });
  },
};

/* ================= EMPLOYEE AUTH ================= */

export const employeeAuth = {
  verifyToken(token: string) {
    return get(`/api/employee/auth/verify-token?token=${token}`);
  },

  setupAccount(
    token: string,
    username: string,
    password: string,
    phoneNumber?: string,
  ) {
    return post("/api/employee/auth/setup-account", {
      setupToken: token,
      username,
      password,
      phoneNumber,
    });
  },

  login(username: string, password: string) {
    return post("/api/employee/auth/login", { username, password });
  },

  sendCode(email: string) {
    return post("/api/employee/auth/send-code", { email });
  },

  validateCode(email: string, accessCode: string) {
    return post("/api/employee/auth/validate-code", {
      email,
      accessCode,
    });
  },
};

/* ================= EMPLOYEE MANAGEMENT ================= */

export const employeeApi = {
  create(employee: {
    name: string;
    email: string;
    phoneNumber: string;
    department?: string;
    role?: string;
  }) {
    return post("/api/owner/employees/create", employee);
  },

  getAll() {
    return get("/api/owner/employees");
  },

  getById(id: string) {
    return get(`/api/owner/employees/${id}`);
  },

  update(id: string, data: unknown) {
    return put(`/api/owner/employees/${id}`, data);
  },

  delete(id: string) {
    return del(`/api/owner/employees/${id}`);
  },
};

/* ================= TASKS ================= */

export const taskApi = {
  create(task: unknown) {
    return post("/api/tasks/create", task);
  },

  getAll() {
    return get("/api/tasks");
  },

  getById(id: string) {
    return get(`/api/tasks/${id}`);
  },

  update(id: string, data: unknown) {
    return put(`/api/tasks/${id}`, data);
  },

  updateStatus(id: string, status: string) {
    return put(`/api/tasks/${id}/status`, { status });
  },

  delete(id: string) {
    return del(`/api/tasks/${id}`);
  },
};

/* ================= MESSAGES ================= */

export const messageApi = {
  // Get all conversations for a user
  getConversations(userId: string) {
    return get(`/api/messages/conversations/${userId}`);
  },

  // Get messages in a conversation
  getMessages(conversationId: string) {
    return get(`/api/messages/conversations/${conversationId}/messages`);
  },

  // Create a new conversation
  createConversation(user1Id: string, user1Name: string, user2Id: string, user2Name: string) {
    return post("/api/messages/conversations", {
      user1Id, user1Name, user2Id, user2Name
    });
  },

  // Get unread message count
  getUnreadCount(userId: string) {
    return get(`/api/messages/unread/${userId}`);
  },

  // Get available users for conversations
  getAvailableUsers(userId: string) {
    return get(`/api/messages/available-users/${userId}`);
  },

  // Mark conversation as read
  markConversationAsRead(conversationId: string, userId: string) {
    return put(`/api/messages/mark-as-read`, {
      conversationId,
      userId,
    });
  },
};
