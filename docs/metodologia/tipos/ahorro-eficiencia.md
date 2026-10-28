# Proyectos de ahorro de costos y eficiencia (tipo B10 de la taxonomía)

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación para SIMPRO. No modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que la abrí. Al lado indico si la leí completa, por partes o solo el resumen.
- **[Interpretación]** o **estimación** es razonamiento mío. No es una cita ni un dato medido.
- Las magnitudes de las situaciones (sección 5) dicen siempre si vienen de una fuente o son estimación mía. Ninguna es un parámetro listo para el motor: son rangos plausibles para empezar a calibrar.
- Lo que no pude abrir o confirmar está en la sección 9. No lo uses como dato.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

Un proyecto de ahorro o eficiencia no vende nada. Su "ingreso" es un **costo que deja de pagarse**: menos kWh de la red, menos litros de diésel, menos horas de trabajo, menos merma. Ejemplos típicos: instalar paneles solares en una fábrica, cambiar un motor viejo por uno eficiente, reemplazar luminarias por LED, automatizar una línea, digitalizar un proceso en papel, reparar fugas de aire comprimido.

Tres ideas explican casi todo el tipo:

1. **El beneficio es una diferencia contra un caso base.** El ahorro no existe en ningún registro contable: es la diferencia entre lo que habrías gastado sin el proyecto y lo que gastas con él. Por eso se calcula siempre de forma **incremental** contra una alternativa de referencia. El manual de costos de ciclo de vida del gobierno de EE.UU. lo dice así: las medidas de payback y de ahorro son "relativas", solo se pueden calcular con respecto a un caso base designado [S1, sección 6.4 y 6.2, leído].
2. **El ahorro se proyecta, no se factura.** Antes de invertir solo tienes una estimación de ingeniería. La evidencia empírica reciente muestra que esa estimación suele ser optimista (ver sección 3 y 4).
3. **El valor del ahorro depende de un precio que no controlas.** Si el ahorro es de electricidad o diésel, su valor en bolivianos depende de la tarifa o del precio del combustible, que en Bolivia estuvieron congelados durante años y en 2025-2026 cambiaron de forma brusca (sección 5, situaciones 2, 3 y 4).

Para el alumno, el aporte de valor se mide en tres capas: ahorro en bolivianos por mes, tiempo en que se recupera la inversión y qué tan seguro es ese ahorro. Un proyecto de ahorro puede tener un VAN bueno y aun así ser frágil si su ahorro depende de una sola variable (por ejemplo, que el subsidio al combustible no cambie).

Beneficios que no son ahorro directo: la Agencia Internacional de Energía (IEA) agrupa los "beneficios múltiples" de la eficiencia (en su gráfico: ahorro de energía, asequibilidad, competitividad, inversiones en red, seguridad energética, emisiones, empleo, salud y crecimiento) [S7, leí la página pública; no trae cifras ni método de valoración]. Para una empresa, esto se traduce en menos paradas, mejor calidad o menos mantenimiento, pero la página abierta no cuantifica nada de eso. **[Interpretación]** En el simulador conviene tratarlos como beneficios opcionales y difíciles de medir, no como ahorro seguro.

---

## 2. Indicadores propios y cómo se calculan

Notación: `I0` inversión inicial incremental; `S_t` ahorro neto del año `t` (ahorro bruto menos costos nuevos de operar y mantener el equipo); `d` tasa de descuento; `n` vida útil o período de estudio.

### 2.1 Ahorro bruto y ahorro neto

```
Ahorro bruto del período  = (consumo base ajustado - consumo real) x precio unitario
Ahorro neto del período   = ahorro bruto - mantenimiento y operación nuevos - cuota de servicio (si hay ESCO)
```

- El "consumo base ajustado" es lo que habrías consumido sin el proyecto, corregido por cambios de producción, clima u ocupación. La guía de medición y verificación (M&V) del gobierno de Nueva Gales del Sur (Australia) explica que los cambios que afectan el consumo y no se explican por las variables del modelo se llaman "eventos no rutinarios" y obligan a hacer ajustes; si no se registran, "puede ser imposible determinar los ahorros con confianza" [S4, leí secciones 1.1 y 1.2]. La forma exacta de la ecuación de ahorro no la vi escrita en el texto que leí; la expresión de arriba es la lógica general **[Interpretación]**.
- Se reporta normalmente por año [S4, sección 1.2.9, leído].

### 2.2 Costo de ciclo de vida (LCC) y ahorro neto (NS)

- **LCC**: se suman los valores presentes de todos los costos de adquirir, operar, mantener y desechar cada alternativa durante el período de estudio. "La alternativa con menor LCC es la preferida" si el desempeño es parecido [S1, sección 5.1, leído].
- **Ahorro neto (NS)** = LCC del caso base - LCC de la alternativa (equivale al VAN incremental del ahorro). Si es mayor que cero, el proyecto conviene [S1, secciones 5 y 6, leído por partes].

### 2.3 Payback simple y descontado

Fórmula general del manual del gobierno de EE.UU. [S1, sección 6.4.1, leído]: el payback es el menor número de años `y` para el cual

```
suma desde t=1 hasta y de  (S_t - I_t) / (1 + d)^t   >=   I0
```

donde `I_t` son costos de inversión adicionales posteriores. Si `d = 0`, `y` es el **payback simple (SPB)**; si `d > 0`, es el **payback descontado (DPB)**.

Lo que dice la fuente, que es lo más útil para enseñar [S1, sección 6.4]:
- El DPB es el método preferido porque descuenta los flujos antes de acumularlos.
- En la práctica, el SPB ignora los cambios de precios (por ejemplo, la escalada de la tarifa) y el plazo máximo aceptable suele ser "un período elegido de forma subjetiva y bastante más corto que la vida útil".
- Ambas medidas **ignoran todo costo, ahorro o valor residual posterior a la fecha de recuperación**. Reemplazos de equipo o costos de operación que ocurran después del payback "podrían anular" la conveniencia del proyecto.
- El payback **no es válido para elegir entre alternativas excluyentes** ni para ordenar proyectos independientes; solo sirve como filtro rápido para proyectos "tan claramente económicos" que no justifican un análisis completo. Para elegir entre alternativas se usan LCC y NS.

### 2.4 Relación ahorro-inversión (SIR)

```
SIR = valor presente de los ahorros de operación / valor presente de la inversión incremental
```

Criterio de la fuente: el proyecto se justifica si SIR > 1,0 (equivale a NS > 0). El SIR sirve para **ordenar proyectos independientes** cuando el presupuesto es limitado, **no** para elegir entre alternativas excluyentes: el ejemplo del manual es que una capa simple de aislante puede tener mayor SIR que una más gruesa, y la más gruesa puede igual ser la de menor LCC [S1, sección 6.2, leído].

### 2.5 Tasa interna de retorno ajustada (AIRR)

El manual la lista junto a SIR y NS y fija como criterio "AIRR mayor que la tasa de descuento" [S1, índice y criterios, leído; la fórmula del capítulo 6.3 no la leí en detalle].

### 2.6 Tasa de realización (realization rate)

```
Tasa de realización = ahorro realizado (medido) / ahorro esperado (proyectado)
```

Es la forma estándar de la literatura económica de medir la brecha entre lo prometido y lo logrado [S3, figura 1, leída]. Valores reportados en esa figura: de 0,63 (aire acondicionado en California) a 0,38 (climatización de viviendas en Michigan) y 0 en algunos programas de aislación y aire acondicionado en México. Los programas son residenciales o escolares, no industriales.

### 2.7 Ahorro con degradación y con escalada de precio

```
S_t = S_0 x (1 - g)^t x (1 + e)^t        (g: degradación anual del equipo, e: escalada anual del precio de la energía)
```

