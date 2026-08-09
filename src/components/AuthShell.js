import React from "react";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "var(--sp-6)",
      background: "radial-gradient(circle at 50% 0%, rgba(91,141,239,0.08), transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: 408 }} className="animate-in">
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "var(--sp-8)" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--r-lg)",
            background: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto var(--sp-4)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="text-h2" style={{ marginBottom: 4 }}>SpendSmart</div>
          <div className="text-sm">Student expense tracker</div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "var(--sp-8)" }}>
          <h1 className="text-h2" style={{ marginBottom: 6 }}>{title}</h1>
          <p className="text-sm" style={{ marginBottom: "var(--sp-6)" }}>{subtitle}</p>
          {children}
        </div>

        {footer && (
          <div className="text-sm" style={{ textAlign: "center", marginTop: "var(--sp-5)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}