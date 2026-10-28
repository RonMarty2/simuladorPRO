# Tipo B1: Planes y campañas de marketing

Investigación de metodología para SIMPRO. Fecha de la investigación: 22 de octubre de 2026.

Convenciones de este documento:
- **[Fuente N]** significa que la cifra o idea está en la fuente numerada de la sección 8, y que la abrí y la leí.
- **[Estimación]** significa que es una magnitud mía, para que el simulador funcione. No viene de ninguna fuente y hay que calibrarla.
- **[Interpretación]** significa que es mi lectura de lo que dice una fuente, no lo que dice la fuente.
- Los nombres de fuentes que solo vi en un buscador, sin abrirlas, están en la sección 9, no en la 8.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

Un plan o campaña de marketing es un gasto cuyo beneficio **no es un ingreso propio**. La campaña no vende nada por sí misma. Lo que se espera es que el negocio venda **más de lo que habría vendido sin ella**: más clientes nuevos, más compras de los que ya tenía, o una marca más conocida que facilita ventas futuras.

La idea central, que atraviesa todo el documento, es esta: **el beneficio de la campaña es la diferencia entre lo que pasó y lo que habría pasado igual**. A lo que habría pasado igual se le llama "base" o "línea base" (baseline) y al resto, "venta incremental".

Ejemplo boliviano con números de prensa: en un día normal un maestro salteñero vende entre 700 y 800 salteñas y el Día del Padre entre 3.000 y 4.000 [Fuente 14]. Si una marca de manteca lanza una acción ese día y las ventas suben, la mayor parte de ese salto **ya iba a ocurrir** por la fecha. Atribuirle todo a la acción sería un error de contabilidad, no una ganancia. El valor real de la campaña es solo lo que se sumó sobre ese salto natural.

Cómo aporta valor, en cuatro vías (clasificación mía, [Interpretación]):

1. **Captar clientes nuevos** que no habrían llegado solos (la vía que más se puede medir).
2. **Reactivar o hacer comprar más** a clientes que ya existen (cuidado: aquí el riesgo de pagar por ventas que habrían ocurrido igual es mayor; ver sección 4).
3. **Construir marca o recordación**, con efecto lento que dura más que la campaña (arrastre).
4. **Defender la posición** frente a un competidor (el beneficio es la venta que NO se pierde, que es aún más difícil de medir).

Dato duro de eficacia: en una revisión de 751 estimaciones de corto plazo y 402 de largo plazo, de 56 estudios entre 1960 y 2008, la "elasticidad" promedio de la publicidad fue 0,12 en el corto plazo y 0,24 en el largo plazo [Fuente 3]. Eso significa que, en promedio, un aumento de 1% en publicidad se asoció a un aumento de 0,12% en ventas en el corto plazo. Es un efecto chico. La mediana fue 0,05 y la elasticidad bajó con los años [Fuente 3]. Esto desmiente la idea de que "más publicidad siempre multiplica las ventas".

---

## 2. Indicadores propios y cómo se calculan

Aclaración de honestidad: las fórmulas de ROAS, CAC, payback y conversión son definiciones de uso estándar en la industria. No abrí una fuente de nivel A que las defina con esas palabras. Marco cada una según lo que sí verifiqué.

| Indicador | Fórmula | Qué dice | Respaldo |
|---|---|---|---|
| **Venta incremental** | Ventas con campaña − ventas base (lo que habría pasado sin ella) | Lo único que la campaña "causó" | Idea de "Baseline-Lift" en [Fuente 5]. La base se estima con grupo de control o con un modelo [Fuente 5, 2] |
| **ROI de marketing (MROI)** | (Valor financiero incremental generado − costo de marketing) / costo de marketing | Retorno por cada boliviano gastado. Se justifica si es positivo y supera la tasa de corte (hurdle rate) de la empresa | Definición textual en [Fuente 5] |
| **MROI con margen (versión de prueba A/B)** | (Margen bruto con campaña − margen bruto sin campaña − gasto de campaña) / gasto de campaña | Igual que el anterior, pero usando márgenes. Es la fórmula que el paper da para un test con grupo control | [Fuente 5] |
| **MROI total, incremental y marginal** | Total: sobre todo el gasto. Incremental: sobre un aumento de gasto. Marginal: sobre el último boliviano gastado | Se debe decir cuál de los tres se está reportando | [Fuente 5] |
| **ROAS (reportado)** | Ingreso que la plataforma atribuye a la campaña / gasto en la campaña | Es ingreso, no ganancia, y la plataforma tiende a atribuirse ventas que habrían ocurrido igual | Definición estándar [Interpretación]. El problema de sobreatribución está en [Fuente 1, 4] |
| **ROAS incremental (iROAS)** | Ingreso incremental estimado / gasto incremental | Ingreso causado por boliviano gastado | Fórmula en [Fuente 10] (nivel C). Ejemplo ilustrativo de esa fuente: ROAS reportado 8,0 contra iROAS 4,0 (esa cifra la pone la fuente como ejemplo, no como dato empírico) |
| **ROAS de equilibrio** | 1 / margen bruto | ROAS mínimo para no perder. Con margen de 40%, hace falta ROAS incremental de 2,5 | Aritmética mía [Interpretación]. Coincide con la idea de [Fuente 5] de medir ganancia, no ingreso |
| **Lift (levantamiento)** | (Conversión del grupo expuesto − conversión del grupo control) / conversión del grupo control | Cuánto más compra quien vio la campaña respecto a quien no | Uso en [Fuente 4]. En su ejemplo: control 0,033% y test 0,079% dan lift de 73% sobre quienes realmente vieron la campaña (ATT) |
| **Costo de adquisición de cliente (CAC)** | Gasto total de captación (campaña, agencia, comisiones) / clientes **nuevos** que la campaña causó | Cuánto cuesta cada cliente que de verdad no habría llegado solo | Definición estándar [Interpretación]. Ojo: el denominador debe ser incremental, si no el CAC sale falsamente bajo |
| **Valor de vida del cliente (LTV o CLV), modelo básico** | CLV = GC × Σ r^i/(1+d)^i − M × Σ r^(i−1)/(1+d)^(i−0,5), donde GC es el margen de contribución por período, M el costo de retención por período, r la retención entre períodos, d la tasa de descuento y n el horizonte | Valor presente del margen futuro de un cliente, descontando que algunos se van | Modelo de Berger y Nasr (1998), tal como lo reproduce [Fuente 8]. No abrí el artículo original |
| **LTV simplificado (perpetuidad)** | Margen por período × r / (1 + d − r) | Atajo con margen, retención y tasa constantes | Lo vi citado en un diccionario de marketing que no abrí; lo marco como no confirmado en la sección 9. Se obtiene del anterior sumando una serie infinita [Interpretación] |
| **Relación LTV / CAC** | LTV / CAC | Si cada cliente deja más de lo que costó captarlo | Práctica común (nivel C). No verificada con fuente abierta |
| **Período de recuperación (payback) del CAC** | CAC / margen de contribución mensual por cliente | Meses hasta recuperar lo gastado en captar un cliente | Definición estándar [Interpretación] |
| **Elasticidad publicitaria** | % de cambio en ventas / % de cambio en publicidad | Sensibilidad de las ventas al gasto | Definición en [Fuente 3] |
| **Elasticidad de largo plazo (con arrastre)** | Elasticidad de corto plazo / (1 − coeficiente de arrastre) | Efecto total acumulado incluyendo meses posteriores | [Fuente 3]. Ejemplo de esa fuente: 0,22 / (1 − 0,468) = 0,414 en el estudio anterior |
| **Gasto óptimo (Dorfman-Steiner)** | Gasto óptimo como % de ventas = elasticidad × margen bruto | El gasto que maximiza ganancia. Con margen bruto 50% y elasticidad 0,08, el gasto óptimo es 4% de ventas, y ahí el MROI marginal es cero | [Fuente 5], que cita a Hanssens, Parsons y Schultz (2001) |
| **Stock publicitario (adstock) geométrico** | Adstock(t) = Gasto(t) + λ × Adstock(t−1), con λ entre 0 y 1 | Efecto que persiste y decae mes a mes | La forma "con decaimiento geométrico" la describe [Fuente 6] (la fórmula exacta con λ la leí en un resultado de buscador y en un glosario, ver sección 9). Es práctica estándar en modelos de mezcla de medios |
| **Saturación (función Hill)** | Hill(x) = 1 / (1 + (x/K)^(−S)), donde K es el punto de media saturación y S la pendiente | Rendimientos decrecientes: cada boliviano extra rinde menos | [Fuente 6]. Aclaran que los parámetros de Hill a veces no se pueden identificar bien con pocos datos |
| **ROAS y mROAS desde modelo** | ROAS: efecto incremental total / gasto. mROAS: efecto del último boliviano | Retorno medio y marginal de un canal | [Fuente 6] |

