import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Heart, MessageCircle } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import { cn } from "@/lib/utils";
import { fetchChallenges, fetchFeed, fetchUnreadCount } from "@/lib/app-data";
import type { SerializedPost } from "@/server/serializers/post";

function formatRelative(dateIso: string) {
  return formatDistanceToNow(new Date(dateIso), {
    addSuffix: true,
    locale: tr,
  });
}

function MealBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function FeedPostCard({ post }: { post: SerializedPost }) {
  const timeAgo = formatRelative(post.createdAt);
  const hasAiSummary = post.aiComment && post.aiComment.status === "ready";

  return (
    <article className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <header className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
          {post.author.avatarUrl ? (
            <Image
              src={post.author.avatarUrl}
              alt={`${post.author.name} avatar\u0131`}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
              {post.author.name.at(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{post.author.handle} \u2022 {timeAgo}
          </p>
        </div>

        {hasAiSummary && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            AI
          </span>
        )}
      </header>

      {post.photos.length > 0 && (
        <div
          className={cn(
            "grid gap-2 overflow-hidden rounded-2xl",
            post.photos.length === 1 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {post.photos.map((photo, index) => (
            <div key={`${post.id}-${index}`} className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              <Image
                src={photo}
                alt={`${post.author.name} g\u00F6nderi foto\u011Fraf\u0131 ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {post.mealType && (
            <MealBadge>
              {post.mealType === "breakfast" && "Kahvalt\u0131"}
              {post.mealType === "lunch" && "\u00D6\u011Fle"}
              {post.mealType === "dinner" && "Ak\u015Fam"}
              {post.mealType === "snack" && "Ara \u00D6\u011F\u00FCn"}
            </MealBadge>
          )}
          {post.weightKg !== undefined && <MealBadge>{post.weightKg.toFixed(1)} kg</MealBadge>}
          {post.measurements?.waistCm && <MealBadge>Bel: {post.measurements.waistCm} cm</MealBadge>}
        </div>

        {post.caption && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{post.caption}</p>
        )}

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4" aria-hidden />
            {post.likesCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4" aria-hidden />
            {post.commentsCount}
          </span>
        </div>

        {hasAiSummary && (
          <div className="rounded-2xl bg-primary/5 p-4 text-sm text-foreground">
            <p className="font-semibold text-primary">AI \u00D6nerisi</p>
            {post.aiComment?.summary && <p className="mt-1 text-muted-foreground">{post.aiComment.summary}</p>}
            {post.aiComment?.tips && (
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {post.aiComment.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 text-primary">\u2022</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default async function FeedPage() {
  const [feed, unreadCount, challenges] = await Promise.all([
    fetchFeed("public", 8),
    fetchUnreadCount(),
    fetchChallenges(),
  ]);

  return (
    <MobileLayout title="Ak\u0131\u015F" notificationCount={unreadCount}>
      {feed.source === "fallback" && (
        <div className="rounded-3xl border border-dashed border-warning/50 bg-warning/10 p-4 text-sm text-warning-foreground">
          Giri\u015F yapmad\u0131\u011F\u0131n\u0131z i\u00E7in \u00F6rnek bir ak\u0131\u015F g\u00F6steriliyor. Kimlik do\u011Frulamas\u0131
          sonras\u0131nda ki\u015Fiselle\u015Fmi\u015F verileriniz listelenecek.
        </div>
      )}

      {challenges.challenges.length > 0 && (
        <div className="space-y-3">
          {challenges.source === "fallback" && (
            <div className="rounded-3xl border border-dashed border-info/50 bg-info/10 p-3 text-xs text-info-foreground">
              \u00D6rnek challenge g\u00F6r\u00FCnt\u00FCleniyor. Kay\u0131t g\u00F6ndermek i\u00E7in giri\u015F yap\u0131n.
            </div>
          )}
          <ChallengeCard challenge={challenges.challenges[0]} isFallback={challenges.source === "fallback"} />
        </div>
      )}

      <section className="space-y-4">
        {feed.posts.map((post) => (
          <FeedPostCard key={post.id} post={post} />
        ))}
      </section>
    </MobileLayout>
  );
}
