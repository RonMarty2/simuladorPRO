// ============================================================================
// Edge Function: export-artifact
//
// Exporta los proyectos de un estudiante en formato StudentArtifact estándar
// (definido en C0.Cerebro_contrato) para que WEBAPP los incorpore al
// Proyecto Maestro y al contexto cruzado entre cerebros.
//
// Endpoints:
//   GET /functions/v1/export-artifact?email=user@gmail.com
//     → devuelve StudentArtifact[] (todos los proyectos del estudiante)
//
//   GET /functions/v1/export-artifact?email=user@gmail.com&projectId=uuid
//     → devuelve StudentArtifact (un proyecto específico)
//
// Auth: header X-Webapp-Key con el valor de WEBAPP_API_KEY secret.
// El email es el de Google — el mismo que el estudiante usa en simuladorPRO.
//
// Requiere secrets en Supabase:
//   - WEBAPP_API_KEY          clave compartida con WEBAPP (ver README)
//   - SUPABASE_URL            auto: ya existe en el entorno
//   - SUPABASE_SERVICE_ROLE_KEY  para leer sin RLS
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WEBAPP_API_KEY = Deno.env.get("WEBAPP_API_KEY") ?? "";

const CEREBRO_ID = "simuladorPRO";
const CEREBRO_VERSION = "1.0.0";
const CONTRACT_VERSION = "1.0.0";

// Mapeo de estado del proyecto a porcentaje de completitud estimado
const ESTADO_COMPLETENESS: Record<string, number> = {
  construyendo: 40,
  completo: 80,
  simulando: 90,
  finalizado: 100,
};

