import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProviderLayout from "./pages/ProviderLayout";
import RequireProvider from "./pages/RequireProvider";
import RequireOnboarded from "./pages/RequireOnboarded";
import OnboardingPage from "./pages/OnboardingPage";
import ProviderHomePage from "./pages/ProviderHomePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import NewPropertyPage from "./pages/NewPropertyPage";
import EditPropertyPage from "./pages/EditPropertyPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/proprietaire/connexion"
        element={<Navigate to="/?auth=connexion" replace />}
      />
      <Route
        path="/proprietaire/inscription"
        element={<Navigate to="/?auth=inscription" replace />}
      />
      {/* Onboarding en modal plein écran — hors sidebar fournisseur */}
      <Route element={<RequireProvider />}>
        <Route path="/proprietaire/onboarding" element={<OnboardingPage />} />
      </Route>
      <Route element={<ProviderLayout />}>
        <Route element={<RequireProvider />}>
          <Route element={<RequireOnboarded />}>
            <Route path="/proprietaire" element={<ProviderHomePage />} />
            <Route path="/proprietaire/gestion" element={<DashboardPage />} />
            <Route path="/proprietaire/profil" element={<ProfilePage />} />
            <Route
              path="/proprietaire/biens/nouveau"
              element={<NewPropertyPage />}
            />
            <Route
              path="/proprietaire/biens/:id"
              element={<PropertyDetailPage />}
            />
            <Route
              path="/proprietaire/biens/:id/modifier"
              element={<EditPropertyPage />}
            />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
