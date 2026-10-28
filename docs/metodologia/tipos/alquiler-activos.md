# Alquiler de activos (renta de inmuebles, locales, salones, parqueos, equipos, maquinaria, vehículos): ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que yo la abrí y leí (el alcance de lo leído está en esa sección).
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es cita.
- Una magnitud marcada **(estimación)** la puse yo para que el simulador tenga un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente en su contexto (otro país, otro sector, otra fecha), así que tampoco es un parámetro "verdadero" para Bolivia.
- Una fórmula marcada **(de memoria)** es práctica general de la industria que reconstruí sin haberla visto escrita en una fuente abierta; verifícala antes de implementarla.
- Lo que no pude verificar está en la sección 9; las cifras que necesitan calibración local, en la sección 10.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto de alquiler de activos compra o construye un activo (un departamento, un local, un salón, un parqueo, una excavadora, un camión) y cobra una renta periódica a cambio de ceder su uso. No vende el activo: lo "vende por pedazos de tiempo". En la taxonomía general de SIMPRO es el tipo A6 (`00-taxonomia-tipos.md`).

**Cómo aporta valor.** El valor viene de tres fuentes distintas, que conviene no mezclar:

1. **Renta (flujo).** Lo que el activo deja cada mes después de vacancia, morosidad y gastos de operación. La práctica de tasación lo expresa así: ingreso bruto potencial, menos vacancia y pérdidas de cobranza, igual al ingreso bruto efectivo; menos gastos de operación, igual al ingreso neto [S1][S2].
2. **Valor del activo (stock).** El activo vale, aproximadamente, el ingreso neto de un año dividido por una tasa de capitalización que sale del mercado [S1][S2][S8]. Si el ingreso neto sube o la tasa baja, el activo vale más (plusvalía); si ocurre lo contrario, vale menos.
3. **Uso del activo por terceros con capital propio.** El dueño del activo no necesita operar un negocio encima: cobra por poner el activo a disposición. Esa es la idea de "alquiler" como forma de cobrar (ver taxonomía general).

**Por qué es distinto para un simulador.** El motor genérico (caja, ingresos, costos, reputación) trata el ingreso como "clientes x precio". Aquí el ingreso depende de **cuántas unidades están ocupadas** (capacidad fija), de **contratos que duran meses o años** (no se renegocian cada mes) y de un **activo que se desgasta y se revalúa**. Cuatro rasgos que el motor genérico no captura bien:

- La capacidad es fija: una unidad vacía un mes no se recupera después (interpretación mía; mismo principio que la taxonomía aplica a hoteles y salones).
- Los contratos amortiguan y retrasan los cambios del mercado: el mercado puede bajar y tú sigues cobrando la renta vieja hasta que el contrato vence, y al revés [S4].
- El activo envejece: sin mantenimiento la renta cae o la vacancia sube; con mantenimiento hay un gasto grande e irregular.
- Una parte importante del resultado final está en el **valor del activo al año 5**, no en la renta de los 5 años.

---

## 2. Indicadores propios y cómo se calculan

Convención: renta anual = 12 x renta mensual. Los nombres en inglés se mantienen porque son los que el alumno verá en libros y en el mercado.

### 2.1 De la renta al ingreso neto (el "cascadón" de la tasación)

| Concepto | Fórmula | Fuente |
|---|---|---|
| Ingreso bruto potencial (PGI / GSI) | Renta de mercado de todas las unidades, como si estuvieran 100% ocupadas y pagadas | [S1] lo llama "Gross Scheduled Income"; [S2] "Potential Gross Income" |
| Vacancia y pérdida por cobranza (V&CL) | Renta que no entra por unidades vacías o por inquilinos que no pagan; se expresa como porcentaje del ingreso bruto potencial | [S1][S2]. Ejemplos de las fuentes: 3% [S1][S2] (es un ejemplo didáctico, no un benchmark) |
| Ingreso bruto efectivo (EGI) | PGI - vacancia y pérdida por cobranza | [S1][S2] |
| Gastos de operación | Mantenimiento corriente, administración, servicios que paga el dueño, impuestos, seguros. No incluyen cuota de deuda | [S1] insiste en no "contaminar" el NOI con costos que no son de operación; [S2] usa gastos como 25% del EGI en su ejemplo |
| Ingreso neto operativo (NOI) | EGI - gastos de operación | [S1]. [S2] lo llama "net income before recapture and taxes" y es la misma idea |

Ejemplo de [S1], problema 10-1: ingreso bruto potencial 100.000; vacancia y pérdida 3%; gastos 34.000. EGI = 97.000; NOI = 63.000.

### 2.2 Valor y rentabilidad del activo

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Cap rate** (tasa de capitalización) | Cap rate = NOI / valor (o precio) | [S1] |
| **Valor por capitalización** | Valor = NOI / cap rate | [S1][S2][S8] |
| NOI necesario para un cap rate dado | NOI = valor x cap rate | [S1] |
| Qué es la cap rate | Convierte el ingreso neto esperado en un valor presente; combina una tasa de retorno **sobre** el capital y una tasa de retorno **del** capital (recuperación) | [S8], que es una guía de un financista hipotecario de EE. UU., no un texto académico |
| De dónde sale la cap rate | Ventas comparables, publicaciones, encuestas a participantes del mercado, y modelos de "banda de inversión" y de cobertura de deuda | [S8] |
| Advertencia clave | La capitalización directa usa solo el ingreso del primer año, pero la tasa "esconde" supuestos sobre cómo se espera que cambie el ingreso; pequeños cambios en la tasa producen grandes cambios en el valor | [S8] (cita al Appraisal Journal 1959 y al Appraisal Institute) |
| Rentabilidad bruta de alquiler (como la publica el mercado) | Renta anual / precio del inmueble. En Bolivia la prensa reporta 5% a 7% con picos de 8% en Santa Cruz [S13]; no se explica el método | [S13], fuente periodística; ver sección 9 |

### 2.3 Indicadores de operación

| Indicador | Fórmula | Fuente |
|---|---|---|
| Tasa de ocupación | Unidades (o días-unidad) ocupadas / unidades (o días-unidad) disponibles | Definición básica; para equipos, [S16] la llama "time utilization" = días rentados / días rentables |
| Vacancia | 1 - ocupación. También puede medirse en dinero (renta no cobrada / renta potencial) | [S1][S2] la usan en dinero |
| **Utilización en dinero (equipos)** | Ingreso anual por alquiler / costo del equipo | [S16], fuente de práctica (blog de software); su ejemplo: equipo de 500.000 con ingreso de 250.000 da 50% |
| Meta de utilización (equipos) | La fuente menciona que 65% de utilización en tiempo es una meta común y 55% a 65% de utilización en dinero en cadenas grandes, y advierte que depende de la flota y que pasarse de la meta desgasta el equipo | [S16], solo orden de magnitud de EE. UU. |
| Multiplicador de renta bruta (GRM) | Precio / renta bruta anual | (de memoria) |
| Rendimiento sobre costo (yield on cost) | NOI del año 1 estabilizado / costo total de compra o construcción | (de memoria) |
| Retorno efectivo sobre capital propio (cash-on-cash) | Flujo anual después de cuota de deuda / capital propio invertido | (de memoria) |
| Cobertura de deuda (DSCR) | NOI / cuota anual de deuda (capital + interés). Debajo de 1 no alcanza para pagar | (de memoria) |
| Punto de equilibrio de ocupación | (gastos de operación + cuota de deuda) / ingreso bruto potencial | (de memoria; es álgebra a partir de las definiciones de [S1]) |
| Morosidad de inquilinos | Renta vencida impaga / renta facturada | (de memoria); en [S1][S2] entra dentro de "pérdida por cobranza" |

### 2.4 Vacancia "natural" y renta de mercado

La literatura académica de oficinas usa dos ideas útiles para el simulador:

- **Vacancia natural.** Es el nivel de vacancia al que la renta de mercado no sube ni baja. Cuando la vacancia real está por debajo de la natural, las rentas suben; por encima, bajan [S3]. [S3] encuentra poca evidencia de que la vacancia natural cambie con el tiempo o por circunstancias especiales, y propone un modelo con oferta y demanda que funciona mejor que el modelo solo de vacancia (aplicado a oficinas de la City de Londres).
- **Vacancia oculta.** Como los contratos son de varios períodos, los inquilinos se quedan con rentas firmadas antes aunque la renta de mercado haya cambiado. [S4] (oficinas de Estocolmo, 1977-2002) define la vacancia oculta como la diferencia entre la ocupación observada y la demanda a la renta actual, y estima que al mercado le toma **5 a 10 años** ajustarse a un shock; en su simulación, la vacancia natural es 7% y, tras un shock positivo de empleo, la vacancia abierta cae de 7% a menos de 4% mientras la oculta sube casi lo mismo [S4]. Son datos de oficinas en Suecia: sirven para la **forma** del comportamiento (lento, con rezago), no para las cifras bolivianas.
- Un estudio de oficinas en Texas citado en una búsqueda estimaba vacancias naturales de 17% a 22% (resumen de búsqueda; no abrí el documento, no lo uso como dato).

### 2.5 Descomposición del retorno: renta vs plusvalía

**Interpretación mía, no cita:** el retorno total de un activo en un año es aproximadamente la rentabilidad por renta (NOI / valor) más la variación del valor. Como valor = NOI / cap rate [S1], el valor cambia si cambia el NOI o si cambia la cap rate. Por eso un proyecto puede tener rentas estables y aun así perder plata si la cap rate sube. [S8] lo respalda en parte: dice que, con un cap rate de mercado, pequeños cambios en la tasa mueven mucho el valor.

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Resumen.** El VAN y la TIR siguen siendo la base: hay una inversión inicial (comprar o construir el activo), flujos anuales (la renta neta) y un valor al final del horizonte. Lo que cambia es que (a) el flujo anual no es "ingresos planos" sino un NOI que depende de ocupación, morosidad y gastos, y (b) **el valor residual pesa muchísimo** y se calcula con una cap rate, no es "cero" ni "lo que costó".

**Qué falla si se usa el VAN simplificado:**

1. **Ignorar el valor residual.** Un edificio que rinde 6% de renta y se revaloriza 3% por año no tiene el mismo VAN si el alumno supone que a los 5 años vale cero. Al revés, suponer que vale lo mismo que costó sin mirar la cap rate de mercado puede ser optimista. La forma de estimarlo es la que usa la tasación: NOI del año siguiente / cap rate de salida [S1][S8] (la aplicación a un horizonte de 5 años es interpretación mía).
2. **Vacancia y morosidad "promedio".** [S1][S2] las descuentan como un porcentaje fijo del ingreso potencial. En la realidad la vacancia es un evento (el inquilino se va y la unidad queda vacía varios meses) y la caja se tensa justo cuando hay que pagar la deuda. Por eso conviene mirar el **mínimo de caja**, no solo el promedio.
3. **Contratos que retrasan el mercado.** Si las rentas bajan en el mercado, el dueño con contratos largos no lo siente de inmediato, pero tampoco puede subir cuando el mercado sube [S4]. El VAN con una renta que crece cada año por inflación no refleja ese rezago.
4. **Gasto de capital irregular.** El mantenimiento mayor no es un porcentaje parejo: es un pico cada varios años. [S1] pide separar los gastos de operación reales; [S2] menciona una "provisión de recuperación" (allowance for recapture) como concepto distinto del gasto operativo. En un VAN anual, un pico de mantenimiento en el año 3 puede cambiar el signo de ese año.
5. **TIR engañosa** cuando el valor residual domina el flujo (la TIR se vuelve casi una apuesta sobre la plusvalía). Esto es práctica general de evaluación; ninguna de las fuentes que abrí lo dice así, ver sección 9.

**Qué agregar al análisis:**

| Complemento | Qué responde | Fuente |
|---|---|---|
| NOI y cap rate de entrada | Qué rinde el activo por renta, comparado con el mercado | [S1] |
| Valor residual con cap rate de salida | Cuánto vale el activo al año 5 | [S1][S8] (aplicación al horizonte: interpretación mía) |
| DSCR y punto de equilibrio de ocupación | Cuánta vacancia aguanta el proyecto antes de no poder pagar la deuda | (de memoria) |
| Cash-on-cash sobre capital propio | Qué rinde el capital del dueño cuando hay deuda | (de memoria) |
| Sensibilidad a ocupación, renta, cap rate y tipo de cambio | Qué palanca importa más | Interpretación mía; [S8] respalda la sensibilidad a la cap rate |
| Mínimo de caja y reserva de mantenimiento | Cuánto capital de trabajo hace falta | Interpretación mía |

**Lo que no se debe hacer:** comparar la cap rate o la vacancia con un benchmark ajeno sin mirar el contexto. [S8] dice que la tasa debe derivarse de transacciones del mercado propio y que el listado de rangos sin sustento es una debilidad. Las cifras de [S1][S2] son ejemplos de manual.

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Nota de método: no encontré un estudio sobre errores de estudiantes bolivianos en proyectos de alquiler. La lista mezcla lo que dicen las fuentes (marcado) con práctica común o interpretación mía (sin marca).

**Errores de cálculo (estudiantes)**

1. **Suponer 100% de ocupación todos los meses.** Las fuentes de tasación siempre descuentan vacancia y pérdida por cobranza [S1][S2].
2. **Contar la cuota de deuda dentro del NOI.** [S1] advierte expresamente que meter costos que no son de operación "contamina" el NOI y, con él, el valor estimado.
3. **Confundir renta con rentabilidad.** Decir "alquilo a Bs X al mes" sin dividir por el precio del activo; o comparar una cap rate con una tasa de interés sin ver que la primera no incluye plusvalía ni deuda.
4. **Valor residual cero o igual al costo.** Ver sección 3.
5. **Mantenimiento como porcentaje parejo del ingreso** en vez de reserva más picos de reparación mayor.
6. **Ignorar el tipo de cambio** cuando el activo o los insumos están en dólares y la renta en bolivianos (o al revés). La prensa boliviana reportó en 2011 que casi 90% de los contratos de alquiler de vivienda estaban en dólares, según el decano de Economía de la UMSA [S12]; el dato es viejo y no sé cuánto se mantiene hoy.
7. **No incluir impuestos y facturación.** Las personas con ingresos solo por alquiler deben emitir factura de alquiler y presentar declaraciones periódicas [S17], fuente de práctica.
8. **Crecimiento de renta lineal e indefinido.** Los contratos y la competencia limitan el alza [S4].
9. **Tratar el anticrético como ingreso.** El anticrético no es una renta: es dinero recibido que hay que **devolver** al terminar el contrato [S10] (ver situación 7).

**Errores de emprendedores**

1. **Comprar apalancado contando con que "la renta paga la cuota"** sin calcular el DSCR ni el mínimo de ocupación (de memoria como práctica común).
2. **Confiar en cifras de rentabilidad de portal inmobiliario.** La nota de InfoCasas sobre Bolivia (5% a 7%, hasta 8% en Santa Cruz) no explica el método y proviene de comparar precios de oferta de venta y de alquiler [S13].
3. **Subestimar la regulación.** La regulación puede cambiar de golpe: en Bolivia la Ley 1342 de 2020 impuso una reducción del 50% del canon (con topes) y prohibió desalojos y aumentos por un período [S6]. En Argentina la ley de alquileres de 2020 y su derogación en 2023 movieron la oferta y los precios [S9].
4. **Contratos verbales o privados no registrados.** En el anticrético, la ley exige documento público e inscripción para efectos frente a terceros, pero la mayoría se firma en privado [S10]. Eso deja al dueño y al inquilino expuestos a conflictos.
5. **Operar un activo cuyo costo en dólares sube** (reparaciones, repuestos, equipos importados) con renta en bolivianos (ver situación 3).
6. **Descuidar el mantenimiento para "mostrar" más renta**, hasta que el activo pierde valor o inquilinos. Es una intuición razonable; la literatura económica sobre control de rentas menciona la negligencia de mantenimiento como un costo temido de los topes a la renta (citado en [S5], no es evidencia propia de ese paper).
7. **Pensar que alquilar siempre es más seguro que operar un negocio.** El riesgo de vacancia y de morosidad es real y se concentra: una sola unidad vacía en un proyecto de 1 a 3 unidades es un 33% a 100% del ingreso (aritmética mía).

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **[Sn]** viene de fuente, **(estimación)** es mía); decisiones del alumno con ventajas y costos; qué aprende.

