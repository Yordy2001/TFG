import { Injectable } from '@nestjs/common';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { NivelRiesgo, Sexo } from '../../common/enums';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly store: MockDataStore) {}

  overview(centroId: string, role: Role) {
    const estudiantes = this.store.estudiantes.filter((e) => e.centroId === centroId && e.activo);
    const riesgos = this.store.riesgos.filter((r) => r.centroId === centroId);
    const cursos = this.store.cursos.filter((c) => c.centroId === centroId);

    const riesgoPorNivel = {
      [NivelRiesgo.BAJO]: riesgos.filter((r) => r.nivel === NivelRiesgo.BAJO).length,
      [NivelRiesgo.MEDIO]: riesgos.filter((r) => r.nivel === NivelRiesgo.MEDIO).length,
      [NivelRiesgo.ALTO]: riesgos.filter((r) => r.nivel === NivelRiesgo.ALTO).length,
    };

    const distribucionSexo = {
      [Sexo.M]: estudiantes.filter((e) => e.sexo === Sexo.M).length,
      [Sexo.F]: estudiantes.filter((e) => e.sexo === Sexo.F).length,
    };

    const distribucionCurso = cursos.map((curso) => ({
      cursoId: curso.id,
      nombre: curso.nombre,
      total: estudiantes.filter((e) => e.cursoId === curso.id).length,
    }));

    const mayorRiesgo = [...riesgos]
      .sort((a, b) => b.porcentaje - a.porcentaje)
      .slice(0, 10)
      .map((r) => {
        const estudiante = this.store.estudiantes.find((e) => e.id === r.estudianteId);
        return {
          estudianteId: r.estudianteId,
          nombres: estudiante?.nombres,
          apellidos: estudiante?.apellidos,
          matricula: estudiante?.matricula,
          porcentaje: r.porcentaje,
          nivel: r.nivel,
        };
      });

    // El seguimiento del orientador es confidencial: solo se expone al propio orientador.
    const ultimosSeguimientos =
      role === Role.ORIENTADOR
        ? [...this.store.seguimientos]
            .filter((s) => s.centroId === centroId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
            .map((s) => ({
              id: s.id,
              estudianteId: s.estudianteId,
              fecha: s.fecha,
              estado: s.estado,
            }))
        : [];

    const alertasPendientes = riesgos.filter((r) => r.nivel === NivelRiesgo.ALTO).length;

    return {
      totalEstudiantes: estudiantes.length,
      riesgoPorNivel,
      distribucionSexo,
      distribucionCurso,
      mayorRiesgo,
      ultimosSeguimientos,
      alertasPendientes,
    };
  }
}
