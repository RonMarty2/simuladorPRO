# Concesión y tarifa por uso de infraestructura: ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que yo la abrí y leí (el alcance de lo leído está en esa sección).
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es cita.
- Una magnitud marcada **(estimación)** la puse yo para que el simulador tenga un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro país, otro sector, otra fecha), así que tampoco es un parámetro "verdadero" para Bolivia.
- Una fórmula marcada **(de memoria)** es una fórmula estándar que reconstruyo sin haberla visto en una fuente abierta.
- Lo que no pude verificar está en la sección 9. Las cifras que necesitan validación local están en la sección 10.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto de concesión o de tarifa por uso construye (o recibe) una obra o un servicio con capacidad fija (un tramo de carretera con peaje, una red de agua potable, una distribuidora de electricidad, un teleférico, una terminal) y cobra a los usuarios una tarifa por cada uso o por cada metro cúbico o kilovatio hora consumido. Dos rasgos lo distinguen de otros negocios:

1. **La tarifa casi nunca la fija quien presta el servicio.** La fija o la aprueba una autoridad. En Bolivia, el agua potable es regulada por la AAPS: ningún operador puede subir tarifas domésticas sin presentarle informes técnicos, económico-financieros y sociales, y sin demostrar el problema que lo justifica [S9]. Los peajes de la Red Vial Fundamental los cobra Vías Bolivia y la tarifa se aprueba por resolución del Ministerio de Obras Públicas [S6].
2. **El activo vuelve al Estado.** En una concesión típica, el privado controla la obra por un plazo y al final los activos pasan a propiedad del gobierno [S2]. El proyecto no tiene "valor de venta" al final; solo tiene valor mientras dure el plazo.

**Cómo aporta valor.** Según la literatura, el valor del esquema no está en que "libere fondos públicos". Engel, Fischer y Galetovic muestran que una alianza público-privada (APP) no libera fondos: el Estado se ahorra la inversión al inicio, pero cede ingresos futuros por el mismo valor [S2]. El valor, cuando existe, viene de otras fuentes: juntar construcción y operación en un solo contrato (el privado cuida el mantenimiento porque lo paga él), y cobrar al usuario en lugar de cobrar impuestos [S2]. Para el alumno, la traducción es: el proyecto genera valor si logra dos cosas a la vez, prestar el servicio a costo menor que el que tendría el Estado y mantener una tarifa que el usuario y la autoridad acepten.

**Por qué es distinto para un simulador.** El motor genérico (caja, ingresos, costos, reputación) supone que el dueño pone el precio. Aquí hay cinco rasgos que no captura:

- La inversión inicial es enorme y se recupera en décadas; la deuda es de largo plazo.
- El ingreso es tráfico (o consumo) por tarifa, y el tráfico es la variable más incierta del proyecto [S2][S3].
- La tarifa está **regulada**: sube cuando la autoridad lo aprueba, no cuando el costo lo exige. Entre un ajuste y otro, la inflación erosiona el margen.
- Una parte del servicio entregado no se cobra (agua perdida, energía robada, usuarios morosos) [S1][S5].
- Hay un plazo y una reversión: el valor se acaba, y en los últimos años no conviene invertir lo que no se va a recuperar.

---

## 2. Indicadores propios y cómo se calculan

Convención: **mes t**.

### 2.1 Indicadores de demanda e ingreso

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Tráfico** (carretera, teleférico, terminal) | Vehículos o pasajeros que usan la obra | Por mes: promedio diario x días del mes. En carreteras se usa el promedio diario anual de tráfico (TPDA) | Concepto estándar (de memoria). Para Vías Bolivia, los reportes hablan de vehículos controlados y recaudación por estación [S6][S14] |
| **Ingreso por peaje o pasaje** | Tráfico por tarifa media | Ingreso = tráfico x tarifa media (ponderada por tipo de vehículo o de usuario) | De memoria |
| **Ingreso de agua o electricidad** | Volumen facturado por tarifa | Ingreso = volumen facturado x tarifa media (por tramo de consumo) | De memoria. La estructura por tramos de consumo se ve en la propuesta tarifaria de SEMAPA (Bs 2 el m3 hasta 10 m3 y Bs 15 sobre 30 m3) [S10] |
| **Eficiencia de cobranza** | Qué parte de lo facturado se cobra | Cobrado del período / facturado del período | De memoria |
| **Morosidad** | Deuda acumulada de usuarios | Cuentas por cobrar / facturación mensual (equivale a "meses de facturación pendientes") | De memoria |

### 2.2 Indicadores de pérdidas

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Agua no facturada (NRW, "non-revenue water")** | Volumen puesto en la red - volumen facturado. Tiene tres componentes: pérdidas físicas (fugas y rebalses), pérdidas comerciales (medidores que registran de menos, errores de datos, robo) y consumo autorizado no facturado (bomberos, uso interno, agua gratis a ciertos grupos) | [S1], definición textual |
| **NRW porcentual** | NRW / volumen puesto en la red | [S1]. El propio documento advierte que el porcentaje tiene una "debilidad inherente" como indicador |
| **Pérdidas físicas** | Se miden mejor en litros por conexión por día (junto con horas de servicio y presión) | [S1] |
| **Pérdidas comerciales** | Se miden mejor como porcentaje del consumo autorizado | [S1] |
| **Pérdidas eléctricas** | Energía generada o comprada - energía facturada. Se dividen en técnicas (inherentes a la red) y no técnicas (robo, errores de medición y facturación) | [S5], definición |
| **Costo de las pérdidas** | Pérdidas físicas x costo marginal del agua + pérdidas comerciales x tarifa media | [S1], tabla 2 (en esa estimación usan US$0,20 por m3 de costo marginal y US$0,25 de tarifa media para países en desarrollo) |

Dato clave de [S1]: el promedio de NRW en 900 empresas de 44 países en desarrollo (base IBNET del Banco Mundial) es de cerca de 35%, con el comentario de que la cifra real en el mundo en desarrollo probablemente está entre 40% y 50%, porque las peores empresas rara vez reportan. En la región latinoamericana, el estudio de BID, ADELAT y OLADE estima que se ha perdido en promedio cerca de 17% de la energía generada en las últimas tres décadas, tres veces el nivel de los países de la OCDE [S5]. Son promedios de otros países; no hay un dato verificado de Bolivia en las fuentes que abrí.

### 2.3 Indicadores de rentabilidad y de deuda

| Indicador | Fórmula | Fuente |
|---|---|---|
| **CFADS** (flujo disponible para servir la deuda) | Caja que genera el proyecto después de costos operativos e impuestos, y antes de pagar deuda | [S18] (nivel C) |
| **DSCR** (cobertura del servicio de deuda) | CFADS del período / (intereses + capital programados del período) | [S18]. Interpretación de la fuente: 1,00x significa que la caja cubre justo la deuda y no sobra nada para el accionista; menos de 1,00x significa que no alcanza. Un umbral citado para infraestructura con ingresos contratados es de cerca de 1,30x; con rango de 1,20x a 1,35x. Es una práctica de mercado, no una norma |
| **LLCR** (cobertura a vida del préstamo) | Valor presente del CFADS futuro durante la vida restante del préstamo / deuda pendiente hoy | [S18] |
| **Recuperación de costos** | Ingresos por tarifa / (operación y mantenimiento + reposición de activos + costo de capital) | Concepto de recuperación total de costos de operación, mantenimiento y reposición: la norma boliviana exige que las tarifas de una EPSA (empresa de agua) los garanticen [S7, art. 10]. La fórmula de cociente es mía |
| **Plazo restante de la concesión** | Años de contrato que quedan | Dato de contrato |
| **Valor presente del ingreso (PVR)** | Suma del ingreso descontado | [S2]: en el contrato "de plazo variable", la concesión termina cuando el PVR cobrado alcanza el monto ofertado |

### 2.4 Indicadores de tarifa y de riesgo regulatorio

