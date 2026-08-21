import axios from 'axios';

export type ApiRole = 'ADMIN' | 'WORKER' | 'CLIENT';
export type ApiStatus = 'RECEIVED' | 'IN_PROGRESS' | 'REVIEW_REQUESTED' | 'COMPLETED' | 'REJECTED';
export type ApiPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type ApiReviewDecision = 'APPROVED' | 'REJECTED';
export type ApiNotificationType = 'ASSIGNED' | 'COMMENT' | 'REVIEW_REQUESTED' | 'APPROVED' | 'REJECTED' | 'DUE_SOON';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: ApiRole;
  clientId?: string | null;
}

export interface ApiProject {
  id: string;
  name: string;
  websiteUrl: string;
  url: string;
  description?: string | null;
  clientId: string;
  client: string;
  members: string[];
  activeCounts: {
    progress: number;
    review: number;
    danger: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiRequest {
  id: string;
  projectId: string;
  project: string;
  requesterId: string;
  requester: string;
  assigneeId?: string | null;
  assignee?: string | null;
  title: string;
  description: string;
  pageUrl: string;
  url: string;
  status: ApiStatus;
  priority: ApiPriority;
  dueDate: string | null;
  beforeImagePath?: string | null;
  afterImagePath?: string | null;
  reviewRequestedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  pins: {
    id: string;
    xPercent: number;
    yPercent: number;
    content: string;
    sortOrder: number;
    createdAt: string;
  }[];
  activities: {
    id: string;
    user: string;
    role: string;
    type: string;
    status: ApiStatus;
    message: string;
    timestamp: string;
  }[];
  comments: {
    id: string;
    author: string;
    authorRole: string;
    content: string;
    createdAt: string;
  }[];
}

export interface ApiNotification {
  id: string;
  type: ApiNotificationType;
  project: string;
  requestId?: string | null;
  title: string;
  message: string;
  user: string;
  time: string;
  isRead: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  progress: number;
  review: number;
  dueToday: number;
  overdue: number;
  unreadNotifications: number;
}

export interface BottleneckItem {
  status: ApiStatus;
  label: string;
  count: number;
  averageDays: number;
  oldestRequest: string | null;
}

const tokenKey = 'siteops.accessToken';
const userKey = 'siteops.user';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export const authStorage = {
  set(accessToken: string, user: ApiUser) {
    localStorage.setItem(tokenKey, accessToken);
    localStorage.setItem(userKey, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  },
  user(): ApiUser | null {
    const raw = localStorage.getItem(userKey);
    return raw ? (JSON.parse(raw) as ApiUser) : null;
  }
};

export const apiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return '요청 처리 중 오류가 발생했습니다.';
};

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await api.post<{ accessToken: string; user: ApiUser }>('/auth/login', {
      email,
      password
    });
    return data;
  },
  async me() {
    const { data } = await api.get<{ user: ApiUser }>('/auth/me');
    return data.user;
  }
};

export const projectApi = {
  async list() {
    const { data } = await api.get<ApiProject[]>('/projects');
    return data;
  }
};

export const requestApi = {
  async list(params: {
    page?: number;
    limit?: number;
    q?: string;
    status?: ApiStatus;
    priority?: ApiPriority;
    projectId?: string;
    assigneeId?: string;
  }) {
    const { data } = await api.get<Paginated<ApiRequest>>('/requests', { params });
    return data;
  },
  async create(body: {
    projectId: string;
    title: string;
    description: string;
    pageUrl: string;
    priority: ApiPriority;
    dueDate?: string | null;
    pins?: { xPercent: number; yPercent: number; content: string; sortOrder?: number }[];
  }) {
    const { data } = await api.post<ApiRequest>('/requests', body);
    return data;
  },
  async review(requestId: string, decision: ApiReviewDecision, comment?: string) {
    const { data } = await api.post<ApiRequest>(`/requests/${requestId}/review`, {
      decision,
      comment
    });
    return data;
  },
  async updateStatus(requestId: string, status: ApiStatus, comment?: string) {
    const { data } = await api.patch<ApiRequest>(`/requests/${requestId}/status`, {
      status,
      comment
    });
    return data;
  },
  async assign(requestId: string, assigneeId: string | null) {
    const { data } = await api.patch<ApiRequest>(`/requests/${requestId}/assignee`, {
      assigneeId
    });
    return data;
  },
  async addComment(requestId: string, content: string) {
    const { data } = await api.post<ApiRequest>(`/requests/${requestId}/comments`, { content });
    return data;
  },
  async addPin(requestId: string, pin: { xPercent: number; yPercent: number; content: string; sortOrder?: number }) {
    const { data } = await api.post<ApiRequest>(`/requests/${requestId}/pins`, pin);
    return data;
  }
};

export const uploadApi = {
  async uploadRequestAttachment(requestId: string, file: File, kind: string) {
    const form = new FormData();
    form.append('requestId', requestId);
    form.append('kind', kind);
    form.append('file', file);

    const { data } = await api.post<ApiRequest>('/uploads/request-attachments', form);
    return data;
  },
  async signedUrl(path: string) {
    const { data } = await api.get<{ signedUrl: string; expiresIn: number }>('/uploads/signed-url', {
      params: { path }
    });
    return data;
  }
};

export const dashboardApi = {
  async summary() {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
  async urgentRequests() {
    const { data } = await api.get<{ items: ApiRequest[] }>('/dashboard/urgent-requests');
    return data.items;
  },
  async bottlenecks() {
    const { data } = await api.get<{ items: BottleneckItem[] }>('/dashboard/bottlenecks');
    return data.items;
  }
};

export const notificationApi = {
  async list() {
    const { data } = await api.get<{ items: ApiNotification[] }>('/notifications');
    return data.items;
  },
  async readAll() {
    await api.patch('/notifications/read-all');
  },
  async markRead(notificationId: string) {
    const { data } = await api.patch<ApiNotification>(`/notifications/${notificationId}/read`);
    return data;
  }
};

export const userApi = {
  async workers() {
    const { data } = await api.get<{ items: ApiUser[] }>('/users', {
      params: { role: 'WORKER' }
    });
    return data.items;
  }
};