**[Interpretación]**, no es una fórmula copiada de una fuente. La degradación de paneles solares: una revisión de casi 2000 tasas medidas en campo en 40 años da una **mediana de 0,5 % por año** [S5, resumen abierto en OSTI]. Esa es la cifra de paneles, no de otros equipos.

### 2.8 Costo de la energía ahorrada (CCE)

```
CCE = (I0 x factor de recuperación del capital) / ahorro anual de energía en kWh
```

con `factor de recuperación = d / (1 - (1 + d)^-n)`. Se compara contra el precio de la energía que se deja de comprar. **[Interpretación]**: es una fórmula estándar de finanzas que no verifiqué en una fuente abierta específica de eficiencia (la búsqueda sobre costo de la energía conservada no devolvió una fuente utilizable).

### 2.9 Indicadores de energía para el panel del alumno

- **Consumo específico** = energía consumida / unidad producida. Sirve para separar eficiencia de actividad (sección 5, situaciones 8 y 13). **[Interpretación]**
- **Cobertura solar** = energía solar utilizada / energía total consumida. Un caso de Bolivia declara "más de la mitad del consumo eléctrico de la fábrica en un día normal" [S9, leído].
- **Autoconsumo vs inyección**: en Bolivia la retribución de la energía inyectada se hace por balance neto: se descuentan los kWh inyectados de los consumidos y los excedentes deben ser reconocidos por la distribuidora en un plazo no superior a 24 meses (ficha de la distribuidora CRE, 2026) [S8, leído].

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN/TIR

**Idea central**: en este tipo el VAN **sí funciona**, pero sobre el **flujo incremental** (ahorro menos costos nuevos, contra el caso base), no sobre un flujo de ventas. Es el único tipo de la taxonomía donde el flujo clásico representa bien la estructura del proyecto, con una condición: que el ahorro sea medible y que se trate como incierto.

### 3.1 Qué se reemplaza

- **El payback como criterio único de decisión**. La fuente lo permite solo como filtro de proyectos obvios y no para elegir entre alternativas [S1, 6.4]. Con una regla fija de "recuperar en 3 años" se rechazan proyectos con vida útil de 20 años; el aviso lo vi en un resumen de una guía de la agencia ambiental alemana (UBA) que **no pude abrir** (sección 9).
- **La comparación "equipo nuevo vs nada"**. En un reemplazo, lo correcto es comparar contra mantener el equipo existente. En los apuntes de ingeniería económica que aparecieron en la búsqueda (no los abrí por completo), el análisis de reemplazo trata el costo hundido del equipo viejo como irrelevante y toma su valor de mercado actual como el costo de oportunidad de conservarlo (sección 9, resumen de búsqueda). **[Interpretación]**: el simulador debería usar el valor de venta actual del equipo viejo, no su costo original.

### 3.2 Qué se complementa

| Herramienta | Qué agrega al VAN | Fuente |
|---|---|---|
| LCC y NS | Ordena alternativas excluyentes con todos los costos del ciclo de vida | S1 |
| SIR | Ordena proyectos independientes con presupuesto limitado | S1 |
| Payback descontado | Dice cuánto tarda en recuperarse y sirve de cota inferior de vida útil cuando hay duda sobre cuánto dura el equipo | S1 (sección 6.4) |
| Análisis de sensibilidad | Cambiar de a una las entradas inciertas (por ejemplo, +10 %) y ver cuál mueve más el resultado | S1 (sección 8.2) |
| Tasa de realización | Aplica un descuento por la brecha prometido-real | S3 |
| M&V (medición y verificación) | Convierte el ahorro estimado en ahorro medido; la guía de NSW describe cuatro opciones (A: aislamiento del equipo, parámetro clave; B: aislamiento, todos los parámetros; C: instalación completa; D: simulación calibrada) y que la opción C cuesta menos pero es menos confiable y más expuesta a eventos no rutinarios | S4 |
| Seguro de ahorros / contrato de desempeño | Traslada parte del riesgo de que el ahorro no se dé | S6, S10 |

Un detalle metodológico de S1 que conviene respetar en el simulador: el manual dice que las tasas de descuento y de escalada de energía oficiales se usan "tal como se publican, sin probar sensibilidad" **para las agencias federales de EE.UU.** [S1, 8.2]. Es una regla para ese gobierno, no una verdad general; en Bolivia la escalada de la tarifa es la principal incertidumbre, así que sí hay que probarla.

### 3.3 Por qué este cambio

Porque la evidencia experimental muestra que la parte "ahorro esperado" del VAN es la más frágil. En el mayor experimento aleatorio de eficiencia residencial (más de 30.000 hogares), los costos iniciales fueron aproximadamente el doble del ahorro realizado, las proyecciones de ingeniería fueron alrededor de 2,5 veces los ahorros reales y la tasa de retorno anual promedio fue de unos -9,5 % incluso contando beneficios sociales [S2, resumen del documento de trabajo, leído]. Un resumen de 9 evaluaciones concluye que los retrofits entregan "menos del 40 %" del ahorro esperado en el programa más grande de EE.UU. [S3, leído]. Hay que ser claro: estos son programas **residenciales y escolares de EE.UU. y México**, no plantas industriales bolivianas. Sirven para justificar que el simulador no trate el ahorro prometido como seguro, no para fijar la tasa de realización industrial.

---

## 4. Errores típicos de estudiantes y de empresas

Marcado: [F] respaldado por fuente abierta; [I] interpretación mía.

1. **Tomar el ahorro prometido por el proveedor como cierto** [F: S2, S3]. La ficha de ingeniería suele sobreestimar. Una descomposición citada en un resumen de búsqueda (no la pude abrir completa) atribuye parte de la brecha al sesgo del modelo de ingeniería, parte a la calidad de la instalación y poco al efecto rebote (sección 9).
2. **Decidir solo por payback** y con un plazo arbitrario [F: S1]. Ignora lo que pasa después y no sirve para elegir entre opciones.
3. **Payback simple sin escalada de precio ni descuento** [F: S1]. Puede ser engañoso en ambos sentidos: el simple se ve mejor que el descontado, pero ignora que la tarifa puede subir (o bajar).
4. **Olvidar costos que aparecen después**: reemplazo de inversores, baterías, mantenimiento, limpieza [F: S1 advierte que reemplazos posteriores pueden anular la conveniencia; la lista concreta de piezas es I].
5. **Comparar contra el caso equivocado** [F parcial]: comparar el equipo nuevo contra "no hacer nada" cuando el equipo viejo igual hay que reemplazarlo, o contar el costo original del equipo viejo como si se pudiera recuperar. [I]
6. **No medir y no ajustar por cambios en la operación** [F: S4]. Si se agrega una máquina, cambia el turno o cae la producción, el ahorro "se ve" mayor o menor sin que el proyecto haya cambiado.
7. **Ahorro en energía sin ahorro en bolivianos** [I]: ahorrar kWh en horas de menor costo, o en un tramo de tarifa distinto, no vale lo mismo. No encontré en fuentes abiertas la estructura exacta de las tarifas industriales de Bolivia (sección 9).
8. **Ignorar el tipo de cambio y la deuda en dólares** [I, con contexto en S13].
9. **Subestimar el trámite y la regulación**. En Bolivia la generación distribuida exige empresa instaladora registrada, proyecto aprobado por la distribuidora, verificación en sitio y límites por categoría de potencia [F: S8].
10. **Los números de la nota no cierran entre sí**, un error de empresas y medios. Ejemplo real abierto: la nota sobre la fábrica Mamut dice 10 kWp, inversión de USD 15.200, ahorro inicial de unos USD 200 por mes, payback "menor a 5 años", y a la vez una producción de "al menos 13.400 kWh al año" con energía solar a 0,42 Bs/kWh, "aproximadamente la mitad" de lo que paga hoy a la distribuidora [S9]. Si la tarifa de la distribuidora fuera cerca de 0,84 Bs/kWh y se produjeran 13.400 kWh al año, el ahorro sería alrededor de 5.600 Bs por año (unos USD 800 por año), no USD 2.400 por año. **[Interpretación y cálculo mío, con supuestos]**: la nota puede estar mezclando kWh mensuales con anuales, o contando otros conceptos como cargos por potencia. No lo pude verificar. Sirve como ejemplo didáctico: el alumno debe cuestionar un ahorro que no se reconstruye con sus propias cifras.
11. **Pensar que "mejor equipo" = "menos gasto total"** [F parcial: rebote, S3 menciona el rebote entre las causas posibles; la magnitud en transporte y hogares de otros países aparece en la sección 9]. Si el equipo hace la energía más barata, el uso puede subir.
12. **Cobrarle el ahorro a todo el negocio**: atribuir al proyecto reducciones de costo que se deben al volumen, a un cambio de precio o a otras decisiones. [I, respaldado por la lógica del "caso base ajustado" de S4]

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Convenciones: "ahorro" = ahorro neto mensual del proyecto; "tarifa" = precio unitario de la energía o insumo que se deja de comprar; magnitudes con "(fuente Sn)" vienen de una fuente que abrí; "(estimación)" es mía. Todas las decisiones tienen ventajas y costos reales: ninguna es la opción correcta de manual.

