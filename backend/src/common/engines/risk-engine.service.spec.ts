/**
 * Pruebas unitarias del RiskEngineService.
 *
 * Objetivo: documentar (para la tesis) que el motor de riesgo produce el
 * Índice de Riesgo de Reincidencia/abandono (IRR) y el nivel esperados para un
 * conjunto de casos de prueba (CP-01 .. CP-14), SIN modificar la lógica, los
 * pesos ni los umbrales.
 *
 * Estrategia de aislamiento (unidad):
 *  - PrismaService se simula con mocks (solo se usa para leer los incidentes
 *    disciplinarios del estudiante y para persistir riesgo/historial).
 *  - AcademicEngineService se simula devolviendo directamente los indicadores
 *    académicos de cada caso (promedio general, % de ausencias, número de
 *    asignaturas en bajo rendimiento y total de asignaturas). La conversión
 *    real de calificaciones/asistencia a esos indicadores se valida aparte en
 *    academic-engine.service.spec.ts.
 */
import { RiskEngineService } from './risk-engine.service';
import { AcademicEngineService } from './academic-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { NivelRiesgo } from '../enums';

interface EscenarioAcademico {
  promedio: number; // promedio general (0-100)
  ausencias: number; // % de inasistencia (solo estado AUSENTE)
  bajoCount: number; // asignaturas con promedio < 70
  total: number; // total de asignaturas
  incidentes: number; // incidentes disciplinarios
}

function crearMotor(esc: EscenarioAcademico) {
  const academic = {
    promedioGeneral: jest.fn().mockResolvedValue(esc.promedio),
    porcentajeAsistencia: jest
      .fn()
      .mockResolvedValue({ asistencia: 100 - esc.ausencias, ausencias: esc.ausencias, tardanzas: 0 }),
    asignaturasEnBajoRendimiento: jest.fn().mockResolvedValue(esc.bajoCount),
    resultadosPorAsignatura: jest.fn().mockResolvedValue(new Array(esc.total).fill({})),
  } as unknown as AcademicEngineService;

  const prisma = {
    estudiante: {
      findUnique: jest.fn().mockResolvedValue({ id: 'est-1', incidentesDisciplinarios: esc.incidentes }),
    },
    historialRiesgo: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
    riesgo: {
      // Devuelve el objeto que el servicio intenta crear, para poder inspeccionar
      // el porcentaje/nivel finales calculados.
      upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve({ id: 'riesgo-1', ...create })),
    },
  } as unknown as PrismaService;

  const service = new RiskEngineService(prisma, academic);
  return { service, prisma, academic };
}

