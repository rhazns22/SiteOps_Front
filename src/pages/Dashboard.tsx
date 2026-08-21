import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { StatusBadge } from '../components/Common';
import { apiErrorMessage, dashboardApi } from '../lib/api';
import { mapApiRequest } from '../lib/mappers';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary
  });

  const urgentRequestsQuery = useQuery({
    queryKey: ['dashboard-urgent-requests'],
    queryFn: dashboardApi.urgentRequests
  });

  const bottlenecksQuery = useQuery({
    queryKey: ['dashboard-bottlenecks'],
    queryFn: dashboardApi.bottlenecks
  });

  const urgentRequests = urgentRequestsQuery.data?.map(mapApiRequest) ?? [];
  const recentEvents = urgentRequests
    .flatMap((request) =>
      (request.activities ?? []).slice(0, 1).map((activity) => ({
        id: `${request.id}-${activity.id}`,
        user: activity.user,
        message: `${request.title} - ${activity.message}`,
        timestamp: activity.timestamp
      }))
    )
    .slice(0, 3);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row" style={{ marginBottom: '8px' }}>
        <h1 className="dashboard-title" style={{ fontSize: '24px', fontWeight: 700 }}>대시보드</h1>
      </div>

      {/* Top: Operational Briefing Bar */}
      <div className="operational-briefing-bar" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>
        <span style={{ fontWeight: 700, marginRight: '16px', color: 'var(--text-secondary)' }}>오늘의 운영 현황</span>
        <span style={{ marginRight: '12px' }}>진행 중 <strong style={{ color: 'var(--text-primary)' }}>{summaryQuery.data?.progress ?? '-'}건</strong></span>
        <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>·</span>
        <span style={{ marginRight: '12px', color: '#D92D20', fontWeight: 600 }}>오늘 마감 {summaryQuery.data?.dueToday ?? '-'}건</span>
        <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>·</span>
        <span style={{ marginRight: '12px', color: '#7C3AED', fontWeight: 600 }}>고객 검수 대기 {summaryQuery.data?.review ?? '-'}건</span>
        <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>·</span>
        <span style={{ color: '#D92D20', fontWeight: 600 }}>기한 초과 {summaryQuery.data?.overdue ?? '-'}건</span>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        {/* Main Left: Today's Requests */}
        <div className="urgent-requests-card" style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="card-title" style={{ fontSize: '15px', fontWeight: 700 }}>오늘 처리할 요청</h3>
            <button className="view-all-link" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>전체 요청 보기 <ChevronRight size={14} /></button>
          </div>

          <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}>구분</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}>요청명</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}>프로젝트</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}>담당자</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}>마감시간</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {urgentRequestsQuery.isLoading && (
                <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>오늘 처리할 요청을 불러오는 중입니다...</td></tr>
              )}
              {urgentRequestsQuery.isError && (
                <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#D92D20' }}>{apiErrorMessage(urgentRequestsQuery.error)}</td></tr>
              )}
              {!urgentRequestsQuery.isLoading && !urgentRequestsQuery.isError && urgentRequests.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>처리할 요청이 없습니다.</td></tr>
              )}
              {!urgentRequestsQuery.isLoading && !urgentRequestsQuery.isError && urgentRequests.slice(0, 4).map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid var(--border)', height: '48px', backgroundColor: request.status === 'rejected' ? '#fff5f5' : undefined }}>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ color: request.status === 'review' ? '#7C3AED' : request.status === 'rejected' ? '#D92D20' : 'var(--text-primary)', fontWeight: 700 }}>
                      {request.status === 'review' ? '[검수]' : request.status === 'rejected' ? '[반려]' : '[마감]'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{request.title}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{request.project}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{request.assignee ?? '-'}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{request.dueDate}</td>
                  <td style={{ padding: '8px 12px' }}><StatusBadge status={request.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Main Right: Team Workflow */}
        <div className="dashboard-activities-card" style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <h3 className="card-title" style={{ fontSize: '15px', fontWeight: 700 }}>팀 작업 흐름</h3>
          </div>

          <div className="db-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentEvents.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>최근 작업 이력이 없습니다.</span>}
            {recentEvents.map((event) => (
              <div key={event.id} className="timeline-event" style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
                <div className="avatar-circle-sm" style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{event.user[0]}</div>
                <div style={{ flex: 1 }}>
                  <span><strong>{event.user}</strong> {event.message}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{event.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Bottlenecks table instead of charts */}
      <div className="dashboard-chart-card" style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
        <h3 className="card-title" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>업무 병목 현황</h3>
        <table className="bottleneck-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>단계</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>요청 수</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>평균 체류 시간</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>가장 오래된 요청</th>
            </tr>
          </thead>
          <tbody>
            {bottlenecksQuery.isLoading && (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>병목 현황을 불러오는 중입니다...</td></tr>
            )}
            {bottlenecksQuery.isError && (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#D92D20' }}>{apiErrorMessage(bottlenecksQuery.error)}</td></tr>
            )}
            {!bottlenecksQuery.isLoading && !bottlenecksQuery.isError && bottlenecksQuery.data?.map((item) => (
              <tr key={item.status} style={{ borderBottom: '1px solid var(--border)', height: '40px', backgroundColor: item.status === 'REVIEW_REQUESTED' ? '#f3edff' : item.status === 'REJECTED' ? '#fff0f0' : undefined }}>
                <td style={{ padding: '8px 12px', color: item.status === 'REVIEW_REQUESTED' ? '#7C3AED' : item.status === 'REJECTED' ? '#D92D20' : undefined, fontWeight: item.status === 'REVIEW_REQUESTED' || item.status === 'REJECTED' ? 600 : undefined }}>{item.label}</td>
                <td style={{ padding: '8px 12px' }}>{item.count}건</td>
                <td style={{ padding: '8px 12px' }}>{item.averageDays}일</td>
                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.oldestRequest ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Dashboard;
