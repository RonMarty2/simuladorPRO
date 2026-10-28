# Mapa de tipos de proyecto para SIMPRO (fase 0)

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación, no modifica el producto.

## Cómo leer este documento

- **[Fuente Sn]** significa que lo dice la fuente número n de la sección 7, y que abrí esa fuente (o su texto extraído) y lo leí.
- **[Interpretación]** o texto sin marca es razonamiento mío sobre cómo traducirlo a un simulador. No es una cita.
- Los niveles de fuente son: **A** (libro, paper, organismo multilateral, manual universitario o de gobierno), **B** (consultora, reporte sectorial, prensa económica, gremio) y **C** (blog, glosario de industria, enciclopedia abierta).
- Todo lo que no pude abrir o confirmar está en la sección 8 ("No confirmado"). No lo uses como dato.
- Los números de dinero que aparecen son los que dice cada fuente en su fecha. Ninguno es un parámetro listo para el simulador.

---

## 1. Resumen

1. Los proyectos se pueden clasificar por **cómo generan beneficio**. Esa es la pregunta útil para un simulador, porque cada mecanismo tiene variables mensuales distintas (por ejemplo, una fiesta depende de fechas reservadas, un hotel de ocupación y tarifa, una campaña de cuántos clientes nuevos trae de verdad).
2. Propongo **24 tipos**: **14 con ingreso** (grupo A) y **10 sin ingreso directo** (grupo B: marketing, comunicación, sociales, educativos, salud, cultura, TI interna, infraestructura pública, cumplimiento y ahorro).
3. La literatura de modelos de negocio da una base para el grupo A. Osterwalder y Pigneur listan siete formas de cobrar (venta de activo, cuota por uso, suscripción, alquiler, licencia, corretaje, publicidad) [S9, S10]. Malone, Weill y otros (MIT, 2006) clasifican por qué derecho sobre un activo se vende: Creador, Distribuidor, Arrendador (Landlord) y Corredor (Broker) [S5].
4. Para el grupo B, la literatura de organismos (CEPAL, Banco Mundial) dice algo clave: cuando el beneficio no se puede poner en plata, **no se usa VAN/TIR**. Se usa el costo por unidad de impacto (costo-efectividad) [S1, S2]. El manual de CEPAL distingue tres métodos: costo-beneficio (ACB), costo mínimo (ACM) y costo-impacto (ACI) [S1]. Para valor social con ratio parecido al VAN existe el SROI [S6].
5. En marketing el problema central es **separar lo que habría pasado igual de lo que causó la campaña** (incremental contra base). La práctica de industria lo llama incrementalidad y mide un ROAS incremental, que suele ser menor que el ROAS reportado por la plataforma [S15].
6. **El Patrón**: el owner aclaró (2026-10-22) que no es un servicio de fiestas: es el nombre popular del servicio de enviar flores a alguien con una persona vestida de charro ("el patrón te mandó"). Es un servicio de sorpresa con fechas pico (San Valentín, Día de la Madre). Lo cubre la ficha `tipos/eventos-servicios-sorpresa.md`. Mi búsqueda anterior lo buscaba como salón de fiestas, por eso no lo encontré. Detalle en la sección 8.1.
7. Listé **25 fuentes** abiertas y numeradas (más los enlaces de ejemplos de la sección 6), de las cuales **10 son nivel A** (8 con contenido leído, 2 libros confirmados solo en ficha de catálogo).

---

## 2. Tabla de tipos

Grupo A: el beneficio es un ingreso (se puede usar VAN/TIR con ajustes).

| # | Tipo | Mecanismo de beneficio (una frase) | Variable mensual principal |
|---|------|------------------------------------|----------------------------|
| A1 | Producto por unidades | Vende unidades de un bien a un precio | Unidades vendidas, precio, costo unitario |
| A2 | Suscripción / membresía | Cobra una cuota recurrente por acceso continuo | Suscriptores activos, altas, bajas (churn) |
| A3 | Publicidad / medios | Junta audiencia y cobra a anunciantes por exponerla | Audiencia, ocupación de espacios, tarifa |
| A4 | Servicios profesionales y software a medida | Vende horas o proyectos de gente especializada | Horas facturables, utilización, tarifa |
| A5 | Eventos y fiestas | Cobra por una fecha reservada y un paquete de servicios | Fechas reservadas, invitados, estacionalidad |
| A6 | Alquiler de activos | Cede el uso de un activo por un período a cambio de renta | Ocupación, renta, vacancia |
| A7 | Hotelería y turismo | Vende noches y servicios sobre una capacidad fija | Ocupación, tarifa diaria promedio, estacionalidad |
| A8 | Plataforma / marketplace | Intermedia entre dos lados y cobra comisión sobre lo transado | Valor transado, tasa de comisión, liquidez |
| A9 | Franquicia / licencia | Cobra derecho de entrada y regalías a terceros por usar su marca y sistema | Unidades abiertas, ventas por unidad, regalía |
| A10 | Concesión / tarifa por uso de infraestructura | Cobra por cada uso de una obra o servicio con capacidad fija | Pasajeros o tráfico, tarifa, disponibilidad |
| A11 | Educación y formación con cobro | Cobra matrícula o pensión por cohorte de alumnos | Matriculados, deserción, ocupación de aulas |
| A12 | Salud privada | Cobra por atenciones sobre camas y consultorios | Atenciones, ocupación de camas, tarifa promedio |
| A13 | Producción agropecuaria por campaña | Produce una cosecha por ciclo y la vende | Superficie, rendimiento, precio, clima |
| A14 | Servicios financieros / microcrédito | Presta dinero y cobra más de lo que paga por fondearse | Cartera, tasa, mora, costo de fondeo |

Grupo B: el beneficio no es (principalmente) un ingreso. Se mide un resultado y se lo compara con el costo.

| # | Tipo | Qué se mide en lugar del ingreso | Indicador que reemplaza o complementa al VAN/TIR |
|---|------|----------------------------------|--------------------------------------------------|
| B1 | Campaña de marketing | Ventas o clientes **incrementales** causados por la campaña | ROAS incremental, costo por cliente adquirido, ROI de marketing |
| B2 | Comunicación institucional / branding | Alcance, frecuencia, recordación, cambio de actitud | Costo por persona alcanzada, costo por punto de recordación |
| B3 | Proyecto social / ONG | Cambio logrado en la población objetivo | Costo por unidad de impacto, costo por beneficiario, SROI |
| B4 | Educativo público | Matrícula, permanencia, promoción, aprendizaje | Costo por punto de permanencia o promoción |
| B5 | Salud pública | Casos evitados, vidas o años de vida ganados | Costo por caso evitado, costo por AVAD o AVAC |
| B6 | Cultural / patrimonial | Visitantes, gasto inducido, valor de existencia | Costo-beneficio con valoración no de mercado |
| B7 | TI interna / transformación digital | Tiempo y errores evitados, trámites resueltos | Ahorro neto, costo por trámite, retorno por ahorro |
| B8 | Infraestructura pública | Beneficios económicos para la sociedad, no para el operador | Costo-beneficio con precios sociales (VAN social) |
| B9 | Cumplimiento normativo | Multas, sanciones y pérdidas evitadas | Pérdida esperada evitada contra costo del control |
| B10 | Eficiencia / ahorro | Costo evitado (energía, horas, insumos) | Ahorro anual, período de recuperación, VAN del ahorro |

---

## 3. Qué dice la literatura sobre cada familia de métodos

### 3.1 Cuando el beneficio es plata: VAN/TIR clásico y sus límites

