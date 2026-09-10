import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useAuthModal } from "../lib/authModal";

const COLLAPSE_KEY = "kh_provider_sidebar_collapsed";

function IconHome({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDashboard({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconPlus({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconLogout({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 7V5a1 1 0 0 1 1-1h8v16h-8a1 1 0 0 1-1-1v-2M14 12H4m0 0 3-3m-3 3 3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19.5c1.8-3.2 4.2-4.5 7-4.5s5.2 1.3 7 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV = [
  { to: "/proprietaire", label: "Accueil", Icon: IconHome, end: true },
  { to: "/proprietaire/gestion", label: "Mes biens", Icon: IconDashboard, end: true },
  { to: "/proprietaire/biens/nouveau", label: "Nouveau bien", Icon: IconPlus, end: false },
  { to: "/proprietaire/profil", label: "Profil", Icon: IconUser, end: true },
];

export default function ProviderLayout() {
  const { user, logout } = useAuth();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const current =
    [...NAV]
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) =>
        item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to),
      ) || NAV[0];

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--kh-bg)] text-[var(--kh-text)]">
      <button
        type="button"
        aria-label="Fermer le menu"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(100%,18rem)] flex-col bg-[#011A66] text-white shadow-xl transition-[transform,width] duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-[76px]" : "lg:w-64"}`}
      >
        <div className={`border-b border-white/10 px-4 py-4 ${collapsed ? "lg:px-2" : ""}`}>
          <div className={`flex items-start gap-2 ${collapsed ? "lg:justify-center" : "justify-between"}`}>
            <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#66CAE4]">
                Espace fournisseur
              </p>
              <Link
                to="/proprietaire"
                className="mt-1 block truncate text-lg font-extrabold tracking-tight text-white"
                onClick={() => setMobileOpen(false)}
              >
                Konnect House
              </Link>
              <p className="mt-1 truncate text-xs text-white/70">
                {user?.fullName || "Propriétaire"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden rounded-lg border border-white/20 p-2 text-white/90 hover:bg-white/10 lg:inline-flex"
                aria-label={collapsed ? "Étendre" : "Réduire"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  {collapsed ? (
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-white/20 p-2 lg:hidden"
                aria-label="Fermer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto px-3 py-4 ${collapsed ? "lg:px-2" : ""}`}>
          {user
            ? NAV.map(({ to, label, Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={label}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `kh-nav-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition lg:py-2.5 ${
                      collapsed ? "lg:justify-center lg:px-2" : ""
                    } ${isActive ? "kh-nav-link-active bg-white" : "hover:bg-white/10"}`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{label}</span>
                </NavLink>
              ))
            : (
              <button
                type="button"
                onClick={openLogin}
                className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Connexion
              </button>
            )}
        </nav>

        {user ? (
          <div className={`border-t border-white/10 p-4 ${collapsed ? "lg:p-2" : ""}`}>
            <button
              type="button"
              title="Déconnexion"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-3 text-sm font-semibold text-white hover:bg-white/10 ${
                collapsed ? "lg:px-2" : ""
              }`}
            >
              <IconLogout className="h-5 w-5 shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Déconnexion</span>
            </button>
          </div>
        ) : null}
      </aside>

      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-200 ${
          collapsed ? "lg:ml-[76px]" : "lg:ml-64"
        }`}
      >
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-[var(--kh-border)] bg-[var(--kh-bg-soft)]/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            className="rounded-xl border border-[var(--kh-border)] p-2.5 text-[var(--kh-primary)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[var(--kh-primary)]">
              {current?.label || "Konnect House"}
            </p>
            <p className="truncate text-xs text-[var(--kh-text-muted)]">Propriétaire</p>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
