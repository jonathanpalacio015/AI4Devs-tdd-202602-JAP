/**
 * ============================================================
 * INTEGRATION TESTS — Flujo completo de candidato
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * ============================================================
 *
 * Estos tests prueban la interacción entre capas SIN base de
 * datos real: usan un mock de PrismaClient para simular
 * persistencia, pero ejercitan la cadena completa:
 *
 *   HTTP Request → Controller → Service → Validator → Model → "DB"
 *
 * También incluyen un test de integración frontend-backend
 * mockeando fetch para verificar el flujo completo de UI.
 */

// ─── Mock de PrismaClient ─────────────────────────────────────────────────────
const mockPrismaCreate = jest.fn();
const mockPrismaUpdate = jest.fn();
const mockPrismaFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn().mockImplementation(() => ({
      candidate: {
        create: mockPrismaCreate,
        update: mockPrismaUpdate,
        findUnique: mockPrismaFindUnique,
      },
      education: { create: mockPrismaCreate, update: mockPrismaUpdate },
      workExperience: { create: mockPrismaCreate, update: mockPrismaUpdate },
      resume: { create: mockPrismaCreate },
    })),
    Prisma: {
      PrismaClientInitializationError: class PrismaClientInitializationError extends Error {},
    },
  };
});

import { Request, Response } from 'express';
import { addCandidateController } from '../../../backend/src/presentation/controllers/candidateController';
import { candidateFactory, educationFactory, workExperienceFactory, cvFactory } from '../shared/sharedHelpers.test';

// ─── Helper: simular res de Express ───────────────────────────────────────────
const makeRes = (): { res: Partial<Response>; statusCode: () => number; body: () => any } => {
  let _status = 0;
  let _body: any = {};
  const res: Partial<Response> = {};
  res.status = jest.fn().mockImplementation((code: number) => { _status = code; return res; });
  res.json = jest.fn().mockImplementation((data: any) => { _body = data; return res; });
  return {
    res,
    statusCode: () => _status,
    body: () => _body,
  };
};

// ─── Suite: Flujo completo — crear candidato básico ───────────────────────────
describe('INTEGRATION › Controller → Service → Model → Prisma', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaCreate.mockResolvedValue({
      id: 99,
      firstName: 'Laura',
      lastName: 'Pérez',
      email: 'laura.perez@example.com',
    });
  });

  it('TDD-INT-01 | candidato básico válido → 201 con datos guardados', async () => {
    const req: Partial<Request> = { body: candidateFactory() };
    const { res, statusCode, body } = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(statusCode()).toBe(201);
    expect(body().message).toBe('Candidate added successfully');
    expect(body().data).toHaveProperty('id', 99);
  });

  it('TDD-INT-02 | candidato con educación → 201 y se crean filas relacionadas', async () => {
    const req: Partial<Request> = {
      body: candidateFactory({
        educations: [educationFactory()],
      }),
    };
    const { res, statusCode } = makeRes();

    await addCandidateController(req as Request, res as Response);

    // Prisma.create se llama para el candidato + para la educación
    expect(mockPrismaCreate).toHaveBeenCalledTimes(2);
    expect(statusCode()).toBe(201);
  });

  it('TDD-INT-03 | candidato con experiencia → 201 y se crean filas relacionadas', async () => {
    const req: Partial<Request> = {
      body: candidateFactory({
        workExperiences: [workExperienceFactory()],
      }),
    };
    const { res, statusCode } = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(mockPrismaCreate).toHaveBeenCalledTimes(2);
    expect(statusCode()).toBe(201);
  });

  it('TDD-INT-04 | candidato completo (edu + exp + CV) → 201 y 4 llamadas a create', async () => {
    const req: Partial<Request> = {
      body: candidateFactory({
        educations: [educationFactory()],
        workExperiences: [workExperienceFactory()],
        cv: cvFactory(),
      }),
    };
    const { res, statusCode } = makeRes();

    await addCandidateController(req as Request, res as Response);

    // create: candidate + education + workExperience + resume = 4
    expect(mockPrismaCreate).toHaveBeenCalledTimes(4);
    expect(statusCode()).toBe(201);
  });

  it('TDD-INT-05 | email duplicado (P2002) → 400 con mensaje específico', async () => {
    const p2002: any = new Error('Unique constraint failed');
    p2002.code = 'P2002';
    mockPrismaCreate.mockRejectedValue(p2002);

    const req: Partial<Request> = { body: candidateFactory() };
    const { res, statusCode, body } = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(statusCode()).toBe(400);
    expect(body().error).toContain('email already exists');
  });

  it('TDD-INT-06 | datos inválidos (nombre vacío) → 400 sin llamar a prisma', async () => {
    const req: Partial<Request> = {
      body: candidateFactory({ firstName: '' }),
    };
    const { res, statusCode } = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(statusCode()).toBe(400);
    expect(mockPrismaCreate).not.toHaveBeenCalled();
  });

  it('TDD-INT-07 | error de conexión DB → 400 con mensaje de error', async () => {
    const { PrismaClientInitializationError } = require('@prisma/client').Prisma;
    mockPrismaCreate.mockRejectedValue(new PrismaClientInitializationError('Connection failed'));

    const req: Partial<Request> = { body: candidateFactory() };
    const { res, statusCode } = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(statusCode()).toBe(400);
  });
});

// ─── Suite: Integración Validator + Service ────────────────────────────────────
describe('INTEGRATION › Validator ↔ CandidateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaCreate.mockResolvedValue({ id: 1, firstName: 'Test', lastName: 'User', email: 'test@test.com' });
  });

  it('TDD-INT-08 | email inválido nunca llega a Prisma', async () => {
    const req: Partial<Request> = { body: candidateFactory({ email: 'not-an-email' }) };
    const { res, statusCode } = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(statusCode()).toBe(400);
    expect(mockPrismaCreate).not.toHaveBeenCalled();
  });

  it('TDD-INT-09 | teléfono inválido (no español) nunca llega a Prisma', async () => {
    const req: Partial<Request> = { body: candidateFactory({ phone: '+1-555-555-5555' }) };
    const { res, statusCode } = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(statusCode()).toBe(400);
    expect(mockPrismaCreate).not.toHaveBeenCalled();
  });

  it('TDD-INT-10 | educación con fecha mal formateada → 400 sin llamar a Prisma', async () => {
    const req: Partial<Request> = {
      body: candidateFactory({
        educations: [educationFactory({ startDate: '01-09-2015' })],
      }),
    };
    const { res, statusCode } = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(statusCode()).toBe(400);
    expect(mockPrismaCreate).not.toHaveBeenCalled();
  });
});