- Los manuales clásicos en español de preparación de proyectos son el de Baca Urbina (confirmé en el catálogo de una biblioteca universitaria la 5.ª edición, McGraw-Hill, México, 2006, ISBN 9789701056875 [S3]) y el de Sapag Chain (ver "recomendado, no verificado" en sección 8). No pude leer su contenido, así que no les atribuyo nada más que la existencia de la edición.
- El manual del Banco Mundial (Belli y otros) trabaja el análisis económico de inversiones con capítulos sobre flujos de costos y beneficios, precios sociales, riesgo y sensibilidad, y un capítulo propio de costo-efectividad, más capítulos de educación, salud y transporte [S2].
- **[Interpretación]** El VAN con "unidades x precio" funciona bien para A1. Para el resto, el problema no es el VAN, es el **ingreso**: hay que construirlo con otro mecanismo (suscriptores, ocupación, comisión, etc.) y otras fuentes de riesgo.

### 3.2 Taxonomías de modelos de negocio (base del grupo A)

- **Osterwalder y Pigneur**, siete tipos de ingreso: venta de activo, cuota por uso, cuota de suscripción, préstamo/alquiler/leasing, licencias, comisión de corretaje y publicidad. Lo confirmé en dos páginas secundarias que citan el libro [S9, S10]; el libro en sí figura como "recomendado, no verificado".
- **Malone, Weill y otros (MIT Sloan, 2006)**: cuatro modelos básicos según qué derechos sobre un activo se venden (Creadores, Distribuidores, Arrendadores y Corredores) y cuatro variaciones según el tipo de activo (el resumen que leí nombra "financiero" y otras variantes; la lista completa no la confirmé) [S5]. Leí el resumen y la introducción del paper, no el estudio completo.
- **Weill y Woerner (2018)**: libro "What's Your Digital Business Model?", Harvard Business Review Press, 2018, ISBN 9781633692701 (confirmado en ficha de librería) [S4]. No abrí su contenido, así que no cito sus categorías (ver sección 8).
- **Damodaran** (NYU Stern, presentación): propone valorar usuarios y suscriptores de un negocio con primeros principios, y distingue bases de usuarios que crean valor de las que lo destruyen (caso MoviePass como advertencia) [S12]. **[Interpretación]** Respalda tratar suscripción (A2) y plataforma (A8) con variables de usuario y no solo con ingreso agregado.

### 3.3 Cuando el beneficio no es plata: los tres métodos del manual CEPAL

El manual de Cohen y Martínez (CEPAL, División de Desarrollo Social) [S1] distingue tres metodologías que comparan costos con el logro de objetivos. La forma de medir los costos es la misma; lo que cambia es cómo se mide el impacto:

| Método | Qué hace según el manual | Cuándo sirve |
|--------|--------------------------|--------------|
| Costo-beneficio (ACB) | Compara costos con beneficios **en unidades monetarias**; si los beneficios superan los costos, hay una primera indicación de aprobar | Proyectos productivos. En proyectos sociales, dice el manual, los beneficios difícilmente se expresan en moneda y el ACB queda "severamente limitado" |
| Costo mínimo (ACM) | Compara costos con el nivel de producción de bienes y servicios; acepta que los objetivos vienen de una decisión política y busca el menor costo | Cuando el impacto se presume igual entre alternativas. No dice nada sobre el impacto |
| Costo-impacto (ACI) | Compara costos con el logro de objetivos de impacto; se aplica antes y después | Proyectos sociales con objetivos medibles. Criterio: menor relación costo/impacto |

Además, el manual [S1]:

- Define el **costo por unidad de impacto (CUI)** como el costo anual de la alternativa dividido por el impacto medio anual en un objetivo (expresado normalmente en porcentaje). Se arma una matriz costo-impacto por alternativa.
- Propone un **análisis multicriterio**: un índice ponderado de criterios (social, técnico, económico, institucional) para priorizar proyectos pequeños con destinatarios y objetivos distintos.
- Para la evaluación posterior, describe modelos experimental, cuasiexperimental y no experimental para medir impacto real.
- Dice que en proyectos productivos el impacto es su beneficio económico.

Complemento: el documento de Cohen y Franco (ILPES, 1990) sobre costo-efectividad aparece en el repositorio de CEPAL, pero no pude abrirlo (ver sección 8).

### 3.4 Valor social: SROI

La guía del Cabinet Office del Reino Unido (2009) [S6] define el retorno social de la inversión como un marco de seis etapas: alcance y actores, mapa de resultados, evidenciar y valorar resultados, establecer impacto, calcular el SROI, informar. Detalles que leí:

- Convierte resultados en valores monetarios con "proxies financieros" para lo que no tiene precio de mercado, y calcula un ratio de beneficios sobre costos; por ejemplo, un 3:1 significa que cada 1 invertido genera 3 de valor social.
- Para no inflar el resultado, descuenta el **deadweight** (lo que habría pasado igual sin la actividad), el desplazamiento, la atribución a otros actores y la caída del efecto en el tiempo (drop-off). Calcula valor presente neto y hace análisis de sensibilidad.
- Distingue SROI evaluativo (mira resultados ya ocurridos) y de pronóstico (estima valor futuro).
- Advierte que comparar ratios entre organizaciones sin contexto engaña.

**[Interpretación]** El "deadweight" del SROI y el "incremental contra base" del marketing son la misma idea: el beneficio real es lo que pasó **menos** lo que habría pasado igual.

### 3.5 Marketing: ROI, ROAS y causalidad

Según la práctica de industria [S15 y notas vistas en la búsqueda, no todas abiertas]:

- **Atribución** asigna crédito a los puntos de contacto que vio quien compró; **incrementalidad** mide qué no habría ocurrido sin el anuncio, usando un grupo de control (holdout) al que no se muestra la campaña.
- **Lift** es la diferencia de conversión entre expuestos y control, ajustada por la base. El **iROAS** (ROAS incremental) usa solo el ingreso causado. El ejemplo del glosario: un ROAS reportado de 4x puede ser cerca de 1,8x incremental [S15]. Es un ejemplo ilustrativo de un glosario comercial, no un benchmark.
- Métricas de pago de publicidad digital (CPM, CPC, CTR) están definidas en glosarios de terceros que vi en la búsqueda, pero no abrí una fuente ni del IAB ni de una plataforma; se listan como no confirmadas.

### 3.6 Salud: costo por AVAD o AVAC

El Banco Mundial dedica un capítulo a la evaluación económica de proyectos de salud y otro a costo-efectividad [S2]. Sobre la práctica de AVAD (DALY) y los umbrales de la OMS (tres veces el PIB per cápita), solo tengo resúmenes de búsqueda de artículos que no abrí; van en sección 8.

---

## 4. Fichas del grupo A (proyectos con ingreso)

Para cada ficha: **indicadores** (propios de la práctica), **cómo lo representa el flujo clásico** y **variables que cambian mes a mes**. Los ejemplos reales de todos los tipos están en la sección 6.

### A1. Producto por unidades (ya soportado)
- **Mecanismo**: vende unidades de un producto; ingreso = cantidad x precio.
- **Indicadores**: ventas unitarias, margen de contribución, punto de equilibrio, rotación de inventario, ticket promedio. **[Interpretación]**, indicadores estándar de costos; no los respaldo con una fuente específica abierta.
- **Flujo clásico**: lo representa **bien**. Es el caso para el que fue pensado.
- **Variables mensuales**: demanda, precio, costo de insumos, inventario, estacionalidad.

