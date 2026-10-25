# Especificación del flujo clínico y cierre de consulta

Estado: requisitos y propuesta de diseño; no implica cambios publicados. Complementa revision-seguimiento.md. No contiene datos identificables de pacientes.

## Responsabilidades de las plataformas

Reservo continúa como agenda, ficha médica, pago/boleta y emisión de recetas/órdenes. La aplicación de seguimiento concentra captura estructurada, antecedentes, evolución, cálculos y preparación de textos para Reservo y del resumen al paciente. Las integraciones con Reservo, WhatsApp y Canva requieren comprobación separada. No asumir sincronización existente ni enviar mensajes durante el diseño.

## Flujo común

Fecha de atención siempre visible, modalidad presencial/online y distinción inicial/control. Completar solo lo evaluado; mostrar dato anterior como referencia sin registrarlo de nuevo. No exigir pasos administrativos para escribir en la consulta. Secciones desplegables, recorrido breve en móvil y acceso directo a evolución. Un control debe guardar sus propias respuestas, tratamiento y plan.

## Primera atención

1. Antecedentes estructurados: AM, Qx, Alerg, Intol, Farm/sup, TB, OH, Ant. TCA, Ant. Fam, Lab, Vive y Cocina. Resumen editable con contador de 400 caracteres para copiar en Reservo; sin truncamiento automático.
2. Motivo, contexto actual, prioridades y objetivos. Historia del peso con edad/año aproximado y eventos; separar pesos recordados de mediciones clínicas.
3. Recordatorio alimentario de un día concreto: horario, alimentos/bebidas, cantidades, preparación y agregados; revisión final y representatividad del día. Patrón habitual por trabajo, teletrabajo y fin de semana separado.
4. Hábitos: pasos promedio diario del último mes, ejercicio por actividad semanal, estrés 1–10, relación con alimentación/actividad y apoyos, hidratación por fuente y volumen, sueño/calidad/ronquidos/pausas observadas con opción desconocido.
5. Antropometría/perímetros, InBody y laboratorio disponible, con fechas y fuentes propias.
6. Evaluación y prioridades clínicas, cálculo energético cuando se use, metas, indicaciones y seguimiento.

Encuesta previa: enlace privado, guardar/continuar, opciones desconocido/prefiero conversarlo. Respuestas informadas por el paciente pendientes de revisión; no integrarlas silenciosamente como hechos confirmados. En controles preguntar cambios, evitando repetir antecedentes completos.

## Controles

Registrar por fecha y con referencia al período desde la consulta anterior:

- Medicamentos y suplementos realmente utilizados: nombre, dosis, frecuencia, inicio/cambios/suspensión y observaciones. Registrar tolerancia/efectos adversos cuando se evalúen. Separar de la prescripción nueva.
- Comprensión de la estrategia acordada: sí/parcial/no/no evaluado, con aclaraciones.
- Dificultades, dudas y barreras: texto libre y posibles etiquetas editables.
- Adherencia autoinformada de 0 a 100%, a qué indicaciones se refiere y período evaluado. No equipararla automáticamente a resultados de peso.
- Cambios corporales percibidos.
- Rendimiento: progresión en fuerza/cargas, capacidad aeróbica y recuperación; texto libre con valores opcionales.
- Alimentación: cumplimiento respecto al plan si existe, aumento de porciones, picoteos y ultraprocesados/chatarra/frituras; azúcares/postres/bebidas azucaradas; delivery y salidas; alcohol y eventos sociales. Evitar preguntas redundantes, conservar detalle y permitir frecuencia/cantidad cuando se conozca.
- Nuevo recordatorio de 24 horas, indicando el día evaluado y su contexto.
- Hábitos y mediciones del Excel nuevamente, solo lo disponible. En online permitir datos medidos en casa/autoinformados y ausencia de medición.
- Revisar exámenes, evaluar cambios y acordar nuevo plan.

## Laboratorio y documentos PDF

Asociar PDF al paciente seleccionado; confirmar identidad al revisar y no confiar solo en nombre de archivo. Conservar original privado. Extraer analito, valor, unidad, referencia del laboratorio, fecha de toma y calificadores (menor/mayor, positivo/negativo), sin limitarse a un catálogo numérico cerrado. Si no se reconoce un dato, marcar para revisión.

Flujo: cargar → extracción → revisión/corrección con acceso al origen → confirmar registro. Fecha de toma separada de fecha de atención y emisión; señalar las fechas faltantes. Detectar duplicados antes de guardar. Reconocer sinónimos de analitos y mantener unidades originales; comparar valores compatibles, documentando conversiones explícitas. Los valores fuera del intervalo del informe no constituyen por sí mismos un diagnóstico.

