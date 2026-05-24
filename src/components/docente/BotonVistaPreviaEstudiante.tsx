import { useEffect, useState } from "react";
import { Eye, X, Check, CircleDashed } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { vaciarPasosDesde } from "@/lib/proyecto-supabase";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { Proyecto } from "@/types/proyecto";

const PASOS = [
  { n: 1, label: "Datos generales" },
  { n: 2, label: "Demanda y precios" },
  { n: 3, label: "Inversiones fijas" },
  { n: 4, label: "Personal" },
  { n: 5, label: "Costos directos" },
  { n: 6, label: "Gastos operativos" },
  { n: 7, label: "Financiamiento" },
  { n: 8, label: "Capital de trabajo" },
  { n: 9, label: "Resumen (solo simula)" },
];

/**
 * Botón que abre un modal mostrando cómo se verá el caso del curso
 * para un estudiante: qué pasos llegan llenos, qué pasos están vacíos.
 *
 * Solo es visible si el usuario es docente y el proyecto activo es del
 * tipo 'caso_curso' (ya guardado como caso) — porque sin paso_inicio
 * no tiene sentido mostrar la preview.
 */
export default function BotonVistaPreviaEstudiante() {
  const perfil = useAuthStore((s) => s.perfil);
  const proyecto = useProyectoStore((s) => s.proyecto);
  const [abierto, setAbierto] = useState(false);

  if (perfil?.rol !== "docente" || !proyecto) return null;

  // Solo tiene sentido mostrar este botón si el proyecto ya fue guardado
  // como caso del curso (sabemos paso_inicio_estudiante).
  if (proyecto.tipo !== "caso_curso") return null;

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1.5 rounded-md border border-sky-400 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-900 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100"
        title="Ver qué llega lleno y qué vacío al estudiante (sin necesidad de otra cuenta)"
      >
        <Eye className="h-3.5 w-3.5" />
        Ver como estudiante
      </button>

      {abierto && <ModalVistaPrevia onCerrar={() => setAbierto(false)} />}
    </>
  );
}