describe('RiskEngineService (motor de riesgo)', () => {
  describe('calcular() — puntaje del sistema y nivel', () => {
    const casos: Array<{
      id: string;
      descripcion: string;
      esc: EscenarioAcademico;
      esperadoIRR: number;
      esperadoNivel: NivelRiesgo;
    }> = [
      {
        id: 'CP-01',
        descripcion: '8×100, inasistencia 0 %, 0 incidentes',
        esc: { promedio: 100, ausencias: 0, bajoCount: 0, total: 8, incidentes: 0 },
        esperadoIRR: 0,
        esperadoNivel: NivelRiesgo.BAJO,
      },
      {
        id: 'CP-02',
        descripcion: '8×85, 5 %, 0 incidentes',
        esc: { promedio: 85, ausencias: 5, bajoCount: 0, total: 8, incidentes: 0 },
        esperadoIRR: 7,
        esperadoNivel: NivelRiesgo.BAJO,
      },
      {
        id: 'CP-03',
        descripcion: '8×0, 100 %, 4 incidentes',
        esc: { promedio: 0, ausencias: 100, bajoCount: 8, total: 8, incidentes: 4 },
        esperadoIRR: 90,
        esperadoNivel: NivelRiesgo.ALTO,
      },
      {
        id: 'CP-04',
        descripcion: '4×30 y 4×70, 80 %, 0 incidentes (70 no es reprobado)',
        esc: { promedio: 50, ausencias: 80, bajoCount: 4, total: 8, incidentes: 0 },
        esperadoIRR: 49,
        esperadoNivel: NivelRiesgo.BAJO,
      },
      {
        id: 'CP-05',
        descripcion: '4×26 y 4×70, 80 %, 0 incidentes (frontera Bajo/Medio)',
        esc: { promedio: 48, ausencias: 80, bajoCount: 4, total: 8, incidentes: 0 },
        esperadoIRR: 50,
        esperadoNivel: NivelRiesgo.MEDIO,
      },
      {
        id: 'CP-06',
        descripcion: '8×7, 80 %, 3 incidentes (justo debajo de Alto)',
        esc: { promedio: 7, ausencias: 80, bajoCount: 8, total: 8, incidentes: 3 },
        esperadoIRR: 79,
        esperadoNivel: NivelRiesgo.MEDIO,
      },
      {
        id: 'CP-07',
        descripcion: '8×5, 80 %, 3 incidentes (frontera Medio/Alto)',
        esc: { promedio: 5, ausencias: 80, bajoCount: 8, total: 8, incidentes: 3 },
        esperadoIRR: 80,
        esperadoNivel: NivelRiesgo.ALTO,
      },
      {
        id: 'CP-08',
        descripcion: '8×100, 0 %, 6 incidentes (tope de incidentes en 100)',
        esc: { promedio: 100, ausencias: 0, bajoCount: 0, total: 8, incidentes: 6 },
        esperadoIRR: 10,
        esperadoNivel: NivelRiesgo.BAJO,
      },
      {
        id: 'CP-10',
        descripcion: '8×100, 40 %, 0 incidentes',
        esc: { promedio: 100, ausencias: 40, bajoCount: 0, total: 8, incidentes: 0 },
        esperadoIRR: 12,
        esperadoNivel: NivelRiesgo.BAJO,
      },
      {
        id: 'CP-11',
        descripcion: 'asignaturas con promedios 70 y 69, 0 %, 0 incidentes',
        esc: { promedio: 69.5, ausencias: 0, bajoCount: 1, total: 2, incidentes: 0 },
        esperadoIRR: 18,
        esperadoNivel: NivelRiesgo.BAJO,
      },
    ];

    it.each(casos)('$id ($descripcion) → $esperadoIRR $esperadoNivel', async ({ esc, esperadoIRR, esperadoNivel }) => {
      const { service } = crearMotor(esc);
      const { porcentajeSistema, nivel } = await service.calcular('est-1', 'curso-1');
      expect(porcentajeSistema).toBe(esperadoIRR);
      expect(nivel).toBe(esperadoNivel);
    });
  });

  describe('aplicarAjusteProfesional() — ajuste del orientador', () => {
    it('CP-12 (8×40, 60 %, 4, ajuste +20) → sistema 64, final 84 Alto', async () => {
      const { service, prisma } = crearMotor({ promedio: 40, ausencias: 60, bajoCount: 8, total: 8, incidentes: 4 });
      const riesgo = await service.aplicarAjusteProfesional('est-1', 'curso-1', 'centro-1', 20, 'user-1');

      expect(riesgo.porcentaje).toBe(84);
      expect(riesgo.nivel).toBe(NivelRiesgo.ALTO);
      // El sistema (antes del ajuste) debe ser 64 y quedar registrado en el historial.
      expect(prisma.historialRiesgo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            porcentajeOriginal: 64,
            ajusteAplicado: 20,
            porcentajeFinal: 84,
            usuarioId: 'user-1',
          }),
        }),
      );
    });

    it('CP-13 (caso CP-03 con ajuste +20) → final 100 (clamp superior)', async () => {
      const { service } = crearMotor({ promedio: 0, ausencias: 100, bajoCount: 8, total: 8, incidentes: 4 });
      const riesgo = await service.aplicarAjusteProfesional('est-1', 'curso-1', 'centro-1', 20, 'user-1');

      expect(riesgo.porcentaje).toBe(100);
      expect(riesgo.nivel).toBe(NivelRiesgo.ALTO);
    });

    it('CP-14 (caso CP-02 con ajuste −20) → final 0 (clamp inferior)', async () => {
      const { service } = crearMotor({ promedio: 85, ausencias: 5, bajoCount: 0, total: 8, incidentes: 0 });
      const riesgo = await service.aplicarAjusteProfesional('est-1', 'curso-1', 'centro-1', -20, 'user-1');

      expect(riesgo.porcentaje).toBe(0);
      expect(riesgo.nivel).toBe(NivelRiesgo.BAJO);
    });
  });

  describe('recalcularYRegistrar() — recálculo automático y persistencia', () => {
    it('reaplica el último ajuste del orientador y registra el resultado en el historial', async () => {
      // Caso CP-02 (sistema 7) con un ajuste previo de +10 vigente → final 17.
      const { service, prisma } = crearMotor({ promedio: 85, ausencias: 5, bajoCount: 0, total: 8, incidentes: 0 });
      (prisma.historialRiesgo.findFirst as jest.Mock).mockResolvedValue({ ajusteAplicado: 10 });

      const riesgo = await service.recalcularYRegistrar('est-1', 'curso-1', 'centro-1');

      expect(riesgo.porcentaje).toBe(17);
      expect(riesgo.nivel).toBe(NivelRiesgo.BAJO);
      expect(prisma.riesgo.upsert).toHaveBeenCalledTimes(1);
      // El recálculo automático no lleva usuario (usuarioId = null).
      expect(prisma.historialRiesgo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ porcentajeOriginal: 7, ajusteAplicado: 10, porcentajeFinal: 17, usuarioId: null }),
        }),
      );
    });
  });

  describe('historial()', () => {
    it('devuelve el historial de riesgo del estudiante ordenado por fecha', async () => {
      const { service, prisma } = crearMotor({ promedio: 100, ausencias: 0, bajoCount: 0, total: 8, incidentes: 0 });
      const registros = [{ id: 'h-1' }, { id: 'h-2' }];
      (prisma.historialRiesgo as unknown as { findMany: jest.Mock }).findMany = jest
        .fn()
        .mockResolvedValue(registros);

      await expect(service.historial('est-1')).resolves.toBe(registros);
    });
  });
});
