# Hotelería y turismo (alojamiento, tours, ecoturismo, restaurantes turísticos): ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que yo la abrí. En la sección 8 aclaro cuánto leí de cada una (texto completo, parcial o solo resumen).
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es cita.
- Una magnitud marcada **(estimación)** la puse yo para dar un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro país, otro sector, otra fecha), así que tampoco es un parámetro "verdadero" para tu proyecto.
- Lo que no pude verificar está en la sección 9. Las cifras que necesitan validar actores locales están en la sección 10.
- Cuando una fórmula la reconstruyo de memoria o la deduzco yo, lo digo.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto de hotelería y turismo vende una experiencia o un lugar para dormir, comer o recorrer, sobre una capacidad que no se puede estirar de un día para otro: habitaciones, camas, mesas, cupos de un tour, asientos de un bote. En el mapa general de SIMPRO es el tipo A7 (`00-taxonomia-tipos.md`). Aquí lo uso en sentido amplio: hostales y hoteles, agencias y operadores de tours, alojamientos de ecoturismo y turismo comunitario, y restaurantes que viven de turistas.

**Cómo aporta valor.** Hay cuatro ideas centrales, todas respaldadas por las fuentes abiertas:

1. **El producto es perecedero.** Una habitación que no se vendió esta noche no se puede vender mañana. Los hoteles y las aerolíneas comparten el problema de capacidad limitada, producto perecedero y clientes que valoran distinto lo mismo; por eso cobran precios distintos a clientes distintos y en fechas distintas [S1]. El "valor" se crea llenando la capacidad al mejor precio posible, no solo vendiendo más.
2. **Hay un equilibrio entre precio y ocupación.** Subir el precio tiende a bajar la ocupación y bajar el precio tiende a subirla; administrar los ingresos de un hotel es ese equilibrio [S1]. El ejemplo del capítulo muestra un hotel que subió su tarifa promedio 4,4% y perdió 9,5% de ocupación, con lo cual su ingreso por habitación disponible bajó 5,5% [S1].
3. **La reputación se convierte en poder de precio.** Con datos de miles de observaciones mensuales de hoteles de 11 ciudades, un aumento de 1% en el puntaje de reputación en línea se asoció con hasta 0,89% más de tarifa promedio y hasta 0,54% más de ocupación [S2]. Entre más barato el hotel, más pesa la reputación [S2].
4. **En Bolivia, el turismo también es un negocio de comunidades y de acceso.** Los casos de ecoturismo comunitario (Chalalán, Tomarapi) muestran que el éxito depende de alianzas con operadores, del precio objetivo (turista de más gasto en vez de mochilero) y de reglas claras de reservas y pagos [S4]. Y los cortes de ruta y los conflictos locales pueden dejar a un destino sin visitantes durante meses [S11, S12, S13, S17].

**Por qué es distinto para un simulador.** En un negocio de venta por unidades, si vendes menos, gastas menos en insumos. En un hotel, el costo de la planta (personal base, servicios, impuestos, cuota del banco) se paga igual con 5% que con 80% de ocupación. Eso produce tres rasgos que el motor genérico no captura bien:

- El resultado depende de **12 ocupaciones distintas** (una por mes), no de una ocupación promedio anual. El estudio de hoteles noruegos [S6] encontró que la estacionalidad pega más al margen de ganancia que a la rotación de activos (solo leí el resumen).
- Un **shock externo** (bloqueo, alerta de viaje, pandemia) deja la ocupación casi en cero mientras los costos fijos siguen: en 2026 la Cámara Hotelera de Chuquisaca describió una ocupación "prácticamente en cero" [S13].
- Los efectos tienen **rezago**: las reservas internacionales se pierden meses hacia adelante [S13] y la ministra de Turismo estimó que el daño podría durar entre seis meses y un año [S11].

---

## 2. Indicadores propios y cómo se calculan

Convención: período = mes. Los nombres en inglés se mantienen porque son los que el alumno va a encontrar en cualquier reporte de hotel.

### 2.1 Indicadores de ocupación, tarifa e ingreso por habitación

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Ocupación** | Qué parte de las habitaciones disponibles se vendió | Habitaciones vendidas / habitaciones disponibles (se expresa en %) | [S1] |
| **ADR** (tarifa diaria promedio) | Precio promedio al que se vendieron las habitaciones | Ingreso por habitaciones / habitaciones vendidas | [S1], [S8] |
| **RevPAR** (ingreso por habitación disponible) | Cuánto ingreso genera cada habitación disponible, vendida o no | ADR x ocupación (equivale a ingreso de habitaciones / habitaciones disponibles) | [S1], [S8] |
| **RevPOR** | Ingreso total por habitación vendida (incluye comida, spa, etc.) | Ingreso total / habitaciones vendidas | [S8] |
| **TRevPAR** | Ingreso total por habitación disponible | Ingreso total / noches-habitación disponibles | [S8] |
| **Estadía promedio (ALOS)** | Noches por reserva | Noches reservadas / número de reservas | [S8] |
| **GOP y GOPPAR** | Ganancia operativa bruta y esa ganancia por habitación disponible | GOP = ingresos - costos de operación; GOPPAR = GOP / habitaciones disponibles | [S8] (la fuente da GOP como "ganancia bruta - costos operativos"; el cálculo exacto de ganancia bruta depende de la contabilidad que se use) |
| **Índice de generación de ingreso (RGI)** | Cómo te va frente a tus competidores directos | RevPAR propio / RevPAR promedio del conjunto competitivo. Más de 100 = mejor que el promedio | [S1] (con ejemplo del reporte STAR), [S8] |
| **Índice de ocupación (MPI) e índice de tarifa (ARI)** | Lo mismo, pero solo para ocupación o solo para tarifa | Ocupación propia / ocupación del conjunto competitivo (x100); ADR propio / ADR del conjunto (x100) | [S1] los muestra en la tabla del reporte STAR; la definición explícita del MPI en [S8] es distinta (ocupadas/disponibles x100), así que conviene definirlo con cuidado |

Dos advertencias:

- **RevPAR no mide ganancia.** Solo cuenta ingreso de habitaciones y no mira costos (interpretación mía; se desprende de las fórmulas de [S1] y [S8]). Un hotel con RevPAR alto puede perder plata si sus costos fijos son más altos. Por eso existen GOPPAR y TRevPAR.
- **La fórmula de conversión de [S8] viene invertida** (dividen visitantes entre reservas). La conversión se calcula como reservas / visitas; no usar esa fórmula tal cual.

Otras definiciones de ocupación (por camas, por habitaciones) cambian según el país; Eurostat y los institutos de estadística las manejan distinto, y no abrí una página con la definición oficial (ver sección 9).

### 2.2 Indicadores de canal y costo de venta

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Participación de canal** | Reservas del canal / reservas totales. En Europa, en 2026, los canales directos son 51,3% y las agencias en línea (OTA) cerca de 30% | [S9] |
| **Comisión efectiva** | Comisión pagada / ingreso de las reservas que vinieron por ese canal. Ejemplo boliviano: un operador cobra 10% a sus propios clientes por manejar mercadeo y reservas de una posada comunitaria | [S4] |
| **ADR neto** | ADR x (1 - comisión del canal) - costo de limpieza y desayuno por habitación vendida | Fórmula mía (deducción, no cita) |

### 2.3 Indicadores propios de estacionalidad

La estacionalidad se divide en causas **naturales** (clima) e **institucionales** (feriados, vacaciones). Esta distinción la atribuyen a la literatura de Butler y otros fuentes secundarias que vi; el capítulo de Butler (2001) lo conozco solo por su resumen [S7].

- **Índice estacional del mes** = ocupación del mes / ocupación promedio anual (fórmula mía, simple).
- **Meses de cobertura de caja** = caja disponible / costos fijos mensuales (fórmula mía; responde "¿cuánto aguanto con ocupación casi cero?").

### 2.4 Punto de equilibrio de ocupación

Deducción mía (no la copié de ninguna fuente):

> Ocupación de equilibrio = costos fijos mensuales / [(ADR neto - costo variable por habitación vendida) x habitaciones disponibles al mes]

