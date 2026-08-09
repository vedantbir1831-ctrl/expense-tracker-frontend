import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fmt, CATEGORIES, getCategoryMeta, localDB } from "../utils/helpers";
import { format } from "date-fns";

const PAYMENT_MODES = ["UPI", "Cash", "Card", "Net Banking", "Wallet"];

const defaultForm = () => ({
  description: "", amount: "", category: "FOOD", date: format(new Date(), "yyyy-MM-dd"),
  paymentMode: "UPI", isRecurring: false, note: "",
});

const CAT_COLOR_HEX = { FOOD: "#F4A261", TRAVEL: "#5B8DEF", BOOKS: "#B794F6", ENTERTAINMENT: "#34D399", MISCELLANEOUS: "#94A3B8" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setExpenses(localDB.get("expenses"));
    setTimeout(() => setLoading(false), 200);
  }, []);

  const save = (list) => { setExpenses(list); localDB.set("expenses", list); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) { toast.error("Enter a description"); return; }
    if (!form.amount || form.amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (editId) {
      save(expenses.map((ex) => ex.id === editId ? { ...ex, ...form, amount: parseFloat(form.amount) } : ex));
      toast.success("Expense updated");
      setEditId(null);
    } else {
      save([{ id: Date.now(), ...form, amount: parseFloat(form.amount) }, ...expenses]);
      toast.success("Expense added");
    }
    setForm(defaultForm()); setShowForm(false);
  };

  const handleEdit = (ex) => {
    setForm({ description: ex.description, amount: ex.amount, category: ex.category, date: ex.date, paymentMode: ex.paymentMode || "UPI", isRecurring: ex.isRecurring || false, note: ex.note || "" });
    setEditId(ex.id); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => { save(expenses.filter((e) => e.id !== id)); toast.success("Expense deleted"); };

  const cancelEdit = () => { setForm(defaultForm()); setEditId(null); setShowForm(false); };

  const filtered = expenses
    .filter((e) => filterCat === "ALL" || e.category === filterCat)
    .filter((e) => !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.note?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date_asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      return 0;
    });

  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 36, width: 180, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 280, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 56, marginBottom: 16 }} />
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8 }} />)}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Expenses</h1>
          <p className="text-sm">{expenses.length} transactions &middot; {fmt(totalAll)} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (editId) cancelEdit(); }}>
          {showForm && !editId ? "Cancel" : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add expense
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-scale" style={{ marginBottom: "var(--sp-5)" }}>
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>{editId ? "Edit expense" : "New expense"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2" style={{ marginBottom: "var(--sp-3)" }}>
              <div className="field">
                <label className="field-label">Description</label>
                <input className="input" placeholder="e.g. Lunch at canteen" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="field">
                <label className="field-label">Amount (₹)</label>
                <input className="input text-mono" type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-3" style={{ marginBottom: "var(--sp-4)" }}>
              <div className="field">
                <label className="field-label">Category</label>
                <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="field">
                <label className="field-label">Payment</label>
                <select className="select" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
                  {PAYMENT_MODES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="field" style={{ marginBottom: "var(--sp-4)" }}>
              <label className="field-label">Note (optional)</label>
              <input className="input" placeholder="Add a note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "var(--sp-5)", cursor: "pointer" }} className="text-sm">
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
              Recurring monthly expense
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" type="submit">{editId ? "Save changes" : "Add expense"}</button>
              <button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card card-pad-sm" style={{ marginBottom: "var(--sp-4)" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px", position: "relative" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="input" placeholder="Search expenses" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>
          <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: "auto", minWidth: 150 }}>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "var(--sp-5)" }}>
        {["ALL", ...CATEGORIES.map((c) => c.id)].map((cat) => {
          const meta = cat === "ALL" ? { label: "All", icon: "" } : getCategoryMeta(cat);
          return (
            <button key={cat} className={`pill ${filterCat === cat ? "active" : ""}`} onClick={() => setFilterCat(cat)}>
              {meta.icon && <span>{meta.icon}</span>} {meta.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((exp) => {
            const meta = getCategoryMeta(exp.category);
            const color = CAT_COLOR_HEX[exp.category] || "#94A3B8";
            return (
              <div key={exp.id} className="card card-hover" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--r-md)",
                  background: `${color}1A`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>{meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.description}</span>
                    {exp.isRecurring && <span className="badge badge-primary">Recurring</span>}
                  </div>
                  <div className="text-xs" style={{ marginTop: 3, display: "flex", gap: 8 }}>
                    <span style={{ color }}>{meta.label}</span>
                    <span>&middot;</span>
                    <span>{exp.date}</span>
                    <span>&middot;</span>
                    <span>{exp.paymentMode || "UPI"}</span>
                    {exp.note && <><span>&middot;</span><span>{exp.note}</span></>}
                  </div>
                </div>
                <div className="text-mono" style={{ fontSize: "var(--fs-md)", fontWeight: 600, color: "var(--danger)", flexShrink: 0 }}>
                  -{fmt(exp.amount)}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(exp)} aria-label="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(exp.id)} aria-label="Delete" style={{ color: "var(--danger)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card empty-state">
          <div className="icon">💳</div>
          <div className="title">No expenses found</div>
          <div className="desc">{expenses.length === 0 ? "Add your first expense to get started." : "Try adjusting your filters."}</div>
        </div>
      )}
    </div>
  );
}