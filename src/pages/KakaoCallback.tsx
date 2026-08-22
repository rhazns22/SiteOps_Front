import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiErrorMessage, authApi } from '../lib/api';
import { useAuth } from '../context/useAuth';

export const KakaoCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      navigate('/login?error=' + encodeURIComponent('카카오 교환 코드가 누락되었습니다.'));
      return;
    }

    let isMounted = true;
    authApi
      .kakaoExchange(code)
      .then(({ accessToken, user }) => {
        if (isMounted) {
          login(accessToken, user);
          navigate('/requests', { replace: true });
        }
      })
      .catch((err) => {
        if (isMounted) {
          const msg = apiErrorMessage(err);
          setErrorMessage(msg);
          setTimeout(() => {
            navigate('/login?error=' + encodeURIComponent(msg), { replace: true });
          }, 2000);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams, login, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: 'Pretendard, sans-serif'
      }}
    >
      {errorMessage ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <p style={{ color: '#D92D20', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            {errorMessage}
          </p>
          <p style={{ color: '#667085', fontSize: '14px' }}>로그인 페이지로 이동 중입니다...</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <p style={{ color: '#101828', fontSize: '16px', fontWeight: 600 }}>
            카카오 로그인 처리 중입니다...
          </p>
        </div>
      )}
    </div>
  );
};

export default KakaoCallback;
