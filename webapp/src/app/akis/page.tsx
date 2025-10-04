"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { t } from "@/lib/i18n";

type Post = {
  id: string;
  content: string | null;
  created_at: string;
  image_url?: string | null;
};

type FetchState = "loading" | "ready" | "error";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function AkisPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    const { data, error } = await supabase
      .from("posts")
      .select("id, content, created_at, image_url")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      setState("error");
      return;
    }
    setPosts((data ?? []) as Post[]);
    setState("ready");
  }, []);

  useEffect(() => {
    let active = true;

    load();

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthed(Boolean(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthed(Boolean(session));
    });

    return () => {
      active = false;
      subscription?.subscription.unsubscribe();
    };
  }, [load]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const formattedPosts = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
    return posts.map((post) => ({
      ...post,
      createdLabel: formatter.format(new Date(post.created_at)),
    }));
  }, [posts]);

  function resetFileInput() {
    const input = document.getElementById("feed-image-input") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    resetFileInput();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMsg(null);
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      clearImage();
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMsg(t("feed.image_limit"));
      resetFileInput();
      return;
    }
    const preview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
  }

  async function uploadImage(uid: string): Promise<string | null> {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const base = imageFile.name.includes(".") ? imageFile.name.slice(0, imageFile.name.lastIndexOf(".")) : imageFile.name;
    const sanitizedBase = base.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().replace(/^-+|-+$/g, "");
    const filePath = `${uid}/${Date.now()}-${sanitizedBase || "gorsel"}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
    return data.publicUrl ?? null;
  }

  async function onPost() {
    setErrorMsg(null);
    if (!content.trim() && !imageFile) {
      return;
    }
    setSending(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setSending(false);
      setErrorMsg(t("auth.error.no_session"));
      return;
    }

    let imageUrl: string | null = null;
    try {
      imageUrl = await uploadImage(uid);
    } catch (error) {
      console.error("Gönderi görsel yükleme hatası", error);
      setErrorMsg(t("feed.image_error"));
      setSending(false);
      return;
    }

    const { error } = await supabase
      .from("posts")
      .insert({ author_id: uid, content: content.trim() || null, image_url: imageUrl });
    setSending(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setContent("");
    clearImage();
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t("feed.title")}</h1>
      {authed && (
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            {errorMsg && (
              <div className="alert alert-error text-sm">
                <span>{errorMsg}</span>
              </div>
            )}
            <textarea
              className="textarea textarea-bordered"
              placeholder={t("feed.placeholder")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="btn btn-outline btn-xs sm:btn-sm w-fit" htmlFor="feed-image-input">
                {t("feed.attach")}
              </label>
              <input id="feed-image-input" type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              {imagePreview && (
                <div className="relative w-full overflow-hidden rounded-lg border border-base-200">
                  <Image
                    src={imagePreview}
                    alt={t("feed.image_preview_alt")}
                    width={1024}
                    height={1024}
                    className="h-auto w-full object-cover"
                    unoptimized
                  />
                  <div className="absolute right-2 top-2">
                    <button type="button" className="btn btn-xs" onClick={clearImage}>
                      {t("feed.remove_image")}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className={`btn btn-primary btn-sm self-end ${sending ? "btn-disabled" : ""}`}
              onClick={onPost}
              disabled={sending}
            >
              {sending ? t("feed.posting") : t("feed.post")}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {state === "loading" && (
          <div className="flex items-center justify-center py-10">
            <span className="loading loading-spinner" aria-label={t("feed.loading")} />
          </div>
        )}
        {state === "ready" && formattedPosts.length === 0 && (
          <div className="alert text-sm">
            <span>{t("feed.empty")}</span>
          </div>
        )}
        {state === "error" && (
          <div className="alert alert-error text-sm">
            <span>{t("feed.error")}</span>
          </div>
        )}
        {formattedPosts.map((post) => (
          <article key={post.id} className="card bg-base-100 shadow">
            <div className="card-body gap-3">
              {post.image_url && (
                <div className="overflow-hidden rounded-lg border border-base-200">
                  <Image
                    src={post.image_url}
                    alt={t("feed.image_alt")}
                    width={1024}
                    height={1024}
                    className="h-auto w-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              {post.content && <p className="whitespace-pre-wrap text-sm">{post.content}</p>}
              <p className="text-[11px] text-base-content/50">{post.createdLabel}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