Sobre el decaimiento: [Fuente 6] dice que la versión geométrica supone que el efecto **tiene su pico en el mismo período** del gasto, y por eso proponen una versión con pico retrasado (delayed adstock). La velocidad de decaimiento por canal (TV vs búsqueda pagada) la vi mencionada en un resultado de buscador y la dejo como no confirmada.

---

## 3. Cómo se evalúa económicamente

### Qué hace el VAN/TIR clásico con una campaña, y por qué falla solo

El VAN clásico necesita un flujo de caja de ingresos y costos del proyecto. En una campaña no hay ingreso propio. Si el alumno carga "todas las ventas del período" como ingreso de la campaña, el VAN sale inflado, porque cuenta la base como si la hubiera causado la campaña. Esto es el error número uno (sección 4).

### Qué se agrega o se reemplaza

**El VAN no se reemplaza: se alimenta con otro flujo.** El flujo de la campaña pasa a ser:

Flujo mensual de la campaña = (ventas incrementales × margen de contribución) − costo de la campaña − costos operativos adicionales por vender más (stock, atención, entrega).

Con ese flujo sí se puede calcular VAN y TIR. [Interpretación]. Un apoyo para esto es [Fuente 5]: define el MROI como valor financiero incremental menos el costo de marketing, dividido por el costo, y dice que marketing es una inversión que se justifica si el MROI es positivo y supera la tasa de corte de la empresa, y que esa tasa debe incluir el costo de capital de la firma. [Fuente 5] también advierte que algunas acciones de marketing "generan retornos de varios años, acumulando impacto y creando activos con valor futuro", y que otras se agotan en el período.

### Qué se complementa

1. **ROI/MROI incremental y ROAS incremental**: son la versión "un solo número" del flujo anterior. Sirven para comparar campañas entre sí y con el ROAS de equilibrio (1 / margen).
2. **CAC y LTV**: cuando el objetivo es captar clientes, el flujo de un cliente continúa mucho después de la campaña. Una campaña con VAN negativo en 12 meses puede ser buena si el cliente se queda (ver sección 5, situación 8). El CLV de Berger y Nasr es un VAN por cliente [Interpretación], que descuenta que algunos se van.
3. **Gasto óptimo y rendimientos decrecientes**: [Fuente 5] explica que maximizar ganancia no es lo mismo que maximizar el MROI. Se sigue gastando mientras el retorno marginal sea positivo. Una campaña con ROI alto a poco gasto puede ser mala si está muy por debajo del gasto óptimo y se dejan ganancias sobre la mesa.
4. **Intervalos, no puntos**: la evidencia experimental muestra que la incertidumbre es enorme (ver abajo). Por eso conviene evaluar con escenarios, no con una cifra.

### Por qué esto es difícil: lo que dice la evidencia

- **Observacional vs experimento.** En 15 experimentos de Facebook con 500 millones de observaciones, los métodos que comparan expuestos contra no expuestos (aun con muchas variables de control) fallaron muchas veces en reproducir el efecto del experimento; en la mitad de los estudios la estimación del aumento porcentual de compras estaba equivocada por un factor de tres [Fuente 4]. Generalmente sobreestimaban, aunque a veces subestimaban [Fuente 4].
- **El ejemplo extremo de sobreatribución.** En experimentos de eBay, estimar el retorno con regresión corriente daba un ROI de más de 4.100% (sin controles) o más de 1.400% (con controles). El experimento dio un ROI de −63%, con intervalo de confianza de 95% entre −124% y −3% [Fuente 1]. Para anuncios sobre la propia marca, el 99,5% de los clics perdidos al apagarlos se recuperó por búsqueda gratuita [Fuente 1]. Para palabras clave sin marca, los usuarios nuevos y poco frecuentes respondían, pero los usuarios frecuentes (que compraban de todos modos) concentraban la mayor parte del gasto [Fuente 1]. La publicidad de búsqueda en conjunto sumó solo 0,66% a las ventas [Fuente 1]. Ojo: es eBay, una marca muy conocida; los autores dicen que la efectividad es pequeña "para una empresa muy conocida como eBay" [Fuente 1], y yo infiero que para una marca chica y desconocida el resultado podría ser distinto [Interpretación].
- **Medir es caro y ruidoso.** En 25 experimentos con grandes minoristas de EE.UU., la mediana del intervalo de confianza del ROI era de más de 100 puntos porcentuales de ancho, y un experimento informativo puede requerir más de 10 millones de "persona-semana" [Fuente 2]. Para distinguir una campaña que rinde +50% de una que empata hacía falta una campaña 9 veces más grande; para distinguir una diferencia de 10% de ROI, 62 veces más grande [Fuente 2]. Los autores dicen que su resultado puede no aplicar a empresas chicas o productos nuevos [Fuente 2].
- **Lectura para Bolivia [Interpretación]:** una pyme boliviana casi nunca puede hacer un experimento con potencia estadística. Debe aceptar que su medición será imprecisa, usar controles baratos (pausar en una ciudad, comparar semanas, cupones con código propio) y decidir con márgenes de seguridad.

### Marketing mix y efecto de arrastre

Cuando hay varios canales se usan modelos de mezcla de medios (Marketing Mix Models), que estiman cuánto aporta cada canal con dos ingredientes: arrastre (el efecto dura más que el gasto) y saturación (cada boliviano extra rinde menos) [Fuente 6]. Ese paper concluye que los modelos funcionan bien con muchos datos, pero que con pocos datos los supuestos previos (priors) mandan y pueden sesgar, y que la mezcla óptima estimada tiene alta varianza [Fuente 6]. Para el simulador, la lección es pedagógica: **ninguna cifra de ROI de canal es exacta**.

---

## 4. Errores típicos de estudiantes y emprendedores

Los de 1 a 6 están respaldados por la evidencia citada. Los demás son observaciones mías de práctica y los marco como [Interpretación].

