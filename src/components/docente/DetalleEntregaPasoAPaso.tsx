import { useState, Fragment } from "react";
import type { Proyecto, ItemInversion } from "@/types/proyecto";
import { formatearBolivianos, cn } from "@/lib/utils";

interface Props {
  proyecto: Proyecto;
  /** Si la entrega es de un paso específico (1..9), ese paso se abre por defecto. */
  pasoEntregado?: number | null;
}

const TITULOS: Record<number, string> = {
  1: "Datos generales",
  2: "Proyección de demanda",
  3: "Inversiones en activo fijo",
  4: "Personal + aportes patronales",
  5: "Costos directos de producción",
  6: "Gastos administrativos y comercialización",
  7: "Financiamiento + WACC",
  8: "Capital de trabajo",
  9: "Resumen y flujo de caja",
};

const ICONOS: Record<number, string> = {
  1: "📝",
  2: "📈",
  3: "🏗",
  4: "👥",
  5: "🧱",
  6: "🏢",
  7: "🏦",
  8: "💧",
  9: "📊",
};

export default function DetalleEntregaPasoAPaso({ proyecto, pasoEntregado }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Ver paso a paso · todo lo que llenó el estudiante
      </div>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((paso) => (
        <PasoAccordion
          key={paso}
          paso={paso}
          proyecto={proyecto}
          defaultOpen={pasoEntregado === paso}
          esEntregado={pasoEntregado === paso}
        />
      ))}
    </div>
  );
}

function PasoAccordion({
  paso,
  proyecto,
  defaultOpen,
  esEntregado,
}: {
  paso: number;
  proyecto: Proyecto;
  defaultOpen: boolean;
  esEntregado: boolean;
}) {
  const [abierto, setAbierto] = useState(defaultOpen);
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border transition",
        esEntregado
          ? "border-amber-400 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20"
          : "border-border bg-card"
      )}
    >
      <button
        onClick={() => setAbierto(!abierto)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition hover:bg-secondary/40",
          esEntregado && "hover:bg-amber-100/50"
        )}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm">{ICONOS[paso]}</span>
          <span className="font-bold text-foreground">Etapa {paso}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-medium">{TITULOS[paso]}</span>
          {esEntregado && (
            <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-950">
              Esta entrega
            </span>
          )}
        </span>
        <span className="text-[10px] text-muted-foreground">{abierto ? "▾ ocultar" : "▸ ver"}</span>
      </button>
      {abierto && (
        <div className="border-t border-border bg-background/60 p-3">
          <ContenidoPaso paso={paso} proyecto={proyecto} />
        </div>
      )}
    </div>
  );
}

function ContenidoPaso({ paso, proyecto }: { paso: number; proyecto: Proyecto }) {
  switch (paso) {
    case 1: return <Paso1 p={proyecto} />;
    case 2: return <Paso2 p={proyecto} />;
    case 3: return <Paso3 p={proyecto} />;
    case 4: return <Paso4 p={proyecto} />;
    case 5: return <Paso5 p={proyecto} />;
    case 6: return <Paso6 p={proyecto} />;
    case 7: return <Paso7 p={proyecto} />;
    case 8: return <Paso8 p={proyecto} />;
    case 9: return <Paso9 p={proyecto} />;
    default: return null;
  }
}

// ============================================================================
// HELPERS DE PRESENTACIÓN
// ============================================================================

function Campo({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</span>
      <span className="text-xs">{v ?? <em className="text-muted-foreground">—</em>}</span>
    </div>
  );
}

function GridCampos({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}

function VacioMsg({ msg }: { msg: string }) {
  return <div className="rounded-md border border-dashed border-border p-2 text-center text-[11px] italic text-muted-foreground">{msg}</div>;
}

function TablaWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">{children}</table>
    </div>
  );
}

