import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { apiErrorMessage, authApi } from '../lib/api';
import { useAuth } from '../context/useAuth';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@siteops.demo');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: ({ accessToken, user }) => {
      login(accessToken, user);
      navigate('/requests');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-name">SiteOps</span>
        </div>

        <div className="login-form-container">
          <h1 className="login-title">웹사이트 운영을 더 명확하게</h1>
          
          <button type="button" className="google-btn">
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.69 5.69 0 0 1 8.24 12.8a5.69 5.69 0 0 1 5.75-5.714c1.393 0 2.545.495 3.426 1.312l3.076-3.077C18.625 3.633 16.273 2.8 13.99 2.8a9.2 9.2 0 0 0-9.2 9.2 9.2 9.2 0 0 0 9.2 9.2c5.302 0 9.278-3.731 9.278-9.278 0-.616-.055-1.116-.145-1.637H12.24z"/>
            </svg>
            Google로 계속하기
          </button>

          <div className="login-separator">
            <span>또는</span>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>이메일</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>비밀번호</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginMutation.isError && (
              <p style={{ color: '#D92D20', fontSize: '13px', marginTop: '-4px' }}>
                {apiErrorMessage(loginMutation.error)}
              </p>
            )}

            <button type="submit" className="login-submit-btn" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="login-footer">
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#667085', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <span>테스트 계정 선택 (이메일 자동 입력):</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setEmail('admin@siteops.demo')}
                  style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #D0D5DD', background: '#F9FAFB', fontSize: '12px', cursor: 'pointer' }}
                >
                  어드민 (ADMIN)
                </button>
                <button
                  type="button"
                  onClick={() => setEmail('worker@siteops.demo')}
                  style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #D0D5DD', background: '#F9FAFB', fontSize: '12px', cursor: 'pointer' }}
                >
                  작업자 (WORKER)
                </button>
                <button
                  type="button"
                  onClick={() => setEmail('client@siteops.demo')}
                  style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #D0D5DD', background: '#F9FAFB', fontSize: '12px', cursor: 'pointer' }}
                >
                  고객사 (CLIENT)
                </button>
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <span>처음이신가요? </span>
              <a href="#invite" className="invite-link">초대 링크로 시작하세요</a>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="right-bg-curves">
          {/* Subtle curved lines matching ChatGPT Image 2026년 8월 14일 오전 03_44_22.png */}
          <div className="curve curve-1"></div>
          <div className="curve curve-2"></div>
        </div>

        <div className="intro-container">
          <div className="dots-pattern"></div>
          <h2 className="intro-title">요청은 더 정확하게, 소통은 더 간결하게</h2>
          <p className="intro-subtitle">
            사이트에서 발견한 문제를 정확한 위치와 함께 요청하고,<br />
            변경 사항을 한눈에 확인하세요.
          </p>

          {/* Browser mockup visual */}
          <div className="browser-mockup">
            <div className="browser-header">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="browser-tabs">
                <div className="browser-tab">Brand</div>
                <div className="browser-tab-link">서비스</div>
                <div className="browser-tab-link">회사소개</div>
                <div className="browser-tab-link">블로그</div>
                <div className="browser-tab-link">문의하기</div>
              </div>
            </div>
            
            <div className="browser-body">
              <div className="mockup-content">
                <div className="mockup-text-section">
                  <h3>함께, 더 나은<br />디지털 경험을 만듭니다</h3>
                  <p>사용자 중심의 디자인과 기술로 비즈니스의 성장을 돕습니다.</p>
                  <button type="button" className="mockup-cta">자세히 보기</button>
                </div>
                
                <div className="mockup-image-section">
                  <div className="mockup-img-placeholder">
                    {/* Visual Green Pin and comment bubble */}
                    <div className="mockup-pin-container">
                      <div className="mockup-pulse-pin"></div>
                      <div className="mockup-bubble">
                        <span className="bubble-text">메인 이미지 교체가 필요합니다.</span>
                        <span className="bubble-meta">2024-05-20 • 홍길동</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
