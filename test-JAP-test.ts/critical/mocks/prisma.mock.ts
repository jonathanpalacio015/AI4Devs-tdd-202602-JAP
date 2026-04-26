/**
 * Mock de Prisma para pruebas de riesgos criticos.
 * Objetivo: ejecutar tests sin tocar la base de datos real.
 */

export type PrismaMock = {
  candidate: {
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findUnique: jest.Mock;
  };
  education: {
    create: jest.Mock;
  };
  workExperience: {
    create: jest.Mock;
  };
  resume: {
    create: jest.Mock;
  };
  $transaction: jest.Mock;
};

export const buildPrismaMock = (): PrismaMock => {
  const prismaMock: PrismaMock = {
    candidate: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    education: {
      create: jest.fn(),
    },
    workExperience: {
      create: jest.fn(),
    },
    resume: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (callback: (tx: PrismaMock) => Promise<unknown>) => callback(prismaMock)),
  };

  return prismaMock;
};

export const resetPrismaMock = (prismaMock: PrismaMock): void => {
  prismaMock.candidate.create.mockReset();
  prismaMock.candidate.update.mockReset();
  prismaMock.candidate.delete.mockReset();
  prismaMock.candidate.findUnique.mockReset();
  prismaMock.education.create.mockReset();
  prismaMock.workExperience.create.mockReset();
  prismaMock.resume.create.mockReset();
  prismaMock.$transaction.mockClear();
};
