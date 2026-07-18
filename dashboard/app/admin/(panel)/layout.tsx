"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { leerTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

const TITULOS: Record<string, string> = {
  dashboard: "Dashboard global",
  empresas: "Gestión de empresas",
};

function AdminHeader({ onAbrirMenu }: { onAbrirMenu?: () => void }) {
  const pathname = usePathname();
  const segmento = pathname.split("/").filter(Boolean)[1] ?? "dashboard";
  const titulo = TITULOS[segmento] ?? "Panel de administración";

  return (
    <header className="pt-safe relative flex h-auto min-h-14 select-none items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 sm:h-16 sm:px-8 sm:py-0 print:hidden">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={onAbrirMenu}
          aria-label="Abrir menú"
          className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display truncate text-lg font-semibold text-foreground sm:text-xl">{titulo}</h1>
        <span className="hidden shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-bold tracking-wider text-primary uppercase sm:inline">
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
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    if (!listo) {
      router.replace("/admin");
    }
  }, [listo, router]);

  // Cierra el drawer si la ruta cambia por fuera de un tap en el propio menú.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuMovilAbierto(false);
  }, [pathname]);

  if (!listo) return <LoadingScreen />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background print:h-auto print:overflow-visible">
      <AdminSidebar abierto={menuMovilAbierto} onCerrar={() => setMenuMovilAbierto(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onAbrirMenu={() => setMenuMovilAbierto(true)} />
        <main className="bg-page-backdrop flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
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
