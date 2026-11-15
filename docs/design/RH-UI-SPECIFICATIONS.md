# RH System — Especificaciones de interfaz (UI) v1.0

**Estado:** especificación de diseño para revisión; no autoriza modificaciones de código.  
**Fecha:** 14 de noviembre de 2026.  
**Documento complementario:** `RH-SYSTEM-DESIGN-SYSTEM-v1.0.md`.  
**Uso:** referencia para Cursor y para revisión visual/funcional por pantalla.

> **Cómo interpretar este documento.** **[APROBADO]** identifica una decisión explícita de las cuatro rondas o una característica ya acordada. **[PROPUESTA]** identifica una solución de detalle que debe validarse en prototipo y contra el repositorio. **[POR VERIFICAR]** identifica comportamiento o datos que Cursor debe investigar antes de implementar. No se deben tratar las propuestas como funcionalidades ya existentes.

## 1. Objetivo y principios transversales

RH System es una aplicación de Recursos Humanos y gestión empresarial, con múltiples empresas independientes. La experiencia debe ser limpia, moderna, minimalista y reconocible. La referencia principal son las **cinco imágenes aprobadas por el usuario**, especialmente la composición y el uso del espacio, no solo los colores.

- **[APROBADO]** Amatista suave `#7956B5`, menta suave `#65BFA8`, uso selectivo del púrpura; modo oscuro Ciruela profunda.
- **[APROBADO]** Plus Jakarta Sans; iconografía con contenedores suaves; tarjetas de elevación suave; botones sólidos elegantes; tablas modernas; estados como etiquetas suaves; animaciones Premium.
- **[APROBADO]** Dashboard Bento editorial; sidebar contraíble de contraste sutil; encabezado integrado; formularios híbridos; empresas como tarjetas protagonistas; pantallas operativas contextuales.
- **Regla funcional:** el diseño no puede alterar permisos, cálculos, persistencia, navegación o aislamiento de datos entre empresas.
- **Regla de contenido:** no mostrar métricas ficticias como datos reales; usar estados vacíos y explicaciones cuando no existan datos.

### 1.1 Jerarquía de referencias

1. Funcionalidad y restricciones verificadas del repositorio actual.
2. Decisiones aprobadas de las cuatro rondas y el documento maestro.
3. Cinco imágenes aprobadas como **referencia visual de composición**.
4. Propuestas de detalle incluidas en esta especificación, sujetas a revisión.

Si dos referencias se contradicen, Cursor debe señalar la discrepancia y pedir decisión, **sin elegir silenciosamente**.

## 2. Estructura de navegación y shell

### 2.1 Flujo de acceso

**[APROBADO]** Inicio de sesión → selección de empresa autorizada → espacio de trabajo de la empresa → módulos operativos. El selector solo debe mostrar empresas a las que el usuario tenga acceso. La empresa activa debe identificarse claramente en la navegación.

**[POR VERIFICAR]** Rutas exactas, persistencia de sesión, política de redirección, autorización y comportamiento cuando un usuario tenga una sola empresa. No cambiar esas reglas solo por estética.

### 2.2 Shell y sidebar

**[APROBADO]** Sidebar contraíble y encabezado integrado, con contraste visual sutil respecto del lienzo.

**[CONSERVAR SI EXISTE EN LA VERSIÓN ACTUAL]** El shell utiliza una barra lateral dentro del flujo de página, columna de contenido, enlace «Saltar al contenido» y `main#contenido`; no convertir la barra en un panel fijo que oculte contenido. Respetar el comportamiento existente del hook de sidebar: clave `rh-system-sidebar`, valores `expanded`/`collapsed`, preferencia guardada, atajo Ctrl+B/Cmd+B ignorado dentro de campos, tooltips en estado contraído y nombres accesibles «Contraer navegación» / «Expandir navegación». **[POR VERIFICAR]** Confirmar todo ello contra el árbol de código que realmente se vaya a editar; el checkout local y `main` remoto pueden diferir.

**[PROPUESTA]** Orden conceptual de grupos: Inicio, Personal, Asistencia, Prenómina, Administración. La estructura real de permisos y módulos tiene prioridad; no inventar accesos.