Aviso general: las magnitudes de fuente vienen de otros países y sectores y son orden de magnitud. Las "estimación" son mías y conviene calibrarlas con alguien del rubro antes de implementarlas (sección 10).

---

### Situación 1. El inquilino principal se va (vacancia prolongada)

**Qué pasa.** El inquilino más importante (por ejemplo, el local que paga la mayor renta o la empresa que alquilaba toda la oficina) avisa que no renueva. La unidad queda vacía un tiempo hasta conseguir otro. En proyectos con pocas unidades, un solo inquilino es una parte grande del ingreso.

**Variables que mueve.**
- Ocupación: baja (la unidad pasa a vacía; con 4 unidades, -25 puntos).
- Ingreso: baja la renta de esa unidad durante los meses de vacancia (estimación: 2 a 6 meses de vacancia según tipo de activo y zona; la literatura de oficinas dice que el mercado tarda años en ajustarse [S4], pero no da meses por unidad).
- Gastos fijos (servicios que paga el dueño, impuesto, seguro): no bajan.
- Caja: se tensa, sobre todo si hay cuota de deuda.
- Costo de recolocar: comisión y publicidad (estimación: 0,5 a 1 mes de renta).

**Decisiones del alumno.**
1. *Bajar la renta para llenar rápido.* Ventaja: se ocupa pronto y se corta la pérdida. Costo: la renta nueva queda más baja por todo el contrato y reduce el valor del activo (valor = NOI / cap rate [S1]).
2. *Esperar al inquilino "bueno" a la renta de lista.* Ventaja: protege la renta y el valor. Costo: meses de ingreso cero; la caja puede no alcanzar para la cuota.
3. *Invertir en acondicionar (pintura, instalaciones, fachada) y relanzar.* Ventaja: atrae mejor inquilino y justifica la renta. Costo: gasto inmediato con retorno incierto, además de más meses vacío.
4. *Subdividir o cambiar el uso (por ejemplo, un local grande en dos).* Ventaja: diversifica el riesgo y puede aumentar la renta total. Costo: obra, permisos municipales (no investigué la normativa) y más trabajo de administración.

**Qué aprende.** Que la vacancia es un evento con costo de caja, que la renta de lista no es la renta que se cobra, y que el valor del activo depende de la renta que firmas.

---

### Situación 2. Morosidad de un inquilino y desalojo lento

**Qué pasa.** Un inquilino deja de pagar. El dueño debe decidir cómo recuperar el inmueble o la plata. En Bolivia, el sistema judicial puede ser lento, y la información que encontré sobre contratos de anticrético muestra casos de inquilinos que dejaron de pagar tras vencer el contrato y de contratos sin respaldo legal [S10]. No pude abrir el texto del Código Civil sobre locación ni procedimientos de desalojo (sección 9).

**Variables que mueve.**
- Cobranza: baja (renta facturada pero no cobrada).
- Pérdida por cobranza: sube (en [S1][S2] es una línea del cálculo; el 3% es solo un ejemplo).
- Gastos legales: suben (estimación: 1 a 4 meses de renta).
- Tiempo hasta recuperar la unidad: meses (estimación: 3 a 12 meses según el caso; no hay dato verificado de Bolivia).
- Reputación del dueño y relación con otros inquilinos: neutral o levemente negativa (estimación).

**Decisiones del alumno.**
1. *Demanda de desalojo inmediata.* Ventaja: da una señal firme y es la vía para recuperar la unidad. Costo: honorarios, tiempo y posible daño al inmueble; no hay renta mientras dura.
2. *Negociar un plan de pagos y mantener al inquilino.* Ventaja: puede recuperar parte de lo adeudado y evita vacancia. Costo: si el inquilino no cumple, se pierde más tiempo; otros inquilinos pueden pedir lo mismo.
3. *Ejecutar la garantía o el depósito (si lo hay).* Ventaja: rápido y barato. Costo: la garantía suele cubrir 1 a 3 meses (estimación); si el contrato es verbal o informal, no hay con qué.
4. *Exigir mejor garantía a futuros inquilinos (depósito mayor, fiador, contrato notariado).* Ventaja: reduce el riesgo futuro. Costo: se achica el grupo de inquilinos posibles y la unidad tarda más en alquilarse.

**Qué aprende.** Que la morosidad no es un porcentaje: es un caso concreto con tiempo y costo legal; que un buen contrato vale por lo que cuesta hacerlo cumplir.

---

### Situación 3. Contratos en dólares y brecha cambiaria

**Qué pasa.** Una parte del proyecto está pactada en dólares (renta, o también el precio del activo o de las reparaciones) y otra en bolivianos. Con un tipo de cambio oficial de 6,96 Bs por dólar sostenido por años y un paralelo que llegó hasta 19 Bs en el gobierno anterior y cerró 2025 en torno a 9,6 Bs, según Los Tiempos [S14] (la misma nota cita un tipo de referencia del BCB de 7,89 para la compra y 8,55 para la venta, y dice que la brecha persiste), "cuánto vale un dólar" depende de a qué tipo de cambio se pague y se cobre. La prensa de 2011 ya señalaba que casi 90% de los contratos de alquiler de viviendas estaban en dólares [S12]; el dato es antiguo y no lo pude actualizar.

**Variables que mueve.**
- Renta efectiva en bolivianos: sube o baja según la moneda del contrato y el tipo de cambio aplicado (estimación de rango: entre -30% y +40% en el valor en bolivianos de una renta en dólares, según se cobre al oficial o al paralelo; los extremos oficial-paralelo salen de [S14], la conversión a renta es aritmética mía).
- Capacidad de pago del inquilino: baja si su ingreso es en bolivianos y la renta está en dólares (el salario mínimo de 2.750 Bs equivale a 398 USD al oficial y a unos 180 USD al paralelo, nota de eju.tv que apareció en la búsqueda, no la abrí).
- Morosidad: sube (estimación: +2 a +8 puntos si hay renta en dólares y el paralelo sube).
- Costos de reparación y repuestos importados: suben (estimación).

**Decisiones del alumno.**
1. *Fijar la renta en dólares.* Ventaja: protege el valor real del ingreso frente a devaluación. Costo: el inquilino puede no poder pagar y el dueño queda expuesto a conflictos sobre a qué tipo de cambio se paga (no verifiqué la normativa boliviana sobre contratos en moneda extranjera).
2. *Fijar la renta en bolivianos con ajuste periódico por inflación o por un tramo en dólares.* Ventaja: más fácil de cobrar. Costo: si el tipo de cambio paralelo sube más rápido, el dueño pierde poder adquisitivo hasta el próximo ajuste. [S9] muestra, para Argentina, que un índice de ajuste anual por debajo de la inflación significó una pérdida de renta de hasta 20,3% para el dueño en 2023.
3. *Contrato mixto (parte en dólares, parte en bolivianos).* Ventaja: reparte el riesgo. Costo: más complejo de explicar, de cobrar y de hacer cumplir.
4. *No cambiar nada y absorber.* Ventaja: no pierde inquilinos. Costo: el valor real del ingreso se erosiona sin que nadie lo vea.

**Qué aprende.** Que la moneda del contrato es una decisión de riesgo, no un detalle, y que la renta nominal puede subir mientras la renta real baja.

---

### Situación 4. El Estado interviene los alquileres

**Qué pasa.** La autoridad congela las rentas, obliga a reducirlas o prohíbe desalojos por un período. Precedente boliviano: la Ley 1342 de 2020 (Ley Excepcional de Arrendamientos) dispuso una reducción del 50% del canon si no había acuerdo previo entre las partes, con topes por tipo de uso (Bs 5.000 vivienda, Bs 7.000 tiendas, comercio o servicios, y Bs 15.000 industria), prohibió desalojos durante la cuarentena y hasta tres meses después, y congeló el canon hasta el 31 de diciembre de 2020. A cambio, ofrecía al propietario la condonación del 50% del RC-IVA sobre el alquiler y la posibilidad de rebajas municipales en el impuesto a la propiedad [S6]. Fue una medida excepcional por pandemia. Un cambio futuro podría tomar otra forma (esa extrapolación es mía).