### A2. Suscripción / membresía (ya soportado)
- **Mecanismo**: el cliente paga una cuota recurrente por acceso continuo [S9, S10].
- **Indicadores** [S11, glosario C]: MRR (ingreso recurrente mensual = suscriptores x ARPU), ARR (MRR x 12), churn (clientes perdidos / clientes al inicio), NRR (retención neta de ingreso), CAC (gasto de ventas y marketing / clientes nuevos), LTV (aproximado: ARPU / churn), ARPU (ingreso total / usuarios).
- **Flujo clásico**: lo representa **mal si se usa un ingreso plano**. El valor está en la retención: un punto de churn cambia el valor de toda la base futura. Damodaran sostiene que conviene valorar al usuario con sus propios flujos [S12].
- **Variables mensuales**: altas, bajas (churn), upgrades/downgrades, costo de adquisición, precio.

### A3. Publicidad / medios (ya soportado)
- **Mecanismo**: se junta una audiencia y se cobra a terceros por exponerla [S9, S10].
- **Indicadores**: audiencia (impresiones, alcance), CPM (costo por mil impresiones), tasa de ocupación del inventario publicitario, ingreso por usuario, costo de producir contenido. CPM y CTR están definidos solo en glosarios de terceros (sección 8).
- **Flujo clásico**: lo representa **mal si se supone audiencia fija**. La audiencia es el activo y se gana o se pierde.
- **Variables mensuales**: audiencia, ocupación, tarifa, estacionalidad publicitaria (hay meses de más pauta), costo del contenido.

### A4. Servicios profesionales y software a medida
- **Mecanismo**: vende tiempo de personas calificadas, por hora, por proyecto o como equipo dedicado.
- **Indicadores** (**[Interpretación]**, práctica general; no hallé fuente abierta específica): utilización (horas facturadas / horas disponibles), tarifa por hora o por perfil, margen por proyecto, backlog (trabajo contratado aún no entregado), rotación de personal, cuentas por cobrar.
- **Flujo clásico**: lo representa **regular**. El "producto" no existe sin la gente; el ingreso depende de utilización y de la cartera de clientes, no de unidades.
- **Variables mensuales**: horas facturables, proyectos ganados/perdidos, tarifa, rotación y contratación, atraso de cobranza.

### A5. Eventos y fiestas
- **Mecanismo**: el cliente reserva una fecha y paga un paquete (salón, comida, música, decoración). Una fuente de prensa dice que el salón suele incluir catering, y que se firma un solo contrato y un solo pago [S19].
- **Indicadores** (**[Interpretación]**): fechas reservadas / fechas disponibles, ticket por evento, costo por invitado, anticipo cobrado, margen por evento, cancelaciones.
- **Flujo clásico**: lo representa **mal con ingresos parejos**: el negocio es muy estacional (fines de semana, fin de año) y cada fecha vendida es capacidad que no se recupera.
- **Variables mensuales**: temporada, reservas con anticipación, anticipos, cancelaciones, costos variables por invitado, eventos de riesgo (clima, cortes, sanidad).

### A6. Alquiler de activos
- **Mecanismo**: se cede el uso exclusivo de un activo por un período a cambio de una renta [S9, S10]; en Malone y otros es el modelo "Landlord" [S5].
- **Indicadores** (**[Interpretación]**): tasa de ocupación, renta por m² o por día, vacancia, costo de mantenimiento por activo, rotación de inquilinos.
- **Flujo clásico**: lo representa **bien** si la renta es estable. Se complica con la vacancia y el valor residual del activo.
- **Variables mensuales**: vacancia, renta, mantenimiento mayor, morosidad del inquilino.

### A7. Hotelería y turismo
- **Mecanismo**: vende noches y servicios sobre una capacidad fija de habitaciones.
- **Indicadores** [S13, glosario C]: ADR (tarifa diaria promedio = ingreso de habitaciones / habitaciones vendidas), RevPAR (ingreso de habitaciones / habitaciones disponibles, equivalente a ADR x ocupación), ocupación. La fuente no daba la fórmula de ocupación; otra fuente la define como habitaciones ocupadas sobre disponibles (secundaria).
- **Flujo clásico**: lo representa **mal sin estacionalidad**. La capacidad se vende o se pierde cada noche.
- **Variables mensuales**: ocupación por temporada, tarifa, canal de venta (comisiones de intermediarios), costos fijos altos.

### A8. Plataforma / marketplace de dos lados
- **Mecanismo**: conecta compradores y vendedores y cobra comisión sobre lo transado (corretaje) [S9, S10, S16].
- **Indicadores** [S16 glosario a16z; S17 Rework]: GMV (valor bruto transado), take rate (porcentaje del GMV que la plataforma retiene = ingreso neto / GMV), liquidez (facilidad con que cada lado encuentra contraparte; medida con tasa de match, profundidad de mercado, tiempo hasta el match y utilización). El glosario de a16z indica que el take rate típico va desde un dígito bajo hasta mediados de los 30 (en porcentaje).
- **Flujo clásico**: lo representa **mal**. Hay que hacer crecer **dos** lados; sin liquidez el negocio no funciona aunque el costo sea bajo. El ingreso no es el GMV, es el take rate sobre el GMV [S17].
- **Variables mensuales**: oferta (vendedores), demanda (compradores), GMV, take rate, costo de adquirir cada lado, efecto de red.

### A9. Franquicia / licencia
- **Mecanismo**: el franquiciante cobra un derecho inicial y regalías sobre las ventas de cada unidad [S14]; en Osterwalder es "licencia" [S9].
- **Indicadores** [S14, glosario C; y filings consultados en búsqueda, no todos abiertos]: derecho de entrada (pago único), regalía (recurrente, típicamente un porcentaje de ventas brutas, la fuente dice 5% a 9% como rango común), ventas por unidad, ventas en mismas tiendas (same-store), unidades abiertas y cerradas.
- **Flujo clásico**: lo representa **regular**. El ingreso del franquiciante no es venta de producto sino un porcentaje de lo que venden terceros; el riesgo está en que las unidades sobrevivan.
- **Variables mensuales**: aperturas, cierres, ventas por unidad, tasa de regalía efectiva, soporte al franquiciado.

### A10. Concesión / tarifa por uso de infraestructura
- **Mecanismo**: se cobra por cada uso de una obra con capacidad fija (peaje, teleférico, puerto). El ingreso depende del tráfico.
- **Indicadores** (**[Interpretación]** salvo lo citado): pasajeros o vehículos por día, tarifa promedio, ingreso mínimo garantizado, costo de operación por pasajero, disponibilidad. El blog del Banco Mundial describe tres esquemas de teleféricos urbanos: obra pública con operación estatal (La Paz, Medellín), alianza público-privada con concesión de 30 años e ingreso mínimo diario ligado al número de pasajeros (Ciudad de México) y obra pública con operación privada con pago por disponibilidad (Bogotá) [S18].
- **Flujo clásico**: lo representa **bien en estructura** (inversión grande, flujos largos) pero mal en **riesgo de demanda**: el supuesto de tráfico domina el resultado y hay mecanismos de garantía.
- **Variables mensuales**: demanda de pasajeros, tarifa (regulada), paradas por mantenimiento, ingresos accesorios (publicidad, locales).

### A11. Educación y formación con cobro
- **Mecanismo**: se cobra matrícula o pensión por cohorte de alumnos, o suscripción en el caso online.
- **Indicadores** (**[Interpretación]**): matriculados por cohorte, deserción, ocupación de aulas o cupos, costo por docente-hora, ingreso por alumno.
- **Flujo clásico**: lo representa **regular**. Hay ciclos por cohorte (inscripción en pocos meses) y pérdida gradual de alumnos.
- **Variables mensuales**: inscripción por temporada, deserción, morosidad de pensiones, cantidad de cohortes.

