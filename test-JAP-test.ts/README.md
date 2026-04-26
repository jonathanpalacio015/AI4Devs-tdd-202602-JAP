# test-JAP-test.ts — Suite de Pruebas TDD
**Proyecto:** LTI - Talent Tracking System  
**Metodología:** Test-Driven Development (Red → Green → Refactor)  
**Autor:** test-JAP | Fecha: 2026-04-26

---

## Estructura de carpetas

```
test-JAP-test.ts/
│
├── backend/
│   └── unit/
│       ├── validator.test.ts          ← Tests del validador de dominio
│       ├── candidateService.test.ts   ← Tests del servicio de candidatos
│       ├── candidateController.test.ts← Tests del controlador HTTP
│       ├── fileUploadService.test.ts  ← Tests del servicio de subida de archivos
│       └── domainModels.test.ts       ← Tests de los modelos (Candidate, Education, WorkExperience, Resume)
│
├── frontend/
│   └── unit/
│       ├── AddCandidateForm.test.jsx  ← Tests del formulario principal
│       ├── FileUploader.test.jsx      ← Tests del componente de subida de archivo
│       └── candidateService.test.ts  ← Tests de los servicios HTTP del frontend
│
├── shared/
│   └── sharedHelpers.test.ts         ← Factories y custom matchers reutilizados por todos los tests
│
├── integration/
│   └── candidateFlow.test.ts         ← Tests de integración (Controller → Service → Validator → Model → MockDB)
│
├── edge-cases/
│   ├── boundary.test.ts              ← Tests de casos límite implementados
│   └── README-edge-cases.md          ← Análisis de casos límite adicionales y recomendaciones
│
└── critical/
  ├── README-critical.md            ← Proceso aplicado y mock de DB para pruebas futuras
  ├── mocks/
  │   └── prisma.mock.ts            ← Factory reutilizable de Prisma mock
  └── unit/backend/
    ├── critical-transaction.atomicity.test.ts  ← Atomicidad/rollback (CL-CC-03)
    ├── critical-upload.security.test.ts         ← Path traversal y MIME spoofing
    └── critical-rate-limit.test.ts              ← Rate limiting en endpoints sensibles
```

---

## Resumen de cobertura

| Capa | Archivo | Tests | Tipo |
|------|---------|-------|------|
| Backend | `validator.test.ts` | 34 | Unitario |
| Backend | `candidateService.test.ts` | 11 | Unitario |
| Backend | `candidateController.test.ts` | 4 | Unitario |
| Backend | `fileUploadService.test.ts` | 4 | Unitario |
| Backend | `domainModels.test.ts` | 13 | Unitario |
| Frontend | `AddCandidateForm.test.jsx` | 16 | Unitario |
| Frontend | `FileUploader.test.jsx` | 12 | Unitario |
| Frontend | `candidateService.test.ts` | 6 | Unitario |
| Shared | `sharedHelpers.test.ts` | 13 | Reutilizable/Contrato |
| Integración | `candidateFlow.test.ts` | 10 | Integración |
| Límite | `boundary.test.ts` | 40+ | Edge Cases |
| **TOTAL** | | **~163** | |

---

## Nomenclatura de IDs de test

```
TDD-{CAPA}-{MODULO}-{NÚMERO}

Capas:  B = Backend | F = Frontend | SH = Shared | INT = Integration | EL = Edge Límite
Módulos: V=Validator | CS=CandidateService | CC=CandidateController
         FU=FileUpload | MOD=Models | ACF=AddCandidateForm
         SVC=candidateService(frontend)
```

---

## Cómo ejecutar los tests

### Prerrequisitos
```bash
# Backend (desde /backend)
npm install --save-dev jest ts-jest @types/jest

# Frontend (desde /frontend)
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### Ejecutar todos los tests
```bash
# Desde la raíz del proyecto
npx jest --testPathPatterns="test-JAP-test.ts" --config jest.config.js
```

### Ejecutar solo backend
```bash
npx jest --testPathPatterns="test-JAP-test.ts/backend"
```

### Ejecutar solo frontend
```bash
npx jest --testPathPatterns="test-JAP-test.ts/frontend" --env jsdom
```

### Ejecutar solo casos límite
```bash
npx jest --testPathPatterns="test-JAP-test.ts/edge-cases"
```

### Ejecutar solo riesgos críticos
```bash
npx jest --testPathPatterns="test-JAP-test.ts/critical"
```

### Con cobertura
```bash
npx jest --testPathPatterns="test-JAP-test.ts" --coverage
```

---

## Convención TDD aplicada

Cada test sigue el patrón **AAA (Arrange → Act → Assert)**:

```typescript
it('TDD-B-V-01 | acepta nombre válido con letras y espacios', () => {
  // ARRANGE — preparar datos
  const data = validCandidate();
  
  // ACT + ASSERT — ejecutar y verificar
  expect(() => validateCandidateData(data)).not.toThrow();
});
```

Los tests **RED** son los marcados con ⚠️ en `boundary.test.ts` y en `README-edge-cases.md` — representan comportamientos incorrectos confirmados que deben corregirse en el código de producción.
