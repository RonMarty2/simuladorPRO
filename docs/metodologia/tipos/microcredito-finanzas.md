# Servicios financieros y microcrédito (ficha A14)

Documento de investigación para el simulador SIMPRO. Cubre instituciones de microfinanzas (IFD, bancos PYME, cooperativas de ahorro y crédito, fondos rotatorios) y fintech de pagos o préstamos cuyo ingreso viene de intereses y comisiones sobre una cartera de créditos.

## Cómo leer este documento

- **[Sn]** indica que el dato viene de la fuente número n de la sección 8, y que la abrí y leí.
- **(estimación)** indica una cifra mía, sin fuente. Hay que validarla antes de programarla (sección 10).
- **[Interpretación]** indica un razonamiento mío a partir de lo que dicen las fuentes.
- **[Memoria]** indica una fórmula que reconstruí de memoria; no la verifiqué en una fuente abierta.
- Lo que no pude verificar está en la sección 9.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Una entidad que capta dinero (de socios, ahorristas, inversionistas o bancos) y lo presta a personas y negocios que cobran una tasa más alta que lo que paga por ese dinero. La ganancia es la diferencia (el margen), menos lo que cuesta operar y menos lo que se pierde por los créditos que no se pagan. El "producto" es dinero: no hay inventario ni materia prima.

**Cómo aporta valor.**
- Da crédito a quienes la banca tradicional atiende poco: microempresarios, comerciantes, productores, familias de ingreso bajo. En Bolivia el microcrédito era el 31% de la cartera total del sistema financiero a abril de 2026 (Bs 72.035 millones de Bs 232.613 millones) [S8].
- Su método de trabajo es distinto al del banco: un asesor visita el negocio y la casa del cliente, estima su flujo de caja informal y presta montos chicos con pagos frecuentes [S1].
- Las entidades reguladas en Bolivia además deben cumplir con crédito dirigido: un nivel mínimo de cartera al sector productivo y a vivienda de interés social, con tasas máximas reguladas [S5].

**Por qué es distinto de otros proyectos.** [Interpretación] Un negocio de microcrédito no vende un bien con costo variable por unidad: presta dinero cuyo "costo de ventas" es el costo de fondeo, y su riesgo principal (la mora) no se ve hasta meses después de desembolsar. El mismo desembolso puede ser un buen negocio o una pérdida según lo que pase con el cliente.

**Qué ya dice el mapa del simulador.** La taxonomía del proyecto (ficha A14) ya anota que el flujo clásico lo representa mal: el resultado depende de la mora y del fondeo, y las variables mensuales son colocaciones, desembolsos, mora, tasa y fondeo.

---

## 2. Indicadores propios y cómo se calculan

Las fórmulas marcadas con [S2] están transcritas de las "Microfinance Consensus Guidelines" de CGAP (tercera edición, septiembre de 2003), que leí. Las explicaciones en palabras son mías, salvo cuando dice lo contrario.

| Indicador | Fórmula | Qué te dice | Fuente |
|---|---|---|---|
| Cartera en riesgo (PAR) a X días | Saldo de todos los créditos con una o más cuotas de capital vencidas hace más de X días / Cartera bruta | Es la medida más aceptada de calidad de cartera. Siempre hay que decir cuántos días (PAR30, PAR90) y si incluye los créditos reestructurados | [S2] (el texto exige indicar los días y si se incluyen reestructurados) |
| Índice de mora (ASFI) | Cartera en mora / Cartera bruta. Abril 2026: Bs 6.682 millones sobre Bs 232.613 millones, es decir 2,9% | Es el indicador que publica ASFI | [S8] (la definición exacta de ASFI de "mora" la tomo como equivalente al ratio; ver sección 9) |
| Índice de castigo | Valor de créditos castigados en el período / Cartera bruta promedio | Mide pérdidas ya reconocidas. Cuidado: castigar rápido baja la mora sin que mejore el negocio | [S2]; el caso de Bosnia en [S3] |
| Cobertura de riesgo | Previsiones (reserva para pérdidas) / Cartera en riesgo | Cuánto de la cartera dudosa está respaldado con reservas. Bolivia, abril 2026: Bs 9.892 millones / Bs 6.682 millones = 148% | [S2] define la razón; [S8] da el 148% |
| Rendimiento de la cartera | Ingresos financieros cobrados en efectivo de la cartera / Cartera bruta promedio | Qué tasa real efectivamente cobras, no la del contrato | [S2] |
| Brecha de rendimiento | 1 menos (ingreso cobrado / (cartera neta x rendimiento esperado)) | Compara lo que cobraste con lo que debías cobrar según los contratos. Una brecha mayor a 10% sugiere atrasos, fraude, ineficiencia o error contable | [S2] |
| Razón de gasto de fondeo (costo de fondos) | Intereses y comisiones pagados por pasivos de fondeo / Cartera bruta promedio. Su variante "costo de fondos" divide por el promedio de pasivos de fondeo | Cuánto te cuesta el dinero que prestas | [S2] |
| Razón de gasto operativo | Gasto operativo / Cartera bruta promedio | Cuánto cuesta operar por cada boliviano prestado. Es el factor que más empuja la tasa activa en microcrédito | [S2] |
| Costo por prestatario | Gasto operativo / Número promedio de prestatarios activos | Cuánto cuesta atender a un cliente al año | [S2] |
| Productividad del asesor | Prestatarios activos / Número de asesores de crédito | Cuántos clientes lleva cada asesor | [S2] |
| Tamaño promedio de crédito | Cartera bruta / Número de créditos vigentes | Créditos más grandes diluyen el costo operativo pero cambian el tipo de cliente | [S2] |
| Autosuficiencia operativa | Ingresos operativos / (Gasto financiero + Previsiones + Gasto operativo) | Si el ingreso cubre todos los costos. Menor a 100% significa pérdidas | [S2] |
| ROA y ROE | (Resultado operativo neto menos impuestos) / Activo promedio, y / Patrimonio promedio | Rentabilidad | [S2] |
| Razón de liquidez corriente | Activos de corto plazo / Pasivos de corto plazo | Si puedes devolver depósitos y deudas en 12 meses | [S2] |
| Coeficiente de Adecuación Patrimonial (CAP) | Capital regulatorio / Activos ponderados por riesgo [Memoria]. ASFI informa que el mínimo legal es 10% y que el sistema estaba sobre ese mínimo en abril de 2026 | Solvencia: cuánto capital propio respalda el riesgo | [S8] para el mínimo de 10%; la fórmula es de memoria |

**Fórmulas de armado que uso en el simulador (mías, no de una fuente)** [Interpretación]:

- Margen financiero anual = Rendimiento de la cartera - Costo de fondeo - Pérdida por créditos incobrables.
- Tasa activa de equilibrio aproximada = Costo de fondeo + Gasto operativo sobre cartera + Pérdida esperada (previsiones) + Utilidad mínima exigida. Es una identidad contable simple; la uso para mostrar al alumno por qué no puede cobrar menos que eso.
- Ejemplo numérico del propio alumno (no es dato real): si fondeo cuesta 5%, el gasto operativo es 12% de la cartera, las pérdidas son 2% y quieres 3% de utilidad, la tasa de equilibrio es 22%. (estimación; los valores de ejemplo hay que calibrarlos con datos de Bolivia).

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN/TIR clásico y por qué