Es la ocupación mínima para no perder plata. Es el indicador más útil para entender el riesgo de un hotel: si la ocupación de equilibrio es 45% y el mes cae a 20%, el hotel pierde plata ese mes aunque "venda".

### 2.5 Indicadores de reputación

| Indicador | Qué dice | Fuente |
|---|---|---|
| **Elasticidad de la reputación** | Con un puntaje de reputación en línea 1% mejor, el RevPAR sube 0,96% en promedio (todas las categorías); 1,42% en hoteles de gama media y 0,49% en hoteles de lujo | [S2], Exhibit 5 |
| **Poder de precio por punto de reseña** | En datos de transacciones de Travelocity, 1 punto más en una escala de 5 permitiría subir el precio 11,2% manteniendo la misma probabilidad de compra | [S2] |

Son datos de EE. UU. y Europa, hoteles de cadenas medianas y de lujo, años 2010 a 2012 [S2]. Para hostales bolivianos son un orden de magnitud, no un parámetro.

### 2.6 Indicadores de cancelación y no presentación (no-show)

- **Tasa de no-show y cancelación tardía** = reservas que no se presentan / reservas aceptadas. En un restaurante de Hong Kong, la probabilidad estimada de no presentarse o cancelar tarde estuvo entre 9,07% y 12,95%, la más baja el jueves y la más alta el sábado [S3].
- **Límite de reservas (overbooking)**: el modelo de [S3] elige cuántas reservas aceptar por encima de la capacidad para maximizar el ingreso esperado, considerando el costo de atender de más y la "multa" de rechazar clientes. No reproduzco su fórmula completa; la idea es que sobrevender es rentable solo hasta el punto en que el costo de dejar sin servicio a alguien supera lo ganado.

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Resumen.** El VAN sigue siendo la base, pero con tres cambios: (1) los ingresos se arman con **ocupación por mes y tarifa por mes**, no con un promedio anual; (2) se hace una **prueba de resistencia** (escenarios de crisis con ocupación cercana a cero durante varios meses); y (3) se mira la **caja mínima** y la **capacidad de pagar la deuda**, no solo el valor final.

**Por qué el VAN con un ingreso anual plano falla aquí:**

1. **La estacionalidad cambia la caja.** Con ingresos promedio, el flujo siempre es positivo; con 12 ocupaciones distintas, puede haber 4 o 5 meses por debajo del equilibrio. La literatura noruega indica que la estacionalidad afecta más al margen de ganancia que a la rotación de activos, y que el precio y el mercadeo pueden compensar parte del efecto [S6] (solo resumen).
2. **El apalancamiento operativo es alto.** Con costos fijos grandes, una caída moderada de la ocupación produce una caída mucho mayor de la ganancia. Esto es razonamiento mío a partir de la estructura de costos; busqué un estudio ecuatoriano que daría un número y no lo pude abrir (sección 9).
3. **Los shocks son grandes y se repiten.** En Bolivia, la llegada de visitantes extranjeros pasó de 1.239.281 (2019) a 323.272 (2020) y a 166.851 (2021) [S10]. En 2026, los bloqueos dejaron hoteles de Santa Cruz con ocupaciones de 20% o menos [S12] y a la hotelería de Sucre "prácticamente en cero" [S13]. Un VAN "esperado" sin escenario de crisis oculta que el proyecto puede quebrar antes de llegar al año 3 aunque su valor promedio sea alto.
4. **La TIR** puede ser engañosa cuando el valor final del inmueble domina el resultado (práctica general de evaluación; ninguna fuente abierta aquí la respalda, ver sección 9).

**Qué agregar al análisis:**

| Complemento | Qué responde | Fuente |
|---|---|---|
| Ocupación de equilibrio (sección 2.4) | ¿A partir de qué ocupación gano plata? | Deducción mía |
| VAN con 12 meses por año y escenarios (base, crisis corta, crisis larga) | ¿Cuánto vale el proyecto si hay un bloqueo de 2 meses o de 6? | Interpretación mía; los escenarios salen de [S11], [S12], [S13] |
| Meses de cobertura de caja | ¿Cuánto aguanto con ocupación casi cero? | Fórmula mía |
| RGI / RevPAR frente a competidores | ¿Estoy mejor o peor que mi mercado? | [S1], [S8] |
| GOPPAR | Ganancia por habitación, no solo ingreso | [S8] |
| Cobertura de la cuota de deuda (ganancia operativa / cuota). Fórmula reconstruida de memoria; no la verifiqué en una fuente abierta | ¿Alcanza lo que genera para pagar al banco? | Memoria; verificar con docente |
| Valor residual del terreno e inmueble | Parte del valor está en el activo, no en la operación | Interpretación mía |

**Lo que no se debe hacer:** comparar la ocupación de un hostal boliviano con benchmarks europeos o de cadenas internacionales sin mirar contexto. Los datos de [S2], [S9] y el reporte STAR de [S1] son de Europa o Reino Unido.

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Nota de método: no encontré un estudio de errores de estudiantes bolivianos en proyectos de hotelería. La lista mezcla lo que dicen las fuentes (marcado) con práctica común o interpretación mía (sin marca).

**Errores de cálculo (estudiantes)**

1. **Suponer una ocupación constante todo el año**, o una muy alta (70% a 90%) sin base. La ocupación depende del mes y de la plaza (Uyuni en lluvias vs sequía, por ejemplo; ver situación 4, cuya fuente no abrí completa).
2. **Ignorar que la planta cuesta aunque no haya huéspedes.** Poner el personal y los servicios como costo "proporcional a la ocupación".
3. **Calcular el ADR sin descontar comisiones** de las agencias en línea (ver situación 5).
4. **Confundir RevPAR con ganancia** o subir el precio sin medir qué pasa con la ocupación: el ejemplo de [S1] muestra que subir la tarifa 4,4% bajó el RevPAR 5,5%.
5. **No incluir otros ingresos o no incluir sus costos** (desayuno, restaurante, tours) y mezclarlos con el ingreso por habitaciones.
6. **Olvidar el mantenimiento y la renovación de la planta.** Los proyectos comunitarios lo sufren: la memoria de un consultor del caso Chalalán señala que faltaba un fondo de mantenimiento (testimonio de blog que no abrí completo; ver sección 9).
7. **Tratar el VAN como una sola cifra** sin probar un escenario de bloqueo prolongado.
8. **No incluir la regulación** (autorización, registro y categorización de prestadores) como costo y plazo de arranque [S5].

**Errores de emprendedores**

1. **Depender de una sola plataforma de reservas o de un solo mercado.** En 2024, 31,8% de los visitantes extranjeros venían de Perú y 20,6% de Argentina (cálculo mío sobre las cifras de [S10]).
2. **Fijar el precio por costo y no por mercado.** El caso Chalalán fijó US$ 115 por cuatro días cuando el mercado de mochileros gastaba unos US$ 9 por persona por día; el operador debía entender que apuntaba a otro público [S4].
3. **Malentendidos de reservas y pagos con los operadores.** El primer operador extranjero de Chalalán dejó de enviar grupos por malentendidos sobre reservas y calendario de pagos [S4].
4. **No tener plan para conflictos.** El 2017 y 2018 en la Isla del Sol: negocios cerrados y cuatro meses sin ingresos turísticos para la comunidad más afectada [S17].
5. **Apalancarse con deuda sin reserva de caja.** En 2020, hoteleros del trópico de Cochabamba hablaron de deudas bancarias que no podían pagar [S19]; en 2020, gremios de La Paz pidieron 180 días de gracia para bancos e impuestos [S18].
6. **Ignorar la reputación en línea** hasta que ya cayó (sección 2.5, [S2]).
7. **Operar sin autorización.** La ley exige autorización previa de las autoridades competentes para operar como prestador [S5]. Un dato de una gaceta departamental (no abierta) menciona que solo una parte de los alojamientos de Santa Cruz tenía licencia de funcionamiento (sección 9).

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **[Sn]** o **(estimación)**); decisiones posibles con ventajas y costos; qué aprende el alumno.

