import { BrandMark } from "./BrandMark";

export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm rounded-md border border-surface-border bg-background p-8 text-center shadow-sm">
        <BrandMark />
        <p className="mt-3 text-sm text-foreground">{message}</p>
      </div>
    </div>
  );
}
