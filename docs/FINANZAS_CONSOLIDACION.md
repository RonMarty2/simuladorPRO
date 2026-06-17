# Consolidacion financiera WEBAPP -> simuladorPRO

Fecha: 2026-06-17

## Decision arquitectonica

`simuladorPRO` queda como cerebro financiero oficial. `WEBAPP` conserva la
experiencia visual y academica, pero no calcula indicadores financieros. Cuando
WEBAPP necesite VAN, TIR, WACC, flujo de caja, amortizacion, punto de equilibrio
o sensibilidad, debe consumir el contrato de `simuladorPRO`.

## Que se migro desde WEBAPP

| Mejora originada en WEBAPP | Destino en simuladorPRO | Estado |
|---|---|---|
| TIR robusta con fallback de biseccion | `src/lib/calculo-financiero.ts` | Migrado |
| WACC calculado desde montos absolutos | `src/lib/calculo-financiero.ts` | Migrado |
| Payback descontado | `src/lib/calculo-financiero.ts` | Migrado |
| Punto de equilibrio en unidades, monto, margen y razon | `src/lib/calculo-financiero.ts` | Migrado |
| Amortizacion academica francesa/alemana/americana | `src/lib/calculo-financiero.ts` | Migrado |
| Flujo libre academico del proyecto | `src/lib/finanzas/proyecto-financiero.ts` | Fusionado |
| Sensibilidad con escenarios alternativos y combinacion recalibrada | `src/lib/finanzas/sensibilidad.ts` | Migrado como motor determinista |
| Idea de helper runtime para entregar resultados a otro sistema | `src/lib/finanzas/api-contract.ts` | Migrado como contrato |
| Separacion tributaria IVA/IT/IUE esperada por WEBAPP | `src/lib/calculo-financiero.ts` + `src/lib/finanzas/proyecto-financiero.ts` | Centralizado |

## Que ya existia en simuladorPRO y se mantiene

| Funcionalidad | Archivo | Decision |
|---|---|---|
| Aportes patronales Bolivia con overrides | `src/lib/calculo-financiero.ts` | Mantener |
| IUE, IT, IVA | `src/lib/calculo-financiero.ts` | Mantener y centralizar: IT e IUE afectan resultado; IVA neto afecta caja |
| Prestamo de activo fijo y prestamo de capital de trabajo | `src/types/proyecto.ts` + motor financiero | Mantener |
| Costos directos por producto (`productoId`) | `src/types/proyecto.ts` + motor financiero | Mantener |
| Indicadores IR, TRC, RBC y servicio de deuda | `src/lib/calculo-financiero.ts` | Mantener |
| Simulacion de eventos economicos | `src/lib/motor-eventos.ts` | Mantener |
| Entregas y sugerencia automatica docente | `src/lib/proyecto-supabase.ts` | Mantener |

## Que se fusiono

- La funcion local `construirFlujoCaja` que estaba dentro de
  `Paso9Resumen.tsx` fue extraida a `src/lib/finanzas/proyecto-financiero.ts`.
- `Paso9Resumen.tsx` ahora renderiza el resultado del motor central.
- `EvaluacionFinal` usa el mismo motor para los valores proyectados y conserva
  el calculo de flujos reales de simulacion con las funciones puras centrales.
- El flujo de caja operativo existente se conserva como `flujoCaja`.
- El flujo libre academico migrado desde WEBAPP se expone como
  `flujoLibreProyecto`.
- La tributacion Bolivia quedo centralizada: IVA 13% por debito/credito
  fiscal, IT 3% sobre ingresos brutos e IUE 25% sobre utilidad positiva.
  El IVA no se mezcla como gasto de resultado; se resta solo cuando genera
  neto a pagar de caja.

## Contrato para que WEBAPP consuma simuladorPRO

El contrato estable vive en:

```ts
src/lib/finanzas/api-contract.ts
```

Entrada esperada:

```ts
{
  version?: "2026-06-17",
  proyecto: Proyecto,
  incluirSensibilidad?: boolean
}
```

Salida esperada:

```ts
{
  version: "2026-06-17",
  resultado: ResultadoFlujoProyecto,
  sensibilidad: AnalisisSensibilidadProyecto | null,
  warnings: string[]
}
```

Endpoint recomendado cuando se exponga por HTTP:

```txt
POST /api/finanzas/evaluar
```

Endpoint implementado para Vercel:

```txt
api/finanzas/evaluar.ts
```

Mientras ese endpoint no este desplegado/publicado, WEBAPP debe usar su
adaptador temporal sin ejecutar calculos locales.

## Que cambio en WEBAPP

- Se elimino `src/lib/proyectoGrado/calculos.ts`.
- Se elimino `src/lib/proyectoGrado/calculos.test.ts`.
- `src/lib/proyectoGrado/runtime-helpers.ts` quedo como orquestador y delega
  finanzas a `simuladorPRO`.
- Se agrego `src/lib/finanzas/simuladorProClient.ts` como unico cliente
  financiero de WEBAPP.
- Se agrego `NEXT_PUBLIC_SIMULADOR_PRO_FINANZAS_URL` en `.env.example`.
- Los prompts de Cap. 4f y 4g ya no dicen que WEBAPP calcula con `calculos.ts`;
  ahora nombran a `simuladorPRO`.

## Archivos modificados en simuladorPRO

- `src/lib/calculo-financiero.ts`
- `src/lib/calculo-financiero.test.ts`
- `src/lib/finanzas/proyecto-financiero.ts`
- `src/lib/finanzas/proyecto-financiero.test.ts`
- `src/lib/finanzas/sensibilidad.ts`
- `src/lib/finanzas/api-contract.ts`
- `src/lib/proyecto-factory.ts`
- `api/finanzas/evaluar.ts`
- `src/components/constructor/pasos/Paso9Resumen.tsx`
- `src/routes/evaluacion-final.tsx`
- `docs/FINANZAS_CONSOLIDACION.md`

## Pendiente

- Desplegar `simuladorPRO` con el endpoint `/api/finanzas/evaluar`.
- Configurar `NEXT_PUBLIC_SIMULADOR_PRO_FINANZAS_URL` en WEBAPP con la URL
  publica de `simuladorPRO`.
- Reemplazar el mock temporal de WEBAPP por llamada real en produccion.
- Decidir si el selector visual de sensibilidad de WEBAPP debe renderizar
  directamente `AnalisisSensibilidadProyecto` en vez de parsear markdown.
