"use client";

import Link from "next/link";
import { t } from "../lib/i18n";

type StarterCardProps = {
  authed: boolean;
};

type Step = {
  id: string;
  title: string;
  description: string;
  href?: string;
  ctaLabel?: string;
  completed: boolean;
};

function buildSteps(authed: boolean): Step[] {
  return [
    {
      id: "auth",
      title: t("home.starter.step.auth.title"),
      description: t("home.starter.step.auth.desc"),
      href: authed ? undefined : "/kayit",
      ctaLabel: authed ? undefined : t("home.quick.signup"),
      completed: authed,
    },
    {
      id: "profile",
      title: t("home.starter.step.profile.title"),
      description: t("home.starter.step.profile.desc"),
      href: "/profil",
      ctaLabel: t("home.quick.profile"),
      completed: false,
    },
    {
      id: "post",
      title: t("home.starter.step.post.title"),
      description: t("home.starter.step.post.desc"),
      href: "/akis",
      ctaLabel: t("home.quick.feed"),
      completed: false,
    },
  ];
}

export default function StarterCard({ authed }: StarterCardProps) {
  const steps = buildSteps(authed);

  const primaryCta = {
    href: authed ? "/akis" : "/kayit",
    label: authed ? t("home.starter.cta.auth") : t("home.starter.cta.guest"),
  };

  return (
    <article className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <header className="space-y-1">
          <p className="badge badge-outline badge-sm text-xs uppercase tracking-widest text-base-content/70">
            Starter
          </p>
          <h2 className="card-title text-base">{t("home.starter.title")}</h2>
          <p className="text-sm text-base-content/70">{t("home.starter.subtitle")}</p>
        </header>
        <ul className="flex flex-col gap-3 text-sm">
          {steps.map((step, index) => (
            <li key={step.id} className="flex gap-3 rounded-xl border border-base-200 p-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                  step.completed
                    ? "border-success/60 bg-success/10 text-success"
                    : "border-base-300 bg-base-100 text-base-content/70"
                }`}
                aria-hidden
              >
                {step.completed ? "✓" : index + 1}
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <p className="font-medium">{step.title}</p>
                <p className="text-xs text-base-content/70">{step.description}</p>
                {step.href && step.ctaLabel && (
                  <Link href={step.href} className="link link-primary text-xs">
                    {step.ctaLabel}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-end">
          <Link href={primaryCta.href} className="btn btn-primary btn-sm">
            {primaryCta.label}
          </Link>
        </div>
      </div>
    </article>
  );
}
