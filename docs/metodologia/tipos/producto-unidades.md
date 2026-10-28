# Producto por unidades (fabricar, comprar y vender bienes físicos): ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que yo la abrí y leí (el alcance de lo leído está en esa sección).
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es cita.
- Una magnitud marcada **(estimación)** la puse yo para que el simulador tenga un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro país, otro sector, otra fecha), así que tampoco es un parámetro "verdadero" para Bolivia.
- Las fórmulas marcadas **(de memoria)** las reconstruí de conocimiento general; no las confirmé en una fuente abierta. Verifícalas antes de implementarlas.
- Lo que no pude verificar está en la sección 9; las cifras que hay que validar con gente local, en la sección 10.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto de producto por unidades fabrica, compra o ambas cosas, y vende bienes físicos que se cuentan: panes, cafés servidos, prendas, cajas de detergente, repuestos. El ingreso es "unidades vendidas x precio", y el costo tiene una parte que sube con cada unidad (insumos, mano de obra directa, empaque) y otra que no (alquiler, sueldos fijos, depreciación). Entran en esta familia cafeterías, panaderías, fábricas pequeñas, comercios y distribuidoras.

**Cómo aporta valor.** Hay tres fuentes de valor, y las tres se pueden perder:

1. **Margen por unidad.** La diferencia entre el precio y el costo variable por unidad (margen de contribución) paga los costos fijos y, si sobra, deja utilidad [S1].
2. **Rotación.** El mismo dinero invertido en mercadería se recupera y se reinvierte varias veces al año. Un negocio con margen chico puede ser muy bueno si rota rápido (interpretación mía).
3. **Escala y poder de negociación.** Comprar más baja el costo unitario o consigue mejores plazos con el proveedor, pero exige más capital en inventario (interpretación mía, apoyada en el modelo de lote económico, S2).

**Qué lo hace distinto de otros tipos.** A diferencia de una suscripción, aquí cada mes hay que *volver a vender*; no hay una base de clientes que pague sola. A diferencia de un servicio, hay un **inventario**: dinero convertido en mercadería que puede venderse, vencerse, perderse o quedar inmóvil. Y entre que pagas al proveedor y cobras al cliente pasa un tiempo que hay que financiar (capital de trabajo). En Bolivia se suman tres presiones específicas que aparecen en las fuentes: dólares escasos para insumos importados [S15], precios regulados o subvencionados en ciertos productos [S11, S12] y competencia informal fuerte [S5].

---

## 2. Indicadores propios y cómo se calculan

Convención: **mes t** salvo que se diga otra cosa.

### 2.1 Margen y punto de equilibrio

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Margen de contribución por unidad** | Precio por unidad - costo variable por unidad | [S1]; ejemplo del libro: 100 - 20 = 80 |
| **Razón de margen de contribución** | Margen de contribución / ventas | [S1]; ejemplo: 400 / 1.250 = 32% |
| **Punto de equilibrio en unidades** | Costos fijos / margen de contribución por unidad | [S1]; ejemplo: 18.000 / 80 = 225 unidades |
| **Punto de equilibrio en dinero** | Costos fijos / razón de margen de contribución | [S1] (el libro usa el ejemplo 18.000 / 0,80 = 22.500, con margen de 80%) |
| **Unidades para una utilidad objetivo** | (Costos fijos + utilidad deseada) / margen por unidad | [S1]; ejemplo: (18.000 + 16.000) / 80 = 425 |
| **Utilidad antes de impuesto para una utilidad neta deseada** | Utilidad neta / (1 - tasa de impuesto) | [S1] |
| **Margen de seguridad** | (Ventas reales - ventas de equilibrio) / ventas reales | (de memoria). [S1] no la define en la página que leí |
| **Apalancamiento operativo** | Margen de contribución total / utilidad operativa | (de memoria). Mide cuánto sube la utilidad por cada 1% que suben las ventas |

El libro aclara que en el punto de equilibrio "no ocurre ni ganancia ni pérdida porque Costo Total = Ingreso Total" [S1].

### 2.2 Inventario: cuánto pedir, cuándo pedir y cuánto colchón tener

Del curso de logística del MIT (Caplice y Sheffi), diapositivas de las clases 7 y 11 [S2, S3]:

| Indicador | Fórmula y significado | Fuente |
|---|---|---|
| **Costo total de inventario** | Compra + pedido + mantenimiento + faltantes. La parte relevante para decidir el tamaño del pedido: A·D/Q + v·r·Q/2 (A costo fijo por pedido, D demanda por período, v costo unitario, r costo de mantener por cada unidad monetaria guardada por período, Q tamaño del pedido) | [S2] |
| **Lote económico (EOQ)** | Q* = raíz cuadrada de (2·A·D / (v·r)) | [S2] |
| **Intervalo óptimo entre pedidos** | T* = raíz cuadrada de (2·A / (D·v·r)) | [S2] |
| **Punto de reorden** | s = demanda esperada durante el plazo de entrega + k · desviación del error de pronóstico en ese plazo | [S3] |
| **Stock de seguridad** | SS = k · desviación del error de pronóstico durante el plazo de entrega (k sube con el nivel de servicio que quieres) | [S3] |
| **Nivel de servicio por ciclo (CSL o P1)** | Probabilidad de no quedarte sin stock en un ciclo de reposición = P[demanda en el plazo <= s] | [S3] |
| **Tasa de cumplimiento (fill rate, P2)** | Fracción de la demanda atendida con stock disponible = 1 - (faltante esperado por ciclo / Q) | [S3] |

Lo que el curso destaca: el costo total es **poco sensible** a errores en Q, en la demanda o en los parámetros de costo; por eso el EOQ se usa pese a sus supuestos restrictivos, y sirve como punto de partida [S2]. Sus supuestos básicos incluyen demanda constante y conocida, entrega instantánea y sin faltantes [S2]; ninguno se cumple del todo en un negocio real, y eso es lo que el simulador debe enseñar.

Otras fórmulas de inventario que no confirmé en fuente abierta:

- **Rotación de inventario** = costo de ventas del período / inventario promedio (de memoria).
- **Cobertura en días** = inventario / (costo de ventas diario). Es el DIO de la sección 2.3.
- **Merma (%)** = unidades (o valor) perdidas por vencimiento, rotura o robo / unidades (o valor) disponibles (de memoria).
- **Decisión de una sola compra con producto perecible (modelo del "vendedor de periódicos")**: pedir hasta el punto donde la probabilidad de vender todo iguala Cu/(Cu+Co), con Cu = ganancia perdida por cada unidad que faltó y Co = pérdida por cada unidad que sobró (de memoria; los apuntes del MIT sobre este tema no pude abrirlos, sección 9).

### 2.3 Capital de trabajo y ciclo de caja

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Días de inventario (DIO)** | Inventario promedio / costo de ventas x 365 | [S10] (artículo de enciclopedia; nivel C) |
| **Días de cobro (DSO)** | Cuentas por cobrar promedio / ventas x 365 | [S10] |
| **Días de pago (DPO)** | Cuentas por pagar promedio / compras x 365 | [S10] |
| **Ciclo de conversión de efectivo (CCC)** | DIO + DSO - DPO | [S10]. Cuanto más largo, más dinero tienes que financiar |
| **Capital de trabajo no efectivo / ventas** | (Cuentas por cobrar + inventario - cuentas por pagar, aproximado) / ventas. Damodaran no lo define en la página; la fila de datos sugiere esa lectura (inferencia mía) | [S4] |

