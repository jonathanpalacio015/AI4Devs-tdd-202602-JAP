/**
 * ============================================================
 * BACKEND — UNIT TESTS: validator.ts
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * ============================================================
 *
 * Cubre: validateName, validateEmail, validatePhone, validateDate,
 *        validateAddress, validateEducation, validateExperience,
 *        validateCV, validateCandidateData
 */

import { validateCandidateData } from '../../../backend/src/application/validator';

// ─── Helpers reutilizables ────────────────────────────────────────────────────
const validCandidate = () => ({
  firstName: 'María',
  lastName: 'García',
  email: 'maria.garcia@example.com',
  phone: '612345678',
  address: 'Calle Mayor 10',
  educations: [],
  workExperiences: [],
  cv: {},
});

// ─── Suite: validateName ──────────────────────────────────────────────────────
describe('BACKEND › validator › validateName', () => {
  it('TDD-B-V-01 | acepta nombre válido con letras y espacios', () => {
    const data = validCandidate();
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-V-02 | lanza error cuando firstName está vacío', () => {
    const data = { ...validCandidate(), firstName: '' };
    expect(() => validateCandidateData(data)).toThrow('Invalid name');
  });

  it('TDD-B-V-03 | lanza error cuando firstName tiene un solo carácter (< 2)', () => {
    const data = { ...validCandidate(), firstName: 'A' };
    expect(() => validateCandidateData(data)).toThrow('Invalid name');
  });

  it('TDD-B-V-04 | lanza error cuando firstName supera 100 caracteres', () => {
    const data = { ...validCandidate(), firstName: 'A'.repeat(101) };
    expect(() => validateCandidateData(data)).toThrow('Invalid name');
  });

  it('TDD-B-V-05 | lanza error cuando firstName contiene dígitos', () => {
    const data = { ...validCandidate(), firstName: 'Carlos3' };
    expect(() => validateCandidateData(data)).toThrow('Invalid name');
  });

  it('TDD-B-V-06 | acepta nombre con exactamente 2 caracteres (límite mínimo)', () => {
    const data = { ...validCandidate(), firstName: 'Al' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-V-07 | acepta nombre con exactamente 100 caracteres (límite máximo)', () => {
    const data = { ...validCandidate(), firstName: 'A'.repeat(100) };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-V-08 | lanza error cuando lastName está undefined', () => {
    const data = { ...validCandidate(), lastName: undefined as any };
    expect(() => validateCandidateData(data)).toThrow('Invalid name');
  });

  it('TDD-B-V-09 | acepta nombres con tildes y ñ (soporte i18n)', () => {
    const data = { ...validCandidate(), firstName: 'José', lastName: 'Muñoz' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-V-10 | lanza error cuando nombre contiene caracteres especiales (@, #)', () => {
    const data = { ...validCandidate(), firstName: 'Ana@' };
    expect(() => validateCandidateData(data)).toThrow('Invalid name');
  });
});

// ─── Suite: validateEmail ─────────────────────────────────────────────────────
describe('BACKEND › validator › validateEmail', () => {
  it('TDD-B-E-01 | acepta email válido', () => {
    const data = validCandidate();
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-E-02 | lanza error cuando email está vacío', () => {
    const data = { ...validCandidate(), email: '' };
    expect(() => validateCandidateData(data)).toThrow('Invalid email');
  });

  it('TDD-B-E-03 | lanza error cuando email carece de @', () => {
    const data = { ...validCandidate(), email: 'correosindominio.com' };
    expect(() => validateCandidateData(data)).toThrow('Invalid email');
  });

  it('TDD-B-E-04 | lanza error cuando email carece de dominio TLD', () => {
    const data = { ...validCandidate(), email: 'usuario@dominio' };
    expect(() => validateCandidateData(data)).toThrow('Invalid email');
  });

  it('TDD-B-E-05 | lanza error cuando email tiene espacios', () => {
    const data = { ...validCandidate(), email: 'usuario @dominio.com' };
    expect(() => validateCandidateData(data)).toThrow('Invalid email');
  });

  it('TDD-B-E-06 | acepta email con subdominio', () => {
    const data = { ...validCandidate(), email: 'user@mail.empresa.es' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-E-07 | acepta email con caracteres permitidos (+, .)', () => {
    const data = { ...validCandidate(), email: 'user.name+tag@example.co' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });
});

// ─── Suite: validatePhone ─────────────────────────────────────────────────────
describe('BACKEND › validator › validatePhone', () => {
  it('TDD-B-P-01 | acepta teléfono móvil válido (6xxxxxxxx)', () => {
    const data = { ...validCandidate(), phone: '612345678' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-P-02 | acepta teléfono fijo válido (9xxxxxxxx)', () => {
    const data = { ...validCandidate(), phone: '912345678' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-P-03 | acepta teléfono móvil válido (7xxxxxxxx)', () => {
    const data = { ...validCandidate(), phone: '712345678' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-P-04 | acepta campo phone omitido (es opcional)', () => {
    const data = { ...validCandidate(), phone: undefined };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-P-05 | lanza error cuando phone empieza con 5 (inválido)', () => {
    const data = { ...validCandidate(), phone: '512345678' };
    expect(() => validateCandidateData(data)).toThrow('Invalid phone');
  });

  it('TDD-B-P-06 | lanza error cuando phone tiene 8 dígitos (corto)', () => {
    const data = { ...validCandidate(), phone: '61234567' };
    expect(() => validateCandidateData(data)).toThrow('Invalid phone');
  });

  it('TDD-B-P-07 | lanza error cuando phone tiene 10 dígitos (largo)', () => {
    const data = { ...validCandidate(), phone: '6123456789' };
    expect(() => validateCandidateData(data)).toThrow('Invalid phone');
  });

  it('TDD-B-P-08 | lanza error cuando phone incluye letras', () => {
    const data = { ...validCandidate(), phone: '61234567A' };
    expect(() => validateCandidateData(data)).toThrow('Invalid phone');
  });
});

// ─── Suite: validateAddress ───────────────────────────────────────────────────
describe('BACKEND › validator › validateAddress', () => {
  it('TDD-B-A-01 | acepta dirección válida', () => {
    const data = { ...validCandidate(), address: 'Av. Principal 123' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-A-02 | acepta dirección vacía (campo opcional)', () => {
    const data = { ...validCandidate(), address: '' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-A-03 | lanza error cuando dirección supera 100 caracteres', () => {
    const data = { ...validCandidate(), address: 'A'.repeat(101) };
    expect(() => validateCandidateData(data)).toThrow('Invalid address');
  });

  it('TDD-B-A-04 | acepta dirección con exactamente 100 caracteres (límite exacto)', () => {
    const data = { ...validCandidate(), address: 'A'.repeat(100) };
    expect(() => validateCandidateData(data)).not.toThrow();
  });
});

// ─── Suite: validateEducation ─────────────────────────────────────────────────
describe('BACKEND › validator › validateEducation', () => {
  const validEducation = {
    institution: 'Universidad Complutense',
    title: 'Ingeniería Informática',
    startDate: '2015-09-01',
    endDate: '2020-06-30',
  };

  it('TDD-B-ED-01 | acepta educación válida completa', () => {
    const data = { ...validCandidate(), educations: [validEducation] };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-ED-02 | lanza error cuando institution está vacía', () => {
    const data = {
      ...validCandidate(),
      educations: [{ ...validEducation, institution: '' }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid institution');
  });

  it('TDD-B-ED-03 | lanza error cuando institution supera 100 caracteres', () => {
    const data = {
      ...validCandidate(),
      educations: [{ ...validEducation, institution: 'X'.repeat(101) }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid institution');
  });

  it('TDD-B-ED-04 | lanza error cuando title está vacío', () => {
    const data = {
      ...validCandidate(),
      educations: [{ ...validEducation, title: '' }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid title');
  });

  it('TDD-B-ED-05 | lanza error cuando startDate tiene formato incorrecto', () => {
    const data = {
      ...validCandidate(),
      educations: [{ ...validEducation, startDate: '01/09/2015' }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid date');
  });

  it('TDD-B-ED-06 | lanza error cuando endDate tiene formato incorrecto', () => {
    const data = {
      ...validCandidate(),
      educations: [{ ...validEducation, endDate: '30-06-2020' }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid end date');
  });

  it('TDD-B-ED-07 | acepta educación sin endDate (en curso)', () => {
    const { endDate, ...educationSinFin } = validEducation;
    const data = { ...validCandidate(), educations: [educationSinFin] };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-ED-08 | acepta múltiples educaciones válidas', () => {
    const data = {
      ...validCandidate(),
      educations: [validEducation, { ...validEducation, title: 'Máster IA' }],
    };
    expect(() => validateCandidateData(data)).not.toThrow();
  });
});

// ─── Suite: validateExperience ────────────────────────────────────────────────
describe('BACKEND › validator › validateExperience', () => {
  const validExperience = {
    company: 'TechCorp S.L.',
    position: 'Software Engineer',
    description: 'Desarrollo backend con Node.js',
    startDate: '2020-01-01',
    endDate: '2023-12-31',
  };

  it('TDD-B-WE-01 | acepta experiencia válida completa', () => {
    const data = { ...validCandidate(), workExperiences: [validExperience] };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-WE-02 | lanza error cuando company está vacía', () => {
    const data = {
      ...validCandidate(),
      workExperiences: [{ ...validExperience, company: '' }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid company');
  });

  it('TDD-B-WE-03 | lanza error cuando position está vacía', () => {
    const data = {
      ...validCandidate(),
      workExperiences: [{ ...validExperience, position: '' }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid position');
  });

  it('TDD-B-WE-04 | lanza error cuando description supera 200 caracteres', () => {
    const data = {
      ...validCandidate(),
      workExperiences: [{ ...validExperience, description: 'D'.repeat(201) }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid description');
  });

  it('TDD-B-WE-05 | acepta description con exactamente 200 caracteres (límite)', () => {
    const data = {
      ...validCandidate(),
      workExperiences: [{ ...validExperience, description: 'D'.repeat(200) }],
    };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-WE-06 | acepta experiencia sin endDate (empleo actual)', () => {
    const { endDate, ...expSinFin } = validExperience;
    const data = { ...validCandidate(), workExperiences: [expSinFin] };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-WE-07 | lanza error cuando startDate es inválida', () => {
    const data = {
      ...validCandidate(),
      workExperiences: [{ ...validExperience, startDate: 'not-a-date' }],
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid date');
  });
});

// ─── Suite: validateCV ───────────────────────────────────────────────────────
describe('BACKEND › validator › validateCV', () => {
  it('TDD-B-CV-01 | acepta CV con filePath y fileType válidos', () => {
    const data = {
      ...validCandidate(),
      cv: { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' },
    };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-CV-02 | acepta CV vacío {} (no adjuntado)', () => {
    const data = { ...validCandidate(), cv: {} };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('TDD-B-CV-03 | lanza error cuando CV carece de filePath', () => {
    const data = {
      ...validCandidate(),
      cv: { fileType: 'application/pdf' },
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid CV data');
  });

  it('TDD-B-CV-04 | lanza error cuando CV carece de fileType', () => {
    const data = {
      ...validCandidate(),
      cv: { filePath: 'uploads/cv.pdf' },
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid CV data');
  });

  it('TDD-B-CV-05 | lanza error cuando filePath no es string', () => {
    const data = {
      ...validCandidate(),
      cv: { filePath: 123, fileType: 'application/pdf' },
    };
    expect(() => validateCandidateData(data)).toThrow('Invalid CV data');
  });
});

// ─── Suite: validateCandidateData con id (edición) ────────────────────────────
describe('BACKEND › validator › validateCandidateData — modo edición', () => {
  it('TDD-B-ID-01 | omite validaciones cuando se provee id (edición)', () => {
    // Cuando hay id, el validador retorna inmediatamente sin lanzar errores
    const data = { id: 42, firstName: '', email: '' };
    expect(() => validateCandidateData(data)).not.toThrow();
  });
});
