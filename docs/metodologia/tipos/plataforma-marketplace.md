# Plataforma o marketplace de dos lados: ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que yo la abrí y leí (el alcance de lo leído está en esa sección).
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es cita.
- Una magnitud marcada **(estimación)** la puse yo para que el simulador tenga un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro país, otro sector, otra fecha), así que tampoco es un parámetro "verdadero" para Bolivia.
- Cuando reconstruyo una fórmula de memoria o por álgebra propia, lo digo.
- Lo que no pude verificar está en la sección 9, y la lista de cifras a validar con gente local está en la sección 10.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Una plataforma de dos lados (marketplace) no produce ni vende el bien: junta a dos grupos que se necesitan entre sí (por ejemplo, restaurantes y comensales, conductores y pasajeros, empresas y postulantes) y cobra, sobre todo, una comisión sobre cada transacción. La literatura económica lo describe así: son mercados donde "dos grupos distintos" obtienen su beneficio de interactuar a través de una plataforma común, y quien la dirige debe "conseguir a los dos lados a bordo" [S1]. Los autores del artículo de *Harvard Business Review* lo dicen de otra forma: en un negocio normal el costo está a la izquierda de la empresa y el ingreso a la derecha; en una red de dos lados "el costo y el ingreso están a ambos lados", porque la plataforma tiene gastos para atender a cada grupo y puede cobrar a cada uno [S2].

**Cómo aporta valor.**

1. **Reduce el costo de buscar y de confiar.** El valor para un lado depende de cuántos hay del otro lado: "el valor de la plataforma para un usuario depende en gran medida del número de usuarios del otro lado" [S2]. Un restaurante pequeño no podría, solo, llegar a miles de comensales; un comensal no podría comparar cientos de menús.
2. **Tiene rendimientos crecientes.** Según [S2], las plataformas exitosas tienen rendimientos crecientes a escala: los usuarios pagan más por acceder a una red más grande, por lo que los márgenes mejoran al crecer la base. Esto es lo opuesto a la mayoría de los negocios tradicionales, donde crecer más allá de cierto punto cuesta cada vez más [S2].
3. **Casi no tiene inventario ni activos propios** (interpretación mía, a partir de que el modelo es de intermediación; ÜPAKET, que sí guarda mercadería de los vendedores, es un caso intermedio, ver sección 7).

**Por qué es distinto para un simulador.** Un negocio de ventas por unidades empieza a vender apenas tiene producto. Una plataforma puede estar lista, pagada y bien hecha, y no tener ninguna venta, porque ningún lado llega si el otro no está. Tres rasgos que el motor genérico (caja, ingresos, costos, reputación) no captura:

- El ingreso no se decide: **emerge** de dos poblaciones (oferta y demanda) que se atraen entre sí.
- Los primeros meses se gasta (subsidios, captación de ambos lados) sin ingreso proporcional, y hay un umbral ("masa crítica") bajo el cual el negocio no despega [S7, solo resumen].
- Una parte de las transacciones puede **escaparse** de la plataforma (desintermediación), y cuanto más cobras, más incentivo hay a escaparse [S3, S8].

---

## 2. Indicadores propios y cómo se calculan

Convención: **mes t**. Mantengo los nombres en inglés (GMV, take rate) porque son los que el alumno va a encontrar en cualquier libro o entrevista.

### 2.1 Indicadores de volumen e ingreso

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Transacciones** | Cantidad de pedidos, viajes o contratos cerrados en el mes | Dato base | Interpretación mía |
| **GMV** (valor bruto transado) | Total de plata que pasa por la plataforma, antes de restar nada | GMV = transacciones x ticket promedio | Definición habitual; [S8] la usa dentro de la definición de take rate. Uber usa el término equivalente "Gross Bookings": valor total en dólares de los viajes y entregas, antes de descuentos, reembolsos, pagos a conductores y restaurantes e incentivos [S6] |
| **Take rate** (tasa de comisión) | Porcentaje del GMV que la plataforma se queda | Take rate = ingreso neto de la plataforma / GMV | [S8] la define como el porcentaje del GMV que captura el marketplace. Uber: "ingreso neto ajustado de la plataforma central como porcentaje de los Gross Bookings" [S6] |
| **Ingreso de la plataforma** | Lo que realmente entra a la empresa | Ingreso = GMV x take rate (más otros ingresos: publicidad, suscripción de socios, tarifas de servicio) | Despeje de la fórmula anterior; "otros ingresos" es interpretación mía |
| **Ticket promedio** | Valor medio de cada transacción | GMV / transacciones | Interpretación mía |

**Precisión importante sobre el take rate.** En la definición de Uber, los incentivos pagados a conductores se descuentan del ingreso, lo que reduce el take rate [S6]. Para el simulador conviene distinguir **take rate bruto** (la comisión que ve el cliente) de **take rate neto** (lo que queda después de subsidios e incentivos). Con los datos del [S6] calculé (mi cuenta): 2017, 7.191 / 34.409 = 20,9%; 2018, 10.025 / 49.799 = 20,1%. Son cifras de una empresa gigante de EE. UU.; no son un benchmark para Bolivia. El glosario de a16z dice que el take rate típico va "desde un dígito bajo hasta mediados de los 30" en porcentaje y que depende de la fragmentación del mercado, los sustitutos y el valor operativo que aporta la plataforma [S8].

### 2.2 Indicadores de liquidez (qué tan bien funciona el mercado)

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Liquidez** | Facilidad con que cada lado encuentra a la contraparte adecuada | Se mide con varios indicadores (siguientes filas) | [S8] la define como "la facilidad con la que compradores y vendedores encuentran la contraparte correcta" |
| **Tasa de match (fill rate)** | Parte de los pedidos o solicitudes que termina en una transacción | Pedidos atendidos / pedidos solicitados | [S8] lista "fill rate" (también llamado match rate o utilization rate) como métrica de liquidez, **sin dar fórmula**. La fórmula es interpretación mía |
| **Tiempo hasta el match** | Cuánto demora una solicitud en ser atendida | Minutos promedio entre pedido y asignación | [S8] lo lista como métrica de liquidez; la forma de medirlo es interpretación mía |
| **Profundidad de mercado** | Cuánta oferta hay disponible para cada pedido | Oferta activa / demanda activa en la misma zona y hora | [S8] menciona "market depth"; la fórmula es mía |
| **Utilización de la oferta** | Cuánto del tiempo o capacidad de cada proveedor se usa | Horas con pedido / horas conectadas | Interpretación mía |

### 2.3 Indicadores de efecto de red y de fuga

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Efecto de red cruzado** | Cuánto atrae un lado al otro | Cualitativo: más oferta, más demanda, y al revés | [S2]: efecto "cruzado" (cross-side), a diferencia del "del mismo lado" (same-side), que puede ser positivo o negativo |
| **Efecto del mismo lado** | Cuánto atrae (o repele) un lado a otros de su mismo lado | Cualitativo | [S2]: ejemplo de efecto negativo, los vendedores prefieren menos competidores |
| **Multihoming** | Usuarios que usan varias plataformas a la vez | % de proveedores activos en más de una app | [S1] y [S2] lo tratan como una fuerza que intensifica la competencia de precios; [S8] dice que reduce la fuerza de los efectos de red |
| **Tasa de fuga (leakage)** | Parte del valor que se pacta en la plataforma pero se cobra afuera | GMV fuera de la plataforma / (GMV dentro + GMV fuera) | La idea es de [S8] (los usuarios se encuentran en la plataforma pero "completan la transacción afuera") y de [S3]. La fórmula es definición mía; **nadie la observa directamente**, por eso es difícil de medir [S3] |

### 2.4 Indicadores de costo y rentabilidad

| Indicador | Fórmula | Fuente |
|---|---|---|
| **CAC por lado** | Gasto en captar ese lado / altas de ese lado | Adaptado del tipo suscripción; **mía** |
| **Subsidio por transacción** | (descuento al cliente + bono al proveedor + envío gratis) / transacciones | Interpretación mía; el concepto de "subsidio al lado que se quiere atraer" está en [S2] |
| **Margen de contribución por transacción** | take rate x ticket - subsidios - costos variables (pasarela de pago, soporte, seguro, fraude) | Interpretación mía |
| **Punto de equilibrio en GMV** | Costos fijos mensuales / (take rate neto x margen de contribución sobre comisión) | Interpretación mía (álgebra propia, no es de ninguna fuente) |
| **Retención por cohorte, de cada lado** | Proveedores (o compradores) de la cohorte que siguen transando en el mes k / tamaño de la cohorte | [S8] menciona retención por cohorte como tema; la fórmula es la misma que en suscripción (ver ficha `suscripcion-saas.md`) |

