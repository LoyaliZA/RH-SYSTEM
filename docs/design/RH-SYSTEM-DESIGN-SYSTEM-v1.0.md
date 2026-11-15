# RH System — Guía visual y Design System v1.0

**Estado:** identidad visual aprobada en cuatro rondas.  
**Fecha:** 14 de noviembre de 2026.  
**Propósito:** servir como fuente de referencia visual para diseñar e implementar RH System, sin modificar código por sí misma.

> **Jerarquía de decisiones:** las decisiones de las cuatro rondas son obligatorias. Los valores técnicos sugeridos en este documento (medidas, colores auxiliares, duraciones y breakpoints) son propuestas iniciales que deberán validarse con el proyecto real y con pruebas de accesibilidad.

## 1. Visión del producto

RH System es una aplicación empresarial de Recursos Humanos con múltiples empresas independientes. Su interfaz debe transmitir **claridad, modernidad, elegancia, confianza y eficiencia operativa**. La inspiración principal es un dashboard de composición **Bento editorial**: tarjetas limpias de diferentes tamaños, fondo neutro muy claro, navegación discreta, jerarquía tipográfica marcada y uso selectivo del color.

No convertir el sistema en un panel administrativo genérico ni en una interfaz decorativa que dificulte capturar o revisar datos. La distribución y la calidad de los espacios importan tanto como la paleta.

### Principios

1. **Claridad primero:** jerarquía visible y lectura rápida.
2. **Personalidad sin saturación:** púrpura selectivo y menta secundaria.
3. **Consistencia:** mismos tokens y patrones en todos los módulos.
4. **Contexto operativo:** cada módulo adapta su distribución a la tarea.
5. **Movimiento premium:** transiciones refinadas, breves y no intrusivas.
6. **Accesibilidad:** contraste, foco visible, teclado y movimiento reducido.

## 2. Decisiones aprobadas: las cuatro rondas

| Área | Decisión aprobada |
|---|---|
| Púrpura | **Amatista suave `#7956B5`** |
| Redondeo | **Equilibrado** (referencia: 12–14 px) |
| Densidad | **Equilibrada** |
| Sidebar, apariencia | **Contraste sutil** |
| Animaciones, carácter | **Expresivas** |
| Tipografía | **Plus Jakarta Sans** |
| Iconografía | **Contenedores suaves** |
| Tarjetas | **Elevación suave** |
| Botones | **Sólido elegante** |
| Tablas | **Modernas** |
| Modo oscuro | **Ciruela profunda** |
| Color secundario | **Menta suave** |
| Uso del púrpura | **Selectivo** |
| Estados | **Etiquetas suaves** |
| Animaciones, ejecución | **Premium** |
| Dashboard | **Bento editorial** |
| Sidebar, comportamiento | **Contraíble** |
| Encabezado | **Integrado** |
| Formularios | **Sistema híbrido** |
| Empresas | **Tarjetas protagonistas** |
| Pantallas operativas | **Contextuales** |

**Interpretación conjunta de animaciones:** “expresivas” define el carácter; “Premium” define una ejecución cuidada y medida. No significa animar todo ni añadir retrasos a las tareas.

## 3. Paleta de color

### Colores aprobados

| Token conceptual | Valor | Uso |
|---|---|---|
| Amatista suave | `#7956B5` | Marca, acciones primarias, navegación activa, énfasis selectivo |
| Menta suave | `#65BFA8` | Acentos secundarios, gráficas y detalles puntuales |
| Fondo claro | `#F6F5F8` | Lienzo principal del modo claro |
| Fondo oscuro, Ciruela profunda | `#1D1725` | Lienzo principal del modo oscuro |
| Superficie oscura | `#30283A` | Tarjetas y paneles en modo oscuro |

### Valores auxiliares propuestos (pendientes de validación)

| Token | Claro | Oscuro |
|---|---|---|
| Fondo | `#F6F5F8` | `#1D1725` |
| Superficie | `#FFFFFF` | `#30283A` |
| Sidebar | `#EBE6F1` | `#282132` |
| Texto principal | `#251F30` | `#F7F2FA` |
| Texto secundario | `#756B80` | `#C1B6CC` |
| Borde | `#E7E2EB` | `#44384E` |
| Acento primario interactivo | `#7956B5` | `#B092D8` |
| Hover primario | `#68469F` | `#C3A8E6` |

