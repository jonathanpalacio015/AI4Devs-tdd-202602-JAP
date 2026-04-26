/**
 * ============================================================
 * BACKEND — UNIT TESTS: candidateService.ts
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * ============================================================
 *
 * Cubre: addCandidate — validación, persistencia (mock de Prisma),
 *        manejo de errores de unicidad P2002, errores genéricos.
 */

jest.mock('../../../backend/src/domain/models/Candidate');
jest.mock('../../../backend/src/domain/models/Education');
jest.mock('../../../backend/src/domain/models/WorkExperience');
jest.mock('../../../backend/src/domain/models/Resume');
jest.mock('../../../backend/src/application/validator');

import { addCandidate } from '../../../backend/src/application/services/candidateService';
import { Candidate } from '../../../backend/src/domain/models/Candidate';
import { Education } from '../../../backend/src/domain/models/Education';
import { WorkExperience } from '../../../backend/src/domain/models/WorkExperience';
import { Resume } from '../../../backend/src/domain/models/Resume';
import { validateCandidateData } from '../../../backend/src/application/validator';

const MockCandidate = Candidate as jest.MockedClass<typeof Candidate>;
const MockEducation = Education as jest.MockedClass<typeof Education>;
const MockWorkExperience = WorkExperience as jest.MockedClass<typeof WorkExperience>;
const MockResume = Resume as jest.MockedClass<typeof Resume>;
const mockValidate = validateCandidateData as jest.MockedFunction<typeof validateCandidateData>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeCandidateData = (overrides = {}) => ({
  firstName: 'Carlos',
  lastName: 'López',
  email: 'carlos@example.com',
  phone: '699111222',
  address: 'Calle Sol 5',
  educations: [],
  workExperiences: [],
  cv: {},
  ...overrides,
});

const savedCandidate = { id: 1, firstName: 'Carlos', lastName: 'López', email: 'carlos@example.com' };

// ─── Setup / Teardown ─────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();

  // Por defecto, validate no lanza error
  mockValidate.mockImplementation(() => undefined);

  // Mock de instancia Candidate con save exitoso
  MockCandidate.mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(savedCandidate),
    education: [],
    workExperience: [],
    resumes: [],
  } as any));
});

// ─── Suite: addCandidate — flujo feliz ───────────────────────────────────────
describe('BACKEND › candidateService › addCandidate — flujo feliz', () => {
  it('TDD-B-CS-01 | llama a validateCandidateData con los datos recibidos', async () => {
    const data = makeCandidateData();
    await addCandidate(data);
    expect(mockValidate).toHaveBeenCalledWith(data);
  });

  it('TDD-B-CS-02 | crea una instancia de Candidate con los datos correctos', async () => {
    const data = makeCandidateData();
    await addCandidate(data);
    expect(MockCandidate).toHaveBeenCalledWith(data);
  });

  it('TDD-B-CS-03 | llama a candidate.save() exactamente una vez', async () => {
    const saveMock = jest.fn().mockResolvedValue(savedCandidate);
    MockCandidate.mockImplementation(() => ({
      save: saveMock,
      education: [],
      workExperience: [],
      resumes: [],
    } as any));

    await addCandidate(makeCandidateData());
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('TDD-B-CS-04 | retorna el candidato guardado', async () => {
    const result = await addCandidate(makeCandidateData());
    expect(result).toEqual(savedCandidate);
  });

  it('TDD-B-CS-05 | guarda educación cuando se provee', async () => {
    const educationSaveMock = jest.fn().mockResolvedValue({});
    MockEducation.mockImplementation(() => ({
      save: educationSaveMock,
      candidateId: undefined,
    } as any));

    const data = makeCandidateData({
      educations: [{ institution: 'UC3M', title: 'CS', startDate: '2015-09-01' }],
    });

    await addCandidate(data);
    expect(MockEducation).toHaveBeenCalledTimes(1);
    expect(educationSaveMock).toHaveBeenCalledTimes(1);
  });

  it('TDD-B-CS-06 | guarda workExperience cuando se provee', async () => {
    const expSaveMock = jest.fn().mockResolvedValue({});
    MockWorkExperience.mockImplementation(() => ({
      save: expSaveMock,
      candidateId: undefined,
    } as any));

    const data = makeCandidateData({
      workExperiences: [{ company: 'Acme', position: 'Dev', startDate: '2020-01-01' }],
    });

    await addCandidate(data);
    expect(MockWorkExperience).toHaveBeenCalledTimes(1);
    expect(expSaveMock).toHaveBeenCalledTimes(1);
  });

  it('TDD-B-CS-07 | guarda CV (Resume) cuando se provee', async () => {
    const resumeSaveMock = jest.fn().mockResolvedValue({});
    MockResume.mockImplementation(() => ({
      save: resumeSaveMock,
      candidateId: undefined,
    } as any));

    const data = makeCandidateData({
      cv: { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' },
    });

    await addCandidate(data);
    expect(MockResume).toHaveBeenCalledTimes(1);
    expect(resumeSaveMock).toHaveBeenCalledTimes(1);
  });

  it('TDD-B-CS-08 | NO guarda CV cuando cv es objeto vacío', async () => {
    await addCandidate(makeCandidateData({ cv: {} }));
    expect(MockResume).not.toHaveBeenCalled();
  });
});

// ─── Suite: addCandidate — manejo de errores ──────────────────────────────────
describe('BACKEND › candidateService › addCandidate — manejo de errores', () => {
  it('TDD-B-CS-09 | propaga el error de validación', async () => {
    mockValidate.mockImplementation(() => {
      throw new Error('Invalid email');
    });

    await expect(addCandidate(makeCandidateData({ email: 'bad' }))).rejects.toThrow('Invalid email');
  });

  it('TDD-B-CS-10 | lanza "The email already exists" cuando error.code === P2002', async () => {
    const p2002Error: any = new Error('Unique constraint failed');
    p2002Error.code = 'P2002';

    MockCandidate.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(p2002Error),
      education: [],
      workExperience: [],
      resumes: [],
    } as any));

    await expect(addCandidate(makeCandidateData())).rejects.toThrow(
      'The email already exists in the database'
    );
  });

  it('TDD-B-CS-11 | propaga error genérico de la base de datos', async () => {
    const dbError = new Error('Connection refused');

    MockCandidate.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(dbError),
      education: [],
      workExperience: [],
      resumes: [],
    } as any));

    await expect(addCandidate(makeCandidateData())).rejects.toThrow('Connection refused');
  });
});