### 2.3 Encabezado integrado

- **[APROBADO]** La empresa activa se presenta en la zona superior de la navegación; el encabezado del contenido es discreto y contextual.
- **[PROPUESTA]** Título de página, descripción breve opcional, ruta/breadcrumb solo cuando ayude, acción primaria a la derecha y acciones secundarias agrupadas.
- **[PROPUESTA]** Evitar una segunda barra global excesivamente alta o duplicar el selector de empresa en varias zonas.

### 2.4 Ventanas y diseño adaptable

**[PROPUESTA]** Diseñar primero para escritorio Windows con ventanas redimensionables, sin asumir maximización. En ventanas estrechas: reflujo de tarjetas, controles de filtros en varias filas, tablas con desplazamiento horizontal controlado o columnas prioritarias, nunca truncar importes o estados críticos. Los breakpoints definitivos se ajustarán al framework existente y a pruebas de tamaño real.

## 3. Pantalla 01 — Inicio de sesión

### Propósito

Permitir el acceso del personal autorizado y comunicar la identidad RH System desde el primer contacto.

### Estructura visual

- **[APROBADO]** Interfaz limpia, con marca RH System y estilo coherente con el dashboard.
- **[PROPUESTA]** En escritorio, composición asimétrica: área de identidad/ilustración sobria y tarjeta de acceso. En ventanas reducidas, una sola columna centrada.
- **[PROPUESTA]** Logotipo y nombre, título de bienvenida, descripción breve, campos de credenciales, acción principal y mensajes de estado.
- **[PROPUESTA]** Fondo neutro claro y púrpura como acento; evitar degradados intensos y grandes ilustraciones que compitan con el formulario.

### Estados e interacciones

| Estado | Comportamiento esperado |
|---|---|
| Inicial | Campos y botón disponibles; etiquetas visibles |
| Validación | Error junto al campo pertinente y resumen si hace falta |
| Enviando | Bloquear doble envío; indicar progreso sin mover el layout |
| Credenciales inválidas | Mensaje claro sin revelar información sensible |
| Sesión válida | Continuar al flujo de empresa autorizado |
| Fallo de red | Mensaje recuperable y posibilidad de reintentar |

**[POR VERIFICAR]** Método real de autenticación, recuperación de contraseña, MFA, política de sesión y mensajes existentes. No agregar controles que sugieran capacidades inexistentes.

### Criterios de aceptación visual

La acción principal destaca sin saturar; el formulario funciona con teclado; el foco es visible; no hay saltos de layout al validar; la pantalla mantiene jerarquía en modo oscuro.

## 4. Pantalla 02 — Selector de empresas

### Propósito

Permitir que el usuario elija una empresa autorizada antes de operar sobre sus datos.

### Estructura visual

- **[APROBADO]** Empresas como **tarjetas protagonistas**, no una tabla convencional.
- **[APROBADO]** Cada tarjeta prioriza logotipo y nombre; la composición debe sentirse editorial y espaciosa.
- **[PROPUESTA]** Cuadrícula adaptable de tarjetas con logotipo real o monograma de respaldo, nombre completo, indicador de acceso y acción clara «Acceder».
- **[PROPUESTA]** Búsqueda solo cuando el número de empresas lo justifique; si existe información autorizada, mostrar resumen breve sin saturar la tarjeta.
- **[PROPUESTA]** Respetar la identidad propia de cada empresa sin perder la identidad base de RH System.

### Estados

Sin empresas autorizadas; una empresa; múltiples empresas; búsqueda sin resultados; logo no disponible; acceso en curso; error de carga; empresa deshabilitada si esa condición existe realmente.

### Reglas funcionales

La lista proviene de permisos reales. No permitir entrar a empresas no autorizadas. Al cambiar empresa, limpiar o invalidar vistas y cachés dependientes del contexto anterior según la arquitectura existente. **[POR VERIFICAR]** Flujo actual de cambio de empresa y manejo de errores.

## 5. Pantalla 03 — Dashboard de empresa

### Propósito

Dar un panorama rápido del estado operativo de la empresa y dirigir la atención hacia tareas relevantes.

### Composición

