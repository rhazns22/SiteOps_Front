import type { MaintenanceRequest, Project, NotificationItem } from './types';

export const mockProjects: Project[] = [
  {
    id: 'ourtable',
    name: '아워테이블',
    url: 'ourtable.com',
    client: '아워테이블',
    thumbnail: 'ourtable', // Will draw via CSS custom mockups
    members: ['김지은', '이준호', '박상우', '최민지'],
    activeCounts: { progress: 12, review: 4, danger: 2 }
  },
  {
    id: 'monoshop',
    name: '모노샵',
    url: 'monoshop.com',
    client: '모노샵',
    thumbnail: 'monoshop',
    members: ['이준호', '박상우', '최민지'],
    activeCounts: { progress: 8, review: 3, danger: 1 }
  },
  {
    id: 'nexa',
    name: 'NEXA',
    url: 'nexa.io',
    client: 'NEXA',
    thumbnail: 'nexa',
    members: ['김지은', '이준호', '박상우', '최민지', '정재희'],
    activeCounts: { progress: 15, review: 6, danger: 3 }
  },
  {
    id: 'lifestudio',
    name: '라이프스튜디오',
    url: 'lifestudio.co.kr',
    client: '라이프스튜디오',
    thumbnail: 'lifestudio',
    members: ['김지은', '이준호', '최민지'],
    activeCounts: { progress: 9, review: 2, danger: 1 }
  }
];

