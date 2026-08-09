import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import {
  fmt, getCategoryMeta,
  exportPDF, exportExcel, localDB
} from "../utils/helpers";
import { format, subMonths } from "date-fns";

const CAT_COLOR_HEX = { FOOD: "#F4A261", TRAVEL: "#5B8DEF", BOOKS: "#B794F6", ENTERTAINMENT: "#34D399", MISCELLANEOUS: "#94A3B8" };
const CATEGORIES_LOCAL = [
  { id: "FOOD", label: "Food" }, { id: "TRAVEL", label: "Travel" },
  { id: "BOOKS", label: "Books" }, { id: "ENTERTAINMENT", label: "Entertainment" },
  { id: "MISCELLANEOUS", label: "Miscellaneous" },
];

export default function Reports() {
  const [expenses, setExpenses]           = useState([]);
  const [income, setIncome]               = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    setExpenses(localDB.get("expenses"));
    setIncome(localDB.get("income"));
    setTimeout(() => setLoading(false), 200);
  }, []);

  const monthExp = expenses.filter((e) => e.date?.startsWith(selectedMonth));
  const monthInc = income.filter((i) => i.date?.startsWith(selectedMonth));

  const totalExp = monthExp.reduce((s, e) => s + e.amount, 0);
  const totalInc = monthInc.reduce((s, i) => s + i.amount, 0);
  const savings  = totalInc - totalExp;

  const catData = CATEGORIES_LOCAL.map((cat) => ({
    name:   cat.label,
    amount: monthExp.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
    color: CAT_COLOR_HEX[cat.id],
  })).filter((d) => d.amount > 0);

  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d  = subMonths(new Date(), 5 - i);
    const yr = format(d, "yyyy-MM");
    return {
      month:    format(d, "MMM"),
      expenses: expenses.filter((e) => e.date?.startsWith(yr)).reduce((s, e) => s + e.amount, 0),
      income:   income.filter((i) => i.date?.startsWith(yr)).reduce((s, i) => s + i.amount, 0),
    };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") };
  });

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card-flat" style={{ fontSize: "var(--fs-sm)", boxShadow: "var(--shadow-md)" }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="text-mono" style={{ color: p.color || "var(--primary)" }}>
            {p.name}: {fmt(p.value)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 36, width: 160, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 280, marginBottom: 32 }} />
        <div className="grid grid-3" style={{ marginBottom: 24 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 96 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Reports</h1>
          <p className="text-sm">Monthly summary and exportable statements</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => exportExcel(monthExp, monthInc, selectedMonth)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13l3 3 3-3M12 16v-5"/></svg>
            Export Excel
          </button>
          <button className="btn btn-primary" onClick={() => exportPDF(monthExp, monthInc, selectedMonth)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6M9 11h6"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Month selector */}
      <div className="card card-pad-sm" style={{ marginBottom: "var(--sp-5)", display: "flex", alignItems: "center", gap: 12 }}>
        <span className="text-sm" style={{ fontWeight: 500 }}>Reporting month</span>
        <select className="select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ width: "auto", minWidth: 180 }}>
          {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-3" style={{ marginBottom: "var(--sp-5)" }}>
        {[
          { label: "Total income", value: fmt(totalInc), accent: "var(--success)" },
          { label: "Total expenses", value: fmt(totalExp), accent: "var(--danger)" },
          { label: "Net savings", value: fmt(savings), accent: savings >= 0 ? "var(--success)" : "var(--danger)" },
        ].map((s, i) => (
          <div key={i} className="card stat-card card-hover" style={{ "--accent-color": s.accent }}>
            <div className="eyebrow" style={{ marginBottom: "var(--sp-3)" }}>{s.label}</div>
            <div className="text-h1 text-mono">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>Spending by category</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-faint)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                <Tooltip content={<Tip />} cursor={{ fill: "var(--surface-2)" }} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40} name="Amount">
                  {catData.map((d, i) => <Bar key={i} dataKey="amount" fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="icon">📈</div><div className="title">No data for this month</div><div className="desc">Select a different month or add expenses.</div></div>
          )}
        </div>

        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>6-month trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-faint)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="income" stroke="#34D399" strokeWidth={2} dot={{ fill: "#34D399", r: 3 }} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2} dot={{ fill: "#F87171", r: 3 }} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <h3 className="text-h3">Transaction details</h3>
          <span className="text-xs">{monthExp.length} expenses</span>
        </div>

        {monthExp.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  {["Description", "Category", "Date", "Payment", "Amount"].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {monthExp.map((e) => {
                  const meta = getCategoryMeta(e.category);
                  const color = CAT_COLOR_HEX[e.category] || "#94A3B8";
                  return (
                    <tr key={e.id}>
                      <td>{e.description}</td>
                      <td><span className="badge" style={{ background: `${color}1A`, color }}>{meta.icon} {meta.label}</span></td>
                      <td className="text-muted">{e.date}</td>
                      <td className="text-muted">{e.paymentMode || "UPI"}</td>
                      <td className="text-mono" style={{ color: "var(--danger)", fontWeight: 600 }}>-{fmt(e.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ fontWeight: 600 }}>Total</td>
                  <td className="text-mono" style={{ color: "var(--danger)", fontWeight: 700 }}>-{fmt(totalExp)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="empty-state"><div className="icon">📄</div><div className="title">No expenses for this month</div><div className="desc">Try selecting a different month.</div></div>
        )}
      </div>
    </div>
  );
}