Las magnitudes de las fuentes son de Bolivia 2016-2026 cuando se puede, pero vienen de declaraciones de gremios y ministros, no de estadísticas auditadas. Las marcadas "estimación" son mías y conviene calibrarlas.

---

### Situación 1. Bloqueos nacionales prolongados

**Qué pasa.** Grupos de presión cortan las carreteras durante semanas. En mayo y junio de 2026 hubo bloqueos de más de un mes; la Cámara Hotelera de Santa Cruz estimó pérdidas de más de US$ 230 millones en casi 50 días y ocupación de 20% o menos en algunos hoteles, con reducción de personal y despidos [S12]; la Cámara de Chuquisaca dijo que sus afiliados estaban "prácticamente en cero" y que varias empresas declaraban feriado colectivo [S13]. La ministra de Turismo estimó pérdidas de entre Bs 20 y 25 millones por día [S11]. Son cifras de gremios y de autoridades, no auditadas.

**Variables que mueve.**
- Ocupación: cae mucho durante el bloqueo (de 5% a 20% en los casos citados [S12, S13]; para el simulador, entre -60% y -90% sobre la ocupación del mes, estimación basada en esos casos).
- Reservas nuevas: casi nulas mientras dure.
- Cancelaciones de reservas existentes: suben (la cifra de 65% para La Paz vino de un resumen de búsqueda que no pude abrir; no la uso como dato).
- Costos fijos: no cambian (personal, cuota, servicios).
- Caja: cae cada mes de bloqueo.

**Decisiones del alumno.**
1. *Declarar feriado colectivo y bajar costos de personal.* Ventaja: reduce el gasto mensual. Costo: pérdida de personal capacitado, riesgo de que no vuelvan; el feriado colectivo tiene límites legales que no verifiqué.
2. *Suspender temporalmente el funcionamiento.* Ventaja: baja servicios y trámites. Costo: la reapertura cuesta, y en la pandemia hubo hoteles cerrados de 8 meses a un año [S13]; algunos no reabrieron.
3. *Bajar la tarifa para captar mercado local y empresas de la zona.* Ventaja: algo de caja. Costo: el mercado local es chico durante un bloqueo y puedes bajar el ADR de forma permanente.
4. *Aguantar con caja propia y pedir a los socios un aporte.* Ventaja: mantienes la plantilla y la reputación. Costo: si dura más de lo previsto, se acaba la caja y se pierde el aporte.

**Qué aprende.** Que los costos fijos no se detienen, que la caja es lo que sostiene al hotel en una crisis y que no hay una decisión sin costo.

---

### Situación 2. Alerta de viaje y rezago de reservas internacionales

**Qué pasa.** Después del conflicto, otros países advierten a sus ciudadanos sobre Bolivia. La ministra citó que los países "comienzan a advertir" y estimó que el daño puede durar de seis meses a un año [S11]; la Cámara de Chuquisaca dijo que las reservas internacionales se perdieron hasta el primer trimestre de 2027 [S13].

**Variables que mueve.**
- Demanda extranjera de los meses siguientes: baja (estimación: -30% a -60% durante 6 meses; la duración viene de [S11], la magnitud es estimación).
- Reservas ya hechas: cancelaciones de grupos y tours.
- Imagen del destino: baja y se recupera lento (rezago).
- Ocupación nacional: puede subir algo si se reorienta la oferta.

**Decisiones del alumno.**
1. *Campaña de promoción con descuento al turista nacional.* Ventaja: llena parte de la capacidad. Costo: tarifa más baja; el turista nacional gasta menos por noche (estimación).
2. *Ofrecer "cancelación gratis hasta 7 días antes" a mercados extranjeros.* Ventaja: reduce el miedo a reservar. Costo: más cancelaciones tardías y habitaciones que no puedes revender.
3. *Diversificar a mercados cercanos (Perú, Argentina, Brasil, Chile).* Ventaja: viajes más cortos y baratos para ellos. Costo: gasto menor por turista y marketing nuevo. En 2024, esos cuatro países sumaron el 65% del total de visitantes extranjeros por nacionalidad (cálculo mío con [S10]).
4. *No hacer nada y esperar.* Ventaja: sin gasto. Costo: pierdes meses de ingresos y cuota de mercado frente a quien se movió.

**Qué aprende.** Que el daño de una crisis dura más que la crisis y que reaccionar tiene costo.

---

### Situación 3. Conflicto comunitario que cierra un atractivo

**Qué pasa.** Dos comunidades pelean por el cobro y el control del turismo en un sitio. En la Isla del Sol (Lago Titicaca), la disputa de 2017 llevó a bloquear la isla por agua y tierra: negocios de Challapampa cerrados, cuatro meses sin ingreso turístico, lanchas retenidas y más de 20 turistas retenidos [S17]. En junio de 2018 se suspendió el turismo en la zona de forma indefinida (dato de un resumen de búsqueda sobre un artículo de eju.tv que no abrí; ver sección 9). En enero de 2026, los bloqueos obligaron a evacuar a 127 turistas de Copacabana por vía lacustre y a rescatar a 135 en Uyuni con vuelos de la FAB [S14].

**Variables que mueve.**
- Acceso al atractivo: se cierra.
- Visitas a ese sitio: caen a casi cero (en el caso de [S17], cuatro meses sin ingreso turístico para el pueblo más afectado).
- Reputación: baja si hay turistas afectados.
- Costos de seguridad y traslado: suben.

**Decisiones del alumno.**
1. *Negociar un acuerdo con la comunidad (aporte por turista o contratar guías locales).* Ventaja: reduce el riesgo de cortes. Costo: un costo fijo por visitante y compromisos de largo plazo.
2. *Redirigir los tours a otro atractivo cercano.* Ventaja: mantienes ingresos. Costo: menor atractivo, otro conjunto de proveedores.
3. *Esperar a que la autoridad resuelva.* Ventaja: sin costo directo. Costo: puedes esperar meses; el caso de [S17] superó las ocho rondas de diálogo sin acuerdo.
4. *Comprar un seguro o cláusula de fuerza mayor con los clientes.* Ventaja: te cubre frente al turista. Costo: el seguro es caro y no cubre pérdida de imagen (estimación).

**Qué aprende.** Que el riesgo social es parte del negocio, y que una buena relación con la comunidad es un activo.

---

### Situación 4. Temporada alta, temporada baja y clima del destino (caso Uyuni)

**Qué pasa.** El destino cambia de oferta con la estación. En una crónica de viajes, la recepción de un hotel de Uyuni dijo que en lluvias (diciembre a abril) llegan sobre todo turistas asiáticos por el "efecto espejo" y que en la temporada seca (junio a septiembre) llegan europeos (observación anecdótica de una recepción, no estadística). En enero de 2022 las lluvias inundaron el salar y se prohibió cruzarlo en plena temporada alta (nota de prensa que vi en búsqueda y no abrí completa; ver sección 9).

**Variables que mueve.**
- Ocupación mensual: sube en alta, cae en baja (índice estacional; estimación: de 0,5 a 1,5 del promedio, a calibrar con datos locales).
- ADR: sube en alta si hay demanda.
- Costos fijos: iguales todo el año.
- Riesgo de cierre del acceso por clima: sube en lluvias.

**Decisiones del alumno.**
1. *Tarifa alta en temporada alta y baja agresiva en baja.* Ventaja: usa la elasticidad de cada mes [S1]. Costo: el cliente que vino en baja no acepta subir; riesgo de que el viajero espere a la baja.
2. *Cerrar los meses más flojos y reabrir.* Ventaja: ahorra costos variables. Costo: costos fijos siguen; hay que recontratar.
3. *Crear productos para la baja (grupos, eventos, tours de otro tipo).* Ventaja: llena capacidad. Costo: inversión y esfuerzo comercial con resultado incierto. [S6] sugiere que precio, mercadeo y administración de ingresos pueden compensar parte de la estacionalidad.
4. *Dirigirse al mercado nacional en baja.* Ventaja: demanda con feriados. Costo: tarifa más baja.