### Situación 1. La brecha entre el ahorro prometido y el medido

- **Qué pasa**: pasados los primeros meses, el medidor muestra que el ahorro real es menor que el de la oferta del proveedor. Nadie mintió: el modelo de ingeniería suponía condiciones ideales, y el equipo funciona distinto en tu planta. Tienes que decidir si crees al medidor, al proveedor o al promedio.
- **Variables que mueve**: tasa de realización (baja); ahorro mensual (baja); payback (sube); reputación con el banco o el socio si se prometió un ahorro (baja).
  - Magnitud: tasa de realización de 0,38 a 0,63 en evaluaciones residenciales y escolares de EE.UU. [S3] y relación proyectado/real de aprox. 2,5 en el experimento de Michigan [S2]. Para instalaciones industriales o solares bien dimensionadas, **estimación**: entre 0,70 y 0,95.
- **Decisiones**:
  1. *Contratar una medición independiente (opción B o C de M&V)*. Ventaja: sabes la verdad y tienes base para reclamar. Costo: pago de la verificación y tiempo; la opción C cuesta menos pero es menos confiable [S4].
  2. *Reclamar al proveedor con el contrato de desempeño o el seguro de ahorros, si lo firmaste*. Ventaja: recuperas parte del faltante. Costo: sin cláusula previa no hay nada que reclamar, y un proveedor que pagó penalidades puede dejar de dar soporte.
  3. *Aceptar el número real y recalcular el plan (reducir el pago anticipado de deuda, diferir la fase 2)*. Ventaja: no pierdes tiempo ni plata en disputas. Costo: absorbes toda la pérdida y sigues sin saber la causa.
  4. *Ajustar la operación para llegar al ahorro prometido (horarios, mantenimiento, calibración)*. Ventaja: parte de la brecha puede ser de operación y se recupera barato. Costo: horas de personal; si la causa era el diseño, pierdes meses.
- **Qué aprende el alumno**: que el ahorro es una hipótesis hasta que se mide, y que se negocia mejor con evidencia y con cláusulas firmadas antes de comprar.

### Situación 2. La tarifa eléctrica de la red cambia

- **Qué pasa**: el costo de la electricidad de la distribuidora, hoy bajo por el gas barato para las termoeléctricas, empieza a corregirse (o el Estado decide mantenerlo bajo). En Bolivia las tarifas residenciales rondan unos 15 USD/MWh, la mitad del promedio regional según un medio local, y las termoeléctricas compran gas a 1,2-1,6 USD/MMBTU [S14, leído; artículo de prensa, no un estudio]. Una columna de opinión proyecta hasta +80 % de tarifa si Bolivia pasa a importar gas para generar [S15, es una proyección de un comunicador del sector, no una medida decretada].
- **Variables que mueve**: tarifa (sube o baja); ahorro mensual de un proyecto de electricidad (sube o baja en la misma proporción); payback (baja o sube).
  - Magnitud: escenario alto +30 % a +80 % en 2-3 años [proyección de S15, fuente de opinión]; escenario bajo 0 % o decreto de congelamiento (estimación). Un solo cambio brusco de tarifa por año es lo más plausible.
- **Decisiones**:
  1. *Ampliar el sistema solar o de eficiencia (fase 2) ahora*. Ventaja: capturas más ahorro si la tarifa sube. Costo: más deuda y más exposición si la tarifa no sube o se subsidia otra vez.
  2. *Mantener lo que tienes y guardar caja*. Ventaja: liquidez para otros golpes. Costo: si la tarifa sube y los equipos suben de precio por el dólar, la fase 2 saldrá más cara después.
  3. *Cerrar con el proveedor un precio fijo de energía a 10-15 años (PPA o contrato de ahorros)*. Ventaja: previsibilidad. Costo: si la tarifa sube, pagas un precio fijo mayor al que podrías tener; si baja, pagas de más.
  4. *Cambiar la inversión hacia mejoras de eficiencia en vez de generación*. Ventaja: el ahorro en kWh vale en cualquier escenario de tarifa. Costo: menor escala de ahorro potencial por proyecto.
- **Qué aprende el alumno**: el VAN de un proyecto de ahorro es en gran parte una apuesta sobre un precio regulado. Hay que probar escenarios de tarifa, no usar un valor único.

### Situación 3. Shock cambiario y equipos importados

- **Qué pasa**: el tipo de cambio pasa de la paridad fija a un régimen flexible. El 29 de junio de 2026 arrancó en 9,73 Bs por dólar contra 6,96 anterior, una devaluación cercana a 40 % según un analista [S13, leído]. Paneles, inversores, variadores, sensores y repuestos son importados. Si compraste con crédito en dólares, la cuota pesa más; si tu ahorro está en bolivianos, vale menos en dólares.
- **Variables que mueve**: costo de reposición de equipos y repuestos (sube); cuota de deuda en dólares si existe (sube en Bs); ahorro en Bs (sin cambio directo); inversión de una segunda fase (sube).
  - Magnitud: +40 % en el precio en Bs del equipo importado al inicio del régimen flexible [S13, estimación de un analista]. Después el tipo de cambio puede seguir moviéndose; otros resultados de búsqueda (no abiertos) mencionan cotizaciones de 11,5 a 12,15 en julio-agosto (sección 9). Para el motor, **estimación**: shocks de +/-10 % al trimestre.
- **Decisiones**:
  1. *Comprar los equipos de la fase 2 ahora para fijar el costo*. Ventaja: te adelantas a nuevos saltos. Costo: gastas caja ahora y si el dólar baja pagaste de más.
  2. *Esperar y ver si el tipo de cambio se estabiliza*. Ventaja: conservas caja y puedes aprovechar una baja. Costo: los equipos y el costo de oportunidad (el ahorro que no obtienes) pueden empeorar.
  3. *Buscar proveedores locales o equipos usados reacondicionados*. Ventaja: menos exposición al dólar. Costo: más riesgo de calidad, menos garantía y plazo de recambio.
  4. *Refinanciar la deuda en bolivianos, aun con tasa mayor*. Ventaja: elimina el descalce entre ahorro en Bs y deuda en dólares. Costo: pagas una tasa mayor y quizá cargos por prepago.