### 2.5 La regla de precios de Rochet y Tirole (reconstrucción)

[S1] demuestra que una plataforma que maximiza ganancia elige dos precios, uno por lado (pB al comprador, pS al vendedor). Dos resultados que leí en el paper (Proposición 1):

- El precio total p = pB + pS cumple la fórmula clásica de Lerner con elasticidad total: (p - c) / p = 1 / η, donde c es el costo de la transacción y η = ηB + ηS es la suma de las elasticidades de cada lado.
- La **estructura** de precios sigue la razón de elasticidades: pB / ηB = pS / ηS. Es decir, **el lado más sensible al precio paga menos**, y el menos sensible paga más.

Lo que dice [S1] se limita al modelo; la traducción práctica (la comisión del lado "que menos reacciona" debe ser mayor) es interpretación mía. La misma idea aparece, en palabras, en [S2]: conviene subsidiar el lado más sensible al precio y cobrar al lado que aumenta más su demanda cuando crece el otro.

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Resumen.** El VAN sigue siendo la base (hay inversión inicial, flujos y descuento), pero el flujo no puede ser "ventas = unidades x precio". Hay que construirlo desde **dos poblaciones que se retroalimentan**, y el resultado depende de si se supera un umbral.

**Por qué el VAN con ingresos planos falla aquí:**

1. **El resultado es "todo o poco".** [S7] (solo abstract leído) y [S1] y [S2] dicen que la plataforma necesita "una cantidad suficiente de miembros en ambos lados" para despegar [S7]. Debajo del umbral el ingreso es casi nulo; arriba, crece. Un VAN con una sola línea de ingresos esconde esta bifurcación. Interpretación mía: conviene calcular el VAN en **al menos dos escenarios** (se alcanza masa crítica / no se alcanza) y ponderar con una probabilidad explícita, o reportar los dos.
2. **El gasto va primero y es de dos tipos.** Se paga por captar oferta y demanda antes de que haya ingreso, y se subsidia a un lado de forma intencional [S2]. La caja mínima y el capital hasta llegar a equilibrio son tan importantes como el VAN. Ejemplo de advertencia en [S2]: FreePC regaló computadoras e internet a consumidores que aceptaban ver publicidad, pocos anunciantes quisieron pagar por esa audiencia sensible al costo, y la empresa abandonó su oferta tras perder US$ 80 millones.
3. **El ingreso depende de que la gente no se vaya.** Si parte del valor se paga fuera de la plataforma (fuga), el ingreso real es menor que take rate x GMV de la actividad que ocurrió gracias a la plataforma [S3, S8].
4. **Efectos de ganador único.** En mercados con costos altos de usar varias plataformas, efectos de red fuertes y poca diferenciación técnica, tiende a quedar una sola plataforma [S2]. El proyecto de un alumno puede estar en un mercado donde el líder ya es grande; entonces el VAN de entrar depende de un nicho o de una ventaja específica (ver situación 5).

**Qué agregar al análisis:**

| Complemento | Qué responde | Fuente |
|---|---|---|
| VAN con escenarios (despega / no despega) y probabilidad | Cuánto vale el proyecto considerando que puede no llegar a la masa crítica | Interpretación mía |
| Capital necesario hasta equilibrio (caja mínima acumulada) | Cuánta plata hace falta para llegar a masa crítica | Interpretación mía; las plantillas del simulador ya traen un colchón de caja |
| Punto de equilibrio en GMV y en cantidad de proveedores activos | Qué tamaño mínimo cubre los costos fijos | Interpretación mía |
| Margen de contribución por transacción (neto de subsidios) | Si cada pedido deja plata o la quita | Interpretación mía; el efecto de los incentivos sobre el take rate está en [S6] |
| Sensibilidad a tres palancas: take rate, fuga y rotación de proveedores | Cuál palanca hace más daño al resultado | Interpretación mía |
| Liquidez como condición previa | Si hay suficiente oferta por pedido (fill rate) para que la demanda vuelva | [S8] |

**Lo que no se debe hacer:** comparar el take rate propio con el de Uber, o con los 30% a 35% de que hablan los restaurantes en notas de otros países, sin ver el servicio que se presta (si la plataforma pone los repartidores, la comisión paga logística y no solo la intermediación; [S15] cita al director de PedidosYa diciendo justamente eso).

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Nota de método: mezclo lo que dicen las fuentes (marcado) con práctica común o interpretación mía (sin marca). No encontré un estudio sobre errores de estudiantes bolivianos en proyectos de plataforma.

**Errores de cálculo (estudiantes)**

1. **Proyectar el ingreso como GMV, no como take rate x GMV.** Confundir lo que pasa por la plataforma con lo que se queda. [S8] y [S6] insisten en distinguir ambos.
2. **Suponer crecimiento de usuarios sin vincularlo a la oferta.** Si hay más pedidos que repartidores, el fill rate cae y la demanda se pierde [S8 para liquidez]; el estudiante suele modelar una sola curva de usuarios.
3. **Olvidar los dos costos de captación** (uno por lado) y el subsidio, y tratar el marketing como un gasto fijo único.
4. **Suponer que la comisión se cobra siempre sobre el 100% de las transacciones.** No considera la fuga [S3, S8].
5. **Poner un take rate alto "porque el mercado lo aguanta".** [S1] muestra que el precio del lado sensible debe ser bajo para que el otro lado acepte pagar más; cobrar alto a ambos puede vaciar la red.
6. **No incluir el costo de las pasarelas de pago, de seguro, de fraude ni de soporte** (interpretación mía), ni el efectivo que los repartidores cobran en nombre de la plataforma y que debe conciliarse [S4 describe pagos en efectivo y la "caja chica" del repartidor].
7. **Ignorar el valor residual** (la red construida al año 5) o ponerlo sin justificar. Mismo problema que en suscripción.
8. **Copiar un benchmark ajeno** de take rate o de CAC sin contexto.

**Errores de emprendedores**

1. **Empezar a lo grande en todas las ciudades a la vez.** Dispersa a ambos lados y baja la liquidez en cada una (interpretación mía; la lógica de "reunir a ambos lados" es de [S1, S2, S7]).
2. **No decidir qué lado subsidiar.** [S2]: "La pregunta estratégica clave es qué lado subsidiar y por cuánto tiempo."
3. **Subsidiar un lado que el rival puede aprovechar.** [S2] cuenta el caso de Netscape, que regaló el navegador a usuarios esperando vender servidores a empresas; las empresas podían enviar páginas a esa base de usuarios comprando el servidor de un rival. El subsidio se desperdició.
4. **Cobrar de más y empujar a la gente a saltarse la plataforma.** [S3] cita a Gu y Zhu (2021) y a Gu (2022): al reforzar la confianza entre las partes sube la desintermediación y puede neutralizar la ganancia; cuando se bloqueó Skype en China (2017), la desintermediación detectada bajó 18,7% y los cobros totales subieron 33,6%. Son datos de un mercado de freelancers.
5. **Creer que la fuga siempre es grande.** [S3] estudió una plataforma de limpieza y concluyó que no hay evidencia de desintermediación; estima que no más de 1 de cada 83 relaciones formadas termina así. Es un solo estudio, en un contexto concreto (una ciudad de un país post-soviético, servicios mayormente de una sola vez), y los propios autores explican por qué ese contexto desalienta la fuga. Sirve para no suponer que fuga = 30% en todos los rubros.
6. **Ignorar que el trabajo de la oferta es el producto.** Un estudio cualitativo en Bolivia describe que los repartidores deben pagar licencia, seguros, moto, equipo y "material publicitario", y que la plataforma los califica por lotes (1 a 4) según aceptación de pedidos [S4]. Si el proveedor siente que el negocio no le cierra, se va, y la plataforma pierde su lado de oferta (interpretación mía de la implicancia; el estudio es crítico y cualitativo).
7. **Descuidar la regulación.** El registro obligatorio de aplicaciones de transporte en Bolivia (Decreto Supremo 5199, 2024) es un ejemplo [S11, S12].
8. **Creer que el líder grande no responderá.** Uber, en su documento ante la SEC, dice que en ciertos mercados "generalmente igualará" los incentivos de sus competidores "aunque resulte en un margen negativo" [S6].

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **(fuente)** o **(estimación)**); decisiones posibles con ventajas y costos; qué aprende el alumno.