1. **Atribuir toda la venta del período a la campaña.** Confunde base con incremento. Ver el caso del Día del Padre [Fuente 14] y la definición de baseline-lift [Fuente 5].
2. **Creer el ROAS de la plataforma.** Las plataformas cuentan compras de gente que ya iba a comprar. Evidencia: [Fuente 1, 4]. Un glosario de nivel C da el ejemplo de 8,0 contra 4,0 [Fuente 10], pero la evidencia dura es [Fuente 1].
3. **Pagar para captar a quien ya es cliente.** En eBay, los usuarios frecuentes eran la mayor parte del gasto en palabras sin marca y compraban igual [Fuente 1]. Aplica a remarketing y a descuentos masivos.
4. **Pagar por tu propia marca.** Si alguien te busca por nombre, ya te eligió [Fuente 1: 99,5% recuperado de forma gratuita].
5. **Reportar ROI sin decir si es total, incremental o marginal, ni el horizonte.** [Fuente 5] propone una frase fija para evitarlo.
6. **Medir ingreso en vez de ganancia.** ROAS 3 con margen de 30% pierde plata (3 × 0,30 = 0,90 por boliviano). [Fuente 5] lo distingue como "Revenue MROI" frente a ganancia [Interpretación de la aritmética].
7. **Ignorar el arrastre.** Cortar la campaña al mes 3 porque "no vendió" cuando el efecto aparece después [Fuente 3, 6].
8. **Ignorar la saturación.** Duplicar el gasto y esperar el doble de ventas [Fuente 6].
9. **Confundir objetivo con resultado.** "Quiero 10.000 seguidores" no es un objetivo económico. Seguidores, alcance y clics son métricas intermedias y no hay que usarlas como si fueran ventas. [Fuente 2] evita las métricas intermedias como clics por sus complicaciones.
10. **Calcular LTV con retención inventada.** El LTV es muy sensible a la retención [Interpretación; un estudio que vi en un buscador, no abierto, dice lo mismo, ver sección 9].
11. **No prever que la campaña funciona.** Si el negocio no tiene stock, personal o capacidad de entrega para la demanda, se pierde la venta y la reputación (situación 11).
12. **Sacar conclusiones con muy poca muestra.** Con ventas diarias de 5 unidades, nada es significativo. [Fuente 2] muestra que incluso con millones de usuarios la medición es imprecisa.
13. **Presupuestar en dólares sin considerar que puede no haber cómo pagar** (situación 4).

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Todas las magnitudes son plausibles para jugar; cuando viene de fuente lo digo. El resto es [Estimación] y debe calibrarse. Direcciones: sube (+) o baja (−) sobre el valor del mes indicado.

Convención de variables (definidas en la sección 6): `base`, `gasto`, `adstock`, `sat` (saturación), `cpc_f` (factor de costo de medios), `conv` (conversión), `capt` (parte de los compradores que ya iban a comprar), `ret` (retención de clientes nuevos), `rep` (reputación), `cal_med` (calidad de medición), `cap_op` (capacidad operativa).

### Situación 1. La campaña le cobra a quien ya iba a comprar

**Qué pasa.** El panel de la plataforma muestra un ROAS de 6 y la agencia celebra. Pero casi todas las ventas atribuidas vienen de remarketing y de búsquedas con el nombre de tu marca: gente que ya te había elegido. Tú recién lo notas cuando pausas una semana y las ventas casi no cambian. Evidencia del fenómeno: [Fuente 1].

**Variables que mueve.**
- `capt` (parte capturada): sube hasta 60%-90% en campañas de remarketing o de marca. Fuente: en eBay el 99,5% del tráfico de la palabra de marca se recuperó sin pagar [Fuente 1]; para la marca chica boliviana la cifra es [Estimación].
- ROAS reportado frente a iROAS: el reportado puede ser de 2 a 5 veces el real [Estimación; el orden de magnitud de la brecha lo respalda [Fuente 1, 4], la proporción exacta no].
- `caja`: baja por el gasto sin ventas nuevas.

**Decisiones.**
1. *Mantener el gasto porque el panel dice ROAS alto.* Ventaja: no hay riesgo de perder ventas visibles y la agencia no se queja. Costo: sigues pagando una parte grande por ventas que ocurrirían igual.
2. *Pausar todo remarketing y marca por 4 semanas como prueba.* Ventaja: descubres la venta real incremental y puedes reasignar el dinero. Costo: si resulta que sí aportaban, pierdes ventas esas semanas; el resultado es ruidoso por el tamaño chico [Fuente 2].
3. *Recortar a la mitad y reasignar a captar clientes nuevos (prospección).* Ventaja: compromiso entre ambos. Costo: el costo por cliente nuevo es más alto y menos visible en el panel; tarda más en dar resultados.
4. *Pedirle a la agencia un test con grupo de control (cobra extra).* Ventaja: medición creíble. Costo: honorarios, tiempo y probable respuesta "no hay datos suficientes".

**Qué aprende.** La diferencia entre venta atribuida y venta incremental. Que un indicador que mide mal puede dar felicidad falsa.

### Situación 2. Saturación de la audiencia

**Qué pasa.** Llevas dos meses mostrando los mismos anuncios al mismo público de tu ciudad, que en Bolivia suele ser un mercado chico (Sucre, Tarija, Cochabamba). La frecuencia sube, el costo por cliente nuevo también y el "lift" cae. Evidencia general de rendimientos decrecientes: [Fuente 6].

**Variables que mueve.**
- `sat`: aumenta; cada boliviano extra rinde menos. Forma Hill de [Fuente 6]; los valores K y S son [Estimación] (por ejemplo K igual al gasto mensual con el que se alcanza el 50% del efecto máximo).
- CAC: sube 30% a 100% [Estimación].
- `conv`: baja 10% a 25% [Estimación].

**Decisiones.**
1. *Subir el presupuesto para "romper" la saturación.* Ventaja: puede captar a nuevos por volumen. Costo: el marginal es muy bajo y el MROI marginal puede ser negativo [Fuente 5, concepto].
2. *Renovar creatividades y segmentos (más trabajo, más costo de producción).* Ventaja: reactiva el interés. Costo: gasto fijo en producir material y no siempre funciona.
3. *Mantener presupuesto pero ampliar a otra ciudad o canal.* Ventaja: audiencia nueva. Costo: requiere logística y no hay datos previos; puede ser una apuesta.
4. *Bajar el gasto y pasar a un nivel de mantenimiento.* Ventaja: protege la caja. Costo: pierdes parte del arrastre acumulado y crecimiento.

**Qué aprende.** Cada boliviano rinde menos que el anterior; el gasto óptimo es donde el último boliviano ya no paga. Dorfman-Steiner: gasto óptimo = elasticidad × margen × ventas [Fuente 5].

### Situación 3. La fecha pico

**Qué pasa.** Se acerca el Día del Padre, Navidad o una fecha local fuerte. Las ventas se disparan solas: en un día normal un maestro salteñero vende 700-800 salteñas y en el Día del Padre 3.000-4.000 [Fuente 14]. Los medios cuestan más en esas fechas (el alza del costo de medios es [Estimación]) y todos los competidores anuncian. Tú puedes invertir fuerte creyendo que "ahí está la plata".

**Variables que mueve.**
- `base`: sube mucho sola, +100% a +400% en el mes de la fecha [la cifra de 4 a 5 veces viene de [Fuente 14]; aplica a ese rubro; para otros rubros es [Estimación]].
- `cpc_f`: +20% a +60% en el mes pico [Estimación].
- Venta incremental: puede ser chica en proporción a la base, porque el cliente ya iba a comprar.
- `cap_op`: se estresa.

