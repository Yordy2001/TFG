// Siembra de datos de referencia para el centro educativo real (Santiago Oeste, Regional 08).
// Deliberadamente NO incluye estudiantes ni ningún dato que dependa de estudiantes
// (asistencia, calificaciones, riesgo, seguimientos, observaciones de aula).
//
// Los campos marcados "PLACEHOLDER" deben reemplazarse por los datos reales de la
// institución antes de usarse en producción.
//
// Idempotente por clave natural (no por id): re-ejecutar este script no duplica
// filas. Los ids siempre son UUID reales generados por Prisma, ya que varios DTOs
// del API (p. ej. CreateStudentDto.cursoId) validan @IsUUID().

import { PrismaClient, Role, type Curso, type Asignatura } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const centro = await prisma.centroEducativo.upsert({
    where: { codigo: 'CE-0801' },
    update: {},
    create: {
      codigo: 'CE-0801', // PLACEHOLDER: código institucional real
      nombre: 'Centro Educativo Santiago Oeste', // PLACEHOLDER: nombre real de la institución
      telefono: '000-000-0000', // PLACEHOLDER
      distritoEducativo: '08-99', // PLACEHOLDER: distrito educativo real
      regional: '08',
      provincia: 'Santiago',
      municipio: 'Santiago Oeste',
      director: 'Pendiente de asignar', // PLACEHOLDER: nombre real del director/a
    },
  });

  const passwordHash = bcrypt.hashSync('Password123!', 12);
  const roleUsers: Array<[Role, string, string, string]> = [
    [Role.ADMINISTRADOR, 'Ana', 'Administrador', 'admin@centro.edu.do'],
    [Role.REGISTRO, 'Rosa', 'Registro', 'registro@centro.edu.do'],
    [Role.DIRECTOR, 'Carlos', 'Director', 'director@centro.edu.do'],
    [Role.DOCENTE, 'Juan', 'Docente', 'docente@centro.edu.do'],
    [Role.ORIENTADOR, 'Laura', 'Orientadora', 'orientador@centro.edu.do'],
  ];

  const usuariosPorRol = new Map<Role, { id: string }>();
  for (const [rol, nombres, apellidos, email] of roleUsers) {
    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: { centroId: centro.id, rol, nombres, apellidos, email, passwordHash, activo: true },
    });
    usuariosPorRol.set(rol, usuario);
  }
  const docente = usuariosPorRol.get(Role.DOCENTE)!;

  let periodo = await prisma.periodoAcademico.findFirst({ where: { centroId: centro.id, nombre: '2026-2027' } });
  if (!periodo) {
    periodo = await prisma.periodoAcademico.create({
      data: { centroId: centro.id, nombre: '2026-2027', activo: true },
    });
  }

  const cursosDef = ['3ro A', '4to B', '5to C'];
  const cursos: Curso[] = [];
  for (const nombre of cursosDef) {
    const [gradoNivel, seccion] = nombre.split(' ');
    let curso = await prisma.curso.findFirst({ where: { centroId: centro.id, nombre } });
    if (!curso) {
      curso = await prisma.curso.create({ data: { centroId: centro.id, nombre, gradoNivel, seccion } });
    }
    cursos.push(curso);
  }

  const asignaturasDef = ['Matemática', 'Ciencias', 'Lengua Española'];
  const asignaturas: Asignatura[] = [];
  for (const nombre of asignaturasDef) {
    let asignatura = await prisma.asignatura.findFirst({ where: { centroId: centro.id, nombre } });
    if (!asignatura) {
      asignatura = await prisma.asignatura.create({ data: { centroId: centro.id, nombre } });
    }
    asignaturas.push(asignatura);
  }

  for (const curso of cursos) {
    for (const asignatura of asignaturas) {
      const existente = await prisma.asignacionDocente.findFirst({
        where: { cursoId: curso.id, asignaturaId: asignatura.id, docenteId: docente.id },
      });
      if (!existente) {
        await prisma.asignacionDocente.create({
          data: {
            centroId: centro.id,
            docenteId: docente.id,
            cursoId: curso.id,
            asignaturaId: asignatura.id,
            periodoAcademicoId: periodo.id,
          },
        });
      }
    }
  }

  console.log('Semilla de referencia completada (sin estudiantes) para el centro:', centro.nombre);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
