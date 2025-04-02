"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