- **Qué aprende el alumno**: el riesgo de moneda se esconde en el costo de los equipos y en la deuda, no solo en el flujo de ahorro. Un proyecto "rentable" puede dejar de serlo con el tipo de cambio.

### Situación 4. Se corrige el subsidio al combustible

- **Qué pasa**: el diésel y la gasolina suben de forma fuerte tras años congelados. Según una nota de Infobae (13/7/2026), la gasolina pasó a 6,96 Bs/L (+86 %) y el diésel a 9,80 Bs/L (+162 %) en diciembre de 2025, con congelamiento de seis meses desde julio 2026 (DS 5652) hasta enero 2027 [S11, leído]. Una nota de EFE reproducida por Emol (21/9/2026) dice que el diésel pasó de 9,80 a 17,95 Bs/L, y que Bolivia importa 60 % de la gasolina y 95 % del diésel [S12, leído]. Las dos notas no coinciden del todo en fechas y alcance (sección 9). A la vez hay filas y desabastecimiento.
- **Variables que mueve**: precio del combustible (sube); ahorro de un proyecto que sustituye combustible (generador a diésel, flota, calderas) (sube); disponibilidad del combustible (baja, riesgo operativo); costo de operar sin el proyecto (sube).
  - Magnitud: +86 % gasolina y +162 % diésel en diciembre de 2025 [S11]; diésel a 17,95 Bs/L en septiembre de 2026 para consumidores pequeños [S12]. Después de enero de 2027, precios atados a precios internacionales y al tipo de cambio [S11]. Para la simulación, **estimación**: un salto, luego variaciones de +/-15 % al semestre.
- **Decisiones**:
  1. *Reemplazar el generador o la flota por solar o gas natural vehicular/eléctricos*. Ventaja: el ahorro por litro evitado se multiplicó. Costo: inversión alta, equipos importados (dólar) y tiempos de instalación mientras el combustible sigue caro.
  2. *Optimizar el uso actual (rutas, mantenimiento, apagado automático)*. Ventaja: barato, rápido y sin riesgo de moneda. Costo: ahorro limitado (por ejemplo, un porcentaje de dígito simple a bajo doble dígito; estimación).
  3. *Trasladar el mayor costo al precio de venta*. Ventaja: protege el margen si el mercado lo permite. Costo: pierdes clientes; no resuelve el problema de fondo.
  4. *Comprar y almacenar combustible por adelantado*. Ventaja: cobertura ante escasez. Costo: capital inmovilizado, riesgo de calidad (hubo problemas de combustible desestabilizado según S11) y seguridad.
- **Qué aprende el alumno**: cuando se retira un subsidio, el ahorro por unidad evitada puede multiplicarse, pero la misma medida de política trae escasez, calidad y tipo de cambio. El mejor momento para invertir no siempre es el día de la noticia.

### Situación 5. Degradación y mantenimiento del equipo

- **Qué pasa**: pasan los años. Los paneles rinden un poco menos cada año, se ensucian, el inversor es la pieza que más falla (estimación), los motores pierden rendimiento. El ahorro del año 4 no es el del año 1.
- **Variables que mueve**: rendimiento del equipo (baja lento); ahorro mensual (baja); costo de mantenimiento (sube); reserva para reposición del inversor (sale caja).
  - Magnitud: paneles, mediana de 0,5 % por año de pérdida de potencia [S5]. Limpieza, sombras y fallas de inversor: **estimación** de 1-3 puntos adicionales de pérdida si no se hace mantenimiento.
- **Decisiones**:
  1. *Contrato de mantenimiento preventivo con el instalador*. Ventaja: el ahorro se sostiene y quedan registros para la garantía. Costo: pago fijo mensual que resta ahorro.
  2. *Mantener con personal propio*. Ventaja: más barato. Costo: dependes de la capacitación; sin experiencia aparecen fallas que anulan la garantía.
  3. *Formar una reserva mensual para reponer el inversor*. Ventaja: evita el shock de caja del año 8-12 (estimación). Costo: inmoviliza caja que ahora podrías usar.
  4. *No hacer nada y ver*. Ventaja: cero costo ahora. Costo: ahorro decreciente y una falla grave que no estaba presupuestada.
- **Qué aprende el alumno**: el payback "después de recuperarse" no es plata libre. Los costos de reposición pueden anular lo ganado [S1, 6.4].

### Situación 6. El proveedor falla: garantía, soporte o tecnología descontinuada

- **Qué pasa**: el instalador cierra, o el fabricante discontinúa el modelo, o tarda en traer repuestos. El equipo se detiene y el ahorro se vuelve cero mientras el costo de la deuda sigue.
- **Variables que mueve**: disponibilidad del equipo (baja a cero durante la parada); ahorro (cae al 0 % en esos meses); costo de reparación (sube); reputación con el banco (baja si se atrasa la deuda).
  - Magnitud: **estimación**: 1 a 3 meses de parada por evento; costo de reparación de 5-20 % de la inversión del componente.
- **Decisiones**:
  1. *Exigir la garantía legal/contractual y esperar*. Ventaja: sin costo directo si el proveedor responde. Costo: el tiempo de parada sigue y la deuda sigue corriendo.
  2. *Contratar a un técnico independiente para reparar*. Ventaja: rápido. Costo: puedes perder la garantía y pagar más.
  3. *Tener un seguro de ahorros (contrato con validación independiente)*. Ventaja: compensa el faltante de ahorro. Costo: prima y el requisito de contratar con proveedores que acepten el esquema; el programa ESI del BID funciona así en Colombia (contrato de desempeño, validación, seguro y financiamiento preferencial) [S10]. No lo encontré operando en Bolivia (sección 9).
  4. *Comprar un equipo de reserva o repuestos críticos al inicio*. Ventaja: reduces la parada. Costo: capital inmovilizado, y los repuestos importados se encarecen con el dólar.
- **Qué aprende el alumno**: el riesgo de proveedor es parte del proyecto. Un ahorro garantizado vale tanto como la solvencia de quien lo garantiza [S6: en el esquema de ahorro garantizado el ESCO asume el riesgo técnico; en ahorro compartido asume además el riesgo de crédito del cliente].

### Situación 7. El trámite regulatorio demora o cambian las reglas de la generación distribuida

- **Qué pasa**: quieres instalar paneles y vender excedentes. Según el esquema vigente, necesitas contrato de suministro, no tener deudas con la distribuidora, una empresa instaladora registrada, que la distribuidora (por ejemplo CRE) revise el proyecto, y una verificación en sitio al terminar. El balance neto reconoce los excedentes en no más de 24 meses [S8]. En 2026 aparecieron nuevas resoluciones sobre empresas instaladoras, autoproducción y límites de macrogeneración distribuida [S8, no detalladas en la ficha].
- **Variables que mueve**: plazo de puesta en marcha (sube meses); ahorro (llega más tarde); costo financiero del capital parado (sube); valor de los excedentes (cambia con la regla).
  - Magnitud: **estimación** de 2-6 meses de retraso. La ficha no da plazos de la distribuidora.
- **Decisiones**:
  1. *Esperar la aprobación completa antes de comprar*. Ventaja: evitas comprar un diseño que cambie. Costo: sigues pagando la energía cara.
  2. *Comprar el equipo ya y asumir el riesgo del trámite*. Ventaja: aceleras. Costo: capital parado y posible rediseño.
  3. *Dimensionar para autoconsumo sin depender de excedentes*. Ventaja: menos dependencia de la regla de retribución. Costo: menor escala de ahorro y puede quedar capacidad ociosa en fines de semana.
  4. *Instalar baterías para no depender de la red*. Ventaja: independencia parcial. Costo: alto (estimación: puede duplicar la inversión) y con vida útil menor; no apareció en las fuentes como práctica generalizada.
