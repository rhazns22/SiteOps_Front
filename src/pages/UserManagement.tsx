import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Shield, Building } from 'lucide-react';
import { userApi, type ApiUser } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { AdminInviteModal } from '../components/AdminInviteModal';
import './UserManagement.css';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { data: workers = [] } = useQuery<ApiUser[]>({
    queryKey: ['users', 'workers'],
    queryFn: userApi.workers
  });

  const roleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="role-badge role-admin">어드민</span>;
      case 'WORKER':
        return <span className="role-badge role-worker">작업자</span>;
      case 'CLIENT':
        return <span className="role-badge role-client">고객사</span>;
      default:
        return role;
    }
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <div>
          <h1 className="page-title">사용자 관리</h1>
          <p className="page-subtitle">SiteOps 멤버 및 팀원 권한을 관리합니다.</p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <button
            type="button"
            className="invite-action-btn"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>새 사용자 초대</span>
          </button>
        )}
      </div>

      <div className="user-grid">
        <div className="user-card my-card">
          <div className="user-card-header">
            <div className="user-avatar">{currentUser?.name ? currentUser.name[0] : 'U'}</div>
            <div>
              <h3 className="user-name">{currentUser?.name} (내 계정)</h3>
              <p className="user-email">{currentUser?.email || '카카오 연동 계정'}</p>
            </div>
          </div>
          <div className="user-card-body">
            <div className="info-row">
              <Shield size={14} />
              <span>권한: {roleBadge(currentUser?.role || 'CLIENT')}</span>
            </div>
          </div>
        </div>

        {workers.map((worker) => (
          <div key={worker.id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar">{worker.name[0]}</div>
              <div>
                <h3 className="user-name">{worker.name}</h3>
                <p className="user-email">{worker.email || '카카오 계정'}</p>
              </div>
            </div>
            <div className="user-card-body">
              <div className="info-row">
                <Shield size={14} />
                <span>권한: {roleBadge(worker.role)}</span>
              </div>
              {worker.clientId && (
                <div className="info-row">
                  <Building size={14} />
                  <span>클라이언트 ID: {worker.clientId}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AdminInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default UserManagement;
