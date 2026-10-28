# Suscripción y SaaS (cobro recurrente): ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que yo la abrí y leí (el alcance de lo leído está en esa sección).
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es cita.
- Una magnitud marcada **(estimación)** la puse yo para que el simulador tenga un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro país, otro sector, otra fecha), así que tampoco es un parámetro "verdadero" para Bolivia.
- Lo que no pude verificar está en la sección 9.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto de suscripción cobra una cuota recurrente (mensual, trimestral o anual) a cambio de acceso continuo a algo: un software (SaaS), una plataforma de cursos, un gimnasio, un servicio de streaming, una caja de productos. La literatura de modelos de negocio lo ubica como una de las formas de cobrar (cuota de suscripción), distinta de vender una unidad una sola vez; ver la taxonomía general en `00-taxonomia-tipos.md`.

**Cómo aporta valor.** El valor no está en la venta de hoy, sino en que el cliente se quede. Tres ideas de las fuentes:

1. El valor de un cliente es la suma descontada de lo que dejará en el futuro, y depende sobre todo de cuánto tiempo se queda (la retención) y de cuánto margen deja cada período. El valor de toda la empresa se arma sumando el valor de los clientes actuales y de los que todavía no llegaron, menos lo que cuesta conseguirlos [S1].
2. Un negocio de usuarios o suscriptores se puede valorar "desde los principios": cuántos usuarios hay, cuánto pagan, cuánto cuesta atenderlos, cuánto cuesta conseguir uno nuevo y cuántos se van [S4].
3. Las suscripciones son "más pegajosas" (los ingresos son más predecibles) pero tienen menos potencial de crecimiento explosivo, porque es difícil subir mucho las cuotas [S4].

**Por qué es distinto para un simulador.** En un negocio de venta por unidades, la caja de un mes depende de lo que vendas ese mes. En una suscripción, la caja de un mes depende de **todos los clientes que se sumaron en meses anteriores y todavía no se fueron**. Eso crea tres rasgos que el motor genérico (caja, ingresos, costos, reputación) no captura bien:

- Los primeros meses son malos: pagas para adquirir clientes (CAC) que recién se recuperan después de varios meses de cuotas.
- Un cambio chico en la tasa de bajas, sostenido en el tiempo, cambia mucho el resultado a 5 años.
- No todos los clientes se comportan igual: los recién llegados se van más rápido que los antiguos (ver sección 2, retención por cohorte).

---

## 2. Indicadores propios y cómo se calculan

Convención: **mes t**. Los nombres en inglés se mantienen porque son los que el alumno va a encontrar en cualquier libro, blog o entrevista de trabajo.

### 2.1 Indicadores de ingreso

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Suscriptores activos** | Clientes que pagan en el mes | Activos al inicio + altas - bajas | Definición básica; el uso en Orb [S9] |
| **MRR** (ingreso recurrente mensual) | Lo que facturas por mes de forma recurrente | MRR = suscriptores en plan mensual x ARPU. Excluye cobros únicos (por ejemplo, instalación) | [S9] |
| **ARR** (ingreso recurrente anual) | MRR en base anual | ARR = MRR x 12 (o suma anual de los contratos anuales activos) | [S9] |
| **ARPU** | Ingreso promedio por usuario | ARPU = ingreso total del período / número de usuarios o cuentas del período | [S9] |

Interpretación: el MRR es lo que mejor muestra el "estado de salud" del negocio, pero **no es caja**: un plan anual cobrado por adelantado entra de golpe a caja y se reconoce poco a poco como ingreso. El simulador debería distinguir ambos.

### 2.2 Indicadores de retención (los más importantes)

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Churn de clientes (logo churn)** | (clientes al inicio - clientes al final del período que ya estaban al inicio) / clientes al inicio | [S9] lo define como "customer churn rate" con la fórmula (inicio - final) / inicio. Ojo: si el "final" incluye altas nuevas, la cuenta se contamina. Lo correcto es contar solo los clientes del inicio que siguen (interpretación mía) |
| **Retención** | 1 - churn | [S2] define la retención del período t como la proporción de clientes activos al final del período t-1 que siguen activos al final del t |
| **Retención acumulada (función de supervivencia)** | S(t) = r1 x r2 x ... x rt | [S2], ecuación 1 |
| **Churn de ingresos** | Ingreso recurrente perdido por bajas y rebajas / ingreso recurrente al inicio | [S9] dice que el churn también se mide en ingreso recurrente perdido, sin dar fórmula |
| **GRR** (retención bruta de ingresos) | MRR de diciembre de los clientes que ya estaban en diciembre del año anterior, **sin** ventas adicionales ni aumentos de precio, / MRR total de diciembre del año anterior. Nunca pasa de 100% | [S7] |
| **NRR** (retención neta de ingresos) | Igual que GRR pero **incluyendo** ventas adicionales (upsell, cross-sell) y aumentos de precio. Puede ser mayor a 100% | [S7] |
| **Bajas voluntarias e involuntarias** | Voluntaria: el cliente decide irse. Involuntaria: se va porque falló el cobro (tarjeta vencida, sin fondos, bloqueo). | Concepto y cifras de Stripe vía Churnkey [S8], fuente secundaria |

**Retención por cohorte y por qué no se puede promediar.** Dos papers de nivel A advierten que usar una sola tasa de retención para todos los clientes engaña:

- [S2] muestra que la retención de un grupo de clientes **sube** con el tiempo de antigüedad (los que se van rápido salen primero y quedan los más fieles). Los autores explican que no es que cada cliente se vuelva más leal: es un efecto de mezcla ("sorting effect") en una población heterogénea. Con su modelo "shifted-beta-geometric" ajustan dos segmentos y predicen la supervivencia al año 12 con un error de 4% y 2%, mientras que las regresiones simples (lineal, cuadrática, exponencial) fallan por entre 30% y 92% [S2].
- [S3] muestra, con un ejemplo, que calcular el valor de la base de clientes con **una sola tasa de retención** (69,1%) da una cifra que **subestima el valor en un 38%** frente a modelar que la retención sube con la antigüedad. En su ejemplo hay un 1/3 de clientes con retención anual de 0,9 y 2/3 con 0,5; con el tiempo, el grupo de 0,5 desaparece y la retención del conjunto converge a 0,9 [S3].

Fórmula del modelo [S2] (la ecuación 8 del paper; el texto que extraje del PDF perdió los símbolos griegos, así que la reconstrucción es mía y debe verificarse antes de implementarla): retención en el período t = (beta + t - 1) / (alfa + beta + t - 1). Chequeo que sí pude hacer con números del paper: con alfa = 0,688 y beta = 3,806 (segmento "High End"), el churn medio alfa/(alfa+beta) da 0,153, y el paper reporta 0,15; con alfa = 0,704 y beta = 1,182 (segmento "Regular") da 0,373, y el paper reporta 0,37 [S2]. El paper aclara que el modelo es para contratos con renovación en fechas fijas (tiempo discreto) donde la baja se observa [S2].

### 2.3 Indicadores de adquisición y rentabilidad por cliente

| Indicador | Fórmula | Fuente |
|---|---|---|
| **CAC** | Gasto total de ventas y marketing del período / clientes nuevos del período | [S9] |
| **LTV simple** | ARPU / churn (la fuente lo da como atajo, junto a "valor del cliente x vida media") | [S9] |
| **LTV con margen y descuento (infinito horizonte)** | Valor de un cliente = suma de margen_t x r^t / (1+i)^t. Con margen constante m, retención r por período y tasa de descuento i, y el primer margen cobrado al cierre del primer período, queda LV = m x r / (1 + i - r) | La forma general es la ecuación 2 de [S1]. La cerrada es mi álgebra, y coincide con el ejemplo de [S1]: margen 100, retención 80%, descuento 12% da LV = 100 x 0,8 / 0,32 = 250 |
| **Valor de la base de clientes** | Suma sobre todas las cohortes k de [n_k x valor del cliente descontado - n_k x c_k] (n = clientes captados, c = costo de captación por cliente) | [S1], ecuación 7 |
| **LTV:CAC** | LTV / CAC | Se usa en la práctica; la página [S9] solo dice que hay que definir la relación "ideal" y no da valor. No hay benchmark verificado aquí |
| **Período de recuperación del CAC (CAC payback)** | CAC / (ARPU x margen bruto mensual) | Fórmula de práctica común. **No la confirmé en ninguna fuente abierta**; ver sección 9 |

