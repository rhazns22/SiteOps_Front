import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage, authApi, invitationApi, type ApiInvitationPreview } from '../lib/api';

export const Invite: React.FC = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<ApiInvitationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let token: string | null = null;

    // Read token from URL fragment #token=...
    const hash = window.location.hash;
    if (hash && hash.includes('token=')) {
      const match = hash.match(/token=([^&]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    // Fallback query param
    if (!token) {
      const searchParams = new URLSearchParams(window.location.search);
      token = searchParams.get('token');
    }

    if (token) {
      // Clear fragment immediately for security
      window.history.replaceState(null, '', window.location.pathname);

      invitationApi
        .createIntent(token)
        .then((data) => {
          setIntentToken(data.intentToken);
          setPreview({
            valid: true,
            role: data.role,
            clientName: data.clientName,
            projectName: data.projectName,
            invitedEmail: data.invitedEmail,
            expiresAt: data.expiresAt
          });
          setLoading(false);
        })
        .catch((err) => {
          setErrorMsg(apiErrorMessage(err));
          setLoading(false);
        });
    } else {
      setErrorMsg('초대 토큰이 주소에 존재하지 않습니다.');
      setLoading(false);
    }
  }, []);

  const [intentToken, setIntentToken] = useState<string | null>(null);

  const handleAcceptWithKakao = () => {
    if (!intentToken) return;
    window.location.href = authApi.getKakaoStartUrl(intentToken);
  };

  const roleLabels: Record<string, string> = {
    ADMIN: '관리자 (ADMIN)',
    WORKER: '작업자 (WORKER)',
    CLIENT: '고객사 (CLIENT)'
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        padding: '24px',
        fontFamily: 'Pretendard, "Noto Sans KR", sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #EAECF0',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
          padding: '36px 32px',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 160 40" width="140" height="35" fill="none">
            <path d="M18 4L30 11V25L18 32L6 25V11L18 4Z" fill="#07844E" />
            <path
              d="M22 12C22 12 14 13.5 14 17C14 20.5 22 19.5 22 23C22 26.5 14 28 14 28"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="42"
              y="26"
              fill="#101828"
              fontSize="24"
              fontWeight="800"
              fontFamily="Pretendard, sans-serif"
            >
              SiteOps
            </text>
          </svg>
        </div>

        {loading && (
          <div style={{ padding: '32px 0' }}>
            <p style={{ color: '#475467', fontSize: '14px' }}>초대 링크 확인 중...</p>
          </div>
        )}

        {!loading && errorMsg && (
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FEE4E2',
                color: '#D92D20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              !
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#101828', marginBottom: '8px' }}>
              초대 링크 유효성 오류
            </h2>
            <p style={{ fontSize: '14px', color: '#667085', marginBottom: '24px', lineHeight: 1.5 }}>
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: '#07844E',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              로그인 페이지로 이동
            </button>
          </div>
        )}

        {!loading && preview && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#101828', marginBottom: '6px' }}>
              SiteOps 초대
            </h2>
            <p style={{ fontSize: '14px', color: '#667085', marginBottom: '24px' }}>
              아래 정보로 SiteOps 프로젝트에 초대되었습니다.
            </p>

            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #EAECF0',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {preview.clientName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#667085' }}>고객사</span>
                  <span style={{ color: '#101828', fontWeight: 600 }}>{preview.clientName}</span>
                </div>
              )}
              {preview.projectName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#667085' }}>프로젝트</span>
                  <span style={{ color: '#101828', fontWeight: 600 }}>{preview.projectName}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#667085' }}>초대 역할</span>
                <span style={{ color: '#07844E', fontWeight: 600 }}>{roleLabels[preview.role] || preview.role}</span>
              </div>
              {preview.invitedEmail && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#667085' }}>지정 이메일</span>
                  <span style={{ color: '#101828', fontWeight: 600 }}>{preview.invitedEmail}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#667085' }}>만료일</span>
                <span style={{ color: '#667085' }}>
                  {new Date(preview.expiresAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAcceptWithKakao}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                height: '46px',
                backgroundColor: '#FEE500',
                color: '#191919',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.766 1.83 5.19 4.605 6.602l-1.173 4.316c-.1.368.307.662.617.453l5.068-3.342c.294.032.593.048.883.048 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z" />
              </svg>
              <span>카카오로 초대 수락하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invite;