**Qué aprende.** Que la ocupación se planifica mes a mes y que el precio es la herramienta para mover la demanda.

---

### Situación 5. Dependencia de plataformas de reserva y comisiones

**Qué pasa.** Gran parte de las reservas llegan por plataformas en línea que cobran comisión. En Europa, la participación de las agencias en línea subió de 19,7% a 29,9% entre 2013 y 2026 y dos grupos concentran 85,4% de ese segmento; 51% de los hoteleros dice que las plataformas bajan sus precios sin acuerdo [S9]. No encontré datos de Bolivia sobre cuánto del volumen viene por plataformas ni cuánto cobran (sección 9). En Bolivia, un operador cobró 10% de comisión a sus clientes por manejar mercadeo y reservas de un alojamiento comunitario [S4]; sirve de referencia de un canal, no de plataformas.

**Variables que mueve.**
- Comisión efectiva: entre 10% y 20% de cada reserva por plataforma (estimación; el 10% de [S4] es de un operador, no de plataforma).
- Volumen de reservas: sube si estás en la plataforma.
- Dependencia: sube cuanto más porcentaje del volumen viene de ahí.
- ADR neto: baja.

**Decisiones del alumno.**
1. *Estar en todas las plataformas.* Ventaja: más visibilidad y ocupación. Costo: comisión alta y menos control de precio.
2. *Impulsar venta directa (WhatsApp, web propia, descuento por reserva directa).* Ventaja: recuperas margen. Costo: inversión en web y marketing; menos visibilidad.
3. *Trabajar con agencias mayoristas y operadores de tours.* Ventaja: llenan habitaciones de grupos. Costo: comisión negociada (referencia de 10% [S4]) y tarifas especiales.
4. *Limitar la disponibilidad en plataformas para días de alta demanda.* Ventaja: reservas la habitación a mejor precio. Costo: pierdes visibilidad en esos días.

**Qué aprende.** Que el canal más barato no es el más rentable y que la dependencia de un solo canal es un riesgo.

---

### Situación 6. Ola de reseñas negativas o positivas

**Qué pasa.** Un problema en el servicio (agua, ruido, atención) genera reseñas bajas en la plataforma. Una reseña mala pesa más porque el viajero consulta reseñas antes de decidir: la proporción de consumidores que lo hace va en aumento [S2]. Los hoteles baratos son los más afectados por la reputación [S2].

**Variables que mueve.**
- Puntaje de reputación: baja (por ejemplo, de 4,4 a 4,0 sobre 5; estimación).
- Ocupación y ADR: bajan con la reputación. Para el simulador: por cada 1% de caída en el puntaje, RevPAR -0,96% en promedio y -1,42% en gama media [S2].
- Costo de reparar (capacitación, compra): sube.

**Decisiones del alumno.**
1. *Invertir en capacitación y arreglo del problema.* Ventaja: ataca la causa. Costo: gasto fijo ahora y recuperación lenta del puntaje.
2. *Bajar el precio hasta que mejore el puntaje.* Ventaja: mantienes ocupación. Costo: ADR menor; la elasticidad de [S2] dice que sin reputación hay que bajar precios para mantener la ocupación.
3. *Responder públicamente cada reseña y ofrecer compensación.* Ventaja: muestra gestión. Costo: tiempo y compensaciones; no corrige el problema de fondo.
4. *Pedir reseñas a huéspedes satisfechos.* Ventaja: sube el promedio. Costo: parte de la información sobre incentivos es una práctica que algunas plataformas penalizan (no verificado).

**Qué aprende.** Que la reputación es un activo con valor monetario y que se construye (y se pierde) con el servicio diario.

---

### Situación 7. Política de cancelación, no-shows y sobreventa

**Qué pasa.** Un fin de semana de mucha demanda, parte de los que reservaron no se presentan. Un estudio de un restaurante de Hong Kong estimó entre 9,07% y 12,95% de no-shows o cancelaciones tardías, con el máximo en sábado [S3]. Según [S3], citando a otro estudio, cerca de 44% de los encuestados considera injusta la sobreventa en hoteles; la compensación al afectado mejora la percepción.

**Variables que mueve.**
- Tasa de no-show: 10% a 15% de las reservas del fin de semana (estimación basada en [S3], que es restaurante).
- Habitaciones vacías por no-show: sube.
- Rechazo de huéspedes por sobreventa: sube si sobrevendes.
- Reputación: baja si rechazas a alguien con reserva.
- Ingreso por depósitos no reembolsables: sube.

**Decisiones del alumno.**
1. *Cobrar depósito no reembolsable.* Ventaja: reduce no-shows. Costo: menos reservas y percepción de rigidez.
2. *Cancelación gratuita hasta 24 horas antes.* Ventaja: más reservas. Costo: más habitaciones vacías de último momento.
3. *Sobrevender 5% a 10% la capacidad.* Ventaja: llenas la planta aunque haya no-shows. Costo: si todos llegan, hay que reubicar a alguien (en otro hotel, con compensación) y bajar la reputación [S3].
4. *Fijar política distinta por canal (flexible en plataforma, rígida en directo).* Ventaja: adaptas por cliente. Costo: complejidad y confusión.

**Qué aprende.** Que la política de cancelación es una decisión de precio y de riesgo, no un detalle administrativo.

---

### Situación 8. Cambio del régimen cambiario y dólar

**Qué pasa.** El 30 de junio de 2026 Bolivia dejó de fijar el tipo de cambio y pasó a un precio oficial diario basado en transacciones en el sistema financiero [S16]. Para un proyecto turístico hay dos efectos: (a) los costos importados o ligados al dólar (equipamiento, tecnología, algunos alimentos, algunos servicios) cambian de precio; (b) los turistas extranjeros pagan en dólares o con tarjeta y su poder de compra en bolivianos cambia. No encontré datos sobre cómo cotizan los hoteles bolivianos (en dólares o en bolivianos) ni sobre el efecto en tarifas (sección 9).

**Variables que mueve.**
- Costos en moneda extranjera: suben en bolivianos (estimación: +5% a +25% del costo de insumos ligados al dólar, a calibrar).
- ADR en bolivianos para extranjeros: sube si cotizas en dólares.
- Competitividad frente a destinos vecinos: cambia.
- Incertidumbre de precios: sube.

**Decisiones del alumno.**
1. *Mantener tarifas en bolivianos y absorber el costo.* Ventaja: previsibilidad para el cliente. Costo: margen menor.
2. *Cotizar a extranjeros en dólares.* Ventaja: cobertura natural. Costo: complejidad, y el turista puede percibirlo como caro frente a otros destinos.
3. *Comprar insumos locales y renegociar con proveedores.* Ventaja: menor exposición. Costo: calidad o variedad menor.
4. *Subir la tarifa de todo en un porcentaje.* Ventaja: protege el margen. Costo: baja la ocupación según la elasticidad de [S1].

**Qué aprende.** Que el tipo de cambio afecta costos e ingresos al mismo tiempo, y que hay que ver quién paga en qué moneda.

---

### Situación 9. Falta de agua o de servicios básicos

**Qué pasa.** En noviembre de 2016, durante la sequía, los hoteles de La Paz pidieron planes de contingencia para recibir agua porque no podían atender a huéspedes que pagan por ese servicio; la situación era crítica sobre todo en la zona Sur (el gremio reunía 100 hoteles registrados) [S20]. La nota no da costos ni medidas tomadas por los hoteles.

**Variables que mueve.**
- Costo de agua por cisterna: sube (estimación: x2 a x4 sobre la tarifa normal, a calibrar).
- Calidad de servicio: baja.
- Reputación: baja si hay quejas.
- Ocupación: baja si el hotel no puede ofrecer el servicio.

**Decisiones del alumno.**
1. *Contratar cisternas y tanques propios.* Ventaja: continuidad. Costo: inversión en tanque y gasto por cada abastecimiento.
2. *Reducir servicios (lavandería, piscina, duchas largas).* Ventaja: baja el consumo. Costo: menos valor para el huésped.
3. *Subir la tarifa para cubrir el costo.* Ventaja: traslada el costo. Costo: menos ocupación y reseñas.
4. *Pedir a la autoridad una distribución prioritaria.* Ventaja: sin costo directo. Costo: depende de terceros; no controlas el resultado, y la propia nota reconoce que hospitales, hogares y escuelas van primero [S20].

