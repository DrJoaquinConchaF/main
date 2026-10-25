# Estado actual de la ampliación clínica

## Recuperación

La autorización OAuth con la cuenta del propietario se completó correctamente. Se recuperaron el servidor, esquema sin datos y artefactos públicos de la versión activa desde Cloudflare. Las funciones previas se conservan; la recuperación no incluye los TSX originales de la interfaz anterior. El nuevo flujo tiene código fuente propio mantenible.

## Implementado localmente

- Antecedentes completos y resumen para Reservo editable, con límite visible de 400 caracteres. Abreviar el resumen no elimina antecedentes.
- Consulta inicial y controles por fecha/modalidad, con preguntas, adherencia de 0–100%, dificultades, cambios percibidos, tolerancia y rendimiento.
- Tratamiento realmente utilizado por control, separado de nuevas indicaciones. Copia explícita del último tratamiento para revisar, sin copiar mediciones pasadas.
- Historia de peso aproximada con eventos y gráfico separado de mediciones clínicas.
- Pasos mensuales, ejercicio por actividad semanal, hidratación por recipiente/fuente, estrés, sueño, ronquidos y pausas respiratorias observadas.
- Alimentación y recordatorio de un día específico, con horarios, cantidades, preparación y contexto.
- Antropometría y perímetros con procedencia, índices calculados y seguimiento. Acceso a las funciones anteriores de laboratorio, InBody, PDF y fotografías.
- Comparación de ecuaciones correctamente nombradas, gasto neto semanal de ejercicio y equivalente diario, dato manual explícito, revisión del doble conteo y método por componentes.
- Ajuste en kcal/día, proteínas/grasas en g/kg o g/día, carbohidratos remanentes, 12 grupos de intercambio, adecuación y distribución por comidas.
- Cierre con evaluación, metas realistas editables, derivación, nuevas indicaciones, exámenes pendientes y próximo control recomendado a seis semanas; fecha recomendada separada de cita agendada.
- Textos para copiar a Reservo y al paciente; abrir WhatsApp prepara el mensaje, no lo envía automáticamente.
- Biblioteca editable de recetas/órdenes con importación local de texto desde PDF/TXT, incluyendo OCR. No se cargan recetas reales por defecto, ni se inventan dosis.
- Persistencia atómica y versiones: consulta, antecedentes, datos canónicos y tratamiento se guardan juntos. Una versión obsoleta no produce cambios parciales. Autenticación y comprobación de origen se mantienen.

## Publicación pendiente

La actualización todavía no está desplegada. No se han aplicado migraciones remotas ni modificado pacientes, archivos o secretos. El sitio publicado conserva su versión anterior.

La cuenta autorizada no permite leer las suscripciones mediante la API. El propietario indicó que solo quiere opciones gratuitas y no conoce su plan de Workers. Antes de publicar hay que confirmar que es Free; no activar un plan, proveedor de correo/IA/WhatsApp, nuevo almacenamiento o servicio con cobros. El desarrollo y las pruebas se realizaron localmente.

## Validación

`npm run build` comprueba TypeScript y compila la interfaz. `npm test` usa una D1/R2 temporal: cálculo, guardado completo, conflictos concurrentes, aislamiento entre pacientes, protección de rutas y origen, flujo completo a 1280/390/360 px, conservación de la evolución heredada, importación de plantillas y OCR de un escaneo sin proveedores externos. Última ejecución verificada: 19 pruebas aprobadas, 0 fallidas y 0 omitidas. Arranque local en 8787 comprobado: health 200, modo local y lista de pacientes vacía; el entorno de pruebas no utiliza los pacientes reales.

## Pendientes posteriores solicitados

Configurar la encuesta previa y sus invitaciones; conectar Reservo/WhatsApp/Canva si las integraciones oficiales lo permiten y cumplen las condiciones de costo; recibir recetas habituales y PDFs educativos para completar y diseñar los contenidos. La migración de Excel históricos requiere una etapa con vista previa y revisión de fechas/paciente/duplicados; no se ha importado el Excel personal del ejemplo.