Las magnitudes de las fuentes vienen de otros países y sectores. Se usan como orden de magnitud. Las marcadas "estimación" son mías y conviene calibrarlas con alguien del rubro (sección 10).

---

### Situación 1. Arranque en frío: el problema del huevo y la gallina

**Qué pasa.** La plataforma está lista, pero hay pocos proveedores (restaurantes, conductores, tiendas) y pocos clientes, y cada lado espera al otro. Sin restaurantes, nadie pide; sin pedidos, los restaurantes no se anotan. [S1] y [S2] describen exactamente esto como el problema de "tener a los dos lados a bordo", y [S7] (solo abstract) dice que hay una masa crítica mínima. En Bolivia, el caso de ÜPAKET muestra un marketplace que arrancó con unas 80 tiendas y siete empleados [S14].

**Variables que mueve.**
- Pedidos por mes: casi nulos mientras no se supere el umbral (estimación del orden: 5% a 20% de lo proyectado en los primeros 3 a 6 meses).
- Costo de captación por lado: alto al inicio (estimación).
- Tasa de match: baja, porque con poca oferta muchos pedidos no se pueden atender (dirección respaldada por [S8]; magnitud: estimación).
- Caja: baja de forma sostenida hasta llegar a equilibrio.

**Decisiones del alumno.**
1. *Subsidiar la oferta (pagar bonos garantizados a proveedores por estar conectados, aunque no haya pedidos).* Ventaja: asegura cobertura y tiempos de respuesta aceptables; es la lógica de [S2] cuando un lado es el que atrae al otro. Costo: pagas por capacidad ociosa; si la demanda no llega, quemas caja sin ingreso.
2. *Subsidiar la demanda (descuentos o envíos gratis a clientes).* Ventaja: trae pedidos rápido y da a los proveedores razones para quedarse. Costo: atrae clientes sensibles al precio que se van cuando termina el descuento (interpretación mía); necesitas oferta suficiente o los pedidos quedan sin atender.
3. *Empezar con un lado ya construido (por ejemplo, firmar un grupo pequeño de restaurantes con exclusividad o pagarles por adelantado) y tomar la demanda de una comunidad existente.* Ventaja: reduces el gasto por captar y concentras la liquidez. Costo: crecimiento lento y dependencia de pocos socios.
4. *Empezar sin subsidios, solo con captación orgánica.* Ventaja: no quemas caja. Costo: puedes quedar bajo la masa crítica y no despegar nunca; un rival con más plata te alcanza.

**Qué aprende.** Que el valor de una plataforma no está en la tecnología sino en reunir a ambos lados, que se debe decidir a quién subsidiar, y que "esperar a que llegue gente" no es una estrategia.

---

### Situación 2. Masa crítica por ciudad: expandir o profundizar

**Qué pasa.** Con algo de tracción en una ciudad (por ejemplo, Santa Cruz), aparece la oportunidad de abrir otra (La Paz, Cochabamba). Cada ciudad es un mercado separado: un restaurante de Santa Cruz no le sirve al cliente de La Paz. El caso de Yango Comida, que llegó primero a dos ciudades y recién en septiembre de 2026 a La Paz con 206 restaurantes asociados, muestra una expansión escalonada [S13; la nota no da comisiones ni repartidores].

**Variables que mueve.**
- Gasto de lanzamiento: sube (estimación: lo equivalente a varios meses de captación de la ciudad inicial).
- Liquidez en la ciudad original: baja si se desvía el equipo y el presupuesto (estimación).
- Potencial de GMV: sube en la nueva ciudad, con retraso.
- Reputación: baja si la nueva ciudad arranca con mal servicio (estimación).

**Decisiones del alumno.**
1. *Profundizar en la ciudad actual hasta cierta densidad (fill rate, tiempo de entrega) antes de abrir otra.* Ventaja: mejor servicio y márgenes. Costo: un competidor puede ocupar la otra ciudad.
2. *Abrir una segunda ciudad ya, con presupuesto separado.* Ventaja: crecimiento y mejor posición ante inversores. Costo: la caja se estira; si ambas quedan bajo la masa crítica, pierdes en las dos.
3. *Abrir con un socio local (franquicia o alianza).* Ventaja: menos capital propio. Costo: menos control de calidad y se comparte la comisión.
4. *Expandir en producto (otra categoría) en la misma ciudad.* Ventaja: usas la red existente. Costo: riesgo de diluir el foco.

**Qué aprende.** Que la liquidez es local, que más territorio no siempre es más valor, y que la expansión se paga antes de que rinda.

---

### Situación 3. Desintermediación: proveedores y clientes se saltan la plataforma

**Qué pasa.** Una vez que un cliente conoce a un buen proveedor (el restaurante favorito, el conductor de confianza, la tienda), pueden acordar por WhatsApp y pagar sin pasar por la app, evitando la comisión. [S8] la llama "fuga" (leakage) y dice que daña el crecimiento y la monetización. [S3] repasa la evidencia: en un mercado de freelancers, más confianza llevó a más desintermediación [Gu y Zhu, citados por S3]; en una plataforma de limpieza no se encontró evidencia y se acotó a no más de 1 en 83 relaciones [S3]. En otro estudio europeo citado por [S3], 66% de los clientes dejaba la plataforma tras una limpieza típica, pero 74% se iba tras la última limpieza de una limpiadora que se retiraba; los autores estiman unos 24% más de limpiezas sin fuga (esa estimación es de los autores citados, no mía, y los mismos autores señalan que lo deducen por eliminación).

**Variables que mueve.**
- Tasa de fuga: sube con el take rate y con la repetición de la relación (estimación del rango: 3% a 20% del GMV según rubro; la fuente da un extremo muy bajo [S3] y un caso de 24% [citado en S3]).
- Ingreso de la plataforma: baja en proporción.
- Datos de uso: se pierden (la plataforma no ve las transacciones fuera).
- Reputación del proveedor: la plataforma pierde la valoración de esas transacciones.

**Decisiones del alumno.**
1. *Reducir la comisión para las relaciones recurrentes.* Ventaja: menos incentivo a salirse. Costo: bajas el ingreso por pedido de tus mejores clientes.
2. *Dar beneficios que la fuga no tiene (seguro, pago protegido, garantía, soporte, historial verificado).* Ventaja: razones concretas para quedarse; es parte de lo que [S3] sugiere como motivo de la baja fuga en su caso (seguridad de la plataforma). Costo: gasto en seguros y soporte.
3. *Ocultar o limitar los datos de contacto entre las partes.* Ventaja: dificulta el contacto directo. Costo: peor experiencia, quejas de usuarios, y en algunos casos baja la confianza y la conversión.
4. *Cobrar la comisión solo sobre el primer contacto (tarifa de conexión) y no sobre la repetición.* Ventaja: menos fuga y modelo simple. Costo: el ingreso depende de nuevos clientes y no crece con la fidelidad.

**Qué aprende.** Que la comisión es un precio y la gente responde a los precios, que la plataforma debe aportar valor en cada transacción y no solo en la primera, y que la fuga no se ve en los reportes.

---

### Situación 4. Subir (o bajar) la comisión

**Qué pasa.** La caja está justa y la tentación es subir el take rate. Los restaurantes, en un caso de Costa Rica, se quejaban de comisiones de alrededor de 30% a 35% por pedido; la plataforma respondía que no todos pagan eso y que una entrega propia le costaría al restaurante algo similar [S15, nota de 2021, otro país]. En Bolivia, el estudio de la UMSA describe que PedidosYa cobra además un "costo de uso de la plataforma" a los repartidores y a negocios, y que esa carga se percibe como una "renta" [S4].

**Variables que mueve.**
- Take rate: sube según el cambio (por ejemplo, de 15% a 20%).
- Número de proveedores activos: baja, más si hay alternativas (estimación: de -3% a -15% de proveedores en los dos meses siguientes a un aumento de cinco puntos).
- Fuga: sube [S3, tendencia; magnitud: estimación].
- Precio final al cliente: sube si el proveedor lo traslada.

**Decisiones del alumno.**
1. *Subir la comisión a todos.* Ventaja: más ingreso por pedido de inmediato. Costo: proveedores se van o se pasan a otra app; sube la fuga.
2. *Subir solo a los proveedores grandes o a los que reciben más pedidos.* Ventaja: protege a los pequeños, que son la oferta que más cuesta captar. Costo: los grandes tienen más poder de negociar o irse a la competencia.
3. *Mantener la comisión y cobrar por servicios opcionales (publicidad dentro de la app, posicionamiento destacado).* Ventaja: nuevo ingreso sin tocar la tarifa base. Costo: puede degradar la experiencia del cliente y favorece a quien más paga.
4. *Bajar la comisión a cambio de exclusividad.* Ventaja: asegura oferta y reduce multihoming. Costo: menor ingreso por pedido, y si el rival es mayor, no alcanza.

