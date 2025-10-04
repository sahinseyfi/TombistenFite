"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      const session = data.session;
      if (!session) {
        const ret = encodeURIComponent(pathname || "/");
        router.replace(`/giris?ret=${ret}`);
      } else {
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="loading loading-spinner loading-md" aria-label="Yükleniyor" />
      </div>
    );
  }
  return <>{children}</>;
}

