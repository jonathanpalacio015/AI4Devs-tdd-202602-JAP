/**
 * ============================================================
 * BACKEND — UNIT TESTS: fileUploadService.ts
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * ============================================================
 *
 * Cubre: uploadFile middleware
 *   - Archivo PDF aceptado → 200 con filePath y fileType
 *   - Archivo DOCX aceptado → 200
 *   - Tipo de archivo rechazado → 400
 *   - Error de Multer (p.ej. tamaño excedido) → 500
 *   - Error genérico del sistema → 500
 */

import { Request, Response } from 'express';
import multer from 'multer';

// Mockeamos multer para controlar su comportamiento
jest.mock('multer');

const mockSingle = jest.fn();
const mockMulter = multer as jest.MockedFunction<any>;
mockMulter.mockReturnValue({ single: mockSingle });
(multer as any).MulterError = class MulterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MulterError';
  }
};

import { uploadFile } from '../../../backend/src/application/services/fileUploadService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ─── Suite: uploadFile ───────────────────────────────────────────────────────
describe('BACKEND › fileUploadService › uploadFile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-B-FU-01 | responde 200 con filePath y fileType cuando el archivo es PDF válido', () => {
    const req: any = {
      file: { path: 'uploads/1234-cv.pdf', mimetype: 'application/pdf' },
    };
    const res = makeRes();

    mockSingle.mockReturnValue((_req: any, _res: any, cb: Function) => cb(null));

    uploadFile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      filePath: 'uploads/1234-cv.pdf',
      fileType: 'application/pdf',
    });
  });

  it('TDD-B-FU-02 | responde 400 cuando el archivo es rechazado por fileFilter', () => {
    const req: any = { file: undefined };
    const res = makeRes();

    mockSingle.mockReturnValue((_req: any, _res: any, cb: Function) => cb(null));

    uploadFile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid file type, only PDF and DOCX are allowed!',
    });
  });

  it('TDD-B-FU-03 | responde 500 cuando Multer lanza MulterError', () => {
    const req: any = {};
    const res = makeRes();
    const multerErr = new (multer as any).MulterError('File too large');

    mockSingle.mockReturnValue((_req: any, _res: any, cb: Function) => cb(multerErr));

    uploadFile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'File too large' });
  });

  it('TDD-B-FU-04 | responde 500 cuando ocurre un error genérico', () => {
    const req: any = {};
    const res = makeRes();

    mockSingle.mockReturnValue((_req: any, _res: any, cb: Function) =>
      cb(new Error('Disk full'))
    );

    uploadFile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Disk full' });
  });
});
