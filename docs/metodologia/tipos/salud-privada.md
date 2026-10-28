# Salud privada (clínicas, consultorios, laboratorios, diagnóstico, farmacias, odontología, telemedicina): ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8, y que yo la abrí y leí (el alcance de lo leído está en esa sección).
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es una cita.
- Una magnitud marcada **(estimación)** la puse yo para que el simulador tenga un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro país, otro año), así que tampoco es un parámetro verdadero para Bolivia hoy.
- "Reconstruida de memoria" significa que la fórmula es práctica común de gestión de servicios de salud y la escribí yo; no la confirmé en una fuente abierta.
- Lo que no pude verificar está en la sección 9. El hallazgo más importante de la búsqueda: **hay muy poca información pública y reciente sobre las clínicas privadas bolivianas** (tarifas, ocupación, cobranza a cajas y aseguradoras). El único estudio de mercado abierto que encontré es de 2015 [S1].

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto de salud privada vende atención de salud a cambio de un pago: consultas, estudios de laboratorio o imagen, cirugías, internación, procedimientos odontológicos, medicamentos en farmacia o consultas a distancia. Se paga de tres maneras principales: el paciente de su bolsillo, una aseguradora privada o plan de salud, o una caja de salud/el Estado.

**Cómo aporta valor.** Según el estudio de mercado de la AEMP (autoridad boliviana de fiscalización de empresas, diciembre de 2015) [S1]:

1. Los servicios privados cubren una demanda de alrededor de 17% de la población (censo 2012): unos 2,6 millones de personas, de las cuales más de 1,7 millones van a centros privados y unas 971 mil tienen seguro de salud privado [S1]. El estudio atribuye el crecimiento al déficit de personal médico y a la saturación de la salud pública [S1].
2. El valor que ofrece la clínica es **capacidad disponible** (consultorios, camas, quirófano, equipos, especialistas) con calidad y rapidez. Bolivia tenía 1,1 camas de hospital por 1.000 habitantes (puesto 147 de 156 países, dato OMS 2015 citado por [S1]).
3. En 2019 se introdujo el Sistema Único de Salud (SUS), con cobertura gratuita para cerca de 50% de la población, según una nota de la OPS [S5]. Eso cambia el mercado: parte de la demanda se queda en lo público, y el privado compite por el paciente que paga o tiene seguro, o se vuelve proveedor del Estado por convenio [S4].

**Por qué es distinto para un simulador.** Una tienda vende unidades y su ingreso depende de la demanda del mes. Una clínica tiene:

- **Capacidad perecedera:** un consultorio vacío una hora o una cama vacía una noche no se recupera (interpretación mía).
- **Ingreso devengado no es caja:** se atiende hoy y se cobra a la caja o aseguradora semanas o meses después. La deuda del Estado con centros de hemodiálisis privados y públicos, reconocida como Bs 500 millones en 2026, con denuncias de hasta 10 meses sin pago, muestra el riesgo [S12].
- **El profesional es el activo:** el AEMP encontró que muchas clínicas "solo cuentan con algunos médicos generales" y que solo dos clínicas de las estudiadas tenían especialistas en planta; muchas tercerizan laboratorio e imagenología. Existen también las "clínicas hotel", que dependen de médicos externos que traen sus pacientes [S1].
- **Regulación y responsabilidad:** se necesita resolución de funcionamiento del SEDES y se responde por el acto médico [S1][S2].
- **Costos importados:** medicamentos e insumos se compran con dólares; en Bolivia el tipo de cambio pasó de fijo a flexible en 2026 y la industria farmacéutica alertó sobre encarecimiento [S13][S14].

---

## 2. Indicadores propios y cómo se calculan

Convención: mes t. Las fórmulas con [S8] están copiadas del glosario de la HFMA (asociación de gestores financieros de salud de EE. UU.), pensadas para hospitales de ese país.

### 2.1 Uso de la capacidad

| Indicador | Qué mide | Fórmula | Fuente |
|---|---|---|---|
| **Ocupación de camas** | Qué parte de las camas disponibles se usó | (días-paciente x 100) / (camas x 365), para un año. Para un mes: días-paciente / (camas x días del mes) | [S8] (versión anual) |
| **Estadía promedio (ALOS)** | Cuántos días se queda un paciente internado | días-paciente / altas totales | [S8] |
| **Ocupación del consultorio** | Qué parte de las horas de consulta disponibles se llenó | consultas realizadas / (consultas por hora x horas disponibles) | Reconstruida de memoria |
| **Utilización de un equipo (tomógrafo, rayos X, ecógrafo)** | Estudios hechos frente a la capacidad | estudios del mes / capacidad máxima del mes | Reconstruida de memoria |
| **Tasa de no-show (inasistencia)** | Citas que no se presentan | citas no atendidas sin aviso / citas agendadas | Concepto en [S7] |
| **Pacientes por día y por consultorio** | Volumen básico | consultas del mes / (días atendidos x consultorios) | Reconstruida de memoria |

Dato de contexto: el estudio de AEMP trae el número de estudios por clínica de varios equipos (electrocardiograma, tomografía, etc.), pero no calculé utilización a partir de eso porque no trae la capacidad de cada equipo [S1].

### 2.2 Ingreso y margen

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Ingreso por atención** | ingreso del servicio / atenciones del servicio | Reconstruida de memoria |
| **Mix de servicios** | participación de cada línea (consulta, laboratorio, imagen, cirugía, internación, farmacia) en el ingreso total | Concepto; AEMP distingue segmentos por ingreso: clínicas de 2.º y 3.er nivel 53%, especializadas 26%, diagnóstico ambulatorio 11%, imagenología 2% (de las empresas que concentran 75-80% de ingresos, datos 2014) [S1] |
| **Mix de pagadores** | participación del ingreso (o de las atenciones) por pagador: bolsillo, aseguradora, caja de salud, Estado | Concepto; en Bolivia coexisten seis cajas de salud (la CNS con 85% de la cobertura de seguridad social) y aseguradoras privadas [S1] |
| **Margen operativo** | (ingresos operativos - gastos operativos) / ingresos operativos | [S8] |
| **Costo por cama-día** | costos totales de internación / días-paciente | Reconstruida de memoria |

### 2.3 Caja y cobranza

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Días de cuentas por cobrar** | (cuentas por cobrar de pacientes x 365) / ingresos netos por pacientes | [S8] |
| **Días por pagador** | lo anterior calculado por separado para cada caja o aseguradora | Interpretación mía, usando [S8] y la evidencia de atrasos por pagador en [S10][S12] |
| **Plazo promedio de pago a proveedores** | (pasivos corrientes x 365) / (gastos operativos - depreciación) | [S8] |
| **Razón corriente** | activos corrientes / pasivos corrientes | [S8] |
| **Edad promedio de la planta** | depreciación acumulada / gasto de depreciación | [S8]: un valor alto señala necesidad próxima de renovar equipos |
| **Cobertura del servicio de deuda** | ingreso neto disponible para deuda / (capital + intereses) | [S8] |

Nota: la mora de las EPS con clínicas en Colombia se mide como porcentaje de la cartera vencida; la ACHC reportó 58% a diciembre de 2025 y que cerca de la mitad de los activos de las IPS son cuentas por cobrar [S10]. Es otro país, pero ilustra la magnitud posible.

### 2.4 Costeo por servicio