Datos de referencia de [S4] (empresas de EE. UU., enero de 2026; solo sirven como orden de magnitud):

| Sector | Cobrar/ventas | Inventario/ventas | Pagar/ventas | Capital de trabajo no efectivo/ventas |
|---|---|---|---|---|
| Comercio minorista, alimentos | 1,75% | 5,49% | 5,92% | 0,06% |
| Comercio minorista, general | 3,50% | 8,67% | 11,89% | -0,11% |
| Procesamiento de alimentos | 7,76% | 13,41% | 12,14% | 6,68% |
| Distribuidores | 12,83% | 16,67% | 10,51% | 17,43% |
| Ropa | 12,53% | 19,25% | 9,24% | 24,38% |

Lectura (interpretación mía): un supermercado casi no necesita capital de trabajo porque cobra al contado y paga a plazo; un distribuidor que da crédito a tiendas necesita inmovilizar cerca de 17 centavos por cada boliviano de ventas anuales (en EE. UU.). Para Bolivia no hay dato verificado.

### 2.4 Indicadores de pérdida y de entorno

- **Merma por robo y error ("shrink")**: el gremio minorista de EE. UU. (NRF) reportó 1,44% de las ventas en 2021 y un promedio de cinco años de 1,5% [S9]. Un resumen de búsqueda que no abrí da 1,6% para 2022 y una división por causas (robo externo 36%, robo interno 29%, errores de proceso 27%); eso **no lo uso como dato** (sección 9).
- **Obstáculos del entorno**: en la Encuesta de Empresas del Banco Mundial para Bolivia (2017, 364 establecimientos de manufactura y servicios), la respuesta más frecuente a "cuál es el mayor obstáculo" fue **las prácticas de competidores del sector informal (23,9%)**, luego regulaciones laborales (11,8%), administración tributaria (11,3%) y tasas de impuestos (9,3%). Acceso a financiamiento fue 4,4%. El propio sitio advierte que son conteos de casos de la muestra, no estadísticas de la población [S5].

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Resumen.** Aquí el VAN clásico funciona bien; es el tipo para el que se diseñó. El riesgo no está en la herramienta sino en cómo se arma el flujo. Hay cuatro puntos donde el VAN "plano" se queda corto en un negocio de unidades.

1. **El capital de trabajo es inversión, no gasto.** Inventario y cuentas por cobrar son dinero inmovilizado, y su aumento sale de la caja aunque la utilidad contable sea positiva. Si el crecimiento de ventas exige más inventario, parte de la utilidad se "queda en el almacén". Esto se ve con el ciclo de conversión de efectivo y con la proporción capital de trabajo / ventas [S4, S10]. Evidencia empírica de que importa: un estudio con 1.009 empresas belgas (1992-1996) encontró que acortar los días de cobro y de inventario se asociaba con más rentabilidad, y que las empresas menos rentables tardaban más en pagar a proveedores [S6, solo resumen del artículo]. Es otro país y otra época.
2. **Un flujo anual promedio esconde los meses en que se acaba la caja.** Por estacionalidad y por el desfase entre pagar insumos y cobrar, el mínimo de caja del año puede ser negativo aunque el flujo anual sea positivo. El simulador mes a mes lo muestra, pero la evaluación inicial del alumno debe incluir un *colchón de caja* (interpretación mía; las plantillas del simulador ya traen un 25% de colchón según el último commit del proyecto).
3. **Inflación y tipo de cambio.** Si el flujo se proyecta en bolivianos corrientes, la tasa de descuento debe incluir la inflación esperada; si se proyecta en bolivianos constantes, la tasa debe ser real. En Bolivia la inflación pasó de 20,4% en 2025 a una proyección del BCB de 9,2% para 2026 [S13], por lo que mezclar ambas bases cambia el VAN de forma importante (interpretación mía sobre el dato).
4. **Sensibilidad en las variables que realmente se mueven.** Para este tipo conviene sensibilizar: volumen, precio, costo del insumo clave (sobre todo si es importado), merma y días de cobro. El punto de equilibrio y el margen de seguridad [S1] complementan al VAN: dicen cuánto pueden caer las ventas antes de perder dinero.

**Qué agregar al análisis:**

| Complemento | Qué responde | Fuente |
|---|---|---|
| Punto de equilibrio y margen de seguridad | Cuánto puede caer la venta antes de perder | [S1] (el margen de seguridad, de memoria) |
| Ciclo de conversión de efectivo y necesidad de capital de trabajo | Cuánta plata hace falta antes de que el negocio se financie solo | [S4, S10] |
| Mínimo de caja mensual | Si el negocio sobrevive al peor mes | Interpretación mía |
| Nivel de servicio contra costo de inventario | Cuánto stock extra vale la pena tener | [S3] |
| VAN con escenarios de costo importado | Qué pasa si el dólar de los insumos sube | Interpretación mía, motivada por [S15] |

**Lo que no se debe hacer:** comparar el margen o la rotación con los de otro país o sector sin mirar el contexto (por ejemplo, los datos de [S4] son de EE. UU.; un almacén de barrio boliviano que fía a sus clientes puede tener un perfil muy distinto).

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Nota de método: no encontré un estudio abierto sobre errores de estudiantes bolivianos en proyectos de unidades. La lista mezcla lo que dicen las fuentes (marcado) con práctica común o interpretación mía (sin marca).

**Errores de cálculo (estudiantes)**

1. **Confundir utilidad con caja.** Ignorar que el inventario y las cuentas por cobrar consumen caja. [S4] y [S10] dan los instrumentos para verlo.
2. **Costear con un solo costo unitario fijo.** Si el insumo sube (o es importado), el costo unitario cambia mes a mes y el margen se erosiona sin que el precio se mueva.
3. **Poner el costo fijo como variable o al revés.** El punto de equilibrio [S1] depende de separar bien los dos.
4. **Suponer demanda constante y entrega instantánea.** Son los supuestos del modelo básico de lote económico [S2], que casi nunca se cumplen; con demanda incierta hace falta stock de seguridad [S3].
5. **Cero merma.** Todo lo comprado se vende. En perecibles y en comercio hay pérdidas; el gremio minorista de EE. UU. mide cerca de 1,4% a 1,5% de las ventas solo por robo y error [S9].
6. **Mismo precio todos los años pese a la inflación.** O subir precio sin considerar la reacción de la demanda.
7. **Olvidar el costo de mantener inventario** (capital inmovilizado, almacenaje, vencimiento): es la mitad de la fórmula del lote económico [S2].
8. **Capital de trabajo cero en el mes 0.** Abrir con los estantes llenos pero sin plata para reponer.
9. **Estacionalidad plana.** Dividir la venta anual por 12.

**Errores de emprendedores**

