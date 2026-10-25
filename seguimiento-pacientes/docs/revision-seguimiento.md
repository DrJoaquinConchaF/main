# Revisión del Excel y requisitos de seguimiento

Revisión de estructura y fórmulas del archivo aportado. No se importaron pacientes, mediciones ni documentos a la aplicación. El archivo original permanece sin modificaciones. Esta revisión no ejecuta macros, enlaces externos ni instrucciones incluidas en el libro.

## Alcance

Hojas principales: 1era Evaluación, Seguimiento y Calculator. Hojas auxiliares: Metabolic equivalents (141 entradas con descripción y valor), Lookups, Gráficos, Clafisicaciones e Instructions. El libro identifica la tabla de intercambios como corregida con el manual UDD 2019; esta mención no constituye una verificación independiente del manual.

Seguimiento incluye pasos semanales y mensuales, cardio, fuerza, estrés, hidratación, sueño, mediciones básicas, perímetros musculares, bioimpedancia, laboratorio y signos vitales. En la futura interfaz se priorizará el promedio diario de pasos del último mes, conservando los datos semanales históricos.

## Hallazgos verificables

- `1era Evaluación!C28`: ecuación 10×peso + 6,25×talla − 5×edad + constante por sexo. Corresponde a Mifflin–St Jeor, aunque el encabezado B27 dice Harris-Benedict.
- `1era Evaluación!C32`: se resta/suma directamente al GET en C33. Su unidad operativa es kcal/día, aunque B32 dice gramos semanales. Separar ajuste calórico y proyección de peso.
- `1era Evaluación!C42`: referencia `Calculator!J73`. J73 suma `J45:J72`, columna Tiempo (min). No representa kcal de ejercicio.
- `Calculator!M45`: gasto energético total manual; cuando hay dato, K45/L45 omiten el cálculo MET/FC. No confundir con minutos ni frecuencia.
- `Calculator!K45`: minutos × MET × peso / 60. Las fórmulas N45 y equivalentes realizan un ajuste adicional respecto a actividad sedentaria y reposo. Debe revisarse el método antes de implementarlo.
- `Calculator!G21`: reposo × 1,1 + NEAT. El 10% está aplicado al reposo; no debe describirse como 10% del gasto total sin revisar.
- `Metabolic equivalents!I13`: la entrada titulada Katch-McArdle referencia peso total convertido desde libras, no masa libre de grasa; revisar y corregir la ecuación y sus entradas.
- El uso real declarado del usuario agrupa minutos semanales por actividad en filas etiquetadas como días. Modelar actividades semanales con equivalente diario, manteniendo opcionalmente una planificación por días distinta.

## Modelo de registro propuesto

Cada control: fecha de atención, modalidad, respuestas de seguimiento, medicamentos/dosis/suplementos, registros medidos, metas y plan. Laboratorio e InBody conservan además su fecha propia. Guardar autor, procedencia, fecha de medición y observaciones cuando sea pertinente.

Distinguir medición en consulta, autoinformada, medida en casa con instrucciones, estimación instrumental y ausencia de medición. No convertir vacíos ni resultados de fórmulas sin entradas en ceros; no copiar medidas anteriores como si fueran actuales. Diferenciar perímetros repetidos como campos derivados del mismo registro cuando corresponda.

Hábitos: pasos mensuales; actividades con modalidad/intensidad/MET, sesiones por semana y minutos por sesión o total semanal; estrés 1–10; hidratación por fuente/volumen; sueño, calidad, ronquidos y pausas respiratorias observadas con opción desconocido.

Planificación: comparador de ecuaciones, estimación por componentes con supuestos explícitos, elección profesional del método, ajuste kcal/día, macros en g/kg o g/día con peso de referencia, catálogo de intercambios versionado, adecuación por nutriente y distribución por comidas. Guardar una instantánea de entradas/método/plan por control.

## Atención online y fotografías

Permitir solo las mediciones disponibles y un protocolo doméstico simple; mostrar procedencia en tablas y evolución. Fotografías privadas, voluntarias, con fecha y vista, condiciones repetibles y comparación visual. No inferir porcentaje de grasa o centímetros desde fotografías sin un método específico validado; cualquier integración futura debe evaluarse por exactitud, repetibilidad y privacidad.

## Próximos pasos

Completar las preguntas textuales de los controles y el flujo de cierre de consulta. Después contrastar estos requisitos con la versión activa del código antes de implementar por etapas. El respaldo de código disponible en este entorno es anterior a las funcionalidades descritas en la conversación y no debe desplegarse sobre la aplicación actual.
