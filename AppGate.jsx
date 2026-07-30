import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import App from "./App";

const C = { bg: "#F2F4F1", teal: "#0F5C4F" };

export default function AppGate() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out
  const [initialData, setInitialData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setDataLoading(true);
    supabase
      .from("user_data")
      .select("data")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Failed to load saved data:", error.message);
        setInitialData(data?.data ?? null);
        setDataLoading(false);
      });
    return () => { cancelled = true; };
  }, [session]);

  const saveData = useCallback((payload) => {
    if (!session) return;
    supabase
      .from("user_data")
      .upsert({ user_id: session.user.id, data: payload, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error("Failed to save data:", error.message); });
  }, [session]);

  function logout() {
    supabase.auth.signOut();
  }

  if (session === undefined || (session && dataLoading)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: C.teal, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!session) return <Auth />;

  return <App initialData={initialData} onChange={saveData} onLogout={logout} userEmail={session.user.email} />;
}
