import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { userAccounts } from "../utils/helpers";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const existing = userAccounts.find(form.email);

    if (!existing) {
      setLoading(false);
      toast.error("No account found with this email");
      return;
    }
    if (existing.password !== form.password) {
      setLoading(false);
      toast.error("Incorrect password");
      return;
    }

    localStorage.setItem("jwt_token", "demo-token-" + Date.now());
    localStorage.setItem("user_data", JSON.stringify({ name: existing.name, email: existing.email }));

    toast.success(`Welcome back, ${existing.name.split(" ")[0]}`);
    setLoading(false);
    setTimeout(() => { window.location.href = "/dashboard"; }, 250);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue tracking your spending"
      footer={<>No account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Create one</Link></>}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label className="field-label">Email</label>
          <input className="input" type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label className="field-label">Password</label>
            <Link to="/forgot-password" className="text-xs" style={{ color: "var(--primary)" }}>Forgot password?</Link>
          </div>
          <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ padding: "12px 20px", fontSize: "var(--fs-base)", marginTop: 4 }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}