### A12. Salud privada
- **Mecanismo**: cobra por atenciones sobre camas y consultorios.
- **Indicadores** (**[Interpretación]**, sin fuente abierta): ocupación de camas, estadía promedio, ingreso por atención, costo por cama-día, mix de aseguradoras y pago de bolsillo.
- **Flujo clásico**: lo representa **regular**. Capacidad fija y costos fijos altos (personal, equipo).
- **Variables mensuales**: demanda por temporada (por ejemplo, brotes), ocupación, morosidad de aseguradoras, renovación de equipo.

### A13. Producción agropecuaria por campaña
- **Mecanismo**: se produce una vez por ciclo y se vende la cosecha; el ingreso llega meses después del gasto.
- **Indicadores** (**[Interpretación]**; datos de ejemplo en S20): superficie sembrada, rendimiento por hectárea, precio por tonelada, costo de producción por hectárea, pérdida por clima.
- **Flujo clásico**: lo representa **mal si se promedia el año**: el flujo es de gasto primero y cobro después, con riesgo de clima y de precio.
- **Variables mensuales**: calendario de siembra y cosecha, clima, precio internacional, financiamiento del capital de trabajo.

### A14. Servicios financieros / microcrédito
- **Mecanismo**: presta y cobra una tasa mayor al costo de fondeo; el riesgo es la mora.
- **Indicadores** (**[Interpretación]**): cartera, tasa activa, costo de fondeo, mora (cartera en mora sobre cartera total), cobertura de previsiones, costo operativo por prestatario.
- **Flujo clásico**: lo representa **mal**: el "producto" es dinero, no hay inventario, y el resultado depende de la mora y del fondeo.
- **Variables mensuales**: colocaciones, desembolsos, mora, tasa de interés, fondeo.

---

## 5. Fichas del grupo B (sin ingreso directo)

Cada ficha dice qué se mide en lugar del ingreso, qué indicador reemplaza o complementa al VAN/TIR, por qué el VAN/TIR clásico falla o sirve a medias, y qué variables cambiarían en una simulación mensual.

### B1. Campaña de marketing
- **Qué se mide**: ventas, clientes o leads **incrementales** causados por la campaña, no el total de ventas del período [S15].
- **Indicadores**: ROAS (ingreso atribuido / gasto), ROAS incremental (ingreso causado / gasto), lift (diferencia de conversión entre expuestos y control, sobre la base), costo por cliente o lead adquirido, CAC, tasa de conversión, LTV del cliente adquirido [S11 para CAC y LTV].
- **Reemplaza o complementa al VAN/TIR**: **complementa**. Se calcula el flujo incremental (margen por los clientes causados menos el costo de la campaña) y recién ahí se puede sacar un VAN. Si el ROAS usa ventas que habrían ocurrido igual, el VAN sale inflado.
- **Por qué el flujo clásico falla**: asigna a la campaña toda la venta del período (confunde base con incremento); no distingue campañas de captura (que cobran a quienes ya iban a comprar) de campañas que crean demanda.
- **Variables mensuales**: gasto, alcance, frecuencia, conversión, saturación de la audiencia (el lift baja a medida que se repite), estacionalidad, competencia, efecto de rezago (parte de la venta llega semanas después).
- **Eventos propios posibles**: la plataforma cambia su algoritmo, un competidor lanza una campaña, fallan los datos de medición.

### B2. Comunicación institucional / branding
- **Qué se mide**: alcance (personas distintas expuestas), frecuencia (veces promedio), recordación, cambio de actitud o de intención. El estudio de la UMSA sobre la campaña COVID-19 "Vamos a salir adelante" midió alcance contando 16 conferencias de prensa (con 93 medios) y 1.581 publicaciones en cuentas oficiales [S21]; es un ejemplo de medición por actividad y presencia, no por efecto.
- **Indicadores**: alcance, frecuencia, costo por persona alcanzada, costo por mil, recordación asistida/espontánea, menciones, sentimiento. **[Interpretación]**, salvo el caso S21.
- **Reemplaza o complementa al VAN/TIR**: **reemplaza** por costo por unidad de resultado de comunicación (ACI según S1) cuando no hay ventas atribuibles. Si hay objetivo comercial, se vuelve B1.
- **Por qué el flujo clásico falla**: el beneficio (reputación) se acumula lento y no se factura.
- **Variables mensuales**: inversión en medios, alcance, frecuencia, olvido (la recordación decae sin pauta), crisis reputacional.

### B3. Proyecto social / ONG
- **Qué se mide**: el cambio en la población objetivo (por ejemplo, niños que dejan de desnutrirse).
- **Indicadores** [S1]: costo total anual, costo por unidad de producto (CUP), impacto medio anual por objetivo, **CUI**, cobertura, focalización, línea de base. Con SROI [S6]: ratio de valor social, deadweight, atribución, drop-off.
- **Reemplaza o complementa al VAN/TIR**: **reemplaza** por ACI o complementa con SROI (que sí devuelve un ratio parecido al VAN). Para elegir entre proyectos pequeños con objetivos distintos, índice multicriterio [S1].
- **Por qué el flujo clásico falla**: los beneficios "difícilmente pueden expresarse en moneda" [S1]. Además un proyecto social sin ingresos tendría VAN siempre negativo, lo cual no dice nada.
- **Variables mensuales**: población atendida, cobertura, deserción de beneficiarios, costo por beneficiario, financiamiento de donantes (llega por desembolsos), cumplimiento de condiciones.
- **Dato de cuidado**: el paper de IFPRI sobre PROGRESA advierte que los costos administrativos agregados engañan y que hay que mirar la estructura de costos, incluyendo costos privados de los hogares [S8].

### B4. Educativo público
- **Qué se mide**: matrícula, permanencia, promoción y aprendizaje.
- **Indicadores**: tasa de matriculación, de permanencia, de promoción, costo por alumno, gasto operativo como porcentaje del presupuesto. El estudio del BCB sobre el Bono Juancito Pinto estima efectos de cerca de 1% en matriculación, 1% en permanencia y 3,7% en promoción, y reporta gastos operativos del 4,1% del presupuesto entre 2006 y 2011 (3,8% en 2012 y 2013) [S7].
- **Reemplaza o complementa al VAN/TIR**: **reemplaza** por costo por punto de permanencia o promoción (ACI). El manual del Banco Mundial tiene un capítulo de evaluación económica de educación [S2].
- **Por qué el flujo clásico falla**: el retorno (más ingresos futuros de los alumnos) llega décadas después y es incierto.
- **Variables mensuales**: calendario escolar (matrícula y pago concentrados), asistencia, deserción, ejecución presupuestaria.

### B5. Salud pública
- **Qué se mide**: casos evitados, muertes evitadas, años de vida ganados.
- **Indicadores**: costo por caso evitado, cobertura de vacunación, costo por AVAD evitado (ver sección 8 para umbrales). El manual de CEPAL trae un ejemplo de matriz costo-impacto de un consultorio, con alternativas de costo anual entre US$ 463.020 y US$ 592.672 y un impacto combinado medido en porcentaje [S1].
- **Reemplaza o complementa al VAN/TIR**: **reemplaza** por costo-efectividad. El Banco Mundial dedica capítulos a salud y a costo-efectividad [S2].
- **Por qué el flujo clásico falla**: no hay ingreso, y poner precio a una vida es discutible; por eso se compara costo por resultado entre alternativas.
- **Variables mensuales**: cobertura alcanzada, brotes o epidemias, abastecimiento de insumos, bloqueos de acceso.

