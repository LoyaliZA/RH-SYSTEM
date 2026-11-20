# RH System — Roadmap maestro del producto

> **Versión:** 1.0 (Entrega documental 1.5)  
> **Corte de verificación:** 15 de noviembre de 2026  
> **Repositorio:** https://github.com/LoyaliZA/RH-SYSTEM  
> **Base observada:** main, commit 20715933451de3f776481c8b961a3c3c5879392d  
> **Naturaleza:** plan vivo. Este documento registra decisiones, estado y horizonte; **no implementa** funcionalidades ni autoriza por sí solo a desplegarlas.

## 1. Propósito y cómo usar este documento

Esta es la **fuente única de verdad del roadmap funcional** de RH System para el equipo, Cursor Cloud y las conversaciones del proyecto ChatGPT. Permite retomar el trabajo sin reconstruir el contexto cada vez.

- La sección 4 describe lo **verificado en GitHub**. No confundir una prueba reportada por Cursor con una comprobación independiente.
- La sección 5 contiene las **entregas funcionales originales 0–6**, conservadas en su orden, más la entrega documental 1.5.
- Las secciones 6 y 7 registran el **horizonte posterior al MVP** y sus dependencias. Son líneas de evolución, no promesas de fecha ni funcionalidades ya aprobadas para implementación.
- La sección 9 contiene las condiciones para iniciar módulos que manejen datos reales.
- Cada nueva entrega deberá actualizar estados, evidencias y decisiones aquí; no cambiar nombres, prioridades o alcance silenciosamente.

**Convención de estado:** COMPLETADA (integrada y comprobada en main); PARCIAL (parte implementada); REPORTADA (informada por un agente, sin verificar su integración); PENDIENTE (no implementada); PROPUESTA (visión futura sujeta a decisión).

**Convención de nombres:** "Entrega F1/F2/..." identifica **funcionalidad**. "Visual A, B-E, B-2, C-1, C-2, C-3" identifica **trabajo de diseño/experiencia** y no altera la secuencia de entregas funcionales. "Entrega 1.5" identifica documentación, sin sustituir F1.

## 2. Visión de producto y decisiones confirmadas

RH System es un sistema de gestión empresarial y Recursos Humanos, inicialmente para **Windows como aplicación instalable**. El MVP administra **varias empresas independientes en una misma instalación** y está pensado para personal autorizado de RH y responsables, no para autoservicio general del empleado.

**Base tecnológica elegida:**

| Capa                   | Decisión                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------- |
| App Windows            | Tauri 2                                                                                |
| Interfaz               | React, TypeScript, Vite, Tailwind CSS y componentes reutilizables                      |
| Núcleo y casos de uso  | Rust, comandos Tauri y repositorios                                                    |
| Persistencia actual    | SQLite local mediante rusqlite; sin servidor de base de datos instalado                |
| Arquitectura           | Local-First, preparada para evolución híbrida                                          |
| Modelo futuro          | Servidor como fuente oficial; API central y PostgreSQL                                 |
| Trabajo offline futuro | Sincronización con idempotencia, versiones y resolución explícita de conflictos        |
| Archivos               | Documentos locales administrados por la aplicación; repositorio central al evolucionar |
| Respaldo               | Copias locales recuperables; nube optativa (Drive, OneDrive, Dropbox, etc.)            |
| Distribución           | Instalador Windows; pruebas/compilación automatizadas en GitHub Actions                |
| Desarrollo             | Cursor Cloud, PR por alcance y revisión antes de fusionar                              |

**Decisiones funcionales del MVP:**

- Multiempresa con datos, políticas y accesos separados.
- Expedientes digitales, puestos, relaciones laborales y movimientos con historial.
- Asistencia por captura manual e importación CSV/XLSX de checadores, sin integración directa obligatoria con hardware en el MVP.
- Vacaciones, permisos y flujo de autorizaciones.
- Prenómina: incidencias, percepciones, deducciones, revisión, cierre y exportación; **no** timbrado CFDI, cálculo fiscal completo ni dispersión bancaria en el MVP.
- Dashboard y reportes **basados en datos reales**, sin métricas inventadas.
- Acceso únicamente a personas autorizadas; identidad de usuario distinta de identidad de empleado.

**Principios obligatorios:** separación por empresa, verificación de permisos en Rust/servidor y no solo en React, historiales y vigencias, auditoría, integridad de operaciones, protección de datos de RH, respaldo/restauración y pruebas de regresión. Compartir archivos SQLite por carpetas de red o proveedores de nube **no** es el mecanismo multiusuario.

