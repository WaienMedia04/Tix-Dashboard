import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface SeedTalento {
  nombre_completo: string;
  rol: string;
  proyectos_asignados: string;
  estado: string;
}

interface SeedWorklog {
  talento_nombre: string;
  fecha: string;
  dia: string | null;
  semana: number | null;
  actividades_realizadas: string | null;
  capacitacion: string | null;
  que_se_ejecuto: string | null;
  detalles_relevantes: string | null;
  informe_avances: string | null;
  objetivo_dia: string | null;
  estado_envio: string;
  hora_envio: string | null;
  puntaje_ia: number | null;
  calificacion_ceo: string | null;
  notas_tix: string | null;
}

interface SeedFile {
  empresa: { nombre: string; slug: string; plan: string };
  talentos: SeedTalento[];
  worklogs: SeedWorklog[];
}

interface EmpresaSeedInput {
  nombre: string;
  slug: string;
  plan: string;
  codigoAcceso: string;
  talentos: SeedTalento[];
  worklogs: SeedWorklog[];
}

async function crearEmpresaConDatos(input: EmpresaSeedInput) {
  const empresa = await prisma.empresa.create({
    data: {
      nombre: input.nombre,
      slug: input.slug,
      plan: input.plan,
      codigoAcceso: input.codigoAcceso,
    },
  });

  const talentoIdPorNombre = new Map<string, string>();
  for (const t of input.talentos) {
    const talento = await prisma.talento.create({
      data: {
        empresaId: empresa.id,
        nombreCompleto: t.nombre_completo,
        rol: t.rol,
        estado: t.estado,
      },
    });
    talentoIdPorNombre.set(t.nombre_completo, talento.id);
  }

  for (const w of input.worklogs) {
    const talentoId = talentoIdPorNombre.get(w.talento_nombre);
    if (!talentoId) {
      throw new Error(
        `Worklog referencia un talento inexistente: "${w.talento_nombre}" en empresa "${input.nombre}"`,
      );
    }
    // Algunas fechas del pilotaje real tienen mas de un registro para el
    // mismo talento (bug historico previo al constraint unico). Con
    // talentoId+fecha ya unico en el schema, hacemos upsert y nos quedamos
    // con la ultima ocurrencia del JSON para esa combinacion.
    const fecha = new Date(w.fecha);
    const datosWorklog = {
      empresaId: empresa.id,
      talentoId,
      fecha,
      dia: w.dia,
      semana: w.semana,
      actividadesRealizadas: w.actividades_realizadas,
      capacitacion: w.capacitacion,
      queSeEjecuto: w.que_se_ejecuto,
      detallesRelevantes: w.detalles_relevantes,
      informeAvances: w.informe_avances,
      objetivoDia: w.objetivo_dia,
      estadoEnvio: w.estado_envio,
      horaEnvio: w.hora_envio,
      puntajeIA: w.puntaje_ia,
      calificacionCeo: w.calificacion_ceo,
      notasTix: w.notas_tix,
    };
    await prisma.worklog.upsert({
      where: { talentoId_fecha: { talentoId, fecha } },
      create: datosWorklog,
      update: datosWorklog,
    });
  }

  return empresa;
}

function empresaDemoGenerica(numero: number): EmpresaSeedInput {
  const talentos: SeedTalento[] = [
    {
      nombre_completo: `Talento Demo ${numero}A`,
      rol: "Asesor Comercial",
      proyectos_asignados: "Cuenta Principal",
      estado: "activo",
    },
    {
      nombre_completo: `Talento Demo ${numero}B`,
      rol: "Soporte Técnico",
      proyectos_asignados: "Soporte Interno",
      estado: "activo",
    },
    {
      nombre_completo: `Talento Demo ${numero}C`,
      rol: "Coordinador de Proyectos",
      proyectos_asignados: "Onboarding Clientes",
      estado: "activo",
    },
  ];

  const fechas = ["2026-06-16", "2026-06-17", "2026-06-18"];
  const dias = ["Martes", "Miércoles", "Jueves"];

  const worklogs: SeedWorklog[] = [];
  talentos.forEach((talento, talentoIdx) => {
    fechas.forEach((fecha, fechaIdx) => {
      const enviada = !(talentoIdx === 1 && fechaIdx === 2);
      worklogs.push({
        talento_nombre: talento.nombre_completo,
        fecha,
        dia: dias[fechaIdx],
        semana: 25,
        actividades_realizadas: enviada
          ? `Tareas de ${talento.rol.toLowerCase()} del día: seguimiento de pendientes, reunión de equipo y avance en ${talento.proyectos_asignados}.`
          : null,
        capacitacion: enviada ? `Capacitación interna sobre procesos de ${talento.proyectos_asignados}.` : null,
        que_se_ejecuto: enviada ? "Pendientes del día atendidos y reportados a tiempo." : null,
        detalles_relevantes: enviada ? "Jornada sin incidentes relevantes." : null,
        informe_avances: enviada ? `Avance estable en ${talento.proyectos_asignados}.` : null,
        objetivo_dia: enviada ? "Mantener continuidad operativa y avanzar pendientes." : null,
        estado_envio: enviada ? "✅ Enviada" : "❌ No enviada",
        hora_envio: enviada ? "17:00" : null,
        puntaje_ia: enviada ? 7 + ((talentoIdx + fechaIdx) % 3) : 0,
        calificacion_ceo: null,
        notas_tix: enviada ? null : "Sin reporte recibido al cierre del día",
      });
    });
  });

  return {
    nombre: `Cliente Demo ${numero}`,
    slug: `cliente-demo-${numero}`,
    plan: numero === 1 ? "pro" : "starter",
    codigoAcceso: `DEMO${numero}-2026`,
    talentos,
    worklogs,
  };
}

async function main() {
  console.log("Limpiando datos previos...");
  await prisma.worklog.deleteMany();
  await prisma.talento.deleteMany();
  await prisma.empresa.deleteMany();

  console.log("Cargando empresa piloto desde seed/talentix-seed.json...");
  const seedPath = join(__dirname, "..", "seed", "talentix-seed.json");
  const seedFile = JSON.parse(readFileSync(seedPath, "utf-8")) as SeedFile;

  const empresaPiloto = await crearEmpresaConDatos({
    nombre: seedFile.empresa.nombre,
    slug: seedFile.empresa.slug,
    plan: seedFile.empresa.plan,
    codigoAcceso: "IAGIL-2026",
    talentos: seedFile.talentos,
    worklogs: seedFile.worklogs,
  });
  console.log(`✔ Empresa piloto creada: ${empresaPiloto.nombre} (/${empresaPiloto.slug})`);

  console.log("Cargando empresas demo...");
  const codigosDemo: string[] = [];
  for (const numero of [1, 2, 3, 4]) {
    const demo = empresaDemoGenerica(numero);
    const creada = await crearEmpresaConDatos(demo);
    codigosDemo.push(`${creada.nombre} → /${creada.slug} → código: ${demo.codigoAcceso}`);
  }

  console.log("\nSeed completado. Códigos de acceso para la demo:");
  console.log(`- ${empresaPiloto.nombre} → /${empresaPiloto.slug} → código: IAGIL-2026`);
  for (const linea of codigosDemo) console.log(`- ${linea}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