- **[APROBADO]** **Bento editorial**: tarjetas de dimensiones variadas, jerarquía fuerte, aire visual y una o dos tarjetas protagonistas.
- **[APROBADO]** El púrpura se usa selectivamente; la mayoría de las superficies permanecen neutras.
- **[PROPUESTA]** Zona superior con bienvenida contextual, nombre de empresa y periodo; primera fila con métricas clave; zona intermedia con asistencia e incidencias; zona inferior con tareas y actividad.
- **[PROPUESTA]** Tarjetas candidatas, condicionadas a datos reales: personal activo, asistencia del periodo, incidencias pendientes, vacaciones, actividad reciente y avisos operativos.
- **[PROPUESTA]** No forzar gráficos si los datos son escasos o no están disponibles. Mostrar un estado vacío útil en su lugar.

### Reglas de datos

Cada métrica debe indicar periodo, unidad y fuente lógica; evitar porcentajes sin denominador claro. Los números no deben ser ilustrativos en producción. Las tarjetas pueden ser enlaces solo cuando exista una ruta válida y autorización.

### Responsive

En escritorio amplio, cuadrícula asimétrica; en ventanas medianas, dos columnas o composición simplificada; en estrechas, una columna priorizada. No depender de posiciones absolutas para tarjetas informativas.

### Aceptación

En pocos segundos se identifica la empresa, las métricas principales y las acciones pendientes. El dashboard no parece una tabla administrativa convencional ni una colección de tarjetas idénticas.

## 6. Pantalla 04 — Administración de empresas

> Esta pantalla es distinta del **selector de empresas**. Su disponibilidad depende del rol y de las funciones existentes.

### Estructura

- **[APROBADO]** Empresas presentadas mediante tarjetas con logotipos y presencia visual fuerte.
- **[PROPUESTA]** Encabezado «Empresas», acción de página «Nueva empresa», tarjetas con identidad, nombre y acciones permitidas.
- **[CONSERVAR SI EXISTE]** Distinguir el nombre de la acción de página **«Nueva empresa»** del botón de envío del formulario **«Crear empresa»**; ambos textos son relevantes para las pruebas existentes.
- **[PROPUESTA]** Crear/editar mediante panel lateral solo si el formulario es breve; si contiene muchos campos o pasos, utilizar página dedicada conforme al sistema híbrido.

### Estados y reglas

Carga, lista vacía, validación de campos, logotipo ausente, error al guardar, guardado correcto, acceso denegado. No alterar la creación real, identificadores, aislamiento de datos ni validaciones de backend.

## 7. Pantalla 05 — Empleados y expedientes

### Vista de listado

- **[APROBADO]** Tabla moderna, densidad equilibrada y estilo coherente con el resto del producto.
- **[PROPUESTA]** Encabezado con título y acción autorizada; filtros contextuales; tabla con nombre/avatar, identificador si existe, área, puesto, estado y acciones permitidas.
- **[PROPUESTA]** Cabeceras discretas, separadores tenues, estados como etiquetas suaves, alineación coherente, hover ligero y selección accesible.
- **[PROPUESTA]** Búsqueda, filtros, ordenación y paginación solo donde el backend o la lógica actual puedan sostenerlos correctamente.

### Expediente individual

- **[APROBADO]** Formularios híbridos: **página completa** para expedientes complejos y **panel lateral** para cambios breves.
- **[PROPUESTA]** Cabecera con identidad del empleado, puesto y estado; navegación por secciones como datos generales, laborales y documentos **solo si esas áreas existen**.
- **[PROPUESTA]** Acciones de guardar/cancelar claras, avisos de cambios no guardados, validación cercana al campo y permisos por acción.

### Estados

Sin empleados, sin resultados de filtro, carga, error, formulario inválido, guardando, confirmación, expediente no encontrado y acceso restringido.

### Aceptación

La tabla sigue siendo legible con muchos registros; el usuario puede distinguir rápidamente estado y empleado; editar no implica perder el contexto ni información no guardada.

## 8. Pantalla 06 — Asistencia

### Propósito

Revisar y gestionar asistencia de una empresa, incluida captura manual e importación desde checadores, según el alcance funcional existente.

