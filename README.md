# RH System

Sistema de gestión de recursos humanos para escritorio. Esta fase deja el cascarón navegable y el alta, la consulta y la actualización de empresas en SQLite. El resto de los módulos todavía no está implementado.

## Requisitos

- Node.js 26.13.1 (LTS) y npm 11.20.0
- Rust 1.100.0, con rustfmt y clippy
- En Linux, las dependencias de Tauri 2 y WebKitGTK 4.1

El detalle de versiones y del entorno de Cursor Cloud está en [docs/development.md](docs/development.md).

## Instalación

```bash
bash .cursor/install.sh
npm ci
```

El script de instalación es idempotente. En un equipo de desarrollo que ya tenga Node, Rust y las librerías del sistema, alcanza con `npm ci`.

## Desarrollo

```bash
npm run tauri dev
```

La interfaz queda en `http://localhost:1420` y la ventana nativa la abre Tauri. Los datos se guardan en el directorio de datos de la aplicación, no en el repositorio.

## Pruebas

```bash
npm run check
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
```

`npm run check` ejecuta formato, ESLint, el chequeo de tipos, la frontera que impide abrir SQLite desde React y las pruebas de la interfaz.

## Instalador de Windows

El flujo de GitHub Actions compila el instalador NSIS x64 y lo publica como artefacto de la ejecución. No crea un release de GitHub. Compilar el instalador no equivale a probarlo de forma gráfica en Windows.
