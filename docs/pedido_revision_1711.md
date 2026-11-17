# Pedido: revisar que los cambios del 17-11 no rompieron nada (Ronald, desde el copiloto)

Ronald: «hicimos algunos cambios en simuladorPRO (con Antigravity) y me da miedo que hayan roto cosas».

## Qué revisar (commits del 17-11)
- 8e3a0d9 Modo revisión docente (ver, probar y editar el proyecto completo)
- ff10110 Política RLS para que el docente edite proyectos (`supabase/migrations/062_docente_edita_proyectos.sql`)
- 8456187 Desbloquear la presentación en modo docente, punto de equilibrio y panel de viabilidad

## Agentes a usar (léelos y síguelos; no son de esta carpeta, adáptalos sin cambiarles el criterio)
1. **verificador**: `C:\Users\lmigu\SynologyDrive\10.TRABAJO_LOCAL\axiom-simulador\.claude\agents\verificador.md`
   → tsc, lint, tests y build, y lectura del diff `git diff 8e3a0d9~1..8456187` buscando errores.
2. **revisar-publicacion** (lo que toca Supabase y RLS): `C:\Users\lmigu\SynologyDrive\12.NUBES\OneDrive\UNIFRANZ\1.MATERIAS\RON_DOC\.claude\agents\revisar-publicacion.md`
   → la política 062: que el docente edite SOLO los proyectos de SUS cursos, que el estudiante no gane permisos y que no se abra a cualquiera.
3. **probador-app**: `C:\Users\lmigu\SynologyDrive\10.TRABAJO_LOCAL\axiom-simulador\.claude\agents\probador-app.md`
   → probar como estudiante y como docente: que el autoguardado (`useAutoGuardado.ts`) en modo docente no pise el trabajo del estudiante, que el estudiante siga pudiendo armar, simular y presentar su proyecto, y que se vea en celular (375 px).
4. **ejecutor-agy**: `C:\Users\lmigu\SynologyDrive\12.NUBES\_AGENTES_CENTRAL\skills\ejecutor-agy\SKILL.md` → la lectura larga del diff va a agy (Flash); tú revisas con evidencia propia.

## Reglas
- NO aplicar migraciones ni tocar la base real ni Vercel sin OK de Ronald. Solo leer y probar en local.
- Si algo está roto: arreglarlo, pasar de nuevo el verificador y recién entonces subir (commit solo de lo tuyo). Lo que toque la base o lo publicado se le pregunta antes a Ronald con A/B.
- Al terminar: cerrar el servidor de prueba y Chrome, dejar una nota en `BITACORA.md` y decirle a Ronald en simple qué estaba bien, qué se arregló y qué decide él.
