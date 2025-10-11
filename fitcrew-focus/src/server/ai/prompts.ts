import { formatISO } from "date-fns";

type MeasurementSnapshot = {
  date: Date;
  weightKg?: number | null;
  waistCm?: number | null;
  chestCm?: number | null;
  hipCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
};

export type AiCommentPromptInput = {
  user: {
    name: string;
    handle: string;
  };
  post: {
    createdAt: Date;
    caption?: string | null;
    mealType?: string | null;
    weightKg?: number | null;
    photos?: string[];
  };
  latestMeasurement?: MeasurementSnapshot;
  measurementHistory?: MeasurementSnapshot[];
};

function formatMeasurement(measurement?: MeasurementSnapshot) {
  if (!measurement) {
    return "Veri yok.";
  }

  const parts: string[] = [];
  if (measurement.weightKg !== null && measurement.weightKg !== undefined) {
    parts.push(`Kilo: ${measurement.weightKg} kg`);
  }
  if (measurement.waistCm !== null && measurement.waistCm !== undefined) {
    parts.push(`Bel: ${measurement.waistCm} cm`);
  }
  if (measurement.chestCm !== null && measurement.chestCm !== undefined) {
    parts.push(`Gogus: ${measurement.chestCm} cm`);
  }
  if (measurement.hipCm !== null && measurement.hipCm !== undefined) {
    parts.push(`Kalca: ${measurement.hipCm} cm`);
  }
  if (measurement.armCm !== null && measurement.armCm !== undefined) {
    parts.push(`Kol: ${measurement.armCm} cm`);
  }
  if (measurement.thighCm !== null && measurement.thighCm !== undefined) {
    parts.push(`Bacak: ${measurement.thighCm} cm`);
  }

  if (parts.length === 0) {
    return "Veri yok.";
  }

  return `${formatISO(measurement.date, { representation: "date" })} - ${parts.join(", ")}`;
}

function formatTrendList(measurements?: MeasurementSnapshot[]) {
  if (!measurements || measurements.length === 0) {
    return "Yetersiz veri.";
  }

  return measurements
    .map((measurement) => formatMeasurement(measurement))
    .join("\n");
}

export function buildAiCommentPrompt(input: AiCommentPromptInput) {
  const photoCount = input.post.photos?.length ? ` (${input.post.photos.length} fotoğraf)` : "";

  const sections = [
    `Kullanıcı: ${input.user.name} (@${input.user.handle})`,
    `Gönderi tarihi: ${formatISO(input.post.createdAt, { representation: "complete" })}`,
    input.post.mealType ? `Öğün türü: ${input.post.mealType}` : "Öğün türü: belirtilmedi",
    input.post.weightKg ? `Gönderide bildirilen kilo: ${input.post.weightKg} kg` : "Gönderide kilo bilgisi: yok",
    `Fotoğraflar${photoCount}`,
    `Açıklama: ${input.post.caption?.trim() || "Belirtilmemiş"}`,
    "",
    "Son ölçüm:",
    formatMeasurement(input.latestMeasurement),
    "",
    "Kilo/ölçüm geçmişi:",
    formatTrendList(input.measurementHistory),
    "",
    "Yanıt formatı:",
    `{
  "summary": "(metin)",
  "tips": ["Kısa öneri 1", "Kısa öneri 2"]
}`,
    "",
    "Kurallar:",
    "- Sağlık veya tıbbi teşhis içeren iddialardan kaçın.",
    "- Tonu destekleyici ve motive edici tut.",
    "- Öneri sayısı 1 ile 3 arasında olsun.",
    "- Çıktıyı yalnızca geçerli JSON olarak ver, açıklama ekleme.",
    '- "AI yorum içerikleri tıbbi tavsiye değildir." cümlesini özetin sonunda ekle.',
  ];

  return sections.join("\n");
}

