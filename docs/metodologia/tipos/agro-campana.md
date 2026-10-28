# Producción agropecuaria por campaña (cultivos, ganadería, avicultura, piscicultura, agroindustria primaria): ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que la abrí. El alcance de lo que leí de cada una está en esa sección.
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es cita.
- Una magnitud marcada **(estimación)** la puse yo para que el simulador tenga un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro año, otro cultivo, otra zona), así que tampoco es un parámetro "verdadero" para tu proyecto.
- Las fórmulas marcadas **(de memoria)** las reconstruí de conocimiento general; no las confirmé en una fuente abierta. Verifícalas antes de implementarlas.
- Lo que no pude verificar está en la sección 9; las cifras que hay que validar con gente local, en la sección 10.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto agropecuario por campaña produce una cosecha o un ciclo (una siembra, una engorda, un lote de pollos, una crianza de peces, una cosecha de café) y lo vende. El ingreso llega de golpe, meses después de haber gastado en semilla, insumos, maquinaria y jornales. En Bolivia la soya de verano, por ejemplo, se siembra en noviembre y diciembre y se cosecha en marzo y abril; la de invierno se siembra en junio y julio y se cosecha en octubre y noviembre, y la de verano aporta en promedio 77% de la producción anual [S5].

**Cómo aporta valor.** Hay cuatro fuentes de valor, y las cuatro se pueden perder en una sola campaña:

1. **Margen por hectárea (o por animal, por lote).** Lo que queda de multiplicar rendimiento por precio y restar los costos variables. Los manuales de gestión agropecuaria lo llaman *margen bruto*: "no es una cifra de utilidad", porque no descuenta mano de obra fija, maquinaria propia, alquiler ni intereses [S1].
2. **Escala bien financiada.** Más hectáreas o más cabezas diluyen costos fijos, pero exigen más capital de trabajo antes de cobrar.
3. **Valor agregado y acceso directo al comprador.** Vender procesado, certificado u orgánico, o saltarse intermediarios, mejora el precio. Los casos bolivianos de la quinua y del cacao apuntan en esa dirección [S6, S11].
4. **Resiliencia.** Diversificar cultivos, tener seguro o pertenecer a una cooperativa baja el riesgo de perder todo en un mal año (interpretación mía, apoyada en [S2, S6]).

**Qué lo hace distinto de otros tipos.** (a) El riesgo dominante no lo controlas: clima, plagas, precio internacional y decisiones del Estado. (b) El flujo de caja es de *gasto primero, cobro después*, con un solo gran ingreso por ciclo. (c) El volumen de la oferta depende de lo que se sembró hace meses, no de lo que quieres vender hoy. (d) Muchos productos son perecibles o difíciles de guardar, así que el calendario manda. (e) En Bolivia se suman presiones específicas que aparecen en las fuentes: dólares escasos para insumos [S10, S16], falta de diésel [S18], suspensiones de exportación [S14, S15], contrabando y competencia importada [S13, S16], bloqueos [S16], y conflictos de tierra [S18, S19].

---

## 2. Indicadores propios y cómo se calculan

Convención: **por campaña** salvo que se diga otra cosa; "ha" es hectárea.

### 2.1 Rentabilidad de la campaña

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Producción (ingreso bruto) de la campaña** | Superficie sembrada x rendimiento por ha x precio de venta | Concepto de "output" por ha en [S1]; la multiplicación es la lectura usual |
| **Margen bruto por ha** | Ingreso por ha - costos variables por ha (semilla, fertilizante, agroquímicos, combustible, jornales eventuales, cosecha, flete) | [S1] define: gross margin = output menos variable costs, por ha en cultivos y por cabeza en ganadería; aclara que no es utilidad |
| **Margen bruto total** | Margen bruto por ha x superficie | [S1] (lectura mía) |
| **Utilidad de la campaña** | Margen bruto total - costos fijos de la finca (mano de obra permanente, maquinaria propia y su depreciación, administración, alquiler de tierra) - intereses | [S1] enumera esos costos fijos como lo que el margen bruto no incluye |
| **Costo total por ha** | (Costos variables + costos fijos asignados + intereses) / superficie | de memoria |
| **Rendimiento de equilibrio (kg/ha)** | Costo total por ha / precio de venta | de memoria (despeje del punto de equilibrio) |
| **Precio de equilibrio (Bs/kg)** | Costo total por ha / rendimiento esperado | de memoria |
| **Margen de seguridad de rendimiento** | (Rendimiento esperado - rendimiento de equilibrio) / rendimiento esperado | de memoria |

Ejemplo de la lógica con cifras de [S9]: ANAPO declaró que rendimientos de 800 y 900 kg/ha en Pailón y Cuatro Cañadas "no cubren siquiera los costos de producción". [S5] reporta que el rendimiento de soya de verano de 1990 a 2015 osciló entre 1,5 y 2,4 t/ha, con mínimo de 1,29 y máximo de 2,53 t/ha. Un rendimiento de equilibrio entonces queda entre ambos: arriba de 0,9 t/ha en esas zonas (el número exacto depende del costo por ha, que no encontré; ver sección 10).

Estructura de costos: en un estudio de costos de la campaña de verano 2023-2024 en predios de la Chiquitania, las semillas fueron el principal componente del costo (41% en cultivos de cobertura puros, 60% en consorciados) y los agroquímicos el segundo en predios agrícolas [S7]. Esas parcelas eran experimentales con cultivos regenerativos, así que no son la estructura de un soyero común; sirven solo para mostrar la forma del desglose (semilla, agroquímicos, maquinaria, mano de obra).

### 2.2 Flujo de caja desfasado y capital de trabajo

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Flujo mensual de la campaña** | Cobros del mes - gastos del mes (costos al ritmo de las labores: preparación, siembra, aplicaciones, cosecha) | Interpretación mía. [S1] da el presupuesto anual, no mensual |
| **Necesidad máxima de financiamiento** | Mínimo del flujo acumulado de la campaña, en valor absoluto | Interpretación mía |
| **Meses de exposición** | Meses entre el primer desembolso y el cobro de la cosecha | Interpretación mía |
| **Costo financiero de la campaña** | Saldo promedio del crédito x tasa anual x meses / 12 | de memoria |
| **Cobertura de la cuota de campaña** | Caja disponible al cobrar / (capital + intereses a pagar) | de memoria (versión simplificada del índice de cobertura de deuda) |
| **Días de grano almacenado** | Stock almacenado / venta diaria planeada | de memoria |

Por qué importa: el BID explica que, ante la pérdida del capital de trabajo del que depende el ciclo productivo, el productor suele recurrir a endeudamiento y que el acceso a financiamiento es restringido en el sector rural [S4]. En la sequía de 2023-2024, ANAPO calculó que cerca de 6.000 familias soyeras no podían cumplir sus obligaciones con bancos, proveedores de insumos y agroindustrias [S9].

### 2.3 Riesgo climático y seguro

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Siniestralidad del seguro agrario (por municipio y campaña)** | Superficie afectada significativamente (indemnizable) / superficie total registrada | [S3], descripción literal del cálculo |
| **Pérdida de producción por clima** | (Producción esperada - producción obtenida) / producción esperada | de memoria |
| **Indemnización** | Hectáreas severamente afectadas x monto por ha (en la modalidad Pirwa: Bs 1.000 por ha, hasta 3 ha) | [S3] |
| **Riesgo de base (basis risk) de un seguro indexado** | Diferencia entre la pérdida real del productor y el pago que dispara el índice; puede haber pérdida sin pago o pago sin pérdida | [S2], definición literal en sentido |

Datos de [S3] de las primeras campañas de la modalidad Pirwa (agricultura familiar de municipios pobres): siniestralidad general cercana a 9% en 2012-2013 y 11% en 2013-2014, con municipios sobre 50%; en la primera campaña se aseguraron 91.226 ha, más de 18.000 se reportaron afectadas, unas 8.400 se comprobaron dañadas y se pagaron Bs 7,6 millones a 7.141 familias.

### 2.4 Indicadores por rubro (de memoria, no verificados en fuente abierta)

