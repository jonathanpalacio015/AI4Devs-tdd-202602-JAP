/**
 * ============================================================
 * BACKEND — UNIT TESTS: candidateController.ts
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * ============================================================
 *
 * Cubre: addCandidateController
 *   - Respuesta 201 en éxito
 *   - Respuesta 400 en error de validación
 *   - Respuesta 400 con mensaje desconocido cuando error no es instancia de Error
 */

jest.mock('../../../backend/src/application/services/candidateService');

import { Request, Response } from 'express';
import { addCandidateController } from '../../../backend/src/presentation/controllers/candidateController';
import { addCandidate } from '../../../backend/src/application/services/candidateService';

const mockAddCandidate = addCandidate as jest.MockedFunction<typeof addCandidate>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (body: object = {}): Partial<Request> => ({
  body,
});

// ─── Suite: addCandidateController ───────────────────────────────────────────
describe('BACKEND › candidateController › addCandidateController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-B-CC-01 | responde 201 con mensaje de éxito cuando addCandidate resuelve', async () => {
    const fakeCandidate = { id: 1, firstName: 'Ana' };
    mockAddCandidate.mockResolvedValue(fakeCandidate as any);

    const req = makeReq({ firstName: 'Ana', email: 'ana@test.com' });
    const res = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Candidate added successfully',
      data: fakeCandidate,
    });
  });

  it('TDD-B-CC-02 | responde 400 con error.message cuando addCandidate lanza Error', async () => {
    mockAddCandidate.mockRejectedValue(new Error('Invalid email'));

    const req = makeReq({ email: 'malo' });
    const res = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error adding candidate',
      error: 'Invalid email',
    });
  });

  it('TDD-B-CC-03 | responde 400 con "Unknown error" cuando el rechazo no es instancia de Error', async () => {
    mockAddCandidate.mockRejectedValue('string-error');

    const req = makeReq({});
    const res = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error adding candidate',
      error: 'Unknown error',
    });
  });

  it('TDD-B-CC-04 | pasa req.body completo a addCandidate', async () => {
    const bodyData = { firstName: 'Luis', email: 'luis@example.com' };
    mockAddCandidate.mockResolvedValue({ id: 5, ...bodyData } as any);

    const req = makeReq(bodyData);
    const res = makeRes();

    await addCandidateController(req as Request, res as Response);

    expect(mockAddCandidate).toHaveBeenCalledWith(bodyData);
  });
});
