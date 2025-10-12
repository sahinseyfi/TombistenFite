"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMembership } from "@/components/layout/membership-context";

type PremiumGateProps = {
  featureId: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
};

export default function PremiumGate({
  featureId,
  children,
  className,
  overlayClassName,
}: PremiumGateProps) {
  const membership = useMembership();
  const feature = membership.featureGates.find((item) => item.id === featureId);

  if (!feature || feature.available || membership.tier === "premium") {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <div
        className={cn(
          "pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-background/95 p-6 text-center shadow-inner",
          overlayClassName,
        )}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{feature.title}</p>
          <p className="text-xs text-muted-foreground">{feature.description}</p>
        </div>
        <Link
          href={{ pathname: "/premium" }}
          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Premium\u2019e ge\u00E7
        </Link>
      </div>
    </div>
  );
}
