import React, { useState, useMemo, useRef } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";
import {
  Plus, Trash2, Pencil, X, Home, Receipt, PiggyBank, Settings,
  ChevronLeft, ChevronRight, Search, ArrowUpRight, ArrowDownLeft,
  ArrowLeftRight, ShoppingBag, Zap, Car, Film, Heart, Wallet, Download, Upload,
} from "lucide-react";

const C = {
  bg: "#F2F4F1",
  card: "#FFFFFF",
  ink: "#16211D",
  soft: "#6C776E",
  faint: "#A6AFA3",
  line: "#E6E9E2",
  teal: "#0F5C4F",
  tealDeep: "#0B4239",
  gold: "#C99A44",
  green: "#2F7D5C",
  red: "#C0463A",
  redBg: "#F7E3E0",
  greenBg: "#E2EFE7",
  goldBg: "#F6EAD2",
};

const CATS = {
  Housing: { color: "#4A6670", icon: Home },
  Food: { color: "#C99A44", icon: ShoppingBag },
  Transport: { color: "#5C7A4C", icon: Car },
  Utilities: { color: "#3E8577", icon: Zap },
  Health: { color: "#C0463A", icon: Heart },
  Entertainment: { color: "#8A5A73", icon: Film },
  Shopping: { color: "#7A6A9C", icon: ShoppingBag },
  Other: { color: "#8C8A7E", icon: Wallet },
  Savings: { color: "#4C6FA8", icon: PiggyBank },
};
const CAT_LIST = Object.keys(CATS);

const BUCKET_ORDER = ["Needs", "Wants", "Savings"];
const BUCKETS = {
  Needs: { pct: 0.5, color: "#0F5C4F", bg: "#E2EFE7", categories: ["Housing", "Utilities", "Food", "Transport", "Health"] },
  Wants: { pct: 0.3, color: "#C99A44", bg: "#F6EAD2", categories: ["Entertainment", "Shopping", "Other"] },
  Savings: { pct: 0.2, color: "#4C6FA8", bg: "#E3E9F4", categories: ["Savings"] },
};
function bucketOf(cat) {
  return BUCKET_ORDER.find((b) => BUCKETS[b].categories.includes(cat)) || "Wants";
}