**Qué falla en el flujo clásico.** [Interpretación, apoyada en la ficha A14 de la taxonomía]
1. Una cartera no es una inversión de una sola vez: se desembolsa, se cobra en cuotas, se vuelve a desembolsar. El "flujo de caja" de una entidad incluye entradas y salidas de capital prestado que no son ingresos ni costos.
2. La pérdida por mora aparece con rezago. Un VAN con mora constante esconde que la mora sube en recesión y con competencia [S1][S3].
3. El fondeo es parte del negocio, no una decisión financiera aparte. Si una entidad capta depósitos, su costo y su estabilidad (liquidez) determinan si el proyecto sobrevive [S1][S13].
4. Hay un requisito de capital regulatorio (el CAP mínimo de 10% en Bolivia [S8]) que limita cuánto puedes crecer aunque el VAN dé positivo.

**Qué se usa en su lugar o además.**
- **Estado de resultados proyectado por cartera**, con los indicadores de la sección 2: margen financiero, gasto operativo, previsiones y utilidad. Lo habitual en el sector es evaluar con ROA, ROE y autosuficiencia operativa [S2].
- **Punto de equilibrio en cartera**: la cartera mínima para cubrir los costos fijos de la sucursal. [Interpretación]
- **VAN del flujo al accionista (patrimonio)**, no al proyecto: aportes de capital, utilidades distribuidas y valor residual. Se complementa con la restricción de capital: el crecimiento de cartera exige capital propio (mínimo 10% de CAP).
- **Análisis de escenarios de mora y fondeo**: el alumno debe ver el VAN con mora base, con mora de recesión y con fuga de depósitos. [Interpretación]
- **Cohorte (camada) de créditos**: seguir cada tanda de desembolsos para ver su mora real, no la mora mezclada de la cartera. [Interpretación; es una práctica común, pero no la verifiqué en una fuente abierta]

**Por qué importa para el alumno.** Un proyecto con VAN positivo puede quebrar por liquidez (no tiene caja para devolver depósitos), y uno con VAN negativo en flujo clásico puede ser viable si se mide bien la cartera. La enseñanza es que aquí la caja, la mora y el capital regulatorio mandan sobre el VAN.

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Estos errores son [Interpretación] mía, salvo donde cito fuente.

**De estudiantes (al armar el plan):**
1. Poner una mora fija y baja (por ejemplo 1%) para los cinco años. Las fuentes muestran que la mora sube de golpe en recesión y competencia: en Bolivia pasó de menos de 5% a casi 9% (PAR30) entre 1999 y 2001 en las cuatro mayores entidades de microfinanzas [S1].
2. Contar como ingreso los intereses devengados sin cobrar. CGAP define el rendimiento con ingresos cobrados en efectivo, no devengados [S2].
3. Olvidar el gasto operativo: en microcrédito es la mayor parte del costo, por el trabajo de visitar y seguir clientes [S2][S7].
4. Ignorar que la tasa activa tiene topes. Los créditos productivos y de vivienda social tienen tasas máximas reguladas [S5][S6].
5. Tratar el fondeo como infinito y barato. Si captas depósitos, ese dinero se puede retirar.
6. Calcular un VAN sin restricción de capital regulatorio (CAP).
7. Confundir ingresos por cartera con flujo de caja: desembolsar es una salida de caja.

**De emprendedores:**
1. Crecer muy rápido y contratar asesores sin capacitación: los casos de Nicaragua, Marruecos, Bosnia y Pakistán mostraron personal que creció cerca de 40% por año y sistemas sobrepasados [S3].
2. Competir por los mismos clientes en la misma zona, sin consultar buró de crédito: en Marruecos, el banco central estimó que 40% de los prestatarios tenía créditos con más de una entidad justo cuando empezó la crisis de pagos [S3].
3. Prestar a asalariados o a consumo con la tecnología del microcrédito. En Bolivia los prestamistas de consumo que entraron en 1996-1998 prácticamente abandonaron el segmento dos años después y varios colapsaron [S1][S4].
4. Premiar al personal solo por volumen de desembolsos [S3].
5. Bajar la tasa para ganar clientes sin bajar costos.
6. No planear liquidez: el caso de Banco Fassil muestra que perder liquidez puede terminar en intervención aunque el banco tenga cartera [S13].

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **[Sn]** si viene de fuente, **(estimación)** si es mía); decisiones posibles con ventajas y costos; qué aprende el alumno.

Las magnitudes de las fuentes vienen de contextos concretos (país, fecha, tipo de entidad). Las marcadas "estimación" conviene calibrarlas con datos locales antes de programarlas (sección 10).

---

### Situación 1. Llegan competidores y los clientes empiezan a tomar varios créditos

**Qué pasa.** Otras entidades abren sucursales en tu zona y ofrecen montos mayores o desembolso más rápido. Tus mejores clientes toman un segundo y un tercer crédito. En Bolivia, a fines de los años 90, los prestamistas de consumo atrajeron a buenos clientes de las microfinancieras con créditos más grandes, rápidos y baratos, y a clientes ya endeudados; los clientes llegaron a tener dos o más créditos y algunos pagaban un crédito con otro [S4]. En Marruecos, el banco central estimó que 40% de los prestatarios tenía créditos de más de una entidad al comenzar la crisis de pagos [S3].

**Variables que mueve.**
- Nuevos clientes por mes: sube al principio (más demanda) si compites, luego baja por saturación (estimación: +10% a +20% los primeros meses).
- Multiendeudamiento de la cartera: sube (en Marruecos 40% [S3]).
- Mora (PAR30): sube con rezago de 6 a 18 meses; el magnitud en Bolivia 1999-2001 fue de menos de 5% a casi 9% [S1]; en los cuatro países de CGAP superó 10% [S3].
- Incentivo de repago del cliente: baja, porque la promesa de "créditos mayores si pagas bien" pierde fuerza si el cliente puede ir a otra entidad [S1].

**Decisiones del alumno.**
1. *Igualar la oferta (montos mayores, aprobación más rápida).* Ventaja: conservas clientes y volumen. Costo: pierdes control del análisis y aumentas el riesgo de sobreendeudamiento [S1][S3].
2. *Mantener tu método y perder algunos clientes.* Ventaja: cartera más sana. Costo: la cartera crece menos o se achica, lo que presiona la cobertura de los gastos fijos.
3. *Consultar siempre el buró de información crediticia y limitar el monto según la deuda total del cliente.* Ventaja: reduce el multiendeudamiento. Costo: algunos clientes se van, y la consulta suma costo por crédito. Es una práctica que usaron las entidades que sobrevivieron la crisis boliviana [S1].
4. *Diferenciarte con servicio y relación (visitas, educación financiera).* Ventaja: lealtad, menos mora. Costo: sube el gasto operativo por cliente y el efecto tarda.

**Qué aprende.** Que crecer a costa de un cliente que ya debe a otros no es crecer: el riesgo se acumula y aparece en la mora un año después.

---

### Situación 2. Recesión o bloqueos: las ventas de tus clientes caen

**Qué pasa.** Un shock golpea a los pequeños negocios: bloqueos de carreteras, escasez de dólares, caída del consumo interno. En Bolivia 1999-2001 la caída de ventas de las pequeñas empresas por menor consumo interno fue uno de los impulsores de la mora [S1]. En 2024 y 2025 el regulador y la prensa citan bloqueos y fenómenos climáticos como causa de pedidos de reprogramación [S11][S12].

**Variables que mueve.**
- Ingreso de los clientes: baja (no hay dato en las fuentes; estimación: -10% a -30% durante 3 a 9 meses).
- Mora: sube (referencia: casi 4 puntos de PAR30 en Bolivia 1999-2001 [S1]; en el sistema actual la mora sigue baja, 2,9% en abril de 2026 [S8], así que un shock parte de una base baja).
- Clientes activos: bajan (cuatro principales entidades bolivianas: de más de 180.000 en 1999 a poco más de 145.000 en 2002 [S1]).
- Reputación de la entidad: baja si las cobranzas son duras (ver situación 10).

