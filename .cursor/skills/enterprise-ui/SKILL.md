---
name: enterprise-ui
description: Use when designing, reviewing, or changing the RH System desktop interface, including layout, themes, tables, forms, empty states, sidebar, or visual quality.
---

# Interfaz empresarial de RH System

Úsala antes de cambiar la interfaz del escritorio y otra vez al revisar el resultado. La dirección completa está en `docs/design-system.md`. Las reglas permanentes están en `.cursor/rules/ui-design.mdc`.

## Antes de tocar la interfaz

1. Lee la pantalla y los componentes que ya funcionan. No reemplaces un control solo por decoración.
2. Conserva el CRUD de empresas, la persistencia y los comandos de Rust. Un cambio visual no justifica tocar SQLite ni las migraciones.
3. No añadas módulos de recursos humanos. Los módulos en preparación siguen siendo un enlace a una página de «no implementado».
4. La copia nueva va en español y nombra el rol, no el género. Los identificadores nuevos van en inglés.

## Dirección

Escritorio nativo de negocio: sobrio, denso con medida y fácil de recorrer con teclado. Neutros fríos y un solo acento turquesa. IBM Plex Sans. Radio de 6 px. La barra lateral empuja el contenido; no flota encima.

## Revisión visual

Recorre el cambio en 1280×800, 1024×768 y 800×600, en tema claro y oscuro.

- El documento no se desplaza en horizontal.
- Títulos, tablas, botones de fila y campos del formulario caben en la ventana o se desplazan dentro de su propio contenedor.
- El foco visible se distingue en ambos temas.
- El texto de lectura mantiene contraste de al menos 4.5:1. `getComputedStyle` devuelve `oklch`; mídelo pintando el color en un canvas.
- No hay cifras presentadas como indicadores reales.
- Crear, editar y activar una empresa ficticia sigue funcionando. Editar solo la razón social conserva el nombre comercial y el identificador fiscal.

`npm run test:visual` cubre ese recorrido en Chromium con los comandos de Tauri simulados. No forma parte de `npm run check` porque CI no instala el navegador de Playwright. La ventana nativa se comprueba aparte con `npm run tauri dev`.

## Qué no hacer

- Gradientes, sombras blandas de plantilla o métricas hero.
- Cuadrícula de tarjetas idénticas como estructura de la página.
- Barra de acento gruesa en el elemento activo.
- Panel modal cuando un panel lateral o la propia página bastan, salvo que haya que proteger el foco.
- Datos personales reales o empresas con nombres de personas.
