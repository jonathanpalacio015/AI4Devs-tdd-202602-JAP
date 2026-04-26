# Prompt JAP - Plantilla de Prompts TDD

## Objetivo general
Definir prompts reutilizables para analizar un proyecto fullstack (frontend + backend) y generar pruebas siguiendo TDD (Red -> Green -> Refactor), separando pruebas unitarias, reutilizadas, integradas y de casos limite.

---

## Prompt 1 - Analisis inicial de README y arquitectura

Actua como un equipo senior de arquitectura de software, QA y desarrollo fullstack.
Analiza el README.md del proyecto y detecta:
1. Modulos del frontend y backend.
2. Flujos funcionales principales.
3. Reglas de negocio explicitas e implicitas.
4. Dependencias criticas para testing.
5. Riesgos tecnicos y de calidad.

Entrega el resultado en formato:
- Contexto funcional
- Componentes por capa
- Riesgos
- Hipotesis de prueba

---

## Prompt 2 - Plan de pruebas unitarias Backend

Con base en el analisis previo, disena una bateria de pruebas unitarias para backend en TypeScript/Jest.
Incluye:
1. Validadores de entrada.
2. Servicios de aplicacion.
3. Controladores HTTP.
4. Modelos de dominio.
5. Manejo de errores (validacion, duplicados, DB, errores desconocidos).

Requisitos:
- Enfoque TDD con casos Red primero.
- Casos felices + negativos + frontera.
- Nomenclatura de tests consistente.
- Mocks para dependencias externas (DB, filesystem, red).

---

## Prompt 3 - Plan de pruebas unitarias Frontend

Actua como especialista en testing frontend con React Testing Library y Jest.
Disena pruebas unitarias para componentes y servicios frontend:
1. Render inicial.
2. Estados controlados de formularios.
3. Eventos de usuario (click, type, upload).
4. Llamadas HTTP (fetch/axios) con mocks.
5. Mensajes de exito/error.
6. Estados de loading.

Requisitos:
- Cobertura de UX y comportamiento.
- Validar payload enviado al backend.
- Incluir escenarios de error HTTP 400/500 y red.

---

## Prompt 4 - Pruebas reutilizadas por gestion de codigo

Define una estrategia DRY para pruebas compartidas entre frontend y backend.
Genera:
1. Factories reutilizables de datos.
2. Helpers de asercion compartidos.
3. Contratos de payload entre UI y API.

Entrega:
- Archivo de tests compartidos.
- Reglas de reutilizacion.
- Criterios para evitar duplicacion de casos.

---

## Prompt 5 - Pruebas de integracion

Disena pruebas de integracion para el flujo principal de candidatos:
HTTP Request -> Controller -> Service -> Validator -> Model -> Persistencia.

Incluir:
1. Flujo exitoso completo.
2. Flujo con datos invalidos (debe cortar antes de persistir).
3. Error de unicidad (email duplicado).
4. Error de conexion o capa de datos.
5. Persistencia de entidades relacionadas (educacion, experiencia, CV).

Requisitos:
- Aislar DB real con mocks o entorno de test.
- Verificar codigos HTTP y shape de respuesta.

---

## Prompt 6 - Casos limite y analisis de fallos potenciales

Actua como equipo de ingenieria de calidad orientado a robustez.
Define pruebas de casos limite para:
1. Longitudes minimas y maximas.
2. Formatos de fecha invalidos pero regex-valid.
3. Caracteres internacionales y especiales.
4. Payloads vacios/null/undefined.
5. Tipos MIME y tamano de archivos.
6. Concurrencia y doble envio.

Salida esperada:
- Lista de casos implementados.
- Lista de casos adicionales no implementados aun.
- Priorizacion: Alta, Media, Baja.
- Recomendaciones tecnicas para mitigacion.

---

## Prompt 7 - Estructura de carpetas de testing

Genera una estructura de carpetas para separar claramente:
- tests unitarios frontend
- tests unitarios backend
- tests reutilizados/shared
- tests de integracion
- tests de edge cases

Ademas, crear un README de testing con:
1. Mapa de archivos.
2. Convencion de nombres.
3. Comandos de ejecucion.
4. Cobertura esperada.

---

## Prompt 8 - Auditoria final de calidad

Revisa toda la suite de pruebas y responde:
1. Que cobertura funcional se alcanzo.
2. Que zonas siguen con riesgo.
3. Que defectos latentes detectados no estan corregidos.
4. Cuales son los siguientes 5 pasos recomendados.

Formato de salida:
- Hallazgos criticos
- Hallazgos medios
- Hallazgos bajos
- Plan de accion priorizado

---

## Prompt maestro (todo en uno)

Actua como un equipo experto en arquitectura, desarrollo backend/frontend, QA y testing TDD.
Analiza el README.md y el arbol del proyecto para disenar e implementar una estrategia completa de pruebas:
1. Unitarias backend.
2. Unitarias frontend.
3. Pruebas reutilizadas/shared.
4. Pruebas de integracion.
5. Pruebas de casos limite.
6. Documento de casos limite adicionales que puedan fallar.

Obligatorio:
- Separar por carpetas cada tipo de test.
- Usar nomenclatura consistente de casos.
- Incluir Red/Green/Refactor en el planteamiento.
- Incluir mocks de dependencias externas.
- Priorizar riesgos reales de negocio, seguridad e integridad de datos.
- Entregar resumen final con cobertura y riesgos residuales.