**Decisiones del alumno.**
1. *Apretar cobranza y exigir cuotas completas.* Ventaja: cuidas el flujo de corto plazo. Costo: más clientes en mora real, riesgo reputacional y político (ver situación 7).
2. *Reprogramar caso por caso a quien lo pida.* Ventaja: conservas al buen cliente. Costo: el crédito reprogramado queda con más riesgo, exige más previsiones y esconde el deterioro si se usa sin análisis (ver situación 6).
3. *Frenar nuevos desembolsos y guardar liquidez.* Ventaja: protege la caja. Costo: el ingreso baja justo cuando la cartera existente rinde menos; pierdes el crecimiento.
4. *Seguir prestando de forma selectiva a los clientes que sobrevivieron.* Ventaja: puedes captar clientes que las entidades que se retiran dejan. Los autores señalan que la crisis es riesgo y también oportunidad [S1]. Costo: exige análisis fino y capital para soportar más mora.

**Qué aprende.** Que el microcrédito no es inmune a la economía: depende de la caja de microempresarios que sí se afecta con el consumo interno, y el ciclo mal manejado deja cicatrices por años.

---

### Situación 3. El regulador fija un tope a la tasa activa

**Qué pasa.** Bolivia regula tasas máximas para dos grupos de crédito: el productivo (según tamaño de la unidad: 11,5% anual para micro, 7% para pequeña, 6% para mediana y grande en el Decreto 2055 de 2014) y la vivienda de interés social (5,5%, 6,0% y 6,5% según el valor de la vivienda en el Decreto 1842 de 2013) [S5][S6]. Los topes no incluyen seguros, formularios u otros recargos, que quedan sujetos a la norma de ASFI [S5][S6]. No pude confirmar que esos números sigan iguales hoy (sección 9). Los estudios internacionales advierten que los topes de tasa suelen sacar a las entidades de los segmentos más caros de atender y reducir su transparencia, aunque busquen proteger al cliente [S7].

**Variables que mueve.**
- Tasa activa efectiva en el tramo regulado: queda limitada al tope (valores de la norma [S5][S6]).
- Margen financiero: baja si el costo operativo y de fondeo no baja (el simulador puede mostrar la brecha entre tasa de equilibrio y tope).
- Crecimiento de cartera: baja en tramos no rentables. Ejemplo de otro país: en Nicaragua el crecimiento de cartera de las entidades cayó de 30% anual a menos de 2% cuando se introdujo un tope en 2001 (declaración del presidente de la asociación de entidades, citada en [S7]).
- Transparencia del costo total: baja si la entidad cobra cargos fuera del tope [S7] (ejemplo de Sudáfrica).

**Decisiones del alumno.**
1. *Cumplir el tope y reducir gastos para sobrevivir (menos sucursales, más digital).* Ventaja: cumples y mantienes el producto. Costo: menos atención presencial, mala para zonas rurales.
2. *Mover la cartera hacia créditos no regulados con tasa libre (consumo, microcrédito no productivo).* Ventaja: mejor margen. Costo: riesgo mayor, cuestionamiento reputacional (ver situación 10), y puede chocar con tu cartera dirigida.
3. *Subir comisiones y seguros fuera del tope.* Ventaja: recuperas margen. Costo: el costo total para el cliente sube, el regulador puede reglamentarlo y pierdes confianza. Es el efecto de elusión descrito en [S7].
4. *Crecer en volumen para diluir costos fijos.* Ventaja: economía de escala; el caso de BancoSol muestra que su tasa efectiva bajó de 65% en 1992 (con 4.500 clientes) a 22% con 55.000 clientes [S7]. Costo: exige capital y control, y el crecimiento rápido es el riesgo de la situación 8.

**Qué aprende.** Que la tasa no se elige: se despeja del costo operativo, el fondeo y la pérdida. Un tope que queda debajo de la tasa de equilibrio obliga a cambiar el modelo, no solo el precio.

---

### Situación 4. Cartera dirigida: cumplir el nivel mínimo productivo y de vivienda social

**Qué pasa.** La norma boliviana obliga a mantener un porcentaje mínimo de cartera en crédito productivo y vivienda de interés social. Texto del Decreto 1842: bancos múltiples, 60% entre productivo y vivienda social, con al menos 25% de la cartera total en productivo; entidades financieras de vivienda, 50% en vivienda social; bancos PYME, 50% en préstamos a pequeñas, medianas y micro empresas productivas (con ciertos cómputos adicionales). Solo cuentan los créditos en moneda nacional [S5]. Un decreto posterior (el 4408, de 2020) habría modificado los porcentajes, pero no pude abrirlo (sección 9). A abril de 2026 el sector productivo era 48% de la cartera y la vivienda social 13% [S8].

**Variables que mueve.**
- Mix de cartera: obligado a un mínimo en productivo y vivienda social [S5].
- Tasa activa promedio: baja si pesa más vivienda social (tope 5,5% a 6,5% [S5]).
- Margen: baja en vivienda social, que además tiene plazos largos (estimación).
- Riesgo de liquidez: sube, porque créditos de largo plazo se financian con depósitos de corto plazo [Interpretación].
- Sanciones por incumplimiento: el decreto prevé sanción (lo dice el texto, pero no el monto [S5]).

**Decisiones del alumno.**
1. *Cumplir con créditos de vivienda social de largo plazo.* Ventaja: cumples y obtienes volumen estable con garantía real. Costo: margen bajo y riesgo de descalce de plazos.
2. *Cumplir con crédito productivo (capital de operación, inversión).* Ventaja: mejor tasa que vivienda social (hasta 11,5% para micro [S6]). Costo: más análisis y seguimiento, más mora en shocks.
3. *Buscar alianzas o fondeo especializado (por ejemplo, de segundo piso o fondo de garantía) para sostener la cartera dirigida.* Ventaja: mejor fondeo o garantía. Costo: depender de un tercero y de sus condiciones. No verifiqué las condiciones actuales de los fondos de garantía en Bolivia (sección 9).
4. *Aceptar la sanción y priorizar créditos más rentables.* Ventaja: protege el margen en el corto plazo. Costo: sanción, riesgo de licencia y de relación con el regulador.

**Qué aprende.** Que parte de la cartera la decide la ley, no el mercado, y que el cumplimiento tiene un costo que hay que presupuestar.

---

### Situación 5. Fuga de depósitos y crisis de liquidez

**Qué pasa.** Una entidad que capta ahorros enfrenta retiros mayores a lo esperado: escasez de dólares, rumores, retiro de depósitos grandes. El caso de Banco Fassil: según Los Tiempos (3 de mayo de 2023), el banco reportó que sus activos líquidos tuvieron una "disminución significativa", con una salida de caja de 317 millones de dólares en el año, pidió apoyo de liquidez al Banco Central que fue rechazado, y fue intervenido por ASFI [S13]. Ese banco no era una microfinanciera, pero la mecánica aplica a cualquier entidad con depósitos. Las cooperativas y otras entidades reguladas también dependen de depósitos.

**Variables que mueve.**
- Depósitos: bajan (en el caso Fassil la salida fue de 317 millones de dólares en el año [S13]; para el simulador, estimación: -10% a -30% en 1 a 3 meses en una corrida moderada).
- Liquidez (activos líquidos / depósitos de corto plazo): baja. El sistema boliviano tenía un ratio de 67,4% a abril de 2026 según la gráfica de ASFI, contra un "límite prudencial" de 50% que muestra la gráfica [S8] (no pude confirmar con certeza la lectura de la gráfica; ver sección 9).
- Costo de fondeo: sube, porque debes pagar más por depósitos o conseguir líneas de emergencia (estimación: +1 a +3 puntos).
- Capacidad de nuevos desembolsos: baja.

