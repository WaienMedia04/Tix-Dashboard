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

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: junio de 2026.</p>

        <div className="mt-10 space-y-8">
          <Seccion titulo="1. Información que recopilamos">
            <p>
              TalentiX RD recopila la información que los colaboradores de una empresa reportan
              voluntariamente a través del asistente de WhatsApp (bitácoras de actividad diaria), así
              como los datos básicos de identificación de empleados que la empresa registra en el panel
              (nombre y rol).
            </p>
          </Seccion>

          <Seccion titulo="2. Confidencialidad de los datos de empleados">
            <p>
              Los datos de bitácoras y empleados de cada empresa son estrictamente confidenciales y solo
              son accesibles por esa misma empresa, a través de su código de acceso único. Ninguna
              empresa puede ver, consultar ni modificar los datos de empleados de otra empresa que utilice
              la Plataforma.
            </p>
            <p>
              TalentiX RD no comparte, vende ni cede a terceros la información de bitácoras o empleados de
              ninguna empresa cliente.
            </p>
          </Seccion>

          <Seccion titulo="3. Cómo se utiliza la información">
            <p>
              La información recopilada se utiliza exclusivamente para generar las métricas, reportes y
              puntajes de productividad que la Plataforma presenta a la empresa contratante, y para dar
              soporte y mantenimiento al servicio.
            </p>
          </Seccion>

          <Seccion titulo="4. Conservación de datos">
            <p>
              Los datos se conservan mientras la empresa mantenga una relación contractual activa con
              TalentiX RD. La empresa puede solicitar la eliminación de los datos de su cuenta al
              finalizar dicha relación, conforme a los términos contractuales acordados.
            </p>
          </Seccion>

          <Seccion titulo="5. Derechos de los colaboradores">
            <p>
              Los colaboradores cuyas bitácoras se procesan a través de la Plataforma pueden solicitar a
              su empresa empleadora información sobre los datos que se han registrado a su nombre. Es
              responsabilidad de la empresa contratante atender estas solicitudes conforme a su propia
              política interna y a la legislación laboral aplicable.
            </p>
          </Seccion>

          <Seccion titulo="6. Seguridad de la información">
            <p>
              TalentiX RD implementa medidas de seguridad razonables para proteger la información contra
              accesos no autorizados, incluyendo controles de acceso por empresa y buenas prácticas de la
              industria para el almacenamiento de datos.
            </p>
          </Seccion>

          <Seccion titulo="7. Cambios a esta política">
            <p>
              Esta Política de Privacidad puede actualizarse periódicamente. Cualquier cambio relevante
              será comunicado a las empresas clientes a través de los canales de contacto registrados.
            </p>
          </Seccion>

          <Seccion titulo="8. Contacto">
            <p>
              Para consultas relacionadas con esta Política de Privacidad, la empresa contratante puede
              comunicarse a través de los canales de soporte provistos al momento de la contratación.
            </p>
          </Seccion>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