- **Qué aprende el alumno**: la regulación define el tamaño y el momento del beneficio. El ahorro tiene un calendario que depende de terceros.

### Situación 8. Efecto rebote: el ahorro se come por mayor uso

- **Qué pasa**: el equipo nuevo hace que usar la energía sea más barato, y la planta empieza a usarlo más (más horas, más temperatura, más producción). El consumo no baja tanto como esperabas.
- **Variables que mueve**: consumo real (sube respecto del esperado); ahorro (baja); producción (sube, que puede ser bueno).
  - Magnitud: la revisión de Sorrell y otros (2009) concluye que en servicios de energía de hogares de países de la OCDE el rebote directo suele ser menor a 30 % (resumen de búsqueda, no abrí el artículo); el experimento de Michigan **no** halló evidencia significativa de rebote en temperaturas interiores [S2]. Para la simulación, **estimación**: 5-20 %.
- **Decisiones**:
  1. *Usar el ahorro para producir más (crecer)*. Ventaja: la ganancia total puede ser mayor que el ahorro. Costo: el gasto total en energía no baja, y la medición del proyecto se vuelve ambigua.
  2. *Fijar metas de consumo específico por unidad producida*. Ventaja: mide eficiencia real. Costo: requiere medición y disciplina.
  3. *Bloquear automáticamente (termostatos, programación)*. Ventaja: asegura el ahorro. Costo: menos flexibilidad operativa y quejas del personal.
  4. *Ignorarlo*. Ventaja: nada que hacer. Costo: payback más largo del esperado.
- **Qué aprende el alumno**: ahorro unitario no es ahorro total. Hay que separar eficiencia de nivel de actividad.

### Situación 9. Disputa de la medición con la empresa de servicios energéticos (ESCO)

- **Qué pasa**: contrataste un esquema de **ahorro compartido**: la ESCO pone el dinero y se queda con una parte del ahorro. Al medir, la ESCO y tú discrepan sobre cuánto se ahorró (cambió la producción, se agregó una máquina). Sin un registro de esos "eventos no rutinarios", no hay forma de ajustar [S4].
- **Variables que mueve**: pago a la ESCO (cambia); ahorro neto que te queda (cambia); costo de verificación; relación comercial.
  - Magnitud: porcentaje cedido a la ESCO, **estimación**: entre 50 % y 80 % del ahorro durante el contrato (las fuentes abiertas no dan un porcentaje; solo describen la estructura [S6]). En ahorro compartido la ESCO asume el riesgo técnico y el de crédito del cliente; en el garantizado asume el riesgo técnico y el cliente financia [S6]. En Chile el reparto de contratos es 60/40 a favor del ahorro compartido [S6].
- **Decisiones**:
  1. *Aceptar la medición de la ESCO*. Ventaja: evitas conflicto. Costo: puedes estar pagando por ahorro que no existe.
  2. *Contratar un verificador independiente*. Ventaja: resuelves con datos. Costo: pago y tensión con la ESCO.
  3. *Renegociar a ahorro garantizado con financiamiento propio o bancario*. Ventaja: te quedas con todo el ahorro después. Costo: necesitas crédito, y asumes el riesgo de financiamiento.
  4. *Comprar a la ESCO el equipo anticipadamente*. Ventaja: terminas el reparto. Costo: desembolso grande y pierdes el soporte.
- **Qué aprende el alumno**: quién mide manda. Un contrato de ahorro es tan bueno como su cláusula de medición.

### Situación 10. Línea de crédito verde y financiamiento disponible

- **Qué pasa**: aparece una oportunidad de financiar con una línea orientada a eficiencia energética o producción más limpia. Los resultados de búsqueda indican que el BDP (con GEF/PNUD) ejecuta un programa de crédito de ecoeficiencia, emitió un bono temático de unos USD 15 millones, y que CAF aprobó líneas para pymes y microfinancieras (USD 152,5 millones en 2020); GREENPYME también opera en Bolivia (resumen de búsqueda; no abrí esas páginas, ver sección 9).
- **Variables que mueve**: tasa de interés (baja); plazo (sube); trámite y auditoría previa (cuesta); capacidad de invertir (sube).
  - Magnitud: **estimación**: tasa 2-4 puntos porcentuales por debajo de la comercial, requisito de informe técnico/auditoría. No encontré tasas vigentes (sección 9).
- **Decisiones**:
  1. *Tomar la línea verde*. Ventaja: menor tasa y mayor plazo; el pago se ajusta al ahorro. Costo: auditoría y documentos, tiempos de aprobación, garantías.
  2. *Financiar con caja propia*. Ventaja: sin deuda y sin trámites. Costo: dejas la empresa corta de liquidez para imprevistos.
  3. *Esquema ESCO de ahorro compartido (sin inversión)*. Ventaja: no hay desembolso. Costo: cedes una parte grande del ahorro durante años.
  4. *Dividir en fases pequeñas con caja*. Ventaja: aprendes y reduces riesgo. Costo: el ahorro total llega más tarde y pagas el costo de cada fase.
- **Qué aprende el alumno**: la forma de financiar cambia el valor del proyecto tanto como la tecnología. Es una decisión de estructura, no solo de costo.

### Situación 11. La auditoría energética encuentra un ahorro barato que nadie había visto

- **Qué pasa**: una auditoría descubre pérdidas simples: fugas de aire comprimido, motores sobredimensionados, iluminación encendida fuera de turno, equipos en espera. Las auditorías tienen niveles: una visita rápida con revisión de al menos 12 meses de facturas, una auditoría con estimaciones más precisas y una de "grado de inversión" con medición detallada, modelo energético y análisis de ciclo de vida (según resumen de búsqueda de las guías ASHRAE, no abrí la norma; sección 9).
- **Variables que mueve**: ahorro mensual (sube, rápido); inversión requerida (baja o pequeña); payback del proyecto grande (se vuelve menos urgente).
  - Magnitud: **estimación**: medidas operativas de bajo costo suelen dar un porcentaje de un dígito a bajo doble dígito del consumo, con payback de meses. La cifra de una sola fuente comercial que dice USD 5.000 contra USD 100.000 por tipo de auditoría es solo orientativa (sección 9).
- **Decisiones**:
  1. *Aplicar primero las mejoras baratas y medir*. Ventaja: retorno rápido y datos para el proyecto grande. Costo: tiempo del personal, y la mejora puede desaparecer si no se sostiene.
  2. *Hacer todo en paralelo*. Ventaja: máximo ahorro pronto. Costo: concentras riesgo y caja, y no puedes aislar el efecto de cada medida (problema de medición según S4).
  3. *Pagar auditoría de grado de inversión antes de comprometer el proyecto grande*. Ventaja: reduce la brecha prometido-real. Costo: pago por adelantado y demora.
  4. *Saltar la auditoría y comprar la tecnología más visible (paneles)*. Ventaja: rápido y atractivo. Costo: puedes ahorrar menos por peso invertido que con medidas simples.
- **Qué aprende el alumno**: el primer ahorro se compra con información. Se prioriza por SIR (ahorro por peso invertido) [S1], no por lo vistoso.

### Situación 12. Aparece una tecnología mejor o más barata (obsolescencia)

- **Qué pasa**: a los 12 meses sale un equipo que consume menos o cuesta menos. Tu equipo sigue funcionando, pero comparado con el nuevo ya no es el mejor.
- **Variables que mueve**: costo de oportunidad (sube); valor de reventa del equipo propio (baja); posibilidad de ampliar a menor costo (sube).
  - Magnitud: **estimación**: reducción del costo del equipo de 5-15 % por año; mejora de eficiencia de 3-10 % por generación. No tengo fuente abierta específica.
