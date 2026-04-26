/// <reference types="jest" />

import fs from 'fs';
import path from 'path';

/**
 * CRITICAL UNIT TESTS
 * Caso critico: ausencia de rate limiting en endpoints sensibles (CL-SEC-07)
 *
 * Enfoque TDD:
 * - RED: el backend debe proteger /candidates y /upload con rate limiting.
 */

describe('CRITICAL BACKEND UNIT › Rate limiting', () => {
  it('CRIT-SEC07-RED-01 | debe existir dependencia express-rate-limit instalada para proteger la API', () => {
    // Contrato de seguridad: la dependencia debe estar presente.
    // Si falla, indica que no hay capa de rate limiting en el proyecto.
    expect(() => require('express-rate-limit')).not.toThrow();
  });

  it.todo('CRIT-SEC07-RED-02 | aplicar limiter en /candidates para mitigar abuso y brute force');
  it.todo('CRIT-SEC07-RED-03 | aplicar limiter en /upload para mitigar DoS por carga masiva');

  it('CRIT-SEC07-RED-04 | backend/src/index.ts o rutas debe registrar middleware rateLimit', () => {
    const root = process.cwd();
    const indexPath = path.join(root, 'backend', 'src', 'index.ts');
    const routesPath = path.join(root, 'backend', 'src', 'routes', 'candidateRoutes.ts');

    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const routesContent = fs.readFileSync(routesPath, 'utf-8');

    // Contrato de seguridad esperado: uso explicito de rateLimit(...) en API publica.
    expect(indexContent.includes('rateLimit(') || routesContent.includes('rateLimit(')).toBe(true);
  });
});