El método de costos por tiempo (TDABC) de Kaplan y Porter propone calcular el costo de cada paso de atención con dos datos: el costo de cada recurso y el tiempo que el paciente usa ese recurso; luego se estima la capacidad de cada recurso y se calcula la **tasa de costo de capacidad** [S9]. Fórmula (reconstruida de memoria; la fuente abierta que leí es una síntesis de terceros y no la escribe): tasa de capacidad = costo de suplir el recurso por período / minutos prácticos disponibles. Costo de la atención = suma de (minutos usados x tasa de cada recurso).

### 2.5 Calidad y reputación

Indicadores típicos: satisfacción o recomendación (la HFMA lista una pregunta de HCAHPS: si el paciente recomendaría el hospital [S8]), tiempo de espera, reclamos por 1.000 atenciones, reingresos, infecciones. No encontré una fuente boliviana con estas tasas. En el simulador se pueden resumir en un índice de reputación (sección 6).

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Resumen.** El VAN sigue siendo la base (inversión inicial grande en infraestructura y equipos, flujos futuros, descuento). Lo que cambia es **cómo se construye el flujo**: no es "pacientes x tarifa" parejo, sino capacidad, ocupación, mix de pagadores con demoras de cobro distintas, profesionales y equipos que se renuevan.

**Por qué el VAN con ingreso plano falla aquí:**

1. **Capacidad fija y costos fijos altos.** Personal, alquiler y depreciación se pagan haya o no pacientes. Un cambio pequeño en ocupación mueve mucho el resultado (interpretación mía). El único cálculo de punto de equilibrio de equipo que abrí es de un estudio de simulación sobre una sala de endoscopía de EE. UU. [S7], que no es comparable en cifras, pero sí en idea: el resultado depende de cuántos turnos se llenan.
2. **Ingreso devengado versus caja cobrada.** Si la caja de salud o el Estado paga con meses de atraso [S12], un proyecto con VAN positivo puede quebrar por falta de capital de trabajo. En Colombia, la deuda de las EPS con clínicas y hospitales llegó a COP 25,7 billones con 58% en mora en diciembre de 2025 [S10]. Hay que modelar **días de cobro por pagador**.
3. **Reinversión en equipos.** Los equipos médicos se vuelven obsoletos; la HFMA incluye el indicador de edad de la planta justamente por eso [S8]. El AEMP señala que centros que fueron buenos requieren renovar infraestructura y equipos [S1]. El flujo debe incluir renovación, no solo la compra inicial.
4. **Riesgo de cambio.** Insumos y equipos se compran en dólares mientras las tarifas se cobran en bolivianos [S13][S14].
5. **Valor residual y marca.** La reputación de una clínica no se registra en el balance, pero determina cuántos pacientes llegan (interpretación mía).

**Qué agregar al análisis:**

| Complemento | Qué responde | Fuente |
|---|---|---|
| Punto de equilibrio en atenciones o en ocupación | Cuántas consultas, estudios o días-cama hay que vender para cubrir costos | Práctica general (reconstruida de memoria) |
| Flujo de caja con días de cobro por pagador | Cuánto capital de trabajo hace falta | [S8] para el indicador; [S10][S12] para la evidencia |
| Costo por servicio (TDABC) | Qué servicio gana y cuál pierde plata | [S9] |
| Sensibilidad a ocupación, mix de pagadores, tipo de cambio y tarifa | Qué variable mueve más el resultado | Interpretación mía |
| Margen operativo y razón corriente | Salud financiera continua | [S8] |
| Plan de renovación de equipos con edad de planta | Cuándo hay que reinvertir | [S8] |

**Lo que no se debe hacer:** comparar la ocupación de un consultorio nuevo con la de una clínica de referencia consolidada. La reputación se construye en años (interpretación mía).

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Nota de método: no encontré un estudio sobre errores de proyectos de salud privada en Bolivia. La lista mezcla lo que dicen las fuentes (marcado) con práctica común o interpretación mía.

**Errores de cálculo (estudiantes)**

1. **Ocupación al 100% o muy alta desde el mes 1.** La reputación y la derivación de médicos toman tiempo (interpretación mía).
2. **Ingreso igual a caja.** Suponer que cada atención se cobra el mismo mes, ignorando que cajas, aseguradoras o el Estado pagan con demora [S10][S12].
3. **Una sola tarifa para todos los pagadores.** Cada aseguradora o caja negocia tarifas distintas (interpretación mía; el AEMP notó que los precios varían entre clínicas y ciudades [S1]).
4. **No considerar el no-show.** Una sala de endoscopía simulada perdió 16,4% de su beneficio esperado con 18% de inasistencia; sobreagendar 9 pacientes por día compensó la pérdida en ese modelo [S7]. Es un modelo de otro país, pero muestra que ignorar el no-show infla el ingreso.
5. **Olvidar la renovación de equipos y el mantenimiento.** [S8][S1].
6. **Costo del personal como fijo único.** Médicos en honorarios por acto, enfermería por turno y administrativos tienen estructuras distintas (interpretación mía).
7. **No incluir capital de trabajo para cubrir el arranque.** (Las plantillas del simulador ya cuentan con un colchón de caja.)
8. **Olvidar la habilitación.** Presupuestar el local y los equipos sin el costo ni el plazo de cumplir con el SEDES (sección 5, situación 6).

**Errores de emprendedores**

1. **Operar sin resolución de funcionamiento.** El SEDES de Cochabamba dijo en 2014 que por cada clínica privada habilitada hay otra sin resolución; el SEDES de Santa Cruz estimó que 50% de los nuevos servicios no cumplía las exigencias [S1].
2. **Comprar equipo de alta gama sin demanda asegurada.** Interpretación mía; el AEMP muestra que muchas clínicas tercerizan imagenología y laboratorio en lugar de tener el equipo [S1].
3. **Depender de uno o dos médicos estrella** (modelo clínica hotel) [S1].
4. **Depender de un solo pagador** (una caja o el Estado) sin mirar la deuda acumulada [S12].
5. **Exigir garantía o retener al paciente.** El AEMP observó clínicas que piden depósito de garantía previo a la internación y lo cuestionó con base en el derecho a la salud [S1]. La jurisprudencia constitucional boliviana, según una nota de 2026, impide retener a un paciente para cobrar y obliga a cobrar por vías legales [S16].
6. **Ignorar la responsabilidad profesional.** La mala praxis carece de tipo penal específico en Bolivia y se procesa con tipos genéricos [S6], lo que da incertidumbre al operador (sección 5, situación 7).
7. **No cubrir el riesgo cambiario** en insumos importados [S13][S14].

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **[Sn]** si viene de fuente, **(estimación)** si es mía); decisiones del alumno con ventajas y costos; qué aprende.

Las magnitudes de las fuentes vienen de otros países o fechas. Se usan como orden de magnitud. Las marcadas "estimación" son mías y requieren calibración local (sección 10).

---

### Situación 1. La caja de salud o el Estado se atrasa en el pago

**Qué pasa.** Una parte importante de tus pacientes llega por convenio con una caja de salud o un programa del Estado. Tú atiendes y facturas, pero el pago llega meses después, a veces en cuotas, y los expedientes se devuelven por errores en la documentación. En Bolivia, el Ministerio de Salud reconoció en julio de 2026 una deuda de Bs 500 millones con centros públicos y privados de hemodiálisis, oncología y neonatología, con denuncias de hasta 10 meses de impago y pagos "progresivos" [S12].

**Variables que mueve.**
- Días de cobro del pagador: sube (de 30-60 a 120-300 días; en [S12] se citan hasta 10 meses; el rango del simulador es estimación).
- Caja: baja de golpe porque el costo (insumos, sueldos) se paga hoy.
- Cuentas por cobrar: sube, aunque el ingreso contable no cambie.
- Ingreso devengado: no cambia (el problema es de caja).
- Riesgo de rechazo de expedientes: sube si la documentación es débil [S12].

