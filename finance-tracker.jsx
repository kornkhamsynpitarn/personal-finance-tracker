import React, { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";
import {
  Plus, Trash2, Pencil, X, Home, Receipt, PiggyBank, Settings,
  ChevronLeft, ChevronRight, Search, ArrowUpRight, ArrowDownLeft,
  ArrowLeftRight, ShoppingBag, Zap, Car, Film, HeartPulse, House, Wallet,
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
  Housing: { color: "#4A6670", icon: House },
  Food: { color: "#C99A44", icon: ShoppingBag },
  Transport: { color: "#5C7A4C", icon: Car },
  Entertainment: { color: "#8A5A73", icon: Film },
  Health: { color: "#C0463A", icon: HeartPulse },
  Shopping: { color: "#7A6A9C", icon: ShoppingBag },
  Utilities: { color: "#3E8577", icon: Zap },
  Other: { color: "#8C8A7E", icon: Wallet },
};
const CAT_LIST = Object.keys(CATS);

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

function seedTransactions() {
  const now = new Date();
  const mk = (o) => { const d = new Date(now); d.setDate(d.getDate() - o); return d.toISOString().slice(0, 10); };
  return [
    { id: "t1", date: mk(2), desc: "Monthly salary", category: "Income", type: "income", amount: 28000 },
    { id: "t2", date: mk(3), desc: "Room rent", category: "Housing", type: "expense", amount: 6500 },
    { id: "t3", date: mk(5), desc: "Groceries", category: "Food", type: "expense", amount: 640 },
    { id: "t4", date: mk(6), desc: "Motorbike taxi + BTS", category: "Transport", type: "expense", amount: 380 },
    { id: "t5", date: mk(8), desc: "Electric + water", category: "Utilities", type: "expense", amount: 950 },
    { id: "t6", date: mk(9), desc: "Money sent home", category: "Other", type: "expense", amount: 8000 },
    { id: "t7", date: mk(11), desc: "Movie night", category: "Entertainment", type: "expense", amount: 260 },
    { id: "t8", date: mk(13), desc: "Pharmacy", category: "Health", type: "expense", amount: 180 },
    { id: "t9", date: mk(33), desc: "Monthly salary", category: "Income", type: "income", amount: 28000 },
    { id: "t10", date: mk(35), desc: "Room rent", category: "Housing", type: "expense", amount: 6500 },
    { id: "t11", date: mk(38), desc: "Groceries", category: "Food", type: "expense", amount: 710 },
    { id: "t12", date: mk(41), desc: "Money sent home", category: "Other", type: "expense", amount: 7500 },
    { id: "t13", date: mk(63), desc: "Monthly salary", category: "Income", type: "income", amount: 28000 },
    { id: "t14", date: mk(65), desc: "Room rent", category: "Housing", type: "expense", amount: 6500 },
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function DualAmount({ thb, rate, primary, size = "md", sign = "" }) {
  const mainVal = primary === "THB" ? fmtTHB(thb) : fmtMMK(thb * rate);
  const subVal = primary === "THB" ? fmtMMK(thb * rate) : fmtTHB(thb);
  const sizes = { lg: "text-3xl", md: "text-base", sm: "text-sm" };
  return (
    <span className="inline-flex flex-col items-end leading-tight">
      <span className={`font-mono ${sizes[size]}`}>{sign}{mainVal}</span>
      <span className="font-mono text-[11px]" style={{ color: C.faint }}>{sign}{subVal}</span>
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

function TxModal({ initial, primary, rate, onSave, onClose }) {
  const initAmt = initial ? (primary === "THB" ? initial.amount : initial.amount * rate) : "";
  const [form, setForm] = useState(
    initial
      ? { ...initial, amount: initAmt, currency: primary }
      : { date: new Date().toISOString().slice(0, 10), desc: "", category: "Food", type: "expense", amount: "", currency: primary }
  );
  const isIncome = form.type === "income";

  function submit(e) {
    e.preventDefault();
    const n = Number(form.amount);
    if (!form.desc.trim() || !n || n <= 0) return;
    const thbAmount = form.currency === "THB" ? n : n / rate;
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
              <input type="number" step="0.01" min="0" value={form.amount}
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

        {!isIncome && (
          <div className="mb-5">
            <label className="block text-xs font-medium mb-1" style={{ color: C.soft }}>Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: C.bg, color: C.ink }}>
              {CAT_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <button type="submit" className="w-full py-3 rounded-xl text-sm font-semibold"
          style={{ background: C.teal, color: "#fff" }}>{initial ? "Save changes" : "Add entry"}</button>
      </form>
    </div>
  );
}

function BalanceCard({ income, expense, net, rate, primary, setPrimary }) {
  return (
    <div className="rounded-3xl p-5 mb-5 relative overflow-hidden" style={{ background: C.teal }}>
      <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full" style={{ background: C.tealDeep, opacity: 0.5 }} />
      <div className="absolute -right-2 -bottom-16 w-32 h-32 rounded-full" style={{ background: C.tealDeep, opacity: 0.4 }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: "#BFE0D6" }}>Net balance</span>
          <button onClick={() => setPrimary((p) => (p === "THB" ? "MMK" : "THB"))}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
            <ArrowLeftRight size={10} /> {primary}
          </button>
        </div>
        <p className="font-mono text-3xl font-medium mb-0.5" style={{ color: "#fff" }}>
          {net >= 0 ? "+" : "-"}{primary === "THB" ? fmtTHB(Math.abs(net)) : fmtMMK(Math.abs(net) * rate)}
        </p>
        <p className="font-mono text-xs mb-4" style={{ color: "#9FC9BB" }}>
          {net >= 0 ? "+" : "-"}{primary === "THB" ? fmtMMK(Math.abs(net) * rate) : fmtTHB(Math.abs(net))}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownLeft size={12} style={{ color: "#9FE0C4" }} />
              <span className="text-[11px]" style={{ color: "#BFE0D6" }}>Income</span>
            </div>
            <DualAmount thb={income} rate={rate} primary={primary} size="sm" />
          </div>
          <div className="flex-1 rounded-2xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpRight size={12} style={{ color: "#F0B7A8" }} />
              <span className="text-[11px]" style={{ color: "#BFE0D6" }}>Expenses</span>
            </div>
            <DualAmount thb={expense} rate={rate} primary={primary} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TxRow({ t, rate, primary, onEdit, onDelete }) {
  const meta = CATS[t.category] || { color: C.faint, icon: Wallet };
  const Icon = meta.icon;
  return (
    <div className="flex items-center justify-between py-3 gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}1F` }}>
          {t.type === "income" ? <ArrowDownLeft size={15} style={{ color: C.green }} /> : <Icon size={15} style={{ color: meta.color }} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{t.desc}</p>
          <p className="text-[11px]" style={{ color: C.soft }}>{t.category} \u2022 {t.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <DualAmount thb={t.amount} rate={rate} primary={primary} size="sm" sign={t.type === "income" ? "+" : "-"} />
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
  const [budgets, setBudgets] = useState({ Housing: 6500, Food: 4000, Transport: 1500, Entertainment: 800, Health: 800, Shopping: 1000, Utilities: 1200, Other: 8000 });
  const [view, setView] = useState("home");
  const [selectedMonth, setSelectedMonth] = useState(monthKey(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [rate, setRate] = useState(63);
  const [primary, setPrimary] = useState("THB");

  const monthTx = useMemo(() => transactions.filter((t) => t.date.slice(0, 7) === selectedMonth), [transactions, selectedMonth]);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const byCategory = useMemo(() => {
    const map = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [monthTx]);

  const trend = useMemo(() => {
    const months = []; let k = selectedMonth;
    for (let i = 0; i < 5; i++) { months.unshift(k); k = shiftMonth(k, -1); }
    return months.map((key) => {
      const tx = transactions.filter((t) => t.date.slice(0, 7) === key);
      return {
        month: monthLabel(key).split(" ")[0].slice(0, 3),
        Income: tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Expenses: tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions, selectedMonth]);

  function saveTx(tx) {
    setTransactions((prev) => (prev.some((t) => t.id === tx.id) ? prev.map((t) => (t.id === tx.id ? tx : t)) : [tx, ...prev]));
    setModalOpen(false); setEditing(null);
  }
  function deleteTx(id) { setTransactions((prev) => prev.filter((t) => t.id !== id)); }

  const filteredTx = useMemo(() => transactions
    .filter((t) => (filterCat === "All" ? true : t.category === filterCat))
    .filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.date < b.date ? 1 : -1)), [transactions, filterCat, search]);

  const budgetRows = CAT_LIST.map((cat) => {
    const spent = monthTx.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0);
    const limit = budgets[cat] || 0;
    const pct = limit > 0 ? Math.min(140, (spent / limit) * 100) : 0;
    return { cat, spent, limit, pct };
  });

  const NavBtn = ({ id, icon: Icon, label }) => (
    <button onClick={() => setView(id)} className="flex flex-col items-center gap-1 py-2 flex-1">
      <Icon size={20} style={{ color: view === id ? C.teal : C.faint }} strokeWidth={view === id ? 2.4 : 2} />
      <span className="text-[10px] font-medium" style={{ color: view === id ? C.teal : C.faint }}>{label}</span>
    </button>
  );

  return (
    <div className="w-full flex justify-center" style={{ background: C.bg, fontFamily: "var(--font-body)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .fapp { --font-body: 'Inter', sans-serif; }
        .fapp .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .fapp input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
      <div className="fapp relative w-full sm:max-w-[420px] sm:my-6 sm:rounded-[32px] sm:shadow-xl overflow-hidden" style={{ background: C.bg, height: "min(880px, 100dvh)" }}>
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

              <BalanceCard income={income} expense={expense} net={net} rate={rate} primary={primary} setPrimary={setPrimary} />

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
                          <span className="font-mono" style={{ color: C.ink }}>{primary === "THB" ? fmtTHB(e.value) : fmtMMK(e.value * rate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-4 mb-4" style={{ background: C.card }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: C.ink }}>5 month trend</h3>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.soft }} axisLine={{ stroke: C.line }} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => (primary === "THB" ? fmtTHB(v) : fmtMMK(v * rate))} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.line}` }} />
                    <Bar dataKey="Income" fill={C.teal} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Expenses" fill={C.red} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl p-4" style={{ background: C.card }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold" style={{ color: C.ink }}>Recent</h3>
                  <button onClick={() => setView("transactions")} className="text-xs font-medium" style={{ color: C.teal }}>See all</button>
                </div>
                {monthTx.slice(0, 5).map((t) => <TxRow key={t.id} t={t} rate={rate} primary={primary} />)}
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
                  <TxRow key={t.id} t={t} rate={rate} primary={primary}
                    onEdit={(tx) => { setEditing(tx); setModalOpen(true); }} onDelete={deleteTx} />
                ))}
              </div>
            </div>
          )}

          {view === "budgets" && (
            <div className="px-4 pt-6">
              <h1 className="text-lg font-semibold mb-1" style={{ color: C.ink }}>Budgets</h1>
              <p className="text-xs mb-4" style={{ color: C.soft }}>{monthLabel(selectedMonth)} \u2022 limits set in {primary}</p>
              <div className="rounded-2xl px-4" style={{ background: C.card }}>
                {budgetRows.map((row) => {
                  const over = row.spent > row.limit && row.limit > 0;
                  const barColor = over ? C.red : row.pct > 85 ? C.gold : C.teal;
                  const Icon = CATS[row.cat].icon;
                  const limitDisplay = primary === "THB" ? row.limit : Math.round(row.limit * rate);
                  return (
                    <div key={row.cat} className="py-3.5" style={{ borderTop: `1px solid ${C.line}` }}>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${CATS[row.cat].color}1F` }}>
                            <Icon size={14} style={{ color: CATS[row.cat].color }} />
                          </div>
                          <span className="text-sm font-medium truncate" style={{ color: C.ink }}>{row.cat}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
                          <span className="font-mono" style={{ color: over ? C.red : C.ink }}>
                            {primary === "THB" ? fmtTHB(row.spent) : fmtMMK(row.spent * rate)}
                          </span>
                          <span style={{ color: C.faint }}>/</span>
                          <input type="number" value={limitDisplay}
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0;
                              const thbVal = primary === "THB" ? v : v / rate;
                              setBudgets((b) => ({ ...b, [row.cat]: thbVal }));
                            }}
                            className="w-16 px-1.5 py-1 rounded-lg text-xs font-mono outline-none text-right"
                            style={{ background: C.bg, color: C.ink }} />
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.line }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.pct)}%`, background: barColor }} />
                      </div>
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
                <div className="flex gap-2 mb-4">
                  {["THB", "MMK"].map((c) => (
                    <button key={c} onClick={() => setPrimary(c)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: primary === c ? C.teal : C.bg, color: primary === c ? "#fff" : C.soft }}>
                      {c === "THB" ? "\u0E3F Thai baht" : "K Myanmar kyat"}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-medium mb-2" style={{ color: C.soft }}>Exchange rate</p>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: C.bg }}>
                  <span className="text-sm font-mono" style={{ color: C.ink }}>1 THB =</span>
                  <input type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)}
                    className="flex-1 bg-transparent text-sm font-mono outline-none" style={{ color: C.ink }} />
                  <span className="text-sm font-mono" style={{ color: C.ink }}>MMK</span>
                </div>
                <p className="text-[11px] mt-2" style={{ color: C.faint }}>All entries are stored in THB and converted automatically. Update the rate any time \u2014 it drifts often.</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: C.card }}>
                <p className="text-xs font-medium mb-1" style={{ color: C.soft }}>About this app</p>
                <p className="text-xs leading-relaxed" style={{ color: C.faint }}>
                  Data lives only in this browser session and resets on refresh. Ask to add export or persistent storage if you'd like your data to be saved long term.
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
          <TxModal initial={editing} primary={primary} rate={rate}
            onSave={saveTx} onClose={() => { setModalOpen(false); setEditing(null); }} />
        )}
      </div>
    </div>
  );
}
