# Servicios profesionales y software a medida (tipo A4): investigación para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[S#]** significa que lo dice la fuente número # de la sección 8 y que la abrí. Si solo vi un resumen o el catálogo, lo digo.
- **Interpretación** o **estimación** es razonamiento mío. No es una cita. Toda magnitud que no tenga [S#] es estimación mía, y está marcada así.
- Lo que no pude verificar está en la sección 9. No lo uses como dato.
- Los números de las fuentes son de su fecha y su contexto (por ejemplo, el estudio de Flyvbjerg es de proyectos grandes, casi todos públicos). No son parámetros listos para el motor.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un negocio que vende el tiempo y el criterio de personas especializadas: programadores, diseñadores, consultores, analistas. No fabrica un producto en serie. Cada proyecto se vende, se estima, se entrega y se cobra. Los ingresos llegan por tres vías:

1. **Por hora o por equipo dedicado** (tiempo y materiales): el cliente paga cada hora o cada persona por mes. El riesgo de que el trabajo cueste más lo asume el cliente.
2. **Por proyecto a precio fijo**: se acuerda un monto por un alcance. El riesgo de que cueste más lo asume el que desarrolla.
3. **Por contrato recurrente** (soporte, mantenimiento, suscripción): una cuota mensual por mantener algo funcionando.

Un ejemplo de la mezcla: Globant, una empresa latinoamericana de servicios de software que cotiza en bolsa, informó que en 2025 el 66,7% de sus ingresos vino de tiempo y materiales, el 28,0% de precio fijo y el 5,3% de licencias, reventas y otros [S8]. En 2023 el precio fijo era 18,3% [S8]. Es decir, el precio fijo creció, y con él el riesgo que asume la empresa (**interpretación**).

**Cómo aporta valor.**

- **Para el cliente**: acceso a capacidad técnica sin armar un equipo propio, y un resultado (sistema, sitio, diseño, informe) que le sirve para vender más, gastar menos o cumplir una norma.
- **Para el dueño del negocio**: no hay una inversión grande en máquinas. Lo que se compra es gente. El "activo" principal son las personas, la relación con los clientes y el conocimiento acumulado. Maister, en su libro sobre firmas de servicios profesionales, plantea que hay que cuidar dos activos: las relaciones con clientes y el stock de habilidades y talento de la firma (según la descripción de la ficha de librería; no leí el libro) [S14].
- **Para el país**: en Bolivia hay una industria de exportación de software desde hace más de 15 años, concentrada en Cochabamba, La Paz y Santa Cruz [S5][S12]. Una empresa de la industria, Jalasoft, tenía a septiembre de 2023 unos 783 empleados [S7].

**Idea central para el simulador (interpretación).** En este tipo de negocio, el ingreso no sale de "unidades x precio". Sale de **horas vendibles x tarifa cobrada x probabilidad de cobrar a tiempo**. Cada uno de esos tres factores puede fallar por separado.

---

## 2. Indicadores propios y cómo se calculan

Aclaración honesta: no encontré una fuente académica abierta que defina cada indicador. Las fórmulas son las que usa la práctica del sector. Donde una fuente lo respalda, lo marco. Si no, es **definición estándar de la práctica (interpretación mía)**.

| # | Indicador | Fórmula | Qué te dice | Respaldo |
|---|-----------|---------|-------------|----------|
| 1 | **Utilización** | Horas facturables / horas disponibles | Qué parte del tiempo pagado se convierte en horas que se pueden cobrar | Fórmula en [S10] (nivel C). Rango citado por esa página: servicios TI 70-80%, agencias 55-60%, menos de 60% es subutilización. Esa página no cita de dónde salen los números |
| 2 | **Tarifa efectiva (realización)** | Ingreso cobrado / (horas trabajadas x tarifa lista) | Cuánto de lo que "vale" tu hora realmente entra. Baja si regalas horas, descuentas o te pasas del presupuesto en precio fijo | Definición estándar (interpretación). No confirmé un benchmark confiable |
| 3 | **Ingreso por persona** | Ingresos del mes / personas en nómina | Productividad económica del equipo. Jalasoft dice que su crecimiento depende de dos cosas: cantidad de ingenieros y el ingreso promedio que genera cada uno [S7] | [S7] |
| 4 | **Margen bruto del servicio** | (Ingresos - costo de ventas) / ingresos. El costo de ventas son sueldos y beneficios de quien produce | Cuánto queda después de pagar a los que hacen el trabajo | Jalasoft: su margen bruto bajó de 20,15% a 15,19% (12 meses a sept. 2023 contra el mismo período de 2022) y la calificadora lo atribuye a la rotación de personal [S7] |
| 5 | **Margen por proyecto** | (Precio cobrado - horas reales x costo hora) / precio cobrado | Si un proyecto concreto ganó o perdió. En precio fijo se ve al final | Definición estándar (interpretación) |
| 6 | **Desvío de esfuerzo** | (Horas reales - horas estimadas) / horas estimadas | Qué tan mal estimaste. Se mide por proyecto y se promedia | Referencias de desvío: [S1], [S2], [S9] (ver sección 3) |
| 7 | **Backlog (cartera contratada)** | Horas o monto contratado aún no entregado / horas que entrega el equipo por mes | Cuántos meses de trabajo ya tienes vendidos. Menos de 1 mes es riesgo de quedarte sin trabajo | Definición estándar (interpretación) |
| 8 | **Plazo promedio de cobro (DSO)** | (Cuentas por cobrar / ventas del período) x días del período | Cuántos días tardas en cobrar. Es el que decide cuánta caja necesitas para pagar sueldos | Jalasoft informa un plazo promedio de cobro entre 139 y 189 días en la serie del prospecto, con créditos a 180 días a clientes del exterior [S7] |
| 9 | **Concentración de clientes** | % de ingresos del cliente más grande; % de los 3 o 5 mayores | Cuánto dependes de pocos | Globant: 10 mayores clientes = 29,2% de ingresos en 2025; el mayor, 8,7% [S8]. Jalasoft: dos clientes del exterior representan más del 90% [S7] |
| 10 | **Rotación de personal** | Personas que se van voluntariamente en el período / personas en nómina | Cuánto talento pierdes y cuánto cuesta reemplazarlo | Definición de Globant [S8]. Su rotación fue 8,1% (2023), 9,5% (2024) y 13,6% (2025) [S8] |
| 11 | **Cobertura de nómina** | Caja disponible / costo mensual de sueldos | Cuántos meses puedes pagar sueldos sin cobrar nada | Interpretación mía, derivada de que el principal capital de trabajo de estas firmas es financiar la nómina entre el servicio y el cobro: Globant lo describe así [S8] |
| 12 | **Costo de desarrollo capitalizado** | Gasto de desarrollo que cumple los 6 requisitos de la NIC 38 / amortización por vida útil | Cuánto de lo que gastaste en un producto propio se registra como activo y no como gasto | [S3] (ver sección 3.4) |
| 13 | **Proporción de ingresos recurrentes** | Ingreso de soporte, mantenimiento y suscripciones / ingresos totales | Qué parte de tu ingreso se repite sin tener que vender de nuevo | Definición estándar (interpretación) |

**Cuidado con la utilización.** Una página comercial advierte que cerca de 100% provoca desgaste del equipo y que el resultado depende de qué denominador uses (horas totales o horas netas de vacaciones y feriados) [S10]. Para el simulador, conviene fijar una sola definición y mostrarla.

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN/TIR

### 3.1 Qué falla del VAN/TIR clásico en este tipo

**Interpretación mía, apoyada en las fuentes que se indican.**

1. **La inversión inicial es pequeña y el riesgo está en la operación.** Casi no hay máquinas. La TIR puede salir enorme y no decir nada, porque el resultado depende de si llenas las horas del equipo y si cobras. Jalasoft lo resume así: "el desarrollo de software está directamente relacionado con la contratación de ingenieros" [S7].
2. **El ingreso no es una línea plana.** Depende de la cartera de clientes, que se puede perder de golpe (ver concentración en [S7] y [S8]).
3. **El riesgo no es simétrico.** Flyvbjerg y Budzier analizaron 1.471 proyectos de TI: el sobrecosto promedio fue 27%, pero uno de cada seis fue un "cisne negro" con 200% de sobrecosto promedio y casi 70% de atraso [S1]. Su conclusión: el problema no es el promedio, es la cola de casos extremos. Un VAN con un solo escenario esconde esa cola. (Cuidado: la muestra era 92% de agencias públicas y 83% de EE. UU., con un costo promedio de 167 millones de dólares [S1]. No es una muestra de consultoras pequeñas; sirve como señal del patrón, no como parámetro.)
4. **La caja se estrangula antes que el VAN.** Se pagan sueldos cada mes y se cobra a 60, 90 o 180 días [S7]. Un proyecto con VAN positivo puede quebrar por falta de caja. SIMPRO ya tiene alerta de caja negativa; en este tipo debería ser el indicador central.

### 3.2 Qué usar en lugar de, o junto con, el VAN/TIR (interpretación)

| Herramienta | Para qué sirve | Cómo se hace |
|-------------|----------------|--------------|
| **Punto de equilibrio en utilización** | Responde: "¿qué porcentaje de las horas tengo que vender para no perder?" | Costos fijos mensuales (sueldos, alquiler, licencias) / (horas disponibles x tarifa efectiva). Si el resultado es 85%, el negocio es frágil |
| **Margen por proyecto, contado al final** | Detecta si el precio fijo tiene colchón | Ver indicador 5 |
| **Flujo de caja con cobros desfasados** | Ver cuánta plata falta entre pagar sueldos y cobrar | Ingreso devengado en el mes t entra a caja en t + DSO |
| **VAN con escenarios o simulación de desvíos** | Mostrar el rango de resultados y no un solo número | Correr el VAN con sobrecostos de 0%, 27% y 100% (ver [S1]); mirar el peor caso, no solo el promedio |
| **Valor de la cartera de clientes** | Distinguir entre un negocio con clientes recurrentes y uno que vende de cero cada mes | Proporción de ingresos recurrentes y antigüedad de clientes (indicador 13) |
| **VAN del producto propio** | Cuando el negocio invierte en software propio que luego vende | Ahí sí hay inversión inicial y flujos futuros: el VAN clásico funciona mejor |

### 3.3 Qué dicen las fuentes sobre estimar y sobre el desvío

- **Estimar mal es la regla, no la excepción.** Un estudio de Zowghi y Nurmuliani (Universidad de Tecnología de Sídney, 52 proyectos respondidos) encontró que la mayoría de los proyectos terminaron con atraso de entre 25% y 50% y sobre presupuesto entre 4% y 25% [S2]. Es una encuesta chica (21% de respuesta), así que es orientativa.
- **Los cambios de requisitos son una causa importante.** El mismo estudio encontró que la volatilidad de requisitos tiene impacto significativo en atraso y sobrecosto, y que la comunicación frecuente con los usuarios y el uso de una metodología definida de análisis de requisitos reducen esa volatilidad [S2].
- **El informe Standish de 1995** (con datos de 1994) decía que solo 16,2% de los proyectos de software terminaba a tiempo y en presupuesto, y que en los proyectos con problemas el sobrecosto promedio era 189% [S9]. Es una encuesta antigua y muy citada y criticada; la uso solo como antecedente histórico, no como dato actual.
- **Sobre métodos de estimación**: una revisión sistemática de 304 trabajos de investigación sobre estimación de costos de software concluye que la estimación basada en juicio de expertos es, por lejos, el método más usado por la industria, y que las técnicas formales no han demostrado mayor precisión que el juicio experto [S4]. Traducción: los alumnos no deberían creer que existe una fórmula que elimine el error de estimación.
- **Tipo de contrato y ganancia.** Un estudio de 93 proyectos offshore de un proveedor indio de software (Management Science, 2003) encontró que la elección del tipo de contrato (precio fijo o tiempo y materiales) afecta de forma significativa la ganancia del proveedor, y que la incertidumbre de requisitos, el tamaño del equipo y la falta de recursos ayudan a explicar qué contrato se elige [S6]. Solo leí el resumen; no sé el tamaño del efecto.
- **El cono de incertidumbre.** Es una idea muy repetida: al inicio del proyecto el error de estimación puede ser de 4 veces para arriba y 0,25 para abajo. Lo vi atribuido a Boehm y a una nota de la consultora Construx, pero solo en resúmenes de búsqueda; además, una fuente indica que esos rangos fueron fijados por criterio y no medidos. Está en la sección 9; no lo uso como dato.

### 3.4 Gasto o activo: desarrollo de software

La NIC 38 (norma internacional de activos intangibles), según un resumen técnico del personal de la Fundación IASC que lei completo, dice [S3]:

- Los gastos de **investigación** siempre se registran como gasto.
- Los gastos de **desarrollo** solo se pueden registrar como activo si la empresa demuestra **las seis condiciones**: (a) viabilidad técnica de terminar el activo, (b) intención de terminarlo y usarlo o venderlo, (c) capacidad de usarlo o venderlo, (d) cómo generará beneficios económicos probables (por ejemplo, existencia de mercado o utilidad interna), (e) recursos técnicos, financieros y de otro tipo para completarlo, (f) capacidad de medir con fiabilidad el gasto atribuible.
- Lo que ya se registró como gasto no se puede "reponer" después como activo.
- Los activos intangibles con vida útil finita se **amortizan** desde que están disponibles para usarse.
- No se registran como activo las listas de clientes ni las marcas generadas internamente.

El resumen aclara que no fue aprobado por el IASB y que para los requisitos hay que ir a la norma completa [S3]. Qué hace Bolivia con esta norma: no lo confirmé (sección 9).

**Interpretación para el simulador.** El software que se hace *para un cliente* y se le entrega es un costo del proyecto (se cobra, y su costo se va a resultados). El software *propio* que quieres vender varias veces es el caso donde la decisión gasto-o-activo importa. Jalasoft, por ejemplo, invirtió unos 6 millones de dólares en propiedad intelectual propia para diversificar [S7].

**Mantenimiento.** Una idea muy repetida es que el mantenimiento es la mayor parte del costo total de vida de un software (se menciona "50% o más", según el estudio de Lientz y Swanson de 1981). Solo lo vi en diapositivas de un curso y en resúmenes de búsqueda, no en el estudio original. Va a la sección 9; en el simulador se puede modelar el mantenimiento como un costo recurrente creciente, con magnitud **estimación**.

---

## 4. Errores típicos de estudiantes y de emprendedores

Los errores 1 a 4 de la lista son **interpretación mía**, basada en lo que muestran las fuentes. Marco cuáles tienen respaldo.

**De estudiantes (al armar el plan en el simulador):**

1. **Suponer 100% de utilización.** Armar el plan con todas las horas del equipo vendidas, todos los meses. Los benchmarks que vi hablan de 70-80% como meta realista para servicios TI [S10], con la salvedad de que esa página no cita su fuente.
2. **Calcular el precio con el costo del sueldo bruto y nada más.** Se olvidan de cargas sociales, aguinaldo (en Bolivia, el segundo aguinaldo cuando se decreta es un costo extra: Jalasoft lo menciona como riesgo de costo laboral [S7]), equipos, licencias, horas no facturables (ventas, reuniones internas, capacitación).
3. **Cobrar el mismo mes que se trabaja.** En la práctica hay cobros a 30 o 180 días [S7]. Con VAN positivo y cobros lentos, la empresa puede quedarse sin caja.
4. **Poner precio fijo sin colchón por desvío.** El desvío promedio ya es de varios puntos y la cola es larga [S1][S2].
5. **No separar tipos de ingreso.** Tratar todas las horas como iguales aunque unas se cobran por hora y otras a precio fijo.
6. **Capitalizar todo el desarrollo como activo** para mejorar el resultado del año, sin cumplir los seis requisitos de la NIC 38 [S3].
7. **Calcular un VAN con un solo escenario.** Ver sección 3.1, punto 3.

**De emprendedores (casos reales; algunos con respaldo):**

1. **Depender de uno o dos clientes.** Jalasoft, la mayor del rubro en Bolivia, informa que más del 90% de su cartera está en dos clientes del exterior, y ella misma lo trata como riesgo de concentración [S7]. Truextend dice que el 95% de sus clientes está en Estados Unidos (autodeclarado en una nota de prensa) [S12].
2. **Aceptar proyectos de precio fijo sin delimitar el alcance.** La volatilidad de requisitos está asociada a atraso y sobrecosto [S2].
3. **Crecer en personal más rápido que en ventas, o al revés.** Jalasoft documentó que en 2022 hubo alta demanda global de ingenieros, más rotación por competencia salarial, y que a septiembre de 2023 se incorporaron 26 empleados y se desvincularon 139 [S7].
4. **Confundir "cobrar en dólares" con "tener dólares".** Más del 90% de los ingresos de Jalasoft son en dólares, y sus costos en bolivianos, así que la variación del tipo de cambio afecta su resultado [S7]. Para una firma que cobra en dólares y paga en bolivianos, el riesgo cambiario es de primer orden.
5. **No cobrar la factura final.** Cuando el cliente ya recibió lo que quería, pierde urgencia por pagar (**estimación**, no la respaldo con fuente).

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Convenciones. Cada situación indica:
- **Variables que mueve**, con dirección y magnitud. La magnitud va con [S#] cuando viene de una fuente, y con **(estimación)** cuando es mía.
- **Decisiones** (3 a 4), cada una con ventajas y costos reales. Ninguna es la "correcta" en todos los casos: depende de la caja, la cartera y el momento del alumno.
- **Qué aprende** el alumno.

Las referencias a "caja", "ingresos", "costos" y "reputación" son las variables que SIMPRO ya tiene. Las variables nuevas están en la sección 6.

---

### Situación 1. El cliente grande se atrasa en el pago

**Qué pasa.** Tu mayor cliente, que exporta tu trabajo o te contrata desde el exterior, avisa que va a pagar la factura a 120 días y no a 60 por un cambio en su área de finanzas. Tienes sueldos que pagar a fin de mes. En la industria boliviana de exportación de software son comunes los créditos largos: el prospecto de Jalasoft dice que sus cuentas por cobrar comerciales (32,24% del activo total) son créditos a 180 días a clientes del exterior [S7].

**Variables que mueve.**
- Cuentas por cobrar: sube. Un cliente que paga 60 días más tarde aumenta las cuentas por cobrar en dos meses de su facturación (cálculo directo).
- Caja: baja en el mes en que debía entrar la plata, por el monto de dos meses de facturación de ese cliente (cálculo directo).
- Costo financiero: sube si pides un préstamo puente. Tasa **(estimación)**: usa la tasa de crédito PYME de tu escenario.
- Reputación y relación con el cliente: sin cambio si aceptas; baja ligeramente si insistes mal (**estimación**: -2 a -5 puntos de relación con ese cliente).

**Decisiones.**
1. **Aceptar el plazo largo y financiarte con un préstamo.** Ventaja: conservas al cliente y la relación. Costo: intereses y deuda; si el cliente se atrasa otra vez, el préstamo se vuelve permanente.
2. **Exigir el plazo original o frenar el trabajo.** Ventaja: protege tu caja. Costo: puedes perder al cliente más grande, y si es el 40% de tus ingresos la pérdida es mayor que el interés.
3. **Negociar: aceptar el plazo largo a cambio de un descuento por pago anticipado o un anticipo del próximo proyecto.** Ventaja: mantiene la relación y mejora la caja. Costo: reduces tu margen (descuento) o dependes más de ese cliente.
4. **Vender la factura a un tercero (factoraje) si existe en tu plaza.** Ventaja: caja inmediata. Costo: comisión o descuento; no confirmé su disponibilidad en Bolivia.

**Qué aprende.** Que un proyecto con VAN positivo se puede quedar sin caja, y que el capital de trabajo es el costo oculto de cobrar tarde. Que cada decisión tiene precio y que mantener la relación no es gratis.

---

### Situación 2. Un proyecto a precio fijo se desvía

**Qué pasa.** Firmaste un proyecto a precio fijo por Bs 300.000 con una estimación de 2.000 horas. A mitad de camino, el equipo calcula que necesitará 2.800 horas. El cliente dice que lo pactado es lo pactado. En la literatura, los proyectos de software suelen terminar con atraso y sobrecosto [S2], y una proporción pequeña pero real tiene sobrecostos extremos [S1].

**Variables que mueve.**
- Horas del proyecto: +40% sobre la estimación en este ejemplo. Referencia: el sobrecosto promedio de 27% y el 200% de la cola en [S1]; atraso típico de 25-50% y sobrecosto de 4-25% en [S2]. El 40% del ejemplo es un valor intermedio **(estimación)**.
- Margen del proyecto: baja de, por ejemplo, 30% a cerca de 0% (cálculo directo: si cada hora cuesta lo mismo y el precio no cambia, 40% más de horas consume el margen de 30%).
- Utilización: sube en apariencia (más horas), pero la tarifa efectiva baja porque esas horas no se cobran.
- Capacidad para otros proyectos: baja. Las horas extra se sacan de otros trabajos.

**Decisiones.**
1. **Absorber el costo y entregar.** Ventaja: reputación intacta y cliente satisfecho. Costo: pierdes el margen de este proyecto y puedes retrasar otros.
2. **Renegociar el alcance o pedir un adicional.** Ventaja: reduce la pérdida. Costo: puede dañar la relación; el cliente puede dudar de tu estimación original.
3. **Recortar funciones para entregar dentro del presupuesto.** Ventaja: controla el costo. Costo: entrega algo menos de lo esperado; puede pegar en la reputación.
4. **Agregar más gente para terminar antes.** Ventaja: cumples fecha. Costo: Brooks plantea que sumar personas a un proyecto atrasado suele atrasarlo más (según la descripción del catálogo; no leí el libro) [S14b]. Además suma costo directo.

**Qué aprende.** Que en precio fijo el riesgo de estimar mal es tuyo. Que ninguna salida es gratis: renegociar cuesta confianza, absorber cuesta margen.

---

### Situación 3. El cliente pide "una cosita más" (crecimiento del alcance)

**Qué pasa.** En tiempo y materiales o en precio fijo, el cliente va pidiendo funciones nuevas sin que haya un acuerdo formal. Un estudio de requisitos encontró que la volatilidad de requisitos tiene efecto significativo en atraso y sobrecosto, y que hablar seguido con los usuarios y usar una metodología definida la reducen [S2].

**Variables que mueve.**
- Horas del proyecto: +10% a +30% en el transcurso del proyecto **(estimación)**.
- Ingreso: sube solo si cobras el cambio (en precio fijo, no sube).
- Relación con el cliente: sube si dices que sí a todo; baja si dices que no.
- Backlog: sube si cobras el adicional.

**Decisiones.**
1. **Aceptar todo para no discutir.** Ventaja: cliente contento, buena referencia. Costo: regalas horas; el margen del proyecto se hunde.
2. **Aplicar un proceso formal de cambios (cotizar cada pedido).** Ventaja: cobras lo que trabajas. Costo: algunos clientes lo viven como rigidez; más tiempo en gestión.
3. **Aceptar el primer pedido gratis y cobrar desde el segundo.** Ventaja: equilibrio entre relación y margen. Costo: el cliente puede acostumbrarse a que todo es gratis.
4. **Cambiar el contrato a tiempo y materiales para el resto del proyecto.** Ventaja: el riesgo de más trabajo pasa al cliente. Costo: el cliente puede rechazarlo; el ingreso se vuelve menos predecible.

**Qué aprende.** El alcance es la parte más cara de un contrato. Un buen proceso de cambios es una herramienta de negocio, no burocracia.

---

### Situación 4. Se va tu cliente ancla

**Qué pasa.** El cliente que representa gran parte de tus ingresos avisa que reduce o termina el contrato (cambio de estrategia, de proveedor o de presupuesto). Es el riesgo de concentración: en Jalasoft, más de 90% de la cartera está en dos clientes del exterior, y su calificadora dice que la empresa buscó un tercer cliente y desarrolló soluciones propias justamente para evitar la concentración [S7]. Globant, mucho más grande y diversificada, tiene a su mayor cliente en 8,7% de ingresos [S8].

**Variables que mueve.**
- Ingresos: caen por el peso del cliente. Si pesaba 40% y se va, caen 40% (cálculo directo).
- Utilización: baja fuerte. El equipo queda sin proyecto (banca).
- Caja: sigue pagando sueldos con menos ingreso. La caja se consume al ritmo de (costos fijos - ingresos restantes).
- Backlog: baja.

**Decisiones.**
1. **Mantener a todo el equipo mientras vendes proyectos nuevos.** Ventaja: no pierdes talento, que es lo más difícil de recuperar. Costo: quemas caja cada mes de banca.
2. **Reducir el equipo de inmediato.** Ventaja: ahorra costos. Costo: pierdes gente que costó contratar y capacitar; si llega un contrato, no tienes capacidad; baja el clima interno.
3. **Reasignar al equipo a un producto propio mientras tanto.** Ventaja: usa las horas ociosas en algo con valor futuro. Costo: no genera ingreso hoy; el producto puede no vender (ver situación 9).
4. **Bajar la tarifa para ganar un cliente nuevo rápido.** Ventaja: recupera utilización. Costo: el cliente nuevo queda acostumbrado a la tarifa baja; el margen cae.

**Qué aprende.** Qué significa concentración de clientes y por qué un negocio rentable puede quebrar con un solo contrato perdido. Que diversificar cuesta (tiempo de venta, de gestión) y que no hacerlo cuesta más cuando ocurre.

---

### Situación 5. Se va tu mejor ingeniero (o un equipo)

**Qué pasa.** Una empresa del exterior ofrece más sueldo a tu desarrollador senior, que lidera un proyecto clave. En 2022, Jalasoft reportó mayor demanda global de ingenieros, rotación más alta por competencia salarial y menor ingreso por esa causa [S7]. En el período de 12 meses a septiembre de 2023 se desvincularon 139 empleados y se incorporaron 26, según el mismo documento [S7].

**Variables que mueve.**
- Capacidad (horas vendibles): baja. Un senior rinde más y a mayor tarifa que un junior.
- Rotación: sube. Referencia: 8,1% a 13,6% anual en Globant [S8]; 9,8% en Jalasoft [S7].
- Costo de reposición: sube. Costo de reemplazar a un profesional: entre 3 y 6 meses de sueldo en reclutamiento, capacitación y curva de aprendizaje **(estimación)**; AssureSoft nivela a graduados en 3 a 6 meses antes de que entren a proyectos internacionales [S13].
- Margen bruto: baja. En Jalasoft, el margen bruto cayó de 20,15% a 15,19% por la rotación [S7].
- Reputación: baja si el proyecto se retrasa.

**Decisiones.**
1. **Contraofertar con aumento y retenerlo.** Ventaja: conservas conocimiento y continuidad. Costo: sube tu costo fijo; otros empleados pueden pedir lo mismo.
2. **Dejarlo ir y contratar un reemplazo.** Ventaja: evitas la espiral salarial. Costo: tiempo de búsqueda, curva de aprendizaje, riesgo para el proyecto.
3. **Formar juniors propios (convenio con universidades, programa de formación).** Ventaja: costo menor y fidelidad a largo plazo (Jalasoft usa un compromiso de permanencia de cuatro años para sus graduados [S7]). Costo: tarda años; inversión inicial.
4. **Subcontratar a un freelance para cubrir.** Ventaja: rápido y flexible. Costo: mayor tarifa por hora, menos conocimiento del proyecto, riesgo de calidad.

**Qué aprende.** En este negocio el costo principal es la gente y la gente se va. Retener tiene costo; no retener también.

---

### Situación 6. Llega un contrato más grande que tu capacidad

**Qué pasa.** Un cliente nuevo ofrece un contrato por el doble de tu facturación mensual, con plazo corto. Tienes 15 personas y necesitarías 30. Aceptar significa contratar rápido, con riesgo de mala selección, o subcontratar.

**Variables que mueve.**
- Ingresos: suben, **si** logras cumplir. Magnitud: la del contrato (dato del escenario).
- Costos: suben antes que los ingresos (contratación, equipos, capacitación). Los sueldos se pagan antes de cobrar.
- Caja: baja primero, porque pagas sueldos y cobras después (ver situación 1, con cobros que pueden demorar meses [S7]).
- Calidad y reputación: riesgo de baja si el equipo nuevo no rinde.
- Concentración: sube. Este cliente quedaría con un peso alto.

**Decisiones.**
1. **Aceptar completo y contratar masivamente.** Ventaja: oportunidad grande de crecer. Costo: caja bajo presión, riesgo de calidad, concentración alta.
2. **Aceptar una parte (primera fase) y crecer por etapas.** Ventaja: más control del riesgo. Costo: el cliente puede ir con otro proveedor.
3. **Asociarte con otra consultora para entregar juntos.** Ventaja: capacidad inmediata. Costo: compartes margen y control; un problema del socio es tuyo ante el cliente.
4. **Rechazar el contrato.** Ventaja: proteges calidad y caja. Costo: pierdes una oportunidad que quizá no se repita.

**Qué aprende.** Que crecer rápido consume caja antes de producirla, y que la capacidad es un recurso con tiempo de preparación.

---

### Situación 7. Sube el costo laboral y tu tarifa está congelada

**Qué pasa.** El gobierno decreta un aumento del salario mínimo (en diciembre de 2025 se anunció un aumento de 20% para 2026, a Bs 3.300 [S11]) y/o un segundo aguinaldo. Aunque el salario mínimo no obliga a subir los sueldos de quienes ya ganan más (esto lo vi en un resumen de búsqueda de una firma legal, no en la norma; sección 9), el mercado presiona: tus empleados piden ajustes. Jalasoft identifica el costo laboral y el segundo aguinaldo como riesgos directos de su estructura de costos [S7]. Y Globant dice que, típicamente, no puede subir sus tarifas por hora para compensar aumentos de sueldos [S8].

**Variables que mueve.**
- Costos de nómina: +5% a +20%, según cuánto del equipo ganaba cerca del mínimo y qué ajuste hagas **(estimación)**; el 20% del salario mínimo es de [S11].
- Margen bruto: baja en la misma proporción en que el costo laboral crece y la tarifa no.
- Tarifa: queda igual si hay contratos vigentes a precio pactado.

**Decisiones.**
1. **Absorber el aumento y mantener tarifas.** Ventaja: no arriesgas clientes. Costo: el margen baja; si ya era delgado, entras en pérdida.
2. **Subir las tarifas a los clientes nuevos y renegociar con los vigentes.** Ventaja: traslada el costo. Costo: algunos clientes se van; en contratos vigentes puede no ser posible.
3. **Aumentar la productividad (herramientas, automatización) para compensar.** Ventaja: baja el costo por entregable. Costo: requiere inversión y tiempo, y los resultados son inciertos.
4. **Reducir el equipo y quedarte con los mejores.** Ventaja: baja la nómina. Costo: menor capacidad, riesgo para proyectos en curso.

**Qué aprende.** Que el costo variable principal está atado a la ley y al mercado laboral, mientras que el precio está atado a contratos; esa asimetría es un riesgo estructural.

---

### Situación 8. Se vacía la cartera (el equipo queda sin proyecto)

**Qué pasa.** Termina un proyecto grande y el siguiente tarda tres meses en firmarse. Por esos meses el equipo está "en banca": cobra sueldo y no factura. Es un riesgo de este tipo de negocio, en el que la utilización depende de tener proyectos entrando.

**Variables que mueve.**
- Utilización: baja, por ejemplo de 75% a 40% **(estimación)** durante la banca. Para la referencia de utilización típica ver [S10] (benchmarks de una página comercial sin fuente).
- Ingresos: caen en proporción a las horas no facturadas.
- Costos: no cambian a corto plazo (sueldos fijos).
- Caja: baja cada mes; la velocidad de caída es el costo mensual de nómina del equipo en banca.

**Decisiones.**
1. **Invertir en ventas y marketing (eventos, referencias, preventa).** Ventaja: busca nuevos clientes. Costo: gasto sin garantía de resultado inmediato; el ciclo de venta de proyectos grandes puede ser largo.
2. **Capacitar al equipo mientras tanto.** Ventaja: mejora capacidades, sube la tarifa futura. Costo: gasto sin ingreso hoy.
3. **Aceptar proyectos pequeños a tarifa baja para llenar horas.** Ventaja: utilización y caja inmediatas. Costo: baja la tarifa efectiva, puede posicionarte como barato.
4. **Poner a parte del equipo en vacaciones o licencia.** Ventaja: reduce el costo sin despedir. Costo: depende de acuerdos laborales; afecta el ánimo.

**Qué aprende.** La utilización es la palanca más fuerte de rentabilidad del negocio, y el pipeline (proyectos por entrar) es tan importante como los proyectos en curso.

---

### Situación 9. Producto propio: capitalizar desarrollo o gastarlo

**Qué pasa.** Quieres usar horas del equipo para desarrollar un producto propio (por ejemplo, un software de gestión) que luego vendas por licencia o suscripción. Jalasoft hizo algo parecido: invirtió unos 6 millones de dólares en propiedad intelectual para soluciones propias, comercializadas en Bolivia, como forma de diversificar [S7]. Contablemente, la NIC 38 permite registrar el desarrollo como activo solo si cumples los seis requisitos [S3].

**Variables que mueve.**
- Costos / resultado del período: si lo registras como gasto, el resultado de los años de desarrollo baja; si cumples los requisitos y lo registras como activo, el resultado mejora pero aparece una amortización posterior.
- Caja: baja igual en ambos casos (la plata sale igual). La contabilidad no cambia la caja.
- Capacidad para servicios: baja mientras el equipo trabaja en el producto.
- Ingresos futuros: sube si el producto vende. Magnitud: depende del mercado; no hay dato de fuente. Estimación: muchos productos propios no alcanzan las ventas proyectadas.

**Decisiones.**
1. **Desarrollar el producto con un equipo dedicado y registrar como activo lo que cumpla la NIC 38.** Ventaja: resultado mejor en los años de desarrollo; puedes mostrar el activo. Costo: debes documentar los seis requisitos; si el producto fracasa, tienes que reconocer el deterioro del activo.
2. **Desarrollarlo con horas ociosas (banca) y no capitalizar.** Ventaja: no sacas horas a los proyectos pagos. Costo: avance lento; puede no ser suficiente.
3. **Buscar un cliente que financie el producto (desarrollo a medida que luego puedas reutilizar).** Ventaja: reduces el riesgo. Costo: el cliente puede exigir exclusividad o propiedad.
4. **No desarrollar producto y seguir solo con servicios.** Ventaja: sin riesgo de inversión. Costo: ingreso atado a horas; no hay ingresos que escalen.

**Qué aprende.** Diferencia entre gasto y activo, y que la contabilidad no cambia la caja. Que un producto propio es una apuesta distinta a la de los servicios.

---

### Situación 10. Fallas después de la entrega (garantía y mantenimiento)

**Qué pasa.** Entregaste un sistema. A las pocas semanas, el cliente reporta errores graves y exige corrección sin costo. En el mantenimiento de software hay un costo continuo de corregir y evolucionar el sistema; la idea de que el mantenimiento es el mayor componente del costo del ciclo de vida está muy repetida pero no la pude verificar en la fuente original (sección 9).

**Variables que mueve.**
- Horas no facturadas: +5% a +15% de las horas del proyecto durante la garantía **(estimación)**.
- Reputación: baja si tardas o si los errores son graves; sube si respondes rápido.
- Deuda técnica: sube si corriges con parches rápidos.
- Ingresos recurrentes: pueden subir si el cliente contrata soporte.

**Decisiones.**
1. **Corregir de inmediato sin cobrar.** Ventaja: reputación y confianza. Costo: horas no pagadas que sacas de otros proyectos.
2. **Corregir y proponer un contrato de soporte mensual.** Ventaja: convierte el problema en ingreso recurrente. Costo: el cliente puede sentir que le cobras por tus errores.
3. **Discutir si el error es defecto o cambio de requisitos.** Ventaja: puedes cobrar si es cambio. Costo: conflicto; si el cliente tiene razón, el daño a la relación es mayor.
4. **Limitar la garantía a una cantidad de horas por contrato desde el inicio.** Ventaja: costo acotado. Costo: debe estar en el contrato original; algunos clientes lo rechazan al firmar.

**Qué aprende.** La entrega no es el fin del proyecto: la garantía y el soporte tienen costo y son una fuente de ingreso recurrente si se diseñan bien.

---

### Situación 11. Tipo de contrato: el cliente exige precio fijo

**Qué pasa.** Un cliente que te contrataba por hora ahora exige precio fijo por el próximo proyecto, "para tener un presupuesto cerrado". El estudio de 93 proyectos de un proveedor indio encontró que el tipo de contrato afecta de forma significativa la ganancia del proveedor [S6]; y Globant muestra que el precio fijo viene creciendo como proporción de sus ingresos (de 18,3% a 28,0% entre 2023 y 2025) y reconoce el riesgo de que sus supuestos de costo sean inexactos [S8].

**Variables que mueve.**
- Riesgo de margen: sube. La desviación de horas pasa a ser tuya.
- Ingreso esperado: puede subir si cobras una prima por asumir el riesgo; la magnitud de la prima es **estimación** (10% a 25%).
- Volatilidad del resultado: sube (más casos extremos, ver [S1]).
- Probabilidad de ganar el contrato: sube si aceptas.

**Decisiones.**
1. **Aceptar precio fijo con una prima de riesgo.** Ventaja: ganas el contrato y puedes ganar más si estimas bien. Costo: si te equivocas, pierdes.
2. **Proponer un esquema mixto (fase de descubrimiento paga por hora, luego precio fijo).** Ventaja: la estimación mejora cuando ya conoces el alcance. Costo: el cliente puede ver el descubrimiento como un gasto adicional.
3. **Mantener tiempo y materiales con un tope de horas.** Ventaja: das previsibilidad al cliente sin asumir todo el riesgo. Costo: el cliente puede no aceptar.
4. **Rechazar el precio fijo.** Ventaja: sin riesgo de estimación. Costo: puedes perder al cliente.

**Qué aprende.** Que cada tipo de contrato reparte el riesgo de forma distinta y que cobrar más por asumir riesgo es una decisión de precio, no un abuso.

---

### Situación 12. Cobras en dólares, pagas en bolivianos (tipo de cambio y acceso a divisas)

**Qué pasa.** Tu cliente del exterior te paga en dólares, pero tu nómina es en bolivianos. Más del 90% de los ingresos de Jalasoft son en dólares y sus costos son casi totalmente en bolivianos, y la empresa dice que una apreciación del boliviano le generaría pérdida por tipo de cambio y que para eso contrata forwards [S7]. Los cambios en la política cambiaria de Bolivia y la dificultad de acceso a dólares son un tema de los últimos años (sección 9: lo vi solo en resúmenes de búsqueda).

**Variables que mueve.**
- Ingresos en bolivianos: suben o bajan según el tipo de cambio. Magnitud: variación del tipo de cambio en tu escenario (si hay brecha oficial/paralelo, el efecto puede ser de decenas de por ciento; no lo confirmé).
- Margen: sube si el boliviano se deprecia y baja si se aprecia, porque los costos están en bolivianos.
- Costo de cobertura: **estimación**, 1% a 3% del monto cubierto.
- Caja: puede quedar "atrapada" si no puedes convertir o transferir dólares (**estimación** de escenario).

**Decisiones.**
1. **Dejar el riesgo abierto.** Ventaja: sin costo de cobertura; si el tipo de cambio te favorece, ganas. Costo: si te perjudica, pierdes margen sin aviso.
2. **Cubrir con un contrato a plazo (forward) o equivalente.** Ventaja: fija tu margen. Costo: costo de cobertura; pierdes si el tipo de cambio se mueve a tu favor.
3. **Pasar contratos a bolivianos.** Ventaja: elimina el riesgo cambiario. Costo: el cliente exterior puede no aceptar; le trasladas su riesgo a él y pides más precio.
4. **Mantener parte de la caja en dólares (cuenta en el exterior o en el sistema local).** Ventaja: protege contra la depreciación. Costo: depende de las normas; la tenencia y la repatriación pueden tener restricciones.

**Qué aprende.** Que un negocio de exportación de servicios tiene un riesgo cambiario estructural, y que cubrirse cuesta.

---

### Situación 13. Oportunidad: licitación o contrato con una entidad pública

**Qué pasa.** Una entidad pública abre una convocatoria para desarrollar un sistema. El monto es grande y atractivo. En el sector público suele haber trámites largos, cambios de autoridades y cobros lentos; esto es **mi estimación de contexto**: no abrí una fuente boliviana que lo cuantifique (sección 9).

**Variables que mueve.**
- Ingresos: suben en el monto del contrato, con riesgo de alcance cambiante.
- Cobros: más lentos que el privado, por ejemplo +30 a +90 días **(estimación)**.
- Costos de licitación: sube (preparación de propuesta, boletas de garantía) **(estimación)**.
- Concentración: sube, si el contrato es grande para tu escala.

**Decisiones.**
1. **Presentar la propuesta y priorizarla.** Ventaja: contrato grande. Costo: costo de preparar y garantías sin certeza de ganar.
2. **Presentarte en alianza con otra empresa.** Ventaja: cumples requisitos y compartes riesgo. Costo: comparten margen.
3. **No presentarte y apostar a clientes privados.** Ventaja: caja más predecible. Costo: pierdes la oportunidad de un contrato grande.
4. **Presentarte con precio muy bajo para ganar.** Ventaja: más probabilidad de ganar. Costo: margen mínimo y riesgo de pérdida si hay desvío (ver situación 2).

**Qué aprende.** Que un cliente grande no es automáticamente un buen cliente: hay que mirar plazo de pago, riesgo de alcance y costo de conseguirlo.

---

### Situación 14. La inteligencia artificial baja las horas y el cliente quiere bajar el precio

**Qué pasa.** Tus programadores usan herramientas de inteligencia artificial y entregan más rápido. El cliente se entera y pide que bajes la tarifa o que cobres por resultado. Globant introdujo en 2025 un modelo de suscripción para servicios con IA (llamado AI Pods) y reportó una reducción de su fuerza laboral por un plan de optimización [S8]. Qué efecto real tuvo en sus precios, no lo pude confirmar.

**Variables que mueve.**
- Horas por entregable: bajan. Magnitud: **estimación** de 10% a 30% según el tipo de tarea; no tengo fuente propia confiable.
- Ingreso en tiempo y materiales: baja si cobras por hora y haces menos horas.
- Margen en precio fijo: sube, porque haces lo mismo con menos horas.
- Tarifa: presión a la baja.

**Decisiones.**
1. **Cobrar por hora y bajar la tarifa para conservar al cliente.** Ventaja: relación y volumen. Costo: ingreso menor por entregable.
2. **Pasar a precio por resultado o por entregable.** Ventaja: te quedas con el ahorro de eficiencia. Costo: asumes el riesgo de estimar (ver situación 2).
3. **Ofrecer más entregables por el mismo presupuesto.** Ventaja: valor para el cliente y conserva ingreso. Costo: el cliente puede no tener más trabajo que pedir.
4. **Ocultar o no hablar del uso de la herramienta.** Ventaja: conservas margen en el corto plazo. Costo: riesgo de reputación y confianza si el cliente lo descubre; puede haber cláusulas de confidencialidad que lo prohíban.

**Qué aprende.** Que cuando la productividad sube, quién se queda con el ahorro depende de cómo estén diseñados el contrato y la relación.

---

### Situación 15. Incidente de seguridad en un sistema que entregaste

**Qué pasa.** Un sistema que desarrollaste para un cliente sufre una filtración de datos. El cliente atribuye la falla a tu código y exige compensación y revisión completa. Es un riesgo operativo de la entrega de software; Jalasoft lo trata con gestión por "managers" y metodología ágil de retroalimentación constante [S7].

**Variables que mueve.**
- Costos: suben por horas de respuesta y posible compensación. Magnitud: **estimación**, entre 1 y 6 meses de facturación de ese cliente, según contrato.
- Reputación: baja fuerte con ese cliente y con la red de referencias. **(estimación)**.
- Ingresos: caen si el cliente se va y si otros se enteran.
- Seguros / reservas: si tenías un seguro de responsabilidad profesional, cubre parte.

**Decisiones.**
1. **Asumir responsabilidad, responder rápido y pagar la compensación.** Ventaja: preserva la confianza a largo plazo. Costo: sale caja, y puede sentar precedente.
2. **Investigar primero y negociar según los hallazgos.** Ventaja: no pagas por algo que no fue tu culpa. Costo: el cliente puede sentir que te defiendes en vez de ayudar.
3. **Ofrecer horas de remediación y mejoras de seguridad sin cargo a cambio de no compensación en dinero.** Ventaja: gasto en horas, no en caja. Costo: son horas que no cobras y se sacan de otros proyectos.
4. **Rescindir la relación para limitar la exposición.** Ventaja: cortas el problema. Costo: pierdes el cliente y la reputación se resiente.

**Qué aprende.** Que el riesgo de responsabilidad es parte del negocio y que los contratos (límites de responsabilidad, seguros) importan tanto como la técnica.

---

## 6. Variables propias que el motor debería manejar

Las que ya existen en SIMPRO (caja, ingresos, costos, reputación) se reusan. Esta es la lista adicional **(propuesta mía)**. Cómo se actualiza cada mes:

| Variable | Qué representa | Cómo se actualiza cada mes |
|----------|----------------|----------------------------|
| `horas_disponibles` | Horas que el equipo puede trabajar en el mes | Personas x horas por persona (por ejemplo, 160 menos vacaciones y feriados) |
| `utilizacion` | % de horas disponibles que se facturan | `horas_facturables / horas_disponibles`; depende de proyectos activos y de la banca |
| `tarifa_lista` / `tarifa_efectiva` | Lo que cobras por hora, y lo que realmente entra | Efectiva = cobrado / horas trabajadas; baja con descuentos y sobreesfuerzo |
| `equipo` (por perfil: junior, semi, senior) | Cantidad de personas por perfil y su costo | Altas por contratación (con retraso de incorporación y curva de aprendizaje), bajas por rotación |
| `rotacion` | Probabilidad mensual de que se vaya alguien | Base anual (referencia 8% a 14% en [S8]); sube con salarios por debajo del mercado o mala utilización |
| `proyectos_activos` | Lista de proyectos: cliente, tipo de contrato, precio, horas estimadas, horas gastadas, fecha de fin | Avanza cada mes según horas asignadas; al final se calcula margen |
| `desvio_esfuerzo` | Horas reales vs estimadas por proyecto | Sorteo al iniciar el proyecto con una distribución de cola larga (ver [S1]: promedio 27%, un caso cada seis con ~200%) |
| `volatilidad_alcance` | Cuánto cambian los requisitos | Sube con poca comunicación con el cliente; baja con proceso de cambios [S2] |
| `backlog_meses` | Meses de trabajo ya vendido | Backlog + ventas nuevas - horas entregadas |
| `pipeline` | Oportunidades en venta y su probabilidad | Se genera con esfuerzo comercial; cada mes algunas se cierran o se pierden |
| `clientes` (con peso, plazo de pago, relación) | Cartera de clientes | Cada cliente tiene un % de ingreso, un plazo de cobro y un nivel de relación |
| `concentracion_top1` / `top3` | Dependencia de pocos clientes | Se calcula del ingreso por cliente |
| `cuentas_por_cobrar` y `dso` | Facturado y no cobrado; días promedio de cobro | Facturación del mes entra a cuentas por cobrar y pasa a caja después del plazo del cliente (referencia 139 a 189 días en [S7]) |
| `trabajo_en_curso` | Horas trabajadas aún no facturadas | Sube con avance sin hito de cobro; baja al facturar |
| `deuda_tecnica` | Acumulación de atajos que encarecen el mantenimiento | Sube con prisa y atajos; baja con inversión en calidad; aumenta el costo de garantía y mantenimiento |
| `ingreso_recurrente` | Soporte, mantenimiento, suscripciones | Se acumula con contratos de soporte; se pierde con cancelaciones |
| `activo_desarrollo` y `amortizacion` | Desarrollo propio capitalizado y su amortización | Se capitaliza solo si el alumno declara cumplir los 6 requisitos [S3]; se amortiza por la vida útil elegida |
| `exposicion_usd` | Porción de ingresos en dólares frente a costos en bolivianos | Tipo de cambio escenario x ingresos en dólares; ver [S7] |
| `reputacion` por cliente y global | Confianza que generas | Se mueve con entregas a tiempo, calidad e incidentes; afecta probabilidad de renovar y de referencias |

---

## 7. Ejemplos reales de Bolivia y Latinoamérica

Solo incluyo casos con enlace que abrí. "Qué dice la fuente" no es mi evaluación del negocio.

| Caso | País | Qué dice la fuente | Enlace |
|------|------|--------------------|--------|
| **Jalasoft S.R.L.** (prospecto de Bonos Jalasoft IV, con informe de calificación de PCR a septiembre de 2023) | Bolivia | Empresa de desarrollo de software para exportación. Más de 90% de la cartera en dos clientes del exterior; créditos a 180 días; plazo promedio de cobro entre 139 y 189 días en la serie; más de 90% de ingresos en dólares y costos en bolivianos; margen bruto de 15,19% (20,15% el año anterior); 783 empleados a sept. 2023; rotación de 9,8% según la ficha del prospecto; invirtió cerca de 6 millones de dólares en propiedad intelectual propia para diversificar | https://asfi.gob.bo/sites/default/files/2025-08/Bonos%20JALASOFT%20IV.pdf |
| **Globant** (Formulario 20-F de 2025 ante la SEC) | Argentina / Latam | Servicios de software y TI. 66,7% de ingresos por tiempo y materiales, 28,0% por precio fijo en 2025. 10 mayores clientes = 29,2% de ingresos; mayor cliente = 8,7%. Rotación 13,6% en 2025. Dice que típicamente no puede subir sus tarifas por hora para compensar aumentos de sueldos. Capital de trabajo principal: financiar la nómina entre el servicio y el cobro | https://www.sec.gov/Archives/edgar/data/1557860/000162828026012910/glob-20251231.htm |
| **Siete exportadores de Cochabamba** (nota de Página Siete reproducida por DPL News, 21/6/2022) | Bolivia | Truextend: equipo de ingeniería en Cochabamba, oficina en California y 95% de clientes en EE. UU. (dato de la empresa). Connaxis: unos 60 clientes activos. Jalasoft: nace en 2001 y crea la Fundación Jala en 2008 para formar ingenieros | https://dplnews.com/?p=156100 |
| **AssureSoft y TrueSoft** (entrevista a Daniel Gumucio, eju.tv) | Bolivia | Exporta servicios de desarrollo a EE. UU., Canadá y Europa con equipos en seis ciudades bolivianas; clientes de 7 a 8 años; entrena graduados durante 3 a 6 meses antes de ponerlos en proyectos internacionales | https://eju.tv/?p=2875510 |
| **Exportación de software desde Bolivia** (artículo de Gonzalo Zeballos, UPSA) | Bolivia | Cita 1.449 empresas de software en el país (InternetBolivia.org, 2020) y exportaciones oficiales de unos 30 millones de dólares frente a estimaciones extraoficiales sobre 57 millones (Los Tiempos, 2018). Señala un vacío tributario: las empresas, para emitir factura de exportación, deben tratar el software como un bien físico, con costos logísticos que el autor estima en hasta 2.000 dólares al mes | https://cicaef.upsa.edu.bo/index.php/generacionupsa/article/download/28/25/48 |

Casos de **estudios de diseño o agencias** (otro tramo del tipo): no encontré en Bolivia un caso abierto con cifras. Dejo esa laguna indicada en la sección 9.

---

## 8. Fuentes numeradas con nivel

Niveles: **A** libro, paper, organismo o manual universitario. **B** consultora, reporte sectorial, documento regulatorio o prensa económica. **C** blog, página comercial.

| N.º | Fuente | Nivel | Qué leí | Enlace |
|-----|--------|-------|---------|--------|
| S1 | Bent Flyvbjerg y Alexander Budzier, "Why Your IT Project May Be Riskier than You Think", Harvard Business Review, vol. 89, n.º 9, septiembre de 2011, pp. 23-25 (copia de los autores, Universidad de Oxford, Saïd Business School) | A | Leí el artículo completo de la copia de arXiv: 1.471 proyectos, 27% de sobrecosto promedio, un caso de cada seis con ~200% y ~70% de atraso | https://arxiv.org/pdf/1304.0265 |
| S2 | Didar Zowghi y N. Nurmuliani, "A Study of the Impact of Requirements Volatility on Software Project Performance", Asia-Pacific Software Engineering Conference, IEEE, 2002 (copia en repositorio UTS) | A | Leí el resumen, la metodología (52 proyectos) y los resultados principales | https://opus.lib.uts.edu.au/bitstream/10453/2350/3/2004003534.pdf |
| S3 | Resumen técnico de la NIC 38 "Activos intangibles" preparado por el personal de la Fundación IASC (declara que no fue aprobado por el IASB) | A (documento de organismo, pero es un extracto de personal) | Leí el texto completo del extracto, incluidos los seis requisitos de desarrollo | https://tagi.com:443/UploadFiles/IFRS_AND_IASB_Standards/IAS38.pdf |
| S4 | Magne Jørgensen y Martin Shepperd, "A Systematic Review of Software Development Cost Estimation Studies", IEEE Transactions on Software Engineering, vol. 33, n.º 1, pp. 33-53, enero de 2007 | A | Leí fragmentos (resumen, discusión sobre juicio de expertos y apéndice), no el artículo completo | https://bura.brunel.ac.uk/bitstream/2438/1076/3/04027147.pdf |
| S5 | Gonzalo Zeballos Gallardo, "Propuesta de un marco legal tributario para exportación de servicios informáticos (software) desde Bolivia", revista Generación UPSA (Universidad Privada de Santa Cruz de la Sierra) | A (artículo universitario basado en un proyecto de grado; sin fecha visible en mi extracción) | Leí el artículo completo | https://cicaef.upsa.edu.bo/index.php/generacionupsa/article/download/28/25/48 |
| S6 | Anandasivam Gopal, K. Sivaramakrishnan, M. S. Krishnan y Tridas Mukhopadhyay, "Contracts in Offshore Software Development: An Empirical Analysis", Management Science, vol. 49, n.º 12, 2003, pp. 1671-1683 | A | **Solo el resumen** (página de IDEAS/RePEc y resúmenes de búsqueda), no el artículo | https://ideas.repec.org/a/inm/ormnsc/v49y2003i12p1671-1683.html |
| S7 | PCR (calificadora de riesgo), informe con estados financieros a septiembre de 2023 incluido en el prospecto "Bonos Jalasoft IV", registrado en ASFI | B (documento regulatorio con informe de calificadora; datos auditados y declarados por la empresa) | Leí las secciones de resumen, riesgos, personal, clientes, indicadores y ratios | https://asfi.gob.bo/sites/default/files/2025-08/Bonos%20JALASOFT%20IV.pdf |
| S8 | Globant S.A., Formulario 20-F del ejercicio 2025 | B (documento regulatorio de una empresa; fuente primaria de sus propios números) | Leí fragmentos (factores de riesgo, tipo de contrato, concentración, rotación, capital de trabajo) | https://www.sec.gov/Archives/edgar/data/1557860/000162828026012910/glob-20251231.htm |
| S9 | The Standish Group, "The CHAOS Report" (1995) | B (consultora; encuesta antigua, muy discutida) | Leí el texto de una copia alojada en la Universidad de Padua | https://www.math.unipd.it/~tullio/IS-1/2004/Approfondimenti/CHAOS.html |
| S10 | Harvest, "Utilization rate benchmarks" | C (página comercial; no cita fuente de los números) | Leí la página | https://www.getharvest.com/calculators/utilization-rate-benchmarks |
| S11 | Bloomberg Línea, nota sobre el aumento de 20% del salario mínimo en Bolivia (18/12/2025) | B (prensa económica) | Leí la nota: salario mínimo a Bs 3.300 desde enero de 2026 | https://www.bloomberglinea.com/latinoamerica/bolivia/rodrigo-paz-aumenta-un-20-el-salario-minimo-en-bolivia/ |
| S12 | DPL News (nota de Página Siete), "7 emprendedores que exportan tecnología desde Cochabamba", 21/6/2022 | B (prensa) | Leí la nota | https://dplnews.com/?p=156100 |
| S13 | eju.tv, entrevista a Daniel Gumucio (AssureSoft) | B (prensa) | Leí la entrevista | https://eju.tv/?p=2875510 |
| S14 | David H. Maister, *Managing the Professional Service Firm* (revisada), Free Press, 9 de junio de 1997, 384 pp., ISBN 9780684834313; y S14b: Frederick P. Brooks, *The Mythical Man-Month: Essays on Software Engineering*, Anniversary Edition (2.ª), Addison-Wesley Professional, 2 de agosto de 1995, ISBN 978-0-201-83595-3 | A (libros) | **Solo fichas de catálogo** (Porchlight Books e InformIT). No leí los libros | https://www.porchlightbooks.com/products/managing-the-professional-service-firm-revised-david-h-maister-9780684834313 y https://www.informit.com/store/mythical-man-month-essays-on-software-engineering-anniversary-9780201835953 |

**Conteo.** 14 fuentes (15 contando S14b como un libro aparte). Nivel A **leídas con contenido**: S1, S2, S3, S5 completas o casi, y S4 en fragmentos: **5**. Nivel A con solo resumen o catálogo: S6, S14, S14b. Se cumple el mínimo de 4 fuentes A leídas, con la salvedad de que S3 es un extracto de personal y S4 y S5 tienen limitaciones (indicadas arriba).

---

## 9. No confirmado

**Cifras y benchmarks**
- **Utilización típica y realización.** Los rangos de 70-80% vienen de una página comercial sin fuente [S10]. Vi por resúmenes de búsqueda (sin abrir) que SPI Research reporta 66,4% de utilización promedio en 2025 y que la encuesta MAP de AICPA da medianas de 48% a 62% en firmas contables chicas de EE. UU.; no abrí ninguno. No encontré un benchmark confiable de realización (tarifa efectiva).
- **Cono de incertidumbre (4x / 0,25x).** Lo vi atribuido a Boehm y en notas de Construx; un resumen indica que los rangos fueron fijados por criterio y no medidos. No abrí el original.
- **Capers Jones: 1% mensual de cambio de requisitos, y 32% de crecimiento promedio de tamaño (survey de 232 proyectos).** Solo en resúmenes de búsqueda y diapositivas; no abrí las fuentes originales.
- **Mantenimiento como más de 50% del costo del ciclo de vida (Lientz y Swanson, 1981).** Solo lo vi en diapositivas de un curso de la Universidad de Washington y en resúmenes. No leí el estudio.
- **Estudio de Gopal et al. (2003):** solo su resumen. No sé cuánto más gana o pierde cada tipo de contrato.
- **Standish CHAOS:** la versión de 1995 está muy criticada; no verifiqué ediciones posteriores.

**Bolivia**
- **Qué norma contable se aplica en Bolivia a los costos de desarrollo de software.** Un resumen de búsqueda indica que Bolivia no adoptó plenamente las NIIF y que las usa solo donde faltan normas locales; no abrí la resolución del CTNAC ni nada oficial. No sé qué trato dan las normas locales vigentes al desarrollo interno de software.
- **Alcance real del aumento del salario mínimo 2026 sobre salarios superiores al mínimo y números de decreto.** La nota de Bloomberg Línea confirma el monto (Bs 3.300, +20%) [S11]; que las empresas no estén obligadas a ajustar salarios superiores al mínimo viene de un resumen de búsqueda de un estudio jurídico (Ferrere), que no abrí, y las fuentes mencionaban números de decreto distintos. El segundo aguinaldo como costo extra se menciona en [S7], pero no verifiqué en qué años aplicó.
- **Restricción de dólares, tipo de cambio paralelo y cambio de régimen en 2026.** Solo vi resúmenes de búsqueda (por ejemplo, un dólar paralelo cerca de Bs 11,20 en marzo de 2025 contra Bs 6,96 oficial). No abrí las notas ni encontré normativa del Banco Central sobre liquidación de divisas por servicios exportados. Por eso la situación 12 describe el riesgo con magnitudes genéricas.
- **Cobros lentos del sector público en Bolivia.** No encontré una fuente que lo cuantifique. La situación 13 usa magnitudes de estimación.
- **Disponibilidad de factoraje de facturas de exportación en Bolivia** (situación 1, opción 4): no lo verifiqué.
- **Cifras actualizadas de exportación de software de Bolivia:** las de [S5] son de 2018-2019; las extraoficiales de 57 millones son una declaración citada de un tercero.
- **Tabla de ITC de [S5]:** mi extracción de la tabla de exportaciones latinoamericanas salió desordenada; no uso esas cifras.
- **Plazo de cobro de Jalasoft:** la serie 139-189 días de [S7] viene de una tabla cuyas columnas (años) no pude etiquetar con seguridad en mi extracción.
- **Rotación de Jalasoft:** el prospecto dice 9,8%, pero también informa 26 altas y 139 bajas en el período; esas dos cifras no parecen coherentes entre sí y no las pude reconciliar (puede que 9,8% sea de otro período o base). Las cito por separado.

**Otros**
- **Libros (Maister, Brooks):** solo fichas de catálogo. Las ideas que les atribuyo (los dos activos de la firma; que sumar gente a un proyecto atrasado lo atrasa) vienen de la descripción del catálogo y de una nota de enciclopedia que vi en la búsqueda, no de haber leído los libros.
- **Efecto real de la IA en precios y horas** (situación 14): [S8] solo confirma que Globant lanzó un modelo por suscripción y redujo su plantilla; el 10-30% de ahorro de horas es estimación mía.
- **Estudios de diseño y agencias creativas:** no relevé fuentes específicas; los indicadores de este documento sirven de forma directa para consultoras y fábricas de software y deberían revisarse para agencias de diseño (por ejemplo, entregas por revisión, derechos de uso).
- **Magnitudes marcadas "estimación" en la sección 5:** son mías y deben calibrarse antes de entrar al motor.
- **Seguro de responsabilidad profesional** (situación 15): no verifiqué que exista o sea común en Bolivia.
