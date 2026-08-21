import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';
import { apiErrorMessage, notificationApi } from '../lib/api';
import { mapApiNotification } from '../lib/mappers';
import { OutlineButton } from '../components/Common';
import './Notifications.css';

export const Notifications: React.FC = () => {
  const queryClient = useQueryClient();
  const notificationQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.list
  });

  const readAllMutation = useMutation({
    mutationFn: notificationApi.readAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    }
  });
  
  // Notification filters
  const [showAssignment, setShowAssignment] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [showReview, setShowReview] = useState(true);
  const [showDone, setShowDone] = useState(true);

  // Settings Toggles
  const [emailAlert, setEmailAlert] = useState(true);
  const [browserAlert, setBrowserAlert] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const handleReadAll = () => {
    readAllMutation.mutate();
  };

  const notifications = notificationQuery.data?.map(mapApiNotification) ?? [];
  const filteredNotifs = notifications.filter(n => {
    if (n.type === 'assignment' && !showAssignment) return false;
    if (n.type === 'comment' && !showComments) return false;
    if (n.type === 'review' && !showReview) return false;
    if (n.type === 'done' && !showDone) return false;
    return true;
  });

  const todayNotifications = filteredNotifs.filter(n => n.time.includes('오늘'));
  const yesterdayNotifications = filteredNotifs.filter(n => n.time.includes('어제'));
  const olderNotifications = filteredNotifs.filter(n => !n.time.includes('오늘') && !n.time.includes('어제'));

  return (
    <div className="notifications-container">
      <div className="notif-main-panel">
        <div className="notif-header">
          <h1 className="notif-title">알림 및 작업 이력</h1>
          <OutlineButton onClick={handleReadAll} disabled={readAllMutation.isPending}>
            <CheckCircle2 size={16} />
            모두 읽음 처리
          </OutlineButton>
        </div>

        <div className="notif-timeline">
          {notificationQuery.isLoading && (
            <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>알림을 불러오는 중입니다...</div>
          )}
          {notificationQuery.isError && (
            <div style={{ padding: '24px', color: '#D92D20' }}>
              {apiErrorMessage(notificationQuery.error)}
              <button type="button" onClick={() => notificationQuery.refetch()} style={{ marginLeft: '8px', color: 'var(--primary)', fontWeight: 700 }}>다시 시도</button>
            </div>
          )}
          {!notificationQuery.isLoading && !notificationQuery.isError && filteredNotifs.length === 0 && (
            <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>표시할 알림이 없습니다.</div>
          )}
          <div className="timeline-group">
            <h3 className="group-date">오늘</h3>
            <div className="notif-items">
              {todayNotifications.map(n => (
                <div key={n.id} className={`notif-card-item ${n.isRead ? 'read' : 'unread'}`}>
                  <div className="notif-icon-col">
                    <span className={`notif-indicator-dot ${n.type}`} />
                  </div>
                  <div className="notif-content-col">
                    <div className="notif-top-row">
                      <span className="notif-project">{n.project}</span>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    <h4 className="notif-item-title">{n.title}</h4>
                    <p className="notif-message">{n.message}</p>
                    <span className="notif-user">BY {n.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="timeline-group">
            <h3 className="group-date">어제</h3>
            <div className="notif-items">
              {yesterdayNotifications.map(n => (
                <div key={n.id} className={`notif-card-item ${n.isRead ? 'read' : 'unread'}`}>
                  <div className="notif-icon-col">
                    <span className={`notif-indicator-dot ${n.type}`} />
                  </div>
                  <div className="notif-content-col">
                    <div className="notif-top-row">
                      <span className="notif-project">{n.project}</span>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    <h4 className="notif-item-title">{n.title}</h4>
                    <p className="notif-message">{n.message}</p>
                    <span className="notif-user">BY {n.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {olderNotifications.length > 0 && (
            <div className="timeline-group">
              <h3 className="group-date">이전</h3>
              <div className="notif-items">
                {olderNotifications.map(n => (
                <div key={n.id} className={`notif-card-item ${n.isRead ? 'read' : 'unread'}`}>
                  <div className="notif-icon-col">
                    <span className={`notif-indicator-dot ${n.type}`} />
                  </div>
                  <div className="notif-content-col">
                    <div className="notif-top-row">
                      <span className="notif-project">{n.project}</span>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    <h4 className="notif-item-title">{n.title}</h4>
                    <p className="notif-message">{n.message}</p>
                    <span className="notif-user">BY {n.user}</span>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="notif-settings-panel">
        <div className="settings-section">
          <h3 className="settings-title">알림 설정</h3>
          
          <div className="toggle-item" onClick={() => setEmailAlert(!emailAlert)}>
            <div className="toggle-text">
              <span className="toggle-label">이메일 알림 수신</span>
              <span className="toggle-sub">신규 요청 및 댓글 등록 시 이메일 발송</span>
            </div>
            {emailAlert ? <ToggleRight size={36} color="#07844e" /> : <ToggleLeft size={36} color="#9aa39e" />}
          </div>

          <div className="toggle-item" onClick={() => setBrowserAlert(!browserAlert)}>
            <div className="toggle-text">
              <span className="toggle-label">브라우저 실시간 알림</span>
              <span className="toggle-sub">작업 진행 상태 변동 시 브라우저 푸시</span>
            </div>
            {browserAlert ? <ToggleRight size={36} color="#07844e" /> : <ToggleLeft size={36} color="#9aa39e" />}
          </div>

          <div className="toggle-item" onClick={() => setWeeklyReport(!weeklyReport)}>
            <div className="toggle-text">
              <span className="toggle-label">주간 운영 리포트</span>
              <span className="toggle-sub">매주 월요일 프로젝트별 요약 리포트 수신</span>
            </div>
            {weeklyReport ? <ToggleRight size={36} color="#07844e" /> : <ToggleLeft size={36} color="#9aa39e" />}
          </div>
        </div>

        <div className="settings-section border-top">
          <h3 className="settings-title font-small">알림 필터</h3>
          <div className="checkbox-filters">
            <label className="checkbox-label">
              <input type="checkbox" checked={showAssignment} onChange={(e) => setShowAssignment(e.target.checked)} />
              <span>담당자 배정 알림</span>
            </label>

            <label className="checkbox-label">
              <input type="checkbox" checked={showComments} onChange={(e) => setShowComments(e.target.checked)} />
              <span>댓글 등록 알림</span>
            </label>

            <label className="checkbox-label">
              <input type="checkbox" checked={showReview} onChange={(e) => setShowReview(e.target.checked)} />
              <span>검수 요청 알림</span>
            </label>

            <label className="checkbox-label">
              <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
              <span>완료 승인 알림</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Notifications;