Mostrar último resultado, anterior, cambio y gráfico cronológico. Mantener resultados cualitativos o no comparables en tabla. Permitir filtrar por panel, analito y fecha. En primera consulta, registrar disponible/pendiente/solicitado; órdenes iniciales y de seguimiento se construyen desde selección profesional.

## Energía y planificación

Respetar la revisión del Excel: corregir etiquetas de ecuaciones y unidades; sustituir filas de días usadas como actividades por lista semanal. Pasos promedio ingresados una vez. Evitar doble conteo entre pasos/ejercicio/factor de actividad. Comparar fórmulas y guardar método elegido y entradas por fecha. Ajuste energético en kcal/día; macros g/kg o g/día y peso de referencia explícito. Intercambios UDD versionados, adecuación por nutriente y distribución por comidas. Desplegable opcional porque la pauta detallada no se usa en todos los pacientes.

## Cierre de consulta

Una única selección del plan alimenta tres borradores editables distintos:

1. Resumen clínico para copiar en Reservo: evolución, evaluación e indicaciones.
2. Receta y orden de exámenes para copiar por separado en los campos correspondientes de Reservo.
3. Resumen comprensible para el paciente: estrategia dietaria, pasos, fuerza/cardio, indicaciones de tratamientos, exámenes y próximo control. Copiar/preparar WhatsApp; no afirmar enviado al abrir un chat ni configurar envíos sin integración comprobada.

Estrategia alimentaria seleccionable: flexible con Fitia, pauta de intercambios, derivación a nutricionista, orientaciones generales; pueden combinarse cuando el profesional lo decida. Registrar destinatario de derivación y material educativo indicado.

Metas: pasos mínimos e ideales acordados desde situación actual; fuerza en sesiones/semana; cardio en minutos/semana con actividades y progresión. Son metas editadas/aprobadas por el profesional; no preseleccionar indiscriminadamente un mismo plan. Distinguir actividad actual de actividad recomendada y evolución de ambas.

Tratamientos: catálogo editable de recetas habituales unitarias, seleccionables por casillas y buscador. Cada plantilla contiene título y texto clínico exacto definido por el profesional, con dosis, vía, frecuencia, duración e instrucciones si corresponden. Se pueden agrupar en conjuntos habituales. Combinar respetando orden y evitar duplicados; advertir selecciones del mismo principio activo con distintas presentaciones para revisión, sin resolverlas silenciosamente. No inventar pautas ni aplicar escalamiento de dosis automático. Las modificaciones globales de plantilla no alteran documentos históricos.

Órdenes: paneles habituales con selección/deselección individual y texto libre, lista enumerada sin duplicados. Mantener separadas de las recetas aunque ambas se copien a Reservo.

Materiales: catálogo versionado de PDFs para pérdida de grasa, ganancia muscular, dieta mediterránea y ejercicio. Pendientes de recibir los archivos para revisión de contenido y rediseño.

Próximo control: sugerencia inicial editable a seis semanas (42 días), conforme a disponibilidad descrita. Distinguir fecha recomendada de cita efectivamente agendada en Reservo. Los controles posteriores pueden espaciarse según decisión clínica.

## Evolución

Antropometría, Hábitos, Alimentación, Laboratorio y Seguimiento Fotográfico. Mostrar las intervenciones y dosis vinculadas a cada atención como contexto temporal, sin afirmar causalidad. Historia del peso recordada separada de mediciones sucesivas. Fechas de muestras/mediciones propias, y distancias temporales reales entre puntos.

## Prioridades de implementación

1. Recuperar y verificar el código de la versión activa: el archivo de código disponible en este entorno es anterior a las funcionalidades descritas; no desplegarlo como si fuera la última versión.
2. Antecedentes, ficha inicial/control y captura de respuestas; mantener compatibilidad con registros existentes.
3. Cierre unificado y recetas/órdenes por selección, con textos habituales aportados por el profesional.
4. Revisar/ampliar importación PDF y gráficos con pruebas de unidades, fechas y duplicados.
5. Cálculo semanal por actividad, energía/macros/intercambios y migración de Excel con vista previa.
6. Encuestas previas, materiales educativos e integraciones externas comprobadas.

Validación: pruebas con datos ficticios aislados, controles consecutivos sin sobrescritura, preservación de dosis y documentos históricos, laboratorio con fechas/unidades/duplicados/cualitativos, recetas compuestas y vistas en teléfono/computador. Ningún paciente nuevo o dato real se importa durante esta especificación.