**Reglas:**
- Reservar el púrpura para botones primarios, selección, iconos relevantes, algunos gráficos y una tarjeta protagonista cuando aporte jerarquía.
- No pintar de púrpura todas las tarjetas, barras y encabezados.
- No utilizar la menta como sustituto automático del estado “éxito”: los colores semánticos deben tener significado consistente.
- Verificar contraste de texto, íconos y estados en ambos temas; no asumir que un valor propuesto ya cumple WCAG.
- La elección de tema debe aplicarse a toda la interfaz, incluidos modales, tablas, popovers, calendarios y estados vacíos.

## 4. Tipografía y geometría

**Familia aprobada:** Plus Jakarta Sans, con fallback `sans-serif`.

Escala inicial sugerida:

| Uso | Tamaño inicial |
|---|---|
| Texto principal | 14 px |
| Texto auxiliar | 12–13 px |
| Encabezado de tarjeta | 16–18 px |
| Título de página | 24–28 px |
| Métrica protagonista | 28–36 px |

- Diferenciar jerarquía mediante tamaño, peso y espacio; no depender solo del color.
- Utilizar números tabulares para totales, horas, importes y columnas numéricas cuando sea posible.
- Escala de espaciado propuesta basada en 4 px; separación habitual entre tarjetas de 16–24 px.
- Radio habitual aprobado: equilibrado, alrededor de 12–14 px. Valores propuestos: 8, 12, 14 y 20 px según jerarquía.
- Altura inicial sugerida para controles: 40–44 px, adaptable a accesibilidad y densidad de datos.

## 5. Iconografía

- Estilo aprobado: **íconos dentro de contenedores suaves**.
- Biblioteca sugerida: Lucide, si es compatible con las dependencias existentes.
- Mantener trazo uniforme, tamaño consistente y fondo tenue para acciones o métricas destacadas.
- No colocar todos los íconos en cajas coloreadas: la navegación y las acciones pequeñas pueden usar íconos lineales sin contenedor.
- Los íconos complementan etiquetas; no deben ser la única pista para acciones importantes.

## 6. Componentes

### Tarjetas
- Superficies claras, radio equilibrado y **elevación suave**.
- Bordes muy discretos cuando sean necesarios para separar superficies.
- Priorizar espacios interiores generosos, jerarquía y alineación.
- Evitar sombras pesadas y gradientes decorativos extensos.

### Botones
- Primario: **sólido elegante** con Amatista suave.
- Secundario: superficie neutra y contorno discreto.
- Acciones destructivas: semántica de peligro y confirmación proporcional al riesgo.
- Definir `default`, `hover`, `focus-visible`, `pressed`, `loading` y `disabled`.
- Un botón primario dominante por contexto; no competir con múltiples acciones equivalentes.

### Tablas
- **Modernas**: encabezados discretos, espaciado legible, avatares cuando corresponda, etiquetas de estado suaves y acciones contextuales.
- Soportar búsqueda, filtros, ordenación y paginación cuando la tarea lo requiera.
- Alinear importes y cifras; mostrar unidades y formatos consistentes.
- En asistencia y prenómina, la claridad de registros y validaciones prevalece sobre adornos.
- Definir estados de carga, sin resultados, error y selección.

### Estados semánticos
- **Etiquetas suaves**: fondo tenue y texto legible.
- Categorías: éxito/activo, advertencia/pendiente, error/rechazado, informativo e inactivo.
- Nunca comunicar el estado solo por color: acompañarlo de texto y, si aporta valor, ícono.
- Los colores semánticos exactos son una especificación pendiente de validación de contraste en ambos temas.

### Formularios
- **Sistema híbrido** aprobado.
- Panel lateral (*drawer*) para edición rápida y acciones acotadas.
- Página completa para expedientes y procesos complejos, con secciones claras.
- Etiquetas visibles, campos relacionados agrupados, mensajes de error junto al campo y confirmación de guardado.
- Evitar modales largos o formularios interminables sin estructura.

## 7. Arquitectura de navegación y experiencia multiempresa

Flujo principal:

1. **Inicio de sesión:** identidad RH System, autenticación clara y estados de error.
2. **Selección de empresa:** solo empresas autorizadas, representadas mediante **tarjetas protagonistas** con logotipo.
3. **Espacio de trabajo:** dashboard y módulos de la empresa seleccionada.

