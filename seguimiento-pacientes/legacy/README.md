# Copia de continuidad de la versión publicada

Origen: Worker `seguimiento-prueba-36658619bab1`, cuenta `8f0c83eea35e601af7420c20de388d8f`.

`published-worker.mjs` se recuperó mediante la API oficial de contenido del Worker. Conserva su comportamiento y solo añade exports con nombre para reutilizar autenticación y validadores. El mapa de fuentes anunciado por el bundle no estaba incluido en la respuesta. No se afirma que este archivo sea el código TypeScript original.

`assets` y `ocr` conservan los bytes de los archivos públicos de la interfaz activa. La lista de huellas, el hash del servidor original y los metadatos de despliegue recuperados se guardan en manifest.json. No contienen pacientes, sesiones o valores de secretos.

`current-schema.sql` se obtuvo consultando únicamente sqlite_master; no contiene filas de pacientes ni archivos. Sirve para inicializar el entorno local vacío y los tests aislados. **No ejecutarlo sobre la base remota**, que ya tiene estas tablas y su historia de migraciones. El único archivo para ampliar el esquema activo en esta actualización es migrations/0011_clinical_workflow.sql.

La conservación de estos artefactos mantiene fotografías privadas, carga de PDF/InBody, laboratorio, recetas, plantillas y evolución anteriores mientras el nuevo flujo se desarrolla en TSX. No volver a desplegar el tar.gz antiguo de /workspace: corresponde a una versión anterior e incompleta.
