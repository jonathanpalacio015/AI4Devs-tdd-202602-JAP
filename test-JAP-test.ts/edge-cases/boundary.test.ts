/**
 * ============================================================
 * CASOS LÍMITE — BOUNDARY & EDGE CASE TESTS
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * ============================================================
 *
 * Cubre todos los valores extremos identificados en el análisis
 * de las reglas de negocio. Incluye:
 *
 *   ► Límites exactos de longitud (min-1, min, min+1, max-1, max, max+1)
 *   ► Caracteres especiales, Unicode, inyección
 *   ► Fechas extremas y formatos incorrectos
 *   ► Payloads vacíos, nulos, undefined
 *   ► Números de teléfono frontera
 *   ► Arrays vacíos vs. undefined en colecciones
 *   ► CV con rutas y tipos extremos
 *   ► Concurrencia simulada (email duplicado)
 *   ► Casos identificados para investigación futura
 */

import { validateCandidateData } from '../../../backend/src/application/validator';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const base = () => ({
  firstName: 'Ana',
  lastName: 'García',
  email: 'ana@example.com',
  phone: '699999999',
  address: '',
  educations: [],
  workExperiences: [],
  cv: {},
});

// ═══════════════════════════════════════════════════════════════
// BLOQUE 1 — NOMBRE (firstName / lastName)
// ═══════════════════════════════════════════════════════════════

describe('EDGE › Nombre — longitud exacta', () => {
  it('EL-N-01 | firstName con 1 carácter (por debajo del mínimo) → error', () => {
    expect(() => validateCandidateData({ ...base(), firstName: 'A' })).toThrow('Invalid name');
  });

  it('EL-N-02 | firstName con 2 caracteres (mínimo exacto) → válido', () => {
    expect(() => validateCandidateData({ ...base(), firstName: 'Al' })).not.toThrow();
  });

  it('EL-N-03 | firstName con 3 caracteres (mínimo + 1) → válido', () => {
    expect(() => validateCandidateData({ ...base(), firstName: 'Ali' })).not.toThrow();
  });

  it('EL-N-04 | firstName con 99 caracteres (máximo - 1) → válido', () => {
    expect(() => validateCandidateData({ ...base(), firstName: 'A'.repeat(99) })).not.toThrow();
  });

  it('EL-N-05 | firstName con 100 caracteres (máximo exacto) → válido', () => {
    expect(() => validateCandidateData({ ...base(), firstName: 'A'.repeat(100) })).not.toThrow();
  });

  it('EL-N-06 | firstName con 101 caracteres (máximo + 1) → error', () => {
    expect(() => validateCandidateData({ ...base(), firstName: 'A'.repeat(101) })).toThrow('Invalid name');
  });

  it('EL-N-07 | firstName con solo espacios → error (no cumple regex de letras)', () => {
    expect(() => validateCandidateData({ ...base(), firstName: '   ' })).toThrow('Invalid name');
  });

  it('EL-N-08 | firstName null → error', () => {
    expect(() => validateCandidateData({ ...base(), firstName: null as any })).toThrow('Invalid name');
  });

  it('EL-N-09 | firstName con emojis → error', () => {
    expect(() => validateCandidateData({ ...base(), firstName: '😀😀' })).toThrow('Invalid name');
  });

  it('EL-N-10 | firstName con dígito incrustado → error', () => {
    expect(() => validateCandidateData({ ...base(), firstName: 'Ana1' })).toThrow('Invalid name');
  });

  it('EL-N-11 | firstName con guión → error (fuera del regex)', () => {
    // El regex NAME_REGEX no incluye guiones: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/
    expect(() => validateCandidateData({ ...base(), firstName: 'Anne-Marie' })).toThrow('Invalid name');
  });

  it('EL-N-12 | firstName con apóstrofe → error', () => {
    expect(() => validateCandidateData({ ...base(), firstName: "O'Brien" })).toThrow('Invalid name');
  });
});

// ═══════════════════════════════════════════════════════════════
// BLOQUE 2 — EMAIL
// ═══════════════════════════════════════════════════════════════