| Indicador | Qué es | Fuente |
|---|---|---|
| **Brecha tarifaria** | Tarifa que se necesitaría para recuperar costos / tarifa vigente - 1 | Concepto mío; se apoya en la nota de 2015 en que el ministro dijo que los peajes cubrían un tercio de lo necesario para mantener las vías y que las tarifas vigentes databan de 1992 [S12] |
| **Tarifa pico y valle** (peak load pricing) | La tarifa del período pico cubre el costo de capacidad; la del valle cubre el costo de operar | [S4]: aplicado a la Línea Amarilla de Mi Teleférico, con tarifa valle de Bs 3,0 y tarifa pico de Bs 4,8 bajo los supuestos del paper (autores: parámetros asumidos, no datos oficiales) |
| **Incidencia de renegociación** | Porcentaje de contratos renegociados | [S3]: ver sección 3 |

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Resumen.** El VAN sigue siendo la base, pero tiene que tener tres cambios: (1) el ingreso es tráfico por tarifa regulada, con riesgo de demanda; (2) el horizonte es el plazo del contrato y **no hay valor residual** (los activos se entregan al Estado) o lo hay solo si el contrato prevé un pago al final; (3) hay que probar que el flujo alcanza para pagar la deuda año por año, no solo en promedio.

**1. El riesgo de demanda domina el resultado.** En proyectos con tarifa por uso, el flujo depende del tráfico. [S3] recoge que en carreteras latinoamericanas las proyecciones de tráfico fueron muy optimistas: en México el tráfico real fue en promedio 60% menor que el previsto, y en Colombia 40% menor (nota al pie de [S3]). [S2] explica el mismo problema desde la teoría: la rentabilidad de una APP está sujeta a una gran incertidumbre de demanda exógena que muchas veces no se considera al diseñar el contrato, y por eso hay renegociaciones cuando la demanda sale más baja.

**2. Alternativas al plazo fijo.** [S2] propone que, cuando hay incertidumbre de demanda, el contrato óptimo no tiene plazo fijo: se adjudica al que pide el **menor valor presente de ingresos (PVR)**, y la concesión dura hasta que el concesionario cobra ese valor. Si la demanda es alta, termina antes; si es baja, dura más. Así el concesionario no carga con el riesgo de demanda. [S2] reporta, citando a Engel y otros (2001), ganancias de bienestar de entre 16% y 64% de la inversión inicial frente al plazo fijo, según el grado de aversión al riesgo y la incertidumbre. Chile adjudicó por este método el tramo Santiago-Valparaíso-Viña del Mar en febrero de 1998 y otras carreteras después [S2]. Cuando la demanda esperada es baja, el contrato óptimo tiene un **ingreso mínimo garantizado** y un **tope de ingreso** [S2].

**3. Garantías y renegociaciones.** [S3] reúne más de 1.000 concesiones de América Latina y el Caribe (1985-2000): se renegoció 30% (41,5% sin contar telecomunicaciones), con 55% en transporte y 74% en agua y saneamiento. El tiempo promedio entre adjudicación y renegociación fue de 2,2 años (1,6 años en agua). El 61% de las renegociaciones las pidió el concesionario y el 26% el gobierno. Los contratos adjudicados por menor tarifa se renegociaron 60% de las veces, contra 11% de los adjudicados por mayor pago al Estado. Los que tenían metas de inversión se renegociaron 70% y los que tenían indicadores de desempeño, 18%. Con regulador ya existente al adjudicar, 17%; sin regulador, 61%. [S3] también indica que las garantías de ingreso mínimo bajan la probabilidad de renegociación pero reducen el incentivo al esfuerzo. Conclusión para el alumno: un VAN que no considera la probabilidad de renegociar (y quién la pide) está incompleto.

**4. Cobertura de deuda.** Un proyecto con VAN positivo puede quebrar en los primeros años si el DSCR baja de 1,00x [S18]. Por eso, además del VAN, se pide el DSCR mínimo y el LLCR [S18]. Estos umbrales son prácticas de mercado, no leyes.

**5. VAN social frente a VAN financiero.** Una obra con tarifa subsidiada puede tener flujo financiero negativo y ser socialmente conveniente. El caso de Mi Teleférico ilustra la discusión: en 2025 un economista afirmó que la empresa tiene déficit todos los años desde 2014 y que la tarifa no refleja el costo, y el ministro de Obras Públicas lo cuestionó citando un déficit corriente de casi Bs 20 millones [S13]. Para SIMPRO, el alumno debe saber qué se evalúa: el flujo del concesionario (VAN financiero) o el beneficio de la sociedad (VAN social, tipo B8 de la taxonomía).

**6. Tarifa óptima.** La teoría de costos de capacidad propone cobrar más en la hora pico que en la valle [S4]. En Bolivia, un trabajo previo citado en [S4] (Viscarra, 2017) calculó para la Línea Roja una tarifa de Bs 4,10 en pico y Bs 3,00 en valle, que permitiría recuperar la inversión 45% más rápido que la tarifa de entonces. Son estudios académicos, no decisiones de la empresa.

**Qué agregar al análisis:**

| Complemento | Qué responde | Fuente |
|---|---|---|
| VAN con riesgo de demanda (escenarios de tráfico) | Qué pasa si el tráfico es 40% o 60% menor | [S3] |
| DSCR año por año y LLCR | Si el flujo paga la deuda en cada año | [S18] |
| Punto de equilibrio de tráfico (o de consumo) | Cuánto tráfico hace falta para cubrir costos y deuda | De memoria |
| Brecha tarifaria y plan de ajustes | Cuánto se erosiona la tarifa por inflación entre ajustes | Interpretación mía, con apoyo en [S12] |
| Probabilidad y costo de renegociación | Qué riesgo regulatorio y político hay | [S3] |
| Análisis de la reversión | Cuánto invertir en los últimos años del plazo | Interpretación mía |

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Nota de método: no encontré un estudio sobre errores de estudiantes bolivianos en este tipo. La lista mezcla lo que dicen las fuentes (marcado) con interpretación mía.

**Errores de cálculo (estudiantes)**

1. **Proyectar el tráfico con optimismo.** En carreteras latinoamericanas el tráfico real fue 40% a 60% menor que el proyectado en los casos que cita [S3].
2. **Dejar la tarifa fija 5 años o suponer que sube con la inflación sin que nadie la apruebe.** En Bolivia la autoridad tiene que aprobarla [S9][S6] y puede demorar o negarla; en SEMAPA, por ejemplo, el operador mantuvo la estructura vieja porque la nueva no había sido aprobada [S11].
3. **Contar como ingreso todo el agua o la energía que se distribuye.** Se cobra solo lo facturado y se cobra solo lo que el usuario paga. Con NRW de 35% (promedio de [S1]), una de cada tres unidades no genera ingreso.
4. **Ignorar el plazo y la reversión.** Dejar un valor residual positivo cuando el activo se entrega al Estado [S2]; o seguir invirtiendo en los últimos años.
5. **Medir solo el VAN y no la cobertura de la deuda.** Ver sección 3.
6. **Pagar la deuda con un perfil de pagos que no se parece al perfil del flujo.** El flujo arranca bajo (el tráfico crece con los años) y el servicio de deuda suele arrancar alto (interpretación mía).
7. **No separar pérdidas físicas de comerciales.** [S1] insiste en que sin esa separación no se puede planificar la reducción y que las dos se resuelven con herramientas distintas.
8. **No incluir mantenimiento mayor.** Es un gasto grande y poco frecuente, que un VAN con costos anuales planos no muestra (interpretación mía).

**Errores de emprendedores y de autoridades**

1. **Adjudicar por la menor tarifa.** En [S3], los contratos adjudicados por menor tarifa se renegociaron en 60% de los casos, contra 11% de los adjudicados por mayor pago al Estado.
2. **Subir la tarifa de golpe.** El caso de la concesión de agua de Cochabamba (1999-2000): [S3] indica que operó de octubre de 1999 a abril de 2000 y fue terminada por el gobierno tras protestas violentas. Según [S3], se introdujeron alzas iniciales fuertes para pagar un esquema costoso de suministro en bloque elegido por el gobierno sobre una opción más barata, y las alzas no fueron anticipadas por los usuarios ni fueron transparentes.
3. **Prometer ingresos garantizados sin pensar en el costo para el Estado.** [S3] describe garantías excesivas (Mexico, República Dominicana) que terminaron en rescates o en pérdidas cubiertas por los contribuyentes.
4. **Ver al cliente moroso como un problema de cobranza.** En agua y electricidad, parte de la morosidad es robo o falta de medición, y cortar el servicio no siempre es posible ni eficaz (ver situación 6) [S5].
5. **Depender de un solo mes de recaudación.** Los bloqueos y las protestas pueden detener el cobro (ver situación 4).
6. **Subestimar el tiempo de aprobación de una tarifa.** En 2017 SEMAPA esperaba autorización de la AAPS para cambiar su estructura; en 2023 volvió a proponer una [S11][S10].
7. **Endeudarse en dólares con ingresos en bolivianos.** Es un riesgo propio del contexto boliviano actual (situación 8).
8. **No pensar en la política.** [S3] documenta que cambios de gobierno o de autoridad municipal llevaron a pedir revisar contratos (caso Limeira, Brasil).

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **[fuente]** o **(estimación)**); decisiones posibles con ventajas y costos; qué aprende el alumno.

