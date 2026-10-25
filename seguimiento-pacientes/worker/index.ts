import published from "../legacy/published-worker.mjs";
import { clinicalApi } from "./workflow";
export default {
  async fetch(req: Request, env: any, ctx: ExecutionContext) {
    if (new URL(req.url).pathname.startsWith("/api/clinical/")) {
      try {
        return await clinicalApi(req, env);
      } catch (e: any) {
        const conflict =
          /CHECK constraint failed|UNIQUE constraint failed/.test(
            e.message || "",
          );
        return Response.json(
          {
            error: conflict
              ? "La información cambió en otra ventana. Recarga antes de guardar."
              : "No se pudo completar la operación. Tus datos no se han confirmado.",
          },
          {
            status: conflict ? 409 : 500,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }
    }
    return published.fetch(req, env);
  },
};
