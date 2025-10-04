import Image from "next/image";
import { t } from "../lib/i18n";

export default function Home() {
  return (
    <main className="space-y-6">
      <section className="hero bg-base-200 rounded-xl">
        <div className="hero-content text-center py-10">
          <div className="max-w-md">
            <Image src="/next.svg" alt="Logo" width={140} height={30} className="mx-auto opacity-80" />
            <h1 className="text-2xl font-bold mt-4">{t("home.welcome")} — {t("app.title")}</h1>
            <p className="py-2 text-sm text-base-content/70">{t("home.subtitle")}</p>
            <div className="join mt-3">
              <a href="https://nextjs.org/docs" target="_blank" className="btn btn-outline btn-sm join-item">
                {t("home.docs")}
              </a>
              <a href="https://vercel.com" target="_blank" className="btn btn-primary btn-sm join-item">
                {t("home.deploy")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <article className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Starter Kartı</h2>
            <p className="text-sm text-base-content/70">{t("home.edit_hint")}</p>
          </div>
        </article>
      </section>
    </main>
  );
}
