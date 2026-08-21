import React from 'react';
import './Common.css';

// Status Badge
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusClassAndText = () => {
    switch (status) {
      case 'received':
        return { className: 'badge-received', text: '접수' };
      case 'progress':
        return { className: 'badge-progress', text: '진행 중' };
      case 'review':
        return { className: 'badge-review', text: '검수 요청' };
      case 'done':
        return { className: 'badge-done', text: '완료' };
      case 'rejected':
        return { className: 'badge-danger', text: '반려' };
      case 'danger':
        return { className: 'badge-danger', text: '마감 임박' };
      default:
        return { className: 'badge-received', text: status };
    }
  };

  const { className, text } = getStatusClassAndText();
  return <span className={`status-badge ${className}`}>{text}</span>;
};

// Priority Badge
export const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' }> = ({ priority }) => {
  const getPriorityClassAndText = () => {
    switch (priority) {
      case 'low':
        return { className: 'priority-low', text: '낮음' };
      case 'medium':
        return { className: 'priority-medium', text: '보통' };
      case 'high':
        return { className: 'priority-high', text: '높음' };
      default:
        return { className: 'priority-medium', text: '보통' };
    }
  };

  const { className, text } = getPriorityClassAndText();
  return <span className={`priority-badge ${className}`}>{text}</span>;
};

// Primary Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button className={`primary-btn ${className}`} {...props}>
      {children}
    </button>
  );
};

// Outline Button
export const OutlineButton: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button className={`outline-btn ${className}`} {...props}>
      {children}
    </button>
  );
};

// Metric Card
interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, active = false, onClick }) => {
  return (
    <div className={`metric-card ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {icon && <div className="metric-icon">{icon}</div>}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-subtitle">{subtitle}</div>
    </div>
  );
};