Advertencia de [S1] sobre el atajo "retención -> vida esperada -> valor presente a esa vida": con margen anual de 100, retención de 80% y descuento de 12%, la fórmula correcta da 250, mientras que el atajo (decir que se queda 5 años y descontar 5 pagos) da unos 360, una sobreestimación de cerca de 44% [S1, nota 3].

### 2.4 Qué tan sensible es el valor a cada palanca

Resultado empírico de [S1], con datos públicos de cinco empresas (Capital One, Amazon, Ameritrade, eBay y E*Trade):

- Mejorar la **retención** en 1% mejora el valor del cliente entre 2,45% y 6,75% (el resumen dice 3 a 7).
- Mejorar el **margen** en 1% mejora el valor en alrededor de 1%.
- Bajar el **costo de adquisición** en 1% mejora el valor entre 0,02% y 0,32%.
- Bajar la **tasa de descuento** en 1% mejora el valor entre 0,5% y 1,2%; es decir, la retención pesa casi cinco veces más que la tasa de descuento.

Dos advertencias del propio paper [S1]: (a) no incluyen el costo de mejorar la retención, así que no se puede concluir que siempre convenga gastar para retener; (b) los autores citan un modelo teórico según el cual no conviene eliminar por completo las bajas (con 100% de lealtad, quizás estás cobrando de menos). Además, [S3] concluye que las elasticidades de retención que se reportan habitualmente **subestiman** el efecto real de subir la retención subyacente cuando hay clientes heterogéneos.

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Resumen.** El VAN sigue siendo la base (hay inversión inicial, flujos futuros y descuento), pero lo que se descuenta no puede ser un "ingreso anual plano". Se debe descontar el flujo que sale de **cohortes de clientes que se van gastando**. Y se complementa con indicadores unitarios (LTV:CAC, recuperación del CAC, retención).

**Por qué el VAN con ingresos planos falla aquí:**

1. **El ingreso es una función de la retención.** Un punto de baja mensual de más, sostenido, cambia el valor de toda la base futura. Los números de [S1] (retención pesa 3 a 7 veces lo que pesa el margen) lo muestran. Si el estudiante pone "ingresos = suscriptores x cuota" con suscriptores constantes, el VAN no tiene sensibilidad a lo único que importa.
2. **La inversión en clientes se paga por adelantado.** El CAC sale en el mes 0 de cada cliente y se recupera en varios meses de cuotas. Un proyecto que crece rápido tendrá caja negativa aunque cada cliente sea rentable (interpretación mía, coherente con [S1], que trata el costo de adquirir como una inversión en cada cohorte). [S4] hace la distinción útil: perder plata porque se gasta en conseguir usuarios nuevos es mejor señal que perder plata porque atender a los usuarios actuales ya cuesta más de lo que pagan.
3. **El valor de la empresa al cierre del horizonte.** Si el alumno corta a 5 años, la base de clientes que queda tiene valor. [S3] muestra que ignorar la dinámica de retención subestima ese valor residual; [S1] construye el valor de la empresa con horizonte infinito y explica que el atajo de un horizonte finito basado en la vida esperada sobreestima el valor. Para el simulador: decidir de forma explícita si el valor residual entra en el VAN y cómo se calcula (interpretación mía).
4. **La TIR** puede ser engañosa (flujos negativos al inicio y después positivos grandes, o valor residual que domina). Esto es práctica general de evaluación de proyectos, no lo respalda ninguna fuente de las que abrí; ver sección 9.

**Qué agregar al análisis:**

| Complemento | Qué responde | Fuente |
|---|---|---|
| VAN por cohorte (flujo de cada grupo de altas, con su retención) | Cuánto vale hoy cada tanda de clientes que consigo | [S1] |
| LTV:CAC y recuperación del CAC | Si cada cliente que traigo se paga solo y en cuánto tiempo | Práctica; sin benchmark verificado |
| GRR y NRR | Si la base existente crece o se achica sin contar clientes nuevos | [S7] |
| Sensibilidad a la retención, al margen y al CAC | Cuál palanca importa más | [S1] |
| Punto mínimo de caja | Cuánto capital de trabajo hace falta antes de que el flujo se vuelva positivo | Interpretación mía; las plantillas del simulador ya traen un colchón de caja |
| Valoración "por usuario" (alternativa a la valoración agregada) | Para negocios de usuarios, valorar a cada usuario actual y a los futuros y restar el "arrastre corporativo" | [S4] |

**Lo que no se debe hacer:** compararse con un benchmark ajeno sin mirar el contexto (por ejemplo, los GRR de 90% de [S7] son de software B2B para empresas, con contratos de miles de dólares; un servicio de consumo en Bolivia puede tener churn mensual mucho mayor).

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Nota de método: la lista mezcla lo que dicen las fuentes (marcado) con lo que es práctica común o interpretación mía (sin marca). No encontré un estudio sobre errores de estudiantes bolivianos en proyectos de suscripción.

**Errores de cálculo (estudiantes)**

1. **Una sola tasa de churn para todos los clientes y todos los meses.** [S2] y [S3] muestran que esto sesga el valor (en el ejemplo de [S3], un 38% hacia abajo). En un simulador sencillo, el error típico contrario es que el estudiante deja el churn en 0 o lo "promedia" en un valor bajo.
2. **Confundir MRR con caja.** Contar el plan anual completo como ingreso del mes, o contar el MRR sin ver que algunos clientes no pagaron (bajas involuntarias).
3. **LTV = ARPU / churn sin margen ni descuento.** [S9] da ese atajo; [S1] lo reemplaza por margen y descuento. Usar el ingreso en lugar del margen sobrestima el valor.
4. **Usar vida esperada fija.** Pensar "se queda 5 años porque el churn anual es 20%" y descontar 5 pagos: sobreestima en 44% en el ejemplo de [S1].
5. **Olvidar el costo de atender a cada suscriptor** (soporte, servidores, comisiones de cobro). [S4] marca que perder dinero por atender a los usuarios actuales es la señal de mal modelo.
6. **No incluir el CAC como inversión.** Poner el marketing como gasto fijo mensual sin relacionarlo con las altas.
7. **Crecimiento lineal de usuarios** sin vincularlo al gasto de adquisición ni a la saturación del mercado (la saturación es interpretación mía).
8. **Calcular el churn mal:** dividir por el total final de clientes (que ya incluye altas nuevas) en vez de por los clientes del inicio.

**Errores de emprendedores**

1. **Hablar solo de usuarios y no de resultados.** [S4] lista entre las señales de un mal negocio de usuarios: todo el discurso es "cuántos usuarios", opacidad sobre los datos del usuario, un modelo diseñado para perder plata sin camino a la rentabilidad. El caso que usa de advertencia es MoviePass (suscripción "demasiado buena para ser cierta").
2. **Crecer con descuentos que atraen a quienes se van rápido.** [S4] y [S1] señalan que algunos programas de adquisición (por ejemplo, promociones de precio) atraen clientes con baja retención.
3. **Intervenir en clientes en riesgo sin probar el efecto.** [S5] encontró en un experimento de campo con una empresa de telefonía que recomendar planes más baratos de forma proactiva **subió** el churn (10% frente a 6% del grupo de control, en tres meses).
4. **Subir precios sin pensar el mensaje.** [S10] (ver situación 4) midió que la justificación importa.
5. **No medir las bajas involuntarias.** Según datos de Stripe citados por [S8], en SaaS los cobros fallidos explican alrededor del 22% del churn total; es fuente secundaria, de EE. UU., pero muestra que no es un detalle menor.
6. **Dar la prueba gratis sin entender qué hace.** [S6] encontró en un experimento con una plataforma de edición de imágenes que pasar de 3 a 7 días de prueba cambió la adopción y la conversión demorada (ver situación 6).
7. **Medir solo logos y no ingresos.** Perder clientes chicos y ganar uno grande da churn de logos alto y NRR alto (interpretación mía; las definiciones de GRR/NRR de [S7] son por dólares, no por clientes).
8. **Depender de un costo en dólares con ingreso en bolivianos** sin cobertura (situación 3). Es un riesgo propio del contexto boliviano actual.

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **(fuente)** o **(estimación)**); decisiones posibles con ventajas y costos; qué aprende el alumno.