1. **Comprar de más por el descuento por volumen** sin contar el dinero parado y el riesgo de vencimiento. [S2] muestra que el costo total es poco sensible al tamaño del pedido cerca del óptimo, así que un descuento chico no justifica un pedido enorme (interpretación mía).
2. **Pedir de más "por si acaso" ante rumores de escasez.** [S8] describe que cuando los compradores esperan racionamiento inflan sus pedidos y distorsionan la señal de demanda en toda la cadena.
3. **Comprar por oferta y no por necesidad** ("forward buying"): cuando los precios cambian seguido, se compra mucho cuando están bajos y poco cuando están altos [S8].
4. **Dar crédito a clientes sin medir el plazo de cobro.** Ejemplo real en Bolivia: Companex, distribuidora de consumo masivo, a veces extiende crédito en mercadería a sus clientes y su capital de trabajo se destina a comprar mercadería [S7]; el crédito al cliente es una decisión de financiamiento, no un favor.
5. **Depender de un solo proveedor o de un solo cliente.**
6. **Fijar el precio mirando solo los costos propios** y no el precio del competidor informal [S5].
7. **No cobrar el IVA o la factura correctamente**, o ignorar que el comprador pide factura (no lo verifiqué en fuentes bolivianas; sección 9).
8. **Ignorar el riesgo de abastecimiento propio de Bolivia**: bloqueos, escasez de combustible y de dólares [S14, S15].

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **[Sn]** si viene de fuente, **(estimación)** si es mía); decisiones posibles con ventajas y costos; qué aprende el alumno.

Las magnitudes de las fuentes vienen de contextos concretos (fecha, sector, país). Las marcadas "estimación" conviene calibrarlas antes de implementarlas (sección 10).

---

### Situación 1. Falta de dólares: el insumo importado sube de precio

**Qué pasa.** El negocio usa insumos importados (harina especial, envases, repuestos, mercadería terminada). Los bancos no venden dólares al tipo de cambio oficial con facilidad, y el importador paga más, ya sea por una comisión o por comprar en el mercado paralelo. Bloomberg Línea (mayo de 2024) reportó que la comisión bancaria por vender dólares a importadores subió de cerca de 12-14% a más de 25% según un banco de inversión, y que los cambistas informales vendían 10% a 12% sobre el oficial [S15]. En 2026 se discute unificar el tipo de cambio; no pude confirmar si ocurrió (sección 9).

**Variables que mueve.**
- Costo del insumo importado: sube (estimación: +10% a +30% en bolivianos; el rango se apoya en las cifras de [S15], que son de 2024).
- Margen por unidad: baja si el precio no se mueve.
- Disponibilidad del insumo: baja a veces (productos que "no llegan") [S15].
- Costo de reposición contra costo histórico del inventario: se separan (el stock viejo es más barato que el que vas a comprar).

**Decisiones del alumno.**
1. *Subir el precio de inmediato.* Ventaja: protege el margen. Costo: la demanda baja, y el competidor informal o con stock viejo queda más barato [S5].
2. *Absorber el costo unos meses.* Ventaja: no pierdes clientes. Costo: el margen se achica o desaparece, y la caja se debilita.
3. *Cambiar a un insumo local o sustituto.* Ventaja: pagas en bolivianos y no dependes del dólar. Costo: puede bajar la calidad o exigir ajustar el producto; puede haber costo de adaptación.
4. *Comprar por adelantado todo el stock que puedas.* Ventaja: congelas el costo. Costo: inmovilizas caja, corres riesgo de vencimiento y repites el comportamiento de "compra por pánico" de [S8].

**Qué aprende.** Que el costo de reposición manda sobre el costo histórico, y que el margen depende de una variable (el dólar) que el proyecto no controla.

---

### Situación 2. Precio regulado o subvencionado: el insumo sube y el precio de venta no puede

**Qué pasa.** Hay productos con precio de venta fijado por acuerdo con el Estado, como el pan de batalla. En enero de 2025 los panificadores aceptaron mantener el pan de batalla en Bs 0,50 y el pan corriente en Bs 0,40, a cambio de harina subvencionada y de azúcar, manteca y levadura a precio referencial [S11]. Un dirigente había dicho antes que el quintal de harina subió de 210 a 250 bolivianos [según la búsqueda; el dato lo vi en un resumen de búsqueda, no en el artículo abierto, así que no es dato firme]. En abril de 2025 algunos panificadores de Santa Cruz subieron el pan a Bs 1; otros mantuvieron Bs 0,50 pero con pan más chico [S12]. Es un ejemplo de producto cuyo precio no controla el emprendedor.

**Variables que mueve.**
- Precio de venta: fijo o con tope.
- Costo de insumos: sube (el aumento de harina de 210 a 250 es +19%, dato de resumen de búsqueda no verificado).
- Margen: baja.
- Peso o tamaño por unidad: baja si el emprendedor "achica" el producto [S12].
- Reputación: baja si el cliente nota el cambio.

**Decisiones del alumno.**
1. *Aceptar el acuerdo y la harina subvencionada.* Ventaja: costo controlado, relación con el Estado. Costo: precio atado, riesgo de que el subsidio cambie, dependencia de un solo proveedor estatal [S12 menciona que Emapa entrega la harina].
2. *Subir el precio por tu cuenta.* Ventaja: recuperas margen. Costo: pierdes clientes frente a quienes mantienen el precio; riesgo de conflicto con el gremio o con autoridades (en Santa Cruz el alza fue calificada de "exagerada" por la confederación nacional, según un resumen de búsqueda; no abrí esa nota).
3. *Achicar el producto.* Ventaja: mantienes el precio nominal. Costo: el cliente lo nota; la marca se deteriora [S12].
4. *Diversificar a productos de precio libre (pasteles, pan especial).* Ventaja: margen mayor y precio propio. Costo: inversión, otra clase de clientes, más merma.

**Qué aprende.** Que cuando el precio no se mueve, el margen se defiende con mezcla de productos, eficiencia o tamaño, y que cada salida tiene un costo con el cliente.

---

### Situación 3. Bloqueos: el proveedor no llega y los clientes tampoco

**Qué pasa.** Los bloqueos de carreteras interrumpen el transporte de insumos y de producto terminado. En mayo de 2026, la Cámara Nacional de Industrias y otras cámaras estimaron pérdidas de 50 a 60 millones de dólares diarios para el país con unos 40 puntos de bloqueo, y advirtieron de posible desabastecimiento en mercados y mayores costos logísticos [S14]. Son estimaciones de gremios con interés en el tema, no mediciones oficiales.

**Variables que mueve.**
- Entrega de insumos: se retrasa (plazo de entrega sube; estimación: de 2 días a 7-15 días en el mes de bloqueo).
- Ventas: caen si no hay producto, o caen porque los clientes no llegan (estimación: -20% a -60% en el mes más duro, según la zona).
- Costo de transporte: sube [S14].
- Stock: baja rápido si no hay reposición.

**Decisiones del alumno.**
1. *Tener un colchón de stock (stock de seguridad más alto).* Ventaja: sigues vendiendo cuando otros no. Costo: capital inmovilizado y riesgo de vencimiento todo el año, no solo en el mes de bloqueo [S3 da la relación entre nivel de servicio y stock de seguridad].
2. *Buscar un proveedor local alternativo.* Ventaja: reduces dependencia del tramo bloqueado. Costo: puede ser más caro o de menor calidad.
3. *Aprovechar la escasez para subir el precio.* Ventaja: más margen por unidad. Costo: daño a la reputación, posible reacción de la autoridad; aparece como "especulación" para el cliente.
4. *Parar y esperar.* Ventaja: no gastas. Costo: los costos fijos siguen corriendo y los clientes se van a quien sí tenía.

**Qué aprende.** Que el stock de seguridad es un seguro y que se paga todos los meses para usarlo pocas veces.