**Decisiones del alumno.**
1. *Vender o ceder parte de la cartera para obtener caja.* Ventaja: caja inmediata. Costo: pérdida con descuento, y la señal al mercado empeora la confianza.
2. *Subir las tasas pasivas para retener depósitos.* Ventaja: frena la salida. Costo: sube el costo de fondeo para todos los depósitos, y comprime el margen.
3. *Frenar desembolsos para conservar caja.* Ventaja: protege liquidez. Costo: baja el ingreso futuro, los clientes buenos se van.
4. *Pedir apoyo de liquidez al regulador o al Banco Central.* Ventaja: puede evitar la intervención. Costo: no está garantizado (en el caso Fassil fue rechazado según fuentes de la entidad [S13]), exige condiciones y expone a la entidad.

**Qué aprende.** Que prestar a largo con depósitos a la vista es el riesgo central del negocio, y que la liquidez se pierde antes de que la cartera se deteriore.

---

### Situación 6. Presión para reprogramar masivamente (decretos de alivio)

**Qué pasa.** El Gobierno emite normas que obligan a las entidades a atender pedidos de reprogramación o refinanciamiento. En 2024 el Decreto 5241 estableció que para créditos con plazo residual de hasta 2 años la reprogramación podía hacerse hasta 5 años (dato de un resultado de búsqueda; no abrí el decreto, ver sección 9). En junio de 2026, ASFI informó que el Decreto 5630 es de aplicación inmediata y que ninguna entidad puede negarse a recibir, evaluar y tramitar pedidos de alivio [S12]. En el último año hasta junio de 2025 se reprogramaron unos 78 mil créditos por más de Bs 12.000 millones y se refinanciaron más de 122 mil por Bs 10.883 millones, con plazo máximo de 30 días para responder [S11]. La banca reporta que 62% de su mora a mayo de 2025 estaba ligada a créditos reprogramados y que la cartera reprogramada era 15% del total (esas cifras son de bancos, no de microfinancieras) [S10].

**Variables que mueve.**
- Cartera reprogramada: sube (referencia: 15% de la cartera bancaria [S10]; estimación para el simulador: 5% a 20% de la cartera).
- Flujo de cobranza del mes: baja (se alargan plazos y se suman períodos de gracia).
- Ingresos por intereses: bajan a corto plazo, suben en el total si el cliente se recupera.
- Previsiones: suben por los créditos reprogramados (estimación; regla exacta no verificada).
- Mora aparente: baja al reprogramar, pero la mora real puede subir después [S10].

**Decisiones del alumno.**
1. *Aprobar casi todo lo que piden.* Ventaja: cumples la norma y cuidas la relación con el cliente. Costo: mezclas buenos y malos deudores, y la mora aparece después (la banca atribuye mucha de su mora actual a esas medidas [S10]).
2. *Evaluar uno a uno con visita del asesor.* Ventaja: separas al cliente recuperable del que no. Costo: más gasto operativo, demoras (el plazo máximo es 30 días [S11]) y reclamos.
3. *Reprogramar solo con una cuota inicial o una garantía adicional.* Ventaja: filtra a quien puede pagar. Costo: puede contradecir la norma de alivio si se interpreta como rechazo (ver [S12]), y afecta la relación con el cliente.
4. *Constituir previsiones adicionales antes de que la mora aparezca.* Ventaja: te prepara. Costo: baja la utilidad ahora y no hay ingreso extra.

**Qué aprende.** Que reprogramar es una herramienta, no una solución: alivia la caja del cliente a cambio de postergar la pérdida, y la contabilidad puede esconder el problema.

---

### Situación 7. Movimiento de no pago o exigencia de condonación

**Qué pasa.** Grupos de deudores se organizan para dejar de pagar o exigir perdón de deudas. En Bolivia, en 2000-2001, asociaciones de deudores protestaron contra prestamistas de consumo y microfinancieras (incluidas Caja Los Andes y BancoSol), exigieron condonación, prohibiciones de ciertas prácticas de cobranza, plazos más largos y tasas de 2% anual, y en julio de 2001 tomaron la Superintendencia de Bancos con dinamita; la secuela fue la politización del microcrédito y daño a la cultura de pago [S4]. En Nicaragua, un movimiento "No Pago" con respaldo político creó una bolsa de mora en el norte; en Pakistán, una proclama falsa de condonación hizo que grupos dejaran de pagar [S3].

**Variables que mueve.**
- Mora en la zona afectada: sube fuerte (en Nicaragua y Pakistán la mora superó 10% [S3]).
- Cultura de pago: baja y tarda años en recuperarse [S4].
- Reputación pública: baja.
- Costo de cobranza y legal: sube (estimación).

**Decisiones del alumno.**
1. *Mantener firmeza total y exigir cumplimiento.* Ventaja: no premias el incumplimiento. Costo: escalada del conflicto, riesgo reputacional y político.
2. *Negociar caso por caso con refinanciamiento.* Ventaja: reduce el conflicto, diferencia al cliente que no puede del que no quiere. Es lo que acordaron las entidades bolivianas, aunque se resolvieron pocos casos [S4]. Costo: tiempo y señal de que protestar funciona.
3. *Campaña de información sobre la verdad de las condonaciones falsas.* En Pakistán fue una noticia falsa la que movió el no pago [S3]. Ventaja: ataca la causa. Costo: no siempre llega a tiempo y hay que presupuestar.
4. *Coordinar con otras entidades y con el regulador una respuesta común.* Ventaja: evita que una entidad sea la única exigente. Costo: depende de otros y puede parecer cartel.

**Qué aprende.** Que el activo más valioso del microcrédito es la cultura de pago, y que se puede destruir por una mala racha con política de por medio.

---

### Situación 8. Crecimiento rápido: asesores sin entrenar y control débil

**Qué pasa.** La entidad crece 40% o más al año y contrata asesores a velocidad. CGAP encontró que las entidades de Nicaragua, Marruecos, Bosnia y Pakistán crecieron entre 33% y 67% anual, añadieron cerca de 40% de personal por año y fallaron en capacitación, sistemas y control. Pakistán sumó 9.600 empleados entre 2004 y 2008 [S3]. En Marruecos, 40% de la mora se debió a cambios en las políticas de crédito (aumento de montos y nuevos productos) [S3].

**Variables que mueve.**
- Cartera bruta: sube rápido (33% a 67% anual en los casos [S3]).
- Productividad por asesor: sube a corto plazo, cae la calidad del análisis.
- Mora: sube con rezago de 1 a 2 años (en los casos pasó de ~2% a 7% a 13% [S3]).
- Gasto operativo: sube por nuevos asesores y capacitación (estimación).
- Calidad del servicio / relación con el cliente: baja [S3].

**Decisiones del alumno.**
1. *Seguir creciendo a toda velocidad.* Ventaja: más ingresos y escala, y los inversionistas lo valoran. Costo: riesgo de deterioro tardío (la crisis llegó cuando el crecimiento ya había sido alto [S3]).
2. *Crecer al ritmo que permita capacitar (tope de contrataciones por año).* Ventaja: cartera sana. Costo: pierdes mercado ante competidores y el costo fijo pesa más.
3. *Cambiar el incentivo de los asesores: pagar por calidad de cartera además de volumen.* Ventaja: corrige un conflicto de intereses señalado en [S3]. Costo: menor producción a corto plazo y puede haber rotación de asesores.
4. *Invertir en sistemas y controles internos antes de crecer más.* Ventaja: sostiene el crecimiento futuro. Costo: gasto que no da ingreso inmediato.

**Qué aprende.** Que el crecimiento rápido no falla ese año: falla en la cohorte del siguiente, y la mora de hoy es consecuencia de decisiones de hace 12 a 24 meses.

---

### Situación 9. Crédito grupal contra crédito individual, con contagio entre integrantes

