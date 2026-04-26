/**
 * ============================================================
 * BACKEND — UNIT TESTS: Modelos de Dominio
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * ============================================================
 *
 * Cubre: Candidate.save(), Candidate.findOne(),
 *        Education.save(), WorkExperience.save(), Resume.save()
 * Todas las llamadas a Prisma están mockeadas con jest.mock.
 */

// ─── Mock de PrismaClient ─────────────────────────────────────────────────────
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn().mockImplementation(() => ({
      candidate: { create: mockCreate, update: mockUpdate, findUnique: mockFindUnique },
      education: { create: mockCreate, update: mockUpdate },
      workExperience: { create: mockCreate, update: mockUpdate },
      resume: { create: mockCreate },
    })),
    Prisma: {
      PrismaClientInitializationError: class PrismaClientInitializationError extends Error {},
    },
  };
});

import { Candidate } from '../../../backend/src/domain/models/Candidate';
import { Education } from '../../../backend/src/domain/models/Education';
import { WorkExperience } from '../../../backend/src/domain/models/WorkExperience';
import { Resume } from '../../../backend/src/domain/models/Resume';

// ─── Suite: Candidate.save() — crear ─────────────────────────────────────────
describe('BACKEND › Candidate › save() — creación', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-B-MOD-01 | llama a prisma.candidate.create con los campos correctos', async () => {
    const data = {
      firstName: 'Ana',
      lastName: 'Martín',
      email: 'ana@test.com',
      phone: '666111222',
      address: 'Calle Luna 3',
    };
    mockCreate.mockResolvedValue({ id: 10, ...data });

    const candidate = new Candidate(data);
    const result = await candidate.save();

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('id', 10);
  });

  it('TDD-B-MOD-02 | omite campos undefined en candidateData', async () => {
    const data = { firstName: 'Pedro', lastName: 'Ruiz', email: 'pedro@test.com' };
    mockCreate.mockResolvedValue({ id: 11, ...data });

    const candidate = new Candidate(data);
    await candidate.save();

    const callArg = mockCreate.mock.calls[0][0].data;
    expect(callArg).not.toHaveProperty('phone');
    expect(callArg).not.toHaveProperty('address');
  });
});

// ─── Suite: Candidate.save() — actualizar ────────────────────────────────────
describe('BACKEND › Candidate › save() — actualización', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-B-MOD-03 | llama a prisma.candidate.update cuando id está presente', async () => {
    const data = { id: 5, firstName: 'Luis', lastName: 'Vega', email: 'luis@test.com' };
    mockUpdate.mockResolvedValue(data);

    const candidate = new Candidate(data);
    const result = await candidate.save();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 5 } })
    );
    expect(result).toEqual(data);
  });

  it('TDD-B-MOD-04 | lanza error descriptivo cuando registro no existe (P2025)', async () => {
    const p2025Error: any = new Error('Record not found');
    p2025Error.code = 'P2025';
    mockUpdate.mockRejectedValue(p2025Error);

    const candidate = new Candidate({ id: 999, firstName: 'X', lastName: 'Y', email: 'x@y.com' });

    await expect(candidate.save()).rejects.toThrow(
      'No se pudo encontrar el registro del candidato con el ID proporcionado.'
    );
  });
});

// ─── Suite: Candidate.findOne() ───────────────────────────────────────────────
describe('BACKEND › Candidate › findOne()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-B-MOD-05 | retorna instancia de Candidate cuando existe', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, firstName: 'Eva', lastName: 'Sanz', email: 'eva@test.com' });

    const result = await Candidate.findOne(1);

    expect(result).toBeInstanceOf(Candidate);
    expect(result?.firstName).toBe('Eva');
  });

  it('TDD-B-MOD-06 | retorna null cuando el candidato no existe', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await Candidate.findOne(9999);
    expect(result).toBeNull();
  });
});

// ─── Suite: Education.save() ──────────────────────────────────────────────────
describe('BACKEND › Education › save()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-B-MOD-07 | crea educación nueva (sin id)', async () => {
    const data = {
      institution: 'UAM',
      title: 'Física',
      startDate: '2010-09-01',
      endDate: '2015-06-30',
      candidateId: 1,
    };
    mockCreate.mockResolvedValue({ id: 3, ...data });

    const edu = new Education(data);
    await edu.save();

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('TDD-B-MOD-08 | actualiza educación existente (con id)', async () => {
    const data = {
      id: 3,
      institution: 'UAM',
      title: 'Física',
      startDate: '2010-09-01',
      candidateId: 1,
    };
    mockUpdate.mockResolvedValue(data);

    const edu = new Education(data);
    await edu.save();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 3 } })
    );
  });

  it('TDD-B-MOD-09 | convierte startDate string a objeto Date', () => {
    const edu = new Education({
      institution: 'MIT',
      title: 'CS',
      startDate: '2018-03-15',
      candidateId: 2,
    });
    expect(edu.startDate).toBeInstanceOf(Date);
  });
});

// ─── Suite: WorkExperience.save() ────────────────────────────────────────────
describe('BACKEND › WorkExperience › save()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-B-MOD-10 | crea experiencia nueva (sin id)', async () => {
    const data = {
      company: 'Google',
      position: 'SRE',
      description: 'Site reliability',
      startDate: '2019-01-01',
      candidateId: 2,
    };
    mockCreate.mockResolvedValue({ id: 7, ...data });

    const we = new WorkExperience(data);
    await we.save();

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('TDD-B-MOD-11 | convierte startDate string a objeto Date', () => {
    const we = new WorkExperience({
      company: 'Meta',
      position: 'Dev',
      startDate: '2021-06-01',
    });
    expect(we.startDate).toBeInstanceOf(Date);
  });
});

// ─── Suite: Resume.save() ─────────────────────────────────────────────────────
describe('BACKEND › Resume › save()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-B-MOD-12 | crea resume nuevo cuando no tiene id', async () => {
    const data = {
      filePath: 'uploads/cv.pdf',
      fileType: 'application/pdf',
      candidateId: 1,
    };
    mockCreate.mockResolvedValue({ id: 5, ...data, uploadDate: new Date() });

    const resume = new Resume(data);
    await resume.save();

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('TDD-B-MOD-13 | lanza error cuando se intenta actualizar un resume existente', async () => {
    const resume = new Resume({ id: 10, filePath: 'uploads/cv.pdf', fileType: 'application/pdf', candidateId: 1 });

    await expect(resume.save()).rejects.toThrow(
      'No se permite la actualización de un currículum existente.'
    );
  });
});
