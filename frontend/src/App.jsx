import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import CommandDashboard from './pages/CommandDashboard';
import TacticalMap from './pages/TacticalMap';
import ThreatMatrix from './pages/ThreatMatrix';
import SarIntelligence from './pages/SarIntelligence';
import VesselRegistry from './pages/VesselRegistry';
import IntegratedFeed from './pages/IntegratedFeed';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function Spinner() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 border-2 border-tac-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index                 element={<CommandDashboard />} />
        <Route path="map"            element={<TacticalMap />} />
        <Route path="alerts"         element={<ThreatMatrix />} />
        <Route path="sar"            element={<SarIntelligence />} />
        <Route path="vessels"        element={<VesselRegistry />} />
        <Route path="integrated-feed" element={<IntegratedFeed />} />
        <Route path="analytics"      element={<AdminRoute><Analytics /></AdminRoute>} />
        <Route path="settings"       element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
