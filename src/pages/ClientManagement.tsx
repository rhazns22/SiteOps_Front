import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Edit3, Plus, RotateCcw, Search, X } from 'lucide-react';
import { apiErrorMessage, clientApi, userApi, type ApiClient } from '../lib/api';
import { formatDate } from '../lib/mappers';
import { PrimaryButton, OutlineButton, StatusBadge } from '../components/Common';
import { useAuth } from '../context/useAuth';
import './ClientManagement.css';

const blankForm = {
  name: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  memo: '',
  managerId: ''
};

type ClientForm = typeof blankForm;

export const ClientManagement: React.FC = () => {
  const { clientId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>('active');
  const [managerId, setManagerId] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'projectCount' | 'progressCount' | 'reviewCount' | 'recentRequestAt'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<ApiClient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<ClientForm>(blankForm);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (clientId) {
      setSelectedClientId(clientId);
    }
  }, [clientId]);

  const clientQuery = useQuery({
    queryKey: ['clients', page, q, status, managerId, sortBy, sortDir],
    queryFn: () =>
      clientApi.list({
        page,
        limit: 12,
        q: q || undefined,
        status,
        managerId: managerId || undefined,
        sortBy,
        sortDir
      })
  });

  const adminsQuery = useQuery({
    queryKey: ['users', 'admins'],
    queryFn: userApi.admins,
    enabled: isAdmin
  });

  const detailQuery = useQuery({
    queryKey: ['clients', selectedClientId],
    queryFn: () => clientApi.detail(selectedClientId!),
    enabled: Boolean(selectedClientId)
  });

  const clients = clientQuery.data?.items ?? [];
  const pagination = clientQuery.data?.pagination;

  useEffect(() => {
    setPage(1);
  }, [q, status, managerId, sortBy, sortDir]);

  const fillForm = (client?: ApiClient | null) => {
    setEditingClient(client ?? null);
    setIsFormOpen(true);
    setForm(
      client
        ? {
            name: client.name,
            contactName: client.contactName ?? '',
            contactEmail: client.contactEmail ?? '',
            contactPhone: client.contactPhone ?? '',
            memo: client.memo ?? '',
            managerId: client.managerId ?? ''
          }
        : blankForm
    );
  };

  const closeForm = () => {
    setEditingClient(null);
    setIsFormOpen(false);
    setForm(blankForm);
  };

  const payload = useMemo(
    () => ({
      name: form.name.trim(),
      contactName: form.contactName.trim() || null,
      contactEmail: form.contactEmail.trim() || null,
      contactPhone: form.contactPhone.trim() || null,
      memo: form.memo.trim() || null,
      managerId: form.managerId || null
    }),
    [form]
  );

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editingClient) {
        return clientApi.update(editingClient.id, payload);
      }
      return clientApi.create(payload);
    },
    onSuccess: (client) => {
      setSelectedClientId(client.id);
      fillForm(null);
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ clientId, isActive }: { clientId: string; isActive: boolean }) =>
      clientApi.updateStatus(clientId, isActive),
    onSuccess: (client) => {
      setSelectedClientId(client.id);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    saveMutation.mutate();
  };

  return (
    <div className="clients-page">
      <div className="clients-main">
        <div className="clients-header">
          <div>
            <h1>클라이언트</h1>
            <p>고객사, 담당자, 관련 요청 현황을 실제 데이터로 관리합니다.</p>
          </div>
          {isAdmin && (
            <PrimaryButton onClick={() => fillForm(null)}>
              <Plus size={16} />
              새 클라이언트
            </PrimaryButton>
          )}
        </div>

        <div className="clients-toolbar">
          <label className="clients-search">
            <Search size={16} />
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="클라이언트 검색" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="all">전체</option>
          </select>
          {isAdmin && (
            <select value={managerId} onChange={(event) => setManagerId(event.target.value)}>
              <option value="">전체 담당 관리자</option>
              {adminsQuery.data?.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          )}
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="name">이름순</option>
            <option value="projectCount">프로젝트 수</option>
            <option value="progressCount">진행 중 요청</option>
            <option value="reviewCount">검수 대기</option>
            <option value="recentRequestAt">최근 요청일</option>
          </select>
          <button type="button" className="sort-toggle" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
            {sortDir === 'asc' ? '오름차순' : '내림차순'}
          </button>
        </div>

        {saveMutation.isError && <div className="clients-error">{apiErrorMessage(saveMutation.error)}</div>}
        {statusMutation.isError && <div className="clients-error">{apiErrorMessage(statusMutation.error)}</div>}

        {isAdmin && isFormOpen && (
          <form className="client-form" onSubmit={handleSubmit}>
            <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="클라이언트명" />
            <input value={form.contactName} onChange={(event) => setForm((prev) => ({ ...prev, contactName: event.target.value }))} placeholder="담당자 이름" />
            <input value={form.contactEmail} onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))} placeholder="담당자 이메일" />
            <input value={form.contactPhone} onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))} placeholder="연락처" />
            <select value={form.managerId} onChange={(event) => setForm((prev) => ({ ...prev, managerId: event.target.value }))}>
              <option value="">담당 관리자 미지정</option>
              {adminsQuery.data?.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
            <textarea value={form.memo} onChange={(event) => setForm((prev) => ({ ...prev, memo: event.target.value }))} placeholder="메모" />
            <div className="client-form-actions">
              <OutlineButton type="button" onClick={closeForm}>
                취소
              </OutlineButton>
              <PrimaryButton disabled={saveMutation.isPending || !form.name.trim()}>
                {editingClient ? '수정 저장' : '등록'}
              </PrimaryButton>
            </div>
          </form>
        )}

        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>클라이언트명</th>
                <th>담당자</th>
                <th>연락처</th>
                <th>프로젝트 수</th>
                <th>진행 중 요청</th>
                <th>검수 대기</th>
                <th>최근 요청일</th>
                <th>상태</th>
                <th>옵션</th>
              </tr>
            </thead>
            <tbody>
              {clientQuery.isLoading && (
                <tr><td colSpan={9}>클라이언트를 불러오는 중입니다...</td></tr>
              )}
              {clientQuery.isError && (
                <tr>
                  <td colSpan={9} className="clients-error">
                    {apiErrorMessage(clientQuery.error)}
                    <button type="button" onClick={() => clientQuery.refetch()}>다시 시도</button>
                  </td>
                </tr>
              )}
              {!clientQuery.isLoading && !clientQuery.isError && clients.length === 0 && (
                <tr><td colSpan={9}>표시할 클라이언트가 없습니다.</td></tr>
              )}
              {!clientQuery.isLoading && !clientQuery.isError && clients.map((client) => (
                <tr key={client.id} onClick={() => setSelectedClientId(client.id)} className={selectedClientId === client.id ? 'selected' : ''}>
                  <td>
                    <strong>{client.name}</strong>
                    <span>{client.managerName ? `관리자 ${client.managerName}` : '담당 관리자 미지정'}</span>
                  </td>
                  <td>{client.contactName || '-'}</td>
                  <td>
                    <span>{client.contactEmail || '-'}</span>
                    <span>{client.contactPhone || ''}</span>
                  </td>
                  <td>{client.projectCount}</td>
                  <td>{client.progressCount}</td>
                  <td>{client.reviewCount}</td>
                  <td>{formatDate(client.recentRequestAt)}</td>
                  <td><span className={client.isActive ? 'client-status active' : 'client-status inactive'}>{client.isActive ? '활성' : '비활성'}</span></td>
                  <td onClick={(event) => event.stopPropagation()}>
                    {isAdmin && (
                      <div className="client-row-actions">
                        <button type="button" onClick={() => fillForm(client)} title="수정">
                          <Edit3 size={15} />
                        </button>
                        <button type="button" onClick={() => statusMutation.mutate({ clientId: client.id, isActive: !client.isActive })} title={client.isActive ? '비활성 처리' : '다시 활성화'}>
                          <RotateCcw size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="clients-pagination">
          <span>{pagination ? `${pagination.total}개 중 ${clients.length}개 표시` : '0개'}</span>
          <div>
            <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>이전</button>
            <span>{pagination?.page ?? 1} / {pagination?.totalPages || 1}</span>
            <button type="button" disabled={!pagination || page >= pagination.totalPages} onClick={() => setPage((prev) => prev + 1)}>다음</button>
          </div>
        </div>
      </div>

      {selectedClientId && (
        <aside className="client-drawer">
          <div className="client-drawer-header">
            <h2>{detailQuery.data?.name ?? '클라이언트 상세'}</h2>
            <button type="button" onClick={() => setSelectedClientId(null)}><X size={18} /></button>
          </div>
          {detailQuery.isLoading && <div className="client-drawer-empty">상세 정보를 불러오는 중입니다...</div>}
          {detailQuery.isError && <div className="clients-error">{apiErrorMessage(detailQuery.error)}</div>}
          {detailQuery.data && (
            <div className="client-drawer-body">
              <section>
                <h3>기본 정보</h3>
                <dl>
                  <div><dt>회사명</dt><dd>{detailQuery.data.name}</dd></div>
                  <div><dt>담당자</dt><dd>{detailQuery.data.contactName || '-'}</dd></div>
                  <div><dt>이메일</dt><dd>{detailQuery.data.contactEmail || '-'}</dd></div>
                  <div><dt>연락처</dt><dd>{detailQuery.data.contactPhone || '-'}</dd></div>
                  <div><dt>등록일</dt><dd>{formatDate(detailQuery.data.createdAt)}</dd></div>
                  <div><dt>최근 활동일</dt><dd>{formatDate(detailQuery.data.recentRequestAt)}</dd></div>
                </dl>
                {detailQuery.data.memo && <p className="client-note">{detailQuery.data.memo}</p>}
              </section>

              <section>
                <h3>요청 상태</h3>
                <div className="client-state-line">
                  <span>진행 중 {detailQuery.data.progressCount}</span>
                  <span>검수 대기 {detailQuery.data.reviewCount}</span>
                  <span>프로젝트 {detailQuery.data.projectCount}</span>
                  <span>사용자 {detailQuery.data.userCount}</span>
                </div>
              </section>

              <section>
                <h3>프로젝트</h3>
                {detailQuery.data.projects?.length ? detailQuery.data.projects.map((project) => (
                  <div key={project.id} className="drawer-list-row">
                    <span>{project.name}</span>
                    <small>{project.websiteUrl}</small>
                  </div>
                )) : <div className="client-drawer-empty">연결된 프로젝트가 없습니다.</div>}
              </section>

              <section>
                <h3>소속 사용자</h3>
                {detailQuery.data.users?.length ? detailQuery.data.users.map((clientUser) => (
                  <div key={clientUser.id} className="drawer-list-row">
                    <span>{clientUser.name}</span>
                    <small>{clientUser.email || clientUser.role}</small>
                  </div>
                )) : <div className="client-drawer-empty">소속 사용자가 없습니다.</div>}
              </section>

              <section>
                <h3>최근 요청</h3>
                {detailQuery.data.recentRequests?.length ? detailQuery.data.recentRequests.map((request) => (
                  <div key={request.id} className="drawer-list-row">
                    <span>{request.title}</span>
                    <StatusBadge status={request.status === 'RECEIVED' ? 'received' : request.status === 'IN_PROGRESS' ? 'progress' : request.status === 'REVIEW_REQUESTED' ? 'review' : request.status === 'REJECTED' ? 'rejected' : 'done'} />
                  </div>
                )) : <div className="client-drawer-empty">최근 요청이 없습니다.</div>}
              </section>
            </div>
          )}
        </aside>
      )}
    </div>
  );
};

export default ClientManagement;
