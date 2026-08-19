import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./components/ui";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Community from "./pages/Community";
import Esports from "./pages/Esports";
import Department from "./pages/Department";
import Apply from "./pages/Apply";
import AdminLogin from "./pages/admin/AdminLogin";
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Download = lazy(() => import("./pages/Download"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <div className="min-h-screen bg-ink text-bone font-body">
      <div className="noise-overlay" aria-hidden="true" />
      <Header />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-gold">
            <span className="font-cond uppercase tracking-[0.3em] text-xs animate-pulse">Loading…</span>
          </div>
        }
      >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/esports" element={<Esports />} />
        <Route path="/ems" element={<Department slug="ems" />} />
        <Route path="/lspd" element={<Department slug="lspd" />} />
        <Route path="/apply/:kind" element={<Apply />} />
        <Route path="/download" element={<Download />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <HashRouter>
          <ScrollToTop />
          <Shell />
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  );
}