**Qué pasa.** Un grupo solidario (banca comunal) funciona bien en buenos tiempos porque los miembros se vigilan y cobran entre sí, pero en una crisis un miembro que cae puede arrastrar a los demás. En Bolivia 1999-2001 el crédito grupal sufrió contagio de los malos pagadores a los buenos, y BancoSol pasó de tener la mayoría en grupos a operar sobre todo con crédito individual [S1]. Los autores también señalan ventajas del grupo: información compartida y menor costo de transacción [S1]. ASFI tiene un reglamento específico de microcrédito con tecnología de banca comunal; en octubre de 2024 lo modificó para exigir atender pedidos voluntarios de reprogramación (dato de resultado de búsqueda; no abrí el texto, sección 9).

**Variables que mueve.**
- Mora de grupos: sube de forma correlacionada en crisis (estimación del salto: 2 a 3 veces la mora individual; no hay dato en las fuentes).
- Costo operativo por cliente: más bajo en grupos que en individual (estimación; [S1] dice solo que el grupo reduce costos de transacción).
- Tamaño de crédito: crece al pasar a individual, y cambia el cliente.
- Presión social: baja si el grupo se rompe.

**Decisiones del alumno.**
1. *Mantener el modelo grupal.* Ventaja: menor costo por cliente y buena información. Costo: contagio en crisis y menor flexibilidad para el cliente que crece.
2. *Pasar los mejores clientes a crédito individual.* Ventaja: más monto y fidelidad. Costo: más análisis, más costo por crédito y deja a los grupos con clientes más débiles.
3. *Modelo mixto con garantía parcial de grupo y análisis individual.* Ventaja: balance. Costo: complejo de operar y puede ser peor en ambos.
4. *Exigir ahorro previo obligatorio al grupo.* Ventaja: crea colchón. Costo: reduce el atractivo del producto y el ahorro hay que custodiarlo y reglamentarlo (estimación).

**Qué aprende.** Que no hay metodología "mejor": el grupo abarata en buenos tiempos y se contagia en malos; el individual cuesta más pero aísla el riesgo.

---

### Situación 10. Acusaciones de sobreendeudamiento y cobranza agresiva

**Qué pasa.** Se difunden casos de clientes con deudas que no pueden pagar y de cobradores que presionan. El ejemplo extremo es Andhra Pradesh (India, 2010): según el resumen del informe de la comisión Malegam, hubo suicidios de prestatarios y denuncias de prácticas coercitivas; la comisión vinculó la cobranza agresiva con multiendeudamiento, crecimiento sin control y agentes de recuperación, y propuso topes y reglas [S15]. Es un caso de otro país; no encontré un caso equivalente documentado en Bolivia reciente.

**Variables que mueve.**
- Reputación: baja fuerte (estimación).
- Riesgo regulatorio: sube; en la India se propuso un tope de margen de 10% a 12% y límites de ingreso y de monto por cliente [S15].
- Cartera nueva: baja por desconfianza.
- Costo legal y de cumplimiento: sube.

**Decisiones del alumno.**
1. *Mantener la cobranza actual porque funciona.* Ventaja: mora controlada. Costo: riesgo de un caso mediático que arrastre a toda la entidad.
2. *Adoptar un código de conducta, capacitar al personal y abrir un canal de reclamos.* Ventaja: protege a los clientes y la marca. Costo: reduce la productividad de cobranza.
3. *Limitar el endeudamiento total por cliente (por ejemplo, no más de cierta proporción del ingreso del hogar).* Ventaja: menos sobreendeudamiento. Costo: pierdes clientes y volumen.
4. *Transparentar el costo total del crédito (tasa efectiva con todos los cargos).* Ventaja: confianza y menos reclamos. En Bolivia se exige divulgar el costo del crédito [S7]. Costo: algunos clientes comparan y se van, y el margen se aprieta.

**Qué aprende.** Que el daño por sobreendeudamiento termina siendo un riesgo del propio negocio (reputación, regulación, mora), no solo un tema ético.

---

### Situación 11. Fintech y pagos QR: nuevos competidores y nuevo canal

**Qué pasa.** Los pagos con QR crecieron fuerte en Bolivia: en 2020, 85% de los pagos eran en efectivo y 15% con QR; en 2025 el efectivo bajó a 64% y el QR subió a 36%; hay 3,7 millones de personas y 1,5 millones de comercios en el sistema QR (cifras del Banco Central y de Asoban citadas por Los Tiempos) [S14]. Esto abre dos caminos: usar los datos de pagos para evaluar clientes (crédito digital) y competir contra billeteras y fintech. Una búsqueda indicó que el Decreto 5384 (mayo de 2025) y la Resolución ASFI/540/2025 regulan las empresas de tecnología financiera, pero no abrí esas normas (sección 9).

**Variables que mueve.**
- Costo por crédito: baja en créditos digitales de monto pequeño (estimación: -30% a -60% del costo de originación).
- Mora en crédito digital sin visita: sube respecto al crédito con visita; en [S1] se advierte que menos contacto personal debilita la relación, y en [S3] que la tecnología reduce el trato cara a cara (los autores lo plantean como riesgo, no con cifra).
- Clientes jóvenes y nuevos: suben (estimación).
- Competencia: sube, porque entran fintech.

**Decisiones del alumno.**
1. *Lanzar crédito digital totalmente remoto.* Ventaja: bajo costo y rapidez. Costo: mayor mora y fraude, y se parece al "modelo de fábrica" que fracasó en Bolivia [S1][S4] (cuidado: es una analogía mía).
2. *Digitalizar solo pagos y desembolsos, y mantener la visita del asesor.* Ventaja: reduce costos de caja y mora por olvido, sin perder la relación. Costo: ahorro menor.
3. *Aliarte con una fintech o billetera.* Ventaja: llegas a más clientes sin construir tecnología. Costo: compartes margen y datos, y dependes del socio.
4. *Ignorar la tendencia.* Ventaja: no gastas ahora. Costo: pierdes clientes jóvenes y comercios que ya cobran por QR.

**Qué aprende.** Que la tecnología baja costos pero no elimina el riesgo de crédito: si se usa para quitar el análisis humano puede repetir los errores del pasado.

---

### Situación 12. Diversificar hacia crédito de consumo o a asalariados

**Qué pasa.** Para crecer, la entidad empieza a prestar a asalariados (consumo, vivienda) con la tecnología del microcrédito. Según CGAP, en Bosnia los créditos de vivienda y consumo a empleados llegaron a representar entre 20% y 40% de las carteras [S1]. El mismo texto cita a Rhyne: mora esperada de 3% a 5% en microempresa contra 15% a 20% en un contexto boliviano de consumo [S1] (la comparación es de contextos distintos). Esto aumenta la correlación con la economía general y exige procesos que las entidades no tenían [S1].

**Variables que mueve.**
- Cartera bruta: sube rápido.
- Mora esperada: sube (3-5% vs 15-20% según [S1], con la cautela de que viene de un contexto).
- Correlación con el ciclo económico: sube [S1].
- Margen: puede subir por mayor tasa (estimación).

**Decisiones del alumno.**
1. *Entrar fuerte a consumo.* Ventaja: crecimiento rápido, tasa más alta. Costo: riesgo de la experiencia boliviana de fines de los 90 [S1][S4].
2. *Entrar con tope (por ejemplo, no más de 15% de la cartera).* Ventaja: diversificas con límite. Costo: menor crecimiento, y requiere políticas separadas (estimación del tope).
3. *Dar consumo solo a clientes actuales con historial.* Ventaja: menor riesgo por conocer su comportamiento. Costo: mercado limitado.
4. *No entrar y profundizar en el microcrédito.* Ventaja: foco y experiencia. Costo: mercado saturado y menor crecimiento.

