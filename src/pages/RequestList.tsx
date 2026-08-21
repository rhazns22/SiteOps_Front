import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { StatusBadge, PriorityBadge, PrimaryButton, OutlineButton } from '../components/Common';
import { apiErrorMessage, dashboardApi, projectApi, requestApi, uploadApi, userApi } from '../lib/api';
import type { ApiRequest } from '../lib/api';
import { mapApiProject, mapApiRequest, uiStatusToApi } from '../lib/mappers';
import { useAuth } from '../context/useAuth';
import './RequestList.css';

export const RequestList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusFilter = searchParams.get('status') || 'all';
  const projectFilter = searchParams.get('project') || 'all';

  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [afterFile, setAfterFile] = useState<File | null>(null);

  const requestQuery = useQuery({
    queryKey: ['requests', statusFilter, searchTerm],
    queryFn: () =>
      requestApi.list({
        page: 1,
        limit: 50,
        q: searchTerm || undefined,
        status: uiStatusToApi(statusFilter)
      })
  });

  const projectQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.list
  });

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary
  });

  const workersQuery = useQuery({
    queryKey: ['workers'],
    queryFn: userApi.workers,
    enabled: currentUser?.role === 'ADMIN'
  });

  const reviewMutation = useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: 'APPROVED' | 'REJECTED' }) =>
      requestApi.review(
        requestId,
        decision,
        decision === 'APPROVED' ? '목록에서 승인 처리되었습니다.' : '목록에서 반려 처리되었습니다.'
      ),
    onSuccess: (request) => {
      setSelectedRequestId(request.id);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const assignMutation = useMutation({
    mutationFn: () => requestApi.assign(selectedRaw?.id ?? '', assigneeId || null),
    onSuccess: (request) => {
      setSelectedRequestId(request.id);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async (status: 'IN_PROGRESS' | 'REVIEW_REQUESTED') => {
      if (!selectedRaw) throw new Error('선택된 요청이 없습니다.');
      if (status === 'REVIEW_REQUESTED' && afterFile) {
        await uploadApi.uploadRequestAttachment(selectedRaw.id, afterFile, 'after');
      }
      return requestApi.updateStatus(
        selectedRaw.id,
        status,
        status === 'IN_PROGRESS' ? '작업을 시작합니다.' : '작업 완료 후 검수 요청을 보냈습니다.'
      );
    },
    onSuccess: (request) => {
      setSelectedRequestId(request.id);
      setAfterFile(null);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: () => requestApi.addComment(selectedRaw?.id ?? '', commentText),
    onSuccess: (request) => {
      setSelectedRequestId(request.id);
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const requests = useMemo(() => requestQuery.data?.items.map(mapApiRequest) ?? [], [requestQuery.data]);
  const projects = useMemo(() => projectQuery.data?.map(mapApiProject) ?? [], [projectQuery.data]);

  // Filter logic
  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesProject = projectFilter === 'all' || req.project === projectFilter;
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.project.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesProject && matchesSearch;
  });

  const selectedRequest = requests.find(r => r.id === selectedRequestId);
  const selectedRaw = selectedRequest?.raw as ApiRequest | undefined;

  useEffect(() => {
    setAssigneeId(selectedRaw?.assigneeId ?? '');
    setCommentText('');
    setAfterFile(null);
  }, [selectedRaw?.id, selectedRaw?.assigneeId]);

  useEffect(() => {
    if (!selectedRequestId && filteredRequests[0]) {
      setSelectedRequestId(filteredRequests[0].id);
    }

    if (selectedRequestId && filteredRequests.length > 0 && !filteredRequests.some((request) => request.id === selectedRequestId)) {
      setSelectedRequestId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedRequestId]);

  const handleStatusTabChange = (status: string) => {
    setSearchParams({ status, project: projectFilter });
  };

  const handleProjectSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({ status: statusFilter, project: e.target.value });
  };

  const handleReviewAction = (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedRaw || selectedRaw.status !== 'REVIEW_REQUESTED') {
      alert('검수 요청 상태의 요청만 승인 또는 반려할 수 있습니다.');
      return;
    }

    reviewMutation.mutate({ requestId: selectedRaw.id, decision });
  };

  const canAssign = Boolean(selectedRaw && currentUser?.role === 'ADMIN' && selectedRaw.status !== 'COMPLETED');
  const canWork = Boolean(selectedRaw && currentUser?.role === 'WORKER' && selectedRaw.assigneeId === currentUser.id && selectedRaw.status !== 'COMPLETED');
  const canReview = Boolean(selectedRaw && currentUser?.role === 'CLIENT' && selectedRaw.status === 'REVIEW_REQUESTED');

  return (
    <div className="request-list-container">
      <div className="main-content-area">
        <div className="page-header-row" style={{ marginBottom: '12px', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>유지보수 요청</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>고객사의 수정 요청을 접수하고, 작업·검수·완료까지 관리합니다.</p>
          </div>
          <PrimaryButton onClick={() => navigate('/new-request')} style={{ padding: '8px 16px', fontSize: '13px' }}>+ 새 요청</PrimaryButton>
        </div>

        {/* High Density Status Bar */}
        <div className="status-bar-row" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-primary)' }}>
          <span style={{ fontWeight: 700, marginRight: '16px', color: 'var(--text-secondary)' }}>오늘의 운영 현황</span>
          <span style={{ marginRight: '12px' }}>진행 중 <strong style={{ color: 'var(--text-primary)' }}>{summaryQuery.data?.progress ?? '-' }건</strong></span>
          <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>·</span>
          <span style={{ marginRight: '12px', color: 'var(--status-danger)', fontWeight: 600 }}>오늘 마감 {summaryQuery.data?.dueToday ?? '-'}건</span>
          <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>·</span>
          <span style={{ marginRight: '12px' }}>고객 검수 대기 <strong style={{ color: 'var(--text-primary)' }}>{summaryQuery.data?.review ?? '-'}건</strong></span>
          <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>·</span>
          <span style={{ color: 'var(--status-danger)', fontWeight: 600 }}>기한 초과 {summaryQuery.data?.overdue ?? '-'}건</span>
        </div>

        {/* Filters */}
        <div className="filters-row" style={{ marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
          <div className="search-local-container" style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', width: '220px', gap: '8px', backgroundColor: 'var(--surface)' }}>
            <input
              type="text"
              placeholder="요청 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
            />
          </div>

          <div className="tabs-group" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            {['all', 'received', 'progress', 'review', 'done'].map((tab) => {
              const label = tab === 'all' ? '전체' :
                            tab === 'received' ? '접수' :
                            tab === 'progress' ? '진행 중' :
                            tab === 'review' ? '검수 요청' : '완료';
              return (
                <button
                  key={tab}
                  className={`tab-btn ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => handleStatusTabChange(tab)}
                  style={{ fontSize: '13px', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: statusFilter === tab ? 'var(--primary-soft)' : 'var(--surface)', color: statusFilter === tab ? 'var(--primary)' : 'var(--text-secondary)' }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="filter-controls" style={{ marginLeft: 'auto', gap: '6px' }}>
            <select
              value={projectFilter}
              onChange={handleProjectSelectChange}
              className="project-select"
              style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px' }}
            >
              <option value="all">전체 프로젝트</option>
              {projects.map((project) => (
                <option key={project.id} value={project.name}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Request Table */}
        <div className="table-wrapper" style={{ borderRadius: '8px', marginBottom: '12px' }}>
          <table className="request-table">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th style={{ width: '80px' }}>요청 ID</th>
                <th>요청명</th>
                <th>프로젝트</th>
                <th>요청자</th>
                <th>상태</th>
                <th>우선순위</th>
                <th>등록일</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {requestQuery.isLoading && (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>요청을 불러오는 중입니다...</td>
                </tr>
              )}
              {requestQuery.isError && (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#D92D20' }}>
                    {apiErrorMessage(requestQuery.error)}
                    <button type="button" onClick={() => requestQuery.refetch()} style={{ marginLeft: '8px', color: 'var(--primary)', fontWeight: 700 }}>다시 시도</button>
                  </td>
                </tr>
              )}
              {!requestQuery.isLoading && !requestQuery.isError && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>표시할 요청이 없습니다.</td>
                </tr>
              )}
              {!requestQuery.isLoading && !requestQuery.isError && filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className={`table-row ${selectedRequestId === req.id ? 'active' : ''}`}
                  onClick={() => setSelectedRequestId(req.id)}
                  style={{ height: '44px' }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{req.id}</td>
                  <td className="req-title-cell" style={{ fontWeight: 600 }}>{req.title}</td>
                  <td>{req.project}</td>
                  <td>{req.requester}</td>
                  <td><StatusBadge status={req.status} /></td>
                  <td><PriorityBadge priority={req.priority} /></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{req.createdAt}</td>
                  <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>•••</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-row">
          <span className="pagination-total">
            {filteredRequests.length > 0 ? `1-${filteredRequests.length}` : '0'} / {requestQuery.data?.pagination.total ?? 0}
          </span>
          <div className="pagination-pages">
            <button className="pag-btn"><ChevronLeft size={16} /></button>
            <button className="pag-btn active">1</button>
            <button className="pag-btn">2</button>
            <button className="pag-btn">3</button>
            <span className="pag-dots">...</span>
            <button className="pag-btn">16</button>
            <button className="pag-btn"><ChevronRight size={16} /></button>
          </div>
          <select className="page-size-select">
            <option>10 / 페이지</option>
          </select>
        </div>
      </div>

      {/* Right Drawer */}
      {selectedRequest && (
        <div className="right-drawer">
          <div className="drawer-header">
            <h2 className="drawer-title">{selectedRequest.title}</h2>
            <button className="close-btn" onClick={() => setSelectedRequestId(null)}>
              <X size={20} />
            </button>
          </div>

          <div className="drawer-body">
            <div className="metadata-grid">
              <div className="meta-item"><span className="meta-label">프로젝트</span><span className="meta-val">{selectedRequest.project}</span></div>
              <div className="meta-item"><span className="meta-label">상태</span><span><StatusBadge status={selectedRequest.status} /></span></div>
              <div className="meta-item"><span className="meta-label">요청자</span><span className="meta-val">{selectedRequest.requester}</span></div>
              <div className="meta-item"><span className="meta-label">우선순위</span><span><PriorityBadge priority={selectedRequest.priority} /></span></div>
              <div className="meta-item"><span className="meta-label">요청일</span><span className="meta-val">{selectedRequest.createdAt} 10:30</span></div>
              <div className="meta-item"><span className="meta-label">마감일</span><span className="meta-val">{selectedRequest.dueDate}</span></div>
            </div>

            <div className="drawer-section">
              <h3 className="section-title">요청 내용</h3>
              <p className="description-text">{selectedRequest.description}</p>
            </div>

            <div className="drawer-section">
              <h3 className="section-title">화면 위치</h3>
              <div className="drawer-mockup-wrapper">
                <div className="drawer-browser-top">
                  <span className="drawer-dot"></span>
                  <span className="drawer-dot"></span>
                  <span className="drawer-dot"></span>
                  <div className="drawer-browser-url">ourtable.com</div>
                </div>
                
                {/* Visual rendering of mockup matching screenshot */}
                <div className="drawer-browser-preview">
                  <div className="preview-overlay">
                    <h4>맛있는 경험,</h4>
                    <h4>특별한 순간을 예약하세요</h4>
                    
                    {/* Circle green pin */}
                    {selectedRequest.pins && selectedRequest.pins.map(pin => (
                      <div
                        key={pin.id}
                        className="preview-pin"
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      >
                        {pin.id}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pin labels */}
                {selectedRequest.pins && selectedRequest.pins.map(pin => (
                  <div key={pin.id} className="pin-label-row">
                    <span className="pin-num">{pin.id}</span>
                    <span className="pin-text">{pin.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="drawer-section">
              <h3 className="section-title">활동 내역</h3>
              <div className="activity-timeline">
                {selectedRequest.activities && selectedRequest.activities.map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-indicator-col">
                      <div className={`activity-dot ${act.status}`} />
                      <div className="activity-line" />
                    </div>
                    <div className="activity-details">
                      <div className="activity-user-row">
                        <span className="act-user">{act.user} ({act.role})</span>
                        <span className="act-badge-wrapper"><StatusBadge status={act.status} /></span>
                        <span className="act-time">{act.timestamp}</span>
                      </div>
                      <p className="act-msg">{act.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {canAssign && (
              <div className="drawer-section">
                <h3 className="section-title">담당자 배정</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                    className="project-select"
                    style={{ flex: 1 }}
                  >
                    <option value="">미배정</option>
                    {workersQuery.data?.map((worker) => (
                      <option key={worker.id} value={worker.id}>{worker.name}</option>
                    ))}
                  </select>
                  <PrimaryButton onClick={() => assignMutation.mutate()} disabled={assignMutation.isPending || workersQuery.isLoading}>
                    배정
                  </PrimaryButton>
                </div>
                {assignMutation.isError && <span style={{ color: '#D92D20', fontSize: '12px' }}>{apiErrorMessage(assignMutation.error)}</span>}
              </div>
            )}

            {canWork && selectedRaw && (
              <div className="drawer-section">
                <h3 className="section-title">작업 상태 변경</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedRaw.status === 'RECEIVED' || selectedRaw.status === 'REJECTED') && (
                    <PrimaryButton onClick={() => statusMutation.mutate('IN_PROGRESS')} disabled={statusMutation.isPending || !selectedRaw.assigneeId}>
                      진행 시작
                    </PrimaryButton>
                  )}
                  {selectedRaw.status === 'IN_PROGRESS' && (
                    <>
                      <label className="project-select" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: 'pointer' }}>
                        <span>{afterFile ? afterFile.name : '수정 후 이미지 선택'}</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          style={{ display: 'none' }}
                          onChange={(event) => setAfterFile(event.target.files?.[0] ?? null)}
                        />
                      </label>
                      <PrimaryButton onClick={() => statusMutation.mutate('REVIEW_REQUESTED')} disabled={statusMutation.isPending}>
                        검수 요청
                      </PrimaryButton>
                    </>
                  )}
                  {statusMutation.isError && <span style={{ color: '#D92D20', fontSize: '12px' }}>{apiErrorMessage(statusMutation.error)}</span>}
                </div>
              </div>
            )}

            {selectedRaw && (
              <div className="drawer-section">
                <h3 className="section-title">댓글 작성</h3>
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="작업 메모나 확인 내용을 입력하세요."
                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', resize: 'none' }}
                />
                <PrimaryButton onClick={() => commentMutation.mutate()} disabled={commentMutation.isPending || !commentText.trim()}>
                  댓글 등록
                </PrimaryButton>
                {commentMutation.isError && <span style={{ color: '#D92D20', fontSize: '12px' }}>{apiErrorMessage(commentMutation.error)}</span>}
              </div>
            )}
          </div>

          {canReview && (
          <div className="drawer-actions">
            {reviewMutation.isError && (
              <span style={{ color: '#D92D20', fontSize: '12px', marginRight: 'auto' }}>{apiErrorMessage(reviewMutation.error)}</span>
            )}
            <PrimaryButton className="approve-btn" onClick={() => handleReviewAction('APPROVED')} disabled={reviewMutation.isPending}>
              <CheckCircle2 size={16} />
              승인 및 완료
            </PrimaryButton>
            <OutlineButton className="reject-btn" onClick={() => handleReviewAction('REJECTED')} disabled={reviewMutation.isPending}>
              <X size={16} />
              반려
            </OutlineButton>
          </div>
          )}
        </div>
      )}
    </div>
  );
};
export default RequestList;
