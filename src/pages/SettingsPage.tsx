import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, Lock, User, Users } from 'lucide-react';
import { apiErrorMessage, settingsApi, type ApiPriority } from '../lib/api';
import { PrimaryButton, OutlineButton } from '../components/Common';
import { useAuth } from '../context/useAuth';
import './SettingsPage.css';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'workspace';

const notificationLabels: Record<string, string> = {
  assignedNotification: '담당자 배정 알림',
  commentNotification: '댓글 알림',
  reviewNotification: '검수 요청 알림',
  approvedNotification: '승인 알림',
  rejectedNotification: '반려 알림',
  deadlineNotification: '마감일 알림',
  emailNotification: '이메일 알림',
  appNotification: '앱 내 알림'
};

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [profile, setProfile] = useState({ name: '', phone: '', avatarPath: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [workspaceForm, setWorkspaceForm] = useState({
    serviceName: '',
    defaultDueDays: 7,
    defaultPriority: 'NORMAL' as ApiPriority,
    inviteExpiresInDays: 7
  });

  const meQuery = useQuery({
    queryKey: ['settings', 'me'],
    queryFn: settingsApi.me
  });

  const notificationQuery = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: settingsApi.notifications
  });

  const workspaceQuery = useQuery({
    queryKey: ['settings', 'workspace'],
    queryFn: settingsApi.workspace
  });

  useEffect(() => {
    if (meQuery.data) {
      setProfile({
        name: meQuery.data.name,
        phone: meQuery.data.phone ?? '',
        avatarPath: meQuery.data.avatarPath ?? ''
      });
    }
  }, [meQuery.data]);

  useEffect(() => {
    if (workspaceQuery.data) {
      setWorkspaceForm({
        serviceName: workspaceQuery.data.serviceName,
        defaultDueDays: workspaceQuery.data.defaultDueDays,
        defaultPriority: workspaceQuery.data.defaultPriority,
        inviteExpiresInDays: workspaceQuery.data.inviteExpiresInDays
      });
    }
  }, [workspaceQuery.data]);

  const profileMutation = useMutation({
    mutationFn: () =>
      settingsApi.updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim() || null,
        avatarPath: profile.avatarPath.trim() || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'me'] });
    }
  });

  const notificationMutation = useMutation({
    mutationFn: (body: Record<string, boolean>) => settingsApi.updateNotifications(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notifications'] });
    }
  });

  const passwordMutation = useMutation({
    mutationFn: () => settingsApi.changePassword(passwords.currentPassword, passwords.newPassword),
    onSuccess: () => {
      setPasswords({ currentPassword: '', newPassword: '' });
      logout();
      navigate('/login');
    }
  });

  const revokeMutation = useMutation({
    mutationFn: settingsApi.revokeSessions,
    onSuccess: () => {
      logout();
      navigate('/login');
    }
  });

  const workspaceMutation = useMutation({
    mutationFn: () => settingsApi.updateWorkspace(workspaceForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'workspace'] });
    }
  });

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'profile', label: '내 프로필', icon: <User size={16} /> },
    { id: 'notifications', label: '알림 설정', icon: <Bell size={16} /> },
    { id: 'security', label: '보안', icon: <Lock size={16} /> },
    { id: 'workspace', label: '워크스페이스', icon: <Users size={16} />, adminOnly: true }
  ];

  const visibleTabs = tabs.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>설정</h1>
          <p>계정, 알림, 보안, 워크스페이스 기본값을 관리합니다.</p>
        </div>
      </div>

      <div className="settings-layout">
        <nav className="settings-tabs">
          {visibleTabs.map((item) => (
            <button key={item.id} type="button" className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <main className="settings-panel">
          {meQuery.isLoading && <div className="settings-empty">설정을 불러오는 중입니다...</div>}
          {meQuery.isError && <div className="settings-error">{apiErrorMessage(meQuery.error)}</div>}

          {tab === 'profile' && meQuery.data && (
            <section>
              <h2>내 프로필</h2>
              <div className="settings-form-grid">
                <label>
                  <span>이름</span>
                  <input value={profile.name} onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))} />
                </label>
                <label>
                  <span>이메일</span>
                  <input value={meQuery.data.email ?? ''} readOnly />
                </label>
                <label>
                  <span>전화번호</span>
                  <input value={profile.phone} onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))} />
                </label>
                <label>
                  <span>프로필 이미지 경로</span>
                  <input value={profile.avatarPath} onChange={(event) => setProfile((prev) => ({ ...prev, avatarPath: event.target.value }))} placeholder="Storage path" />
                </label>
                <div className="settings-readonly">
                  <span>역할</span>
                  <strong>{meQuery.data.role}</strong>
                </div>
                <div className="settings-readonly">
                  <span>소속</span>
                  <strong>{meQuery.data.clientName ?? 'SiteOps 운영팀'}</strong>
                </div>
              </div>
              <div className="settings-actions">
                <OutlineButton type="button" onClick={() => setProfile((prev) => ({ ...prev, avatarPath: '' }))}>프로필 이미지 삭제</OutlineButton>
                <PrimaryButton onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending || !profile.name.trim()}>저장</PrimaryButton>
              </div>
              {profileMutation.isError && <div className="settings-error">{apiErrorMessage(profileMutation.error)}</div>}
              {profileMutation.isSuccess && <div className="settings-success">프로필이 저장되었습니다.</div>}
            </section>
          )}

          {tab === 'notifications' && (
            <section>
              <h2>알림 설정</h2>
              {notificationQuery.isLoading && <div className="settings-empty">알림 설정을 불러오는 중입니다...</div>}
              {notificationQuery.isError && <div className="settings-error">{apiErrorMessage(notificationQuery.error)}</div>}
              {notificationQuery.data && (
                <div className="settings-toggle-list">
                  {Object.entries(notificationLabels).map(([key, label]) => {
                    const checked = Boolean(notificationQuery.data[key as keyof typeof notificationQuery.data]);
                    return (
                      <label key={key} className="settings-toggle">
                        <span>{label}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={notificationMutation.isPending}
                          onChange={(event) => notificationMutation.mutate({ [key]: event.target.checked })}
                        />
                      </label>
                    );
                  })}
                </div>
              )}
              {notificationMutation.isError && <div className="settings-error">{apiErrorMessage(notificationMutation.error)}</div>}
            </section>
          )}

          {tab === 'security' && meQuery.data && (
            <section>
              <h2>보안</h2>
              <div className="security-status">
                <span>카카오 연결</span>
                <strong>{meQuery.data.kakaoLinked ? '연결됨' : '미연결'}</strong>
              </div>
              {meQuery.data.hasPassword ? (
                <div className="settings-form-grid compact">
                  <label>
                    <span>현재 비밀번호</span>
                    <input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords((prev) => ({ ...prev, currentPassword: event.target.value }))} />
                  </label>
                  <label>
                    <span>새 비밀번호</span>
                    <input type="password" value={passwords.newPassword} onChange={(event) => setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))} />
                  </label>
                  <PrimaryButton onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending || passwords.newPassword.length < 8}>비밀번호 변경</PrimaryButton>
                </div>
              ) : (
                <div className="settings-empty">카카오 전용 계정은 이 화면에서 비밀번호를 변경하지 않습니다.</div>
              )}
              <div className="settings-danger">
                <div>
                  <strong>모든 로그인 세션 만료</strong>
                  <span>현재 계정으로 발급된 기존 JWT를 무효화하고 다시 로그인합니다.</span>
                </div>
                <OutlineButton onClick={() => revokeMutation.mutate()} disabled={revokeMutation.isPending}>세션 만료</OutlineButton>
              </div>
              {passwordMutation.isError && <div className="settings-error">{apiErrorMessage(passwordMutation.error)}</div>}
              {revokeMutation.isError && <div className="settings-error">{apiErrorMessage(revokeMutation.error)}</div>}
            </section>
          )}

          {tab === 'workspace' && user?.role === 'ADMIN' && (
            <section>
              <h2>워크스페이스</h2>
              <div className="settings-form-grid">
                <label>
                  <span>서비스 표시 이름</span>
                  <input value={workspaceForm.serviceName} onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, serviceName: event.target.value }))} />
                </label>
                <label>
                  <span>기본 마감일</span>
                  <input type="number" min={1} max={90} value={workspaceForm.defaultDueDays} onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, defaultDueDays: Number(event.target.value) }))} />
                </label>
                <label>
                  <span>기본 우선순위</span>
                  <select value={workspaceForm.defaultPriority} onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, defaultPriority: event.target.value as ApiPriority }))}>
                    <option value="LOW">낮음</option>
                    <option value="NORMAL">보통</option>
                    <option value="HIGH">높음</option>
                    <option value="URGENT">긴급</option>
                  </select>
                </label>
                <label>
                  <span>초대 링크 기본 만료일</span>
                  <input type="number" min={1} max={30} value={workspaceForm.inviteExpiresInDays} onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, inviteExpiresInDays: Number(event.target.value) }))} />
                </label>
                <div className="settings-readonly">
                  <span>파일 최대 크기</span>
                  <strong>{workspaceQuery.data?.maxFileSizeMb ?? 10}MB</strong>
                </div>
              </div>
              <div className="settings-actions">
                <OutlineButton type="button" onClick={() => navigate('/clients')}>클라이언트 관리</OutlineButton>
                <OutlineButton type="button" onClick={() => navigate('/users')}>사용자 관리</OutlineButton>
                <PrimaryButton onClick={() => workspaceMutation.mutate()} disabled={workspaceMutation.isPending}>워크스페이스 저장</PrimaryButton>
              </div>
              {workspaceMutation.isError && <div className="settings-error">{apiErrorMessage(workspaceMutation.error)}</div>}
              {workspaceMutation.isSuccess && <div className="settings-success">워크스페이스 설정이 저장되었습니다.</div>}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