**Qué aprende.** Que cambiar de segmento cambia el riesgo: la historia boliviana muestra que quien entró con la receta equivocada salió del mercado.

---

### Situación 13. Caen las remesas que sostienen a los hogares clientes

**Qué pasa.** Muchos hogares pagan su deuda con dinero enviado por familiares en el exterior. Según los autores de [S1], las remesas son una vía de transmisión del riesgo: bajan en las crisis internacionales y los hogares que dependen de ellas tienen dificultades para pagar. No encontré en las fuentes abiertas un dato específico de remesas para Bolivia (sección 9).

**Variables que mueve.**
- Ingreso de hogares con remesas: baja (estimación: -15% a -30% en esos hogares).
- Mora en esa subcartera: sube con rezago de 3 a 6 meses (estimación).
- Demanda de crédito: baja.

**Decisiones del alumno.**
1. *Identificar qué parte de la cartera depende de remesas y subir previsiones en ese grupo.* Ventaja: te prepara. Costo: gasto contable ahora y la medición exige datos que quizá no tienes.
2. *Reducir el monto máximo a hogares dependientes de remesas.* Ventaja: menor exposición. Costo: pierdes un segmento rentable.
3. *Ofrecer cuotas que se adapten a los envíos (pagos irregulares).* Ventaja: se ajusta a su flujo. Costo: complejidad operativa, más seguimiento.
4. *No hacer nada y esperar.* Ventaja: no gastas. Costo: sorpresa en la mora.

**Qué aprende.** Que el riesgo de la cartera viene de la fuente de ingreso de los clientes, incluso si el negocio parece local.

---

### Situación 14. Oportunidad: fondeo barato de largo plazo, con condiciones

**Qué pasa.** Un fondo de inversión, un organismo multilateral o un banco de desarrollo te ofrece una línea de fondeo con tasa menor a tu costo actual, a cambio de metas (por ejemplo, clientes rurales, mujeres, o crédito productivo) y de reportar indicadores. Las fuentes muestran que en Nicaragua y Bosnia la financiación internacional tenía un peso importante y que el ahorro propio de los clientes era menor a 10% de la cartera frente al promedio mundial de más de 40% [S3]. Es una oportunidad de la que no tengo cifras de Bolivia.

**Variables que mueve.**
- Costo de fondeo: baja (estimación: -1 a -3 puntos).
- Capacidad de crecimiento: sube.
- Obligaciones y covenants (condiciones del contrato): suben.
- Dependencia de un financista externo: sube. Si el financista se retira, hay riesgo de liquidez (ver situación 5).

**Decisiones del alumno.**
1. *Aceptar la línea completa y crecer.* Ventaja: margen y volumen. Costo: dependencia y presión de crecer rápido, ver situación 8.
2. *Aceptar una parte y mantener captación propia.* Ventaja: diversificas fondeo. Costo: menor beneficio inmediato.
3. *Rechazarla y financiarte con depósitos de los socios.* Ventaja: autonomía. Costo: exige licencia/captación y ahorristas, que cuesta más y se puede fugar (ver situación 5).
4. *Negociar la línea con plazos largos y sin penalidades de salida.* Ventaja: reduces el riesgo. Costo: el financista puede pedir tasa mayor o no aceptar.

**Qué aprende.** Que el costo de fondeo no es todo: importa su estabilidad, sus condiciones y quién puede retirarlo.

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

Todas son propuestas mías [Interpretación]. Las fórmulas de indicadores salen de [S2].

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| Cartera bruta | Saldo de créditos vigentes | Cartera anterior + desembolsos - capital cobrado - castigos |
| Clientes activos | Prestatarios con saldo | Anteriores + nuevos - cancelados - castigados |
| Desembolsos | Créditos nuevos | Función de demanda, número de asesores y liquidez disponible; baja si falta caja |
| Tasa activa efectiva | Tasa cobrada (con comisiones) | Parte de la decisión del alumno, limitada por los topes de tramo regulado [S5][S6] |
| Ingreso financiero cobrado | Intereses y comisiones en efectivo | Cartera al día x tasa / 12 + comisiones; la mora no genera ingreso en efectivo |
| Costo de fondeo | Tasa promedio de depósitos y deudas | Pasivos x tasa; sube con eventos de confianza o escasez de liquidez |
| Depósitos y deudas | Fuente de fondos | Variación por captación, retiros y vencimientos; sensible a la reputación |
| Liquidez (caja e inversiones líquidas) | Dinero inmediato | Entradas por cobranzas y captación menos desembolsos y retiros; restricción dura: no puede ser negativa |
| Mora (PAR30) y cartera vencida | Créditos con atraso | Por cohortes: parte de cada cohorte pasa a mora con una probabilidad que depende del ciclo, la competencia y la presión de cobranza |
| Cartera reprogramada | Créditos con plazos modificados | Aumenta con eventos de alivio; se registra aparte y con mayor probabilidad de mora futura |
| Previsiones (reserva) | Colchón para pérdidas | Meta por categoría de riesgo; el gasto de previsión reduce la utilidad cada mes |
| Castigos | Pérdidas reconocidas | Parte de la cartera vencida pasa a castigo después de cierto tiempo (estimación del plazo) |
| Gasto operativo | Personal, sucursales, tecnología | Fijo por sucursal + variable por asesor; sube con crecimiento y capacitación |
| Asesores y productividad | Número de asesores y clientes por asesor | Contrataciones menos rotación; productividad baja si se contratan muy rápido (ver situación 8) |
| Multiendeudamiento del mercado | Proporción de clientes con varios créditos | Sube con competencia y baja con uso del buró de crédito |
| Capital y CAP | Patrimonio y capital regulatorio / activos ponderados | Capital anterior + utilidades - pérdidas + aportes; el crecimiento de cartera se frena si el CAP baja del mínimo de 10% [S8] |
| Cumplimiento de cartera dirigida | % en productivo y en vivienda social | Cartera dirigida / cartera total; se compara con los mínimos de [S5] |
| Reputación / confianza | Imagen ante clientes y ahorristas | Baja con cobranza dura, conflictos o noticias; afecta depósitos y cultura de pago |
| Cultura de pago | Disposición del cliente a pagar | Baja por movimientos de no pago o expectativas de condonación [S4]; se recupera lento |

**Reglas de quiebre que el motor debería aplicar** [Interpretación]: liquidez negativa = intervención o cierre; CAP < 10% = restricción de crecimiento y plan de capitalización; mora y previsiones que consuman el patrimonio = cierre.

---

## 7. Ejemplos reales de Bolivia o Latinoamérica

Solo incluyo los que abrí.