**Qué aprende.** Que el precio de una plataforma tiene dos lados y que cada lado reacciona distinto [S1, S2]; y que conviene saber qué lado es más sensible antes de tocar la tarifa.

---

### Situación 5. Entra un competidor grande con mucho capital

**Qué pasa.** Una plataforma regional con más recursos entra a tu ciudad o rubro, con bonos, descuentos y comisiones más bajas. Es lo que muestra el avance de Yango, que en Bolivia sumó entrega de comida a su aplicación de transporte [S13]. [S2] advierte que las plataformas dominantes enfrentan amenazas de empresas grandes de mercados vecinos que pueden ofrecer un paquete de plataformas (el concepto se llama "envolvimiento"). El documento de Uber ante la SEC dice que en ciertos mercados iguala los incentivos de sus competidores "aunque resulte en un margen negativo" [S6].

**Variables que mueve.**
- Demanda: baja (estimación: -10% a -30% de clientes activos en los 3 meses siguientes, depende de la lealtad).
- Oferta: baja por multihoming; los proveedores usan ambas apps (dirección respaldada por [S1, S2, S8]; magnitud: estimación).
- Subsidio necesario para mantener cuota: sube.
- Take rate neto: baja si igualas incentivos [S6].

**Decisiones del alumno.**
1. *Igualar descuentos y bonos.* Ventaja: no pierdes cuota. Costo: pierdes margen con alta probabilidad; el rival tiene más caja y puede sostenerlo más tiempo [S2: "en una guerra de desgaste, los bolsillos profundos importan"].
2. *Diferenciarte en un nicho (por ejemplo, un tipo de comida, un barrio, un tipo de cliente) y no pelear en precio.* Ventaja: te defiendes donde el grande no llega bien (como American Express frente a Visa en [S2], que gana márgenes altos con un 5% de las tarjetas). Costo: techo bajo de crecimiento.
3. *Pedir exclusividad a los proveedores clave a cambio de menor comisión.* Ventaja: encarece la entrada del rival. Costo: reduce tu margen, y los proveedores pueden preferir al que ofrece más.
4. *Buscar alianza con el rival o vender.* Ventaja: salida ordenada. Costo: pierdes independencia y valor, y el precio depende de tu tracción.

**Qué aprende.** Que contra un rival con más caja no conviene una guerra de subsidios, y que la defensa viene de un nicho, de la lealtad de un lado o de salir a tiempo.

---

### Situación 6. Pagos: QR, efectivo y fraude

**Qué pasa.** En Bolivia el QR interoperable está oficializado desde 2019 (Resolución de Directorio BCB 137/2019) y entre 2021 y 2024 el valor de las operaciones por QR se multiplicó por 48, de Bs 3.195 millones a Bs 156.926 millones, con un valor medio por operación de Bs 400 a Bs 520 [S5]. Según una nota de prensa sobre un informe del BCB, en 2025 el 36% de los pagos fue por QR y el 64% en efectivo [S9]. Pero ASFI advierte riesgos: suplantación de códigos QR, comprobantes falsos y errores humanos [S5]. Y en las plataformas de reparto de Bolivia hay pedidos pagados en efectivo, por lo que el repartidor debe llevar una "caja chica" de Bs 300 a 400 y asumir la pérdida si el pedido es falso o se cancela [S4].

**Variables que mueve.**
- Fraude y pedidos falsos: sube (estimación: 1% a 3% de pedidos si no hay controles).
- Cuentas por cobrar (efectivo que los repartidores cobran por la plataforma): sube con la proporción de efectivo.
- Costo de conciliación y de pasarela de pagos: sube (estimación: 1% a 3% del GMV).
- Conversión: sube si se acepta el medio preferido del cliente.

**Decisiones del alumno.**
1. *Aceptar solo pago digital (QR, tarjeta).* Ventaja: caja inmediata, menos fraude y conciliación simple. Costo: pierdes los clientes que prefieren efectivo, que en Bolivia son la mayoría de los pagos [S9].
2. *Aceptar efectivo y delegar el riesgo en los repartidores (como describe [S4] en un caso).* Ventaja: máxima cobertura de clientes y menor costo para la empresa. Costo: tensión con la oferta, rotación de repartidores (ver situación 10) y riesgo reputacional.
3. *Aceptar efectivo con garantía de la plataforma (fondo para cubrir pedidos falsos).* Ventaja: protege a la oferta. Costo: gasto en fondo y control antifraude.
4. *Verificación de pedidos de riesgo (confirmación previa, pago anticipado en zonas o clientes nuevos).* Ventaja: menos pedidos falsos. Costo: fricción, menos conversión.

**Qué aprende.** Que el medio de pago es parte del producto, que el riesgo de cobranza debe tener un dueño, y que el contexto boliviano mezcla alta adopción de QR con mucho efectivo.

---

### Situación 7. Registro obligatorio y reglas para plataformas de transporte

**Qué pasa.** El Decreto Supremo 5199 (agosto de 2024) creó el Registro Nacional de Aplicación Digital para Transporte de Pasajeros, que obliga a registrar a empresas como Uber, InDrive, Yango y Chukuta Móvil con registro de comercio, NIT, poder legal y domicilio legal en Bolivia; la ATT reglamenta, y la Policía agrega mecanismos de seguridad [S11]. Otra nota dice que los municipios fiscalizan y multan irregularidades, y que las plataformas tenían 30 días para registrarse [S12]. La nota no detalla multas. En el rubro de otros servicios (delivery, marketplaces) no encontré un registro equivalente (sección 9).

**Variables que mueve.**
- Costos de cumplimiento (registro, domicilio legal, tarjetas de identificación de conductores, seguros): sube (estimación).
- Oferta de conductores: baja si los requisitos expulsan a parte de ellos (estimación: -5% a -25%).
- Riesgo de multa o suspensión: sube si no se cumple.
- Confianza del cliente: sube con registro y mecanismos de seguridad (dirección razonable; magnitud: estimación).

**Decisiones del alumno.**
1. *Cumplir pronto y comunicarlo como ventaja de seguridad.* Ventaja: confianza, menor riesgo. Costo: gasto y pérdida de parte de la oferta informal.
2. *Cumplir al mínimo y en el último plazo.* Ventaja: conservas caja y oferta unos meses. Costo: riesgo de sanción o suspensión; si tus rivales ya cumplieron, quedas con peor imagen.
3. *Operar sin registrarte y esperar la fiscalización.* Ventaja: ahorras. Costo: riesgo alto de multas o de ser bloqueado.
4. *Trasladar el costo a los conductores (exigirles tarjeta, seguro y estampas).* Ventaja: no pagas tú. Costo: menos conductores y rotación.

**Qué aprende.** Que la regulación es un costo y a la vez una barrera de entrada, y que el calendario de cumplimiento es una decisión de negocio.

---

### Situación 8. Reacción del transporte tradicional

**Qué pasa.** El sector tradicional (radiotaxis, sindicatos) reacciona contra la plataforma. En 2018 en Santa Cruz radiotaxistas realizaron una caravana con pancartas "Uber ilegal" luego de que la municipalidad dijera que Uber no tenía permiso; Uber propuso una reglamentación municipal como la de La Paz [S16]. Un dirigente atribuyó una caída fuerte de ingresos de los taxistas a las apps; es una afirmación del dirigente, no un dato medido [S16]. Que esto sea hoy un riesgo, después del decreto de 2024, es interpretación mía.

**Variables que mueve.**
- Operación del servicio: se interrumpe en días de protesta o bloqueo (estimación: 1 a 5 días con operación reducida).
- Riesgo para los conductores (agresiones, multas): sube (dirección; magnitud: estimación).
- Reputación: puede subir o bajar según cómo respondas.
- Costos legales y de relaciones públicas: sube.

**Decisiones del alumno.**
1. *Negociar con el sector y ofrecer integrarlo (que taxis tradicionales usen la app).* Ventaja: transforma al opositor en oferta. Costo: concesiones de tarifa o comisión, y pérdida de control.
2. *Mantener la operación y apoyarte en el marco legal.* Ventaja: no cedes. Costo: riesgo de conflicto físico y de imagen.
3. *Suspender la operación en la zona de conflicto unos días.* Ventaja: protege a los conductores. Costo: ingresos perdidos y clientes que migran a otra app.
4. *Mover el foco a un servicio que no choque (encomiendas, delivery).* Ventaja: menos fricción. Costo: reorientar el negocio.