- **Decisiones**:
  1. *Mantener lo instalado y amortizar*. Ventaja: no gastas. Costo: te quedas con tecnología menos eficiente si los precios de la energía suben.
  2. *Reemplazar antes de tiempo*. Ventaja: más ahorro. Costo: pierdes parte de la inversión previa (que es costo hundido y no debe pesar, pero sí el valor de reventa) y gastas de nuevo.
  3. *Ampliar con la nueva tecnología (mezcla de equipos)*. Ventaja: aprovechas el mejor precio. Costo: complejidad de operación y repuestos.
  4. *Pasar a alquiler o contrato de servicio*. Ventaja: transfieres el riesgo de obsolescencia. Costo: pagas más a largo plazo.
- **Qué aprende el alumno**: ante un reemplazo, lo pasado ya no cuenta; solo cuenta lo que puedes recuperar hoy y lo que viene [lógica de reemplazo, resumen de búsqueda; sección 9].

### Situación 13. Cae la producción por bloqueos o desabastecimiento

- **Qué pasa**: hay bloqueos de caminos de semanas, falta de dólares o de insumos. La planta produce menos. Un reporte de julio de 2026 menciona bloqueos de siete semanas entre mayo y junio [S11]; otro, más de 50 días [S13].
- **Variables que mueve**: nivel de actividad (baja); ahorro en Bs (baja, porque ahorras un porcentaje de un consumo menor); costos fijos de la deuda (no bajan); caja (baja).
  - Magnitud: **estimación**: baja de actividad de 20-50 % durante 1-2 meses. Las fuentes mencionan duración de bloqueos, no su impacto en producción industrial.
- **Decisiones**:
  1. *Renegociar cuotas con el banco (período de gracia)*. Ventaja: alivia la caja. Costo: más intereses y deterioro del historial si no se maneja bien.
  2. *Usar la caja acumulada*. Ventaja: no pides favores. Costo: quedas sin colchón.
  3. *Vender energía excedente a la red (si tienes generación distribuida)*. Ventaja: un uso para lo que sobra. Costo: según el esquema de balance neto, el excedente se reconoce con hasta 24 meses de plazo [S8], no es caja inmediata.
  4. *Diferir el mantenimiento preventivo*. Ventaja: ahorra hoy. Costo: aumenta el riesgo de fallas y de degradación (situaciones 5 y 6).
- **Qué aprende el alumno**: un proyecto de ahorro no es inmune a los problemas del negocio principal. El ahorro depende del volumen, pero los costos de la inversión son fijos.

### Situación 14. Los operarios no usan el sistema o lo desactivan

- **Qué pasa**: en proyectos de automatización o digitalización, el beneficio depende de que la gente lo use. Los operarios no confían en el sistema, lo saltan o lo desactivan. Sin uso no hay ahorro (esto aparece en la ficha B7 de la taxonomía: los proyectos fallan por no uso).
- **Variables que mueve**: adopción o uso (baja); ahorro (baja proporcionalmente); errores (sube); clima laboral.
  - Magnitud: **estimación**: adopción efectiva de 60-90 % al cabo de 6 meses según capacitación.
- **Decisiones**:
  1. *Capacitar y acompañar en planta*. Ventaja: sube el uso. Costo: horas de formación y de producción perdidas.
  2. *Incentivar con un bono atado al ahorro*. Ventaja: alinea intereses. Costo: reduce el ahorro neto y genera pugnas sobre cómo se mide.
  3. *Bloquear el bypass (automatización forzada)*. Ventaja: asegura el uso. Costo: rigidez y resistencia del personal.
  4. *Rediseñar el proceso con los operarios*. Ventaja: aumenta aceptación y detecta mejoras. Costo: tiempo y posibles cambios de costos.
- **Qué aprende el alumno**: tecnología más personas más proceso. El ahorro "de papel" y el ahorro real se separan por la adopción.

### Situación 15. El equipo viejo falla antes de lo previsto

- **Qué pasa**: el equipo que pensabas reemplazar el próximo año se rompe ahora. Tienes que decidir si lo reparas, adelantas el proyecto o alquilas algo temporal.
- **Variables que mueve**: costo de reparación o parada (sube); calendario del proyecto (se adelanta); caja (baja); producción (baja si hay parada).
  - Magnitud: **estimación**: costo de reparar del 10-30 % del valor de un equipo nuevo; parada de 2-6 semanas.
- **Decisiones**:
  1. *Reparar y mantener el calendario original*. Ventaja: no adelantas la inversión. Costo: reparación que se pierde (costo hundido) y riesgo de que vuelva a fallar.
  2. *Adelantar el proyecto de reemplazo*. Ventaja: el equipo nuevo ya trae el ahorro. Costo: compras en mal momento (posiblemente sin la caja ni el mejor precio).
  3. *Alquilar un equipo temporal*. Ventaja: evita la parada. Costo: pago por alquiler que no suma al ahorro.
  4. *Comprar usado*. Ventaja: barato y rápido. Costo: menor eficiencia y vida útil, menor ahorro.
- **Qué aprende el alumno**: el caso base no es "no hacer nada": el equipo viejo también tiene un costo de seguir funcionando y un riesgo de fallar. El análisis de reemplazo compara retener o cambiar, ambos con sus costos futuros.

---

## 6. Variables propias que el motor del simulador debería manejar

Sugerencia para las variables que el motor actual (caja, ingresos, costos, reputación) no tiene. **[Interpretación]** salvo donde se cita fuente. Todas son por mes salvo indicación.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| `consumo_base` | Lo que se habría consumido sin el proyecto (energía, litros, horas), con estacionalidad | `consumo_base_t = consumo_base_0 x factor_actividad_t x factor_estacional_t` |
| `actividad` | Nivel de producción relativo (1,0 = normal). Los bloqueos, la demanda y los eventos la mueven | Se modifica por eventos (situación 13) y por decisiones de crecimiento (situación 8) |
| `precio_unitario` | Tarifa o precio del insumo que se deja de comprar | `precio_t = precio_{t-1} x (1 + escalada_t)` más saltos por eventos (situaciones 2 y 4) |
| `ahorro_esperado_pct` | Ahorro que prometió el proveedor (sobre el consumo base) | Fijo en la ficha del proyecto |
| `tasa_realizacion` | Fracción del ahorro prometido que se logra de verdad; empieza oculta y el alumno la descubre al medir | Arranca en un valor (aleatorio dentro de un rango) y se ajusta por mantenimiento, adopción y decisiones de la situación 1 |
| `degradacion` | Pérdida anual de rendimiento del equipo | `rendimiento_t = rendimiento_{t-1} x (1 - g/12)`; con `g` cercano a 0,5 %/año para paneles [S5] |
| `disponibilidad` | Fracción del mes en que el equipo funciona (0 a 1) | Baja con fallas (situación 6) y parada del equipo viejo (15); sube con mantenimiento |
| `adopcion` | Fracción del equipo/sistema realmente usado por la gente | Sube con capacitación, baja con rotación o con el bypass (situación 14) |
| `rebote` | Aumento de uso inducido por el menor costo | Se aplica sobre el consumo real tras instalar el equipo (situación 8) |
| `ahorro_bruto_mes` | Plata ahorrada antes de costos nuevos | `(consumo_base - consumo_real) x precio_unitario` |
| `ahorro_neto_mes` | Ahorro menos mantenimiento, cuotas de servicio y participación de la ESCO | Entra a la caja como "ingreso" del motor |
| `ahorro_medido` | Lo que el alumno ve si instala medición. Se parece al real con un error que depende de la opción de M&V | Sin medición, el alumno ve solo la estimación del proveedor [S4] |
| `confianza_medicion` | Calidad de la medición (A, B, C, D de M&V) | Cambia al contratar o mejorar M&V (situaciones 1, 9) |
| `reserva_reposicion` | Fondo para cambiar piezas críticas | Aporte mensual del alumno; se consume al ocurrir una falla |
| `garantia_meses` y `seguro_ahorro` | Cobertura contractual | Disminuyen con el tiempo; se activan si `tasa_realizacion` cae bajo lo garantizado (situaciones 1, 6) |
| `tipo_cambio` | Bs por USD, afecta repuestos, equipos y deuda en dólares | Variable con choques (situación 3) |
| `participacion_esco` | Porcentaje del ahorro que se cede | Fijo por contrato; negociable en eventos (situación 9) |
| `payback_acumulado_simple` y `_descontado` | Contadores para mostrar el payback en curso | `suma de ahorro_neto` y `suma de ahorro_neto/(1+d)^t` menos inversión acumulada |

