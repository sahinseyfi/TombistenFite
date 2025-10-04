"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import StarterCard from "../components/StarterCard";
import { t } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";

type Post = {
  id: string;
  content: string | null;
  created_at: string;
  image_url?: string | null;
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
          .select("id, content, created_at, image_url")
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

  const heroActions = authed
    ? [
        { href: "/akis", label: t("home.hero.cta.primary.auth"), variant: "btn-primary" },
        { href: "/profil", label: t("home.hero.cta.secondary.auth"), variant: "btn-outline" },
      ]
    : [
        { href: "/kayit", label: t("home.hero.cta.primary.guest"), variant: "btn-primary" },
        { href: "/giris", label: t("home.hero.cta.secondary.guest"), variant: "btn-outline" },
      ];

  return (
    <main className="space-y-6 pb-6">
      <section className="hero rounded-xl bg-base-200">
        <div className="hero-content flex-col py-10 text-center">
          <Image src="/globe.svg" alt="TombistenFite" width={120} height={120} className="mx-auto opacity-80" />
          <h1 className="mt-4 text-2xl font-bold">{t("home.hero.title")}</h1>
          <p className="max-w-md text-sm text-base-content/70">{t("home.hero.subtitle")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {heroActions.map((action) => (
              <Link key={action.href} href={action.href} className={`btn btn-sm ${action.variant}`}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <StarterCard authed={authed} />
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
                <p className="text-sm text-base-content/70">{t("home.latest.subtitle")}</p>
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
                  <div key={post.id} className="space-y-2 rounded-lg border border-base-200 p-3">
                    {post.image_url && (
                      <Image
                        src={post.image_url}
                        alt={t("feed.image_alt")}
                        width={1024}
                        height={1024}
                        className="h-auto w-full rounded-lg object-cover"
                        unoptimized
                      />
                    )}
                    {post.content && <p className="whitespace-pre-wrap text-sm text-base-content">{post.content}</p>}
                    <p className="text-[11px] text-base-content/60">{post.createdLabel}</p>
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

