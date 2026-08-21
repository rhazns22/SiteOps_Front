import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  FolderKanban,
  Users,
  Bell,
  Settings,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  currentProject: string;
  setCurrentProject: (proj: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentProject }) => {
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
          <span className="unread-badge">3</span>
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
            <span className="project-name">{currentProject}</span>
          </div>
          <ChevronDown size={16} color="#69716d" />
        </div>

        <div className="user-profile-trigger">
          <div className="avatar">이</div>
          <div className="user-info">
            <span className="user-name">이준호</span>
            <span className="user-role">관리자</span>
          </div>
          <ChevronDown size={16} color="#69716d" />
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
