import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { apiErrorMessage, dashboardApi, projectApi, requestApi } from '../lib/api';
import { mapApiProject, mapApiRequest } from '../lib/mappers';
import './ProjectList.css';

export const ProjectList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const projectQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.list
  });

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary
  });

  const recentRequestsQuery = useQuery({
    queryKey: ['requests', 'recent'],
    queryFn: () => requestApi.list({ page: 1, limit: 3 })
  });

  const projects = projectQuery.data?.map(mapApiProject) ?? [];
  const recentRequests = recentRequestsQuery.data?.items.map(mapApiRequest) ?? [];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.url.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="project-list-container">
      <div className="project-main-area">
        <div className="project-header-row">
          <h1 className="project-title">프로젝트</h1>
        </div>

        {/* Filter controls row */}
        <div className="project-filters-row">
          <div className="search-bar">
            <Search size={18} color="#9aa39e" />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>

        {/* 2x2 Grid of Project cards */}
        <div className="project-grid">
          {projectQuery.isLoading && (
            <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>프로젝트를 불러오는 중입니다...</div>
          )}
          {projectQuery.isError && (
            <div style={{ padding: '24px', color: '#D92D20' }}>
              {apiErrorMessage(projectQuery.error)}
              <button type="button" onClick={() => projectQuery.refetch()} style={{ marginLeft: '8px', color: 'var(--primary)', fontWeight: 700 }}>다시 시도</button>
            </div>
          )}
          {!projectQuery.isLoading && !projectQuery.isError && filteredProjects.length === 0 && (
            <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>표시할 프로젝트가 없습니다.</div>
          )}
          {!projectQuery.isLoading && !projectQuery.isError && filteredProjects.map(proj => (
            <div key={proj.id} className="project-card">
              <div className="card-top">
                <div className="card-top-left">
                  <h3 className="proj-name-title">{proj.name}</h3>
                  <span className="proj-badge active">진행 중</span>
                </div>
              </div>

              <div className="proj-domain-meta">
                <span className="domain-url">{proj.url} ↗</span>
                <div className="meta-sub">
                  <span className="label">클라이언트</span>
                  <span className="value">{proj.client}</span>
                </div>
              </div>

              <div className={`proj-thumbnail-mockup ${proj.thumbnail}`}>
                <div className="mockup-banner-content">
                  <span>{proj.name}</span>
                  <small>{proj.url}</small>
                </div>
              </div>

              <div className="proj-card-footer">
                <div className="team-avatars">
                  {proj.members.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="avatar-circle">{m[0]}</div>
                  ))}
                  {proj.members.length > 3 && (
                    <div className="avatar-circle count">+{proj.members.length - 3}</div>
                  )}
                  <span className="team-label">담당 팀</span>
                </div>

                <div className="kpis-small-row">
                  <div className="kpi-box text-blue">
                    <span className="kpi-lbl">진행 중</span>
                    <span className="kpi-val">{proj.activeCounts.progress}</span>
                  </div>
                  <div className="kpi-box text-purple">
                    <span className="kpi-lbl">검수 요청</span>
                    <span className="kpi-val">{proj.activeCounts.review}</span>
                  </div>
                  <div className="kpi-box text-red">
                    <span className="kpi-lbl">마감 임박</span>
                    <span className="kpi-val">{proj.activeCounts.danger}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right summary panel */}
      <div className="project-right-sidebar">
        <div className="sidebar-summary-card">
          <h3 className="card-title">프로젝트 운영 요약</h3>
          
          <div className="project-summary-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>전체 프로젝트</span>
              <strong style={{ fontSize: '15px' }}>{projects.length}개</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>활성 고객사</span>
              <strong style={{ fontSize: '15px' }}>{new Set(projects.map((project) => project.client)).size}곳</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>이번 주 완료</span>
              <strong style={{ fontSize: '15px', color: 'var(--primary)' }}>{summaryQuery.data?.review ?? 0}건</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>주의 필요</span>
              <strong style={{ fontSize: '15px', color: '#D92D20' }}>{summaryQuery.data?.overdue ?? 0}건</strong>
            </div>
          </div>

          <h3 className="card-title" style={{ marginTop: '24px', fontSize: '14px' }}>주의 필요 프로젝트</h3>
          <div className="warning-projects-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            {projects
              .filter((project) => project.activeCounts.danger > 0 || project.activeCounts.review > 0)
              .slice(0, 2)
              .map((project) => (
                <div key={project.id} style={{ backgroundColor: project.activeCounts.danger > 0 ? '#fff0f0' : '#f3edff', padding: '10px', borderRadius: '6px', border: `1px solid ${project.activeCounts.danger > 0 ? '#fecdca' : '#d6bbfb'}` }}>
                  <strong style={{ display: 'block', color: project.activeCounts.danger > 0 ? '#b42318' : '#53389e' }}>{project.name}</strong>
                  <span style={{ fontSize: '11px', color: project.activeCounts.danger > 0 ? '#b42318' : '#53389e' }}>
                    {project.activeCounts.danger > 0 ? `마감 임박 ${project.activeCounts.danger}건` : `검수 대기 ${project.activeCounts.review}건`}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="recent-requests-summary">
          <h3 className="card-title">최근 요청 요약</h3>
          <div className="recent-req-list">
            {recentRequests.map((request) => (
              <div key={request.id} className="recent-req-item">
                <div className="req-top">
                  <span className={`dot ${request.status === 'review' ? 'purple' : request.status === 'progress' ? 'blue' : 'green'}`} />
                  <span className="title">{request.title}</span>
                  <span className="time">{request.createdAt}</span>
                </div>
                <span className="project-lbl">{request.project}</span>
                <span className={`badge ${request.status}`}>{request.status === 'review' ? '검수 요청' : request.status === 'progress' ? '진행 중' : request.status === 'done' ? '완료' : '접수'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Help helper icon component
export default ProjectList;
