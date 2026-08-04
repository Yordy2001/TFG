import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../mock-data/mock-data.store';
import { AcademicEngineService } from './academic-engine.service';
import { NivelRiesgo } from '../enums';
import { HistorialRiesgo, Riesgo } from '../interfaces/entities';

const PESOS = {
  promedioAcademico: 0.35,
  asistencia: 0.3,
  bajoRendimiento: 0.15,
  incidentes: 0.1,
  ajusteProfesional: 0.1,
};

function clasificar(porcentaje: number): NivelRiesgo {
  if (porcentaje >= 80) return NivelRiesgo.ALTO;
  if (porcentaje >= 50) return NivelRiesgo.MEDIO;
  return NivelRiesgo.BAJO;
}

/**
 * Computes the dropout-risk percentage from academic indicators.
 * Never computes averages itself — always reads them from AcademicEngine.
 */
@Injectable()
export class RiskEngineService {
  constructor(
    private readonly store: MockDataStore,
    private readonly academicEngine: AcademicEngineService,
  ) {}

  private ultimoAjuste(estudianteId: string): number {
    const historial = this.store.historialRiesgo
      .filter((h) => h.estudianteId === estudianteId)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    return historial[0]?.ajusteAplicado ?? 0;
  }

  calcular(estudianteId: string, cursoId: string): { porcentajeSistema: number; nivel: NivelRiesgo } {
    const estudiante = this.store.estudiantes.find((e) => e.id === estudianteId);
    const promedio = this.academicEngine.promedioGeneral(estudianteId, cursoId);
    const { ausencias } = this.academicEngine.porcentajeAsistencia(estudianteId);
    const bajoRendimientoCount = this.academicEngine.asignaturasEnBajoRendimiento(estudianteId, cursoId);
    const totalAsignaturas = this.academicEngine.resultadosPorAsignatura(estudianteId, cursoId).length || 1;

    const scorePromedio = Math.max(0, 100 - promedio); // lower average -> higher risk
    const scoreAsistencia = ausencias; // ausencias already expressed as %
    const scoreBajoRendimiento = (bajoRendimientoCount / totalAsignaturas) * 100;
    const scoreIncidentes = Math.min(100, (estudiante?.incidentesDisciplinarios ?? 0) * 25);

    const porcentajeSistema =
      scorePromedio * PESOS.promedioAcademico +
      scoreAsistencia * PESOS.asistencia +
      scoreBajoRendimiento * PESOS.bajoRendimiento +
      scoreIncidentes * PESOS.incidentes;

    const redondeado = Math.max(0, Math.min(100, Math.round(porcentajeSistema)));
    return { porcentajeSistema: redondeado, nivel: clasificar(redondeado) };
  }

  recalcularYRegistrar(estudianteId: string, cursoId: string, centroId: string): Riesgo {
    const { porcentajeSistema } = this.calcular(estudianteId, cursoId);
    const ajuste = this.ultimoAjuste(estudianteId);
    const porcentajeFinal = Math.max(0, Math.min(100, porcentajeSistema + ajuste));
    const nivel = clasificar(porcentajeFinal);
    const fecha = new Date();

    let riesgo = this.store.riesgos.find((r) => r.estudianteId === estudianteId);
    if (!riesgo) {
      riesgo = { id: uuid(), centroId, estudianteId, porcentaje: porcentajeFinal, nivel, fechaCalculo: fecha };
      this.store.riesgos.push(riesgo);
    } else {
      riesgo.porcentaje = porcentajeFinal;
      riesgo.nivel = nivel;
      riesgo.fechaCalculo = fecha;
    }

    this.registrarHistorial(estudianteId, centroId, porcentajeSistema, ajuste, null);
    return riesgo;
  }

  private registrarHistorial(
    estudianteId: string,
    centroId: string,
    porcentajeOriginal: number,
    ajusteAplicado: number,
    usuarioId: string | null,
  ): HistorialRiesgo {
    const porcentajeFinal = Math.max(0, Math.min(100, porcentajeOriginal + ajusteAplicado));
    const registro: HistorialRiesgo = {
      id: uuid(),
      centroId,
      estudianteId,
      porcentajeOriginal,
      ajusteAplicado,
      porcentajeFinal,
      nivel: clasificar(porcentajeFinal),
      usuarioId,
      fecha: new Date(),
    };
    this.store.historialRiesgo.push(registro);
    return registro;
  }

  aplicarAjusteProfesional(estudianteId: string, cursoId: string, centroId: string, ajuste: number, usuarioId: string): Riesgo {
    const { porcentajeSistema } = this.calcular(estudianteId, cursoId);
    const porcentajeFinal = Math.max(0, Math.min(100, porcentajeSistema + ajuste));
    const nivel = clasificar(porcentajeFinal);

    let riesgo = this.store.riesgos.find((r) => r.estudianteId === estudianteId);
    if (!riesgo) {
      riesgo = { id: uuid(), centroId, estudianteId, porcentaje: porcentajeFinal, nivel, fechaCalculo: new Date() };
      this.store.riesgos.push(riesgo);
    } else {
      riesgo.porcentaje = porcentajeFinal;
      riesgo.nivel = nivel;
      riesgo.fechaCalculo = new Date();
    }

    this.registrarHistorial(estudianteId, centroId, porcentajeSistema, ajuste, usuarioId);
    return riesgo;
  }

  historial(estudianteId: string): HistorialRiesgo[] {
    return this.store.historialRiesgo
      .filter((h) => h.estudianteId === estudianteId)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }
}