**Qué aprende.** Que una plataforma compite con una industria organizada y que gestionar el conflicto forma parte del proyecto.

---

### Situación 9. Crisis de combustible y bloqueos

**Qué pasa.** Según una nota de julio de 2026, Bolivia atraviesa un nuevo período de escasez de combustible tras bloqueos que duraron casi 50 días; el transporte público de Santa Cruz funciona con 50% de sus buses, y el gobierno terminó un subsidio de más de 20 años en noviembre de 2025 [S10]. Para una plataforma de transporte o reparto, el combustible es el insumo de toda la oferta. (La nota no habla de apps; el efecto sobre ellas es interpretación mía.)

**Variables que mueve.**
- Oferta activa (conductores y repartidores conectados): baja (estimación: -20% a -50% durante la crisis).
- Costo del proveedor por kilómetro: sube; si la plataforma no ajusta tarifas, el proveedor se va (interpretación mía).
- Tiempos de entrega y cancelaciones: suben.
- Demanda: puede subir en transporte (menos autos particulares) o bajar por precios (estimación).

**Decisiones del alumno.**
1. *Subir la tarifa al cliente para compensar al proveedor.* Ventaja: retiene oferta. Costo: baja la demanda; puede haber fricción con el cliente.
2. *Dar un bono por combustible a proveedores activos.* Ventaja: protege la oferta. Costo: reduce tu margen, sin garantía de duración.
3. *Reducir el radio de entrega o la zona de servicio.* Ventaja: menos kilómetros por pedido y mejor tiempo. Costo: menos pedidos posibles.
4. *Incorporar proveedores sin combustible (bicicletas, vehículos eléctricos, caminantes en zonas densas).* Ventaja: te vuelves menos dependiente. Costo: inversión y adaptación; sirve en algunos barrios y rubros.

**Qué aprende.** Que el costo de la oferta (que no es tuyo pero lo determina) puede romper el negocio, y que las plataformas dependen de condiciones externas.

---

### Situación 10. Rotación y precarización de la oferta

**Qué pasa.** Un estudio cualitativo (octubre 2022 a febrero 2023) sobre repartidores en Bolivia describe que, para ser habilitados, deben invertir un presupuesto estimado de entre Bs 13.164 y Bs 16.524 (licencias, seguros, moto nueva, equipo, "material publicitario", compra informal de cupo en algunos casos), que se les paga por kilómetro (alrededor de Bs 2 por km, más Bs 5 a 6 por llegar al punto de retiro y unos Bs 2 al entregar) y que están clasificados en lotes de 1 a 4 según aceptación de pedidos [S4]. Los autores sostienen que esto encubre relaciones de dependencia; es una tesis de los autores, de enfoque crítico, basada en entrevistas (no es una encuesta representativa). Otros países avanzan en proyectos de ley para reconocer derechos laborales a repartidores de apps (Perú, Costa Rica, Colombia, según resultados de búsqueda que no abrí; ver sección 9).

**Variables que mueve.**
- Rotación de proveedores: sube si los ingresos netos no cubren sus costos (estimación: +3 a +10 puntos de rotación mensual).
- Calidad del servicio: baja con alta rotación.
- Costo de captación de oferta: sube.
- Riesgo legal y reputacional: sube con la presión laboral.

**Decisiones del alumno.**
1. *Mejorar los pagos por pedido (tarifa por km, bonos por hora pico).* Ventaja: retiene mejores proveedores y mejora el servicio. Costo: baja tu margen por pedido.
2. *Ayudar con financiamiento del equipo (cuotas para la moto, uniforme incluido).* Ventaja: reduce la barrera de entrada y la rotación. Costo: capital propio comprometido y riesgo de impago.
3. *Mantener el esquema y reponer a quien se va.* Ventaja: costo bajo hoy. Costo: calidad inestable y riesgo legal o de imagen creciente.
4. *Formalizar parte de la oferta (contrato, seguro de accidentes).* Ventaja: estabilidad y menor riesgo regulatorio. Costo: costo fijo alto y menos flexibilidad.

**Qué aprende.** Que la oferta es un cliente de la plataforma, no un insumo gratis; que si su ecuación no cierra, se va; y que el riesgo laboral es un riesgo regulatorio.

---

### Situación 11. Incidente de confianza: accidente, fraude o estafa

**Qué pasa.** Un hecho grave (un accidente, una estafa a un cliente, un proveedor que no entrega, un conductor que agrede) se hace viral. En una plataforma, el cliente confía en desconocidos gracias a la marca. [S3] observa que la seguridad que da la plataforma es un motivo por el que los usuarios no se salen. [S5] advierte que el QR tiene riesgos de fraude, como la suplantación de códigos. Un incidente puede dañar a ambos lados.

**Variables que mueve.**
- Reputación: baja (estimación: -10 a -30 puntos de 100 según gravedad).
- Demanda: baja en las semanas siguientes (estimación: -5% a -20%).
- Costos de respuesta (indemnizaciones, abogados, seguros): sube.
- Fuga: puede subir, porque el cliente que confía en un proveedor concreto se va con él.

**Decisiones del alumno.**
1. *Indemnizar y asumir responsabilidad de inmediato.* Ventaja: protege la marca y la confianza. Costo: precedente costoso; incentiva reclamos oportunistas.
2. *Investigar antes de responder y comunicar con cautela.* Ventaja: evitas errores legales. Costo: la viralidad corre más rápido que tu respuesta.
3. *Invertir en verificación de identidades, seguros y botón de emergencia.* Ventaja: reduce incidentes futuros. Costo: gasto fijo con beneficio invisible mientras no pasa nada.
4. *Suspender al proveedor y seguir adelante sin más medidas.* Ventaja: rápido y barato. Costo: si hay un patrón, se repite.

**Qué aprende.** Que la confianza es el producto de la plataforma y que prevenir cuesta antes de que haya un problema.

---

### Situación 12. Multihoming de la oferta: exclusividad o apertura

**Qué pasa.** Los restaurantes y conductores usan varias apps a la vez y reparten sus pedidos según quien les paga mejor. [S1] demuestra que cuando un lado usa varias plataformas, los precios al otro lado se vuelven más competitivos, porque cada plataforma intenta "llevar" a esos usuarios hacia una relación exclusiva. [S2] muestra casos de acuerdos de exclusividad con usuarios clave ("usuarios estrella") y advierte que es caro, sobre todo para plataformas pequeñas, y que a veces se pelea por el reparto del valor.

**Variables que mueve.**
- Pedidos por proveedor: baja (se reparten) o sube (si hay exclusividad).
- Comisión negociable: baja con proveedores grandes.
- Costo de incentivos de exclusividad: sube.
- Dependencia de pocos socios: sube.

**Decisiones del alumno.**
1. *Pedir exclusividad a los proveedores más importantes a cambio de menor comisión o más visibilidad.* Ventaja: diferencia tu oferta y quita el recurso al rival. Costo: menor margen; los proveedores pueden aceptar y no cumplir.
2. *Aceptar el multihoming y competir en servicio y velocidad.* Ventaja: no dependes de acuerdos. Costo: la fidelidad es baja y la oferta puede irse con un bono mejor del rival.
3. *Premiar la lealtad (más pedidos a quien está conectado más horas o prioriza tu app).* Ventaja: incentivo flexible. Costo: puede percibirse como castigo (como el sistema de lotes descrito en [S4]).
4. *Ofrecer herramientas que solo tú das (gestión de inventario, reportes, publicidad).* Ventaja: valor propio. Costo: desarrollo, con retorno incierto.

**Qué aprende.** Que cuando el proveedor puede estar en varias plataformas, la lealtad se compra con valor o con plata, y que cada forma tiene un costo.

---

### Situación 13. Una cadena grande o un cliente ancla pide condiciones especiales

**Qué pasa.** Una cadena de supermercados, de restaurantes o un gran comprador se ofrece a trabajar con tu plataforma, pero pide comisión baja, visibilidad destacada o exclusividad. [S2] llama a estos actores "usuarios estrella" (marquee users): su presencia atrae al otro lado, pero pueden pedir mucho; el artículo cuenta el caso de Electronic Arts y Microsoft, con un conflicto de 18 meses por el reparto de ingresos.