| Rubro | Indicador | Fórmula |
|---|---|---|
| Avicultura | Conversión alimenticia | Kg de alimento consumido / kg de peso vivo ganado |
| Avicultura y ganadería | Mortalidad | Animales muertos / animales iniciales |
| Ganadería de engorde | Ganancia diaria de peso y costo por kg ganado | Kg ganados / días; costo de alimentación y sanidad / kg ganados |
| Lechería | Margen por litro | Precio pagado por el acopiador - costo por litro (incluye alimento, mano de obra, sanidad) |
| Piscicultura | Sobrevivencia y costo por kg de pescado | Peces cosechados / sembrados; costos del ciclo / kg cosechados |
| Cultivos perennes (café, cacao) | Años a primera cosecha plena y vida útil | Datos agronómicos del cultivo; entran al horizonte del VAN |

Un dato de la industria avícola boliviana que vi solo en un resumen de búsqueda (no abrí la fuente): el alimento pesaría entre 60% y 70% del costo de producción de pollo. Lo trato como no confirmado (sección 9).

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Lo que dice [S1]:** el manual de la Farm Management Handbook trabaja con presupuestos por actividad "hasta el margen bruto" y avisa que los costos fijos de cada negocio deben sumarse aparte para armar un presupuesto de la empresa. También advierte que los márgenes son *indicativos*, que deben adaptarse a las diferencias físicas y de precios locales, y que "se supone que la actividad está en estado estable" (por ejemplo, el mismo tamaño de hato al inicio y al fin del año).

**Mi interpretación para SIMPRO:**

1. **El VAN y la TIR siguen sirviendo, pero con un flujo mensual, no anual.** Si el flujo se promedia por año, un proyecto que necesita financiar 8 meses de gasto antes de cobrar parece más sano de lo que es. La necesidad máxima de financiamiento y los meses de exposición (sección 2.2) son lo primero que debe ver el alumno.
2. **El margen bruto por ha complementa al VAN para decidir entre cultivos y escalas.** Es la herramienta para comparar soya contra maíz o sorgo, pero no dice si la finca sobrevive (faltan costos fijos e intereses) [S1].
3. **El punto de equilibrio se expresa en rendimiento y precio, no en unidades vendidas.** Lo que el productor no controla es el rendimiento (clima) y el precio (mercado). Dos líneas de equilibrio dan una lectura más útil que una sola.
4. **El VAN esperado tiene que ponderar escenarios.** Un año seco, un año normal, un año bueno, con probabilidades. En [S3], la siniestralidad promedio de los municipios asegurados fue de 9% a 11% en las primeras campañas, pero con municipios sobre 50%: el promedio esconde la cola. Usar solo el año promedio sobreestima.
5. **La TIR puede engañar** cuando el proyecto tiene una sola campaña (no hay flujos intermedios) o cuando hay flujos negativos después de los positivos (años de renovación de una plantación). Para perennes (café, cacao) conviene un horizonte largo con años de inversión sin cosecha. El estudio de Bazoberry sobre sistemas agroforestales incluye un gráfico de flujo de beneficios de 3 ha de sistema agroforestal entre 2007 y 2021, con valores negativos al inicio, pero no pude leer los valores del gráfico [S6].
6. **El costo de oportunidad de la tierra y del trabajo familiar** debe entrar como costo. Si no, un pequeño productor siempre "gana" aunque pague por trabajar (interpretación mía).
7. **El capital de trabajo es parte de la inversión.** El crédito de campaña y el tamaño de la línea de crédito definen cuánta superficie se puede sembrar, no solo el costo (interpretación mía).

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Estos errores son interpretación mía a partir del material leído; no encontré una fuente que los catalogue para Bolivia.

**Estudiantes**
- Tomar un año de rendimiento y precio promedio y calcular un VAN positivo sin escenarios. Los datos muestran lo contrario: la soya de verano tuvo caídas de producción de 37,79% en 2007/2008 [S5] y de casi la mitad en 2024 (de 5,9 a 3 millones de toneladas en todos los granos, según ANAPO [S10]).
- Distribuir el costo parejo en 12 meses en vez de ponerlo cuando se gasta.
- Olvidar el capital de trabajo (los meses sin ingreso) o no cobrar intereses por él.
- Confundir margen bruto con utilidad [S1].
- Ignorar mermas: poscosecha, transporte, mortalidad, pesos en pie versus pesos faenados.
- Suponer que el precio al productor es el precio del mercado final; olvidar intermediarios, flete y calidad.
- No incluir el costo de comprar dólares o la brecha cambiaria para insumos importados [S10, S16].

**Emprendedores**
- Sembrar con deuda de cuota fija mensual cuando el ingreso llega una vez al año.
- Apostar a un solo cultivo o un solo comprador. La quinua pasó de casi US$ 6.600/t en 2014 a unos US$ 2.072/t [S11]; la producción cayó casi 50% entre 2013 y 2021 mientras Perú duplicó la suya [S11].
- Cosechar sin tener asegurado dónde almacenar o a quién vender. Productores de leche vieron recortado a la mitad el acopio de la industria [S13]; el pescado del trópico de Cochabamba perdió precio por sobreoferta [S16].
- Expandir sobre tierra sin saneamiento o con conflicto de títulos [S18, S19].
- Suponer que una política pública (precio, exportación, insumo subvencionado) seguirá igual. En 2022 y 2025 hubo suspensiones de exportación [S14, S15] (la de 2022 la vi solo en resúmenes de búsqueda; ver sección 9).
- No pensar en el seguro. El seguro agrario estatal de Bolivia (Pirwa) apunta a agricultura familiar de municipios pobres, hasta 3 ha [S3]; un productor comercial no debería asumir que lo cubre.

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (dirección y magnitud; **[Sn]** si viene de fuente, **(estimación)** si es mía); decisiones posibles con ventajas y costos; qué aprende el alumno.

Las magnitudes de las fuentes vienen de contextos concretos (cultivo, año, zona). Las marcadas "estimación" conviene calibrarlas antes de implementarlas (sección 10). Las decisiones intentan no tener una opción obviamente correcta: cada una gana algo y cuesta algo.

---

### Situación 1. Sequía en plena siembra de verano

**Qué pasa.** Las lluvias llegan tarde y de forma esporádica; se siembra tarde y el cultivo no desarrolla bien. En la campaña de verano 2023-2024, Bolivia vivió una de las sequías más fuertes en 30 años; ANAPO estimó 800.000 toneladas menos de soya y los reportes oficiales citaron 205.000 ha de soya afectadas [S8, S9]. Rendimientos de 800 y 900 kg/ha en Pailón y Cuatro Cañadas no cubrían costos [S9].

**Variables que mueve.**
- Rendimiento por ha: baja fuerte (en 2024, a 800-900 kg/ha en zonas puntuales, contra un historial de 1,5 a 2,4 t/ha de verano [S9, S5]; en el simulador, un rango de -40% a -70% en un año seco severo, estimación).
- Costo por ha: casi no baja (ya se gastó).
- Ingreso de la campaña: baja en la misma proporción o más.
- Liquidez y capacidad de pago: caen; ANAPO habló de unas 6.000 familias que no cumplían obligaciones [S9].
- Reputación y acceso a crédito: bajan si hay mora (estimación).

**Decisiones del alumno.**
1. *Sembrar igual, tarde, con todo el paquete.* Ventaja: si llueve, se recupera el calendario. Costo: si no llueve, se pierde todo el gasto; hay que financiarlo.
2. *Sembrar solo parte de la superficie y reservar caja.* Ventaja: limita la pérdida máxima. Costo: ingreso total menor aun en un buen año, y costos fijos (maquinaria, personal) repartidos en menos hectáreas.
3. *Cambiar a un cultivo de ciclo más corto o menos exigente en agua.* Ventaja: menor exposición. Costo: otro paquete tecnológico, maquinaria y mercado distintos; margen por ha por lo general menor (estimación).
4. *Pedir reprogramar la deuda antes de cosechar.* Ventaja: alivia la cuota. Costo: más intereses y desgaste con el acreedor; ANAPO propuso reprogramar y un fondo de reactivación a 5 años, pero no vi que se aprobara [S9].

**Qué aprende.** Que el rendimiento es una variable aleatoria y que el calendario (siembra tardía) pesa tanto como la lluvia total; y que un buen plan decide cuánta superficie arriesgar según la caja de reserva.

---

### Situación 2. Helada, granizada o inundación y el seguro agrario

