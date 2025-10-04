"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { t } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";

type Post = {
  id: string;
  content: string;
  created_at: string;
};

type FetchState = "idle" | "loading" | "ready" | "error";

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [state, setState] = useState<FetchState>("loading");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthed(Boolean(data.session));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthed(Boolean(session));
    });

    async function loadPosts() {
      try {
        setState("loading");
        const { data, error } = await supabase
          .from("posts")
          .select("id, content, created_at")
          .order("created_at", { ascending: false })
          .limit(3);
        if (!active) return;
        if (error) {
          setState("error");
          return;
        }
        setPosts((data ?? []) as Post[]);
        setState("ready");
      } catch (error) {
        if (!active) return;
        console.error("Home posts yükleme hatası", error);
        setState("error");
      }
    }

    loadPosts();

    return () => {
      active = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

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

  return (
    <main className="space-y-6 pb-6">
      <section className="hero rounded-xl bg-base-200">
        <div className="hero-content py-10 text-center">
          <div className="max-w-md space-y-4">
            <Image src="/next.svg" alt="Logo" width={140} height={30} className="mx-auto opacity-80" />
            <h1 className="text-2xl font-bold">
              {t("home.welcome")} — {t("app.title")}
            </h1>
            <p className="text-sm text-base-content/70">{t("home.subtitle")}</p>
            <div className="join mt-3 flex justify-center">
              <a href="https://nextjs.org/docs" target="_blank" rel="noopener" className="btn btn-outline btn-sm join-item">
                {t("home.docs")}
              </a>
              <a href="https://vercel.com" target="_blank" rel="noopener" className="btn btn-primary btn-sm join-item">
                {t("home.deploy")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <article className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <header>
              <h2 className="card-title text-base">{t("home.quick.title")}</h2>
              <p className="text-sm text-base-content/70">
                {authed ? t("home.quick.authenticated") : t("home.quick.guest")}
              </p>
            </header>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {authed ? (
                <>
                  <Link href="/akis" className="btn btn-primary btn-sm justify-between">
                    <span>{t("home.quick.feed")}</span>
                    <span aria-hidden>📰</span>
                  </Link>
                  <Link href="/akis" className="btn btn-secondary btn-sm justify-between">
                    <span>{t("home.quick.create")}</span>
                    <span aria-hidden>➕</span>
                  </Link>
                  <Link href="/profil" className="btn btn-outline btn-sm justify-between">
                    <span>{t("home.quick.profile")}</span>
                    <span aria-hidden>👤</span>
                  </Link>
                  <Link href="/ayarlar" className="btn btn-outline btn-sm justify-between">
                    <span>{t("nav.settings")}</span>
                    <span aria-hidden>⚙️</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/giris" className="btn btn-primary btn-sm justify-between">
                    <span>{t("home.quick.login")}</span>
                    <span aria-hidden>→</span>
                  </Link>
                  <Link href="/kayit" className="btn btn-outline btn-sm justify-between">
                    <span>{t("home.quick.signup")}</span>
                    <span aria-hidden>★</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </article>

        <article className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-base">{t("home.latest.title")}</h2>
                <p className="text-sm text-base-content/70">{t("home.edit_hint")}</p>
              </div>
              <Link href="/akis" className="btn btn-link btn-sm text-primary">
                {t("home.latest.cta")}
              </Link>
            </header>

            {state === "loading" && (
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <span className="loading loading-spinner loading-sm" aria-hidden />
                <span>{t("home.latest.loading")}</span>
              </div>
            )}

            {state === "error" && (
              <div className="alert alert-error text-sm">
                <span>{t("home.latest.error")}</span>
              </div>
            )}

            {state === "ready" && formattedPosts.length === 0 && (
              <div className="alert text-sm">
                <span>{t("home.latest.empty")}</span>
              </div>
            )}

            {state === "ready" && formattedPosts.length > 0 && (
              <div className="space-y-3">
                {formattedPosts.map((post) => (
                  <div key={post.id} className="rounded-lg border border-base-200 p-3">
                    <p className="whitespace-pre-wrap text-sm text-base-content">{post.content}</p>
                    <p className="mt-2 text-[11px] text-base-content/60">{post.createdLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