**Variables que mueve.**
- GMV: sube de inmediato (estimación: +10% a +40% del GMV de un proyecto chico).
- Take rate promedio: baja por la comisión reducida.
- Atractivo para el otro lado: sube (el cliente ve más marcas conocidas).
- Concentración: sube (un solo socio pesa mucho).

**Decisiones del alumno.**
1. *Aceptar con comisión baja y exclusividad.* Ventaja: volumen y credibilidad. Costo: margen bajo y dependencia; si se va, el GMV cae de golpe.
2. *Aceptar con comisión estándar sin exclusividad.* Ventaja: protege el margen. Costo: puede que no acepten.
3. *Rechazar y priorizar a los proveedores pequeños.* Ventaja: diversificas y evitas dependencia. Costo: renuncias a una gran fuente de pedidos.
4. *Probar con piloto limitado (una ciudad, tres meses).* Ventaja: aprendes sin comprometerte. Costo: el socio puede perder interés o pedir más al final.

**Qué aprende.** Que atraer al grande da escala pero concentra el riesgo, y que el poder de negociación cambia con el tamaño.

---

### Situación 14. Oportunidad: nuevos ingresos sobre la red (publicidad, suscripción, servicios financieros)

**Qué pasa.** Con una base de usuarios y proveedores activa, la plataforma puede monetizar de otras formas: publicidad dentro de la app para proveedores, una suscripción de envíos gratis para clientes frecuentes, o servicios financieros (adelantos o seguros) a la oferta. [S2] describe la lógica de ofrecer paquetes a través de varias plataformas ("envolvimiento") y de cobrar a quien más se beneficia; [S4] menciona que PedidosYa cobra a proveedores y negocios distintos conceptos (entre ellos, publicidad y un uso de plataforma).

**Variables que mueve.**
- Ingreso por transacción: sube (estimación: +1 a +4 puntos del GMV en ingresos accesorios).
- Costos de desarrollo y ventas: sube.
- Satisfacción de un lado: baja si siente que se le cobra de más (dirección; magnitud: estimación).
- Retención: sube con la suscripción (interpretación mía).

**Decisiones del alumno.**
1. *Vender publicidad dentro de la plataforma.* Ventaja: ingreso con poco costo marginal. Costo: los proveedores que más pagan ganan visibilidad y la experiencia del cliente puede empeorar.
2. *Lanzar una suscripción para clientes frecuentes.* Ventaja: ingreso recurrente y retención. Costo: costo por entrega gratis sin garantía de más pedidos.
3. *Ofrecer adelantos de ventas a proveedores.* Ventaja: lealtad y ingreso financiero. Costo: riesgo de impago y requisitos regulatorios (no verifiqué qué licencia exige la ASFI para esto; ver sección 9).
4. *No diversificar y centrarte en mejorar el servicio.* Ventaja: foco. Costo: dependes de la comisión, que es sensible a la fuga y a la competencia.

**Qué aprende.** Que una red activa es un activo que se puede monetizar de varias formas, pero cada una tiene un costo para alguno de los dos lados.

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

Todas son propuesta mía; las actualizaciones son una forma simple de modelarlas, no están tomadas de una fuente.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| **Oferta activa (S)** | Proveedores que realmente están disponibles (restaurantes, conductores) | S_t = S_{t-1} x (1 - rotación) + altas de oferta. Las altas dependen del gasto de captación de oferta y del ingreso esperado por proveedor (más pedidos por proveedor, más altas) |
| **Demanda activa (D)** | Clientes que piden al menos una vez en el mes | D_t = D_{t-1} x (1 - abandono) + altas de demanda. Las altas dependen del gasto de captación y del fill rate del mes anterior (efecto de red cruzado) |
| **Rotación de oferta** | % de proveedores que se va en el mes | Base + efecto de ingresos netos del proveedor, comisión, bonos y shocks (combustible, regulación) |
| **Frecuencia de pedidos** | Pedidos por cliente activo por mes | Constante por rubro, ajustada por promociones y por fill rate |
| **Capacidad por proveedor** | Pedidos que puede atender un proveedor al mes | Constante por rubro; baja en shocks (combustible) |
| **Tasa de match (fill rate)** | % de pedidos solicitados que se atiende | min(1, capacidad total de oferta / pedidos solicitados) x (1 - fricción). Si baja de cierto umbral, reduce las altas de demanda del mes siguiente |
| **Transacciones** | Pedidos cerrados | Pedidos solicitados x fill rate x (1 - cancelación) |
| **Ticket promedio** | Valor medio por pedido | Parámetro por rubro; ajustado por inflación y promociones |
| **GMV** | Valor bruto transado | Transacciones x ticket promedio |
| **Take rate bruto** | Comisión fijada | Decisión del alumno |
| **Tasa de fuga** | % del GMV que se paga fuera | Base del rubro + efecto del take rate + repetición de relaciones - beneficios que da la plataforma (seguro, garantía) |
| **Subsidio por transacción** | Descuentos y bonos pagados | Decisión del alumno y respuesta a la competencia; se resta del ingreso (take rate neto) |
| **Ingreso de la plataforma** | Lo que entra | GMV x (1 - fuga) x take rate bruto - subsidios + ingresos accesorios (publicidad, suscripción) |
| **Multihoming** | % de oferta que opera en otra app | Sube con la entrada de competidores y baja con exclusividad |
| **Presión competitiva** | Intensidad del rival grande | Evento (entrada de un competidor) que reduce demanda y sube el subsidio necesario |
| **Mix de pago (efectivo / digital)** | Proporción del GMV cobrada en efectivo | Parámetro por rubro; el efectivo genera cuentas por cobrar y riesgo de fraude |
| **Cuentas por cobrar de efectivo** | Plata que la oferta cobró por la plataforma y falta rendir | Efectivo del mes x porcentaje no rendido; se cobra con retraso de 1 a 2 meses |
| **Cumplimiento regulatorio** | Si se cumplen las reglas (registro, seguros, facturación) | Estado (cumple / en plazo / en mora). En mora: riesgo mensual de multa o suspensión |
| **Confianza / reputación por lado** | Valoración de la plataforma por clientes y por proveedores | Sube con buen servicio; baja con incidentes y con malas condiciones para la oferta |
| **Concentración** | Parte del GMV que depende de pocos socios | Sube con cuentas ancla; sube el riesgo si se van |

Notas de diseño (interpretación mía): (a) el umbral de masa crítica puede representarse con una regla simple: si fill rate o profundidad de mercado están bajo cierto valor durante varios meses seguidos, las altas de demanda caen y la plataforma entra en una espiral descendente; (b) conviene mostrar al alumno el take rate bruto y el neto por separado; (c) la liquidez debería calcularse **por ciudad o zona** si el alumno elige operar en más de una.

---

## 7. Ejemplos reales de Bolivia o Latinoamérica

Solo aparecen casos cuyo enlace abrí. Lo que dice la nota va como "Qué dice la fuente"; no es mi evaluación del negocio.

