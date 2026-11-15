---
name: enterprise-ui
description: Use when designing, reviewing, or changing the RH System desktop interface, including layout, themes, tables, forms, empty states, sidebar, or visual quality.
---

# Interfaz empresarial de RH System

Úsala antes de cambiar la interfaz del escritorio y otra vez al revisar el resultado. El índice está en `docs/design-system.md`. La identidad oficial es `docs/design/RH-SYSTEM-DESIGN-SYSTEM-v1.0.md`. La especificación de pantallas es `docs/design/RH-UI-SPECIFICATIONS.md`. Las reglas permanentes están en `.cursor/rules/ui-design.mdc`. No copies tokens dentro de este skill.

Si este procedimiento contradice la identidad oficial, manda la identidad y se corrige la frase vieja.

## Antes de tocar la interfaz

1. Lee la pantalla y los componentes que ya funcionan. No reemplaces un control solo por decoración.
2. Separa **APROBADO**, **PROPUESTA** y **POR VERIFICAR**. No trates una propuesta como función existente. Confirma en el repositorio lo que está por verificar.
3. Las referencias aprobadas están en `docs/design/references/`. Inicio sigue `03-inicio-bento` y Empresas sigue `01-seleccion-empresa`. El isotipo de `05-acceso` es el logo. No copies cifras, personas ni adornos de una sola pantalla.
4. Conserva el CRUD de empresas, la persistencia y los comandos de Rust. Un cambio visual no justifica tocar SQLite ni las migraciones.
5. No añadas módulos de recursos humanos. Los módulos en preparación siguen siendo un enlace a una página de «no implementado».
6. La copia nueva va en español y nombra el rol, no el género. Los identificadores nuevos van en inglés.
7. No cambies «Nueva empresa», «Crear empresa», «Guardar cambios», «Editar» ni «Activar» sin actualizar las pruebas.

## Dirección

Escritorio de negocio, claro y denso con medida, recorrible con teclado. La fuente, la paleta, el radio, la elevación suave y el movimiento salen de la identidad oficial y de `src/index.css`. La barra lateral empuja el contenido; no flota encima. La menta no sustituye al estado de éxito y no es texto sobre el lienzo claro. El amatista de marca no es texto sobre la ciruela.

## Revisión visual

Recorre el cambio en 1280×800, 1024×768 y 800×600, en tema claro y oscuro.

- El documento no se desplaza en horizontal.
- Títulos, tablas, botones de fila y campos del formulario caben en la ventana o se desplazan dentro de su propio contenedor.
- El foco visible se distingue en ambos temas.
- El texto de lectura mantiene contraste de al menos 4.5:1. `getComputedStyle` puede devolver `oklch` o `rgb`; mídelo pintando el color en un canvas.
- No hay cifras presentadas como indicadores reales.
- Crear, editar y activar una empresa ficticia sigue funcionando. Editar solo la razón social conserva el nombre comercial y el identificador fiscal.
- Con `prefers-reduced-motion`, el movimiento decorativo no es perceptible.

`npm run test:visual` cubre ese recorrido en Chromium con los comandos de Tauri simulados. No forma parte de `npm run check` porque CI no instala el navegador de Playwright. La ventana nativa se comprueba aparte con `npm run tauri dev`.

## Qué no hacer

- Gradientes decorativos, sombras pesadas o métricas hero.
- Cuadrícula de tarjetas idénticas como estructura de la página.
- Barra de acento gruesa en el elemento activo.
- Panel modal cuando un panel lateral o la propia página bastan, salvo que haya que proteger el foco.
- Datos personales reales o empresas con nombres de personas.
- CDN para la fuente. El escritorio tiene que abrir sin red.
