# Franquicia y licencia de marca: ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que la abrí. El alcance de lo que leí de cada una está en esa sección (algunas las leí completas, otras solo el resumen).
- Lo que no lleva [Sn] es **interpretación mía** (cómo llevarlo a un simulador). No es una cita.
- Una magnitud marcada **(estimación)** la puse yo para dar un orden de magnitud razonable. No viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro país, otra fecha), así que tampoco es un parámetro "verdadero" para Bolivia.
- Las fórmulas de la sección 2 son **reconstruidas por mí de la práctica general de evaluación de unidades de negocio**, salvo donde se indica una fuente. Ninguna la copié de un libro de franquicias.
- Lo que no pude verificar está en la sección 9; las cifras que necesitan validación local, en la sección 10.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Una franquicia es un contrato por el cual el **franquiciante** (dueño de la marca y del método de trabajo) autoriza al **franquiciado** a usar su marca, sus métodos y sus sistemas, a cambio de una remuneración. La ley brasileña lo define así: autorización por contrato para usar marcas y otros bienes de propiedad intelectual, con derecho a producir o distribuir productos o servicios y a usar los métodos y sistemas de operación, a cambio de una remuneración directa o indirecta [S3]. Un artículo jurídico boliviano lo describe como un modelo donde el franquiciante cobra una tarifa única más un porcentaje de las ventas como regalías, y el franquiciado logra una expansión rápida con poco capital [S1, que cita una definición en inglés].

**Las dos perspectivas de este tipo de proyecto.**

1. **Comprar una franquicia (franquiciado).** Tú pones el capital, el local y el trabajo. A cambio recibes una marca conocida, un método probado, capacitación y apoyo. Pagas un derecho de entrada, regalías periódicas y normalmente un aporte a publicidad. La pregunta del proyecto es: ¿lo que queda **después** de pagar esos cargos justifica la inversión, frente a abrir el mismo negocio con marca propia?
2. **Crear un sistema de franquicias (franquiciante).** Tú ya tienes un negocio que funciona y quieres replicarlo con capital de terceros. Debes convertirlo en un sistema estandarizado (manual, capacitación, proveedores, tecnología), probarlo y sostener un equipo de soporte. A cambio cobras derecho de entrada y regalías de cada unidad. La pregunta del proyecto es: ¿las regalías futuras, que dependen de que las unidades de otros **sobrevivan y vendan**, pagan el costo de armar y sostener el sistema?

**Cómo aporta valor.**

- Para el franquiciado, el valor está en comprar **reducción de incertidumbre**: marca con clientes, método probado, proveedores y capacitación [S1]. Esto no garantiza éxito; la evidencia empírica sobre supervivencia es mixta (ver sección 3).
- Para el franquiciante, el valor está en crecer con **menos capital propio y menos riesgo operativo** que abriendo todo con unidades propias; una columna de opinión legal colombiana (abril de 2026) lo plantea como expansión geográfica con menos riesgos operacionales y económicos que la expansión directa [S11].
- La literatura económica trata la franquicia como una alternativa contractual a la integración vertical (tener todas las unidades propias) y estudia las tensiones que generan los conflictos entre las partes: control de calidad, territorios, precios, publicidad, terminación y renovación [S7, solo catálogo].

**Por qué es distinto para un simulador.** Tres rasgos que el motor genérico (caja, ingresos, costos, reputación) no captura:

1. **Dos bolsillos con intereses distintos.** La regalía se calcula sobre ventas brutas, no sobre utilidad. El franquiciante gana si la unidad vende, aunque la unidad pierda plata. Esa diferencia es la fuente de los conflictos.
2. **La reputación es compartida.** Una unidad que da mal servicio daña la marca de todas. Es una externalidad, no un problema individual.
3. **El contrato manda.** Plazo, territorio, renovación, proveedores obligatorios, causas de terminación y quién resuelve las disputas definen el riesgo tanto como las ventas. En Bolivia, además, el contrato no tiene una ley propia (sección 5, situación 14).

---

## 2. Indicadores propios y cómo se calculan

Convención: **mes t**; r = tasa de regalía; a = tasa de aporte a publicidad; V = ventas brutas mensuales de la unidad. Los nombres en inglés se mantienen porque el alumno los encontrará así.

### 2.1 Lado del franquiciado (comprar una franquicia)

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Inversión inicial total** | Todo lo necesario hasta abrir: derecho de entrada, obra, equipos, inventario inicial, permisos, capacitación | Suma de los rubros. La norma estadounidense obliga al franquiciante a mostrarlos en una tabla (Ítem 7) e incluir una línea de "fondos adicionales" para el período inicial de operación; la guía dice que un período razonable es **al menos tres meses** | [S2] |
| **Cargos periódicos al franquiciante** | Regalía, aporte a publicidad, cargos por transferencia, etc. | Cargos = V x (r + a) + cargos fijos. La norma exige informar el monto, la fecha de pago y la fórmula; "porcentaje de ventas brutas" es una fórmula aceptable si se define qué son ventas brutas | [S2, Ítem 6] |
| **Regalía típica** | Base de cálculo más común | Porcentaje de ventas brutas, que esa fuente dice es "típicamente 5% a 9%"; con eso el franquiciado conserva 91% a 95% de las ventas brutas antes de sus costos | [S14] (nivel C, EE.UU.) |
| **Margen operativo antes de cargos** | Resultado del local sin cargos del franquiciante | (V - costos de ventas - gastos del local) / V | Interpretación |
| **Margen después de cargos (margen neto de franquiciado)** | Lo que realmente queda | M = (V - costos de ventas - gastos del local - V x (r + a) - cargos fijos) / V. Es el margen antes de cargos **menos** (r + a) | Interpretación |
| **Punto de equilibrio mensual de la unidad** | Ventas mínimas para no perder | V* = costos fijos del local / (margen de contribución - r - a), donde margen de contribución = 1 - costos variables / V | Interpretación (fórmula estándar de equilibrio con regalía como costo variable) |
| **Recuperación de la inversión (payback)** | Meses hasta recuperar la inversión | Inversión inicial / flujo mensual promedio después de cargos e impuestos | Interpretación |
| **Rentabilidad contable sobre inversión** | Retorno anual simple | Utilidad neta anual después de cargos / inversión inicial | Interpretación |
| **Costo efectivo de la marca** | Cuánto "cuesta" la marca por cada 100 de ventas | (r + a) x 100, más el sobreprecio en insumos obligatorios si lo hay | Interpretación. El sobreprecio entra porque la norma obliga a divulgar los ingresos que el franquiciante recibe de proveedores obligatorios [S2, Ítem 8] |
| **VAN y TIR del franquiciado** | Valor del flujo descontado | Ver sección 3 | Clásico |