### Composición contextual

- **[APROBADO]** No replicar sin criterio el dashboard; la pantalla se organiza alrededor del periodo y los registros.
- **[PROPUESTA]** Encabezado con empresa/periodo, filtros de fechas, resumen de registros y acciones de captura/importación autorizadas.
- **[PROPUESTA]** Tabla de marcaciones y/o vista calendario cuando resulte útil y esté respaldada por datos reales.
- **[PROPUESTA]** Estados suaves para incidencias, registros incompletos y validaciones; no usar solo color para distinguirlos.

### Importación

**[PROPUESTA]** Flujo visible: seleccionar archivo → revisar formato y vista previa → detectar errores/duplicados → confirmar → mostrar resultado. **[POR VERIFICAR]** Formatos soportados, reglas de deduplicación, conciliación y mensajes reales. No diseñar un paso como operativo si aún no existe.

### Aceptación

El usuario puede identificar el periodo activo, diferenciar captura manual de importación y comprender claramente los errores de registros sin perder trazabilidad.

## 9. Pantalla 07 — Incidencias y prenómina

### Propósito

Preparar, revisar y exportar información de prenómina con claridad y trazabilidad; **no** asumir capacidades de cálculo de nómina completa si el producto solo cubre prenómina.

### Composición contextual

- **[APROBADO]** Prioridad a datos operativos y legibilidad, no a decoración Bento.
- **[PROPUESTA]** Encabezado con empresa y periodo; resumen de incidencias y conceptos; filtros; tabla principal; panel de detalle o edición cuando proceda; acciones de validación y exportación según permisos.
- **[PROPUESTA]** Distinguir percepciones, deducciones e incidencias mediante etiquetas y encabezados claros, no solo colores.
- **[PROPUESTA]** Importes alineados a la derecha, formato monetario consistente, totales visibles y estados de revisión explícitos.

### Reglas críticas

No modificar fórmulas, redondeos, catálogos, periodos, exportaciones ni reglas de autorización por una decisión visual. **[POR VERIFICAR]** Formato de exportación, reglas de cálculo y alcance funcional actual.

### Estados

Periodo sin registros; registros incompletos; validación fallida; revisión pendiente; exportación en curso; exportación correcta o fallida. Confirmar antes de operaciones irreversibles si las hubiera.

### Aceptación

Los importes son fáciles de comparar; el periodo y la empresa permanecen claros; los errores no se ocultan; los controles no inducen a confundir prenómina con nómina timbrada.

## 10. Componentes compartidos y contratos de interacción

| Componente | Presentación | Comportamiento mínimo |
|---|---|---|
| Botón primario | Amatista sólido | Hover, foco, deshabilitado, progreso; evita doble envío |
| Botón secundario | Neutro y discreto | No compite con acción principal |
| Tarjeta | Superficie limpia, elevación suave | Clic solo cuando sea realmente navegable |
| Etiqueta de estado | Fondo tenue y texto legible | Texto/ícono además de color |
| Tabla | Filas legibles, densidad equilibrada | Orden, selección y paginación solo si aplican |
| Campo de formulario | Etiqueta persistente | Ayuda, error, requerido y foco visible |
| Panel lateral | Contexto visible | Cierre seguro y control de cambios pendientes |
| Modal | Acción breve o confirmación | Foco gestionado y salida accesible |
| Toast/aviso | Discreto y claro | No reemplaza errores persistentes de formulario |
| Skeleton | Geometría cercana al contenido final | Sin animación invasiva |
| Estado vacío | Mensaje específico y siguiente paso | Sin métricas o registros inventados |

### 10.1 Movimiento Premium

**[APROBADO]** Animaciones Premium y expresivas, sin distracción. **[PROPUESTA]** Hover 140–180 ms, paneles 220–280 ms, transición de vistas 180–260 ms y entradas escalonadas breves. Respetar `prefers-reduced-motion`; no animar permanentemente tablas ni cifras.

### 10.2 Accesibilidad

Foco visible; navegación por teclado; etiquetas de campos; texto alternativo para logos informativos; mensajes de error vinculados al control; tamaños de objetivo adecuados; contraste validado en ambos temas. Evitar acciones exclusivamente por hover.