**Variables que mueve.**
- Renta cobrada: baja hasta 50% en las unidades alcanzadas [S6] (el 50% es el valor de la ley de 2020; para un evento futuro, la magnitud es estimación).
- Aumento de rentas permitido: cero durante el período [S6].
- Vacancia: no sube por desalojo (prohibido) pero se frena la rotación.
- Oferta futura de alquileres: puede bajar si los dueños deciden vender o no alquilar. En San Francisco, un estudio con datos de individuos encontró que los dueños alcanzados por el control redujeron la oferta de alquiler en 15% y causaron un alza de 5,1% de las rentas en toda la ciudad [S5]; en Bahía Blanca, tras la ley argentina, los departamentos ofertados pasaron de un promedio de 197 a 20 unidades entre 2020 y 2022 (-89,9%) [S9]. Ambos son contextos ajenos a Bolivia.
- Valor del activo: baja (menor NOI esperado y mayor incertidumbre regulatoria, lo que sube la cap rate; interpretación mía).

**Decisiones del alumno.**
1. *Acordar una rebaja negociada con cada inquilino.* Ventaja: según [S6], quien acuerda puede acceder a los beneficios fiscales (condonación de RC-IVA con la reducción mínima del 50%). Costo: menos renta durante el período y poca capacidad de recuperarla.
2. *Acatar la norma y esperar.* Ventaja: sin conflictos legales. Costo: sin acuerdo, se aplica el 50% de reducción automática.
3. *Vender el activo antes de que la medida se endurezca.* Ventaja: salir. Costo: venderlo con la cap rate más alta (precio más bajo) y perder el flujo futuro; si todos venden, el precio cae.
4. *Cambiar el uso o el tipo de inquilino a una categoría no alcanzada (por ejemplo, de vivienda a oficina, si los topes son distintos).* Ventaja: puede evitar el tope. Costo: obras, permisos y un mercado distinto.

**Qué aprende.** Que la regulación es un riesgo de política, que los incentivos de la norma pueden reducir la oferta y que la renta pactada no es renta garantizada.

---

### Situación 5. Mantenimiento mayor y desgaste del activo

**Qué pasa.** Una falla grande: filtración de techo, instalación eléctrica o sanitaria vieja, ascensor, motor de un equipo, transmisión de un camión. El activo envejece y exige reparaciones de un monto mucho mayor al mantenimiento corriente. Si no se repara, el inquilino se queja o se va; si se repara, la caja sufre.

**Variables que mueve.**
- Estado físico del activo: baja con el tiempo y con la utilización (estimación: pérdida anual de 2 a 5 puntos de un índice de 0 a 100; [S16] advierte que una utilización demasiado alta de equipos acelera el desgaste, sin dar cifras).
- Gasto de capital: pico (estimación: 5% a 20% del valor del activo en un evento mayor).
- Ocupación: baja si no se repara (estimación: -10 a -30 puntos en la unidad afectada).
- Renta que se puede cobrar: baja si el estado se deteriora.
- Valor del activo: baja si se posterga (la renta de mercado cae y, con ella, el NOI futuro; interpretación mía).

**Decisiones del alumno.**
1. *Reparar de inmediato con reserva propia.* Ventaja: protege la renta y el valor. Costo: consume la caja, y si no hay reserva el proyecto queda sin capital de trabajo.
2. *Reparar con crédito.* Ventaja: no vacía la caja. Costo: aumenta la cuota y baja el DSCR (de memoria).
3. *Postergar y reparar solo lo urgente.* Ventaja: ahorra hoy. Costo: el problema crece; los inquilinos se van o piden descuento; el deterioro se acumula.
4. *Subir la renta para financiar una renovación completa.* Ventaja: la renovación puede justificar una renta mayor. Costo: riesgo de perder inquilinos durante la obra y de no poder subir la renta si el mercado no lo acepta.

**Qué aprende.** Que el mantenimiento no es un gasto parejo sino una reserva, y que un activo mal mantenido pierde renta y valor [S1] (el NOI es la base del valor).

---

### Situación 6. Oferta de compra por el activo (renta vs plusvalía)

**Qué pasa.** Alguien ofrece comprar el activo a un precio mayor al que el alumno estimó. Hay que decidir: seguir cobrando la renta o realizar la plusvalía. La oferta implica una cap rate de salida: precio = NOI / cap rate [S1]. Si el comprador acepta una cap rate baja, está pagando más por el mismo ingreso.

**Variables que mueve.**
- Valor del activo: sube (estimación: +10% a +30% sobre la estimación base).
- Renta futura: se pierde si se vende.
- Caja: entra de golpe el precio de venta; sale la deuda asociada.
- Impuestos a la transferencia (no investigué la normativa boliviana).

**Decisiones del alumno.**
1. *Vender y reinvertir en otro activo.* Ventaja: realiza la ganancia. Costo: costos de transacción, impuestos y el riesgo de no encontrar un activo mejor.
2. *Rechazar y seguir con la renta.* Ventaja: mantiene un flujo estable. Costo: si el mercado se enfría, esa oferta puede no volver.
3. *Vender parcialmente (venta de una unidad o un porcentaje).* Ventaja: financia mejoras y conserva parte de la renta. Costo: complejidad legal (propiedad horizontal, copropiedad); no la investigué.
4. *Pedir un precio mayor y esperar.* Ventaja: puede capturar más valor. Costo: el comprador puede retirarse.

**Qué aprende.** Que el valor depende de la cap rate de mercado, que renta y plusvalía son fuentes distintas de retorno, y que el precio de oferta no es el valor.

---

### Situación 7. Financiarse con anticrético en vez de deuda

**Qué pasa.** El dueño puede dar el inmueble en **anticrético**: recibe de una vez una suma grande de dinero del anticresista y, a cambio, el anticresista vive o usa el inmueble sin pagar alquiler hasta que el dueño le devuelva la suma. En el Código Civil boliviano, según los artículos citados en un auto supremo, el acreedor tiene derecho a percibir los frutos del inmueble, imputándolos primero a los intereses (si se deben) y luego al capital (art. 1429); tiene derecho de retención y de preferencia (art. 1431); y el plazo no puede superar cinco años, con retención hasta que se le pague (art. 1435) [S7]. Según un reportaje, el contrato debe constar en documento público y surte efecto frente a terceros desde su inscripción en Derechos Reales (art. 1430), pero la mayoría de los contratos se firma en privado, por unos dos años y sin registro [S10]. Según ese reportaje, el INE registraba 2,9% de hogares en anticrético frente a 16,4% en alquiler [S10]. Un decano de Economía advirtió en 2011 que con alquileres más altos y dólar devaluado hay menos anticréticos porque "ya no es rentable" [S12].

**Variables que mueve.**
- Caja: entra el capital del anticresista (en los casos del reportaje, entre 15.000 y 18.000 USD [S10]; para un proyecto en SIMPRO, la magnitud sería estimación).
- Renta en efectivo: baja a cero para esa unidad (el anticresista no paga alquiler).
- Pasivo: sube (hay que devolver el capital al final; no es ingreso).
- Costo de oportunidad: el dueño "paga" con el uso del inmueble; el anticresista gana el interés implícito.
- Riesgo de devolución: si el contrato vence y no hay con qué devolver, el anticresista retiene el inmueble [S7].
- Riesgo de moneda: en uno de los casos del reportaje, el monto a devolver subió de 18.000 a 25.000 USD porque el dueño pidió aumentos no pactados [S10], y otro dueño devolvió parte en bolivianos.

