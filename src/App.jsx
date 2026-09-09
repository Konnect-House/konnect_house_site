import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProviderLayout from "./pages/ProviderLayout";
import RequireProvider from "./pages/RequireProvider";
import RequireOnboarded from "./pages/RequireOnboarded";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import NewPropertyPage from "./pages/NewPropertyPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<ProviderLayout />}>
        <Route path="/proprietaire/connexion" element={<LoginPage />} />
        <Route path="/proprietaire/inscription" element={<RegisterPage />} />
        <Route element={<RequireProvider />}>
          <Route path="/proprietaire/onboarding" element={<OnboardingPage />} />
          <Route element={<RequireOnboarded />}>
            <Route path="/proprietaire" element={<DashboardPage />} />
            <Route
              path="/proprietaire/biens/nouveau"
              element={<NewPropertyPage />}
            />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
