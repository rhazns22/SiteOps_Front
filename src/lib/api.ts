import axios from 'axios';

export type ApiRole = 'ADMIN' | 'WORKER' | 'CLIENT';
export type ApiStatus = 'RECEIVED' | 'IN_PROGRESS' | 'REVIEW_REQUESTED' | 'COMPLETED' | 'REJECTED';
export type ApiPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type ApiReviewDecision = 'APPROVED' | 'REJECTED';
export type ApiNotificationType = 'ASSIGNED' | 'COMMENT' | 'REVIEW_REQUESTED' | 'APPROVED' | 'REJECTED' | 'DUE_SOON';

export interface ApiUser {
  id: string;
  email: string | null;
  name: string;
  role: ApiRole;
  clientId?: string | null;
  phone?: string | null;
  avatarPath?: string | null;
}

export interface ApiInvitation {
  id: string;
  role: ApiRole;
  clientId?: string | null;
  clientName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  invitedEmail?: string | null;
  createdByName?: string;
  status: 'PENDING' | 'USED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  usedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

export interface ApiInvitationPreview {
  valid: boolean;
  role: ApiRole;
  clientId?: string | null;
  clientName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  invitedEmail?: string | null;
  expiresAt: string;
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
  deletedAt?: string | null;
  deletedById?: string | null;
  deleteReason?: string | null;
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
  attachments?: {
    id: string;
    kind: 'before' | 'after' | 'attachment';
    storagePath: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
  }[];
}

export interface ApiClient {
  id: string;
  name: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  memo?: string | null;
  isActive: boolean;
  archivedAt?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  managerEmail?: string | null;
  projectCount: number;
  userCount: number;
  progressCount: number;
  reviewCount: number;
  recentRequestAt?: string | null;
  createdAt: string;
  updatedAt: string;
  projects?: ApiProject[];
  users?: ApiUser[];
  recentRequests?: ApiRequest[];
  activities?: {
    id: string;
    user: string;
    role: string;
    type: string;
    createdAt: string;
  }[];
}

export interface ApiUserSettings {
  id: string;
  email: string | null;
  name: string;
  phone?: string | null;
  avatarPath?: string | null;
  role: ApiRole;
  clientId?: string | null;
  clientName?: string | null;
  authProvider: 'LOCAL' | 'KAKAO';
  kakaoLinked: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotificationPreference {
  assignedNotification: boolean;
  commentNotification: boolean;
  reviewNotification: boolean;
  approvedNotification: boolean;
  rejectedNotification: boolean;
  deadlineNotification: boolean;
  emailNotification: boolean;
  appNotification: boolean;
  updatedAt: string;
}

export interface ApiWorkspaceSetting {
  id: string;
  serviceName: string;
  defaultDueDays: number;
  defaultPriority: ApiPriority;
  maxFileSizeMb: number;
  inviteExpiresInDays: number;
  updatedAt: string;
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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: apiBaseUrl
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
      const requestUrl = String(error.config?.url ?? '');
      if (requestUrl.includes('/auth/kakao/exchange')) {
        return Promise.reject(error);
      }

      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      const isStandaloneAuthPage =
        window.location.pathname === '/login' ||
        window.location.pathname.startsWith('/invite') ||
        window.location.pathname.startsWith('/auth/kakao/callback');