**Qué aprende.** Que los servicios básicos son un insumo crítico y que la resiliencia (tanques, respaldos) cuesta antes de que haga falta.

---

### Situación 10. Feriado largo o evento grande

**Qué pasa.** Un feriado, el Carnaval de Oruro u otra fiesta llena la ciudad. Funcionarios dijeron que el Carnaval de Oruro supera los US$ 500 millones, aunque no hay cifras nacionales consolidadas ([nota ya relevada en `00-taxonomia-tipos.md`, S22 de esa ficha]; no la reabrí aquí). En Sucre, una campaña de promoción en Semana Santa levantó la actividad, pero los afiliados dijeron que Airbnb tuvo una presencia importante [S13].

**Variables que mueve.**
- Demanda: sube mucho unos días (estimación: ocupación a 90% a 100% con tarifa +30% a +100%).
- ADR: sube si hay poder de fijar precio.
- Costos variables: suben (personal extra, insumos).
- Reputación: sube o baja según la calidad de servicio bajo presión.

**Decisiones del alumno.**
1. *Subir mucho la tarifa y exigir mínimo de noches.* Ventaja: máximo ingreso por habitación. Costo: clientes habituales molestos, riesgo de que parte de la demanda se vaya a alojamientos informales.
2. *Mantener la tarifa para clientes fijos y vender el resto caro.* Ventaja: cuidas la relación. Costo: pierdes ingreso potencial.
3. *Contratar personal extra y ampliar servicios (comida, tours).* Ventaja: más ingreso complementario. Costo: costo variable alto y riesgo de baja calidad.
4. *Sobrevender.* Ventaja: mayor ocupación. Costo: ver situación 7.

**Qué aprende.** Que los picos son donde se gana el año, pero también donde se arriesga la reputación.

---

### Situación 11. Competencia informal y plataformas de alquiler de viviendas

**Qué pasa.** Aparecen alojamientos sin licencia y alquileres de departamentos que ofrecen precios más bajos. La Cámara de Chuquisaca mencionó la presencia importante de Airbnb [S13]; ella misma había pedido volver como observadora en las inspecciones de licencias de hospedaje de la gobernación [S13]. La ley exige autorización previa para operar [S5]. Un dato de una gaceta departamental (no abierta) indica que solo una parte de los alojamientos en Santa Cruz tenía licencia de funcionamiento en 2017 (sección 9).

**Variables que mueve.**
- Demanda sensible al precio: se va al sustituto (estimación: -5% a -15% de ocupación en el segmento económico).
- ADR: presión a la baja.
- Costos de cumplimiento (licencias, impuestos) que el informal no paga: ventaja de costo para el competidor.

**Decisiones del alumno.**
1. *Bajar precio para competir.* Ventaja: frena la fuga. Costo: menos margen con costos fijos altos.
2. *Diferenciarse (servicio, ubicación, desayuno, seguridad).* Ventaja: no compites por precio. Costo: inversión y tiempo.
3. *Denunciar a la autoridad y pedir fiscalización.* Ventaja: puede nivelar la cancha. Costo: resultado incierto y lento.
4. *Entrar al mismo canal (publicar tus habitaciones en plataformas de alquiler).* Ventaja: llegas al mismo cliente. Costo: comisión y menos control.

**Qué aprende.** Que formalizarse tiene costo, que el cliente compara y que la ventaja competitiva no es solo el precio.

---

### Situación 12. Deuda y cuota del banco con ocupación casi cero

**Qué pasa.** El hotel tiene un préstamo con cuotas fijas. Cuando cae la ocupación, la cuota sigue. En marzo de 2020, gremios de La Paz pidieron suspender multas y postergar pagos municipales y bancarios 180 días (solo intereses); el decreto anunciado en ese momento no incluía al sector [S18]. En el trópico de Cochabamba, tras los conflictos postelectorales de 2019, algunos hoteles cerraron o intentaban vender y tenían deudas bancarias que no podían pagar [S19]; el dato de caída de turistas de "más de 90%" es del gremio y los datos municipales muestran caídas mucho menores (10% en diciembre) [S19].

**Variables que mueve.**
- Caja: cae cada mes que no cubre la cuota.
- Mora: sube.
- Capacidad de endeudarse de nuevo: baja.
- Valor del activo: baja si hay oferta de hoteles en venta.

**Decisiones del alumno.**
1. *Pedir reprogramación al banco.* Ventaja: alivia la caja. Costo: más interés total y registro de la reprogramación; no hay garantía de aprobación.
2. *Aportar capital de los socios.* Ventaja: evita la mora. Costo: dinero que puede perderse.
3. *Vender parte del activo (un piso, un terreno).* Ventaja: caja inmediata. Costo: menos capacidad futura y precio de venta bajo en crisis.
4. *Convertir el uso temporalmente (alquiler por meses a estudiantes o trabajadores).* Ventaja: ingreso estable aunque bajo. Costo: desgaste de la planta y tarifa baja; cambia el tipo de negocio (estimación; no verifiqué este tipo de práctica en Bolivia).

**Qué aprende.** Que el nivel de deuda decide si el hotel sobrevive a una crisis y que la deuda debe dimensionarse para el peor escenario.

---

### Situación 13. Contrato corporativo o de mayorista con descuento

**Qué pasa.** Una empresa (minera, constructora, ONG) o un mayorista ofrece reservar un bloque de habitaciones todo el año a una tarifa menor. Da ocupación segura en meses flojos; usa capacidad que podrías vender más caro en alta.

**Variables que mueve.**
- Ocupación base: sube (estimación: +15 a +30 puntos porcentuales en meses bajos).
- ADR: baja (estimación: -20% a -35% sobre tarifa pública).
- Capacidad disponible para vender caro en temporada alta: baja.
- Concentración en un cliente: sube.
- Costo variable (limpieza, desayuno): sube con la ocupación.

**Decisiones del alumno.**
1. *Aceptar el bloque anual con descuento.* Ventaja: ingreso predecible. Costo: menos habitaciones en alta, y dependencia de un cliente.
2. *Aceptar solo en meses de baja.* Ventaja: llena donde sobra. Costo: el cliente puede no aceptar.
3. *Aceptar con pago adelantado parcial.* Ventaja: caja. Costo: tarifa aún menor.
4. *Rechazar y vender solo al público.* Ventaja: libertad de precio. Costo: meses con ocupación baja.

**Qué aprende.** Que vender barato en la baja no es malo si no desplaza la venta cara en la alta, y que la concentración en un cliente es un riesgo.

---

### Situación 14. Alianza con un operador de turismo para un alojamiento de ecoturismo o comunitario

**Qué pasa.** Un alojamiento aislado (cabañas, albergue) necesita llegar al turista extranjero y no tiene red de ventas. En Chalalán, los precios fijados (US$ 115 por cuatro días frente a US$ 9 por día del mercado de mochileros) generaron escepticismo; el primer operador extranjero envió grupos en 1998 y dejó de hacerlo por malentendidos sobre reservas y calendario de pagos; en 2000 subieron el precio 40% y lograron la primera ganancia operativa de unos US$ 20.000 [S4]. En Tomarapi, un operador recibe 10% de comisión por mercadeo, reservas y asesoría de sus propios clientes, con tarifa de US$ 55 por habitación doble por día [S4]. Las cifras son de la década de 2000.

**Variables que mueve.**
- Ocupación: sube con operador (estimación: +20 a +40 puntos de ocupación frente a vender solo).
- Comisión: 10% o más [S4].
- ADR: sube si apuntas a turistas de más gasto [S4].
- Dependencia del operador: sube.
- Riesgo de cobro y de reservas mal coordinadas.

