import { BrandMark } from "@/components/BrandMark";

export default function DocsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <BrandMark />
        <h1 className="mt-4 text-xl font-semibold text-foreground">Documentación</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esta sección está en construcción.</p>
      </div>
    </div>
  );
}
