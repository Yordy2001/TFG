import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NivelRiesgo, Sexo } from '../../common/enums';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(centroId: string, role: Role) {
    const [estudiantes, riesgos, cursos] = await Promise.all([
      this.prisma.estudiante.findMany({ where: { centroId, activo: true } }),
      this.prisma.riesgo.findMany({ where: { centroId } }),
      this.prisma.curso.findMany({ where: { centroId } }),
    ]);

    const riesgoPorNivel = {
      [NivelRiesgo.BAJO]: riesgos.filter((r) => r.nivel === (NivelRiesgo.BAJO as never)).length,
      [NivelRiesgo.MEDIO]: riesgos.filter((r) => r.nivel === (NivelRiesgo.MEDIO as never)).length,
      [NivelRiesgo.ALTO]: riesgos.filter((r) => r.nivel === (NivelRiesgo.ALTO as never)).length,
    };

    const distribucionSexo = {
      [Sexo.M]: estudiantes.filter((e) => e.sexo === (Sexo.M as never)).length,
      [Sexo.F]: estudiantes.filter((e) => e.sexo === (Sexo.F as never)).length,
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
        const estudiante = estudiantes.find((e) => e.id === r.estudianteId);
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
        ? (
            await this.prisma.seguimientoOrientador.findMany({
              where: { centroId },
              orderBy: { createdAt: 'desc' },
              take: 5,
            })
          ).map((s) => ({
            id: s.id,
            estudianteId: s.estudianteId,
            fecha: s.fecha,
            estado: s.estado,
          }))
        : [];

    const alertasPendientes = riesgos.filter((r) => r.nivel === (NivelRiesgo.ALTO as never)).length;

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
