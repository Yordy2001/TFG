import { Global, Injectable, Module } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Role } from '../enums/role.enum';
import {
  Competencia,
  EstadoAsistencia,
  EstadoSeguimiento,
  NivelRiesgo,
  PeriodoEvaluativo,
  Sexo,
} from '../enums';
import {
  ActividadEvaluacion,
  AsignacionDocente,
  Asignatura,
  AsistenciaRegistro,
  CentroEducativo,
  Curso,
  Estudiante,
  HistorialRiesgo,
  PeriodoAcademico,
  RefreshTokenRecord,
  RegistroEvaluacion,
  Riesgo,
  SeguimientoOrientador,
  Usuario,
} from '../interfaces/entities';

/**
 * In-memory data store used until PostgreSQL + Prisma is wired up.
 * Repositories depend on this instead of Prisma so the swap-over later
 * only touches the repository layer, not services/controllers.
 */
@Injectable()
export class MockDataStore {
  readonly centros: CentroEducativo[] = [];
  readonly usuarios: Usuario[] = [];
  readonly cursos: Curso[] = [];
  readonly estudiantes: Estudiante[] = [];
  readonly asignaturas: Asignatura[] = [];
  readonly periodosAcademicos: PeriodoAcademico[] = [];
  readonly asignacionesDocentes: AsignacionDocente[] = [];
  readonly actividades: ActividadEvaluacion[] = [];
  readonly registrosEvaluacion: RegistroEvaluacion[] = [];
  readonly asistencias: AsistenciaRegistro[] = [];
  readonly seguimientos: SeguimientoOrientador[] = [];
  readonly riesgos: Riesgo[] = [];
  readonly historialRiesgo: HistorialRiesgo[] = [];
  readonly refreshTokens: RefreshTokenRecord[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const now = new Date();
    const centro: CentroEducativo = {
      id: uuid(),
      codigo: 'CE-0001',
      nombre: 'Liceo Nacional Duarte',
      telefono: '809-555-0100',
      distritoEducativo: '10-03',
      regional: '10',
      provincia: 'Santo Domingo',
      municipio: 'Santo Domingo Este',
      director: 'María Fernández',
      createdAt: now,
      updatedAt: now,
    };
    this.centros.push(centro);

    const passwordHash = bcrypt.hashSync('Password123!', 12);
    const roleUsers: Array<[Role, string, string, string]> = [
      [Role.ADMINISTRADOR, 'Ana', 'Administrador', 'admin@centro.edu.do'],
      [Role.REGISTRO, 'Rosa', 'Registro', 'registro@centro.edu.do'],
      [Role.DIRECTOR, 'Carlos', 'Director', 'director@centro.edu.do'],
      [Role.DOCENTE, 'Juan', 'Docente', 'docente@centro.edu.do'],
      [Role.ORIENTADOR, 'Laura', 'Orientadora', 'orientador@centro.edu.do'],
    ];
    const usersByRole = new Map<Role, Usuario>();
    for (const [rol, nombres, apellidos, email] of roleUsers) {
      const u: Usuario = {
        id: uuid(),
        centroId: centro.id,
        rol,
        nombres,
        apellidos,
        email,
        passwordHash,
        activo: true,
        createdAt: now,
        updatedAt: now,
      };
      this.usuarios.push(u);
      usersByRole.set(rol, u);
    }
    const docente = usersByRole.get(Role.DOCENTE)!;
    const orientador = usersByRole.get(Role.ORIENTADOR)!;

    const periodo: PeriodoAcademico = {
      id: uuid(),
      centroId: centro.id,
      nombre: '2026-2027',
      activo: true,
    };
    this.periodosAcademicos.push(periodo);

    const cursosDef = ['3ro A', '4to B', '5to C'];
    const cursos = cursosDef.map((nombre) => {
      const [gradoNivel, seccion] = nombre.split(' ');
      const c: Curso = {
        id: uuid(),
        centroId: centro.id,
        nombre,
        gradoNivel,
        seccion,
        createdAt: now,
        updatedAt: now,
      };
      this.cursos.push(c);
      return c;
    });

    const asignaturasDef = ['Matemática', 'Ciencias', 'Lengua Española'];
    const asignaturas = asignaturasDef.map((nombre) => {
      const a: Asignatura = {
        id: uuid(),
        centroId: centro.id,
        nombre,
        createdAt: now,
        updatedAt: now,
      };
      this.asignaturas.push(a);
      return a;
    });

    const nombresM = ['Luis', 'Pedro', 'José', 'Miguel', 'Rafael', 'Ángel'];
    const nombresF = ['María', 'Carla', 'Sofía', 'Elena', 'Paula', 'Yolanda'];
    const apellidosPool = ['Pérez', 'García', 'Rodríguez', 'Martínez', 'Sánchez', 'Ramírez'];

    let matriculaSeq = 1000;
    const estudiantesPorCurso: Record<string, Estudiante[]> = {};
    for (const curso of cursos) {
      const list: Estudiante[] = [];
      for (let i = 0; i < 6; i++) {
        const esM = i % 2 === 0;
        const nombres = esM ? nombresM[i % nombresM.length] : nombresF[i % nombresF.length];
        const apellidos = `${apellidosPool[i % apellidosPool.length]} ${apellidosPool[(i + 2) % apellidosPool.length]}`;
        const est: Estudiante = {
          id: uuid(),
          centroId: centro.id,
          cursoId: curso.id,
          matricula: `MAT-${matriculaSeq++}`,
          nombres,
          apellidos,
          sexo: esM ? Sexo.M : Sexo.F,
          fechaNacimiento: `2012-0${(i % 9) + 1}-15`,
          activo: true,
          incidentesDisciplinarios: Math.random() < 0.2 ? Math.ceil(Math.random() * 3) : 0,
          createdAt: now,
          updatedAt: now,
        };
        this.estudiantes.push(est);
        list.push(est);
      }
      estudiantesPorCurso[curso.id] = list;
    }

    const competencias = [
      Competencia.C1_COMUNICATIVA,
      Competencia.C2_LOGICO_CIENTIFICA,
      Competencia.C3_ETICA_CIUDADANA,
    ];

    for (const curso of cursos) {
      for (const asignatura of asignaturas) {
        const asignacion: AsignacionDocente = {
          id: uuid(),
          centroId: centro.id,
          docenteId: docente.id,
          cursoId: curso.id,
          asignaturaId: asignatura.id,
          periodoAcademicoId: periodo.id,
        };
        this.asignacionesDocentes.push(asignacion);

        const actividadesDef: Array<[string, number]> = [
          ['Práctica', 10],
          ['Tarea', 15],
          ['Examen', 30],
          ['Proyecto', 20],
          ['Exposición', 25],
        ];
        const actividades = actividadesDef.map(([nombre, porcentaje], idx) => {
          const act: ActividadEvaluacion = {
            id: uuid(),
            centroId: centro.id,
            asignacionDocenteId: asignacion.id,
            nombre,
            competencia: competencias[idx % competencias.length],
            porcentaje,
            periodoEvaluativo: PeriodoEvaluativo.P1,
            fecha: '2026-03-01',
            createdAt: now,
            updatedAt: now,
          };
          this.actividades.push(act);
          return act;
        });

        for (const est of estudiantesPorCurso[curso.id]) {
          for (const act of actividades) {
            const base = 65 + Math.round(Math.random() * 35);
            const registro: RegistroEvaluacion = {
              id: uuid(),
              centroId: centro.id,
              actividadId: act.id,
              estudianteId: est.id,
              nota: Math.min(100, base),
              createdAt: now,
              updatedAt: now,
            };
            this.registrosEvaluacion.push(registro);
          }

          for (let d = 0; d < 20; d++) {
            const roll = Math.random();
            const estado =
              roll < 0.08
                ? EstadoAsistencia.AUSENTE
                : roll < 0.16
                  ? EstadoAsistencia.TARDANZA
                  : EstadoAsistencia.PRESENTE;
            const asistencia: AsistenciaRegistro = {
              id: uuid(),
              centroId: centro.id,
              estudianteId: est.id,
              asignacionDocenteId: asignacion.id,
              fecha: `2026-03-${String((d % 28) + 1).padStart(2, '0')}`,
              estado,
              createdAt: now,
            };
            this.asistencias.push(asistencia);
          }
        }
      }
    }

    for (const curso of cursos) {
      for (const est of estudiantesPorCurso[curso.id]) {
        if (Math.random() < 0.4) {
          const seg: SeguimientoOrientador = {
            id: uuid(),
            centroId: centro.id,
            estudianteId: est.id,
            orientadorId: orientador.id,
            fecha: '2026-04-10',
            motivo: 'Bajo rendimiento académico',
            observaciones: 'Confidencial: seguimiento inicial con el estudiante y tutor.',
            acciones: 'Se citó al tutor legal para plan de acompañamiento.',
            proximaCita: '2026-05-10',
            estado: EstadoSeguimiento.EN_PROCESO,
            createdAt: now,
            updatedAt: now,
          };
          this.seguimientos.push(seg);
        }

        const porcentaje = Math.round(Math.random() * 100);
        const nivel =
          porcentaje >= 80 ? NivelRiesgo.ALTO : porcentaje >= 50 ? NivelRiesgo.MEDIO : NivelRiesgo.BAJO;
        const riesgo: Riesgo = {
          id: uuid(),
          centroId: centro.id,
          estudianteId: est.id,
          porcentaje,
          nivel,
          fechaCalculo: now,
        };
        this.riesgos.push(riesgo);
        this.historialRiesgo.push({
          id: uuid(),
          centroId: centro.id,
          estudianteId: est.id,
          porcentajeOriginal: porcentaje,
          ajusteAplicado: 0,
          porcentajeFinal: porcentaje,
          nivel,
          usuarioId: null,
          fecha: now,
        });
      }
    }
  }
}

@Global()
@Module({
  providers: [MockDataStore],
  exports: [MockDataStore],
})
export class MockDataModule {}