**Decisiones del alumno.**
1. *Seguir atendiendo al pagador y financiarte con crédito bancario.* Ventaja: mantienes el volumen y el vínculo. Costo: pagas intereses; si el atraso se prolonga, el crédito se agota.
2. *Reducir cupos o dejar de atender al pagador atrasado.* Ventaja: dejas de acumular cartera dudosa. Costo: pierdes pacientes y ocupación; el costo fijo sigue (en Colombia, la Clínica Bolivariana dejó de aceptar nuevos pacientes de una EPS cuando la deuda llegó a COP 43.663 millones [S17]).
3. *Invertir en facturación y cumplimiento documental (personal de auditoría de cuentas).* Ventaja: menos expedientes devueltos [S12]. Costo: gasto fijo adicional, y no elimina el atraso de fondo.
4. *Dar prioridad a pacientes de bolsillo y aseguradora privada.* Ventaja: cobro rápido y caja sana. Costo: renuncias a volumen, y la capacidad ociosa pesa en el margen.

**Qué aprende.** Que ingreso no es caja, que el pagador importa tanto como el paciente y que hay que dimensionar capital de trabajo.

---

### Situación 2. Una aseguradora o plan de salud renegocia tarifas o la red de proveedores

**Qué pasa.** En Bolivia, las comercializadoras de planes de salud venden paquetes a empresas y subcontratan a clínicas; el AEMP encontró que una de ellas llegó a ser la cuarta empresa en ingresos de Santa Cruz, y que este tipo de empresas concentra gran parte de los ingresos del sector [S1]. Una aseguradora te ofrece mantenerte en su red a una tarifa menor, o a cambio de volumen, y tiene poder de negociación.

**Variables que mueve.**
- Pacientes derivados por la aseguradora: sube (estimación: +10% a +30% de las atenciones).
- Tarifa media por atención: baja (estimación: -10% a -25%).
- Dependencia de un pagador: sube.
- Días de cobro: depende del contrato (estimación: 30 a 90 días).

**Decisiones del alumno.**
1. *Aceptar la tarifa menor por el volumen.* Ventaja: llenas capacidad ociosa. Costo: margen por atención baja; si el costo de insumos sube (situación 3), puedes atender con pérdida.
2. *Negociar una tarifa por paquete (por ejemplo, parto o apendicitis a precio cerrado).* Ventaja: previsibilidad. Costo: asumes el riesgo de complicaciones, que cuestan más que el paquete (el costo real de un cuadro clínico es único para cada paciente, según [S1]).
3. *Rechazar y concentrarte en pacientes de bolsillo.* Ventaja: mantienes tarifa y cobro inmediato. Costo: pierdes volumen y queda capacidad vacía.
4. *Aceptar solo con cláusula de pago a 30 días y ajuste por tipo de cambio.* Ventaja: protege caja y margen. Costo: la aseguradora puede preferir a otra clínica.

**Qué aprende.** Que el volumen a precio bajo no siempre conviene, y que la negociación con el pagador es parte del proyecto.

---

### Situación 3. Dólar flexible: insumos y medicamentos importados se encarecen

**Qué pasa.** Una parte grande de los medicamentos, descartables, reactivos y repuestos se importa. En abril de 2025 la Cámara de la Industria Farmacéutica Boliviana (Cifabol) declaró emergencia por falta de dólares, y el Colegio Médico dijo que algunos fármacos habían subido entre 100% y 150% y podían llegar a 300% o 400% [S13]. En julio de 2026, con el dólar flexible en Bs 11,21, Cifabol advirtió que el encarecimiento de materias primas podría trasladarse a los precios en semanas [S14]. Las tarifas de las clínicas se cobran en bolivianos y muchas veces están pactadas con aseguradoras o cajas.

**Variables que mueve.**
- Costo de insumos y medicamentos: sube (rangos de [S13] para medicamentos: 100% a 150%; para el simulador, estimación de +15% a +60% en el costo de insumos de la clínica, porque los insumos son una parte del costo total).
- Margen bruto: baja si no puedes subir tarifas.
- Desabastecimiento: sube la probabilidad de no poder hacer procedimientos.
- Costo de equipos nuevos y repuestos: sube.

**Decisiones del alumno.**
1. *Subir tarifas al paciente de bolsillo.* Ventaja: protege el margen. Costo: baja la demanda y el boca a boca; las tarifas pactadas con cajas/aseguradoras no se mueven.
2. *Comprar stock grande de insumos por adelantado.* Ventaja: cubre meses de precio viejo. Costo: inmoviliza caja y hay riesgo de vencimiento.
3. *Cambiar a proveedores nacionales o genéricos.* Ventaja: pagas en bolivianos. Costo: puede haber menos variedad o calidad percibida, y los médicos tienen preferencias de marca.
4. *Absorber el costo y esperar que baje.* Ventaja: no pierdes pacientes. Costo: el margen se erosiona; si dura, el proyecto pierde dinero por atención.

**Qué aprende.** Que el riesgo cambiario de una clínica está en el costo de sus insumos, y que hay que revisar cláusulas de ajuste en cada contrato.

---

### Situación 4. Comprar un equipo de alto costo (tomógrafo, resonancia, laboratorio automatizado) o tercerizar

**Qué pasa.** Un proveedor te ofrece un tomógrafo. Atrae pacientes y médicos, pero cuesta mucho, y su rentabilidad depende de cuántos estudios se hagan por mes. El AEMP observó que en el sector hay una tendencia a **tercerizar** laboratorio e imagenología, dejando de lado el equipamiento propio [S1]. No encontré datos abiertos de utilización de equipos en Bolivia.

**Variables que mueve.**
- Inversión inicial: sube mucho (estimación según tipo de equipo).
- Ingreso por estudios: sube con la utilización. Punto de equilibrio: depende del precio y del volumen (estimación).
- Costos fijos (mantenimiento, técnico, contrato de servicio, depreciación): sube.
- Atractivo para médicos y para la reputación: sube.
- Riesgo cambiario en repuestos: sube.

**Decisiones del alumno.**
1. *Comprar el equipo nuevo.* Ventaja: control, margen completo y diferenciación. Costo: capital y deuda; si la utilización queda debajo del equilibrio, pierdes dinero cada mes.
2. *Comprarlo usado o reacondicionado.* Ventaja: menor inversión. Costo: más paradas por falla y menos vida útil (en un estudio coreano de CT del que no tengo texto abierto, las paradas fueron la causa de la baja rentabilidad; ver sección 9).
3. *Alianza con un centro de imagen que opere dentro de tu clínica y se quede con un porcentaje.* Ventaja: sin inversión. Costo: cedes margen y dependes del socio.
4. *Tercerizar los estudios y cobrar solo la consulta y el seguimiento.* Ventaja: sin capital. Costo: el paciente puede quedarse con el centro de imagen, y pierdes ingresos accesorios.

**Qué aprende.** A calcular el punto de equilibrio de un equipo por volumen, y a tratar la compra como una apuesta sobre la demanda futura.

---

### Situación 5. Un médico clave se va, o pide más honorarios

**Qué pasa.** Un especialista que trae muchos pacientes amenaza con irse a otra clínica o abrir su propio consultorio, o pide un porcentaje mayor de los honorarios. En el modelo de "clínica hotel" los médicos externos generan la venta del servicio [S1]. El AEMP también registró que pocas clínicas tienen especialistas en planta [S1].

**Variables que mueve.**
- Pacientes derivados por ese médico: baja si se va (estimación: 5% a 25% de las atenciones de la clínica, según su peso).
- Costo del personal médico: sube si le aceptas.
- Dependencia de un profesional: sube o baja según tu respuesta.
- Reputación: baja si se va con mala imagen.