### 2.2 Lado del franquiciante (crear un sistema)

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Ingreso por regalías** | Lo que cobra mensualmente | Regalías_t = suma sobre unidades abiertas i de (V_i x r), menos regalías no cobradas | Interpretación |
| **Ingreso por derecho de entrada** | Pago único por unidad vendida | Derecho x unidades nuevas del mes. El derecho de entrada suele cubrir los costos de abrir al franquiciado (capacitación, selección de sitio, publicidad de lanzamiento) y no es donde la mayoría gana plata | [S14] (nivel C) |
| **Margen del franquiciante por unidad** | Lo que deja cada unidad al sistema | Regalías por unidad + margen sobre insumos vendidos - costo de soporte por unidad | Interpretación |
| **Costo de soporte por unidad** | Costo del equipo de campo y oficina central | (Costos de la central de franquicias) / unidades activas | Interpretación |
| **Tasa de cierre de unidades** | Cuántas unidades dejan el sistema | Unidades cerradas o no renovadas del año / unidades al inicio del año. La norma estadounidense obliga a informar, por tres años, aperturas, cierres, terminaciones, no renovaciones, recompras y transferencias en tablas (Ítem 20) | [S2] |
| **Ventas por unidad (nivel y dispersión)** | Salud del sistema | Promedio, mediana y rango de V entre unidades. La norma permite (no obliga) informar rendimiento financiero en el Ítem 19, con base razonable y sustento escrito | [S2] |
| **Valor presente de la red de regalías** | Valor del sistema para el franquiciante | VP = suma sobre meses t de (unidades activas_t x V promedio_t x r - costo de soporte_t) / (1+i)^t. Las unidades activas deben incluir cierres esperados, no suponerse fijas | Interpretación |
| **Retorno del sistema** | Si el proyecto de franquiciar paga | VAN = - (unidad piloto + manual + sistemas + capacitación + registro de marca + abogados) + VP de regalías y derechos de entrada netos de soporte | Interpretación |

### 2.3 Qué deben mirar ambos lados

- **Ventas "en las mismas unidades" (same-store):** variación de ventas de unidades que ya operaban el año anterior. Separa crecimiento real de crecimiento por abrir más unidades. Es práctica de industria; no la confirmé en una fuente abierta específica (ver sección 9).
- **Rotación de franquiciados:** fracción de contratos que se transfieren o terminan, que la norma estadounidense obliga a informar [S2, Ítem 20].
- **Relación entre derecho de entrada y desempeño:** un estudio de un proveedor de software de gestión de franquicias asocia derechos más altos con mayores ventas por unidad, pero es correlación, no causa; no pude abrir el estudio (sección 9).

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN/TIR clásico y por qué

**El VAN/TIR clásico sí aplica**, porque la franquicia produce ingresos. Pero el flujo hay que construirlo distinto en cada perspectiva.

### 3.1 Franquiciado

1. **El flujo es después de cargos.** Todo el flujo operativo se calcula con ventas x (1 - r - a) y con los insumos al precio obligatorio. Un error común es evaluar el negocio con la marca "gratis" y restar la regalía al final como un detalle.
2. **El horizonte lo fija el contrato, no la vida del negocio.** Si el contrato dura 5 o 10 años y la renovación no es automática, el VAN debe cortar el flujo al vencimiento o ponerle una probabilidad de renovación. La norma estadounidense obliga a divulgar condiciones de renovación, terminación y transferencia [S2, Ítem 17], y una de las disputas típicas que menciona la OMPI es la renovación [S1, cita a OMPI]. En una franquicia no hay "valor terminal" garantizado: el local, la clientela y la marca pertenecen en parte a otro.
3. **La comparación correcta es incremental.** La franquicia compite con abrir el mismo negocio con marca propia o con la mejor alternativa de uso del capital. VAN de la franquicia menos VAN de la alternativa. La marca debe justificar su costo con más ventas o menos riesgo; si no, solo se paga un cargo.
4. **Capital de trabajo del arranque.** Los primeros meses se pierde plata mientras se llega al equilibrio. La norma pide estimar fondos adicionales por al menos tres meses [S2]. El VAN que ignora esto es optimista.
5. **Escenarios, no un número.** Ventas del primer año dependen del sitio y de la marca en la zona. Se recomienda evaluar con tres escenarios de ventas y mirar el equilibrio (ver V* arriba). Interpretación mía.

### 3.2 Franquiciante

1. **El VAN es del sistema, no de una venta.** El costo inicial (piloto, manual, sistemas, abogados, registro de marca) se paga hoy; la recompensa es una serie de regalías que depende de unidades de terceros.
2. **Supervivencia de unidades.** Un VAN que supone que cada unidad vendida sigue abierta para siempre sobreestima el valor. Un estudio con datos de EE.UU. de los años 80 (Bates, 1998) encontró que los resultados de supervivencia de franquiciados **dependen de la fuente de datos**: con datos de establecimientos, los franquiciados sobreviven más que los independientes; con datos de empresas jóvenes, ocurre lo contrario. Además, la mayoría de las unidades jóvenes pertenecían a operadores multiunidad con experiencia, no a novatos, y entre los verdaderos novatos la supervivencia fue baja [S5, solo resumen]. **Interpretación:** el franquiciante debería modelar la supervivencia por perfil de franquiciado, no una tasa única.
3. **La economía de la unidad del franquiciado debe cerrar.** Si después de regalías el franquiciado no gana, el sistema pierde unidades. Por eso el análisis del franquiciante incluye el VAN del franquiciado típico: es una restricción, no un detalle. Una fuente de práctica dice que los franquiciantes sólidos fijan la tasa analizando la economía de la unidad (mano de obra, costo de producto, alquiler), mientras que los débiles copian a competidores [S14, nivel C].
4. **Estructura de cargos.** Un modelo teórico de Desai (1997) concluye que, en el caso base (un franquiciante y dos franquiciados idénticos), una cuota de publicidad fija supera a una proporcional a ventas; pero cuando los mercados de los franquiciados responden distinto a la publicidad, el franquiciante puede preferir la proporcional [S4, solo resumen]. Es un resultado de modelo; no dice cuál usar en Bolivia.

### 3.3 Lo que complementa al VAN en este tipo

- **Valor de la red de regalías** (VP descontado con cierres esperados) en lugar de ventas totales.
- **Economía de la unidad** (margen después de cargos, V*, payback) como prueba de que el sistema es replicable.
- **Análisis legal-contractual** como parte del riesgo: territorio, plazo, terminación, resolución de disputas (en Bolivia, vacío legal específico [S1]).
- **Flujos escenarios con probabilidad de cierre y de no renovación.**

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Todo esta sección es interpretación mía, apoyada donde se indica en lo que leí.

**Estudiantes:**

1. Evaluar la franquicia como si la marca fuera gratis: olvidan restar regalía y aporte a publicidad antes de calcular el flujo, o los restan sobre utilidad en vez de sobre ventas brutas (la norma estadounidense exige definir "ventas brutas" porque esa base importa [S2]).
2. Suponer que las ventas del local serán iguales al promedio de la red. El promedio oculta la dispersión.
3. No incluir capital de trabajo del arranque; la norma estadounidense pide estimarlo por al menos tres meses [S2].
4. Calcular el VAN a perpetuidad cuando el contrato vence en un plazo definido.
5. En la perspectiva de creador del sistema: poner solo el costo de abrir y olvidar el soporte continuo (el equipo de campo), la capacitación y la actualización del manual.
6. Suponer que todas las unidades vendidas abren y no cierran nunca (cierres cero).
7. Confundir ingreso del franquiciante con ventas de la red: el ingreso del franquiciante es solo r % de esas ventas más derechos y márgenes.

**Emprendedores:**

