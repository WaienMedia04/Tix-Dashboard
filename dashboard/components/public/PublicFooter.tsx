import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border px-6 py-8 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} TalentiX RD. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Documentación
          </Link>
          <Link href="/legal/terminos" className="transition-colors hover:text-foreground">
            Términos de Servicio
          </Link>
          <Link href="/legal/privacidad" className="transition-colors hover:text-foreground">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