**Decisiones del alumno.**
1. *Aceptar su pedido de honorarios mayores.* Ventaja: lo retienes. Costo: el margen baja y otros médicos pedirán lo mismo.
2. *Ofrecerle exclusividad con sueldo fijo.* Ventaja: cierra el riesgo de que se vaya. Costo: pagas aunque no haya pacientes y asumes costo fijo (el AEMP indica que pocas clínicas lo hacen [S1]).
3. *Dejarlo ir y reemplazarlo con dos médicos de menor trayectoria.* Ventaja: reduces dependencia. Costo: baja la reputación y los pacientes que lo seguían.
4. *Darle participación (porcentaje del servicio o parte de las ganancias de su unidad).* Ventaja: alinea incentivos. Costo: cedes ingreso futuro y complicas la contabilidad.

**Qué aprende.** Que el profesional es el activo clave y hay que decidir cuánto del riesgo se asume en fijo y cuánto en variable.

---

### Situación 6. Inspección del SEDES y renovación de la resolución de funcionamiento

**Qué pasa.** El SEDES supervisa que cada centro, público o privado, cumpla los requisitos básicos de su especialidad, y para abrir exige la resolución de funcionamiento, que según el AEMP deben renovar cada año los establecimientos [S1]. Ese estudio dice que se han hallado quirófanos precarios clausurados, falta de unidades transfusionales y de centrales de esterilización, y que el SEDES de Santa Cruz estimó que cerca de 50% de los nuevos servicios no cumplía las exigencias [S1]. En el proyecto, una observación obliga a invertir o a cerrar un servicio.

**Variables que mueve.**
- Costo de adecuación (esterilización, señalética, residuos, bioseguridad): sube (estimación: 3% a 10% de la inversión inicial).
- Servicio clausurado: ingresos de ese servicio caen a cero mientras dure (estimación: 1 a 3 meses).
- Riesgo de multa o clausura: sube si no cumples.
- Reputación: baja si hay clausura pública.

**Decisiones del alumno.**
1. *Adecuar de inmediato todo lo observado.* Ventaja: cumples y reduces riesgo futuro. Costo: gasto grande de una vez y posible pausa de servicios.
2. *Priorizar lo exigido por la inspección y programar el resto.* Ventaja: reparte el gasto. Costo: el resto queda como pasivo y puede ser observado de nuevo.
3. *Contratar un consultor de habilitación desde el inicio.* Ventaja: menos errores y plazos más cortos. Costo: honorarios fijos.
4. *Operar con observaciones pendientes confiando en que no haya otra inspección.* Ventaja: ahorras. Costo: riesgo de clausura y de ser noticia; es la conducta que [S1] describe como frecuente y que genera el problema.

**Qué aprende.** Que cumplir la normativa es un costo recurrente, y que operar sin habilitación es un riesgo que se materializa de golpe.

---

### Situación 7. Denuncia por mala praxis y auditoría médica

**Qué pasa.** Un paciente o su familia denuncia que una complicación fue negligencia. La Ley 3131 del Ejercicio Profesional Médico (2005) rige para el sector público, la seguridad social y el privado con y sin fines de lucro; define la auditoría médica como un procedimiento técnico para emitir un dictamen independiente sobre el acto médico y la gestión de calidad, a cargo de médicos acreditados [S2]. Para el derecho penal, Campos (2025) señala que Bolivia carece de un tipo penal específico de mala praxis y que debe usarse tipos genéricos, lo que crea dificultades para definir la responsabilidad [S6]. Los documentos médicos (historia clínica, consentimiento informado, hoja anestésica, epicrisis) están bajo custodia del establecimiento [S2].

**Variables que mueve.**
- Costos legales y de peritaje: suben (estimación).
- Indemnización o acuerdo: sube (estimación, depende del caso).
- Reputación: baja (estimación: -5 a -25 puntos de un índice de 100, según difusión).
- Pacientes nuevos: bajan por uno a tres meses (estimación).
- Tiempo directivo: se desvía.

**Decisiones del alumno.**
1. *Cooperar con la auditoría y documentar todo.* Ventaja: si el acto fue correcto, la historia clínica te protege. Costo: tiempo, y si hay falla, queda expuesta.
2. *Ofrecer una compensación económica rápida para cerrar el caso.* Ventaja: evita publicidad y juicio largo. Costo: puede interpretarse como admisión y atraer otros reclamos.
3. *Contratar un seguro de responsabilidad profesional.* Ventaja: transfiere parte del riesgo. Costo: prima recurrente (no encontré datos de este seguro en Bolivia; sección 9).
4. *Defenderte en juicio y comunicar públicamente que actuaste según protocolo.* Ventaja: protege a tu equipo. Costo: gastos legales largos y exposición mediática.

**Qué aprende.** Que la documentación clínica y los protocolos son protección económica, y que el riesgo de reputación puede pesar más que la indemnización.

---

### Situación 8. Paciente que no paga la cuenta de internación

**Qué pasa.** Un paciente sin seguro termina una internación o cirugía y no puede pagar. La tentación es retenerlo. La jurisprudencia constitucional (SCP 0111/2021-S3, según una nota de Red Uno de 2026) establece que la libertad de una persona no puede depender del pago de una deuda y que la clínica debe cobrar por vías legales [S16]. El AEMP ya observaba en 2015 que algunas clínicas exigían depósito de garantía previo a la internación y lo cuestionó por el derecho de acceso a la salud, y que las clínicas no tienen trabajadores sociales ni política formal de descuentos [S1]. La Ley 3131 impide negar atención básica de urgencia [S2].

**Variables que mueve.**
- Cuentas incobrables: sube (estimación: 1% a 5% del ingreso de pacientes de bolsillo).
- Caja: baja el mes de la deuda.
- Reputación: baja si el caso se difunde.
- Costo legal: sube si demandas.

**Decisiones del alumno.**
1. *Exigir garantía o depósito antes de internar (salvo urgencias).* Ventaja: reduce incobrables. Costo: algunos pacientes se van a otra clínica y recibes críticas [S1].
2. *Plan de pagos a cuotas con pagaré.* Ventaja: recuperas la mayor parte con el tiempo. Costo: demora de caja, administración y algún incumplimiento.
3. *Crear un fondo de descuentos y un trabajador social para evaluar casos.* Ventaja: reduce conflictos y mejora la imagen. Costo: gasto fijo, e ingreso no cobrado.
4. *Demandar por la vía legal.* Ventaja: te amparas en la ley. Costo: lento, caro, con baja probabilidad de cobrar y mala imagen.

**Qué aprende.** Que la liquidez se protege antes de prestar el servicio, no después, y que existen límites legales y éticos al cobro.

---

### Situación 9. Inasistencia a citas (no-show) y desperdicio de turnos

**Qué pasa.** Una parte de los pacientes agendados no llega. Un modelo de simulación de una sala de endoscopía de EE. UU. con 18% de no-show (rango 12-24%) estimó pérdidas de 16,4% del beneficio esperado diario (USD 725 sobre USD 4.433 con asistencia perfecta); reducir el no-show con recordatorios recuperó entre 3,8% y 10,5%, y sobreagendar 9 pacientes por día compensó la pérdida en ese modelo [S7]. Para Bolivia no encontré datos de no-show.

**Variables que mueve.**
- Tasa de no-show: 10% a 25% (rango de [S7] 12-24% en otro contexto; Bolivia es estimación).
- Ingreso de consultorio: baja con el no-show.
- Tiempo de espera y horas extra: suben con el sobreagendamiento [S7].
- Satisfacción: baja con esperas largas.