**Decisiones del alumno.**
1. *Dar un inmueble en anticrético y usar el capital en otro activo que rinda más.* Ventaja: financiamiento sin interés en efectivo. Costo: se renuncia a la renta de ese inmueble y se asume una deuda en dólares a devolver; el éxito depende de que el nuevo activo rinda más que el costo implícito.
2. *Mantener el alquiler tradicional.* Ventaja: flujo mensual y sin deuda. Costo: no se obtiene el capital de golpe.
3. *Usar anticrético solo con contrato público e inscrito.* Ventaja: seguridad jurídica para ambos. Costo: notario y registro, y menor acceso a anticresistas que prefieren lo informal.
4. *Pedir crédito bancario y alquilar.* Ventaja: se conserva la renta. Costo: la cuota de deuda se come parte de la renta; hay que pasar el análisis del banco.

**Qué aprende.** Que el anticrético es una deuda disfrazada de contrato de uso, que no es ingreso, y que su costo real depende del uso alternativo del capital y del riesgo de devolución.

---

### Situación 8. Renovación de contratos: subir la renta o retener al inquilino

**Qué pasa.** Vencen varios contratos a la vez. El mercado cambió desde que se firmaron. Hay que decidir cuánto ajustar. Los contratos largos hacen que la renta existente se desacople de la de mercado y producen vacancia oculta [S4].

**Variables que mueve.**
- Renta promedio: sube si se ajusta al mercado (estimación: +5% a +15% si el mercado subió, magnitud mía).
- Rotación: sube si se ajusta mucho (el inquilino se va).
- Vacancia: sube si se pierden inquilinos; el modelo de [S3] dice que cuando la vacancia real está bajo la natural, las rentas de mercado suben.
- Costo de recolocar: sube con cada salida.

**Decisiones del alumno.**
1. *Subir al valor de mercado en todos los contratos.* Ventaja: maximiza el NOI y el valor. Costo: puede perder inquilinos y tener una vacancia que borre el aumento.
2. *Subida moderada con contrato más largo.* Ventaja: retiene inquilinos y reduce vacancia. Costo: queda la renta atada a un valor que el mercado puede superar.
3. *No subir y priorizar ocupación plena.* Ventaja: caja estable. Costo: la renta real baja si hay inflación; el valor del activo no crece.
4. *Indexar la renta a un índice o a una moneda.* Ventaja: protege del rezago. Costo: el inquilino puede rechazarlo; en Argentina el ajuste por índice generó problemas tanto para el dueño como para el inquilino según el momento [S9].

**Qué aprende.** Que la renta firmada se desacopla de la de mercado y que subir la renta tiene un costo en vacancia.

---

### Situación 9. Nueva oferta en la zona (sobreoferta y competencia)

**Qué pasa.** Se inaugura un edificio nuevo, un centro comercial, un conjunto de departamentos o aparecen muchos alquileres de corta estadía. La oferta crece más rápido que la demanda y las rentas presionan a la baja. En Santa Cruz, los datos comerciales de Airbtics (Airbnb) registran 2.121 anuncios activos, un aumento de 68,8% en un año y 137,3% en tres años, con ocupación promedio de 45% (septiembre 2025 a agosto 2026) [S15]; es un dato de alquiler de corta estadía y de una empresa comercial, no de alquileres de largo plazo. Cadecocruz reportó que el porcentaje de personas que alquilan en el eje central subió de 24,5% (2014) a 30% (2018), con rentas a la baja según la nota [S11].

**Variables que mueve.**
- Renta de mercado: baja (estimación: -5% a -15%).
- Ocupación propia: baja (estimación: -5 a -15 puntos).
- Tiempo para alquilar: sube.
- Valor del activo: baja (menor NOI y posible alza de cap rate).

**Decisiones del alumno.**
1. *Bajar la renta para igualar a la competencia.* Ventaja: mantiene la ocupación. Costo: reduce NOI y valor, y obliga a las demás unidades a bajar también.
2. *Diferenciar (mejor servicio, amoblado, seguridad, estacionamiento).* Ventaja: justifica renta mayor. Costo: inversión y mayores gastos de operación.
3. *Cambiar de segmento (por ejemplo, de largo plazo a estadía corta).* Ventaja: puede ganar más por noche. Costo: la ocupación promedio es menor (45% en [S15]), hay más gestión y rotación, y los anuncios crecen rápido.
4. *Esperar a que el mercado se corrija.* Ventaja: sin gasto. Costo: meses de vacancia.

**Qué aprende.** Que el mercado es local, que la oferta nueva presiona la renta, y que la misma unidad en otro segmento tiene otra ocupación y otros costos.

---

### Situación 10. Estacionalidad y renta de corta estadía

**Qué pasa.** Si el proyecto alquila por noche, por evento o por hora (salón de eventos, cancha, parqueo por día, departamentos amoblados), los ingresos dependen de temporadas. En Santa Cruz, Airbtics reporta una estacionalidad moderada, con demanda más alta en junio y más débil en marzo [S15]. Para un salón de eventos, la demanda se concentra en fines de semana y fin de año (la taxonomía lo marca como característica, A5).

**Variables que mueve.**
- Ocupación mensual: oscila (estimación: factor 0,6 a 1,4 sobre el promedio según mes).
- Tarifa: la tarifa diaria promedio de Airbnb en Santa Cruz es de unos 30 USD [S15].
- Caja: negativa en meses bajos si hay costos fijos.
- Costos variables (limpieza, servicios): se mueven con la ocupación.

**Decisiones del alumno.**
1. *Tarifas dinámicas (más altas en temporada, más bajas en baja).* Ventaja: aprovecha la demanda. Costo: más gestión; puede alejar clientes habituales.
2. *Ofrecer contratos mensuales en temporada baja.* Ventaja: llena huecos. Costo: ingreso por día menor y se pierde la opción de vender a temporada alta.
3. *Constituir una reserva en temporada alta para cubrir la baja.* Ventaja: estabiliza la caja. Costo: se retiene dinero que se podría reinvertir.
4. *Diversificar usos (eventos, reuniones, coworking).* Ventaja: reduce dependencia de una temporada. Costo: más complejidad operativa.

**Qué aprende.** Que la ocupación promedio engaña: la caja se quiebra en el mes malo, no en el promedio.

---

### Situación 11. Daño, robo o uso indebido de un equipo alquilado

**Qué pasa.** (Vale para maquinaria, vehículos, equipos de eventos.) Un equipo vuelve dañado, no vuelve o es usado más allá de lo pactado. La utilización alta aumenta los ingresos, pero acelera el desgaste [S16].

**Variables que mueve.**
- Estado físico del equipo: baja.
- Gasto de reparación: sube (estimación: 5% a 30% del valor del equipo en un daño mayor).
- Días de indisponibilidad: suben, y con ellos la utilización en tiempo baja.
- Pérdida total: posible en robo (estimación: valor del equipo menos lo que pague el seguro).

**Decisiones del alumno.**
1. *Cobrar garantía y reparación al cliente.* Ventaja: traslada el costo. Costo: conflicto, cobranza, y clientes que no vuelven.
2. *Contratar seguro.* Ventaja: reduce la pérdida extrema. Costo: prima anual fija (estimación: 1% a 4% del valor del equipo) y exclusiones; no investigué el mercado de seguros boliviano.
3. *Exigir operador propio (cobrar con operador).* Ventaja: menos daño. Costo: más personal y menos clientes que quieren operar ellos mismos.
4. *Limitar la utilización a un nivel sostenible.* Ventaja: alarga la vida del equipo. Costo: menos ingreso hoy, como advierte [S16] al decir que superar la meta de utilización puede gastar la flota antes de recuperar la inversión.

**Qué aprende.** Que más utilización no siempre es mejor; hay que mirar utilización en tiempo y en dinero juntas [S16].

---

### Situación 12. Fiscalización y obligaciones tributarias del alquiler

**Qué pasa.** El Servicio de Impuestos Nacionales exige factura de alquiler a las personas con ingresos solo por alquileres, con declaraciones mensuales y trimestrales y multas por atraso [S17]. Un dueño informal que no factura queda expuesto. Un dato adicional: la Ley 1342 de 2020 mencionó el RC-IVA sobre alquileres, lo que indica que ese impuesto aplica a los propietarios personas naturales [S6]. No verifiqué en fuente oficial las tasas vigentes (sección 9).

