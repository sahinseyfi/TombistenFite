"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Ana Sayfa", icon: "home" },
  { href: "/profil", label: "Profil", icon: "user" },
  { href: "/ayarlar", label: "Ayarlar", icon: "cog" },
];

function Icon({ name }: { name: string }) {
  // Basit emoji ikonlar (yer tutucu). İleride bir ikon seti ekleyebiliriz.
  const map: Record<string, string> = { home: "🏠", user: "👤", cog: "⚙️" };
  return <span aria-hidden>{map[name] ?? "•"}</span>;
}

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="btm-nav btm-nav-sm md:btm-nav-md bg-base-100 border-t border-base-300">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link key={it.href} href={it.href} className={active ? "active" : ""}>
            <Icon name={it.icon} />
            <span className="btm-nav-label text-xs">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

