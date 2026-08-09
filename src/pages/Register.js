import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { userAccounts } from "../utils/helpers";
import AuthShell from "../components/AuthShell";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setLoading(true);

    if (userAccounts.find(form.email)) {
      setLoading(false);
      toast.error("An account with this email already exists");
      return;
    }

    userAccounts.save({ name: form.name, email: form.email, password: form.password });
    localStorage.setItem("jwt_token", "demo-token-" + Date.now());
    localStorage.setItem("user_data", JSON.stringify({ name: form.name, email: form.email }));

    toast.success(`Welcome to SpendSmart, ${form.name.split(" ")[0]}`);
    setLoading(false);
    setTimeout(() => { window.location.href = "/dashboard"; }, 250);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your income and expenses in minutes"
      footer={<>Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label className="field-label">Full name</label>
          <input className="input" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field">
          <label className="field-label">Email</label>
          <input className="input" type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="grid grid-2" style={{ gap: 16 }}>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="field">
            <label className="field-label">Confirm</label>
            <input className="input" type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ padding: "12px 20px", fontSize: "var(--fs-base)", marginTop: 4 }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}