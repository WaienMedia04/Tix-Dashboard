import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function PublicHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-5 sm:px-10">
      <Link href="/">
        <BrandMark />
      </Link>
      <nav className="flex items-center gap-6 text-sm text-muted-foreground">
        <Link href="/docs" className="transition-colors hover:text-foreground">
          Documentación
        </Link>
        <Link href="/legal/terminos" className="hidden transition-colors hover:text-foreground sm:inline">
          Términos
        </Link>
        <Link href="/legal/privacidad" className="hidden transition-colors hover:text-foreground sm:inline">
          Privacidad
        </Link>
      </nav>
    </header>
  );
}
