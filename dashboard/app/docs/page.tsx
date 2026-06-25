import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold text-foreground">{titulo}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Documentación</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Guía de uso de TalentiX RD: cómo funciona el bot de WhatsApp, cómo se reportan las bitácoras y
          cómo interpretar las métricas del panel.
        </p>

        <div className="mt-10 space-y-10">
          <Seccion titulo="¿Cómo funciona el bot de WhatsApp?">
            <p>
              Cada miembro del equipo recibe, al final de su jornada, un mensaje del bot de TalentiX
              preguntando por su trabajo del día. El bot guía la conversación con un set breve de
              preguntas: actividades realizadas, qué se ejecutó, detalles relevantes, avances y el
              objetivo del día siguiente.
            </p>
            <p>
              Las respuestas se envían directamente por WhatsApp, sin necesidad de instalar una
              aplicación adicional ni de llenar formularios externos.
            </p>
          </Seccion>

          <Seccion titulo="¿Cómo se registran las bitácoras?">
            <p>
              Una vez el colaborador responde, el bot registra una bitácora con la fecha, la hora de
              envío y el contenido reportado. Si el colaborador no responde en la ventana del día, la
              bitácora queda registrada como &ldquo;No enviada&rdquo; para ese día.
            </p>
            <p>
              Algunas ausencias están justificadas de antemano (por ejemplo, un permiso autorizado por la
              empresa); en esos casos la bitácora se marca con ese estado en lugar de contar como un
              envío pendiente.
            </p>
          </Seccion>

          <Seccion titulo="¿Cómo se calcula el puntaje de IA?">
            <p>
              Un modelo de inteligencia artificial analiza el contenido de cada bitácora enviada y le
              asigna un puntaje de 0 a 10, en función de la claridad, el nivel de detalle y la relevancia
              de lo reportado frente al objetivo del rol.
            </p>
            <p>
              El puntaje es una guía objetiva de la calidad del reporte, no una evaluación de desempeño
              completa. Se recomienda usarlo junto con el criterio del responsable directo del equipo.
            </p>
          </Seccion>

          <Seccion titulo="¿Cómo se interpretan las métricas del panel?">
            <p>
              <strong className="text-foreground">% de cumplimiento:</strong> proporción de bitácoras
              enviadas sobre el total de bitácoras esperadas en el período seleccionado.
            </p>
            <p>
              <strong className="text-foreground">Puntaje IA promedio:</strong> promedio de los puntajes
              de IA de las bitácoras que sí tienen un puntaje calculado. Si un empleado no tiene ninguna
              bitácora puntuada en el período, el panel muestra un guion (&ldquo;—&rdquo;) en vez de un
              cero, para no confundir &ldquo;sin datos&rdquo; con &ldquo;bajo desempeño&rdquo;.
            </p>
            <p>
              <strong className="text-foreground">Tendencia:</strong> compara el puntaje promedio del
              período actual contra el período anterior. Solo se muestra una tendencia cuando existe
              información real de ambos períodos.
            </p>
          </Seccion>

          <Seccion titulo="Preguntas frecuentes">
            <p>
              <strong className="text-foreground">¿Qué pasa si un empleado nuevo no tiene historial?</strong>{" "}
              Sus métricas se muestran como &ldquo;—&rdquo; hasta que tenga al menos una bitácora registrada. El
              panel nunca completa esos espacios con datos estimados.
            </p>
            <p>
              <strong className="text-foreground">¿Quién puede ver los datos de mi empresa?</strong>{" "}
              Únicamente las personas que tengan el código de acceso de tu empresa. Cada empresa solo
              puede ver su propia información.
            </p>
            <p>
              <strong className="text-foreground">¿Puedo exportar los reportes?</strong> Sí, desde la
              sección Reportes del panel puedes exportar a PDF o a Excel (CSV) el período que estés
              consultando.
            </p>
          </Seccion>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
