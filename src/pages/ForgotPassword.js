import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { userAccounts } from "../utils/helpers";
import AuthShell from "../components/AuthShell";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const checkEmail = (e) => {
    e.preventDefault();
    if (!userAccounts.find(email)) { toast.error("No account found with this email"); return; }
    setStep(2);
  };

  const resetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirm) { toast.error("Passwords don't match"); return; }

    const existing = userAccounts.find(email);
    existing.password = newPassword;
    userAccounts.save(existing);

    toast.success("Password reset — please sign in");
    setTimeout(() => navigate("/login"), 600);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={step === 1 ? "Enter the email linked to your account" : "Choose a new password"}
      footer={<Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>← Back to sign in</Link>}
    >
      {step === 1 ? (
        <form onSubmit={checkEmail} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit" style={{ padding: "12px 20px", fontSize: "var(--fs-base)", marginTop: 4 }}>
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label className="field-label">New password</label>
            <input className="input" type="password" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Confirm password</label>
            <input className="input" type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit" style={{ padding: "12px 20px", fontSize: "var(--fs-base)", marginTop: 4 }}>
            Reset password
          </button>
        </form>
      )}
    </AuthShell>
  );
}