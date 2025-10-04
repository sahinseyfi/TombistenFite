"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function GirisPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = "/";
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Giriş Yap</h1>
      <form className="card bg-base-100 shadow" onSubmit={onSubmit}>
        <div className="card-body">
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <label className="form-control">
            <span className="label-text">E-posta</span>
            <input className="input input-bordered" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text">Şifre</span>
            <input className="input input-bordered" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button className={`btn btn-primary mt-2 ${loading ? "btn-disabled" : ""}`} type="submit">
            {loading ? "Gönderiliyor…" : "Giriş Yap"}
          </button>
        </div>
      </form>
    </div>
  );
}