1. Comprar la marca "por el nombre" sin pedir las cifras reales de unidades existentes. En EE.UU. la norma permite al franquiciante no informar rendimientos (el Ítem 19 es opcional [S2]); si no hay datos, el comprador está a ciegas. En Bolivia ni siquiera existe esa obligación de divulgar (ver 5.14).
2. Aceptar contrato sin leer territorio, renovación y causales de terminación. La guía estadounidense recomienda mostrar el contrato a un abogado y a un contador [S2, texto de la advertencia de divulgación].
3. Franquiciar demasiado pronto: sin unidad piloto probada, sin manual, sin capital para dar soporte. La idea de una operación piloto probada antes de franquiciar apareció en un resumen de búsqueda que no abrí (sección 9); no la doy como cita.
4. Un franquiciante que cobra regalías altas para financiar su propio crecimiento y ahoga la rentabilidad de sus franquiciados.
5. Un franquiciado que subdeclara ventas para pagar menos regalía (un tipo de disputa que menciona la OMPI: "subregistros de tarifas adeudadas" [S1]).
6. Depender de proveedores o insumos importados con costo en dólares y regalía en bolivianos (riesgo cambiario no cubierto). Interpretación; ver sección 10.
7. Creer que la marca extranjera "llega con su éxito": McDonald's operó ocho locales en Bolivia entre 1997 y 2002 y salió; la compañía dijo que fue por un plan de salir de países donde no obtenía las ganancias deseadas [S9].

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Notas de lectura:

- Las magnitudes son **(estimación)** salvo donde hay [Sn]. Se dan como ordenes de magnitud para empezar a calibrar, no como datos.
- "Perspectiva" indica a quién aplica la situación: F = franquiciado (comprar), P = franquiciante (crear el sistema), o ambas.
- En cada situación las decisiones tienen costos reales; ninguna es la "correcta" en todos los casos.

### 5.1 Ventas del local por debajo de lo que mostraba el vendedor (F)

**Qué pasa.** Al comprar, el franquiciante mostró ventas promedio de las unidades existentes, tomadas de sus mejores locales. Tu local, en un barrio distinto, vende menos en los primeros meses. En EE.UU. la divulgación de rendimiento es opcional y debe tener respaldo escrito [S2]; en Bolivia no existe esa regla [S1], así que depende de lo que tú hayas pedido por contrato y verificado.

**Variables que mueve.**
- Ventas mensuales de la unidad: -20% a -35% sobre lo proyectado durante 6 a 12 meses (estimación).
- Margen después de cargos: baja varios puntos porque la regalía es sobre ventas pero los costos fijos no bajan (estimación).
- Caja: sube el consumo de capital de trabajo (estimación).

**Decisiones.**
1. **Insistir en la regalía íntegra y ajustar costos.** Ventaja: no se rompe la relación; protege el contrato. Costo: recortes pueden bajar la calidad que la marca exige y generar una auditoría.
2. **Pedir al franquiciante una reducción temporal de regalías o apoyo de marketing local.** Ventaja: alivia caja ya. Costo: el franquiciante puede negarse o pedir algo a cambio (extender plazo, abrir otra unidad); sienta precedente.
3. **Invertir en marketing local propio (más allá del aporte al fondo).** Ventaja: puede acelerar ventas. Costo: consume caja justo cuando hay menos; sin garantía de retorno.
4. **Evaluar salida anticipada (transferir o vender la unidad).** Ventaja: limita pérdida. Costo: la transferencia suele requerir aprobación del franquiciante y puede haber cargos [S2, Ítem 6 menciona cargos por transferencia]; se vende barato en pleno bajo rendimiento.

**Qué aprende el alumno.** El promedio de la red no es tu proyección. Hay que exigir cifras por unidad y evaluar con escenarios. La regalía sobre ventas brutas pesa más cuando se vende poco.

### 5.2 Subida de regalía o de aporte a publicidad en la renovación (F, P)

**Qué pasa.** Vence el primer período del contrato. El franquiciante propone renovar con regalía más alta y un aporte mayor al fondo de publicidad, argumentando inversión en la marca. Tú ya tienes clientela y local invertido.

**Variables que mueve.**
- Tasa de regalía: +1 a +2 puntos porcentuales de ventas (estimación; el rango típico de partida que cita una fuente es 5% a 9% [S14]).
- Margen del franquiciado: baja el equivalente al aumento (matemática directa).
- Probabilidad de cierre o salida de franquiciados: sube en el sistema (estimación).

**Decisiones.**
1. **Aceptar el aumento.** Ventaja: renovación asegurada. Costo: margen más bajo por años; si ya era justo, se vuelve inviable.
2. **Negociar a cambio de plazo más largo o territorio exclusivo.** Ventaja: compensa con valor de largo plazo. Costo: más tiempo atado a un contrato; el franquiciante puede rechazar.
3. **No renovar y convertir el local en marca propia.** Ventaja: elimina cargos; es tuyo el margen. Costo: pierdes marca, proveedores y clientes atraídos por ella; puede haber cláusula de no competencia (la guía estadounidense lista las restricciones de competencia entre los contenidos del contrato [S2]); la situación de Costa Rica con Burger King muestra el conflicto cuando el contrato vence [S10].
4. **Organizarse con otros franquiciados para negociar en bloque.** Ventaja: más poder. Costo: tensa la relación; el franquiciante puede responder con auditorías.

**Qué aprende el alumno.** El poder de negociación cambia con el tiempo: al renovar, el franquiciado tiene más inversión hundida y menos opciones. El contrato debe definir cómo se fijan los aumentos desde el principio; la norma estadounidense exige informar el máximo de aumento o la fórmula [S2, Ítem 6].

### 5.3 Uso del fondo de publicidad (F, P)

**Qué pasa.** Cada franquiciado aporta un porcentaje de ventas a un fondo común de marketing. Algunos franquiciados sospechan que se gasta en la central o en promociones que benefician a otras ciudades, no en las suyas.

**Variables que mueve.**
- Confianza de los franquiciados: baja (estimación).
- Ventas por unidad: dependen de la efectividad del fondo; sube o baja entre -3% y +8% según uso (estimación).
- Aporte a publicidad: puede subir o bajar.

**Decisiones.**
1. **Publicar informes del fondo y crear un comité de franquiciados (franquiciante).** Ventaja: confianza; reduce disputas. Costo: da poder de voto a los franquiciados y limita decisiones rápidas. Una ley brasileña exige informar si existen consejos o asociaciones de franquiciados y quién fiscaliza los fondos [S3, art. 2].
2. **Mantener la decisión centralizada.** Ventaja: rapidez y coherencia de marca. Costo: sospecha, y el mal uso de fondos de publicidad figura entre las disputas típicas que lista la OMPI [S1].
3. **Dejar parte del fondo para marketing local decidido por cada franquiciado.** Ventaja: adapta a cada zona. Costo: pierde escala y consistencia; cada uno gasta distinto.
4. **(Franquiciado) Pedir auditoría del fondo.** Ventaja: evidencia. Costo: tiene costo y tensión; solo vale si el contrato lo permite.

**Qué aprende el alumno.** El fondo de publicidad es un bien común: la forma de cobrarlo (fijo o proporcional) y quién lo controla importa. Desai (1997) muestra que fijo o proporcional cambia los incentivos del franquiciante [S4].

### 5.4 Apertura de otra unidad cerca de la tuya (invasión de territorio) (F, P)

**Qué pasa.** El franquiciante aprueba vender otra unidad a dos barrios de distancia porque su zona "tiene mucha demanda". Tus ventas bajan. Tu contrato dice poco o nada sobre exclusividad.