**Qué pasa.** Un evento localizado destruye parte del cultivo. Bolivia tiene el Seguro Agrario Universal Pachamama; su primera modalidad, Pirwa, protege gratuitamente hasta 3 ha por familia contra sequía, helada, granizada e inundación, y paga Bs 1.000 por ha severamente afectada (7 cultivos al 2015, 9 al 2017); está dirigida a agricultura familiar de municipios pobres [S3]. En la campaña 2012-2013 la siniestralidad general fue cercana a 9% y 10 municipios superaron 25% [S3]. En 2014 el BID aprobó una cooperación técnica de US$ 600.000 para ampliar el seguro y diseñar nuevas pólizas [S4].

**Variables que mueve.**
- Rendimiento y cosecha en la parcela afectada: baja (magnitud específica del evento; estimación: pérdida de 30% a 100% de la parcela).
- Ingreso: baja; si hay seguro, entra una indemnización fija por ha (Bs 1.000/ha en Pirwa, hasta 3 ha [S3]), que es menor al costo de producción de la mayoría de los cultivos comerciales (estimación; ver sección 10).
- Reputación del proyecto con el comprador: baja si no entrega volumen comprometido (estimación).

**Decisiones del alumno.**
1. *Inscribirse en el seguro estatal cuando corresponda.* Ventaja: no cuesta prima. Costo: solo cubre hasta 3 ha, ciertos cultivos y municipios, y una suma fija que puede ser menor a la pérdida; no es para quien produce a escala comercial [S3].
2. *Comprar una póliza comercial (si existe para su cultivo y zona).* Ventaja: cubre más y mejor. Costo: la prima; en mi búsqueda no confirmé qué pólizas privadas de cultivos hay hoy en Bolivia (sección 9). En un seguro indexado queda el riesgo de base: pérdida sin pago o pago sin pérdida [S2].
3. *Diversificar parcelas y cultivos (distintos micro-climas y fechas de siembra).* Ventaja: un evento local no destruye todo. Costo: menor especialización, más manejo, menor escala por cultivo.
4. *Asumir el riesgo y mantener un fondo de contingencia.* Ventaja: sin primas. Costo: inmoviliza caja que también se necesita para la próxima campaña.

**Qué aprende.** Que el seguro transfiere solo un tipo de riesgo (el clima), tiene límites y costo, y que el riesgo de base puede dejar al productor sin pago aunque perdió. Que la diversificación es una forma de seguro sin prima.

---

### Situación 3. Cae el precio internacional

**Qué pasa.** El precio del producto de exportación cae por sobreoferta mundial. La quinua boliviana llegó a US$ 6.602 por tonelada en 2014 y bajó a unos US$ 2.072; más de 100 países ya la producen (antes eran unos 20) [S11, S12]. Bolivia pasó de 68.000 t en 2013 a unas 39.000 t en 2021, mientras Perú pasó de 52.000 a 106.000 t [S11]. En el primer trimestre de 2024 el precio se recuperó 48,2% respecto a 2023 hasta US$ 2.902/t según una nota del portal eju.tv que vi solo en un resumen de búsqueda (no la abrí; no la uso como dato firme).

**Variables que mueve.**
- Precio de venta: baja fuerte (en la quinua, casi dos tercios entre 2014 y 2021 [S11]; en el simulador, -30% a -60% por una caída de ciclo, estimación).
- Ingreso: baja en la misma proporción si no hay compensación de volumen.
- Superficie futura sembrada: baja con rezago (el productor reacciona en la siguiente campaña) (estimación).
- Costo por ha: no cambia (rige el calendario).

**Decisiones del alumno.**
1. *Vender toda la cosecha ahora al precio bajo.* Ventaja: cobra y paga deudas. Costo: realiza la pérdida.
2. *Guardar la cosecha esperando que suba.* Ventaja: puede captar una recuperación. Costo: costo de almacenamiento, riesgo de plagas y merma, caja inmovilizada y cuotas por pagar; [S11] reporta que muchos productores guardan su cosecha esperando precios más altos, sin garantía de que suba.
3. *Buscar comprador directo (venta por internet, marca propia, producto semi-industrial).* Ventaja: salta intermediarios y gana margen. Costo: requiere tiempo, calidad certificada y escala que un productor solo no tiene; [S11] menciona una comunidad que intenta una plataforma de venta directa y una marca propia.
4. *Cambiar parte de la superficie a otro cultivo.* Ventaja: diversifica. Costo: curva de aprendizaje, y quizá el suelo o el clima del lugar no permiten alternativas (el altiplano sur tiene pocas opciones; interpretación mía).

**Qué aprende.** Que el precio de un commodity es del mercado mundial (en la soya, el precio local sigue de cerca el de Chicago: Bolivia es "tomador de precios" [S5]); que un boom atrae competencia; y que el valor agregado y la venta directa son defensas con costo y plazo.

---

### Situación 4. El Estado suspende las exportaciones

**Qué pasa.** Para bajar el precio interno, el Gobierno suspende exportar un producto. En febrero de 2025 se suspendió la exportación de carne bovina "hasta que se regularice el abastecimiento y se reduzca el precio en el mercado interno" al no emitirse certificados de abastecimiento interno a precio justo [S14]. La Cámara de Exportadores estimó pérdidas de US$ 500.000 diarios y riesgo para más de US$ 200 millones anuales; las exportaciones de carne fueron US$ 185 millones en 2024 [S15]. En algunos mercados el precio interno llegó a Bs 65/kg [S15]. (En octubre de 2022 también se suspendieron soya, aceite, azúcar y carne durante un paro; lo vi solo en resúmenes de búsqueda.)

**Variables que mueve.**
- Precio recibido: baja, porque el producto debe venderse en el mercado interno (magnitud: -10% a -40% frente al precio de exportación, estimación).
- Volumen vendible: se limita al mercado interno.
- Costo de mantener el ganado o producto sin vender: sube (alimento, almacenamiento) (estimación).
- Acceso a mercados externos: se pierde parcialmente; [S15] menciona el riesgo de perder mercados como China.

**Decisiones del alumno.**
1. *Vender todo en el mercado interno al precio bajo.* Ventaja: cobra de inmediato y no corre riesgo adicional. Costo: menor margen; presiona aún más el precio local con la oferta adicional (estimación).
2. *Retener el producto esperando que se levante la restricción.* Ventaja: puede recuperar el precio de exportación. Costo: en ganadería, costo de mantener animales, riesgo de pérdida de peso o calidad, y si la restricción dura, la caja se acaba.
3. *Presionar con el gremio para negociar.* Ventaja: puede reabrir el acceso. Costo: tiempo y resultado incierto; no depende solo de ti.
4. *Orientarse al mercado interno a largo plazo (faena propia, venta directa).* Ventaja: menos dependencia de la política de exportación. Costo: inversión y menor precio base en el mercado interno.

**Qué aprende.** Que el riesgo regulatorio es real en Bolivia y puede sacar un mercado de un día para otro; que depender de una sola salida es frágil.

---

### Situación 5. Crédito de campaña: cuota que no coincide con la cosecha

**Qué pasa.** El productor pidió prestado para sembrar. Si la cuota es mensual o trimestral y el ingreso es anual, hay meses en que la caja sale sin que entre nada. Al primer semestre de 2018, la cartera de crédito productivo en Bolivia llegaba a Bs 68.986 millones, el 42,9% del total [S20]. Luego de una mala campaña, ANAPO pidió reprogramar créditos y un fondo para reestructurar el capital de trabajo a 5 años [S9]; las pérdidas redujeron la liquidez para pagar [S10]. (La tasa máxima regulada para crédito productivo la vi solo en un resumen de búsqueda de 2015: micro 11,5%, pequeña 7%, mediana y grande 6%; no la uso como dato firme.)

**Variables que mueve.**
- Deuda de campaña y cuota mensual: se fijan al contratar.
- Caja entre siembra y cosecha: se vuelve negativa si la cuota es mensual (cálculo mío con el flujo desfasado).
- Costo financiero: sube con cada mes de exposición.
- Mora y reputación crediticia: suben si no se paga a tiempo (estimación).