Las magnitudes de las fuentes vienen de otros países, sectores y fechas. Se usan como orden de magnitud. Las marcadas "estimación" son mías y conviene calibrarlas antes de implementarlas (sección 10).

---

### Situación 1. El tráfico real sale muy por debajo del proyectado

**Qué pasa.** Pasan los primeros meses de operación y el tráfico (vehículos, pasajeros o usuarios conectados) está muy por debajo de lo que dijo el estudio de demanda. Las razones pueden ser un proyecto sobreestimado, una vía alternativa gratis, un cambio de hábito, o que la gente espera a que la obra madure. En la región, el tráfico real de carreteras concesionadas fue en promedio 60% menor que el previsto en México y 40% menor en Colombia [S3].

**Variables que mueve.**
- Tráfico o usuarios del mes: baja respecto del plan (magnitud de referencia [S3]: -40% a -60%; el simulador puede usar un rango más moderado, por ejemplo -15% a -40%, estimación).
- Ingreso: baja en proporción.
- DSCR: baja (puede pasar de 1,3x a menos de 1,0x, estimación).
- Reputación ante financistas y autoridad: baja.

**Decisiones del alumno.**
1. *Pedir a la autoridad que suba la tarifa para compensar.* Ventaja: recupera ingreso si el tráfico es poco sensible al precio. Costo: puede bajar más el tráfico (la gente elige la ruta alternativa); es un trámite largo y político (ver situaciones 2 y 3).
2. *Invertir en marketing y en servicio para atraer tráfico (señalización, conexiones, horarios).* Ventaja: ataca la causa. Costo: gasto que no se sabe si rinde; el tráfico de una obra rara vez responde rápido.
3. *Renegociar el contrato pidiendo ingreso mínimo garantizado o extensión del plazo.* Ventaja: reduce el riesgo; [S3] dice que las garantías bajan la probabilidad de renegociaciones futuras. Costo: según [S3], el concesionario inicia más del 60% de las renegociaciones y ello daña la relación con la autoridad; y la garantía reduce el incentivo al esfuerzo.
4. *Recortar costos operativos y diferir mantenimiento.* Ventaja: alivia caja ahora. Costo: el deterioro de la obra baja la calidad y, con los años, el tráfico (situación 10).

**Qué aprende.** Que la proyección de demanda es la parte más frágil del estudio, y que existen formas de repartir ese riesgo con el Estado (ingreso mínimo, plazo variable [S2]), cada una con costo.

---

### Situación 2. La tarifa queda congelada mientras suben los costos

**Qué pasa.** La autoridad no aprueba el reajuste tarifario o lo posterga. Los costos (salarios, repuestos, energía, combustibles) siguen subiendo. En Bolivia, la inflación de 2025 fue de 20,40% según el INE, y la de los 12 meses hasta junio de 2026, de 9,23% [S16]. El caso del peaje: en 2015 el ministro dijo que las tarifas databan de 1992 y que los peajes cubrían un tercio del mantenimiento necesario [S12]. En electricidad, un informe de 2026 dice que las tarifas están "artificialmente deprimidas" por el gas subsidiado y que el gobierno prefiere un ajuste gradual tras el fracaso de la eliminación del subsidio de diciembre de 2010 [S8].

**Variables que mueve.**
- Tarifa vigente: sin cambio.
- Costos operativos: suben según la inflación (referencia: 9% a 20% anual [S16]).
- Margen: se achica cada mes; la brecha tarifaria crece.
- Mantenimiento: se posterga si falta caja.

**Decisiones del alumno.**
1. *Presentar el pedido de ajuste con informes técnicos y sociales completos y esperar.* Ventaja: es el camino formal [S9]; si sale, queda respaldado. Costo: demora de meses o años; mientras tanto, pierdes margen.
2. *Recortar costos y gastos de mantenimiento para aguantar.* Ventaja: protege caja ahora. Costo: baja la calidad, el activo se deteriora (situación 10).
3. *Buscar ingresos fuera de la tarifa regulada* (publicidad, alquiler de locales, servicios no regulados; situación 13). Ventaja: no depende de la autoridad. Costo: alcance limitado, requiere inversión y puede chocar con el contrato.
4. *Financiar el déficit con deuda de corto plazo.* Ventaja: sigues operando sin tocar calidad. Costo: más gasto financiero; si el ajuste no llega, entras en problema de deuda (situación 11).

**Qué aprende.** Que la tarifa regulada no sigue al costo automáticamente, que el rezago se acumula, y que un proyecto de este tipo necesita colchón para el tiempo que tarda la autoridad.

---

### Situación 3. Una alza fuerte de tarifa provoca protestas

**Qué pasa.** Se aprueba (o se anuncia) una alza grande. Los usuarios reaccionan con protestas, rechazo al pago o bloqueos. Casos reales: en febrero de 2015 la ABC subió el peaje de la doble vía La Paz-Oruro de Bs 8 a Bs 17, los choferes protestaron y el gobierno suspendió la nueva tarifa siete días y formó una comisión [S12]. En el agua de Cochabamba, la concesión terminó tras protestas por las alzas iniciales [S3]. En noviembre de 2023, la AAPS aclaró que una resolución suya no autorizaba subir las tarifas de agua, solo permitía a las EPSA pedir tarifas incrementales por escasez, tras la polémica pública y el rechazo del sector industrial [S9].

**Variables que mueve.**
- Tarifa: sube (si pasa) o se revierte (si hay protesta).
- Tráfico o consumo: baja por rechazo o por buscar alternativas (estimación: -5% a -20% según la alternativa disponible).
- Riesgo de bloqueo o de suspensión del cobro: sube.
- Reputación y aceptación social: baja fuerte.

**Decisiones del alumno.**
1. *Aplicar el alza completa de una vez.* Ventaja: recuperas margen rápido. Costo: máxima probabilidad de protesta y de reversión, como en La Paz-Oruro [S12] y Cochabamba [S3].
2. *Aplicar el alza escalonada en 2 o 3 pasos.* Ventaja: menor rechazo. Costo: el ingreso extra llega más lento y la inflación se come parte.
3. *Negociar antes con los usuarios (choferes, juntas vecinales) y atar el alza a una mejora visible.* Ventaja: legitimidad. Costo: tiempo y gasto de relacionamiento; puede salir con una tarifa menor a la que necesitas.
4. *Pedir un subsidio al Estado o municipio para cubrir la diferencia.* Ventaja: la tarifa no sube. Costo: dependes de un presupuesto público que también está en tensión.

**Qué aprende.** Que la tarifa óptima económica no es la tarifa viable políticamente, y que la forma de introducirla cuenta tanto como el monto.

---

### Situación 4. Bloqueos y suspensión del pago de peaje

**Qué pasa.** Conflictos sociales cortan carreteras o dañan las estaciones de cobro, o el transporte decide dejar de pagar. Según Vías Bolivia, los bloqueos recientes dejaron una pérdida acumulada de Bs 52,5 millones en recaudación, y dos estaciones (Achica Arriba y Vilaque-Copata) fueron destruidas, saqueadas e incendiadas el 23 de mayo de 2026 [S14]. En julio de 2026 el transporte libre de Cochabamba anunció la suspensión del pago de peajes por el desabastecimiento de diésel, el deterioro de las carreteras y el aumento de costos; Vías Bolivia respondió que no pagar es un delito [S15]. En 2025, la recaudación fue de unos Bs 658 millones en 169 estaciones, alrededor de 91% a 92% de lo programado (cifra de la propia entidad, no verificada con otra fuente; vista en resultados de búsqueda de sus informes, que no abrí).

**Variables que mueve.**
- Tráfico cobrado: baja durante el bloqueo (referencia [S14]: pérdida de Bs 52,5 millones a nivel nacional; magnitud mensual en el simulador, estimación: -20% a -60% del ingreso del mes afectado).
- Evasión y cobro difícil: sube (estimación: +5 a +15 puntos de evasión en los meses siguientes).
- Costo de reparación de estaciones: sube.
- Mantenimiento: se posterga por falta de fondos (Vías Bolivia reporta cerca de 20 años de mantenimiento insuficiente [S14]).