**Variables que mueve.**
- Ventas de la unidad incumbente: baja; un estudio en hoteles de Texas (años 90) encontró que las unidades nuevas aprobadas por el franquiciante quitaban ingresos a las vecinas, mientras que las nuevas unidades propias del franquiciante estaban asociadas con más ingresos de las vecinas [S6, solo resumen]. Magnitud para Bolivia: -5% a -15% en ventas de la unidad cercana (estimación).
- Ingresos del franquiciante por regalías: sube (más unidades, más ventas totales de la red) aunque las vecinas bajen.
- Confianza y disputa: sube la probabilidad de conflicto y arbitraje.

**Decisiones.**
1. **(Franquiciante) Abrir la nueva unidad igual.** Ventaja: más regalías y presencia. Costo: se enfrenta con el franquiciado existente, riesgo de litigio y de menor calidad por franquiciados descontentos.
2. **(Franquiciante) Respetar territorios exclusivos con distancia mínima.** Ventaja: franquiciados más seguros y dispuestos a invertir. Costo: crecimiento más lento de la red. La norma estadounidense obliga a declarar si hay territorio exclusivo; si no lo hay, debe decir que "puede enfrentar competencia de otros franquiciados" [S2, Ítem 12].
3. **(Franquiciado) Negociar compensación o prioridad para la nueva unidad.** Ventaja: convierte el conflicto en oportunidad (multiunidad). Costo: más capital y más riesgo concentrado.
4. **(Franquiciado) Reclamar por la vía de arbitraje.** Ventaja: puede obtener compensación. Costo: la OMPI y el artículo boliviano indican que el tema de la selección del sitio e invasión es típico en disputas de franquicia, pero en Bolivia no hay centro especializado y el costo de un arbitraje internacional puede ser inalcanzable para una pyme [S1].

**Qué aprende el alumno.** Un territorio no definido es una fuente de conflicto, no un detalle. Más unidades no siempre significa más valor para el sistema: puede quitarle a las que ya existen.

### 5.5 Proveedor obligatorio más caro o con insumo en dólares (F)

**Qué pasa.** El contrato te obliga a comprar insumos clave al franquiciante o a proveedores aprobados. El precio sube, o el costo del insumo importado sube por tipo de cambio o escasez de divisas, mientras tu precio de venta está limitado por el mercado.

**Variables que mueve.**
- Costo de ventas: +4% a +10% (estimación).
- Margen del franquiciado: baja entre 2 y 5 puntos (estimación).
- Ingreso del franquiciante: si es él quien vende los insumos, su margen sube mientras el del franquiciado baja.

