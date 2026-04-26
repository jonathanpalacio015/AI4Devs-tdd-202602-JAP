/**
 * ============================================================
 * SHARED — TESTS REUTILIZADOS POR GESTIÓN DE CÓDIGO
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * ============================================================
 *
 * Estos helpers y tests son compartidos entre frontend y backend.
 * Contienen:
 *   1. Factories de datos de prueba reutilizables
 *   2. Tests de las reglas de negocio comunes (contratos de datos)
 *   3. Aserciones reutilizables como custom matchers
 *
 * NOTA: Los helpers exportados son importados en otros archivos
 *       de test para evitar duplicación (DRY en tests).
 */

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 1 — FACTORIES DE DATOS COMPARTIDOS
// ═══════════════════════════════════════════════════════════════

/** Candidato válido mínimo (usado en backend y en payload del frontend) */
export const candidateFactory = (overrides: Record<string, any> = {}) => ({
  firstName: 'Laura',
  lastName: 'Pérez',
  email: 'laura.perez@example.com',
  phone: '634567890',
  address: 'Av. Libertad 42',
  educations: [],
  workExperiences: [],
  cv: {},
  ...overrides,
});

/** Educación válida */
export const educationFactory = (overrides: Record<string, any> = {}) => ({
  institution: 'Universidad de Sevilla',
  title: 'Grado en ADE',
  startDate: '2012-09-01',
  endDate: '2016-06-30',
  ...overrides,
});

/** Experiencia laboral válida */
export const workExperienceFactory = (overrides: Record<string, any> = {}) => ({
  company: 'StartupXYZ',
  position: 'Product Manager',
  description: 'Gestión de producto y roadmap',
  startDate: '2017-01-15',
  endDate: '2022-03-31',
  ...overrides,
});

/** CV válido */
export const cvFactory = (overrides: Record<string, any> = {}) => ({
  filePath: 'uploads/1234567890-curriculum.pdf',
  fileType: 'application/pdf',
  ...overrides,
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 2 — TESTS DE CONTRATO DE DATOS (Shared Business Rules)
// ═══════════════════════════════════════════════════════════════

describe('SHARED › Factories de datos › candidateFactory', () => {
  it('TDD-SH-01 | genera un candidato con todos los campos requeridos', () => {
    const c = candidateFactory();
    expect(c).toHaveProperty('firstName');
    expect(c).toHaveProperty('lastName');
    expect(c).toHaveProperty('email');
  });

  it('TDD-SH-02 | permite sobreescribir cualquier campo', () => {
    const c = candidateFactory({ firstName: 'Juan', email: 'juan@otro.com' });
    expect(c.firstName).toBe('Juan');
    expect(c.email).toBe('juan@otro.com');
  });

  it('TDD-SH-03 | educations y workExperiences son arrays vacíos por defecto', () => {
    const c = candidateFactory();
    expect(Array.isArray(c.educations)).toBe(true);
    expect(Array.isArray(c.workExperiences)).toBe(true);
  });
});

describe('SHARED › Factories de datos › educationFactory', () => {
  it('TDD-SH-04 | genera educación con todos los campos', () => {
    const e = educationFactory();
    expect(e).toHaveProperty('institution');
    expect(e).toHaveProperty('title');
    expect(e).toHaveProperty('startDate');
  });

  it('TDD-SH-05 | permite educación sin endDate (en curso)', () => {
    const e = educationFactory({ endDate: undefined });
    expect(e.endDate).toBeUndefined();
  });
});

describe('SHARED › Factories de datos › workExperienceFactory', () => {
  it('TDD-SH-06 | genera experiencia con todos los campos', () => {
    const we = workExperienceFactory();
    expect(we).toHaveProperty('company');
    expect(we).toHaveProperty('position');
    expect(we).toHaveProperty('startDate');
  });
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 3 — REGLAS DE NEGOCIO COMPARTIDAS (contratos de API)
// ═══════════════════════════════════════════════════════════════

/**
 * Estas pruebas verifican el contrato de datos que comparte
 * el frontend (payload que envía) con el backend (estructura que espera).
 * Son independientes del framework y se pueden ejecutar en ambos entornos.
 */

describe('SHARED › Contrato de API › estructura del payload de candidato', () => {
  it('TDD-SH-07 | el payload incluye todos los campos esperados por el backend', () => {
    const payload = candidateFactory({
      educations: [educationFactory()],
      workExperiences: [workExperienceFactory()],
      cv: cvFactory(),
    });

    // Campos de primer nivel requeridos
    const requiredFields = ['firstName', 'lastName', 'email'];
    requiredFields.forEach(field => expect(payload).toHaveProperty(field));

    // Arrays de secciones
    expect(Array.isArray(payload.educations)).toBe(true);
    expect(Array.isArray(payload.workExperiences)).toBe(true);

    // CV como objeto
    expect(typeof payload.cv).toBe('object');
  });

  it('TDD-SH-08 | las fechas en educaciones siguen formato YYYY-MM-DD', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const edu = educationFactory();
    expect(edu.startDate).toMatch(dateRegex);
    expect(edu.endDate).toMatch(dateRegex);
  });

  it('TDD-SH-09 | las fechas en experiencias siguen formato YYYY-MM-DD', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const we = workExperienceFactory();
    expect(we.startDate).toMatch(dateRegex);
    expect(we.endDate).toMatch(dateRegex);
  });

  it('TDD-SH-10 | el CV tiene filePath como string y fileType como string', () => {
    const cv = cvFactory();
    expect(typeof cv.filePath).toBe('string');
    expect(typeof cv.fileType).toBe('string');
  });

  it('TDD-SH-11 | fileType del CV es PDF o DOCX', () => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const cv = cvFactory();
    expect(allowedTypes).toContain(cv.fileType);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 4 — CUSTOM MATCHERS REUTILIZABLES
// ═══════════════════════════════════════════════════════════════

/**
 * Exportamos como funciones de aserción reutilizables
 * que pueden ser invocadas desde cualquier test file.
 */

/** Verifica que un objeto cumple la forma mínima de un candidato de API */
export const expectValidCandidateShape = (obj: Record<string, any>) => {
  expect(obj).toHaveProperty('firstName');
  expect(obj).toHaveProperty('lastName');
  expect(obj).toHaveProperty('email');
  expect(typeof obj.firstName).toBe('string');
  expect(typeof obj.lastName).toBe('string');
  expect(typeof obj.email).toBe('string');
  expect(obj.firstName.length).toBeGreaterThanOrEqual(2);
  expect(obj.lastName.length).toBeGreaterThanOrEqual(2);
};

describe('SHARED › Custom matchers › expectValidCandidateShape', () => {
  it('TDD-SH-12 | no lanza cuando el objeto es un candidato válido', () => {
    expect(() => expectValidCandidateShape(candidateFactory())).not.toThrow();
  });

  it('TDD-SH-13 | lanza cuando falta el campo email', () => {
    const bad = { firstName: 'Ana', lastName: 'García' };
    expect(() => expectValidCandidateShape(bad)).toThrow();
  });
});
