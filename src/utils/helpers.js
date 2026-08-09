import { format } from "date-fns";

export const CATEGORIES = [
  { id: "FOOD",          label: "Food",          icon: "🍕", color: "#f87171" },
  { id: "TRAVEL",        label: "Travel",        icon: "🚌", color: "#60a5fa" },
  { id: "BOOKS",         label: "Books",         icon: "📚", color: "#a78bfa" },
  { id: "ENTERTAINMENT", label: "Entertainment", icon: "🎮", color: "#4ade80" },
  { id: "MISCELLANEOUS", label: "Miscellaneous", icon: "📦", color: "#fbbf24" },
];

export const INCOME_SOURCES = [
  { id: "STIPEND",     label: "Stipend" },
  { id: "SCHOLARSHIP", label: "Scholarship" },
  { id: "PART_TIME",   label: "Part-time Job" },
  { id: "PARENTS",     label: "Parents / Family" },
  { id: "FREELANCE",   label: "Freelance" },
  { id: "OTHER",       label: "Other" },
];

export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const fmtDate = (d) => {
  try { return format(new Date(d), "dd MMM yyyy"); }
  catch (e) { return d || ""; }
};

export const getCategoryMeta = (id) =>
  CATEGORIES.find((c) => c.id === id) ||
  { label: id || "Other", icon: "📦", color: "#94a3b8" };

// ── PER-USER NAMESPACED STORAGE ──────────────────────────
// Each logged-in user gets their own data, keyed by email.
const getCurrentUserKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user_data") || "null");
    return user?.email ? `u_${user.email}_` : "u_guest_";
  } catch (e) {
    return "u_guest_";
  }
};

export const localDB = {
  get: (key) => {
    try {
      const fullKey = getCurrentUserKey() + key;
      const val = localStorage.getItem(fullKey);
      return val ? JSON.parse(val) : [];
    } catch (e) {
      return [];
    }
  },
  set: (key, val) => {
    try {
      const fullKey = getCurrentUserKey() + key;
      localStorage.setItem(fullKey, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error("Storage error:", e);
      return false;
    }
  },
};

// Wrappers for simple key-value (budget, catBudgets, alertThreshold)
export const userStorage = {
  get: (key, fallback = null) => {
    try {
      const fullKey = getCurrentUserKey() + key;
      const val = localStorage.getItem(fullKey);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set: (key, val) => {
    try {
      const fullKey = getCurrentUserKey() + key;
      localStorage.setItem(fullKey, String(val));
      return true;
    } catch (e) {
      return false;
    }
  },
};

// ── SIMPLE LOCAL USER ACCOUNT SYSTEM ─────────────────────
// Stores registered users in localStorage under "all_users"
export const userAccounts = {
  getAll: () => {
    try {
      return JSON.parse(localStorage.getItem("all_users") || "[]");
    } catch (e) {
      return [];
    }
  },
  find: (email) => {
    return userAccounts.getAll().find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  },
  save: (user) => {
    const all = userAccounts.getAll();
    const idx = all.findIndex(
      (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (idx >= 0) all[idx] = user;
    else all.push(user);
    localStorage.setItem("all_users", JSON.stringify(all));
  },
};

// ── EXPORT PDF ─────────────────────────────────────────
export const exportPDF = (expenses, income, month) => {
  try {
    const { jsPDF } = require("jspdf");
    require("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Expense Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Month: ${month}`, 14, 30);
    doc.text(`Generated: ${format(new Date(), "dd MMM yyyy")}`, 14, 37);
    doc.autoTable({
      startY: 50,
      head: [["#","Description","Category","Date","Amount"]],
      body: expenses.map((e, i) => [
        i + 1,
        e.description,
        getCategoryMeta(e.category).label,
        fmtDate(e.date),
        `Rs.${e.amount}`,
      ]),
    });
    doc.save(`expense-report-${month}.pdf`);
  } catch (e) {
    alert("PDF export error: " + e.message);
  }
};

// ── EXPORT EXCEL ────────────────────────────────────────
export const exportExcel = (expenses, income, month) => {
  try {
    const XLSX = require("xlsx");
    const wb = XLSX.utils.book_new();
    const expSheet = XLSX.utils.json_to_sheet(
      expenses.map((e) => ({
        Description: e.description,
        Category: getCategoryMeta(e.category).label,
        Amount: e.amount,
        Date: fmtDate(e.date),
        Payment: e.paymentMode || "UPI",
      }))
    );
    XLSX.utils.book_append_sheet(wb, expSheet, "Expenses");
    const incSheet = XLSX.utils.json_to_sheet(
      income.map((i) => ({
        Source: i.source,
        Amount: i.amount,
        Date: fmtDate(i.date),
        Note: i.note || "",
      }))
    );
    XLSX.utils.book_append_sheet(wb, incSheet, "Income");
    XLSX.writeFile(wb, `expense-report-${month}.xlsx`);
  } catch (e) {
    alert("Excel export error: " + e.message);
  }
};

// ── AI INSIGHTS ─────────────────────────────────────────
export const generateInsights = (expenses, income, budget) => {
  if (!expenses || !expenses.length) {
    return ["Add some expenses to get AI insights!"];
  }
  const insights = [];
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalInc = income.reduce((s, i) => s + i.amount, 0);
  const savings  = totalInc - totalExp;

  if (totalInc > 0) {
    const rate = ((savings / totalInc) * 100).toFixed(0);
    if (rate < 10)
      insights.push(`⚠️ Saving only ${rate}% of income. Aim for 20%+.`);
    else if (rate >= 30)
      insights.push(`🌟 Excellent! Saving ${rate}% of income!`);
    else
      insights.push(`✅ Saving ${rate}% of income — on track!`);
  }

  const catTotals = {};
  expenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const topCat = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])[0];
  if (topCat) {
    const meta = getCategoryMeta(topCat[0]);
    const pct  = ((topCat[1] / totalExp) * 100).toFixed(0);
    insights.push(
      `📊 ${meta.label} is your biggest spend at ${pct}%.`
    );
  }

  if (budget > 0) {
    const bpct = ((totalExp / budget) * 100).toFixed(0);
    if (totalExp > budget)
      insights.push(`🔴 Budget exceeded by ${fmt(totalExp - budget)}!`);
    else if (bpct > 80)
      insights.push(`🟡 Used ${bpct}% of budget. ${fmt(budget - totalExp)} left.`);
  }

  const dayOfMonth  = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(), new Date().getMonth() + 1, 0
  ).getDate();
  if (dayOfMonth > 5) {
    const predicted = Math.round((totalExp / dayOfMonth) * daysInMonth);
    insights.push(
      `🔮 Predicted month-end spending: ${fmt(predicted)}`
    );
  }

  return insights.length
    ? insights
    : ["📈 Keep tracking for personalized insights!"];
};