Deno.serve(async (req: Request) => {
  // ── CORS para desarrollo local ──────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "X-Webapp-Key, Content-Type",
      },
    });
  }

  // ── Validar API Key ─────────────────────────────────────────────────────
  const apiKey = req.headers.get("X-Webapp-Key") ?? "";
  if (!WEBAPP_API_KEY || apiKey !== WEBAPP_API_KEY) {
    return json({ error: "No autorizado" }, 401);
  }

  // ── Leer parámetros ─────────────────────────────────────────────────────
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.toLowerCase().trim();
  const projectId = url.searchParams.get("projectId") ?? null;

  if (!email) {
    return json({ error: "Parámetro 'email' requerido" }, 400);
  }

  // ── Cliente Supabase con rol de servicio (bypassa RLS) ──────────────────
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // ── Buscar perfil por email ─────────────────────────────────────────────
  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("id, nombre, apellido, universidad")
    .eq("email", email)
    .maybeSingle();

  if (perfilError) {
    return json({ error: "Error al buscar perfil", detail: perfilError.message }, 500);
  }
  if (!perfil) {
    return json({ error: "Estudiante no encontrado en simuladorPRO con ese email" }, 404);
  }

  const estudianteId = perfil.id;

  // ── Construir query de proyectos ────────────────────────────────────────
  let query = supabase
    .from("proyectos")
    .select("id, nombre, descripcion, sector, estado, creado_en, actualizado_en, datos")
    .eq("estudiante_id", estudianteId)
    // Solo proyectos propios del estudiante (no plantillas del docente)
    .in("tipo", ["libre", "entrega_estudiante", "proyecto_grupal"]);

  if (projectId) {
    query = query.eq("id", projectId);
  }

  const { data: proyectos, error: proyectosError } = await query;

  if (proyectosError) {
    return json({ error: "Error al obtener proyectos", detail: proyectosError.message }, 500);
  }
  if (!proyectos || proyectos.length === 0) {
    return json(projectId ? { error: "Proyecto no encontrado" } : [], projectId ? 404 : 200);
  }

  // ── Obtener la última entrega de cada proyecto (para VAN/TIR cacheados) ─
  const proyectoIds = proyectos.map((p: Record<string, unknown>) => p.id);
  const { data: entregas } = await supabase
    .from("entregas")
    .select("proyecto_id, van, tir, wacc, payback, estado, revisado_en")
    .in("proyecto_id", proyectoIds)
    .not("van", "is", null)
    .order("revisado_en", { ascending: false });

  // Agrupar: solo la entrega más reciente con datos por proyecto
  const ultimaEntrega: Record<string, Record<string, unknown>> = {};
  for (const e of (entregas ?? [])) {
    if (!ultimaEntrega[e.proyecto_id as string]) {
      ultimaEntrega[e.proyecto_id as string] = e;
    }
  }

  // ── Mapear a StudentArtifact ────────────────────────────────────────────
  const artifacts = proyectos.map((p: Record<string, unknown>) => {
    const entrega = ultimaEntrega[p.id as string] ?? null;
    const datos = (p.datos ?? {}) as Record<string, unknown>;
    const financiamiento = (datos.financiamiento ?? {}) as Record<string, unknown>;

    // Métricas clave para el panel lateral
    const keyMetrics = [];
    if (entrega?.van !== null && entrega?.van !== undefined) {
      keyMetrics.push({ label: "VAN", value: Math.round(entrega.van as number), unit: "BOB" });
    }
    if (entrega?.tir !== null && entrega?.tir !== undefined) {
      keyMetrics.push({ label: "TIR", value: Number((entrega.tir as number * 100).toFixed(1)), unit: "%" });
    }
    if (entrega?.payback !== null && entrega?.payback !== undefined) {
      keyMetrics.push({ label: "Payback", value: Number((entrega.payback as number).toFixed(1)), unit: "años" });
    }
    if (entrega?.wacc !== null && entrega?.wacc !== undefined) {
      keyMetrics.push({ label: "WACC", value: Number(((entrega.wacc as number) * 100).toFixed(1)), unit: "%" });
    }

    // Contenido estructurado para que WEBAPP lo inserte en el documento
    const content: Record<string, unknown> = {
      nombre_proyecto: p.nombre,
      descripcion: p.descripcion,
      sector: p.sector,
      universidad: perfil.universidad,
      estado_proyecto: p.estado,
      // Finanzas cacheadas de la última entrega revisada
      ...(entrega ? {
        van_bob: entrega.van,
        tir_decimal: entrega.tir,
        wacc_decimal: entrega.wacc,
        payback_anios: entrega.payback,
        entrega_estado: entrega.estado,
      } : {}),
      // Estructura de inversión del proyecto
      financiamiento_porcentaje_propio: financiamiento.porcentajePropio ?? null,
      financiamiento_porcentaje_prestamo: financiamiento.porcentajePrestamo ?? null,
      financiamiento_tasa_anual: financiamiento.tasaInteresAnual ?? null,
    };

    const estadoProyecto = (p.estado as string) ?? "construyendo";
    const completeness = entrega?.estado === "aprobada"
      ? 100
      : ESTADO_COMPLETENESS[estadoProyecto] ?? 40;

    return {
      artifact_id: `${CEREBRO_ID}-${p.id}`,
      contract_version: CONTRACT_VERSION,
      cerebro_id: CEREBRO_ID,
      cerebro_version: CEREBRO_VERSION,

      google_id: email, // usamos el email como identificador universal
      project_id: p.id,
      maestro_id: null, // WEBAPP lo vincula en su lado

      titulo: p.nombre,
      resumen: generarResumen(p, entrega),
      key_metrics: keyMetrics,

      feeds_sections: ["evaluacion_financiera"],
      content,

      status: estadoAStatus(estadoProyecto, entrega),
      completeness_pct: completeness,

      created_at: p.creado_en,
      updated_at: p.actualizado_en,
      approved_at: entrega?.revisado_en ?? null,
    };
  });

  // Si pidieron un proyecto específico, devolver objeto, no array
  if (projectId) {
    return json(artifacts[0] ?? { error: "Proyecto no encontrado" }, artifacts.length ? 200 : 404);
  }

  return json(artifacts, 200);
});

// ── Helpers ────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function generarResumen(
  p: Record<string, unknown>,
  entrega: Record<string, unknown> | null
): string {
  const nombre = p.nombre as string;
  const sector = p.sector as string;
  const estado = p.estado as string;

  if (entrega?.van !== null && entrega?.van !== undefined) {
    const vanK = Math.round((entrega.van as number) / 1000);
    const tirPct = ((entrega.tir as number) * 100).toFixed(1);
    const viabilidad = (entrega.van as number) > 0 ? "viable" : "no viable financieramente";
    return `Proyecto del sector ${sector} (${nombre}). Evaluación financiera: VAN Bs. ${vanK}k, TIR ${tirPct}% — ${viabilidad}.`;
  }

  const estadoTexto: Record<string, string> = {
    construyendo: "en construcción",
    completo: "completo, pendiente de simulación",
    simulando: "en simulación",
    finalizado: "finalizado",
  };
  return `Proyecto del sector ${sector} (${nombre}), actualmente ${estadoTexto[estado] ?? estado}. Sin indicadores financieros calculados aún.`;
}

function estadoAStatus(
  estadoProyecto: string,
  entrega: Record<string, unknown> | null
): "en_progreso" | "completado" | "aprobado" {
  if (entrega?.estado === "aprobada") return "aprobado";
  if (estadoProyecto === "finalizado" || estadoProyecto === "completo") return "completado";
  return "en_progreso";
}
