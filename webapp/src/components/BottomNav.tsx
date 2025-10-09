"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const items = [
  { href: "/", label: "Ana Sayfa", icon: "home" },
  { href: "/akis", label: "Akış", icon: "feed" },
  { href: "/profil", label: "Profil", icon: "user" },
  { href: "/ayarlar", label: "Ayarlar", icon: "cog" },
];

function Icon({ name, active }: { name: string; active?: boolean }) {
  const common = "h-6 w-6";
  const cls = active ? "text-primary" : "text-base-content/70";
  return (
    <svg
      className={`${common} ${cls}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === "home" && (
        <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      )}
      {name === "feed" && (
        <>
          <rect x="3" y="4" width="18" height="4" rx="1" />
          <rect x="3" y="10" width="18" height="4" rx="1" />
          <rect x="3" y="16" width="12" height="4" rx="1" />
        </>
      )}
      {name === "user" && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      )}
      {name === "cog" && (
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6.9-3a6.9 6.9 0 0 1-.06.9l2.02 1.57-1.5 2.6-2.44-.6a6.96 6.96 0 0 1-1.56.9L15 21h-3l-.36-2.23a6.96 6.96 0 0 1-1.56-.9l-2.44.6-1.5-2.6 2.02-1.57a6.9 6.9 0 0 1-.06-.9c0-.3.02-.6.06-.9L6.14 8.53l1.5-2.6 2.44.6c.48-.36 1-.66 1.56-.9L12 3h3l.36 2.23c.56.24 1.08.54 1.56.9l2.44-.6 1.5 2.6-2.02 1.57c.04.3.06.6.06.9Z" />
      )}
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const setH = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--bottom-nav-h", `${Math.ceil(h)}px`);
    };
    setH();
    const ro = new ResizeObserver(setH);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      className="btm-nav btm-nav-sm md:btm-nav-md bg-base-100 border-t border-base-300 pb-safe shadow-lg"
      role="navigation"
      aria-label="Alt gezinme"
    >
      {items.map((it) => {
        const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={it.icon} active={active} />
            <span className="btm-nav-label text-xs">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

