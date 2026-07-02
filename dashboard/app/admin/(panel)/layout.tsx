"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { leerTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

const TITULOS: Record<string, string> = {
  dashboard: "Dashboard global",
  empresas: "Gestión de empresas",
};

function AdminHeader() {
  const pathname = usePathname();
  const segmento = pathname.split("/").filter(Boolean)[1] ?? "dashboard";
  const titulo = TITULOS[segmento] ?? "Panel de administración";

  return (
    <header className="relative flex h-16 select-none items-center justify-between border-b border-border bg-background px-8 print:hidden">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-semibold text-foreground">{titulo}</h1>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold tracking-wider text-primary uppercase">
          Admin
        </span>
      </div>
    </header>
  );
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [listo] = useState(() => {
    if (typeof window === "undefined") return false;
    return leerTokenAdmin() !== null;
  });

  useEffect(() => {
    if (!listo) {
      router.replace("/admin");
    }
  }, [listo, router]);

  if (!listo) return <LoadingScreen />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background print:h-auto print:overflow-visible">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="bg-page-backdrop flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
