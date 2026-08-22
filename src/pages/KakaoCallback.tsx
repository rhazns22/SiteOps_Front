import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiErrorMessage, authApi, authStorage } from '../lib/api';
import { useAuth } from '../context/useAuth';

type KakaoExchangeResult = Awaited<ReturnType<typeof authApi.kakaoExchange>>;

const kakaoExchangeCache = new Map<
  string,
  {
    expiresAt: number;
    promise: Promise<KakaoExchangeResult>;
  }
>();
const kakaoExchangeCacheMs = 60_000;

const exchangeKakaoCodeOnce = (code: string) => {
  const cached = kakaoExchangeCache.get(code);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const request = authApi.kakaoExchange(code).catch((error) => {
    kakaoExchangeCache.delete(code);
    throw error;
  });
  kakaoExchangeCache.set(code, {
    expiresAt: Date.now() + kakaoExchangeCacheMs,
    promise: request
  });

  return request;
};

export const KakaoCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handledCodeRef = useRef<string | null>(null);
  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      if (authStorage.hasSession()) {
        navigate('/requests', { replace: true });
        return;
      }

      navigate('/login?error=' + encodeURIComponent('카카오 교환 코드가 누락되었습니다.'));
      return;
    }

    if (handledCodeRef.current === code) {
      return;
    }

    handledCodeRef.current = code;
    let isMounted = true;
    exchangeKakaoCodeOnce(code)
      .then(({ accessToken, user }) => {
        if (isMounted) {
          login(accessToken, user);
          navigate('/requests', { replace: true });
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (authStorage.hasSession()) {
            navigate('/requests', { replace: true });
            return;
          }

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
  }, [code, login, navigate]);

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
