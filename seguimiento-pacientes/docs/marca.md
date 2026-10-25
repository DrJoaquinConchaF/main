# Colores de marca

Paleta aproximada a partir de la publicación de marca compartida por el profesional; no corresponde a un manual oficial de colores.

| Uso | Color |
| --- | --- |
| Principal burdeos | `#881B3A` |
| Texto ciruela | `#401727` |
| Fondo claro | `#FEF8F8` |
| Superficies suaves | `#F4E0E6` |

`src/workflow/brand.css` centraliza la paleta del acceso, la ficha, los gráficos, las secciones heredadas y el HTML de demostración. El modo oscuro adapta superficies y acentos para conservar la legibilidad. Los estados de éxito, advertencia y error mantienen sus colores semánticos.

Validación: compilación, 20 pruebas funcionales y 2 comprobaciones del HTML aprobadas; revisión visual móvil y comprobación de estilos calculados del acceso en modo claro y oscuro. Contraste del botón principal claro: 9,27:1; texto principal: 14,6:1; botón oscuro: 8,4:1. HTTPS confirma los recursos nuevos y rechazo anónimo con 401 de las rutas privadas.

Cambio exclusivamente visual. Sin modificaciones de lógica clínica, migraciones, pacientes, archivos, secretos o servicios. Publicado en el Worker existente, versión `531a13f9-fea4-4c06-9bef-1ec7fbbafbd1`.