export const mockRequests: MaintenanceRequest[] = [
  {
    id: 'REQ-01',
    title: '메인 배너 프로모션 문구 교체',
    project: '아워테이블',
    requester: '김지은',
    status: 'progress',
    priority: 'medium',
    createdAt: '2025.05.14',
    dueDate: '2025.05.16',
    url: 'https://ourtable.com',
    description: '메인 배너의 프로모션 문구를 다음과 같이 변경해주세요.\n새 문구: 특별한 순간을 예약하세요',
    pins: [
      { id: 1, x: 75, y: 52, text: '메인 배너 중앙 텍스트 영역' }
    ],
    activities: [
      { id: 'act-3', user: '이준호', role: '디자이너', status: 'progress', message: '작업을 시작합니다.', timestamp: '2025.05.14 11:20' },
      { id: 'act-2', user: '박상우', role: 'PM', status: 'review', message: '요청 내용을 확인했습니다.', timestamp: '2025.05.14 10:45' },
      { id: 'act-1', user: '김지은', role: '요청자', status: 'received', message: '요청이 접수되었습니다.', timestamp: '2025.05.14 10:30' }
    ]
  },
  {
    id: 'REQ-02',
    title: '푸터 회사 정보 업데이트',
    project: '아워테이블',
    requester: '김지은',
    status: 'received',
    priority: 'low',
    createdAt: '2025.05.14',
    dueDate: '2025.05.19',
    url: 'https://ourtable.com',
    description: '사업자등록번호 변경에 따른 회사 정보 푸터 업데이트가 필요합니다.',
    pins: [
      { id: 1, x: 50, y: 90, text: '하단 푸터 영역 회사 정보' }
    ],
    activities: [
      { id: 'act-1', user: '김지은', role: '요청자', status: 'received', message: '요청이 접수되었습니다.', timestamp: '2025.05.14 10:30' }
    ]
  },
  {
    id: 'REQ-03',
    title: '서비스 소개 섹션 이미지 교체',
    project: '아워테이블',
    requester: '박상우',
    status: 'review',
    priority: 'medium',
    createdAt: '2025.05.13',
    dueDate: '2025.05.15',
    url: 'https://ourtable.com',
    description: '서비스 소개 섹션의 메인 일러스트 이미지를 신규 파일로 교체 요청드립니다.',
    pins: [
      { id: 1, x: 30, y: 40, text: '소개 섹션 좌측 이미지' }
    ],
    activities: [
      { id: 'act-2', user: '이준호', role: '디자이너', status: 'review', message: '작업 완료 후 검수 요청을 보냈습니다.', timestamp: '2025.05.14 09:30' },
      { id: 'act-1', user: '박상우', role: '요청자', status: 'received', message: '요청이 접수되었습니다.', timestamp: '2025.05.13 14:00' }
    ]
  },
  {
    id: 'REQ-04',
    title: '모바일 메뉴 간격 조정',
    project: '아워테이블',
    requester: '김지은',
    status: 'progress',
    priority: 'high',
    createdAt: '2025.05.12',
    dueDate: '2025.05.14',
    url: 'https://ourtable.com',
    description: '모바일 뷰에서 햄버거 메뉴를 눌렀을 때 나타나는 네비게이션 항목들의 세로 간격이 너무 좁습니다.',
    pins: [
      { id: 1, x: 90, y: 15, text: '우측 상단 햄버거 버튼 및 팝업' }
    ],
    activities: [
      { id: 'act-1', user: '김지은', role: '요청자', status: 'received', message: '요청이 접수되었습니다.', timestamp: '2025.05.12 11:00' }
    ]
  },
  {
    id: 'REQ-05',
    title: 'FAQ 텍스트 수정',
    project: '아워테이블',
    requester: '이준호',
    status: 'received',
    priority: 'low',
    createdAt: '2025.05.12',
    dueDate: '2025.05.20',
    url: 'https://ourtable.com',
    description: 'FAQ 페이지의 3번째 질문 답변 텍스트 중 오탈자 교정.',
    pins: [],
    activities: []
  },
  {
    id: 'REQ-06',
    title: '블로그 목록 레이아웃 개선',
    project: '아워테이블',
    requester: '박상우',
    status: 'progress',
    priority: 'medium',
    createdAt: '2025.05.11',
    dueDate: '2025.05.18',
    url: 'https://ourtable.com',
    description: '블로그 리스트 카드 컴포넌트의 썸네일 크기 비율을 16:9로 변경해주세요.',
    pins: [],
    activities: []
  },
  {
    id: 'REQ-07',
    title: '이미지 최적화 및 ALT 태그 추가',
    project: '아워테이블',
    requester: '김지은',
    status: 'done',
    priority: 'low',
    createdAt: '2025.05.10',
    dueDate: '2025.05.12',
    url: 'https://ourtable.com',
    description: '메인 및 서브페이지의 모든 이미지 용량을 줄이고 SEO 최적화를 위해 ALT 태그를 누락 없이 채워주세요.',
    pins: [],
    activities: []
  },
  {
    id: 'REQ-08',
    title: '문의 폼 유효성 검증 추가',
    project: '아워테이블',
    requester: '이준호',
    status: 'review',
    priority: 'high',
    createdAt: '2025.05.09',
    dueDate: '2025.05.11',
    url: 'https://ourtable.com',
    description: '고객 센터 문의 폼 전송 시 이메일 형식 체크와 전화번호 입력란 필수 조건 유효성 처리가 필요합니다.',
    pins: [],
    activities: []
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'nt-1',
    type: 'assignment',
    project: '아워테이블',
    title: '담당자 배정',
    message: '이준호 님이 [메인 배너 프로모션 문구 교체] 요청의 담당자로 배정되었습니다.',
    user: '박상우 (PM)',
    time: '오늘 오전 11:20',
    isRead: false
  },
  {
    id: 'nt-2',
    type: 'comment',
    project: '아워테이블',
    title: '새로운 댓글',
    message: '“이 부분 수정할 때 모바일에서도 이상 없는지 더블 체크 부탁드립니다.”',
    user: '김지은 (요청자)',
    time: '오늘 오전 10:45',
    isRead: false
  },
  {
    id: 'nt-3',
    type: 'review',
    project: '아워테이블',
    title: '검수 요청',
    message: '[서비스 소개 섹션 이미지 교체] 요청에 대한 검수 요청이 등록되었습니다.',
    user: '이준호 (디자이너)',
    time: '오늘 오전 09:30',
    isRead: false
  },
  {
    id: 'nt-4',
    type: 'done',
    project: '라이프스튜디오',
    title: '요청 완료',
    message: '[푸터 링크 연결 오류 수정] 건이 최종 승인되어 완료 처리되었습니다.',
    user: '김지은 (요청자)',
    time: '어제 오후 05:40',
    isRead: true
  },
  {
    id: 'nt-5',
    type: 'danger',
    project: 'NEXA',
    title: '마감 임박 알림',
    message: '[로그인 에러 리포트 대응] 건의 마감일이 오늘까지입니다. 신속한 조치가 필요합니다.',
    user: '시스템',
    time: '어제 오후 02:15',
    isRead: true
  }
];
