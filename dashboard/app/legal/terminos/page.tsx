import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-foreground">{titulo}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function TerminosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Términos de Servicio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: junio de 2026.</p>

        <div className="mt-10 space-y-8">
          <Seccion titulo="1. Aceptación de los términos">
            <p>
              Al acceder o utilizar la plataforma TalentiX RD (&ldquo;la Plataforma&rdquo;, &ldquo;el
              Servicio&rdquo;), operada
              para fines de gestión de productividad de equipos de trabajo, la empresa contratante y sus
              usuarios autorizados aceptan los presentes Términos de Servicio. Si no estás de acuerdo con
              alguno de estos términos, no debes utilizar la Plataforma.
            </p>
          </Seccion>

          <Seccion titulo="2. Descripción del servicio">
            <p>
              TalentiX RD es un servicio de software como servicio (SaaS) que permite a empresas
              registrar, mediante un asistente automatizado en WhatsApp, las bitácoras diarias de
              actividad de su personal, y visualizar métricas de cumplimiento y desempeño derivadas de
              esa información en un panel web.
            </p>
          </Seccion>

          <Seccion titulo="3. Cuentas y código de acceso">
            <p>
              El acceso al panel de cada empresa se realiza mediante un código de acceso único, entregado
              por TalentiX RD a la empresa contratante. La empresa es responsable de mantener la
              confidencialidad de su código de acceso y de cualquier actividad que ocurra utilizando
              dicho código.
            </p>
            <p>
              TalentiX RD no se hace responsable por accesos no autorizados que resulten de la divulgación
              del código de acceso por parte de la empresa o sus colaboradores.
            </p>
          </Seccion>

          <Seccion titulo="4. Uso aceptable">
            <p>
              La empresa contratante se compromete a utilizar la Plataforma de conformidad con las leyes
              aplicables de la República Dominicana, incluyendo la normativa laboral y de protección de
              datos personales, y a no utilizar la información generada por la Plataforma para fines
              discriminatorios o contrarios a los derechos de sus colaboradores.
            </p>
          </Seccion>

          <Seccion titulo="5. Propiedad de los datos">
            <p>
              Los datos de bitácoras, empleados y métricas generados por el uso de la Plataforma
              pertenecen a la empresa contratante. TalentiX RD actúa como proveedor de la infraestructura
              técnica para su recolección, procesamiento y visualización.
            </p>
          </Seccion>

          <Seccion titulo="6. Disponibilidad y soporte">
            <p>
              TalentiX RD realiza esfuerzos razonables para mantener la Plataforma disponible de forma
              continua, sin garantizar un nivel de disponibilidad del cien por ciento. El soporte técnico
              se brinda según el plan contratado por la empresa.
            </p>
          </Seccion>

          <Seccion titulo="7. Limitación de responsabilidad">
            <p>
              TalentiX RD no será responsable por decisiones de gestión de personal tomadas por la
              empresa contratante con base en las métricas o puntajes generados por la Plataforma. Las
              métricas son una herramienta de apoyo informativo y no constituyen una evaluación legal o
              definitiva del desempeño de ningún colaborador.
            </p>
          </Seccion>

          <Seccion titulo="8. Modificaciones a estos términos">
            <p>
              TalentiX RD podrá actualizar estos Términos de Servicio en cualquier momento. Los cambios
              relevantes serán comunicados a la empresa contratante por los medios de contacto registrados.
            </p>
          </Seccion>

          <Seccion titulo="9. Ley aplicable">
            <p>
              Estos Términos de Servicio se rigen por las leyes de la República Dominicana. Cualquier
              controversia derivada de su interpretación o cumplimiento será sometida a los tribunales
              competentes de la República Dominicana.
            </p>
          </Seccion>

          <Seccion titulo="10. Contacto">
            <p>
              Para consultas relacionadas con estos Términos de Servicio, la empresa contratante puede
              comunicarse a través de los canales de soporte provistos al momento de la contratación.
            </p>
          </Seccion>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
