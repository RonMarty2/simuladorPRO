# Plan: pasar caso individual a grupal + deslizadores para jugar con el resultado

Fecha: 2026-11-13. Estado: PROPUESTA, sin código tocado. Reemplaza la versión anterior de este archivo.
Origen: pedido del owner (curso Proyecto Integrador): un estudiante ya armó su caso individual y no
quieren volver a anotar todo para verlo en grupo.

## Parte 1. Botón "Pasar a caso grupal"
Qué hace: desde el caso individual del estudiante, un botón crea un caso del GRUPO con una copia de todos
los datos. Los compañeros entran al grupo y editan entre todos. El caso individual NO se modifica.

Lo que ya existe (confirmado leyendo el código):
- Tabla `proyectos`: `estudiante_id`, `curso_id`, `grupo_id`, `caso_origen_id`, `tipo`, `datos` (JSON con todo
  el caso). `grupo_id` viene de la migración 013, `caso_origen_id` de la 009.
- Grupos: `crearGrupoEstudiante` y `unirseAGrupo` en `lib/grupos-supabase.ts`. Hoy crear un grupo crea también
  un proyecto grupal vacío (`insertarProyecto` con `grupo_id`).
- Permisos de la base: TODOS los miembros del grupo pueden leer y editar el proyecto grupal
  (013, políticas `proyectos_miembro_grupo_lee` y `proyectos_miembro_grupo_edita`). El creador es el único que
  puede borrarlo. Al guardar un proyecto grupal la app hace update, no insert (`guardarProyecto`).
- `clonarProyectoAMiCuenta` (`lib/admin-supabase.ts:119`) ya copia un proyecto completo. Es "solo admin" por la
  pantalla donde se muestra, no por una regla de la base. Su lógica se puede reutilizar.

Lo que falta:
1. Función nueva "copiar mi caso individual al grupo": lee el caso propio, crea el proyecto del grupo con
   `datos` copiados, `grupo_id` del grupo y `caso_origen_id` apuntando al individual. No toca el original.
2. Botón en la pantalla del caso individual: "Pasar a caso grupal" (crear grupo nuevo con este caso, o
   llevarlo a un grupo donde ya soy miembro).
3. Aviso claro al estudiante: "Se crea una copia. Tu caso individual no cambia".
4. Decidir cómo se manejan estas situaciones: si el grupo ya tiene un caso vacío (se reemplaza o se pregunta);
   si ya existe una copia de ese caso en el grupo (evitar duplicados).

Riesgos a revisar al implementar:
- Los cursos "Semana E" usan una función atómica de la base (`crear_grupo_estudiante_atomico`, migración 030);
  el flujo nuevo debe respetar su regla de un solo grupo por curso.
- Los comentarios del código se contradicen sobre quién es el dueño del proyecto grupal (docente o estudiante).
  El código y la migración 015 dicen que es el estudiante creador. Seguir el código.
- Si hace falta un permiso nuevo en la base: migración 062 (nunca tocar 001 a 061).

## Parte 2. Deslizadores para jugar con el resultado
Qué hace: terminado el proyecto, se mueven demanda, precio, costos, sueldos, etc. con deslizadores y se ve
cómo cambian los resultados al instante. También dentro de la presentación.

Lo que ya existe:
- `lib/laboratorio-viabilidad.ts`: `calcularEscenarioLaboratorio` recalcula con ajustes de precio, demanda,
  costo directo, costo fijo, deuda y tasa de interés (en porcentaje). Calcula también los límites de
  viabilidad (hasta dónde se puede mover cada variable).
- `components/presentacion/VisorPitch.tsx` ya importa el laboratorio y guarda esos ajustes (líneas ~92 y
  ~1175). Es muy probable que la presentación YA tenga deslizadores. NO está verificado: falta mirar esa
  pantalla (es lo primero que hay que hacer).
- `routes/presentar-proyecto.tsx` también usa el laboratorio.

Lo que falta (por confirmar mirando las pantallas):
1. Verificar qué deslizadores hay hoy en la presentación y en qué pantalla del estudiante (si hay alguna
   fuera de la presentación).
2. Un panel de deslizadores disponible en la pantalla de resultados del estudiante, no solo en la
   presentación (reutilizando el mismo componente).
3. Sueldos como deslizador propio: hoy no existe; el personal se mueve junto con los costos fijos. Habría que
   separarlo si quieren mover solo los sueldos.
4. Mostrar el cambio: valores antes y después (flujo, punto de equilibrio, VAN, TIR) en la misma pantalla.
5. Botón "volver al plan original" para que el juego no cambie el caso guardado (los deslizadores solo
   simulan, no guardan).

## Orden propuesto
1. Ver en pantalla qué deslizadores existen (lectura, sin cambios).
2. Parte 1: función de copia + botón + pruebas automáticas.
3. Parte 2: llevar el panel a resultados y separar sueldos, con pruebas.
4. Extra opcional: comparar lado a lado varios grupos que partieron del mismo caso.
5. Actualizar `BITACORA.md` (con autorización del owner).

## Pendiente de verificar
- Contenido de `VisorPitch.tsx` (panel de deslizadores) y de `lib/presentacion-proyecto.ts`: no se leyeron.
- No se buscó si hay algún disparador (trigger) en la base que limite la edición del grupo.
