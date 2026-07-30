import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { Wallet } from "lucide-react";

const C = {
  bg: "#F2F4F1",
  card: "#FFFFFF",
  ink: "#16211D",
  soft: "#6C776E",
  faint: "#A6AFA3",
  line: "#E6E9E2",
  teal: "#0F5C4F",
  red: "#C0463A",
  redBg: "#F7E3E0",
};

export default function Auth() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setNotice("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl p-6" style={{ background: C.card, fontFamily: "Inter, sans-serif" }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.teal }}>
            <Wallet size={18} style={{ color: "#fff" }} />
          </div>
          <div>
            <p className="text-base font-semibold" style={{ color: C.ink }}>Finance Tracker</p>
            <p className="text-xs" style={{ color: C.soft }}>{mode === "signin" ? "Sign in to your account" : "Create an account"}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-3 py-2 mb-4 text-xs" style={{ background: C.redBg, color: C.red }}>{error}</div>
        )}
        {notice && (
          <div className="rounded-xl px-3 py-2 mb-4 text-xs" style={{ background: "#E2EFE7", color: C.teal }}>{notice}</div>
        )}

        <label className="block text-xs font-medium mb-1" style={{ color: C.soft }}>Email</label>
        <input
          type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" autoComplete="email"
          className="w-full mb-3 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: C.bg, color: C.ink }}
        />

        <label className="block text-xs font-medium mb-1" style={{ color: C.soft }}>Password</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "At least 6 characters" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="w-full mb-5 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: C.bg, color: C.ink }}
        />

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold mb-3" style={{ background: C.teal, color: "#fff", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Please wait\u2026" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>

        <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}
          className="w-full text-center text-xs font-medium" style={{ color: C.soft }}>
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
