import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/Auth/AuthPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import MainLayout from "./layouts/MainLayout";
import { authService } from "./services/authService";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import PricingPage from "./pages/subscription/PricingPage";
import ManageSubscription from "./pages/subscription/ManageSubscription";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import LandingPage from "./pages/Landing/LandingPage";

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
      <SubscriptionProvider>
        <Routes>
          {/* Landing page route */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public routes */}
          <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <AuthenticatedRoute>
                <Dashboard />
              </AuthenticatedRoute>
            }
          />
          
          <Route
            path="/pricing"
            element={
              <AuthenticatedRoute>
                <PricingPage />
              </AuthenticatedRoute>
            }
          />
          
          <Route
            path="/subscription/manage"
            element={
              <AuthenticatedRoute>
                <ManageSubscription />
              </AuthenticatedRoute>
            }
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SubscriptionProvider>
    </Router>
  );
}

export default App;
