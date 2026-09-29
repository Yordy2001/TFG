// Siembra de actividades de evaluación para cada asignación docente del centro CE-0801.
// Requiere haber corrido antes la semilla de referencia (prisma/seed.ts).
//
// Por cada asignación, período evaluativo (P1–P4) y competencia se crean 4
// actividades cuyos porcentajes suman exactamente 100.
//
// Idempotente por (asignación, período, competencia, nombre): re-ejecutar no duplica filas.
//
// Uso: npm run prisma:seed:activities

import { PrismaClient, Competencia, PeriodoEvaluativo } from '@prisma/client';

const prisma = new PrismaClient();

const ACTIVIDADES_POR_COMPETENCIA: Record<Competencia, Array<[string, number]>> = {
  [Competencia.C1_COMUNICATIVA]: [
    ['Lectura comprensiva', 20],
    ['Exposición oral', 25],
    ['Producción escrita', 25],
    ['Prueba escrita', 30],
  ],
  [Competencia.C2_LOGICO_CIENTIFICA]: [
    ['Práctica de ejercicios', 20],
    ['Resolución de problemas', 25],
    ['Proyecto de indagación', 25],
    ['Prueba escrita', 30],
  ],
  [Competencia.C3_ETICA_CIUDADANA]: [
    ['Participación en clase', 20],
    ['Trabajo colaborativo', 25],
    ['Debate', 25],
    ['Portafolio', 30],
  ],
};

// Fechas base de cada período dentro del año escolar 2026-2027.
const INICIO_PERIODO: Record<PeriodoEvaluativo, string> = {
  [PeriodoEvaluativo.P1]: '2026-09-07',
  [PeriodoEvaluativo.P2]: '2026-11-09',
  [PeriodoEvaluativo.P3]: '2027-01-11',
  [PeriodoEvaluativo.P4]: '2027-04-05',
};

function sumarDias(fechaIso: string, dias: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

async function main() {
  for (const [competencia, actividades] of Object.entries(ACTIVIDADES_POR_COMPETENCIA)) {
    const total = actividades.reduce((sum, [, porcentaje]) => sum + porcentaje, 0);
    if (total !== 100) throw new Error(`Los pesos de ${competencia} suman ${total}, deben sumar 100.`);
  }

  const centro = await prisma.centroEducativo.findUnique({ where: { codigo: 'CE-0801' } });
  if (!centro) {
    throw new Error('No existe el centro CE-0801. Ejecuta primero la semilla de referencia (prisma/seed.ts).');
  }

  const asignaciones = await prisma.asignacionDocente.findMany({ where: { centroId: centro.id } });
  if (asignaciones.length === 0) {
    throw new Error('El centro no tiene asignaciones docentes. Ejecuta primero la semilla de referencia (prisma/seed.ts).');
  }

  let creadas = 0;
  for (const asignacion of asignaciones) {
    for (const periodoEvaluativo of Object.values(PeriodoEvaluativo)) {
      for (const [competenciaKey, actividades] of Object.entries(ACTIVIDADES_POR_COMPETENCIA)) {
        const competencia = competenciaKey as Competencia;
        for (const [indice, [nombre, porcentaje]] of actividades.entries()) {
          const existente = await prisma.actividadEvaluacion.findFirst({
            where: { asignacionDocenteId: asignacion.id, periodoEvaluativo, competencia, nombre },
          });
          if (existente) continue;

          await prisma.actividadEvaluacion.create({
            data: {
              centroId: centro.id,
              asignacionDocenteId: asignacion.id,
              nombre,
              competencia,
              porcentaje,
              periodoEvaluativo,
              fecha: sumarDias(INICIO_PERIODO[periodoEvaluativo], indice * 14),
            },
          });
          creadas += 1;
        }
      }
    }
  }

  console.log(`Semilla de actividades completada: ${creadas} creadas para ${asignaciones.length} asignaciones.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
