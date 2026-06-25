import { BarChart3, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { AccesoPanelForm } from "@/components/public/AccesoPanelForm";

const CARACTERISTICAS = [
  {
    icon: MessageSquareText,
    titulo: "Bitácoras por WhatsApp",
    descripcion:
      "Tu equipo reporta su trabajo diario directamente por WhatsApp, sin formularios ni apps adicionales.",
  },
  {
    icon: Sparkles,
    titulo: "Puntaje de productividad con IA",
    descripcion: "Cada bitácora se analiza automáticamente y recibe un puntaje objetivo y consistente.",
  },
  {
    icon: BarChart3,
    titulo: "KPIs y reportes ejecutivos",
    descripcion: "Tendencias, distribución del equipo y reportes exportables listos para presentar.",
  },
  {
    icon: ShieldCheck,
    titulo: "Datos aislados por empresa",
    descripcion: "Cada empresa accede únicamente a su propia información, protegida por un código de acceso.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-gradient-mesh px-6 py-20 text-center sm:px-10">
          <h1 className="font-display mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            La productividad de tu equipo, medida con inteligencia artificial.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            TalentiX RD convierte las bitácoras diarias enviadas por WhatsApp en métricas claras de
            cumplimiento y desempeño para tu empresa.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <AccesoPanelForm />
            <p className="text-xs text-muted-foreground">
              ¿Ya eres cliente? Ingresa el identificador que te compartimos para acceder a tu panel.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CARACTERISTICAS.map((c) => (
              <div key={c.titulo} className="rounded-lg border border-border bg-card p-5 shadow-card">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <c.icon className="h-4 w-4" />
                </span>
                <p className="font-display mt-3 text-base font-semibold text-foreground">{c.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