Las magnitudes de las fuentes vienen de otros países y sectores. Se usan como orden de magnitud. Las marcadas "estimación" son mías y conviene calibrarlas antes de implementarlas.

---

### Situación 1. Oleada de altas por temporada y abandono en los primeros meses

**Qué pasa.** Por una fecha del calendario (inicio del año académico, enero, un nuevo producto o una promoción de feriado) entran muchos clientes de golpe. Una parte importante nunca usa el servicio de verdad y se da de baja en los primeros meses. En Bolivia, el calendario escolar (febrero) y los gastos de fin de año (aguinaldo en diciembre) concentran compras (interpretación mía; no busqué fuentes de estacionalidad boliviana para suscripciones).

**Variables que mueve.**
- Altas del mes: sube mucho (estimación: +50% a +150% sobre el mes normal, depende del servicio).
- Churn de la cohorte nueva en los meses 2 a 4: sube respecto de la cohorte normal (estimación: de 2 a 3 veces el churn de clientes antiguos). Dirección respaldada por [S2] y [S3], que muestran que los clientes recién llegados tienen más churn que los antiguos; la magnitud es estimación.
- Costos de soporte y de infraestructura: sube un mes y se mantiene si no se ajusta.
- Reputación: sube si el servicio aguanta, baja si el soporte se desborda.

**Decisiones del alumno.**
1. *Aprovechar la ola con más gasto de captación (pauta pagada, comisiones a vendedores).* Ventaja: llegas a más clientes mientras la demanda está alta y el costo por click suele ser más eficiente cuando el mercado ya está interesado (estimación). Costo: el CAC sube y una parte importante de esos clientes se va antes de recuperar el CAC; la caja se tensa los primeros meses.
2. *Capturar solo con canales orgánicos y referidos, sin pauta extra.* Ventaja: los clientes que llegan por recomendación tienden a quedarse más (hipótesis de práctica; no la confirmé en las fuentes abiertas). Costo: pierdes parte de la ola y un competidor se queda con ella.
3. *Invertir en onboarding (guía de primeros pasos, llamada de bienvenida, contenido de uso).* Ventaja: reduce el churn de los meses 2 a 4 (estimación). Costo: gasto fijo adicional y trabajo de equipo, con retorno incierto; [S1] aclara que su análisis no incluye el costo de mejorar retención.
4. *Cobrar un año adelantado a quienes entran en la ola, con descuento.* Ventaja: caja inmediata y fija a ese cliente por 12 meses. Costo: descuento permanente en el margen y obligación de servir al cliente todo el año (ver situación 8).

**Qué aprende.** Que no todo cliente nuevo vale lo mismo, que el churn depende de la antigüedad y que captar más no siempre es hacer crecer el valor.

---

### Situación 2. Cobros fallidos (bajas involuntarias)

**Qué pasa.** Una parte de los clientes se "cae" no porque quiera, sino porque su pago falla: tarjeta vencida, tope mensual de la tarjeta, QR no pagado, débito automático rechazado. En Bolivia, desde el 23 de agosto de 2024 la ASFI puso controles y límites a operaciones con tarjetas en dólares, y desde marzo de 2025 se eliminó la comisión solo hasta US$100 en operaciones con el exterior; las notas dicen que esos topes no alcanzan para pagar streaming u otros servicios por internet desde Bolivia, y que el consumo en dólares con tarjeta cayó al menos 40% según ATC Red Enlace [S12].

**Variables que mueve.**
- Tasa de falla de cobro: sube (estimación: +2 a +6 puntos de los cobros del mes, mayor si el cobro es en moneda extranjera). Referencia: en SaaS, el churn involuntario es de un 22% del churn total, y cerca del 8% anual de los clientes, según Stripe citado por [S8]; en bienes digitales, 29% del churn total.
- Bajas involuntarias: sube.
- Recuperación: con reintentos inteligentes, la recuperación de los pagos fallidos fue de 51% en datos de Stripe citados por [S8]; con reintentos más avisos por correo y bloqueo del acceso hasta actualizar el medio de pago, se recuperó 70% de las bajas involuntarias detectadas [S8]. Son datos de EE. UU.; en Bolivia no hay equivalente verificado.
- Caja: baja el mes del fallo; el efecto se acumula.

**Decisiones del alumno.**
1. *Cambiar el medio de cobro principal a QR/transferencia en bolivianos.* Ventaja: elimina el problema del tope en dólares y los clientes pagan en su moneda. Costo: el QR requiere acción activa cada mes (no es automático), por lo que cae la tasa de cobro; hay que perseguir a quien no paga.
2. *Invertir en un sistema de cobro con reintentos, avisos y recordatorios.* Ventaja: recupera una parte importante de los fallos [S8]. Costo: costo de desarrollo o de la plataforma de cobro, y comisión por transacción (estimación: 3% a 6%).
3. *Ofrecer descuento por pago anual adelantado para evitar 12 cobros.* Ventaja: un solo evento de cobro por año, y caja por adelantado. Costo: descuento, y si el cliente se arrepiente quedan reclamos de devolución.
4. *No hacer nada y absorber la pérdida.* Ventaja: cero costo. Costo: el churn sube sin que nadie lo vea; el alumno que mira solo "bajas" asume que son decisiones del cliente.

**Qué aprende.** A separar bajas voluntarias de involuntarias y que parte del churn es un problema de cobro, no de producto.

---

### Situación 3. El costo en dólares sube o se vuelve difícil de pagar

**Qué pasa.** El proyecto paga en dólares servidores (nube), licencias de software, herramientas o contenido, y cobra en bolivianos. La escasez de dólares y las restricciones de pago al exterior [S12] hacen que pagar estos servicios sea más caro o lento, y el tipo de cambio efectivo puede subir. El dato de los topes es de [S12]; el efecto sobre el costo de un proyecto concreto no lo encontré documentado (sección 9).

**Variables que mueve.**
- Costos variables y fijos en moneda extranjera: suben (estimación: +10% a +40% en costo efectivo en bolivianos, según se compre dólares en el mercado oficial o paralelo; no tengo fuente del diferencial vigente).
- Margen bruto: baja.
- Riesgo de interrupción del servicio si no se logra pagar al proveedor: sube.

**Decisiones del alumno.**
1. *Subir el precio en bolivianos.* Ventaja: protege el margen. Costo: churn mayor (ver situación 4) y puede abrir espacio para competidores locales.
2. *Cambiar a proveedores locales o más baratos.* Ventaja: pagas en bolivianos, sin tope. Costo: migrar cuesta tiempo y dinero, y la calidad o la escala pueden ser menores.
3. *Cobrar una parte del precio en dólares (clientes empresa que tienen dólares).* Ventaja: cobertura natural. Costo: solo sirve con algunos clientes; complejidad administrativa y de cumplimiento (no verifiqué la normativa boliviana al respecto).
4. *Absorber el costo para no perder clientes.* Ventaja: no hay churn adicional. Costo: el margen se erosiona; si el costo sigue subiendo, el proyecto pierde dinero por cliente.

**Qué aprende.** Que el margen de una suscripción depende del costo variable por cliente, y que el riesgo de moneda es real en el contexto boliviano actual.

---

### Situación 4. Subir el precio de la cuota

**Qué pasa.** Es la palanca más rápida para mejorar el margen: [S1] estima que el margen pesa 1% de valor por cada 1% de mejora. Pero el cliente puede irse. Un experimento de campo con una empresa canadiense de almacenamiento (15 grupos, 1.600 clientes, 10 meses) probó avisos de aumento de 5% o 15% con distintas justificaciones: las justificaciones de costos o de calidad rindieron igual que no dar explicación; la justificación basada en el mercado (menos competidores, mayor demanda) redujo las bajas en 29,5% frente a no explicar [S10].