**Decisiones.**
1. *Gastar el doble en el pico.* Ventaja: visibilidad cuando hay más gente buscando; si hay capacidad, capturas más del total. Costo: pagas más caro por llegar a gente que igual compraba; el incremental es pequeño.
2. *Ahorrar el gasto del pico y gastarlo antes (precalentar).* Ventaja: medios más baratos y ventas adelantadas que no cuentan como robo del pico. Costo: efecto de arrastre incierto, parte del gasto se desperdicia.
3. *Gastar poco y concentrar en asegurar stock y atención.* Ventaja: no pierdes ventas por no dar abasto. Costo: renuncias a ganar cuota frente a quien sí anuncia.
4. *Acción de fidelización para clientes actuales (empaque, regalo, mensaje).* Ventaja: refuerza la relación (es lo que hizo la marca de manteca con sus clientes salteñeros [Fuente 14]); barato. Costo: no capta clientes nuevos; el efecto es difícil de medir.

**Qué aprende.** Distinguir la base estacional del incremento. Que en el pico el incremental por boliviano puede ser menor aunque las ventas totales sean mayores.

### Situación 4. El pago de la publicidad digital se bloquea

**Qué pasa.** Pagas Facebook/Instagram con una tarjeta. Por la escasez de divisas, los bancos restringen compras en internet (planteado en un conversatorio de la FES e Internet Bolivia, agosto de 2024 [Fuente 12]). Tu tarjeta es rechazada y las campañas se pausan. Al reanudar, el costo sube un tiempo porque la plataforma "reaprende". Análogo en Argentina: al llegar al límite de la tarjeta las campañas se detienen y cada interrupción reinicia la optimización, con CPM y CPC más altos y peor ROAS; los impuestos a pagos internacionales encarecen hasta un 50% [Fuente 16; es contenido patrocinado por un proveedor de crédito, usar con cuidado].

**Variables que mueve.**
- `gasto_efectivo`: cae a 0 durante 1-2 meses [Estimación].
- `cpc_f`: +15% a +40% el mes de reanudación [Estimación; la dirección está en [Fuente 16], la magnitud no].
- `adstock`: decae según λ; se pierde parte del arrastre.
- Costo financiero: comisión de un intermediario, 5% a 15% sobre el gasto [Estimación].

**Decisiones.**
1. *Pagar con un intermediario o tarjeta externa (comisión).* Ventaja: la campaña sigue. Costo: la comisión encarece el CAC; hay riesgo de fraude o de cumplimiento.
2. *Mover la inversión a canales que se pagan en bolivianos (afiches, radio, alianzas, WhatsApp propio).* Ventaja: sin riesgo de pago. Costo: menos medible y menos segmentable.
3. *Pausar y esperar a que se normalice.* Ventaja: no gastas. Costo: pierdes arrastre y posición; los competidores ocupan el espacio.
4. *Pasar al marketing orgánico (contenido, referidos) con mayor dedicación del dueño.* Ventaja: casi sin costo en efectivo. Costo: horas de trabajo y resultados lentos.

**Qué aprende.** Que el canal depende de condiciones del entorno, que hay riesgo de dependencia de pago en moneda extranjera y que interrumpir una campaña tiene un costo oculto.

### Situación 5. El competidor lanza una guerra de ofertas

**Qué pasa.** Un competidor lanza un 30% de descuento y una campaña fuerte. Tu base de clientes empieza a probar al otro. Tus anuncios ahora compiten por la misma atención.

**Variables que mueve.**
- `base`: baja 5% a 20% mientras dure [Estimación].
- `conv`: baja 10% a 30% [Estimación].
- `cpc_f`: sube 10% a 30% por mayor competencia en las subastas [Estimación].
- `margen`: baja si igualas el descuento.

**Decisiones.**
1. *Igualar el descuento.* Ventaja: no pierdes clientes de inmediato. Costo: margen más bajo; atrae clientes sensibles al precio que se irán al terminar (`ret` baja).
2. *Mantener precio y reforzar valor (calidad, servicio, garantía) en la comunicación.* Ventaja: protege margen y marca. Costo: puedes perder volumen un tiempo.
3. *Contraatacar con campaña de fidelización solo a tus clientes actuales (beneficio exclusivo).* Ventaja: defiende la base con costo acotado. Costo: no capta nuevos y se pierde en lo que ya compraba de todos modos (riesgo de la situación 1).
4. *Esperar y observar 4-6 semanas.* Ventaja: ahorras. Costo: si el competidor sigue, pierdes cuota que cuesta recuperar.

**Qué aprende.** Que una campaña defensiva tiene un valor "contrafactual": es la venta que no perdiste, difícil de medir. Que descontar para captar clientes puede deteriorar el LTV.

### Situación 6. Falla la medición

**Qué pasa.** El píxel de seguimiento se rompe tras un cambio en la web, o el cambio de una app te deja sin datos de conversiones. Durante semanas no sabes qué campaña funciona. La plataforma sigue optimizando con datos incompletos.

**Variables que mueve.**
- `cal_med`: baja de 1 a 0,3-0,6 durante 1-2 meses [Estimación].
- Eficiencia de la optimización automática: −10% a −30% [Estimación].
- Capacidad de aprender: se retrasa la detección de problemas (situaciones 1 y 2).

**Decisiones.**
1. *Reparar la medición de inmediato (pago a un técnico).* Ventaja: recuperas visibilidad. Costo: dinero y días de campaña a ciegas.
2. *Medir de forma simple: código de cupón o "¿cómo nos conociste?" en WhatsApp.* Ventaja: barato y robusto a cambios de plataforma. Costo: subregistro, depende de que el cliente conteste.
3. *Dejar campañas "ciegas" con presupuesto reducido.* Ventaja: no pierdes del todo la presencia. Costo: no sabrás si funcionan.
4. *Pausar hasta tener datos.* Ventaja: no gastas sin saber. Costo: pierdes arrastre y ritmo.

**Qué aprende.** Que sin medición no hay evaluación económica. La lección de [Fuente 2] es que medir ya es difícil con buenos datos.

### Situación 7. El efecto llega tarde y el dueño corta la campaña

**Qué pasa.** Lanzas una campaña de marca. En los dos primeros meses el costo por venta se ve alto y hay presión del dueño. La literatura dice que el efecto de largo plazo es unas dos veces el de corto plazo en promedio (0,24 contra 0,12 [Fuente 3]). Pero cortar a tiempo evita pérdidas si la campaña no funciona.

**Variables que mueve.**
- `adstock`: se acumula; si se corta, decae con λ.
- Ventas incrementales: mes 1-2 bajas, meses 3-6 más altas [la proporción larga/corta de ~2 viene de [Fuente 3]; el perfil mensual es [Estimación]].
- ROI de corto plazo negativo, de largo plazo positivo.

**Decisiones.**
1. *Cortar a los 2 meses por mal ROI.* Ventaja: salvas la caja. Costo: si el arrastre era real, tiras la inversión sin cosechar.
2. *Mantener 6 meses con presupuesto fijo.* Ventaja: das tiempo al arrastre. Costo: si no funciona, pierdes más.
3. *Mantener con indicadores intermedios de control (búsquedas de la marca, consultas por WhatsApp) y un punto de decisión fijado de antemano.* Ventaja: decisión con criterio. Costo: esas métricas intermedias pueden engañar [Fuente 2].
4. *Reducir a mitad y reevaluar.* Ventaja: compromiso. Costo: si el efecto necesita masa mínima, queda por debajo del umbral y no hace nada.

