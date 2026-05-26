import { useRef, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import { migrarProducto } from "@/lib/proyecto-factory";
import { calcularLTVSuscripcion, proyectarPublicidad, proyectarSuscriptores } from "@/lib/calculo-financiero";
import type { Proyecto } from "@/types/proyecto";

// Paleta de colores por producto (cíclica si hay más de 6)
const COLORES_PRODUCTO = [
  { borde: "border-l-blue-500", chip: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200" },
  { borde: "border-l-emerald-500", chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200" },
  { borde: "border-l-amber-500", chip: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
  { borde: "border-l-purple-500", chip: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200" },
  { borde: "border-l-pink-500", chip: "bg-pink-100 text-pink-900 dark:bg-pink-900/40 dark:text-pink-200" },
  { borde: "border-l-cyan-500", chip: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-200" },
];

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

export default function Paso2Proyeccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarProducto);
  const editar = useProyectoStore((s) => s.editarProducto);
  const eliminar = useProyectoStore((s) => s.eliminarProducto);
  const setTasaCant = useProyectoStore((s) => s.setTasaCrecCantidad);
  const setTasaPrec = useProyectoStore((s) => s.setTasaCrecPrecio);
  const setSuscripcion = useProyectoStore((s) => s.setSuscripcionV2);
  const setPublicidad = useProyectoStore((s) => s.setPublicidadV2);
  const setCostoBeneficio = useProyectoStore((s) => s.setCostoBeneficioV2);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Modelos de ingreso especiales: pantalla propia (el motor recibe el producto
  // portador ya calculado). El modo "unidades × precio" sigue intacto abajo.
  if (proyecto.modeloIngreso === "suscripcion") {
    return <PanelSuscripcion proyecto={proyecto} onChange={setSuscripcion} />;
  }
  if (proyecto.modeloIngreso === "publicidad") {
    return <PanelPublicidad proyecto={proyecto} onChange={setPublicidad} />;
  }
  if (proyecto.modeloIngreso === "costo_beneficio") {
    return <PanelCostoBeneficio proyecto={proyecto} onChange={setCostoBeneficio} />;
  }

  // Estado de colapso: tasas y cada producto (por id). Default: colapsado.
  const [tasasAbierto, setTasasAbierto] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const toggleProducto = (id: string) =>
    setExpandidos((e) => ({ ...e, [id]: !e[id] }));

  const productos = proyecto.productos.map(migrarProducto);
  const tasasCant = proyecto.tasasCrecCantidad ?? [0, 0, 0, 0];
  const tasasPrec = proyecto.tasasCrecPrecio ?? [0, 0, 0, 0];

  const ingresosPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + p.cantidades[i] * p.precios[i], 0)
  );
  const unidadesPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + p.cantidades[i], 0)
  );

  const onKeyEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const input = e.currentTarget;
    const col = input.dataset.col;
    if (!col || !containerRef.current) return;
    const all = Array.from(
      containerRef.current.querySelectorAll<HTMLInputElement>(`input[data-col="${col}"]`)
    );
    const idx = all.indexOf(input);
    const next = all[idx + 1];
    if (next) {
      next.focus();
      next.select();
    }
  };

  /**
   * Edita la cantidad de un año específico.
   * - Si edita año 1 (anio=0) → propaga a años 2-5 usando las tasas vigentes
   *   (con tasa 0%, los siguientes años se igualan al año 1).
   * - Si edita año 2+ → es un override manual: solo cambia ese año.
   */
  const cambiarCantidad = (id: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevas = [...p.cantidades] as [number, number, number, number, number];
    nuevas[anio] = valor;
    if (anio === 0) {
      // Propaga a 1..4 con la tasa de crecimiento actual
      for (let i = 1; i < 5; i++) {
        nuevas[i] = Math.round(nuevas[i - 1] * (1 + (tasasCant[i - 1] ?? 0) / 100));
      }
    }
    editar(id, { cantidades: nuevas });
  };

  const cambiarPrecio = (id: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevos = [...p.precios] as [number, number, number, number, number];
    nuevos[anio] = valor;
    if (anio === 0) {
      for (let i = 1; i < 5; i++) {
        const sinRedondear = nuevos[i - 1] * (1 + (tasasPrec[i - 1] ?? 0) / 100);
        nuevos[i] = Math.round(sinRedondear * 100) / 100;
      }
    }
    editar(id, { precios: nuevos });
  };

  const inputClase =
    "w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs " +
    "focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div ref={containerRef} className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Proyección de demanda
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Las tasas de arriba aplican a <strong>todos los productos por igual</strong>.
            Puedes editar valores individuales en cada celda.{" "}
            <kbd className="rounded bg-secondary px-1 text-[10px]">Enter</kbd> baja a la
            siguiente celda. Click en una celda selecciona el contenido para escribir.
          </p>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-border bg-secondary">
                <th className="p-2 text-left font-semibold w-[200px]">Concepto</th>
                <th className="p-2 text-left font-semibold w-[80px]">Unidad</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-2 text-center font-semibold">
                    Año {a}
                  </th>
                ))}
                <th className="w-8 p-2"></th>
              </tr>
            </thead>
            <tbody>
              {/* SECCIÓN TASAS GLOBALES — encabezado colapsable */}
              <tr
                className="cursor-pointer bg-amber-100/60 hover:bg-amber-100 dark:bg-amber-950/30"
                onClick={() => setTasasAbierto((v) => !v)}
              >
                <td
                  className="border-l-4 border-l-amber-500 p-2 text-[11px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200"
                  colSpan={8}
                >
                  <span className="inline-flex items-center gap-1">
                    {tasasAbierto ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    📈 Tasas de crecimiento (aplican a todos)
                    {!tasasAbierto && (
                      <span className="ml-1 normal-case text-[10px] font-normal opacity-70">
                        — clic para editar
                      </span>
                    )}
                  </span>
                </td>
              </tr>
              {tasasAbierto && (
                <>
                  <tr className="bg-amber-50/60 dark:bg-amber-950/20">
                    <td className="border-l-4 border-l-amber-500 p-1.5 text-[11px]" colSpan={2}>
                      ↳ Cantidad (%)
                    </td>
                    <td className="p-1.5 text-center text-muted-foreground">—</td>
                    {tasasCant.map((t, i) => (
                      <td key={i} className="p-1.5">
                        <input
                          type="number"
                          step="0.5"
                          value={t}
                          onChange={(e) => setTasaCant(i, Number(e.target.value) || 0)}
                          onKeyDown={onKeyEnter}
                          onFocus={selectOnFocus}
                          data-col={`anio-${i + 2}`}
                          className={inputClase}
                        />
                      </td>
                    ))}
                    <td></td>
                  </tr>
                  <tr className="border-b-2 border-border bg-amber-50/60 dark:bg-amber-950/20">
                    <td className="border-l-4 border-l-amber-500 p-1.5 text-[11px]" colSpan={2}>
                      ↳ Precio (%)
                    </td>
                    <td className="p-1.5 text-center text-muted-foreground">—</td>
                    {tasasPrec.map((t, i) => (
                      <td key={i} className="p-1.5">
                        <input
                          type="number"
                          step="0.5"
                          value={t}
                          onChange={(e) => setTasaPrec(i, Number(e.target.value) || 0)}
                          onKeyDown={onKeyEnter}
                          onFocus={selectOnFocus}
                          data-col={`anio-${i + 2}`}
                          className={inputClase}
                        />
                      </td>
                    ))}
                    <td></td>
                  </tr>
                </>
              )}

              {productos.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    Aún no agregaste productos.
                  </td>
                </tr>
              )}

              {productos.map((p, pi) => {
                const color = COLORES_PRODUCTO[pi % COLORES_PRODUCTO.length];
                return (
                  <ProductoFilas
                    key={p.id}
                    prod={p}
                    color={color}
                    productoIndex={pi}
                    abierto={!!expandidos[p.id]}
                    onToggle={() => toggleProducto(p.id)}
                    onChangeNombre={(v) => editar(p.id, { nombre: v })}
                    onChangeUnidad={(v) => editar(p.id, { unidadMedida: v })}
                    onChangeCantidad={(anio, v) => cambiarCantidad(p.id, anio, v)}
                    onChangePrecio={(anio, v) => cambiarPrecio(p.id, anio, v)}
                    onEliminar={() => eliminar(p.id)}
                    onKeyEnter={onKeyEnter}
                    inputClase={inputClase}
                  />
                );
              })}

              {productos.length > 0 && (
                <>
                  <tr className="border-t-4 border-border bg-secondary/60">
                    <td className="p-2 text-xs font-semibold" colSpan={2}>
                      TOTAL UNIDADES
                    </td>
                    {unidadesPorAnio.map((u, i) => (
                      <td key={i} className="p-2 text-right text-xs font-semibold">
                        {u.toLocaleString()}
                      </td>
                    ))}
                    <td></td>
                  </tr>
                  <tr className="bg-primary/15">
                    <td className="p-2 text-sm font-bold" colSpan={2}>
                      TOTAL INGRESOS (Bs)
                    </td>
                    {ingresosPorAnio.map((ing, i) => (
                      <td key={i} className="p-2 text-right text-sm font-bold">
                        {formatearBolivianos(ing)}
                      </td>
                    ))}
                    <td></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => {
            agregar({
              nombre: "Nuevo producto",
              unidadMedida: "und",
              cantidades: [0, 0, 0, 0, 0],
              precios: [0, 0, 0, 0, 0],
            } as any);
            // Abrir automáticamente el producto recién creado para editarlo.
            const lista = useProyectoStore.getState().proyecto?.productos ?? [];
            const nuevo = lista[lista.length - 1];
            if (nuevo) setExpandidos((e) => ({ ...e, [nuevo.id]: true }));
          }}
          className="flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar producto
        </button>
      </div>

      <FichaPedagogica
        titulo="Tasas globales de crecimiento"
        contenido={
          <>
            La <strong>tasa de crecimiento</strong> aplica a <strong>todos los
            productos por igual</strong>. Si la cambias, los años siguientes se
            recalculan en cascada para cada producto.
            <br />
            <br />
            Si quieres que un producto crezca distinto, edita directamente la celda
            del año específico (la tasa global no lo sobrescribirá hasta que la
            cambies de nuevo).
            <br />
            <br />
            <strong>Atajo:</strong> click en una celda{" "}
            <em>selecciona todo el contenido</em>, así escribes y reemplazas
            directamente.{" "}
            <kbd className="rounded bg-secondary/50 px-1 text-[10px]">Enter</kbd>{" "}
            baja a la siguiente celda.
          </>
        }
      />
    </div>
  );
}

