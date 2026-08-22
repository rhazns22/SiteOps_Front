import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { apiErrorMessage, authApi } from '../lib/api';
import { useAuth } from '../context/useAuth';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [urlErrorMessage, setUrlErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setUrlErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: ({ accessToken, user }) => {
      login(accessToken, user);
      navigate('/requests');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlErrorMessage(null);
    loginMutation.mutate();
  };

  const handleKakaoLogin = () => {
    window.location.href = authApi.getKakaoStartUrl();
  };

  const handleInviteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('관리자에게 초대 링크를 요청해 주세요.');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-content">
          <div className="login-brand">
            <svg viewBox="0 0 160 40" width="160" height="40" fill="none" className="brand-svg-logo">
              {/* Hexagon 'S' Symbol */}
              <path
                d="M18 4L30 11V25L18 32L6 25V11L18 4Z"
                fill="#07844E"
              />
              <path
                d="M22 12C22 12 14 13.5 14 17C14 20.5 22 19.5 22 23C22 26.5 14 28 14 28"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* SiteOps Wordmark */}
              <text
                x="42"
                y="26"
                fill="#101828"
                fontSize="24"
                fontWeight="800"
                fontFamily="Pretendard, sans-serif"
                letterSpacing="0"
              >
                SiteOps
              </text>
            </svg>
          </div>

          <h1 className="login-title">웹사이트 운영을 더 명확하게</h1>

          {urlErrorMessage && (
            <div className="login-error-banner">
              {urlErrorMessage}
            </div>
          )}

          <button type="button" className="kakao-btn" onClick={handleKakaoLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.766 1.83 5.19 4.605 6.602l-1.173 4.316c-.1.368.307.662.617.453l5.068-3.342c.294.032.593.048.883.048 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z" />
            </svg>
            <span>카카오로 계속하기</span>
          </button>

          <div className="login-separator">
            <span>또는</span>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="비밀번호 표시 토글"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginMutation.isError && (
              <p className="form-error-msg">
                {apiErrorMessage(loginMutation.error)}
              </p>
            )}

            <button type="submit" className="login-submit-btn" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? '로그인 중...' : '이메일로 로그인'}
            </button>
          </form>

          <div className="invite-footer">
            <span>처음이신가요? </span>
            <a href="#invite" onClick={handleInviteClick} className="invite-link">
              초대 링크로 시작하세요
            </a>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="right-bg-curves">
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
                    <div className="mockup-pin-container">
                      <div className="mockup-pulse-pin"></div>
                      <div className="mockup-bubble">
                        <div className="bubble-header">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#07844E">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          </svg>
                          <span className="bubble-text">메인 이미지 교체가 필요합니다.</span>
                        </div>
                        <span className="bubble-meta">위치 기반 요청 핀</span>
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