**Qué aprende.** Efecto de arrastre; no juzgar por el primer mes. También que el arrastre prometido a veces es una excusa.

### Situación 8. Muchos clientes nuevos, pero que no se quedan

**Qué pasa.** Una promoción de "primer mes casi gratis" capta el triple de clientes. El CAC por cliente nuevo se ve bajísimo. Pero al terminar la promoción, la mayoría no vuelve a comprar.

**Variables que mueve.**
- `clientes_nuevos`: +100% a +200% el mes de la promoción [Estimación].
- `ret`: baja de, por ejemplo, 70% a 30%-40% mensual para esa cohorte [Estimación].
- LTV de la cohorte: cae (fórmula de [Fuente 8]: el LTV depende de forma muy fuerte de la retención r).
- `margen`: negativo en el primer mes.

**Decisiones.**
1. *Repetir la promoción cada mes.* Ventaja: mantiene la cifra de clientes nuevos y la caja entra. Costo: entrenas al cliente a esperar el descuento; LTV bajo; margen destruido.
2. *Cambiar a una oferta más chica pero ligada a compras repetidas (programa de puntos).* Ventaja: atrae clientes con mejor retención. Costo: capta menos clientes y menos rápido.
3. *Invertir en retener a la cohorte (seguimiento por WhatsApp, segunda compra con beneficio).* Ventaja: sube `ret` y el LTV. Costo: horas de atención y descuentos adicionales.
4. *Abandonar la promoción y volver al precio normal.* Ventaja: recuperas el margen. Costo: baja de volumen y de clientes visibles.

**Qué aprende.** CAC bajo no es buen negocio si el LTV es más bajo; hay que mirar LTV/CAC. Cómo la retención domina el LTV.

### Situación 9. El experimento de control que cuesta ventas

**Qué pasa.** Tu asesor propone dejar una ciudad sin campaña por 4 semanas para medir cuánto aporta de verdad. Es el método estándar (grupo de control geográfico; Google lo describe como asignar regiones al azar a tratamiento y control [Fuente 7, solo resumen]). Pero en esa ciudad vas a perder ventas visibles, y con pocos datos la prueba puede salir inconcluyente [Fuente 2].

**Variables que mueve.**
- `gasto`: baja 100% en la zona de control.
- Venta en la zona de control: posible caída (si la campaña aportaba) o ninguna (si no).
- `cal_med` (calidad de decisión futura): sube si la prueba es válida.
- Incertidumbre: la prueba chica puede dejar un intervalo muy amplio [Fuente 2: intervalos de más de 100 puntos de ROI incluso con experimentos grandes].

**Decisiones.**
1. *Hacer la prueba una ciudad por 4 semanas.* Ventaja: obtienes un dato propio. Costo: ventas perdidas; resultado quizás no concluyente.
2. *Hacerla más larga y con más ciudades.* Ventaja: más potencia. Costo: más ventas en riesgo y complejidad.
3. *No hacer prueba y decidir por "olfato".* Ventaja: no pierdes ventas. Costo: decisiones con sesgo.
4. *Comparar antes y después de cambios de gasto (sin grupo de control).* Ventaja: barato. Costo: mezcla estacionalidad y otros factores; en [Fuente 4] este tipo de métodos falló seguido.

**Qué aprende.** Que medir causalidad tiene costo y límites; que la prueba perfecta no existe en una pyme y hay que decidir con incertidumbre.

### Situación 10. Un contenido se viraliza

**Qué pasa.** Un video tuyo en TikTok o Facebook se difunde solo (aparecen cientos de miles de vistas). Llegan consultas de todo el país. Es una oportunidad: tráfico gratis y de bajo costo. Pero es alcance de público poco calificado y no sabes si dura.

**Variables que mueve.**
- Consultas/leads: +200% a +1.000% por 1-3 semanas [Estimación].
- `conv`: más baja que el promedio (público disperso), 30%-60% menos [Estimación].
- `rep`: sube si atiendes bien, baja si no.
- `cap_op`: se estresa; riesgo de no dar abasto.

**Decisiones.**
1. *Poner presupuesto pagado para amplificar mientras dura.* Ventaja: capitalizas el momento. Costo: gasto sobre un público de baja calidad; no se sabe cuánto es incremental.
2. *Atender lo que llegue sin gastar.* Ventaja: caja intacta. Costo: puede desbordar la atención y dañar la reputación.
3. *Convertirlo en captura de contactos (WhatsApp, lista) para trabajar después.* Ventaja: aprovecha el efecto más allá de la semana. Costo: requiere tiempo y herramientas.
4. *Apostar a más contenido del mismo estilo.* Ventaja: puede dar crecimiento orgánico. Costo: tiempo de producción; el éxito puede no repetirse.

**Qué aprende.** Que una oportunidad es un costo de capacidad; que alcance no es venta.

### Situación 11. La campaña funciona y el negocio no da abasto

**Qué pasa.** La campaña trae más pedidos de los que puedes atender. Se acaba el stock, la entrega se retrasa, hay quejas en reseñas. El gasto en publicidad siguió corriendo mientras la venta se perdía.

**Variables que mueve.**
- Ventas atendidas: tope por `cap_op`; la demanda adicional se pierde.
- `rep`: baja (−5 a −15 puntos en una escala de 100) [Estimación].
- `ret`: baja por mala experiencia.
- Costo variable: sube si se compra urgente o se contrata temporal.

**Decisiones.**
1. *Pausar la campaña hasta tener capacidad.* Ventaja: no inflas expectativas. Costo: pierdes arrastre y posición.
2. *Seguir y ampliar la capacidad con un costo temporal (horas extra, proveedor).* Ventaja: no pierdes la demanda. Costo: margen menor; mala calidad si es apurado.
3. *Seguir con la campaña y comunicar plazos largos.* Ventaja: filtras la demanda. Costo: se pierden compradores impacientes; imagen.
4. *Cambiar el mensaje a una oferta de reserva o lista de espera.* Ventaja: convierte el exceso en demanda futura. Costo: hay abandono y requiere gestión.

**Qué aprende.** Que el flujo incremental incluye los costos operativos de vender más, no solo el costo de la campaña (sección 3).

### Situación 12. Sube el costo de los medios o cambia el algoritmo

**Qué pasa.** La plataforma cambia su algoritmo de entrega, o más anunciantes entran a la misma subasta, y tu costo por clic sube. Tu cuenta incluso puede ser restringida un tiempo por una política de anuncios.

**Variables que mueve.**
- `cpc_f`: +20% a +60% sostenido [Estimación].
- Alcance por boliviano: baja.
- CAC: sube en proporción, a menos que la conversión mejore.
- Si se restringe la cuenta: `gasto_efectivo` = 0 por 1-3 semanas [Estimación].

**Decisiones.**
1. *Aguantar el costo más alto con el mismo presupuesto.* Ventaja: no cambias nada. Costo: llegas a menos gente; el CAC sube.
2. *Subir el presupuesto para mantener el volumen.* Ventaja: mantienes ventas. Costo: el CAC más alto puede pasar el LTV; margen aplastado.
3. *Diversificar canales (alianzas, referidos, WhatsApp, medios locales).* Ventaja: menos dependencia. Costo: tiempo de aprendizaje; resultados peores al inicio.
4. *Mejorar la conversión (página, oferta, atención) para compensar.* Ventaja: reduce CAC sin gastar más en medios. Costo: inversión en tiempo y mejoras con resultado incierto.