Indicadores a mostrar al alumno en la pantalla de resultados: VAN del flujo incremental, SIR, payback simple y descontado, tasa de realización (cuando la mide), consumo específico y cobertura (S1, S3).

---

## 7. Ejemplos reales de Bolivia y Latinoamérica

Solo aparecen casos cuyo enlace abrí. Lo que dice la nota va aparte de mi interpretación.

1. **Fábrica de pisos de goma Mamut (Bolivia, 2019).** El sistema de 10 kWp, financiado con un modelo basado en el ahorro por la ONG Energética y diseñado/instalado por Innovación Sostenible, cubriría más de la mitad del consumo eléctrico en un día normal. Inversión de USD 15.200, payback esperado menor a 5 años, ahorro inicial de unos USD 200/mes, energía solar a 0,42 Bs/kWh (aprox. la mitad de lo que paga a la distribuidora), producción de "al menos 13.400 kWh al año". Son proyecciones de 2019, no resultados medidos, y las cifras no cierran bien entre sí (sección 4, punto 10). [Energías Renovables, 6/5/2019](https://www.energias-renovables.com/fotovoltaica/anuncian-el-primer-sistema-fotovoltaico-de-generacion-20190506)
2. **Programa BID de eficiencia en alumbrado público municipal (Bolivia, 2024).** Préstamo de USD 35 millones, 20 años de amortización y 10 de gracia, tasa basada en SOFR; el BID estima un ahorro de cerca de 50 % en el costo del servicio de alumbrado. Es una proyección de la nota de prensa del organismo. [Factor Energético, 14/2/2024](https://factorenergetico.mx/bolivia-impulsara-la-eficiencia-energetica-en-sus-sistemas-de-alumbrado-publico-con-apoyo-del-bid)
3. **Programa de Seguro de Ahorros de Energía en Colombia (BID, Bancóldex).** Tres casos presentados por los organizadores del programa: Hotel Villamarta (Turbaco, 10 kWp, inversión de unos USD 30.000, ahorro de 15 % contra el escenario base, retorno de unos 4 años incluyendo deducciones fiscales de USD 12.000 en 5 años); Hospital Universitario Mayor-Méderi (Bogotá, sistema de agua caliente solar con respaldo de bomba de calor, inversión de COP 700 millones/USD 230.000, ahorro de 46.200 m3 de gas por año equivalente a USD 24.000 al año); Hotel Neiva Plaza (reemplazo de calderas por solar térmico, inversión de COP 120 millones/USD 30.000, ahorro de 70 %, retorno menor a 3 años). Son cifras del propio programa, no una evaluación independiente. [Webinario ESI Colombia, Green Finance LAC](https://greenfinancelac.org/wp-content/uploads/2019/04/Casos_de_Exito_Colombia_Webinar.pdf). **[Cálculo mío]**: el caso Méderi da un payback simple de unos 9-10 años (230.000 / 24.000), mucho más largo que el de los hoteles, lo que ilustra por qué dos proyectos "de ahorro" no se comparan solo por la etiqueta.
4. **Contexto de política en Bolivia (no es un proyecto, pero afecta a todos).** Notas de prensa sobre el retiro del subsidio a combustibles y el cambio del tipo de cambio en 2025-2026 (ver S11, S12, S13).

No encontré, en las fuentes que abrí, un caso boliviano con resultados medidos (ahorro realizado versus proyectado). Ver sección 9.

---

## 8. Fuentes

Nivel A = libro, paper, organismo, manual universitario o de gobierno. B = consultora, reporte sectorial, prensa, ficha institucional. C = blog, práctica.

| N.º | Fuente | Nivel | Qué abrí y cuánto leí | Enlace |
|---|---|---|---|---|
| S1 | Joshua Kneifel y David Webb, *Life Cycle Costing Manual for the Federal Energy Management Program*, NIST Handbook 135, edición 2022 (el PDF abierto figura como retirado y reemplazado por la versión actualizada de mayo de 2022; no leí la actualización) | A | Leí los capítulos 5.1 (LCC), 6.2 (SIR), 6.4 (payback simple y descontado) y 8.2 (sensibilidad) | https://nvlpubs.nist.gov/nistpubs/hb/2022/NIST.HB.135e2022.pdf |
| S2 | Meredith Fowlie, Michael Greenstone y Catherine Wolfram, "Do Energy Efficiency Investments Deliver? Evidence from the Weatherization Assistance Program", NBER Working Paper 21331 (2015); publicado luego en *The Quarterly Journal of Economics* | A | Solo el resumen y la ficha de la página de NBER (no el texto completo) | https://www.nber.org/papers/w21331 |
| S3 | Fiona Burlig, "Making Energy Efficiency Work", EPIC (Universidad de Chicago). El año no figura en el texto que leí; hace referencia a datos de 2020 | A | Leí la primera parte y la figura de tasas de realización | https://epic.uchicago.edu/wp-content/uploads/sites/5/2025/06/Making-Energy-Efficiency-Work.pdf |
| S4 | Gobierno de Nueva Gales del Sur (Australia), *Guide to measurement and verification of energy efficiency projects in Australia, Module 2*, agosto de 2024 | A | Leí el índice y las secciones sobre opciones IPMVP, opción B contra C, eventos no rutinarios y período de reporte | https://www.energy.nsw.gov.au/sites/default/files/2023-09/Measurement_and_Verification_Guide_Module2_Aug_2023.pdf |
| S5 | Dirk Jordan y Sarah Kurtz, "Photovoltaic Degradation Rates: An Analytical Review" (NREL, 2012; *Progress in Photovoltaics*, 2013) | A | Solo el resumen en OSTI | https://www.osti.gov/biblio/1045052 |
| S6 | Agencia Internacional de Energía (IEA), *Energy Service Companies (ESCOs)*, sección "Energy performance contract models" | A | Leí la página (modelos de ahorro garantizado y compartido, reparto de riesgos, Chile) | https://www.iea.org/reports/energy-service-companies-escos-2/esco-contracts |
| S7 | IEA, *Multiple Benefits of Energy Efficiency* (junio de 2025) | A | Leí la página pública; no trae cifras ni método | https://www.iea.org/reports/multiple-benefits-of-energy-efficiency |
| S8 | CRE (distribuidora, Santa Cruz), ficha "Generación Distribuida" 2026 | B (ficha de una empresa regulada) | Leí el texto completo de la ficha | https://www.cre.com.bo/wp-content/uploads/2026/06/F.-GENERACION-DISTRIBUIDA-2026.pdf |
| S9 | Energías Renovables, nota sobre el sistema fotovoltaico de Mamut, 6/5/2019 | B (prensa especializada) | Leí la nota | https://www.energias-renovables.com/fotovoltaica/anuncian-el-primer-sistema-fotovoltaico-de-generacion-20190506 |
| S10 | BID/Bancóldex, webinario "Programa ESI en Colombia, casos de éxito" (Green Finance LAC) | B (presentación de un programa) | Leí el documento completo (5 páginas) | https://greenfinancelac.org/wp-content/uploads/2019/04/Casos_de_Exito_Colombia_Webinar.pdf |
| S11 | Infobae, "Bolivia congela el precio del combustible por seis meses...", 13/7/2026 | B (prensa) | Leí la nota | https://www.infobae.com/america/2026/07/13/bolivia-congela-el-precio-del-combustible-por-seis-meses-en-medio-de-la-crisis-de-abastecimiento-y-calidad/ |
| S12 | Emol (nota de EFE), crisis del precio del diésel en Bolivia, 21/9/2026 | B (prensa) | Leí la nota | https://www.emol.com/noticias/Economia/2026/09/21/1212023/bolivia-crisis-combustible-precio-diesel.html |
| S13 | Los Tiempos, tipo de cambio flexible: nota del 29/6/2026 y del 6/7/2026 | B (prensa) | Leí ambas notas | https://www.lostiempos.com/actualidad/economia/20260629/rige-nuevo-regimen-tipo-cambio-flexible-del-dolar-bs-973-valor-se y https://www.lostiempos.com/actualidad/pais/20260706/dolar-flexible-marca-fin-era-abre-nuevo-escenario-economico |
| S14 | elpais.bo, republicado por eju.tv, sobre el gas, las termoeléctricas y las tarifas (10/5/2026) | B (prensa) | Leí la nota | https://eju.tv/?p=4974861 |
| S15 | Gabriel Navia Quiroga (comunicador del sector eléctrico), columna sobre el DS 5503, Correo del Sur, 21/12/2025 | C (opinión) | Leí la columna. No es el texto del decreto | https://correodelsur.com/opinion/20251221/el-decreto-supremo-5503-desde-la-perspectiva-del-sector-electrico.html |

Conteo: **15 fuentes numeradas**; **7 de nivel A**, de las cuales **leí con contenido** S1, S3, S4 y S6 (4); S2, S5 y S7 las abrí solo a nivel de resumen o página corta. Cumple el mínimo de 4 fuentes A abiertas y leídas, aunque dos de ellas (S3, S4) las leí por partes y no enteras.

---

## 9. No confirmado

### 9.1 Cosas que vi solo en resúmenes de búsqueda (no abrí la fuente; no las uses como dato)
- **Guía de la agencia ambiental alemana (UBA) sobre sistemas ISO 50001**, con anexos sobre payback y VAN de medidas de eficiencia. El resumen citaba que fijar plazos de recuperación de 3 años es problemático. La URL no abrió (404 / bloqueo). El resumen decía que la edición es de mayo de 2020.
- **Descomposición de la brecha de ahorro** (Christensen, Francisco, Myers y Souza, 2021): 41 % sesgo del modelo de ingeniería, 43 % calidad de la instalación, 6 % rebote. El PDF era demasiado grande para abrirlo.
- **Estudio de escuelas de California** (Burlig y otros): ahorro de 24 % del esperado. Solo en resumen.
- **Revisión de rebote** (Sorrell, Dimitropoulos y Sommerville, 2009; menor a 30 % en hogares de países OCDE) y meta-análisis del OECD (2016) para transporte: 12 % en el corto plazo y 32 % en el largo plazo. Solo en resúmenes. No hay un estudio de rebote industrial.
- **Análisis de reemplazo** (defender y challenger, costos hundidos, vida económica): solo en apuntes de universidades (NPTEL y otros) vistos en un resumen. No abrí un libro de texto ni un manual completo de ingeniería económica. Libros como Baca Urbina o Sapag Chain no se leyeron (ver taxonomía).
- **Niveles de auditoría energética ASHRAE** (nivel 1, 2 y 3): solo en resumen de varios sitios de empresas. Tampoco la cifra de USD 5.000 contra USD 100.000.
- **Programas de financiamiento en Bolivia**: BDP (programa de ecoeficiencia con GEF/PNUD, bono temático de unos USD 15 millones), CAF (línea de USD 152,5 millones en 2020), GREENPYME. Las páginas devolvieron error 403. No tengo tasas, plazos ni condiciones.
- **ESI (Energy Savings Insurance) del BID**: las páginas del BID dieron error 403. Lo que sé del programa viene del webinario de Colombia (S10). No hallé evidencia de que esté operando en Bolivia.
- **Tipo de cambio posterior** (11,52 a 12,15 Bs/USD entre julio y agosto de 2026) y alerta de gremios de que las importaciones subirían 3 %-10 %: solo en resúmenes. S13 confirma el inicio en 9,73 y la devaluación de cerca de 40 %.
- **Cifras del subsidio**: USD 1.500-2.000 millones por año (Infobae/otros resúmenes) frente a USD 2.600 millones (Emol/S12). No abrí un dato oficial.

### 9.2 Inconsistencias entre fuentes que sí abrí
- **Precio del diésel**: S11 dice 9,80 Bs/L en diciembre de 2025 (+162 %); S13 (6/7/2026) dice +123 %; S15 dice 5,69 Bs/L en el DS 5503; S12 dice 17,95 Bs/L en septiembre de 2026. Puede ser que correspondan a distintos segmentos de consumidor (grandes, pequeños) o distintas fechas, pero no pude conciliarlo. **No sé cuál es el precio vigente hoy.** S11 dice además que habría un congelamiento hasta enero de 2027, y S12 reporta un aumento posterior: no logré conciliarlo.
- **Nota de Mamut (S9)**: las cifras no se reconstruyen entre sí (sección 4, punto 10). Tampoco indica si hay medición posterior ni si el sistema opera hoy.

### 9.3 Lo que no encontré
- **Un caso boliviano con ahorro medido** (realizado contra proyectado) en una empresa. Solo proyecciones (Mamut, alumbrado público).
- **Estructura de las tarifas eléctricas industriales de Bolivia** (cargos por energía, potencia, factor de potencia, tramos horarios) y su valor actual. No lo busqué en la AETN/ENDE directamente.
- **El monto de retribución por energía inyectada** (Resolución AETN 380/2024) y los límites de potencia de las resoluciones de 2026: la ficha de CRE (S8) las nombra pero no da valores.
- **Un valor de tasa de realización para proyectos industriales o de Latinoamérica**. Las cifras de S2 y S3 son de programas residenciales y escolares de EE.UU. y México.
- **Impuestos**: no verifiqué cómo tributa el ahorro (el ahorro aumenta la utilidad gravada por el IUE) ni el tratamiento de la depreciación acelerada. S15 menciona una depreciación acelerada (art. 28 del DS 5503) y arancel 0 % para maquinaria industrial hasta fin de 2026 (art. 37), pero es una columna de opinión, no el decreto.
- **Los parámetros de la vida útil de inversores, baterías y equipos de proceso**: no tengo fuente abierta; todas las cifras de "fallas a los 8-12 años" son estimaciones mías.
- **IPMVP original** (Efficiency Valuation Organization): no abrí el protocolo oficial. Las opciones A-D las confirmé en la guía de NSW (S4), que se basa en él.
- **Los efectos reales de la medida de política** (retiro de subsidios, tipo de cambio flexible) sobre la rentabilidad de proyectos de ahorro: es mi razonamiento. Las fuentes dan precios y fechas, no evaluaciones de impacto sobre proyectos de eficiencia.
- **Todas las magnitudes marcadas "estimación"** en la sección 5 y las fórmulas marcadas [Interpretación] en las secciones 2 y 6: son hipótesis de trabajo para calibrar, no datos.
