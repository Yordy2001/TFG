/**
 * Shim CommonJS de `@nestjs/schedule` para Jest.
 *
 * `@nestjs/schedule@12` es un paquete ESM puro (package.json "type": "module")
 * sin build CommonJS, por lo que romper Jest al cargar AppModule → JobsModule.
 * Los jobs programados (cron) no intervienen en estas pruebas e2e, así que se
 * sustituye por implementaciones no-op SOLO durante las pruebas (ver
 * moduleNameMapper en jest-e2e.json). No modifica el código de producción, que
 * sigue usando el paquete real y su planificación real.
 */
class ScheduleModuleShim {}

module.exports = {
  ScheduleModule: {
    // Módulo dinámico válido y vacío: no registra ningún planificador.
    forRoot: () => ({ module: ScheduleModuleShim, global: true, providers: [], exports: [] }),
  },
  // Decoradores de método no-op.
  Cron: () => () => undefined,
  Interval: () => () => undefined,
  Timeout: () => () => undefined,
  CronExpression: { EVERY_DAY_AT_2AM: '0 2 * * *', EVERY_WEEK: '0 0 * * 0' },
  SchedulerRegistry: class SchedulerRegistry {},
};
