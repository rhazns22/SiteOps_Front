import React from 'react';
import { RefreshCw } from 'lucide-react';
import './RequestLocationPreview.css';

export interface RequestPinItem {
  id: string;
  xPercent: number;
  yPercent: number;
  content: string;
}

export interface RequestLocationPreviewProps {
  pageUrl?: string | null;
  imageUrl?: string | null;
  pins: RequestPinItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedPinId?: string | null;
  onSelectPin?: (pinId: string) => void;
}

const getDisplayUrl = (pageUrl?: string | null): string => {
  if (!pageUrl || !pageUrl.trim()) return '첨부 화면';
  try {
    const formatted = pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`;
    const url = new URL(formatted);
    const path = url.pathname === '/' ? '' : url.pathname;
    return `${url.hostname}${path}`;
  } catch {
    return pageUrl.replace(/^https?:\/\//, '');
  }
};

export const RequestLocationPreview: React.FC<RequestLocationPreviewProps> = ({
  pageUrl,
  imageUrl,
  pins,
  isLoading,
  isError,
  onRetry,
  selectedPinId,
  onSelectPin
}) => {
  const displayUrl = getDisplayUrl(pageUrl);

  return (
    <div className="request-location-preview">
      {/* Browser Bar */}
      <div className="request-location-browser-bar">
        <div className="browser-dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
        <div className="browser-url" title={pageUrl ?? displayUrl}>
          {displayUrl}
        </div>
      </div>

      {/* Main Image Stage */}
      {isLoading ? (
        <div className="location-state-container skeleton">
          <div className="spinner" />
          <span>첨부 이미지를 불러오는 중입니다...</span>
        </div>
      ) : isError ? (
        <div className="location-state-container error">
          <span>첨부 이미지를 불러오지 못했습니다.</span>
          <button type="button" className="btn-retry" onClick={onRetry}>
            <RefreshCw size={12} />
            <span>다시 시도</span>
          </button>
        </div>
      ) : !imageUrl ? (
        <div className="location-state-container empty">
          <span>이 요청에 첨부된 화면 이미지가 없습니다.</span>
        </div>
      ) : (
        <div className="request-location-image">
          <img
            src={imageUrl}
            alt="요청 시 첨부한 수정 대상 화면"
            draggable={false}
          />

          {/* Pin Overlays */}
          <div className="request-location-pins">
            {pins.map((pin, index) => {
              const isSelected = selectedPinId === pin.id;
              const pinNumber = index + 1;

              return (
                <button
                  key={pin.id}
                  type="button"
                  className={`request-location-pin ${isSelected ? 'selected' : ''}`}
                  style={{
                    left: `${pin.xPercent}%`,
                    top: `${pin.yPercent}%`
                  }}
                  aria-label={`수정 위치 ${pinNumber}: ${pin.content}`}
                  onClick={() => onSelectPin?.(pin.id)}
                  title={`#${pinNumber} ${pin.content}`}
                >
                  {pinNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pin Description List */}
      <div className="request-location-list">
        <div className="list-title">수정 위치 목록 ({pins.length}개)</div>
        {pins.length === 0 ? (
          <div className="empty-pins-text">지정된 수정 위치가 없습니다.</div>
        ) : (
          <div className="location-items">
            {pins.map((pin, index) => {
              const isSelected = selectedPinId === pin.id;
              const pinNumber = index + 1;

              return (
                <div
                  key={pin.id}
                  className={`request-location-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectPin?.(pin.id)}
                >
                  <span className="item-num">{pinNumber}</span>
                  <p className="item-content">{pin.content || '내용 없음'}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