---

### Situación 4. Inflación: ¿cuánto del aumento de costos trasladas al precio?

**Qué pasa.** Los costos suben de forma general. El BCB proyecta una inflación de 9,2% para 2026, menos de la mitad del 20,4% de 2025, y reconoce que el ajuste del diésel puede trasladarse a los precios de bienes en el último trimestre [S13]. El alumno debe decidir cuándo y cuánto ajustar el precio.

**Variables que mueve.**
- Costos variables y fijos: suben (la magnitud de referencia es la inflación anual proyectada [S13]; para insumos concretos puede ser distinta).
- Demanda: baja si subes el precio (la elasticidad depende del producto; estimación: -0,5 a -1,5 por cada +1% de precio).
- Margen: baja si no ajustas.
- Capital de trabajo requerido: sube, porque hay que financiar inventario más caro.

**Decisiones del alumno.**
1. *Subir el precio poco y seguido.* Ventaja: el cliente casi no lo nota. Costo: más trabajo (listas, etiquetas), riesgo de ir detrás de la inflación.
2. *Subir de una vez, fuerte.* Ventaja: te ahorras ajustes. Costo: un salto grande puede espantar clientes.
3. *Mantener el precio y recortar costos o calidad.* Ventaja: conservas la clientela. Costo: el producto empeora (reputación) o se agotan los recortes posibles.
4. *Vincular el precio al costo para clientes mayoristas (cláusula de ajuste).* Ventaja: protege el margen en ventas grandes. Costo: negociación difícil; el cliente puede irse a un proveedor sin cláusula.

**Qué aprende.** Que no ajustar el precio también es una decisión con costo, y que la inflación consume capital de trabajo.

---

### Situación 5. Competencia informal y contrabando con precios más bajos

**Qué pasa.** Vendedores sin factura, sin impuestos o con mercadería de contrabando ofrecen el mismo tipo de producto más barato. En la encuesta del Banco Mundial a empresas de Bolivia (2017), el 23,9% de los establecimientos de la muestra nombró las prácticas de competidores informales como su mayor obstáculo [S5]. Una nota de prensa (que no abrí completa) atribuye a gremios estimaciones de contrabando de más de 3.000 millones de dólares al año; son cifras de cámaras, no consolidadas, y no las uso como dato (sección 9).

**Variables que mueve.**
- Demanda sensible al precio: se desplaza hacia el informal (estimación: -10% a -25% de unidades en el segmento más sensible al precio).
- Precio de venta posible: baja.
- Cuota de mercado: baja.
- Costos de cumplimiento (factura, impuestos): se mantienen, así que el margen del formal se comprime.

**Decisiones del alumno.**
1. *Bajar el precio para competir.* Ventaja: frena la fuga. Costo: margen chico; si el informal puede bajar más, pierdes igual.
2. *Diferenciar (calidad, garantía, factura, servicio).* Ventaja: segmento que valora lo formal (empresas que piden factura). Costo: inversión y un mercado más chico.
3. *Cambiar el foco a clientes que exigen factura (empresas, instituciones).* Ventaja: estabilidad. Costo: más crédito (plazos de cobro largos) y mayor exigencia.
4. *Aceptar menor volumen y bajar costos fijos.* Ventaja: sobrevives con menos. Costo: el negocio se achica.

**Qué aprende.** Que la competencia no siempre es otro formal con tus mismas reglas, y que diferenciarse cuesta pero puede ser la única defensa.

---

### Situación 6. Merma de perecibles: se vence lo que no se vende

**Qué pasa.** El negocio vende productos con fecha de vencimiento o de calidad (pan, lácteos, fruta, platos preparados). Si compras o produces de más, lo que sobra se pierde; si compras de menos, pierdes ventas. En FAO (informe de 2019 sobre pérdida de alimentos), según un resumen de búsqueda que no pude abrir, las frutas y verduras tienen pérdidas más altas que cereales y legumbres en toda la cadena; **no uso cifras de ese informe** (sección 9).

**Variables que mueve.**
- Merma (% del inventario): sube con el sobrestock (estimación: 3% a 10% de lo comprado en perecibles de vida corta; sin fuente local).
- Costo de ventas: sube porque pagaste por unidades que no vendiste.
- Ventas perdidas: suben si pides poco (faltantes).
- Reputación: baja si vendes producto viejo.

**Decisiones del alumno.**
1. *Pedir (o producir) poco, ajustado al día típico.* Ventaja: casi sin merma. Costo: faltantes en los días buenos y clientes que se van.
2. *Pedir de más para no fallar.* Ventaja: nivel de servicio alto. Costo: merma alta que se come el margen. La lógica es la del vendedor de periódicos: compara el costo de que sobre contra el costo de que falte (fórmula de la sección 2.2, de memoria).
3. *Rematar al final del día o hacer una promoción.* Ventaja: recuperas parte del costo. Costo: acostumbras al cliente a esperar el descuento y canibalizas ventas a precio completo.
4. *Invertir en conservación o en producir según pedido.* Ventaja: menos merma. Costo: inversión (refrigeración, sistema de pedidos), y menos oferta de impulso.

**Qué aprende.** Que no hay un nivel de stock "correcto": es un equilibrio entre dos errores con costos distintos, y que el margen unitario alto justifica más stock.

---

### Situación 7. Temporada fuerte: se quiebra el stock justo cuando más se vende

**Qué pasa.** Antes de una fecha de alta demanda (fin de año, aguinaldo, inicio de clases, Carnaval; la estacionalidad boliviana concreta no la verifiqué) la demanda sube mucho. Si no se anticipa la compra, el negocio se queda sin producto; si se anticipa demasiado, queda stock inmóvil después de la fecha. Un modelo básico de inventario con demanda constante [S2] no sirve aquí: hay que calcular el stock de seguridad con la variabilidad de la demanda [S3].

**Variables que mueve.**
- Demanda del mes: sube (estimación: +30% a +100% sobre un mes normal, según el rubro).
- Faltantes: aparecen si el pedido fue corto; se pierden ventas.
- Inventario posterior: queda alto si el pronóstico fue exagerado.
- Caja: se tensa antes de la temporada (hay que comprar antes de vender).

**Decisiones del alumno.**
1. *Comprar mucho antes, con financiamiento.* Ventaja: no pierdes ventas. Costo: intereses, riesgo de que la temporada salga floja.
2. *Comprar el stock "probable" y reponer sobre la marcha.* Ventaja: menos capital inmovilizado. Costo: si el proveedor se retrasa o no tiene, pierdes ventas.
3. *Pactar con el proveedor entregas parciales o consignación.* Ventaja: reparte el riesgo. Costo: precio unitario mayor o condiciones más duras.
4. *Vender por pedido anticipado (preventa con anticipo).* Ventaja: sabes cuánto comprar y cobras antes. Costo: promesas que hay que cumplir y menos venta de impulso.

**Qué aprende.** Que la caja necesaria llega antes que el ingreso, y que el mayor riesgo de una temporada es compra mal calibrada.

---

### Situación 8. El proveedor único sube el precio o cambia las condiciones

**Qué pasa.** Un proveedor clave sube precios, acorta el plazo de pago o impone un pedido mínimo mayor. Si dependes de él, tienes poco poder de negociación. En el simulador esto es especialmente doloroso para quien eligió un solo proveedor para tener "mejor precio".

