"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import RequireAuth from "@/components/RequireAuth";
import { useThemePreference, type ThemePreference } from "@/components/ThemeProvider";
import { t } from "@/lib/i18n";
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
  const [themePreference, setThemePreference] = useState<ThemePreference>("light");
  const [themeUpdating, setThemeUpdating] = useState(false);

  const { theme, updateTheme, loading: themeLoading } = useThemePreference();

  useEffect(() => {
    setThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, theme_preference")
        .eq("id", uid)
        .maybeSingle();
      if (!active) return;
      if (!error && data) {
        setDisplayName(data.display_name ?? "");
        setAvatarUrl(data.avatar_url ?? "");
        if (data.theme_preference === "dark" || data.theme_preference === "light") {
          setThemePreference(data.theme_preference);
        }
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
      setMsg({ type: "error", text: t("profile.avatar.error_size") });
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
      throw new Error(`Avatar yuklenemedi: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;
    if (!publicUrl) {
      throw new Error("Avatar URL'si alinamadi.");
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
      setMsg({ type: "error", text: t("auth.error.no_session") });
      return;
    }

    let nextAvatarUrl = avatarUrl;
    try {
      if (avatarFile) {
        nextAvatarUrl = await uploadAvatar(uid);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("profile.avatar.error_upload");
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
          theme_preference: themePreference,
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
    setMsg({ type: "success", text: t("profile.update.success") });
  }

  async function onThemeToggle() {
    const next = themePreference === "dark" ? "light" : "dark";
    setThemeUpdating(true);
    try {
      await updateTheme(next);
      setThemePreference(next);
      setMsg({ type: "success", text: t("profile.theme.success") });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("profile.theme.error");
      setMsg({ type: "error", text: message });
    } finally {
      setThemeUpdating(false);
    }
  }

  const alertClass = msg?.type === "error" ? "alert-error" : "alert-success";
  const currentAvatar = avatarPreview ?? avatarUrl ?? "";
  const themeChecked = themePreference === "dark";
  const themeDisabled = themeUpdating || themeLoading;

  return (
    <RequireAuth>
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">{t("profile.title")}</h1>
        <p className="text-sm text-base-content/70">{t("profile.subtitle")}</p>
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            {msg && (
              <div className={`alert text-sm ${alertClass}`}>
                <span>{msg.text}</span>
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t("profile.display_name")}</span>
              </label>
              <input
                className="input input-bordered"
                placeholder={t("profile.display_name_placeholder")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t("profile.avatar.label")}</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-16 rounded-full bg-base-200">
                    {currentAvatar ? (
                      <Image
                        src={currentAvatar}
                        alt={t("profile.avatar.preview_alt")}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-base-content/60">
                        {t("profile.avatar.empty")}
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
                    {t("profile.avatar.clear")}
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-base-content/60">{t("profile.avatar.helper")}</p>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t("profile.avatar_url")}</span>
              </label>
              <input
                className="input input-bordered"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t("profile.theme.label")}</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={themeChecked}
                  onChange={onThemeToggle}
                  disabled={themeDisabled}
                />
              </label>
              <p className="text-xs text-base-content/60">{t("profile.theme.helper")}</p>
            </div>
            <div className="form-control">
              <button
                className={`btn btn-primary btn-sm w-full ${saving ? "btn-disabled" : ""}`}
                onClick={onSave}
                disabled={saving}
              >
                {saving ? t("profile.saving") : t("profile.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
