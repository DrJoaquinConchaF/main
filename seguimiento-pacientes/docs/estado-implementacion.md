# Ampliación clínica: estado de implementación

## Estado real

Se prepararon módulos independientes para integrar en la versión activa de la aplicación. Todavía no se integraron en su interfaz, no existe una nueva versión desplegada y no se modificaron D1, R2, secretos o pacientes. La encuesta previa y las integraciones con Reservo/WhatsApp/Canva quedan para etapas posteriores.

El checkout Git disponible solo contiene el repositorio original (commit 1192cba). El archivo `/workspace/seguimiento-pacientes-source.tar.gz` corresponde a una versión anterior, con migraciones 0000–0003, y no conserva las funcionalidades posteriores. No debe desplegarse para reemplazar la aplicación vigente.

La página publicada responde 200 y referencia el bundle `index-CHFu2iim.js`. Cloudflare rechazó la credencial configurada del entorno con HTTP 400/código 9106. No se encontró una configuración OAuth de Wrangler utilizable en las ubicaciones del proyecto ni del usuario actual. La conexión Git de lectura funciona; origin/main no contiene los commits de la aplicación posterior.

## Código preparado

`src/clinical-workflow/fields.json`: campos de antecedentes y controles, estados explícitos de información, procedencia de mediciones, recordatorio alimentario, metas y cierre, estructura del catálogo editable de recetas/órdenes/materiales, y distinción entre fecha de control recomendada y cita agendada.

`src/clinical-workflow/activities.json`: 140 actividades con MET y categoría extraídas del Excel del usuario, sin datos identificables. No se afirma que este catálogo sea exhaustivo ni que sus valores hayan sido verificados contra una fuente externa actualizada.

`src/clinical-workflow/exchanges.json`: 12 grupos y sus kcal/proteínas/grasas/carbohidratos por porción, transcritos de las fórmulas del Excel. Fuente indicada por el libro: UDD 2019, pendiente cotejo independiente con el manual.

`src/clinical-workflow/calculations.mjs`:
- Ecuaciones nombradas correctamente, sin resultados de reposo si faltan entradas necesarias.
- Actividades semanales por sesiones/duración o minutos totales. Gasto neto por MET menos 1 MET de reposo; dato manual en kcal netas semanales sustituye el cálculo, no se suma a él. Es un método explícito nuevo y no una reproducción silenciosa de las fórmulas inconsistentes del Excel.
- Cálculo por componentes solo muestra el total después de revisar el posible doble conteo de pasos y ejercicio. El porcentaje de termogénesis se define como parte del gasto total, con método versionado; no equivale al 10% del reposo del Excel.
- Déficit/superávit en kcal/día; proteína y grasas en g/kg o g/día con peso de referencia explícito; remanente de carbohidratos, detectando objetivos imposibles.
- Totales y adecuación de intercambios; distribución pendiente, completa o excedida por comida.

`src/clinical-workflow/consultation.mjs`:
- Resumen para Reservo con contador de 400 caracteres y sin recorte automático; distingue no preguntado/niega/desconocido/informado.
- Validación de fechas, adherencia y estrés; propuesta editable a seis semanas.
- Composición literal de plantillas guardadas, sustitución limitada de campos y exámenes enumerados sin duplicados exactos. La interfaz para guardar o cargar archivos y el catálogo real del profesional aún requieren integración.

## Validación realizada

Node 24, sin dependencias externas:

```
cd /workspace/main
node --test seguimiento-pacientes/tests/clinical-workflow.test.mjs
```

9 pruebas aprobadas, 0 fallidas, 0 omitidas. Reproducen el ejemplo del Excel de 1885 kcal / 163,25 g proteínas / 52,25 g grasas / 194,5 g carbohidratos, y verifican unidades semanales, dato manual, antecedentes largos, seis semanas, ecuaciones y composición de documentos. No son pruebas de la aplicación publicada ni pruebas en navegador.

## Para completar la solicitud

1. Restablecer la conexión autorizada a Cloudflare: corregir la credencial existente en ajustes seguros del entorno o vincular nuevamente la cuenta mediante el flujo oficial. No introducir credenciales en el chat.
2. Recuperar el código correspondiente a la versión desplegada y sus migraciones, conservar una copia previa y verificar bindings actuales. Si se recupera solo el bundle desplegado, documentar ese límite y no confundirlo con código fuente completo.
3. Integrar los campos y módulos, persistencia versionada por paciente/fecha, historial, fuentes de medición, pantalla de consulta y biblioteca de plantillas/archivos, manteniendo las rutas y funciones previas.
4. Revisar/ampliar PDF de laboratorio e InBody, carga histórica de Excel y evolución de todos los datos, con revisión de fechas, unidades, originales y duplicados.
5. Ejecutar compilación y pruebas del código integrado; pruebas de navegador a anchos de teléfono y computador, preservación de registros y permisos.
6. Aplicar exclusivamente migraciones aditivas necesarias y desplegar sobre el Worker existente, preservando los secretos nativos, D1/R2 y la URL. Validar el resultado real antes de anunciar actualización.