**Decisiones del alumno.**
1. *Contrato exclusivo con un operador.* Ventaja: apoyo completo y volumen. Costo: dependencia; si se va, pierdes la red [S4].
2. *Vender con varios operadores y directo.* Ventaja: diversificas. Costo: más trabajo y menos compromiso de cada uno.
3. *Subir el precio y apuntar a turistas de más gasto.* Ventaja: ADR mayor. Costo: menos volumen; el caso Chalalán tuvo años sin ganancia antes de lograrlo [S4].
4. *Definir reglas claras de reservas, pagos y depósitos.* Ventaja: evita el problema que hizo perder al primer operador [S4]. Costo: menos flexibilidad.

**Qué aprende.** Que el precio, el canal y los acuerdos de pago deciden la viabilidad de un alojamiento aislado.

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

El motor ya maneja caja, ingresos, costos y reputación. Estas variables son propuestas mías; cada una se actualiza en cada mes.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| `capacidad` | Habitaciones (o camas, mesas, cupos) disponibles | Fija; cambia solo por ampliación, renovación o cierre temporal |
| `indice_estacional[mes]` | Multiplicador de ocupación base del mes (12 valores) | Parámetro del proyecto; el alumno lo estima en el plan, un evento puede moverlo |
| `ocupacion_base` | Ocupación del mes sin shocks | `ocupacion_media x indice_estacional[mes]`, ajustada por reputación e imagen |
| `adr` | Tarifa promedio por noche vendida | Tarifa de lista x mezcla de canal x ajuste por temporada; baja con descuentos |
| `mezcla_canal` | % de reservas directas, por plataforma, por agencia | El alumno la define; los eventos la mueven |
| `comision_efectiva` | Comisión promedio ponderada por canal | `suma(mezcla_canal x comision_canal)` |
| `reputacion_puntaje` | Puntaje en línea de 1 a 5 | Sube con servicio y reseñas; baja con incidentes; efecto en ocupación y ADR con elasticidades de [S2] como punto de partida |
| `imagen_destino` | Índice de 0 a 100 de la percepción del destino (conflictos, alertas) | Cae con eventos de bloqueo y alerta; se recupera lento (rezago de meses, [S11], [S13]) |
| `acceso_bloqueado` | Si el destino está accesible este mes (sí/no o % de días) | Lo activan eventos de bloqueo o conflicto; reduce reservas nuevas y ocupación |
| `reservas_adelantadas` | Reservas con depósito aún no consumidas | Entran al reservar, se reconocen al consumir; sube la caja y crea una obligación |
| `tasa_cancelacion` y `tasa_noshow` | Parte de las reservas que se pierden | Parámetros según política; suben en crisis |
| `demanda_extranjera` y `demanda_nacional` | Dos segmentos con tarifa y gasto distintos | Cada uno con su estacionalidad y sensibilidad a eventos; extranjero más sensible a alertas de viaje y conflictos |
| `costos_fijos_planta` | Personal base, servicios, impuestos, seguros | Constante en el mes; baja solo con feriado colectivo o cierre temporal (con costo de reapertura) |
| `costos_variables_por_hab_vendida` | Limpieza, desayuno, lavandería, agua | Costo unitario x habitaciones vendidas |
| `ingresos_complementarios` | Comida, tours, traslados | Proporción del ingreso de habitaciones o por huésped |
| `estado_planta` | Nivel de desgaste de la planta (0 a 100) | Baja cada mes; sube con inversión en mantenimiento; afecta reputación |
| `exposicion_dolar` | Parte de los costos ligada al dólar | Se actualiza con el tipo de cambio efectivo del mes |
| `deuda` y `cuota` | Saldo y pago mensual del préstamo | Cuota fija; si la caja no alcanza, mora |
| `meses_cobertura_caja` | Indicador calculado para el alumno | `caja / costos_fijos_mensuales` |

Reglas de cálculo mensual, en el orden en que las usaría:

1. Ocupación del mes = ocupación base x (1 - efecto de bloqueo) x factor de imagen x factor de reputación, con tope de 100% (o más si hay sobreventa).
2. Habitaciones vendidas = capacidad x días x ocupación.
3. Ingreso de habitaciones = habitaciones vendidas x ADR (después de comisiones, para la caja).
4. Ingreso total = ingreso de habitaciones + complementarios.
5. Costos = fijos + variables x habitaciones vendidas + cuota + mantenimiento.
6. Caja = caja previa + ingreso cobrado - costos pagados + cambio en reservas adelantadas.
7. RevPAR, GOPPAR y ocupación de equilibrio se calculan y se muestran como indicadores.

---

## 7. Ejemplos reales de Bolivia y Latinoamérica (con enlace abierto)

Solo aparecen casos cuyo enlace abrí. Lo que dice la nota va en la columna "Qué dice la fuente".

