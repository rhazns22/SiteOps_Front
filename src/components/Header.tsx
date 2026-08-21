import React from 'react';
import { Search, Calendar } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm }) => {
  const todayLabel = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  }).format(new Date());

  return (
    <header className="app-header">
      <div className="search-container">
        <Search size={18} color="#9aa39e" className="search-icon" />
        <input
          type="text"
          placeholder="검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="header-date">
        <span>오늘 {todayLabel}</span>
        <Calendar size={18} color="#69716d" />
      </div>
    </header>
  );
};
export default Header;