**Decisiones del alumno.**
1. *Exigir el pago y denunciar por la vía legal.* Ventaja: defiendes el ingreso, la norma te respalda [S15]. Costo: escala el conflicto y puede traer más bloqueos o daños.
2. *Negociar con el transporte un plan conjunto de mantenimiento y una tarifa diferenciada o abonos.* Ventaja: baja la tensión y mejora la cobranza futura (esta salida la pidió la propia Vías Bolivia, que solicitó diálogo para acordar un plan de mantenimiento [S15]). Costo: menos ingreso por abonos y descuentos.
3. *Invertir en cobro electrónico para reducir el contacto y la evasión.* Ventaja: mejora control. Costo: inversión alta; el telepeaje está en 8 estaciones y la propia entidad lo califica de lejano a sus metas [según resultados de búsqueda de sus informes, no abiertos].
4. *Aceptar la pérdida y proteger la caja* (reducir gastos, constituir una reserva). Ventaja: seguridad. Costo: no resuelves el problema de fondo, que volverá a pasar.

**Qué aprende.** Que el ingreso depende de que la gente pueda circular y acepte pagar, y que el riesgo social es un riesgo operativo con costo medible.

---

### Situación 5. Programa de reducción de agua no facturada

**Qué pasa.** La empresa de agua descubre que una parte grande del agua que produce no se factura: fugas, medidores viejos o dañados, conexiones clandestinas. En SEMAPA (Cochabamba), la Coordinadora del Agua pidió resolver el agua no contabilizada y hacer auditorías; un investigador de la UMSS señaló que más de 50.000 medidores estarían funcionando mal y que en 2017 cerca del 60% tenían más de 10 años [S10][S11]. El porcentaje de pérdida de SEMAPA no aparece cuantificado en las notas que abrí. La referencia internacional es 35% de NRW en promedio en los países en desarrollo [S1]. [S1] también documenta que contratar a un operador por desempeño puede reducir las pérdidas; en São Paulo (SABESP), contratos de cobranza de deuda en mora pagados con un porcentaje de lo recuperado lograron cobrar US$ 43 millones, y 70% de eso en efectivo, frente a un 7% habitual de pago en efectivo de la deuda en mora [S1].

**Variables que mueve.**
- Agua facturada: sube cuando se repara y se mide mejor (referencia [S1]: reducir las pérdidas físicas a la mitad es "un objetivo razonable"; en el simulador, el avance por año podría ser de 3 a 8 puntos de NRW, estimación).
- Costo de producción por m3 facturado: baja.
- Inversión: sube (medidores, detección de fugas, reparaciones).
- Ingreso: sube con el tiempo (con rezago).

**Decisiones del alumno.**
1. *Invertir en reparar fugas (pérdidas físicas).* Ventaja: ahorras costo de producción y liberas agua para más conexiones. Costo: el ahorro no se factura; mejora costos pero no ingresos directamente.
2. *Cambiar medidores y regularizar conexiones clandestinas (pérdidas comerciales).* Ventaja: sube la facturación directamente. Costo: conflicto con usuarios que hoy no pagan, costo de medidores y campañas.
3. *Contratar a un operador externo pagado por resultados* (como en los casos de [S1]). Ventaja: trae experiencia y transfiere riesgo. Costo: tienes que medir bien la línea de base y diseñar el contrato; el operador se lleva parte del beneficio.
4. *No hacer nada y subir la tarifa para compensar.* Ventaja: no hay inversión. Costo: el usuario que paga financia el desperdicio, la autoridad suele pedir primero resolver las pérdidas (como lo planteó la Coordinadora del Agua [S10]).

**Qué aprende.** Que la tarifa no es la única palanca de ingreso y que "vender más agua" muchas veces se logra cobrando mejor el agua que ya se produce.


---

### Situación 6. Morosidad y conexiones clandestinas en electricidad o agua

**Qué pasa.** Una parte de los usuarios no paga, otra parte se conecta sin medidor, y la empresa tiene límites para cortar el servicio. En un estudio regional, CRE R.L. informó que en Bolivia la normativa prohíbe expresamente cortar el suministro en casos de hurto detectado [S5]. La Ley de Electricidad 1604 establece infracciones para el consumidor y multas calculadas en kWh por la tarifa promedio [S5]. En Bolivia, el nivel de pérdidas reconocido en las tarifas se define mediante un estudio tarifario que encargan las distribuidoras y se revisa cada cuatro años, sin ajuste intermedio ni separación explícita entre pérdidas técnicas y no técnicas, y no hay auditoría regulatoria sistemática ni información pública de pérdidas [S5].

**Variables que mueve.**
- Pérdidas no técnicas: suben o bajan según la acción (referencia regional [S5]: 17% de pérdidas totales en promedio).
- Eficiencia de cobranza: baja si no se actúa (estimación: -2 a -6 puntos).
- Cuentas por cobrar: suben.
- Costo de inspecciones y de campañas: sube.

**Decisiones del alumno.**
1. *Hacer inspecciones y regularizar conexiones con multas.* Ventaja: recuperas energía facturable. Costo: gasto en personal y conflicto con vecinos; la sanción penal en la práctica ha sido poco usada en la región, se privilegian los mecanismos comerciales [S5].
2. *Instalar medidores inteligentes o de prepago.* Ventaja: baja la morosidad y el hurto. Costo: inversión alta; hay que regular su uso.
3. *Ofrecer un plan de pago o una tarifa social a los morosos.* Ventaja: formalizas usuarios y cobras parte de la deuda. Costo: ingreso menor por usuario y precedente para otros.
4. *Cortar el servicio a los morosos (donde la norma lo permite).* Ventaja: presión directa. Costo: [S5] cita la experiencia de una distribuidora chilena que lo califica como la medida más impopular y el peor mecanismo para que el cliente regularice, porque fomenta la reconexión clandestina.

**Qué aprende.** Que parte de las pérdidas es social y no se resuelve con castigo, y que cada país limita las herramientas que puede usar.

---

### Situación 7. Sequía o escasez hídrica y tarifa por consumo

**Qué pasa.** Baja el agua disponible. La autoridad permite o pide medidas para desincentivar el consumo alto. En noviembre de 2023, la AAPS aclaró que una resolución del 7 de noviembre permitía a las EPSA solicitar tarifas incrementales por escasez, dirigidas a consumos mensuales sobre 20 m3, de forma "escalonada y progresiva", y que ningún operador podía subir tarifas sin presentar informes y demostrar un déficit hídrico [S9]. SEMAPA propuso en 2023 una escala por tramos (de Bs 2 por m3 de 1 a 10 m3 hasta Bs 15 por m3 sobre 30 m3) y el alcalde de Cochabamba rechazó el alza a los "derrochadores" [S10].

**Variables que mueve.**
- Volumen disponible: baja (estimación: -10% a -30% en la temporada seca).
- Consumo por usuario: baja con la tarifa por tramos (estimación: -5% a -15% en los tramos altos).
- Horas de servicio: bajan (SEMAPA apuntaba a 16 horas diarias en 2018, no a 24 [S11]).
- Ingreso por m3: sube en tramos altos, pero el volumen vendido baja.
- Costo de fuentes adicionales (camiones cisterna, pozos): sube.

**Decisiones del alumno.**
1. *Racionar el servicio por horarios.* Ventaja: protege la fuente y evita la tarifa. Costo: menor volumen facturado y quejas.
2. *Pedir tarifa escalonada por consumo.* Ventaja: reduce el uso excesivo y puede mejorar ingreso. Costo: proceso regulatorio, rechazo político; medidores defectuosos distorsionan el cobro (más de 50.000 en SEMAPA [S10]).
3. *Invertir en una nueva fuente o planta.* Ventaja: solución de fondo. Costo: inversión grande (SEMAPA mencionó Bs 5 millones para una nueva planta [S10]) con plazo largo y necesidad de financiamiento.
4. *Comprar agua en bloque o contratar cisternas.* Ventaja: alivio inmediato. Costo: costo alto por m3, que la tarifa regulada no reconoce.

**Qué aprende.** Que el volumen disponible es otra capacidad fija y que la estructura tarifaria sirve para gestionar demanda, no solo para recaudar.

---

### Situación 8. Deuda en dólares, ingresos en bolivianos

**Qué pasa.** El proyecto se financió con un crédito en dólares (o importa equipos) y cobra en bolivianos con tarifa regulada. Durante años el tipo de cambio oficial estuvo fijo en Bs 6,96 por dólar; según resultados de búsqueda, el Banco Central pasó a un régimen flexible el 29 de junio de 2026 y el oficial estaba en Bs 11,85 el 8 de octubre (no abrí las notas de tipo de cambio; sección 9). La inflación de 2025 fue de 20,40% [S16]. La tarifa regulada no se mueve sola.

