import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import RequestList from './pages/RequestList';
import NewRequest from './pages/NewRequest';
import CustomerReview from './pages/CustomerReview';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import Notifications from './pages/Notifications';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  // States passed to Sidebar / Header
  const [currentProject, setCurrentProject] = useState('아워테이블');
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar currentProject={currentProject} setCurrentProject={setCurrentProject} />
      <div style={{ flex: 1, paddingLeft: '216px', paddingTop: '72px' }}>
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main style={{ minHeight: 'calc(100vh - 72px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/requests" element={<RequestList />} />
          <Route path="/new-request" element={<NewRequest />} />
          <Route path="/customer-review" element={<CustomerReview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Fallback routes */}
          <Route path="/clients" element={<div style={{ padding: '32px' }}><h2>클라이언트 목록 (준비 중)</h2></div>} />
          <Route path="/users" element={<div style={{ padding: '32px' }}><h2>사용자 관리 (준비 중)</h2></div>} />
          <Route path="/settings" element={<div style={{ padding: '32px' }}><h2>설정 (준비 중)</h2></div>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
};
export default App;
