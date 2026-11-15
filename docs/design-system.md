# Sistema visual

Índice de la identidad de RH System. No repite las reglas. Si este índice, la regla de Cursor o el skill discrepan de los documentos oficiales, manda la identidad oficial y se corrige la frase vieja.

## Jerarquía

1. [Identidad visual oficial](design/RH-SYSTEM-DESIGN-SYSTEM-v1.0.md). Decisiones de las cuatro rondas: color, tipo, radio, elevación, movimiento y uso del púrpura y de la menta.
2. [Especificación de pantallas](design/RH-UI-SPECIFICATIONS.md). Complementa a la identidad. Describe pantallas y distingue qué está cerrado, qué es una propuesta y qué hay que comprobar en el repositorio.

## Cómo leer la especificación

La especificación marca cada decisión con una de tres etiquetas. No se intercambian:

- **APROBADO:** decisión de las cuatro rondas o acuerdo ya cerrado. Obliga.
- **PROPUESTA:** detalle pendiente de validar contra el producto. No es una función existente ni una orden de maquetar.
- **POR VERIFICAR:** comportamiento que hay que confirmar en el repositorio antes de implementarlo.

Las referencias aprobadas están en [docs/design/references/](design/references/), sin modificar sus píxeles. Inicio sigue `03-inicio-bento` y Empresas sigue `01-seleccion-empresa`. El isotipo de `05-acceso` es el logo oficial. `02`, `04` y `06` aportan densidad, pastillas, radio y el botón amatista. No se copian cifras, personas ni adornos de una sola pantalla.

## Dónde vive la fase A

Los tokens de color, texto, superficie, borde, estado, radio, elevación y movimiento están en `src/index.css`. La fuente es Plus Jakarta Sans, empaquetada en local, sin CDN. La composición de las pantallas no cambia en esta fase.

Los cinco colores oficiales no se sustituyen. Los auxiliares pueden apartarse de la propuesta inicial cuando el contraste lo exige; ese ajuste queda en la hoja de estilos, no aquí. La menta no es texto sobre el lienzo claro. El amatista de marca no es texto sobre la ciruela. El botón primario es amatista con texto blanco.

## Quién consulta qué

- `AGENTS.md` conserva la arquitectura y apunta a esta jerarquía.
- `.cursor/rules/ui-design.mdc` se aplica al editar la interfaz y remite aquí.
- `.cursor/skills/enterprise-ui/SKILL.md` es el procedimiento de cambio.
