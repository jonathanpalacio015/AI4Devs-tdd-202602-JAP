# Casos Límite Adicionales — Análisis del Equipo de Ingeniería
**Proyecto:** LTI - Talent Tracking System  
**Autor:** test-JAP  
**Fecha:** 2026-04-26  
**Metodología:** TDD (Test-Driven Development)

---

## 1. Casos límite ya cubiertos en `boundary.test.ts`

Están marcados con ⚠️ donde la implementación actual **pasa** la regex pero el valor es **lógicamente inválido**. Estos representan bugs latentes confirmados.

| ID | Campo | Caso | Estado actual |
|----|-------|------|---------------|
| EL-F-03 | startDate | `"0000-00-00"` pasa regex | ⚠️ Bug latente |
| EL-F-05 | startDate | Mes 13 (`2000-13-01`) pasa regex | ⚠️ Bug latente |
| EL-F-06 | startDate | 30 de febrero pasa regex | ⚠️ Bug latente |
| EL-CV-06 | fileType | MIME `image/png` no es rechazado por validator | ⚠️ Gap de validación |
| EL-N-11 | firstName | Apellido compuesto `"Anne-Marie"` → error | ⚠️ Falso negativo i18n |
| EL-N-12 | firstName | Apellido irlandés `"O'Brien"` → error | ⚠️ Falso negativo i18n |

---

## 2. Casos límite adicionales identificados — aún NO implementados como tests

### 2.1 Validación de Negocio — Fechas

| ID | Descripción | Por qué puede fallar |
|----|-------------|----------------------|
| CL-F-01 | `endDate < startDate` en educación | El validador no compara fechas entre sí. Un candidato podría tener `endDate: "2010-01-01"` y `startDate: "2020-01-01"` (fecha de fin antes que inicio). |
| CL-F-02 | `startDate` en el futuro | No hay validación de que startDate sea pasado. Se puede registrar una educación que comienza en 2099. |
| CL-F-03 | `endDate` igual a `startDate` | Educación o experiencia de 0 días — ¿es válido? No está especificado. |
| CL-F-04 | Año bisiesto: `2024-02-29` (válido) vs `2023-02-29` (inválido) | La regex acepta ambos. JavaScript `new Date("2023-02-29")` retorna `Invalid Date`. |
| CL-F-05 | `endDate` en educación en curso omitido vs string vacío `""` | Si `endDate = ""`, la regex falla → `Invalid end date`. Pero el frontend puede enviar `""` en vez de omitir el campo. |

### 2.2 Validación de Nombre / Apellido — Internacionalización

| ID | Descripción | Por qué puede fallar |
|----|-------------|----------------------|
| CL-N-01 | Nombres con guión: `"Anne-Marie"`, `"Jean-Paul"` | El regex `/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/` no incluye `-`. Candidatos europeos son rechazados. |
| CL-N-02 | Nombres con apóstrofe: `"O'Brien"`, `"D'Angelo"` | El regex no incluye `'`. Apellidos irlandeses e italianos son rechazados. |
| CL-N-03 | Nombres en árabe, chino, cirílico | El regex solo acepta letras latinas + ñ/tildes. Candidatos no-latinos son bloqueados. |
| CL-N-04 | Nombre con múltiples espacios: `"Ana  García"` (doble espacio) | El regex acepta espacios múltiples — ¿se normaliza antes de guardar? |
| CL-N-05 | Nombre que empieza o termina con espacio: `" Ana"`, `"Ana "` | La regex lo acepta pero es semánticamente incorrecto. |

### 2.3 Email — Casos extremos

| ID | Descripción | Por qué puede fallar |
|----|-------------|----------------------|
| CL-E-01 | Email muy largo (> 254 chars según RFC 5321) | No hay límite de longitud en el validador actual. La DB puede truncar o rechazar. |
| CL-E-02 | Email con comillas: `"user name"@domain.com` | RFC 5321 lo permite, pero la regex lo rechaza. |
| CL-E-03 | Email con IP de servidor: `user@[192.168.1.1]` | RFC lo permite, la regex lo rechaza. |
| CL-E-04 | Email ya existente — segunda solicitud (P2002) | Cubierto en candidateService. Pero ¿qué ocurre si la DB falla tras la validación y antes del insert? |
| CL-E-05 | Email con mayúsculas: `User@DOMAIN.COM` | La regex lo acepta. Pero si no se normaliza a minúsculas antes de guardar, `user@domain.com` y `User@DOMAIN.COM` se tratarían como distintos (duplicado no detectado). |

### 2.4 Teléfono

| ID | Descripción | Por qué puede fallar |
|----|-------------|----------------------|
| CL-T-01 | Teléfono de empresa (800xxxxxx) | La regex exige que comience con 6, 7 o 9. Números 800 (gratuitos) son rechazados. |
| CL-T-02 | Extensión corporativa: `912345678 ext. 123` | Rechazado por la regex. |
| CL-T-03 | Teléfonos de otros países | Sistema solo acepta formato español (9 dígitos, prefijos 6/7/9). Candidatos extranjeros no pueden registrar su móvil. |
| CL-T-04 | Teléfono con formato `69 123 45 67` (con espacios) | Rechazado. |

### 2.5 Upload de Archivo (FileUploadService / FileUploader)