**Variables que mueve.**
- Costo unitario: sube (estimación: +5% a +15%).
- Plazo de pago: baja (estimación: de 30 a 15 días), lo cual alarga el ciclo de caja (DPO baja, CCC sube [S10]).
- Pedido mínimo: sube, y con él el inventario promedio.
- Riesgo de desabastecimiento: sube.

**Decisiones del alumno.**
1. *Aceptar las nuevas condiciones.* Ventaja: sigues operando sin fricción. Costo: margen y caja más débiles; poder de negociación aún menor.
2. *Buscar un segundo proveedor.* Ventaja: reduces dependencia. Costo: tiempo de búsqueda, mínimos más chicos y mayor costo por unidad, posible calidad distinta.
3. *Integrar hacia atrás (producir tú el insumo).* Ventaja: control. Costo: inversión, conocimiento y escala que quizás no tienes.
4. *Consolidar compras con otros negocios similares.* Ventaja: poder de compra. Costo: coordinación y confianza; poco común en la práctica pequeña.

**Qué aprende.** Que el plazo de pago al proveedor es parte del financiamiento del negocio y que depender de uno solo tiene precio.

---

### Situación 9. Rumor de escasez o de alza: la tentación de comprar por pánico

**Qué pasa.** Circula la noticia de que va a faltar un producto o a subir su precio (por combustible, dólar, bloqueos). En Bolivia hubo en 2026 largas filas por diésel y reclamos de alza de precios de alimentos, según notas de prensa que vi como resumen de búsqueda (no abiertas). La teoría de cadenas de suministro describe el comportamiento: cuando los compradores esperan racionamiento inflan sus pedidos, lo que distorsiona la señal de demanda río arriba, y cuando los precios cambian seguido se compra de más cuando están bajos ("forward buying") [S8].

**Variables que mueve.**
- Inventario: sube (estimación: +50% a +150% de la cobertura normal).
- Caja: baja por la compra grande.
- Costo unitario de lo comprado: puede bajar si el precio se congela antes del alza (estimación: -5% a -15% respecto del precio futuro).
- Riesgo de que el rumor no se cumpla: queda stock caro e inmóvil.

**Decisiones del alumno.**
1. *Comprar mucho ahora.* Ventaja: si el rumor es cierto, ganas margen y aseguras abastecimiento. Costo: inmovilizas caja; si el rumor era falso, tienes stock de más y menos plata para lo demás.
2. *Comprar un poco más de lo normal.* Ventaja: riesgo moderado. Costo: ganas poco si el alza es fuerte.
3. *No cambiar el comportamiento.* Ventaja: no apuestas. Costo: si el alza ocurre, pagas el nuevo precio completo.
4. *Pactar con el proveedor un precio fijo por un plazo.* Ventaja: te cubres sin inmovilizar tanto. Costo: el proveedor puede pedir un precio más alto como prima o un anticipo.

**Qué aprende.** Que comprar por miedo es una apuesta financiada con el capital de trabajo, y que el efecto agregado de muchos compradores asustados empeora la escasez [S8].

---

### Situación 10. Un cliente mayorista pide crédito a 60 días

**Qué pasa.** Un comprador grande (tienda, restaurante, supermercado) ofrece un pedido importante, pero quiere pagar a 30, 60 o 90 días. El pedido sube las ventas, pero el cobro se demora. Así funciona el negocio de las distribuidoras: Companex atiende unas 19.000 microempresas, mayormente tiendas de barrio, y en algunos casos les da crédito en mercadería; su préstamo de BID Invest de 2019 se destinó a comprar mercadería como parte importante de su capital de trabajo [S7].

**Variables que mueve.**
- Ventas: sube (estimación: +20% a +50% del volumen mensual con un cliente grande).
- Cuentas por cobrar: sube y alarga el DSO [S10].
- Caja: baja a corto plazo aunque la utilidad suba.
- Riesgo de impago: sube (estimación: 2% a 5% del monto vendido a crédito no se cobra o se cobra tarde).
- Precio medio: baja si el cliente negocia descuento.

**Decisiones del alumno.**
1. *Aceptar a 60 días.* Ventaja: volumen y presencia. Costo: necesitas financiar 60 días de ventas; si el cliente paga tarde, te ahoga.
2. *Aceptar a 30 días con descuento por pronto pago.* Ventaja: menos capital inmovilizado. Costo: menor margen y puede que el cliente no acepte.
3. *Rechazar o pedir pago al contado.* Ventaja: caja sana. Costo: pierdes la venta y quizás el cliente.
4. *Aceptar y financiarte con una línea de crédito.* Ventaja: haces la venta. Costo: intereses; si el cobro se atrasa, los intereses se comen el margen.

**Qué aprende.** Que vender no es cobrar y que el ciclo de conversión de efectivo [S10] es una restricción tan real como el margen.

---

### Situación 11. Pérdida desconocida: faltantes de inventario, robo o errores

**Qué pasa.** Al hacer el conteo físico, el inventario real es menor al que dicen los registros. Las causas son robo de clientes, robo interno, errores de recepción o de registro. El gremio minorista de EE. UU. mide esa pérdida en 1,44% de las ventas en 2021 y 1,5% como promedio de cinco años [S9]. En un negocio pequeño sin control puede ser mayor (estimación).

**Variables que mueve.**
- Inventario real: baja respecto del registrado (estimación: 1% a 4% de las ventas en un comercio sin controles).
- Utilidad: baja en esa proporción.
- Costo de control (cámaras, conteos, personal): sube si decides invertir.
- Clima laboral: puede afectarse con medidas de control.

**Decisiones del alumno.**
1. *No hacer nada.* Ventaja: cero costo. Costo: la pérdida sigue y el margen real es menor al calculado.
2. *Invertir en controles (cámaras, conteos periódicos, caja separada).* Ventaja: baja la pérdida. Costo: inversión y gasto fijo; si la pérdida era chica, no se recupera.
3. *Cambiar procesos (recepción con doble verificación, inventario cíclico).* Ventaja: corrige errores de proceso, que pueden ser buena parte de la pérdida (según el resumen de NRF que no abrí, más de un cuarto). Costo: tiempo del equipo.
4. *Subir el precio para cubrir la pérdida.* Ventaja: protege el margen. Costo: traslada al cliente un problema interno.

**Qué aprende.** Que el margen en papel y el margen real difieren, y que medir primero es mejor que adivinar.

---

### Situación 12. Un competidor formal abre al lado o lanza una guerra de precios

**Qué pasa.** Una cadena o un negocio con más capital abre cerca y baja precios para ganar clientes. Tiene mayor poder de compra, así que su costo unitario es más bajo.

**Variables que mueve.**
- Ventas: bajan (estimación: -10% a -30% en los primeros meses).
- Precio de mercado: baja (estimación: -5% a -15%).
- Margen: baja si igualas.
- Gasto de marketing o promociones: sube.

**Decisiones del alumno.**
1. *Igualar el precio.* Ventaja: no pierdes clientes de golpe. Costo: margen chico mientras el rival aguanta; es una guerra que el de menor capital pierde.
2. *Mantener precio y diferenciarte (calidad, atención, cercanía, crédito a clientes conocidos).* Ventaja: margen sano en el segmento fiel. Costo: menor volumen.
3. *Especializarte en un nicho que el rival no atiende.* Ventaja: menos comparación directa de precio. Costo: mercado más chico y cambio de oferta.
4. *Asociarte o comprar en conjunto con otros pequeños.* Ventaja: más poder de compra. Costo: coordinación.

