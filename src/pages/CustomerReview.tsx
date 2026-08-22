import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { PrimaryButton, OutlineButton, StatusBadge } from '../components/Common';
import { apiErrorMessage, requestApi, uploadApi } from '../lib/api';
import { formatDate, mapApiRequest } from '../lib/mappers';
import './CustomerReview.css';

export const CustomerReview: React.FC = () => {
  const navigate = useNavigate();
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100
  const [feedback, setFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const queryClient = useQueryClient();

  const reviewRequestQuery = useQuery({
    queryKey: ['customer-review-request'],
    queryFn: async () => {
      const data = await requestApi.list({ page: 1, limit: 1, status: 'REVIEW_REQUESTED' });
      return data.items[0] ?? null;
    }
  });

  const reviewMutation = useMutation({
    mutationFn: (decision: 'APPROVED' | 'REJECTED') =>
      requestApi.review(reviewRequestQuery.data?.id ?? '', decision, feedback || undefined),
    onSuccess: (_request, decision) => {
      setReviewStatus(decision === 'APPROVED' ? 'approved' : 'rejected');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['customer-review-request'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const request = reviewRequestQuery.data ? mapApiRequest(reviewRequestQuery.data) : null;
  const beforePath = reviewRequestQuery.data?.beforeImagePath;
  const afterPath = reviewRequestQuery.data?.afterImagePath;
  const beforeUrlQuery = useQuery({
    queryKey: ['signed-url', beforePath],
    queryFn: () => uploadApi.signedUrl(beforePath ?? ''),
    enabled: Boolean(beforePath)
  });
  const afterUrlQuery = useQuery({
    queryKey: ['signed-url', afterPath],
    queryFn: () => uploadApi.signedUrl(afterPath ?? ''),
    enabled: Boolean(afterPath)
  });
  const workerMemo =
    reviewRequestQuery.data?.comments.find((comment) => comment.authorRole === 'WORKER')?.content ??
    '작업 완료 후 검수 요청이 등록되었습니다.';

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const handleApprove = () => {
    if (!reviewRequestQuery.data) return;
    reviewMutation.mutate('APPROVED');
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      alert('반려 사유나 수정 요청 사항을 텍스트 입력창에 작성해주세요.');
      return;
    }
    if (!reviewRequestQuery.data) return;
    reviewMutation.mutate('REJECTED');
  };

  return (
    <div className="customer-review-container">
      <div className="review-header">
        <button className="back-btn" onClick={() => navigate('/requests')}>
          <ChevronLeft size={20} />
          <span>수정 결과 검수</span>
        </button>
      </div>

      <div className="review-top-meta">
        <div className="meta-left">
          <h1 className="request-title-main">{request?.title ?? '검수 대기 요청'}</h1>
          <div className="meta-row-badges">
            <span className="meta-label-lbl">프로젝트:</span>
            <span className="meta-val-txt">{request?.project ?? '-'}</span>
            <span className="meta-divider">|</span>
            <span className="meta-label-lbl">상태:</span>
            <StatusBadge status="review" />
          </div>
        </div>

        <div className="meta-right">
          <div className="dates-box">
            <div><span className="lbl">요청일</span><span className="val">{formatDate(reviewRequestQuery.data?.createdAt)}</span></div>
            <div><span className="lbl">완료일</span><span className="val">{formatDate(reviewRequestQuery.data?.reviewRequestedAt)}</span></div>
          </div>
        </div>
      </div>

      {reviewRequestQuery.isLoading && (
        <div className="review-notice-banner">
          <span>검수 요청을 불러오는 중입니다...</span>
        </div>
      )}

      {reviewRequestQuery.isError && (
        <div className="review-notice-banner rejected">
          <AlertCircle size={18} />
          <span>{apiErrorMessage(reviewRequestQuery.error)}</span>
        </div>
      )}

      {!reviewRequestQuery.isLoading && !reviewRequestQuery.isError && !reviewRequestQuery.data && (
        <div className="review-notice-banner">
          <span>현재 검수 대기 중인 요청이 없습니다.</span>
        </div>
      )}

      {reviewStatus === 'approved' && (
        <div className="review-notice-banner approved">
          <Check size={18} />
          <span>수정이 최종 승인되었습니다. 운영 서버에 성공적으로 반영되었습니다.</span>
        </div>
      )}

      {reviewStatus === 'rejected' && (
        <div className="review-notice-banner rejected">
          <AlertCircle size={18} />
          <span>반려 및 재수정 요청이 전달되었습니다. 담당자가 확인 후 다시 수정할 예정입니다.</span>
        </div>
      )}

      {/* Visual compare view with sliding handler */}
      <div className="compare-slider-card">
        <h3 className="card-title">수정 전 / 수정 후 비교</h3>
        
        <div className="slider-canvas">
          {/* Before Image (Left side) */}
          <div className="canvas-pane before-pane">
            {beforeUrlQuery.data?.signedUrl ? (
              <img className="review-actual-image" src={beforeUrlQuery.data.signedUrl} alt="수정 전 업로드 이미지" />
            ) : (
              <div className="pane-placeholder-text">등록된 수정 전 첨부 이미지가 없습니다.</div>
            )}
            <div className="label-indicator before-tag">수정 전 (기존)</div>
          </div>

          {/* After Image (Right side - masked overlay) */}
          <div
            className="canvas-pane after-pane"
            style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
          >
            {afterUrlQuery.data?.signedUrl ? (
              <img className="review-actual-image" src={afterUrlQuery.data.signedUrl} alt="수정 후 업로드 이미지" />
            ) : (
              <div className="pane-placeholder-text">등록된 수정 후 첨부 이미지가 없습니다.</div>
            )}
            <div className="label-indicator after-tag">수정 후 (변경)</div>
          </div>

          {/* Vertical Slider Handler */}
          <div className="slider-bar" style={{ left: `${sliderPosition}%` }}>
            <div className="slider-handle">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M8 19l-7-7 7-7M16 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          {/* Hidden Input range handler overlaying the slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={handleSliderChange}
            className="slider-range-input"
          />
        </div>
        <p className="slider-tip">ⓘ 슬라이더 핸들을 좌우로 드래그하여 변경 사항을 비교할 수 있습니다.</p>
      </div>

      <div className="review-comments-section">
        <div className="feedback-card">
          <h3 className="card-title">작업자 메모</h3>
          <div className="worker-memo">
            <p>{workerMemo}</p>
            <span className="memo-meta">{request?.assignee ?? '담당자'} • {formatDate(reviewRequestQuery.data?.reviewRequestedAt)}</span>
          </div>
        </div>

        <div className="feedback-form">
          <h3 className="card-title">수정 요청 또는 의견</h3>
          <textarea
            rows={4}
            placeholder="반려 시 구체적인 추가 수정 요청 사항을 입력해주세요. 승인 시에는 생략해도 괜찮습니다."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
      </div>

      {/* Review Actions Footer */}
      <div className="review-actions-footer">
        {reviewMutation.isError && (
          <span style={{ color: '#D92D20', fontSize: '13px', marginRight: '12px' }}>{apiErrorMessage(reviewMutation.error)}</span>
        )}
        <OutlineButton className="reject-action-btn" onClick={handleReject} disabled={!reviewRequestQuery.data || reviewMutation.isPending}>수정 요청 (반려)</OutlineButton>
        <PrimaryButton className="approve-action-btn" onClick={handleApprove} disabled={!reviewRequestQuery.data || reviewMutation.isPending}>승인 및 완료</PrimaryButton>
      </div>
    </div>
  );
};
export default CustomerReview;