### B6. Cultural / patrimonial
- **Qué se mide**: visitantes, gasto turístico inducido, y valores sin mercado (valor de existencia, de legado).
- **Indicadores**: visitantes, gasto por visitante, efecto multiplicador, costo por visitante. Caso Carnaval de Oruro: funcionarios dicen que supera los US$ 500 millones, pero la misma nota admite que no hay cifras nacionales consolidadas y que recién se empezará a medir [S22]; sirve de advertencia sobre cifras sin método.
- **Reemplaza o complementa al VAN/TIR**: **complementa** con costo-beneficio ampliado (que incluya valoración no de mercado) o ACI por visitante.
- **Por qué el flujo clásico falla**: el beneficio principal (patrimonio) no se cobra, y el gasto turístico es de terceros (hoteles, comercios), no del proyecto.
- **Variables mensuales**: temporada (eventos puntuales), visitantes, clima, conflictos que cortan accesos (la nota de 2024 mencionó bloqueos), financiamiento público.

### B7. TI interna / transformación digital
- **Qué se mide**: tiempo, errores y trámites evitados; trámites resueltos en línea.
- **Indicadores** (**[Interpretación]**): horas ahorradas x costo de hora, errores evitados, costo por trámite resuelto, adopción (usuarios activos), costo total de propiedad.
- **Reemplaza o complementa al VAN/TIR**: **complementa**; si el ahorro se puede valorar, hay VAN del ahorro; si no, costo por trámite.
- **Por qué el flujo clásico falla**: el beneficio depende de la **adopción**, y los proyectos fallan por no uso, no por mala tecnología.
- **Variables mensuales**: adopción, incidentes y caídas, deuda técnica, rotación del equipo.
- **Dato de cuidado**: AGETIC dice que la Ciudadanía Digital ahorra "tiempo y recursos" al ciudadano y al Estado [S23]; es material institucional, sin evaluación independiente que haya encontrado.

### B8. Infraestructura pública
- **Qué se mide**: beneficios económicos para la sociedad (tiempo ahorrado, costo evitado, accesibilidad), a **precios sociales**.
- **Indicadores**: VAN social, TIR económica, relación beneficio/costo, valor del tiempo. El Banco Mundial incluye en su manual los capítulos "Getting Prices Right", transporte, riesgo y sensibilidad, y quién gana y quién pierde [S2]. En Bolivia, según los resúmenes de búsqueda que no pude abrir, el Reglamento Básico de Preinversión define la evaluación socioeconómica con precios sombra (sección 8).
- **Reemplaza o complementa al VAN/TIR**: **es** un VAN, pero **social**: usa precios corregidos y una tasa social. Por eso se llama "VAN social" para no mezclarlo con el financiero.
- **Por qué el flujo clásico falla**: el flujo financiero del operador puede ser negativo (tarifa subsidiada) y el proyecto ser socialmente conveniente.
- **Variables mensuales**: avance de obra, sobrecostos, demanda cuando abre, mantenimiento, tarifa regulada.

### B9. Cumplimiento normativo
- **Qué se mide**: la pérdida que se evita (multas, clausuras, pérdida de licencia).
- **Indicadores** (**[Interpretación]**): probabilidad x impacto de la sanción (pérdida esperada), costo del control, costo de no cumplir, plazo de adecuación. Caso de contexto: el Servicio de Impuestos Nacionales exige facturación electrónica de forma escalonada desde noviembre de 2021 [S24].
- **Reemplaza o complementa al VAN/TIR**: **reemplaza** por pérdida evitada contra costo del cumplimiento. El "beneficio" es un evento que no ocurre.
- **Por qué el flujo clásico falla**: no hay ingreso, y la multa es un riesgo, no un flujo seguro. Además se cumple porque es obligatorio, no porque dé retorno.
- **Variables mensuales**: fechas límite que se mueven, fiscalizaciones, cambio de normas, prórrogas (por ejemplo, el SIN amplió plazos hasta el 30/9/2026 para ciertos grupos [S24]).

### B10. Eficiencia / ahorro
- **Qué se mide**: costo evitado (energía, horas, insumos, mermas).
- **Indicadores**: ahorro mensual y anual, período de recuperación, VAN del ahorro, costo de la energía propia contra la de la red. Caso de proyección (no medido): un sistema fotovoltaico de 10 kWp en una fábrica de pisos de goma, inversión de US$ 15.200, recuperación estimada en menos de 5 años, ahorro inicial estimado de unos US$ 200 al mes [S25].
- **Reemplaza o complementa al VAN/TIR**: **es** un VAN, con el ahorro como "ingreso". Es el caso donde el flujo clásico funciona bien, siempre que el ahorro sea medible.
- **Por qué el flujo clásico puede fallar**: el ahorro se **proyecta**, no se factura; la fuente aclara que son cifras de anuncio, no resultados medidos [S25].
- **Variables mensuales**: consumo real, tarifa de la red, degradación del equipo, mantenimiento.

---

## 6. Ejemplos reales (Bolivia y Latinoamérica)

Solo aparecen casos cuyo enlace abrí. Donde no hubo, lo digo. "Bolivia" o "Latam" indica el país del caso. Lo que dice la nota va en la columna "Qué dice la fuente"; no es mi evaluación del negocio.

### Grupo A

