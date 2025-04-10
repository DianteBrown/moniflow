import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/Auth/AuthPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import MainLayout from "./layouts/MainLayout";
import { authService } from "./services/authService";

function App() {
  const isAuthenticated = authService.isAuthenticated();

  // Wrap authenticated routes with MainLayout
  const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" />;
    }
    return <MainLayout>{children}</MainLayout>;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <AuthenticatedRoute>
              <Dashboard />
            </AuthenticatedRoute>
          }
        />
        
        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />} />
        
        {/* Catch all route - redirect to auth or dashboard */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />} />
      </Routes>
    </Router>
  );
}

export default App;
