# Recuperación privada de acceso

El propietario autorizó un enlace temporal de acceso y recuperar una contraseña que conozca. No se elimina la autenticación ni se publican fichas. La contraseña actual de Cloudflare no se lee ni se modifica.

`/acceso#TOKEN` contiene un secreto aleatorio de 256 bits, válido por 24 horas y un solo uso. Se emite desde la CLI autenticada del propietario con `node scripts/private-access-link.mjs --remote`; emitir otro invalida el anterior y conserva la contraseña vigente. El token completo se guarda únicamente en `/tmp/clinic-private-link.txt` y se entrega al propietario. Nunca incluirlo en Git, documentos, capturas ni registros de pruebas. D1 conserva solo su hash SHA-256 y vencimiento.

La página limpia el fragmento de la dirección, usa no-store/no-referrer y CSP sin terceros. El propietario elige una contraseña nueva (mínimo 12 caracteres), la confirma y entra con una cookie HttpOnly/Secure/SameSite. No se transmite la contraseña por chat. La contraseña se almacena con sal aleatoria y PBKDF2-SHA256 (100.000 iteraciones); no se conserva el texto original. El consumo del enlace y cambio de contraseña se hacen en un UPDATE condicional atómico para impedir reutilización y carreras.

La migración 0013 crea una tabla separada de acceso. No modifica fichas, documentos, catálogos ni secretos de Cloudflare. El inicio de sesión habitual adapta la contraseña al hash nuevo y mantiene la comparación y límite de intentos existentes. La contraseña anterior deja de admitirse tras usar el enlace; las sesiones existentes conservan su vencimiento máximo de ocho horas. No retirar esta adaptación al revertir otras funciones, pues la contraseña original sigue en el secreto histórico del Worker.

Validación: 39 pruebas funcionales completas (incluidas dos nuevas de seguridad), más prueba móvil de formulario, fragmento oculto, coincidencia de contraseñas y navegación al entrar. Se verifican expiración, un solo uso, concurrencia, CSRF, rechazo de contraseña anterior, aceptación de la nueva y ausencia de acceso público. Compilación TypeScript/Vite.
