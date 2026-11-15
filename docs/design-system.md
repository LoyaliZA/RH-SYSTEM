# Sistema visual

Dirección del escritorio RH System: una aplicación de negocio para Windows, sobria y moderna, con tema claro y oscuro. La paleta es neutra y el acento es turquesa. La interfaz se lee antes de decorarse.

Los tokens viven en `src/index.css`. Esta nota describe los que usa la fase 0.1.

## Herramientas de esta fase

`.cursor/mcp.json` declara dos servidores MCP locales: `shadcn` (`npx shadcn@latest mcp`) y `playwright` (`npx @playwright/mcp@latest`). `npx shadcn@latest mcp init --client cursor` escribió esa entrada y dejó `shadcn` como dependencia de desarrollo. Los dos CLI responden a `--help`.

En esta sesión de Cursor Cloud el catálogo de herramientas no expuso ninguno de los dos espacios de nombres, ni antes ni después de guardar la configuración. Una sonda de inicialización por stdio tampoco devolvió respuesta. Esos MCP no se usaron para generar componentes ni para capturar pantallas.

La interfaz se construyó con los componentes locales ya existentes y con Radix para el panel, la descripción emergente y el selector nativo. La comprobación visual automatizada usa `@playwright/test` y Chromium, no el MCP de Playwright.

## Color

Los valores están en OKLCH. El matiz del acento está entre 200 y 205.

| Token                  | Claro                    | Oscuro                  |
| ---------------------- | ------------------------ | ----------------------- |
| `--background`         | `oklch(0.975 0.004 250)` | `oklch(0.2 0.012 255)`  |
| `--foreground`         | `oklch(0.24 0.02 255)`   | `oklch(0.95 0.008 250)` |
| `--card`               | `oklch(0.995 0.002 250)` | `oklch(0.24 0.014 255)` |
| `--primary`            | `oklch(0.42 0.09 205)`   | `oklch(0.8 0.1 200)`    |
| `--primary-foreground` | `oklch(0.985 0.008 205)` | `oklch(0.22 0.03 205)`  |
| `--muted-foreground`   | `oklch(0.44 0.02 255)`   | `oklch(0.8 0.016 250)`  |
| `--accent`             | `oklch(0.945 0.02 205)`  | `oklch(0.32 0.03 205)`  |
| `--destructive`        | `oklch(0.46 0.15 25)`    | `oklch(0.74 0.12 25)`   |
| `--border`             | `oklch(0.88 0.008 250)`  | `oklch(0.36 0.014 255)` |
| `--sidebar`            | `oklch(0.965 0.005 250)` | `oklch(0.17 0.012 255)` |
| `--sidebar-accent`     | `oklch(0.935 0.025 205)` | `oklch(0.3 0.035 205)`  |

El primario claro lleva texto casi blanco. El primario oscuro es turquesa claro y lleva texto oscuro. El texto de apoyo conserva croma suficiente para no quedar gris sobre una superficie de color.

## Tipografía

IBM Plex Sans, cargada con `@fontsource/ibm-plex-sans`. Cuerpo de 1 rem y línea de 1.5. Los títulos de página van en `text-2xl` y peso 600. Los títulos de sección van en `text-base` y el mismo peso. No se usa una segunda familia para títulos.

## Espacio, borde y radio

- Radio base: `0.375rem` (6 px). Los radios `sm` y `lg` se calculan a partir de ese valor.
- La página usa `gap-6` entre bloques y un padding que baja en ventanas estrechas.
- Las tarjetas de contenido usan un borde de 1 px del token `--border` y fondo `--card`.
- El foco visible es un anillo de 2 px en `--ring`, con 2 px de separación.

## Navegación

La barra lateral ocupa 15 rem expandida y 4 rem contraída. El cambio de ancho dura 200 ms y desaparece si el sistema pide menos movimiento. Permanece en el flujo del escritorio: al expandirse, el contenido se estrecha y no queda tapado.

Sin preferencia guardada, se expande si el viewport supera 1023 px y se contrae si es más estrecho. La preferencia queda en `localStorage` con la clave `rh-system-sidebar`. `Ctrl+B` o `Cmd+B` alternan el estado, salvo que el foco esté en un campo. Contraída, cada destino muestra una descripción emergente. El destino activo usa `--sidebar-accent` y el icono en color primario.

El encabezado muestra la sección, la empresa activa y el cambio de tema. Un enlace «Saltar al contenido» es el primer elemento enfocable.

## Empresas

La tabla tiene encabezados visibles, una leyenda solo para lectores de pantalla y la fila seleccionada resaltada. Los valores ausentes se leen como «Sin nombre comercial» y «Sin identificador». Las acciones conservan los nombres «Editar» y «Activar».

Crear y editar ocurre en un panel lateral. Por debajo de 1024 px el panel usa todo el ancho; desde 1024 px se limita a 24 rem. El foco entra en el primer campo. Cerrar, cancelar y guardar quedan visibles. El aviso de guardado permanece en la página al cerrar el panel.

Al editar, dejar el nombre comercial o el identificador fiscal como están los conserva. Vaciarlos los borra, porque el envío convierte un opcional en blanco en `null`.

## Inicio

El inicio muestra la empresa de trabajo, un selector real y el acceso a los módulos. Los módulos disponibles enlazan a su pantalla. Los que están en preparación se listan como tales y llevan a la página de no implementado. No hay indicadores numéricos: el bloque dice que todavía no hay datos y que no se muestran cifras de ejemplo.

## Estados

- Vacío: explica qué falta y ofrece la acción siguiente.
- Carga: texto de espera, sin esqueleto decorativo.
- Error: el mensaje devuelto por la aplicación, dentro de una alerta.
- Confirmación: una nota breve tras crear, guardar o activar.
- No implementado: lo dice de forma explícita y ofrece volver al inicio.

## Lo que queda fuera

Gradientes decorativos, métricas de adorno, cuadrículas de tarjetas idénticas, bordes de color gruesos y animaciones que no cambian el entendimiento de la pantalla.
