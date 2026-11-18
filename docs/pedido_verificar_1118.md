# Pedido: verificar hallazgos pendientes (solo lectura)

Proyecto: simuladorPRO (React+Vite+TS+Zustand+Supabase). Carpeta: C:\SynologyDrive\SynologyDrive\simuladorPRO

Para CADA punto responde: CONFIRMADO / FALSO / PARCIAL, con archivo:linea y 2 lineas de evidencia, y la correccion minima propuesta (sin editar nada).

1. `src/stores/auth-store.ts`: al cerrar sesion (logout) ¿se limpian los stores de proyecto y simulacion (proyecto-store, simulacion, revision-docente-store, etc.) o queda el proyecto del usuario anterior en memoria/localStorage persistido?
2. `src/components/constructor/pasos/Paso9Resumen.tsx` (~1143-1145): GAO/GAF/GAT pueden dar NaN (calculo-financiero.ts:921-955). ¿Como se muestra en pantalla si es NaN o Infinity? ¿Se ve "NaN" al alumno?
3. `src/lib/proyecto-supabase.ts` (~256-306): guardado de proyectos grupales. ¿Si falla la lectura remota se sobrescribe sin comparar? ¿Hay control de version/updated_at?
4. `src/App.tsx` (~166): ruta `*` ¿queda fuera del layout/guards?
5. Monte Carlo: ¿hay dos simulaciones con formula de percentil distinta (12 y 14 intervalos)? Indica archivos.
6. `supabase/migrations/018_endurecimiento_seguridad.sql`: la politica entregas_estudiante_inserta_propio ¿valida que el proyecto sea del alumno?

Formato: tabla markdown, una fila por punto.