**Decisiones del alumno.**
1. *Sobreagendar un poco (por ejemplo, 10% más de citas).* Ventaja: según [S7], es más barato que reducir el no-show. Costo: cuando todos llegan, hay esperas largas y médicos con sobrecarga, y la reputación baja.
2. *Recordatorios por mensaje y confirmación previa.* Ventaja: baja el no-show sin aumentar esperas. Costo: costo de mensajería o personal; en [S7] recuperó una porción modesta.
3. *Cobrar un anticipo o seña por la cita.* Ventaja: compromete al paciente. Costo: puede espantar pacientes nuevos; fricción de cobro.
4. *No hacer nada y absorber el hueco.* Ventaja: simple y sin costo. Costo: capacidad perdida cada día.

**Qué aprende.** Que cada turno vacío es ingreso perdido para siempre y que hay un dilema entre aprovechar la capacidad y la experiencia del paciente.

---

### Situación 10. Pico estacional de demanda (infecciones respiratorias, brotes) que satura la capacidad

**Qué pasa.** En meses fríos o ante un brote, la demanda sube en varias semanas. El AEMP notó que las infecciones respiratorias agudas ocupan los primeros lugares en morbilidad en Bolivia, pero se atienden sobre todo en centros públicos y no en clínicas privadas [S1]. Para una clínica privada el pico puede ser una oportunidad (más consultas y estudios) o un problema (falta de personal e insumos). La estacionalidad exacta en Bolivia no la verifiqué (sección 9).

**Variables que mueve.**
- Demanda de consultas y laboratorio: sube (estimación: +20% a +50% por 1 a 3 meses).
- Ocupación de camas y consultorios: sube.
- Consumo de insumos: sube; riesgo de faltante (situación 3).
- Costo de horas extra: sube.
- Calidad percibida: baja si la espera es larga.

**Decisiones del alumno.**
1. *Contratar personal temporal y comprar más insumos.* Ventaja: capturas la demanda. Costo: costo fijo temporal; si el pico es menor al esperado, sobra personal.
2. *Extender horarios con el personal actual.* Ventaja: sin contratación nueva. Costo: cansancio, errores y rotación (interpretación mía).
3. *Subir tarifas durante el pico.* Ventaja: capturas el exceso de demanda con margen. Costo: reputación de "aprovechamiento" y, en caso de seguros, tarifas pactadas.
4. *Mantener la capacidad y derivar el exceso a otros centros.* Ventaja: protege calidad. Costo: pierdes ingresos, y los pacientes derivados pueden no volver.

**Qué aprende.** A dimensionar capacidad entre el promedio y el pico, y que atender más no siempre es mejor.

---

### Situación 11. Reputación: comentario en redes o recomendación boca a boca

**Qué pasa.** Una experiencia mala (espera larga, cobro sorpresa, trato) se hace viral, o al revés, un buen caso resuelto se recomienda. En salud, la confianza pesa más que en otros rubros. El AEMP menciona que las clínicas buscan acreditaciones internacionales para dar prestigio y confianza al paciente [S1]. No encontré datos medidos de boca a boca en salud en Bolivia.

**Variables que mueve.**
- Índice de reputación: sube o baja (estimación: ±5 a ±20 puntos).
- Pacientes nuevos por mes: cambia con rezago de 1 a 3 meses (estimación: ±10% a ±30%).
- Costo de adquirir un paciente (publicidad): baja si la reputación es alta (interpretación mía).

**Decisiones del alumno.**
1. *Responder públicamente y resolver el caso con una compensación.* Ventaja: muestra apertura. Costo: dinero y precedentes.
2. *Invertir en experiencia del paciente (tiempos de espera, señalización, trato).* Ventaja: efecto duradero. Costo: gasto fijo con retorno lento.
3. *Buscar una acreditación de calidad.* Ventaja: diferenciación y confianza [S1]. Costo: inversión, tiempo y exigencias recurrentes.
4. *Ignorar el comentario y esperar que se olvide.* Ventaja: sin costo. Costo: puede crecer y dañar la marca.

**Qué aprende.** Que la reputación es un activo medible por sus efectos en demanda, y que protegerla cuesta antes de la crisis.

---

### Situación 12. Paro médico, bloqueos o conflicto que altera el personal y la logística

**Qué pasa.** El Colegio Médico de Bolivia convocó paros de 24 y 48 horas y un paro indefinido en 2019, y la Caja Nacional de Salud acató paros en 2021; en una nota de 2019 se indica que las clínicas privadas atenderían con normalidad durante el paro [búsqueda web; no abrí esas notas, ver sección 9]. Para una clínica privada un paro del sector público puede significar más pacientes (oportunidad), pero un bloqueo de carreteras o una huelga de transporte afecta insumos y personal. Esta situación combina ambos efectos; la frecuencia actual no la verifiqué.

**Variables que mueve.**
- Demanda: sube si cierra la salud pública (estimación: +10% a +30% por días).
- Personal que llega al trabajo: baja si hay bloqueo.
- Costos logísticos: suben.
- Presión sobre tarifas: sube la acusación de "aprovechamiento".

**Decisiones del alumno.**
1. *Reforzar turnos y atender el desborde.* Ventaja: ingresos extra y posicionamiento. Costo: sobrecarga y horas extra.
2. *Mantener el ritmo normal y solo atender urgencias.* Ventaja: estabilidad. Costo: pierdes pacientes que no vuelven.
3. *Crear un convenio con un hospital público para derivaciones pagadas.* Ventaja: volumen programado. Costo: dependes del pagador estatal (situación 1).
4. *Tener stock de seguridad de insumos y transporte propio para el personal.* Ventaja: continuidad. Costo: capital inmovilizado y gasto fijo.

**Qué aprende.** Que los conflictos externos afectan demanda y costos a la vez, y que la continuidad tiene costo.

---

### Situación 13. Convenio con el Estado para atender a población del SUS

**Qué pasa.** Cuando los servicios públicos son insuficientes, el reglamento de la Ley 475 (DS 1984) permite que establecimientos privados presten servicios por convenio con gobiernos municipales o autonomías indígenas; se aplican los aranceles de cada establecimiento privado, se paga por prestación otorgada de forma mensual y se debe emitir factura al municipio [S4]. Es una oportunidad de volumen con riesgo de pago (situación 1).

**Variables que mueve.**
- Atenciones por convenio: sube (estimación: +15% a +50% de las atenciones).
- Tarifa media: depende de lo pactado (aranceles); puede bajar frente a la tarifa privada (estimación).
- Días de cobro: suben (estimación: 60 a 240 días; ver [S12]).
- Carga administrativa: sube (facturas, informes).

**Decisiones del alumno.**
1. *Firmar el convenio para llenar capacidad ociosa.* Ventaja: volumen estable. Costo: pagos tardíos, dependencia política y tarifas bajas.
2. *Firmar con límite de cupo (por ejemplo, 20% de la capacidad).* Ventaja: limita el riesgo. Costo: menos volumen; el pagador puede pedir más.
3. *No firmar y apostar a pacientes de bolsillo y aseguradoras.* Ventaja: caja sana. Costo: capacidad ociosa si la demanda privada es chica.
4. *Firmar solo para servicios de alta complejidad con mejor tarifa.* Ventaja: mejor margen por atención. Costo: riesgo de procedimientos costosos que el Estado paga tarde.

**Qué aprende.** Que el volumen público es una decisión de riesgo de cobro y de uso de la capacidad, no solo de ingresos.

---

