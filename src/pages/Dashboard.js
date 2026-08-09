import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { fmt, CATEGORIES, getCategoryMeta, generateInsights, localDB } from "../utils/helpers";
import { format, subMonths } from "date-fns";

const COLORS = ["var(--cat-food)", "var(--cat-travel)", "var(--cat-books)", "var(--cat-fun)", "var(--cat-misc)"];
const COLOR_HEX = ["#F4A261", "#5B8DEF", "#B794F6", "#34D399", "#94A3B8"];

const StatCard = ({ label, value, sub, accent, icon }) => (
  <div className="card stat-card card-hover" style={{ "--accent-color": accent }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-4)" }}>
      <span className="eyebrow">{label}</span>
      <div style={{
        width: 30, height: 30, borderRadius: "var(--r-md)",
        background: accent.replace(")", "-dim)").replace("var(", "var("),
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent,
      }}>
        {icon}
      </div>
    </div>
    <div className="text-h1 text-mono" style={{ color: "var(--text)", marginBottom: 4 }}>{value}</div>
    {sub && <div className="text-sm">{sub}</div>}
  </div>
);

const Icon = {
  income: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  expense: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>,
  savings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/></svg>,
  avg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budget, setBudget] = useState(0);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("user_data") || "null")); } catch (e) {}
    const exp = localDB.get("expenses");
    const inc = localDB.get("income");
    const bud = parseFloat(localStorage.getItem("budget") || "0");
    setExpenses(exp);
    setIncome(inc);
    setBudget(bud);
    setInsights(generateInsights(exp, inc, bud));
    setTimeout(() => setLoading(false), 250);
  }, []);

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalInc = income.reduce((s, i) => s + i.amount, 0);
  const savings = totalInc - totalExp;
  const days = new Date().getDate();
  const avgPerDay = days > 0 ? totalExp / days : 0;

  const catData = CATEGORIES.map((cat, i) => ({
    name: cat.label,
    value: expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
    color: COLOR_HEX[i],
  })).filter((d) => d.value > 0);

  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return {
      month: format(d, "MMM"),
      amount: expenses.filter((e) => e.date?.startsWith(format(d, "yyyy-MM"))).reduce((s, e) => s + e.amount, 0),
    };
  });

  const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const budgetPct = budget > 0 ? Math.min((totalExp / budget) * 100, 100) : 0;
  const budgetColor = budgetPct >= 90 ? "var(--danger)" : budgetPct >= 70 ? "var(--warning)" : "var(--success)";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="card-flat" style={{ fontSize: "var(--fs-sm)", boxShadow: "var(--shadow-md)" }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{payload[0].name || payload[0].payload?.month}</div>
          <div className="text-mono" style={{ color: "var(--primary)" }}>{fmt(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 40, width: 280, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 18, width: 360, marginBottom: 32 }} />
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
        </div>
        <div className="grid grid-2">
          <div className="skeleton" style={{ height: 280 }} />
          <div className="skeleton" style={{ height: 280 }} />
        </div>
      </div>
    );
  }

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="text-h1">{greeting}, {user?.name?.split(" ")[0] || "Student"}</h1>
          <p className="text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: "var(--sp-5)" }}>
        <StatCard label="Total income" value={fmt(totalInc)} accent="var(--success)" icon={Icon.income} />
        <StatCard label="Total expenses" value={fmt(totalExp)} accent="var(--danger)" icon={Icon.expense} />
        <StatCard
          label="Net savings"
          value={fmt(savings)}
          sub={savings >= 0 ? "Surplus this month" : "Spending exceeds income"}
          accent={savings >= 0 ? "var(--success)" : "var(--danger)"}
          icon={Icon.savings}
        />
        <StatCard label="Daily average" value={fmt(avgPerDay)} sub={`Over ${days} days`} accent="var(--info)" icon={Icon.avg} />
      </div>

      {/* Budget */}
      {budget > 0 && (
        <div className="card" style={{ marginBottom: "var(--sp-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
            <span className="text-h3">Monthly budget</span>
            <span className="text-sm text-mono">{fmt(totalExp)} of {fmt(budget)}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${budgetPct}%`, background: budgetColor }} />
          </div>
          <div className="text-sm" style={{ marginTop: 8, color: budgetColor }}>
            {budgetPct.toFixed(0)}% used &mdash; {fmt(Math.max(0, budget - totalExp))} remaining
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>Spending by category</h3>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={56} outerRadius={84} dataKey="value" paddingAngle={2} stroke="none">
                    {catData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: "var(--sp-3)", justifyContent: "center" }}>
                {catData.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }} className="text-sm">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: "var(--sp-8) 0" }}>
              <div className="icon">📊</div>
              <div className="title">No expenses yet</div>
              <div className="desc">Add an expense to see your category breakdown.</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>Last 6 months</h3>
          <ResponsiveContainer width="100%" height={236}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-faint)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--surface-2)" }} />
              <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-4)" }}>Recent transactions</h3>
          {recent.length > 0 ? (
            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recent.map((e) => {
                const meta = getCategoryMeta(e.category);
                return (
                  <div key={e.id} className="card-flat" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "var(--r-md)",
                      background: "var(--surface-3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.description}</div>
                      <div className="text-xs">{meta.label} &middot; {e.date}</div>
                    </div>
                    <div className="text-mono" style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--danger)", flexShrink: 0 }}>
                      -{fmt(e.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">💳</div>
              <div className="title">No transactions yet</div>
              <div className="desc">Your recent expenses will show up here.</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-4)", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3c1.8-1.2 3-3.3 3-5.7a7 7 0 0 0-7-7z"/><path d="M9 21h6"/></svg>
            Spending insights
          </h3>
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.map((tip, i) => (
              <div key={i} className="card-flat text-sm" style={{ lineHeight: 1.6 }}>{tip}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}