### Selector de empresas
- El logotipo de cada empresa es el elemento visual protagonista.
- Mostrar nombre, estado y, cuando corresponda, información contextual útil.
- Acción de acceso inequívoca; contemplar empresas sin logotipo mediante iniciales o marcador visual.
- La elección visual no sustituye validación de permisos ni aislamiento de datos.

### Sidebar
- **Contraste sutil** respecto al lienzo, no una franja saturada.
- **Contraíble**, con estado expandido y compacto, nombres accesibles y tooltips cuando solo haya íconos.
- Anchos iniciales sugeridos: 248 px expandida y 72 px compacta; confirmar contra el comportamiento existente del proyecto.
- Conservar comportamiento funcional previo de navegación, accesibilidad y preferencias al rediseñar.
- **Encabezado integrado:** empresa activa vinculada a la navegación; acciones globales en la parte superior del área de contenido.
- El contenido principal debe permanecer visible: la sidebar no debe superponerse de manera inesperada.

## 8. Patrones de pantalla

### Dashboard: Bento editorial
- Composición asimétrica, tarjetas de diferentes tamaños y jerarquía clara.
- Métricas principales, asistencia, incidencias, vacaciones, pendientes y actividad reciente según datos disponibles.
- Una tarjeta protagonista puede usar Amatista suave; el resto prioriza superficies neutras.
- Gráficos sobrios y útiles; no llenar espacios con visualizaciones sin propósito.
- Reorganizar tarjetas en ventanas pequeñas sin perder prioridad ni legibilidad.

### Empleados y expedientes
- Barra contextual de título y acción principal; búsqueda y filtros cercanos a la tabla.
- Tabla moderna como elemento protagonista.
- Expediente en página completa con secciones; edición rápida en drawer cuando corresponda.

### Asistencia
- Distribución **contextual**: periodo/calendario, registros, incidencias, importación de checador y captura manual según el flujo implementado.
- Diferenciar claramente información original, ajustes y validaciones cuando existan.

### Prenómina
- Distribución **contextual**: periodo, incidencias, percepciones, deducciones, totales, validaciones y exportación.
- Priorizar auditabilidad y lectura de importes; advertencias visibles antes de acciones importantes.

### Otras pantallas
- Aplicar las mismas reglas de marca, navegación y componentes.
- No imponer un Bento complejo a cada pantalla: utilizarlo donde la jerarquía editorial aporte valor.

## 9. Movimiento Premium

**Aprobado:** animaciones expresivas con acabado Premium.

Duraciones de partida sugeridas:

| Interacción | Duración orientativa |
|---|---|
| Hover y microinteracción | 140–180 ms |
| Cambio de vista | 180–260 ms |
| Apertura de drawer | 220–280 ms |
| Entrada escalonada inicial de tarjetas | Breve, sin bloquear interacción |

- Movimientos cortos, cambios de opacidad y elevación sutil.
- Evitar animaciones continuas en tablas, cifras y formularios.
- Respetar `prefers-reduced-motion`.
- Mantener respuestas inmediatas para captura y operaciones repetitivas.

## 10. Responsive y accesibilidad

- Diseñar principalmente para escritorio/ventanas Windows, sin asumir siempre pantalla maximizada.
- La sidebar debe poder contraerse y la cuadrícula Bento reorganizarse con el ancho disponible.
- Las tablas deben conservar encabezados y datos críticos; evitar ocultar importes esenciales sin alternativa.
- Navegación por teclado, foco visible, etiquetas accesibles y objetivos interactivos adecuados.
- Probar estados de zoom, textos largos, nombres de empresa extensos, ausencia de logotipos y errores de red.
- Definir breakpoints a partir de la aplicación real, no copiarlos ciegamente de un mockup.

## 11. Referencias visuales

Las **cinco imágenes conceptuales aprobadas** por el usuario son referencias principales, especialmente para composición, proporciones, espacios, tono visual y jerarquía. Correspondencia prevista:

1. Login de RH System.
2. Selector de empresas con tarjetas y logotipos.
3. Empleados con tabla moderna.
4. Dashboard Bento, variante A.
5. Dashboard Bento, variante B (**referencia principal de distribución del dashboard**).

**Importante:** adjuntar estas imágenes a Cursor; este documento no contiene los archivos de imagen. No copiar errores de texto, cifras ficticias o controles imaginados en los mockups como si fueran requisitos funcionales.

