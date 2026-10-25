# Diseño de la consulta en computador y celular

Se utiliza el burdeos de marca y el monograma JC, con tonos secundarios rosa, menta, durazno y lavanda. Cada sección combina icono, texto y color; el estado activo se identifica también por borde, fondo y peso del texto. Los estados de error y éxito conservan sus colores propios.

- En computador: navegación lateral, controles de fecha/modalidad arriba y contenido central.
- En celular: accesos por sección y selector persistente al recorrer formularios largos. Guardado accesible y nombre del paciente visible junto al botón.
- Consulta: tarjetas interactivas de peso, pasos diarios promedio mensual, sueño y estrés; accesos a mediciones, energía, cierre y evolución.
- Las tarjetas utilizan los datos de la atención seleccionada y muestran «Por registrar» cuando faltan. El peso de referencia energético no se muestra como medición. Si se toma del InBody asociado y la fecha difiere, se informa la fecha de medición.
- Se conserva el registro directo por fecha, las confirmaciones de cambios sin guardar, el historial desplegable, los formularios y todos los cálculos existentes.

Implementación: `src/workflow/visuals.tsx` y `design.css`, compartidos por la app y el HTML de demostración. Iconos SVG locales; sin recursos externos ni nuevos servicios. Tema claro de marca por defecto, incluso con sistema oscuro; reducción de movimiento compatible.

Validación: compilación TypeScript/Vite, 29 pruebas funcionales y 2 del HTML aprobadas. Las comprobaciones del HTML incluyen navegación mediante tarjeta, actualización de métricas sin perder el borrador, selector móvil y valores pendientes al abrir una fecha nueva. Revisión visual a 390/1280 px en claro y 360 px en oscuro; sin desbordamiento horizontal. Pruebas con datos aislados, sin escrituras en los pacientes reales.

Publicado en el Worker existente, versión `be49093e-9cb2-4fcb-8349-ff8494339203`. Recursos públicos idénticos a la compilación local comprobados por HTTPS; rutas privadas rechazan acceso anónimo con 401.
