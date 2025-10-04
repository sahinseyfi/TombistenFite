"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabaseClient";

type Message = {
  type: "success" | "error";
  text: string;
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB

export default function ProfilPage() {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Message | null>(null);

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

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function onAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setMsg({ type: "error", text: "Dosya boyutu 2 MB'ı geçmemeli." });
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextPreview;
    });
  }

  function clearAvatarSelection() {
    const hadPreview = Boolean(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!hadPreview) {
      setAvatarUrl("");
    }
  }

  async function uploadAvatar(uid: string): Promise<string> {
    if (!avatarFile) {
      return avatarUrl;
    }

    const fileExt = avatarFile.name.split(".").pop()?.toLowerCase() || "png";
    const filePath = `${uid}/avatar-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Avatar yüklenemedi: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;
    if (!publicUrl) {
      throw new Error("Avatar URL'si alınamadı.");
    }

    return publicUrl;
  }

  async function onSave() {
    setSaving(true);
    setMsg(null);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setSaving(false);
      setMsg({ type: "error", text: "Oturum bulunamadı." });
      return;
    }

    let nextAvatarUrl = avatarUrl;
    try {
      if (avatarFile) {
        nextAvatarUrl = await uploadAvatar(uid);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Avatar yükleme başarısız.";
      setSaving(false);
      setMsg({ type: "error", text: message });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: uid,
          display_name: displayName || null,
          avatar_url: nextAvatarUrl || null,
        },
        { onConflict: "id" },
      );

    setSaving(false);

    if (error) {
      setMsg({ type: "error", text: `Kaydedilemedi: ${error.message}` });
      return;
    }

    setAvatarUrl(nextAvatarUrl);
    setAvatarFile(null);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMsg({ type: "success", text: "Profiliniz güncellendi." });
  }

  const alertClass = msg?.type === "error" ? "alert-error" : "alert-success";
  const currentAvatar = avatarPreview ?? avatarUrl ?? "";

  return (
    <RequireAuth>
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Profil</h1>
        <p className="text-sm text-base-content/70">Profil bilgilerinizi burada yönetin.</p>
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            {msg && (
              <div className={`alert text-sm ${alertClass}`}>
                <span>{msg.text}</span>
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Görünen İsim</span>
              </label>
              <input
                className="input input-bordered"
                placeholder="Adınız"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Profil Fotoğrafı</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-16 rounded-full bg-base-200">
                    {currentAvatar ? (
                      <Image
                        src={currentAvatar}
                        alt="Avatar önizleme"
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-base-content/60">
                        Yok
                      </span>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered file-input-sm"
                  onChange={onAvatarFileChange}
                />
                {(avatarPreview || avatarUrl) && (
                  <button type="button" className="btn btn-ghost btn-xs" onClick={clearAvatarSelection}>
                    Temizle
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-base-content/60">PNG veya JPEG, en fazla 2 MB.</p>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Avatar URL</span>
              </label>
              <input
                className="input input-bordered"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
            <div className="form-control">
              <button
                className={`btn btn-primary btn-sm w-full ${saving ? "btn-disabled" : ""}`}
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