| ID | Descripción | Por qué puede fallar |
|----|-------------|----------------------|
| CL-FU-01 | Archivo PDF corrupto (cabecera inválida) | Multer no valida el contenido, solo el MIME type declarado. Un atacante puede renombrar `malware.exe` a `cv.pdf`. |
| CL-FU-02 | Archivo de exactamente 10 MB (límite exacto) | `fileSize: 1024 * 1024 * 10` = 10485760 bytes. ¿Se rechaza o acepta en el límite exacto? (Multer usa `>` o `>=`). |
| CL-FU-03 | Archivo de 10 MB + 1 byte | Debe rechazar con `MulterError: File too large`. |
| CL-FU-04 | Nombre de archivo con caracteres especiales (`../../etc/passwd.pdf`) | Path traversal. El nombre se concatena directamente: `uniqueSuffix + '-' + file.originalname`. Riesgo de seguridad. |
| CL-FU-05 | Subida de múltiples archivos simultáneos | El endpoint usa `upload.single('file')`. Un segundo archivo en el mismo request sería ignorado silenciosamente. |
| CL-FU-06 | Request sin campo `file` en FormData | Retorna 400 con `"Invalid file type"` — aunque el mensaje es incorrecto (debería ser "No file uploaded"). |
| CL-FU-07 | Disco lleno en el servidor | Error de sistema no capturado → `500` genérico sin mensaje amigable. |

### 2.6 Concurrencia y Estado

| ID | Descripción | Por qué puede fallar |
|----|-------------|----------------------|
| CL-CC-01 | Dos requests simultáneos con el mismo email | Ambos pasan la validación, pero solo uno logrará el INSERT. El segundo recibe P2002. ¿El cliente recibe mensaje claro? |
| CL-CC-02 | Pérdida de conexión DB entre validación y guardado | El candidate pasa la validación pero `prisma.candidate.create` lanza `PrismaClientInitializationError`. El mensaje al usuario debería ser descriptivo. |
| CL-CC-03 | Guardado parcial: candidato creado pero educación falla | No hay transacción explícita. Si `education.save()` falla, el candidato quedó en BD sin su educación. |

### 2.7 Frontend — Casos límite de UI

| ID | Descripción | Por qué puede fallar |
|----|-------------|----------------------|
| CL-UI-01 | Submit del formulario sin rellenar ningún campo | El error debe venir del backend, pero el frontend no valida client-side → el usuario no recibe feedback inmediato. |
| CL-UI-02 | Formulario con 50+ secciones de educación | No hay límite en `handleAddSection`. Performance puede degradarse. |
| CL-UI-03 | Pegar texto muy largo (> 1000 chars) en el campo nombre | El input no tiene `maxLength` HTML → el texto se envía y el backend lo rechaza. Mejor UX sería truncar en UI. |
| CL-UI-04 | Conexión perdida durante el submit | `fetch` lanza `TypeError: Failed to fetch`. El catch lo captura → mensaje genérico de error. |
| CL-UI-05 | Subir archivo y luego hacer submit sin esperar la respuesta del upload | `cv` permanece `null` en el estado. El candidato se guarda sin CV (si se quitó el `cv` del body). |
| CL-UI-06 | Click rápido doble en el botón Submit | Dos requests POST simultáneos. No hay protección contra doble submit (sin `disabled` durante la carga). |
| CL-UI-07 | Navegador sin JavaScript | La aplicación es 100% React/SPA → no funciona sin JS. No hay fallback. |
| CL-UI-08 | Pantalla muy pequeña (< 320px) | Los componentes de Bootstrap-React pueden romperse visualmente. |

### 2.8 Seguridad — OWASP Top 10

| ID | Descripción | Categoría OWASP |
|----|-------------|-----------------|
| CL-SEC-01 | Inyección en `firstName`: `<script>alert(1)</script>` | A03: Injection / XSS |
| CL-SEC-02 | Path traversal en `filePath` del CV: `../../etc/passwd` | A01: Broken Access Control |
| CL-SEC-03 | Subida de archivo ejecutable renombrado como PDF | A08: Software and Data Integrity |
| CL-SEC-04 | Email como inyección NoSQL/SQL: `' OR 1=1 --@evil.com` | A03: Injection |
| CL-SEC-05 | Payload con campos extra desconocidos pasados a Prisma | A08: Mass assignment si Prisma no está configurado con `select` |
| CL-SEC-06 | Headers sin Content-Security-Policy en el backend Express | A05: Security Misconfiguration |
| CL-SEC-07 | Sin rate limiting en `/candidates` y `/upload` | A04: Insecure Design (DoS) |

---

## 3. Resumen de prioridades de implementación

| Prioridad | Casos | Impacto |
|-----------|-------|---------|
| 🔴 Alta | CL-CC-03 (guardado parcial sin TX), CL-FU-04 (path traversal), CL-SEC-01/03/07 | Seguridad / Integridad de datos |
| 🟡 Media | CL-F-01 (endDate < startDate), CL-E-05 (case-insensitive email), CL-T-03 (teléfonos internacionales) | Correctitud de negocio |
| 🟢 Baja | CL-N-01/02 (guiones/apóstrofes en nombres), CL-UI-06 (doble submit), CL-UI-02 (50+ secciones) | UX / i18n |

---

## 4. Recomendaciones técnicas derivadas del análisis

1. **Añadir transacción Prisma** en `candidateService.addCandidate` para que si falla la creación de educación/experiencia/CV, se haga rollback del candidato.
2. **Validar rango de fechas**: añadir `if (endDate && endDate < startDate) throw Error('endDate must be after startDate')`.
3. **Validar MIME real del archivo** (no solo el declarado por el cliente) usando la librería `file-type`.
4. **Sanitizar el nombre del archivo** antes de guardarlo en disco para evitar path traversal.
5. **Normalizar email a lowercase** antes de guardar para evitar duplicados case-insensitive.
6. **Añadir `maxLength` en inputs HTML** del frontend para mejorar UX y reducir peticiones innecesarias al backend.
7. **Añadir rate limiting** con `express-rate-limit` en las rutas `/candidates` y `/upload`.
8. **Deshabilitar el botón Submit** mientras la petición está en curso para evitar doble submit.
