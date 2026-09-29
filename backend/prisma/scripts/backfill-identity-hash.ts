// Backfill manual del hash de identidad para estudiantes existentes que fueron
// creados antes de introducir IdentidadEstudianteMapping. No se ejecuta
// automáticamente: correr a mano después de revisar IDENTITY_HASH_SALT en el
// entorno de destino.
//
// Uso: npx ts-node prisma/scripts/backfill-identity-hash.ts

import { PrismaClient } from '@prisma/client';
import { createHmac } from 'crypto';

const prisma = new PrismaClient();

function hash(estudianteId: string, salt: string): string {
  return createHmac('sha256', salt).update(estudianteId).digest('hex');
}

async function main() {
  const salt = process.env.IDENTITY_HASH_SALT;
  if (!salt) {
    throw new Error('IDENTITY_HASH_SALT no está configurado en el entorno.');
  }

  const estudiantes = await prisma.estudiante.findMany({ select: { id: true, centroId: true } });
  let creados = 0;

  for (const estudiante of estudiantes) {
    const existente = await prisma.identidadEstudianteMapping.findUnique({
      where: { estudianteId: estudiante.id },
    });
    if (existente) continue;

    await prisma.identidadEstudianteMapping.create({
      data: {
        estudianteId: estudiante.id,
        centroId: estudiante.centroId,
        estudianteHash: hash(estudiante.id, salt),
      },
    });
    creados += 1;
  }

  console.log(`Backfill completo: ${creados} mapeos creados de ${estudiantes.length} estudiantes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
