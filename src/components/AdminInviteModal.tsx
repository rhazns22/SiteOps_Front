import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { invitationApi, projectApi, apiErrorMessage, type ApiRole } from '../lib/api';

interface AdminInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminInviteModal: React.FC<AdminInviteModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<ApiRole>('CLIENT');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.list,
    enabled: isOpen
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['invitations'],
    queryFn: invitationApi.list,
    enabled: isOpen
  });

  const createMutation = useMutation({
    mutationFn: () =>
      invitationApi.create({
        role,
        clientId: clientId || undefined,
        projectId: projectId || undefined,
        invitedEmail: invitedEmail.trim() || undefined,
        expiresInDays
      }),
    onSuccess: (data) => {
      setGeneratedUrl(data.inviteUrl);
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    }
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => invitationApi.revoke(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    }
  });

  if (!isOpen) return null;

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProjectSelect = (pId: string) => {
    setProjectId(pId);
    const selected = projects.find((p) => p.id === pId);
    if (selected) {
      setClientId(selected.clientId);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#FEF0C7', color: '#DC6803', fontSize: '12px', fontWeight: 600 }}>대기 중</span>;
      case 'USED':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#D1FADF', color: '#079455', fontSize: '12px', fontWeight: 600 }}>사용 완료</span>;
      case 'EXPIRED':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#F2F4F7', color: '#667085', fontSize: '12px', fontWeight: 600 }}>만료</span>;
      case 'REVOKED':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#FEE4E2', color: '#D92D20', fontSize: '12px', fontWeight: 600 }}>취소됨</span>;
      default:
        return status;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(16, 24, 40, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 24px -4px rgba(16, 24, 40, 0.1)',
          overflow: 'hidden',
          fontFamily: 'Pretendard, sans-serif'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #EAECF0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#ECFDF3',
                color: '#07844E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LinkIcon size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#101828', margin: 0 }}>
                사용자 초대 관리
              </h2>
              <p style={{ fontSize: '13px', color: '#667085', margin: '2px 0 0' }}>
                새 사용자 초대 링크를 생성하고 관리합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667085' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Invitation Form */}
          <div
            style={{
              background: '#F9FAFB',
              border: '1px solid #EAECF0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#101828', marginTop: 0, marginBottom: '14px' }}>
              새 초대 링크 생성
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#344054', marginBottom: '6px' }}>
                  초대 역할
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ApiRole)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #D0D5DD',
                    fontSize: '13px'
                  }}
                >
                  <option value="CLIENT">고객사 (CLIENT)</option>
                  <option value="WORKER">작업자 (WORKER)</option>
                  <option value="ADMIN">어드민 (ADMIN)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#344054', marginBottom: '6px' }}>
                  프로젝트 연결
                </label>
                <select
                  value={projectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #D0D5DD',
                    fontSize: '13px'
                  }}
                >
                  <option value="">프로젝트 선택 (선택 사항)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.client})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#344054', marginBottom: '6px' }}>
                  지정 이메일 (선택)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={invitedEmail}
                  onChange={(e) => setInvitedEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #D0D5DD',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#344054', marginBottom: '6px' }}>
                  유효 기간
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #D0D5DD',
                    fontSize: '13px'
                  }}
                >
                  <option value={1}>1일</option>
                  <option value={7}>7일 (기본)</option>
                  <option value={14}>14일</option>
                  <option value={30}>30일</option>
                </select>
              </div>
            </div>

            {createMutation.isError && (
              <p style={{ color: '#D92D20', fontSize: '13px', marginBottom: '12px' }}>
                {apiErrorMessage(createMutation.error)}
              </p>
            )}

            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              style={{
                height: '38px',
                padding: '0 16px',
                backgroundColor: '#07844E',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {createMutation.isPending ? '생성 중...' : '초대 링크 생성'}
            </button>

            {/* Generated Link Display */}
            {generatedUrl && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#ECFDF3',
                  border: '1px solid #A6F4C5',
                  borderRadius: '6px'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#027A48', display: 'block', marginBottom: '6px' }}>
                  생성된 초대 링크 (1회 복사 가능):
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedUrl}
                    style={{
                      flex: 1,
                      height: '34px',
                      padding: '0 10px',
                      borderRadius: '4px',
                      border: '1px solid #A6F4C5',
                      fontSize: '12px',
                      background: '#FFF'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      height: '34px',
                      padding: '0 12px',
                      background: '#07844E',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? '복사됨' : '복사'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Invitation History List */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#101828', marginBottom: '12px' }}>
              발급된 초대 목록
            </h3>

            {invitations.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#667085', textAlign: 'center', padding: '24px 0' }}>
                발급된 초대 내역이 없습니다.
              </p>
            ) : (
              <div style={{ border: '1px solid #EAECF0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #EAECF0', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', color: '#475467', fontWeight: 600 }}>역할</th>
                      <th style={{ padding: '10px 12px', color: '#475467', fontWeight: 600 }}>연결 프로젝트/클라이언트</th>
                      <th style={{ padding: '10px 12px', color: '#475467', fontWeight: 600 }}>상태</th>
                      <th style={{ padding: '10px 12px', color: '#475467', fontWeight: 600 }}>생성일</th>
                      <th style={{ padding: '10px 12px', color: '#475467', fontWeight: 600, textAlign: 'right' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #EAECF0' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#101828' }}>{inv.role}</td>
                        <td style={{ padding: '10px 12px', color: '#344054' }}>
                          {inv.projectName || inv.clientName || '미지정'}
                          {inv.invitedEmail && <span style={{ display: 'block', fontSize: '11px', color: '#667085' }}>{inv.invitedEmail}</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>{statusBadge(inv.status)}</td>
                        <td style={{ padding: '10px 12px', color: '#667085', fontSize: '12px' }}>
                          {new Date(inv.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {inv.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => revokeMutation.mutate(inv.id)}
                              disabled={revokeMutation.isPending}
                              style={{
                                padding: '3px 8px',
                                border: '1px solid #FECDCA',
                                background: '#FEF3F2',
                                color: '#B42318',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              취소
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #EAECF0',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '38px',
              padding: '0 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #D0D5DD',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#344054',
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