**Decisiones del alumno.**
1. *Crédito con cuota única en la cosecha (o cuotas solo después).* Ventaja: la deuda sigue el flujo real. Costo: tasa o garantía por lo general mayores; no siempre está disponible (estimación; sección 10).
2. *Crédito de cuotas mensuales más barato.* Ventaja: tasa menor. Costo: hay que financiar la cuota con otra caja durante los meses de gasto; una mala campaña lleva a mora.
3. *Financiar con proveedores de insumos o con anticipo del comprador.* Ventaja: menos deuda bancaria. Costo: recargo implícito en el precio de insumos o descuento en el precio de venta, y dependencia de ese proveedor o comprador.
4. *Reducir la superficie para no depender de deuda.* Ventaja: menor riesgo. Costo: menor escala, menor ingreso potencial.

**Qué aprende.** Que el calendario de pagos debe calzar con el calendario de cobros, y que el costo de la deuda no es solo la tasa sino el *desajuste* entre cuota e ingreso.

---

### Situación 6. Sube el precio de los insumos por falta de dólares

**Qué pasa.** Semilla, fertilizante, agroquímicos y repuestos importados suben. ANAPO señaló aumentos de hasta 60% en insumos como consecuencia de la falta de dólares y la inflación [S10]. En piscicultura del trópico de Cochabamba los insumos subieron más de 15% por la misma causa [S16].

**Variables que mueve.**
- Costo variable por ha: sube (15% a 60% según el insumo y el rubro [S10, S16]).
- Margen bruto por ha: baja si el precio de venta no sube.
- Disponibilidad de insumo: baja a veces (estimación).
- Necesidad de capital de trabajo: sube.

**Decisiones del alumno.**
1. *Comprar todos los insumos al inicio de la campaña.* Ventaja: fija el costo antes de otra alza. Costo: caja inmovilizada, más deuda y riesgo de uso inadecuado o vencimiento.
2. *Reducir dosis o sustituir por insumos más baratos o locales.* Ventaja: menor gasto. Costo: riesgo de menor rendimiento o más plagas.
3. *Pasar a prácticas que usan menos insumo externo (abono verde, rotación).* Ventaja: menor dependencia del dólar. Costo: transición, posible menor rendimiento al principio; el estudio PRIAS de costos recoge costos de entre USD 178 y 607 por ha en parcelas regenerativas contra USD 396 en parcelas testigo de soya, con alta variabilidad y sin resultados de rendimiento todavía [S7].
4. *Comprar en grupo con otros productores o por cooperativa.* Ventaja: poder de negociación. Costo: coordinación y plazos.

**Qué aprende.** Que el costo variable tiene componente importado, que lo expone al tipo de cambio, y que la solución barata en caja (recortar dosis) puede ser cara en rendimiento.

---

### Situación 7. Falta de diésel en siembra o cosecha

**Qué pasa.** La maquinaria agrícola y el transporte dependen del diésel. En marzo de 2025, el presidente electo de la CAO dijo que el sector necesita 1,5 millones de litros diarios y que, de no llegar a tiempo, parte de la cosecha de soya se perdería; también dijo que por falta de combustible algunas zonas sembraron tarde en la campaña de verano [S18]. Es la afirmación de un dirigente gremial, no una cifra oficial.

**Variables que mueve.**
- Fecha de siembra y de cosecha: se retrasan (semanas; estimación).
- Rendimiento: baja por siembra tardía o por pérdida en cosecha tardía (estimación: -5% a -25%).
- Costo de combustible: sube si se compra en el mercado paralelo (estimación).
- Costo de maquinaria parada: sube.

**Decisiones del alumno.**
1. *Comprar combustible a sobreprecio en el mercado paralelo.* Ventaja: cumple el calendario. Costo: costo adicional y posible riesgo legal o de calidad (estimación).
2. *Postergar labores hasta que haya diésel.* Ventaja: no paga sobreprecio. Costo: pierde rendimiento por calendario y arriesga el clima de la cosecha.
3. *Contratar servicios de maquinaria a terceros.* Ventaja: no depende de su propio abastecimiento. Costo: pagar más y depender de la disponibilidad del contratista.
4. *Invertir en almacenar combustible (tanques) cuando haya.* Ventaja: seguridad de suministro. Costo: capital inmovilizado y regulación.

**Qué aprende.** Que el calendario agrícola es rígido y que la logística (combustible) vale tanto como el insumo.

---

### Situación 8. Bloqueo o falla del transporte con producto perecible

**Qué pasa.** Un bloqueo, un frente frío o escasez de combustible encarecen o impiden sacar el producto. En el trópico de Cochabamba, el flete refrigerado del pescado pasó de Bs 1 a Bs 2 o Bs 2,50 por kilo (+100% a +150%), y la falta de combustible complica oxigenar las piscinas [S16]. Un pez que no sale a tiempo sigue consumiendo alimento o se pierde.

**Variables que mueve.**
- Costo de transporte: sube (+100% a +150% en el caso citado [S16]).
- Merma o pérdida de producto: sube (estimación: 5% a 30% del lote si el bloqueo dura días).
- Precio de venta: puede subir en destino por escasez o bajar por urgencia de vender (estimación).
- Costo de mantener el lote vivo o refrigerado: sube.

**Decisiones del alumno.**
1. *Pagar el flete caro y entregar.* Ventaja: cumple con el comprador. Costo: margen casi nulo o negativo.
2. *Esperar y mantener el lote.* Ventaja: no paga flete caro. Costo: más alimento, riesgo de mortalidad y de perder la ventana de venta.
3. *Vender en el mercado local a menor precio.* Ventaja: cobra rápido. Costo: precio menor y saturación del mercado cercano.
4. *Procesar (congelar, filetear, secar) para guardar.* Ventaja: alarga la vida del producto. Costo: inversión en equipo y frío, y más costos operativos.

**Qué aprende.** Que en producto perecible el tiempo cuesta dinero y que la cadena de frío y el transporte son parte del proyecto.

---

### Situación 9. La industria recorta el cupo de acopio de la leche

**Qué pasa.** Un solo comprador grande fija precio y cupo. En septiembre de 2016, PIL recortó a la mitad el acopio en Cochabamba; el acuerdo posterior fijó 323.000 litros diarios a Bs 3,10 (accionistas) y Bs 2,70 (no accionistas) frente a Bs 3,70 antes, y Bs 1,40 por el excedente; los productores sostenían que el costo real era Bs 3,99 por litro [S13]. Las causas citadas: caída de precios internacionales, mercado interno insuficiente y contrabando [S13].

**Variables que mueve.**
- Volumen vendido a la industria: baja (cupo).
- Precio recibido: baja en el cupo y mucho más en el excedente (-62% en el caso citado, de Bs 3,70 a Bs 1,40 [S13]).
- Margen por litro: puede ser negativo (Bs 2,70 pagado contra Bs 3,99 de costo [S13]).
- Leche sin destino: sube.

**Decisiones del alumno.**
1. *Aceptar el cupo y vender el excedente a precio bajo.* Ventaja: mantiene la relación con la industria. Costo: pierde dinero en el excedente.
2. *Procesar el excedente (queso, yogur) y vender directo.* Ventaja: mejor precio por litro. Costo: inversión, permisos sanitarios, mano de obra y canal de venta nuevo.
3. *Reducir el hato.* Ventaja: baja el costo de alimentación. Costo: se pierde capacidad productiva que cuesta años recuperar.
4. *Organizarse con otros productores para negociar o para tener acopio propio.* Ventaja: más poder. Costo: tiempo, conflicto (en 2016 hubo bloqueos y toma de la planta [S13 y otros]) y capital.

**Qué aprende.** Que depender de un comprador dominante es un riesgo de negociación; que el excedente tiene un precio de liquidación; y que el hato es un activo que no se ajusta rápido.

---

### Situación 10. Sube el maíz y se encarece el pollo (avicultura)

**Qué pasa.** El maíz y la soya son la base del alimento balanceado. Si falta maíz (por sequía, por restricción de exportación o por problemas de abastecimiento), el costo por kilo de pollo sube y puede no poder trasladarse al precio. El presidente electo de la CAO dijo en 2025 que el país es deficitario en 700.000 toneladas de maíz por año y que en 2011 se prohibió exportar maíz cuando había excedente [S18]. Resúmenes de búsqueda (fuentes no abiertas) hablan de alza del quintal de maíz de Bs 70 a Bs 105 en tres meses en un caso de 2021-2022 y de un peso del alimento de 60% a 70% del costo; los trato como no confirmados.

