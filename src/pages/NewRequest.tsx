import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, RefreshCw, Trash2 } from 'lucide-react';
import { PrimaryButton, OutlineButton } from '../components/Common';
import { apiErrorMessage, projectApi, requestApi, uploadApi } from '../lib/api';
import { mapApiProject, uiPriorityToApi } from '../lib/mappers';
import './NewRequest.css';

export interface EditablePin {
  id: string;
  xPercent: number;
  yPercent: number;
  content: string;
  isPersisted?: boolean;
}

export const NewRequest: React.FC = () => {
  const navigate = useNav();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Step 2 Pins State
  const [pins, setPins] = useState<EditablePin[]>([]);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const isDraggingRef = useRef(false);

  // Preview Object URL
  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    if (selectedFile.name.toLowerCase().endsWith('.pdf')) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const isPdfFile = Boolean(selectedFile && selectedFile.name.toLowerCase().endsWith('.pdf'));

  // Create Request Mutation
  const createRequestMutation = useMutation({
    mutationFn: async () => {
      // 1. Create MaintenanceRequest
      const created = await requestApi.create({
        projectId,
        title,
        description: content,
        pageUrl: pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`,
        priority: uiPriorityToApi(priority),
        dueDate: dueDate ? dueDate.replaceAll('.', '-') : null,
        pins: pins
          .filter((p) => p.content.trim().length > 0)
          .map((pin, index) => ({
            xPercent: pin.xPercent,
            yPercent: pin.yPercent,
            content: pin.content.trim(),
            sortOrder: index
          }))
      });

      // 2. Upload file attachment if exists
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

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    const nextProject = projects.find((item) => item.id === value);
    if (nextProject) {
      setPageUrl(`https://${nextProject.url}`);
    }
  };

  // Image click to add new pin (ONLY when directly clicking on the <img> element)
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (e.target !== imgRef.current) return;

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }

    if (pins.length >= 30) {
      alert('최대 30개까지 수정 위치를 지정할 수 있습니다.');
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const xPercent = Math.min(
      100,
      Math.max(0, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2)))
    );
    const yPercent = Math.min(
      100,
      Math.max(0, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2)))
    );

    const newPin: EditablePin = {
      id: crypto.randomUUID(),
      xPercent,
      yPercent,
      content: ''
    };

    setPins((prev) => [...prev, newPin]);
    setSelectedPinId(newPin.id);
  };

  // Replace Image Button Handler
  const handleReplaceImageClick = () => {
    if (pins.length > 0) {
      const confirmReplace = window.confirm(
        `이미지를 교체하시겠습니까? 기존에 지정한 ${pins.length}개의 수정 위치(핀)가 모두 삭제됩니다.`
      );
      if (!confirmReplace) return;
    }
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        alert('PDF 파일은 위치 미리보기에 사용할 수 없습니다. 이미지 파일(PNG, JPG, WEBP)을 선택해 주세요.');
        return;
      }
      setSelectedFile(file);
      setPins([]);
      setSelectedPinId(null);
    }
  };

  // Update Pin Content
  const handleUpdatePinContent = (id: string, text: string) => {
    if (text.length > 200) return;
    setPins((prev) => prev.map((p) => (p.id === id ? { ...p, content: text } : p)));
  };

  // Delete Pin
  const handleDeletePin = (id: string) => {
    if (!window.confirm('정말 이 수정 위치를 삭제할까요?')) return;
    setPins((prev) => prev.filter((p) => p.id !== id));
    if (selectedPinId === id) {
      setSelectedPinId(null);
    }
  };

  // Dragging pin via Pointer Events
  const handlePointerDownPin = (e: React.PointerEvent, pinId: string) => {
    e.stopPropagation();
    setSelectedPinId(pinId);
    isDraggingRef.current = false;

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const img = imgRef.current;
      if (!img) return;

      isDraggingRef.current = true;
      const rect = img.getBoundingClientRect();
      const newX = Math.min(
        100,
        Math.max(0, Number((((moveEvent.clientX - rect.left) / rect.width) * 100).toFixed(2)))
      );
      const newY = Math.min(
        100,
        Math.max(0, Number((((moveEvent.clientY - rect.top) / rect.height) * 100).toFixed(2)))
      );

      setPins((prev) =>
        prev.map((p) => (p.id === pinId ? { ...p, xPercent: newX, yPercent: newY } : p))
      );
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      target.removeEventListener('pointermove', handlePointerMove);
      target.removeEventListener('pointerup', handlePointerUp);
    };

    target.addEventListener('pointermove', handlePointerMove);
    target.addEventListener('pointerup', handlePointerUp);
  };

  // Keyboard Nudging for Selected Pin (Only when focus is NOT inside an input or textarea)
  const handleKeyDownPin = (e: React.KeyboardEvent, pinId: string) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const stepSize = e.shiftKey ? 2 : 0.5;
      setPins((prev) =>
        prev.map((p) => {
          if (p.id !== pinId) return p;
          let newX = p.xPercent;
          let newY = p.yPercent;

          if (e.key === 'ArrowLeft') newX = Math.max(0, p.xPercent - stepSize);
          if (e.key === 'ArrowRight') newX = Math.min(100, p.xPercent + stepSize);
          if (e.key === 'ArrowUp') newY = Math.max(0, p.yPercent - stepSize);
          if (e.key === 'ArrowDown') newY = Math.min(100, p.yPercent + stepSize);

          return { ...p, xPercent: Number(newX.toFixed(2)), yPercent: Number(newY.toFixed(2)) };
        })
      );
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      handleDeletePin(pinId);
    }
  };

  // Navigation handlers
  const handleNextToStep2 = () => {
    if (!projectId) {
      alert('프로젝트를 선택해 주세요.');
      return;
    }
    if (!title.trim()) {
      alert('요청 제목을 입력해 주세요.');
      return;
    }
    if (!selectedFile) {
      alert('스크린샷 또는 이미지를 첨부해 주세요.');
      return;
    }
    if (isPdfFile) {
      alert('PDF 파일은 위치 미리보기에 사용할 수 없습니다. 이미지 파일(PNG, JPG, WEBP)을 선택해 주세요.');
      return;
    }
    setStep(2);
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
              <label>프로젝트 선택 <span style={{ color: '#D92D20' }}>*</span></label>
              <select value={projectId} onChange={(e) => handleProjectChange(e.target.value)}>
                {projectQuery.isLoading && <option value="">프로젝트 로딩 중...</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {projectQuery.isError && (
                <span style={{ color: '#D92D20', fontSize: '12px' }}>
                  {apiErrorMessage(projectQuery.error)}
                </span>
              )}
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
              <label>요청 제목 <span style={{ color: '#D92D20' }}>*</span></label>
              <input
                type="text"
                placeholder="요청 제목을 입력하세요 (예: 메인 배너 문구 수정)"
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
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>

              <div className="form-group">
                <label>희망 완료일</label>
                <input
                  type="date"
                  value={dueDate ? dueDate.replaceAll('.', '-') : ''}
                  onChange={(e) => setDueDate(e.target.value.replaceAll('-', '.'))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>스크린샷 또는 이미지 첨부 <span style={{ color: '#D92D20' }}>*</span></label>
              <label className="file-uploader">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span>{selectedFile ? selectedFile.name : '파일을 드래그하거나 클릭하여 업로드'}</span>
                <span className="file-hint">지원 형식: PNG, JPG, JPEG, WEBP (최대 10MB)</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setPins([]);
                    setSelectedPinId(null);
                  }}
                />
              </label>
              {isPdfFile && (
                <p style={{ color: '#D92D20', fontSize: '12px', marginTop: '6px' }}>
                  ⚠️ PDF 파일이 선택되었습니다. 수정 위치를 지정하려면 이미지 파일(PNG, JPG, WEBP)을 선택해 주세요.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-two-layout">
          <div className="preview-panel">
            <div className="preview-panel-header">
              <h3 className="panel-title">수정 위치 지정</h3>
              <div className="preview-header-actions">
                <button className="btn-replace-image" onClick={handleReplaceImageClick}>
                  <RefreshCw size={14} />
                  <span>이미지 교체</span>
                </button>
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={handleReplaceFileChange}
                />
              </div>
            </div>

            {/* Browser chrome wrapper (Excluded from pin coordinate calculation) */}
            <div className="preview-browser-frame">
              <div className="browser-topbar">
                <span className="browser-dot"></span>
                <span className="browser-dot"></span>
                <span className="browser-dot"></span>
                <div className="browser-url-bar">{pageUrl.replace(/^https?:\/\//, '') || 'example.com'}</div>
              </div>

              {/* Exact image bounding stage */}
              <div className="position-image-stage">
                {previewUrl ? (
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    alt="수정 대상 스크린샷"
                    onClick={handleImageClick}
                  />
                ) : (
                  <div className="no-image-placeholder">이미지를 불러올 수 없습니다.</div>
                )}

                {pins.map((pin, index) => {
                  const isSelected = selectedPinId === pin.id;
                  const pinNumber = index + 1;

                  return (
                    <div
                      key={pin.id}
                      tabIndex={0}
                      className={`interactive-pin-node ${isSelected ? 'selected' : ''}`}
                      style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPinId(pin.id);
                      }}
                      onPointerDown={(e) => handlePointerDownPin(e, pin.id)}
                      onKeyDown={(e) => handleKeyDownPin(e, pin.id)}
                    >
                      <span className="pin-circle">{pinNumber}</span>
                      
                      {isSelected && (
                        <div className="pin-popover" onClick={(e) => e.stopPropagation()}>
                          <div className="popover-header">
                            <span>수정 위치 #{pinNumber}</span>
                            <button
                              type="button"
                              className="btn-delete-pin"
                              onClick={() => handleDeletePin(pin.id)}
                              title="삭제"
                            >
                              <Trash2 size={14} />
                              <span>삭제</span>
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            maxLength={200}
                            placeholder="수정할 내용을 입력하세요 (최대 200자)"
                            value={pin.content}
                            onChange={(e) => handleUpdatePinContent(pin.id, e.target.value)}
                            autoFocus
                          />
                          <div className="popover-footer">
                            <span className="char-count">{pin.content.length}/200</span>
                            <button
                              type="button"
                              className="btn-popover-save"
                              onClick={() => setSelectedPinId(null)}
                            >
                              확인
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="preview-hint">
              ⓘ 이미지에서 수정할 위치를 클릭하세요. (드래그하여 이동, 방향키로 미세 조절, Delete 키로 삭제)
            </p>
          </div>

          {/* Right Side Pin List Panel */}
          <div className="pin-list-panel">
            <div className="panel-header-flex">
              <h3 className="panel-title">수정 위치 목록</h3>
              <span className="pin-count-badge">수정 위치 {pins.length}개</span>
            </div>

            {pins.length === 0 ? (
              <div className="empty-pins">
                <p>이미지에서 수정이 필요한 위치를 클릭해 주세요.</p>
              </div>
            ) : (
              <div className="pin-items">
                {pins.map((pin, index) => {
                  const isSelected = selectedPinId === pin.id;
                  const pinNumber = index + 1;

                  return (
                    <div
                      key={pin.id}
                      className={`pin-list-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedPinId(pin.id)}
                    >
                      <span className="pin-badge">{pinNumber}</span>
                      <div className="pin-info flex-1">
                        <input
                          type="text"
                          maxLength={200}
                          placeholder="수정 내용을 입력하세요"
                          value={pin.content}
                          onChange={(e) => handleUpdatePinContent(pin.id, e.target.value)}
                          className="pin-edit-input"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="pin-coords">위치: ({pin.xPercent}%, {pin.yPercent}%)</span>
                      </div>
                      <button
                        type="button"
                        className="btn-icon-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePin(pin.id);
                        }}
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-three-summary">
          <div className="summary-card">
            <h3>요청 사항 최종 확인</h3>
            <p><strong>프로젝트:</strong> {selectedProject?.name ?? '-'}</p>
            <p><strong>요청 제목:</strong> {title}</p>
            <p><strong>희망 완료일:</strong> {dueDate || '미지정'}</p>
            <p><strong>첨부 파일:</strong> {selectedFile?.name ?? '-'}</p>
            <p><strong>지정된 수정 핀 개수:</strong> {pins.filter((p) => p.content.trim()).length}개</p>
            <p className="summary-notice">위 내용을 등록하시겠습니까? 등록 후 바로 작업자에게 전달됩니다.</p>
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="new-request-footer">
        {step === 1 && (
          <>
            <OutlineButton onClick={() => navigate('/requests')}>취소</OutlineButton>
            <PrimaryButton onClick={handleNextToStep2}>다음 단계</PrimaryButton>
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