function fmtTHB(n) {
  return "\u0E3F" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtMMK(n) {
  return "K " + Math.round(n).toLocaleString("en-US");
}
function monthKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function shiftMonth(key, delta) {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function getRateFor(rates, dateStr) {
  const dates = Object.keys(rates).sort();
  if (!dates.length) return 775;
  let chosen = dates[0];
  for (const d of dates) { if (d <= dateStr) chosen = d; }
  return rates[chosen];
}
// Rate convention: rateValue = how many THB you get for 100,000 MMK.
function thbToMmk(thb, rateValue) { return rateValue > 0 ? (thb * 100000) / rateValue : 0; }
function mmkToThb(mmk, rateValue) { return (mmk * rateValue) / 100000; }

function seedTransactions() {
  const now = new Date();
  const mk = (o) => { const d = new Date(now); d.setDate(d.getDate() - o); return d.toISOString().slice(0, 10); };
  return [
    { id: "t1", date: mk(2), desc: "Monthly salary", category: "Income", type: "income", amount: 28000 },
    { id: "t2", date: mk(3), desc: "Room rent", category: "Housing", type: "expense", amount: 6500 },
    { id: "t3", date: mk(5), desc: "Groceries", category: "Food", type: "expense", amount: 640 },
    { id: "t4", date: mk(6), desc: "Motorbike taxi + BTS", category: "Transport", type: "expense", amount: 380 },
    { id: "t5", date: mk(8), desc: "Electric + water", category: "Utilities", type: "expense", amount: 950 },
    { id: "t6", date: mk(9), desc: "Money sent home", category: "Savings", type: "expense", amount: 8000 },
    { id: "t7", date: mk(11), desc: "Movie night", category: "Entertainment", type: "expense", amount: 260 },
    { id: "t8", date: mk(13), desc: "Pharmacy", category: "Health", type: "expense", amount: 180 },
    { id: "t9", date: mk(33), desc: "Monthly salary", category: "Income", type: "income", amount: 28000 },
    { id: "t10", date: mk(35), desc: "Room rent", category: "Housing", type: "expense", amount: 6500 },
    { id: "t11", date: mk(38), desc: "Groceries", category: "Food", type: "expense", amount: 710 },
    { id: "t12", date: mk(41), desc: "Money sent home", category: "Savings", type: "expense", amount: 7500 },
    { id: "t13", date: mk(63), desc: "Monthly salary", category: "Income", type: "income", amount: 28000 },
    { id: "t14", date: mk(65), desc: "Room rent", category: "Housing", type: "expense", amount: 6500 },
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function DualAmount({ thb, mmk, primary, size = "md", sign = "" }) {
  const mainVal = primary === "THB" ? fmtTHB(thb) : fmtMMK(mmk);
  const subVal = primary === "THB" ? fmtMMK(mmk) : fmtTHB(thb);
  const sizes = { lg: "text-3xl", md: "text-base", sm: "text-sm" };
  return (
    <span className="inline-flex flex-col items-end leading-tight">
      <span className={`font-mono ${sizes[size]}`}>{sign}{mainVal}</span>
      <span className="font-mono" style={{ color: C.faint, fontSize: 11 }}>{sign}{subVal}</span>
    </span>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      <Icon size={26} style={{ color: C.faint }} className="mb-2" />
      <p className="font-medium text-sm mb-1" style={{ color: C.ink }}>{title}</p>
      <p className="text-xs" style={{ color: C.soft }}>{body}</p>
    </div>
  );
}

function TxModal({ initial, primary, rates, onSave, onClose }) {
  const initAmt = initial ? (primary === "THB" ? initial.amount : thbToMmk(initial.amount, getRateFor(rates, initial.date))) : "";
  const [form, setForm] = useState(
    initial
      ? { ...initial, amount: initAmt, currency: primary, bucket: bucketOf(initial.category) }
      : { date: todayStr(), desc: "", category: "Food", type: "expense", amount: "", currency: primary, bucket: "Needs" }
  );
  const isIncome = form.type === "income";
  const activeRate = getRateFor(rates, form.date);

  function submit(e) {
    e.preventDefault();
    const n = Number(form.amount);
    if (!form.desc.trim() || !n || n <= 0) return;
    const thbAmount = form.currency === "THB" ? n : mmkToThb(n, activeRate);
    onSave({
      id: initial ? initial.id : `t${Date.now()}`,
      date: form.date, desc: form.desc, type: form.type,
      category: isIncome ? "Income" : form.category,
      amount: Math.round(thbAmount * 100) / 100,
    });
  }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50" style={{ background: "rgba(16,25,21,0.5)" }} onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-5 pb-6"
        style={{ background: C.card }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: C.ink }}>{initial ? "Edit entry" : "New entry"}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full" style={{ background: C.bg }}>
            <X size={16} style={{ color: C.soft }} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {["expense", "income"].map((t) => (
            <button type="button" key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
              className="flex-1 py-2 rounded-xl text-sm font-medium capitalize"
              style={{
                background: form.type === t ? (t === "income" ? C.greenBg : C.redBg) : C.bg,
                color: form.type === t ? (t === "income" ? C.green : C.red) : C.soft,
              }}>{t}</button>
          ))}
        </div>

        <label className="block text-xs font-medium mb-1" style={{ color: C.soft }}>Description</label>
        <input autoFocus value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
          placeholder="e.g. Groceries" className="w-full mb-3 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: C.bg, color: C.ink }} />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: C.soft }}>Amount</label>
            <div className="flex rounded-xl overflow-hidden" style={{ background: C.bg }}>
              <input type="number" inputMode="decimal" step="0.01" min="0" value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.00" className="w-full px-3 py-2.5 text-sm outline-none font-mono bg-transparent" style={{ color: C.ink }} />
              <button type="button"
                onClick={() => setForm((f) => ({ ...f, currency: f.currency === "THB" ? "MMK" : "THB" }))}
                className="px-2.5 text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                style={{ color: C.teal }}>
                {form.currency} <ArrowLeftRight size={11} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: C.soft }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: C.bg, color: C.ink }} />
          </div>
        </div>

        <p className="mb-3" style={{ color: C.faint, fontSize: 11 }}>
          Using 100,000 MMK = {activeRate} THB for {form.date}{!rates[form.date] ? " (carried from an earlier entry)" : ""}
        </p>

        {!isIncome && (
          <div className="mb-5">
            <label className="block text-xs font-medium mb-1" style={{ color: C.soft }}>Budget</label>
            <div className="flex gap-2 mb-3">
              {BUCKET_ORDER.map((b) => (
                <button type="button" key={b}
                  onClick={() => setForm((f) => ({ ...f, bucket: b, category: BUCKETS[b].categories[0] }))}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  style={{
                    background: form.bucket === b ? BUCKETS[b].bg : C.bg,
                    color: form.bucket === b ? BUCKETS[b].color : C.soft,
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: form.bucket === b ? BUCKETS[b].color : C.faint }} />
                  {b}
                </button>
              ))}
            </div>
            <label className="block text-xs font-medium mb-1" style={{ color: C.soft }}>Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: C.bg, color: C.ink }}>
              {BUCKETS[form.bucket].categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <button type="submit" className="w-full py-3 rounded-xl text-sm font-semibold"
          style={{ background: C.teal, color: "#fff" }}>{initial ? "Save changes" : "Add entry"}</button>
      </form>
    </div>
  );
}