**Variables que mueve.**
- ARPU: sube según el aumento (por ejemplo, +5% a +15%, que son los valores de [S10]).
- Churn de ese mes y los siguientes: sube. La magnitud depende de las alternativas disponibles; [S10] propone que el mecanismo es cuántas alternativas ve el cliente. Magnitud de churn adicional para el simulador: estimación (+1 a +4 puntos mensuales, mayor si hay sustitutos baratos o piratas).
- Reputación: baja ligeramente (estimación).
- NRR: sube si la baja es menor que el aumento.

**Decisiones del alumno.**
1. *Subir 5% con mensaje basado en el mercado ("la demanda subió").* Ventaja: según [S10], menos bajas; el mensaje es honesto solo si es verdad (los autores advierten sobre la confianza). Costo: si no es verdad, daña la confianza; si hay sustitutos baratos, igual pierdes clientes.
2. *Subir 15% de golpe.* Ventaja: mejora fuerte del margen. Costo: más bajas; el mensaje de costos no ayuda según [S10].
3. *Subir solo a los clientes nuevos y mantener el precio a los antiguos.* Ventaja: casi sin churn. Costo: el margen mejora lentamente y puedes quedar con dos listas de precios.
4. *No subir y compensar con recorte de costos.* Ventaja: sin riesgo de churn adicional. Costo: recortar costos puede bajar la calidad (y la reputación).

**Qué aprende.** Que un pequeño aumento de precio tiene un efecto distinto según cómo se comunique y qué alternativas tiene el cliente, y que la "mejor" opción depende de la competencia.

---

### Situación 5. Promoción agresiva de captación (primer mes casi gratis, descuento fuerte)

**Qué pasa.** El proyecto lanza una promoción para crecer rápido. Atrae muchos clientes pero [S4] advierte sobre los modelos de usuarios que crecen vendiendo por debajo del costo (MoviePass), y [S1] señala que ciertas promociones de precio atraen clientes con baja retención. En Bolivia el cliente ya se acostumbró a precios muy bajos en servicios digitales de reventa (por ejemplo, planes de streaming desde Bs 10, según una nota de 2021 [S13]), lo que condiciona su disposición a pagar.

**Variables que mueve.**
- Altas: suben mucho en el mes (estimación: +100% a +300%).
- ARPU de la cohorte: baja (por el descuento).
- Churn al terminar la promoción: alto (estimación: 30% a 60% de la cohorte se va al vencer el descuento).
- CAC efectivo: sube si se cuenta el descuento como costo de adquisición.
- Caja: baja en el corto plazo.

**Decisiones del alumno.**
1. *Promoción de 3 meses a mitad de precio.* Ventaja: llena la base rápido, puedes mostrar crecimiento. Costo: muchos se van al volver al precio normal; la caja sufre.
2. *Promoción solo para plan anual.* Ventaja: caja adelantada y compromiso de 12 meses. Costo: menos clientes entran; requiere confianza del cliente.
3. *Sin promoción, apostar a una prueba gratis corta (ver situación 6).* Ventaja: el cliente conoce el producto antes de pagar. Costo: crecimiento más lento.
4. *Programa de referidos (el cliente actual recibe un mes gratis por cada nuevo).* Ventaja: costo pagado solo si hay alta efectiva. Costo: puede traer clientes del mismo perfil de bajo uso; requiere control de abusos.

**Qué aprende.** Que el crecimiento comprado con descuento tiene menor valor por cliente y que hay que medir la retención de cada cohorte, no solo las altas.

---

### Situación 6. Diseño de la prueba gratis

**Qué pasa.** El proyecto debe decidir cuánto dura la prueba gratis (o si hay un plan gratuito limitado). Un experimento con 680.588 usuarios de una plataforma SaaS de edición de imágenes comparó 3 contra 7 días: la adopción de la prueba subió de 0,856% a 0,951%; la conversión inmediata no cambió de forma significativa (0,224% contra 0,241%); la conversión demorada subió de 0,144% a 0,205%; y la conversión total pasó de 0,368% a 0,445% [S6]. Los autores advierten que los efectos son sobre tasas muy bajas, vienen de una sola empresa y solo se probaron pruebas cortas [S6]. En la bibliografía hay modelos teóricos sobre cuándo conviene regalar el producto (freemium o muestras gratis), que no pude leer completos (sección 9).

**Variables que mueve.**
- Usuarios en prueba: suben con una prueba más larga (+11% en [S6] al pasar de 3 a 7 días).
- Conversión total: sube (+21% relativo en [S6]), con efecto demorado.
- Costo de atender usuarios gratis: sube proporcional a la duración y volumen (estimación).
- Calidad de la cohorte: el estudio informa más suscripciones repetidas y anuales en el grupo de 7 días [S6].

**Decisiones del alumno.**
1. *Prueba corta (3 a 7 días).* Ventaja: menor costo de atender usuarios que no pagan. Costo: algunos usuarios no alcanzan a ver el valor.
2. *Prueba larga (30 días).* Ventaja: más usuarios llegan a conocer el producto. Costo: la fuente no probó pruebas largas; costo de infraestructura y soporte para usuarios gratis, y el cliente que nunca paga ocupa recursos.
3. *Plan gratuito limitado permanente (freemium).* Ventaja: base grande de usuarios y posibilidad de venta cruzada a los activos. Costo: puede canibalizar al plan pago y el costo de servir usuarios gratis no se paga con nada.
4. *Sin prueba, cobro desde el primer día con garantía de devolución.* Ventaja: solo entran clientes comprometidos y se genera caja desde el primer día. Costo: la conversión de visitantes es menor; las devoluciones cuestan.

**Qué aprende.** Que la prueba gratis es una inversión con retorno incierto, que los efectos aparecen con retraso y que no hay una duración "correcta" para todos los productos.

---

### Situación 7. Sustitutos baratos: reventa, cuentas compartidas o copias

**Qué pasa.** Aparecen vendedores informales que ofrecen el mismo tipo de servicio a una fracción del precio. Una nota de 2021 (Página Siete, vía DPL News) describe en Bolivia a revendedores de cuentas de streaming con pago por QR y activación inmediata: Netflix a Bs 28,99 por un mes y Bs 239,9 al año, combos en redes sociales a Bs 35 y Bs 45, y paquetes desde Bs 10 [S13]. Un analista citado por la nota dice que probablemente es un comprador mayorista de cuentas que las distribuye [S13]. No evaluó si es legal ni cuánto dura ese modelo. Esta situación sirve para cualquier suscripción con acceso copiable.

**Variables que mueve.**
- Demanda sensible al precio: más cuando el sustituto es barato.
- Altas: bajan (estimación: -10% a -30% en el segmento sensible al precio).
- Churn: sube (estimación: +1 a +3 puntos mensuales en ese segmento).
- Elasticidad a la subida de precio: aumenta.

**Decisiones del alumno.**
1. *Bajar el precio o crear un plan económico.* Ventaja: compite en precio y frena la fuga. Costo: erosiona el ARPU de toda la base si los clientes migran al plan barato.
2. *Reforzar el producto (funciones solo disponibles para cuenta oficial, soporte, garantías).* Ventaja: diferencia que el sustituto no puede copiar. Costo: inversión en desarrollo con retorno incierto.
3. *Acciones contra la reventa (bloqueo de cuentas compartidas, aviso legal).* Ventaja: protege el ingreso. Costo: algunos clientes legítimos se molestan; hay gasto en control y reputación.
4. *Aceptar al revendedor como canal (precios mayoristas).* Ventaja: nuevo canal, ventas a granel. Costo: pierdes el vínculo con el cliente final y el margen es menor.

**Qué aprende.** Que el precio de una suscripción se compara con sustitutos informales, y que no siempre conviene bajar el precio.

---

### Situación 8. Plan anual con pago por adelantado

**Qué pasa.** Se puede ofrecer un plan anual con descuento. La caja entra al inicio, pero el servicio se debe durante 12 meses. Platzi, por ejemplo, ofrecía una suscripción de US$ 29 al mes o US$ 299 al año (2019) [S14]; el descuento anual equivale a unos 14% (cálculo mío: 29 x 12 = 348 contra 299). La contabilidad reconoce el ingreso mes a mes, no al cobrar (práctica contable general; no abrí la norma, sección 9).