**Qué aprende.** Que el costo de captación no está bajo tu control; que depender de un solo canal es un riesgo.

### Situación 13. Un incidente de reputación

**Qué pasa.** Un cliente publica una queja viral, o un influencer que contrataste dice algo polémico. Tu anuncio sigue pasando mientras la imagen se daña.

**Variables que mueve.**
- `rep`: baja 10 a 30 puntos [Estimación].
- `conv`: baja 15% a 40% mientras dura [Estimación].
- `ret` y recomendaciones: bajan.
- Los anuncios pagados rinden menos (el público desconfía).

**Decisiones.**
1. *Pausar anuncios y responder públicamente con disculpa y solución.* Ventaja: contiene el daño. Costo: pierdes semanas de campaña y dinero ya pagado.
2. *Seguir con la campaña como si nada.* Ventaja: no pierdes ritmo. Costo: pagas por mostrar tu marca a gente que ahora desconfía.
3. *Cambiar el mensaje a transparencia/garantía.* Ventaja: puede reforzar confianza. Costo: gasto en nueva creatividad; puede amplificar el tema.
4. *Compensar a los afectados con descuentos o devoluciones.* Ventaja: reduce el enojo. Costo: dinero directo; puede incentivar nuevas quejas.

**Qué aprende.** Que la marca es un activo que se erosiona, y que la campaña puede amplificar un problema.

### Situación 14. La agencia reporta resultados que no te cuadran

**Qué pasa.** La agencia presenta un informe con ROAS 5 y pide renovar con más presupuesto. La caja del negocio no mejora al ritmo que el informe sugiere. La agencia cobra un porcentaje del gasto, así que gana más cuanto más gastas.

**Variables que mueve.**
- ROAS reportado: alto. iROAS real: bajo (brecha por sobreatribución, [Fuente 1, 4]).
- `gasto`: sube si renuevas con más presupuesto.
- Honorarios: fijos o porcentaje del gasto (el incentivo del porcentaje es [Interpretación]).

**Decisiones.**
1. *Renovar con más presupuesto.* Ventaja: confías en el experto, menos fricción. Costo: si el ROAS está inflado, pierdes más.
2. *Renovar con el mismo presupuesto y pedir reporte de ventas reales (facturas, cupones) en vez del panel.* Ventaja: forzar medición con datos propios. Costo: fricción, la agencia puede irse.
3. *Cambiar el pago a variable por resultado (comisión por clientes nuevos verificados).* Ventaja: alinea incentivos. Costo: la agencia puede rechazarlo o cuidar solo lo medible.
4. *Internalizar parte del trabajo (contratar a una persona).* Ventaja: control y aprendizaje. Costo: salario fijo y curva de aprendizaje.

**Qué aprende.** Que los incentivos de quien mide importan; que debe cruzarse el reporte con la caja real. Es el mismo problema de [Fuente 5]: definir qué se mide y cómo.

---

## 6. Variables propias que debería manejar el motor

Los nombres son sugerencias mías. El motor actual maneja caja, ingresos, costos y reputación; estas son adicionales o reinterpretan las anteriores.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| `base` | Ventas mensuales que ocurrirían igual, sin campaña (incluye estacionalidad) | `base_t = base_0 × estacionalidad_t × (1 + tendencia) × efecto_competencia_t`. Cambia por eventos (situaciones 3, 5) |
| `gasto` | Gasto de campaña del mes, por canal | Lo decide el alumno. Puede ser cero por bloqueo de pago (situación 4) |
| `adstock` | Efecto acumulado de la publicidad con arrastre | `adstock_t = gasto_t + λ × adstock_(t−1)` (forma geométrica, [Fuente 6]). λ típica del canal: estimación; valores de ejemplo 0,3 para digital de respuesta y 0,6 para marca [Estimación] |
| `sat` | Saturación: qué parte del efecto máximo se alcanza con el adstock | `sat_t = 1 / (1 + (adstock_t / K)^(−S))` (Hill, [Fuente 6]). K sube un poco si se amplía el público (situación 2) |
| `lift_t` | Ventas incrementales del mes | `incremental_t = β × sat_t × base_t × factor_canal`, con β calibrada para que el elasticidad promedio sea cercana a 0,1 (referencia: 0,12 corto plazo, [Fuente 3]) |
| `capt` | Parte de lo que el panel atribuye que en realidad ya iba a comprar | Parámetro del canal: alto en remarketing y marca, bajo en prospección. Se aplica al ROAS reportado, no a las ventas reales |
| `cpc_f` | Factor del costo de los medios respecto del costo base | Cambia con estacionalidad (situación 3), competencia (5) y algoritmo/pagos (4, 12) |
| `conv` | Conversión de la audiencia alcanzada a cliente | Baja con saturación, con crisis de reputación, y con público poco calificado (10) |
| `clientes_nuevos_t` | Clientes captados por la campaña | `incremental_t / ticket_medio_mensual`; es el denominador del CAC |
| `CAC_t` | Costo por cliente realmente captado | `gasto_t / clientes_nuevos_t`. Mostrar también el "CAC aparente" con la atribución del panel, para enseñar la brecha |
| `ret` (retención de cohorte) | Parte de cada cohorte que sigue comprando el mes siguiente | Cada cohorte tiene su propia `ret`. Baja si la captación fue por descuento (situación 8) o si hubo mala atención (11) |
| `LTV_cohorte` | Valor presente del margen futuro de la cohorte | Fórmula de la sección 2 con la `ret` observada [Fuente 8] |
| `rep` | Reputación (ya existe) | Afecta `conv` y `ret`. Sube con buena atención, baja con incumplimientos, crisis y reseñas |
| `cap_op` | Capacidad operativa: pedidos que puede atender | Tope duro de ventas atendidas (situación 11). Se puede ampliar con costo |
| `cal_med` | Calidad de la medición (0 a 1) | Baja con fallas (6). Afecta qué ve el alumno, no la realidad: el panel muestra números ruidosos cuando es baja |
| `iROAS_real` y `ROAS_panel` | Retorno incremental verdadero y retorno reportado | El motor conoce el real; la interfaz muestra el panel con la brecha por `capt` y ruido por `cal_med`. El alumno puede comprar un test para ver el real (con ruido, [Fuente 2]) |
| `contrato_agencia` | Tipo de pago de la agencia (fijo, % del gasto, por resultado) | Decisión del alumno; afecta el costo y la honestidad del reporte (situación 14) |

Resultado del mes: `flujo_t = incremental_t × margen_contribución − gasto_t − honorarios_t − costo_operativo_extra_t`. Es el flujo que alimenta VAN y TIR.

Nota de diseño [Interpretación]: la regla pedagógica más importante es **separar la realidad del panel**. El alumno debe ver el ROAS que le reporta una plataforma o una agencia y descubrir, con pruebas costosas o con la caja, que el retorno real es menor. Eso es lo que muestran [Fuente 1, 2, 4].

---

## 7. Ejemplos reales de Bolivia y Latinoamérica