## 3. Identidad visual aprobada: requisito transversal

Los desarrollos funcionales deben respetar el Design System oficial. Fuentes:

- [Identidad y Design System v1.0](docs/design/RH-SYSTEM-DESIGN-SYSTEM-v1.0.md)
- [Especificaciones UI v1.0](docs/design/RH-UI-SPECIFICATIONS.md)
- [Referencias visuales](docs/design/references/)
- [Índice de diseño](docs/design-system.md)

Síntesis vinculante: **Plus Jakarta Sans**, amatista suave **#7956B5**, menta suave **#65BFA8**, fondo claro **#F6F5F8**, ciruela profunda **#1D1725**, superficies oscuras **#30283A**; Bento editorial, sidebar contraíble, encabezado integrado, tarjetas de empresa protagonistas, tablas legibles, formularios híbridos, accesibilidad y movimiento reducido.

Los prototipos visuales no habilitan funciones que aún no existan: **no autenticación ficticia, indicadores falsos ni módulos simulados como operativos**. Para estados y reglas visuales precisas prevalecen los documentos de diseño, no este resumen.

## 4. Estado verificado y trabajo visual en curso

### 4.1. Comprobado en GitHub (corte indicado)

| Evidencia                                             | Estado     | Alcance                                                                                                                                                 |
| ----------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [PR #1](https://github.com/LoyaliZA/RH-SYSTEM/pull/1) | COMPLETADA | Bootstrap Tauri, React, Rust, SQLite y CRUD inicial de empresas                                                                                         |
| [PR #2](https://github.com/LoyaliZA/RH-SYSTEM/pull/2) | COMPLETADA | Primer shell, flujo de empresas, reglas y pruebas visuales                                                                                              |
| [PR #3](https://github.com/LoyaliZA/RH-SYSTEM/pull/3) | COMPLETADA | Tokens y tipografía del Design System v1.0                                                                                                              |
| [PR #4](https://github.com/LoyaliZA/RH-SYSTEM/pull/4) | COMPLETADA | Composición Bento, shell y tarjetas de empresas; CI del PR aprobado                                                                                     |
| main                                                  | COMPROBADO | Commit 20715933451de3f776481c8b961a3c3c5879392d; todavía no hay rutas de login ni selector de empresas independientes en el punto de entrada verificado |

El repositorio incluye componentes compartidos, documentación de diseño, pruebas de React/Rust y un workflow de instalador NSIS. **Compilar un instalador no significa haber verificado su instalación gráfica y conservación de datos en Windows.**

### 4.2. Reportado desde la otra conversación: no confundir con main

| Etiqueta visual | Estado                                       | Observación                                                                                                                    |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| B-2             | REPORTADA / parcialmente reflejada por PR #4 | Refinamiento de identidad, proporciones y componentes                                                                          |
| C-1             | REPORTADA                                    | Auditoría de login: sin autenticación, usuarios persistidos, sesiones, roles o permisos efectivos                              |
| C-2             | REPORTADA, no confirmada en main             | Bienvenida, selección independiente de empresas, navegación de acceso, tema y responsive; Cursor reportó pruebas 22/22 y 18/18 |
| C-3             | PLANIFICADA/REPORTADA, no confirmada en main | Refinamiento de acceso, campos visuales deshabilitados, animaciones/capturas; verificar integración antes de declararla lista  |

El trabajo visual C-2/C-3 puede continuar por su carril, pero **no cuenta como autenticación implementada**. Antes de trabajar sobre una rama o PR posterior, consultar GitHub de nuevo.

### 4.3. Estado funcional real

- **Existe:** instalación de proyecto, capas Rust/React, persistencia SQLite, migración inicial, alta/listado/edición/activación de empresas y shell.
- **Fusionado en main:** F2.1, núcleo de expedientes sintéticos, mediante [PR #6](https://github.com/LoyaliZA/RH-SYSTEM/pull/6).
- **En esta rama, no fusionado:** F2.2, catálogo de puestos y relación laboral inicial. No cierra F2 ni inicia F2.3. Ver sección F2.2.
- **No confirmado como implementado:** sucursales, departamentos, cuentas y sesiones reales, roles/permisos, auditoría de negocio, respaldo/restauración, contratos, movimientos, checadas, vacaciones, prenómina y reportes operativos.
- La empresa activa que hoy selecciona el usuario es una **preferencia**, no un límite de autorización. No manejar datos reales de empleados con esta protección incompleta. Las operaciones de personal, puestos y relaciones siguen bloqueadas en compilaciones de producción.

## 5. Roadmap funcional original del MVP (mantener el orden)

Las seis entregas originales se conservan. La entrega 0 es el bootstrap previo; la 1.5 es una entrega documental intermedia y **no cierra** los pendientes de la entrega 1.

| ID       | Entrega                        | Estado al corte              | Resultado verificable                                                                                                                      |
| -------- | ------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **F0**   | Bootstrap técnico              | COMPLETADA                   | Tauri, React, Rust, SQLite, CRUD de prueba e instalador compilable                                                                         |
| **F1**   | Plataforma y seguridad         | PARCIAL                      | Organización multiempresa, sucursales, departamentos, usuarios, autenticación, roles/permisos, auditoría y respaldo local básico           |
| **F1.5** | Roadmap maestro y trazabilidad | DOCUMENTACIÓN EN PREPARACIÓN | Plan completo versionado, estado verificable, nomenclatura y dependencias publicados en el repositorio                                     |
| **F2**   | Gestión del personal           | PARCIAL                      | F2.1 fusionada (PR #6). F2.2 en esta rama, sin fusionar: puestos y relación inicial. Faltan historial de puestos, adscripciones y salarios |
| **F3**   | Ciclo laboral y documentos     | PENDIENTE                    | Altas, bajas, reingresos, promociones, traslados, contratos y versiones de archivos                                                        |
| **F4**   | Operación diaria de RH         | PENDIENTE                    | Calendarios, turnos, asistencia manual/importada, incidencias, vacaciones, permisos y autorizaciones                                       |
| **F5**   | Prenómina y analítica          | PENDIENTE                    | Cortes y conceptos, consolidación, revisiones, exportación y reportes con datos auténticos                                                 |
| **F6**   | Estabilización del MVP         | PENDIENTE                    | Seguridad integral, copias cifradas, recuperación probada, QA, actualizaciones y piloto controlado                                         |

### F1 — Plataforma y seguridad (aún no cerrada)

**Hecho:** base de aplicación, repositorio local, migraciones, empresa (alta/consulta/edición/activación), navegación/tema y primera infraestructura de CI.

**Pendiente:** sucursales y departamentos; modelo de usuarios y autenticación real; sesiones; rol/permisos por empresa y alcance organizacional; auditoría de operaciones; respaldo local **consistente y restaurable**; endurecimiento de seguridad (incluida la CSP de producción) y pruebas de aislamiento entre empresas.

**Criterio de cierre:** poder configurar varias empresas y su estructura, habilitar accesos autorizados y demostrar que una operación no puede leer/modificar datos fuera de su empresa. Probar un respaldo recuperable y un instalador de Windows en entorno real. **El trabajo de F2 con datos personales reales queda bloqueado hasta tener los controles mínimos de F1.**

### F1.5 — Entrega documental (este cambio)

Alcance limitado a: roadmap versionado, separación de hechos y planes, estado de PR, reglas para otras conversaciones y orientación para Cursor. **Sin nuevos modelos SQL, credenciales, cambios de negocio o nuevos módulos.**

Criterio de cierre: PR documental revisado y fusionado; enlaces accesibles desde README y AGENTS.md; futuras tareas hacen referencia a este roadmap.

### F2 — Gestión del personal

Personas y expediente por empresa (no duplicar datos entre empresas por CURP/RFC); número de empleado, contactos, identificadores, estados, búsqueda; catálogo de puestos; relación laboral separada de persona/expediente; historial de asignaciones, salarios, vigencias y reingresos. Permisos por campo para datos sensibles. La primera fase debe trabajar con empresas ficticias y datos sintéticos.

**Dependencia:** F1 para autorización, aislamiento y respaldo antes del uso con datos reales. El análisis funcional, diseño lógico y pruebas ficticias se pueden preparar antes, sin saltarse los controles.

#### F2.1 — Núcleo de empleados y expedientes

**Estado:** COMPLETADA en main mediante [PR #6](https://github.com/LoyaliZA/RH-SYSTEM/pull/6). No cierra F2.

**Hecho:** persona y expediente con `company_id`; identificador interno estable; número de empleado único por empresa; nombre, apellidos y estado administrativo; alta, listado, búsqueda, consulta y edición persistidos; filtro y validación de empresa en Rust; migración incremental `002` sobre bases existentes sin perder empresas ni sembrar expedientes; bloqueo de operaciones de personal en compilaciones de producción; interfaz de listado y expediente con el Design System existente.

**Criterio de F2.1:** crear, consultar, buscar y editar expedientes ficticios persistentes, aislados por empresa. No habilita datos personales reales.

#### F2.2 — Puestos y relación laboral inicial (esta rama)

**Estado en esta rama:** PARCIAL / PROPUESTA de cierre de F2.2, **no fusionada**, **no cierra F2**. F2.3 y el resto de la Entrega 2 quedan fuera.

**Hecho en el código de esta rama:** catálogo de puestos por empresa (alta, consulta, edición, activar y desactivar, sin borrado); código único por empresa; relación laboral inicial separada del expediente, con la asignación de puesto en otra tabla; una sola relación abierta por expediente; fechas de calendario sin zona horaria; aislamiento en Rust y claves foráneas compuestas; migración incremental `003` que no siembra datos ni altera `001` ni `002`; el bloqueo de producción de F2.1 cubre también puestos y relaciones.

**Pendiente para F2:** historial de cambios de puesto (F2.3), adscripciones, salarios históricos, contactos, identificadores fiscales personales, permisos por campo y datos reales. Las bajas, los reingresos y los movimientos formales siguen en F3.

**Criterio de F2.2:** crear y consultar puestos y una relación laboral inicial ficticia, persistente y aislada por empresa, sin declarar terminada la Entrega 2.

### F3 — Ciclo laboral y documentos

Movimiento con solicitud, aprobación, fecha efectiva, aplicación y rectificación; contratos asociados a la relación laboral; documentos administrados con hash, versión, vigencia y acceso restringido. Una baja no borra el expediente ni su historia. Reingreso crea nueva relación laboral.

**Dependencia:** F2 y permisos/auditoría de F1.

### F4 — Operación diaria

Turnos, calendarios, eventos de checada originales, lotes de importación CSV/XLSX con vista previa y deduplicación, incidencias revisables, ausencias, vacaciones, permisos y movimientos de saldo. Separar evento original de interpretación/corrección; jornadas nocturnas y días no laborables.

**Dependencia:** relaciones laborales y calendarios de F1/F2; aprobación y auditoría.

### F5 — Prenómina y analítica

Periodos, percepciones, deducciones, incidencias consolidadas, importes decimales, fotografía inmutable de cortes cerrados, ajustes autorizados, exportación versionada e indicadores con definición y fuente real. **Sin** cálculo fiscal completo ni CFDI en esta entrega.

**Dependencia:** salarios, asistencia, ausencias y permisos; políticas validadas de México cuando correspondan.

### F6 — Estabilización del MVP

Pruebas integrales y de regresión; seguridad y privacidad; restauración verificada de base más archivos; actualización con migraciones; rendimiento; instalador Windows probado, manual operativo y piloto controlado con alcance autorizado. El respaldo básico y controles de seguridad **empiezan en F1**, no se aplazan a F6.

## 6. Roadmap completo posterior al MVP (horizontes, no compromisos)

Se registran todas las líneas de evolución discutidas, pero no todas están aprobadas para programación. La numeración **E7–E15 es orientativa** y podrá reordenarse mediante decisión documentada una vez concluido el MVP; no altera F0–F6.

| Horizonte | Etapa futura                             | Alcance tentativo                                                                                                                         | Estado                   |
| --------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **E7**    | Servidor multiusuario                    | API central autenticada, PostgreSQL, autorización del lado servidor, concurrencia, migración de datos y repositorio documental central    | EVOLUCIÓN PREVISTA       |
| **E8**    | Sincronización híbrida offline           | Caché local, cola de operaciones, UUID, versiones, idempotencia, resolución de conflictos por dominio, reconexión                         | EVOLUCIÓN PREVISTA       |
| **E9**    | Respaldo en nube y recuperación avanzada | Adaptadores Drive/OneDrive/Dropbox; OAuth o carpetas sincronizadas; cifrado, retención, versiones, integridad, recuperación entre equipos | EVOLUCIÓN PREVISTA       |
| **E10**   | Integraciones operativas                 | Adaptadores directos a relojes checadores y otros sistemas externos, notificaciones y automatización de importaciones                     | OPCIONAL / POR DEFINIR   |
| **E11**   | RH avanzado y talento                    | Reclutamiento, onboarding, capacitación, objetivos, evaluaciones, desempeño y desarrollo                                                  | OPCIONAL / POR DEFINIR   |
| **E12**   | Autoservicio                             | Acceso de empleados y responsables, solicitudes, consultas, autorizaciones y experiencia por rol                                          | OPCIONAL / FUERA DEL MVP |
| **E13**   | Nómina especializada México              | Reglas fiscales/laborales versionadas, cálculo completo, CFDI, timbrado, integración fiscal y dispersión (si se aprueba)                  | OPCIONAL / ALTO CONTROL  |
| **E14**   | Expansión empresarial / ERP modular      | Activos y resguardos, inventarios, compras, gastos/presupuestos, mantenimiento, proyectos y eventualmente finanzas/operaciones            | VISIÓN FUTURA            |
| **E15**   | Plataformas y ecosistema                 | Distribución macOS/Linux, eventual versión web, API pública/SDK e integraciones adicionales según necesidad                               | VISIÓN FUTURA            |

**No implica cronología rígida:** E9 (respaldos nube) puede habilitarse antes de E7 si es respaldo de copias cerradas y cifradas; E10 puede adelantarse si existe necesidad de un checador; E12 depende de autorización y, en general, de un servidor central. E13 requiere validación jurídica/fiscal y pruebas especializadas. Nunca confundir sincronización de respaldos con edición concurrente multiusuario.

### Dependencias de alto nivel

- **F1 (aislamiento y seguridad)** → **F2** → **F3 y F4** → **F5** → **F6**.
- **F1.5** documenta la secuencia y puede cerrarse sin declarar terminada F1.
- **E7** necesita dominio y datos consolidados del MVP; **E8** requiere una autoridad central y política de conflictos.
- **E9** necesita copia consistente, cifrado y restauración básica; **E10** requiere adaptadores y auditoría.
- **E11–E14** consumen el núcleo empresarial y de RH; cada módulo se añade solo cuando tenga su alcance funcional aprobado.
- **E15** no debe forzar una arquitectura web durante el MVP de Windows.

## 7. Alcance funcional del producto: matriz completa

Los diez módulos incluidos en el MVP siguen siendo:

1. Empresas, sucursales y departamentos.
2. Expedientes digitales de empleados.
3. Puestos y relaciones laborales.
4. Usuarios, roles, permisos y auditoría.
5. Documentos y contratos.
6. Altas, bajas, reingresos y movimientos.
7. Asistencia y turnos; captura manual e importación.
8. Vacaciones y permisos.
9. Dashboard y reportes.
10. Prenómina, conceptos, incidencias y exportación.

**No incluidos en el MVP y no considerados implementados:** autenticación ficticia como producto, autogestión de empleados, conexión directa obligatoria a checadores, sincronización de escrituras entre equipos, nómina fiscal/timbrado, módulos de inventario/finanzas y plataformas no Windows.

### Entidades de referencia para F2–F5 (modelo lógico, no migraciones)

Empresa → sucursal/centro de trabajo/departamento/puesto; persona (delimitada por empresa) → expediente → relación laboral → adscripciones, salarios y movimientos históricos. La relación laboral vincula asistencia, contratos, ausencias y prenómina. Usuario/rol/permisos/auditoría son entidades separadas del expediente; los documentos se almacenan en repositorio con metadatos y versiones.

**Nota de diseño:** evitar un único registro "Empleado" que mezcle identidad personal, acceso de usuario y toda la historia laboral. Usar fechas efectivas, vínculos por empresa e identificadores globales. Los nombres de tablas finales se decidirán en el diseño técnico de cada entrega.

## 8. Calidad, seguridad y criterios permanentes

Para toda entrega y PR:

- Respetar la identidad visual y componentes compartidos; claro/oscuro, teclado, estados y movimiento reducido.
- Trabajar en rama sobre **main actualizado**; PR revisable; no hacer merge automático.
- No usar datos personales reales en pruebas, capturas o CI.
- Mantener el acceso a SQLite detrás de Rust y repositorios; no escribir SQL desde React.
- Preservar contratos y pruebas existentes, incluidas etiquetas accesibles del CRUD ("Nueva empresa", "Crear empresa", "Editar", "Activar", "Guardar cambios").
- Verificar pruebas unitarias, de integración, visuales y compilación aplicables; registrar qué se ejecutó **realmente**.
- No tratar el selector de empresa visual como un permiso, ni los campos de login deshabilitados como autenticación.
- Tener rutas de respaldo/restauración seguras y migraciones que no destruyan datos.
- En operaciones sensibles, evitar sobrescrituras silenciosas, dobles aprobaciones y cortes alterados retroactivamente.
- No introducir estadísticas falsas para llenar el Bento ni funciones sin respaldo operativo.

## 9. Puertas de avance y criterio para F2

**Situación al corte de esta rama:** F1 sigue PARCIAL. F1.5 está documentada. F2.1 está fusionada en main (PR #6) y bloquea el personal en producción. F2.2 añade puestos y la relación laboral inicial en esta rama, con el mismo bloqueo. Eso **no** autoriza cargar expedientes reales ni da por cerrada F2.

**Antes de usar información real de RH:** autenticación y autorización efectiva, aislamiento de empresa en operaciones de Rust, auditoría mínima, cifrado/protección aplicable, respaldo verificable y revisión de privacidad. El diseño de dominio, prototipos y pruebas con datos ficticios de F2 pueden prepararse mientras se concluye F1, si se deja explícita esa condición.

**Antes del piloto MVP:** F1–F6 con criterios de aceptación comprobados, validación de instalador Windows, restauración y permisos. No basta con una captura bonita o un workflow verde.

**Antes del multiusuario:** reglas de autoridad del servidor, acceso por empresa, migración, pruebas de concurrencia y recuperación; después se diseña la sincronización offline, no al revés.

## 10. Proceso de mantenimiento y uso en otros chats

1. Al abrir una conversación del proyecto, pedir revisar **ROADMAP.md** en la rama main de https://github.com/LoyaliZA/RH-SYSTEM y los PR más recientes.
2. Consultar también [Design System](docs/design/RH-SYSTEM-DESIGN-SYSTEM-v1.0.md), [UI](docs/design/RH-UI-SPECIFICATIONS.md) y [Arquitectura](docs/architecture.md) si afectan la tarea.
3. Distinguir **hechos del repositorio**, **reportes de Cursor** y **decisiones/plans** del roadmap. Actualizar estados solo con evidencia.
4. Cada PR funcional que altere estado o alcance deberá modificar la fila correspondiente de este archivo, con ID y enlace de PR. No duplicar el roadmap en varios documentos.
5. Cambios de prioridad/alcance posteriores al MVP deben registrar motivo, dependencias y aprobación; no asumir que una idea futura es un requisito cerrado.
6. Si el archivo de otra rama difiere del de main, declarar cuál se está utilizando antes de planificar.

### Contexto breve para pegar en un chat nuevo

> Proyecto: RH System (LoyaliZA/RH-SYSTEM), app Windows con Tauri 2 + React/TypeScript + Rust + SQLite (rusqlite); arquitectura local-first multiempresa y evolución híbrida con servidor oficial futuro. La identidad visual oficial está en docs/design/. El roadmap funcional está en ROADMAP.md de main: F0 bootstrap completo; F1 plataforma/seguridad parcial; F1.5 documental; F2 personal; F3 ciclo laboral/documentos; F4 asistencia/ausencias; F5 prenómina/reportes; F6 estabilización. Las etapas E7–E15 documentan evoluciones post-MVP no comprometidas. Las fases visuales A/B-E/B-2/C-1/C-2/C-3 son independientes del roadmap funcional; C-2/C-3 se deben verificar antes de darlas por fusionadas. Antes de programar, comprobar HEAD y PR actuales; nunca dar por implementados módulos solo porque exista su UI.

## 11. Historial de decisiones y actualizaciones

| Fecha      | Revisión   | Motivo                                                                                          |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------- |
| 2026-11-15 | 1.0 / F1.5 | Consolidación documental del MVP original y horizonte post-MVP; estados basados en main 2071593 |
| 2026-11-16 | F2.1       | Núcleo de persona y expediente sintético; fusionado en main mediante PR #6                      |
| 2026-11-20 | F2.2       | Puestos y relación laboral inicial en esta rama; F2 permanece incompleta; sin merge             |

---

**Alcance de F2.2:** catálogo de puestos y relación laboral inicial, con datos sintéticos, para revisión. No fusionar desde este documento. No cierra F2 ni habilita F2.3 ni datos personales reales.