**Variables que mueve.**
- Costo del alimento por kg de pollo: sube (con un peso de alimento en el costo de 60% a 70% (no confirmado), un alza de 20% en el maíz mueve el costo total unos 6% a 10%, estimación).
- Precio del pollo: no siempre sube; puede bajar por sobreoferta (un resumen de 2017 habla de Bs 10/kg por sobreoferta; no confirmado).
- Mortalidad: sube con calor, enfermedad o mala calidad de alimento (estimación).
- Margen por lote: baja.

**Decisiones del alumno.**
1. *Trasladar el alza al precio.* Ventaja: protege el margen. Costo: pierde ventas ante competidores más grandes o ante importación.
2. *Formular con insumos alternativos (sorgo, subproductos).* Ventaja: menor costo. Costo: puede bajar la conversión alimenticia y el peso final.
3. *Reducir el tamaño de los lotes.* Ventaja: menor exposición. Costo: costos fijos de galpón y personal repartidos en menos aves.
4. *Integrarse (producir parte del grano) o contratar compra anticipada de maíz.* Ventaja: estabilidad del costo. Costo: capital, tierra y riesgo de precio si el grano baja.

**Qué aprende.** Que el costo de alimento es el costo dominante en avicultura y que una cadena integrada protege pero exige más capital y diversifica el riesgo de clima.

---

### Situación 11. Riesgo sanitario animal y oportunidad de mercado

**Qué pasa.** La sanidad animal abre o cierra mercados. Bolivia no ha tenido un brote de fiebre aftosa desde 2007 en Santa Cruz (843 semanas sin la enfermedad a mayo de 2023), y trabajaba para ser reconocida como libre sin vacunación en todo el territorio, lo que habilitaría mercados más exigentes como Europa; ya exportaba carne bovina a China [S17]. Un brote podría cerrar mercados; la duración depende del evento (no pude confirmar casos históricos). Es a la vez riesgo y oportunidad.

**Variables que mueve.**
- Acceso a mercados de exportación: sube con el estatus sanitario; cae a cero en un brote (estimación: cierre de 1 a 6 meses).
- Precio del ganado: sube con mercados premium (+5% a +20%, estimación) y cae en un brote local.
- Costo sanitario: sube (vacunación, trazabilidad, controles).

**Decisiones del alumno.**
1. *Invertir en trazabilidad y sanidad para calificar a mercados exigentes.* Ventaja: mejor precio y acceso. Costo: inversión inicial y registros; el retorno depende de que el mercado se abra.
2. *Vender solo al mercado interno, sin la inversión.* Ventaja: sin costo extra. Costo: precio menor y más expuesto a la política de exportación (ver situación 4).
3. *Asociarse con un frigorífico exportador.* Ventaja: acceso sin montar todo. Costo: depende del frigorífico y de su precio.
4. *Mantener un colchón de caja por si hay un cierre sanitario.* Ventaja: resiste un cierre temporal. Costo: dinero parado.

**Qué aprende.** Que la sanidad es un activo del proyecto: cuesta mantenerla y da acceso; que un solo foco puede cerrar mercados enteros.

---

### Situación 12. Plaga o enfermedad del cultivo perenne (roya del café)

**Qué pasa.** Una plaga debilita la planta y baja la producción por varias campañas. Una nota de 2017 atribuye la caída de exportaciones de café boliviano a tres factores: plagas como la roya y el ojo de gallo, plantaciones envejecidas que requieren renovación, y clima adverso; el 95% de los productores está en La Paz, principalmente Caranavi (lo vi en un resumen de búsqueda; no abrí la nota). Un estudio de la UMSA evaluó la roya y dosis de caldo bordelés en Caranavi (resumen de búsqueda, no abierto). Los cultivos perennes (café, cacao) tienen años de inversión sin cosecha, así que una plaga o una poda de rehabilitación lleva años de ingreso reducido.

**Variables que mueve.**
- Rendimiento: baja (estimación: -20% a -60% en un año de brote fuerte, y recuperación lenta).
- Costo de control (fungicidas, mano de obra de poda): sube.
- Vida útil de la plantación: se acorta si no se renueva.
- Ingreso de varios años: baja.

**Decisiones del alumno.**
1. *Aplicar control químico u orgánico (caldo bordelés, fungicidas).* Ventaja: salva parte de la cosecha. Costo: mano de obra y insumos; en un cultivo orgánico certificado limita las opciones.
2. *Podar y renovar con variedades más resistentes.* Ventaja: recupera productividad a mediano plazo. Costo: años de producción reducida o nula, y capital para plantines.
3. *Complementar con otros cultivos en la misma finca.* Ventaja: ingresos mientras se recupera el café. Costo: otro manejo y menos foco.
4. *Abandonar o reducir el cultivo.* Ventaja: deja de gastar. Costo: pierde la inversión hecha y la capacidad productiva.

**Qué aprende.** Que en cultivos perennes la plaga se paga durante años, y que renovar cuesta una producción hoy a cambio de productividad mañana (efecto en el VAN a horizonte largo).

---

### Situación 13. Conflicto de tierra: avasallamiento y falta de seguridad jurídica

**Qué pasa.** La tierra es el activo central y su titularidad puede ser cuestionada. El director del INRA dijo en julio de 2024 que 93% de la tierra está saneada y titulada y falta 7%, y que una vez saneada el INRA ya no es competente en avasallamientos (ocupaciones ilegales): le corresponde a la justicia agroambiental [S19]. En marzo de 2025 el presidente electo de la CAO sostuvo que el principal problema del sector es la falta de seguridad jurídica y que se entregaron "ocho títulos de mediana y gran propiedad, todos comunitarios" en cuatro años de gobierno [S18]. Son afirmaciones de funcionarios y gremios, no verificadas por mí.

**Variables que mueve.**
- Superficie utilizable: baja si se pierde la posesión.
- Inversión en el predio (mejoras, siembra): pierde valor si se pierde la tierra.
- Costo legal y de seguridad: sube.
- Acceso a crédito con garantía de la tierra: baja si el título es dudoso (estimación).

**Decisiones del alumno.**
1. *Invertir fuerte en el predio aunque el saneamiento esté pendiente.* Ventaja: produce más ya. Costo: si hay conflicto, se pierde la inversión.
2. *Frenar inversiones hasta tener título.* Ventaja: protege el capital. Costo: se pierden campañas de producción mientras se espera.
3. *Contratar seguridad privada y asesoría legal.* Ventaja: reduce el riesgo de ocupación. Costo: gasto fijo permanente; no sustituye la protección legal.
4. *Alquilar o asociarse en tierra ya titulada.* Ventaja: seguridad jurídica. Costo: renta que reduce el margen, y no se acumula patrimonio.

**Qué aprende.** Que la tenencia de la tierra es un riesgo del proyecto y no un supuesto; que sin título se puede producir pero cuesta asegurar el capital invertido.

---

### Situación 14. Contrabando e importación que bajan el precio

**Qué pasa.** Producto ingresado por contrabando o importado a menor precio presiona el precio del productor local. En el trópico de Cochabamba, los piscicultores denunciaron la entrada de pescado importado o de contrabando y que el Estado dejó de comprarles pescado en mayo (2024) [S16]. En la lechería, la industria mencionó el contrabando como una de las causas del conflicto de 2016 [S13]. No encontré cifras del volumen contrabandeado por rubro.

**Variables que mueve.**
- Precio de venta: baja (estimación: -5% a -25%).
- Volumen vendible: baja si el comprador sustituye.
- Presión competitiva: sube.
- Costo de diferenciarse (certificación, marca): sube.

**Decisiones del alumno.**
1. *Bajar el precio para competir.* Ventaja: conserva volumen. Costo: margen mínimo o negativo.
2. *Diferenciarse (origen, calidad, frescura, certificación, trazabilidad).* Ventaja: se justifica un precio mayor. Costo: inversión, tiempo; no todos los compradores pagan la diferencia.
3. *Cambiar de canal (venta directa, restaurantes, exportación).* Ventaja: menos expuesto al precio de mayoristas. Costo: logística y capital de trabajo.
4. *Reducir la producción.* Ventaja: menor pérdida. Costo: se subutiliza la inversión (estanques, galpones, hato).

