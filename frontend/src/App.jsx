import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingTour from "./components/onboarding/OnboardingTour";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Contacts from "./pages/Contacts";
import Calendar from "./pages/Calendar";
import { GoogleOAuthProvider } from "@react-oauth/google";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "677057421433-c7h160ti7ojfotv5hpstanqbo19iqb7q.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <OnboardingProvider>
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                <AppRoutes />
                <OnboardingTour />
              </OnboardingProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}

export default App;