import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import PDFViewer from './components/PDFViewer/PDFViewer';
import { pdfAPI } from './utils/api';

const PDFViewerPage: React.FC = () => {
  const [pdf, setPdf] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  
  React.useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdfId = window.location.pathname.split('/').pop();
        if (pdfId) {
          const response = await pdfAPI.get(pdfId);
          setPdf(response.data);
        }
      } catch (error) {
        console.error('Failed to load PDF:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadPdf();
    }
  }, [user]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!pdf) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">PDF not found</h2>
          <p className="text-gray-600">The requested PDF could not be loaded.</p>
        </div>
      </div>
    );
  }
  
  return <PDFViewer pdf={pdf} />;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <Login onToggleMode={() => setAuthMode('register')} />
        ) : (
          <Register onToggleMode={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/pdf/:id" element={<PDFViewerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;