**Variables que mueve.**
- Caja: sube el mes del cobro.
- Churn del plan anual: casi nulo durante el año, concentrado en el mes de renovación.
- ARPU: baja por el descuento.
- Ingreso diferido (obligación con el cliente): sube.

**Decisiones del alumno.**
1. *Ofrecer anual con descuento de 15% a 20%.* Ventaja: mejora la caja y fija al cliente. Costo: menor ingreso por cliente; si cierras o fallas, debes devolver.
2. *Anual solo para clientes empresa.* Ventaja: contratos más estables. Costo: ciclo de venta largo.
3. *Gastar el adelanto en crecimiento (publicidad, contratar).* Ventaja: crece más rápido. Costo: si ese dinero se gasta y llegan reclamos o el servicio falla, no hay con qué devolver.
4. *Reservar el adelanto como colchón y reconocerlo mes a mes.* Ventaja: seguridad frente a imprevistos. Costo: crecimiento más lento.

**Qué aprende.** Que caja e ingreso no son lo mismo y que el pago adelantado es una deuda de servicio.

---

### Situación 9. Caída del servicio, corte de internet o incidente de seguridad

**Qué pasa.** El servicio deja de funcionar durante horas o días, por un fallo técnico, un corte masivo de conectividad (en Bolivia, los bloqueos y conflictos sociales pueden afectar la logística y servicios, interpretación mía; no busqué fuentes de cortes de internet) o una filtración de datos. Los clientes de un servicio de suscripción esperan disponibilidad continua.

**Variables que mueve.**
- Churn del mes: sube (estimación: +1 a +5 puntos según la gravedad).
- Reputación: baja (estimación: -5 a -20 puntos de un indicador de 100).
- Costos: sube el costo de recuperación y compensaciones.
- Reembolsos: sube.

**Decisiones del alumno.**
1. *Compensar a todos los clientes (mes gratis o crédito).* Ventaja: protege la relación. Costo: pierdes un mes de ingresos de toda la base.
2. *Compensar solo a quienes reclamen.* Ventaja: más barato. Costo: la gente que no reclama y se va en silencio.
3. *Invertir en redundancia y monitoreo (servidores de respaldo, alertas).* Ventaja: reduce la probabilidad de futuras caídas. Costo: gasto fijo alto y beneficio invisible mientras no pasa nada.
4. *Comunicar con transparencia lo ocurrido y no compensar.* Ventaja: ahorra costos. Costo: algunos clientes se van igual; la confianza depende de la gravedad.

**Qué aprende.** Que el valor de una suscripción es la confianza en la continuidad, y que prevenir cuesta antes de que haya un problema.

---

### Situación 10. Cliente grande que pide condiciones especiales (SaaS B2B)

**Qué pasa.** Una empresa que representa una parte importante del ingreso ofrece quedarse o ampliarse, pero pide descuento, una función a medida o un contrato con condiciones de salida. Aceptar da ingresos y estabilidad; también concentra el riesgo.

**Variables que mueve.**
- MRR: sube con el contrato (estimación: +10% a +30% del MRR de un proyecto chico).
- Concentración: sube (el cliente pasa a ser una parte grande del ingreso).
- Costos de desarrollo a medida: sube.
- Margen: baja si hay descuento.

**Decisiones del alumno.**
1. *Aceptar con descuento y la función a medida.* Ventaja: ingreso inmediato y estable. Costo: dependencia de un cliente; si se va, el MRR cae de golpe; el desarrollo a medida distrae al equipo.
2. *Aceptar solo con contrato anual y sin función a medida.* Ventaja: ingreso previsible sin desviar el producto. Costo: puede perder la venta.
3. *Rechazar y priorizar la base de clientes chicos.* Ventaja: diversifica el riesgo. Costo: pierdes un ingreso grande.
4. *Convertir la función a medida en parte del producto estándar y cobrarla a todos.* Ventaja: aprovecha el desarrollo para toda la base. Costo: tiempo de desarrollo y riesgo de que no interese a los demás.

**Qué aprende.** Que un solo cliente grande puede mejorar el MRR y a la vez aumentar el riesgo, y que hay que decidir qué producto se construye.

---

### Situación 11. Cambio normativo: facturación electrónica y obligaciones tributarias

**Qué pasa.** El SIN exige facturación electrónica de forma escalonada desde noviembre de 2021 y prorrogó plazos para ciertos grupos hasta el 30/9/2026 (nota de `00-taxonomia-tipos.md` basada en EDICOM; no la reabrí en esta tarea). Para una suscripción, cada cobro mensual es una factura. Al mismo tiempo, el cambio obliga a muchas pymes a buscar un software que emita facturas, lo que es oportunidad para un SaaS contable, como el caso de Siigo/Alegra en Colombia (ver sección 7). La existencia de un impuesto específico a servicios digitales extranjeros en Bolivia no la verifiqué (sección 9).

**Variables que mueve.**
- Costo de cumplimiento: sube (desarrollo de la emisión de facturas por cobro; estimación).
- Demanda (si el producto ayuda a cumplir): sube (estimación: +10% a +30% en altas durante el período de plazo).
- Riesgo de sanción por no cumplir: sube.

**Decisiones del alumno.**
1. *Integrar la facturación electrónica en el producto (como función).* Ventaja: cumples y vendes la solución como valor. Costo: desarrollo y mantenimiento por cambios de normas.
2. *Usar un proveedor externo de facturación.* Ventaja: rápido y menor riesgo. Costo: comisión por factura (estimación) que reduce el margen en suscripciones baratas.
3. *Postergar hasta el último plazo.* Ventaja: ahorras costo ahora. Costo: riesgo de sanción y de saturación del mercado de proveedores cerca del plazo.
4. *Ofrecer un plan "cumplimiento incluido" a más precio.* Ventaja: nueva fuente de ingreso. Costo: mayor responsabilidad legal y soporte.

**Qué aprende.** Que una norma puede ser costo y oportunidad a la vez, y que en suscripciones el costo de cumplimiento se multiplica por cada cobro recurrente.

---

### Situación 12. Oportunidad de venta adicional (upsell) y plan premium

**Qué pasa.** El proyecto puede lanzar un plan superior o un módulo adicional. Una base ya adquirida es más rentable de hacer crecer que traer nuevos clientes: [S4] sostiene que un modelo que puede crecer los flujos de los usuarios existentes vale más, ceteris paribus, que uno que depende de sumar usuarios nuevos. [S7] define NRR justamente como la retención que incluye ventas adicionales.

**Variables que mueve.**
- ARPU: sube (estimación: +10% a +25% si 20% de la base compra el módulo).
- NRR: sube.
- Costo de desarrollo y soporte: sube.
- Canibalización: parte de la base baja de plan (estimación).

**Decisiones del alumno.**
1. *Lanzar un plan premium con funciones nuevas.* Ventaja: aumenta el ARPU sin CAC. Costo: desarrollo, y algunos clientes se quedan en el plan básico.
2. *Recortar funciones del plan básico para empujar al premium.* Ventaja: mueve rápido a clientes al plan caro. Costo: [S5] sugiere que empujar cambios puede aumentar el churn; clientes molestos.
3. *Vender módulos por separado.* Ventaja: cada cliente paga solo lo que usa. Costo: complejidad de precios y de cobro.
4. *No ampliar; invertir en retención del plan actual.* Ventaja: base más estable. Costo: no aprovechas el potencial de expansión.

**Qué aprende.** Que el crecimiento puede venir de la base existente y que empujar a los clientes a cambiar puede salir mal [S5].

---

### Situación 13. Alianza de distribución (banco, telefónica o plataforma de pagos)

**Qué pasa.** Un tercero propone incluir tu suscripción en su oferta: por ejemplo, cobro en la factura del celular o paquete con un servicio financiero. El ejemplo de Bolivia Streaming Service (que vende planes por una app de terceros, Yaigo, con más de 3.500 clientes según la nota de 2021 [S13]) muestra este tipo de canal. La alianza trae volumen y simplifica el cobro, pero el socio se queda con parte del margen.