No encontré en Bolivia un caso publicado de campaña con medición incremental (control, ROI real). Lo que sí encontré son notas de prensa e informes con datos de contexto. Los uso como ilustración de los fenómenos, no como evidencia de eficacia.

1. **Alicorp (marca Gordito) y los maestros salteñeros, Bolivia, marzo de 2025.** Alicorp entregó a los salteñeros embalajes con dedicatorias para el Día del Padre, la fecha de mayor venta del año; un maestro vende normalmente 700-800 salteñas por día y ese día 3.000-4.000; la marca lo hizo para fidelizar clientes. Ilustra la base estacional enorme y una acción de fidelización. Fuente: [Fuente 14] https://eju.tv/?p=4564276 (abierta). No reporta el retorno de la acción.
2. **Sure y el Mundial 2018, Bolivia, 30 de mayo de 2018.** La cadena de electrodomésticos Sure reportó +30% de ventas frente al año anterior y televisores con ventas triplicadas en la temporada previa al Mundial; otras marcas (Samsung, Hisense) y Multicenter (campaña "Pasión de Multitudes") hicieron promociones. Ilustra el efecto de un evento externo mezclado con promociones: no se puede saber qué parte es campaña y qué parte es Mundial. Fuente: [Fuente 13] https://www.peru-retail.com/bolivia-retailers-se-preparan-para-incrementar-ventas-a-dias-del-mundial-rusia-2018/ (abierta, cita a El Deber).
3. **Restricciones de pago online en Bolivia, agosto de 2024.** Conversatorio "Retos de la economía digital ante la escasez de divisas" (FES e Internet Bolivia, La Paz, 27 de agosto de 2024): se dijo que los bancos están restringiendo las compras en internet, lo que limita las transacciones y perjudica la economía digital. Es el contexto de la situación 4. Fuente: [Fuente 12] https://bolivia.fes.de/actividades/default-7e81cdc74d03b85e89f4d83f405659cb.html (abierta). No habla de publicidad específicamente; esa conexión es mía.
4. **Uso de redes en Bolivia, encuesta AGETIC 2016.** 5.536 internautas mayores de 14 años, del 3 al 18 de diciembre de 2016: 9 de cada 10 usan Facebook y WhatsApp, 4 de cada 10 YouTube, 2 de cada 10 Twitter e Instagram. Contexto para la dependencia de un canal (situación 12). Dato antiguo. Fuente: [Fuente 15] https://correodelsur.com/sociedad/20170517/internet-los-bolivianos-usan-mas-el-facebook-y-whatsapp-en-redes-sociales.html (abierta).
5. **Argentina: pausas de campañas de Meta por límite de tarjeta, octubre de 2025.** Nota patrocinada por un proveedor de crédito: al alcanzar el límite de la tarjeta las campañas se detienen y se reinicia la optimización, con CPM y CPC más altos; impuestos a pagos internacionales encarecen hasta 50%. Análogo regional de la situación 4, con la advertencia de que es publicidad pagada. Fuente: [Fuente 16] https://noticias.perfil.com/noticias/espacio-no-editorial/meta-en-argentina-como-sostener-la-inversion-publicitaria-en-un-escenario-desafiante.phtml (abierta).
6. **Casos de estudio de otros países, usados como evidencia de método:** eBay [Fuente 1], minoristas y corredoras de EE.UU. [Fuente 2], Facebook [Fuente 4]. No son de Latinoamérica.

---

## 8. Fuentes

Nivel A: libro, paper, organismo, manual universitario. B: consultora, reporte sectorial, prensa. C: blog, práctica.

**Nivel A, abiertas y leídas (texto extraído y revisado en las partes que cito):**

1. **A.** Blake, T., Nosko, C. y Tadelis, S. "Consumer Heterogeneity and Paid Search Effectiveness: A Large Scale Field Experiment". NBER Working Paper 20171, mayo de 2014 (publicado después en Econometrica 83, 2015, según el listado de IDEAS que vi en un buscador). https://www.nber.org/papers/w20171.pdf. Leí el resumen, la introducción y las secciones de ROI, sustitución y heterogeneidad.
2. **A.** Lewis, R. A. y Rao, J. M. "The Unfavorable Economics of Measuring the Returns to Advertising". Quarterly Journal of Economics 130(4), 2015, pp. 1941-1973. DOI 10.1093/qje/qjv023. Copia leída: https://www.Gwern.net/doc/economics/advertising/2015-lewis.pdf. Leí el resumen y la introducción.
3. **A.** Sethuraman, R., Tellis, G. J. y Briesch, R. A. "How Well Does Advertising Work? Generalizations from Meta-Analysis of Brand Advertising Elasticities". Journal of Marketing Research, 2011. Copia leída: https://www.Gwern.net/doc/economics/advertising/2011-sethuraman.pdf. Leí resumen, definición de elasticidad de largo plazo e implicancias. No verifiqué el volumen y número de la revista en esa copia.
4. **A.** Gordon, B. R., Zettelmeyer, F., Bhargava, N. y Chapsky, D. "A Comparison of Approaches to Advertising Measurement: Evidence from Big Field Experiments at Facebook". Versión de trabajo de abril de 2018 (publicada en Marketing Science 38(2), 2019, pp. 193-225, según IDEAS, que no abrí). https://www.kellogg.northwestern.edu/faculty/gordon_b/files/fb_comparison.pdf. Leí resumen, introducción y la sección de lift. Las cifras que cito son de la versión 2018; la publicada puede diferir.
5. **A.** Farris, P. W., Hanssens, D. M., Lenskold, J. D. y Reibstein, D. J. "Marketing Return on Investment: Seeking Clarity for Concept and Measurement". Marketing Science Institute Working Paper Report 14-108, 2014. https://themasb.org/wp-content/uploads/2019/03/MSI_Report_14-1081.pdf. Leí el resumen y las secciones de definición, variaciones, pruebas A/B, Dorfman-Steiner y tasa de corte. La versión publicada (Applied Marketing Analytics, 2015) la vi solo citada en un catálogo.
6. **A.** Jin, Y., Wang, Y., Sun, Y., Chan, D. y Koehler, J. "Bayesian Methods for Media Mix Modeling with Carryover and Shape Effects". Google Inc., 2017. Página: https://research.google/pubs/bayesian-methods-for-media-mix-modeling-with-carryover-and-shape-effects/. Texto leído desde https://storage.googleapis.com/gweb-research2023-media/pubtools/3806.pdf (secciones de adstock, función Hill, ROAS/mROAS). Es un documento de empresa que funciona como paper.
7. **A, solo resumen.** Vaver, J. y Koehler, J. "Measuring Ad Effectiveness Using Geo Experiments". Google Inc., 2011. Solo leí la página de resumen: https://research.google/pubs/measuring-ad-effectiveness-using-geo-experiments/. No pude abrir el PDF. No cuenta entre las "leídas".
8. **A, secundaria.** Burelli, P. "Predicting Customer Lifetime Value in Free-to-Play Games". arXiv 2209.12619, septiembre de 2022. https://arxiv.org/pdf/2209.12619. Leí la sección que reproduce el modelo básico de Berger y Nasr (1998). Es un paper de otro tema; lo uso solo como fuente de la fórmula. El artículo original de Berger y Nasr no lo abrí.
9. **A, solo catálogo.** Bendle, N. T., Farris, P. W., Pfeifer, P. E. y Reibstein, D. J. *Marketing Metrics: The Manager's Guide to Measuring Marketing Performance*, 4.ª edición, Pearson FT Press, 2020 (© 2021). Confirmé autores, editorial, edición y tabla de contenidos (cap. 5.3 Customer Lifetime Value, 9.1 Baseline Sales/Incremental Sales/Promotional Lift, 12 Marketing and Finance, 12.5 Marketing Return on Investment, 14.3 Marketing Mix Models) en la ficha de Pearson https://www.pearson.com/en-gb/subject-catalog/p/marketing-metrics/P200000000122/9780136755319 y en el PDF de muestra de la editorial (solo índices). No leí el contenido de los capítulos.

