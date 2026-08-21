export interface User {
  id?: string;
  email?: string;
  name: string;
  role: 'ADMIN' | 'WORKER' | 'CLIENT' | string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  client: string;
  thumbnail: string;
  members: string[];
  activeCounts: {
    progress: number;
    review: number;
    danger: number;
  };
  raw?: unknown;
}

export interface RequestActivity {
  id: string;
  user: string;
  role: string;
  status: 'progress' | 'review' | 'done' | 'received' | 'rejected' | 'danger';
  message: string;
  timestamp: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  project: string;
  requester: string;
  status: 'received' | 'progress' | 'review' | 'done' | 'rejected' | 'danger';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate: string;
  description?: string;
  url?: string;
  assignee?: string;
  pins?: { id: number; apiId?: string; x: number; y: number; text: string }[];
  activities?: RequestActivity[];
  raw?: unknown;
}

export interface NotificationItem {
  id: string;
  type: 'assignment' | 'comment' | 'review' | 'done' | 'danger';
  project: string;
  title: string;
  message: string;
  user: string;
  time: string;
  isRead: boolean;
}