**Variables que mueve.**
- Altas: sube (estimación: +20% a +100%).
- CAC: baja.
- ARPU neto: baja por la comisión del socio (estimación: -15% a -40%).
- Dependencia del canal: sube.
- Churn: puede bajar si el cobro es automático en la factura (estimación).

**Decisiones del alumno.**
1. *Aceptar con comisión alta y exclusividad.* Ventaja: volumen inmediato. Costo: menor margen y dependencia; si el socio cambia las condiciones, pierdes el canal.
2. *Aceptar sin exclusividad y con comisión negociada.* Ventaja: puedes buscar otros socios. Costo: el socio dedica menos esfuerzo a promocionarte.
3. *Rechazar y construir canales propios.* Ventaja: conservas margen y relación con el cliente. Costo: crecimiento más lento y más CAC.
4. *Probar la alianza en piloto de tres meses.* Ventaja: aprendes sin comprometerte. Costo: el socio puede perder interés.

**Qué aprende.** A comparar canales por margen neto y dependencia, no solo por volumen.

---

### Situación 14. Campaña de retención proactiva

**Qué pasa.** Con datos de uso, detectas clientes que probablemente se darán de baja y puedes contactarlos con ofertas. En un experimento con una empresa de telefonía, ofrecer proactivamente planes más baratos subió el churn de 6% a 10% en tres meses, porque bajó la inercia del cliente y le hizo notar cuánto había pagado de más [S5].

**Variables que mueve.**
- Churn de los contactados: puede subir o bajar. En [S5] subió (de 6% a 10%); no es una regla universal (el propio paper habla de campañas dirigidas).
- Costo de la campaña: sube.
- ARPU de quienes cambian de plan: baja si se les ofrece un plan más barato.

**Decisiones del alumno.**
1. *Ofrecer descuento a los clientes con riesgo.* Ventaja: puede retener a algunos. Costo: enseñas al cliente que amenazar con irse da descuentos; baja el ARPU.
2. *Recomendar un plan más barato a quienes usan poco.* Ventaja: si les conviene, se quedan satisfechos. Costo: según [S5], puede aumentar el churn y bajar el ingreso.
3. *No contactar y dejar que sigan.* Ventaja: no activas la salida. Costo: pierdes la oportunidad de retener a quienes sí se quedarían con atención.
4. *Probar con un grupo pequeño y comparar con un grupo de control.* Ventaja: mide el efecto real, como en [S5]. Costo: tarda y requiere volumen.

**Qué aprende.** Que retener tiene costo y puede salir al revés, y que se debe medir contra un grupo de control.

---

### Situación 15. Los clientes más intensos erosionan el margen

**Qué pasa.** Algunos clientes usan el servicio mucho más que el promedio (más almacenamiento, más viajes al gimnasio, más contenido). Si el costo crece con el uso y la cuota es fija, el margen de ese segmento se achica. El caso extremo es MoviePass, que [S4] usa como ejemplo de un modelo de suscripción cuyo diseño era generar pérdidas.

**Variables que mueve.**
- Costo variable por suscriptor: sube (estimación: +20% a +50% del costo promedio si se llena el plan).
- Margen bruto: baja.
- Satisfacción de los usuarios intensos: baja si se les limita.

**Decisiones del alumno.**
1. *Poner un tope de uso o límites por plan.* Ventaja: protege el margen. Costo: algunos usuarios intensos (los más leales) se van.
2. *Subir el precio solo del plan de uso alto.* Ventaja: quien consume más paga más. Costo: complejidad y reclamos.
3. *Aceptar la pérdida y apostar a que crezcan los ingresos.* Ventaja: crecimiento y lealtad. Costo: [S4] advierte que perder dinero por atender a los usuarios actuales es la peor señal.
4. *Medir el uso por cliente y reasignar planes según el consumo.* Ventaja: decisiones con datos. Costo: inversión en medición.

**Qué aprende.** Que el costo de atender a cada suscriptor es parte del modelo y que una cuota fija con costo variable es un riesgo.

---

## 6. Variables propias que debería manejar el motor del simulador

Propuesta; actualmente el motor maneja caja, ingresos, costos y reputación. Estas variables se agregarían solo para los proyectos de este tipo. Las fórmulas son diseño mío; el fundamento teórico está en las fuentes citadas.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| **Suscriptores por cohorte (edad)** | Cuántos clientes quedan de cada grupo de altas, por antigüedad en meses | Cada mes, cada cohorte pierde una fracción igual a su churn según la edad. Al menos dos segmentos (inestable y estable), para que la retención del conjunto suba con el tiempo como en [S2] y [S3] |
| **Churn base por segmento** | Probabilidad de baja voluntaria por segmento | Parámetro del proyecto, modificado por eventos (precio, caídas, reputación, competencia) |
| **Altas del mes** | Clientes nuevos | Función del gasto de captación, la reputación, la estacionalidad y el tamaño del mercado restante (para que no crezca sin tope) |
| **CAC efectivo** | Costo por alta | Gasto de captación del mes / altas del mes; sube cuanto más se agota el mercado |
| **Tasa de falla de cobro** | Parte de los cobros que no se logra cobrar | Parámetro (por medio de pago y moneda); modificada por eventos; parte de las fallas se recupera con la política de cobro elegida |
| **Bajas involuntarias** | Clientes perdidos por cobro fallido | Cobros fallidos no recuperados |
| **ARPU y mix de planes** | Cuota promedio, por plan (mensual, anual, premium) | Promedio ponderado de la cuota; cambia con promociones, aumentos de precio y migraciones |
| **Ingreso diferido** | Cobro adelantado de planes anuales todavía no devengado | Sube al cobrar un plan anual; baja 1/12 por mes; si se cierra el proyecto, es una deuda |
| **MRR y ARR** | Ingreso recurrente mensual y anual | MRR = suma de cuotas de planes activos (anuales divididos en 12) |
| **GRR y NRR** | Retención bruta y neta de ingresos | Se calculan al cierre de cada 12 meses según [S7] |
| **Costo variable por suscriptor** | Soporte, servidores, comisión de cobro, contenido | Costo unitario x suscriptores; con una parte que crece con el uso (situación 15) |
| **Costos en moneda extranjera** | Parte de los costos pagados en dólares | Costo en bolivianos = costo en dólares x tipo de cambio efectivo; el tipo de cambio efectivo es un parámetro que cambia con eventos |
| **Disponibilidad del servicio / confianza** | Qué tan estable es el servicio | Baja con eventos de caída; se recupera lentamente; afecta el churn y las altas |
| **Concentración de ingresos** | Parte del MRR que viene del cliente más grande | Se calcula a partir de la lista de contratos; si la baja es total, cae de golpe |
| **Descuentos vigentes** | Cohortes con precio promocional y fecha de vencimiento | Al vencer el descuento, la cohorte sube a su cuota normal y suele tener un pico de bajas |
| **Usuarios en prueba gratis** | Personas que consumen recursos sin pagar | Entran por captación; cada mes una fracción convierte; el resto se va |

Salidas que el motor debería mostrar al alumno: MRR, churn por cohorte, LTV:CAC, recuperación del CAC y NRR/GRR, además de caja.

---

## 7. Ejemplos reales de Bolivia y Latinoamérica

Solo aparecen casos cuyo enlace abrí y leí. Lo que dice la nota va entre comillas o parafraseado; no es mi evaluación del negocio.

### Bolivia

