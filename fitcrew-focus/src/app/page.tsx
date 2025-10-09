"use client";

import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-mobile flex-col",
        "gap-6 px-4 pb-8 pt-6",
      )}
    >
      <section className="rounded-3xl bg-card p-6 text-center shadow-glow">
        <h1 className="text-2xl font-display text-foreground">FitCrew Focus</h1>
        <p className="mt-2 text-muted-foreground">
          Mobil PWA altyapısı hazır. Planlanan API ve ekranlar için uygulama iskeleti kuruluyor.
        </p>
      </section>
      <section className="rounded-3xl border border-dashed border-border bg-background/60 p-6 text-left">
        <h2 className="text-lg font-semibold">Sıradaki Adımlar</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Prisma veritabanı modelleri ve migrasyonları</li>
          <li>JWT tabanlı kimlik doğrulama uçları</li>
          <li>Upload, gönderi, yorum ve takip API&#39;leri</li>
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">
          Detaylar için proje kökünde yer alan <code>docs/BACKEND_HANDOFF.md</code> belgesini inceleyin.
        </p>
      </section>
    </main>
  );
}