function ModalVistaPrevia({ onCerrar }: { onCerrar: () => void }) {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const [vistaEstudiante, setVistaEstudiante] = useState<Proyecto | null>(null);

  useEffect(() => {
    const pasoInicio = proyecto.paso_inicio_estudiante ?? 1;
    setVistaEstudiante(vaciarPasosDesde(proyecto, pasoInicio));
  }, [proyecto]);

  if (!vistaEstudiante) return null;

  const pasoInicio = proyecto.paso_inicio_estudiante ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-base font-semibold">
              👁️ Vista previa: así verá tu estudiante el caso
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              "{proyecto.nombre}" · El estudiante empieza a trabajar desde el{" "}
              <strong>paso {pasoInicio}</strong>.
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-md p-1 hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {PASOS.map((paso) => {
            const llega = paso.n < pasoInicio || paso.n === 9; // 9 siempre es derivado
            return (
              <PasoPreview
                key={paso.n}
                numero={paso.n}
                label={paso.label}
                llega={llega}
                proyecto={vistaEstudiante}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-secondary/30 p-3 text-[11px] text-muted-foreground">
          <strong className="text-foreground">💡 Esto es solo una vista.</strong>{" "}
          No afecta a estudiantes que ya tomaron el caso. Para validar el flujo
          completo de entrega/revisión necesitarías una cuenta de estudiante real
          (ventana incógnito).
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-3">
          <button
            onClick={onCerrar}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function PasoPreview({
  numero,
  label,
  llega,
  proyecto,
}: {
  numero: number;
  label: string;
  llega: boolean;
  proyecto: Proyecto;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        llega
          ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20"
          : "border-sky-300 bg-sky-50/50 dark:border-sky-700 dark:bg-sky-950/20"
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
            llega
              ? "bg-emerald-500 text-white"
              : "bg-sky-500 text-white"
          )}
        >
          {llega ? <Check className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">
              Paso {numero} · {label}
            </span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                llega
                  ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
                  : "bg-sky-200 text-sky-900 dark:bg-sky-900 dark:text-sky-100"
              )}
            >
              {llega ? "✓ Llega armado" : "El estudiante completa"}
            </span>
          </div>

          {/* Contenido específico por paso */}
          <div className="mt-1.5 text-[11px] text-muted-foreground">
            {llega ? (
              <ContenidoPasoLleno numero={numero} proyecto={proyecto} />
            ) : (
              <span className="italic">
                El estudiante deberá completar este paso.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContenidoPasoLleno({ numero, proyecto }: { numero: number; proyecto: Proyecto }) {
  switch (numero) {
    case 1:
      return (
        <ul className="space-y-0.5">
          <li><strong>Sector:</strong> {proyecto.sector}</li>
          <li><strong>Ubicación:</strong> {proyecto.ubicacion || "(vacío)"}</li>
          <li><strong>Descripción:</strong> {proyecto.descripcion || "(vacío)"}</li>
        </ul>
      );
    case 2:
      if (proyecto.productos.length === 0)
        return <span>Sin productos definidos.</span>;
      return (
        <ul className="space-y-0.5">
          {proyecto.productos.map((p, i) => (
            <li key={i}>
              <strong>{p.nombre}</strong> ({p.unidadMedida}) ·
              Año 1: {p.cantidades[0]} unid × {formatearBolivianos(p.precios[0])}
            </li>
          ))}
        </ul>
      );
    case 3: {
      const items = Object.values(proyecto.inversiones).flat();
      if (items.length === 0) return <span>Sin inversiones definidas.</span>;
      const total = items.reduce((s, it) => s + it.costoTotal, 0);
      return (
        <div>
          <div>{items.length} items por un total de <strong>{formatearBolivianos(total)}</strong></div>
        </div>
      );
    }
    case 4:
      if (proyecto.personal.length === 0) return <span>Sin personal definido.</span>;
      return (
        <ul className="space-y-0.5">
          {proyecto.personal.map((p, i) => (
            <li key={i}>
              <strong>{p.puesto}</strong> · {p.cantidad} {p.cantidad === 1 ? "persona" : "personas"} · {formatearBolivianos(p.sueldoMensual)}/mes
            </li>
          ))}
        </ul>
      );
    case 5:
      if (proyecto.costosDirectos.length === 0)
        return <span>Sin costos directos definidos.</span>;
      return <div>{proyecto.costosDirectos.length} costos directos por producto definidos.</div>;
    case 6: {
      const totalAdmin = (proyecto.costosAdministracion ?? []).length;
      const totalComerc = (proyecto.costosComercializacion ?? []).length;
      return (
        <div>
          {totalAdmin} gastos administrativos · {totalComerc} gastos de comercialización · Imprevistos {(proyecto.imprevistosPorcentaje * 100).toFixed(1)}%
        </div>
      );
    }
    case 7: {
      const f = proyecto.financiamiento;
      return (
        <ul className="space-y-0.5">
          <li>Préstamo activo: {(f.porcentajePrestamo * 100).toFixed(0)}% · tasa {(f.tasaInteresAnual * 100).toFixed(2)}% · {f.plazoMeses} meses</li>
          <li>Costo oportunidad (Koa): {(f.costoOportunidadAccionista * 100).toFixed(2)}%</li>
        </ul>
      );
    }
    case 8:
      return (
        <div>
          Buffer de {proyecto.mesesBufferCapitalTrabajo ?? 3} meses · Capital de trabajo {formatearBolivianos(proyecto.capitalTrabajo)}
        </div>
      );
    case 9:
      return (
        <span className="italic">
          Se calcula automáticamente. El estudiante ve los indicadores (VAN, TIR, etc.) y puede entregar para revisión.
        </span>
      );
    default:
      return null;
  }
}
