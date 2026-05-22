# Simulador de Proyectos de Inversión — Bolivia

Plataforma web para que estudiantes universitarios construyan, simulen y reciban retroalimentación pedagógica sobre proyectos de inversión, con contexto económico boliviano (aportes patronales 30.37%, IUE 25%, IT 3%, moneda Bs).

## Estado actual

**FASE 0 completada** — esqueleto técnico corriendo en `localhost:5173`.

El sistema se construye en fases secuenciales (FASE 0 → FASE 9). Ver el documento `SIMULADOR_PROYECTOS_PROMPT.md` original para el plan completo.

## Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Backend / DB / Auth:** Supabase
- **Routing:** React Router v6
- **State:** Zustand
- **Gráficos:** Recharts
- **Formularios:** React Hook Form + Zod
- **Iconos:** Lucide React

## Correr localmente

```bash
npm install
cp .env.example .env.local   # completar credenciales de Supabase en FASE 1
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). Te redirige a `/login`.

## Estructura

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui (se agregan con `npx shadcn add ...`)
│   ├── layout/          # Layout principal (header + sidebar)
│   ├── constructor/     # FASE 4 — 10 pantallas del constructor de proyectos
│   ├── simulacion/      # FASE 6 — pantallas de simulación turno a turno
│   ├── evaluacion/      # FASE 7 — evaluación final y retroalimentación
│   └── docente/         # FASE 8 — panel del docente
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   ├── calculo-financiero.ts  # FASE 2 — motor de cálculo (funciones puras)
│   ├── motor-eventos.ts       # FASE 6 — aplicación de eventos a simulación
│   └── utils.ts
├── stores/                    # Estado global con Zustand
├── types/                     # Tipos TypeScript del dominio
├── routes/                    # Páginas
├── App.tsx
└── main.tsx
```