**Qué aprende.** Que la ventaja de escala en compras es real, y que un pequeño compite por cercanía o especialización, no por precio.

---

### Situación 13. Falla de equipo o de capacidad productiva

**Qué pasa.** En una fábrica o cocina, una máquina clave se rompe o la demanda supera la capacidad. Reparar toma días; mientras tanto no hay producto y los costos fijos siguen.

**Variables que mueve.**
- Producción: baja (estimación: -30% a -100% según el equipo y los días parado).
- Ventas perdidas o diferidas.
- Costo de reparación o de reemplazo (estimación: entre 3% y 20% del valor del equipo en una reparación; reemplazo, 100%).
- Horas extra o tercerización: sube el costo unitario.

**Decisiones del alumno.**
1. *Reparar rápido, aunque sea caro.* Ventaja: recuperas producción pronto. Costo: el gasto puede ser alto.
2. *Tercerizar la producción mientras tanto.* Ventaja: sigues vendiendo. Costo: mayor costo unitario y menor control de calidad.
3. *Comprar un equipo nuevo con más capacidad.* Ventaja: resuelve el cuello de botella. Costo: inversión grande, endeudamiento.
4. *Tener equipo de respaldo o mantenimiento preventivo (decisión previa).* Ventaja: reduce probabilidad de parada. Costo: gasto continuo cuyo beneficio es invisible mientras no pasa nada.

**Qué aprende.** Que el mantenimiento preventivo es un costo que evita un costo mayor y que un cuello de botella limita el resultado.

---

### Situación 14. Pedido grande de un supermercado o institución con condiciones duras

**Qué pasa.** Un supermercado o una institución ofrece comprar un volumen alto de forma regular, pero pide precio bajo, exclusividad de producto, factura, entregas frecuentes y pago a plazo. Representa una parte grande de tus ventas.

**Variables que mueve.**
- Volumen: sube (estimación: +30% a +100% del volumen de un negocio pequeño).
- Precio medio: baja (estimación: -10% a -20% respecto del precio de venta directa).
- Concentración de ventas: sube (el cliente pasa a ser, por ejemplo, 40% del ingreso).
- Capital de trabajo: sube por mayor inventario y cobro a plazo.
- Costo de logística: sube por entregas más frecuentes.

**Decisiones del alumno.**
1. *Aceptar todo.* Ventaja: volumen y estabilidad. Costo: margen bajo y dependencia; si el cliente se va o paga tarde, el golpe es grande.
2. *Aceptar con límites (tope de volumen, precio mínimo, plazo de pago máximo).* Ventaja: protege el margen. Costo: puede que no lo acepten.
3. *Rechazar y priorizar clientes pequeños con mejor precio.* Ventaja: diversificación y mejor margen. Costo: menor volumen y crecimiento más lento.
4. *Aceptar solo con una línea de producto dedicada.* Ventaja: no mezclas con el resto. Costo: inversión específica y riesgo.

**Qué aprende.** Que más ventas no siempre es mejor negocio y que hay que ver margen, capital de trabajo y concentración a la vez.

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

Nombres tentativos (los nombres reales los define el equipo de desarrollo). Cada variable se actualiza una vez por mes.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| **Inventario en unidades** (por línea de producto principal) | Lo que hay en el almacén | Inv. final = Inv. inicial + compras recibidas - ventas - merma. Las ventas no pueden superar lo disponible |
| **Costo unitario medio del inventario** | Lo que costó lo que tienes | Promedio ponderado entre el inventario viejo y las compras nuevas del mes |
| **Costo de reposición** | Lo que costaría comprar hoy | Costo base x factores de inflación, tipo de cambio y proveedor |
| **Demanda potencial** | Lo que los clientes querrían comprar | Demanda base x estacionalidad x reputación x efecto de precio relativo x eventos |
| **Ventas efectivas** | Lo que realmente vendes | Mínimo entre demanda potencial y stock disponible (y capacidad en fábricas). La demanda no atendida se pierde en parte (estimación: 50% a 80% se pierde, el resto se difiere) |
| **Faltantes del mes** | Demanda no atendida | Demanda potencial - ventas efectivas |
| **Nivel de servicio observado** | Qué parte de la demanda atendiste | Ventas efectivas / demanda potencial. Un nivel bajo sostenido baja la reputación |
| **Política de reposición** | Cuánto y cuándo pides | El alumno fija un tamaño de pedido o una cobertura objetivo en días; el motor aplica el plazo de entrega |
| **Plazo de entrega del proveedor** | Cuánto tarda en llegar | Base más variación aleatoria; sube con eventos de bloqueo o escasez |
| **Merma (%)** | Pérdida por vencimiento o robo | Tasa base del sector x factor de exceso de stock (más cobertura, más merma en perecibles) |
| **Fracción de costos en moneda extranjera** | Dependencia del dólar | Fija por plantilla; el efecto de un shock cambiario es esa fracción x variación del dólar |
| **Cuentas por cobrar** | Ventas pendientes de cobro | CxC final = CxC inicial + ventas a crédito - cobros; los cobros dependen del plazo pactado y de la morosidad |
| **Cuentas por pagar** | Compras pendientes de pago | Igual: compras a crédito menos pagos según plazo |
| **Ciclo de conversión de efectivo (calculado)** | Días de caja inmovilizada | DIO + DSO - DPO [S10], como indicador visible para el alumno |
| **Dependencia de proveedor** | Cuánto compras a uno solo | Porcentaje de compras del proveedor principal; aumenta el efecto de sus cambios de precio y plazo |
| **Concentración de clientes** | Cuánto vendes al cliente principal | Porcentaje de ventas del cliente más grande; aumenta el efecto de perderlo |
| **Presión competitiva** | Intensidad de competencia (formal e informal) | Índice que sube con eventos y baja con diferenciación; reduce demanda y precio posible |
| **Capacidad productiva** (fábricas) | Unidades máximas por mes | Capacidad instalada x disponibilidad (reduce con fallas) |

Interpretación mía: con esta lista el motor puede reproducir quiebres de stock, merma, capital de trabajo, dependencia del proveedor, concentración de clientes y shocks de dólar sin cambiar su estructura central de caja, ingresos, costos y reputación; solo agrega inventario, cuentas por cobrar y por pagar, y algunos índices.

---

## 7. Ejemplos reales de Bolivia o Latinoamérica

Todos son de Bolivia. Solo incluyo casos cuyo enlace abrí. Lo que dice la nota va en la columna "Qué dice la fuente".

