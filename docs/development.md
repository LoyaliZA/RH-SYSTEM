# Desarrollo

## Versiones usadas

Registradas al construir esta fase, el 14 de noviembre de 2026.

| Pieza                   | Versión                                  |
| ----------------------- | ---------------------------------------- |
| Ubuntu                  | 24.04.5 LTS                              |
| Node.js                 | 26.13.1 (LTS Lithium)                    |
| npm                     | 11.20.0                                  |
| Rust                    | 1.100.0, fijada en `rust-toolchain.toml` |
| rustfmt y clippy        | las del toolchain 1.100.0                |
| WebKitGTK               | libwebkit2gtk-4.1 2.52.6                 |
| Tauri (crate)           | 2.12.5                                   |
| `@tauri-apps/api` y CLI | 2.12.4                                   |
| create-tauri-app        | 4.7.5, solo para el andamiaje inicial    |
| React                   | 19.1.0                                   |
| TypeScript              | 6.0.3                                    |
| Vite                    | 8.0.16                                   |
| Tailwind CSS            | 4.3.5                                    |
| rusqlite                | 0.37.0, con SQLite embebido              |

`package-lock.json` y `src-tauri/Cargo.lock` fijan el resto de las dependencias.

## Equipo local

En Ubuntu, el mismo script del entorno de Cloud instala lo necesario:

```bash
bash .cursor/install.sh
npm ci
npm run tauri dev
```

En Windows, para desarrollar hace falta Node.js 26.13.1, Rust 1.100.0 con el target `x86_64-pc-windows-msvc`, Visual Studio Build Tools con el desarrollo de escritorio en C++ y el runtime WebView2. Después, `npm ci` y `npm run tauri dev`. El instalador NSIS se genera con:

```bash
npm run tauri build -- --bundles nsis --target x86_64-pc-windows-msvc
```

Ese comando no se ejecutó en esta máquina Linux. El flujo de CI en `.github/workflows/ci.yml` lo ejecuta en `windows-latest` y sube el `.exe` como artefacto. No publica un release.

## Cursor Cloud

`.cursor/environment.json` sigue el esquema oficial `https://cursor.com/schemas/environment.schema.json`. Los campos usados son `name` e `install`. No hay Dockerfile ni imagen propia.

`install` ejecuta `bash .cursor/install.sh`. El script es idempotente y prepara:

- Node.js 26.13.1 en `/usr/local` y, si existe nvm, también ahí
- Rust stable con rustfmt y clippy; el archivo `rust-toolchain.toml` selecciona 1.100.0
- Paquetes de Tauri 2 para Debian: WebKitGTK 4.1, herramientas de compilación, `libssl`, `libxdo`, `librsvg` y AppIndicator
- Lo necesario para abrir la ventana en un escritorio o en un display virtual: `xvfb`, `xauth`, `dbus-x11` y fuentes Liberation

Cursor aplica ese script al crear un build del entorno, antes de que arranque un agente. Esta ejecución no puede reconstruir esa instantánea: el archivo queda en el repositorio para el próximo build. Hasta entonces, cada agente nuevo tiene que poder instalar las mismas piezas con el script.

Los procesos de larga duración no van en `install`. El comando de desarrollo se lanza cuando hace falta ver la ventana.

## Verificación

Antes de dar por cerrado un cambio:

```bash
npm run check
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
```

`npm run check:boundaries` falla si `src/` menciona SQLite. Las pruebas de Rust usan una base temporal y empresas ficticias. No uses datos personales reales.

La comprobación visual de esta fase es la ventana nativa de Tauri, no solo el navegador. En un entorno sin sesión gráfica, `xvfb-run npm run tauri dev` levanta un display virtual. Si la ventana nativa no puede abrirse, hay que decirlo y no dar la interfaz por validada.

## Datos locales

Tauri guarda `rh-system.sqlite` en el directorio de datos de `com.loyaliza.rhsystem`. En Linux suele ser `~/.local/share/com.loyaliza.rhsystem/`. En Windows, la carpeta equivalente queda bajo `%APPDATA%`. Borrar ese archivo vuelve a crear la base vacía en el siguiente arranque. No forma parte del repositorio.