1. **tuGerente (software para pymes, Santa Cruz).** Según una entrevista en eju.tv con su cofundador Javier Román Roig, funciona con suscripción, con distintos planes y acceso a diferentes módulos; cuentan con 500 empresas suscriptoras, operan en los 9 departamentos de Bolivia y tienen clientes iniciales en Perú; el proyecto empezó en 2017 y se formalizó en 2018. Roig dice que el cambio al modelo de suscripción responde a que el software anterior (de pago único) "no se podía modificar", y que la plataforma mejora todo el tiempo. El artículo no da precios, churn ni métodos de pago. La frase "de cada 5 clientes, 4 doblan sus ingresos en el primer año" es una afirmación de la empresa, sin metodología. Otra nota (Economy.com.bo, 2022) dice que tuGerente es una fintech/SaaS fundada en 2018 con US$ 80.000 levantados en pre-semilla y que "ofrece un modelo de suscripción"; esa nota habla de "más de 650 empresas" (la cifra cambia con la fecha de la nota). Enlaces: [eju.tv, entrevista](https://eju.tv/?p=2264959) y [Economy.com.bo, 2022](https://www.economy.com.bo/articulo/itecno/9-startups-bolivianas-reconocidas-internacionalmente-que-destacaron-2022/20221121123359008569.html).
2. **Bolivia Streaming Service (reventa de suscripciones de streaming).** Nota de Página Siete de noviembre de 2021 reproducida por DPL News: opera con la app Yaigo, con más de 3.500 clientes por ese medio; paquetes desde Bs 10; Netflix a Bs 28,99 por mes y Bs 239,9 al año; pagos por QR con activación inmediata; hay también revendedores informales con combos de Bs 35 a Bs 45. Un analista citado dice que probablemente es un comprador mayorista de cuentas. La nota no habla de churn ni de legalidad. Enlace: [DPL News](https://dplnews.com/?p=125972).
3. **Restricciones de pago con tarjeta en dólares (contexto del riesgo de cobro).** Nota de La Razón (7/9/2025, reproducida por eju.tv): controles de la ASFI desde el 23/8/2024; la Resolución ASFI 216/2025 (14/3/2025) elimina la comisión hasta US$ 100 en transacciones con el exterior; según ATC Red Enlace, el consumo en dólares con tarjetas cae al menos 40%; en 2024 hubo 99 millones de transacciones por US$ 2.821 millones, frente a US$ 3.217 millones en 2023. Los pagos por internet, incluido el streaming, son parte de lo más afectado. No es un caso de una suscripción, sino el contexto en el que cobran y pagan las suscripciones internacionales. Enlace: [eju.tv, 2025](https://eju.tv/2025/09/escasez-de-dolares-por-restricciones-consumo-con-tarjetas-cae-en-40/).

No encontré un caso boliviano con cifras verificables de churn, MRR o retención. Las cifras de clientes de tuGerente son de la propia empresa.

### Latinoamérica

4. **Platzi (educación online por suscripción; fundada por un colombiano y un guatemalteco).** EdSurge, 18/6/2019: suscripción de US$ 29 al mes o US$ 299 al año, pago en 20 monedas; fundada en 2013; unos 1.000.000 de estudiantes; más de 300 cursos; Serie A de US$ 6 millones (total US$ 8,3 millones); 117 empleados; negocio corporativo de alrededor del 20%. Dice que la finalización de cursos es de 50 a 70%, cifra autodeclarada; no informa churn ni renovación. Enlace: [EdSurge](https://edsurge.com/news/2019-06-18-platzi-raises-6-million-to-bring-more-online-education-to-latin-america).
5. **Siigo (software contable por suscripción, Colombia).** Perfil en Descubre: SaaS de contabilidad, facturación electrónica, nómina, inventarios y POS para pymes y contadores; "más de un millón de usuarios en la región" (un titular de septiembre de 2026 habla de 1,3 millones; la página no explica la diferencia); creció por adquisiciones regionales; respaldada por Accel-KKR. Es una muestra de cómo una norma de facturación electrónica empuja la demanda de un SaaS. El perfil no da churn. Enlace: [Descubre, Siigo](https://www.descubre.vc/siigo).
6. **Smart Fit (gimnasios por membresía, 15 países de Latinoamérica).** Forbes Perú, 14/3/2024: en 2023, 4,1 millones de clientes (+20%), 1.438 gimnasios, ingreso de US$ 853 millones y resultado neto de US$ 235 millones; opera gimnasios propios y franquiciados. La nota no trae datos de retención ni de precios. Enlace: [Forbes Perú](https://forbes.pe/negocios/2024-03-14/smart-fit-gano-us235-millones-en-latinoamerica-en-2023/).

---

## 8. Fuentes numeradas con nivel

**Leí y abrí 6 fuentes de nivel A** (más de las 4 pedidas). Aclaro el alcance de lectura de cada una. Todas se leyeron como PDF o página web; ninguna es libro (no confirmé ningún libro en un catálogo en esta tarea).

### Nivel A (papers, organismos, material universitario)

- **S1.** Sunil Gupta, Donald R. Lehmann y Jennifer Ames Stuart, "Valuing Customers", *Journal of Marketing Research*, vol. 41, n.º 1 (febrero de 2004), pp. 7-18. Leí la versión de trabajo de febrero de 2003 alojada por Columbia Business School (el PDF indica que es reimpresión con permiso de la AMA): resumen, modelo (ecuaciones 1 a 7), notas al pie y las secciones de elasticidades. https://business.columbia.edu/sites/default/files-efs/pubfiles/534/Valuing_Customers--JMR_2003.pdf
- **S2.** Peter S. Fader y Bruce G. S. Hardie, "How to Project Customer Retention", *Journal of Interactive Marketing*, vol. 21, n.º 1 (invierno de 2007), pp. 76-90. Leí la introducción, el ejemplo con regresiones, la descripción del modelo shifted-beta-geometric, los resultados y las limitaciones. No leí los apéndices. https://faculty.wharton.upenn.edu/wp-content/uploads/2012/04/Fader_hardie_jim_07.pdf
- **S3.** Peter S. Fader y Bruce G. S. Hardie, "Customer-Base Valuation in a Contractual Setting: The Perils of Ignoring Heterogeneity", *Marketing Science*, vol. 29, n.º 1 (enero-febrero de 2010), pp. 85-93. Leí el resumen, la introducción (ejemplo del 38%) y el inicio de la sección 2. No leí el resto. https://faculty.wharton.upenn.edu/wp-content/uploads/2012/04/Fader_hardie_contractual_mksc_10.pdf
- **S4.** Aswath Damodaran (NYU Stern), "User and Subscriber Businesses: The Good, the Bad and the Ugly" (presentación). La fecha no está impresa; por el contexto (oferta de Walmart por Flipkart, caída de MoviePass) es de 2018. Leí las diapositivas completas; las diapositivas con tablas del método (valor de usuarios existentes y nuevos) salieron como imágenes y solo pude leer la tabla Netflix/Spotify de forma parcial, por eso no uso esas cifras. https://pages.stern.nyu.edu/~adamodar/pdfiles/blog/UserbasedValue.pdf
- **S5.** Eva Ascarza, Raghuram Iyengar y Martin Schleicher, "The Perils of Proactive Churn Prevention Using Plan Recommendations: Evidence from a Field Experiment", *Journal of Marketing Research*, vol. 53, n.º 1 (febrero de 2016), pp. 46-60. Leí el resumen y el comienzo de la introducción (el archivo extraído dio solo las primeras páginas). https://drupalgsb-test.paas.cc.columbia.edu/sites/default/files-efs/pubfiles/12782/Perils_Ascarza.pdf
- **S6.** Ling Zhang y Jiang Duan, estudio de campo aleatorizado sobre duración de la prueba gratis en una plataforma SaaS de edición de imágenes, *Frontiers in Psychology*, 2025 (publicado el 18/6/2025; la página indica una corrección del 10/11/2025). Leí los primeros 100.000 de 127.727 caracteres de la página. La lectura la hice con una herramienta que resume; las cifras de la tabla las verifiqué contra la salida, pero reconozco que el paper tiene una inconsistencia menor en una línea base (0,233% en el texto y 0,224% en la tabla). https://pmc.ncbi.nlm.nih.gov/articles/PMC12217587/

### Nivel B (consultora, reporte sectorial, prensa, universidad como noticia)

- **S7.** SaaS Capital, "SaaS Retention Benchmarks for Private B2B Companies" (benchmarks 2025, publicado el 18/9/2025). Leí las definiciones de NRR y GRR; solo el NRR de la banda de contratos de US$ 25.000 a 50.000 está en texto (mediana 102%, cuartil superior 111%, inferior 97%); la mediana de GRR está en un gráfico que no pude leer. https://www.saas-capital.com/research/saas-retention-benchmarks-for-private-b2b-companies/
- **S10.** Haslam College of Business (Universidad de Tennessee), nota sobre el estudio de Damavandi, Antia y Kopalle, "Cushioning the Blow: Reducing Customer Attrition in Response to Price Increase Notifications", *Journal of Marketing* (la nota lo daba como próximo a publicarse). Leí la nota, no el paper: experimento de campo de 10 meses con una empresa canadiense de almacenamiento, 1.600 clientes, 15 condiciones, aumentos de 5% o 15%. https://haslam.utk.edu/news/ut-haslam-researcher-finds-messaging-matters-in-price-increase-notifications/
- **S12.** La Razón vía eju.tv, "Escasez de dólares: por restricciones, consumo con tarjetas cae en 40%", 7/9/2025. https://eju.tv/2025/09/escasez-de-dolares-por-restricciones-consumo-con-tarjetas-cae-en-40/
- **S13.** Página Siete vía DPL News, nota sobre servicios de streaming en Bolivia (noviembre de 2021). https://dplnews.com/?p=125972
- **S14.** EdSurge, "Platzi raises $6 million to bring more online education to Latin America", 18/6/2019. https://edsurge.com/news/2019-06-18-platzi-raises-6-million-to-bring-more-online-education-to-latin-america
- **S15.** eju.tv, entrevista a Javier Román Roig, cofundador de tuGerente. https://eju.tv/?p=2264959
- **S16.** Economy.com.bo, "9 startups bolivianas reconocidas internacionalmente que se destacaron este 2022", 21/11/2022. https://www.economy.com.bo/articulo/itecno/9-startups-bolivianas-reconocidas-internacionalmente-que-destacaron-2022/20221121123359008569.html
- **S17.** Forbes Perú, "Smart Fit ganó US$ 235 millones en Latinoamérica en 2023", 14/3/2024. https://forbes.pe/negocios/2024-03-14/smart-fit-gano-us235-millones-en-latinoamerica-en-2023/
- **S18.** Descubre (plataforma de perfiles de startups), perfil de Siigo. https://www.descubre.vc/siigo

### Nivel C (blog, glosario, práctica)

- **S8.** Churnkey, "Involuntary Churn Benchmarks and Tactical Advice". Es un blog de un proveedor de herramientas de retención que republica datos de Stripe; la fuente primaria de Stripe no la abrí. https://churnkey.co/blog/involuntary-churn-benchmarks
- **S9.** Orb, "16 Key SaaS metrics". Definiciones de MRR, ARR, ARPU, churn, CAC y LTV; no trae benchmarks ni fórmulas de GRR, NRR ni recuperación del CAC. https://www.withorb.com/blog/saas-metrics

Conteo: 18 fuentes distintas (6 de nivel A leídas, 10 de nivel B, 2 de nivel C). Nota: S11 no se usa (numeración reservada).

---

## 9. No confirmado

1. **Benchmarks de churn mensual por tipo de proyecto.** No tengo una fuente abierta con churn mensual típico para suscripción de consumo (gimnasio, streaming, cursos) ni para SaaS B2B pequeño. Lo más cercano: Stripe, vía Churnkey [S8], da que las suscripciones pierden unos 39% de clientes al año en promedio y en tickets menores a US$ 10 el churn anual es 40%. Es fuente secundaria (blog de proveedor), de EE. UU. Otras cifras que vi en resultados de búsqueda sin abrir la fuente (churn mensual de 4% en una cadena de gimnasios, 28 a 40% de deserción anual en clubes, 60% de retención de nuevos socios, 50% del churn por pagos fallidos) **no las uso**.
2. **Benchmarks de GRR/NRR para Bolivia.** [S7] es de empresas privadas de software B2B principalmente de EE. UU., con contratos de miles de dólares. No sirve como parámetro boliviano.
3. **LTV:CAC mínimo "saludable" (por ejemplo 3:1) y recuperación del CAC en menos de 12 meses.** Son reglas de práctica muy repetidas, pero no las confirmé en ninguna fuente abierta. No las uso como umbrales.
4. **Fórmula exacta de la retención del modelo sBG [S2].** El texto extraído perdió los símbolos; la expresión (beta + t - 1)/(alfa + beta + t - 1) es una reconstrucción mía chequeada solo contra dos promedios del paper (0,15 y 0,37). Verificar contra el PDF antes de implementar.
5. **Elasticidades de [S1] fuera de su contexto.** Salen de cinco empresas de EE. UU. de 1997 a 2002 (financieras e internet), no de suscripciones de consumo ni de SaaS. El paper aclara que no incluyó el costo de mejorar retención ni las interacciones entre adquisición, retención y margen.
6. **Validez externa de [S6] y [S10].** [S6] es de una sola empresa y probó solo 3 y 7 días con tasas de conversión menores a 1%. [S10] lo leí solo a través de una nota de la universidad, no el paper; la fecha y el volumen de publicación no los verifiqué; el contexto es almacenamiento físico, no software. [S5] es telefonía móvil de un país sudamericano; la causa del efecto puede no darse en otros sectores.
7. **Papers que aparecieron en la búsqueda y no abrí:** McCarthy, Fader y Hardie (2017), "Valuing Subscription-Based Businesses Using Publicly Disclosed Customer Data", *Journal of Marketing* 81(1), pp. 17-35 (solo el resumen de búsqueda); Niculescu y Wu (2014), "Economics of Free Under Perpetual Licensing", *Information Systems Research* 25(1) (solo el resumen de búsqueda; la página de PDF devolvió un directorio de la facultad); Fader, Hardie y otros (2018), modelo beta-discrete-Weibull; Management Science, "Design and Evaluation of Optimal Free Trials" (solo el resumen de búsqueda). **No uso sus afirmaciones.**
8. **Libros.** No confirmé en catálogo o editorial ningún libro de esta área (por ejemplo, Osterwalder y Pigneur; Skok; Reichheld). No cito ninguno.
9. **Casos bolivianos con métricas.** No encontré ninguna suscripción boliviana con churn, MRR, CAC o retención publicados y verificables. Las cifras de tuGerente (500 o 650 empresas; "4 de 5 clientes duplican sus ingresos") son de la empresa. No encontré datos de un gimnasio, una plataforma educativa ni un servicio de streaming bolivianos.
10. **Reglas tributarias específicas de suscripciones y servicios digitales en Bolivia.** Los resultados de búsqueda sobre IVA y facturación de SaaS en Bolivia vinieron de un proveedor comercial (PayPro Global) y no los abrí. Tampoco verifiqué si existe un impuesto específico a servicios digitales extranjeros. La referencia a la facturación electrónica del SIN viene de `00-taxonomia-tipos.md` (EDICOM) y no la reabrí.
11. **Reconocimiento contable de ingresos de suscripciones (ingreso diferido).** Es práctica contable estándar, pero no abrí la norma (NIIF 15 o equivalente boliviano). La mecánica del simulador (devengar 1/12 por mes) es interpretación mía.
12. **Estacionalidad de las suscripciones en Bolivia** (febrero escolar, aguinaldo): no busqué ni confirmé fuentes.
13. **Tipo de cambio efectivo y costo real de pagar servicios en dólares desde Bolivia.** Solo tengo los topes de la ASFI según [S12]. No tengo el diferencial entre tipo de cambio oficial y paralelo ni su evolución a octubre de 2026. Tampoco confirmé los topes vigentes hoy (la nota es de septiembre de 2025; una resolución ASFI/299/2026 sobre transferencias mayores a US$ 1.000 apareció en resultados de búsqueda y no la abrí).
14. **Magnitudes marcadas "estimación" en la sección 5.** Son míos y no tienen respaldo. Conviene calibrarlas con un especialista o con datos de un proyecto real antes de implementarlas.
15. **Cifras de la presentación de Damodaran [S4].** Las tablas con el cálculo del valor por suscriptor (Netflix, Spotify) salieron desordenadas en la extracción; no las uso.
16. **Fórmula del CAC payback.** Es de práctica común, sin respaldo abierto (ver 3).
