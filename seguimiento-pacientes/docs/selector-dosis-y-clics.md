# Selector de dosis y combinaciones de clics

## Corrección de diseño

La lista de Configuración utiliza un contenedor flex con desplazamiento. Se impide que sus botones se reduzcan por debajo de la altura de su contenido, se permite envolver nombres largos y se limita el contenido al ancho disponible. La lista muestra el número de dosis/presentaciones configuradas en lugar de concatenarlas todas.

En Consulta se elige una presentación y una dosis pulsando botones individuales, con estado seleccionado visible y accesible. La dosis administrada sigue siendo independiente de la pluma. Se conserva la entrada personalizada, sin modificar tratamientos históricos.

## Tabla por presentación exacta

Configuración → Medicamentos y suplementos → producto con clics → «Tabla de dosis y clics por pluma exacta» permite registrar filas literales: presentación exacta, dosis, número/rango de clics y URL de la fuente. Las filas no se ofrecen al paciente/consulta hasta que el profesional las coteja y marca como revisadas. Editar una fila o la identidad/presentaciones del producto invalida su revisión.

En Consulta, las presentaciones con filas revisadas aparecen como botones. Tras elegir la presentación exacta, se puede pulsar la combinación «dosis (clics)»; se conservan frecuencia y observaciones, y queda registrada la fuente. No hay interpolación, redondeo ni conversión matemática. No se cruzan datos entre presentaciones. Cambiar manualmente pluma, dosis o clics elimina la referencia de la combinación anterior.

La persistencia utiliza el catálogo JSON existente, con el campo opcional `clickOptions`; no requiere migraciones ni cambia datos previos. La API mantiene autenticación, validación y control de versiones.

## Fuente solicitada y límites comprobados

Fuente indicada por el propietario: https://penclickchart.com/wegovy-click-calculator/ . El intento de lectura devolvió denegación del proxy (403). Se guardó un borrador de red con `penclickchart.com` y `www.penclickchart.com`, conservando los dominios existentes; no se aplicó/publicó la configuración. No se importaron valores de esa página ni se supuso su contenido. Las filas permanecen vacías por defecto. Los ejemplos automáticos son datos ficticios aislados y no validan equivalencias clínicas.

La sesión OAuth se reconectó oficialmente con la cuenta del Worker existente. Publicado el 8 de noviembre de 2026: versión `4ba515b7-638e-4553-aa31-20fb2d837218`. Se verificaron los archivos publicados y la protección de las API privadas. No se creó otro Worker, no se restablecieron secretos ni se activaron servicios nuevos. La importación de valores desde la fuente externa continúa pendiente de acceso y revisión.

## Validación

Compilación TypeScript/Vite, pruebas de flujo/guardado y vista previa HTML en computador y móvil. Se comprueban geometría del texto en las tarjetas, selección por botones, filas revisadas, presentación exacta, rechazo de rangos invertidos y duplicados, persistencia de combinaciones y conservación de controles anteriores. Capturas con datos de demostración en `test-results`, excluidas de Git.