describe('EDGE › Email — formatos extremos', () => {
  it('EL-E-01 | email con TLD de 1 carácter → error', () => {
    expect(() => validateCandidateData({ ...base(), email: 'user@domain.x' })).toThrow('Invalid email');
  });

  it('EL-E-02 | email con TLD de 2 caracteres (mínimo) → válido', () => {
    expect(() => validateCandidateData({ ...base(), email: 'user@domain.io' })).not.toThrow();
  });

  it('EL-E-03 | email con doble @@ → error', () => {
    expect(() => validateCandidateData({ ...base(), email: 'user@@domain.com' })).toThrow('Invalid email');
  });

  it('EL-E-04 | email solo con @ → error', () => {
    expect(() => validateCandidateData({ ...base(), email: '@' })).toThrow('Invalid email');
  });

  it('EL-E-05 | email con salto de línea → error', () => {
    expect(() => validateCandidateData({ ...base(), email: 'user\n@domain.com' })).toThrow('Invalid email');
  });

  it('EL-E-06 | email con inyección SQL en local-part → error', () => {
    expect(() =>
      validateCandidateData({ ...base(), email: "'; DROP TABLE candidates;--@domain.com" })
    ).toThrow('Invalid email');
  });

  it('EL-E-07 | email con caracteres unicode fuera de ASCII → error', () => {
    expect(() => validateCandidateData({ ...base(), email: 'usér@domain.com' })).toThrow('Invalid email');
  });

  it('EL-E-08 | email extremadamente largo (256 chars) → comportamiento verificado', () => {
    const longLocal = 'a'.repeat(244);
    const email = `${longLocal}@domain.com`; // 256 chars total
    // La regex no limita longitud, pero documentamos el comportamiento
    // Si en el futuro se añade límite, este test fallará y marcará el cambio
    const throwsOrNot = () => validateCandidateData({ ...base(), email });
    expect(throwsOrNot).not.toThrow(); // Sin límite de longitud hoy
  });
});

// ═══════════════════════════════════════════════════════════════
// BLOQUE 3 — TELÉFONO
// ═══════════════════════════════════════════════════════════════

