import MobileLayout from "@/components/layout/MobileLayout";
import { fetchMeasurements, fetchUnreadCount } from "@/lib/app-data";

function formatNumber(value: number | undefined, suffix = "") {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return `${value.toFixed(1)}${suffix}`;
}

function formatDelta(current: number | undefined, previous: number | undefined) {
  if (
    current === undefined ||
    previous === undefined ||
    Number.isNaN(current) ||
    Number.isNaN(previous)
  ) {
    return { label: "Veri bekleniyor", tone: "muted" as const };
  }

  const delta = current - previous;
  if (Math.abs(delta) < 0.05) {
    return { label: "Stabil", tone: "muted" as const };
  }

  const formatted = `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`;
  return {
    label: delta > 0 ? `${formatted} art\u0131\u015F` : `${formatted} azalma`,
    tone: delta > 0 ? ("warning" as const) : ("success" as const),
  };
}

function MeasurementList({
  items,
}: {
  items: Awaited<ReturnType<typeof fetchMeasurements>>["measurements"];
}) {
  return (
    <ul className="space-y-3">
      {items.map((measurement) => (
        <li
          key={measurement.id}
          className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-between text-foreground">
            <span className="font-semibold">
              {new Date(measurement.date).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
            {measurement.weightKg && (
              <span className="font-semibold text-primary">
                {measurement.weightKg.toFixed(1)} kg
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            {measurement.waistCm && (
              <div className="rounded-xl bg-primary/5 px-3 py-2">
                <p className="text-muted-foreground">Bel</p>
                <p className="font-semibold text-primary">{measurement.waistCm} cm</p>
              </div>
            )}
            {measurement.hipCm && (
              <div className="rounded-xl bg-secondary/5 px-3 py-2">
                <p className="text-muted-foreground">Kal\u00E7a</p>
                <p className="font-semibold text-secondary">{measurement.hipCm} cm</p>
              </div>
            )}
            {measurement.chestCm && (
              <div className="rounded-xl bg-accent/5 px-3 py-2">
                <p className="text-muted-foreground">G\u00F6\u011Fs</p>
                <p className="font-semibold text-accent">{measurement.chestCm} cm</p>
              </div>
            )}
            {measurement.armCm && (
              <div className="rounded-xl bg-muted px-3 py-2">
                <p className="text-muted-foreground">Kol</p>
                <p className="font-semibold text-foreground">{measurement.armCm} cm</p>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function MeasurementsPage() {
  const [measurementData, unreadCount] = await Promise.all([
    fetchMeasurements(30),
    fetchUnreadCount(),
  ]);

  const latest = measurementData.measurements[0];
  const previous = measurementData.measurements[1];

  const weightDelta = formatDelta(latest?.weightKg, previous?.weightKg);

  return (
    <MobileLayout title="\u00D6l\u00E7\u00FCmler" notificationCount={unreadCount}>
      {measurementData.error === "unauthorized" && (
        <div className="rounded-3xl border border-dashed border-info/40 bg-info/10 p-4 text-xs text-info-foreground">
          Ölçüm geçmişinizi görmek için lütfen hesabınıza giriş yapın.
        </div>
      )}
      {measurementData.error === "unavailable" && (
        <div className="rounded-3xl border border-dashed border-warning/40 bg-warning/10 p-4 text-xs text-warning-foreground">
          Ölçüm kayıtlarına şu anda ulaşılamıyor. Lütfen kısa bir süre sonra tekrar deneyin.
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-4 text-sm">
          <p className="text-muted-foreground">G\u00FCncel kilo</p>
          <p className="mt-2 text-3xl font-semibold text-primary">
            {formatNumber(latest?.weightKg, " kg")}
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
            {weightDelta.label}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 text-sm">
          <p className="text-muted-foreground">Bel \u00E7evresi</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {formatNumber(latest?.waistCm, " cm")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Son kay\u0131ttan {formatNumber(previous?.waistCm, " cm")} olarak payla\u015F\u0131lm\u0131\u015F.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Ge\u00E7mi\u015F Kay\u0131tlar</h2>
          <span className="text-xs text-muted-foreground">
            {measurementData.measurements.length} kay\u0131t listeleniyor
          </span>
        </header>

        <MeasurementList items={measurementData.measurements} />
      </section>
    </MobileLayout>
  );
}
