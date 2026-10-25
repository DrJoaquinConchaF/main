# Evolución corporal y coherencia visual

La vista nueva está disponible tanto desde «Evolución» en la consulta clínica como en «Antropometría» de la ficha anterior (la pantalla indicada por el propietario). La integración conserva el editor original, accesible con «Mostrar / ocultar tabla editable original», y las pestañas de hábitos, alimentación, laboratorio y fotografías.

## Vistas

- Composición corporal: peso burdeos, masa grasa amarilla, masa muscular esquelética rosa, porcentaje de grasa dorado y nivel de grasa visceral violeta. Cada variable tiene su gráfico y unidad. La variación del porcentaje se expresa en puntos porcentuales.
- Peso y medidas: selección múltiple de peso, IMC, cintura al ombligo, cintura OMS, cintura menor y cadera. Escalas separadas para no mezclar kg, cm e IMC.
- Índices y referencias: cintura OMS/cadera y cintura OMS/estatura, calculados con medidas del mismo registro. Las fechas sin denominador no se completan utilizando otra visita.

Estatura conservada en los datos y cálculos, retirada de esta selección de gráficos. Fechas de medición de InBody respetadas; duplicados del mismo día conservados. Fecha de atención y tratamiento asociado accesibles mediante tooltip y tabla. Las barras tienen separación por registro, no una escala temporal continua; la pantalla lo explica.

## Referencias clínicas explícitas

- Cintura/cadera: 0,90 masculino y 0,85 femenino, según [OMS, Waist Circumference and Waist–Hip Ratio](https://www.who.int/publications/i/item/9789241501491). Se usa el sexo registrado o la elección explícita del profesional en la vista. Sin información no se muestra esa línea.
- Cintura/estatura: 0,50 en ambos sexos, con la condición visible para adultos con IMC menor de 35, según [NICE NG246](https://www.nice.org.uk/guidance/ng246/chapter/Recommendations). Los umbrales son orientación para la interpretación clínica, no diagnósticos automáticos.

## Apariencia y validación

Tema claro de marca por defecto, incluso cuando el sistema del teléfono está en oscuro: blanco/marfil, burdeos, rosa y colores suaves. El estilo se aplica también a la ficha heredada y sus categorías de evolución. No se depende de una preferencia del navegador para mostrar los colores solicitados.

Compilación y pruebas funcionales con D1/R2 temporales; las comprobaciones de navegador incluyen la pantalla anterior a 390 y 1280 px, barras SVG visibles, color claro con sistema oscuro, referencias por sexo, cambio entre categorías y acceso al editor anterior. Se comprueban fechas reales, registros duplicados, tratamiento asociado y cálculo de índices sin reutilizar datos de otra fecha. Revisión visual con datos simulados interceptados en memoria, sin escrituras en la base real.

No se modifican pacientes, registros, fotografías, archivos, secretos o infraestructura; no hay migraciones ni nuevos proveedores.

Verificado: 25 pruebas funcionales y 2 del HTML aprobadas, 0 fallidas/omitidas. Publicado en el Worker existente, versión `84c567a6-78d8-4661-ac3b-1d29a86a10f4`; archivos idénticos a la compilación local y rutas privadas protegidas con 401 comprobados por HTTPS.
