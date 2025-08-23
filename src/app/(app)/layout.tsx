"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      (async () => {
        try {
          await api.get("/docs", { headers: { Accept: "text/html" }, timeout: 3000 });
        } catch {
          try {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("backend_offline", "1");
            }
          } catch {}
          logout();
        }
      })();
    }
  }, [isLoading, isAuthenticated, logout]);

  if (isLoading || !isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return <AppLayout>{children}</AppLayout>;
}
