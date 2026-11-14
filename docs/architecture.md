# Arquitectura

RH System es una aplicación de escritorio. La distribución prevista es un instalador de Windows. El desarrollo y las pruebas de esta fase corren en Ubuntu.

## Decisiones que ya están cerradas

- Interfaz: React, TypeScript y Vite, con Tailwind CSS y componentes al estilo shadcn/ui.
- Núcleo nativo: Rust, mediante Tauri 2.
- Persistencia local: SQLite, detrás de un repositorio. React no abre la base.
- Fuera de esta fase: API central, PostgreSQL y sincronización offline. El diseño deja el lugar para esos componentes y no los implementa.

## Módulos

Están disponibles el inicio y empresas. Organización, expedientes, puestos, usuarios y auditoría, documentos, movimientos laborales, asistencia, vacaciones y prenómina aparecen en la navegación marcados como no implementados.

Empresas permite crear, leer y actualizar. No hay baja. La primera empresa creada queda activa. Las siguientes no la reemplazan hasta que alguien elija «Activar». El encabezado muestra el nombre comercial y, si no existe, la razón social.

## Flujo de una operación

1. La página llama a `src/features/companies/api.ts`.
2. `invoke` ejecuta un comando en `src-tauri/src/commands`.
3. El caso de uso valida con el dominio y habla con `CompanyRepository`.
4. `SqliteCompanyRepository` escribe en el archivo `rh-system.sqlite`, dentro del directorio de datos de Tauri.
5. El error vuelve a la interfaz como `{ code, message }`. El mensaje está en español y no incluye la ruta del archivo ni el detalle del motor.

## Base de datos

Al abrir la conexión se activan las claves foráneas, un tiempo de espera de cinco segundos y el modo WAL. Si las claves foráneas no quedan activas, la apertura falla. Las migraciones son SQL versionado en `src-tauri/migrations` y avanzan `PRAGMA user_version` dentro de una transacción. Una base más nueva que el código se rechaza. Volver a abrir una base ya migrada no repite el SQL.

La migración `001` crea `companies` y `app_settings`. `app_settings.active_company_id` guarda la empresa activa. No hay tablas vacías de módulos futuros.

## Aislamiento por empresa

`companies` es la raíz de tenencia. Cuando existan expedientes, movimientos u otra información de negocio, cada tabla deberá incluir `company_id` con clave foránea hacia `companies`. La empresa activa de esta fase es una preferencia de la aplicación, no una barrera de seguridad. El repositorio es el punto donde esa barrera se aplicará más adelante.

## Backend central

Los casos de uso dependen del contrato `CompanyRepository`, no de detalles de archivo. Una implementación posterior puede hablar con una API y con PostgreSQL sin trasladar las reglas a React. La sincronización offline tampoco entra en esta fase: la base local sigue siendo la fuente de esta instalación.

## Qué no hace esta fase

No hay autenticación, auditoría, documentos, nómina ni sincronización. La política de contenido de la ventana está en `null`, igual que la plantilla de Tauri, para no bloquear el ciclo de desarrollo. Conviene ajustarla antes de distribuir una versión de uso real.
