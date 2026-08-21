import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import RequestList from './pages/RequestList';
import NewRequest from './pages/NewRequest';
import CustomerReview from './pages/CustomerReview';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import Notifications from './pages/Notifications';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', color: 'var(--text-secondary)', fontSize: '14px' }}>
        인증 정보를 확인하고 있습니다...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
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

export const AppContent: React.FC = () => {
  return (
    <LayoutWrapper>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/requests" element={<ProtectedRoute><RequestList /></ProtectedRoute>} />
        <Route path="/new-request" element={<ProtectedRoute><NewRequest /></ProtectedRoute>} />
        <Route path="/customer-review" element={<ProtectedRoute><CustomerReview /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        {/* Fallback routes */}
        <Route path="/clients" element={<ProtectedRoute><div style={{ padding: '32px' }}><h2>클라이언트 목록 (준비 중)</h2></div></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><div style={{ padding: '32px' }}><h2>사용자 관리 (준비 중)</h2></div></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div style={{ padding: '32px' }}><h2>설정 (준비 중)</h2></div></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </LayoutWrapper>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
