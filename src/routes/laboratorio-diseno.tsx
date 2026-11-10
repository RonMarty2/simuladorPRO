import { useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  Menu,
  PlayCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Laboratorio de direcciones visuales (solo para elegir; no forma parte del
 * producto). Cada direccion redefine las mismas variables de tema que usa toda
 * la app, asi lo que se ve aqui es lo que se veria al aplicarla en todas las
 * pantallas. Ruta: /diseno
 */
type Direccion = {
  id: string;
  nombre: string;
  idea: string;
  serif: boolean;
  vars: Record<string, string>;
};

const DIRECCIONES: Direccion[] = [
  {
    id: "A",
    nombre: "Crema y verde azulado",
    idea: "Editorial, calmado, universitario. Es lo que ya aplicamos.",
    serif: true,
    vars: {
      "--background": "43 53% 96%", "--foreground": "222 30% 13%",
      "--card": "0 0% 100%", "--card-foreground": "222 30% 13%",
      "--primary": "175 77% 26%", "--primary-foreground": "43 53% 96%",
      "--secondary": "40 32% 92%", "--secondary-foreground": "222 30% 13%",
      "--muted": "40 32% 92%", "--muted-foreground": "30 8% 38%",
      "--accent": "170 38% 91%", "--accent-foreground": "175 77% 17%",
      "--border": "40 22% 85%", "--input": "40 22% 82%", "--ring": "175 77% 26%",
      "--radius": "0.75rem",
    },
  },
  {
    id: "B",
    nombre: "Noche y ambar",
    idea: "Oscuro tipo app financiera. Las cifras resaltan; ideal para ver datos.",
    serif: false,
    vars: {
      "--background": "222 30% 9%", "--foreground": "210 30% 95%",
      "--card": "222 26% 13%", "--card-foreground": "210 30% 95%",
      "--primary": "38 92% 55%", "--primary-foreground": "222 30% 9%",
      "--secondary": "222 20% 18%", "--secondary-foreground": "210 30% 95%",
      "--muted": "222 20% 18%", "--muted-foreground": "215 16% 66%",
      "--accent": "222 22% 21%", "--accent-foreground": "38 92% 70%",
      "--border": "222 18% 22%", "--input": "222 18% 24%", "--ring": "38 92% 55%",
      "--radius": "1rem",
    },
  },
  {
    id: "C",
    nombre: "Claro y indigo",
    idea: "Blanco limpio, moderno, tipo software de gestion. Sin serif.",
    serif: false,
    vars: {
      "--background": "220 20% 97%", "--foreground": "224 40% 14%",
      "--card": "0 0% 100%", "--card-foreground": "224 40% 14%",
      "--primary": "243 75% 55%", "--primary-foreground": "0 0% 100%",
      "--secondary": "220 16% 94%", "--secondary-foreground": "224 40% 14%",
      "--muted": "220 16% 94%", "--muted-foreground": "220 10% 42%",
      "--accent": "243 80% 96%", "--accent-foreground": "243 75% 40%",
      "--border": "220 16% 90%", "--input": "220 16% 86%", "--ring": "243 75% 55%",
      "--radius": "0.9rem",
    },
  },
  {
    id: "D",
    nombre: "Crema y terracota",
    idea: "El mismo aire de AXIOM: crema, terracota y serif. Calido y reconocible.",
    serif: true,
    vars: {
      "--background": "43 53% 96%", "--foreground": "20 25% 12%",
      "--card": "0 0% 100%", "--card-foreground": "20 25% 12%",
      "--primary": "16 70% 36%", "--primary-foreground": "43 53% 96%",
      "--secondary": "40 32% 92%", "--secondary-foreground": "20 25% 12%",
      "--muted": "40 32% 92%", "--muted-foreground": "25 10% 38%",
      "--accent": "24 70% 92%", "--accent-foreground": "16 70% 28%",
      "--border": "38 24% 84%", "--input": "38 24% 80%", "--ring": "16 70% 36%",
      "--radius": "0.75rem",
    },
  },
];

function Muestra({ d }: { d: Direccion }) {
  const estilo = {
    ...d.vars,
    fontFamily: d.serif ? undefined : '"Atkinson Hyperlegible", system-ui, sans-serif',
  } as CSSProperties;
  const titulo = d.serif ? "font-display" : "font-sans";
  return (
    <div
      style={estilo}
      className="mx-auto min-h-[calc(100dvh-8rem)] max-w-3xl bg-background text-foreground"
    >
      {/* Cabecera */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <Menu className="h-5 w-5" />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <TrendingUp className="h-4 w-4" />
        </div>
        <span className={cn("text-lg font-bold", titulo)}>Simulador de Proyectos</span>
      </div>

      <div className="space-y-5 p-4">
        <div>
          <h1 className={cn("text-3xl font-bold tracking-tight", titulo)}>Hola, Estudiante</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus proyectos, organizados por curso. Haz clic en uno para seguir trabajando.
          </p>
        </div>

        {/* Cifras */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { t: "Proyectos", v: "3", i: LayoutDashboard },
            { t: "VAN", v: "Bs 42.800", i: Wallet },
            { t: "Avance", v: "68%", i: TrendingUp },
          ].map(({ t, v, i: Icono }) => (
            <div key={t} className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <Icono className="mb-2 h-4 w-4 text-primary" />
              <div className={cn("text-xl font-bold leading-tight tabular-nums", titulo)}>{v}</div>
              <div className="text-xs text-muted-foreground">{t}</div>
            </div>
          ))}
        </div>

        {/* Tarjeta de proyecto */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={cn("text-lg font-semibold", titulo)}>Cafeteria El Altiplano</div>
              <div className="text-xs text-muted-foreground">Curso Evaluacion de Proyectos - 2026</div>
            </div>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              En construccion
            </span>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Paso 5 de 9</span>
              <span>56%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[56%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm">
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium">
              <PlayCircle className="h-4 w-4" /> Simular
            </button>
          </div>
        </div>

        {/* Avisos */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-accent p-3 text-accent-foreground">
          <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-semibold">Galeria de mas de 50 ejemplos</div>
            <div className="opacity-80">Mira proyectos completos antes de armar el tuyo.</div>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> Viable
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" /> Riesgo medio
          </span>
        </div>

        {/* Formulario */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className={cn("mb-2 flex items-center gap-2 font-semibold", titulo)}>
            <KeyRound className="h-4 w-4 text-primary" /> Inscribirme a un curso
          </div>
          <div className="flex gap-2">
            <input
              placeholder="ABCDEF"
              className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm tracking-widest"
            />
            <button className="rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Inscribirme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LaboratorioDiseno() {
  const [id, setId] = useState(() => {
    const q = new URLSearchParams(window.location.search).get("d");
    return DIRECCIONES.some((x) => x.id === q) ? (q as string) : "A";
  });
  const d = DIRECCIONES.find((x) => x.id === id) ?? DIRECCIONES[0];

  return (
    <div className="min-h-screen bg-neutral-200">
      <div className="sticky top-0 z-50 border-b border-neutral-300 bg-white p-2 shadow">
        <div className="mx-auto flex max-w-3xl gap-1.5">
          {DIRECCIONES.map((x) => (
            <button
              key={x.id}
              onClick={() => setId(x.id)}
              className={cn(
                "flex-1 rounded-md px-2 py-2 text-sm font-bold",
                x.id === id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"
              )}
            >
              {x.id}
            </button>
          ))}
        </div>
        <div className="mx-auto mt-1.5 max-w-3xl text-center text-xs text-neutral-700">
          <b>{d.nombre}</b> - {d.idea}
        </div>
      </div>
      <Muestra d={d} />
    </div>
  );
}
