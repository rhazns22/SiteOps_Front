import type { ApiNotification, ApiPriority, ApiProject, ApiRequest, ApiStatus } from './api';
import type { MaintenanceRequest, NotificationItem, Project, RequestActivity } from '../types';

const statusToUi: Record<ApiStatus, MaintenanceRequest['status']> = {
  RECEIVED: 'received',
  IN_PROGRESS: 'progress',
  REVIEW_REQUESTED: 'review',
  COMPLETED: 'done',
  REJECTED: 'rejected'
};

const priorityToUi: Record<ApiPriority, MaintenanceRequest['priority']> = {
  LOW: 'low',
  NORMAL: 'medium',
  HIGH: 'high',
  URGENT: 'high'
};

export const uiStatusToApi = (status: string): ApiStatus | undefined => {
  if (status === 'received') return 'RECEIVED';
  if (status === 'progress') return 'IN_PROGRESS';
  if (status === 'review') return 'REVIEW_REQUESTED';
  if (status === 'done') return 'COMPLETED';
  if (status === 'rejected') return 'REJECTED';
  return undefined;
};

export const uiPriorityToApi = (priority: MaintenanceRequest['priority']): ApiPriority => {
  if (priority === 'low') return 'LOW';
  if (priority === 'high') return 'HIGH';
  return 'NORMAL';
};

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit'
});

export const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return dateFormatter.format(new Date(value)).replaceAll(' ', '');
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return `${formatDate(value)} ${timeFormatter.format(date)}`;
};

const notificationTypeToUi: Record<ApiNotification['type'], NotificationItem['type']> = {
  ASSIGNED: 'assignment',
  COMMENT: 'comment',
  REVIEW_REQUESTED: 'review',
  APPROVED: 'done',
  REJECTED: 'danger',
  DUE_SOON: 'danger'
};

export const mapApiRequest = (request: ApiRequest): MaintenanceRequest => ({
  id: request.id,
  title: request.title,
  project: request.project,
  requester: request.requester,
  status: statusToUi[request.status],
  priority: priorityToUi[request.priority],
  createdAt: formatDate(request.createdAt),
  dueDate: formatDate(request.dueDate),
  description: request.description,
  url: request.pageUrl,
  assignee: request.assignee ?? undefined,
  pins: request.pins.map((pin, index) => ({
    id: index + 1,
    apiId: pin.id,
    x: pin.xPercent,
    y: pin.yPercent,
    text: pin.content
  })),
  activities: request.activities.map<RequestActivity>((activity) => ({
    id: activity.id,
    user: activity.user,
    role: activity.role,
    status: statusToUi[activity.status],
    message: activity.message,
    timestamp: formatDateTime(activity.timestamp)
  })),
  raw: request
});

const thumbnailFor = (name: string) => {
  const bucket = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  return `project-tone-${bucket + 1}`;
};

export const mapApiProject = (project: ApiProject): Project => ({
  id: project.id,
  name: project.name,
  url: project.websiteUrl.replace(/^https?:\/\//, ''),
  client: project.client,
  thumbnail: thumbnailFor(project.name),
  members: project.members,
  activeCounts: project.activeCounts,
  raw: project
});

const relativeTime = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startToday - startDate) / 86_400_000);
  const time = timeFormatter.format(date);

  if (dayDiff === 0) return `오늘 ${time}`;
  if (dayDiff === 1) return `어제 ${time}`;
  return `${formatDate(value)} ${time}`;
};

export const mapApiNotification = (notification: ApiNotification): NotificationItem => ({
  id: notification.id,
  type: notificationTypeToUi[notification.type],
  project: notification.project,
  title: notification.title,
  message: notification.message,
  user: notification.user,
  time: relativeTime(notification.createdAt),
  isRead: notification.isRead
});