## 12. Tokens de implementación: propuesta inicial

```css
:root {
  --rh-primary: #7956B5;
  --rh-primary-hover: #68469F;
  --rh-secondary: #65BFA8;
  --rh-background: #F6F5F8;
  --rh-surface: #FFFFFF;
  --rh-sidebar: #EBE6F1;
  --rh-text: #251F30;
  --rh-text-muted: #756B80;
  --rh-border: #E7E2EB;
  --rh-font-family: "Plus Jakarta Sans", sans-serif;
  --rh-radius-sm: 8px;
  --rh-radius-md: 12px;
  --rh-radius-card: 14px;
  --rh-radius-xl: 20px;
  --rh-sidebar-expanded: 248px;
  --rh-sidebar-collapsed: 72px;
  --rh-motion-fast: 160ms;
  --rh-motion-normal: 240ms;
  --rh-motion-slow: 300ms;
}

[data-theme="dark"] {
  --rh-background: #1D1725;
  --rh-surface: #30283A;
  --rh-sidebar: #282132;
  --rh-text: #F7F2FA;
  --rh-text-muted: #C1B6CC;
  --rh-border: #44384E;
  --rh-primary: #B092D8;
  --rh-primary-hover: #C3A8E6;
}

@media (prefers-reduced-motion: reduce) {
  /* Reducir o eliminar movimiento decorativo sin ocultar estados. */
}
```

Estos tokens son **una referencia de diseño, no código listo para pegar sin inspección**. La implementación debe usar el sistema de estilos existente, verificar contraste y conservar nombres y contratos funcionales del repositorio.

## 13. Instrucciones de uso para Cursor

### Fase 1: análisis sin cambios
1. Leer esta guía y revisar las cinco imágenes.
2. Inspeccionar framework, componentes, estilos, temas y estructura del repositorio actual.
3. Identificar qué comportamientos existentes deben conservarse.
4. Preparar un mapa de componentes y un plan de migración por fases.
5. Señalar discrepancias entre esta guía y el código actual.
6. **No modificar archivos, dependencias ni configuraciones hasta recibir autorización.**

### Fase 2: implementación autorizada, por etapas
1. Tokens, tipografía y temas.
2. Componentes reutilizables y shell/sidebar.
3. Login y selector de empresas.
4. Dashboard Bento.
5. Empleados/expedientes.
6. Asistencia y prenómina.
7. Pruebas visuales, funcionales y de accesibilidad.

**No aplicar cambios masivos a ciegas.** Revisar la rama, el estado del árbol de trabajo y la versión real de los archivos antes de editar; evitar sobrescribir trabajo de otras fases.

## 14. Checklist de aceptación

- [ ] La pantalla refleja la composición de las referencias, no solo sus colores.
- [ ] La tipografía, espaciados y radios son consistentes.
- [ ] El púrpura se usa de forma selectiva y la menta de forma secundaria.
- [ ] Ambos temas tienen contraste y jerarquía legibles.
- [ ] La sidebar conserva accesibilidad y comportamiento contraíble.
- [ ] La empresa activa está identificada y sus datos aislados.
- [ ] Las tablas son funcionales, legibles y eficientes.
- [ ] Formularios, drawers y páginas de detalle respetan el patrón híbrido.
- [ ] Estados de carga, vacío, error y éxito están diseñados.
- [ ] Las animaciones son Premium y respetan movimiento reducido.
- [ ] La interfaz funciona en diferentes tamaños de ventana.
- [ ] No hay regresiones funcionales.

## 15. Pendientes técnicos explícitos

Estos puntos **no quedaron cerrados como decisiones exactas en las rondas** y deben validarse antes de dar por finalizada la implementación:

- Paleta semántica completa y sus contrastes WCAG.
- Sombras, elevaciones y curvas de animación definitivas.
- Breakpoints según la arquitectura y dimensiones reales de ventanas.
- Tokens finales de tipografía y densidad para tablas extensas.
- Componentes existentes reutilizables y convenciones de nombres.
- Especificaciones de interacción de cada pantalla y sus casos límite.

---

**Resultado esperado:** RH System debe sentirse como un producto empresarial premium, limpio y reconocible, inspirado por una composición Bento editorial y preparado para tareas de Recursos Humanos de alta densidad de información.
