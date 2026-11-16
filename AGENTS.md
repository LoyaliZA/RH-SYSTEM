# AGENTS.md

## Roadmap y estado del proyecto

La fuente única del roadmap funcional es [ROADMAP.md](ROADMAP.md). Antes de proponer o implementar una fase, leerlo y comprobar el estado actual de `main` y sus Pull Requests. Distinguir fases visuales de entregas funcionales; no considerar un módulo implementado solo por su pantalla o por un reporte de Cursor. Actualizar `ROADMAP.md` cuando cambie el estado verificable de una entrega.

Convenciones para quien modifique RH System. La arquitectura completa está en [docs/architecture.md](docs/architecture.md) y el entorno local o de Cloud en [docs/development.md](docs/development.md).

## Arquitectura

La aplicación es de escritorio: Tauri 2, React, TypeScript y Vite en la interfaz, y Rust en el núcleo. SQLite vive detrás del repositorio en Rust. React solo llama comandos de Tauri.

Capas, de afuera hacia adentro:

- `src/`: interfaz. Los componentes visuales no contienen reglas de negocio.
- `src-tauri/src/commands`: adapta los comandos de Tauri a los casos de uso.
- `src-tauri/src/use_cases`: orquesta validación y persistencia.
- `src-tauri/src/domain`: empresa, normalización y errores de dominio.
- `src-tauri/src/persistence`: contrato `CompanyRepository` y su implementación SQLite.
- `src-tauri/src/infrastructure`: apertura de la base, claves foráneas y migraciones.

La empresa es la raíz de aislamiento. Las tablas futuras de negocio deben llevar `company_id` hacia `companies`. Esta fase no implementa ese aislamiento completo: solo existe el agregado de empresas y la empresa activa.

El límite de aplicación son los casos de uso. Un backend central posterior puede implementar `CompanyRepository` sin mover las reglas al componente visual. No hay cliente HTTP ni PostgreSQL en esta fase.

## Convenciones

- Identificadores de código en inglés. Textos de la interfaz y documentación en español, con lenguaje neutro respecto de quien opera el sistema.
- Sin datos personales reales en pruebas, semillas o capturas. Usar empresas ficticias como «Taller Norte» y el identificador `DEMO-0001`.
- Sin secretos en el repositorio, en la configuración de CI ni en la base de ejemplo.
- React no abre SQLite, ni por dependencia ni por acceso directo al archivo.
- Cada cambio se acompaña de una verificación que realmente se ejecutó. No marcar como exitosa una prueba que no corrió.
- No publicar un release de GitHub desde esta fase. El instalador de Windows es un artefacto de CI.

## Interfaz

La identidad visual oficial es [docs/design/RH-SYSTEM-DESIGN-SYSTEM-v1.0.md](docs/design/RH-SYSTEM-DESIGN-SYSTEM-v1.0.md). La especificación de pantallas es complementaria: [docs/design/RH-UI-SPECIFICATIONS.md](docs/design/RH-UI-SPECIFICATIONS.md). El índice que ordena ambos, sin repetir sus reglas, es [docs/design-system.md](docs/design-system.md). Si una frase de este archivo, de la regla de interfaz o del skill contradice esos documentos, manda la identidad oficial.

## Cursor Cloud

La configuración versionada es `.cursor/environment.json`, según el esquema `https://cursor.com/schemas/environment.schema.json`. Usa los campos `name` e `install`. No usa Docker.

`bash .cursor/install.sh` prepara Node.js LTS, Rust stable con rustfmt y clippy, las dependencias Linux de Tauri 2 y lo necesario para abrir la ventana. Es idempotente. Un agente no puede reconstruir la instantánea de Cloud desde la ejecución en curso: el script queda listo para el próximo build del entorno.

Para comprobar la aplicación en este escritorio:

```bash
npm run tauri dev
```

La base de depuración se anuncia en la consola como `RH System database:`. Cerrar y volver a abrir la ventana debe conservar las empresas.
