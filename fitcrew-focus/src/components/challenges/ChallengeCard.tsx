"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Flame, Sparkles } from "lucide-react";
import type { SerializedChallenge, SerializedChallengeParticipation } from "@/server/serializers/challenge";

type ChallengeCardProps = {
  challenge: SerializedChallenge;
  readOnly?: boolean;
};

function computeProgress(challenge: SerializedChallenge, participation: SerializedChallengeParticipation | null) {
  const progressCount = participation?.progressCount ?? 0;
  const targetCount = challenge.targetCount > 0 ? challenge.targetCount : 1;
  const completionRate = Math.min(1, progressCount / targetCount);
  const remainingCount = Math.max(0, targetCount - progressCount);
  const isCompleted = participation?.status === "COMPLETED";

  return {
    completionRate,
    remainingCount,
    isCompleted,
  };
}

export default function ChallengeCard({ challenge, readOnly = false }: ChallengeCardProps) {
  const [challengeState, setChallengeState] = useState<SerializedChallenge>(challenge);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const progress = useMemo(
    () => computeProgress(challengeState, challengeState.participation),
    [challengeState],
  );

  const isJoined = Boolean(challengeState.participation);
  const isCompleted = progress.isCompleted;
  const actionDisabled = readOnly || isPending;

  async function handleJoin() {
    if (readOnly || isJoined) {
      return;
    }

    startTransition(async () => {
      setFeedback(null);
      try {
        const response = await fetch(`/api/challenges/${challengeState.id}/join`, {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error?.message ?? "Challenge kat\u0131l\u0131rken hata olu\u015Ftu.");
        }

        const body = await response.json();
        const participation: SerializedChallengeParticipation = body.participation;

        setChallengeState((prev) => ({
          ...prev,
          participation,
          progress: computeProgress(prev, participation),
        }));
        setFeedback("Challenge'a kat\u0131l\u0131n\u0131z!");
      } catch (error) {
        console.error(error);
        setFeedback(error instanceof Error ? error.message : "Beklenmeyen bir hata olu\u015Ftu.");
      }
    });
  }

  async function handleLogProgress() {
    if (readOnly || !isJoined || isCompleted) {
      return;
    }

    const primaryTask = challengeState.tasks[0];

    startTransition(async () => {
      setFeedback(null);
      try {
        const response = await fetch(`/api/challenges/${challengeState.id}/progress`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            quantity: 1,
            taskId: primaryTask?.id,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error?.message ?? "Progress kaydedilemedi.");
        }

        const body = await response.json();
        const participation: SerializedChallengeParticipation = body.participation;

        setChallengeState((prev) => ({
          ...prev,
          participation,
          progress: computeProgress(prev, participation),
        }));

        if (body.progress?.rewardGranted) {
          setFeedback(`Hedef tamamland\u0131! ${challengeState.rewardLabel ?? "Bonus kazand\u0131n\u0131z."}`);
        } else {
          setFeedback("Kay\u0131t al\u0131nd\u0131! Devam :)");
        }
      } catch (error) {
        console.error(error);
        setFeedback(error instanceof Error ? error.message : "Beklenmeyen bir hata olu\u015Ftu.");
      }
    });
  }

  return (
    <section className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Haftal\u0131k Challenge</p>
          <h3 className="text-lg font-semibold text-foreground">{challengeState.title}</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase text-primary">
          <Flame className="h-3.5 w-3.5" aria-hidden />
          {challengeState.frequency === "DAILY" ? "G\u00FCnl\u00FCk" : "Haftal\u0131k"}
        </span>
      </header>

      <p className="text-sm leading-relaxed text-muted-foreground">{challengeState.summary}</p>

      {challengeState.tasks.length > 0 && (
        <div className="rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{challengeState.tasks[0].title}</p>
          {challengeState.tasks[0].instructions && (
            <p className="mt-1 leading-relaxed">{challengeState.tasks[0].instructions}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary-foreground">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary/80">Hedef</p>
          <p className="text-base font-semibold text-primary">
            {progress.remainingCount > 0 ? `${progress.remainingCount} ad\u0131m kald\u0131` : "\u015Eampiyonluk!"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-primary/80">Tamamlanma</p>
          <p className="text-base font-semibold text-primary">{Math.round(progress.completionRate * 100)}%</p>
        </div>
      </div>

      {challengeState.participation && (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="rounded-2xl bg-muted/40 px-3 py-2">
            <p className="font-semibold text-foreground">{challengeState.participation.progressCount}</p>
            <p className="mt-1">Toplam kay\u0131t</p>
          </div>
          <div className="rounded-2xl bg-muted/40 px-3 py-2">
            <p className="font-semibold text-foreground">
              {challengeState.participation.streakCount}
            </p>
            <p className="mt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-warning" />
              Streak
            </p>
          </div>
        </div>
      )}

      {challengeState.rewardLabel && (
        <div className="rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 text-xs text-primary">
          {challengeState.rewardLabel}
        </div>
      )}

      {feedback && (
        <p className="rounded-2xl border border-info/30 bg-info/10 px-4 py-2 text-xs text-info-foreground">
          {feedback}
        </p>
      )}

      <div className="flex gap-2">
        {!isJoined ? (
          <button
            type="button"
            className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition disabled:opacity-60"
            onClick={handleJoin}
            disabled={actionDisabled}
          >
            {
              readOnly
                ? "Giri\u015F yap\u0131n"
                : "Challenge'a kat\u0131l"
            }
          </button>
        ) : (
          <button
            type="button"
            className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition disabled:opacity-60"
            onClick={handleLogProgress}
            disabled={actionDisabled || isCompleted}
          >
            {isCompleted ? "Tamamland\u0131" : "Bug\u00FCn kay\u0131t ekle"}
          </button>
        )}

        <Link
          href={{ pathname: "/insights" }}
          className="inline-flex items-center justify-center rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/40"
        >
          \u0130lerleme
        </Link>
      </div>
    </section>
  );
}
