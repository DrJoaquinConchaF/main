# Seguimiento clínico

Ampliación del sitio privado existente, con el mismo Worker, D1, R2 y URL. Las nuevas pantallas complementan las funciones publicadas; no crean un segundo sitio ni migran datos de pacientes automáticamente.

## Desarrollo

Node 24. En este directorio:

```
npm ci --no-audit --no-fund
npm run db:local
npm run dev
```

`db:local` y `dev` utilizan almacenamiento local, nunca D1/R2 remotos. `dev` sirve Workers en 127.0.0.1:8787 con DEV_MODE=local. No exponer ese modo públicamente.

`npm test` compila, crea una D1/R2 temporal, arranca Workers en 8788 y ejecuta pruebas de cálculo, API, concurrencia y navegador a 1280/390/360 px, incluyendo modo oscuro y OCR local. Requiere Chromium en `/usr/bin/chromium`. El almacenamiento temporal se elimina al terminar; las capturas de datos ficticios quedan excluidas de Git.

## Organización

- `src/workflow`: nueva interfaz de consulta, controles, antecedentes, historia del peso, hábitos, recordatorio de 24 horas, mediciones, energía/intercambios, cierre y biblioteca de plantillas.
- `src/clinical-workflow`: catálogo MET e intercambios extraídos del Excel y funciones de cálculo/validación compartidas.
- `worker/workflow.ts`: rutas autenticadas y guardado atómico con versiones de consulta, antecedentes, registros y plan. El bloqueo transaccional impide un guardado parcial cuando cambia una versión.
- `migrations/0011_clinical_workflow.sql`: solo crea tablas nuevas.
- `legacy`: copia del servidor y artefactos públicos de la versión activa recuperada, esquema sin datos y huellas de integridad. Ver `legacy/README.md`.

No se recuperaron los archivos TypeScript/TSX originales de la interfaz anterior. Sus artefactos se conservan para no perder ninguna función. El nuevo módulo usa código fuente mantenible y se integra con las rutas y datos existentes. Evitar reescribir o minificar de nuevo los archivos heredados.

## Costos y publicación

La conexión OAuth nativa volvió a funcionar. El permiso actual no permite consultar facturación. **El propietario confirmó el uso del plan gratuito y autorizó la publicación. No activar planes ni servicios de pago sin una autorización específica para ese cambio.** No se habilitaron proveedores de correo, WhatsApp, IA, servicios externos ni nuevos recursos de almacenamiento. El OCR se ejecuta localmente en el navegador.

Para comprobar la sesión nativa con el CLI, omitir la credencial inyectada que el servidor rechazó y usar `XDG_CONFIG_HOME=/workspace/.config` solo en el proceso. Nunca imprimir ni copiar tokens/contraseñas en archivos, Git o chat. El CLI oficial `wrangler auth token` puede usarse en memoria para llamadas autorizadas; no leer archivos de credenciales para descubrir sus valores.

Para futuras actualizaciones dentro de la autorización vigente: respaldar la base de datos de forma privada y verificar la versión activa; aplicar únicamente la migración 0011 en la D1 existente; desplegar el código con `wrangler deploy --config wrangler.jsonc --no-autoconfig`. Conservar los secretos nativos ADMIN_PASSWORD y SESSION_SECRET. Nunca usar scripts anteriores que creen un sitio nuevo o restablezcan la contraseña.

La encuesta previa y las integraciones con Reservo/WhatsApp/Canva quedan diferidas. La biblioteca acepta texto extraído de PDF/TXT con revisión, sin enviar ni prescribir automáticamente. El acceso privado y la comparación fotográfica de la versión previa siguen disponibles. No estimar grasa corporal o centímetros a partir de fotografías sin un método específico validado.

## Demostración HTML autónoma

`npm run preview:html` genera `/workspace/seguimiento-pacientes-demo.html` usando las mismas pantallas y cálculos, con datos ficticios de Juan Prueba. No usa el servidor ni datos reales. Su guardado es temporal en memoria y se reinicia al recargar. Permite probar antecedentes, controles, cálculos, gráficos, cierre y plantillas TXT; PDF/OCR, fotos y sincronización necesitan la versión online. `npm run test:html` comprueba la demostración a 1280 y 390 px y verifica que no haga solicitudes a Internet ni a una API real. Se valida el archivo mediante un servidor HTTP local que solo sirve ese HTML, porque el navegador administrado bloquea navegar directamente a file://. No desactivar esa política para probar.

## Versión publicada

Actualización desplegada y verificada en la misma URL privada. Worker `95e5c394-cd2a-450c-934c-cd621831bc7b`; migración aditiva 0011 aplicada. Compilación y 20 pruebas aprobadas, más 2 comprobaciones del HTML autónomo en su ejecución correspondiente. Login y rutas privadas comprobados mediante HTTPS real. Los datos originales permanecen intactos. Ver docs/estado-implementacion.md.