**Decisiones.**
1. **Trasladar el costo al precio.** Ventaja: protege el margen. Costo: baja la demanda (el precio es un freno en Bolivia: una tesis atribuida a un documental sobre McDonald's apunta al precio, pero no pude verificarla; ver sección 9).
2. **Pedir autorización para un proveedor local alternativo.** Ventaja: baja costo. Costo: el franquiciante puede negarse por control de calidad; la norma exige divulgar las restricciones de fuentes de productos y los ingresos que el franquiciante recibe de proveedores [S2, Ítem 8].
3. **Absorber el costo temporalmente.** Ventaja: mantiene precio y clientes. Costo: erosiona la caja.
4. **Presionar con otros franquiciados para renegociar compras en conjunto.** Ventaja: poder de compra. Costo: tensión; el franquiciante puede perder margen.

**Qué aprende el alumno.** Hay que revisar de dónde gana el franquiciante además de la regalía. Los insumos obligatorios son una regalía escondida.

### 5.6 Auditoría de estándares: falla y amenaza de terminación (F, P)

**Qué pasa.** Una visita del franquiciante encuentra incumplimientos de estándares (limpieza, recetas, uniformes, atención). Le da plazo para corregir o aplicará sanciones.

**Variables que mueve.**
- Índice de cumplimiento de estándares: baja en la unidad.
- Costos: +2% a +6% de gastos en corregir (estimación).
- Reputación del sistema: un incumplimiento grave puede afectar la marca de todas las unidades (efecto de reputación compartida).

**Decisiones.**
1. **Corregir de inmediato con inversión.** Ventaja: evita sanción; protege contrato. Costo: caja y tiempo.
2. **Cuestionar el estándar por costoso o no aplicable al mercado local.** Ventaja: puede lograrse adaptación (ej.: ajustar a gusto local). Costo: riesgo de ser tratado como incumplidor; en Bolivia, la experiencia de McDonald's con la salsa llajwa no logró convencer al consumidor [S12], lo que sugiere que la adaptación sola no garantiza ventas.
3. **(Franquiciante) Sancionar y terminar el contrato ante reincidencia.** Ventaja: protege la marca. Costo: pierde regalías, cierra una unidad, posible litigio por terminación (tema típico en la literatura [S7, catálogo]).
4. **(Franquiciante) Acompañar con capacitación en lugar de sancionar.** Ventaja: mantiene la unidad y mejora el sistema. Costo: más horas de soporte (costo fijo) y riesgo de que otros esperen la misma tolerancia.

**Qué aprende el alumno.** Los estándares son el producto que se vende; hacerlos cumplir es costoso. Si el manual es demasiado minucioso, un abogado colombiano advierte que puede acercarse a un control que debilite la independencia del franquiciado y traer riesgos laborales para el franquiciante [S11, de opinión]; la ley brasileña dice expresamente que la franquicia no genera vínculo laboral con el franquiciado ni sus empleados [S3].

### 5.7 Un franquiciado reporta menos ventas de las reales (P)

**Qué pasa.** Algunos franquiciados informan ventas menores para pagar menos regalía. La caja del franquiciante muestra regalías por debajo de lo esperado según el flujo de insumos.

**Variables que mueve.**
- Regalías cobradas: -3% a -10% del potencial (estimación).
- Costos de control: sube (auditorías, sistema de punto de venta obligatorio).
- Relación con franquiciados: se deteriora.

**Decisiones.**
1. **Imponer un sistema de caja conectado (punto de venta del franquiciante).** Ventaja: transparencia. Costo: inversión en tecnología y resistencia; el franquiciado paga el sistema.
2. **Auditorías sorpresa a unidades sospechosas.** Ventaja: disuade. Costo: caro, tensiona la confianza.
3. **Pasar de regalía sobre ventas a un monto mínimo fijo.** Ventaja: ingreso previsible. Costo: ahoga a unidades en meses malos; una fuente de práctica menciona la "regalía mínima" como una variante usada [S14].
4. **Ignorar y priorizar el crecimiento.** Ventaja: no se desgasta. Costo: señal de impunidad; los que cumplen se sienten en desventaja.

**Qué aprende el alumno.** La regalía sobre ventas brutas crea incentivo a ocultar ventas. El control tiene costo; el diseño del cobro importa.

### 5.8 Contrato vencido o renovación negada (F, P)

**Qué pasa.** Tu contrato llega a su fin. El franquiciante decide no renovar (porque quiere tomar la zona con unidades propias, o por conflicto). Tienes local, personal y clientes asociados a la marca.

**Variables que mueve.**
- Ventas: caen al perder la marca (estimación -30% a -60% si rebautizas, depende del negocio).
- Valor de la inversión: se pierde parte de lo invertido en remodelación con imagen de marca.
- Para el franquiciante: pierde unidad y regalías, pero retoma el mercado.

**Decisiones.**
1. **Continuar con marca propia en el mismo local.** Ventaja: conserva local y clientes. Costo: puede haber cláusulas de no competencia; reinversión en imagen.
2. **Pelear la renovación por arbitraje.** Ventaja: puede obtener compensación. Costo: en Bolivia no hay centro especializado ni ley específica [S1]; tiempo y costo altos.
3. **Vender el local al franquiciante o a otro franquiciado.** Ventaja: liquida. Costo: poder de negociación bajo, precio castigado.
4. **Negociar renovación con nuevas condiciones.** Ventaja: continuidad. Costo: condiciones más duras.

**Qué aprende el alumno.** El caso de Burger King en Costa Rica muestra el riesgo: la casa matriz afirmó que el franquiciado local operaba sin autorización porque el contrato había vencido (septiembre de 2014), cerró 29 restaurantes con 434 despidos en octubre de 2015, y el Ministerio de Comercio Exterior no logró mediar [S10]. Esto es lo que afirma la fuente sobre la postura de la casa matriz, no un fallo.

### 5.9 Salida del franquiciante del país o cambio de operador (F)

**Qué pasa.** El franquiciante internacional decide salir de Bolivia por baja rentabilidad o cambia de socio local. Tu contrato queda en el aire.

**Variables que mueve.**
- Ventas: caen a cero para la marca o cambian con transición.
- Valor de activos: obra e imagen de marca pierden valor.
- Empleo y flujo: cierre o reconversión.

**Decisiones.**
1. **Cerrar cuando se decide la salida.** Ventaja: limita pérdidas. Costo: pierdes la inversión no recuperada; la fuente de McDonald's dice que se avisó con diez días de anticipación [S9].
2. **Reconvertir el negocio con marca propia.** Ventaja: aprovechas local y personal. Costo: reinversión; sin la marca, el flujo cae.
3. **Negociar con el nuevo operador de la marca.** Ventaja: posible continuidad. Costo: condiciones nuevas y pérdida de poder.
4. **Reclamar indemnización.** Ventaja: puede recuperar algo. Costo: en McDonald's Bolivia (2002), el gobierno dijo estar dispuesto a dialogar con el socio local (Roberto Udler) para preservar empleos, pero el diálogo no se concretó [S9].

**Qué aprende el alumno.** El riesgo país y el riesgo del franquiciante también son tuyos. Un contrato bien hecho incluye qué pasa si el franquiciante se retira.

### 5.10 Ritmo de expansión del sistema: vender demasiado rápido (P)

**Qué pasa.** Eres franquiciante con una unidad piloto que funciona. Recibes muchos interesados y puedes cobrar derechos de entrada de inmediato. Tu equipo de soporte es pequeño.

**Variables que mueve.**
- Ingreso por derechos de entrada: sube de inmediato.
- Calidad de soporte por unidad: baja (más unidades por persona de soporte).
- Tasa de cierre a 2 años: sube si se vende a franquiciados sin perfil o sin sitios buenos (estimación).
- Reputación de marca: puede bajar si las nuevas unidades fallan.

**Decisiones.**
1. **Crecer rápido con muchos franquiciados.** Ventaja: caja hoy y presencia. Costo: soporte diluido y riesgo de cierres tempranos que dañan la marca.
2. **Crecer lento y selectivo.** Ventaja: sistema más sano y mejor reputación. Costo: se pierden oportunidades; la competencia puede ocupar el espacio.
3. **Vender master franquicias por ciudad/región a un operador grande.** Ventaja: el master asume el soporte local y el riesgo. Costo: cedes control y parte de las regalías; tu éxito depende de él.
4. **Abrir unidades propias en plazas clave y franquiciar el resto.** Ventaja: control de calidad en lo importante. Costo: capital propio.

**Qué aprende el alumno.** El derecho de entrada no es el negocio: la regalía depende de que las unidades vivan. Una fuente de práctica sugiere que el soporte por unidad tiene una relación de escala (ver sección 9, no confirmada).

### 5.11 Costo de estandarizar y de armar el soporte mayor al previsto (P)

**Qué pasa.** Convertir tu negocio en franquicia exige documentar procesos (manual), diseñar capacitación, elegir tecnología, registrar tu marca y contratar abogados. Descubres que varios procesos solo funcionaban por la presencia del dueño.

**Variables que mueve.**
- Inversión previa al primer ingreso: +30% a +80% sobre lo presupuestado (estimación).
- Tiempo hasta la primera franquicia vendida: +3 a +9 meses (estimación).
- Caja: se consume antes de que lleguen derechos de entrada.

**Decisiones.**
1. **Hacer el manual internamente con el equipo actual.** Ventaja: ahorra honorarios. Costo: distrae al equipo del negocio actual y suele quedar incompleto.
2. **Contratar consultores/abogados especializados.** Ventaja: sistema más sólido. Costo: honorarios altos; en Bolivia no hay muchos expertos en franquicias [S1].
3. **Probar el sistema con una segunda unidad propia antes de vender.** Ventaja: demuestra que se puede replicar sin el dueño. Costo: más capital y más tiempo.
4. **Lanzar una versión simplificada y mejorar luego.** Ventaja: sale más rápido. Costo: riesgo de fallas, disputas y baja calidad.

**Qué aprende el alumno.** La fase de estandarización es parte del proyecto y de su VAN. Vender antes de estar listo puede costar más que esperar.

### 5.12 Remodelación obligatoria de imagen (F)

**Qué pasa.** El franquiciante cambia la identidad visual y exige a todas las unidades remodelar el local en un plazo. Tú tienes una unidad rentable pero con caja ajustada.

**Variables que mueve.**
- Inversión adicional: 8% a 20% de la inversión original (estimación).
- Cierre temporal: 1 a 4 semanas sin ventas (estimación).
- Ventas posteriores: posible aumento de 0% a 10% (estimación).

**Decisiones.**
1. **Remodelar en el plazo.** Ventaja: cumple contrato. Costo: caja y cierre.
2. **Pedir plazo o financiamiento del franquiciante.** Ventaja: alivia caja. Costo: el franquiciante puede condicionar.
3. **Remodelar parcialmente.** Ventaja: menor costo. Costo: riesgo de incumplimiento y sanción.
4. **No renovar ni remodelar y salir del sistema al vencer.** Ventaja: evita gasto. Costo: pierdes marca (ver 5.8).

**Qué aprende el alumno.** Los cambios de imagen son una fuente de costo no previsto en el VAN; conviene que el contrato diga de antemano cuándo y cuánto se puede exigir remodelar. No confirmé en una fuente cuál es la práctica habitual (ver sección 9).

### 5.13 Franquiciado exitoso quiere más (multiunidad) o salirse (P, F)

**Qué pasa.** Un franquiciado con buenos resultados pide territorio en una ciudad vecina o más unidades; otro, también exitoso, empieza a pensar en crear su propia marca con lo aprendido.

**Variables que mueve.**
- Unidades del sistema: sube con multiunidad.
- Concentración: depende de pocos operadores.
- Riesgo de competencia futura: el franquiciado aprende el método.

**Decisiones.**
1. **Ofrecer desarrollo multiunidad con calendario de aperturas.** Ventaja: crecimiento sin capital propio y con operador probado. Costo: dependencia de un operador; penalidades por no abrir.
2. **Negar y reservar territorio para otro.** Ventaja: más diversificación. Costo: puede irse a la competencia.
3. **(Franquiciado) Aceptar compromiso de apertura.** Ventaja: aumenta escala y poder de negociación. Costo: más riesgo y capital; si el mercado cae, quedas comprometido.
4. **Cláusula de no competencia fuerte.** Ventaja: retiene conocimiento. Costo: puede ser difícil de hacer cumplir y desalienta a buenos candidatos.

**Qué aprende el alumno.** Un dato de Bates (1998): los operadores multiunidad con experiencia tuvieron altas tasas de supervivencia, mientras que los novatos tuvieron bajas [S5, resumen]. El multiunidad puede ser el mejor socio, pero concentra riesgo.

### 5.14 Conflicto sin ley específica ni juez especializado (F, P)

**Qué pasa.** Surge un desacuerdo grave (territorio, regalías, terminación). Descubres que en Bolivia el contrato de franquicia no tiene una ley propia ni un tribunal especializado, y que el sistema judicial ordinario es lento.

**Variables que mueve.**
- Costo legal: sube.
- Tiempo de resolución: años en vía ordinaria (estimación; el artículo boliviano cita un rezago judicial del 54% en materias civil, comercial, penal y administrativa, según un informe de la ONU de 2014 [S1]).
- Caja y distracción de gestión.

**Decisiones.**
1. **Ir a la justicia ordinaria.** Ventaja: costo inicial bajo. Costo: lento y sin expertos en franquicia [S1].
2. **Arbitraje o conciliación local.** Ventaja: más rápido. Costo: el artículo boliviano dice que no hay registros de procedimientos de franquicia llevados en esos centros y que carecen de expertos en la materia [S1].
3. **Arbitraje internacional (por ejemplo, OMPI) pactado en el contrato.** Ventaja: expertos y laudos ejecutables bajo la Convención de Nueva York [S1]. Costo: tasas y honorarios que pueden ser inalcanzables para una pyme [S1].
4. **Negociar un acuerdo directo.** Ventaja: rápido y barato. Costo: la parte débil cede.

**Qué aprende el alumno.** La cláusula de solución de controversias se negocia **antes** de firmar, no cuando hay conflicto. Bolivia se rige por la Decisión 486 de la Comunidad Andina y el reglamento de propiedad industrial del SENAPI, pero el artículo boliviano indica que ninguno desarrolla la franquicia; la única referencia que encontró en la Decisión 486 es el art. 228, que lista entre los factores de notoriedad de un signo el volumen de pedidos de interesados en obtener una franquicia o licencia [S1].

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

Esta sección es propuesta mía; no viene de ninguna fuente. Se define para el **franquiciado** (F) y el **franquiciante** (P).

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| `tasa_regalia` (F, P) | % de ventas brutas que se paga al franquiciante | Constante dentro del contrato; cambia en renovación o por evento |
| `tasa_publicidad` (F, P) | % de ventas que va al fondo común | Constante; cambia por evento |
| `derecho_entrada` (F, P) | Pago único al firmar | Un solo mes (apertura); en P es ingreso por cada unidad nueva |
| `ventas_unidad` (F) | Ventas brutas mensuales del local | base x estacionalidad x efecto marca x efecto territorio x ruido; arranca bajo y crece a una meseta |
| `efecto_marca` (F, P) | Cuánto aporta la reputación del sistema a las ventas | Se mueve con la calidad media de las demás unidades y con el fondo de publicidad |
| `cumplimiento_estandares` (F) | Índice 0-100 del local | Baja si se recortan costos o falta capacitación; sube con inversión; si baja de un umbral, activa auditoría y sanción |
| `canibalizacion` (F) | Pérdida de ventas por unidades cercanas | Función de la densidad de unidades en la zona; sube con cada apertura nueva |
| `costo_insumos_obligatorios` (F) | Precio de insumos que se deben comprar a proveedor fijado | Se mueve con tipo de cambio e inflación; se compara con precio alternativo |
| `meses_contrato_restantes` (F) | Plazo hasta vencimiento | Baja 1 por mes; cerca de 0 activa la negociación de renovación |
| `probabilidad_renovacion` (F) | Posibilidad de que el franquiciante renueve | Depende de cumplimiento, relación y decisión estratégica del franquiciante |
| `unidades_activas` (P) | Número de unidades de la red | + aperturas - cierres cada mes |
| `pipeline_aperturas` (P) | Unidades vendidas aún no abiertas | Entra con la venta; sale con la apertura (retardo de varios meses, estimación) |
| `tasa_cierre` (P) | Probabilidad mensual de que una unidad cierre | Depende del margen de la unidad típica, de la calidad del soporte y del perfil del franquiciado |
| `ventas_red` (P) | Suma de ventas de todas las unidades | Suma de ventas_unidad por unidad |
| `ingreso_regalias` (P) | Ingreso mensual por regalías | ventas_red x tasa_regalia x (1 - evasión) |
| `evasion_regalia` (P) | Parte de ventas no declaradas | Sube si el control es débil y la regalía es alta |
| `costo_soporte` (P) | Costo de equipo de campo, capacitación y central | Fijo escalonado + variable por unidad; se paga aunque las unidades vendan poco |
| `calidad_soporte` (P) | Qué tan bien se atiende a franquiciados | Baja si las unidades por persona de soporte crecen |
| `saldo_fondo_publicidad` (P) | Dinero común disponible | + aportes - gasto en campañas; |
| `confianza_franquiciados` (P) | Percepción del sistema | Sube con transparencia y apoyo; baja con aumentos, invasión de territorio, uso opaco del fondo; baja la tasa de renovación |
| `reputacion_marca_sistema` (P, F) | Reputación compartida | Promedio ponderado de calidad por unidad; un incidente grave la baja para todos |
| `riesgo_legal` (F, P) | Exposición a disputas | Sube con contratos ambiguos; el costo de una disputa se descuenta de la caja |

---

## 7. Ejemplos reales de Bolivia o Latinoamérica con enlace que abrí

1. **McDonald's en Bolivia (1997-2002).** Operaba ocho locales en La Paz, Cochabamba y Santa Cruz, con 334 empleados; cerró el 1 de diciembre de 2002, y la empresa dijo que seguía un plan de salir de países donde no obtenía las ganancias deseadas. El socio boliviano era Roberto Udler; se avisó diez días antes y el gobierno dijo estar dispuesto a dialogar, pero el diálogo no se concretó. Burger King, que llegó dos años después, siguió en el país. Enlace: [Emol/AP, 1/12/2002](https://www.emol.com/noticias/economia/2002/12/01/99636/mcdonalds-cerro-sus-sucursales-en-bolivia.html). Otra nota resume el documental "¿Por qué quebró McDonald's en Bolivia?" de Fernando Martínez (causas culturales; el menú con llajwa no convenció): [The World, 2016](https://theworld.org/stories/2011-11-01/mcdonald-s-failure-bolivia). Ojo: la explicación del documental es una tesis de su autor, no una conclusión verificada.
2. **Franquicias de café que llegaban a Bolivia (2013), con condiciones comerciales.** Según El Deber, Juan Valdez (Colombia) cobra 7% de regalías sobre ventas brutas, 2% para marketing local y un derecho de entrada de entre 15.000 y 30.000 dólares; abrir un local costaba entre 50.000 y más de 300.000 dólares. La misma nota indica que el contrato de franquicia no está regulado de forma expresa en Bolivia y que Cainco recomienda inscribirlo voluntariamente en el Registro de Comercio. Son datos de 2013 y de la marca en su oferta, no del resultado en Bolivia. Enlace: [eju.tv (El Deber), 5/11/2013](https://eju.tv/?p=347702).
3. **Burger King en Costa Rica (2015-2016).** Burger King Corporation y su franquiciada local no se pusieron de acuerdo; la casa matriz sostuvo que el contrato había vencido en septiembre de 2014; se cerraron 29 restaurantes y se despidió a 434 personas en octubre de 2015; el ministerio de comercio exterior intentó mediar sin éxito; en 2016 la marca anunció su regreso. Enlace: [Peru Retail, 13/6/2016](https://www.peru-retail.com/burger-king-volvera-a-operar-en-costa-rica/).
4. **Estado del sector en Bolivia (contexto).** Cafran (Cámara Boliviana de Franquicias) informó que el sector creció 33% tras tres años de pospandemia y que la oferta pasó de 92 a unas 123 opciones en 2023, sobre todo gastronomía. Enlace: [eju.tv, 8/1/2024](https://eju.tv/?p=3868144). Es una cifra institucional repetida por prensa; no vi el informe original.
5. **Brasil como contraste regulatorio.** La Ley 13.966/2019 exige entregar la Circular de Oferta de Franquicia con al menos 10 días de anticipación y permite al franquiciado reclamar nulidad y devolución de pagos si no se cumple. Enlace: [Planalto](https://planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13966.htm).

**No hallé** un caso boliviano abierto con cifras de rentabilidad de un franquiciado o de un franquiciante boliviano (por ejemplo, de una marca boliviana que franquicia). En una de las notas se mencionan marcas locales como La Casa del Camba o Pollos Copacabana, pero no abrí una fuente con cifras (sección 9).

---

## 8. Fuentes numeradas con nivel

**Resumen del conteo.** 14 fuentes numeradas. Nivel A: 7 (S1 a S7). De ellas, **leí con texto completo o extenso 3** (S1, S2, S3) y **solo el resumen o abstract 3** (S4, S5, S6); S7 fue confirmada **solo en ficha de catálogo**. No llego a 4 nivel A leídos con texto completo: **tengo 3**. Si se cuentan los resúmenes, son 6 con contenido leído.

| N.º | Fuente | Nivel | Qué verifiqué y alcance | Enlace |
|---|---|---|---|---|
| S1 | Luis Antonio Vásquez Criales, "Métodos alternativos de resolución de controversias para franquicias en Bolivia", *Revista de Derecho de la U.C.B.*, vol. 6 n.º 11, octubre 2022, pp. 117-137 (ISSN 2523-1510, DOI 10.35319/lawreview.20221182) | A (artículo académico) | **Texto completo leído** (PDF extraído). Dice: Bolivia no tiene regulación específica de franquicia; se rige por la Decisión 486 y el reglamento del SENAPI que no la desarrollan (solo art. 228); rezago judicial del 54% (informe ONU 2014); 42 centros de conciliación y 8 de conciliación y arbitraje autorizados; no hay registros de procedimientos ADR de franquicia en Bolivia; propone la OMPI | https://lawreview.ucb.edu.bo/index.php/a/article/download/82/82/115 |
| S2 | Federal Trade Commission (EE.UU.), *Franchise Rule Compliance Guide*, mayo de 2008 | A (guía de organismo regulador) | **Texto extenso leído** (PDF extraído, 329.000 caracteres; leí los ítems 3, 6, 7, 8, 11, 12, 17, 19, 20, 21 y la advertencia de 14 días). Es norma de EE.UU.; la uso como referencia de qué información se considera material, no como ley boliviana | https://www.ftc.gov/system/files/documents/plain-language/bus70-franchise-rule-compliance-guide.pdf |
| S3 | Lei n.º 13.966, de 26 de diciembre de 2019 (Brasil, franquicia empresarial) | A (norma) | Texto leído mediante resumen automático de la página oficial; art. 1, art. 2 (circular de oferta, 10 días), art. 7. No verifiqué el texto palabra por palabra | https://planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13966.htm y https://legis.senado.leg.br/norma/31881984/publicacao/31882396 |
| S4 | Preyas S. Desai, "Advertising Fee in Business-Format Franchising", *Management Science* 43(10), 1997, pp. 1401-1419 | A (paper) | **Solo el resumen** (página de IDEAS/RePEc); no el paper | https://ideas.repec.org/a/inm/ormnsc/v43y1997i10p1401-1419.html |
| S5 | Timothy Bates, "Survival patterns among newcomers to franchising", *Journal of Business Venturing* 13(2), 1998, pp. 113-130 | A (paper) | **Solo el resumen** (IDEAS/RePEc) | https://ideas.repec.org/a/eee/jbvent/v13y1998i2p113-130.html |
| S6 | Arturs Kalnins, "An Empirical Analysis of Territorial Encroachment Within Franchised and Company-Owned Branded Chains", *Marketing Science* 23(4), 2004, pp. 476-489 | A (paper) | **Solo el resumen** (repositorio de la Universidad de Iowa) | https://iro.uiowa.edu/esploro/outputs/journalArticle/An-Empirical-Analysis-of-Territorial-Encroachment/9984083844102771 |
| S7 | Roger D. Blair y Francine Lafontaine, *The Economics of Franchising*, Cambridge University Press, 2005 (impreso; ISBN 9780521772525 y 9780521775892; digital 9780511753879; DOI 10.1017/CBO9780511753879) | A (libro) | **Solo ficha de editorial**: autores, editorial, año, ISBN, índice de capítulos (contratos, control de calidad, precios, invasión de territorio, publicidad, terminación y no renovación). No leí el contenido | https://www.cambridge.org/core/product/identifier/9780511753879/type/book |
| S8 | El Deber (reproducido en eju.tv), nota sobre franquicias de café, 5/11/2013 | B (prensa) | Texto leído: condiciones de Juan Valdez, estado legal | https://eju.tv/?p=347702 |
| S9 | Associated Press vía Emol, "McDonald's cerró sus sucursales en Bolivia", 1/12/2002 | B (agencia de noticias) | Texto leído | https://www.emol.com/noticias/economia/2002/12/01/99636/mcdonalds-cerro-sus-sucursales-en-bolivia.html |
| S10 | Peru Retail, nota sobre el regreso de Burger King a Costa Rica, 13/6/2016 | B (prensa especializada) | Texto leído | https://www.peru-retail.com/burger-king-volvera-a-operar-en-costa-rica/ |
| S11 | Bernardo Sandoval Rodríguez, columna de opinión sobre manuales de franquicia, *Asuntos Legales* (La República, Colombia), 25/4/2026 | B (opinión legal en prensa) | Texto leído; es opinión de un abogado, no doctrina | https://www.asuntoslegales.com.co/analisis/bernardo-sandoval-rodriguez-4207019/franquicias-manuales-de-exito-o-camisas-de-fuerza-legal-4378998 |
| S12 | The World (PRI), nota sobre el fracaso de McDonald's en Bolivia (fecha de página 1/8/2016; URL de 2011) | B (medio) | Texto leído | https://theworld.org/stories/2011-11-01/mcdonald-s-failure-bolivia |
| S13 | eju.tv, "En plena crisis, las franquicias parecen ser un comodín", 8/1/2024 (cifras de Cafran) | B (prensa de opinión) | Texto leído | https://eju.tv/?p=3868144 |
| S14 | MSA Worldwide, "Franchise royalty payments: the basics" | C (consultora, material de práctica, EE.UU.) | Texto leído: estructura de derecho de entrada, regalía (5% a 9% como base común), variantes | https://msaworldwide.com/basics-of-franchising/franchise-royalty-payments-the-basics/ |

---

## 9. No confirmado

- **SENAPI y la franquicia.** No encontré (ni abrí) ninguna norma o página del SENAPI que diga si un contrato de franquicia o de licencia de marca debe inscribirse allí para ser oponible a terceros, qué documentos se piden o cuánto cuesta. Lo que sí leí: la Decisión 486 y el reglamento del SENAPI no desarrollan la franquicia [S1]. Una búsqueda indicó que el artículo 162 de la Decisión 486 exige inscribir la licencia de marca en la oficina nacional para que surta efectos frente a terceros (así lo dice una fuente colombiana que no abrí; no abrí el texto de la Decisión 486 ni la interpretación prejudicial 84-IP-2019). Tampoco verifiqué si el SENAPI aplica ese requisito en la práctica. **No lo uses como dato hasta confirmarlo con el texto oficial o con un abogado de propiedad intelectual.**
- **Tiempo y costo de registrar una marca en Bolivia.** Una nota de un estudio jurídico (que no abrí) dijo que el trámite tarda unos 6 a 8 meses si no hay oposición, y que el SENAPI emitió 11.244 registros de marca en 2024; no abrí esas fuentes.
- **Cifras actuales de franquicias en Bolivia.** Hay cifras de 2017-2018 (250 a 300 franquicias, 60% a 70% en Santa Cruz, 53% de comida, 62% extranjeras) que vi solo en resúmenes de búsqueda; las cifras de 2023 (92 a 123 opciones, +33%) las vi en prensa [S13] repitiendo a Cafran, sin acceso al informe original. Los números difieren entre fuentes.
- **Regalías, derechos de entrada y rentabilidad de franquiciados en Bolivia.** Solo tengo las condiciones de oferta de Juan Valdez de 2013 [S8]. No hay datos de resultados de franquiciados bolivianos.
- **Resultados empíricos sobre rentabilidad de franquiciados.** No encontré un estudio abierto que mida cómo los niveles de regalía y de aporte a publicidad afectan el margen de los franquiciados. Los rangos de regalía (4% a 8%) y publicidad (2% a 5%) de otra fuente de 2026 aparecieron solo en resúmenes de búsqueda; no los usé como dato.
- **Un estudio de una empresa de software** (FranConnect) mencionó que 94% de los franquiciantes cobran regalías y que derechos de entrada más altos se asocian a mayores ventas por unidad; abrí un artículo suyo y no contenía cifras. No usar.
- **Relación de unidades por persona de soporte (10 a 20) y horas para armar un manual (más de 2.000).** Aparecieron en resúmenes de búsqueda de consultoras; no abrí las páginas. Si se usan en el motor, deben marcarse como supuesto.
- **Libros.** Solo confirmé en ficha editorial el de Blair y Lafontaine [S7]; no lo leí. No verifiqué otros libros de franquicia (ni manuales latinoamericanos).
- **Desai [S4], Bates [S5], Kalnins [S6].** Solo vi el resumen. No sé si hay matices en el texto completo. Además, Bates y Kalnins usan datos de EE.UU. de los años 80-90; Kalnins estudia hoteles de Texas. Su extrapolación a Bolivia es interpretación mía.
- **Casos de franquicias en Bolivia con conflicto** (Burger King, Subway, Pollos Copacabana): no encontré fuentes que documenten disputas con franquiciados bolivianos. El caso de Costa Rica [S10] es de otro país.
- **Por qué salió McDonald's de Bolivia.** La versión oficial (plan internacional de salir de países poco rentables) es de [S9]. La tesis cultural y el dato del precio (menú de 3 dólares frente a un almuerzo de menos de 1) viene de un documental citado por prensa; no vi el documental ni una fuente financiera.
- **Registro de Comercio y Cainco.** Una nota de 2013 [S8] dice que Cainco recomienda inscribir voluntariamente el contrato en el Registro de Comercio; no verifiqué si sigue vigente ni qué efectos tiene.
- **Regulación laboral y tributaria** de la relación franquiciante-franquiciado en Bolivia (por ejemplo, retenciones por regalías pagadas al exterior): no investigué.
- **Same-store sales y otras métricas de práctica.** La fórmula de ventas en mismas unidades es práctica de industria; no la confirmé en una fuente abierta específica.

---

## 10. Cifras que necesitan validación local

| Cifra (estimación mía salvo indicación) | Dónde se usa | Quién podría aportarla |
|---|---|---|
| Tasa de regalía y de aporte a publicidad en franquicias que operan en Bolivia (la única que tengo es 7% + 2% de Juan Valdez en 2013 [S8], de otra época) | Situaciones 5.1, 5.2, 5.3; variables `tasa_regalia`, `tasa_publicidad` | Cafran; franquiciantes y franquiciados locales; abogados de franquicias |
| Derecho de entrada típico por rubro en Bolivia (15.000 a 30.000 dólares en un caso de 2013 [S8]) | Variable `derecho_entrada` | Cafran; empresarios franquiciantes |
| Inversión inicial por rubro (gastronomía, retail, servicios) en Bolivia (50.000 a más de 300.000 dólares en un caso de 2013 [S8]) | Inversión del proyecto | Cafran; docentes de finanzas; empresarios del rubro |
| Caída de ventas del primer año frente a la proyección (-20% a -35%) | 5.1 | Franquiciados con 2-3 años de operación |
| Pérdida de ventas por una unidad cercana (-5% a -15%) | 5.4, `canibalizacion` | Franquiciantes con varias unidades por ciudad |
| Aumento del costo de insumos (+4% a +10%) y su peso en dólares | 5.5 | Empresarios de gastronomía y retail; IBCE o Cainco para tipo de cambio |
| Tasa anual de cierres de unidades franquiciadas en Bolivia | Variable `tasa_cierre` | Cafran; datos de franquiciantes (equivalente al Ítem 20 estadounidense [S2]) |
| Evasión de regalías (3% a 10% del potencial) | 5.7 | Franquiciantes con auditoría |
| Sobrecostos de estandarización (+30% a +80%) y demora (+3 a +9 meses) | 5.11 | Consultores de franquicias; empresarios que franquiciaron |
| Costo de remodelaciones (8% a 20% de la inversión) y cierre temporal | 5.12 | Franquiciados con experiencia en remodelación |
| Pérdida de ventas al cambiar de marca por no renovación (-30% a -60%) | 5.8 | Empresarios que dejaron una franquicia |
| Costo de soporte por unidad y relación unidades/persona | 5.10, `costo_soporte` | Franquiciantes en crecimiento |
| Retraso entre la venta y la apertura de una unidad | `pipeline_aperturas` | Franquiciantes |
| Costo y plazos reales de una disputa en justicia ordinaria vs. arbitraje en Bolivia | 5.14 | Abogados comerciales; Cámara Nacional de Comercio (centro de arbitraje) |
| Efecto del fondo de publicidad mal usado vs. bien usado (-3% a +8% de ventas) | 5.3 | Franquiciantes con fondos; agencias de marketing |
| Requisitos y costos del SENAPI para inscribir una licencia o franquicia | Sección 9 | Abogados de propiedad intelectual; SENAPI |
| Tasa de supervivencia a 5 años de franquicias en Bolivia | VAN del franquiciante | Cafran; datos de camaras de comercio |