### Situación 14. Ampliar a una nueva especialidad o abrir una segunda sede

**Qué pasa.** El AEMP muestra que las clínicas privadas ofrecen cerca de 60 especialidades y que la tendencia es a ampliar especialidades y subespecialidades, con clínicas especializadas en nefrología, neurocirugía, cirugía estética, salud oral e imagen [S1]. Te proponen sumar una especialidad, o abrir una sede en otra ciudad. El estudio también observa que los costos en Santa Cruz son mucho más altos que en La Paz y Cochabamba, y que algunos pacientes viajan a otras plazas buscando costos más bajos [S1].

**Variables que mueve.**
- Inversión: sube (estimación según servicio).
- Atenciones nuevas: suben con retraso de 6 a 18 meses (estimación).
- Costos fijos: suben.
- Riesgo de dispersión de gestión: sube.

**Decisiones del alumno.**
1. *Abrir la nueva especialidad con un médico líder y equipo mínimo.* Ventaja: inversión moderada. Costo: depende de una persona (situación 5).
2. *Esperar a tener ocupación estable en lo actual antes de crecer.* Ventaja: reduce riesgo de caja. Costo: puede perder la ventana ante un competidor.
3. *Abrir una sede en otra ciudad con un socio local.* Ventaja: comparte capital y conoce el mercado. Costo: cedes control y ganancias.
4. *Alquilar consultorios a médicos externos (modelo clínica hotel).* Ventaja: sin contratar planilla y con ingreso por alquiler y servicios [S1]. Costo: menos control de calidad, y menos fidelidad del paciente a la clínica.

**Qué aprende.** Que crecer consume caja antes de producir ingresos y que hay modelos con distinto grado de riesgo y control.

---

### Situación 15. Telemedicina o farmacia propia como línea complementaria

**Qué pasa.** Se puede sumar consulta virtual (telemedicina) o una farmacia propia. Sobre telemedicina, la búsqueda mostró que en Bolivia existe un Programa Nacional de Telesalud público, pero no encontré una norma vigente que regule la consulta virtual privada (sección 9). Sobre farmacia, el reglamento del medicamento (DS 25235) define la farmacia como el establecimiento para preparar recetas magistrales y vender medicamentos con registro sanitario; exige solicitud de apertura y contrato de trabajo de un regente farmacéutico titulado [S3]; permite funcionamiento de 24 horas con presencia del profesional farmacéutico; hace obligatorio el turno de 24 horas, y sanciona la venta de medicamentos vencidos, sin registro sanitario o de proveedor no acreditado [S3].

**Variables que mueve.**
- Ingreso nuevo (consultas virtuales o venta de medicamentos): sube (estimación).
- Costo de regente, inventario y sistema: sube.
- Margen de farmacia: sensible al tipo de cambio (situación 3).
- Riesgo regulatorio: sube con la farmacia por la obligación de regente, turnos y control de vencimientos [S3].

**Decisiones del alumno.**
1. *Lanzar telemedicina para seguimiento y consultas simples.* Ventaja: poca inversión y atiende a pacientes de otras ciudades. Costo: no se puede examinar al paciente; el riesgo de responsabilidad no está bien definido.
2. *Abrir farmacia interna.* Ventaja: ingreso adicional y comodidad del paciente. Costo: capital en inventario, regente y exposición a vencimientos y a precios en dólares [S3].
3. *Alianza con una farmacia externa en el edificio.* Ventaja: sin inventario, ingreso por alquiler o comisión. Costo: menor margen y menos control.
4. *No ampliar y concentrar recursos en el servicio principal.* Ventaja: foco. Costo: se pierde ingreso complementario.

**Qué aprende.** Que cada línea nueva trae reglas y riesgos propios, y que más líneas no es sinónimo de más rentabilidad.

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

Idea general (interpretación mía): hoy el motor tiene caja, ingresos, costos y reputación. Para salud privada conviene sumar variables de capacidad, de pagador y de cumplimiento. Cada una se actualiza una vez por mes.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| **Capacidad instalada** | Consultas/mes que caben (consultorios x horas x consultas por hora) y camas x días | Fija; cambia al sumar consultorios, camas o equipos, o al perder un médico |
| **Demanda potencial** | Pacientes que quieren atenderse | Base x estacionalidad x reputación x efecto precio x efecto competidores |
| **Atenciones realizadas** | Pacientes efectivamente atendidos | mín(demanda, capacidad) x (1 - no-show), con ajuste por sobreagendamiento |
| **Ocupación (consultorio, cama, equipo)** | Uso de la capacidad | atenciones / capacidad, según fórmula 2.1 |
| **Mix de pagadores** | Participación del bolsillo, aseguradora, caja y Estado en las atenciones | Base inicial; cambia por convenios firmados o cancelados (situaciones 1, 2, 13) |
| **Tarifa por pagador** | Precio efectivo por atención según pagador | Tarifa lista x ajustes pactados; se ajusta por decisiones de precio |
| **Días de cobro por pagador y cuentas por cobrar** | Demora de cada pagador | Cada mes: ingreso devengado de cada pagador entra a caja después de sus días de cobro; el resto queda en cuentas por cobrar; eventos de atraso alargan los días |
| **Cartera incobrable** | Parte del ingreso que no se cobra | % del ingreso de bolsillo e internación, modulado por política de garantía |
| **Dependencia médica** | Parte de las atenciones que depende de uno o dos profesionales | Se recalcula por contratos; si un médico se va, esa fracción de demanda se pierde con rezago |
| **Costo de insumos en dólares** | Peso de insumos importados en el costo variable | costo base x (tipo de cambio del mes / tipo de cambio inicial) x participación importada |
| **Tipo de cambio efectivo** | Costo de la divisa para la clínica | Serie con eventos (situación 3) |
| **Utilización y antigüedad del equipo** | Uso y vida del equipo de alto costo | Estudios/capacidad; antigüedad +1 por mes; probabilidad de falla sube con la antigüedad; renovación en año definido |
| **Nivel de cumplimiento regulatorio** | Estado frente a habilitación y normas | Sube con inversión en adecuación; baja con inspección fallida; si baja de un umbral hay riesgo de clausura (situación 6) |
| **Índice de reputación de salud** | Confianza de pacientes | Sube con calidad, tiempos y casos exitosos; baja con reclamos, mala praxis y esperas; actúa con rezago en la demanda |
| **Riesgo de reclamo/mala praxis** | Probabilidad mensual de un incidente | Base por volumen y complejidad de procedimientos, reducida por protocolos y documentación; seguro de responsabilidad reduce el impacto |
| **Tasa de no-show** | Inasistencia a citas | Base, reducida por recordatorios o seña |
| **Capital de trabajo mínimo** | Caja necesaria para cubrir costos hasta cobrar | Costo mensual x días de cobro ponderado / 30 |

---

## 7. Ejemplos reales de Bolivia o Latinoamérica

Solo aparecen casos cuyos enlaces abrí. Lo que dice la nota va aparte de mi interpretación.

