import { BrandMark } from "./BrandMark";

export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center shadow-card">
        <BrandMark />
        <p className="mt-3 text-sm text-foreground">{message}</p>
      </div>
    </div>
  );
}
