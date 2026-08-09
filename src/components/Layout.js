import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const NAV = [
  { to: "/dashboard", label: "Dashboard",  icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { to: "/expenses",  label: "Expenses",   icon: "M3 7h18M3 12h18M3 17h18" },
  { to: "/income",    label: "Income",     icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { to: "/budget",    label: "Budget",     icon: "M12 2a10 10 0 1 0 10 10H12V2z M21 12A9 9 0 0 0 12 3v9h9z" },
  { to: "/analytics", label: "Analytics",  icon: "M3 3v18h18 M18 9l-5 5-3-3-4 4" },
  { to: "/reports",   label: "Reports",    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user_data") || "null"));
    } catch (e) { setUser(null); }
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
    toast.success("Signed out");
    navigate("/login");
  };

  const initials = (user?.name || "S")
    .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── TOPBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? "rgba(11,14,20,0.85)" : "var(--bg)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        transition: "background var(--t-base), border-color var(--t-base)",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "0 var(--sp-6)",
          height: 64,
          display: "flex", alignItems: "center", gap: "var(--sp-8)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "var(--r-md)",
              background: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "var(--fs-md)", letterSpacing: "-0.01em" }}>
              SpendSmart
            </span>
          </div>

          {/* Nav links - desktop */}
          <nav className="topnav-desktop" style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 14px",
                  borderRadius: "var(--r-md)",
                  fontSize: "var(--fs-sm)",
                  fontWeight: 500,
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                  background: isActive ? "var(--surface-2)" : "transparent",
                  transition: "all var(--t-fast)",
                })}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User menu */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginLeft: "auto" }}>
            <div className="user-chip-desktop" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--surface-3)", border: "1px solid var(--border-strong)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--text-muted)",
              }}>
                {initials}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{user?.name?.split(" ")[0] || "Student"}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Sign out
            </button>
            {/* Mobile menu toggle */}
            <button
              className="btn btn-ghost btn-icon mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{ display: "none" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="mobile-nav" style={{
            borderTop: "1px solid var(--border)",
            padding: "var(--sp-3) var(--sp-4)",
            display: "flex", flexDirection: "column", gap: 2,
            animation: "fadeIn var(--t-base)",
          }}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px",
                  borderRadius: "var(--r-md)",
                  fontSize: "var(--fs-base)",
                  fontWeight: 500,
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                  background: isActive ? "var(--surface-2)" : "transparent",
                })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* ── PAGE CONTENT ── */}
      <main>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 880px) {
          .topnav-desktop { display: none !important; }
          .user-chip-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}