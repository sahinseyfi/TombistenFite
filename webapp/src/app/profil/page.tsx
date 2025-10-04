"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilPage() {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", uid)
        .maybeSingle();
      if (!active) return;
      if (!error && data) {
        setDisplayName(data.display_name ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function onSave() {
    setSaving(true);
    setMsg(null);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: uid, display_name: displayName || null, avatar_url: avatarUrl || null }, { onConflict: "id" });
    setSaving(false);
    setMsg(error ? error.message : "Kaydedildi");
  }

  return (
    <RequireAuth>
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Profil</h1>
        <p className="text-sm text-base-content/70">Profil bilgilerinizi burada yönetin.</p>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            {msg && <div className="alert alert-info text-sm">{msg}</div>}
            <div className="form-control">
              <label className="label"><span className="label-text">Görünen İsim</span></label>
              <input className="input input-bordered" placeholder="Adınız" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Avatar URL</span></label>
              <input className="input input-bordered" placeholder="https://..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
            </div>
            <div className="form-control mt-3">
              <button className={`btn btn-primary btn-sm w-full ${saving ? "btn-disabled" : ""}`} onClick={onSave}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