**Variables que mueve.**
- Gastos de operación: suben (impuestos y contador; estimación: 13% a 20% de la renta entre IVA, IT y RC-IVA según el esquema; **no verificado**, usa solo para probar el mecanismo).
- Multas por incumplimiento: puntuales (según [S17], 50 a 100 UFV por declaración tardía para personas naturales, fuente de blog).
- Renta neta: baja.
- Renta formal vs informal: algunos inquilinos (empresas) exigen factura.

**Decisiones del alumno.**
1. *Formalizarse y facturar todo.* Ventaja: acceso a inquilinos formales y sin riesgo de multa. Costo: impuestos y trabajo administrativo.
2. *Seguir informal y cobrar menos.* Ventaja: ahorro de impuestos. Costo: riesgo de multa; no puede alquilar a empresas que exigen factura.
3. *Trasladar el impuesto a la renta (renta + impuestos).* Ventaja: protege el margen. Costo: la renta nominal sube y puede perder inquilinos.
4. *Constituir una sociedad para alquilar.* Ventaja: orden contable. Costo: otro régimen tributario (en [S17] las empresas arrendadoras caen en IUE) y más costo de contador.

**Qué aprende.** Que la renta bruta no es la neta y que formalizar tiene costo y beneficio.

---

### Situación 13. Suba de tasa o endurecimiento del crédito (apalancamiento)

**Qué pasa.** El proyecto se financió con deuda. La cuota sube (tasa variable) o el banco no renueva. Con el activo sin cambio, el NOI debe cubrir una cuota mayor.

**Variables que mueve.**
- Cuota de deuda: sube (estimación: +10% a +30% si la tasa es variable).
- DSCR: baja (de memoria).
- Caja: se estrecha.
- Cap rate de mercado: tiende a subir con tasas más altas (interpretación mía; [S8] dice que la cap rate refleja la tasa de retorno sobre el capital).
- Valor del activo: baja.

**Decisiones del alumno.**
1. *Refinanciar a más plazo.* Ventaja: baja la cuota. Costo: más interés total.
2. *Pagar deuda con la venta de una unidad o con ahorro.* Ventaja: reduce el riesgo. Costo: se pierde renta o se vacía la caja.
3. *Subir rentas para cubrir la cuota.* Ventaja: protege el DSCR. Costo: riesgo de vacancia (ver situación 8).
4. *Aportar más capital propio.* Ventaja: evita la presión. Costo: menor retorno sobre capital propio.

**Qué aprende.** Que el apalancamiento multiplica retorno y riesgo, y que la renta debe cubrir la deuda con margen.

---

### Situación 14. Siniestro (incendio, inundación) o uso irregular del inmueble

**Qué pasa.** El inmueble sufre un incendio, una inundación o es ocupado de forma irregular o usado para una actividad no autorizada. El activo queda fuera de servicio y puede haber responsabilidad legal. No investigué la situación de ocupaciones irregulares ("avasallamientos") ni los seguros de inmuebles en Bolivia; la incluyo como riesgo genérico del tipo.

**Variables que mueve.**
- Ocupación: cae a cero en el activo afectado durante la reparación o el litigio (estimación: 3 a 12 meses).
- Gasto de reparación o de defensa legal: sube (estimación: 10% a 40% del valor del activo en un siniestro grave).
- Valor del activo: baja o queda en suspenso.
- Seguro: cubre una parte si existe.

**Decisiones del alumno.**
1. *Contratar seguro de inmueble.* Ventaja: reduce la pérdida extrema. Costo: prima anual (estimación: 0,2% a 0,8% del valor) y cobertura incompleta.
2. *Autoasegurarse con reserva.* Ventaja: no paga prima. Costo: un evento grande puede superar la reserva.
3. *Invertir en prevención (instalaciones, extintores, vigilancia).* Ventaja: menos probabilidad. Costo: gasto fijo con beneficio invisible.
4. *Diversificar en varios activos.* Ventaja: un evento no frena todo el ingreso. Costo: requiere más capital.

**Qué aprende.** Que el riesgo de cola existe, que el seguro cuesta y que concentrar todo en un activo es una decisión de riesgo.

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

Propuesta de variables de estado. Las fórmulas son una propuesta para discusión con el owner, no una especificación cerrada.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| `unidades_total` | Cantidad de unidades alquilables (departamentos, locales, equipos, parqueos) | Fija, o cambia con compra, venta o subdivisión |
| `unidades_ocupadas` | Unidades con contrato vigente y pagando o debiendo | Menos las que terminan contrato, más las nuevas; las nuevas llegan según demanda y renta relativa al mercado |
| `ocupacion` | `unidades_ocupadas / unidades_total` | Calculada cada mes |
| `renta_lista` | Renta que el dueño pide por unidad | Decisión del alumno; sube con indexación o renovación |
| `renta_mercado` | Renta a la que se alquila en la zona | Se mueve con una vacancia natural: sube si la vacancia de la zona está bajo la natural, baja si está sobre [S3]; con ruido y con eventos |
| `renta_contratada` | Renta efectiva de los contratos vigentes | Cada contrato tiene fecha de vencimiento; se acerca a `renta_mercado` solo al renovar (rezago, vacancia oculta [S4]) |
| `meses_vacante_promedio` | Tiempo que tarda una unidad vacía en alquilarse | Depende de `renta_lista / renta_mercado`, estado físico y competencia |
| `morosidad` | Porcentaje de la renta facturada que no se cobra | Base + efecto de brecha cambiaria, ciclo económico y garantías; los casos graves son eventos |
| `moneda_contrato` | Porcentaje de la renta pactada en dólares | Decisión del alumno por contrato |
| `tipo_cambio` | Oficial y paralelo (y brecha) | Serie exógena con shocks (ver [S14] para el rango observado) |
| `estado_fisico` | Índice 0-100 del estado del activo | Baja con el tiempo y con la utilización; sube con inversión en mantenimiento |
| `reserva_mantenimiento` | Fondo para reparaciones mayores | Aporte mensual del alumno; se consume con eventos |
| `utilizacion_tiempo` y `utilizacion_dinero` | Para equipos: días rentados / días rentables; ingreso anual / costo del equipo [S16] | Calculadas; la utilización alta baja `estado_fisico` más rápido |
| `noi_mensual` | Ingreso neto operativo | `renta_cobrada - gastos_operacion`, sin cuota de deuda [S1] |
| `cap_rate_mercado` | Tasa de capitalización de la zona | Serie exógena lenta, con shocks regulatorios o de tasas [S8] |
| `valor_activo` | Valor del activo | `NOI_12m / cap_rate_mercado` ajustado por `estado_fisico` [S1] |
| `deuda` y `cuota` | Saldo y cuota de crédito | Amortización mensual; la tasa puede ser fija o variable |
| `pasivo_anticretico` | Capital recibido en anticrético que hay que devolver | Suma de los contratos vigentes; vence a los 5 años como máximo [S7] |
| `regulacion_alquileres` | Estado del régimen (libre, congelamiento, reducción de canon) | Estado discreto con eventos [S6] |
| `competencia_zona` | Oferta nueva en la zona | Serie exógena con eventos |
| `estacionalidad` | Factor mensual de demanda (para renta de corta estadía) | Tabla de 12 factores por tipo de activo |

---

## 7. Ejemplos reales de Bolivia o Latinoamérica

Solo aparecen casos cuyo enlace abrí. Lo que dice la nota va en "Qué dice la fuente"; no es mi evaluación.

