/**
 * Pruebas end-to-end contra la base de datos de desarrollo.
 *
 * Requisitos para ejecutarlas:
 *  1. PostgreSQL de desarrollo levantado (docker compose up -d).
 *  2. Migraciones aplicadas y semilla de referencia ejecutada
 *     (npm run prisma:migrate && npm run prisma:seed) — crea el centro y los
 *     usuarios por rol (docente@centro.edu.do, orientador@centro.edu.do, ...),
 *     todos con contraseña "Password123!".
 *
 * Las fixtures propias (estudiante y actividad) se crean y se eliminan dentro
 * de la propia prueba, para no depender de las semillas de estudiantes/notas.
 *
 * Cubre:
 *  - Inicio de sesión válido e inválido.
 *  - Acceso denegado (403) de un DOCENTE a endpoints exclusivos del ORIENTADOR.
 *  - Ajuste de riesgo fuera de rango (400).
 *  - Registrar una calificación crea una fila en historial_riesgo (recálculo).
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/common/prisma/prisma.service';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';

const PASSWORD = 'Password123!';

describe('API e2e (base de datos de desarrollo)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let docenteToken: string;
  let orientadorToken: string;
  let centroId: string;
  let estudianteId: string;
  let actividadId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Reproduce la configuración de main.ts para que el prefijo global y la
    // validación (400) se comporten como en producción.
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    prisma = app.get(PrismaService);

    // Fixtures: se apoyan en la semilla de referencia (centro, docente y una
    // asignación docente ya existentes) y crean un estudiante y una actividad.
    const docente = await prisma.usuario.findUnique({ where: { email: 'docente@centro.edu.do' } });
    if (!docente) {
      throw new Error('Falta la semilla de referencia: ejecute "npm run prisma:seed" antes de las pruebas e2e.');
    }
    centroId = docente.centroId;

    const asignacion = await prisma.asignacionDocente.findFirst({ where: { centroId } });
    if (!asignacion) {
      throw new Error('No hay asignaciones docentes en la semilla; no se puede preparar la fixture de calificación.');
    }

    const estudiante = await prisma.estudiante.create({
      data: {
        centroId,
        cursoId: asignacion.cursoId,
        matricula: `E2E-${Date.now()}`,
        nombres: 'Estudiante',
        apellidos: 'Prueba E2E',
        sexo: 'M',
        fechaNacimiento: '2010-01-01',
      },
    });
    estudianteId = estudiante.id;

    const actividad = await prisma.actividadEvaluacion.create({
      data: {
        centroId,
        asignacionDocenteId: asignacion.id,
        nombre: 'Actividad E2E',
        competencia: 'C1_COMUNICATIVA',
        porcentaje: 100,
        periodoEvaluativo: 'P1',
        fecha: '2026-03-01',
      },
    });
    actividadId = actividad.id;

    // Tokens de acceso.
    const loginDocente = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'docente@centro.edu.do', password: PASSWORD });
    docenteToken = loginDocente.body.data.accessToken;

    const loginOrientador = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'orientador@centro.edu.do', password: PASSWORD });
    orientadorToken = loginOrientador.body.data.accessToken;
  });

  afterAll(async () => {
    // Limpieza de fixtures en orden de dependencias (best-effort).
    try {
      await prisma.historialRiesgo.deleteMany({ where: { estudianteId } });
      await prisma.riesgo.deleteMany({ where: { estudianteId } });
      await prisma.registroEvaluacion.deleteMany({ where: { estudianteId } });
      await prisma.actividadEvaluacion.deleteMany({ where: { id: actividadId } });
      await prisma.estudiante.deleteMany({ where: { id: estudianteId } });
    } catch {
      // Ignorar errores de limpieza para no enmascarar fallos de prueba.
    }
    await app.close();
  });

  describe('Autenticación', () => {
    it('POST /auth/login con credenciales válidas → 200 y devuelve accessToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'docente@centro.edu.do', password: PASSWORD })
        .expect(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.role).toBe('DOCENTE');
    });

    it('POST /auth/login con credenciales inválidas → 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'docente@centro.edu.do', password: 'incorrecta' })
        .expect(401);
    });
  });

  describe('Control de acceso por rol (RolesGuard)', () => {
    it('DOCENTE → GET /follow-up/recent → 403', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/follow-up/recent')
        .set('Authorization', `Bearer ${docenteToken}`)
        .expect(403);
    });

    it('DOCENTE → POST /risk/adjustment → 403', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/risk/adjustment')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({ estudianteId, ajuste: 10 })
        .expect(403);
    });
  });

  describe('Validación de entrada', () => {
    it('ORIENTADOR → POST /risk/adjustment con ajuste fuera de rango (999) → 400', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/risk/adjustment')
        .set('Authorization', `Bearer ${orientadorToken}`)
        .send({ estudianteId, ajuste: 999 })
        .expect(400);
    });
  });

  describe('Motor de riesgo (integración)', () => {
    it('POST /evaluations/grades crea una fila en historial_riesgo (recálculo automático)', async () => {
      const antes = await prisma.historialRiesgo.count({ where: { estudianteId } });

      await request(app.getHttpServer())
        .post('/api/v1/evaluations/grades')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({ actividadId, estudianteId, nota: 50 })
        .expect(201);

      const despues = await prisma.historialRiesgo.count({ where: { estudianteId } });
      expect(despues).toBeGreaterThan(antes);
    });
  });
});