function BalanceCard({ income, expense, savings, net, incomeMMK, expenseMMK, savingsMMK, netMMK, primary, setPrimary }) {
  return (
    <div className="rounded-3xl p-5 mb-5 relative overflow-hidden" style={{ background: C.teal }}>
      <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full" style={{ background: C.tealDeep, opacity: 0.5 }} />
      <div className="absolute -right-2 -bottom-16 w-32 h-32 rounded-full" style={{ background: C.tealDeep, opacity: 0.4 }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: "#BFE0D6" }}>Net balance</span>
          <button onClick={() => setPrimary((p) => (p === "THB" ? "MMK" : "THB"))}
            className="flex items-center gap-1 font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 11 }}>
            <ArrowLeftRight size={10} /> {primary}
          </button>
        </div>
        <p className="font-mono text-3xl font-medium mb-0.5" style={{ color: "#fff" }}>
          {net >= 0 ? "+" : "-"}{primary === "THB" ? fmtTHB(Math.abs(net)) : fmtMMK(Math.abs(netMMK))}
        </p>
        <p className="font-mono text-xs mb-4" style={{ color: "#9FC9BB" }}>
          {net >= 0 ? "+" : "-"}{primary === "THB" ? fmtMMK(Math.abs(netMMK)) : fmtTHB(Math.abs(net))}
        </p>
        <div className="flex gap-2">
          <div className="flex-1 min-w-0 rounded-2xl px-2.5 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-1 mb-1">
              <ArrowDownLeft size={11} style={{ color: "#9FE0C4" }} />
              <span style={{ color: "#BFE0D6", fontSize: 10 }}>Income</span>
            </div>
            <DualAmount thb={income} mmk={incomeMMK} primary={primary} size="sm" />
          </div>
          <div className="flex-1 min-w-0 rounded-2xl px-2.5 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-1 mb-1">
              <ArrowUpRight size={11} style={{ color: "#F0B7A8" }} />
              <span style={{ color: "#BFE0D6", fontSize: 10 }}>Expenses</span>
            </div>
            <DualAmount thb={expense} mmk={expenseMMK} primary={primary} size="sm" />
          </div>
          <div className="flex-1 min-w-0 rounded-2xl px-2.5 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-1 mb-1">
              <PiggyBank size={11} style={{ color: "#BFD0F0" }} />
              <span style={{ color: "#BFE0D6", fontSize: 10 }}>Savings</span>
            </div>
            <DualAmount thb={savings} mmk={savingsMMK} primary={primary} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TxRow({ t, rates, primary, onEdit, onDelete }) {
  const meta = CATS[t.category] || { color: C.faint, icon: Wallet };
  const Icon = meta.icon;
  const mmk = thbToMmk(t.amount, getRateFor(rates, t.date));
  return (
    <div className="flex items-center justify-between py-3 gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}1F` }}>
          {t.type === "income" ? <ArrowDownLeft size={15} style={{ color: C.green }} /> : <Icon size={15} style={{ color: meta.color }} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{t.desc}</p>
          <p style={{ color: C.soft, fontSize: 11 }}>{t.category} \u2022 {t.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <DualAmount thb={t.amount} mmk={mmk} primary={primary} size="sm" sign={t.type === "income" ? "+" : "-"} />
        {(onEdit || onDelete) && (
          <div className="flex ml-1">
            {onEdit && <button onClick={() => onEdit(t)} className="p-1.5"><Pencil size={13} style={{ color: C.faint }} /></button>}
            {onDelete && <button onClick={() => onDelete(t.id)} className="p-1.5"><Trash2 size={13} style={{ color: C.red }} /></button>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState(seedTransactions());
  const [view, setView] = useState("home");
  const [selectedMonth, setSelectedMonth] = useState(monthKey(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [rates, setRates] = useState({ [todayStr()]: 775 });
  const [primary, setPrimary] = useState("THB");
  const [splitPct, setSplitPct] = useState({ Needs: 50, Wants: 30, Savings: 20 });
  const [newRateDate, setNewRateDate] = useState(todayStr());
  const [newRateValue, setNewRateValue] = useState("");
  const fileInputRef = useRef(null);

  const monthTx = useMemo(() => transactions.filter((t) => t.date.slice(0, 7) === selectedMonth), [transactions, selectedMonth]);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const incomeMMK = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + thbToMmk(t.amount, getRateFor(rates, t.date)), 0);
  const expenseMMK = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + thbToMmk(t.amount, getRateFor(rates, t.date)), 0);
  const netMMK = incomeMMK - expenseMMK;
  const spendOnly = monthTx.filter((t) => t.type === "expense" && t.category !== "Savings").reduce((s, t) => s + t.amount, 0);
  const spendOnlyMMK = monthTx.filter((t) => t.type === "expense" && t.category !== "Savings").reduce((s, t) => s + thbToMmk(t.amount, getRateFor(rates, t.date)), 0);
  const savings = monthTx.filter((t) => t.type === "expense" && t.category === "Savings").reduce((s, t) => s + t.amount, 0);
  const savingsMMK = monthTx.filter((t) => t.type === "expense" && t.category === "Savings").reduce((s, t) => s + thbToMmk(t.amount, getRateFor(rates, t.date)), 0);

  const byCategory = useMemo(() => {
    const map = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => {
      if (!map[t.category]) map[t.category] = { thb: 0, mmk: 0 };
      map[t.category].thb += t.amount;
      map[t.category].mmk += thbToMmk(t.amount, getRateFor(rates, t.date));
    });
    return Object.entries(map).map(([name, v]) => ({ name, value: v.thb, mmk: v.mmk }));
  }, [monthTx, rates]);

  const trend = useMemo(() => {
    const months = []; let k = selectedMonth;
    for (let i = 0; i < 5; i++) { months.unshift(k); k = shiftMonth(k, -1); }
    return months.map((key) => {
      const tx = transactions.filter((t) => t.date.slice(0, 7) === key);
      const isSpend = (t) => t.type === "expense" && t.category !== "Savings";
      const isSave = (t) => t.type === "expense" && t.category === "Savings";
      return {
        month: monthLabel(key).split(" ")[0].slice(0, 3),
        Income: tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Expenses: tx.filter(isSpend).reduce((s, t) => s + t.amount, 0),
        Savings: tx.filter(isSave).reduce((s, t) => s + t.amount, 0),
        IncomeMMK: tx.filter((t) => t.type === "income").reduce((s, t) => s + thbToMmk(t.amount, getRateFor(rates, t.date)), 0),
        ExpensesMMK: tx.filter(isSpend).reduce((s, t) => s + thbToMmk(t.amount, getRateFor(rates, t.date)), 0),
        SavingsMMK: tx.filter(isSave).reduce((s, t) => s + thbToMmk(t.amount, getRateFor(rates, t.date)), 0),
      };
    });
  }, [transactions, selectedMonth, rates]);

  function saveTx(tx) {
    setTransactions((prev) => (prev.some((t) => t.id === tx.id) ? prev.map((t) => (t.id === tx.id ? tx : t)) : [tx, ...prev]));
    setModalOpen(false); setEditing(null);
  }
  function deleteTx(id) { setTransactions((prev) => prev.filter((t) => t.id !== id)); }

  function addRate() {
    const v = Number(newRateValue);
    if (!newRateDate || !v || v <= 0) return;
    setRates((r) => ({ ...r, [newRateDate]: v }));
    setNewRateValue("");
  }
  function updateRate(date, value) {
    const v = Number(value) || 0;
    setRates((r) => ({ ...r, [date]: v }));
  }
  function deleteRate(date) {
    setRates((r) => { const copy = { ...r }; delete copy[date]; return copy; });
  }

  function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function exportCSV() {
    const header = ["Date", "Description", "Type", "Category", "Amount (THB)"];
    const rows = [...transactions]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((t) => [t.date, `"${t.desc.replace(/"/g, '""')}"`, t.type, t.category, t.amount]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile(csv, `transactions-${todayStr()}.csv`, "text/csv");
  }
  function exportJSON() {
    const data = { exportedAt: new Date().toISOString(), primary, splitPct, rates, transactions };
    downloadFile(JSON.stringify(data, null, 2), `finance-tracker-backup-${todayStr()}.json`, "application/json");
  }
  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (data.rates && typeof data.rates === "object") setRates(data.rates);
        if (data.splitPct && typeof data.splitPct === "object") setSplitPct(data.splitPct);
        if (data.primary === "THB" || data.primary === "MMK") setPrimary(data.primary);
      } catch (err) {
        alert("Couldn't read that file \u2014 make sure it's a backup exported from this app.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  function clearAllData() {
    const ok = window.confirm("Clear all transactions, exchange rates, and budget settings? This can't be undone \u2014 export a backup first if you want to keep it.");
    if (!ok) return;
    setTransactions([]);
    setRates({ [todayStr()]: 775 });
    setSplitPct({ Needs: 50, Wants: 30, Savings: 20 });
    setPrimary("THB");
    setSelectedMonth(monthKey(new Date()));
  }

  const filteredTx = useMemo(() => transactions
    .filter((t) => (filterCat === "All" ? true : t.category === filterCat))
    .filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.date < b.date ? 1 : -1)), [transactions, filterCat, search]);

  const totalPct = splitPct.Needs + splitPct.Wants + splitPct.Savings;
  const bucketRows = BUCKET_ORDER.map((b) => {
    const meta = BUCKETS[b];
    const target = income * ((splitPct[b] || 0) / 100);
    const targetMMK = incomeMMK * ((splitPct[b] || 0) / 100);
    const cats = meta.categories.map((cat) => {
      const catTx = monthTx.filter((t) => t.type === "expense" && t.category === cat);
      return {
        cat,
        spent: catTx.reduce((s, t) => s + t.amount, 0),
        spentMMK: catTx.reduce((s, t) => s + thbToMmk(t.amount, getRateFor(rates, t.date)), 0),
      };
    });
    const spent = cats.reduce((s, c) => s + c.spent, 0);
    const spentMMK = cats.reduce((s, c) => s + c.spentMMK, 0);
    const pct = target > 0 ? Math.min(140, (spent / target) * 100) : 0;
    return { bucket: b, meta, target, targetMMK, spent, spentMMK, pct, cats: cats.filter((c) => c.spent > 0 || meta.categories.length <= 3) };
  });

  const NavBtn = ({ id, icon: Icon, label }) => (
    <button onClick={() => setView(id)} className="flex flex-col items-center gap-1 py-2 flex-1">
      <Icon size={20} style={{ color: view === id ? C.teal : C.faint }} strokeWidth={view === id ? 2.4 : 2} />
      <span className="font-medium" style={{ color: view === id ? C.teal : C.faint, fontSize: 10 }}>{label}</span>
    </button>
  );

  return (
    <div className="w-full flex justify-center" style={{ background: C.bg, fontFamily: "var(--font-body)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .fapp { --font-body: 'Inter', sans-serif; }
        .fapp .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .fapp input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @media (max-width: 640px) {
          .fapp input, .fapp select { font-size: 16px; }
        }
      `}</style>
      <div className="fapp relative w-full sm:my-6 sm:shadow-xl overflow-hidden" style={{ background: C.bg, height: "min(880px, 100dvh)", maxWidth: 420, borderRadius: 32 }}>
        <div className="h-full overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>

          {view === "home" && (
            <div className="px-4 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs" style={{ color: C.soft }}>Good day</p>
                  <h1 className="text-lg font-semibold" style={{ color: C.ink }}>Your finances</h1>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))} className="p-1.5 rounded-full" style={{ background: C.card }}><ChevronLeft size={15} style={{ color: C.ink }} /></button>
                  <span className="text-xs font-medium px-1" style={{ color: C.ink }}>{monthLabel(selectedMonth).split(" ")[0].slice(0, 3)} {monthLabel(selectedMonth).split(" ")[1]}</span>
                  <button onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))} className="p-1.5 rounded-full" style={{ background: C.card }}><ChevronRight size={15} style={{ color: C.ink }} /></button>
                </div>
              </div>

              <BalanceCard income={income} expense={spendOnly} savings={savings} net={net} incomeMMK={incomeMMK} expenseMMK={spendOnlyMMK} savingsMMK={savingsMMK} netMMK={netMMK} primary={primary} setPrimary={setPrimary} />

              <div className="rounded-2xl p-4 mb-4" style={{ background: C.card }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Spending by category</h3>
                {byCategory.length === 0 ? (
                  <EmptyState icon={PiggyBank} title="No expenses yet" body="Add an entry to see the breakdown." />
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={110} height={110}>
                      <PieChart>
                        <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={34} outerRadius={52} paddingAngle={2}>
                          {byCategory.map((e) => <Cell key={e.name} fill={CATS[e.name]?.color || C.faint} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 flex flex-col gap-1.5">
                      {byCategory.sort((a, b) => b.value - a.value).slice(0, 4).map((e) => (
                        <div key={e.name} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5" style={{ color: C.soft }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: CATS[e.name]?.color }} />{e.name}
                          </span>
                          <span className="font-mono" style={{ color: C.ink }}>{primary === "THB" ? fmtTHB(e.value) : fmtMMK(e.mmk)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-4 mb-4" style={{ background: C.card }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: C.ink }}>5 month trend</h3>
                  <div className="flex items-center gap-3">
                    {[["Income", C.teal], ["Expenses", C.red], ["Savings", BUCKETS.Savings.color]].map(([label, color]) => (
                      <span key={label} className="flex items-center gap-1" style={{ color: C.soft, fontSize: 10 }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} /> {label}
                      </span>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.soft }} axisLine={{ stroke: C.line }} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v, name, props) => (primary === "THB" ? fmtTHB(v) : fmtMMK(props.payload[name + "MMK"]))} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.line}` }} />
                    <Bar dataKey="Income" fill={C.teal} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Expenses" fill={C.red} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Savings" fill={BUCKETS.Savings.color} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl p-4" style={{ background: C.card }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold" style={{ color: C.ink }}>Recent</h3>
                  <button onClick={() => setView("transactions")} className="text-xs font-medium" style={{ color: C.teal }}>See all</button>
                </div>
                {monthTx.slice(0, 5).map((t) => <TxRow key={t.id} t={t} rates={rates} primary={primary} />)}
                {monthTx.length === 0 && <EmptyState icon={Receipt} title="Nothing this month" body="Tap + to add your first entry." />}
              </div>
            </div>
          )}

          {view === "transactions" && (
            <div className="px-4 pt-6">
              <h1 className="text-lg font-semibold mb-4" style={{ color: C.ink }}>Transactions</h1>
              <div className="flex gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-0" style={{ background: C.card }}>
                  <Search size={14} style={{ color: C.faint }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search"
                    className="bg-transparent text-sm outline-none flex-1 min-w-0" style={{ color: C.ink }} />
                </div>
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
                  className="px-2.5 py-2.5 rounded-xl text-xs outline-none flex-shrink-0" style={{ background: C.card, color: C.ink }}>
                  <option>All</option><option>Income</option>
                  {CAT_LIST.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="rounded-2xl px-4" style={{ background: C.card }}>
                {filteredTx.length === 0 ? (
                  <EmptyState icon={Search} title="No matches" body="Try a different search or filter." />
                ) : filteredTx.map((t) => (
                  <TxRow key={t.id} t={t} rates={rates} primary={primary}
                    onEdit={(tx) => { setEditing(tx); setModalOpen(true); }} onDelete={deleteTx} />
                ))}
              </div>
            </div>
          )}

          {view === "budgets" && (
            <div className="px-4 pt-6">
              <h1 className="text-lg font-semibold mb-1" style={{ color: C.ink }}>50/30/20 Budget</h1>
              <p className="text-xs mb-4" style={{ color: C.soft }}>
                {monthLabel(selectedMonth)}
                {income > 0
                  ? <> \u2022 split from {primary === "THB" ? fmtTHB(income) : fmtMMK(incomeMMK)} income</>
                  : <> \u2022 log this month's salary to see your targets</>}
              </p>

              <div className="rounded-2xl p-4 mb-4" style={{ background: C.card }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: C.ink }}>Your split</span>
                  <button onClick={() => setSplitPct({ Needs: 50, Wants: 30, Savings: 20 })}
                    className="font-medium" style={{ color: C.teal, fontSize: 12 }}>Reset to 50/30/20</button>
                </div>
                <div className="flex gap-2">
                  {BUCKET_ORDER.map((b) => (
                    <div key={b} className="flex-1 min-w-0">
                      <label className="flex items-center gap-1 mb-1" style={{ color: C.soft, fontSize: 11 }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BUCKETS[b].color }} />
                        <span className="truncate">{b}</span>
                      </label>
                      <div className="flex items-center rounded-xl overflow-hidden" style={{ background: C.bg }}>
                        <input
                          type="number" inputMode="numeric" min="0" max="100"
                          value={splitPct[b]}
                          onChange={(e) => {
                            const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                            setSplitPct((s) => ({ ...s, [b]: v }));
                          }}
                          className="w-full min-w-0 pl-2 py-2 text-sm font-mono outline-none bg-transparent text-right"
                          style={{ color: C.ink }}
                        />
                        <span className="pr-2 font-mono flex-shrink-0" style={{ color: C.faint, fontSize: 12 }}>%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2" style={{ fontSize: 11, color: totalPct === 100 ? C.green : C.gold }}>
                  Total: {totalPct}%{totalPct !== 100 ? " \u2014 doesn't add up to 100% yet" : ""}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {bucketRows.map((row) => {
                  const remaining = row.target - row.spent;
                  const remainingMMK = row.targetMMK - row.spentMMK;
                  const over = remaining < 0;
                  const barColor = over ? C.red : row.pct > 85 ? C.gold : row.meta.color;
                  return (
                    <div key={row.bucket} className="rounded-2xl p-4" style={{ background: C.card }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: C.ink }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: row.meta.color }} />
                          {row.bucket}
                        </span>
                        <span className="font-semibold px-2 py-0.5 rounded-full" style={{ background: row.meta.bg, color: row.meta.color, fontSize: 11 }}>
                          {splitPct[row.bucket]}%
                        </span>
                      </div>

                      <div className="flex items-end justify-between mb-1">
                        <div>
                          <p style={{ color: C.soft, fontSize: 11 }}>{over ? "Over by" : "Remaining"}</p>
                          <span style={{ color: over ? C.red : C.ink }}>
                            <DualAmount thb={Math.abs(remaining)} mmk={Math.abs(remainingMMK)} primary={primary} size="lg" />
                          </span>
                        </div>
                        <div className="text-right">
                          <p style={{ color: C.soft, fontSize: 11 }}>Target</p>
                          <p className="font-mono text-sm" style={{ color: C.ink }}>
                            {primary === "THB" ? fmtTHB(row.target) : fmtMMK(row.targetMMK)}
                          </p>
                        </div>
                      </div>

                      <div className="h-1.5 rounded-full overflow-hidden mb-1 mt-2" style={{ background: C.line }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.pct)}%`, background: barColor }} />
                      </div>
                      <p style={{ color: C.faint, fontSize: 11 }}>
                        Spent {primary === "THB" ? fmtTHB(row.spent) : fmtMMK(row.spentMMK)} of {primary === "THB" ? fmtTHB(row.target) : fmtMMK(row.targetMMK)}
                      </p>

                      {row.cats.length > 0 && (
                        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
                          {row.cats.map((c) => {
                            const Icon = CATS[c.cat].icon;
                            return (
                              <div key={c.cat} className="flex items-center justify-between py-1">
                                <span className="flex items-center gap-2" style={{ color: C.soft, fontSize: 12 }}>
                                  <Icon size={12} style={{ color: CATS[c.cat].color }} /> {c.cat}
                                </span>
                                <span className="font-mono" style={{ color: C.ink, fontSize: 12 }}>
                                  {primary === "THB" ? fmtTHB(c.spent) : fmtMMK(c.spentMMK)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "settings" && (
            <div className="px-4 pt-6">
              <h1 className="text-lg font-semibold mb-4" style={{ color: C.ink }}>Currency</h1>
              <div className="rounded-2xl p-4 mb-4" style={{ background: C.card }}>
                <p className="text-xs font-medium mb-2" style={{ color: C.soft }}>Primary display currency</p>
                <div className="flex gap-2">
                  {["THB", "MMK"].map((c) => (
                    <button key={c} onClick={() => setPrimary(c)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: primary === c ? C.teal : C.bg, color: primary === c ? "#fff" : C.soft }}>
                      {c === "THB" ? "\u0E3F Thai baht" : "K Myanmar kyat"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4 mb-4" style={{ background: C.card }}>
                <p className="text-sm font-semibold mb-1" style={{ color: C.ink }}>Daily exchange rates</p>
                <p className="mb-3" style={{ color: C.faint, fontSize: 11 }}>
                  No reliable official rate feed, so set it by hand for each day. A day with no entry uses the closest earlier rate you set.
                </p>

                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-1 min-w-0">
                    <label className="block mb-1" style={{ color: C.soft, fontSize: 11 }}>Date</label>
                    <input type="date" value={newRateDate} onChange={(e) => setNewRateDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl text-sm outline-none" style={{ background: C.bg, color: C.ink }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block mb-1" style={{ color: C.soft, fontSize: 11 }}>100,000 MMK =</label>
                    <input type="number" inputMode="decimal" step="0.01" placeholder="THB" value={newRateValue}
                      onChange={(e) => setNewRateValue(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl text-sm font-mono outline-none" style={{ background: C.bg, color: C.ink }} />
                  </div>
                  <button onClick={addRate} className="p-2.5 rounded-xl flex-shrink-0" style={{ background: C.teal }}>
                    <Plus size={16} style={{ color: "#fff" }} />
                  </button>
                </div>

                {Object.keys(rates).length === 0 ? (
                  <EmptyState icon={ArrowLeftRight} title="No rates set" body="Add today's rate above to get started." />
                ) : (
                  Object.keys(rates).sort().reverse().map((d) => (
                    <div key={d} className="flex items-center justify-between py-2" style={{ borderTop: `1px solid ${C.line}` }}>
                      <span className="text-sm" style={{ color: C.ink }}>{d}{d === todayStr() ? " (today)" : ""}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono" style={{ color: C.faint, fontSize: 11 }}>100k =</span>
                        <div className="flex items-center rounded-lg overflow-hidden" style={{ background: C.bg }}>
                          <input type="number" inputMode="decimal" step="0.01" value={rates[d]}
                            onChange={(e) => updateRate(d, e.target.value)}
                            className="w-16 px-2 py-1.5 text-sm font-mono outline-none text-right bg-transparent" style={{ color: C.ink }} />
                          <span className="pr-2 font-mono" style={{ color: C.faint, fontSize: 11 }}>THB</span>
                        </div>
                        <button onClick={() => deleteRate(d)} className="p-1"><Trash2 size={14} style={{ color: C.red }} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl p-4 mb-4" style={{ background: C.card }}>
                <p className="text-sm font-semibold mb-1" style={{ color: C.ink }}>Your data</p>
                <p className="mb-3" style={{ color: C.faint, fontSize: 11 }}>
                  Everything here lives only in this browser tab and resets on refresh. Export a backup to keep it, or import one to pick up where you left off.
                </p>
                <div className="flex flex-col gap-2">
                  <button onClick={exportJSON}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: C.bg, color: C.ink }}>
                    <span className="flex items-center gap-2"><Download size={15} style={{ color: C.teal }} /> Export full backup (JSON)</span>
                  </button>
                  <button onClick={exportCSV}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: C.bg, color: C.ink }}>
                    <span className="flex items-center gap-2"><Download size={15} style={{ color: C.teal }} /> Export transactions (CSV)</span>
                  </button>
                  <button onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: C.bg, color: C.ink }}>
                    <span className="flex items-center gap-2"><Upload size={15} style={{ color: C.teal }} /> Import backup (JSON)</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="application/json" onChange={importJSON} className="hidden" />
                </div>
              </div>

              <div className="rounded-2xl p-4 mb-4" style={{ background: C.redBg }}>
                <p className="text-sm font-semibold mb-1" style={{ color: C.red }}>Start fresh</p>
                <p className="mb-3" style={{ color: C.red, opacity: 0.8, fontSize: 11 }}>
                  Wipes every transaction, rate, and budget setting back to a blank slate. Export a backup first if you might want it later.
                </p>
                <button onClick={clearAllData}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold" style={{ background: C.red, color: "#fff" }}>
                  <Trash2 size={15} /> Clear all data
                </button>
              </div>

              <div className="rounded-2xl p-4" style={{ background: C.card }}>
                <p className="text-xs font-medium mb-1" style={{ color: C.soft }}>About this app</p>
                <p className="text-xs leading-relaxed" style={{ color: C.faint }}>
                  Export regularly if you want to keep your history \u2014 nothing is saved automatically between sessions.
                </p>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center shadow-lg"
          style={{ bottom: 46, width: 52, height: 52, background: C.teal, border: `4px solid ${C.bg}` }}>
          <Plus size={22} style={{ color: "#fff" }} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 flex items-stretch px-2" style={{ background: C.card, borderTop: `1px solid ${C.line}` }}>
          <NavBtn id="home" icon={Home} label="Home" />
          <NavBtn id="transactions" icon={Receipt} label="History" />
          <div className="flex-1" />
          <NavBtn id="budgets" icon={PiggyBank} label="Budgets" />
          <NavBtn id="settings" icon={Settings} label="Currency" />
        </div>

        {modalOpen && (
          <TxModal initial={editing} primary={primary} rates={rates}
            onSave={saveTx} onClose={() => { setModalOpen(false); setEditing(null); }} />
        )}
      </div>
    </div>
  );
}
