# Fase 4: propuesta de variables e indicadores propios por tipo

Fecha: 2026-10-23. Solo es una propuesta: no se implementó nada. Cambiarlo
requiere el OK del owner (cambia el motor y los resultados que ven los alumnos).

## 1. Dónde estamos hoy

El estado de la simulación tiene solo: caja, deuda, precio, demanda, costos y
reputación (`EstadoSimulacion`). Los eventos ya son propios de cada tipo (Fases 2
y 3), pero lo que el alumno ve en resultados y diagnóstico es igual para todos:
VAN, TIR, payback, caja y reputación.

Cada ficha de `tipos/` propone en su sección 6 las variables propias de su tipo.
Resumen de lo que pide cada una:

| Tipo | Variables propias que pide la ficha | Indicadores que mostraría |
|---|---|---|
| Turismo | ocupación, tarifa promedio, estacionalidad, comisiones por canal, reservas adelantadas | RevPAR, ocupación de equilibrio, meses de caja |
| Suscripción | suscriptores por antigüedad, bajas, ingreso diferido, cobros fallidos | MRR, churn, LTV:CAC, retención |
| Productos (comida, fábrica, comercio) | inventario, merma, cuentas por cobrar y por pagar, plazo de proveedor | rotación, ciclo de caja, nivel de servicio |
| Medios | audiencia, ocupación de publicidad, precio por mil, concentración de clientes | RPM, ocupación, concentración |
| Eventos y fechas pico | capacidad del día pico, anticipos, cancelaciones, personal eventual | caja mínima anual, capital de trabajo del pico |
| Marketing y comunicación | efecto acumulado, saturación, ventas incrementales, confianza | costo por cliente nuevo, costo por persona que cambió |
| Social, educación y salud pública | beneficiarios, cobertura, abandono, resultados | costo por beneficiario, costo por resultado |
| Costo-beneficio (ahorro) | ahorro esperado vs real, degradación, rebote | ahorro medido, payback |
| Alquiler | unidades ocupadas, renta de mercado, morosidad, estado físico | ocupación, NOI, cap rate |
| Agricultura | calendario de campaña, rendimiento, clima, stock, seguro | margen por campaña, cobertura de deuda |
| Servicios y software | horas vendibles, utilización, tarifa efectiva, concentración | utilización, DSO, concentración |
| Tecnología y plataformas | oferta y demanda activa, comisión efectiva, fuga | volumen transado, comisión neta |
| Salud privada | ocupación por consultorio y cama, mix de pagadores, días de cobro | ocupación, días de cobro por pagador |
| Educación privada | alumnos por cohorte, reinscripción, morosidad, cupos | ocupación de cupos, retención, costo docente |
| Franquicia | regalía, ventas por unidad, estándares, contrato restante | margen después de regalías |
| Concesión | tarifa vigente vs requerida, cobertura de deuda, estado de activos | cobertura del servicio de deuda |
| Microcrédito | cartera, mora, previsiones, costo de fondeo | mora, margen financiero, cobertura de gastos |

## 2. Dos caminos

### Camino A (recomendado): panel de indicadores propios, sin tocar las fórmulas

Los indicadores se calculan a partir de datos que el proyecto ya tiene
(cantidades, precios, costos) más un par de campos opcionales nuevos (por
ejemplo "capacidad" en turismo). Se muestran en resultados y en el diagnóstico
pedagógico, con su explicación. No cambia el VAN, la TIR ni la caja de nadie.

- Riesgo: bajo. Los proyectos existentes siguen igual; si falta el dato
  opcional, el indicador simplemente no aparece.
- Qué gana el alumno: ve las métricas de su rubro (RevPAR en un hostal, mora
  en un microcrédito, costo por beneficiario en un proyecto social) y el
  diagnóstico las usa para explicar por qué le va bien o mal.
- Qué no hace: los eventos todavía no mueven esas variables, solo mueven
  caja, demanda, precio, costos y reputación como hoy.

### Camino B: variables dinámicas dentro de la simulación

La simulación mantiene variables propias mes a mes (inventario, suscriptores por
antigüedad, cartera, mora). Los eventos las mueven directamente y la caja sale
de ellas.

- Riesgo: alto. Cambia el motor, los resultados de simulaciones ya guardadas y
  obliga a rehacer los eventos de cada tipo. Cada tipo es un proyecto en sí
  mismo (semanas, no horas).
- Qué gana el alumno: el simulador deja de ser una calculadora genérica y
  reproduce de verdad la mecánica de cada negocio.

## 3. Recomendación

Hacer primero el Camino A, empezando por turismo (la ficha más completa y el
tipo con más datos en la galería), y evaluar con alumnos reales si hace falta
llegar al Camino B en algún tipo concreto. Orden sugerido de tipos: turismo,
suscripción, salud privada, microcrédito, social, alquiler, el resto.

## 4. Qué hay que decidir (el owner)

1. Camino A, Camino B o A y luego B solo donde haga falta.
2. Por qué tipo empezar.
3. Si los campos opcionales nuevos (capacidad, mora esperada, etc.) los llena
   el alumno en el constructor, o solo aparecen en los ejemplos de la galería
   al principio. Llenarlos en el constructor cambia pantallas.