**Variables que mueve.**
- Servicio de deuda en bolivianos: sube en proporción a la depreciación (si el dólar sube 40% y la deuda es 100% en dólares, el servicio sube 40%, aritmética mía).
- DSCR: baja.
- Costo de repuestos importados: sube.
- Tarifa: sin cambio hasta que la autoridad la ajuste (situación 2).

**Decisiones del alumno.**
1. *Pedir a la autoridad un ajuste atado al tipo de cambio.* Ventaja: traslada el riesgo a la tarifa. Costo: lo paga el usuario, con efectos políticos (situación 3) y no hay garantía de aprobación.
2. *Refinanciar en bolivianos.* Ventaja: elimina el riesgo cambiario. Costo: tasa más alta y plazo más corto, disponibilidad limitada (estimación).
3. *Cubrir con reservas en dólares o con ingresos en dólares* (si hay). Ventaja: cobertura natural. Costo: en infraestructura local casi no hay ingresos en dólares.
4. *Renegociar con el acreedor un período de gracia.* Ventaja: alivio inmediato. Costo: más intereses y aumento del plazo; el acreedor puede pedir garantías.

**Qué aprende.** Que el descalce de monedas puede destruir un proyecto sólido en operación, y que la moneda de la deuda debe parecerse a la de los ingresos.

---

### Situación 9. La nueva autoridad quiere revisar el contrato

**Qué pasa.** Cambia el gobierno municipal o la autoridad regulatoria. La nueva gestión cuestiona el contrato o la tarifa pactada, o pide renegociar. En Brasil, el concesionario de agua de Limeira no pudo ajustar tarifas por inflación desde el inicio aunque el contrato lo preveía, los tribunales rechazaron sus pedidos, y el alcalde dijo que el contrato era injusto y venía de una gestión anterior [S3]. [S3] observa que la inversión no llega si cada administración quiere renegociar contratos de largo plazo. En el análisis estadístico, existe más renegociación cuando no hay regulador al momento de adjudicar (61% frente a 17%) [S3]. En Bolivia, la ley de APP no existe según una opinión de 2024 [S17], y la nueva ley de electricidad fue presentada en mayo de 2026 y debía debatirse en la Asamblea [S8].

**Variables que mueve.**
- Riesgo regulatorio: sube.
- Tarifa pactada: queda en duda.
- Costos legales: suben.
- Costo de capital (lo que piden los financistas): sube (estimación: +1 a +3 puntos).

**Decisiones del alumno.**
1. *Aceptar renegociar con concesiones* (menor tarifa, más inversión). Ventaja: evitas el conflicto. Costo: menor rentabilidad; abres la puerta a más pedidos.
2. *Defender el contrato con arbitraje o tribunales.* Ventaja: protege el valor del contrato. Costo: lento, caro y, como en Limeira, no garantiza que se haga cumplir [S3].
3. *Buscar aliados* (usuarios, asociaciones, el gobierno departamental). Ventaja: cambia la presión política. Costo: tiempo de gestión; si el proyecto es visto como "empresa del privado" se complica.
4. *Entregar el contrato y salir* (vender o ceder). Ventaja: cortas la pérdida. Costo: pierdes lo invertido y el activo se revierte antes de lo previsto.

**Qué aprende.** Que el contrato no es solo un papel, depende del entorno institucional, y que un buen proyecto necesita legitimidad local además de números.

---

### Situación 10. Mantenimiento mayor y entrega de activos al final del plazo

**Qué pasa.** Los activos (pavimento, tuberías, cables, cabinas, equipos) llegan al fin de su vida útil, y el contrato tiene un plazo. Hay que decidir cuánto invertir en renovar. En el esquema de concesión los activos vuelven al Estado al final [S2]. En el transporte vial boliviano, Vías Bolivia dice que el país arrastra cerca de 20 años de mantenimiento insuficiente [S14]. Es el efecto de gastar menos de lo necesario de forma sostenida.

**Variables que mueve.**
- Estado de los activos: se deteriora si se posterga.
- Costo de mantenimiento: baja hoy y sube después (con interés).
- Calidad del servicio: baja.
- Tráfico y reputación: bajan con el tiempo.
- Valor para la autoridad: puede exigir que se entregue en buen estado, con multas.

**Decisiones del alumno.**
1. *Mantener el programa completo.* Ventaja: calidad estable, tráfico sostenido. Costo: menor caja ahora.
2. *Postergar mantenimiento mayor en los últimos años del plazo.* Ventaja: más flujo para el accionista. Costo: deterioro; riesgo de sanciones o de reclamo al entregar; daña la reputación.
3. *Negociar una extensión de plazo a cambio de renovar.* Ventaja: recuperas inversión en más años. Costo: negociación política (situación 9).
4. *Crear un fondo de reserva para renovación desde el inicio.* Ventaja: previsible. Costo: caja inmovilizada y menos dividendos al principio.

**Qué aprende.** Que un activo con plazo no vale nada al final, que la tentación de "exprimir" los últimos años destruye valor ante la autoridad, y que el mantenimiento diferido es una deuda escondida.

---

### Situación 11. Se rompe la cobertura de la deuda (covenant)

**Qué pasa.** El flujo cae (por situaciones 1, 2, 4 u 8) y el DSCR baja del nivel que exige el contrato de crédito. Si cae por debajo del umbral de bloqueo de distribución, se detienen los pagos al accionista hasta recuperar el nivel. Si cae más, el acreedor puede exigir medidas [S18]. Ejemplo ilustrativo de la fuente: bloqueo en 1,30x y default en 1,10x (es un ejemplo de una página de consultora, no un estándar) [S18].

**Variables que mueve.**
- Dividendos al accionista: caen a cero.
- Costo financiero: sube (tasa mayor, comisión de dispensa).
- Caja: se inmoviliza en reservas.
- Capacidad de inversión: baja.

**Decisiones del alumno.**
1. *Inyectar capital del accionista.* Ventaja: resuelve el problema y mantiene la relación con el acreedor. Costo: más dinero en riesgo.
2. *Pedir dispensa (waiver) al acreedor.* Ventaja: sin inyección. Costo: comisión y condiciones más duras.
3. *Reestructurar la deuda (alargar plazo).* Ventaja: baja la cuota anual. Costo: más intereses totales, nuevas garantías.
4. *Recortar gastos y diferir inversiones.* Ventaja: sube el CFADS. Costo: puede deteriorar el servicio y el tráfico.

**Qué aprende.** Que un proyecto rentable en VAN puede fallar por liquidez, y que la estructura de deuda es parte de la viabilidad.

---

### Situación 12. Oportunidad: ajuste de tarifa pico y valle (precio por horario)

**Qué pasa.** El servicio tiene horas de demanda alta (pico) en que la capacidad se satura y horas de demanda baja (valle). Un estudio de Mi Teleférico concluye que en horarios de demanda alta debería cobrarse una tarifa mayor, y calcula para la Línea Amarilla una tarifa valle de Bs 3,0 y una pico de Bs 4,8 bajo sus supuestos (la tarifa normal de entonces era Bs 3 y la preferencial Bs 1,50) [S4]. Los autores dicen que sus resultados dependen de supuestos de costo y que hace falta conocer la sensibilidad del tráfico al precio [S4].

**Variables que mueve.**
- Ingreso por viaje: sube en pico.
- Tráfico en pico: baja algo (algunos mueven su viaje al valle). Magnitud: estimación (-3% a -10%).
- Tráfico en valle: sube algo.
- Congestión y calidad en pico: mejoran.
- Aceptación social: baja si se percibe como alza.

**Decisiones del alumno.**
1. *Aplicar tarifa pico con descuento en valle.* Ventaja: mejor uso de la capacidad e ingreso. Costo: requiere autorización y comunicación; puede ser visto como cobrar más.
2. *Mantener tarifa única.* Ventaja: simple y aceptado. Costo: congestión en pico, capacidad ociosa en valle, ingreso menor.
3. *Ampliar capacidad en pico (más cabinas, más buses, más ventanillas).* Ventaja: atiende más sin tocar tarifa. Costo: inversión que se usa pocas horas al día.
4. *Tarifa preferencial a segmentos (estudiantes, adultos mayores) en valle.* Ventaja: mueve demanda y cumple objetivo social. Costo: menos ingreso por viaje.

