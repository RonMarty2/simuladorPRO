import { useEffect, useState } from "react";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  History,
  MapPin,
  PiggyBank,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  obtenerDetalleProyectoEstudiante,
  type DetalleProyectoEstudiante as Detalle,
} from "@/lib/cursos-supabase";
import { calcularAportesPatronales, calcularWACC, obtenerTasasAportes } from "@/lib/calculo-financiero";
import { formatearBolivianos } from "@/lib/utils";

interface Props {
  cursoId: string;
  estudianteId: string;
  nombreEstudiante: string;
}

export default function DetalleEstudiante({ cursoId, estudianteId, nombreEstudiante }: Props) {
  const [data, setData] = useState<Detalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [verHistorial, setVerHistorial] = useState(false);

  useEffect(() => {
    setCargando(true);
    obtenerDetalleProyectoEstudiante(cursoId, estudianteId)
      .then((d) => setData(d))
      .finally(() => setCargando(false));
  }, [cursoId, estudianteId]);

  if (cargando) {
    return <div className="p-4 text-xs text-muted-foreground">Cargando detalle de {nombreEstudiante}…</div>;
  }
  if (!data) {
    return (
      <div className="rounded border border-dashed border-border p-4 text-xs text-muted-foreground">
        {nombreEstudiante} todavía no creó proyecto.
      </div>
    );
  }

  const p = data.proyecto.datos;
  const inversionTotal =
    Object.values(p.inversiones ?? {})
      .flat()
      .reduce((acc: number, it: any) => acc + (it.costoTotal ?? 0), 0) + (p.capitalTrabajo ?? 0);

  const tasasAportes = obtenerTasasAportes(p.aportesPatronalesOverride);
  const costoPersonalAnual = (p.personal ?? []).reduce(
    (acc: number, pers: any) =>
      acc + calcularAportesPatronales(pers.sueldoMensual, tasasAportes).costoTotalAnual * pers.cantidad,
    0
  );

  const ingresoAnual = (p.productos ?? []).reduce(
    (acc: number, prod: any) => {
      const cant = prod.cantidades?.[0] ?? prod.cantidadAnio1 ?? 0;
      const precio = prod.precios?.[0] ?? prod.precioVenta ?? 0;
      return acc + cant * precio;
    },
    0
  );

  const wacc = p.financiamiento
    ? calcularWACC({
        porcentajeDeuda: p.financiamiento.porcentajePrestamo,
        porcentajeCapital: p.financiamiento.porcentajePropio,
        tasaInteresDeuda: p.financiamiento.tasaInteresAnual,
        costoOportunidadAccionista: p.financiamiento.costoOportunidadAccionista,
        tasaImpuesto: 0.25,
      })
    : 0;

  return (
    <div className="space-y-3 rounded-md border border-border bg-secondary/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Proyecto de {nombreEstudiante}
          </div>
          <div className="text-base font-semibold">{data.proyecto.nombre}</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {p.ubicacion || "Sin ubicación"} · sector {p.sector}
          </div>
        </div>
      </div>

      {p.descripcion && (
        <p className="border-l-2 border-border bg-card/50 px-3 py-2 text-xs italic text-muted-foreground">
          {p.descripcion}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <CeldaMetrica
          icon={<PiggyBank className="h-3.5 w-3.5" />}
          titulo="Inversión total"
          valor={formatearBolivianos(inversionTotal)}
        />
        <CeldaMetrica
          icon={<Briefcase className="h-3.5 w-3.5" />}
          titulo="Ingreso anual proyectado"
          valor={formatearBolivianos(ingresoAnual)}
        />
        <CeldaMetrica
          icon={<Users className="h-3.5 w-3.5" />}
          titulo="Personal"
          valor={`${(p.personal ?? []).reduce((a: number, x: any) => a + x.cantidad, 0)} pers.`}
          sub={`${formatearBolivianos(costoPersonalAnual)}/año`}
        />
        <CeldaMetrica
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          titulo="WACC"
          valor={`${(wacc * 100).toFixed(2)}%`}
          sub={`${Math.round((p.financiamiento?.porcentajePrestamo ?? 0) * 100)}% deuda`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Productos */}
        <div className="rounded border border-border bg-card p-3">
          <div className="mb-2 text-xs font-semibold">Productos / servicios</div>
          {(p.productos ?? []).length === 0 ? (
            <div className="text-[11px] text-muted-foreground">No definidos</div>
          ) : (
            <ul className="space-y-1 text-[11px]">
              {p.productos.map((prod: any) => (
                <li key={prod.id} className="flex justify-between">
                  <span>{prod.nombre}</span>
                  <span className="text-muted-foreground">
                    {(prod.cantidades?.[0] ?? prod.cantidadAnio1 ?? 0).toLocaleString()} × Bs{" "}
                    {prod.precios?.[0] ?? prod.precioVenta ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Personal */}
        <div className="rounded border border-border bg-card p-3">
          <div className="mb-2 text-xs font-semibold">Estructura personal</div>
          {(p.personal ?? []).length === 0 ? (
            <div className="text-[11px] text-muted-foreground">No definido</div>
          ) : (
            <ul className="space-y-1 text-[11px]">
              {p.personal.map((pers: any) => (
                <li key={pers.id} className="flex justify-between">
                  <span>
                    {pers.cantidad}× {pers.puesto}
                  </span>
                  <span className="text-muted-foreground">
                    {formatearBolivianos(pers.sueldoMensual)}/mes
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Simulación actual */}
      {data.simulacion && (
        <div className="rounded border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold">
              Simulación · Turno {data.simulacion.turno_actual}/{data.simulacion.turnos_totales}
              <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px]">
                {data.simulacion.estado}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] md:grid-cols-4">
            <DatoSim label="Caja" valor={formatearBolivianos(data.simulacion.estado_actual?.caja ?? 0)} positivo={(data.simulacion.estado_actual?.caja ?? 0) >= 0} />
            <DatoSim label="Ingresos acum." valor={formatearBolivianos(data.simulacion.estado_actual?.ingresos_acumulados ?? 0)} positivo />
            <DatoSim label="Utilidad acum." valor={formatearBolivianos(data.simulacion.estado_actual?.utilidad_acumulada ?? 0)} positivo={(data.simulacion.estado_actual?.utilidad_acumulada ?? 0) >= 0} />
            <DatoSim label="Reputación" valor={`${((data.simulacion.estado_actual?.reputacion ?? 0) * 100).toFixed(0)}%`} positivo={(data.simulacion.estado_actual?.reputacion ?? 0) >= 0.5} />
          </div>

          {data.historial.length > 0 && (
            <>
              <button
                onClick={() => setVerHistorial((v) => !v)}
                className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <History className="h-3 w-3" />
                {verHistorial ? "Ocultar" : "Ver"} historial de decisiones ({data.historial.length})
                {verHistorial ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {verHistorial && (
                <ul className="mt-2 max-h-60 space-y-1.5 overflow-y-auto border-t border-border pt-2">
                  {data.historial.map((h) => (
                    <li key={h.numero_turno} className="text-[10px]">
                      <div className="font-medium">Turno {h.numero_turno}</div>
                      {h.eventos_aplicados && h.eventos_aplicados.length > 0 ? (
                        <div className="text-muted-foreground">
                          📰 {h.eventos_aplicados[0].titulo}
                          {h.decision_tomada && (
                            <div className="ml-3 italic">→ Opción {h.decision_tomada.opcion?.letra}: {h.decision_tomada.opcion?.texto}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">— mes tranquilo</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CeldaMetrica({
  icon,
  titulo,
  valor,
  sub,
}: {
  icon: React.ReactNode;
  titulo: string;
  valor: string;
  sub?: string;
}) {
  return (
    <div className="rounded border border-border bg-card p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {titulo}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{valor}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function DatoSim({ label, valor, positivo }: { label: string; valor: string; positivo: boolean }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className={`font-medium ${positivo ? "" : "text-destructive"}`}>{valor}</div>
    </div>
  );
}