| Caso | País | Qué dice la fuente | Enlace |
|---|---|---|---|
| Hotelería de Sucre y Santa Cruz en los bloqueos de 2026 | Bolivia | Ocupación "prácticamente en cero" en Sucre, feriado colectivo, dos hoteles iniciando suspensión temporal; en la pandemia 21 empresas no reabrieron; en Santa Cruz, ocupación de 20% o menos, despidos y estimación de pérdidas de más de US$ 230 millones en casi 50 días (cifra del gremio) | [Correo del Sur, 7/6/2026](https://correodelsur.com/economia/20260607/hoteles-estan-en-cero-ya-se-reportan-cierres.html) y [eju.tv, 17/6/2026](https://eju.tv/2026/06/no-se-puede-prescindir-de-las-leyes-para-gobernar-dice-pedraza-que-ve-desesperacion-en-la-cob-por-terminar-el-conflicto/) |
| Chalalán Ecolodge (Madidi) | Bolivia | Albergue comunitario con precio de US$ 115 por cuatro días en el lanzamiento; primera ganancia operativa de unos US$ 20.000 tras subir el precio 40% en 2000; 74 familias accionistas; 1.136 turistas en 2006 | [Peaty y Portillo (PDF)](https://www.ritsumei.ac.jp/ir/isaru/assets/file/journal/21-3_06Peaty_Portillo.pdf) |
| Posada comunitaria de Tomarapi | Bolivia | US$ 55 por habitación doble por día; el operador cobra 10% de comisión a sus clientes | mismo documento anterior |
| Conflicto de la Isla del Sol (2017) | Bolivia | Bloqueo por agua y tierra, negocios de Challapampa cerrados, cuatro meses sin ingreso turístico | [eju.tv, 18/7/2017](https://eju.tv/2017/07/dos-comunidades-en-pugna-por-turismo-toman-la-isla-del-sol/) |
| Hoteles y agencias en la cuarentena de 2020 | Bolivia | En La Paz, al menos 10 hoteles cerrados; unos 1.200 hoteles legales registrados y unas 3.000 agencias en el país (cifras del gremio); pedido de 180 días de gracia en bancos e impuestos | [eju.tv, 21/3/2020](https://eju.tv/?p=1634823) |
| Hoteles del trópico de Cochabamba | Bolivia | Tras los conflictos postelectorales de 2019: 170 hoteles, unas 6.000 camas, unos cinco cierres; el gremio dice que la caída fue de más de 90% y el municipio muestra 10% en diciembre | [Los Tiempos, 2/3/2020](https://www.lostiempos.com/node/489059) |
| Hoteles de La Paz sin agua | Bolivia | En noviembre de 2016, 100 hoteles registrados pidieron plan de abastecimiento por cisterna | [Los Tiempos, 23/11/2016](https://www.lostiempos.com/node/128388) |
| Hoteles europeos y plataformas en línea | Europa (no Latam) | Estudio de HOTREC 2026: 51,3% de reservas directas y 29,9% por plataformas | [TravelExtra](https://www.travelextra.ie/booking-com-has-66pc-market-share-of-hotel-bookings/) |

Nota: no encontré un caso latinoamericano distinto de Bolivia con cifras que haya abierto. Las cifras de ocupación y recuperación de hoteles de Latinoamérica durante la pandemia (STR, BID Invest, CEPAL) aparecieron solo en resúmenes de búsqueda; no las abrí, así que no las uso (sección 9).

---

## 8. Fuentes numeradas con nivel

Nivel A: libro, paper, organismo, manual universitario o norma. B: consultora, reporte sectorial, prensa económica, gremio. C: blog, práctica.
"Texto leído" significa que leí el texto del documento (descargué el PDF o la página y lo revisé); "resumen" significa que solo leí el resumen o la ficha.

| N.º | Fuente | Nivel | Qué verifiqué | Enlace |
|---|---|---|---|---|
| S1 | Natalie Haynes y David Egan (2023), "Measuring Temporal Performance in Tourism", capítulo 8 en P. Goulding (ed.), *Tourism: A temporal analysis*, Goodfellow Publishers (versión aceptada, Sheffield Hallam University) | A (capítulo de libro universitario) | Texto leído completo: definiciones de ocupación, ADR y RevPAR, informe STAR, índices, ejemplo de subida de tarifa, plataformas en línea y estacionalidad | https://shura.shu.ac.uk/32309/ |
| S2 | Chris K. Anderson (2012), "The Impact of Social Media on Lodging Performance", Cornell Hospitality Report, Center for Hospitality Research, Cornell University | A (reporte universitario) | Texto leído (PDF descargado): datos de enero 2010 a junio 2012 de 11 ciudades, más de 50.000 observaciones mensuales, elasticidades por categoría | https://ecommons.cornell.edu/items/d64bbbba-651a-4e13-a058-af3e2e82f4cf |
| S3 | Tony S. M. Tse y Y. T. Poon (2016), "Modeling no-show, cancellation, overbooking and walk-in in restaurant revenue management", *Journal of Foodservice Business Research* (manuscrito aceptado) | A (paper) | Texto leído parcial: resumen, introducción y resultados de no-show y cancelación | https://ira.lib.polyu.edu.hk/bitstream/10397/104876/1/Tse_Modeling_No-Shows_Cancellations.pdf |
| S4 | David Peaty y Antía Portillo, "Community-based tourism in Bolivia: projects and perspectives" (artículo; el PDF no trae año ni revista; menciona fuentes de 2006 a 2008; los metadatos del archivo indican 2009) | A (artículo académico) | Texto leído: casos de Chalalán, Tomarapi y otros, precios, comisión del 10%, relación operadores y comunidades | https://www.ritsumei.ac.jp/ir/isaru/assets/file/journal/21-3_06Peaty_Portillo.pdf |
| S5 | Estado Plurinacional de Bolivia, Ley N.º 292, Ley General de Turismo "Bolivia te espera", 25 de septiembre de 2012 | A (norma) | Leído por extracto de la página de Lexivox: artículos 6, 7, 9, 19 a 21 y 30 (autorización previa, registro, categorización, IVA de servicios a extranjeros). No revisé el texto completo ni el reglamento (DS 2609), ni sus modificaciones | https://www.lexivox.org/norms/BO-L-N292.html |
| S6 | Dengjun Zhang, Jinghua Xie y Marius Sikveland (2021), "Tourism seasonality and hotel firms' financial performance: evidence from Norway", *Current Issues in Tourism* 24(21), 3021-3039 | A (paper) | Solo resumen (en IDEAS/RePEc) | https://ideas.repec.org/a/taf/rcitxx/v24y2021i21p3021-3039.html |
| S7 | R. W. Butler (2001), "Seasonality in tourism: issues and implications", en Baum y Lundtorp (eds.), *Seasonality in Tourism*, Pergamon, pp. 5-22 | A (capítulo de libro) | Solo resumen de la ficha | https://strathprints.strath.ac.uk/7996/ |
| S8 | Lighthouse (antes OTA Insight), "How to calculate and improve 12 hotel performance metrics", Hospitality Net, 28 de marzo de 2025 | B (proveedor de datos del sector) | Fórmulas de 12 métricas (con un error en la conversión) | https://www.hospitalitynet.org/news/4126420/how-to-calculate-and-improve-12-hotel-performance-metrics |
| S9 | TravelExtra, nota sobre el Estudio de distribución hotelera europea de HOTREC 2026 | B (prensa del sector; datos de un gremio) | Participación de canales, concentración de plataformas, 51% de hoteleros que dicen que bajan sus precios | https://www.travelextra.ie/booking-com-has-66pc-market-share-of-hotel-bookings/ |
| S10 | IBCE, Cifras N.º 1.360, "Turismo en Bolivia", 2 de octubre de 2025 (datos INE y Ministerio de Desarrollo Productivo, preliminares) | B (instituto gremial) | Texto leído: llegadas 2010-2025, nacionalidades 2024, estructura del gasto, ingreso de US$ 740 millones en 2024 | https://www.ibce.org.bo//images/ibcecifras_documentos/Cifras_1.360_Turismo_en_Bolivia_1759434933.pdf |
| S11 | Los Tiempos, "Bloqueos provocan pérdidas de hasta Bs 25 millones por día al turismo, alerta ministra Yáñez", 13/5/2026 | B (prensa) | Texto leído | https://www.lostiempos.com/actualidad/economia/20260513/bloqueos-provocan-perdidas-bs-25-millones-dia-al-turismo-alerta |
| S12 | eju.tv, nota con declaraciones de Jorge Vaca (Cámara Hotelera de Santa Cruz), 17/6/2026 | B (prensa) | Texto leído | https://eju.tv/2026/06/no-se-puede-prescindir-de-las-leyes-para-gobernar-dice-pedraza-que-ve-desesperacion-en-la-cob-por-terminar-el-conflicto/ |
| S13 | Correo del Sur, "Hoteles están 'en cero'; ya se reportan cierres", 7/6/2026 | B (prensa) | Texto leído | https://correodelsur.com/economia/20260607/hoteles-estan-en-cero-ya-se-reportan-cierres.html |
| S14 | Correo del Sur, "Bloqueos se multiplican y golpean al turismo y la economía en el país", 11/1/2026 | B (prensa) | Texto leído | https://correodelsur.com/politica/20260111/bloqueos-se-multiplican-y-golpean-al-turismo-y-la-economia-en-el-pais.html |
| S15 | Correo del Sur, "Bolivia recibió 1,1 millones de turistas en 2025" (boletín del INE), 10/8/2026 | B (prensa citando al INE) | Texto leído: 1.145.165 visitantes extranjeros en 2025 | https://correodelsur.com/economia/20260810/bolivia-recibio-1-1-millones-de-turistas-en-2025.html |
| S16 | El Peruano (AFP), "Bolivia deja libre precio del dólar", 30/6/2026 | B (prensa) | Texto leído | https://elperuano.pe/noticia/299094-bolivia-deja-libre-precio-del-dolar |
| S17 | eju.tv (citando a Página Siete), "Dos comunidades en pugna por turismo toman la Isla del Sol", 18/7/2017 | B (prensa) | Texto leído | https://eju.tv/2017/07/dos-comunidades-en-pugna-por-turismo-toman-la-isla-del-sol/ |
| S18 | eju.tv, "Hoteles cierran por falta de huéspedes y agencias de viaje piden flexibilizar pagos", 21/3/2020 | B (prensa) | Texto leído | https://eju.tv/?p=1634823 |
| S19 | Los Tiempos, "El turismo en el trópico cae en 90% y varios hoteles se cierran", 2/3/2020 | B (prensa) | Texto leído | https://www.lostiempos.com/node/489059 |
| S20 | Los Tiempos, "Hoteles en emergencia por sequía", 23/11/2016 | B (prensa) | Texto leído | https://www.lostiempos.com/node/128388 |

**Conteo.** 20 fuentes distintas. Nivel A: 7 (S1 a S7). De esas, **con texto leído: 5** (S1, S2, S3 parcial, S4, S5 por extracto). **Solo resumen: 2** (S6, S7). Se cumple el mínimo de 8 fuentes y de 4 de nivel A leídas con texto, aunque S3 y S5 las leí de forma parcial.

**Limitación honesta.** Los datos de Bolivia vienen casi todos de prensa y de gremios (nivel B), con cifras que no están auditadas. No encontré un manual universitario de evaluación de proyectos hoteleros ni un anuario estadístico de ocupación de Bolivia que haya podido leer.

---

## 9. No confirmado

- **Ocupación, ADR y RevPAR reales de hoteles y hostales bolivianos.** No encontré ninguna fuente abierta con datos de ocupación por ciudad o categoría fuera de los episodios de crisis. Los valores "normales" que use en el simulador serían estimaciones.
- **Comisiones de plataformas en Bolivia.** Los resúmenes de búsqueda hablaban de 10% a 15% y hasta 25% o 30% para hoteles independientes en otros países (notas del Boston Globe y de Lodging Magazine), pero no abrí la primera, y la segunda no traía porcentajes. No tengo cifra boliviana.
- **Participación de plataformas en el volumen de reservas en Bolivia.** Sin dato.
- **La cifra de 65% de cancelaciones y 18% de ocupación en La Paz** (Cámara Hotelera de La Paz) y de 5% de ocupación en Sucre: aparecieron en resúmenes de búsqueda de notas que no abrí. No las uso como dato.
- **Pérdidas diarias del turismo:** la ministra habló de Bs 20 a 25 millones por día [S11] y el 11/1/2026 se mencionaron Bs 3,8 millones por día de bloqueo [S14]; el resumen de búsqueda mencionó US$ 110 millones (turismo y gastronomía) y Bs 60 millones por día (dirigente). Las cifras no coinciden entre fuentes; todas son de autoridades o gremios.
- **Suspensión del turismo en la Isla del Sol en junio de 2018:** aparece en resúmenes de búsqueda; no abrí la nota de eju.tv.
- **Estacionalidad de Uyuni:** la información de las lluvias, temporada alta y prohibición de cruzar el salar viene de resúmenes de búsqueda (crónica de La Nación y nota de Correo del Sur de enero de 2022); no abrí esas páginas completas.
- **El Carnaval de Oruro y la cifra de US$ 500 millones:** la tomé de la ficha general (`00-taxonomia-tipos.md`); no la reabrí en esta investigación.
- **Licencias de funcionamiento de alojamientos (31% en Santa Cruz en 2017):** viene de un resumen de búsqueda sobre una gaceta departamental; no pude abrirla (error de certificado).
- **Contenido completo de la Ley 292, su reglamento (Decreto Supremo 2609/2015) y reformas:** solo leí un extracto. No verifiqué requisitos concretos de registro, categorización, tasas, sanciones ni obligaciones tributarias específicas para alojamientos. Tampoco el tratamiento del IVA al turista extranjero más allá de lo que resume el extracto del artículo 30.
- **Registro de empresas y normas laborales** (feriado colectivo, despidos, bono): no los revisé.
- **Cómo cotizan los hoteles bolivianos (dólares o bolivianos)** y el efecto del cambio de régimen cambiario de junio de 2026: no encontré datos [S16 solo cuenta el cambio de régimen].
- **Costos de la planta de un hotel boliviano** (porcentaje de personal, servicios, mantenimiento): sin fuente. El estudio ecuatoriano de hoteles de Quito con apalancamiento combinado promedio de 8,1 apareció solo en un resumen de búsqueda; no lo abrí.
- **Estudios de seguridad o de efectos de reseñas en Bolivia:** no encontré ninguno. [S2] es de EE. UU. y Europa.
- **Fórmula de cobertura de la deuda y fórmula de punto de equilibrio:** la primera es de memoria y la segunda es mi deducción; ninguna la confirmé en una fuente abierta.
- **Libros de texto de evaluación de proyectos turísticos:** no abrí ninguno; no cito autor, edición ni editorial de libros de texto.
- **Cifras de pandemia en Latinoamérica** (STR, BID Invest, CEPAL): solo vi resúmenes de búsqueda.
- **Pandemia en Bolivia:** la reducción de llegadas viene de [S10]; las cifras de cierres vienen de gremios [S13, S18].
- **El dato de "INE 2025" sobre tipos de alojamiento** (hoteles 51,2%, hostales 18,5%, residenciales 16,6%, alojamientos 10,1%, casas de huéspedes 3,7%) lo leí en [S15], pero la nota no aclara si son porcentajes de visitantes, de pernoctaciones o de establecimientos; no lo uso.
- **Nada sobre agencias de viaje y restaurantes turísticos en profundidad.** Solo encontré el estudio de restaurantes de [S3] y datos de operadores en [S4]. Los indicadores específicos de agencias (margen sobre paquete, comisión de aerolíneas) quedan sin cubrir.

---

## 10. Cifras que necesitan validación local

Cada cifra que es estimación mía o no tiene dato de Bolivia, con quién podría aportarla.

| Cifra o parámetro | Estado | Quién podría aportarla |
|---|---|---|
| Ocupación mensual típica por ciudad y categoría (hostal, hotel 3 estrellas, ecolodge) | Estimación; sin dato | Cámaras Hoteleras (La Paz, Santa Cruz, Chuquisaca, Cochabamba), INE, docentes de turismo, hoteleros |
| ADR por categoría y por temporada | Sin dato | Cámaras Hoteleras, hoteleros del rubro, Viceministerio de Turismo |
| Índice estacional por destino (Uyuni, La Paz, Copacabana, Rurrenabaque, Oruro) | Estimación (0,5 a 1,5) | Operadores de tour, gobernaciones, cámaras de turismo locales |
| Comisión de plataformas en línea y participación en el volumen | Sin dato boliviano | Hoteleros, administradores de hostales, docentes de marketing turístico |
| Comisión de operadores y agencias (10% referencia de [S4]) | Referencia de la década de 2000 | Operadores de turismo, Cabotur (cámara de agencias de viajes) |
| Caída de la ocupación en bloqueo (-60% a -90%) | Estimación basada en notas de prensa | Cámaras Hoteleras, datos de reservas de hoteles en mayo y junio de 2026 |
| Duración de la recuperación de la imagen (6 a 12 meses) | Declaración de la ministra [S11]; estimación para la caída | Viceministerio de Turismo, operadores de turismo receptivo |
| Cancelación y no-show en hoteles bolivianos (10% a 15%) | Estimación basada en un restaurante de Hong Kong [S3] | Hoteleros, restaurantes turísticos, administradores |
| Efecto de la reputación sobre ADR y ocupación | Cifras de EE. UU. y Europa [S2]; sin dato boliviano | Docentes de hotelería, administradores que usen plataformas de reseñas |
| Proporción de costos fijos en un hotel boliviano | Sin dato | Empresarios hoteleros, contadores del sector, docentes de finanzas |
| Costo del agua por cisterna y de tanques | Estimación | Hoteleros de La Paz o Cochabamba |
| Efecto del tipo de cambio sobre costos y tarifas (+5% a +25%) | Estimación | Hoteleros, economistas locales, docentes |
| Moneda de cotización de las tarifas (dólares o bolivianos) | Sin dato | Hoteleros, agencias de turismo receptivo |
| Caída de ocupación por competencia informal (-5% a -15%) | Estimación | Cámaras Hoteleras, gobernaciones (inspecciones de licencias) |
| Descuento y ocupación adicional en contratos corporativos (-20% a -35% de tarifa, +15 a +30 puntos de ocupación) | Estimación | Hoteleros con contratos con empresas mineras o constructoras |
| Aumento de ocupación con un operador en un albergue aislado (+20 a +40 puntos) | Estimación; [S4] no da ocupación | Gestores de albergues comunitarios (Chalalán y otros), operadores |
| Tasa de mantenimiento anual de la planta | Sin dato | Hoteleros, arquitectos o constructores con experiencia hotelera |
| Cifras de gasto del turista (US$ 740 millones en 2024 y 20% en alojamiento [S10]) | Datos preliminares de INE y ministerio | INE, Viceministerio de Turismo, Banco Central |
| Requisitos legales vigentes para operar (autorización, registro, categorización, impuestos) | Solo extracto de la Ley 292 | Abogado o contador del sector, Viceministerio de Turismo, gobernaciones |
| Reglas laborales para feriado colectivo, suspensión y despidos | No revisadas | Abogado laboral, Ministerio de Trabajo, docentes |