| Tipo | Caso | País | Qué dice la fuente | Enlace |
|------|------|------|--------------------|--------|
| A1 | Sin ejemplos relevados | n/d | Es el tipo ya cubierto por el motor; no busqué casos | n/d |
| A2 | Platzi | Latam (la nota no indica país; origen colombiano según otras notas que no abrí) | Educación online; cobra suscripción de US$ 29 al mes o US$ 299 al año; fundada en 2013 | [EdSurge, 2019](https://edsurge.com/news/2019-06-18-platzi-raises-6-million-to-bring-more-online-education-to-latin-america) |
| A2 | Ejemplo boliviano | n/d | **No confirmado** | n/d |
| A3 | Unitel | Bolivia | Red de televisión comercial fundada en 1997; la nota la describe con anunciantes y "altos costos de publicidad", y dice que revende derechos de transmisión de la liga a cables | [Wikipedia, Unitel Bolivia](https://en.wikipedia.org/wiki/Unitel_Bolivia) |
| A3 | Mi Teleférico (ingresos accesorios) | Bolivia | Además del pasaje, tiene ingreso por alquiler de espacios comerciales y publicitarios | [eju.tv, 2016](https://eju.tv/2016/04/teleferico-la-paz-alto-transporto-mas-43-millones-pasajeros-recaudo-bs-140-millones-dos-anos/) |
| A4 | Jalasoft | Bolivia (Cochabamba) | Empresa de desarrollo y exportación de software; unos 1.100 empleados según entrevista de julio de 2021; sedes en Cochabamba, La Paz, Medellín y São Paulo | [eju.tv, entrevista a Antonio Cabrera](https://eju.tv/?p=2272176) |
| A5 | Salas de eventos de El Alto | Bolivia | Más de 60 salas diseñadas por Freddy Mamani; se usan como salones de baile y banquetes de alquiler para celebraciones privadas; la nota no da precios ni ingresos | [LAB, sobre Freddy Mamani](https://lab.org.uk/cholet-the-work-of-freddy-mamani-who-built-salas-de-eventos-in-el-alto-bolivia/) |
| A5 | Salones de eventos (contexto) | Bolivia (Cochabamba) | Nota de 2017: un buen salón suele ofrecer catering; un solo contrato y un solo pago; sin precios ni capacidades | [Los Tiempos, 2017](https://www.lostiempos.com/tendencias/casa/20170317/ventajas-salones-eventos) |
| A5 | "El Patrón" | Bolivia | **No confirmado que exista. Ver sección 8** | n/d |
| A6 | Salas de eventos de El Alto (modelo de alquiler) | Bolivia | Ver A5: los propietarios ganan alquilando las salas; los pisos superiores suelen ser vivienda del dueño | mismo enlace de LAB |
| A7 | Sector hotelero (contexto) | Bolivia | Nota de enero de 2017: turismo creció 26% en el último año; 5.938 empresas del rubro; 68% de los turistas que llegan por aire entran por Santa Cruz | [eju.tv, 2017](https://eju.tv/?p=874175) |
| A7 | Hotel específico con datos | n/d | **No confirmado** (no abrí ningún hotel con cifras de ocupación o tarifa) | n/d |
| A8 | ÜPAKET | Bolivia | Marketplace con primeras ventas en marzo de 2020; unos 80 "tiendas"; cobra comisión de aproximadamente 10 a 15% por venta, con almacenaje incluido | [Correo del Sur, abril 2021](https://correodelsur.com/ecos/20210415/el-mercado-en-linea-boliviano.html) |
| A8 | Soukers | Bolivia | Marketplace B2B entre marcas de consumo masivo y tiendas de barrio; "opera sin comisiones por ventas"; etapa semilla | [Descubre, Soukers](https://www.descubre.vc/soukers) |
| A8 | Likida | Bolivia | Plataforma de comercio digital con pago en custodia hasta que el comprador confirma; la nota no explica cómo gana | [Ecosistema Startup](https://ecosistemastartup.com/?p=47387) |
| A9 | Alfa Inmobiliaria (master franquicia) | Bolivia (sede Cochabamba) | Acuerdo de master franquicia con un empresario que ya opera 16 oficinas y más de 300 agentes; plan de 2 oficinas más a fines de 2025 y al menos 15 en 2026; la nota no da honorarios ni regalías | [Merca2, agosto 2025](https://www.merca2.es/2025/08/11/alfa-inmobiliaria-bolivia-2221390/) |
| A9 | Feria de franquicias FIFBO (contexto) | Bolivia | Nota de abril de 2018: unas 250 franquicias en el país, cerca del 60% en Santa Cruz, mayoría extranjeras | [Peru Retail, 2018](https://www.peru-retail.com/fifbo-feria-internacional-de-franquicias-de-bolivia-reunira-mas-de-40-marcas/) |
| A10 | Mi Teleférico | Bolivia | Más de 43 millones de pasajeros y unos Bs 140 millones en dos años (cifras del gerente, abril 2016); los pasajes son la principal fuente de ingreso | [eju.tv, 2016](https://eju.tv/2016/04/teleferico-la-paz-alto-transporto-mas-43-millones-pasajeros-recaudo-bs-140-millones-dos-anos/) |
| A10 | Teleféricos urbanos de Latam (comparación de esquemas) | Latam | Blog del Banco Mundial: La Paz y Medellín con operación pública; Ciudad de México con concesión de 30 años e ingreso mínimo diario; Bogotá con pago por disponibilidad | [Banco Mundial, blog](https://blogs.worldbank.org/es/latinamerica/los-telefericos-un-medio-de-transporte-publico-economicamente-viable-en-AmLat) |
| A11 | Platzi (educación online por suscripción) | Latam | Ver A2 | mismo enlace de EdSurge |
| A11 | Universidad privada boliviana | n/d | **No confirmado** (no abrí ninguna fuente con matrícula o pensiones) | n/d |
| A12 | Clínica privada boliviana | n/d | **No confirmado** | n/d |
| A13 | Quinua boliviana (exportación) | Bolivia | Publicación del IBCE (2013): en 2012 se exportaron 26.201 toneladas por cerca de US$ 79,8 millones, frente a unas 2.000 toneladas y US$ 2 millones en 2002 | [IBCE, "La quinua boliviana traspasa fronteras"](https://ibce.org.bo/images/publicaciones/ce_210_la_quinua_boliviana_traspasa_fronteras.pdf) |
| A14 | BancoSol | Bolivia | Su sitio publica memorias anuales (la página abierta no mostraba cifras); el caso es nominal, **sin cifras verificadas** | [BancoSol, memorias](https://www.bancosol.com.bo/memorias/memoria_bancosol_2022.pdf) |

### Grupo B

| Tipo | Caso | País | Qué dice la fuente | Enlace |
|------|------|------|--------------------|--------|
| B1 | Effie Bolivia 2025 (campañas premiadas por efectividad) | Bolivia | Los Effie premian campañas con "resultados comprobables"; ganaron, entre otras, "Yape – Hazlo Posible" (BCP), "Soltá el carrito" (Pedidos Ya) y "Terapia de Planes" (Tigo). La nota no publica ROI ni conversión | [eju.tv, octubre 2025](https://eju.tv/?p=4774774) |
| B2 | Campaña COVID-19 "Vamos a salir adelante" | Bolivia | Tesis de la UMSA (2022) que mide alcance de la estrategia comunicacional: 16 conferencias de prensa y 1.581 publicaciones | [Repositorio UMSA](https://repositorio.umsa.bo/xmlui/handle/123456789/29565) |
| B2 | "Primer trasplante de logo" (Fundación Dunn Cares) | Bolivia | Premiada en Effie Bolivia 2025 en la categoría "Bajo presupuesto" | mismo enlace de eju.tv (Effie) |
| B3 | PROGRESA / Oportunidades | México (Latam) | Transferencias a madres condicionadas a escolaridad, controles de salud y nutrición; el paper analiza la estructura de costos para evaluar eficiencia | [IFPRI, discusión 199](https://ideas.repec.org/p/fpr/fcnddp/199.html) |
| B3 | Wheels-to-Meals (ejemplo de la guía SROI) | Reino Unido (no es Latam; es el caso de la guía) | Aparece como ejemplo en la guía SROI del Cabinet Office | [Cabinet Office, guía SROI](https://www.bond.org.uk/wp-content/uploads/2022/09/cabinet_office_a_guide_to_social_return_on_investment.pdf) |
| B4 | Bono Juancito Pinto | Bolivia | Transferencia condicionada creada en 2006 para matrícula, permanencia y promoción; el estudio estima efectos de aprox. 1%, 1% y 3,7%; gastos operativos 4,1% (2006-2011) y 3,8% (2012-2013) del presupuesto | [BCB, Revista de Análisis, 2014](https://www.bcb.gob.bo/webdocs/publicacionesbcb/2_Bono_Juancito_Pinto.pdf) |
| B5 | Matriz costo-impacto de un consultorio | Caso didáctico del manual (país no confirmado) | El manual de CEPAL compara tres alternativas de intervención con costo anual y metas de impacto | [CEPAL, manual Cohen y Martínez](https://dds.cepal.org/redesoc/archivos_recursos/242/Manual_dds_200408.pdf) |
| B5 | Campaña de salud pública boliviana con costo-efectividad | Bolivia | **No confirmado** (no encontré ninguna evaluación) | n/d |
| B6 | Carnaval de Oruro | Bolivia | Cifra oficial de más de US$ 500 millones para el Carnaval, sin cifras nacionales consolidadas | [Los Tiempos, 12/2/2026](https://www.lostiempos.com/actualidad/economia/20260212/pais-carnaval-genera-movimiento-economico-superior-us-500-millones) |
| B7 | Ciudadanía Digital (AGETIC) | Bolivia | Plataforma de identidad digital para trámites en línea; la ficha dice que ahorra tiempo y recursos; sin cifras verificables en el documento abierto | [AGETIC, ficha](https://agetic.gob.bo/sites/default/files/2025-09/ARTICULO%203.pdf) |
| B8 | Mi Teleférico (obra pública) | Bolivia | Ver A10; según el blog del Banco Mundial, es obra pública con operación estatal | mismos enlaces de A10 |
| B9 | Facturación electrónica (SIN) | Bolivia | Obligatoria de forma escalonada desde noviembre de 2021 (RND 102100000011); plazos prorrogados en 2026 | [EDICOM, blog](https://edicomgroup.com/es/blog/como-es-la-factura-electronica-en-bolivia) |
| B10 | Sistema fotovoltaico de la fábrica Mamut | Bolivia | Proyecto de 10 kWp, inversión de US$ 15.200, recuperación estimada en menos de 5 años; son proyecciones de mayo de 2019 | [Energías Renovables, 2019](https://www.energias-renovables.com/fotovoltaica/anuncian-el-primer-sistema-fotovoltaico-de-generacion-20190506) |

---

## 7. Fuentes verificadas y su nivel

Solo incluyo las que abrí. "Texto leído" significa que leí contenido; "ficha" significa que solo confirmé datos de catálogo.

| N.º | Fuente | Nivel | Qué verifiqué | Enlace |
|-----|--------|-------|---------------|--------|
| S1 | Ernesto Cohen y Rodrigo Martínez, *Manual: Formulación, evaluación y monitoreo de proyectos sociales*, CEPAL, División de Desarrollo Social. El propio PDF dice "No ha sido sometido a revisión editorial"; el año no figura en el texto que extraje (el nombre del archivo sugiere agosto de 2004, no confirmado) | A | Texto leído: ACB, ACM, ACI, CUI, índice multicriterio | https://dds.cepal.org/redesoc/archivos_recursos/242/Manual_dds_200408.pdf |
| S2 | Pedro Belli y otros, *Economic Analysis of Investment Operations: Analytical Tools and Practical Applications*, World Bank Institute. El PDF dice "First printing January 2001"; la ficha de una biblioteca dice año 2000 y ISBN 0821348507 | A | Texto leído: índice, capítulos de costo-efectividad, educación, salud, transporte | https://documents1.worldbank.org/curated/en/792771468323717830/pdf/298210REPLACEMENT.pdf y https://library.au.int/node/235105 |
| S3 | Gabriel Baca Urbina, *Evaluación de proyectos*, 5.ª ed., McGraw-Hill, México, 2006, ISBN 9789701056875 | A (libro) | Solo ficha de catálogo; no leí contenido | https://biblioteca.frro.utn.edu.ar/bib/451 |
| S4 | Peter Weill y Stephanie Woerner, *What's Your Digital Business Model?*, Harvard Business Review Press, 2018, ISBN 9781633692701 | A (libro) | Solo ficha de librería; no leí contenido | https://abebooks.com/9781633692701/Digital-Business-Model-Questions-Help-1633692701/plp |
| S5 | Malone, Weill, Lai, D'Urso, Herman, Apel y Woerner, "Do Some Business Models Perform Better than Others?", MIT Sloan Working Paper 4615-06, 2006 | A (paper) | Texto leído: resumen e introducción (4 modelos por derechos sobre activos) | https://mpra.ub.uni-muenchen.de/4752/1/MPRA_paper_4752.pdf |
| S6 | Jeremy Nicholls, Eilis Lawlor, Eva Neitzert y Tim Goodspeed, *A guide to Social Return on Investment*, Cabinet Office (Reino Unido), 2009 según el texto | A (guía de gobierno) | Texto leído: etapas, deadweight, ratio | https://www.bond.org.uk/wp-content/uploads/2022/09/cabinet_office_a_guide_to_social_return_on_investment.pdf |
| S7 | Hernán Aguilar Pacajes, "Evaluación de impacto del Bono Juancito Pinto en Bolivia", Revista de Análisis (BCB), vol. 21, julio-diciembre 2014, pp. 37-66 | A (paper) | Texto leído: resumen y costos operativos | https://www.bcb.gob.bo/webdocs/publicacionesbcb/2_Bono_Juancito_Pinto.pdf |
| S8 | David Coady, Raul Perez y Hadid Vera-Ilamas (así figuran en la página abierta), "Evaluating the cost of poverty alleviation transfer programs: an illustration based on PROGRESA in Mexico", IFPRI, FCND Discussion Paper 199, 2005 | A (paper) | Solo resumen de la ficha | https://ideas.repec.org/p/fpr/fcnddp/199.html |
| S9 | Wikipedia, "Business model canvas" (siete fuentes de ingreso de Osterwalder y Pigneur) | C | Texto leído de la sección de ingresos | https://en.wikipedia.org/wiki/Business_model_canvas |
| S10 | SmartCompany, nota sobre los siete modelos de ingreso atribuidos a Osterwalder y Pigneur | C | Texto leído | https://www.smartcompany.com.au/?p=19405 |
| S11 | Orb, "16 Key SaaS metrics" | C | Definiciones de MRR, ARR, churn, NRR, CAC, LTV, ARPU | https://www.withorb.com/blog/saas-metrics |
| S12 | Aswath Damodaran (NYU Stern), "User and Subscriber Businesses: The Good, the Bad and the Ugly" (presentación) | A (material universitario) | Texto leído: primeras diapositivas (valorar usuarios con primeros principios) | https://pages.stern.nyu.edu/~adamodar/pdfiles/blog/UserbasedValue.pdf |
| S13 | Hotel Online, "What is Average Daily Rate (ADR)?" | C | Fórmulas de ADR y RevPAR | https://www.hotel-online.com/news/what-is-average-daily-rate-adr-and-how-to-calculate-it |
| S14 | MSA Worldwide, "Franchise royalty payments: the basics" | C | Derecho inicial y regalía (5% a 9% de ventas brutas como común) | https://msaworldwide.com/basics-of-franchising/franchise-royalty-payments-the-basics/ |
| S15 | FirstPier, glosario "Incrementality testing" | C | Incrementalidad, holdout, lift, ejemplo de 4x contra 1,8x | https://www.firstpier.com/glossary/incrementality-testing |
| S16 | a16z, "Marketplace glossary" (2020) | B (firma de capital de riesgo) | Liquidez, take rate, efecto de red, fill rate | https://a16z.com/2020/02/18/marketplace-glossary/ |
| S17 | Rework, "Marketplace metrics: GMV, liquidity and take rate" | C | GMV, take rate, liquidez | https://resources.rework.com/libraries/marketplace-growth/marketplace-metrics |
| S18 | Banco Mundial, blog "Los teleféricos: ¿un medio de transporte público económicamente viable...?" | B (blog de organismo multilateral) | Texto leído: tres esquemas de operación | https://blogs.worldbank.org/es/latinamerica/los-telefericos-un-medio-de-transporte-publico-economicamente-viable-en-AmLat |
| S19 | Los Tiempos, "Las ventajas de los salones de eventos", 2017 | B (prensa) | Catering y contrato único | https://www.lostiempos.com/tendencias/casa/20170317/ventajas-salones-eventos |
| S20 | IBCE, "La quinua boliviana traspasa fronteras" (2013) | B (instituto gremial) | Texto extraído: exportación 2012 | https://ibce.org.bo/images/publicaciones/ce_210_la_quinua_boliviana_traspasa_fronteras.pdf |
| S21 | María Eugenia Huanca Poma, tesis UMSA 2022, "Alcance de las estrategias de comunicación de la campaña covid19 'Vamos a salir adelante', Bolivia" | A (tesis universitaria) | Solo la ficha con el resumen | https://repositorio.umsa.bo/xmlui/handle/123456789/29565 |
| S22 | Los Tiempos, nota sobre el movimiento económico del Carnaval, 12/2/2026 | B (prensa) | Texto leído | https://www.lostiempos.com/actualidad/economia/20260212/pais-carnaval-genera-movimiento-economico-superior-us-500-millones |
| S23 | AGETIC (Bolivia), ficha informativa de Ciudadanía Digital | B (institucional, autodeclarado) | Texto extraído | https://agetic.gob.bo/sites/default/files/2025-09/ARTICULO%203.pdf |
| S24 | EDICOM, "Cómo es la factura electrónica en Bolivia" | B (consultora) | Texto leído: marco legal y fechas | https://edicomgroup.com/es/blog/como-es-la-factura-electronica-en-bolivia |
| S25 | Energías Renovables, nota sobre el sistema fotovoltaico de Mamut (2019) | B (prensa especializada) | Texto leído | https://www.energias-renovables.com/fotovoltaica/anuncian-el-primer-sistema-fotovoltaico-de-generacion-20190506 |

Conteo: 25 fuentes numeradas (más los enlaces de ejemplos). Nivel A con contenido leído: S1, S2, S5, S6, S7, S8, S12, S21 (8). Nivel A confirmados solo por ficha de catálogo: S3, S4 (2). Total nivel A: 10.

Fuentes adicionales abiertas que usé solo para ejemplos (no están numeradas arriba): los enlaces de la tabla de la sección 6 (eju.tv, Correo del Sur, Descubre, Ecosistema Startup, Merca2, Peru Retail, Wikipedia Unitel, LAB, Los Tiempos Mandarina Lounge, Platzi en EdSurge, BancoSol).

---

## 8. No confirmado

### 8.1 "El Patrón" (CORREGIDO por el owner: servicio de flores con personaje, no salón de fiestas)
Nota 2026-10-22: lo de abajo es la búsqueda original, hecha con una definición equivocada. La definición correcta está en el punto 6 del resumen. La ficha `tipos/eventos-servicios-sorpresa.md` ya parte de la definición correcta.

- Hice dos búsquedas web con variantes del nombre ("El Patron", "El Patrón", con las palabras fiestas, eventos, Bolivia, salón, Instagram y Facebook). **No encontré ninguna fuente que acredite un servicio de fiestas o eventos llamado "El Patrón" en Bolivia.** No lo doy por inexistente: puede existir en redes sociales o directorios que el buscador no indexó. Tampoco lo doy por existente.
- Lo único relacionado que abrí: una nota de Los Tiempos (13/10/2016) dice que el lugar nocturno Mandarina Lounge organizó una fiesta llamada "El Patrón del Mal". Eso es el nombre de **una fiesta puntual**, no un negocio de servicios de fiestas, y no hay evidencia de relación con lo que busca el owner. [Los Tiempos, 2016](https://www.lostiempos.com/node/122467)
- En los resultados apareció un "El Patrón" organizador de eventos en Cádiz, España. No es Bolivia.
- Siguiente paso sugerido: preguntar al owner la ciudad, el Instagram o el teléfono de El Patrón para poder verificarlo.

### 8.2 Libros: "recomendado, no verificado"
- **Nassir Sapag Chain y Reinaldo Sapag Chain, *Preparación y evaluación de proyectos*, McGraw-Hill.** Los resultados de búsqueda mostraron fichas de bibliotecas con varias ediciones (por ejemplo, 5.ª edición de 2008, ISBN 9789562782067, y una 4.ª con fechas 2000 o 2003 según el registro), pero no pude abrir ninguna ficha (el sitio de la biblioteca bloqueó la consulta). No cito edición ni editorial como confirmadas.
- **Alexander Osterwalder y Yves Pigneur, *Business Model Generation*.** Confirmé los siete tipos de ingreso en dos páginas secundarias (S9, S10), no en el libro ni en una ficha de editorial. Edición, editorial y año: no verificados.
- **Peter Weill y Stephanie Woerner (2018):** la ficha de librería confirma autores, editorial, año e ISBN. Los resúmenes de búsqueda mencionaron cuatro modelos (Supplier, Omni-channel, Modular Producer, Ecosystem Driver), pero **no los pude confirmar en una página abierta**, así que no los uso.

### 8.3 Documentos que existen en el repositorio de CEPAL/ILPES pero no pude abrir
- Cohen y Franco (ILPES, 1990), "Evaluación de proyectos sociales: la utilización del análisis costo-efectividad". La página del repositorio devolvió error 429.
- Ortegón, Pacheco y Roura (ILPES, 2005), "Metodología general de identificación, preparación y evaluación de proyectos de inversión pública". La página devolvió error 403.
- Navarro (ILPES, 2001) y Galilea (CEPAL, 1983): solo aparecen en resúmenes de búsqueda.
- No encontré una guía del BID de costo por beneficiario. Los resúmenes mencionaron una guía de análisis costo-efectividad en salud y educación de Patrick McEwan y un manual del BID de evaluación económica de transporte (2006), pero no los abrí.

### 8.4 Bolivia: normativa de inversión pública
- Los resúmenes de búsqueda indican que el Reglamento Básico de Preinversión (RBP), apoyo del Sistema Nacional de Inversión Pública (1996), define la evaluación socioeconómica con precios sombra (divisas, mano de obra) y tasa social, y que fue adoptado por Resolución Ministerial 115/2015. **No pude abrir el documento** (certificado inválido del sitio universitario que lo aloja) ni una versión oficial del Ministerio de Planificación. No confirmé si hay un reglamento posterior ni la versión vigente.

### 8.5 Métricas y umbrales citados por resúmenes que no abrí
- Umbrales de la OMS por AVAD evitado (costo-efectivo si es menor a tres veces el PIB per cápita, muy costo-efectivo si es menor a uno) y su crítica: viene de un resumen de búsqueda sobre un artículo de Marseille y otros (Boletín de la OMS, 2015). No abrí el artículo.
- Definiciones de CPM, CPC y CTR: vistas solo en resúmenes de glosarios de terceros. No abrí el glosario del IAB.
- Cifras citadas en resúmenes de búsqueda sobre casos de Cannes Lions (ROI de 270% y de 1.020%) y benchmarks de take rate: no las abrí; no las uses.
- Skok, "SaaS Metrics 2.0": solo apareció en una copia de terceros dudosa; no la abrí.
- Definición de ocupación hotelera: la fuente abierta (S13) no daba la fórmula; la definición "habitaciones ocupadas sobre disponibles" viene de otras páginas vistas en búsqueda.
- Cifras del Banco Mundial sobre costos de construcción de teleféricos (US$ 19 a 32 millones por kilómetro): aparecen en el blog que abrí, pero no las usé como parámetro.

### 8.6 Ejemplos que quedaron sin caso abierto
- No hay caso abierto y confirmado para: ejemplos de A1, una suscripción boliviana (A2), un hotel con datos (A7), una universidad privada (A11), una clínica privada (A12) y una evaluación de costo-efectividad de una campaña de salud boliviana (B5). Un caso de BancoSol (A14) y de AGETIC (B7) existen como organizaciones, pero sus cifras de resultado no están verificadas.
- Mi Teleférico: un resumen de búsqueda mencionó un artículo académico de LAJED sobre la tarifa de la Línea Amarilla; no lo abrí.
- Sobre franquicias bolivianas: un resumen de búsqueda mencionó a Pollos Copacabana y Burger King en Santa Cruz y un artículo de 2022 sobre falta de regulación específica; no los abrí.
- La cifra de ahorro de la Ciudadanía Digital (242.866 trámites, Bs 387.059) vino de un resumen de búsqueda de un documento que no abrí; no la uses.

### 8.7 Lo que no hice
- No leí capítulos de los libros de Baca Urbina ni Sapag Chain, ni del libro de Osterwalder y Pigneur. Las afirmaciones sobre qué dice cada autor se limitan a lo indicado en S3, S9 y S10.
- No relevé fuentes específicas del BID (más allá de lo que figura arriba) ni material de INVERBOL.
- Los indicadores de A1, A4 a A6, A11 a A14, B2, B7, B9 y B10 son interpretación mía, sin una fuente abierta que los avale uno a uno. Antes de implementarlos en el simulador conviene respaldarlos con un texto específico de cada sector.
