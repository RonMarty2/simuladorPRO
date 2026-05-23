import { Plus, Trash2, TrendingUp } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";

const TASAS_RAPIDAS = [
  { label: "Sin crecimiento", valor: 0 },
  { label: "+2% anual", valor: 2 },
  { label: "+5% anual", valor: 5 },
  { label: "+10% anual", valor: 10 },
];

export default function Paso2Proyeccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarProducto);
  const editar = useProyectoStore((s) => s.editarProducto);
  const eliminar = useProyectoStore((s) => s.eliminarProducto);

  // Migración automática del shape viejo
  const productos = proyecto.productos.map((p: any) => ({
    ...p,
    cantidades:
      Array.isArray(p.cantidades) && p.cantidades.length === 5
        ? p.cantidades
        : [
            p.cantidadAnio1 ?? 0,
            p.cantidadAnio1 ?? 0,
            p.cantidadAnio1 ?? 0,
            p.cantidadAnio1 ?? 0,
            p.cantidadAnio1 ?? 0,
          ],
  }));

  const ingresosPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + (p.cantidades[i] ?? 0) * p.precioVenta, 0)
  );
  const unidadesPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + (p.cantidades[i] ?? 0), 0)
  );

  const aplicarCrecimiento = (productoId: string, tasa: number) => {
    const p = productos.find((x) => x.id === productoId);
    if (!p) return;
    const base = p.cantidades[0];
    const nuevas: [number, number, number, number, number] = [
      base,
      Math.round(base * Math.pow(1 + tasa / 100, 1)),
      Math.round(base * Math.pow(1 + tasa / 100, 2)),
      Math.round(base * Math.pow(1 + tasa / 100, 3)),
      Math.round(base * Math.pow(1 + tasa / 100, 4)),
    ];
    editar(productoId, { cantidades: nuevas });
  };

  const actualizarCantidad = (productoId: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === productoId);
    if (!p) return;
    const nuevas = [...p.cantidades] as [number, number, number, number, number];
    nuevas[anio] = valor;
    editar(productoId, { cantidades: nuevas });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Proyección de demanda
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuántas unidades venderás de cada producto en cada año. Puedes editar las
            cantidades a mano o usar el botón de crecimiento automático.
          </p>
        </div>

        {productos.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-secondary/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aún no agregaste productos. Click el botón de abajo.
            </p>
          </div>
        )}

        {productos.map((p, idx) => (
          <div
            key={p.id}
            className="space-y-4 rounded-lg border-2 border-border bg-background p-4"
          >
            {/* Header del producto */}
            <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                Producto {idx + 1}
              </span>
              <button
                onClick={() => eliminar(p.id)}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            </div>

            {/* Datos básicos */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr]">
              <CampoEditable
                label="Nombre del producto / servicio"
                valor={p.nombre}
                onChange={(v) => editar(p.id, { nombre: v })}
                placeholder="Ej: Café especialidad"
              />
              <CampoEditable
                label="Unidad de medida"
                valor={p.unidadMedida}
                onChange={(v) => editar(p.id, { unidadMedida: v })}
                placeholder="taza, kg, und…"
              />
              <CampoNumerico
                label="Precio venta (Bs)"
                valor={p.precioVenta}
                onChange={(v) => editar(p.id, { precioVenta: v })}
              />
            </div>

            {/* Tabla de cantidades por año */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cantidades por año
              </div>
              <div className="grid grid-cols-5 gap-2">
                {p.cantidades.map((c: number, i: number) => (
                  <div key={i} className="space-y-1">
                    <label className="block text-center text-[11px] text-muted-foreground">
                      Año {i + 1}
                    </label>
                    <input
                      type="number"
                      value={c}
                      onChange={(e) =>
                        actualizarCantidad(p.id, i, Number(e.target.value) || 0)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de crecimiento */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-muted-foreground">
                💡 Atajos: aplicar un crecimiento automático desde Año 1
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TASAS_RAPIDAS.map((t) => (
                  <button
                    key={t.valor}
                    onClick={() => aplicarCrecimiento(p.id, t.valor)}
                    className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs font-medium hover:bg-secondary"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingreso resultante por año */}
            <div className="rounded-md bg-secondary/30 p-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Ingreso calculado por año
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {p.cantidades.map((c: number, i: number) => (
                  <div key={i} className="text-center">
                    <div className="text-[10px] text-muted-foreground">Año {i + 1}</div>
                    <div className="font-semibold">
                      {formatearBolivianos(c * p.precioVenta)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            agregar({
              nombre: "Nuevo producto",
              unidadMedida: "unidad",
              cantidades: [0, 0, 0, 0, 0],
              precioVenta: 0,
            } as any)
          }
          className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-foreground hover:bg-secondary/30 hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Agregar otro producto
        </button>

        {/* Totales por año del proyecto entero */}
        {productos.length > 0 && (
          <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" />
              Resumen del proyecto — Totales por año
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((a, i) => (
                <div key={a} className="rounded-md bg-background p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">Año {a}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {unidadesPorAnio[i].toLocaleString()} unid.
                  </div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {formatearBolivianos(ingresosPorAnio[i])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FichaPedagogica
        titulo="Proyección de demanda"
        contenido={
          <>
            Los productos suelen crecer en cantidad año a año entre{" "}
            <strong>3% y 8%</strong> en sectores estables, o hasta{" "}
            <strong>15-20%</strong> en negocios emergentes. Considera Carnaval,
            fin de año y la capacidad instalada. El <strong>precio</strong>{" "}
            generalmente se mantiene estable.
          </>
        }
      />
    </div>
  );
}

function CampoEditable({
  label,
  valor,
  onChange,
  placeholder,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function CampoNumerico({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        type="number"
        value={valor}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
