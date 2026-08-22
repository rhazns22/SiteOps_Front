import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  LayoutDashboard,
  FolderKanban,
  Users,
  Bell,
  Settings,
  UserCheck,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { dashboardApi } from '../lib/api';
import { useAuth } from '../context/useAuth';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary,
    enabled: Boolean(user)
  });

  const unreadCount = summaryQuery.data?.unreadNotifications ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel =
    user?.role === 'ADMIN' ? '관리자' :
    user?.role === 'WORKER' ? '작업자' : '고객';

  return (
    <aside className="app-sidebar">
      <div className="logo-container">
        <span className="logo-text">SiteOps</span>
      </div>

      <nav className="nav-group">
        <NavLink
          to="/requests"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>유지보수 요청</span>
        </NavLink>

        <div className="sub-menu">
          <NavLink to="/requests?status=all" className="sub-item">전체</NavLink>
          <NavLink to="/requests?status=received" className="sub-item">접수</NavLink>
          <NavLink to="/requests?status=progress" className="sub-item">진행 중</NavLink>
          <NavLink to="/requests?status=review" className="sub-item">검수 요청</NavLink>
          <NavLink to="/requests?status=done" className="sub-item">완료</NavLink>
        </div>
      </nav>

      <div className="divider" />

      <nav className="nav-group">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>대시보드</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FolderKanban size={18} />
          <span>프로젝트</span>
        </NavLink>

        <NavLink
          to="/clients"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>클라이언트</span>
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <UserCheck size={18} />
          <span>사용자</span>
        </NavLink>
      </nav>

      <div className="divider" />

      <nav className="nav-group">
        <NavLink
          to="/notifications"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Bell size={18} />
          <span>알림</span>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>설정</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="project-select-trigger">
          <div className="project-info">
            <span className="project-label">프로젝트</span>
            <span className="project-name">전체 프로젝트</span>
          </div>
          <ChevronDown size={16} color="#69716d" />
        </div>

        <div
          className="user-profile-trigger"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div className="avatar">{user?.name ? user.name[0] : 'U'}</div>
          <div className="user-info">
            <span className="user-name">{user?.name ?? '사용자'}</span>
            <span className="user-role">{roleLabel}</span>
          </div>
          <ChevronDown size={16} color="#69716d" />

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '8px',
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '4px',
                zIndex: 100
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#D92D20',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