**Qué aprende.** Que los precios locales de bienes agrícolas dependen de la frontera, y que el costo de producción no fija el precio de venta.

---

### Situación 15. Oportunidad: la cooperativa o asociación de productores

**Qué pasa.** Entrar en una organización de productores puede dar acopio, procesamiento, certificación y mercados que uno solo no consigue. La cooperativa El Ceibo (Alto Beni, fundada en 1977) llegó a exportar entre 300 y 360 toneladas de cacao al año, con unas 800 familias socias en 2008 [S6]. Pero el mismo estudio señala una tensión entre la cooperativa y el entorno no cooperativizado: fluctuación del acopio, malestar con el sistema cooperativo y competencia de sistemas paralelos [S6]. Los productores de cacao suelen combinarlo con otros cultivos (pluriactividad) [S6].

**Variables que mueve.**
- Precio recibido: sube con valor agregado y certificación (estimación: +10% a +40%); en El Ceibo, el estudio no da precios por kilo.
- Ingreso estable: sube (acopio, pago más predecible).
- Liquidez inmediata: puede bajar si la cooperativa paga con rezago (estimación).
- Autonomía de decisión: baja (reglas y calidad exigida).

**Decisiones del alumno.**
1. *Entregar toda la cosecha a la cooperativa.* Ventaja: acceso a mercado, asistencia técnica, precio más estable. Costo: depende de su gestión; se cobra a su ritmo y se acatan sus normas.
2. *Entregar una parte y vender el resto al intermediario cuando paga mejor.* Ventaja: liquidez y flexibilidad. Costo: la cooperativa puede perder volumen y exigir lealtad; el precio del intermediario puede caer al año siguiente.
3. *Vender siempre a intermediarios.* Ventaja: pago inmediato, sin trámites. Costo: menor precio promedio y sin poder de negociación.
4. *Armar una asociación propia con vecinos.* Ventaja: mantiene control y puede crecer. Costo: años de organización, gestión y capital antes de ver resultado.

**Qué aprende.** Que la organización es un activo con costo (tiempo, reglas, cuotas) y que el productor aislado suele recibir el precio más bajo de la cadena (interpretación mía).

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

Nombres tentativos (los nombres reales los define el equipo de desarrollo). Cada variable se actualiza una vez por mes.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| **Calendario de campaña (fase)** | Preparación, siembra, desarrollo, cosecha, poscosecha o venta | Avanza según el mes de siembra elegido; define qué costos se pagan y cuándo se cobra |
| **Superficie sembrada (o cabezas/lote)** | Tamaño de la apuesta | La fija el alumno al inicio de campaña; puede cambiar solo al comienzo de la siguiente |
| **Rendimiento esperado** | Lo que se espera cosechar por ha | Base del cultivo x factor de clima x factor de manejo x factor de sanidad; se actualiza mes a mes con la fase |
| **Factor de clima** | Efecto de lluvia, helada, granizada, inundación | Evento aleatorio por fase; multiplica el rendimiento (por ejemplo 1,0 normal; 0,4 en sequía severa) |
| **Costo de campaña acumulado** | Lo gastado hasta ahora | Se suma cada mes según la labor de la fase (semilla, aplicaciones, cosecha) |
| **Precio de referencia y precio recibido** | Precio de mercado y el que cobra el productor | Referencia sigue un proceso con ciclos y shocks; recibido = referencia - descuento de intermediario o flete + premio por calidad o certificación |
| **Cupo o acceso de venta** | Límite de lo que el comprador recibe | Fijo por contrato o variable por evento (recorte de acopio, cierre de exportación) |
| **Stock almacenado** | Cosecha guardada sin vender | Stock = stock anterior + cosecha - ventas - merma; la merma depende de días y del tipo de producto |
| **Merma o mortalidad (%)** | Pérdida de producto o animales | Tasa base por rubro x factor de manejo x factor de eventos (frío, plaga, bloqueo) |
| **Deuda de campaña y cuota** | Crédito tomado y lo que debe pagar | Saldo + intereses - pagos; la cuota sigue el calendario de pago elegido (mensual o a cosecha) |
| **Cobertura de seguro** | Si hay póliza y qué cubre | Si existe, cuando el evento supera un umbral paga un monto fijo por ha, con riesgo de base (puede no pagar aunque haya pérdida) |
| **Índice sanitario** | Estado de plagas o enfermedad | Sube con medidas preventivas; baja con eventos; reduce rendimiento o abre/cierra mercados |
| **Estado de tenencia** | Titulada, en saneamiento, en conflicto | Cambia por eventos; afecta acceso a crédito, inversión y riesgo de pérdida de superficie |
| **Disponibilidad de insumos y combustible** | Si se puede comprar a tiempo y a qué precio | Índice mensual por evento; si baja, retrasa la fase y sube el costo |
| **Costo de insumos (con componente en dólares)** | Costo variable por ha | Base x factor de tipo de cambio x inflación; la fracción en dólares es fija por plantilla |
| **Presión de sustitutos (contrabando e importados)** | Competencia que empuja el precio a la baja | Índice que sube con eventos y baja con diferenciación; recorta precio o volumen |
| **Pertenencia a organización** | Cooperativa o asociación | Si está, mejora precio y estabilidad y agrega reglas y cobro con rezago |
| **Edad de plantación (perennes)** | Años desde plantación | Sube un año cada 12 meses; define producción plena y la renovación |
| **Capital de trabajo mínimo (calculado)** | Máximo faltante de caja de la campaña | Mínimo del flujo acumulado proyectado; se muestra como alerta al alumno |

Interpretación mía: con estas variables, el motor reproduce el desfase gasto-cobro, la rigidez del calendario, el clima y el precio como variables aleatorias, el riesgo regulatorio y los problemas de acopio, sin cambiar su estructura central de caja, ingresos, costos y reputación; agrega calendario de fases, stock, deuda con calendario de cuotas y algunos índices.

---

## 7. Ejemplos reales de Bolivia o Latinoamérica

Todos son de Bolivia. No abrí ejemplos de otros países de la región: la guía de IFAD [S2] es general, y el documento de PRIAS [S7] menciona un estudio argentino que no abrí.

