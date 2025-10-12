"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { MembershipSnapshot } from "@/types/membership";

type MembershipContextValue = {
  membership: MembershipSnapshot;
  updateMembership: (next: MembershipSnapshot) => void;
};

const MembershipContext = createContext<MembershipContextValue | undefined>(undefined);

type MembershipProviderProps = {
  initialMembership: MembershipSnapshot;
  children: ReactNode;
};

export function MembershipProvider({ initialMembership, children }: MembershipProviderProps) {
  const [membership, setMembership] = useState<MembershipSnapshot>(initialMembership);

  const value = useMemo<MembershipContextValue>(
    () => ({
      membership,
      updateMembership: setMembership,
    }),
    [membership],
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembershipState() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("MembershipProvider bulunmadan membership durumuna eri\u015Fmeye \u00E7al\u0131\u015Ft\u0131n\u0131z.");
  }
  return context;
}

export function useMembership() {
  return useMembershipState().membership;
}
