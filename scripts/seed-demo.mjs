// Seed de datos de demo. Crea 5 estudiantes ficticios bolivianos,
// los inscribe en el curso ADMFIN, asigna proyectos y simulaciones variadas.
// Uso: node scripts/seed-demo.mjs

import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const URL = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_ANON_KEY;

async function api(path, opts = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    apikey: KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : { Authorization: `Bearer ${KEY}` }),
    ...(opts.headers || {}),
  };
  const res = await fetch(`${URL}${path}`, { ...opts, headers });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body, ok: res.ok };
}

const DEMO_PASSWORD = "DemoPro2026!";
const estudiantes = [
  { nombre: "María", apellido: "Quispe", universidad: "UMSS",
    proyecto: { nombre: "Cafetería de altura — Sucre", ubicacion: "Sucre, casco histórico", sector: "servicios",
      ingresoAnual: 1500000, costoAnual: 800000, inversion: 95000 },
    sim: { turno: 25, caja: 145000, ingresosAcum: 412000, utilidadAcum: 95000, reputacion: 0.7, precio_mult: 1.05, demanda_mult: 1.1 } },
  { nombre: "Carlos", apellido: "Mamani", universidad: "UPB",
    proyecto: { nombre: "Restaurante de almuerzos populares", ubicacion: "La Paz, El Alto", sector: "servicios",
      ingresoAnual: 800000, costoAnual: 650000, inversion: 60000 },
    sim: { turno: 18, caja: 52000, ingresosAcum: 230000, utilidadAcum: 28000, reputacion: 0.5, precio_mult: 1.0, demanda_mult: 0.95 } },
  { nombre: "Sofía", apellido: "Vargas", universidad: "UCB",
    proyecto: { nombre: "Tienda online de artesanía boliviana", ubicacion: "Cochabamba (online)", sector: "comercio",
      ingresoAnual: 2100000, costoAnual: 1100000, inversion: 45000 },
    sim: { turno: 35, caja: 290000, ingresosAcum: 875000, utilidadAcum: 240000, reputacion: 0.85, precio_mult: 1.12, demanda_mult: 1.25 } },
  { nombre: "Diego", apellido: "Choque", universidad: "USFX",
    proyecto: { nombre: "Taller mecánico-eléctrico automotriz", ubicacion: "Santa Cruz", sector: "produccion",
      ingresoAnual: 600000, costoAnual: 780000, inversion: 130000 },
    sim: { turno: 8, caja: -12500, ingresosAcum: 78000, utilidadAcum: -42500, reputacion: 0.35, precio_mult: 0.92, demanda_mult: 0.85, estado: "quebrada" } },
  { nombre: "Laura", apellido: "Pereira", universidad: "UMSS",
    proyecto: { nombre: "Panadería tradicional de quinoa", ubicacion: "Cochabamba, zona sur", sector: "produccion",
      ingresoAnual: 480000, costoAnual: 360000, inversion: 35000 },
    sim: { turno: 4, caja: 28500, ingresosAcum: 40000, utilidadAcum: 3500, reputacion: 0.55, precio_mult: 1.0, demanda_mult: 1.0 } },
];

function proyectoCompleto(p) {
  const cantAnual = p.ingresoAnual / 25;
  const insumosUnit = (p.costoAnual * 0.35) / cantAnual;
  return {
    ubicacion: p.ubicacion, descripcion: `Proyecto piloto — ${p.nombre}`, sector: p.sector,
    inversiones: {
      terreno: [],
      obrasCiviles: [{ id: "oc1", descripcion: "Adecuación local", unidadMedida: "obra", cantidad: 1, costoUnitario: p.inversion * 0.4, costoTotal: p.inversion * 0.4, vidaUtilAnios: 20, depreciacionAnual: (p.inversion * 0.4) / 20, valorResidual: p.inversion * 0.4 }],
      maquinaria: [{ id: "mq1", descripcion: "Equipamiento principal", unidadMedida: "set", cantidad: 1, costoUnitario: p.inversion * 0.5, costoTotal: p.inversion * 0.5, vidaUtilAnios: 10, depreciacionAnual: (p.inversion * 0.5) / 10, valorResidual: p.inversion * 0.5 }],
      mobiliario: [{ id: "mb1", descripcion: "Mobiliario", unidadMedida: "set", cantidad: 1, costoUnitario: p.inversion * 0.1, costoTotal: p.inversion * 0.1, vidaUtilAnios: 7, depreciacionAnual: (p.inversion * 0.1) / 7, valorResidual: p.inversion * 0.1 }],
      activoDiferido: [],
    },
    capitalTrabajo: 30000,
    personal: [{ id: "p1", puesto: "Operativo", cantidad: 2, sueldoMensual: 3000 }, { id: "p2", puesto: "Administrativo", cantidad: 1, sueldoMensual: 4500 }],
    costosDirectos: [{ id: "cd1", categoria: "insumo", descripcion: "Insumos principales", unidadMedida: "unidad", cantidadPorUnidad: 1, costoUnitario: insumosUnit }],
    costosAdministracion: [{ id: "ca1", descripcion: "Alquiler", unidadMedida: "mes", cantidad: 1, costoUnitario: 3500 }, { id: "ca2", descripcion: "Servicios básicos", unidadMedida: "mes", cantidad: 1, costoUnitario: 900 }],
    costosComercializacion: [{ id: "cc1", descripcion: "Marketing", unidadMedida: "mes", cantidad: 1, costoUnitario: 600 }],
    imprevistosPorcentaje: 0.05,
    productos: [{ id: "pr1", nombre: "Producto principal", unidadMedida: "unidad", cantidadAnio1: cantAnual, precioVenta: 25 }],
    financiamiento: { porcentajePropio: 0.7, porcentajePrestamo: 0.3, tasaInteresAnual: 0.14, plazoMeses: 48, costoOportunidadAccionista: 0.18 },
    crecimientoIngresosAnual: 0.05, crecimientoCostosAnual: 0.03,
    creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString(),
  };
}

