# Catálogo de medicamentos y suplementos

## Uso

En el botón principal **Configuración → Medicamentos y suplementos** se puede editar el catálogo. También está disponible en la pestaña **Configuración** de la consulta clínica y mediante **Configurar catálogo y dosis** en los selectores de tratamiento.

En Consulta → Tratamiento que está utilizando, se despliega la lista, se busca y se marca cada producto. Después se elige una dosis predefinida o se escribe una personalizada, y se completa la frecuencia real. No se asignan automáticamente dosis ni frecuencias. Orlistat permite registrar las cápsulas por día y distribución en frecuencia. Formulación, vía, tolerancia y efectos adversos se anotan en Notas; se conserva el apartado general de tolerancia.

Wegovy y Ozempic están separados. Wegovy admite 0.25, 0.5, 1, 1.7 y 2.4 mg; Ozempic, 0.25, 0.5 y 1 mg. También se incluyen tirzepatida, Contrave, fentermina 18.75/37.5 mg, orlistat, topiramato, Samexid y Rybelsus. Los suplementos incluyen whey, proteína vegetal, creatina, hierro oral/endovenoso, B12 oral/inyectable, vitamina D oral/gotas, zinc, cafeína, beta-alanina, omega 3, magnesio y multivitamínico.

El profesional configura las dosis que usa, incluidas las formulaciones de hierro, concentración de gotas y cantidades elementales cuando correspondan. Las listas son opciones de registro; no generan una pauta ni titulación. El conteo de clics se marca explícitamente y se documenta en Notas con el lápiz y número utilizado. No se realiza conversión mg/clics.

## Persistencia y compatibilidad

Migración 0012 aditiva: tabla `clinical_catalogs`. El catálogo es privado y compartido entre pacientes del entorno, con control optimista de versiones. La API `/api/clinical/treatment-catalog` hereda autenticación y comprobación de origen. Una edición obsoleta devuelve 409 y no sobrescribe la versión reciente. Se mantienen límites de tamaño y validación de entradas.

Los controles conservan el formato previo de tratamientos (`name`, `dose`, `frequency`, `notes`). El catálogo no altera ni vincula dinámicamente el texto de tratamientos ya guardados: renombrar, quitar o editar un producto no reescribe controles anteriores. Los productos libres anteriores siguen disponibles en sus controles y se conserva el registro manual.

El editor protege borradores sin guardar y bloquea nuevas ediciones mientras se guarda. Las listas abiertas se actualizan después de guardar el catálogo sin borrar el borrador del paciente. El HTML de demostración mantiene su catálogo en memoria y no realiza conexiones externas.

## Validación

Compilación TypeScript/Vite, 27 pruebas funcionales y 2 del HTML aprobadas. Se comprueban selección por casillas, dosis, notas de clics, persistencia del control, personalización del catálogo, conservación de planes previos, conflictos de versión y rechazo de origen ajeno. Navegación desde la configuración original y configuración móvil de la consulta comprobadas; revisión visual a 390 px.

Publicado y verificado en el Worker existente, versión `ee4ba68a-2e00-4ca5-8a05-3c445fe8037a`. Recursos idénticos a la compilación probada y API privada protegida con 401, comprobados por HTTPS. La migración conserva los recuentos previos de pacientes, registros, planes, documentos, fotos y consultas.