      if (!isStandaloneAuthPage) {
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
  hasSession() {
    return Boolean(localStorage.getItem(tokenKey) && localStorage.getItem(userKey));
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
  },
  async kakaoExchange(code: string) {
    const { data } = await api.post<{ accessToken: string; user: ApiUser }>('/auth/kakao/exchange', {
      code
    });
    return data;
  },
  getKakaoStartUrl(intentToken?: string, returnTo?: string) {
    let url = `${apiBaseUrl}/auth/kakao/start`;
    const params = new URLSearchParams();
    if (intentToken) params.append('intentToken', intentToken);
    if (returnTo) params.append('returnTo', returnTo);
    const str = params.toString();
    if (str) url += `?${str}`;
    return url;
  }
};

export const invitationApi = {
  async preview(token: string) {
    const { data } = await api.post<ApiInvitationPreview>('/invitations/preview', { token });
    return data;
  },
  async createIntent(token: string) {
    const { data } = await api.post<{
      intentToken: string;
      role: ApiRole;
      clientName?: string | null;
      projectName?: string | null;
      invitedEmail?: string | null;
      expiresAt: string;
    }>('/invitations/intents', { token });
    return data;
  },
  async create(body: {
    role: ApiRole;
    clientId?: string;
    projectId?: string;
    invitedEmail?: string;
    expiresInDays?: number;
  }) {
    const { data } = await api.post<{ invitation: ApiInvitation; inviteUrl: string }>('/invitations', body);
    return data;
  },
  async list() {
    const { data } = await api.get<{ invitations: ApiInvitation[] }>('/invitations');
    return data.invitations;
  },
  async revoke(invitationId: string) {
    const { data } = await api.post<{ success: boolean }>(`/invitations/${invitationId}/revoke`);
    return data;
  }
};

export const projectApi = {
  async list() {
    const { data } = await api.get<ApiProject[]>('/projects');
    return data;
  }
};

export const requestApi = {
  async detail(requestId: string) {
    const { data } = await api.get<ApiRequest>(`/requests/${requestId}`);
    return data;
  },
  async list(params: {
    page?: number;
    limit?: number;
    q?: string;
    status?: ApiStatus;
    priority?: ApiPriority;
    projectId?: string;
    assigneeId?: string;
    deleted?: 'active' | 'only' | 'include';
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
  async update(
    requestId: string,
    body: {
      title?: string;
      description?: string;
      pageUrl?: string;
      priority?: ApiPriority;
      dueDate?: string | null;
      updatedAt?: string;
    }
  ) {
    const { data } = await api.patch<ApiRequest>(`/requests/${requestId}`, body);
    return data;
  },
  async delete(requestId: string, reason?: string) {
    await api.delete(`/requests/${requestId}`, { data: { reason } });
  },
  async restore(requestId: string) {
    const { data } = await api.post<ApiRequest>(`/requests/${requestId}/restore`);
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
  },
  async updatePin(
    requestId: string,
    pinId: string,
    pin: { xPercent?: number; yPercent?: number; content?: string }
  ) {
    const { data } = await api.patch<{
      id: string;
      requestId: string;
      xPercent: number;
      yPercent: number;
      content: string;
      sortOrder: number;
      createdAt: string;
    }>(`/requests/${requestId}/pins/${pinId}`, pin);
    return data;
  },
  async deletePin(requestId: string, pinId: string) {
    await api.delete(`/requests/${requestId}/pins/${pinId}`);
  }
};

export const clientApi = {
  async list(params: {
    page?: number;
    limit?: number;
    q?: string;
    status?: 'all' | 'active' | 'inactive';
    managerId?: string;
    sortBy?: 'name' | 'projectCount' | 'progressCount' | 'reviewCount' | 'recentRequestAt';
    sortDir?: 'asc' | 'desc';
  }) {
    const { data } = await api.get<Paginated<ApiClient>>('/clients', { params });
    return data;
  },
  async detail(clientId: string) {
    const { data } = await api.get<ApiClient>(`/clients/${clientId}`);
    return data;
  },
  async create(body: {
    name: string;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    memo?: string | null;
    managerId?: string | null;
  }) {
    const { data } = await api.post<ApiClient>('/clients', body);
    return data;
  },
  async update(
    clientId: string,
    body: {
      name?: string;
      contactName?: string | null;
      contactEmail?: string | null;
      contactPhone?: string | null;
      memo?: string | null;
      managerId?: string | null;
    }
  ) {
    const { data } = await api.patch<ApiClient>(`/clients/${clientId}`, body);
    return data;
  },
  async updateStatus(clientId: string, isActive: boolean) {
    const { data } = await api.patch<ApiClient>(`/clients/${clientId}/status`, { isActive });
    return data;
  },
  async projects(clientId: string) {
    const { data } = await api.get<{ items: ApiProject[] }>(`/clients/${clientId}/projects`);
    return data.items;
  },
  async users(clientId: string) {
    const { data } = await api.get<{ items: ApiUser[] }>(`/clients/${clientId}/users`);
    return data.items;
  },
  async requests(clientId: string) {
    const { data } = await api.get<{ items: ApiRequest[] }>(`/clients/${clientId}/requests`);
    return data.items;
  }
};

export const settingsApi = {
  async me() {
    const { data } = await api.get<ApiUserSettings>('/settings/me');
    return data;
  },
  async updateProfile(body: { name?: string; phone?: string | null; avatarPath?: string | null }) {
    const { data } = await api.patch<ApiUser>('/settings/profile', body);
    return data;
  },
  async notifications() {
    const { data } = await api.get<ApiNotificationPreference>('/settings/notifications');
    return data;
  },
  async updateNotifications(body: Partial<Omit<ApiNotificationPreference, 'updatedAt'>>) {
    const { data } = await api.patch<ApiNotificationPreference>('/settings/notifications', body);
    return data;
  },
  async changePassword(currentPassword: string, newPassword: string) {
    await api.post('/settings/change-password', { currentPassword, newPassword });
  },
  async revokeSessions() {
    await api.post('/settings/revoke-sessions');
  },
  async workspace() {
    const { data } = await api.get<ApiWorkspaceSetting>('/settings/workspace');
    return data;
  },
  async updateWorkspace(body: {
    serviceName?: string;
    defaultDueDays?: number;
    defaultPriority?: ApiPriority;
    inviteExpiresInDays?: number;
  }) {
    const { data } = await api.patch<ApiWorkspaceSetting>('/settings/workspace', body);
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
  async admins() {
    const { data } = await api.get<{ items: ApiUser[] }>('/users', {
      params: { role: 'ADMIN' }
    });
    return data.items;
  },
  async workers() {
    const { data } = await api.get<{ items: ApiUser[] }>('/users', {
      params: { role: 'WORKER' }
    });
    return data.items;
  }
};
