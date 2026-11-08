import published from "../legacy/published-worker.mjs";
const encoder = new TextEncoder();
const hex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
export async function tokenHash(value: string) {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}
export async function passwordHash(value: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(value),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: encoder.encode(salt),
        iterations: 100000,
      },
      key,
      256,
    ),
  );
}
const json = (data: any, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
async function body(req: Request) {
  if (Number(req.headers.get("Content-Length") || 0) > 4096)
    throw new Error("body");
  const text = await req.text();
  if (text.length > 4096) throw new Error("body");
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("body");
  return parsed;
}
function rewritten(req: Request, password: string) {
  const headers = new Headers(req.headers);
  headers.delete("Content-Length");
  headers.set("Content-Type", "application/json");
  return new Request(new URL("/api/login", req.url), {
    method: "POST",
    headers,
    body: JSON.stringify({ password }),
  });
}
export async function privateAccess(
  req: Request,
  env: any,
  ctx: ExecutionContext,
): Promise<Response | null> {
  const url = new URL(req.url);
  if (url.pathname === "/acceso" && req.method === "GET") return accessPage();
  if (
    !["/api/login", "/api/private-access"].includes(url.pathname) ||
    req.method !== "POST"
  )
    return null;
  if (req.headers.get("Origin") !== url.origin)
    return json({ error: "Origen no autorizado." }, 403);
  if (
    !env.ADMIN_PASSWORD ||
    !env.SESSION_SECRET ||
    env.SESSION_SECRET.length < 32
  )
    return null;
  let input: any;
  try {
    input = await body(req);
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  if (url.pathname === "/api/login") {
    const stored = await env.DB.prepare(
      "SELECT password_hash,password_salt FROM private_access WHERE id=1",
    ).first();
    if (!stored?.password_hash)
      return published.fetch(
        rewritten(
          req,
          typeof input.password === "string" ? input.password : "",
        ),
        env,
      );
    const candidate =
      typeof input.password === "string" && input.password.length <= 256
        ? input.password
        : "";
    return published.fetch(
      rewritten(req, await passwordHash(candidate, stored.password_salt)),
      { ...env, ADMIN_PASSWORD: stored.password_hash },
    );
  }
  const token = typeof input.token === "string" ? input.token : "";
  if (!/^[a-f0-9]{64}$/.test(token))
    return json({ error: "El enlace no es válido o ya venció." }, 401);
  const hash = await tokenHash(token);
  const stored = await env.DB.prepare(
    "SELECT recovery_hash FROM private_access WHERE id=1 AND recovery_hash=? AND recovery_expires>?",
  )
    .bind(hash, Date.now())
    .first();
  if (!stored)
    return json(
      { error: "El enlace no es válido, ya se utilizó o venció." },
      401,
    );
  if (
    typeof input.password !== "string" ||
    input.password.length < 12 ||
    input.password.length > 256
  )
    return json(
      { error: "Elige una contraseña de al menos 12 caracteres." },
      400,
    );
  const salt = crypto.randomUUID();
  const password = await passwordHash(input.password, salt);
  const result = await env.DB.prepare(
    "UPDATE private_access SET password_hash=?,password_salt=?,recovery_hash=NULL,recovery_expires=NULL WHERE id=1 AND recovery_hash=? AND recovery_expires>?",
  )
    .bind(password, salt, hash, Date.now())
    .run();
  if (result.meta.changes !== 1)
    return json({ error: "El enlace ya se utilizó o venció." }, 401);
  const expiry = String(Date.now() + 28800000);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = hex(
    await crypto.subtle.sign("HMAC", key, encoder.encode(expiry)),
  );
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": `clinic_session=${expiry}.${signature}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,
    },
  });
}
function accessPage() {
  const nonce = crypto.randomUUID();
  return new Response(
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tu acceso privado · JC</title><style nonce="${nonce}">*{box-sizing:border-box}body{margin:0;background:#fcf7f9;color:#451b2b;font:17px system-ui;padding:24px}main{max-width:460px;margin:7vh auto;background:white;border:1px solid #ecd0db;border-radius:24px;padding:28px}h1{font-size:25px}label{display:block;margin-top:20px}input[type=password],input[type=text]{display:block;width:100%;font:inherit;padding:12px;border:1px solid #b98094;border-radius:12px;margin-top:8px}button{width:100%;padding:14px;background:#8e183f;color:white;border:0;border-radius:12px;font:inherit;font-weight:600;margin-top:24px}p{line-height:1.5}#message{color:#8e183f}small{color:#765665}</style><main><h1>Tu acceso privado</h1><p>Este enlace reemplaza tu contraseña anterior. Elige una nueva que tú conozcas y entrarás directamente a la app.</p><form><label>Nueva contraseña<input id="password" type="password" autocomplete="new-password" minlength="12" maxlength="256" required></label><label>Repite tu contraseña<input id="repeat" type="password" autocomplete="new-password" required></label><label><input id="show" type="checkbox"> Mostrar contraseña</label><small>Usa al menos 12 caracteres y guárdala en tu gestor de contraseñas.</small><button>Guardar contraseña y entrar</button><p id="message" role="status"></p></form></main><script nonce="${nonce}">
const token=location.hash.slice(1);history.replaceState(null,'','/acceso');
const form=document.querySelector('form'),password=document.querySelector('#password'),repeat=document.querySelector('#repeat'),message=document.querySelector('#message'),button=document.querySelector('button');
if(!/^[a-f0-9]{64}$/.test(token)){message.textContent='Abre el enlace privado completo que recibiste.';button.disabled=true;}
document.querySelector('#show').onchange=e=>{password.type=repeat.type=e.target.checked?'text':'password';};
form.onsubmit=async e=>{e.preventDefault();if(password.value!==repeat.value){message.textContent='Las contraseñas no coinciden.';return;}button.disabled=true;message.textContent='Guardando…';try{const response=await fetch('/api/private-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,password:password.value})});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo completar el acceso.');location.replace('/');}catch(error){message.textContent=error.message;button.disabled=false;}};
</script></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
      },
    },
  );
}
