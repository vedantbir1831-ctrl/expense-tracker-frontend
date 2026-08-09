import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fmt, INCOME_SOURCES, localDB } from "../utils/helpers";
import { format } from "date-fns";

const defaultForm = () => ({ source: "STIPEND", amount: "", date: format(new Date(), "yyyy-MM-dd"), note: "" });

const SOURCE_ICON = {
  STIPEND: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  SCHOLARSHIP: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>,
  PART_TIME: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  PARENTS: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  FREELANCE: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  OTHER: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
};

export default function Income() {
  const [income, setIncome] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIncome(localDB.get("income"));
    setTimeout(() => setLoading(false), 200);
  }, []);

  const save = (list) => {
    try {
      setIncome(list);
      const ok = localDB.set("income", list);
      if (!ok) toast.error("Failed to save income");
    } catch (e) {
      toast.error("Failed to save income: " + e.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (editId) {
      save(income.map((i) => i.id === editId ? { ...i, ...form, amount: parseFloat(form.amount) } : i));
      toast.success("Income updated"); setEditId(null);
    } else {
      save([{ id: Date.now(), ...form, amount: parseFloat(form.amount) }, ...income]);
      toast.success("Income added");
    }
    setForm(defaultForm()); setShowForm(false);
  };

  const handleDelete = (id) => { save(income.filter((i) => i.id !== id)); toast.success("Income deleted"); };

  const handleEdit = (inc) => {
    setForm({ source: inc.source, amount: inc.amount, date: inc.date, note: inc.note || "" });
    setEditId(inc.id); setShowForm(true);
  };

  const cancelEdit = () => { setForm(defaultForm()); setEditId(null); setShowForm(false); };

  const total = income.reduce((s, i) => s + i.amount, 0);

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 36, width: 140, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 200, marginBottom: 32 }} />
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Income</h1>
          <p className="text-sm">{fmt(total)} total this period</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (editId) cancelEdit(); }}>
          {showForm && !editId ? "Cancel" : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add income
            </>
          )}
        </button>
      </div>

      {/* Source breakdown */}
      <div className="grid grid-4" style={{ marginBottom: "var(--sp-5)" }}>
        {INCOME_SOURCES.map((src) => {
          const srcIncome = income.filter((i) => i.source === src.id).reduce((s, i) => s + i.amount, 0);
          if (!srcIncome) return null;
          return (
            <div key={src.id} className="card card-pad-sm" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "var(--r-md)",
                background: "var(--success-dim)", color: "var(--success)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{SOURCE_ICON[src.id]}</div>
              <div style={{ minWidth: 0 }}>
                <div className="text-xs">{src.label}</div>
                <div className="text-mono" style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{fmt(srcIncome)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-scale" style={{ marginBottom: "var(--sp-5)" }}>
          <h3 className="text-h3" style={{ marginBottom: "var(--sp-5)" }}>{editId ? "Edit income" : "New income"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3" style={{ marginBottom: "var(--sp-4)" }}>
              <div className="field">
                <label className="field-label">Source</label>
                <select className="select" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  {INCOME_SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Amount (₹)</label>
                <input className="input text-mono" type="number" placeholder="0.00" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="field">
                <label className="field-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
            </div>
            <div className="field" style={{ marginBottom: "var(--sp-5)" }}>
              <label className="field-label">Note (optional)</label>
              <input className="input" placeholder="e.g. June stipend" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" type="submit">{editId ? "Save changes" : "Add income"}</button>
              <button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {income.length > 0 ? (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {income.map((inc) => (
            <div key={inc.id} className="card card-hover" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "var(--r-md)",
                background: "var(--success-dim)", color: "var(--success)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{SOURCE_ICON[inc.source] || SOURCE_ICON.OTHER}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>{INCOME_SOURCES.find((s) => s.id === inc.source)?.label || inc.source}</div>
                <div className="text-xs" style={{ marginTop: 3 }}>{inc.date}{inc.note ? ` · ${inc.note}` : ""}</div>
              </div>
              <div className="text-mono" style={{ fontSize: "var(--fs-md)", fontWeight: 600, color: "var(--success)", flexShrink: 0 }}>
                +{fmt(inc.amount)}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(inc)} aria-label="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(inc.id)} aria-label="Delete" style={{ color: "var(--danger)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <div className="icon">💰</div>
          <div className="title">No income recorded</div>
          <div className="desc">Add your stipend, scholarship, or part-time earnings to track your cash flow.</div>
        </div>
      )}
    </div>
  );
}