| Caso | País | Qué dice la fuente | Enlace |
|---|---|---|---|
| Estudio de mercado AEMP sobre clínicas privadas de La Paz, Cochabamba y Santa Cruz | Bolivia | Describe el sector (seis cajas de salud, aseguradoras privadas, clínicas hotel, tercerización de laboratorio e imagen, precios de habitaciones de 2015, problemas de habilitación). Nombra clínicas como Foianini, Incor, Meléndres, Niño de Jesús, Cruz Azul, Del Sur, Los Olivos y otras. No da estados financieros de ninguna | [AEMP, 2015](https://www.autoridadempresas.gob.bo/wp-content/uploads/2024/03/EM-CLINICAS.pdf) |
| Deuda del Ministerio de Salud con centros de hemodiálisis, oncología y neonatología | Bolivia | Bs 500 millones; denuncias de hasta 10 meses sin cobrar; se pagaron unos Bs 19 millones en dos semanas; expedientes devueltos por errores | [Los Tiempos, 14/07/2026](https://www.lostiempos.com/node/669480) |
| Cobro de clínicas privadas durante el COVID-19 | Bolivia | Tarifas diarias reportadas de Bs 600 a Bs 3.500 por cama estable y de Bs 4.500 a Bs 10.000 por UTI en las clínicas citadas; depósito de garantía de Bs 10.000 en una; el Defensor pidió declararlas públicas; el ministro habló de "nacionalizar". Una de las cifras (Foianini) no pudo confirmarse | [eju.tv, 8/5/2020](https://eju.tv/?p=1681590) |
| Alerta por dólar y medicamentos (Cifabol) | Bolivia | Abril 2025: fármacos suben 100%-150%, posible 300%-400%. Julio 2026: dólar flexible en Bs 11,21 y alerta de encarecimiento | [Los Tiempos, 9/4/2025](https://www.lostiempos.com/actualidad/economia/20250409/falta-dolares-amenaza-suministro-medicinas-afirman-farmaceuticas) y [eju.tv, 24/7/2026](https://eju.tv/?p=5046040) |
| Retención de pacientes por deuda | Bolivia | Nota de 2026 sobre jurisprudencia constitucional: la clínica no puede retener al paciente | [Red Uno, 30/9/2026](https://www.reduno.com.bo/programa/te-pueden-retener-en-una-clinica-hasta-que-pagues-la-cuenta-esto-dice-la-ley-en-bolivia-202693011162) |
| Clínica Bolivariana y Nueva EPS | Colombia (Latam) | La clínica universitaria dejó de aceptar nuevos pacientes de la EPS: deuda subió de COP 19.589 millones (2024) a COP 43.663 millones (feb. 2025) | [El Colombiano](https://www.elcolombiano.com/medellin/clinica-bolivariana-no-atendera-pacientes-de-la-nueva-eps-FJ26945231) |
| Cartera hospitalaria (ACHC) | Colombia (Latam) | Deuda de EPS con clínicas y hospitales de COP 25,7 billones a dic. 2025 y 58% en mora; cerca de la mitad de los activos de las IPS son cuentas por cobrar | [Portafolio, 21/4/2026](https://www.portafolio.co/economia/gobierno/deuda-hospitalaria-llega-a-25-7-billones-y-agrava-crisis-de-liquidez-en-sistema-de-salud-colombiano-492440) y [Consultorsalud](https://consultorsalud.com/deuda-hospitalaria-marca-un-record-nueva-eps/) |

No encontré un caso boliviano abierto de una clínica con estados financieros públicos (ocupación, margen, cobranza). Para estudiar una clínica boliviana con números reales hará falta un caso aportado por un empresario o un docente (sección 10).

---

## 8. Fuentes numeradas con nivel

Niveles: A (libro, paper, organismo, norma o manual), B (consultora, gremio, reporte sectorial, prensa), C (blog, práctica, síntesis de terceros).

| N.º | Fuente | Nivel | Qué leí | Enlace |
|---|---|---|---|---|
| S1 | Autoridad de Fiscalización de Empresas (AEMP, Bolivia), *Estudio de mercado de servicios de salud privada en las ciudades de La Paz, Cochabamba y Santa Cruz*, diciembre de 2015 | A (organismo del Estado) | Texto completo extraído del PDF: sector, seguros, cajas, oferta, precios, problemas, conclusiones | https://www.autoridadempresas.gob.bo/wp-content/uploads/2024/03/EM-CLINICAS.pdf |
| S2 | Ley N.º 3131 del Ejercicio Profesional Médico, Bolivia, 8 de agosto de 2005 (texto en el sitio del Ministerio de Salud) | A (norma) | Texto completo extraído (18 artículos) | https://www.minsalud.gob.bo/images/Documentacion/normativa/Ley%203131%20Ejercicio%20Mdico.pdf |
| S3 | Decreto Supremo N.º 25235, Reglamento a la Ley del Medicamento, 30 de noviembre de 1998 (sitio de AGEMED) | A (norma) | Texto extraído: artículos 54-55, 68-76 sobre farmacias y regente | https://www.agemed.gob.bo/reg-far/doc_reg_far/T-N-2-DS-25235-REG_LM.pdf |
| S4 | Decreto Supremo N.º 1984, Reglamento a la Ley N.º 475 de Prestación de Servicios de Salud Integral, 2014 (Lexivox) | A (norma) | Texto leído mediante consulta de la página: artículos 3, 10, 12, 16, 17 | https://www.lexivox.org/norms/BO-DS-N1984.html |
| S5 | OPS/OMS, nota "Estado Plurinacional de Bolivia: acceso y cobertura universal de salud, una referencia para el mundo", 1 de septiembre de 2021 | A (organismo multilateral) | Texto leído (nota institucional, cifras sin verificación independiente) | https://www.paho.org/es/noticias/1-9-2021-estado-plurinacional-bolivia-acceso-cobertura-universal-salud-referencia-para |
| S6 | Marisol Campos Doria Navas, "Configuración típica de la responsabilidad penal en la mala praxis médica en Bolivia", Revista Andina de Investigaciones en Ciencias Jurídicas, año 2, n.º 3, Universidad Andina Simón Bolívar, aceptado 14/08/2025 | A (paper) | Resumen e introducción leídos; no leí el artículo completo | https://revista.uasb.edu.bo/ciencias-juridicas/article/download/164/54/1634 |
| S7 | Berg, Murr, Chermak, Woodall, Pignone, Sandler y Denton, "Estimating the Cost of No-Shows and Evaluating the Effects of Mitigation Strategies", *Medical Decision Making* 33(8):976-985, noviembre de 2013 | A (paper) | Solo el resumen (página de IDEAS/RePEc); no el artículo | https://ideas.repec.org/a/sae/medema/v33y2013i8p976-985.html |
| S8 | HFMA, "Key Hospital Financial Statistics and Ratio Medians: Glossary of Formulas" (publicado 2012, actualizado 2022) | B (asociación profesional) | Texto leído de las fórmulas | https://www.hfma.org/finance-and-business-strategy/1113/ |
| S9 | Síntesis de terceros (Technion) del artículo de Kaplan y Porter, "How to Solve the Cost Crisis in Health Care", HBR, septiembre de 2011 | C (resumen de un artículo de nivel A que no leí) | Texto de la síntesis | https://aviman.technion.ac.il/files/References/Mini_course_generic/ZZ_Kaplan_Porter_Processing_Networks.pdf |
| S10 | Portafolio (21/4/2026), sobre el estudio de cartera hospitalaria n.º 55 de la ACHC (Colombia), y Consultorsalud sobre el n.º 54 | B (prensa y gremio) | Texto leído; no abrí los estudios de la ACHC | https://www.portafolio.co/economia/gobierno/deuda-hospitalaria-llega-a-25-7-billones-y-agrava-crisis-de-liquidez-en-sistema-de-salud-colombiano-492440 |
| S12 | Los Tiempos, 14/07/2026, deuda de Bs 500 millones con centros de hemodiálisis | B (prensa) | Texto leído | https://www.lostiempos.com/node/669480 |
| S13 | Los Tiempos, 9/4/2025, falta de dólares y suministro de medicinas | B (prensa) | Texto leído | https://www.lostiempos.com/actualidad/economia/20250409/falta-dolares-amenaza-suministro-medicinas-afirman-farmaceuticas |
| S14 | eju.tv, 24/7/2026, farmacéuticas y dólar a Bs 11,21 | B (prensa) | Texto leído | https://eju.tv/?p=5046040 |
| S15 | eju.tv (Página Siete), 8/5/2020, cobros de clínicas privadas por COVID-19 | B (prensa) | Texto leído | https://eju.tv/?p=1681590 |
| S16 | Red Uno, 30/9/2026, retención de pacientes por deuda | B (prensa) | Texto leído | https://www.reduno.com.bo/programa/te-pueden-retener-en-una-clinica-hasta-que-pagues-la-cuenta-esto-dice-la-ley-en-bolivia-202693011162 |
| S17 | El Colombiano, Clínica Bolivariana y Nueva EPS (2025) | B (prensa) | Texto leído | https://www.elcolombiano.com/medellin/clinica-bolivariana-no-atendera-pacientes-de-la-nueva-eps-FJ26945231 |

(No hay S11: lo fusioné con S10.)

**Conteo.** Fuentes distintas: 16 numeradas. Nivel A con texto leído: **S1, S2, S3, S4, S5** (5 con texto sustancial) más **S6** (resumen e introducción) y **S7** (solo resumen); si se exige texto completo, son 5 (S1, S2, S3, S4, S5); con S6 y S7, 7. Cumple el mínimo de 4. Ningún libro de texto de gestión hospitalaria o de evaluación de proyectos de salud pude abrir con contenido; en esa categoría el respaldo es la glosa de la HFMA (B) y una síntesis de terceros (C).

---

## 9. No confirmado

- **Tarifas actuales, ocupación y márgenes de clínicas privadas bolivianas.** El único estudio abierto es de 2015 [S1]. Sus precios de habitación (Bs 2015) están desactualizados y no los uso como parámetro.
- **Procedimiento y requisitos vigentes de la "resolución de funcionamiento"/habilitación de clínicas y consultorios.** Solo confirmé que el SEDES la exige y que se renueva anualmente según [S1] (2015). No encontré la norma vigente de habilitación ni la categorización de establecimientos. Dos búsquedas no la hallaron.
- **Deuda de la Caja Nacional de Salud con clínicas privadas y plazos reales de pago de cajas y aseguradoras privadas.** No encontré datos. La evidencia de atrasos viene del caso de hemodiálisis [S12] y de Colombia [S10].
- **Convenios de clínicas privadas con la CNS y condiciones tarifarias.** Solo vi antecedentes de 2012 en resúmenes de búsqueda (no abiertos).
- **Aseguradoras privadas de salud en Bolivia:** primas, siniestralidad, demora de pago a clínicas. No encontré datos (autoridad: APS).
- **Seguro de responsabilidad profesional médica en Bolivia:** existencia, costo y cobertura. No lo encontré.
- **Fecha de la nota de Los Tiempos sobre hemodiálisis [S12].** Está fechada 14/07/2026 pero menciona pagos desde noviembre de 2024 y "cerrando el 2024". Confirmar con la fuente original.
- **Tipo de cambio paralelo de Bs 16,5 (2025).** Apareció en resúmenes de búsqueda de otros medios, no en las notas que abrí. No lo uso.
- **Tomografía/resonancia: punto de equilibrio y utilización.** Hallé estudios de Corea (en coreano) y de la India (en IJRI, la página bloqueó la lectura) solo por resúmenes de búsqueda. No los uso como cifra.
- **Paros médicos de 2019 y 2021 y su efecto en clínicas privadas:** solo vi resúmenes de búsqueda (Los Tiempos, Correo del Sur); no abrí las notas.
- **Telemedicina privada en Bolivia:** la búsqueda indicó un Programa Nacional de Telesalud público (RM 0891 de 2018) y una RM de 2015, no abiertos. No hay norma confirmada para consultas virtuales privadas.
- **Requisitos para apertura de farmacia minorista:** abrí el DS 25235 (1998) [S3], pero puede haber normas posteriores o departamentales (la búsqueda mostró una distancia mínima de 100 metros de 1992 y un reglamento de Chuquisaca) que no confirmé.
- **Libros de texto de gestión hospitalaria y de evaluación económica de proyectos de salud:** no abrí ninguno. Los glosarios de la HFMA son de EE. UU.
- **Original de Kaplan y Porter (HBR 2011):** solo leí una síntesis de terceros [S9].
- **Estacionalidad de la demanda de salud privada en Bolivia (frío, lluvias, dengue):** no la verifiqué.
- **Dato OPS de gasto de bolsillo y de 65% a 19% en hospitales de tercer nivel [S5]:** es de una nota institucional de la propia OPS, sin verificación independiente.

---

## 10. Cifras que necesitan validación local

| Magnitud | Origen actual | Quién podría aportarla |
|---|---|---|
| Consultas por hora y por consultorio, horas de atención, ocupación realista de un consultorio nuevo | Estimación | Médicos con consultorio propio; docentes de gestión hospitalaria |
| Ocupación de camas en clínicas bolivianas y estadía promedio | Sin dato de Bolivia | Colegio Médico; clínicas; INE; Ministerio de Salud (SNIS) |
| Tarifas actuales de consulta, estudios, habitación e internación por ciudad | Solo 2015 [S1] | Clínicas, AEMP/autoridad de empresas, colegios médicos departamentales |
| Mix de pagadores (bolsillo, aseguradora, CNS u otras cajas, Estado) y tarifas por pagador | Estimación | Gerentes de clínicas; aseguradoras; APS |
| Días de cobro de cajas, aseguradoras y Estado | Evidencia parcial [S12] y de Colombia [S10] | Gerentes administrativos de clínicas; gremio de clínicas |
| Porcentaje de incobrables en pacientes de bolsillo | Estimación (1%-5%) | Clínicas privadas |
| Tasa de no-show en consulta externa | Rango de [S7] (EE. UU., endoscopía) | Clínicas; consultorios; docentes |
| Peso de insumos importados en el costo de una clínica y traspaso del dólar a precios | Estimación | Proveedores; Cifabol; compradores de clínicas |
| Inversión, vida útil y punto de equilibrio de tomógrafo, rayos X, ecógrafo, laboratorio | Estimación | Proveedores de equipos; centros de imagen; ingenieros biomédicos |
| Honorarios médicos (por acto, porcentaje, alquiler de consultorio) y condiciones de exclusividad | Estimación | Colegio Médico; directores de clínicas |
| Costos y plazos de habilitación del SEDES y renovación anual | Solo dato cualitativo de [S1] | SEDES departamentales; consultores de habilitación; clínicas |
| Probabilidad e impacto económico de reclamos por mala praxis; costo de seguro de responsabilidad | Estimación | Abogados del rubro; Colegio Médico; aseguradoras |
| Efecto de la reputación en la demanda (rezago y magnitud) | Estimación | Empresarios del rubro; docentes de marketing de servicios |
| Magnitud de picos estacionales y su calendario | Estimación | SNIS; epidemiología; clínicas |
| Efecto de paros y bloqueos en demanda y logística | Estimación | Clínicas; Colegio Médico |
| Economía de farmacia (margen, rotación, vencimientos) y laboratorio clínico | Sin dato de Bolivia | Cámara de farmacias; farmacéuticos; dueños de laboratorios |
| Telemedicina: precio, adopción y marco legal para el sector privado | Sin dato | Ministerio de Salud (telesalud); empresas de telemedicina |
| Cobertura y ritmo de expansión del SUS y su efecto en la demanda privada | Solo nota de la OPS [S5] | Ministerio de Salud; INE |