1. **Crisis del microcrédito en Bolivia, 1999-2001 (Bolivia).** Rhyne, ACCION International: los prestamistas de consumo que entraron en los años 90 se superpusieron con las microfinancieras, hubo clientes con dos o más créditos, y con la recesión de 1999 la mora subió; asociaciones de deudores protestaron y tomaron la Superintendencia de Bancos en julio de 2001 [S4]. Constantinou y Ashta: el PAR30 de las cuatro mayores entidades subió de menos de 5% a casi 9%, y los clientes bajaron de más de 180.000 a poco más de 145.000 [S1]. Enlaces: https://findevgateway.org/sites/default/files/publications/files/mfg-en-paper-crisis-in-bolivian-microfinance-2001.pdf y https://www.findevgateway.org/sites/default/files/publications/files/mfg-en-paper-financial-crisis-lessons-from-microfinance-aug-2010.pdf
2. **Banco Fassil, 2023 (Bolivia).** Banco con falta de liquidez que pidió apoyo al Banco Central, no lo obtuvo según sus fuentes, y fue intervenido por ASFI [S13]. Enlace: https://www.lostiempos.com/actualidad/economia/20230503/revelan-que-fassil-pidio-auxilio-us-733-millones-al-bcb-antes-su. No es una microfinanciera; sirve para la situación 5.
3. **Reprogramaciones masivas, 2024-2026 (Bolivia).** ASFI y la banca: 78 mil créditos reprogramados y más de 122 mil refinanciados en un año a junio de 2025 [S11]; 62% de la mora bancaria a mayo de 2025 ligada a créditos reprogramados [S10]; Decreto 5630 de aplicación inmediata en junio de 2026 [S12]. Enlaces: https://www.lostiempos.com/actualidad/economia/20250628/asfi-dice-que-banca-atendio-80-pedidos-reprogramacion-100 , https://correodelsur.com/economia/20250616/la-mora-bancaria-llega-a-los-us-950-millones.html , https://eju.tv/2026/06/asfi-aclara-que-bancos-deben-aplicar-decreto-de-reprogramacion-de-creditos-de-forma-inmediata/
4. **Crisis de pago en Nicaragua, Marruecos, Bosnia y Pakistán, 2008-2009 (Nicaragua es Latinoamérica).** CGAP: el movimiento "No Pago" en Nicaragua, mora sobre 10% en tres de los cuatro países, causas internas (concentración y multiendeudamiento, sistemas sobrepasados, disciplina de crédito debilitada) [S3]. Enlace: http://www.cgap.org/sites/default/files/CGAP-Focus-Note-Growth-and-Vulnerabilities-in-Microfinance-Feb-2010.pdf
5. **Andhra Pradesh, India, 2010 (otro continente).** Informe Malegam y sus recomendaciones de topes [S15]. Enlace: https://bcajonline.org/journal/y-h-malegam-report-on-mfi-sector-a-summary/ (resumen secundario, no el informe original).
6. **Pagos QR en Bolivia (Bolivia).** Efectivo de 85% a 64% de los pagos y QR de 15% a 36% entre 2020 y 2025 [S14]. Enlace: https://www.lostiempos.com/actualidad/economia/20260614/banco-central-bolivia-resalta-uso-del-qr-28-veces-segundo-pais

---

## 8. Fuentes numeradas con nivel

Nivel A: libro, paper, organismo, norma o manual. B: consultora, reporte sectorial, prensa. C: blog o práctica. "Leída con texto" significa que obtuve el contenido (lo extraje con una herramienta de PDF o de lectura web).

