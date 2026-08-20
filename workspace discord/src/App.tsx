import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SiteProvider, useSite } from "./state/SiteContext";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { Footer, Header } from "./components/chrome";
import Gate from "./components/Gate";
import { Icon } from "./components/ui";
import Home from "./pages/Home";
import Community from "./pages/Community";
import Esports from "./pages/Esports";
import Tournaments from "./pages/Tournaments";
import Apply from "./pages/Apply";
import Admin from "./pages/admin/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

/* Boot screen while session + site state resolve */
function Boot() {
  return (
    <div className="min-h-screen grid place-items-center bg-ink-950">
      <div className="text-center">
        <Icon name="refresh" className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
        <p className="mt-5 font-mono text-[11px] tracking-[0.4em] text-fog-400">OPENING THE KEEP…</p>
      </div>
    </div>
  );
}

/* Everything (public pages + admin) sits behind the Discord identity gate */
function Shell() {
  const { ready: authReady, identity } = useAuth();
  const { ready: siteReady } = useSite();

  if (!authReady || !siteReady) return <Boot />;
  if (!identity) return <Gate />;

  return (
    <div className="noise min-h-screen bg-ink-950 text-fog-200 flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<Community />} />
          <Route path="/esports" element={<Esports />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/apply/esports" element={<Apply />} />
          <Route path="/ems" element={<Navigate to="/esports" replace />} />
          <Route path="/lspd" element={<Navigate to="/esports" replace />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Shell />
        </BrowserRouter>
      </SiteProvider>
    </AuthProvider>
  );
}
