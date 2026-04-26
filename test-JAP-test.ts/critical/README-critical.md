# Pruebas Criticas de Produccion (Prompt Maestro aplicado)

## Alcance
Este paquete contiene exclusivamente los casos limite **criticos** que pueden fallar en produccion:

1. CL-CC-03: guardado parcial sin transaccion.
2. CL-FU-04: path traversal en nombre de archivo durante upload.
3. CL-SEC-03: subida de archivo con MIME spoofing.
4. CL-SEC-07: ausencia de rate limiting en endpoints sensibles.

Se aplico el mismo procedimiento del prompt maestro para pruebas unitarias:
- Analisis del riesgo critico.
- Definicion de test RED (comportamiento objetivo).
- Diseño de mock para aislar infraestructura.
- Registro de casos pendientes (todo) para fase GREEN/Refactor.

---

## Estructura creada

- critical/mocks/prisma.mock.ts
- critical/unit/backend/critical-transaction.atomicity.test.ts
- critical/unit/backend/critical-upload.security.test.ts
- critical/unit/backend/critical-rate-limit.test.ts

---

## Proceso de Mock de Base de Datos (para futuras pruebas)

Para no alterar la base real, usar siempre un mock de Prisma.

### Paso 1: usar factory de mock
Archivo: `critical/mocks/prisma.mock.ts`

```ts
import { buildPrismaMock, resetPrismaMock } from '../../critical/mocks/prisma.mock';

const prismaMock = buildPrismaMock();

beforeEach(() => {
  resetPrismaMock(prismaMock);
});
```

### Paso 2: inyectar mock en el modulo bajo prueba
Si el modulo usa `new PrismaClient()` internamente, mockear `@prisma/client`:

```ts
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  Prisma: {
    PrismaClientInitializationError: class PrismaClientInitializationError extends Error {},
  },
}));
```

### Paso 3: definir escenarios de falla criticos
Ejemplos:
- `prismaMock.candidate.create.mockResolvedValue(...)`
- `prismaMock.education.create.mockRejectedValue(new Error('...'))`
- `prismaMock.$transaction.mockImplementation(...)`

### Paso 4: assert de seguridad/consistencia
Verificar que:
1. Ante error en entidad hija, no quede persistencia parcial.
2. Se use frontera transaccional (`$transaction`) cuando aplique.
3. Los mensajes de error no filtren detalles sensibles.

---

## Estado esperado (TDD)

Estos tests fueron preparados con enfoque TDD para riesgos criticos:
- RED: algunos fallan hoy porque exigen controles que aun no existen.
- GREEN: implementar en codigo productivo transaccion, sanitizacion y rate limit.
- REFACTOR: consolidar helpers y reducir duplicacion.

---

## Recomendacion operativa

Ejecutar solo esta bateria critica durante hardening:

```bash
npx jest --testPathPatterns="test-JAP-test.ts/critical"
```