## 11. Sistema de temas

**[APROBADO]** Modo claro de fondo neutro `#F6F5F8`, superficies blancas; modo oscuro Ciruela profunda `#1D1725` y superficies `#30283A`. El Amatista `#7956B5` es el color de marca en modo claro; en oscuro pueden requerirse variantes más luminosas para accesibilidad. La menta `#65BFA8` es secundaria, no un sustituto de la semántica de éxito.

**[PROPUESTA]** Todos los componentes deben consumir tokens semánticos (`background`, `surface`, `text`, `border`, `primary`, `focus`, `success`, `warning`, `danger`) en vez de valores hexadecimales dispersos. Los tokens concretos y sus contrastes se verifican en el documento maestro y en pruebas de interfaz.

## 12. Matriz de pantallas y referencias visuales

| Pantalla | Referencia aprobada | Qué copiar | Qué NO copiar literalmente |
|---|---|---|---|
| Login | Imagen de login | Composición limpia y jerarquía | Textos o campos no respaldados por el producto |
| Selector de empresas | Imagen de selección | Tarjetas, logos, ritmo visual | Nombres, números o permisos ficticios |
| Dashboard | Imagen 5, dirección principal; imagen 4, apoyo | Bento, proporciones, aire, acentos | Métricas de ejemplo y gráficos sin datos |
| Empleados | Imagen 3 | Tabla, filtros, avatares, jerarquía | Columnas o acciones inexistentes |
| Administración de empresas | Imagen 2, como lenguaje de tarjetas | Identidad de cada empresa | Confundir selector con gestión administrativa |
| Asistencia y prenómina | Lenguaje visual común; sin maqueta específica aprobada | Componentes, color y densidad | Inventar un diseño funcional no validado |

**Nota:** las imágenes deben adjuntarse o guardarse con nombres claros en el espacio de trabajo de Cursor. Este documento no contiene las imágenes embebidas.

## 13. Criterios de revisión por pantalla

- [ ] Respeta las decisiones aprobadas de identidad y las imágenes de referencia.
- [ ] Mantiene la empresa activa y el contexto de permisos claros.
- [ ] No modifica lógica de negocio, rutas o persistencia sin autorización.
- [ ] Funciona en modo claro y oscuro, con contraste comprobado.
- [ ] Presenta estados de carga, vacío, error y éxito pertinentes.
- [ ] Es navegable con teclado y tiene foco visible.
- [ ] Conserva jerarquía al redimensionar la ventana.
- [ ] No introduce datos ficticios como reales.
- [ ] Evita animaciones molestas y respeta movimiento reducido.
- [ ] No agrega acciones que aparenten funcionar cuando no existe soporte.

## 14. Instrucción para Cursor: fase de análisis, SIN CAMBIOS

> Lee `RH-SYSTEM-DESIGN-SYSTEM-v1.0.md` y `RH-UI-SPECIFICATIONS.md`, junto con las cinco imágenes visuales aprobadas. Inspecciona el repositorio y prepara un inventario de pantallas, rutas, componentes, estilos, temas, permisos y funcionalidades existentes. Para cada pantalla, indica: (1) qué ya cumple; (2) qué debe cambiar visualmente; (3) qué no debe tocarse; (4) riesgos y dependencias; (5) dudas de producto; (6) pruebas existentes que deben preservarse. Comprueba específicamente el shell/sidebar y los textos «Nueva empresa» y «Crear empresa». **No edites archivos, no instales dependencias, no ejecutes migraciones y no hagas commits.** Entrega únicamente el análisis y un plan por fases para aprobación.

## 15. Pendientes para la guía de implementación

La futura `RH-IMPLEMENTATION-GUIDE.md` se cerrará **después** de conocer el árbol real que se implementará. Debe incluir rutas de archivos existentes, mapeo de tokens a la solución de estilos actual, estrategia de reutilización, secuencia de cambios, pruebas automatizadas, capturas de comparación y plan de reversión. No se deben inventar nombres de archivos ni asumir que el checkout local equivale al remoto.

---

**Fin de la especificación UI v1.0.** Documento de diseño y validación, no una orden de implementación.