function PanelSuscripcion({
  proyecto,
  onChange,
}: {
  proyecto: Proyecto;
  onChange: (
    cambios: Partial<{
      suscriptoresIniciales: number;
      altasMensuales: number;
      churnMensual: number;
      cuotaMensual: number;
    }>
  ) => void;
}) {
  const sus = proyecto.suscripcionV2 ?? {
    suscriptoresIniciales: 100,
    altasMensuales: 20,
    churnMensual: 0.05,
    cuotaMensual: 30,
  };
  const proy = proyectarSuscriptores(sus, 5);
  const ltv = calcularLTVSuscripcion(sus.cuotaMensual, sus.churnMensual);
  const equilibrio = sus.churnMensual > 0 ? sus.altasMensuales / sus.churnMensual : Infinity;

  const inputClase =
    "w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Demanda (modelo de suscripción)
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Aquí no vendes "unidades": tienes una <strong>base de suscriptores</strong> que
            crece con las altas y baja con el churn (los que se van). El ingreso de cada año
            sale de los suscriptores activos × su cuota.
          </p>
        </div>

        {/* 4 parámetros */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <CampoSus label="Suscriptores iniciales" ayuda="Con cuántos arrancas el mes 0." valor={sus.suscriptoresIniciales} sufijo="subs" onChange={(v) => onChange({ suscriptoresIniciales: Math.max(0, Math.round(v)) })} clase={inputClase} />
          <CampoSus label="Altas por mes" ayuda="Nuevos suscriptores que ganas cada mes." valor={sus.altasMensuales} sufijo="subs/mes" onChange={(v) => onChange({ altasMensuales: Math.max(0, Math.round(v)) })} clase={inputClase} />
          <CampoSus label="Churn mensual" ayuda="% de la base que se da de baja cada mes. Típico 2-8%." valor={Math.round(sus.churnMensual * 1000) / 10} sufijo="%" paso={0.5} onChange={(v) => onChange({ churnMensual: Math.max(0, v) / 100 })} clase={inputClase} />
          <CampoSus label="Cuota mensual" ayuda="Lo que paga cada suscriptor por mes." valor={sus.cuotaMensual} sufijo="Bs/mes" onChange={(v) => onChange({ cuotaMensual: Math.max(0, v) })} clase={inputClase} />
        </div>

        {/* Proyección */}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary text-muted-foreground">
              <tr className="border-b-2 border-border">
                <th className="p-2 text-left font-semibold">Concepto</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-2 text-right font-semibold">Año {a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40">
                <td className="p-2">Suscriptores al cierre</td>
                {proy.map((a, i) => (
                  <td key={i} className="p-2 text-right tabular-nums">{Math.round(a.suscriptoresFin).toLocaleString("es-BO")}</td>
                ))}
              </tr>
              <tr className="border-b border-border/40">
                <td className="p-2">Promedio activo (año)</td>
                {proy.map((a, i) => (
                  <td key={i} className="p-2 text-right tabular-nums">{Math.round(a.promedioSuscriptores).toLocaleString("es-BO")}</td>
                ))}
              </tr>
              <tr className="bg-primary/10 font-bold">
                <td className="p-2">Ingreso anual (Bs)</td>
                {proy.map((a, i) => (
                  <td key={i} className="p-2 text-right tabular-nums">{formatearBolivianos(a.ingresoAnual)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Indicadores propios del modelo */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-secondary/20 p-2.5 text-[11px]">
            <div className="font-semibold">LTV (valor de vida del suscriptor)</div>
            <div className="mt-0.5 text-lg font-bold">{isFinite(ltv) ? formatearBolivianos(ltv) : "∞"}</div>
            <div className="text-muted-foreground">= cuota ÷ churn. Cuánto deja en promedio cada suscriptor antes de irse.</div>
          </div>
          <div className="rounded-md border border-border bg-secondary/20 p-2.5 text-[11px]">
            <div className="font-semibold">Techo de la base (equilibrio)</div>
            <div className="mt-0.5 text-lg font-bold">{isFinite(equilibrio) ? `${Math.round(equilibrio).toLocaleString("es-BO")} subs` : "∞"}</div>
            <div className="text-muted-foreground">= altas ÷ churn. Si no subes las altas o bajas el churn, tu base tiende a estabilizarse aquí.</div>
          </div>
        </div>
      </div>

      <FichaPedagogica
        titulo="Modelo de suscripción"
        contenido={
          <>
            En un negocio recurrente lo que importa no es vender una vez, sino{" "}
            <strong>retener</strong>. Dos palancas:
            <ul className="ml-3 mt-1 list-disc">
              <li><strong>Altas:</strong> cuánta gente nueva entra (marketing).</li>
              <li><strong>Churn:</strong> cuánta se va (calidad/retención).</li>
            </ul>
            <br />
            Bajar el churn del 5% al 3% puede más que duplicar tu base de equilibrio. Por eso
            el <strong>LTV</strong> y el <strong>churn</strong> son los números clave aquí, no
            el precio puntual.
          </>
        }
      />
    </div>
  );
}

function PanelPublicidad({
  proyecto,
  onChange,
}: {
  proyecto: Proyecto;
  onChange: (
    cambios: Partial<{
      audienciaMensual: number;
      crecimientoMensual: number;
      impresionesPorUsuario: number;
      cpm: number;
    }>
  ) => void;
}) {
  const pub = proyecto.publicidadV2 ?? {
    audienciaMensual: 10000,
    crecimientoMensual: 0.05,
    impresionesPorUsuario: 4,
    cpm: 40,
  };
  const proy = proyectarPublicidad(pub, 5);
  const inputClase =
    "w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Demanda (modelo de publicidad)
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Aquí no vendes un producto: vendes <strong>espacios a anunciantes</strong>. El
            ingreso depende de tu <strong>audiencia</strong> y del <strong>CPM</strong> (lo
            que pagan por cada 1.000 impresiones).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <CampoSus label="Audiencia (mes 1)" ayuda="Oyentes / visitas / espectadores al inicio." valor={pub.audienciaMensual} sufijo="pers/mes" onChange={(v) => onChange({ audienciaMensual: Math.max(0, Math.round(v)) })} clase={inputClase} />
          <CampoSus label="Crecimiento mensual de audiencia" ayuda="% que crece la audiencia cada mes." valor={Math.round(pub.crecimientoMensual * 1000) / 10} sufijo="%" paso={0.5} onChange={(v) => onChange({ crecimientoMensual: Math.max(0, v) / 100 })} clase={inputClase} />
          <CampoSus label="Anuncios por usuario / mes" ayuda="Cuántas impresiones de anuncio ve cada usuario al mes." valor={pub.impresionesPorUsuario} sufijo="imp" onChange={(v) => onChange({ impresionesPorUsuario: Math.max(0, v) })} clase={inputClase} />
          <CampoSus label="CPM (tarifa por 1.000 imp.)" ayuda="Lo que paga el anunciante por cada 1.000 impresiones." valor={pub.cpm} sufijo="Bs/mil" onChange={(v) => onChange({ cpm: Math.max(0, v) })} clase={inputClase} />
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary text-muted-foreground">
              <tr className="border-b-2 border-border">
                <th className="p-2 text-left font-semibold">Concepto</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-2 text-right font-semibold">Año {a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40">
                <td className="p-2">Audiencia promedio</td>
                {proy.map((a, i) => (
                  <td key={i} className="p-2 text-right tabular-nums">{Math.round(a.audienciaPromedio).toLocaleString("es-BO")}</td>
                ))}
              </tr>
              <tr className="border-b border-border/40">
                <td className="p-2">Impresiones del año</td>
                {proy.map((a, i) => (
                  <td key={i} className="p-2 text-right tabular-nums">{Math.round(a.impresionesAnio).toLocaleString("es-BO")}</td>
                ))}
              </tr>
              <tr className="bg-primary/10 font-bold">
                <td className="p-2">Ingreso anual (Bs)</td>
                {proy.map((a, i) => (
                  <td key={i} className="p-2 text-right tabular-nums">{formatearBolivianos(a.ingresoAnual)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <FichaPedagogica
        titulo="Modelo por publicidad"
        contenido={
          <>
            Tu ingreso = <strong>(audiencia × anuncios ÷ 1.000) × CPM</strong>. Las dos
            palancas son <strong>crecer la audiencia</strong> y subir el <strong>CPM</strong>
            (que mejora con mejor segmentación y nicho).
            <br />
            <br />
            Ojo: con audiencia chica el ingreso es bajo aunque el CPM sea bueno. Por eso al
            inicio se invierte en crecer audiencia aunque aún no sea rentable.
          </>
        }
      />
    </div>
  );
}

function PanelCostoBeneficio({
  proyecto,
  onChange,
}: {
  proyecto: Proyecto;
  onChange: (
    cambios: Partial<{ beneficioAnualBase: number; crecimientoAnual: number }>
  ) => void;
}) {
  const cb = proyecto.costoBeneficioV2 ?? { beneficioAnualBase: 100000, crecimientoAnual: 0.05 };
  const beneficios = [0, 1, 2, 3, 4].map(
    (i) => cb.beneficioAnualBase * Math.pow(1 + cb.crecimientoAnual, i)
  );
  const inputClase =
    "w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Beneficio (modelo costo-beneficio)
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Este proyecto <strong>no vende nada propio</strong> (ej. un plan de marketing
            interno). Su "ingreso" es el <strong>beneficio incremental</strong>: las ventas
            o ahorros adicionales que le genera al negocio. El VAN compara ese beneficio
            contra el costo del plan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <CampoSus label="Beneficio incremental (año 1)" ayuda="Ventas o ahorros ADICIONALES que esperas generar el primer año gracias a este proyecto." valor={cb.beneficioAnualBase} sufijo="Bs/año" paso={1000} onChange={(v) => onChange({ beneficioAnualBase: Math.max(0, v) })} clase={inputClase} />
          <CampoSus label="Crecimiento anual del beneficio" ayuda="% que crece ese beneficio cada año." valor={Math.round(cb.crecimientoAnual * 1000) / 10} sufijo="%" paso={0.5} onChange={(v) => onChange({ crecimientoAnual: Math.max(0, v) / 100 })} clase={inputClase} />
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary text-muted-foreground">
              <tr className="border-b-2 border-border">
                <th className="p-2 text-left font-semibold">Concepto</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-2 text-right font-semibold">Año {a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-primary/10 font-bold">
                <td className="p-2">Beneficio incremental (Bs)</td>
                {beneficios.map((b, i) => (
                  <td key={i} className="p-2 text-right tabular-nums">{formatearBolivianos(b)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-md border border-amber-400/60 bg-amber-50 p-2.5 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          ⓘ El costo del plan se carga en los pasos siguientes (personal, gastos,
          inversión). El proyecto "conviene" si el <strong>VAN sale positivo</strong>: el
          beneficio incremental supera lo que cuesta el plan.
        </div>
      </div>

      <FichaPedagogica
        titulo="Análisis costo-beneficio"
        contenido={
          <>
            No todo proyecto vende algo. Un plan de marketing, una capacitación o una mejora
            interna se justifican por el <strong>beneficio que generan</strong> (más ventas,
            menos costos), comparado con lo que cuestan.
            <br />
            <br />
            Lo difícil aquí es <strong>estimar bien el beneficio incremental</strong>: sé
            conservador. Si aun con una estimación prudente el VAN es positivo, el plan vale
            la pena.
          </>
        }
      />
    </div>
  );
}

function CampoSus({
  label,
  ayuda,
  valor,
  sufijo,
  paso = 1,
  onChange,
  clase,
}: {
  label: string;
  ayuda: string;
  valor: number;
  sufijo: string;
  paso?: number;
  onChange: (v: number) => void;
  clase: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-2">
      <label className="text-[11px] font-medium text-foreground">{label}</label>
      <div className="mt-1 flex items-center gap-1">
        <input type="number" min={0} step={paso} value={valor} onChange={(e) => onChange(Number(e.target.value) || 0)} onFocus={(e) => e.currentTarget.select()} className={clase} />
        <span className="whitespace-nowrap text-[10px] text-muted-foreground">{sufijo}</span>
      </div>
      <p className="mt-1 text-[9px] leading-snug text-muted-foreground">{ayuda}</p>
    </div>
  );
}

function ProductoFilas({
  prod,
  color,
  productoIndex,
  abierto,
  onToggle,
  onChangeNombre,
  onChangeUnidad,
  onChangeCantidad,
  onChangePrecio,
  onEliminar,
  onKeyEnter,
  inputClase,
}: {
  prod: ReturnType<typeof migrarProducto>;
  color: { borde: string; chip: string };
  productoIndex: number;
  abierto: boolean;
  onToggle: () => void;
  onChangeNombre: (v: string) => void;
  onChangeUnidad: (v: string) => void;
  onChangeCantidad: (anio: number, v: number) => void;
  onChangePrecio: (anio: number, v: number) => void;
  onEliminar: () => void;
  onKeyEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputClase: string;
}) {
  return (
    <>
      {/* HEADER del producto — clic para expandir/contraer */}
      <tr className={cn("border-t-4 border-border", color.chip.split(" ")[0])}>
        <td className={cn("border-l-4 p-2", color.borde)} colSpan={abierto ? 1 : 2}>
          <div className="flex min-w-0 items-center gap-1.5">
            <button
              onClick={onToggle}
              className="flex-shrink-0 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
              title={abierto ? "Contraer" : "Expandir para editar"}
            >
              {abierto ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <span
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                color.chip
              )}
            >
              Producto {productoIndex + 1}
            </span>
            {!abierto && (
              <span className="min-w-0 truncate text-xs font-bold">{prod.nombre}</span>
            )}
          </div>
          {abierto && (
            <input
              type="text"
              value={prod.nombre}
              onChange={(e) => onChangeNombre(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              placeholder="Nombre del producto"
              className="mt-1.5 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
        </td>
        {abierto && (
          <td className="p-2">
            <input
              type="text"
              value={prod.unidadMedida}
              onChange={(e) => onChangeUnidad(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              placeholder="taza, kg…"
              className="mt-[26px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </td>
        )}
        {/* Colapsado: muestra el ingreso por año junto al nombre. Expandido: vacío. */}
        {abierto ? (
          <td colSpan={5}></td>
        ) : (
          prod.cantidades.map((c, i) => (
            <td key={i} className="p-1.5 text-right text-xs font-semibold">
              {formatearBolivianos(c * prod.precios[i])}
            </td>
          ))
        )}
        <td className="p-2 align-top">
          <button
            onClick={onEliminar}
            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Eliminar producto"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>

      {abierto && (
        <>
          {/* Cantidad */}
          <tr>
            <td className={cn("border-l-4 p-1.5 text-[11px]", color.borde)} colSpan={2}>
              <span className="pl-3 font-medium">↳ Cantidad</span>
            </td>
            {prod.cantidades.map((c, i) => (
              <td key={i} className="p-1.5">
                <input
                  type="number"
                  value={c}
                  onChange={(e) => onChangeCantidad(i, Number(e.target.value) || 0)}
                  onKeyDown={onKeyEnter}
                  onFocus={(e) => e.currentTarget.select()}
                  data-col={`anio-${i + 1}`}
                  className={inputClase}
                />
              </td>
            ))}
            <td></td>
          </tr>
          {/* Precio */}
          <tr>
            <td className={cn("border-l-4 p-1.5 text-[11px]", color.borde)} colSpan={2}>
              <span className="pl-3 font-medium">↳ Precio (Bs)</span>
            </td>
            {prod.precios.map((pr, i) => (
              <td key={i} className="p-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={pr}
                  onChange={(e) => onChangePrecio(i, Number(e.target.value) || 0)}
                  onKeyDown={onKeyEnter}
                  onFocus={(e) => e.currentTarget.select()}
                  data-col={`anio-${i + 1}`}
                  className={inputClase}
                />
              </td>
            ))}
            <td></td>
          </tr>
          {/* Ingreso */}
          <tr className="bg-secondary/20">
            <td className={cn("border-l-4 p-1.5 text-[11px]", color.borde)} colSpan={2}>
              <span className="pl-3 font-semibold">↳ Ingreso (Bs)</span>
            </td>
            {prod.cantidades.map((c, i) => (
              <td key={i} className="p-1.5 text-right text-xs font-semibold">
                {formatearBolivianos(c * prod.precios[i])}
              </td>
            ))}
            <td></td>
          </tr>
        </>
      )}
    </>
  );
}
