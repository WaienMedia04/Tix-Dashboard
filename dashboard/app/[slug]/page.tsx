"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { leerCodigoGuardado } from "@/lib/auth";
import { AccessGate } from "@/components/AccessGate";
import { LoadingScreen } from "@/components/LoadingScreen";

function LoginInterno({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [yaTieneCodigo] = useState<boolean>(() => leerCodigoGuardado(slug) !== null);

  useEffect(() => {
    if (yaTieneCodigo) {
      router.replace(`/${slug}/dashboard`);
    }
  }, [yaTieneCodigo, slug, router]);

  if (yaTieneCodigo) return <LoadingScreen />;

  const initialError =
    searchParams.get("error") === "codigo_invalido"
      ? "Tu código de acceso ya no es válido. Ingrésalo nuevamente."
      : null;

  return (
    <AccessGate slug={slug} initialError={initialError} onUnlock={() => router.push(`/${slug}/dashboard`)} />
  );
}

export default function LoginPage() {
  const params = useParams<{ slug: string }>();
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginInterno key={params.slug} slug={params.slug} />
    </Suspense>
  );
}