**Qué aprende.** Que la capacidad cuesta y que el precio puede repartir la demanda; también que no toda mejora de eficiencia es políticamente fácil.

---

### Situación 13. Oportunidad: ingresos accesorios (publicidad, locales, servicios)

**Qué pasa.** La obra genera audiencia cautiva y espacios (estaciones, terminales, mercados). Se pueden alquilar locales, vender publicidad o prestar servicios no regulados. La nota de la taxonomía sobre Mi Teleférico señala ingresos por alquiler de espacios comerciales y publicitarios además del pasaje (fuente indicada en `00-taxonomia-tipos.md`, no la reabrí aquí). Estos ingresos no pasan por la autoridad tarifaria, aunque el contrato puede limitarlos o repartirlos.

**Variables que mueve.**
- Ingresos accesorios: suben (estimación: 5% a 15% del ingreso total en proyectos con alto flujo de personas).
- Inversión en locales y señalización: sube.
- Dependencia del tráfico: se mantiene (sin gente no hay clientes para los locales).
- Reputación: baja si la publicidad o los locales molestan.

**Decisiones del alumno.**
1. *Alquilar locales a largo plazo.* Ventaja: ingreso estable. Costo: menos flexibilidad; vacancia si el tráfico no llega.
2. *Vender publicidad con contrato corto.* Ventaja: flexible. Costo: ingreso volátil, depende del ciclo económico.
3. *Operar tú mismo servicios complementarios* (estacionamiento, comida, encomiendas). Ventaja: margen mayor. Costo: otro negocio con su propio riesgo.
4. *No hacerlo y enfocarte en el servicio principal.* Ventaja: foco. Costo: dejas ingresos sobre la mesa.

**Qué aprende.** Que una infraestructura con tarifa regulada puede ganar margen con ingresos no regulados, pero con riesgos distintos.

---

### Situación 14. Oportunidad: ampliar cobertura con aporte público

**Qué pasa.** Se puede extender la red a zonas de menor capacidad de pago. La norma boliviana prevé que, si una EPSA integra zonas deprimidas donde la capacidad de pago no cubre el costo de la inversión, las prefecturas (hoy gobernaciones) o los municipios pueden aportar con transferencias [S7, art. 10]. Las tarifas deben garantizar la recuperación total de los costos de operación, mantenimiento y reposición [S7, art. 10]. Es decir: los usuarios nuevos pagan la operación; el Estado ayuda con la inversión.

**Variables que mueve.**
- Usuarios conectados: suben (estimación: +5% a +15% de la base en dos años).
- Ingreso por usuario nuevo: bajo (tarifa social, consumo bajo).
- Inversión: sube; parte la financia el aporte público.
- Morosidad: sube en los primeros meses (estimación).
- Agua o energía disponible por usuario: baja.

**Decisiones del alumno.**
1. *Extender con aporte público de inversión.* Ventaja: más usuarios sin que cargue toda la inversión el proyecto. Costo: dependes del desembolso, que puede tardar o no llegar.
2. *Extender con financiamiento propio.* Ventaja: control. Costo: mucha deuda y retorno lento.
3. *Extender por etapas, empezando por zonas con mejor pago.* Ventaja: riesgo menor. Costo: críticas por dejar afuera a los más pobres.
4. *No extender.* Ventaja: estabilidad. Costo: pierdes crecimiento y la presión política crece.

**Qué aprende.** Que el crecimiento de un servicio regulado depende de quién paga la inversión de las conexiones nuevas, y que la cobertura es objetivo político.

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| `demandaBase` | Tráfico, pasajeros, o usuarios conectados proyectados sin shocks | Crece según una curva de maduración (arranca bajo y sube durante años) y estacionalidad. Se multiplica por el factor de cada evento |
| `capacidad` | Máximo de uso que soporta la obra | Fija; sube solo con inversión. Si la demanda supera la capacidad, el exceso se pierde y baja la calidad |
| `tarifaVigente` | Tarifa media que se cobra hoy | Cambia solo cuando la autoridad aprueba un ajuste (evento o decisión) |
| `tarifaRequerida` | Tarifa que recuperaría costos totales | Se recalcula: (costos operativos + mantenimiento + servicio de deuda) / unidades cobrables. Sube con la inflación de costos |
| `brechaTarifaria` | Diferencia entre requerida y vigente | `tarifaRequerida / tarifaVigente - 1`. Acumula rezago; alimenta la tensión con la autoridad |
| `inflacionCostos` | Aumento mensual de costos | Parámetro del escenario; en Bolivia la inflación fue 20,40% en 2025 [S16] |
| `volumenInyectado` y `ANCfisica`, `ANCcomercial` | Para agua y energía: lo que entra a la red y las dos pérdidas | Pérdidas físicas suben con la edad de la red y bajan con inversión; las comerciales bajan con medidores y regularización |
| `eficienciaCobranza` | Parte de lo facturado que se cobra | Baja con morosidad y conflicto; sube con acciones de cobranza |
| `cuentasPorCobrar` | Deuda acumulada de usuarios | Acumula la facturación no cobrada, descontando lo recuperado |
| `estadoActivos` | Índice de 0 a 100 del estado físico | Se deteriora cada mes; mejora con mantenimiento. Alimenta calidad y probabilidad de fallas |
| `fondoMantenimiento` | Reserva para renovaciones | Se aporta una parte de cada mes; se gasta al renovar |
| `deuda`, `servicioDeuda`, `monedaDeuda` | Saldo de deuda, cuota mensual y moneda | Amortiza según calendario; si es en dólares, la cuota en bolivianos se mueve con el tipo de cambio |
| `DSCR` | Cobertura de la deuda | Se calcula con CFADS de los últimos 12 meses / servicio de deuda de los últimos 12 meses. Alerta si baja del umbral (por ejemplo 1,2x) |
| `plazoRestante` | Meses de concesión que quedan | Baja 1 cada mes; al llegar a cero, el activo se revierte y el valor del proyecto es cero |
| `tensionSocial` | Aceptación del usuario y de la comunidad | Sube con alzas y mala calidad; baja con buen servicio y diálogo. Alta tensión aumenta la probabilidad de bloqueos y de evasión |
| `relacionAutoridad` | Confianza con el regulador y la entidad contratante | Mejora con cumplimiento y calidad; empeora con pedidos de renegociación y reclamos. Afecta el tiempo y la probabilidad de aprobar ajustes |
| `ingresoMinimoGarantizado` y `topeIngreso` | Parámetros contractuales opcionales | Si están activados: ingreso = máximo(real, mínimo) y recorte del exceso sobre el tope [S2] |

Notas para el motor (interpretación mía):

- El shock de demanda debería aplicarse sobre `demandaBase`, y los bloqueos sobre el cobro (no solo sobre la demanda).
- El ingreso de agua o electricidad debe pasar por tres filtros: producir, facturar y cobrar.
- Al terminar el plazo el motor debe reportar la reversión: el alumno no se queda con el activo.

---

## 7. Ejemplos reales de Bolivia o Latinoamérica

Solo aparecen casos cuyo enlace abrí. "Qué dice la fuente" no es mi evaluación.

