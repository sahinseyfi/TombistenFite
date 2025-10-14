import Link from "next/link";
import MobileLayout from "@/components/layout/MobileLayout";
import TrendCharts from "@/components/insights/TrendCharts";
import CoachNotesList from "@/components/insights/CoachNotesList";
import { fetchProgressInsights, fetchUnreadCount } from "@/lib/app-data";

function formatWeight(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${value.toFixed(1)} kg`;
}

function formatDeltaText(delta: number | null | undefined) {
  if (delta === null || delta === undefined) {
    return { text: "Veri bekleniyor", tone: "muted" as const };
  }

  if (Math.abs(delta) < 0.05) {
    return { text: "Stabil", tone: "muted" as const };
  }

  const formatted = `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`;
  return {
    text: delta > 0 ? `${formatted} art\u0131\u015F` : `${formatted} azalma`,
    tone: delta > 0 ? ("warning" as const) : ("success" as const),
  };
}

function formatDate(iso: string | null) {
  if (!iso) {
    return "Hen\u00FCz kay\u0131t yok";
  }
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
  });
}

export default async function InsightsPage() {
  const [insights, unreadCount] = await Promise.all([
    fetchProgressInsights(),
    fetchUnreadCount(),
  ]);
  const summary = insights.summary;
  const weightDelta = formatDeltaText(summary?.weightChangeKg);

  return (
    <MobileLayout title="\u0130lerleme" notificationCount={unreadCount}>
      {insights.error === "unauthorized" && (
        <div className="rounded-3xl border border-dashed border-info/40 bg-info/10 p-4 text-xs text-info-foreground">
          Kişisel ilerleme verilerinizi görebilmek için hesabınıza giriş yapın.
        </div>
      )}
      {insights.error === "unavailable" && (
        <div className="rounded-3xl border border-dashed border-warning/40 bg-warning/10 p-4 text-xs text-warning-foreground">
          İlerleme verilerine şu anda ulaşılamıyor. Lütfen kısa bir süre sonra tekrar deneyin.
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-primary/10 p-4 text-sm shadow-sm">
          <p className="text-muted-foreground">G\u00FCncel kilo</p>
          <p className="mt-2 text-3xl font-semibold text-primary">
            {formatWeight(summary?.latestWeightKg)}
          </p>
          <p
            className={
              weightDelta.tone === "success"
                ? "mt-2 text-xs font-medium text-success"
                : weightDelta.tone === "warning"
                  ? "mt-2 text-xs font-medium text-warning"
                  : "mt-2 text-xs text-muted-foreground"
            }
          >
            {weightDelta.text}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 text-sm shadow-sm">
          <p className="text-muted-foreground">Son \u00F6l\u00E7\u00FCm</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatDate(summary?.latestMeasurementAt ?? null)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Toplam {summary?.measurementCount ?? 0} kay\u0131t
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 text-sm shadow-sm">
          <p className="text-muted-foreground">Son 30 g\u00FCn Treat Wheel</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {summary?.treatSpinsLast30Days ?? 0} spin
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {summary?.treatBonusLast30Days ?? 0} dk bonus y\u00FCr\u00FCy\u00FC\u015F
          </p>
        </div>
      </section>

      <TrendCharts weeklySeries={insights.weeklySeries} monthlySeries={insights.monthlySeries} />

      <section className="space-y-2">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Ko\u00E7 notlar\u0131</h2>
            <p className="text-xs text-muted-foreground">
              AI ve manuel geri bildirimler burada toplan\u0131yor.
            </p>
          </div>
          <Link
            href={{ pathname: "/measurements" }}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            \u00D6l\u00E7\u00FCmleri g\u00F6r
          </Link>
        </header>
        <CoachNotesList notes={insights.recentNotes} />
      </section>
    </MobileLayout>
  );
}