| Caso | Qué dice la fuente | Enlace |
|---|---|---|
| **Panificadores y precio del pan de batalla (2025)** | En enero de 2025 los panificadores aceptaron mantener el pan de batalla en Bs 0,50 y el corriente en Bs 0,40, con harina subvencionada y azúcar, manteca y levadura a precio referencial. En mayo la estatal Emapa dijo que la harina subvencionada llegaba a más de 2.000 panificadores y que en Santa Cruz algunos subieron el pan de Bs 0,50 a Bs 1, o lo achicaron | [Los Tiempos, 14/1/2025](https://www.lostiempos.com/actualidad/economia/20250114/panificadores-aceptan-propuesta-del-gobierno-mantienen-precio-del-pan) y [Los Tiempos, 12/5/2025](https://www.lostiempos.com/actualidad/economia/20250512/emapa-dice-que-mantiene-subvencion-harina-precio-del-pan-bs-050) |
| **Companex (distribuidora de consumo masivo)** | Importadora y distribuidora con más de 30 años, red propia de almacenes, flota y fuerza de ventas, en 8 de 9 departamentos; atiende a unas 19.000 microempresas, sobre todo tiendas de barrio, y a veces les da crédito en mercadería. BID Invest le prestó US$ 5 millones (mayo de 2019) para comprar mercadería como parte de su capital de trabajo | [BID Invest](https://idbinvest.org/es/medios-y-prensa/bid-invest-financia-el-capital-de-trabajo-de-companex-en-bolivia) |
| **Bloqueos de mayo de 2026** | La CNI y otras cámaras estimaron pérdidas de 50 a 60 millones de dólares por día, con unos 40 puntos de bloqueo, riesgo de desabastecimiento y presión inflacionaria por mayores costos logísticos | [Los Tiempos, 11/5/2026](https://www.lostiempos.com/actualidad/economia/20260511/industriales-alertan-que-bloqueos-causan-perdidas-us-60-millones) |
| **Escasez de dólares e importadores (2024)** | Dólares limitados para importar bienes terminados e insumos; comisión bancaria para vender dólares que subió de 12-14% a más de 25% según un banco de inversión; precios de aceite de oliva y farmacéuticos subieron | [Bloomberg Línea, 23/5/2024](https://www.bloomberglinea.com/latinoamerica/bolivia/bolivia-en-modo-argentina-los-tipos-de-cambio-paralelos-que-surgen-ante-la-escasez-de-dolares/) |
| **Inflación 2025-2026** | El BCB proyecta 9,2% para 2026, frente a 20,4% el año anterior, y advierte riesgo de traslado del ajuste del diésel a precios de bienes | [Correo del Sur, 8/10/2026](https://correodelsur.com/economia/20261008/bcb-ratifica-proyeccion-inflacion-llegara-este-ano-a-9-2-este-ano-pese-al-ajuste-del-diesel.html) |

No encontré ni abrí un caso boliviano de cafetería, fábrica o comercio con datos de márgenes, rotación o merma; ni ejemplos de otros países de la región. Eso queda como pendiente (secciones 9 y 10).

---

## 8. Fuentes numeradas con nivel

Nivel A: libro, paper, organismo, manual universitario. B: consultora, reporte sectorial, prensa. C: blog, enciclopedia, práctica.

| N.º | Fuente | Nivel | Qué abrí y leí | Enlace |
|---|---|---|---|---|
| S1 | OpenStax, *Principles of Accounting, Volume 2: Managerial Accounting*, sección "Calculate a Break-Even Point in Units and Dollars" (la página indica fecha de publicación 14/2/2019; no vi número de edición) | A (libro de texto universitario abierto) | Texto leído de la sección: fórmulas y ejemplos de margen de contribución y punto de equilibrio. No encontré en esa página una definición de margen de seguridad | https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars |
| S2 | Caplice y Sheffi, MIT, curso *Logistics Systems* (ESD.260J), otoño de 2006, diapositivas de la clase 7 (EOQ). Autoría de las diapositivas: Chris Caplice | A (curso universitario) | Texto extraído del PDF: supuestos del EOQ, fórmula, sensibilidad | https://ocw.mit.edu/courses/esd-260j-logistics-systems-fall-2006/resources/lect7 |
| S3 | Misma serie, clase 11 (demanda probabilística y stock de seguridad) | A | Texto extraído del PDF: punto de reorden, stock de seguridad, CSL, fill rate | https://ocw.mit.edu/courses/esd-260j-logistics-systems-fall-2006/resources/lect11 |
| S4 | Aswath Damodaran (NYU Stern), tabla "Working Capital Ratios by Sector (US)", datos de enero de 2026 | A (material universitario, datos) | Tabla leída. La página no define las columnas; mi lectura es inferencia | https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/wcdata.html |
| S5 | Banco Mundial, Enterprise Survey 2017 Bolivia (BOL_2017_ES_v01_M), variable m1a "mayor obstáculo" | A (organismo multilateral, microdatos) | Tabla de categorías y conteos leída (364 establecimientos) | https://microdata.worldbank.org/catalog/2910/variable/F3/V932?name=m1a |
| S6 | Marc Deloof, "Does Working Capital Management Affect Profitability of Belgian Firms?", *Journal of Business Finance & Accounting*, vol. 30, n.º 3-4, 2003, pp. 573-588 | A (paper) | **Solo resumen y ficha bibliográfica** en IDEAS; no leí el texto completo ni los coeficientes | https://ideas.repec.org/a/bla/jbfnac/v30y2003i3-4p573-588.html |
| S7 | BID Invest, "BID Invest financia el capital de trabajo de Companex en Bolivia" (20/5/2019) | B (comunicado de organismo; lo marco B por ser nota institucional) | Texto leído | https://idbinvest.org/es/medios-y-prensa/bid-invest-financia-el-capital-de-trabajo-de-companex-en-bolivia |
| S8 | Penn State Smeal Center for Supply Chain Research, resumen sobre el efecto látigo (basado en Lee, Padmanabhan y Whang). **No es el texto completo del artículo** | B | Texto leído del resumen: cuatro causas (actualización de pronósticos, pedidos por lote, fluctuación de precios, racionamiento) y remedios | https://courses.ischool.berkeley.edu/i290-4/s03/readings/bullwhip.htm |
| S9 | NRF (EE. UU.), comunicado sobre la Encuesta Nacional de Seguridad Minorista 2022 (merma de 1,44% en 2021) | B (gremio) | Texto leído. No cuantifica causas | https://nrf.com/media-center/press-releases/nrf-reports-retail-shrink-nearly-100b-problem |
| S10 | Wikipedia, "Cash conversion cycle" | C | Fórmulas de DIO, DSO, DPO y CCC. No menciona a Richards y Laughlin | https://en.wikipedia.org/wiki/Cash_conversion_cycle |
| S11 | Los Tiempos, "Panificadores aceptan propuesta del Gobierno y mantienen el precio del pan a 50 centavos", 14/1/2025 | B (prensa) | Texto leído | enlace en sección 7 |
| S12 | Los Tiempos (ABI), "Emapa dice que mantiene subvención a la harina...", 12/5/2025 | B | Texto leído | enlace en sección 7 |
| S13 | Correo del Sur (Erbol), "BCB ratifica proyección: inflación llegará este año a 9,2%...", 8/10/2026 | B | Texto leído | enlace en sección 7 |
| S14 | Los Tiempos (ABI), "Industriales alertan que bloqueos causan pérdidas de $us 60 millones diarios", 11/5/2026 | B | Texto leído | enlace en sección 7 |
| S15 | Bloomberg Línea, "¿Bolivia en modo Argentina?...", 23/5/2024 | B | Texto leído | enlace en sección 7 |

**Conteo.** 15 fuentes numeradas. Nivel A: S1 a S6. **Con texto leído: cinco documentos (S1, S2, S3, S4, S5) de cuatro instituciones distintas (OpenStax, MIT, NYU Stern, Banco Mundial)**; S6 solo por resumen. Se cumple el mínimo de 4 fuentes A leídas, pero con una advertencia: S4 y S5 son tablas de datos, no textos explicativos, y S2 y S3 son diapositivas de un mismo curso. Ningún libro de texto clásico en español (Baca Urbina, Sapag Chain) fue leído.

---

## 9. No confirmado

- **Richards y Laughlin (1980)**, autores del ciclo de conversión de efectivo: lo intenté buscar; no abrí el artículo. Las fórmulas de DIO, DSO, DPO y CCC las confirmé solo en Wikipedia (nivel C) y en resúmenes de búsqueda.
- **Margen de seguridad, apalancamiento operativo, rotación de inventario, cobertura en días, GMROI y merma (%)**: fórmulas de memoria; no las leí en fuente abierta.
- **Modelo del vendedor de periódicos (newsvendor)** y la razón crítica Cu/(Cu+Co): de memoria. Los apuntes del MIT sobre el tema (curso 15.761) devolvieron error 404; no los leí.
- **Libro de operaciones o de costos en español**: no abrí ninguno. Las páginas de EOQ de eCampusOntario (Pressbooks) dieron error 403. No cito ediciones de Baca Urbina ni Sapag Chain para este tipo.
- **FAO, informe SOFA 2019 sobre pérdida y desperdicio de alimentos**: la página y el PDF devolvieron 403. Las cifras (14% de pérdida entre cosecha y venta; frutas y verduras con más pérdida) las vi solo en resúmenes de búsqueda; no las uso como dato.
- **Cifras de NRF por causa de la merma** (robo externo 36%, interno 29%, errores de proceso 27% en 2022): solo de un resumen de búsqueda. El comunicado que abrí no las cuantifica.
- **Harina de Bolivia: el costo del quintal subió de 210 a 250 bolivianos**: aparece en un resumen de búsqueda que cita a un dirigente panificador; no lo vi en el artículo que abrí. Además, el volumen de harina entregada en 2021 aparece como 1,087 millones de bolsas en un resumen y 1,8 millones en el artículo que abrí; no uso esas cifras.
- **Conflicto en Santa Cruz por el alza del pan a Bs 1 y "exagerada" según Conapabol**: de resúmenes de búsqueda; solo el alza de Santa Cruz la confirmé en la nota de Emapa [S12].
- **Inflación acumulada 2026**: el artículo del Correo del Sur [S13] dice 3,88% en nueve meses; un resumen de búsqueda de otra fuente (boletín de la USFX, que no abrí) dice 4,82% en el primer semestre. No concuerdan; no sé cuál es correcto ni a qué base se refieren. No la uso.
- **Tipo de cambio 2026 y unificación cambiaria**: resúmenes de búsqueda mencionan un plan de unificación y flotación (junio de 2026) y valores de mercado cerca de Bs 9,2-9,5; no abrí esas notas y no pude confirmar si el plan se ejecutó. [S15] es de 2024.
- **Bloqueos**: las cifras de pérdidas de las cámaras industriales varían según la fecha y no concilian entre notas; son estimaciones de gremios con interés. Solo uso la nota que abrí [S14].
- **Contrabando**: las cifras de la CNI (cerca de 3.464 millones de dólares en 2023) y de la CAINCO vienen de resúmenes de búsqueda; no las abrí.
- **Estacionalidad boliviana por rubro** (Carnaval, fin de año, aguinaldo, inicio de clases): no busqué fuentes. Todo lo que digo es suposición.
- **Normativa tributaria** (IVA, IT, factura, regímenes para pequeños comerciantes): no la verifiqué. No afirmo tasas.
- **Márgenes, rotación, merma, plazos de pago y de cobro típicos de un rubro boliviano concreto** (cafeterías, panaderías, distribuidoras): no encontré ningún dato abierto.
- **Elasticidad precio de la demanda**: no busqué fuentes; los rangos son estimación.
- **Cómo funcionan otros países de la región**: no abrí ejemplos fuera de Bolivia.

---

## 10. Cifras que necesitan validación local

Quién podría aportarla: docente del curso de costos o de operaciones; gremios (Conapabol o la federación de panificadores, Cámara Nacional de Industrias, Cámaras de Industria y Comercio departamentales, Cainco, gremiales); empresarios del rubro (dueños de panaderías, cafeterías, distribuidoras); INE; BCB; SIN; Aduana Nacional.

| Cifra | Valor puesto en este documento | Origen | Quién podría validar |
|---|---|---|---|
| Alza del costo del insumo importado por falta de dólares | +10% a +30% | Estimación, apoyada en cifras de [S15] de 2024 | BCB, importadores, Cámara de Comercio, empresario del rubro |
| Variación del plazo de entrega por bloqueos | de 2 a 7-15 días | Estimación | Distribuidores y transportistas |
| Caída de ventas en mes de bloqueo | -20% a -60% | Estimación | Comerciantes y gremios de las ciudades afectadas |
| Elasticidad precio de la demanda | -0,5 a -1,5 | Estimación | Docente de marketing o economía; estudios locales |
| Pérdida de unidades a favor del competidor informal | -10% a -25% en el segmento sensible | Estimación | Gremios formales, empresario del rubro |
| Merma de perecibles | 3% a 10% de lo comprado | Estimación | Panificadores, cafeterías, mercados |
| Merma por robo y error | 1% a 4% de las ventas en comercio sin controles | Estimación; [S9] da 1,44% para EE. UU. | Comercios minoristas, supermercados |
| Aumento de demanda en temporada alta | +30% a +100% | Estimación | Empresario de cada rubro, Cámara de Comercio |
| Parte de la demanda perdida que no se recupera cuando hay faltante | 50% a 80% | Estimación | Docente de operaciones, empresarios |
| Aumento del costo unitario con un proveedor único | +5% a +15% | Estimación | Empresario del rubro |
| Plazo de pago al proveedor y de cobro a clientes | 30 a 15 días; cobros a 30-90 días | Estimación | Distribuidoras (por ejemplo, quienes trabajan con tiendas de barrio), banca |
| Morosidad del cliente a crédito | 2% a 5% del monto | Estimación | Distribuidoras, asociaciones de cobranza |
| Costo de reparación de equipo | 3% a 20% del valor | Estimación | Fabricantes, técnicos |
| Efecto de un competidor grande | -10% a -30% de ventas; -5% a -15% de precio | Estimación | Comerciantes que lo vivieron |
| Precio y descuento de un pedido de supermercado | -10% a -20% del precio de venta directa | Estimación | Proveedores de supermercados |
| Capital de trabajo / ventas por sector en Bolivia | Sin dato; [S4] es de EE. UU. | Falta de dato local | Docente, Cámara de Industria, empresas del rubro |
| Rotación de inventario típica | Sin dato local | Falta de dato local | Empresarios del rubro, gremios |
| Inflación para proyectar costos | 9,2% proyección 2026 [S13] | Fuente de prensa sobre un dato del BCB | BCB, INE |
| Tipo de cambio de referencia y paralelo | Sin dato vigente verificado | Falta de dato | BCB |
| Pérdida por bloqueos | 50-60 millones de dólares por día [S14] | Estimación de cámaras industriales | CNI, INE; usar como contexto, no como parámetro |
| Fracción de costos en moneda extranjera por rubro | No definida | Falta de dato | Empresarios del rubro (cafeterías, fábricas, distribuidoras) |
