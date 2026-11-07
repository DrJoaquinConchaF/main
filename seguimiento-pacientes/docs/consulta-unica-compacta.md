# Consulta única, resultados compactos e historia del peso

Estado: implementación preparada y probada localmente; publicación pendiente de reconectar la sesión de Cloudflare. Sin migraciones ni servicios nuevos.

La pantalla inicial pasa a ser Resumen, de solo lectura, del último control. La captura completa ocurre en Abrir consulta clínica. Los controles anteriores abren el mismo editor en su fecha; Documentos y Evolución conservan sus funciones especializadas. El acceso a documentos desde la consulta sincroniza la fecha de atención, independiente de la fecha de muestra del laboratorio.

Hábitos utiliza solo el promedio diario de pasos del último mes. La adherencia se introduce y presenta de 0 a 100%; la adaptación mantiene la escala histórica interna sin reescribir registros anteriores. Los entrenamientos se muestran juntos y permiten añadir modalidades. Hidratación incluye Leche, Bebida vegetal y Otra, con descripción propia persistente.

Laboratorio utiliza una tabla compacta: resultado, unidad y referencia del informe entre paréntesis; valores fuera del intervalo en negrita con flecha arriba/abajo. No inventa rangos normales. La extracción de PDF respeta el orden visual, separa unidades del nombre y deja resultados alternativos sin nombre desmarcados para revisión. Cada fila puede corregirse antes de guardar. Se conserva el PDF original; la extracción requiere revisión profesional.

Historia del peso calcula años aproximados desde nacimiento y edad de cada evento; sin nacimiento usa edad actual y fecha de consulta. Conserva rangos y recuerdos escritos, indicando cuáles no son graficables. Acepta edades como «27 años» y pesos como «68,4 kg», y dibuja un punto aunque sea el único. Los años manuales previos se conservan como originalYear si difieren del cálculo. Los controles nuevos heredan la historia anterior como copia independiente; no sobrescriben versiones previas. Una historia vaciada explícitamente no se restaura sin intervención.

Validación: compilación TypeScript/Vite; 37 pruebas funcionales, incluidas persistencia, concurrencia, importación PDF y navegador a 1280/390/360 px; 2 pruebas de la demostración HTML. Las pruebas usan una base temporal independiente y datos ficticios. Se verificaron punto de 27 años, año calculado, guardado y reapertura, unidades y alertas de laboratorio, varias modalidades visibles e hidratación personalizada.