function estadoSim(s) {
  return {
    caja: s.caja, deuda: 30000,
    precio_venta_multiplicador: s.precio_mult, demanda_multiplicador: s.demanda_mult,
    costos_multiplicador: 1, reputacion: s.reputacion,
    ingresos_acumulados: s.ingresosAcum, costos_acumulados: s.ingresosAcum - s.utilidadAcum,
    utilidad_acumulada: s.utilidadAcum,
    ultimo_evento: null, ultima_decision: null, ultimo_feedback: null,
    delta_caja: 0, delta_ingresos: 0,
  };
}

async function main() {
  // Necesitamos un token autenticado para que RLS deje leer el curso.
  // Loguear como el docente (Ronald Martinez).
  console.log("▶ Login como docente");
  const rL = await api("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email: "ui.test.2026@gmail.com", password: "TestPro2025" }),
  });
  if (!rL.ok) { console.error("✗ Login docente falló:", rL.body); process.exit(1); }
  const docenteToken = rL.body.access_token;
  console.log("  ✓ Logueado");

  console.log("▶ Buscando curso ADMFIN");
  const r1 = await api("/rest/v1/cursos?codigo=eq.ADMFIN&select=id,nombre", {}, docenteToken);
  if (!r1.body || r1.body.length === 0) {
    console.error("✗ No se encontró curso ADMFIN. Crea uno con código ADMFIN primero (estado=activo).");
    process.exit(1);
  }
  const curso = r1.body[0];
  console.log(`  ✓ ${curso.nombre} (${curso.id})`);

  for (const est of estudiantes) {
    console.log(`\n--- ${est.nombre} ${est.apellido} (${est.universidad}) ---`);
    const email = `demo.${est.nombre.toLowerCase().replace(/[íáéóú]/g, c => ({í:"i",á:"a",é:"e",ó:"o",ú:"u"}[c]))}.${Date.now()}@gmail.com`;

    const rSignup = await api("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({
        email, password: DEMO_PASSWORD,
        data: { nombre: est.nombre, apellido: est.apellido, rol: "estudiante", universidad: est.universidad },
      }),
    });
    if (!rSignup.ok) { console.error(`  ✗ Signup:`, rSignup.body?.msg || rSignup.body); continue; }
    const userId = rSignup.body.user?.id;
    const token = rSignup.body.access_token;
    if (!userId || !token) { console.error(`  ✗ Sin user/token`); continue; }
    console.log(`  ✓ Signup ${email}`);

    // Inscripción
    const rInsc = await api("/rest/v1/inscripciones", {
      method: "POST",
      body: JSON.stringify({ curso_id: curso.id, estudiante_id: userId }),
    }, token);
    if (!rInsc.ok) console.error(`  ✗ Inscripción:`, rInsc.body); else console.log("  ✓ Inscrito");

    // Proyecto
    const proyectoId = randomUUID();
    const rProy = await api("/rest/v1/proyectos", {
      method: "POST",
      body: JSON.stringify({ id: proyectoId, estudiante_id: userId, curso_id: curso.id, nombre: est.proyecto.nombre, datos: proyectoCompleto(est.proyecto), estado: "completo" }),
    }, token);
    if (!rProy.ok) { console.error(`  ✗ Proyecto:`, rProy.body); continue; }
    console.log(`  ✓ Proyecto: ${est.proyecto.nombre}`);

    // Simulación
    const estado = est.sim.estado || "activa";
    const rSim = await api("/rest/v1/simulaciones", {
      method: "POST",
      body: JSON.stringify({
        proyecto_id: proyectoId, turno_actual: est.sim.turno, turnos_totales: 60,
        frecuencia: "mensual", estado, estado_actual: estadoSim(est.sim),
        finalizada_en: estado !== "activa" ? new Date().toISOString() : null,
      }),
    }, token);
    if (!rSim.ok) console.error(`  ✗ Simulación:`, rSim.body);
    else console.log(`  ✓ Sim turno ${est.sim.turno}/60, estado=${estado}, caja=Bs ${est.sim.caja.toLocaleString()}`);
  }

  console.log("\n✅ Seed completo. Logueate como docente y abre el curso ADMFIN para ver el ranking poblado.");
}

main().catch((e) => { console.error(e); process.exit(1); });
