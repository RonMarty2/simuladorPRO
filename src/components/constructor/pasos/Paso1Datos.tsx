import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import type { Sector } from "@/types/proyecto";
import { GUIA_POR_TIPO, SECTOR_POR_TIPO, TIPOS_PARA_SELECTOR } from "@/lib/guia-por-tipo";
import type { CategoriaPlantilla } from "@/lib/plantillas";

const sectores: { valor: Sector; label: string }[] = [
  { valor: "produccion", label: "Producción" },
  { valor: "comercio", label: "Comercio" },
  { valor: "servicios", label: "Servicios" },
  { valor: "agricultura", label: "Agricultura" },
  { valor: "mixto", label: "Mixto" },
];

export default function Paso1Datos() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const actualizar = useProyectoStore((s) => s.actualizarDatosGenerales);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Paso 1 · Datos generales</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define la identidad básica de tu proyecto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Campo
            id="p1-nombre"
            label={proyecto.nombre.trim() ? "Nombre del proyecto" : "Nombre del proyecto (obligatorio)"}
            valor={proyecto.nombre}
            onChange={(v) => actualizar({ nombre: v })}
          />
          <Campo
            id="p1-ubicacion"
            label="Ubicación"
            placeholder="Ej: Cochabamba, zona norte"
            valor={proyecto.ubicacion}
            onChange={(v) => actualizar({ ubicacion: v })}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="p1-descripcion" className="text-sm font-medium">
            Descripción breve
          </label>
          <textarea
            id="p1-descripcion"
            rows={3}
            value={proyecto.descripcion}
            onChange={(e) => actualizar({ descripcion: e.target.value })}
            placeholder="En 2-3 líneas describe qué hará tu proyecto."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="p1-tipo" className="text-sm font-medium">
            Tipo de negocio
          </label>
          <select
            id="p1-tipo"
            value={proyecto.tipoNegocio ?? ""}
            onChange={(e) => {
              const v = e.target.value as CategoriaPlantilla | "";
              if (!v) {
                actualizar({ tipoNegocio: undefined });
                return;
              }
              actualizar({ tipoNegocio: v, sector: SECTOR_POR_TIPO[v] });
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Elige el tipo de tu proyecto…</option>
            {TIPOS_PARA_SELECTOR.map((t) => (
              <option key={t.clave} value={t.clave}>
                {t.titulo}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            {proyecto.tipoNegocio && (GUIA_POR_TIPO as Record<string, { notaTerreno: string }>)[proyecto.tipoNegocio]
              ? "Con este tipo, el constructor te muestra qué suele llevar tu rubro, el diagnóstico revisa lo que no es usual en él, y la simulación te manda situaciones propias de tu tipo."
              : "Sin tipo, tu proyecto solo recibe situaciones generales y no ves la guía de tu rubro."}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="p1-sector" className="text-sm font-medium">
            Sector económico
          </label>
          <select
            id="p1-sector"
            value={proyecto.sector}
            onChange={(e) => actualizar({ sector: e.target.value as Sector })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {sectores.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FichaPedagogica
        titulo="Estudio de factibilidad"
        contenido={
          <>
            Un estudio de factibilidad evalúa si una idea de negocio es viable
            <strong> económica, técnica y legalmente</strong>. Los datos generales aquí son la
            primera capa: ubicación afecta acceso a mercado, sector define qué normativa
            aplica (SENASAG si es alimentos, ASFI si es financiero, etc.).
          </>
        }
      />
    </div>
  );
}

function Campo({
  id,
  label,
  valor,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