| Caso | País | Qué dice la fuente | Enlace |
|---|---|---|---|
| ÜPAKET (marketplace con almacenaje y entrega) | Bolivia | Fundado en 2019; primeras ventas en marzo de 2020; unos 80 "tiendas", siete empleados, inversión inicial de unos US$ 18.000 (la nota imprime "18.0000"); comisión de 10% a 15% por venta que incluye almacenaje; envío de Bs 5 en la mayoría de las ciudades; unos 80% de los productos son importados. Es una "publinota" (contenido patrocinado) de abril de 2021 | [Correo del Sur, 2021](https://correodelsur.com/ecos/20210415/el-mercado-en-linea-boliviano.html) |
| PedidosYa (reparto de comida) y condiciones de los repartidores | Bolivia | Estudio cualitativo de oct. 2022 a feb. 2023: costo de habilitación de Bs 13.164 a 16.524, pago de alrededor de Bs 2 por km, sistema de lotes 1 a 4, pedidos en efectivo con caja chica de Bs 300 a 400, cobro de "uso de plataforma". Enfoque crítico, basado en entrevistas | [Umbrales, UMSA, 2024](https://ojs.umsa.bo/index.php/umbrales/article/download/954/1055/2633) |
| Yango Comida (reparto de comida dentro de la "superapp" de transporte) | Bolivia | Septiembre de 2026: llegó a La Paz, tercera ciudad del país donde opera, con 206 restaurantes asociados. La nota no informa comisiones, repartidores ni competidores | [Descubre.vc, 2026](https://www.descubre.vc/noticia/yango-comida-expande-su-servicio-de-delivery-a-la-paz-bolivia-2026-09-23) |
| Registro obligatorio de apps de transporte (Uber, InDrive, Yango, Chukuta Móvil) | Bolivia | Decreto Supremo 5199 (agosto de 2024): registro nacional con requisitos de empresa, ATT reglamenta, municipios fiscalizan | [DPL News, 2024](https://dplnews.com/?p=245906) y [MobileTime, 2024](https://www.mobiletime.com.br/noticias/23/10/2024/bolivia-uber/) |
| Radiotaxistas contra Uber en Santa Cruz | Bolivia | Caravana el 31 de julio de 2018 con pancartas "Uber ilegal"; la municipalidad dijo que Uber no tenía permiso; Uber propuso una norma municipal como la de La Paz | [eju.tv, 2018](https://eju.tv/?p=1185697) |
| PedidosYa y las comisiones de restaurantes | Costa Rica (región, no Bolivia) | Entrevista de marzo de 2021: restaurantes se quejaban de comisiones de 30% a 35%; el director dijo que no todos pagan eso y que una entrega propia costaría algo similar | [El Financiero (CR), 2021](https://www.elfinancierocr.com/negocios/director-de-mercado-de-pedidosya-la-comision-es-la/B7R47RG2TVDCLDLLTSICZUMWEM/story) |
| Uber (plataforma de movilidad y reparto) | Global, documento ante la SEC (2019) | Gross Bookings 2017 y 2018 de US$ 34.409 y 49.799 millones; ingreso neto ajustado de US$ 7.191 y 10.025 millones; dice que igualará incentivos de rivales en algunos mercados aunque el margen sea negativo | [Uber, Formulario S-1](https://www.sec.gov/Archives/edgar/data/1543151/000119312519103850/d647752ds1.htm) |

Observación: de Bolivia encontré casos de comercio electrónico, reparto y movilidad. **No encontré datos de ingresos, comisiones ni resultados financieros publicados de las plataformas bolivianas** más allá de lo anterior (ÜPAKET 10-15% en una publinota; los repartidores de PedidosYa en un estudio crítico).

---

## 8. Fuentes numeradas con nivel

Niveles: **A** (libro, paper, organismo, manual universitario, documento oficial), **B** (consultora, reporte sectorial, prensa, glosario de firma de capital de riesgo), **C** (blog, práctica). "Texto leído" significa que leí contenido del documento (no solo la ficha).

| N.º | Fuente | Nivel | Qué verifiqué y qué alcance leí | Enlace |
|---|---|---|---|---|
| S1 | Jean-Charles Rochet y Jean Tirole, "Platform Competition in Two-Sided Markets", *Journal of the European Economic Association*, vol. 1(4), junio 2003, pp. 990-1029 (los datos de revista aparecen en el encabezado del PDF) | A (paper) | Texto leído: resumen, introducción, tablas 1 y 2 de ejemplos, y la sección 2.1 con la Proposición 1 (fórmulas de precios). No leí las secciones de competencia entre plataformas ni los casos de la sección 7 | https://www.ugr.es/~scarbo/ROCHETIR.pdf (copia alojada en una universidad) |
| S2 | Thomas Eisenmann, Geoffrey Parker y Marshall W. Van Alstyne, "Strategies for Two-Sided Markets", *Harvard Business Review*, octubre de 2006 | A (artículo académico de gestión, revista con revisión editorial) | Texto leído: gran parte (precios, subsidio, efectos de red, multihoming, ganador único, envolvimiento). Leí hasta el inicio del tramo sobre competir con un rival | https://www.kth.se/social/files/546b8e7ef2765474dd3f23fe/4.Eisenmann+et+al+(2006).pdf (copia alojada en una universidad) |
| S3 | Ekaterina Astashkina, Robert L. Bray, Ruslan Momot y Marat Salikhov, "A Disquieting Lack of Evidence for Disintermediation in a Home-Cleaning Platform", documento de trabajo, 28 de agosto de 2023 | A (paper, documento de trabajo; aún sin publicar en la versión que leí) | Texto leído: resumen, introducción, revisión de literatura (con citas de Gu y Zhu 2021, Gu 2022, Karacaoglu et al. 2022, Hagiu y Wright) y descripción del entorno. No leí la metodología estadística ni los resultados detallados | https://www.kellogg.northwestern.edu/faculty/bray/doc/disintermediation/disintermediation.pdf |
| S4 | Juan Pablo Neri Pereyra y Alejandro Arze Alegría, "Explotación y precarización del trabajo en las plataformas digitales de reparto", *Umbrales*, n.º 43, 2024, pp. 223-255 (UMSA) | A (artículo académico revisado, boliviano) | Texto leído: resumen, introducción, requisitos de habilitación, presupuesto, sistema de lotes, medición de distancia, pago por km, tabla de pago y discusión parcial. Es investigación cualitativa y de enfoque crítico | https://ojs.umsa.bo/index.php/umbrales/article/download/954/1055/2633 |
| S5 | ASFI (Autoridad de Supervisión del Sistema Financiero), nota "El uso del QR ha dinamizado el sistema de pagos en Bolivia", 2025 | A (organismo regulador) | Texto leído: toda la nota (datos del BCB). La nota cita a BCB como fuente de los datos | https://asfi.gob.bo/sites/default/files/2025-07/El%20uso%20del%20QR%20ha%20dinamizado%20el%20sistema%20de%20pagos%20en%20Bolivia.pdf |
| S6 | Uber Technologies, Inc., Formulario S-1 ante la SEC, 2019 | A (documento oficial de una empresa ante un regulador) | Texto leído: solo los primeros 100.000 de unos 420.000 caracteres (definiciones de Gross Bookings y Take Rate, cifras de 2017 y 2018, frases sobre liquidez e incentivos). No leí el resto | https://www.sec.gov/Archives/edgar/data/1543151/000119312519103850/d647752ds1.htm |
| S7 | David Evans y Richard Schmalensee, "Failure to Launch: Critical Mass in Platform Businesses", *Review of Network Economics* 9(4), 2010 | A (paper) | **Solo leí el resumen** en la ficha del repositorio del MIT (el PDF devolvió error de límite de consultas). No cito nada más que el resumen | https://dspace.mit.edu/handle/1721.1/76685 |
| S8 | a16z (Andreessen Horowitz), "Marketplace glossary", 2020 | B (firma de capital de riesgo) | Texto leído: definiciones de take rate, liquidez, fill rate, fuga, multihoming | https://a16z.com/2020/02/18/marketplace-glossary/ |
| S9 | Los Tiempos, "El Banco Central de Bolivia resalta uso del QR 28 veces por segundo en el país", 14/6/2026 | B (prensa) | Texto leído: cifras que la nota atribuye al BCB y a Asoban | https://www.lostiempos.com/actualidad/economia/20260614/banco-central-bolivia-resalta-uso-del-qr-28-veces-segundo-pais |
| S10 | Infobae, nota sobre filas y escasez de combustible en Bolivia, 7/7/2026 | B (prensa) | Texto leído | https://www.infobae.com/america/america-latina/2026/07/07/filas-y-escasez-de-combustible-marcan-un-nuevo-periodo-de-desabastecimiento-en-bolivia/ |
| S11 | DPL News, "Bolivia decreta registro nacional de aplicaciones digitales de movilidad", 16/8/2024 | B (prensa especializada) | Texto leído: decreto, requisitos, plazos | https://dplnews.com/?p=245906 |
| S12 | MobileTime, nota sobre Uber y el registro en Bolivia, 23/10/2024 | B (prensa especializada) | Texto leído | https://www.mobiletime.com.br/noticias/23/10/2024/bolivia-uber/ |
| S13 | Descubre.vc, "Yango Comida expande su servicio de delivery a La Paz", 23/9/2026 | B (prensa de emprendimiento) | Texto leído | https://www.descubre.vc/noticia/yango-comida-expande-su-servicio-de-delivery-a-la-paz-bolivia-2026-09-23 |
| S14 | Correo del Sur, "El mercado en línea boliviano" (publinota sobre ÜPAKET), 15/4/2021 | B (prensa; contenido patrocinado) | Texto leído | https://correodelsur.com/ecos/20210415/el-mercado-en-linea-boliviano.html |
| S15 | El Financiero (Costa Rica), entrevista al director de mercado de PedidosYa, 26/3/2021 | B (prensa) | Texto leído (resumen de la entrevista) | https://www.elfinancierocr.com/negocios/director-de-mercado-de-pedidosya-la-comision-es-la/B7R47RG2TVDCLDLLTSICZUMWEM/story |
| S16 | eju.tv, nota sobre la caravana de radiotaxistas contra Uber en Santa Cruz, 31/7/2018 | B (prensa) | Texto leído | https://eju.tv/?p=1185697 |

**Conteo.** 16 fuentes numeradas. Nivel A con texto leído: S1, S2, S3, S4, S5 y S6 (seis; S6 solo en parte). S7 es nivel A pero solo leí el resumen, así que no la cuento. Se cumple el mínimo de 4 fuentes A leídas con texto y de 8 fuentes en total.

**Observaciones sobre calidad de las fuentes.** S1 y S2 son versiones alojadas en sitios universitarios, no en el editor; los datos de revista vienen del propio PDF. S3 es un documento de trabajo. S4 es una investigación cualitativa crítica con muestra no declarada en lo que leí. S6 proviene de la propia empresa en un contexto de salida a bolsa. S14 es contenido patrocinado.

---

## 9. No confirmado

1. **Texto completo de Evans y Schmalensee (S7).** Solo leí el resumen; la cuenta de que el umbral es una "frontera" en el espacio de dos dimensiones la vi en un resultado de búsqueda que cita un artículo posterior de ten Kate y Niels (2024), que no abrí.
2. **Hagiu y Wright, "Marketplace Leakage" (Management Science, 2024).** La ficha de INFORMS devolvió error; solo conozco su resumen por resultados de búsqueda y lo que cita S3 sobre ellos. No cito sus resultados.
3. **Gu y Zhu (2021) y Gu (2022).** Solo los conozco a través de las citas que hace S3; no abrí los artículos. Las cifras (18,7% menos de desintermediación detectada, 33,6% más cobros, 26,5% más horas) son de la cita de S3.
4. **Karacaoglu et al. (2022).** Igual: lo que digo (66% y 74%, 24% más de limpiezas) viene de la cita de S3 y los autores de S3 señalan que se deduce por eliminación.
5. **Resto del S-1 de Uber.** No leí los montos de incentivos a conductores ni el take rate publicado año por año; los porcentajes que doy son cálculo mío con las cifras de la tabla.
6. **Cifras del QR de Asoban/BCB.** Los 891 millones de operaciones, los 3,7 millones de usuarios y 1,5 millones de comercios vienen de una nota de prensa [S9] que cita a Asoban; la nota no aclara el año del récord. No abrí el informe del BCB ni su comunicado de noviembre de 2025 con el Banco Mundial (el PDF no pudo leerse).
7. **Normativa boliviana de plataformas de delivery y marketplaces.** No encontré ni abrí un registro o reglamento específico para reparto o comercio electrónico. No abrí el texto del Decreto Supremo 5199 ni la reglamentación de la ATT: solo la prensa [S11, S12]. No sé qué multas se aplican ni su monto.
8. **Que Yango sea "la primera app oficialmente registrada ante la ATT".** Es una afirmación de un ejecutivo en una red social que apareció en un resultado de búsqueda; no la abrí.
9. **Comisiones reales en Bolivia.** No encontré la comisión de PedidosYa ni de Yango Comida a restaurantes en Bolivia. La cifra de 30%-35% [S15] es de Costa Rica (2021) y de boca de los restaurantes. La de ÜPAKET (10%-15%) es de una publinota de 2021.
10. **Pagos a conductores de transporte en Bolivia** (comisión de InDrive, Uber, Yango): no encontré datos. En un resultado de búsqueda apareció que InDrive es la app dominante en La Paz, Santa Cruz, Cochabamba y Sucre según una guía de viajes (marzo de 2026): no la abrí.
11. **Proyectos de ley sobre trabajadores de plataformas en Bolivia.** No encontré ninguno. Sobre Perú, Costa Rica y Colombia solo vi resultados de búsqueda de prensa que no abrí.
12. **Impuestos específicos** (IVA, IT, impuestos a servicios digitales extranjeros) y facturación de comisiones de una plataforma en Bolivia: no los investigué.
13. **Servicios financieros de la plataforma** (adelantos, billetera): no verifiqué qué licencia exige ASFI o el BCB.
14. **Efecto de la crisis de combustible sobre las plataformas.** La nota [S10] habla del transporte en general. La relación con apps de reparto y viajes es interpretación mía.
15. **Restricciones de pagos en dólares a proveedores extranjeros** que afectan a plataformas con costos en dólares (nube, mapas, pasarelas): no las reinvestigué aquí; ver la ficha de suscripción, que trata el tema con fuentes.
16. **Libros clásicos del tema** (por ejemplo, de Parker, Van Alstyne y Choudary sobre plataformas; de Hagiu; de Evans y Schmalensee): no los abrí ni confirmé su ficha de catálogo, por lo que no cito autor, edición ni editorial.

---

## 10. Cifras que necesitan validación local

Cada ítem es una magnitud que es estimación mía o que no tiene dato de Bolivia, con quién podría aportarla.

| Cifra | Estado | Quién podría aportarla |
|---|---|---|
| Take rate típico por rubro en Bolivia (delivery, transporte, marketplace de productos, servicios) | Sin dato boliviano confiable; solo 10%-15% en una publinota [S14] y 30%-35% de Costa Rica [S15] | Dueños de restaurantes y cámaras gremiales; fundadores de plataformas bolivianas (ÜPAKET, Soukers, Likida); docente del área de emprendimiento |
| Tasa de fuga (desintermediación) por rubro | Estimación mía (3% a 20%); la evidencia es de otros países y rubros [S3] | Fundadores de plataformas; dueños de restaurantes; conductores |
| Gasto de captación por lado (CAC de oferta y de demanda) | Estimación | Fundadores de plataformas; agencias de marketing digital en Bolivia |
| Cuántos pedidos o proveedores hacen falta para la "masa crítica" por ciudad | Estimación; la fuente [S7] solo da la idea | Fundadores; docente de emprendimiento |
| Efecto de un competidor grande sobre demanda y oferta (-10% a -30% de demanda) | Estimación | Fundadores de plataformas locales que enfrentaron la entrada de rivales |
| Rotación mensual de repartidores y conductores | Estimación (+3 a +10 puntos) | Plataformas; asociaciones de repartidores o de choferes; CEDLA |
| Ingreso neto del repartidor (tarifa por km, bonos) | Parcial: Bs ~2 por km y bonos de Bs 5-6 y Bs 2 [S4] en 2022-2023 | CEDLA; repartidores; plataformas |
| Fraude y pedidos falsos como % de pedidos (1% a 3%) | Estimación | Plataformas de delivery; ASFI; empresas de pagos |
| Costo de pasarela de pagos y conciliación (1% a 3% del GMV) | Estimación | Bancos, proveedores de QR, ASOBAN |
| Proporción de pedidos en efectivo en delivery y transporte | Sin dato por rubro; solo el 64% de pagos en efectivo en general, según una nota de prensa [S9] | Plataformas; BCB; ASFI |
| Costo y tiempo de cumplir con el registro de apps de transporte; multas | Sin dato; no abrí el decreto ni la norma de la ATT | ATT; abogado especialista en regulación; plataformas registradas |
| Impacto de la crisis de combustible en la oferta (-20% a -50%) | Estimación | Choferes y repartidores; sindicatos; plataformas |
| Pérdida de ingresos por conflicto con transporte tradicional (días de operación afectados) | Estimación | Plataformas de movilidad; sindicatos de choferes |
| Caída de reputación y demanda tras un incidente (-10 a -30 puntos; -5% a -20%) | Estimación | Plataformas; empresas de comunicación de crisis |
| Efecto de la exclusividad sobre la comisión y el multihoming | Estimación | Dueños de restaurantes; gerentes de plataformas |
| Ingresos accesorios (publicidad, suscripción de envíos) como % del GMV (+1 a +4 puntos) | Estimación | Plataformas; agencias de publicidad digital |
| Ticket promedio y frecuencia de pedidos por rubro y ciudad | Sin dato | Plataformas; cámaras de restaurantes; INE (si tiene encuestas de gasto de hogares) |
| Capital inicial típico para lanzar un marketplace en Bolivia | Un solo dato: unos US$ 18.000 inicial de ÜPAKET en una publinota [S14] | Fundadores; incubadoras y aceleradoras locales |
| Cuota de mercado de cada plataforma en cada ciudad | Sin dato (solo vi un ranking de descargas de una consultora, que no abrí) | Consultoras de mercado; plataformas |
