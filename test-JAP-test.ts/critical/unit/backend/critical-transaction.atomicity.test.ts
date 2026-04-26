/// <reference types="jest" />

/**
 * CRITICAL UNIT TESTS
 * Caso critico: guardado parcial sin transaccion (CL-CC-03)
 *
 * Enfoque TDD:
 * - RED: el servicio deberia ser atomico
 * - GREEN: implementar transaccion/rollback en codigo productivo
 */

import { addCandidate } from '../../../../backend/src/application/services/candidateService';

const validateCandidateDataMock = jest.fn();
const candidateSaveMock = jest.fn();
const educationSaveMock = jest.fn();
const workExperienceSaveMock = jest.fn();
const resumeSaveMock = jest.fn();
const rollbackDeleteMock = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    candidate: {
      delete: (...args: any[]) => rollbackDeleteMock(...args),
    },
  })),
}), { virtual: true });

jest.mock('../../../../backend/src/application/validator', () => ({
  validateCandidateData: (...args: any[]) => validateCandidateDataMock(...args),
}));

jest.mock('../../../../backend/src/domain/models/Candidate', () => ({
  Candidate: jest.fn().mockImplementation(() => ({
    save: (...args: any[]) => candidateSaveMock(...args),
    education: [],
    workExperience: [],
    resumes: [],
  })),
}));

jest.mock('../../../../backend/src/domain/models/Education', () => ({
  Education: jest.fn().mockImplementation(() => ({
    candidateId: undefined,
    save: (...args: any[]) => educationSaveMock(...args),
  })),
}));

jest.mock('../../../../backend/src/domain/models/WorkExperience', () => ({
  WorkExperience: jest.fn().mockImplementation(() => ({
    candidateId: undefined,
    save: (...args: any[]) => workExperienceSaveMock(...args),
  })),
}));

jest.mock('../../../../backend/src/domain/models/Resume', () => ({
  Resume: jest.fn().mockImplementation(() => ({
    candidateId: undefined,
    save: (...args: any[]) => resumeSaveMock(...args),
  })),
}));

type FakeDbState = {
  candidateCreated: boolean;
};

describe('CRITICAL BACKEND UNIT › Atomicidad de guardado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validateCandidateDataMock.mockImplementation(() => undefined);
    candidateSaveMock.mockResolvedValue({ id: 50 });
    educationSaveMock.mockResolvedValue({ id: 70 });
    workExperienceSaveMock.mockResolvedValue({ id: 80 });
    resumeSaveMock.mockResolvedValue({ id: 90 });
  });

  it('CRIT-CC03-RED-01 | si falla education.save, NO debe quedar candidato persistido (rollback esperado)', async () => {
    const fakeDb: FakeDbState = {
      candidateCreated: false,
    };

    candidateSaveMock.mockImplementation(async () => {
      fakeDb.candidateCreated = true;
      return { id: 50 };
    });
    educationSaveMock.mockRejectedValue(new Error('Education insert failed'));

    const payload = {
      firstName: 'Laura',
      lastName: 'Perez',
      email: 'laura@example.com',
      educations: [
        {
          institution: 'UAM',
          title: 'CS',
          startDate: '2020-01-01',
        },
      ],
      workExperiences: [],
      cv: {},
    };

    await expect(addCandidate(payload)).rejects.toThrow('Education insert failed');

    expect(rollbackDeleteMock).toHaveBeenCalledWith({ where: { id: 50 } });
  });

  it.todo('CRIT-CC03-RED-02 | ejecutar addCandidate dentro de una transaccion explicita de Prisma');
});
