# Orientación del control anterior y cálculo de clics

## Referencias pequeñas por campo

Los campos de consulta, hábitos, alimentación, recordatorio y mediciones presentan en gris el valor del control inmediatamente anterior a la fecha que se edita. No copian respuestas en la consulta nueva, no muestran controles futuros y conservan ceros. Se muestran fecha y «Sin registro» cuando el dato está ausente. Los textos largos se limitan visualmente a dos líneas y conservan el texto completo en el título. Entrenamientos y bebidas se emparejan por clave estable o nombre único, nunca por posición. Los tratamientos se emparejan por nombre único. La orientación no se incluye en los datos guardados.

## Cálculo solicitado

La web penclickchart.com sigue denegada por la política de red del entorno (CONNECT 403). No se atribuye su contenido a esta implementación. Se transcribe la tabla ByWard de la imagen aportada anteriormente por el propietario en `src/treatments/wegovy-reference.json`. El PDF independiente `reference-assets/wegovy-tabla-clics.pdf` reproduce sus filas y distingue el cálculo adicional de la app. Su script generador está en `scripts/build-click-reference.py`. No contiene datos de pacientes.

La selección de pluma incluye explícitamente multidosis, mg/dosis, volumen y clics/dosis. Las calibraciones transcritas son 0,5 mg/1,5 mL/37 clics, 1 mg/3 mL/75 clics, 1,7 mg/3 mL/75 clics y 2,4 mg/3 mL/75 clics. No hay calibración automática para 0,25 mg, pluma monodosis, Ozempic u otra presentación. Un registro antiguo que solo dice «Wegovy 2.4 mg/dosis» permanece sin calibrar; el profesional debe seleccionar el modelo de referencia correspondiente. No se reescriben tratamientos históricos.

Con «Con conteo de clics» activado, cambiar la pluma o la dosis recalcula clics = dosis indicada × clics completos / mg completos. Se admite coma decimal y se exige mg explícitos, dosis positiva y dentro de la dosis completa. Se redondea al entero más cercano, mitades hacia arriba; se presenta el valor teórico y la dosis resultante aproximada. Ejemplo: 1,2 mg en modelo 2,4 mg/75 clics produce 37,5 teóricos, 38 clics y aproximadamente 1,216 mg. El cálculo y sus parámetros quedan documentados en las notas del tratamiento. Una combinación exacta revisada del catálogo tiene prioridad sobre el cálculo proporcional. La edición manual de clics se conserva hasta cambiar pluma o dosis y elimina la procedencia automática anterior. No se convierte una dosis que exige menos de un clic ni se extrapola fuera del rango del modelo.

La tabla aportada contiene aproximaciones y no se ha validado con el fabricante. El profesional debe revisar su dispositivo; el cálculo no certifica la exactitud física de la dosificación ni traslada tablas a otras plumas. La imagen original informa que el conteo de clics no está aprobado por el fabricante. El acceso al PDF permanece independiente de la web externa y no introduce servicios de pago.

## Suplementos

Las opciones de creatina son 3, 5, 7,5 y 10 **gramos**. Se interpretó «mg» como errata a partir de las opciones actuales en gramos; se informó al propietario. Proteína Whey y vegetal ofrecen 1/2, 1, 1 1/2, 2, 2 1/2 y 3 scoop. La actualización de catálogos guardados reemplaza solo las listas estándar previas exactamente coincidentes; conserva listas personalizadas y tratamientos históricos.

## Verificación

43 pruebas funcionales y 2 pruebas de HTML autónomo. Cobertura: referencia anterior por fecha sin copiar respuestas ni usar datos futuros, persistencia de controles originales, elección y cambio de dosis con cálculo automático, respeto de la corrección manual y de filas revisadas, rechazo de plumas ambiguas/unidades distintas/rangos inválidos, accesos rápidos de suplementos y carga del PDF. Pruebas sobre base temporal independiente. PDF inspeccionado visualmente y mediante extracción de texto. Compilación TypeScript/Vite.

Publicado el 8 de noviembre de 2026 en el Worker existente: `0b271462-0868-42ba-a631-b22e629b8cbf`. Se verificaron hashes del HTML, JS, CSS y PDF publicados, y respuesta 401 sin sesión en las API de pacientes y catálogo. Sin migraciones ni escrituras de datos clínicos en producción.

## Recordatorios con listas vacías

Se añadió un recordatorio gris al pie de Ejercicio habitual e Hidratación que muestra todos los elementos del control anterior incluso si la consulta actual no tiene filas nuevas. Incluye frecuencia y minutos por actividad; bebida, volumen y cantidad diaria; total cuantificado y, si solo existe registro antiguo agregado, litros totales/agua. No copia ni guarda estos valores como datos actuales. Las fechas en recordatorios de Cierre se presentan como día-mes-año.

Verificación móvil ampliada para evaluación, derivación, exámenes, otras indicaciones, metas y ambas fechas de control, junto con listas actuales vacías y conservación de controles anteriores. La suite general pasó 42 casos; el caso ampliado falló inicialmente porque el dato ficticio del control futuro tenía su siguiente cita en el pasado. Corregida esa fecha de prueba, el caso ampliado pasó en una base temporal independiente. Compilación y preparación de despliegue correctas. Sin cambios de esquema, credenciales ni datos de pacientes.

Ampliación publicada y verificada el 8 de noviembre de 2026: versión `d10b8968-4f6d-4cd5-a440-e78de20fdab5`. Hashes de HTML/JS/CSS coinciden con la compilación; API de pacientes devuelve 401 sin sesión.
