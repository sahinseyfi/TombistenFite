"use client";

import { supabase } from "@/lib/supabaseClient";

export default function SignOutButton() {
  async function onSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  return (
    <button className="btn btn-outline btn-sm" onClick={onSignOut}>
      Çıkış Yap
    </button>
  );
}

