# Colores de marca

Paleta aproximada a partir de la publicación de marca compartida por el profesional; no corresponde a un manual oficial de colores.

| Uso | Color |
| --- | --- |
| Principal burdeos | `#881B3A` |
| Texto ciruela | `#401727` |
| Fondo claro | `#FEF8F8` |
| Superficies suaves | `#F4E0E6` |

`src/workflow/brand.css` centraliza la paleta del acceso, la ficha, los gráficos, las secciones heredadas y el HTML de demostración. Desde la actualización de evolución, el tema claro de marca se mantiene incluso con el sistema en oscuro, para coincidir con las referencias del profesional. Los estados de éxito, advertencia y error mantienen sus colores semánticos.

Validación: compilación, 25 pruebas funcionales y 2 comprobaciones del HTML aprobadas; revisión visual móvil y comprobación de estilos calculados del acceso en modo claro y oscuro. Contraste del botón principal claro: 9,27:1; texto principal: 14,6:1; botón oscuro: 8,4:1. HTTPS confirma los recursos nuevos y rechazo anónimo con 401 de las rutas privadas.

Cambio exclusivamente visual. Sin modificaciones de lógica clínica, migraciones, pacientes, archivos, secretos o servicios. Publicado en el Worker existente, versión `84c567a6-78d8-4661-ac3b-1d29a86a10f4`.

El símbolo anterior «+» del acceso y encabezado se sustituye por un monograma tipográfico JC escalonado, basado en la imagen facilitada. Incluye etiqueta accesible con el nombre del profesional y adaptación al modo oscuro. Compilación y revisión visual en móvil aprobadas; recursos publicados verificados por HTTPS.
