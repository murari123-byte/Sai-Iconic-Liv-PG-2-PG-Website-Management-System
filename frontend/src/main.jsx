
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import App from './App.jsx';
import Admin from './Admin.jsx';
import AdminLogin from './AdminLogin.jsx';

import './styles.css';

function ProtectedAdmin() {
  const token = sessionStorage.getItem('sai_admin_token');

  return token ? <Admin /> : <Navigate to="/admin/login" replace />;
}

function Root() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdmin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);
