"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Post = { id: string; content: string; created_at: string };

export default function AkisPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [authed, setAuthed] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setLoading(false);
    if (!error && data) setPosts(data as Post[]);
  }

  useEffect(() => {
    load();
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  async function onPost() {
    if (!content.trim()) return;
    setSending(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setSending(false);
      return;
    }
    const { error } = await supabase.from("posts").insert({ author_id: uid, content });
    setSending(false);
    if (!error) {
      setContent("");
      load();
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Akış</h1>
      {authed && (
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <textarea className="textarea textarea-bordered" placeholder="Ne düşünüyorsun?" value={content} onChange={(e) => setContent(e.target.value)} />
            <button className={`btn btn-primary btn-sm self-end ${sending ? "btn-disabled" : ""}`} onClick={onPost}>
              {sending ? "Gönderiliyor…" : "Paylaş"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <span className="loading loading-spinner" aria-label="Yükleniyor" />
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="alert">
            <span>Henüz içerik yok.</span>
          </div>
        )}
        {posts.map((p) => (
          <article key={p.id} className="card bg-base-100 shadow">
            <div className="card-body">
              <p className="whitespace-pre-wrap text-sm">{p.content}</p>
              <p className="text-[11px] text-base-content/50">{new Date(p.created_at).toLocaleString("tr-TR")}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