**Nivel B, prensa e informes:**

12. **B.** Friedrich-Ebert-Stiftung Bolivia e Internet Bolivia, conversatorio "Retos de la economía digital ante la escasez de divisas", La Paz, 27 de agosto de 2024. https://bolivia.fes.de/actividades/default-7e81cdc74d03b85e89f4d83f405659cb.html. Página de actividad (no es un estudio).
13. **B.** Peru Retail, "Bolivia: retailers se preparan para incrementar ventas a días del Mundial Rusia 2018", 30 de mayo de 2018, que cita a El Deber. https://www.peru-retail.com/bolivia-retailers-se-preparan-para-incrementar-ventas-a-dias-del-mundial-rusia-2018/
14. **B.** eju.tv, nota sobre Alicorp y los maestros salteñeros, 28 de marzo de 2025. https://eju.tv/?p=4564276
15. **B.** Correo del Sur, sobre la encuesta AGETIC, 17 de mayo de 2017. https://correodelsur.com/sociedad/20170517/internet-los-bolivianos-usan-mas-el-facebook-y-whatsapp-en-redes-sociales.html

**Nivel C:**

10. **C.** Sellforte, "What is incrementality testing? A practical guide" (blog de una consultora de medición). https://sellforte.com/blog/what-is-incrementality-testing. Usada para definición de iROAS y de tipos de prueba; el ejemplo numérico es ilustrativo de la propia fuente.
16. **C.** Revista Noticias (Perfil), "Meta en Argentina: cómo sostener la inversión publicitaria en un escenario desafiante", 15 de octubre de 2025, sección "Espacio no editorial" (contenido patrocinado por un proveedor de crédito). https://noticias.perfil.com/noticias/espacio-no-editorial/meta-en-argentina-como-sostener-la-inversion-publicitaria-en-un-escenario-desafiante.phtml

(La numeración salta del 10 al 12 al 16 porque las fuentes B y C se numeraron por orden de uso; no falta ninguna.)

**Cuenta:** 16 fuentes distintas listadas. Nivel A abiertas y leídas con contenido: 7 (las fuentes 1 a 6 y la 8, esta última solo para una fórmula). Más 2 de nivel A de las que solo confirmé la ficha o el resumen (7 y 9). Cumple el mínimo de 4 fuentes A leídas.

---

## 9. No confirmado

1. **Fórmulas de ROAS, CAC, payback, tasa de conversión, LTV/CAC y LTV simplificado (perpetuidad).** Son definiciones estándar, pero no las verifiqué en una fuente A abierta. El LTV de perpetuidad "margen × r/(1+d−r)" lo vi en un resultado de buscador que citaba un diccionario de marketing; no lo abrí.
2. **Artículos originales sobre CLV.** Gupta y Lehmann (2003, "Customers as Assets", Journal of Interactive Marketing 17(1)); Gupta et al. (2006, "Modeling Customer Lifetime Value", Journal of Service Research 9(2)); Berger y Nasr (1998). Solo vi sus citas bibliográficas en resultados de buscador; no los abrí. Los datos de revista, volumen y páginas vienen de esos resultados y no están verificados.
3. **Libro Hanssens, Parsons y Schultz, *Market Response Models* (2001).** No abrí ningún catálogo. Lo cito solo a través de [Fuente 5] (Dorfman-Steiner) y [Fuente 6] (decaimiento geométrico). No confirmo edición ni editorial.
4. **Valores típicos de λ (decaimiento) por canal y la afirmación de que la TV decae más lento que la búsqueda pagada.** Los vi en un resultado de buscador y en glosarios de empresas, no en una fuente abierta. Los valores 0,3 y 0,6 de la sección 6 son estimación mía.
5. **Origen del adstock (Broadbent, 1979 o años 70).** Las fuentes del buscador no coinciden; no lo uso.
6. **Cifras de incrementalidad de la industria.** La brecha "ROAS de 4 reportado contra 1,6 u 1,8 real" y "10x contra 3x" que aparecen en glosarios y blogs de proveedores no las verifiqué en fuente abierta (solo el ejemplo ilustrativo de [Fuente 10]). La evidencia dura que sí abrí son [Fuente 1, 2, 4].
7. **Resultado del PDF publicado de Gordon et al. (Marketing Science 2019)** y de Blake et al. (Econometrica 2015): leí las versiones de trabajo. Las cifras pueden diferir en la versión publicada.
8. **Aplicabilidad a pymes bolivianas.** Todos los experimentos abiertos son de empresas grandes de EE.UU. (eBay, minoristas, Facebook). [Fuente 2] advierte que su hallazgo de ventas muy volátiles puede no valer para empresas chicas o productos nuevos, y [Fuente 1] limita su conclusión a una empresa muy conocida como eBay. No encontré datos de incrementalidad de pymes bolivianas.
9. **Datos de Bolivia sobre costo de publicidad digital (CPM, CPC), tasa de conversión, CAC típico o porcentaje de rechazos de tarjetas al pagar publicidad.** No encontré fuentes confiables. La conexión entre las restricciones de compras por internet [Fuente 12] y el pago de publicidad es mi inferencia.
10. **Casos bolivianos con medición incremental.** No encontré. Los casos de la sección 7 son de prensa y no reportan retorno.
11. **Uso actual de redes en Bolivia (TikTok, Instagram).** El dato más sólido que abrí es de 2016 (AGETIC) y está desactualizado. Un estudio de 2020 (Ariadna: 21% llegó a un producto por un anuncio en redes; WhatsApp 17% como canal de cierre) lo vi solo resumido en un buscador, no abrí la fuente. El documento LACCEI sobre comercio por Facebook y WhatsApp en Bolivia lo intenté abrir y no se pudo leer; no lo uso.
12. **Fichas S11 y S15 de la taxonomía (Orb sobre CAC y LTV; FirstPier sobre incrementalidad).** Fueron mencionadas en el documento 00-taxonomia-tipos.md; no las abrí. En su lugar usé [Fuente 10].
13. **Todas las magnitudes marcadas [Estimación]** en las situaciones y en la sección 6 (porcentajes de cambio de costo, conversión, retención, reputación, capacidad, duraciones). Son valores para jugar y requieren calibración antes de ir al motor. Las que sí tienen fuente: elasticidades 0,12 y 0,24 [Fuente 3]; 99,5% de recuperación gratuita y ROI −63% [Fuente 1]; intervalos de ROI de más de 100 puntos y múltiplos de 9 y 62 [Fuente 2]; error de factor tres en la mitad de los estudios [Fuente 4]; ventas de 700-800 contra 3.000-4.000 salteñas [Fuente 14].
14. **Mejoras al "efecto de las reseñas", "influencers" y "viralidad".** Las situaciones 10, 13 y 14 se apoyan en razonamiento mío y en el contexto, no en una fuente específica que haya abierto sobre esos fenómenos.
