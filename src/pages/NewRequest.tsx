import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { PrimaryButton, OutlineButton } from '../components/Common';
import { apiErrorMessage, projectApi, requestApi, uploadApi } from '../lib/api';
import { mapApiProject, uiPriorityToApi } from '../lib/mappers';
import './NewRequest.css';

export const NewRequest: React.FC = () => {
  const navigate = useNav();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [pageUrl, setPageUrl] = useState('https://ourtable.com');
  const [title, setTitle] = useState('메인 배너 프로모션 문구 교체');
  const [content, setContent] = useState('메인 배너의 프로모션 문구를 다음과 같이 변경해주세요.\n새 문구: 특별한 순간을 예약하세요');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('2026.08.21');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const projectQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.list
  });

  const projects = useMemo(() => projectQuery.data?.map(mapApiProject) ?? [], [projectQuery.data]);
  const selectedProject = projects.find((project) => project.id === projectId);

  useEffect(() => {
    if (!projectId && projects[0]) {
      setProjectId(projects[0].id);
      setPageUrl(`https://${projects[0].url}`);
    }
  }, [projectId, projects]);

  const createRequestMutation = useMutation({
    mutationFn: async () => {
      const created = await requestApi.create({
        projectId,
        title,
        description: content,
        pageUrl,
        priority: uiPriorityToApi(priority),
        dueDate: dueDate.replaceAll('.', '-'),
        pins: pins.map((pin, index) => ({
          xPercent: pin.x,
          yPercent: pin.y,
          content: pin.text,
          sortOrder: index
        }))
      });

      if (selectedFile) {
        await uploadApi.uploadRequestAttachment(created.id, selectedFile, 'before');
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      navigate('/requests');
    }
  });

  // Step 2 Pins State
  const [pins, setPins] = useState<{ id: number; x: number; y: number; text: string }[]>([
    { id: 1, x: 28, y: 52, text: '메인 배너 문구 수정' },
    { id: 2, x: 53, y: 65, text: '버튼 색상 변경' },
    { id: 3, x: 65, y: 38, text: '이미지 교체' }
  ]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    const newId = pins.length + 1;
    setPins([...pins, { id: newId, x, y, text: `추가 위치 지정 ${newId}` }]);
  };

  const updatePinText = (id: number, text: string) => {
    setPins(prev => prev.map(p => p.id === id ? { ...p, text } : p));
  };

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    const nextProject = projects.find((item) => item.id === value);
    if (nextProject) {
      setPageUrl(`https://${nextProject.url}`);
    }
  };

  const handleSubmit = () => {
    if (!projectId) {
      alert('프로젝트를 선택해 주세요.');
      return;
    }

    createRequestMutation.mutate();
  };

  return (
    <div className="new-request-container">
      <div className="new-request-header">
        <button className="back-btn" onClick={() => navigate('/requests')}>
          <ChevronLeft size={20} />
          <span>새 유지보수 요청</span>
        </button>
      </div>

      {/* Step Indicators */}
      <div className="step-indicator-wrapper">
        <div className={`step-node ${step >= 1 ? 'active' : ''}`}>
          <span className="step-num">1</span>
          <span className="step-label">기본 정보</span>
        </div>
        <div className="step-line" />
        <div className={`step-node ${step >= 2 ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">수정 위치</span>
        </div>
        <div className="step-line" />
        <div className={`step-node ${step >= 3 ? 'active' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-label">검토 및 등록</span>
        </div>
      </div>

      {step === 1 && (
        <div className="step-form-card">
          <div className="form-grid">
            <div className="form-group">
              <label>프로젝트 선택</label>
              <select value={projectId} onChange={(e) => handleProjectChange(e.target.value)}>
                {projectQuery.isLoading && <option value="">프로젝트 로딩 중</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {projectQuery.isError && <span style={{ color: '#D92D20', fontSize: '12px' }}>{apiErrorMessage(projectQuery.error)}</span>}
            </div>

            <div className="form-group">
              <label>페이지 URL</label>
              <input
                type="text"
                placeholder="https://example.com/page"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>요청 제목</label>
              <input
                type="text"
                placeholder="요청 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>요청 내용</label>
              <textarea
                rows={5}
                placeholder="요청 내용을 자세히 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>우선순위</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>

              <div className="form-group">
                <label>희망 완료일</label>
                <input
                  type="text"
                  placeholder="날짜를 선택하세요"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>스크린샷 또는 파일을 첨부하세요</label>
              <label className="file-uploader">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span>{selectedFile ? selectedFile.name : '파일을 드래그하거나 클릭하여 업로드'}</span>
                <span className="file-hint">JPG, JPEG, PNG, WEBP, PDF (최대 10MB)</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  style={{ display: 'none' }}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-two-layout">
          <div className="preview-panel">
            <h3 className="panel-title">수정 위치 지정</h3>
            <div className="preview-container" onClick={handleImageClick}>
              <div className="browser-topbar">
                <span className="browser-dot"></span>
                <span className="browser-dot"></span>
                <span className="browser-dot"></span>
                <div className="browser-url-bar">{pageUrl.replace('https://', '')}</div>
              </div>
              
              <div className="interactive-page-preview">
                <div className="overlay-elements">
                  <h4>맛있는 경험,</h4>
                  <h4>특별한 순간을 예약하세요</h4>
                  <button className="preview-cta-btn">예약하기</button>
                </div>
                
                {pins.map(pin => (
                  <div
                    key={pin.id}
                    className="interactive-pin-node"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <span className="pin-circle">{pin.id}</span>
                    <span className="pin-tooltip">{pin.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="preview-hint">ⓘ 이미지를 클릭하여 수정 위치를 지정하세요.</p>
          </div>

          <div className="pin-list-panel">
            <h3 className="panel-title">수정 위치 목록</h3>
            <div className="pin-items">
              {pins.map(pin => (
                <div key={pin.id} className="pin-list-item">
                  <span className="pin-badge">{pin.id}</span>
                  <input
                    type="text"
                    value={pin.text}
                    onChange={(e) => updatePinText(pin.id, e.target.value)}
                    className="pin-edit-input"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-three-summary">
          <div className="summary-card">
            <h3>요청 사항 최종 확인</h3>
            <p><strong>프로젝트:</strong> {selectedProject?.name ?? '-'}</p>
            <p><strong>요청 제목:</strong> {title}</p>
            <p><strong>희망 완료일:</strong> {dueDate}</p>
            <p><strong>지정된 수정 핀 개수:</strong> {pins.length}개</p>
            <p className="summary-notice">위 내용을 등록하시겠습니까? 등록 후 바로 작업자에게 전달됩니다.</p>
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="new-request-footer">
        {step === 1 && (
          <>
            <OutlineButton onClick={() => navigate('/requests')}>임시 저장</OutlineButton>
            <PrimaryButton onClick={() => setStep(2)}>다음 단계</PrimaryButton>
          </>
        )}
        {step === 2 && (
          <>
            <OutlineButton onClick={() => setStep(1)}>이전</OutlineButton>
            <PrimaryButton onClick={() => setStep(3)}>다음 단계</PrimaryButton>
          </>
        )}
        {step === 3 && (
          <>
            <OutlineButton onClick={() => setStep(2)}>이전</OutlineButton>
            {createRequestMutation.isError && (
              <span style={{ color: '#D92D20', fontSize: '13px', marginRight: '12px' }}>
                {apiErrorMessage(createRequestMutation.error)}
              </span>
            )}
            <PrimaryButton onClick={handleSubmit} disabled={createRequestMutation.isPending}>
              {createRequestMutation.isPending ? '등록 중...' : '등록 완료'}
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
};
export default NewRequest;
