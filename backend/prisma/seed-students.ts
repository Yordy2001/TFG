// Siembra de estudiantes de prueba: al menos 5 por cada curso del centro CE-0801.
// Requiere haber corrido antes la semilla de referencia (prisma/seed.ts).
//
// La matrícula sigue la misma regla que el formulario del frontend
// (student-form.component.ts): inicial del nombre + inicial de los dos primeros
// apellidos + AAMMDD de la fecha de registro + secuencia de 4 dígitos por prefijo.
// Ej.: "María Pérez Gómez" registrada el 2026-09-24 -> MPG2609240001.
//
// Idempotente por (curso, nombres, apellidos): re-ejecutar no duplica estudiantes.
// Si IDENTITY_HASH_SALT está definido, también crea el mapeo de identidad.
//
// Uso: npm run prisma:seed:students

import { PrismaClient, Sexo, type Curso } from '@prisma/client';
import { createHmac } from 'crypto';

const prisma = new PrismaClient();

const ESTUDIANTES_POR_CURSO = 6;

const NOMBRES: Array<[string, Sexo]> = [
  ['María', Sexo.F], ['José', Sexo.M], ['Ana', Sexo.F], ['Luis', Sexo.M],
  ['Carmen', Sexo.F], ['Miguel', Sexo.M], ['Rosa', Sexo.F], ['Pedro', Sexo.M],
  ['Yaritza', Sexo.F], ['Juan Carlos', Sexo.M], ['Daniela', Sexo.F], ['Rafael', Sexo.M],
  ['Paola', Sexo.F], ['Ángel', Sexo.M], ['Esther', Sexo.F], ['Wilson', Sexo.M],
  ['Leidy', Sexo.F], ['Héctor', Sexo.M],
];

const APELLIDOS = [
  'Pérez', 'Rodríguez', 'Gómez', 'Martínez', 'Santos', 'Reyes', 'Díaz', 'Almonte',
  'Tavárez', 'Núñez', 'Castillo', 'Vargas', 'Rosario', 'Peña', 'Fernández', 'Batista',
];

function matriculaPrefix(nombres: string, apellidos: string, fecha: Date): string {
  const nombreInitial = nombres.trim().charAt(0).toUpperCase();
  const tokens = apellidos.trim().split(/\s+/).filter(Boolean);
  const apellido1Initial = (tokens[0]?.charAt(0) ?? '').toUpperCase();
  const apellido2Initial = (tokens[1]?.charAt(0) ?? tokens[0]?.charAt(0) ?? '').toUpperCase();
  const yy = String(fecha.getFullYear()).slice(-2);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${nombreInitial}${apellido1Initial}${apellido2Initial}${yy}${mm}${dd}`;
}

function generateMatricula(nombres: string, apellidos: string, existing: string[], fecha: Date): string {
  const prefix = matriculaPrefix(nombres, apellidos, fecha);
  const count = existing.filter((m) => m.startsWith(prefix)).length;
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

/** Fecha de nacimiento acorde al grado (1ro ≈ 12 años, 3ro ≈ 14, ...). */
function fechaNacimientoPara(curso: Curso, indice: number, hoy: Date): string {
  const grado = parseInt(curso.gradoNivel, 10);
  const edad = Number.isNaN(grado) ? 14 : 11 + grado;
  const anio = hoy.getFullYear() - edad;
  const mes = ((indice * 5) % 12) + 1;
  const dia = ((indice * 7) % 28) + 1;
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

async function main() {
  const centro = await prisma.centroEducativo.findUnique({ where: { codigo: 'CE-0801' } });
  if (!centro) {
    throw new Error('No existe el centro CE-0801. Ejecuta primero la semilla de referencia (prisma/seed.ts).');
  }

  const cursos = await prisma.curso.findMany({ where: { centroId: centro.id }, orderBy: { nombre: 'asc' } });
  if (cursos.length === 0) {
    throw new Error('El centro no tiene cursos. Ejecuta primero la semilla de referencia (prisma/seed.ts).');
  }

  const salt = process.env.IDENTITY_HASH_SALT;
  const hoy = new Date();
  const existentes = (await prisma.estudiante.findMany({ select: { matricula: true } })).map((e) => e.matricula);

  let creados = 0;
  let global = 0;
  for (const curso of cursos) {
    for (let i = 0; i < ESTUDIANTES_POR_CURSO; i++, global++) {
      const [nombres, sexo] = NOMBRES[global % NOMBRES.length];
      const apellidos = `${APELLIDOS[global % APELLIDOS.length]} ${APELLIDOS[(global * 3 + 5) % APELLIDOS.length]}`;

      const yaExiste = await prisma.estudiante.findFirst({ where: { cursoId: curso.id, nombres, apellidos } });
      if (yaExiste) continue;

      const matricula = generateMatricula(nombres, apellidos, existentes, hoy);
      existentes.push(matricula);

      const estudiante = await prisma.estudiante.create({
        data: {
          centroId: centro.id,
          cursoId: curso.id,
          matricula,
          nombres,
          apellidos,
          sexo,
          fechaNacimiento: fechaNacimientoPara(curso, global, hoy),
        },
      });

      if (salt) {
        await prisma.identidadEstudianteMapping.create({
          data: {
            estudianteId: estudiante.id,
            centroId: centro.id,
            estudianteHash: createHmac('sha256', salt).update(estudiante.id).digest('hex'),
          },
        });
      }
      creados += 1;
    }
  }

  console.log(`Semilla de estudiantes completada: ${creados} creados en ${cursos.length} cursos.`);
  if (!salt) {
    console.log('IDENTITY_HASH_SALT no definido: ejecuta prisma/scripts/backfill-identity-hash.ts luego.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
