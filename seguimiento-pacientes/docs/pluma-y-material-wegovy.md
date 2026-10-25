# Presentación de la pluma, dosis administrada y material de apoyo

Para los productos con conteo de clics habilitado, el selector superior identifica el lápiz/pluma y su presentación (mg por dosis). Debajo se registra la presentación exacta (modelo/país/concentración), la dosis administrada independiente y la frecuencia. Elegir una pluma no rellena ni modifica la dosis.

Al marcar conteo de clics aparece un campo manual. El número/rango indicado por el profesional se añade entre paréntesis a la dosis. No existe conversión mg/clics, tabla de equivalencias ni redondeo automático. Los ejemplos de prueba son entradas literales simuladas y no validan ninguna equivalencia clínica. Cambiar la pluma o la dosis borra los clics previos para que el profesional los confirme de nuevo.

Los datos siguen siendo compatibles con el formato de tratamiento anterior: la presentación se registra como línea `Pluma utilizada:` en Notas y la dosis mantiene el texto con clics entre paréntesis. Se conservan las observaciones y registros previos; la actualización no reescribe datos guardados. Se validan dosis/presentación presentes para conteos explícitos y rangos numéricos ordenados.

## Cierre

El apartado «Wegovy: texto para receta y material de apoyo» prepara texto desde el uso registrado para revisar y copiar a Reservo. Solo permite copiar el esquema cuando están completos pluma, dosis, frecuencia y clics cuando correspondan. El esquema se añade al resumen del paciente únicamente mediante la selección explícita «Incluir este esquema revisado…».

Se pueden seleccionar individualmente los enlaces aportados por el propietario:

- Guía de uso: https://www.wegovy.com/obesity/starting-wegovy/starting-wegovy-pen.html
- Vídeo: https://youtu.be/P272OrKhqvk?si=syV9PfywPQTdifss
- Beneficios: https://www.novocarebeneficios.cl

Los tres intentos de consulta desde el entorno devolvieron rechazo del proxy (403). No se han validado el contenido, las equivalencias del vídeo ni las condiciones comerciales vigentes. La interfaz identifica la guía de EE. UU. y pide comprobar que corresponda al dispositivo exacto; no se presenta como guía de FlexTouch ni del conteo. Los materiales quedan sin seleccionar por defecto. La explicación de beneficios es general y editable, sin prometer descuentos o cobertura. Los recursos se incorporan a los textos de ficha/paciente solo cuando se seleccionan.

La tabla de terceros mostrada en la captura no se transcribió a un calculador ni se asumió válida para todas las presentaciones. No se enviaron mensajes, recetas o material a pacientes durante la implementación.

## Verificación

Compilación TypeScript/Vite; 29 pruebas funcionales y 2 del HTML aprobadas. Se comprueban independencia entre presentación y dosis, conservación de texto, invalidación de clics al cambiar datos, esquema incompleto, persistencia con la dosis literal introducida por el profesional, selección explícita de recursos y generación del resumen. Revisión visual del formulario a 390 px con datos de demostración en memoria. Sin migraciones ni nuevos servicios.

Publicación verificada: Worker `be49093e-9cb2-4fcb-8349-ff8494339203` en la URL existente. Archivos públicos idénticos a la compilación probada y rutas privadas protegidas con 401 por HTTPS.
