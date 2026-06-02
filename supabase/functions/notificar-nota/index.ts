// ============================================================================
// Edge Function: notificar-nota
//
// Envía un email al estudiante cuando el docente califica una de sus entregas.
// Se dispara por un Database Webhook de Supabase sobre UPDATE de `entregas`.
//
// Requiere 3 secrets configurados en el proyecto (ver README de la carpeta):
//   - RESEND_API_KEY      (cuenta gratis en https://resend.com)
//   - SUPABASE_URL        (auto: ya existe en el entorno del proyecto)
//   - SUPABASE_SERVICE_ROLE_KEY (para leer el email del perfil sin RLS)
//
// Solo envía si la entrega pasó de 'pendiente' a 'aprobada'/'reprobada' y
// tiene nota — así no manda emails por cambios irrelevantes.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
// Remitente: usá un dominio verificado en Resend, o el sandbox de pruebas
// onboarding@resend.dev mientras configurás tu dominio.
const FROM = Deno.env.get("EMAIL_FROM") ?? "Simulador <onboarding@resend.dev>";

const PASO_NOMBRES: Record<number, string> = {
  1: "Datos generales",
  2: "Proyección de demanda",
  3: "Inversiones en activo fijo",
  4: "Personal",
  5: "Costos directos",
  6: "Gastos operativos",
  7: "Financiamiento",
  8: "Capital de trabajo",
  9: "Resumen y flujo de caja",
};

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record ?? {};
    const old = payload.old_record ?? {};

    // Solo nos interesa cuando ACABA de calificarse (antes pendiente, ahora no)
    // y hay nota numérica.
    const ahoraCalificada =
      (record.estado === "aprobada" || record.estado === "reprobada") &&
      record.nota !== null &&
      record.nota !== undefined;
    const antesPendiente = old.estado === "pendiente" || old.nota === null || old.nota === undefined;
    if (!ahoraCalificada || !antesPendiente) {
      return new Response(JSON.stringify({ skip: "no es una calificación nueva" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY no configurada" }), { status: 500 });
    }

    // Cliente admin para leer el email del perfil sin RLS.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: perfil } = await admin
      .from("perfiles")
      .select("email, nombre")
      .eq("id", record.estudiante_id)
      .maybeSingle();

    if (!perfil?.email) {
      return new Response(JSON.stringify({ skip: "sin email del estudiante" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const aprobada = record.estado === "aprobada";
    const paso = record.paso_entregado
      ? `Etapa ${record.paso_entregado} (${PASO_NOMBRES[record.paso_entregado] ?? ""})`
      : "tu proyecto";
    const color = aprobada ? "#059669" : "#dc2626";
    const titulo = aprobada ? "✅ Entrega aprobada" : "📝 Entrega revisada";
    const comentario = record.comentario_docente
      ? `<p style="margin:16px 0;padding:12px;background:#f8fafc;border-radius:8px;font-size:14px;color:#334155">
           <strong>Comentario del docente:</strong><br/>${escapeHtml(record.comentario_docente)}
         </p>`
      : "";

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:${color};margin:0 0 4px">${titulo}</h2>
        <p style="font-size:14px;color:#475569;margin:0 0 16px">
          Hola ${escapeHtml(perfil.nombre ?? "")}, tu docente revisó ${paso}.
        </p>
        <div style="text-align:center;padding:20px;background:#f1f5f9;border-radius:12px;margin:16px 0">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b">Nota</div>
          <div style="font-size:40px;font-weight:800;color:${color}">${record.nota}/100</div>
        </div>
        ${comentario}
        <p style="font-size:13px;color:#64748b;margin-top:20px">
          Entrá a la plataforma para ver el detalle y, si necesitás, corregir y re-entregar.
        </p>
      </div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: perfil.email,
        subject: `${titulo} — ${record.nota}/100`,
        html,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: "Resend falló", detalle: txt }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true, enviado_a: perfil.email }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}
