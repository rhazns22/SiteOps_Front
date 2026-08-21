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

## 💡 개발자를 위한 꿀팁 & 아키텍처 패턴 (Developer Pro-Tips)

### 1. Axios 인터셉터를 통한 JWT 토큰 자동 주입 및 인증 세션 관리
`src/lib/api.ts`에서 Axios 인터셉터를 활용해 모든 API 요청 헤더에 Authorization JWT 토큰을 자동으로 주입하고, `401 Unauthorized` 예외 시 자동으로 로컬 세션을 정돈합니다.

```typescript
// src/lib/api.ts
export const api = axios.create({ baseURL: '/api/v1' });

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. React Query의 무효화(`invalidateQueries`)를 통한 실시간 UI 상태 동기화
요청 상태 변경이나 피드백 생성 시 `onSuccess` 콜백에서 즉시 관련 캐시 쿼리를 무효화하여 새로고침 없이 즉각적인 UI 업데이트를 보장합니다.

```typescript
const queryClient = useQueryClient();

const updateStatusMutation = useMutation({
  mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
    requestApi.updateStatus(id, status),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['requests'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  }
});
```

### 3. 화면 상대 좌표 기반의 가변 핀(Pin) 렌더링 패턴
이미지 위 핀의 위치를 절대 픽셀(px) 대신 비율 퍼센트(`x%`, `y%`)로 저장하여 다양한 화면 해상도에서도 핀의 위치가 왜곡되지 않고 정확히 배치됩니다.

```tsx
<div 
  className="pin-marker" 
  style={{ left: `${pin.xPercentage}%`, top: `${pin.yPercentage}%` }}
>
  <span className="pin-number">{index + 1}</span>
</div>
```

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