| Caso | País | Qué dice la fuente | Enlace |
|---|---|---|---|
| Concesión de agua de Cochabamba (1999-2000) | Bolivia | Operó de octubre de 1999 a abril de 2000 y terminó por decisión del gobierno tras protestas violentas; las alzas iniciales fueron fuertes y poco transparentes [S3] | [Guasch, Banco Mundial, 2004](https://regulationbodyofknowledge.org/wp-content/uploads/2013/03/Guasch_Granting_and_Renegotiating.pdf) |
| Rescate de 52 carreteras concesionadas | México | En 1997 el gobierno anunció US$ 3.300 millones en 30 años para reestructurar 52 carreteras concesionadas a inicios de los 90; plazos muy cortos, tráfico 60% menor al previsto y recompra de cerca de 80% de las concesiones por US$ 7.000 a 12.000 millones [S3] | mismo enlace de Guasch |
| Concesión de agua de Limeira | Brasil | El concesionario no pudo reajustar tarifas por inflación aunque el contrato lo preveía [S3] | mismo enlace de Guasch |
| Subasta por valor presente de ingresos | Chile | Primer país en usar una subasta PVR pura (Santiago-Valparaíso-Viña del Mar, febrero de 1998) [S2] | [Engel, Fischer, Galetovic, NBER 13284](https://www.nber.org/system/files/working_papers/w13284/w13284.pdf) |
| Peaje La Paz-Oruro (2015) | Bolivia | La ABC subió el peaje de Bs 8 a Bs 17, hubo protestas y se suspendió siete días; el ministro dijo que los peajes cubrían un tercio del mantenimiento y que las tarifas eran de 1992 [S12] | [eju.tv, 2015](https://eju.tv/?p=555339) |
| Peajes y bloqueos 2026 | Bolivia | Pérdida de Bs 52,5 millones, estaciones destruidas el 23 de mayo, mantenimiento insuficiente por unos 20 años [S14]; suspensión del pago anunciada por el transporte de Cochabamba [S15] | [Correo del Sur, 2026](https://correodelsur.com/economia/20260623/bloqueos-dejan-perdidas-de-bs-52-5-millones-en-peajes-y-complican-mantenimiento-vial-en-el-pais.html) y [eju.tv, 2026](https://eju.tv/?p=5049304) |
| Tarifa de Mi Teleférico | Bolivia | Estudio académico de tarifa pico y valle de la Línea Amarilla [S4]; discusión de 2025 sobre su déficit [S13] | [LAJED, 2019](https://lajed.ucb.edu.bo/a/article/download/394/396/710) y [eju.tv, 2025](https://eju.tv/?p=4581337) |
| Tarifas de agua: SEMAPA y AAPS | Bolivia | Propuesta tarifaria por tramos de 2023 [S10]; aclaración de la AAPS en 2023 [S9]; espera de autorización en 2017 [S11] | [Los Tiempos, 31/7/2023](https://www.lostiempos.com/actualidad/cochabamba/20230731/semapa-ratifica-rebaja-del-agua-cobro-escalonado-10-m3) y [Los Tiempos, 25/11/2023](https://www.lostiempos.com/actualidad/pais/20231125/aaps-aclara-que-no-autoriza-incremento-tarifas-consumo-agua) |
| Cobranza de deuda en mora por resultado (SABESP) | Brasil | Contratos de 1999 de cobranza pagados por porcentaje de lo recuperado: recuperó US$ 43 millones, 70% en efectivo, contra 7% habitual [S1] | [Banco Mundial, Kingdom y otros, 2006](https://documents1.worldbank.org/curated/en/385761468330326484/pdf/394050Reducing1e0water0WSS81PUBLIC1.pdf) |
| Pérdidas eléctricas y CRE R.L. | Bolivia | Reconocimiento tarifario de pérdidas por estudio revisado cada cuatro años; la normativa prohíbe cortar el suministro en casos de hurto detectado, según CRE R.L. [S5] | [BID/ADELAT/OLADE, Recuperando Energía](https://www.olade.org/wp-content/uploads/2026/04/Gestion-de-las-perdidas-ES_VF15-04-2026.pdf) |

**Bolivia y concesiones.** Hay poca experiencia boliviana vigente de concesión privada con plazo y reversión. El caso de Cochabamba fue de 1999; los peajes los cobra una entidad pública (Vías Bolivia) [S6]; y una opinión de 2024 afirma que Bolivia no tiene ley de APP [S17]. La mayoría de los casos actuales en Bolivia son de **operadores públicos, municipales o cooperativos con tarifa regulada**, no de concesión con reversión. Para el simulador esto significa que el tipo sirve para ambos, pero conviene que el alumno elija si su proyecto es concesión privada (plazo, reversión, deuda) o servicio con tarifa regulada sin reversión.

---

## 8. Fuentes numeradas con nivel

Nivel A: libro, paper, organismo, manual universitario o norma oficial. B: consultora, reporte sectorial, prensa. C: blog, página de práctica, opinión.

| N.º | Fuente | Nivel | Alcance de lo leído | Enlace |
|---|---|---|---|---|
| S1 | Bill Kingdom, Roland Liemberger y Philippe Marin, *The Challenge of Reducing Non-Revenue Water in Developing Countries: How the Private Sector Can Help*, Banco Mundial, Water Supply and Sanitation Sector Board Discussion Paper No. 8, diciembre de 2006 (autores y título confirmados en el PDF y en la búsqueda) | A | Texto leído: definición de NRW, escala, costo, beneficios, indicadores, casos de contratos por desempeño (Selangor, SABESP) | https://documents1.worldbank.org/curated/en/385761468330326484/pdf/394050Reducing1e0water0WSS81PUBLIC1.pdf |
| S2 | Eduardo Engel, Ronald Fischer y Alexander Galetovic, "The Basic Public Finance of Public-Private Partnerships", NBER Working Paper 13284, julio de 2007 (revisado marzo de 2009) | A | Texto leído: resumen, introducción, sección de implementación con subastas PVR | https://www.nber.org/system/files/working_papers/w13284/w13284.pdf |
| S3 | J. Luis Guasch, *Granting and Renegotiating Infrastructure Concessions: Doing it Right*, WBI Development Studies, Banco Mundial, primera impresión enero de 2004, ISBN 0-8213-5792-1 (datos de la página de derechos del PDF) | A (libro de organismo) | Texto leído por secciones: panorama estadístico de renegociación, casos de México, Cochabamba, Limeira, República Dominicana. No leí el libro completo (211 páginas) | https://regulationbodyofknowledge.org/wp-content/uploads/2013/03/Guasch_Granting_and_Renegotiating.pdf |
| S4 | Lourdes M. Espinoza Vásquez, Raúl R. de Celis Cedro, Rocío C. Aruquipa Yujra, Aleyda D. V. Fernández Campos y Orlando E. Ríos Rengel, "Tarifa para la línea amarilla de la empresa Mi Teleférico. Una aproximación a través de un Peak Load Pricing", LAJED n.º 32, nov. 2019-abril 2020, pp. 9-32 | A (paper) | Texto leído: resumen, introducción, tarifas vigentes, conclusiones | https://lajed.ucb.edu.bo/a/article/download/394/396/710 |
| S5 | ADELAT, Universidad de Chile, BID y OLACDE (editores), *Recuperando Energía: Innovación y Estrategias para la Gestión de Pérdidas No Técnicas en América Latina y el Caribe*, publicado en OLADE (abril de 2026 según la ruta del archivo) | A (organismos) | Texto extraído y leído por secciones (resumen, comparación de países, capítulo Bolivia, tema de cortes). No leí el documento completo | https://www.olade.org/wp-content/uploads/2026/04/Gestion-de-las-perdidas-ES_VF15-04-2026.pdf |
| S6 | Bolivia, Decreto Supremo 28948 (25 de noviembre de 2006), Vías Bolivia y administración de peajes | A (norma) | Leído vía resumen de la página de Lexivox (artículos 1, 2, 4, 5, 6, 8, 9, 10, 11) | https://www.lexivox.org/norms/BO-DS-28948.html |
| S7 | Bolivia, Decreto Supremo 26587 (12 de abril de 2002), EPSA como sociedades anónimas mixtas | A (norma) | Texto leído completo (el PDF de FAOLEX) | https://faolex.fao.org/docs/pdf/bol44036.pdf |
| S8 | Chambers and Partners, "Power Generation, Transmission and Distribution 2026" (capítulo de Bolivia) | B | Resumen leído en la página (tarifas, subsidios, reforma de ley de electricidad 2026) | https://gpg-pdf.chambers.com/power-generation-transmission-and-distribution-2026/47/ |
| S9 | Los Tiempos, "AAPS aclara que no autoriza incremento de tarifas por consumo de agua", 25/11/2023 | B | Leída | https://www.lostiempos.com/actualidad/pais/20231125/aaps-aclara-que-no-autoriza-incremento-tarifas-consumo-agua |
| S10 | Los Tiempos, "Semapa ratifica rebaja del agua y el cobro escalonado desde 10 m3", 31/7/2023 | B | Leída | https://www.lostiempos.com/actualidad/cochabamba/20230731/semapa-ratifica-rebaja-del-agua-cobro-escalonado-10-m3 |
| S11 | Los Tiempos, "Agua las 24 horas y la tarifa por consumo, las deudas pendientes de Semapa", 25/7/2017 | B | Leída | https://www.lostiempos.com/actualidad/cochabamba/20170725/agua-24-horas-tarifa-consumo-deudas-pendientes-semapa |
| S12 | eju.tv, "Gobierno y choferes acuerdan suspender por 7 días el incremento en el peaje de la doble vía La Paz-Oruro", febrero de 2015 | B | Leída | https://eju.tv/?p=555339 |
| S13 | eju.tv, "Los estados financieros de Mi Teleférico son deficitarios, no lo inventé yo, afirma economista Romero", 11/04/2025 | B | Leída | https://eju.tv/?p=4581337 |
| S14 | Correo del Sur, "Bloqueos dejan pérdidas de Bs 52,5 millones en peajes y complican mantenimiento vial en el país", 23/06/2026 | B | Leída | https://correodelsur.com/economia/20260623/bloqueos-dejan-perdidas-de-bs-52-5-millones-en-peajes-y-complican-mantenimiento-vial-en-el-pais.html |
| S15 | eju.tv, "Cochabamba: Vías Bolivia advierte que no pagar peajes constituye un delito...", 28/07/2026 | B | Leída | https://eju.tv/?p=5049304 |
| S16 | Los Tiempos, "La inflación acumulada llega al 4,82% en primer semestre, según el reporte del INE", 7/7/2026; y Correo del Sur, "Inflación del 2025 fue la más alta en 36 años", 7/1/2026 (el titular contradice la propia nota, que cita 1988 con 21,47%) | B | Ambas leídas | https://www.lostiempos.com/actualidad/economia/20260707/inflacion-acumulada-llega-al-482-primer-semestre-reporte-del-ine y https://correodelsur.com/economia/20260107/inflacion-del-2025-fue-la-mas-alta-en-36-anos.html |
| S17 | Ronald Nostas Ardaya, "Las alianzas público privadas imposibles en Bolivia", eju.tv (opinión), 26/06/2024 | C (opinión de un dirigente empresarial) | Leída | https://eju.tv/?p=4192575 |
| S18 | Forvis Mazars, "What Is the Debt Service Coverage Ratio (DSCR) in Project Finance?" | C | Leída | https://financialmodelling.forvismazars.com/resources/debt-service-coverage-ratio-dscr/ |

**Conteo.** 18 fuentes numeradas. Nivel A: 7 (S1 a S7), de las cuales 5 son papers, libros u organismos (S1 a S5) y 2 son normas oficiales bolivianas (S6, S7). Todas las A las abrí con texto, pero S3 y S5 solo por secciones y S6 por un resumen de la página. Se cumple el mínimo de 8 fuentes y de 4 de nivel A leídas.

---

## 9. No confirmado

- **Ley 2066 de agua y alcantarillado.** No abrí su texto. Solo vi un resumen de búsqueda (régimen tarifario en Título VI, arts. 53 a 62, según una resolución de la AAPS) y la mención en el DS 26587. No sé el plazo de las licencias ni la fórmula de ajuste tarifario.
- **Fórmula y periodicidad del reajuste tarifario del agua.** No encontré el reglamento tarifario vigente de la AAPS. Un resultado de búsqueda mencionó una política tarifaria nacional de 2015 en versión "ajustada" y no pude confirmar si fue adoptada.
- **Regulador eléctrico.** Las fuentes dan nombres distintos: la búsqueda mostró "AETN" en un documento de GIZ y [S8] usa "ERE". No lo resolví. La Ley de Electricidad 1604 se confirma por [S5], pero no leí su texto.
- **Ley de APP en Bolivia.** La afirmación de que no existe viene de una opinión [S17]. No encontré la Gaceta Oficial ni el Ministerio. Resultados de búsqueda mencionan los DS 3469 (2018) y 4040 (2019) y la Ley 466 de empresas públicas; no los abrí.
- **Tipo de cambio.** El fin del tipo fijo de Bs 6,96 y la flotación desde el 29 de junio de 2026, y la cotización de Bs 11,85 del 8 de octubre, vienen de resultados de búsqueda; no abrí las notas. Verifica en el BCB antes de usarlas.
- **Cifras de Vías Bolivia 2025** (recaudación de Bs 658 millones en 169 estaciones, 91% a 92% de lo programado, 8 estaciones con telepeaje, 17% para gastos): provienen de resultados de búsqueda sobre sus informes; no abrí los PDF. El 17% sí está en el DS 28948 [S6].
- **Manual de la Guía de Referencia APP del Banco Mundial.** No pude abrirlo (403). La explicación de riesgo de demanda, pago por disponibilidad y reversión se apoya en [S2] y [S3], más resúmenes de búsqueda que no abrí.
- **Agua no contabilizada de SEMAPA, SAGUAPAC y otras EPSA.** No encontré porcentajes publicados en las notas que abrí. Tampoco hallé datos de SAGUAPAC (cooperativa de Santa Cruz) ni de cooperativas eléctricas como CRE más allá de [S5].
- **Plazos típicos de concesión en Bolivia, tasa de descuento regulatoria, estructuras de deuda reales.** No encontré datos.
- **Telecomunicaciones rurales, terminales y mercados.** No hice búsquedas específicas para estos tres sub-tipos; el documento cubre agua, electricidad, carreteras y transporte por cable. Si el owner quiere esos sub-tipos, hay que investigarlos aparte.
- **Estudio de la CEPAL (2020) citado en [S17]** sobre sobrecostos en obras públicas versus APP: lo cita una opinión; no lo abrí.
- **Ingresos accesorios de Mi Teleférico.** Los tomo de la taxonomía (`00-taxonomia-tipos.md`), que cita una nota de eju.tv de 2016; no la reabrí.
- **Cifra SABESP.** [S1] da US$ 43 millones cobrados, dice que son 78% del monto, y en otra parte dice que la deuda a negociar era de unos US$ 65 millones (43/65 no da 78%). No pude reconciliarlo; usa solo US$ 43 millones y el 70% en efectivo como orden de magnitud.
- **Umbrales de DSCR.** Vienen de [S18] (consultora) y de resultados de búsqueda que se contradicen entre sí (1,10x a 1,75x según la fuente). No son normas.

---

## 10. Cifras que necesitan validación local

| Cifra (estimación mía o sin dato de Bolivia) | Dónde aparece | Quién podría aportarla |
|---|---|---|
| Caída de tráfico en el primer año (-15% a -40%) | Sit. 1 | Docente de transporte o ingeniero de ABC o Vías Bolivia; estudios de demanda de tramos concesionados o de teleférico |
| Pérdida de ingreso en meses de bloqueo (-20% a -60%) y evasión posterior (+5 a +15 puntos) | Sit. 4 | Vías Bolivia (datos por estación y por mes de 2026); transportistas |
| Efecto de una alza de tarifa sobre el tráfico o consumo (-5% a -20%) | Sit. 3 | Elasticidades de estudios de demanda (por ejemplo UCB, UMSS, UMSA); AAPS |
| Avance anual en reducción de NRW (3 a 8 puntos) y NRW actual de las EPSA bolivianas | Sit. 5 | AAPS (memoria institucional, indicadores por EPSA); SEMAPA, SAGUAPAC; docente de ingeniería sanitaria |
| Caída de eficiencia de cobranza (-2 a -6 puntos) y pérdidas no técnicas actuales | Sit. 6 | Cooperativas eléctricas y distribuidoras (CRE, ELFEC, etc.); autoridad de electricidad |
| Caída del volumen disponible en sequía (-10% a -30%) y reducción de consumo por tarifa (-5% a -15%) | Sit. 7 | SEMAPA, AAPS, SENAMHI |
| Costo de refinanciar en bolivianos (tasa y plazo), prima de riesgo regulatorio (+1 a +3 puntos) | Sit. 8, 9 | Banco local (BDP, banca comercial), docente de finanzas, ASFI |
| Efecto de la tarifa pico (-3% a -10% del tráfico en pico) | Sit. 12 | Mi Teleférico (datos de rotación), el equipo de [S4] |
| Participación de ingresos accesorios (5% a 15%) | Sit. 13 | Mi Teleférico, terminales de buses, mercados municipales |
| Ritmo de nuevas conexiones (+5% a +15% en dos años) y morosidad inicial | Sit. 14 | AAPS, EPSA, municipios |
| Tarifas reales, rezago de ajustes y fechas de aprobación | Sit. 2 | AAPS, Ministerio de Obras Públicas, autoridad eléctrica |
| Umbrales de DSCR y condiciones de crédito para infraestructura en Bolivia | Sit. 11; sección 2 | Banco de desarrollo, banca comercial, docente de finanzas de proyectos |
| Curva de maduración de la demanda de una obra nueva | Sección 6 | Estudios de demanda de Mi Teleférico, de carreteras o de agua |
| Costos de mantenimiento mayor como porcentaje de la inversión y vida útil de activos | Sit. 10 | Ingeniero civil o sanitario, ABC |
| Inflación futura y tipo de cambio como parámetros del escenario | Sit. 2, 8; sección 6 | INE, BCB |
