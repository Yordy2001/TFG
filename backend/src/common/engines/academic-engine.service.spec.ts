/**
 * Pruebas unitarias del AcademicEngineService.
 *
 * Valida (con Prisma simulado por mocks) la conversión de datos crudos
 * (calificaciones y asistencia) en los indicadores que consume el motor de
 * riesgo: promedio general, número de asignaturas en bajo rendimiento
 * (nota < 70) y porcentaje de inasistencia (solo estado AUSENTE).
 *
 * No modifica ninguna regla de negocio.
 */
import { AcademicEngineService } from './academic-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAsistencia } from '../enums';

/**
 * Construye un mock de Prisma en el que cada asignatura tiene una única
 * actividad (peso 100 %) con la nota indicada, de modo que el promedio del
 * período de esa asignatura es exactamente esa nota.
 */
function prismaConNotas(notas: number[], asistencia: EstadoAsistencia[] = []) {
  const asignaciones = notas.map((_, i) => ({
    id: `asig-${i}`,
    asignatura: { id: `mat-${i}`, nombre: `Materia ${i}` },
  }));
  const actividades = notas.map((_, i) => ({
    id: `act-${i}`,
    asignacionDocenteId: `asig-${i}`,
    porcentaje: 100,
    competencia: 'C1_COMUNICATIVA',
  }));
  const registros = notas.map((nota, i) => ({ actividadId: `act-${i}`, nota }));

  return {
    asignacionDocente: { findMany: jest.fn().mockResolvedValue(asignaciones) },
    actividadEvaluacion: { findMany: jest.fn().mockResolvedValue(actividades) },
    registroEvaluacion: { findMany: jest.fn().mockResolvedValue(registros) },
    asistenciaRegistro: {
      findMany: jest.fn().mockResolvedValue(asistencia.map((estado, i) => ({ id: `as-${i}`, estado }))),
    },
  } as unknown as PrismaService;
}

describe('AcademicEngineService (motor académico)', () => {
  describe('promedioGeneral()', () => {
    it('8 asignaturas en 100 → promedio general 100', async () => {
      const engine = new AcademicEngineService(prismaConNotas(Array(8).fill(100)));
      expect(await engine.promedioGeneral('est-1', 'curso-1')).toBe(100);
    });

    it('promedios 70 y 69 → promedio general 69.5 (soporta CP-11)', async () => {
      const engine = new AcademicEngineService(prismaConNotas([70, 69]));
      expect(await engine.promedioGeneral('est-1', 'curso-1')).toBe(69.5);
    });
  });

  describe('asignaturasEnBajoRendimiento() — umbral nota < 70', () => {
    it('promedios 70 y 69 → 1 asignatura reprobada (70 NO es reprobado, 69 sí)', async () => {
      const engine = new AcademicEngineService(prismaConNotas([70, 69]));
      expect(await engine.asignaturasEnBajoRendimiento('est-1', 'curso-1')).toBe(1);
    });

    it('4×30 y 4×70 → 4 asignaturas reprobadas (soporta CP-04)', async () => {
      const engine = new AcademicEngineService(prismaConNotas([30, 30, 30, 30, 70, 70, 70, 70]));
      expect(await engine.asignaturasEnBajoRendimiento('est-1', 'curso-1')).toBe(4);
    });
  });

  describe('porcentajeAsistencia() — inasistencia = solo estado AUSENTE', () => {
    it('CP-09: 6 presentes, 3 tardanzas y 1 ausencia justificada → inasistencia 0 %', async () => {
      const registros: EstadoAsistencia[] = [
        ...Array(6).fill(EstadoAsistencia.PRESENTE),
        ...Array(3).fill(EstadoAsistencia.TARDANZA),
        EstadoAsistencia.AUSENCIA_JUSTIFICADA,
      ];
      const engine = new AcademicEngineService(prismaConNotas([], registros));
      const resultado = await engine.porcentajeAsistencia('est-1');

      expect(resultado.ausencias).toBe(0);
      expect(resultado.asistencia).toBe(60);
      expect(resultado.tardanzas).toBe(30);
    });

    it('sin registros de asistencia → inasistencia 0 % (asistencia 100 %)', async () => {
      const engine = new AcademicEngineService(prismaConNotas([], []));
      const resultado = await engine.porcentajeAsistencia('est-1');
      expect(resultado.ausencias).toBe(0);
      expect(resultado.asistencia).toBe(100);
    });
  });
});