| Caso | Qué dice la fuente | Enlace |
|---|---|---|
| **Sequía en la campaña de verano 2023-2024 (soya)** | ANAPO: 800.000 t menos de soya, 55% de la superficie en cuatro zonas (Pailón, Cuatro Cañadas, San Julián, San José de Chiquitos), rendimientos de 800-900 kg/ha, unas 6.000 familias sin poder cumplir deudas; propuso reprogramar créditos. La nota de EFE cita 205.000 ha de soya afectadas y unos US$ 300 millones menos de ingresos por exportación | [eju.tv](https://eju.tv/?p=4048571) y [Correo del Sur, 20/4/2024](https://correodelsur.com/economia/20240420/sequia-dana-800-000-toneladas-de-soya-y-bajan-las-exportaciones-en-bolivia.html) |
| **Caída de precio de la quinua** | Precio de US$ 6.602/t en 2014 a unos US$ 2.072; más de 120 países la producen; Bolivia bajó de 68.000 t (2013) a 39.000 t (2021) y Perú pasó de 52.000 a 106.000 t. Una comunidad busca vender directo y crear marca | [Bloomberg Línea, 28/6/2022](https://www.bloomberglinea.com/2022/06/28/como-perdio-bolivia-el-reinado-mundial-de-la-quinoa-y-que-hace-para-recuperarlo/) y [Los Tiempos, 7/2/2022](https://www.lostiempos.com/actualidad/economia/20220207/exportacion-quinua-cae-33-otros-productos-tambien-tienen-baja) |
| **Conflicto de la leche con PIL (2016)** | PIL recortó el acopio a la mitad; el acuerdo fijó 323.000 litros diarios a Bs 3,10 y Bs 2,70, con Bs 1,40 por el excedente; productores sostenían un costo de Bs 3,99 | [Los Tiempos, 8/9/2016](https://www.lostiempos.com/node/111731) |
| **Suspensión de exportación de carne (2025)** | Suspensión por precio interno; estimación de US$ 500.000 diarios de pérdidas y US$ 200 millones anuales en riesgo | [Los Tiempos, 6/2/2025](https://www.lostiempos.com/actualidad/economia/20250206/gobierno-suspende-exportacion-carne-ganaderos-rechazan) y [AgroLatam, 7/2/2025](https://www.agrolatam.com/actualidad-latam/productores-bolivianos-en-emergencia-tras-prohibicion-de-exportacion-de-carne) |
| **Piscicultura del trópico de Cochabamba (2024)** | Producción de 30.000 a 25.000 t; 700 piscicultores dejaron la organización; flete refrigerado de Bs 1 a Bs 2-2,50/kg; insumos +15% | [Los Tiempos, 13/10/2024](https://www.lostiempos.com/doble-click/vida/20241013/cae-15-produccion-pescado-chapare-tres-factores) |
| **Cooperativa El Ceibo (cacao, Alto Beni)** | Fundada en 1977; 300-360 t de exportación anual en 2008; unas 800 familias socias; cacao era 30% del ingreso anual de las familias; tensión con el entorno no cooperativizado | [Bazoberry, 2008](https://www.sudamericarural.org/images/en_papel/archivos/bazoberry.pdf) |
| **Seguro Agrario Pirwa** | Cobertura de 272.847 ha y 146.554 familias en 141 municipios en la tercera campaña; Bs 1.000/ha de indemnización | [Murillo, Apthapi 2017](https://apthapi.umsa.bo/index.php/ATP/article/download/194/419/681) |

---

## 8. Fuentes numeradas con nivel

Nivel A: libro, paper, organismo, manual universitario. B: consultora, reporte sectorial, prensa, informe de proyecto. C: blog, enciclopedia, práctica.

| N.º | Fuente | Nivel | Qué abrí y leí | Enlace |
|---|---|---|---|---|
| S1 | SAC Consulting (editor Alastair Beattie), *The Farm Management Handbook 2024/25*, 45.ª ed., octubre de 2024, financiado por el Gobierno de Escocia (Farm Advisory Service); ISSN 0308-5708, ISBN 978-1-7399808-3-2 según la portada | A (manual técnico de gestión agropecuaria) | Texto leído de la portada, el prólogo y el capítulo "Enterprise Budgeting": definición de margen bruto, costos variables y fijos. No leí los márgenes por cultivo ni de otros capítulos. Es de Escocia; solo el método es transferible | https://www.fas.scot/downloads/fmh-october-2024-intro-enterprise-budgeting |
| S2 | IFAD, *Weather Index-based Insurance in Agricultural Development: A Technical Guide*, noviembre de 2011, ISBN 9789290722762 | A (organismo) | Texto extraído: introducción, definiciones (riesgo covariante) y sección de desventajas (riesgo de base: espacial, temporal, de producto). No leí los capítulos de diseño ni los estudios de caso | https://www.uncclearn.org/wp-content/uploads/library/ifad73.pdf |
| S3 | Erik Murillo Fernández, "Avances de la transferencia del riesgo agropecuario en Bolivia", *Apthapi* 3(3): 831-843, sep-dic 2017, Revista de la Carrera de Ingeniería Agronómica, UMSA, ISSN 2519-9382. El autor se presenta como Director General Ejecutivo del INSA | A (paper) | Texto leído: marco legal, modalidad Pirwa, cobertura, siniestralidad, cuadros 1 a 3 de las primeras campañas. Faltó leer las conclusiones | https://apthapi.umsa.bo/index.php/ATP/article/download/194/419/681 |
| S4 | BID, memorando de la Representación en Bolivia, "Bolivia - BO-T1224. Desarrollo del mercado de seguro agrícola y gestión de riesgos climáticos", 15 de agosto de 2014 | A (organismo multilateral; documento interno de cooperación técnica) | Texto leído completo (4 páginas): antecedentes, rol del INSA, cooperación técnica de US$ 600.000 (ver nota en sección 9) | https://ewsdata.rightsindevelopment.org/files/documents/24/IADB-BO-T1224.pdf |
| S5 | Brenda Viviana Hoyos Burela (graduada de Ingeniería Económica, UPSA), "Factores incidentes en la producción de soya del departamento de Santa Cruz", revista *Generación UPSA* (nombre tomado de la URL); no vi año de publicación, usa datos 1990-2015 | A (artículo universitario) | Texto extraído: calendario de campañas, 77% del volumen en verano, rendimientos 1,5 a 2,4 t/ha, caídas de 37,79% en 2007/2008, Bolivia como tomador de precios. No leí el modelo econométrico completo ni sus resultados | https://cicaef.upsa.edu.bo/index.php/generacionupsa/article/download/12/10/16 |
| S6 | Oscar Bazoberry Chali, "'El Ceibo' y organizaciones moxeñas: dos emprendimientos exitosos en Bolivia", octubre de 2008 (presentación) | B (documento de investigación en formato de presentación; no lo clasifico como A) | Texto extraído: cifras de El Ceibo, factores de éxito y fracaso. Los valores del gráfico de flujo de 3 ha de sistema agroforestal no se pudieron leer | https://www.sudamericarural.org/images/en_papel/archivos/bazoberry.pdf |
| S7 | Conservation Strategy Fund, FCBC y CREA, "Costos de producción para el productor, campaña verano 2023-2024" (proyecto PRIAS), documento creado en abril de 2025 | B (informe de proyecto) | Texto extraído: costos promedio en USD/ha, estructura por elemento, advertencias de sequía y alta variabilidad. Son parcelas experimentales | https://www.conservation-strategy.org/sites/default/files/field-file/Policy%20briefs%20PRIAS.pdf |
| S8 | Correo del Sur (EFE), "Sequía daña 800.000 toneladas de soya...", 20/4/2024 | B (prensa) | Texto leído | https://correodelsur.com/economia/20240420/sequia-dana-800-000-toneladas-de-soya-y-bajan-las-exportaciones-en-bolivia.html |
| S9 | eju.tv, nota sobre la crisis de la soya con 800 mil toneladas menos que en 2023 (fecha no visible en el texto leído) | B | Texto leído | https://eju.tv/?p=4048571 |
| S10 | eju.tv, "Anapo traza un año con mejores perspectivas que en 2024...", fecha no visible | B | Texto leído: 5,9 a 3 millones de toneladas, pérdida de al menos US$ 800 millones, insumos hasta +60% | https://eju.tv/?p=4475791 |
| S11 | Bloomberg Línea, "¿Cómo perdió Bolivia el reinado mundial de la quinua...?", 28/6/2022 | B | Texto leído | https://www.bloomberglinea.com/2022/06/28/como-perdio-bolivia-el-reinado-mundial-de-la-quinoa-y-que-hace-para-recuperarlo/ |
| S12 | Los Tiempos, "Exportación de quinua cae 33%...", 7/2/2022 | B | Texto leído | https://www.lostiempos.com/actualidad/economia/20220207/exportacion-quinua-cae-33-otros-productos-tambien-tienen-baja |
| S13 | Los Tiempos, "PIL pacta precio con lecheros y salda conflicto", 8/9/2016 | B | Texto leído | https://www.lostiempos.com/node/111731 |
| S14 | Los Tiempos, "Gobierno suspende exportación de carne; ganaderos rechazan", 6/2/2025 | B | Texto leído | https://www.lostiempos.com/actualidad/economia/20250206/gobierno-suspende-exportacion-carne-ganaderos-rechazan |
| S15 | AgroLatam, "Productores bolivianos en emergencia tras prohibición de exportación de carne", 7/2/2025 | B | Texto leído (la nota tiene cifras internamente inconsistentes: crecimiento de US$ 40 millones contra una diferencia de 49) | https://www.agrolatam.com/actualidad-latam/productores-bolivianos-en-emergencia-tras-prohibicion-de-exportacion-de-carne |
| S16 | Los Tiempos, "Cae 15% la producción de pescado en Chapare por tres factores", 13/10/2024 | B | Texto leído | https://www.lostiempos.com/doble-click/vida/20241013/cae-15-produccion-pescado-chapare-tres-factores |
| S17 | Correo del Sur, "Bolivia busca ser reconocido como país libre de fiebre aftosa hasta 2025", 29/5/2023 | B | Texto leído (no habla de consecuencias de un brote) | https://correodelsur.com/economia/20230529/bolivia-busca-ser-reconocido-como-pais-libre-de-fiebre-aftosa-hasta-2025.html |
| S18 | eju.tv (de El Deber), entrevista a Klaus Frerking, presidente electo de la CAO, 9/3/2025 | B (declaración de un gremio con interés) | Texto leído | https://eju.tv/?p=4541094 |
| S19 | eju.tv, declaraciones del director del INRA, Eulogio Núñez, 10/7/2024 | B | Texto leído | https://eju.tv/?p=4221096 |
| S20 | ASFI, nota de prensa N.° 37/18, 3/8/2018 (datos a junio de 2018) | B (organismo regulador; comunicado) | Texto extraído: cartera productiva Bs 68.986 millones, 42,9% del total. No contiene topes de tasa | https://asfi.gob.bo/sites/default/files/2025-07/BOLIVIA%20SISTEMA%20FINANCIERO%20IMPULSA%20AL%20SECTOR%20PRODUCTIVO%20Y%20POSIBILITA%20EL%20ACCESO%20A%20LA%20VIVIENDA%20DE%20INTER%C3%89S%20SOCIAL.pdf |

**Conteo.** 20 fuentes numeradas. Nivel A: S1 a S5, **todas con texto leído**, de cinco instituciones distintas (SAC Consulting, IFAD, UMSA, BID, UPSA). Se cumple el mínimo de 4 fuentes A leídas con una advertencia: S1 es de Escocia y solo sirve por el método; S2 y S3 las leí parcialmente; S4 es un memorando corto de cooperación técnica; S5 no tiene año a la vista. No leí un libro de texto clásico de evaluación de proyectos agrícolas en español (Baca Urbina, Sapag Chain, FAO). Ninguna fuente C.

---

## 9. No confirmado

- **Fórmulas marcadas "de memoria"** (rendimiento y precio de equilibrio, costo total por ha, costo financiero, cobertura de cuota, conversión alimenticia, mortalidad, margen por litro, sobrevivencia de peces): no las leí en fuente abierta. Solo el margen bruto y su método están en [S1], y la siniestralidad del seguro en [S3].
- **Costos de producción por ha de soya, maíz, sorgo y otros cultivos en Bolivia**: no encontré un dato abierto. [S7] da costos de parcelas experimentales (USD 178 a 607/ha), no de soya comercial típica; la tabla de testigo (USD 396/ha) es "información regional de ANAPO" según el documento, sin desglose.
- **Seguros comerciales de cultivos en Bolivia hoy**: no confirmé qué pólizas privadas existen ni sus primas. Una búsqueda por "SAPAGRO" no devolvió resultados. El seguro Pirwa [S3] es de 2012-2017; no sé su estado actual.
- **Cooperación técnica del BID de US$ 600.000** [S4]: el memorando la cita como aprobada el 28/7/2014; no confirmé en qué terminó.
- **Tasas máximas reguladas de crédito productivo** (micro 11,5%, pequeña 7%, mediana y grande 6%): las vi en un resumen de búsqueda de un documento de 2015 que no abrí. Pueden estar desactualizadas. Tampoco hay ley aprobada de créditos blandos (el proyecto citado en un resumen no lo verifiqué).
- **Crédito con cuota única a cosecha**: no encontré una norma o producto que lo describa en Bolivia.
- **Avicultura**: no pude abrir ninguna nota (avinews devolvió error 403). El peso del alimento de 60% a 70%, el alza del quintal de maíz de Bs 70 a Bs 105 y el pollo a Bs 10/kg vienen de resúmenes de búsqueda.
- **Suspensión de exportaciones de octubre de 2022** (soya, aceite, azúcar, carne): solo la vi en resúmenes de búsqueda.
- **Roya del café, ojo de gallo, caldo bordelés y exportación de café**: solo resúmenes de búsqueda; no abrí las notas ni el estudio de la UMSA.
- **Precio de la quinua en 2024** (US$ 2.902/t, +48,2%): resumen de búsqueda.
- **Efectos de un brote de fiebre aftosa**: [S17] no los describe. Mi duración de cierre de mercado (1 a 6 meses) es estimación.
- **Estado de tenencia, función económico-social y avasallamientos**: [S18] y [S19] son declaraciones; no verifiqué cifras de INRA ni de títulos. Datos sobre la Comisión Agraria Departamental de 2026 son de un resumen de búsqueda.
- **Escasez de diésel de 2026 en Santa Cruz** (30% de lo necesario): resumen de búsqueda de un periódico; no la uso como dato. El dato de 1,5 millones de litros diarios [S18] es una declaración de un dirigente.
- **Contrabando**: no encontré cifras abiertas del volumen por rubro, ni sobre precios de referencia.
- **Acopio, intermediarios y cadena de frío**: solo casos puntuales (leche [S13], pescado [S16]). No hallé márgenes de intermediación por rubro.
- **Cooperativas**: [S6] tiene datos de 2008; las cifras de socios varían según la fuente (800 a más de 1.300 familias en resúmenes). No hay precios actuales pagados al productor.
- **Piscicultura de trucha del Titicaca y pejerrey**: no abrí fuentes.
- **Ejemplos de otros países de la región**: ninguno abierto.
- **Normativa tributaria, regímenes especiales para el agro, IVA e IT**: no verificados.

---

## 10. Cifras que necesitan validación local

Quién podría aportarla: docente de evaluación de proyectos o de agronomía; ANAPO, CAO, Fegasacruz, Caneb, Feprolec, ADA, ANAPQUI, El Ceibo y otros gremios y cooperativas; INSA y SENASAG; INRA; ASFI y bancos agropecuarios (por ejemplo el Banco de Desarrollo Productivo); INE; productores de cada rubro.

| Cifra | Valor puesto en este documento | Origen | Quién podría validar |
|---|---|---|---|
| Rendimiento por ha de equilibrio de soya y costo total por ha | No fijado; rendimientos de 800-900 kg/ha no cubren costos [S9] | Declaración de ANAPO | ANAPO, CAO, docente de agronomía |
| Pérdida de rendimiento en sequía severa | -40% a -70% en un año | Estimación; [S9] muestra 800-900 kg/ha contra 1,5-2,4 t/ha | ANAPO, agrónomos, productores |
| Pérdida de parcela por helada, granizada o inundación | 30% a 100% | Estimación | INSA, productores, agrónomos |
| Caída de precio en un ciclo de commodity | -30% a -60% | Estimación; quinua cayó casi dos tercios entre 2014 y 2021 [S11] | IBCE, gremios, docente de economía |
| Caída del precio por suspensión de exportación | -10% a -40% | Estimación | Caneb, CAO, ganaderos |
| Alza de costo de insumos por falta de dólares | +15% a +60% | [S10] y [S16] (+60% y +15%); rango es lectura mía | Proveedores de insumos, ANAPO |
| Pérdida de rendimiento por siembra o cosecha tardía (diésel) | -5% a -25% | Estimación | Productores, ANAPO |
| Merma de perecibles por bloqueo | 5% a 30% del lote | Estimación | Piscicultores, lecheros, transportistas |
| Cierre sanitario de mercados | 1 a 6 meses | Estimación | SENASAG, frigoríficos |
| Premio de precio por certificación o cooperativa | +10% a +40% | Estimación | El Ceibo, ANAPQUI, cooperativas |
| Caída de rendimiento por plaga en perennes | -20% a -60% | Estimación | Cooperativas cafeteras, agrónomos |
| Presión de sustitutos (contrabando) sobre el precio | -5% a -25% | Estimación | Gremios, Viceministerio de Lucha Contra el Contrabando |
| Efecto de +20% del maíz en el costo del pollo | +6% a +10% | Estimación con peso de alimento de 60-70% (no confirmado) | ADA, avicultores |
| Plazos de crédito, tasas y cuotas a cosecha | No fijado | Sin fuente | ASFI, bancos, BDP |
| Probabilidades de años secos, normales y buenos | No fijadas | Sin fuente; [S3] da siniestralidad de 9% y 11% para Pirwa | SENAMHI, ANAPO, INSA |
| Cupo de acopio y diferencia de precio cupo-excedente | -62% en el excedente en 2016 | [S13] (Bs 3,70 a Bs 1,40) | Feprolec, PIL, lecheros |
| Costos de producción por cultivo y rubro (soya, maíz, quinua, café, cacao, leche, pollo, pescado) | Sin dato | Sin fuente | Gremios, MDRyT, productores, docentes |