| N.º | Fuente | Nivel | Estado | Enlace |
|---|---|---|---|---|
| S1 | Dinos Constantinou y Arvind Ashta, "Financial Crisis: Lessons from Microfinance", paper (SSRN 1724526; metadatos del PDF indican creación en 2010) | A | Leída con texto (completa) | https://www.findevgateway.org/sites/default/files/publications/files/mfg-en-paper-financial-crisis-lessons-from-microfinance-aug-2010.pdf |
| S2 | CGAP, Microfinance Consensus Guidelines, "Definitions of Selected Financial Terms, Ratios, and Adjustments for Microfinance", 3.ª edición, septiembre de 2003 | A | Leída con texto (secciones de ratios) | https://cgap.org/sites/default/files/researches/documents/CGAP-Consensus-Guidelines-Definitions-of-Selected-Financial-Terms-Ratios-and-Adjustments-for-Microfinance-Sep-2003.pdf |
| S3 | G. Chen, S. Rasmussen y X. Reille, "Growth and Vulnerabilities in Microfinance", CGAP Focus Note 61, febrero de 2010 | A | Leída con texto (secciones de crisis y causas) | http://www.cgap.org/sites/default/files/CGAP-Focus-Note-Growth-and-Vulnerabilities-in-Microfinance-Feb-2010.pdf |
| S4 | Elisabeth Rhyne (ACCION International), "Crisis in Bolivian Microfinance", ensayo para Monday Developments, 2001, basado en su libro Mainstreaming Microfinance (Kumarian Press, 2001; el dato de editorial viene del propio texto) | A | Leída con texto (completa); el libro no lo leí | https://findevgateway.org/sites/default/files/publications/files/mfg-en-paper-crisis-in-bolivian-microfinance-2001.pdf |
| S5 | Decreto Supremo 1842 (Bolivia, diciembre de 2013), régimen de tasas de interés de vivienda de interés social y niveles mínimos de cartera (copia del BCB) | A | Leída con texto (artículos 3 y 4) | https://www.bcb.gob.bo/webdocs/normativa/2013%20-%20DS%201842%20-%20R%C3%A9gimen%20Tasa%20Inter%C3%A9s%20Vivienda%20Social.pdf |
| S6 | Decreto Supremo 2055 (Bolivia, julio de 2014), tasas mínimas y máximas (texto en Lexivox) | A | Leída con texto (artículos 3, 4 y 5 resumidos por la herramienta; la tabla de plazo fijo no apareció) | https://www.lexivox.org/norms/BO-DS-N2055.html |
| S7 | CGAP, Donor Brief No. 18, "The Impact of Interest Rate Ceilings on Microfinance", mayo de 2004 | A | Leída con texto (completa) | https://cgap.org/sites/default/files/researches/documents/CGAP-Donor-Brief-The-Impact-of-Interest-Rate-Ceilings-on-Microfinance-May-2004.pdf |
| S8 | ASFI, presentación de Audiencia de Rendición Pública de Cuentas Inicial Gestión 2026 (datos a abril de 2026) | A (organismo regulador) | Leída con texto (diapositivas de cartera, mora, liquidez, CAP) | https://asfi.gob.bo/sites/default/files/2026-06/Presentaci%C3%B3n%20Audiencia%20de%20Rendici%C3%B3n%20P%C3%BAblica%20de%20Cuentas%20Inicial%20Gesti%C3%B3n%202026.pdf |
| S9 | Los Tiempos, "Créditos y depósitos del sistema financiero crecen en 5,2% y 3,1% a abril", 21/05/2025 | B | Leída (vía lectura web) | https://www.lostiempos.com/actualidad/economia/20250521/creditos-depositos-del-sistema-financiero-crecen-52-31-abril |
| S10 | Correo del Sur, "La mora bancaria llega a los $us 950 millones", 16/06/2025 | B | Leída (vía lectura web) | https://correodelsur.com/economia/20250616/la-mora-bancaria-llega-a-los-us-950-millones.html |
| S11 | Los Tiempos, "ASFI dice que la banca atendió el 80 % de pedidos de reprogramación...", 28/06/2025 | B | Leída (vía lectura web) | https://www.lostiempos.com/actualidad/economia/20250628/asfi-dice-que-banca-atendio-80-pedidos-reprogramacion-100 |
| S12 | eju.tv, "ASFI aclara que bancos deben aplicar decreto de reprogramación de créditos de forma inmediata", 17/06/2026 | B | Leída (vía lectura web) | https://eju.tv/2026/06/asfi-aclara-que-bancos-deben-aplicar-decreto-de-reprogramacion-de-creditos-de-forma-inmediata/ |
| S13 | Los Tiempos, "Revelan que Fassil pidió auxilio de $us 73,3 millones al BCB antes de su intervención", 03/05/2023 | B | Leída (vía lectura web) | https://www.lostiempos.com/actualidad/economia/20230503/revelan-que-fassil-pidio-auxilio-us-733-millones-al-bcb-antes-su |
| S14 | Los Tiempos, "El Banco Central de Bolivia resalta uso del QR 28 veces por segundo en el país", 14/06/2026 | B | Leída (vía lectura web) | https://www.lostiempos.com/actualidad/economia/20260614/banco-central-bolivia-resalta-uso-del-qr-28-veces-segundo-pais |
| S15 | BCAJ (Bombay Chartered Accountants' Journal), "Y. H. Malegam Report on MFI Sector - A Summary" | C | Leída (vía lectura web); es resumen secundario | https://bcajonline.org/journal/y-h-malegam-report-on-mfi-sector-a-summary/ |

**Balance de fuentes de nivel A leídas con texto: ocho (S1 a S8).** Fuentes totales distintas: quince. Alcancé el mínimo pedido (8 fuentes y 4 de nivel A).

Dos advertencias sobre el nivel A:
- S6 la leí a través de una herramienta que resume el texto de Lexivox, no en el Boletín Oficial; confirmé los números de las tasas, pero no revisé la tabla de plazo fijo.
- Constantinou y Ashta son dos académicos y consultores, y el paper figura en SSRN; no lo busqué en una revista arbitrada.

Fuentes que vi solo en resultados de búsqueda (no abrí el texto, no las uso como base de datos): CGAP Occasional Paper No. 19 "Too much microcredit?" (Schicks y Rosenberg, 2011), CGAP Occasional Paper No. 9 (Helms y Reille, 2004), DS 4408, DS 5241, DS 5384, Resolución ASFI/1037/2024, Resolución ASFI/540/2025, memorias de FOGAVISP.

---

## 9. No confirmado

1. **Tope de tasa vigente hoy.** Los decretos 1842 (2013) y 2055 (2014) tienen los topes que cito. Una búsqueda mostró que el DS 4164 (2020) modificó al 1842 y que el DS 4408 (2020) cambió los niveles mínimos de cartera. No abrí ninguno; no sé si los topes y niveles de este documento siguen vigentes.
2. **Niveles mínimos de cartera actuales.** Un resultado de búsqueda dio dos cifras contradictorias para bancos PYME (50% y 40%) después del DS 4408. No lo resolví.
3. **Tasas máximas para microcrédito no productivo.** Los decretos que leí no fijan tope para microcrédito en sí; solo para crédito productivo (tramo micro) y vivienda social. No sé qué tope hay para microcrédito de comercio o servicios.
4. **Tasas activas reales de microfinanzas en 2026.** Abrí la tabla del BCB del 1 de octubre de 2026, pero la extracción de texto perdió el orden de columnas y no pude asignar con seguridad cada cifra a su entidad y producto. Solo observé que las tasas de microcrédito en moneda nacional van de alrededor de 14% a 40% según la entidad, con valores más altos en cooperativas; es lectura no confirmada.
5. **Mora de microfinancieras por separado.** ASFI da mora del sistema (2,9% a abril de 2026). No encontré la mora desagregada por tipo de entidad (IFD, bancos PYME, cooperativas).
6. **Tabla de previsiones de ASFI.** No encontré los porcentajes de previsión por categoría de riesgo ni los días de atraso para cada categoría. Está en el Reglamento para la Evaluación y Calificación de Cartera de Créditos (RNSF, Libro 3); no lo abrí.
7. **Encaje legal.** No encontré el porcentaje vigente ni su cálculo. Mencioné el concepto por el caso Fassil [S13].
8. **Decreto 5241 y Decreto 5630.** Sé de ellos por prensa y por resultados de búsqueda. No leí los decretos; no sé los plazos de gracia, ni las categorías de prestatarios elegibles, ni las reglas contables de las previsiones.
9. **Reglamento de banca comunal y su modificación de octubre de 2024.** Lo sé solo por resultado de búsqueda.
10. **Cooperativas de ahorro y crédito.** No abrí ninguna fuente sobre su regulación en Bolivia (capital, topes, supervisión), ni casos de crisis.
11. **Fintech y regulación de tecnología financiera (DS 5384, Res. ASFI/540/2025).** Sin leer. No tengo datos de comisiones de billeteras ni de mora de crédito digital.
12. **Fondeo en Bolivia.** No abrí datos de costo de fondeo ni de las líneas de segundo piso del Banco de Desarrollo Productivo; los efectos que doy en las situaciones 4 y 14 son estimaciones.
13. **Remesas y Bolivia.** El canal viene de un paper sobre otras crisis [S1]; no tengo datos locales.
14. **Lectura de la gráfica de liquidez de ASFI.** Del texto de la diapositiva leí un ratio de 67,4% para abril de 2026 y un límite de 50%, pero las etiquetas del gráfico quedaron mezcladas en la extracción. Tomo estos números como no confirmados.
15. **Libros.** No abrí ninguna página de catálogo de libros de texto sobre microfinanzas (por ejemplo, Armendáriz y Morduch). No cito ningún libro como fuente leída.
16. **Efecto de los topes de tasa en Bolivia.** El caso de Nicaragua en [S7] es una declaración de un gremio, no un estudio; no sé si en Bolivia hubo efectos medidos.
17. **Fórmulas de memoria.** CAP (capital regulatorio / activos ponderados por riesgo) y "cohorte" como práctica estándar son reconstrucciones mías. La tasa de equilibrio también.

---

## 10. Cifras que necesitan validación local

| Cifra o regla | De dónde sale | Quién podría aportarla |
|---|---|---|
| Rango de caída de ingreso de clientes en shocks (-10% a -30%, 3 a 9 meses) | Estimación | Docente de microfinanzas, ASOFIN, investigadores de la UCB, UMSA o UPB |
| Rezago de la mora (6 a 18 meses) y salto de mora por shock | Estimación; referencia de 4 puntos de PAR30 en Bolivia 1999-2001 [S1] | ASFI (series de mora por tipo de entidad), ASOFIN |
| Mora de microfinancieras y cooperativas por separado | No encontrada | ASFI (boletines estadísticos), ASOFIN, FINRURAL |
| Tasas activas efectivas por tipo de entidad | Tabla del BCB sin poder alinear columnas | BCB (hoja Excel original de tasas), ASFI |
| Tope de tasa vigente en cada tramo y cambios posteriores a 2014 | Decretos 1842 y 2055 leídos; modificaciones no abiertas | ASFI (normativa consolidada), Gaceta Oficial, un abogado financiero |
| Niveles mínimos de cartera vigentes | DS 1842; DS 4408 no abierto | ASFI |
| Tabla de previsiones por categoría | No encontrada | ASFI (RNSF Libro 3), docente de contabilidad bancaria |
| Encaje legal y requisitos de liquidez | No encontrado | BCB, ASFI |
| Tamaño de la fuga de depósitos en una corrida (-10% a -30% en 1 a 3 meses) | Estimación; Fassil [S13] como ejemplo parcial | BCB, ASFI, ASOBAN |
| Costo de fondeo (rango y variación de +1 a +3 puntos) | Estimación | ASOFIN, Banco de Desarrollo Productivo, un gerente de IFD |
| Costo operativo por prestatario, productividad por asesor, tamaño de crédito en Bolivia | No encontrados | ASOFIN, FINRURAL, informes de calificadoras de riesgo |
| Pérdida por contagio en grupos (2 a 3 veces) | Estimación | Docente o ejecutivo con experiencia en banca comunal |
| Reducción de costo de originación por crédito digital (-30% a -60%) y mora asociada | Estimación | ASFI, fintech locales, docente de tecnología financiera |
| Efecto de caída de remesas (-15% a -30%) | Estimación | Banco Central, INE, ASOFIN |
| Porcentaje de cartera reprogramada para el simulador (5% a 20%) | Estimación; 15% en bancos [S10] | ASFI (cifras de microfinanzas), ASOBAN, ASOFIN |
| Plazo de castigo de cartera vencida | Estimación | ASFI, un contador de una IFD |
| Tope razonable de cartera de consumo (15%) | Estimación | Docente, oficial de riesgos |
| Cifras que usan el simulador con "estimación" en las situaciones 1 a 14 | Mías | Revisar todas con un docente de microfinanzas o evaluación de proyectos antes de programarlas |