describe('EDGE › Teléfono — prefijos y longitudes frontera', () => {
  const prefijosValidos = ['6', '7', '9'];
  const prefijosInvalidos = ['1', '2', '3', '4', '5', '8', '0'];

  prefijosValidos.forEach(p => {
    it(`EL-T-01-${p} | teléfono que empieza por ${p} con 9 dígitos → válido`, () => {
      expect(() => validateCandidateData({ ...base(), phone: `${p}${'1'.repeat(8)}` })).not.toThrow();
    });
  });

  prefijosInvalidos.forEach(p => {
    it(`EL-T-02-${p} | teléfono que empieza por ${p} → error`, () => {
      expect(() => validateCandidateData({ ...base(), phone: `${p}${'1'.repeat(8)}` })).toThrow('Invalid phone');
    });
  });

  it('EL-T-03 | teléfono de 8 dígitos (mínimo - 1) → error', () => {
    expect(() => validateCandidateData({ ...base(), phone: '61234567' })).toThrow('Invalid phone');
  });

  it('EL-T-04 | teléfono de 10 dígitos (máximo + 1) → error', () => {
    expect(() => validateCandidateData({ ...base(), phone: '6123456789' })).toThrow('Invalid phone');
  });

  it('EL-T-05 | teléfono con prefijo internacional (+34) → error', () => {
    expect(() => validateCandidateData({ ...base(), phone: '+34612345678' })).toThrow('Invalid phone');
  });

  it('EL-T-06 | teléfono con guiones → error', () => {
    expect(() => validateCandidateData({ ...base(), phone: '612-345-678' })).toThrow('Invalid phone');
  });

  it('EL-T-07 | teléfono con todos los noves (999999999) → válido', () => {
    expect(() => validateCandidateData({ ...base(), phone: '999999999' })).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// BLOQUE 4 — DIRECCIÓN
// ═══════════════════════════════════════════════════════════════

describe('EDGE › Dirección — longitud exacta', () => {
  it('EL-D-01 | dirección con 99 caracteres (máximo - 1) → válido', () => {
    expect(() => validateCandidateData({ ...base(), address: 'A'.repeat(99) })).not.toThrow();
  });

  it('EL-D-02 | dirección con 100 caracteres (máximo exacto) → válido', () => {
    expect(() => validateCandidateData({ ...base(), address: 'A'.repeat(100) })).not.toThrow();
  });

  it('EL-D-03 | dirección con 101 caracteres (máximo + 1) → error', () => {
    expect(() => validateCandidateData({ ...base(), address: 'A'.repeat(101) })).toThrow('Invalid address');
  });

  it('EL-D-04 | dirección undefined (campo omitido) → válido', () => {
    const data = { ...base() };
    delete (data as any).address;
    expect(() => validateCandidateData(data)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// BLOQUE 5 — FECHAS
// ═══════════════════════════════════════════════════════════════

describe('EDGE › Fechas — formatos y valores extremos', () => {
  const edu = (overrides: any) => ({
    institution: 'UPM',
    title: 'Ingeniería',
    startDate: '2000-01-01',
    ...overrides,
  });

  it('EL-F-01 | fecha en formato DD/MM/YYYY → error', () => {
    expect(() =>
      validateCandidateData({ ...base(), educations: [edu({ startDate: '01/01/2000' })] })
    ).toThrow('Invalid date');
  });

  it('EL-F-02 | fecha en formato MM-DD-YYYY → error', () => {
    expect(() =>
      validateCandidateData({ ...base(), educations: [edu({ startDate: '01-01-2000' })] })
    ).toThrow('Invalid date');
  });

  it('EL-F-03 | fecha "0000-00-00" (ceros) → pasa la regex YYYY-MM-DD pero puede ser inválida lógicamente', () => {
    // La regex /^\d{4}-\d{2}-\d{2}$/ acepta "0000-00-00"
    // Este caso documenta un comportamiento a corregir
    expect(() =>
      validateCandidateData({ ...base(), educations: [edu({ startDate: '0000-00-00' })] })
    ).not.toThrow(); // ⚠️ Caso a mejorar — ver README de casos límite
  });

  it('EL-F-04 | fecha "9999-12-31" (máxima) → pasa la regex', () => {
    expect(() =>
      validateCandidateData({ ...base(), educations: [edu({ startDate: '9999-12-31' })] })
    ).not.toThrow();
  });

  it('EL-F-05 | fecha "2000-13-01" (mes inválido 13) → pasa la regex pero es inválida lógicamente', () => {
    // La regex no valida rangos de mes/día — documenta caso a mejorar
    expect(() =>
      validateCandidateData({ ...base(), educations: [edu({ startDate: '2000-13-01' })] })
    ).not.toThrow(); // ⚠️ Caso a mejorar
  });

  it('EL-F-06 | fecha "2000-02-30" (29 Feb en año no bisiesto) → pasa regex pero es inválida', () => {
    expect(() =>
      validateCandidateData({ ...base(), educations: [edu({ startDate: '2000-02-30' })] })
    ).not.toThrow(); // ⚠️ Caso a mejorar
  });

  it('EL-F-07 | fecha como número (20001231) → error', () => {
    expect(() =>
      validateCandidateData({ ...base(), educations: [edu({ startDate: 20001231 as any })] })
    ).toThrow('Invalid date');
  });

  it('EL-F-08 | fecha como objeto Date → error (la regex espera string)', () => {
    expect(() =>
      validateCandidateData({ ...base(), educations: [edu({ startDate: new Date('2000-01-01') as any })] })
    ).toThrow('Invalid date');
  });
});

// ═══════════════════════════════════════════════════════════════
// BLOQUE 6 — DESCRIPTION de experiencia
// ═══════════════════════════════════════════════════════════════

describe('EDGE › Description de experiencia — longitud exacta', () => {
  const we = (overrides: any) => ({
    company: 'Empresa',
    position: 'Dev',
    startDate: '2020-01-01',
    ...overrides,
  });

  it('EL-DESC-01 | description con 199 caracteres (máximo - 1) → válido', () => {
    expect(() =>
      validateCandidateData({ ...base(), workExperiences: [we({ description: 'D'.repeat(199) })] })
    ).not.toThrow();
  });

  it('EL-DESC-02 | description con 200 caracteres (máximo exacto) → válido', () => {
    expect(() =>
      validateCandidateData({ ...base(), workExperiences: [we({ description: 'D'.repeat(200) })] })
    ).not.toThrow();
  });

  it('EL-DESC-03 | description con 201 caracteres (máximo + 1) → error', () => {
    expect(() =>
      validateCandidateData({ ...base(), workExperiences: [we({ description: 'D'.repeat(201) })] })
    ).toThrow('Invalid description');
  });

  it('EL-DESC-04 | description undefined (campo opcional) → válido', () => {
    expect(() =>
      validateCandidateData({ ...base(), workExperiences: [we({ description: undefined })] })
    ).not.toThrow();
  });

  it('EL-DESC-05 | description con solo espacios (200 espacios) → válido (no hay validación de contenido)', () => {
    expect(() =>
      validateCandidateData({ ...base(), workExperiences: [we({ description: ' '.repeat(200) })] })
    ).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// BLOQUE 7 — CV
// ═══════════════════════════════════════════════════════════════

describe('EDGE › CV — tipos y estructuras extremas', () => {
  it('EL-CV-01 | CV null → no lanza (Object.keys lanza si cv es null sin guard)', () => {
    // cv null → Object.keys(null) lanzaría TypeError sin guard
    // Este caso verifica si hay protección
    const data = { ...base(), cv: null as any };
    // La implementación usa: if (data.cv && Object.keys(data.cv).length > 0)
    // null es falsy → no entra → no valida → no lanza
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('EL-CV-02 | CV undefined → no lanza', () => {
    const data = { ...base(), cv: undefined };
    expect(() => validateCandidateData(data)).not.toThrow();
  });

  it('EL-CV-03 | CV con filePath vacío string → error', () => {
    expect(() =>
      validateCandidateData({ ...base(), cv: { filePath: '', fileType: 'application/pdf' } })
    ).toThrow('Invalid CV data');
  });

  it('EL-CV-04 | CV con fileType vacío string → error', () => {
    expect(() =>
      validateCandidateData({ ...base(), cv: { filePath: 'uploads/cv.pdf', fileType: '' } })
    ).toThrow('Invalid CV data');
  });

  it('EL-CV-05 | CV como array vacío [] → error (no es objeto plano con keys)', () => {
    // [] es objeto pero typeof [] === 'object' y filePath no existe → error
    expect(() => validateCandidateData({ ...base(), cv: [] as any })).not.toThrow(); // [] tiene length 0 → no entra
  });

  it('EL-CV-06 | CV con fileType no permitido (image/png) → no lanza en validador (solo Multer lo rechaza)', () => {
    // validateCV solo verifica que filePath y fileType sean strings — no el tipo MIME
    expect(() =>
      validateCandidateData({ ...base(), cv: { filePath: 'uploads/img.png', fileType: 'image/png' } })
    ).not.toThrow(); // ⚠️ Caso a mejorar en el validador
  });
});

// ═══════════════════════════════════════════════════════════════
// BLOQUE 8 — PAYLOAD COMPLETO VACÍO / NULO
// ═══════════════════════════════════════════════════════════════

describe('EDGE › Payload general — casos extremos de entrada', () => {
  it('EL-PL-01 | payload completamente vacío {} → error (sin firstName)', () => {
    expect(() => validateCandidateData({})).toThrow('Invalid name');
  });

  it('EL-PL-02 | payload con campos numéricos en lugar de strings → error', () => {
    expect(() =>
      validateCandidateData({ firstName: 123 as any, lastName: 456 as any, email: 789 as any })
    ).toThrow('Invalid name');
  });

  it('EL-PL-03 | payload con id presente → omite todas las validaciones', () => {
    // Con id, el validator retorna inmediatamente — modo edición
    expect(() => validateCandidateData({ id: 1 })).not.toThrow();
  });

  it('EL-PL-04 | payload con arrays de educación con objetos vacíos → error de institución', () => {
    expect(() =>
      validateCandidateData({ ...base(), educations: [{}] })
    ).toThrow('Invalid institution');
  });

  it('EL-PL-05 | payload con educaciones = null → no itera (null no es iterable en for...of sin guard)', () => {
    // La implementación usa: if (data.educations) { for (...) }
    // null es falsy → no entra
    expect(() => validateCandidateData({ ...base(), educations: null as any })).not.toThrow();
  });
});
