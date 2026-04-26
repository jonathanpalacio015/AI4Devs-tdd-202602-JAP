/// <reference types="jest" />

/**
 * CRITICAL UNIT TESTS
 * Caso critico: path traversal y spoofing de upload (CL-FU-04, CL-SEC-03)
 *
 * Enfoque TDD:
 * - RED: el nombre del archivo deberia sanitizarse antes de persistir
 * - GREEN: incorporar path.basename/sanitize-filename y validacion binaria real
 */

import fs from 'fs';
import path from 'path';

describe('CRITICAL BACKEND UNIT › Upload security', () => {
  const servicePath = path.join(process.cwd(), 'backend', 'src', 'application', 'services', 'fileUploadService.ts');
  const serviceSource = fs.readFileSync(servicePath, 'utf-8');

  it('CRIT-FU04-RED-01 | filename callback deberia sanitizar originalname para evitar path traversal', () => {
    // Contrato esperado:
    // 1) uso de path.basename(...) o libreria sanitize-filename
    // 2) eliminacion explicita de secuencias ../ o separadores
    const hasBasenameGuard = serviceSource.includes('path.basename(');
    const hasSanitizeLibrary = serviceSource.includes('sanitize-filename');
    const hasExplicitReplace =
      serviceSource.includes("replace(/\\.\\.\\//g") ||
      serviceSource.includes("replace(/\\.\\.\\\\/g") ||
      serviceSource.includes("replace(/[\\/\\\\]/g");

    expect(hasBasenameGuard || hasSanitizeLibrary || hasExplicitReplace).toBe(true);
  });

  it('CRIT-SEC03-GUARD-02 | fileFilter actualmente restringe mimetype a PDF/DOCX (guardia minima)', () => {
    const hasPdfRule = serviceSource.includes("'application/pdf'") || serviceSource.includes('"application/pdf"');
    const hasDocxRule =
      serviceSource.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    expect(hasPdfRule && hasDocxRule).toBe(true);
  });

  it.todo('CRIT-SEC03-RED-03 | validar MIME real del binario, no solo mimetype declarado por cliente');
});
