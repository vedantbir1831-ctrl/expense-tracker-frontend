import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fmt, CATEGORIES, localDB } from "../utils/helpers";

const CAT_COLOR_HEX = { FOOD: "#F4A261", TRAVEL: "#5B8DEF", BOOKS: "#B794F6", ENTERTAINMENT: "#34D399", MISCELLANEOUS: "#94A3B8" };

export default function Budget() {
  const [budget, setBudget]                 = useState(0);
  const [catBudgets, setCatBudgets]         = useState({});
  const [budgetInput, setBudgetInput]       = useState("");
  const [catInputs, setCatInputs]           = useState({});
  const [expenses, setExpenses]             = useState([]);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    const bud    = parseFloat(localStorage.getItem("budget") || "0");
    const catBud = JSON.parse(localStorage.getItem("catBudgets") || "{}");
    const thresh = parseFloat(localStorage.getItem("alertThreshold") || "80");
    setBudget(bud);
    setCatBudgets(catBud);
    setBudgetInput(bud > 0 ? String(bud) : "");
    setCatInputs(catBud);
    setAlertThreshold(thresh);
    setExpenses(localDB.get("expenses"));
    setTimeout(() => setLoading(false), 200);
  }, []);

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) { toast.error("Enter a valid budget amount"); return; }
    localStorage.setItem("budget", String(val));
    localStorage.setItem("alertThreshold", String(alertThreshold));
    setBudget(val);
    toast.success("Budget saved");
  };

  const saveCatBudgets = () => {
    const parsed = {};
    Object.entries(catInputs).forEach(([k, v]) => {
      const num = parseFloat(v);
      if (!isNaN(num) && num > 0) parsed[k] = num;
    });
    setCatBudgets(parsed);
    localStorage.setItem("catBudgets", JSON.stringify(parsed));
    toast.success("Category limits saved");
  };

  const totalExp    = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetPct   = budget > 0 ? (totalExp / budget) * 100 : 0;
  const budgetColor = budgetPct >= 90 ? "var(--danger)" : budgetPct >= alertThreshold ? "var(--warning)" : "var(--success)";

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 36, width: 220, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 320, marginBottom: 32 }} />
        <div className="grid grid-2">
          <div className="skeleton" style={{ height: 360 }} />
          <div className="skeleton" style={{ height: 360 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Budget</h1>
          <p className="text-sm">Set spending limits and get alerts before you overspend</p>
        </div>
      </div>

      {/* Alert banner */}
      {budget > 0 && budgetPct >= alertThreshold && (
        <div className="card animate-slide" style={{
          marginBottom: "var(--sp-5)",
          borderColor: budgetPct >= 90 ? "rgba(248,113,113,0.3)" : "rgba(251,191,36,0.3)",
          background: budgetPct >= 90 ? "var(--danger-dim)" : "var(--warning-dim)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={budgetPct >= 90 ? "var(--danger)" : "var(--warning)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>
          </svg>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: budgetPct >= 90 ? "var(--danger)" : "var(--warning)" }}>
              {budgetPct >= 100 ? "Budget exceeded" : `${budgetPct.toFixed(0)}% of budget used`}
            </div>
            <div className="text-sm" style={{ marginTop: 2 }}>
              {budgetPct >= 100
                ? `You're over by ${fmt(totalExp - budget)}`
                : `${fmt(budget - totalExp)} remaining this month`}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {/* Monthly budget */}
        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>Monthly budget</h3>

          <div className="field" style={{ marginBottom: "var(--sp-5)" }}>
            <label className="field-label">Total budget (₹)</label>
            <input
              className="input text-mono"
              type="number"
              placeholder="e.g. 10000"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveBudget()}
            />
          </div>

          <div style={{ marginBottom: "var(--sp-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="field-label">Alert threshold</span>
              <span className="text-sm text-mono">{alertThreshold}%</span>
            </div>
            <input
              type="range" min="50" max="95" step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }} className="text-xs">
              <span>50%</span><span>95%</span>
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={saveBudget}>Save budget</button>

          {budget > 0 && (
            <div className="card-flat" style={{ marginTop: "var(--sp-5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="text-sm">Current usage</span>
                <span className="text-sm text-mono" style={{ color: budgetColor, fontWeight: 600 }}>{budgetPct.toFixed(1)}%</span>
              </div>
              <div className="progress-track" style={{ marginBottom: 8 }}>
                <div className="progress-fill" style={{ width: `${Math.min(budgetPct, 100)}%`, background: budgetColor }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }} className="text-xs">
                <span>Spent {fmt(totalExp)}</span>
                <span>Budget {fmt(budget)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Category limits */}
        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>Category limits</h3>
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: "var(--sp-5)" }}>
            {CATEGORIES.map((cat) => {
              const catExp = expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0);
              const catBud = catBudgets[cat.id] || 0;
              const pct    = catBud > 0 ? Math.min((catExp / catBud) * 100, 100) : 0;
              const color  = pct >= 90 ? "var(--danger)" : pct >= 70 ? "var(--warning)" : CAT_COLOR_HEX[cat.id];
              return (
                <div key={cat.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>
                    <span style={{ flex: 1, fontSize: "var(--fs-sm)", fontWeight: 500 }}>{cat.label}</span>
                    <span className="text-xs text-mono">
                      {catBud > 0 ? `${fmt(catExp)} / ${fmt(catBud)}` : fmt(catExp)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div className="progress-track progress-track-sm">
                        <div className="progress-fill" style={{ width: `${catBud > 0 ? pct : 0}%`, background: color }} />
                      </div>
                    </div>
                    <input
                      className="input text-mono"
                      type="number"
                      placeholder="Limit"
                      value={catInputs[cat.id] || ""}
                      onChange={(e) => setCatInputs({ ...catInputs, [cat.id]: e.target.value })}
                      style={{ width: 90, padding: "6px 10px", fontSize: "var(--fs-xs)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary btn-block" onClick={saveCatBudgets}>Save category limits</button>
        </div>
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: "var(--sp-5)" }}>
        <h3 className="text-h3" style={{ marginBottom: "var(--sp-4)" }}>Budgeting tips for students</h3>
        <div className="grid grid-3">
          {[
            { tip: "Allocate 30–40% of your budget to food and groceries." },
            { tip: "Use monthly transit passes — they're cheaper than daily fares." },
            { tip: "Share or rent textbooks instead of buying new." },
            { tip: "Cap entertainment spending at around 10% of your budget." },
            { tip: "Aim to save at least 20% of your income each month." },
            { tip: "Review subscriptions monthly and cancel what you don't use." },
          ].map((t, i) => (
            <div key={i} className="card-flat text-sm" style={{ lineHeight: 1.6 }}>{t.tip}</div>
          ))}
        </div>
      </div>
    </div>
  );
}