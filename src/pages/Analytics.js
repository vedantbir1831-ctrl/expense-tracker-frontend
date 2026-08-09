import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { fmt, CATEGORIES, generateInsights, localDB } from "../utils/helpers";
import { format, subMonths } from "date-fns";

const COLOR_HEX = ["#F4A261", "#5B8DEF", "#B794F6", "#34D399", "#94A3B8"];

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome]     = useState([]);
  const [budget, setBudget]     = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setExpenses(localDB.get("expenses"));
    setIncome(localDB.get("income"));
    setBudget(parseFloat(localStorage.getItem("budget") || "0"));
    setTimeout(() => setLoading(false), 200);
  }, []);

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalInc = income.reduce((s, i) => s + i.amount, 0);
  const insights = generateInsights(expenses, income, budget);

  const pieData = CATEGORIES.map((cat, i) => ({
    name: cat.label,
    value: expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
    color: COLOR_HEX[i],
  })).filter((d) => d.value > 0);

  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d   = subMonths(new Date(), 5 - i);
    const yr  = format(d, "yyyy-MM");
    const exp = expenses.filter((e) => e.date?.startsWith(yr)).reduce((s, e) => s + e.amount, 0);
    const inc = income.filter((i) => i.date?.startsWith(yr)).reduce((s, i) => s + i.amount, 0);
    return { month: format(d, "MMM"), expenses: exp, income: inc, savings: inc - exp };
  });

  const dayData = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day, i) => ({
    day,
    amount: expenses.filter((e) => new Date(e.date + "T00:00:00").getDay() === i).reduce((s, e) => s + e.amount, 0),
  }));

  const paymentData = ["UPI","Cash","Card","Net Banking","Wallet"].map((mode, i) => ({
    name: mode,
    value: expenses.filter((e) => (e.paymentMode || "UPI") === mode).reduce((s, e) => s + e.amount, 0),
    color: COLOR_HEX[i % COLOR_HEX.length],
  })).filter((d) => d.value > 0);

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card-flat" style={{ fontSize: "var(--fs-sm)", boxShadow: "var(--shadow-md)" }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{label || payload[0].name}</div>
        {payload.map((p, i) => (
          <div key={i} className="text-mono" style={{ color: p.color || p.payload?.color || "var(--primary)" }}>
            {p.name}: {fmt(p.value)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 36, width: 200, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 300, marginBottom: 32 }} />
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
        <div className="grid grid-2"><div className="skeleton" style={{ height: 260 }} /><div className="skeleton" style={{ height: 260 }} /></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Analytics</h1>
          <p className="text-sm">Deep dive into your spending patterns</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-4" style={{ marginBottom: "var(--sp-5)" }}>
        {[
          { label: "Total spent", value: fmt(totalExp), accent: "var(--danger)" },
          { label: "Total income", value: fmt(totalInc), accent: "var(--success)" },
          { label: "Net savings", value: fmt(totalInc - totalExp), accent: (totalInc - totalExp) >= 0 ? "var(--success)" : "var(--danger)" },
          { label: "Transactions", value: expenses.length, accent: "var(--info)" },
        ].map((s, i) => (
          <div key={i} className="card stat-card card-hover" style={{ "--accent-color": s.accent }}>
            <div className="eyebrow" style={{ marginBottom: "var(--sp-3)" }}>{s.label}</div>
            <div className="text-h1 text-mono">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid grid-2" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>Spending by category</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={56} outerRadius={84} dataKey="value" paddingAngle={2} stroke="none">
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: "var(--sp-3)", justifyContent: "center" }}>
                {pieData.map((d, i) => (
                  <div key={i} className="text-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="icon">📊</div><div className="title">No data yet</div><div className="desc">Add expenses to see your breakdown.</div></div>
          )}
        </div>

        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>6-month trend</h3>
          <ResponsiveContainer width="100%" height={236}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-faint)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="income" stroke="#34D399" strokeWidth={2} dot={{ fill: "#34D399", r: 3 }} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2} dot={{ fill: "#F87171", r: 3 }} name="Expenses" />
              <Line type="monotone" dataKey="savings" stroke="#5B8DEF" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: "#5B8DEF", r: 2.5 }} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            {[{c:"#34D399",l:"Income"},{c:"#F87171",l:"Expenses"},{c:"#5B8DEF",l:"Savings"}].map((x,i)=>(
              <div key={i} className="text-xs" style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: x.c, display: "inline-block" }} />{x.l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-2" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>Spending by day of week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-faint)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip content={<Tip />} cursor={{ fill: "var(--surface-2)" }} />
              <Bar dataKey="amount" fill="#B794F6" radius={[4, 4, 0, 0]} maxBarSize={36} name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>Payment methods</h3>
          {paymentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2} stroke="none">
                    {paymentData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: "var(--sp-3)", justifyContent: "center" }}>
                {paymentData.map((d, i) => (
                  <div key={i} className="text-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="icon">💳</div><div className="title">No data yet</div><div className="desc">Payment methods will appear once you add expenses.</div></div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-h3" style={{ marginBottom: "var(--sp-4)", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3c1.8-1.2 3-3.3 3-5.7a7 7 0 0 0-7-7z"/><path d="M9 21h6"/></svg>
          Spending insights
        </h3>
        <div className="grid grid-2 stagger">
          {insights.map((tip, i) => (
            <div key={i} className="card-flat text-sm" style={{ lineHeight: 1.6 }}>{tip}</div>
          ))}
        </div>
      </div>
    </div>
  );
}