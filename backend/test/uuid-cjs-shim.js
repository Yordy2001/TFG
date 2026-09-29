/**
 * Shim CommonJS de `uuid` para Jest.
 *
 * `uuid@14` se publica únicamente como ESM, por lo que al ejecutarse bajo Jest
 * (CommonJS) el import de `auth.service.ts` (`import { v4 as uuid } from 'uuid'`)
 * falla con "SyntaxError: Unexpected token 'export'". Este módulo se mapea a
 * `uuid` SOLO durante las pruebas (ver moduleNameMapper en jest-e2e.json) y
 * expone `v4`, la única función que usa la aplicación. No altera el código de
 * producción, que sigue usando el paquete real.
 */
const { randomUUID } = require('crypto');

module.exports = {
  v4: () => randomUUID(),
};
