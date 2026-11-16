# Arquitectura

RH System es una aplicación de escritorio. La distribución prevista es un instalador de Windows. El desarrollo y las pruebas de esta fase corren en Ubuntu.

## Decisiones que ya están cerradas

- Interfaz: React, TypeScript y Vite, con Tailwind CSS y componentes al estilo shadcn/ui.
- Núcleo nativo: Rust, mediante Tauri 2.
- Persistencia local: SQLite, detrás de un repositorio. React no abre la base.
- Fuera de esta fase: API central, PostgreSQL y sincronización offline. El diseño deja el lugar para esos componentes y no los implementa.

## Módulos

Están disponibles el inicio, empresas y expedientes digitales (F2.1, datos sintéticos). Organización, puestos, usuarios y auditoría, documentos, movimientos laborales, asistencia, vacaciones y prenómina aparecen en la navegación marcados como no implementados.

Empresas permite crear, leer y actualizar. No hay baja. La primera empresa creada queda activa. Las siguientes no la reemplazan hasta que alguien elija «Activar». El encabezado muestra el nombre comercial y, si no existe, la razón social. Editar carga la razón social, el nombre comercial y el identificador fiscal guardados. Guardar conserva esos dos últimos salvo que se dejen vacíos.

Expedientes permite crear, listar, buscar, consultar y actualizar persona y expediente de la empresa activa. No hay borrado físico. No hay salarios, documentos sensibles, bancos, CURP ni RFC. La relación laboral queda prevista y no se implementa en F2.1.

## Flujo de una operación

1. La página llama a `src/features/companies/api.ts` o a `src/features/personnel/api.ts`.
2. `invoke` ejecuta un comando en `src-tauri/src/commands`.
3. El caso de uso valida con el dominio y habla con `CompanyRepository` o `PersonnelFileRepository`.
4. `SqliteCompanyRepository` escribe en el archivo `rh-system.sqlite`, dentro del directorio de datos de Tauri. La empresa activa se resuelve en Rust; React no envía `company_id` en las operaciones de personal.
5. El error vuelve a la interfaz como `{ code, message }`. El mensaje está en español y no incluye la ruta del archivo ni el detalle del motor.

## Base de datos

Al abrir la conexión se activan las claves foráneas, un tiempo de espera de cinco segundos y el modo WAL. Si las claves foráneas no quedan activas, la apertura falla. Las migraciones son SQL versionado en `src-tauri/migrations` y avanzan `PRAGMA user_version` dentro de una transacción. Una base más nueva que el código se rechaza. Volver a abrir una base ya migrada no repite el SQL.

La migración `001` crea `companies` y `app_settings`. `app_settings.active_company_id` guarda la empresa activa. La migración `002` crea `people` y `personnel_files`, ambas con `company_id`, claves foráneas e índices. El número de empleado es único por empresa, no de forma global. `002` no inserta expedientes de ejemplo. No hay tabla vacía de relación laboral: esa entidad queda documentada para F2.2/F3.

## Persona, expediente y relación laboral

F2.1 separa tres conceptos:

- **Persona:** identidad de negocio acotada a una empresa (`people`). No es una cuenta de acceso al sistema.
- **Expediente digital:** registro de personal vinculado a esa persona (`personnel_files`), con identificador interno estable, número de empleado y estado administrativo.
- **Relación laboral:** prevista para puestos, vigencias, reingresos e historial. No se implementan sus procesos en F2.1.

Un usuario del sistema no se mezcla con un expediente. No hay identificadores fiscales personales globales (CURP/RFC) en esta entrega.

## Aislamiento por empresa

`companies` es la raíz de tenencia. `people` y `personnel_files` incluyen `company_id` con clave foránea. Listar, consultar, crear y actualizar expedientes resuelven la empresa activa en Rust y rechazan un expediente de otra empresa como no encontrado. El mismo número de empleado puede existir en empresas distintas.

La empresa activa sigue siendo una preferencia de la aplicación, no un permiso. **No presenta el cambio de empresa como autorización.** F1 (autenticación, roles y auditoría) está incompleta. Por eso las operaciones de personal se bloquean en compilaciones de producción (`cfg!(not(debug_assertions))`) en los comandos y en los casos de uso de Rust; no basta con ocultar botones. El desarrollo usa datos sintéticos. No hay autenticación ficticia ni permisos simulados.

## Limitaciones de seguridad de F2.1

- Sin autenticación, sesiones, roles ni auditoría de negocio.
- El aislamiento de expedientes filtra por la empresa activa guardada en `app_settings`, no por identidad de quien opera.
- Un instalador de producción no puede crear, listar, consultar ni editar expedientes hasta que F1 ofrezca controles mínimos.
- No usar datos personales reales. No hay cifrado de campos ni respaldo restaurable en esta entrega.

## Backend central

Los casos de uso dependen de los contratos de repositorio, no de detalles de archivo. Una implementación posterior puede hablar con una API y con PostgreSQL sin trasladar las reglas a React. La sincronización offline tampoco entra en esta fase: la base local sigue siendo la fuente de esta instalación. No hay cliente HTTP ni PostgreSQL en F2.1.

## Qué no hace esta fase

No hay autenticación, auditoría, documentos, nómina, puestos, historial salarial ni sincronización. La política de contenido de la ventana está en `null`, igual que la plantilla de Tauri, para no bloquear el ciclo de desarrollo. Conviene ajustarla antes de distribuir una versión de uso real.
