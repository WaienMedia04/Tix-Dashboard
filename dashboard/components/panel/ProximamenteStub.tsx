export function ProximamenteStub({ titulo }: { titulo: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-surface-border text-center">
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      <p className="mt-1 text-sm text-muted">Esta sección está en construcción.</p>
    </div>
  );
}