| Caso | País | Qué dice la fuente | Enlace |
|---|---|---|---|
| Ley Excepcional de Arrendamientos (Ley 1342, 2020) | Bolivia | Reducción del 50% del canon sin acuerdo previo, topes de canon por uso, prohibición de desalojos y congelamiento hasta el 31/12/2020; beneficios fiscales para el propietario | [Lexivox, Ley 1342](https://www.lexivox.org/norms/BO-L-N1342.html) |
| Reportaje sobre anticrético | Bolivia | Casos de anticresistas que pagaron USD 15.000 a 18.000, dueños que subieron el monto sin pacto, contratos privados no registrados; dato INE citado: 2,9% de hogares en anticrético y 16,4% en alquiler | [Fundación para el Periodismo, 30/8/2018](https://fundacionperiodismo.org/?p=4459) |
| Cadecocruz: alquiler en el eje central | Bolivia | Los hogares que alquilan pasaron de 24,5% (2014) a 30% (2018); rentas a la baja; renta promedio "$us 213" en el informe 2018 | [eju.tv, 28/4/2019](https://eju.tv/?p=1345536) |
| Rentas en La Paz y contratos en dólares | Bolivia | Alquiler de departamentos y casas +20% desde 2010; "casi el 90 por ciento" de los contratos de vivienda en dólares (decano de Economía UMSA); el anticrético "ya no es rentable" | [eju.tv, 24/1/2011](https://eju.tv/?p=123057) |
| Rentabilidad de alquiler (InfoCasas) | Bolivia | Rentabilidad de 5% a 7% en Bolivia; hasta 8% anual en zonas de Santa Cruz; La Paz y Cochabamba cerca de 6% | [eju.tv, 30/11/2018](https://eju.tv/?p=1247468) |
| Airbnb en Santa Cruz | Bolivia | Ocupación 45%, tarifa 30 USD/noche, 2.121 anuncios activos (+68,8% en un año), estacionalidad moderada (datos comerciales, sep 2025 a ago 2026) | [Airbtics](https://airbtics.com/annual-airbnb-revenue-in-santa-cruz-bolivia-es) |
| Ley de alquileres y derogación en Bahía Blanca | Argentina (Latam) | Con la ley, los departamentos ofertados cayeron de 197 a 20 (promedio) entre 2020 y 2022; el ajuste por ICL generó pérdidas de hasta 20,3% para el dueño en 2023; tras el DNU 70/2023, la oferta se recuperó parcialmente | [CREEBBA, Informe de Actualidad Económica](https://www.creebba.org.ar/iae/iae192/2_ley_alquileres_IAE_192.pdf) |
| Control de rentas en San Francisco | EE. UU. (no es Latam; evidencia académica) | Dueños alcanzados redujeron la oferta de alquiler 15% y las rentas de la ciudad subieron 5,1%; los inquilinos protegidos se mudaron 20% menos | [NBER WP 24181](https://www.nber.org/papers/w24181.pdf) |

Sobre ejemplos boliviano de **maquinaria, vehículos, parqueos o salones** con cifras de alquiler: no encontré ni abrí ninguno con datos. Las salas de eventos de El Alto aparecen en la taxonomía general (A5/A6), pero no las reabrí en esta tarea.

---

## 8. Fuentes numeradas con nivel

"Leído" indica qué parte abrí y pude leer con texto.

| N.º | Fuente | Nivel | Qué leí | Enlace |
|---|---|---|---|---|
| S1 | Frank Gallinelli, extracto del capítulo 10 "Capitalization Rate" de *Mastering Real Estate Investment: Examples, Metrics and Case Studies*, © RealData, Inc., 2008. Solo el extracto de 4 páginas; no confirmé edición, editorial del libro ni ficha de catálogo | A (libro, extracto) | Texto completo del extracto: fórmulas de cap rate y valor, cascadón PGI a NOI, problemas resueltos | https://www.realdata.com/mrei/Mastering_Real_Estate_Investment_Ch10.pdf |
| S2 | California State Board of Equalization, "Lesson 12: Valuation of Property Using Overall Rates (The Income Approach to Value)" | A (material de organismo público) | Texto leído de la lección y su Ejemplo 12-1 | https://www.boe.ca.gov/info/iav/lesson12.htm |
| S3 | Patric Hendershott, Bryan MacGregor y Raymond Tse, "Estimating the Rental Adjustment Process", NBER WP 7912 (septiembre 2000; versión publicada en *Real Estate Economics*, 2002) | A (paper) | Solo la página de resumen del NBER; no leí el documento completo | https://nber.org/papers/w7912 |
| S4 | Peter Englund, Åke Gunnelin, Patric Hendershott y Bo Söderberg, "Adjustment in Property Space Markets: Estimates from the Stockholm Office Market", NBER WP 11345 (mayo 2005, revisado julio 2006) | A (paper) | Resumen e introducción (vacancia natural, vacancia oculta, 5 a 10 años de ajuste); no leí el modelo completo | https://www.nber.org/system/files/working_papers/w11345/w11345.pdf |
| S5 | Rebecca Diamond, Timothy McQuade y Franklin Qian, "The Effects of Rent Control Expansion on Tenants, Landlords, and Inequality: Evidence from San Francisco", NBER WP 24181 (enero 2018; publicado después en *American Economic Review*, según un resumen de búsqueda que no confirmé en la página de la revista) | A (paper) | Resumen, introducción y partes de resultados | https://www.nber.org/papers/w24181.pdf |
| S6 | Ley N.° 1342, Ley Excepcional de Arrendamientos (Bolivia, 27/8/2020), texto en Lexivox | A (norma) | Artículos 1 a 9 | https://www.lexivox.org/norms/BO-L-N1342.html |
| S7 | Tribunal Supremo de Justicia de Bolivia, Auto Supremo AS/0532/2022 (29/7/2022), considerando III, doctrina aplicable (cita arts. 1429, 1431 y 1435 del Código Civil y una definición doctrinal de Papaño, Kiper, Dillon y Causse) | A (resolución judicial) | Texto citado de los artículos; no el Código Civil completo | https://juristeca.com/bo/tsj/auto-supremo/2022/07/auto-supremo-as-0532-2022/considerando-iiidoctrina-aplicable-al-caso |
| S8 | Freddie Mac, "Capitalization Rate Guidance", marzo 2025 | B (guía de una entidad financiera de EE. UU.; cita al Appraisal Institute y a USPAP) | Texto completo | https://mf.freddiemac.com/docs/capitalization_rate_guidance.pdf |
| S9 | CREEBBA (Bahía Blanca, Argentina), "Impacto de la implementación y derogación de la ley de alquileres en Bahía Blanca", Informe de Actualidad Económica n.º 192, 2025 | B (centro de estudios regional) | Texto completo del estudio | https://www.creebba.org.ar/iae/iae192/2_ley_alquileres_IAE_192.pdf |
| S10 | Fundación para el Periodismo, "Conflictos legales y económicos en la modalidad de habitabilidad" (anticrético), 30/8/2018 | B (periodismo) | Texto leído (resumen por herramienta) | https://fundacionperiodismo.org/?p=4459 |
| S11 | eju.tv, "Demanda de alquileres crece un 5,5% en ciudades del eje central" (28/4/2019, cita Cadecocruz y El Deber) | B (prensa) | Texto leído | https://eju.tv/?p=1345536 |
| S12 | eju.tv (fuente La Prensa), "El alquiler de departamentos y casas subió en 20% desde 2010" (24/1/2011) | B (prensa) | Texto leído | https://eju.tv/?p=123057 |
| S13 | eju.tv, nota del equipo de InfoCasas sobre rentabilidad de alquiler en Bolivia (30/11/2018) | B/C (prensa con datos de portal inmobiliario) | Texto leído | https://eju.tv/?p=1247468 |
| S14 | Los Tiempos, "El dólar paralelo cierra 2025 en Bs 9,60 tras un año de escasez y alta volatilidad" (31/12/2025) | B (prensa) | Texto leído | https://www.lostiempos.com/actualidad/economia/20251231/dolar-paralelo-cierra-2025-bs-960-ano-escasez-alta-volatilidad |
| S15 | Airbtics, página de ingresos de Airbnb en Santa Cruz, Bolivia | C (empresa de datos comerciales) | Texto leído (actualizada 16/10/2026) | https://airbtics.com/annual-airbnb-revenue-in-santa-cruz-bolivia-es |
| S16 | Intempo Software, "Equipment rental metrics: time and dollar utilization" | C (blog de software) | Texto leído | https://www.intemposoftware.com/blog/equipment-rental-metrics-time-dollar-utilization |
| S17 | Bolivia Impuestos, "Todo sobre alquileres" | C (blog tributario) | Texto leído | https://boliviaimpuestos.com/todo-sobre-alquileres/ |

**Conteo.** 17 fuentes distintas. Nivel A: 7 (S1 a S7), todas con texto abierto, aunque de alcance desigual: S1 es un extracto de un libro, S3 es solo resumen, S4 y S5 son resumen e introducción. Si se exige lectura completa de texto, cuentan con certeza S1, S2, S6 y S7 (4), y de forma parcial S3, S4 y S5. **Se llega al mínimo de 4 fuentes A, con esa advertencia.**

---

## 9. No confirmado

- **Código Civil boliviano sobre locación (alquiler).** No pude abrir los artículos sobre duración, ajuste, desahucio, subarrendamiento ni reparaciones. Un texto de Lexivox que intenté abrir devolvió el Código Penal. Una búsqueda solo mostró una ley boliviana de 1959 sobre alquileres, cuyo estado vigente no verifiqué. No describo el régimen general de alquiler en Bolivia.
- **Anticrético.** Confirmé el contenido de los arts. 1429, 1431 y 1435 (citados en un auto supremo [S7]) y los arts. 1430 y 1435 según el reportaje [S10]. No abrí el texto oficial del Código Civil. El artículo 1432 y siguientes no los vi.
- **Ley 1342.** La leí en Lexivox. La página muestra "29 de octubre de 2020" en el encabezado, y el texto indica que fue dictada el 27 de agosto de 2020; otra fuente de búsqueda dice que se publicó el 29 de octubre. No resolví la discrepancia de fechas. No abrí el DS 4450 que la reglamenta.
- **Normativa vigente de regulación de alquileres en Bolivia hoy.** No encontré si hay una ley general de alquileres, topes de aumento o procesos de desalojo vigentes aparte de la Ley 1342 (que fue temporal).
- **Tipo de cambio.** La nota de Los Tiempos [S14] da el oficial (6,96), un referencial del BCB (7,89 compra y 8,55 venta) y el paralelo (9,60). No resolví si el régimen cambiario oficial cambió en 2025 o 2026.
- **Proporción actual de contratos en dólares.** Solo tengo el dato de 2011 (casi 90%) [S12]. No hay dato actual.
- **Impuestos del alquiler.** Las tasas (IVA, IT, RC-IVA) las vi en resúmenes de blogs, no en el SIN; una de las páginas no traía las tasas. Las multas en UFV son de [S17], fuente de blog. No incluyo tasas como dato.
- **Cap rates y vacancia en Bolivia.** No encontré cap rate ni vacancia publicadas por una fuente confiable boliviana (Cadecocruz, ASFI, INE, consultoras). Solo la rentabilidad bruta periodística de 5%-7% [S13], sin método.
- **INE Censo 2024.** No encontré la tabla de tenencia de vivienda (propia, alquiler, anticrético) del censo 2024. El 2,9% de anticrético y 16,4% de alquiler vienen de un reportaje de 2018 que cita al INE [S10].
- **Aplicabilidad de la evidencia extranjera.** S3 y S4 son sobre oficinas (Londres, Estocolmo); S5 sobre vivienda en San Francisco; S9 sobre vivienda en una ciudad argentina; S16 sobre maquinaria en EE. UU. No sé cuánto se traslada a Bolivia.
- **Textos que no abrí.** Estudio de oficinas de Texas (vacancias naturales de 17% a 22%), monografía del BID "Se busca vivienda en alquiler" (el servidor del BID bloqueó la consulta y un PDF de IUT dio 404), el DS 4450, Appraisal of Real Estate y libros de tasación o de bienes raíces completos (solo S1 extracto). No cito autores, ediciones ni editoriales de libros que no confirmé en catálogo.
- **Fórmulas marcadas (de memoria):** GRM, yield on cost, cash-on-cash, DSCR, punto de equilibrio de ocupación y morosidad. Son prácticas generales que no vi escritas en una fuente abierta en esta tarea.
- **Relación cap rate = tasa de descuento - crecimiento.** Es una relación conocida en finanzas, pero no la vi enunciada en las fuentes abiertas; no la uso como dato.
- **El valor de salida con cap rate en un horizonte de 5 años** como método estándar de evaluación de proyectos es mi propuesta de aplicación, no una cita.
- **Depreciación contable y reserva de reposición.** [S2] menciona "allowance for recapture" pero no profundicé; no verifiqué la norma contable ni la tributaria boliviana sobre depreciación de inmuebles y equipos.
- **Avasallamientos, seguros de inmuebles, permisos municipales de cambio de uso y costos de transacción (notaría, Derechos Reales, impuestos de transferencia).** No investigados.

---

## 10. Cifras que necesitan validación local

| Cifra | Dónde aparece | Estado | Quién podría aportarla |
|---|---|---|---|
| Vacancia típica por tipo de activo y ciudad (vivienda, local comercial, oficina, salón, parqueo, equipos) | Secc. 2, 5 | Sin dato de Bolivia | Cadecocruz, Cámara de Construcción de La Paz y Cochabamba, corredores inmobiliarios, INE, docentes de la carrera |
| Meses promedio para alquilar una unidad vacía | Sit. 1, 8 | Estimación (2 a 6 meses) | Corredores y administradores de edificios |
| Cap rate y rentabilidad neta de alquiler por ciudad y tipo de activo | Secc. 2, 3, 6 | Solo 5% a 7% bruta de prensa [S13] | Corredores, tasadores, ASFI o bancos (créditos hipotecarios) |
| Proporción de contratos en dólares hoy y práctica de cobro (oficial vs paralelo) | Sit. 3 | Solo dato 2011 [S12] | Colegio de abogados, asociaciones de propietarios, inmobiliarias |
| Impacto de la brecha cambiaria en la renta efectiva (-30% a +40%) | Sit. 3 | Estimación | Docente de economía, BCB, inmobiliarias |
| Morosidad típica de inquilinos y tiempo/costo de un desalojo en Bolivia | Sit. 2 | Estimación (3 a 12 meses; 1 a 4 meses de renta) | Abogados civiles, jueces, administradores |
| Monto y práctica de garantías (meses de depósito) | Sit. 2 | Estimación (1 a 3 meses) | Inmobiliarias y abogados |
| Gasto de mantenimiento: tasa anual y picos (5% a 20% del valor) | Sit. 5, 11 | Estimación | Administradores de edificios, constructores, empresarios de alquiler de maquinaria |
| Pérdida anual del estado físico (2 a 5 puntos) | Sit. 5 | Estimación | Ingenieros civiles, tasadores |
| Prima de seguro de inmuebles y equipos (0,2%-0,8% y 1%-4%) | Sit. 11, 14 | Estimación | Aseguradoras |
| Alza o caída de renta de mercado por oferta nueva (-5% a -15%) | Sit. 9 | Estimación | Cadecocruz, inmobiliarias |
| Estacionalidad mensual por tipo de activo | Sit. 10 | Solo "moderada, pico en junio, bajo en marzo" para Airbnb [S15] | Hoteleros, dueños de salones, plataformas |
| Impuestos reales del alquiler (IVA, IT, RC-IVA, IUE) y su aplicación en parqueos, salones y equipos | Sit. 12 | No verificado | Servicio de Impuestos Nacionales, contador, docente de tributación |
| Montos y plazos del anticrético hoy (porcentaje del valor del inmueble, plazos reales) | Sit. 7 | Solo casos de 2006 a 2018 [S10] | Notarios, Derechos Reales, corredores |
| Utilización típica y tarifas de alquiler de maquinaria y vehículos en Bolivia | Secc. 2, Sit. 11 | Metas de EE. UU. [S16] | Empresarios del rubro, Cámara de Construcción |
| Tasas y plazos de crédito para comprar o construir activos de renta | Sit. 13 | Estimación | ASFI, bancos, docentes de finanzas |
| Efecto de una nueva regulación (magnitud de caída de oferta) | Sit. 4 | Datos de EE. UU. y Argentina [S5][S9] | Docente, gremios de propietarios, Defensoría |
| Cap rate de salida y plusvalía anual del inmueble por ciudad | Sit. 6, secc. 3 | Sin dato de Bolivia | Tasadores, Cadecocruz, INE (índices de precios de vivienda, si existen) |
