# 🌐 SiteOps Frontend (SiteOps_Front)

> **웹사이트 유지보수 및 운영 관리를 위한 B2B SaaS 프론트엔드 애플리케이션**

SiteOps는 웹사이트 문제 요청, 화면 피드백 핀(Pin) 지정, 진행 상황 추적, 역할별(어드민 / 작업자 / 고객) 맞춤형 대시보드를 제공하는 비주얼 유지보수 플랫폼의 프론트엔드입니다.

---

## 🎨 주요 기능 (Features)

- **어드민 & 고객 & 작업자 역할별 인터페이스**:
  - **어드민(Admin)**: 전체 프로젝트, 유지보수 요청, 상태 변경 및 담당자 배정 통합 관리
  - **작업자(Worker)**: 나에게 할당된 요청 목록 확인 및 검토 요청/완료 작업 수행
  - **고객(Client)**: 내 자사 프로젝트의 신규 유지보수 요청 작성 및 진행 상태 모니터링
- **비주얼 핀(Pin) 지정 및 이슈 제보**:
  - 웹사이트 화면 캡처 이미지 상의 정확한 위치에 핀을 찍고 수정 필요 사항 제보
- **실시간 대시보드 & 통계**:
  - 요청 상태(접수, 진행중, 검토요청, 완료 등), 우선순위별 파이차트 및 진행 현황 시각화
- **반응형 & 현대적인 디자이너 UI/UX**:
  - 디자인 시스템 기반의 깔끔하고 직관적인 카드형 UI, 애니메이션 효과 및 가시성 높은 상태 뱃지

---

## 🛠 기술 스택 (Tech Stack)

- **Core**: React 19, TypeScript
- **Build Tool**: Vite 8
- **State Management & Data Fetching**: TanStack React Query v5
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (CSS Modules / Modern Utility Architecture)

---

## 🔑 테스트 / 데모 계정 정보

로그인 화면에서 아래 계정 버튼 클릭 또는 직접 입력으로 빠른 로그인이 가능합니다.

| 역할 | 이메일 (ID) | 비밀번호 | 설명 |
| :--- | :--- | :--- | :--- |
| **ADMIN (어드민)** | `admin@siteops.demo` / `admin@admin.com` | `demo1234` | 전체 관리자 권한 |
| **WORKER (작업자)** | `worker@siteops.demo` | `demo1234` | 작업 담당자 (개발/디자인) |
| **CLIENT (고객)** | `client@siteops.demo` | `demo1234` | 고객사 담당자 |

---

## 💬 카카오 OAuth & 초대 링크 설정 가이드 (Kakao OAuth & Invitations)

실제 카카오 로그인 및 초대 수락 기능을 사용하려면 **카카오 개발자 센터(Kakao Developers)**에서 다음 설정이 완료되어야 합니다:

1. **카카오 로그인 활성화**: `내 애플리케이션 > 카카오 로그인` 메뉴에서 활성화 상태를 `ON`으로 변경
2. **Web 플랫폼 도메인 등록**: `내 애플리케이션 > 앱 설정 > 플랫폼 > Web`에 도메인 등록
   - 프론트 운영: `https://site-ops-front.vercel.app` (로컬: `http://localhost:5173`)
   - 백엔드 운영: `https://siteops-backend-production.up.railway.app` (로컬: `http://localhost:3000`)
3. **Redirect URI 등록**:
   - 운영: `https://siteops-backend-production.up.railway.app/api/v1/auth/kakao/callback`
   - 로컬: `http://localhost:3000/api/v1/auth/kakao/callback`
4. **동의항목 설정**:
   - `카카오계정(이메일)`: 동의 설정 (필수 또는 선택)
   - `프로필 정보(닉네임)`: 동의 설정 (필수)
5. **Client Secret 활성화**: `카카오 로그인 > 보안`에서 Client Secret 생성 후 활성화
6. **서버 환경변수 등록**:
   - `KAKAO_REST_API_KEY`: 앱 키 > REST API 키
   - `KAKAO_CLIENT_SECRET`: 보안 > Client Secret
   - `KAKAO_REDIRECT_URI`: 카카오 콜백 URL
   - `FRONTEND_URL`: 프론트엔드 도메인 URL

---

## 💡 개발자 꿀팁 & 패턴 장단점 (Developer Pro-Tips & Trade-offs)

### 1. Axios Interceptor 토큰 자동 주입 (`src/lib/api.ts`)
- **장점**: 모든 API 요청에 JWT 헤더 자동 포함 및 401 세션 만료 일괄 처리.
- **단점/고려사항**: 외부 API 호출 시 토큰 유출 방지를 위한 BaseURL 조건 체크 필요.

### 2. React Query `invalidateQueries` 캐시 동기화
- **장점**: 데이터 수정(Mutation) 즉시 새로고침 없이 최신 UI 상태 유지.
- **단점/고려사항**: 잦은 호출 시 API 재요청 증가 (필요 시 Optimistic Update 적용 권장).

### 3. 상대 퍼센트(`%`) 기반 피드백 핀(Pin) 좌표
- **장점**: 다양한 해상도/반응형 환경에서도 원본 이미지 대비 정확한 위치 유지.
- **단점/고려사항**: 이미지 비율 변형 시 핀 오차 방지를 위해 `aspect-ratio` 고정 필요.

---

## 🚀 시작하기 (Quick Start)

### 1. 저장소 클론 및 패키지 설치

```bash
git clone https://github.com/rhazns22/SiteOps_Front.git
cd SiteOps_Front
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```
기본 브라우저 주소: `http://localhost:5173`

### 3. 프로덕션 빌드

```bash
npm run build
```

---

## 📂 프로젝트 구조 (Project Structure)

```text
src/
├── assets/          # 정적 이미지 및 벡터 자원
├── components/      # 공통 헤더, 사이드바, 상태 뱃지 등 공용 컴포넌트
├── lib/             # API 통신, 인증 스토리지, 매퍼 함수
├── pages/           # 대시보드, 요청 목록, 신규 요청, 로그인, 고객 검토 페이지
├── types.ts         # TypeScript 인터페이스 및 타입 정의
├── App.tsx          # 애플리케이션 라우팅 및 쿼리 클라이언트 설정
└── main.tsx         # 엔트리 포인트
```

---

## 🔗 관련 저장소

- 백엔드 API 서버 저장소: [SiteOps_back](https://github.com/rhazns22/SiteOps_back)
