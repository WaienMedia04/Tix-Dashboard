import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center shadow-card">
        <BrandMark />
        <p className="mt-3 text-sm text-foreground">Esta página no existe o fue movida.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