function Th({ children, alinear }: { children: React.ReactNode; alinear?: "right" | "center" }) {
  return (
    <th
      className={cn(
        "border-b border-border bg-secondary/40 px-2 py-1.5 font-semibold text-muted-foreground",
        alinear === "right" ? "text-right" : alinear === "center" ? "text-center" : "text-left"
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, alinear, bold }: { children: React.ReactNode; alinear?: "right" | "center"; bold?: boolean }) {
  return (
    <td
      className={cn(
        "border-b border-border/60 px-2 py-1",
        alinear === "right" ? "text-right tabular-nums" : alinear === "center" ? "text-center" : "text-left",
        bold && "font-semibold"
      )}
    >
      {children}
    </td>
  );
}

// ============================================================================
// PASO 1 — Datos generales
// ============================================================================
function Paso1({ p }: { p: Proyecto }) {
  const version = p.version === "v2" ? "Con análisis de riesgo" : "Clásico";
  const modelo = p.modeloIngreso ?? "unidades";
  const modeloLabel: Record<string, string> = {
    unidades: "Unidades × precio",
    suscripcion: "Suscripción",
    publicidad: "Publicidad",
    costo_beneficio: "Costo-beneficio",
  };
  return (
    <div className="space-y-3">
      <GridCampos>
        <Campo k="Nombre" v={p.nombre} />
        <Campo k="Ubicación" v={p.ubicacion} />
        <Campo k="Sector" v={p.sector} />
        <Campo k="Versión" v={version} />
        <Campo k="Modelo de ingreso" v={modeloLabel[modelo]} />
      </GridCampos>
      {p.descripcion && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Descripción</div>
          <div className="mt-0.5 whitespace-pre-wrap text-xs">{p.descripcion}</div>
        </div>
      )}
      {modelo === "suscripcion" && p.suscripcionV2 && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Parámetros suscripción</div>
          <GridCampos>
            <Campo k="Suscriptores iniciales" v={p.suscripcionV2.suscriptoresIniciales} />
            <Campo k="Altas mensuales" v={p.suscripcionV2.altasMensuales} />
            <Campo k="Churn mensual" v={`${(p.suscripcionV2.churnMensual * 100).toFixed(2)}%`} />
            <Campo k="Cuota mensual" v={formatearBolivianos(p.suscripcionV2.cuotaMensual)} />
          </GridCampos>
        </div>
      )}
      {modelo === "publicidad" && p.publicidadV2 && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Parámetros publicidad</div>
          <GridCampos>
            <Campo k="Audiencia mensual" v={p.publicidadV2.audienciaMensual.toLocaleString("es-BO")} />
            <Campo k="Crecimiento mensual" v={`${(p.publicidadV2.crecimientoMensual * 100).toFixed(2)}%`} />
            <Campo k="Impresiones por usuario" v={p.publicidadV2.impresionesPorUsuario} />
            <Campo k="CPM (Bs)" v={formatearBolivianos(p.publicidadV2.cpm)} />
          </GridCampos>
        </div>
      )}
      {modelo === "costo_beneficio" && p.costoBeneficioV2 && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Parámetros costo-beneficio</div>
          <GridCampos>
            <Campo k="Beneficio anual base" v={formatearBolivianos(p.costoBeneficioV2.beneficioAnualBase)} />
            <Campo k="Crecimiento anual" v={`${(p.costoBeneficioV2.crecimientoAnual * 100).toFixed(2)}%`} />
          </GridCampos>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PASO 2 — Proyección de demanda (productos por año)
// ============================================================================
function Paso2({ p }: { p: Proyecto }) {
  if (!p.productos || p.productos.length === 0) {
    return <VacioMsg msg="No cargó productos." />;
  }
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Productos · cantidades y precios por año
        </div>
        <TablaWrap>
          <thead>
            <tr>
              <Th>Producto</Th>
              <Th>Unidad</Th>
              {[1, 2, 3, 4, 5].map((a) => (
                <Th key={a} alinear="right">Año {a}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.productos.map((prod) => (
              <Fragment key={prod.id}>
                <tr>
                  <Td bold>{prod.nombre}</Td>
                  <Td>{prod.unidadMedida}</Td>
                  {prod.cantidades.map((c, i) => (
                    <Td key={i} alinear="right">{c.toLocaleString("es-BO")}</Td>
                  ))}
                </tr>
                <tr>
                  <Td>
                    <span className="text-[10px] italic text-muted-foreground">↳ precio</span>
                  </Td>
                  <Td>Bs</Td>
                  {prod.precios.map((pr, i) => (
                    <Td key={i} alinear="right">{formatearBolivianos(pr)}</Td>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </TablaWrap>
      </div>

      {(p.tasasCrecCantidad || p.tasasCrecPrecio) && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tasas de crecimiento (de un año al siguiente)
          </div>
          <TablaWrap>
            <thead>
              <tr>
                <Th>Tasa</Th>
                <Th alinear="right">1 → 2</Th>
                <Th alinear="right">2 → 3</Th>
                <Th alinear="right">3 → 4</Th>
                <Th alinear="right">4 → 5</Th>
              </tr>
            </thead>
            <tbody>
              {p.tasasCrecCantidad && (
                <tr>
                  <Td bold>Cantidad</Td>
                  {p.tasasCrecCantidad.map((t, i) => (
                    <Td key={i} alinear="right">{`${t.toFixed(1)}%`}</Td>
                  ))}
                </tr>
              )}
              {p.tasasCrecPrecio && (
                <tr>
                  <Td bold>Precio</Td>
                  {p.tasasCrecPrecio.map((t, i) => (
                    <Td key={i} alinear="right">{`${t.toFixed(1)}%`}</Td>
                  ))}
                </tr>
              )}
            </tbody>
          </TablaWrap>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PASO 3 — Inversiones (5 categorías)
// ============================================================================
function Paso3({ p }: { p: Proyecto }) {
  const cats: { key: keyof Proyecto["inversiones"]; titulo: string }[] = [
    { key: "terreno", titulo: "Terreno" },
    { key: "obrasCiviles", titulo: "Obras civiles" },
    { key: "maquinaria", titulo: "Maquinaria y equipo" },
    { key: "mobiliario", titulo: "Mobiliario y equipo de oficina" },
    { key: "activoDiferido", titulo: "Activo diferido" },
  ];
  const totalGeneral = cats.reduce(
    (acc, c) =>
      acc + (p.inversiones?.[c.key] ?? []).reduce((s: number, i: ItemInversion) => s + (i.costoTotal ?? 0), 0),
    0
  );
  const algunaCategoria = cats.some((c) => (p.inversiones?.[c.key] ?? []).length > 0);
  if (!algunaCategoria) return <VacioMsg msg="No cargó ninguna inversión." />;
  return (
    <div className="space-y-3">
      {cats.map((c) => {
        const items = p.inversiones?.[c.key] ?? [];
        if (items.length === 0) return null;
        const subtotal = items.reduce((s, i) => s + (i.costoTotal ?? 0), 0);
        return (
          <div key={c.key}>
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{c.titulo}</div>
              <div className="text-[11px] font-bold">{formatearBolivianos(subtotal)}</div>
            </div>
            <TablaWrap>
              <thead>
                <tr>
                  <Th>Descripción</Th>
                  <Th>Unidad</Th>
                  <Th alinear="right">Cant.</Th>
                  <Th alinear="right">Costo unit.</Th>
                  <Th alinear="right">Costo total</Th>
                  <Th alinear="right">Vida útil</Th>
                  <Th alinear="right">Deprec. anual</Th>
                  <Th alinear="right">Valor residual</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <Td bold>{i.descripcion}</Td>
                    <Td>{i.unidadMedida}</Td>
                    <Td alinear="right">{i.cantidad}</Td>
                    <Td alinear="right">{formatearBolivianos(i.costoUnitario)}</Td>
                    <Td alinear="right">{formatearBolivianos(i.costoTotal)}</Td>
                    <Td alinear="right">{i.vidaUtilAnios ?? "—"}</Td>
                    <Td alinear="right">{formatearBolivianos(i.depreciacionAnual)}</Td>
                    <Td alinear="right">{formatearBolivianos(i.valorResidual)}</Td>
                  </tr>
                ))}
              </tbody>
            </TablaWrap>
          </div>
        );
      })}
      <div className="flex justify-between border-t-2 border-foreground/20 pt-2 text-sm font-bold">
        <span>TOTAL INVERSIONES</span>
        <span className="tabular-nums">{formatearBolivianos(totalGeneral)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// PASO 4 — Personal
// ============================================================================
function Paso4({ p }: { p: Proyecto }) {
  if (!p.personal || p.personal.length === 0) return <VacioMsg msg="No cargó personal." />;
  const totalMensual = p.personal.reduce((s, x) => s + (x.cantidad * x.sueldoMensual), 0);
  const totalAnualBase = totalMensual * 12;
  const ov = p.aportesPatronalesOverride;
  return (
    <div className="space-y-3">
      <TablaWrap>
        <thead>
          <tr>
            <Th>Puesto</Th>
            <Th alinear="right">Cant.</Th>
            <Th alinear="right">Sueldo mensual</Th>
            <Th alinear="right">Total mensual</Th>
            <Th alinear="right">Total anual (×12)</Th>
          </tr>
        </thead>
        <tbody>
          {p.personal.map((x) => (
            <tr key={x.id}>
              <Td bold>{x.puesto}</Td>
              <Td alinear="right">{x.cantidad}</Td>
              <Td alinear="right">{formatearBolivianos(x.sueldoMensual)}</Td>
              <Td alinear="right">{formatearBolivianos(x.cantidad * x.sueldoMensual)}</Td>
              <Td alinear="right">{formatearBolivianos(x.cantidad * x.sueldoMensual * 12)}</Td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-foreground/20 font-bold">
            <Td bold>TOTAL</Td>
            <Td alinear="right">—</Td>
            <Td alinear="right">—</Td>
            <Td alinear="right" bold>{formatearBolivianos(totalMensual)}</Td>
            <Td alinear="right" bold>{formatearBolivianos(totalAnualBase)}</Td>
          </tr>
        </tfoot>
      </TablaWrap>
      <div className="text-[10px] text-muted-foreground">
        Anual sin contar aportes patronales (riesgo prof, salud, vivienda, aguinaldo, indemnización).
      </div>
      {ov && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tasas patronales personalizadas (override)
          </div>
          <GridCampos>
            {ov.riesgoProfesional !== undefined && <Campo k="Riesgo prof." v={`${(ov.riesgoProfesional * 100).toFixed(2)}%`} />}
            {ov.seguroSalud !== undefined && <Campo k="Seguro salud" v={`${(ov.seguroSalud * 100).toFixed(2)}%`} />}
            {ov.provisionVivienda !== undefined && <Campo k="Provisión vivienda" v={`${(ov.provisionVivienda * 100).toFixed(2)}%`} />}
            {ov.previsionAguinaldo !== undefined && <Campo k="Aguinaldo" v={`${(ov.previsionAguinaldo * 100).toFixed(2)}%`} />}
            {ov.previsionIndemnizacion !== undefined && <Campo k="Indemnización" v={`${(ov.previsionIndemnizacion * 100).toFixed(2)}%`} />}
          </GridCampos>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PASO 5 — Costos directos
// ============================================================================
function Paso5({ p }: { p: Proyecto }) {
  if (!p.costosDirectos || p.costosDirectos.length === 0) {
    return <VacioMsg msg="No cargó costos directos." />;
  }
  const nombreProducto = (id: string | null | undefined) =>
    (p.productos ?? []).find((x) => x.id === id)?.nombre ?? <em className="text-muted-foreground">general</em>;
  return (
    <TablaWrap>
      <thead>
        <tr>
          <Th>Categoría</Th>
          <Th>Producto</Th>
          <Th>Descripción</Th>
          <Th>Unidad</Th>
          <Th alinear="right">Cant. por unidad</Th>
          <Th alinear="right">Costo unitario</Th>
          <Th alinear="right">Costo / unidad de producto</Th>
        </tr>
      </thead>
      <tbody>
        {p.costosDirectos.map((c) => (
          <tr key={c.id}>
            <Td>{c.categoria}</Td>
            <Td>{nombreProducto(c.productoId)}</Td>
            <Td bold>{c.descripcion}</Td>
            <Td>{c.unidadMedida}</Td>
            <Td alinear="right">{c.cantidadPorUnidad}</Td>
            <Td alinear="right">{formatearBolivianos(c.costoUnitario)}</Td>
            <Td alinear="right">{formatearBolivianos(c.cantidadPorUnidad * c.costoUnitario)}</Td>
          </tr>
        ))}
      </tbody>
    </TablaWrap>
  );
}

// ============================================================================
// PASO 6 — Gastos administración + comercialización
// ============================================================================
function Paso6({ p }: { p: Proyecto }) {
  const renderTabla = (titulo: string, items: typeof p.costosAdministracion) => {
    if (!items || items.length === 0) return null;
    const totalAnual = items.reduce((s, i) => {
      const total = i.cantidad * i.costoUnitario;
      return s + (i.unidadMedida === "mes" ? total * 12 : total);
    }, 0);
    return (
      <div>
        <div className="mb-1 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</div>
          <div className="text-[11px] font-bold">{formatearBolivianos(totalAnual)} / año</div>
        </div>
        <TablaWrap>
          <thead>
            <tr>
              <Th>Descripción</Th>
              <Th>Unidad medida</Th>
              <Th alinear="right">Cantidad</Th>
              <Th alinear="right">Costo unit.</Th>
              <Th alinear="right">Total anual</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const tot = i.cantidad * i.costoUnitario;
              const anual = i.unidadMedida === "mes" ? tot * 12 : tot;
              return (
                <tr key={i.id}>
                  <Td bold>{i.descripcion}</Td>
                  <Td>{i.unidadMedida}</Td>
                  <Td alinear="right">{i.cantidad}</Td>
                  <Td alinear="right">{formatearBolivianos(i.costoUnitario)}</Td>
                  <Td alinear="right">{formatearBolivianos(anual)}</Td>
                </tr>
              );
            })}
          </tbody>
        </TablaWrap>
      </div>
    );
  };
  const sinAdm = !p.costosAdministracion || p.costosAdministracion.length === 0;
  const sinCom = !p.costosComercializacion || p.costosComercializacion.length === 0;
  if (sinAdm && sinCom) return <VacioMsg msg="No cargó gastos operativos." />;
  return (
    <div className="space-y-3">
      {renderTabla("Administración", p.costosAdministracion)}
      {renderTabla("Comercialización", p.costosComercializacion)}
      <Campo k="Imprevistos" v={`${((p.imprevistosPorcentaje ?? 0) * 100).toFixed(1)}% sobre costos`} />
    </div>
  );
}

// ============================================================================
// PASO 7 — Financiamiento + crecimientos + CAPM
// ============================================================================
function Paso7({ p }: { p: Proyecto }) {
  const f = p.financiamiento;
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Préstamo para activo fijo
        </div>
        <GridCampos>
          <Campo k="% Aporte propio" v={`${(f.porcentajePropio * 100).toFixed(1)}%`} />
          <Campo k="% Préstamo bancario" v={`${(f.porcentajePrestamo * 100).toFixed(1)}%`} />
          <Campo k="Tasa interés anual" v={`${(f.tasaInteresAnual * 100).toFixed(2)}%`} />
          <Campo k="Plazo (meses)" v={f.plazoMeses} />
        </GridCampos>
      </div>
      {f.prestamoCapitalTrabajo && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Préstamo para capital de trabajo
          </div>
          <GridCampos>
            <Campo k="% Aporte propio" v={`${(f.prestamoCapitalTrabajo.porcentajePropio * 100).toFixed(1)}%`} />
            <Campo k="% Préstamo" v={`${(f.prestamoCapitalTrabajo.porcentajePrestamo * 100).toFixed(1)}%`} />
            <Campo k="Tasa anual" v={`${(f.prestamoCapitalTrabajo.tasaInteresAnual * 100).toFixed(2)}%`} />
            <Campo k="Plazo (meses)" v={f.prestamoCapitalTrabajo.plazoMeses} />
          </GridCampos>
        </div>
      )}
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Costo del capital</div>
        <GridCampos>
          <Campo k="Costo oportunidad accionista (Koa)" v={`${(f.costoOportunidadAccionista * 100).toFixed(2)}%`} />
        </GridCampos>
      </div>
      {p.capmV2 && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">CAPM (V2)</div>
          <GridCampos>
            <Campo k="Tasa libre de riesgo (Rf)" v={`${(p.capmV2.tasaLibreRiesgo * 100).toFixed(2)}%`} />
            <Campo k="Beta (β)" v={p.capmV2.beta.toFixed(2)} />
            <Campo k="Prima de mercado" v={`${(p.capmV2.primaMercado * 100).toFixed(2)}%`} />
          </GridCampos>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PASO 8 — Capital de trabajo
// ============================================================================
function Paso8({ p }: { p: Proyecto }) {
  return (
    <GridCampos>
      <Campo k="Meses de buffer" v={p.mesesBufferCapitalTrabajo ?? 3} />
      <Campo k="Capital de trabajo calculado" v={formatearBolivianos(p.capitalTrabajo ?? 0)} />
    </GridCampos>
  );
}

// ============================================================================
// PASO 9 — Resumen
// ============================================================================
function Paso9({ p }: { p: Proyecto }) {
  return (
    <div className="space-y-2 text-[11px]">
      <div className="text-muted-foreground">
        Los <strong>indicadores</strong> (VAN, TIR, WACC, Payback) y la <strong>sugerencia</strong> ya
        se muestran arriba del modal. Acá podés ver el resumen estructural del proyecto entregado.
      </div>
      <GridCampos>
        <Campo k="Sector" v={p.sector} />
        <Campo k="# Productos" v={p.productos?.length ?? 0} />
        <Campo
          k="# Items de inversión"
          v={Object.values(p.inversiones ?? {}).flat().length}
        />
        <Campo k="# Puestos de personal" v={p.personal?.length ?? 0} />
        <Campo k="# Costos directos" v={p.costosDirectos?.length ?? 0} />
        <Campo
          k="# Gastos operativos"
          v={(p.costosAdministracion?.length ?? 0) + (p.costosComercializacion?.length ?? 0)}
        />
        <Campo k="Estado del proyecto" v={p.estado} />
        <Campo k="Actualizado" v={new Date(p.actualizado_en).toLocaleString("es-BO")} />
      </GridCampos>
    </div>
  );
}
