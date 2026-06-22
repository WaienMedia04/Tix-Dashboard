export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">Talentix</p>
        <p className="mt-3 text-sm text-foreground">{message}</p>
      </div>
    </div>
  );
}
