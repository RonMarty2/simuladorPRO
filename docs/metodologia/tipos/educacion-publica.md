# Proyecto educativo público o sin cobro

Ficha de metodología para el simulador SIMPRO. Cubre programas de permanencia escolar, alfabetización, equipamiento de unidades educativas, becas, capacitación docente, laboratorios y educación digital, ejecutados por municipios, gobernaciones, el Ministerio de Educación u ONG.

## Cómo leer este documento

- Solo cito fuentes que abrí. En la sección 8 indico cuáles leí con texto completo o parcial y cuáles solo con resumen.
- Las magnitudes de las situaciones (sección 5) están marcadas: **[fuente]** si el número viene de un documento que abrí, **[estimación]** si es mía y debe calibrarse con datos locales (ver sección 10).
- Cuando reconstruyo una fórmula de memoria o la adapto, lo digo con la etiqueta **[reconstruida]**.
- Todo lo que dice "Interpretación" es mío, no de la fuente.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

Es un proyecto cuyo objetivo es que más niños, niñas y jóvenes entren a la escuela, se queden, pasen de curso y aprendan. No vende nada: el servicio es gratuito para el alumno. La Ley 070 dice que "la educación fiscal es gratuita en todos sus niveles hasta el superior" y que es obligatoria hasta el bachillerato (Art. 1, numerales 8 y 9) [4]. Por eso **no existe un ingreso que mida el éxito**: el valor se mide en matrícula, permanencia, promoción y aprendizaje.

Quién paga qué en Bolivia (según la Ley 070):
- Los gobiernos municipales son responsables de dotar, financiar y garantizar servicios básicos, infraestructura, mobiliario, material educativo y equipamiento de las unidades educativas de educación regular, alternativa y especial (Art. 80, num. 2) [4].
- Los gobiernos departamentales hacen lo mismo con los institutos técnicos y tecnológicos (Art. 80, num. 1) [4].
- El sistema se financia con recursos del Tesoro General del Estado y de las entidades territoriales autónomas, según el Presupuesto General (Art. 89) [4].

**Interpretación:** un proyecto de equipamiento o de laboratorio de una ONG o de un municipio casi siempre depende de que **otro** nivel de gobierno ponga los sueldos, la luz, el internet y el mantenimiento. Esa dependencia es el centro del riesgo de sostenibilidad.

De dónde viene el valor, según el manual de la CEPAL [1]: el proyecto social se justifica por el cambio que produce en la población destinataria (el "impacto"), no por la plata que genera. Un proyecto de educación con objetivos medibles se evalúa comparando su costo con ese cambio.

Por qué el flujo de caja clásico falla (Interpretación, coherente con [1] y [2]): el retorno económico de educar (más ingresos del alumno cuando sea adulto) llega décadas después y es incierto, y no lo cobra quien paga el proyecto.

---

## 2. Indicadores propios y cómo se calculan

Los nombres y definiciones de tasas siguen el uso habitual en estadística educativa. Las fórmulas simples de tasas son **[reconstruidas]** de memoria; la fuente que respalda cada indicador está en la columna final.

| Indicador | Qué mide | Fórmula | Fuente / estado |
|-----------|----------|---------|-----------------|
| Tasa de matriculación | Qué parte de la población en edad escolar está inscrita | Alumnos inscritos en el nivel / población en edad de ese nivel x 100 | Usado como variable de resultado en [3]. Fórmula **[reconstruida]** |
| Tasa de permanencia | Quién sigue en la escuela al terminar el año | Alumnos que siguen al cierre / alumnos inscritos al inicio x 100 | Variable de resultado en [3]. Fórmula **[reconstruida]** |
| Tasa de abandono (deserción) | Quién deja la escuela durante el año | Alumnos que abandonan / alumnos inscritos al inicio x 100 (equivale a 100 menos permanencia) | [3] la grafica por separado. Fórmula **[reconstruida]** |
| Tasa de promoción | Quién pasa de curso | Alumnos aprobados / alumnos inscritos x 100 | Variable de resultado en [3]. Fórmula **[reconstruida]** |
| Niños fuera de la escuela | Quién nunca entró o ya salió | Población en edad escolar que no asiste al nivel que le corresponde; el informe [5] los separa en cinco dimensiones según hayan asistido o no | [5], texto leído |
| Aprendizaje | Cuánto sabe el alumno | Puntaje en prueba estandarizada; el cambio se expresa en desviaciones estándar (DE) | [7] (J-PAL expresa efectos en DE), [1] propone "variación porcentual en resultados de prueba nacional" |
| Costo por alumno (unitario) | Cuánto cuesta atender a un alumno | Costo total del proyecto / alumnos atendidos. En [2] se descuentan tanto los costos como el número de alumnos en el tiempo para que el cociente sea consistente | [2] cap. 7, texto leído |
| Costo por unidad de impacto (CUI) | Cuánto cuesta lograr un punto de impacto | CUI = Costo total anual (CTA) / (Impacto medio anual x 100), con el impacto en proporción; "impacto medio anual" = meta de impacto / horizonte del proyecto | [1] sección 4.3.1, texto leído (fórmula tal como figura) |
| Costo por punto de permanencia o promoción | Caso del CUI para educación | CTA / puntos porcentuales de permanencia (o promoción) ganados respecto del contrafactual | **[reconstruida]** aplicando el CUI de [1] a la tasa que interesa |
| Costo por 0,10 DE de mejora en aprendizaje | Medida de costo-efectividad del aprendizaje | Costo por alumno / (efecto en DE / 0,10) | Definición del indicador en [7]; la división explícita es **[reconstruida]** |
| Costo por alumno que se queda | Costo-efectividad de un programa de permanencia | CTA / (alumnos que permanecen gracias al programa) donde esos alumnos = (permanencia con proyecto menos permanencia sin proyecto) x población atendida | **[reconstruida]** |
| Razón de costo-efectividad (CE) | Comparar alternativas con un mismo resultado | Costo por alumno / efecto en la prueba (o en la tasa) | [2] cap. 7 la usa con ejemplo; advierte que solo se puede usar con seguridad si el costo o el beneficio son iguales entre alternativas |
| Costo-efectividad ponderada | Cuando hay varios resultados a la vez | (Suma de resultados x pesos) / costo | [2] cap. 7, texto leído |
| Gasto operativo sobre presupuesto | Cuánto del dinero llega al alumno y cuánto se va en administrar | Gasto operativo / presupuesto global del programa | [3]: 4,1% (2006-2011) y 3,8% (2012-2013) en el Bono Juancito Pinto |
| Ejecución presupuestaria | Cuánto del presupuesto se gastó | Gastado / presupuestado, por mes y acumulado | Concepto de uso general. No hay fuente abierta aquí |
| Días efectivos de clase | Cuánto tiempo de enseñanza recibió realmente el alumno | Días con clase dictada / días del calendario | Concepto **[reconstruido]**; no hay fuente abierta con definición |
| Uso efectivo del equipo | Si la inversión sirve | Horas de uso real / horas disponibles | Concepto **[reconstruido]**; los casos de [12] y [10] muestran por qué importa |
| Costos de oportunidad del alumno | Lo que la familia deja de ganar por mandarlo a la escuela | Valor del trabajo (agrícola, doméstico, comercio) que el niño deja de hacer | [2] cap. 8, texto leído: debe incluirse en niños mayores |

Detalle importante sobre la regla del impacto: el manual [1] dice que los indicadores de impacto no se pueden reemplazar por indicadores de producto, y que deben "medir los cambios atribuibles al proyecto". Su ejemplo educativo usa tres: variación del resultado de la prueba nacional, disminución de la repetición y disminución de la deserción.

---

## 3. Cómo se evalúa económicamente cuando no hay ingreso

**Qué reemplaza al VAN y a la TIR.** Según el manual de la CEPAL [1], el análisis costo-beneficio compara costos y beneficios en moneda y sirve cuando el beneficio se puede expresar así. Para los proyectos sociales hay dos métodos que lo reemplazan:

| Método | Qué compara | Cuándo se usa | Criterio de decisión |
|--------|-------------|---------------|----------------------|
| Costo mínimo (ACM) | Costos contra el nivel de producción (aulas, kits, becas) | Cuando se acepta que el impacto es igual en todas las alternativas | Elegir el de menor costo |
| Costo-impacto (ACI) | Costos contra el logro de objetivos de impacto (permanencia, aprendizaje) | Cuando hay un objetivo medible | Menor costo por unidad de impacto |

Todos los textos de esta tabla vienen de [1], donde se aclara que el ACI se aplica tanto antes (ex-ante) como después (ex-post).

**Cómo lo aplica el Banco Mundial a educación [2].** El capítulo 8 indica qué herramienta usar según el nivel y el objetivo: para primaria y secundaria con meta de ampliar cobertura o mejorar notas, costo-efectividad (CE) o CE ponderada; el costo-beneficio queda para universidad (mercado laboral de los graduados). El mismo capítulo manda contar **todos los costos**, incluso los donados (se imputa valor de mercado) y el tiempo de los alumnos mayores (costo de oportunidad). La tabla hipotética del cap. 7 [2] muestra un punto clave: la intervención más barata por punto de efecto (tutoría entre pares) no es necesariamente la mejor, porque la que da más puntaje puede justificar su costo extra. El libro recomienda tres preguntas: ¿puedo subir la intensidad?, ¿puedo combinar intervenciones?, ¿vale la pena la ganancia marginal?

**Cuándo sí se puede hacer un VAN social.** El estudio de Schultz sobre Progresa [11] estima una tasa interna de retorno de las becas "de alrededor del 8%", **suponiendo** que se mantengan los vínculos entre gasto y matrícula y entre escolaridad e ingresos futuros adultos (solo leí el resumen). **Interpretación:** un VAN social de educación exige supuestos de largo plazo (cuánto más gana un alumno por año adicional de estudio) y por eso hay que presentarlo junto con el ACI y con sensibilidad, no solo.

**SROI.** El mapa general del proyecto (00-taxonomia-tipos.md) describe una guía del Cabinet Office del Reino Unido [fuente S6 de ese archivo] con descuentos por "deadweight" (lo que habría pasado igual). No abrí esa guía en esta investigación; uso la idea solo como Interpretación: es la misma lógica del contrafactual de la sección 5.

**Qué NO desaparece.** Aunque no haya ingreso, el proyecto necesita flujo de caja: hay que pagar sueldos, compras y mantenimiento. Las Normas Básicas del SNIP [6] exigen que el proyecto cuente con financiamiento asegurado para entrar al presupuesto de inversión pública (Art. 12), que si una entidad ejecuta y otra financia la operación haya un convenio específico (Art. 28.d) y que los gastos recurrentes de proyectos con financiamiento externo no comprometan la situación financiera futura de la entidad (Art. 29.a). **Interpretación para el simulador:** la caja sigue siendo la restricción que puede matar al proyecto; la evaluación económica social es el criterio de éxito.

**El contrafactual ("con y sin proyecto").** El impacto es la diferencia entre lo que pasó con el proyecto y lo que habría pasado sin él. El manual [1] menciona modelos experimental, cuasiexperimental y no experimental para la evaluación posterior (dato tomado del mapa general; yo no leí ese capítulo). Ejemplos de lo que pasa cuando se ignora: la evaluación del Bono Juancito Pinto [3] usa un panel de 9 departamentos por 5 años (45 observaciones) y reconoce que el abandono ya venía cayendo; sin comparación se atribuiría al bono toda la mejora.

---

## 4. Errores típicos de estudiantes y de equipos de proyecto

Los errores 1 a 4 los apoyo en fuentes; el resto son Interpretación mía, basada en lo leído.

1. **Medir producto en vez de impacto.** Contar aulas, computadoras o becas entregadas y llamarlo éxito. El manual [1] dice que no se pueden usar indicadores de producto para medir impacto.
2. **Comprar equipos sin los complementos.** El panel de expertos del Banco Mundial clasifica como "bad buy" invertir en hardware informático u otros insumos sin cambios complementarios como capacitación docente o mejor gestión escolar [8]. El caso boliviano de las laptops Kuaa (sección 7) es un ejemplo documentado por prensa [12].
3. **Atribuir al proyecto lo que ya venía mejorando.** Según datos oficiales citados en [13], el abandono en primaria bajó de 6,5% a 1,2% y en secundaria de 8,5% a 4,4% en once años; [3] también muestra una tendencia decreciente del abandono desde antes. Un proyecto nuevo que arranca en esa tendencia no puede quedarse con todo el mérito.
4. **Ignorar el costo de oportunidad del alumno y de la familia.** El Banco Mundial [2] lo cuenta como costo; el informe de niños fuera de la escuela [5] lo menciona entre las barreras de demanda (costos "educativos y/o de oportunidad" y migración laboral).
5. **Calcular el VAN y concluir "el proyecto no es viable".** Con ingreso cero, el VAN es negativo siempre; eso no dice nada. (Interpretación.)
6. **Olvidar los costos recurrentes.** Se presupuesta la obra y no el mantenimiento, la luz, el internet ni el sueldo del técnico. Las Normas del SNIP [6] piden convenio y que los gastos recurrentes no comprometan a la entidad. (Interpretación sobre la causa.)
7. **No poner línea de base ni grupo de comparación.** Sin medición inicial no hay forma de probar impacto después. (Interpretación; coherente con [1].)
8. **Usar la razón de costo-efectividad sin ver el denominador.** [2] advierte que comparar razones solo es seguro cuando el costo o el beneficio son iguales entre alternativas.
9. **Meta de cobertura inalcanzable con el presupuesto.** Prometer atender a todos los municipios con presupuesto para tres. (Interpretación.)
10. **Olvidar el calendario escolar.** Las compras, las capacitaciones y la medición se concentran en pocos meses; un retraso de tres meses puede perder el año completo. (Interpretación; el año 2021 comenzó en febrero según [16].)

---

## 5. Situaciones para la simulación

Convenciones: las variables de la columna "Variables que mueve" se definen en la sección 6. "Direccion" indica si sube (+) o baja (-). Las magnitudes marcadas **[fuente]** vienen de un documento que abrí; el resto son **[estimación]** para calibrar con datos locales.

### E-1. Laboratorio de computación que nadie puede usar

**Qué pasa.** El proyecto entrega computadoras a colegios rurales. A los pocos meses, las máquinas no tienen internet, no hay técnico que las repare y la dirección no autoriza el uso fuera de horario. Hay un antecedente real boliviano: según una nota de Los Tiempos de 2021, las laptops Kuaa entregadas en 2017 en Quillacollo y Sipe Sipe estaban guardadas y obsoletas por falta de mantenimiento, de internet y de insumos [12]. La conexión de esas máquinas no funcionaba a más de 100 metros del colegio [12].

**Variables que mueve.**
- Uso efectivo del equipo: cae a 20% a 50% del uso planificado después del mes 6 **[estimación]**; la fuente [12] describe el problema pero no da porcentajes.
- Aprendizaje: sin efecto medible si el equipo no se usa. Para referencia, la evaluación aleatoria de las laptops en Perú (OLPC) no encontró efectos en matrícula ni en notas de matemática y lenguaje según el resumen del BID que vi en una búsqueda, no abierto completo [10].
- Costo por alumno efectivo: sube en proporción inversa al uso **[estimación]**.
- Confianza de la comunidad: baja si el equipo se ve parado.

**Decisiones posibles.**
1. *Pagar un técnico y la conexión con presupuesto del proyecto.* Ventaja: el equipo funciona y el impacto es posible. Costo: aumenta el gasto recurrente y, si el proyecto termina, el costo queda sin responsable.
2. *Pedir al municipio que asuma la conexión y el técnico (Art. 80 de la Ley 070 [4]).* Ventaja: lo deja sostenible. Costo: depende de la voluntad y del presupuesto municipal; el pedido puede no prosperar, como pasó en Quillacollo [12].
3. *Rediseñar con contenidos que funcionen sin internet.* Ventaja: reduce la dependencia de conexión. Costo: menos recursos actualizados y más trabajo de preparación; no resuelve el mantenimiento.
4. *Centralizar los equipos en un solo colegio por distrito.* Ventaja: menos puntos que mantener. Costo: algunos alumnos viajan más y las escuelas más aisladas quedan sin acceso, lo que agranda la brecha rural.

**Qué aprende el alumno.** Que un activo físico no es un resultado; que la inversión inicial es la parte chica y que la evaluación debe contar quién paga los costos de operar.

### E-2. Termina el financiamiento y el costo recurrente queda sin dueño

**Qué pasa.** El proyecto se ejecutó con aporte de un cooperante o de la gobernación por 3 años. Al cerrar, hay que seguir pagando facilitadores, material y mantenimiento. Las Normas del SNIP [6] exigen convenio específico cuando una entidad ejecuta y otra financia la operación (Art. 28.d) y piden que los gastos recurrentes no comprometan la situación financiera futura (Art. 29.a). El municipio dice que no tiene partida para eso.

**Variables que mueve.**
- Financiamiento comprometido: cae a 0 en el mes del cierre.
- Cobertura (alumnos atendidos): -30% a -100% según la decisión **[estimación]**.
- Reserva para costos recurrentes: se agota al ritmo del gasto.
- Permanencia: sin sostén, los alumnos de riesgo vuelven a abandonar con demora de 1 a 2 años **[estimación]**.

**Decisiones posibles.**
1. *Traspasar el programa al municipio con convenio y capacitación.* Ventaja: asegura continuidad si el municipio acepta. Costo: depende de su capacidad; puede perder calidad.
2. *Reducir el programa a su núcleo (lo que más impacto tuvo por boliviano gastado).* Ventaja: mantiene lo mejor con menos plata. Costo: excluye a quien ya estaba dentro.
3. *Buscar un segundo financiador.* Ventaja: continuidad. Costo: tiempo de gestión, condiciones nuevas y riesgo de interrupción mientras se consigue.
4. *Cerrar con evaluación final y documentar.* Ventaja: deja evidencia y no genera falsas expectativas. Costo: se pierde el efecto acumulado y la relación con la comunidad.

**Qué aprende el alumno.** Que la sostenibilidad se diseña desde el inicio con convenios de operación, no al final; y que lo que se paga en el año 4 también es costo del proyecto.

### E-3. Paro del magisterio y días de clase perdidos

**Qué pasa.** Un conflicto del magisterio suspende clases durante varias semanas. Hay antecedentes: en marzo de 2023 el Ministerio de Educación afirmó que las clases se dictaron con normalidad en 77% de las escuelas el primer día del paro de maestros urbanos, según una búsqueda cuyos resultados no abrí completos (ver sección 9). En 2025 hubo marchas y un acuerdo que levantó medidas de presión el 21 de abril, según un listado de Los Tiempos que tampoco abrí. Tus capacitaciones, tutorías o evaluaciones quedan sin alumnos.

**Variables que mueve.**
- Días efectivos de clase: -5% a -15% del año **[estimación]**; no encontré el total de días perdidos en Bolivia.
- Aprendizaje: baja con los días perdidos, sin cifra boliviana confirmada.
- Permanencia: leve baja si la interrupción es larga **[estimación]**.
- Ejecución presupuestaria: se retrasa.

**Decisiones posibles.**
1. *Esperar y reprogramar al reinicio de clases.* Ventaja: no gastas ni arriesgas el vínculo con los maestros. Costo: se atrasa el plan, se junta trabajo, la caja y los contratos corren.
2. *Mover las actividades a la comunidad (fuera del horario escolar).* Ventaja: mantiene el contacto con los alumnos. Costo: costo adicional, necesita voluntarios y el efecto de tutorías fuera de la escuela suele ser menor que en horario escolar (según [9], los programas en horario escolar tienden a tener mayor impacto).
3. *Entregar material para trabajo en casa.* Ventaja: bajo costo. Costo: depende de la familia; los alumnos con menos apoyo pierden más.
4. *Tomar postura con el sector (negociar con la dirección y los maestros).* Ventaja: puedes ganar aliados. Costo: tiempo, y riesgo de verse tomando partido en un conflicto.

**Qué aprende el alumno.** Que el calendario escolar es una variable de riesgo propia; y que un proyecto educativo depende de actores que no controla (maestros, ministerio).

### E-4. La contrapartida del municipio no llega

**Qué pasa.** El convenio dice que el municipio pone obras, mobiliario o el pago de personal. Pasan los meses y la partida no se ejecuta: cambió el alcalde, el presupuesto se reasignó o no hay plata. Esto es un riesgo estándar del marco lógico (supuesto "los fondos de contraparte llegan a tiempo"); en Bolivia la Ley 070 [4] pone la infraestructura y el equipamiento escolar a cargo del municipio, por lo que el proyecto queda atado a esa decisión.

**Variables que mueve.**
- Aporte de contrapartida: 0% a 50% del comprometido durante 3 a 9 meses **[estimación]**.
- Ejecución del plan de obras o dotación: se atrasa.
- Caja del proyecto: sube la presión si cubres la diferencia.
- Reputación ante el cofinanciador: baja si se incumplen metas.

**Decisiones posibles.**
1. *Cubrir con fondos propios del proyecto.* Ventaja: no se detiene el avance. Costo: se gasta presupuesto que estaba para otras líneas y se sienta un precedente.
2. *Reducir la meta de infraestructura y priorizar lo que ya es viable.* Ventaja: menos exposición. Costo: menos alumnos beneficiados en el primer año.
3. *Gestionar con la gobernación o el Ministerio.* Ventaja: puede traer más plata. Costo: tiempo largo y dependencia política.
4. *Paralizar hasta que llegue la contrapartida.* Ventaja: protege la caja. Costo: retraso, costos fijos que siguen y la comunidad ve un proyecto detenido.

**Qué aprende el alumno.** A distinguir entre el compromiso en papel y el flujo real, y que el cronograma financiero del proyecto debe incluir escenarios de contrapartida tardía.

### E-5. Crisis económica, sequía o migración aumentan el abandono

**Qué pasa.** Una sequía o una caída del ingreso familiar empuja a las familias a mandar a los hijos a trabajar o a migrar. Un funcionario departamental de Cochabamba nombró como factores de deserción la migración, la distancia, los problemas económicos agravados por una sequía y los prejuicios [13]. El informe de niños fuera de la escuela [5] menciona entre las barreras de demanda la pobreza, los costos de oportunidad y la migración laboral.

**Variables que mueve.**
- Tasa de abandono: sube 1 a 3 puntos porcentuales en el año afectado **[estimación]**; las cifras de [13] son nacionales y de largo plazo.
- Permanencia: baja en el mismo monto.
- Asistencia mensual: cae primero, meses antes del abandono formal.
- Costo por alumno que se queda: sube porque se necesita más esfuerzo por alumno.

**Decisiones posibles.**
1. *Reforzar la transferencia o beca para las familias en riesgo.* Ventaja: ataca la causa económica; la evidencia del Bono Juancito Pinto [3] sugiere efecto positivo, pequeño, en permanencia (alrededor de 1%). Costo: caja; aumenta el costo por alumno y puede crear dependencia.
2. *Visitas de seguimiento al hogar y alerta temprana por inasistencia.* Ventaja: barato y detecta el riesgo antes. Costo: necesita personal y tiempo; no resuelve la falta de plata.
3. *Flexibilizar horarios y reforzar para recuperar contenido.* Ventaja: el alumno que trabaja puede seguir. Costo: complejidad y menor tiempo de enseñanza.
4. *No hacer nada especial y esperar que pase.* Ventaja: no gastas. Costo: pierdes alumnos, que luego son más caros de recuperar.

**Qué aprende el alumno.** Que la permanencia depende del bolsillo de la familia tanto como de la escuela, y que hay indicadores adelantados (asistencia) antes del abandono.

### E-6. Los docentes capacitados se van

**Qué pasa.** Capacitas a 40 docentes y en un año 15 son trasladados, jubilados o cambian de curso. En el informe [5] se menciona un déficit docente de unos 15 mil ítems (cita a Vera, 2009) concentrado en nivel inicial y secundario del área rural. En tu escuela quedan interinos sin formación.

**Variables que mueve.**
- Docentes capacitados activos: -20% a -40% en 12 meses **[estimación]**; no hay dato boliviano de rotación.
- Calidad de la enseñanza (aprendizaje): el efecto baja en proporción.
- Costo por docente capacitado efectivo: sube.

**Decisiones posibles.**
1. *Capacitar de forma continua a quien llegue (formador en la escuela).* Ventaja: mantiene la calidad. Costo: gasto permanente y dependencia de un formador interno.
2. *Capacitar a la dirección y crear una "comunidad de práctica" entre colegios.* Ventaja: el conocimiento se queda en la institución. Costo: resultado más lento y más difícil de medir.
3. *Producir material estructurado que cualquier docente pueda usar.* Ventaja: menos dependencia de la persona. Costo: el panel del Banco Mundial [8] ubica la pedagogía estructurada con capacitación y materiales entre las "good buys", o sea, el material solo no basta.
4. *Negociar con el distrito que no trasladen a los capacitados.* Ventaja: protege la inversión. Costo: puede no ser posible y genera fricción con la administración.

**Qué aprende el alumno.** Que el capital humano capacitado es un activo que se desgasta y que hay que presupuestar su reposición.

### E-7. Piloto exitoso: escalar rápido o consolidar

**Qué pasa.** Tu programa de nivelación (enseñar según el nivel del alumno, no según el curso) da buenos resultados en 5 escuelas. El municipio y un donante te piden pasar a 40. J-PAL [7] reporta que cuando el método de enseñar al nivel real se aplicó dentro del horario escolar sin tiempo dedicado, una evaluación no halló efecto: los voluntarios fueron absorbidos por la enseñanza regular.

**Variables que mueve.**
- Cobertura: +100% a +700% **[estimación]**.
- Costo por alumno: baja por escala, pero la calidad puede bajar.
- Calidad/efecto en aprendizaje: puede caer a la mitad o a cero si se pierde la fidelidad del método. Referencia: efectos de 0,07 a 0,70 DE en seis evaluaciones en siete estados de India **[fuente: 7]**.
- Caja: más gasto antes de que lleguen los recursos.

**Decisiones posibles.**
1. *Escalar a las 40 escuelas ya.* Ventaja: más alumnos, atención del donante. Costo: calidad diluida, presión sobre el equipo, riesgo de fracaso visible.
2. *Escalar por tramos, con evaluación entre tramos.* Ventaja: aprendes y corriges. Costo: tarda; el donante puede retirar la oferta.
3. *Mantener el piloto y publicar resultados.* Ventaja: bajo riesgo. Costo: menos alumnos beneficiados y se pierde la oportunidad.
4. *Escalar con un socio que asuma la capacitación (por ejemplo, el distrito educativo).* Ventaja: reparte carga. Costo: menor control del método.

**Qué aprende el alumno.** Que un resultado bueno de un piloto no se garantiza a escala, y que escalar es una decisión económica y de calidad a la vez.

### E-8. Medir con evidencia o gastar todo en actividades

**Qué pasa.** Tu presupuesto tiene una partida de evaluación (línea de base, seguimiento, comparación con escuelas parecidas). El financiador pide más actividades. Sin esa evaluación, al final solo podrás presentar productos. El manual [1] dice que el análisis costo-impacto se aplica antes y después, y el estudio del Bono Juancito Pinto [3] muestra la dificultad de atribuir efectos cuando no hay un grupo de comparación diseñado.

**Variables que mueve.**
- Calidad de la evidencia: sube con la inversión en medición, 0 a 100 **[estimación]**.
- Presupuesto disponible para actividades: baja por el monto de la evaluación. Para fijar el orden de magnitud, el gasto operativo del Bono Juancito Pinto fue 3,8% a 4,1% **[fuente: 3]**, pero eso es logística, no evaluación; el costo de una evaluación **[estimación]**: 3% a 8% del presupuesto.
- Probabilidad de renovar fondos: sube si hay resultados medidos.
- Cobertura inmediata: baja un poco.

**Decisiones posibles.**
1. *Invertir en línea de base, seguimiento y un grupo de comparación.* Ventaja: puedes demostrar impacto y calcular costo por punto. Costo: menos alumnos atendidos en el corto plazo; el resultado puede ser desfavorable.
2. *Medir solo con registros de asistencia y notas.* Ventaja: barato. Costo: no separa tu efecto de la tendencia general.
3. *Pedir al donante que financie la evaluación aparte.* Ventaja: no tocas el presupuesto de actividades. Costo: puede demorar o no obtenerse; control externo del diseño.
4. *Ahorrar y no evaluar.* Ventaja: más actividades. Costo: no podrás justificar ni mejorar el proyecto; el próximo financiamiento es más difícil.

**Qué aprende el alumno.** Que medir cuesta y que sin contrafactual el "impacto" es una opinión.

### E-9. Tutoría y nivelación: el tiempo contra el currículo

**Qué pasa.** Una oportunidad: la evidencia dice que enseñar según el nivel real del alumno y las tutorías en grupos pequeños son de las intervenciones con mejor costo-efectividad. J-PAL [7] reporta entre 27 estudios con datos de costo que las intervenciones de enseñanza adaptada están entre las más costo-efectivas; el metaanálisis de Nickow, Oreopoulos y Quan [9] (versión de 2020) halló un efecto promedio de 0,37 DE, mayor con docentes y paraprofesionales que con voluntarios, y mayor en horario escolar que después. La dirección te dice que no hay tiempo: hay que cumplir el currículo.

**Variables que mueve.**
- Aprendizaje: +0,10 a +0,30 DE en alumnos atendidos si el programa se aplica bien **[fuente: 7 y 9, rangos de otros países]**; la magnitud en Bolivia es **[estimación]**.
- Costo por alumno: un costo bajo de ejemplo fue US$0,29 por cada 0,10 DE adicional en Kenia al agrupar por nivel, y US$3,26 en un caso urbano en India **[fuente: 7]**.
- Días efectivos de currículo: se reduce.
- Resistencia docente: sube si el horario se acorta.

**Decisiones posibles.**
1. *Negociar una hora diaria dedicada dentro del horario con la dirección.* Ventaja: mayor efecto según [7] y [9]. Costo: requiere acuerdo político con la escuela y reduce horas de otros contenidos.
2. *Hacerlo después del horario con voluntarios.* Ventaja: no depende de la dirección. Costo: menor asistencia y efecto menor; volutarios que se van.
3. *Pagar tutores profesionales.* Ventaja: mayor efecto en [9]. Costo: más caro por alumno, no sostenible sin presupuesto público.
4. *Usar software educativo.* Ventaja: escalable. Costo: necesita equipos e internet (ver E-1); el resultado en [7] varía mucho de un programa a otro (US$6,45 por 0,10 DE en un caso de computadoras).

**Qué aprende el alumno.** Que la mejor intervención depende de quién la hace y cuándo; y que "lo que funciona" en otro país es una hipótesis para probar acá.

### E-10. Beca o transferencia: cuántos reciben y con qué condición

**Qué pasa.** Diseñas una beca para que los alumnos de secundaria rural no abandonen. El presupuesto alcanza para la mitad de los alumnos. Si focalizas en los más vulnerables, el costo por alumno que se queda es menor pero hay errores de exclusión; si das a todos, diluyes. El Bono Juancito Pinto es de cobertura universal en la escuela pública y, según el estudio del BCB [3], tuvo efectos de alrededor de 1% en matriculación, 1% en permanencia y 3,7% en promoción, con gastos operativos de 3,8% a 4,1% del presupuesto. El monto subió de Bs 200 a Bs 300 anunciado para 2026, para 2.256.646 estudiantes y unos Bs 690 millones [14].

**Variables que mueve.**
- Permanencia: +1 a +3 puntos en la población atendida **[fuente: 3 da ~1% promedio]**; focalizado puede ser más alto **[estimación]**.
- Costo por punto de permanencia: depende de focalización **[estimación]**.
- Caja: sube con la cobertura.
- Riesgo de exclusión: sube si se focaliza.
- Gasto operativo: 3% a 6% adicional por verificación de condicionalidad **[estimación; base 3,8%-4,1% en 3]**.

**Decisiones posibles.**
1. *Focalizar en los más pobres y en los de mayor riesgo.* Ventaja: menor costo por punto de permanencia ganado. Costo: errores de exclusión, costo de verificar a quién corresponde y posible estigma.
2. *Cobertura universal en las escuelas elegidas.* Ventaja: simple y sin estigma. Costo: gran parte llega a quien no estaba en riesgo (efecto "ya hubiera estado igual").
3. *Condicionar el pago a asistencia mensual.* Ventaja: mejor incentivo. Costo: más burocracia y más gasto operativo; excluye al que falta por causas ajenas.
4. *Pagar de una vez al año (como el Bono Juancito Pinto).* Ventaja: simple y barato. Costo: incentivo débil durante el año.

**Qué aprende el alumno.** Que la focalización cambia el costo por resultado, y que el beneficio de un subsidio general no es todo "impacto".

### E-11. Escuela rural sin conectividad ni luz estable

**Qué pasa.** Tu proyecto de educación digital llega a escuelas rurales. El internet es lento o no existe, y la luz se corta. Durante la pandemia, según una nota de EFE de 2021, en San Pablo de Tiquina solo alrededor de 30% de las personas pudo participar en clases a distancia, según una vecina entrevistada [16], y un informe del Banco Mundial citado por la misma nota estimó la deserción en Bolivia en 20% [16].

**Variables que mueve.**
- Uso efectivo del equipo y de la plataforma: depende de la conectividad; en la zona de [16] ~30% de participación **[fuente: 16, una sola localidad y una sola entrevistada]**.
- Brecha rural-urbana: sube.
- Costo de conectividad: recurrente, sube el costo por alumno **[estimación]**.
- Aprendizaje: sin efecto si no se usa.

**Decisiones posibles.**
1. *Pagar conectividad satelital o por radio.* Ventaja: el servicio funciona. Costo: gasto recurrente alto; si el proyecto termina, se corta.
2. *Usar contenidos sin conexión y radio o TV educativa.* Ventaja: barato y llega a más gente. Costo: menos interacción y menos medible.
3. *Concentrar en las escuelas con mejor infraestructura.* Ventaja: mejor resultado y mejor costo por alumno. Costo: deja afuera a los que más lo necesitan y amplía la brecha.
4. *Combinar material impreso y tutoría presencial.* Ventaja: funciona sin tecnología. Costo: más personal y logística.

**Qué aprende el alumno.** Que el costo por alumno en zona rural no es el mismo que en la ciudad, y que la equidad y la eficiencia pueden ir en sentido contrario.

### E-12. Cosecha, zafra y trabajo: el calendario compite con la escuela

**Qué pasa.** En varias regiones, los adolescentes ayudan en la cosecha o migran por la zafra. El informe de niños fuera de la escuela [5] señala que las peores formas de trabajo infantil (zafra de castaña, caña de azúcar y minería) pueden negar el derecho a la educación, y que la mayoría de los niños fuera de la escuela que trabajan lo hacen en tareas domésticas. En esos meses, la asistencia a tu programa cae.

**Variables que mueve.**
- Asistencia mensual: -20% a -50% en los meses de cosecha **[estimación]**.
- Abandono: +1 a +2 puntos si la ausencia se alarga **[estimación]**.
- Costo de oportunidad de la familia: sube en esos meses.

**Decisiones posibles.**
1. *Calendario flexible o módulos de recuperación.* Ventaja: el alumno no pierde el año. Costo: complejidad, necesita aprobación del distrito y más personal.
2. *Compensar con un incentivo económico en los meses críticos.* Ventaja: reduce el costo de oportunidad. Costo: dinero extra; puede no competir con el ingreso real.
3. *Trabajar con los padres y la comunidad para acordar horarios.* Ventaja: barato y construye apoyo. Costo: efecto lento y difícil de medir.
4. *Mantener el calendario oficial.* Ventaja: simple. Costo: pierdes alumnos justo cuando más lo necesitan.

**Qué aprende el alumno.** Que la permanencia tiene estacionalidad y que el costo de oportunidad es parte del análisis económico, no un detalle (ver [2]).

### E-13. Embarazo adolescente y discriminación en la escuela

**Qué pasa.** Varias alumnas de secundaria quedan embarazadas. El informe [5] identifica el embarazo adolescente como una barrera de demanda que aumenta la probabilidad de abandono temporal o permanente, y señala que las prácticas discriminatorias de algunos profesores y la hostilidad de compañeros terminan en abandono. En el mismo informe, el porcentaje de adolescentes de 14 a 17 años fuera de la escuela es mayor entre mujeres, indígenas, residentes rurales y pobres.

**Variables que mueve.**
- Abandono entre alumnas: +2 a +5 puntos en la cohorte afectada **[estimación]**.
- Brecha de género en permanencia: sube.
- Costo por alumna retenida: sube si se agrega apoyo específico **[estimación]**.

**Decisiones posibles.**
1. *Crear un protocolo de retención con la dirección y capacitar a docentes.* Ventaja: cambia la causa. Costo: tiempo, resistencia cultural y resultados lentos.
2. *Ofrecer horarios flexibles y apoyo para el cuidado del bebé.* Ventaja: permite seguir estudiando. Costo: más caro por alumna y exige alianza con el municipio.
3. *Programa de prevención y educación sexual.* Ventaja: previene el problema. Costo: sensibilidad social, necesita permisos y el resultado se ve a largo plazo.
4. *Enfocarse solo en cobertura general.* Ventaja: no entra en un tema delicado. Costo: no corriges una causa conocida de abandono.

**Qué aprende el alumno.** Que algunas causas de abandono son culturales y que los indicadores promedio ocultan a los grupos más afectados.

### E-14. Emergencia: cierre prolongado de clases

**Qué pasa.** Una emergencia (pandemia, inundación, bloqueo) cierra las escuelas por meses. En 2020 Bolivia suspendió las clases presenciales en marzo y cerró el año escolar anticipadamente en agosto; el año 2021 comenzó en febrero con modalidades a distancia, semipresencial y presencial, según EFE [16]. Tus actividades presenciales se detienen y el financiador pregunta si cambias el plan.

**Variables que mueve.**
- Días efectivos de clase: -20% a -60% del año **[estimación]**; 2020 cerró el año escolar en agosto **[fuente: 16]**.
- Abandono: sube, con una estimación general de 20% en Bolivia atribuida al Banco Mundial en [16], sin detalle de año ni nivel.
- Aprendizaje: baja, sin cifra boliviana confirmada.
- Costo por alumno: sube al reconvertir la modalidad.

**Decisiones posibles.**
1. *Pasar a modalidad remota (radio, TV, mensajes).* Ventaja: mantienes contacto. Costo: llega mejor a quien tiene dispositivos; los más pobres quedan atrás [16].
2. *Entregar guías impresas y seguimiento telefónico.* Ventaja: llega a más hogares. Costo: más logística y menor interacción.
3. *Pausar y retomar con nivelación intensiva.* Ventaja: ahorras en la emergencia. Costo: el abandono ya ocurrió y la nivelación es más cara luego.
4. *Reasignar presupuesto a ayuda directa a familias (alimentos, datos móviles).* Ventaja: protege la permanencia. Costo: se aleja del objetivo original y el financiador puede no aprobarlo.

**Qué aprende el alumno.** Que los proyectos de educación necesitan un plan B para cuando la escuela no abre, y que cambiar de modalidad tiene costo y efecto desigual.

---

## 6. Variables propias que debería manejar el motor

Todas son sugerencias de diseño (Interpretación). La unidad mensual y la estacionalidad del año escolar son clave: el año 2021 comenzó en febrero [16] y el pago anual del Bono Juancito Pinto se hace en octubre-noviembre [14]; no verifiqué el mes exacto de cierre del año escolar, así que el motor debe permitirlo configurable.

| Variable | Qué representa | Cómo se actualiza cada mes |
|----------|----------------|----------------------------|
| matricula_activa | Alumnos inscritos y asistiendo en el ámbito del proyecto | Se fija en el mes de inicio de clases (cohorte); baja con el abandono mensual; sube con captación nueva si el proyecto capta |
| asistencia_pct | Porcentaje de alumnos que asisten en el mes | Base x factor estacional (cosecha, clima, paro) x efecto del proyecto; es indicador adelantado del abandono |
| abandono_acumulado | Alumnos que dejaron la escuela en el año | Cada mes: alumnos activos x probabilidad de abandono, que sube con baja asistencia sostenida y con choques económicos |
| permanencia_pct | 100 menos abandono acumulado, sobre inscritos al inicio | Se recalcula cada mes; se reporta al cierre del año |
| promocion_pct | Alumnos aprobados sobre inscritos | Se calcula una vez al año (al cierre del calendario); depende de permanencia, días efectivos de clase y aprendizaje |
| aprendizaje_idx | Índice de nivel de aprendizaje de los alumnos atendidos (en DE o 0-100) | Cada mes sube por intensidad del programa x días efectivos x calidad docente; cae con paros, rotación y equipos sin uso |
| dias_efectivos | Días de clase dictados en el mes | Días del calendario menos paros, bloqueos y emergencias |
| uso_equipo_pct | Proporción de equipos realmente usados | Baja si no hay mantenimiento, conexión o técnico; sube con capacitación y presupuesto de operación |
| docentes_capacitados_activos | Docentes formados que siguen en el proyecto | Suma capacitaciones; resta una rotación mensual (jubilación, traslado) |
| contrapartida_recibida / comprometida | Dinero que pone otro nivel de gobierno | Compara cada mes lo prometido con lo recibido; retraso por cambio de autoridad o presupuesto |
| financiamiento_restante_meses | Meses de operación cubiertos por fondos asegurados | Fondos asegurados / gasto mensual; al llegar a cero dispara el escenario de cierre |
| costo_recurrente_sin_dueño | Costo de operar que nadie ha asumido después del proyecto | Se calcula como gasto de operación - gasto con convenio de traspaso |
| confianza_comunidad | Apoyo de padres, docentes y dirección | Sube con cumplimiento y comunicación; baja con equipos parados y obras detenidas |
| calidad_evidencia | Cuán confiable es la medición del impacto | Sube con línea de base y grupo de comparación; limita la credibilidad ante el financiador |
| costo_por_alumno | Costo acumulado / alumnos atendidos | Costo mensual acumulado dividido entre alumnos activos |
| costo_por_punto_permanencia | CUI aplicado a permanencia | CTA anual / puntos de permanencia ganados vs. el contrafactual (necesita permanencia sin proyecto de referencia) |
| permanencia_contrafactual | Permanencia que habría ocurrido sin el proyecto | Parámetro del escenario más tendencia; el motor la usa para calcular el impacto real |
| brecha_rural_urbana | Diferencia de resultados entre ámbitos | Se amplía si el proyecto concentra recursos en lo urbano; se reduce si prioriza lo rural |

Nota de diseño (Interpretación): el simulador debería calcular el impacto como la diferencia entre `permanencia_pct` y `permanencia_contrafactual`, y el "costo por punto" con esa diferencia. Eso alinea el motor con el ACI del manual CEPAL [1] y con el aviso de [3] sobre atribución.

---

## 7. Ejemplos reales de Bolivia y Latinoamérica

Todos los enlaces fueron abiertos por mí. Salvo indicación, leí el texto.

1. **Bono Juancito Pinto (Bolivia, desde 2006).** Transferencia anual a estudiantes de escuela pública, hoy Bs 200 (Bs 300 anunciado para 2026) [3][14]. El estudio del BCB halla efectos de cerca de 1% en matriculación, 1% en permanencia y 3,7% en promoción, con 4,1% de gasto operativo en 2006-2011 [3]. En 2023 se pagó con Bs 477 millones, de los cuales 42% (Bs 200 millones) vinieron de utilidades de YPFB [15]. Enlaces: https://www.bcb.gob.bo/webdocs/publicacionesbcb/2_Bono_Juancito_Pinto.pdf , https://correodelsur.com/economia/20231008/ypfb-aporta-el-42-de-los-recursos-para-el-pago-del-bono-juancito-pinto.html , https://correodelsur.com/sociedad/20260923/el-pago-del-bono-juancito-pinto-comenzara-el-lunes-19-de-octubre.html . Lección: una transferencia universal con financiamiento de empresas estatales depende de la salud de esas empresas (Interpretación).
2. **Laptops Kuaa de Quipus en colegios fiscales (Bolivia, entregadas desde 2017 según la nota).** En Quillacollo y Sipe Sipe estaban guardadas y obsoletas en 2021 por falta de mantenimiento, de internet y de insumos [12]. No encontré una evaluación oficial del programa. Enlace: https://www.lostiempos.com/actualidad/cochabamba/20210211/computadoras-quipus-ya-no-se-usan-se-guardan-estan-obsoletas . Es una nota de prensa de una región; no sirve para generalizar al país.
3. **Clases en pandemia en zonas rurales (Bolivia, 2020-2021).** La nota de EFE describe el cierre anticipado del año 2020 en agosto, la baja participación remota en San Pablo de Tiquina y la estimación del Banco Mundial de 20% de deserción [16]. Enlace: https://www.swissinfo.ch/spa/contrastes-y-desigualdades-de-la-educaci%c3%b3n-en-tiempos-de-covid-en-bolivia/46459268 .
4. **Niños fuera de la escuela en Bolivia (diagnóstico, datos de 2007).** El informe [5] identifica quiénes están fuera y las barreras de demanda, oferta y gestión. Enlace: https://www.allinschool.org/media/1661/file/Bolivia-OOSCI-Country-Study-2011-sp.pdf .
5. **Progresa (México, desde 1997).** Becas educativas a madres pobres, con asignación aleatoria de comunidades. Schultz estimó una tasa interna de retorno de alrededor de 8% bajo supuestos [11]; solo leí el resumen. Enlace: https://econpapers.repec.org/RePEc:fpr:fcndbr:102 .
6. **One Laptop per Child en Perú.** Evaluación del BID en escuelas rurales: una nota del Banco Mundial describe que el uso de las computadoras en clase decayó con el tiempo y que no se midió impacto en aprendizaje en la primera ronda [WB]; el resumen del BID, que vi solo en resultados de búsqueda y no pude abrir (la página dio error 403), indica 319 escuelas rurales, ratio de computadoras por alumno de 0,12 a 1,18 y sin efecto en notas de matemática y lenguaje [10]. Enlace abierto: https://blogs.worldbank.org/edutech/OLPC-peru . Enlace que no pude abrir: https://publications.iadb.org/en/publication/16431/technology-and-child-development-evidence-one-laptop-child-program .
7. **Enseñanza al nivel del alumno (India, Kenia, Chile).** J-PAL reúne 13 evaluaciones aleatorias; en India seis evaluaciones en siete estados hallaron mejoras de 0,07 a 0,70 DE; en Kenia, agrupar por nivel dio 0,18 DE a US$0,29 por cada 0,10 DE [7]. Enlace: https://www.povertyactionlab.org/node/4537 . Son contextos distintos a Bolivia.

Alfabetización: Bolivia fue declarada libre de analfabetismo en 2008 con el programa "Yo, sí puedo", según varias fuentes que vi en una búsqueda, mayormente medios afines al gobierno; **no abrí ninguna**, por eso no las uso como ejemplo (ver sección 9).

---

## 8. Fuentes numeradas

Nivel: A (libro, paper, organismo, manual universitario, norma), B (consultora, reporte sectorial, prensa), C (blog, práctica). "Lectura" indica qué parte leí con texto.

| N.º | Fuente | Nivel | Lectura | Enlace |
|-----|--------|-------|---------|--------|
| 1 | Ernesto Cohen y Rodrigo Martínez, *Manual: Formulación, evaluación y monitoreo de proyectos sociales*, CEPAL, División de Desarrollo Social. Fecha del texto extraído no confirmada | A | Extraje el texto del PDF y leí las secciones de ACB, ACM, ACI, objetivos e indicadores de impacto, matriz costo-impacto y CUI | https://dds.cepal.org/redesoc/archivos_recursos/242/Manual_dds_200408.pdf |
| 2 | Pedro Belli y otros, *Economic Analysis of Investment Operations*, World Bank Institute. Edición y año según el PDF: primera impresión enero de 2001 (dato tomado del mapa general del proyecto, no verificado de nuevo) | A | Extraje el texto y leí cap. 7 (costo-efectividad) y cap. 8 (evaluación económica de proyectos de educación, categorías de costos) | https://documents1.worldbank.org/curated/en/792771468323717830/pdf/298210REPLACEMENT.pdf |
| 3 | Hernán Aguilar Pacajes, "Evaluación de impacto del Bono Juancito Pinto en Bolivia", Revista de Análisis, BCB, vol. 21, julio-diciembre 2014, pp. 37-66 | A (paper) | Extraje el texto; leí resumen, descripción, costos operativos, modelo de panel y conclusiones | https://www.bcb.gob.bo/webdocs/publicacionesbcb/2_Bono_Juancito_Pinto.pdf |
| 4 | Ley N.º 070 de la Educación "Avelino Siñani - Elizardo Pérez", 20 de diciembre de 2010, Gaceta Oficial de Bolivia | A (norma) | Extraje el texto; leí Art. 1, Art. 80 y Art. 89 | https://redclade.org/wp-content/uploads/Ley-070.pdf |
| 5 | Informe de país de la iniciativa Niños Fuera de la Escuela (Bolivia), diciembre de 2011; el texto agradece a la oficina regional de UNICEF y al Ministerio de Educación. No confirmé el título exacto ni los autores | A (organismo) | Extraje el texto y leí el resumen ejecutivo con cifras y barreras | https://www.allinschool.org/media/1661/file/Bolivia-OOSCI-Country-Study-2011-sp.pdf |
| 6 | Normas Básicas del Sistema Nacional de Inversión Pública, Resolución Suprema N.º 216768 (1996), versión original según la página | A (norma) | Texto de la página de infoleyes (extracto con artículos 2, 12, 14, 15, 24, 28, 29); no leí el Reglamento Básico de Preinversión | https://bolivia.infoleyes.com/norma/799/normas-b%C3%A1sicas-del-sistema-nacional-de-inversi%C3%B3n-p%C3%BAblica-216768 |
| 7 | J-PAL, "Tailoring instruction to students' learning levels to increase learning" (policy insight) | A (centro de investigación) | Texto de la página: resultados de 13 evaluaciones y costos | https://www.povertyactionlab.org/node/4537 |
| 8 | Banco Mundial, página de "Cost-effective approaches to improve global learning" (informe "Smart Buys" del panel GEEAP, 2023) | A (organismo), pero solo la página, no el informe | Texto de la página: clasificación de great, good y bad buys | https://www.worldbank.org/en/topic/teachingandlearning/publication/cost-effective-approaches-to-improve-global-learning |
| 9 | Andre Nickow, Philip Oreopoulos y Vincent Quan, NBER Working Paper 27476, julio de 2020 (tutorías preK-12) | A (paper) | Solo página con resumen; un resultado de búsqueda indica que la versión publicada posterior da un efecto de 0,288 DE, no verificado por mí | https://www.nber.org/papers/w27476 |
| 10 | Cristia, Ibarrarán, Cueto, Santiago y Severín, "Technology and Child Development: Evidence from the One Laptop per Child Program", BID | A (paper) | **No lo abrí** (la página dio error 403); uso solo lo que mostró un resultado de búsqueda | https://publications.iadb.org/en/publication/16431/technology-and-child-development-evidence-one-laptop-child-program |
| 11 | T. Schultz, IFPRI FCND Brief N.º 102, 2001, sobre Progresa | A (informe de centro de investigación) | Solo resumen (EconPapers) | https://econpapers.repec.org/RePEc:fpr:fcndbr:102 |
| 12 | Los Tiempos, "Las computadoras Quipus ya no se usan, se guardan y están obsoletas", Cristina Cotari, 11/2/2021 | B (prensa) | Texto leído | https://www.lostiempos.com/actualidad/cochabamba/20210211/computadoras-quipus-ya-no-se-usan-se-guardan-estan-obsoletas |
| 13 | Los Tiempos, nota sobre factores de deserción escolar, Nelson Peredo, 21/11/2016 | B (prensa) | Texto leído: cifras oficiales y cuatro factores | https://www.lostiempos.com/node/127782 |
| 14 | Correo del Sur, nota sobre el pago del Bono Juancito Pinto 2026 | B (prensa) | Texto leído | https://correodelsur.com/sociedad/20260923/el-pago-del-bono-juancito-pinto-comenzara-el-lunes-19-de-octubre.html |
| 15 | Correo del Sur, nota sobre el aporte de YPFB al Bono Juancito Pinto, 8/10/2023 | B (prensa) | Texto leído | https://correodelsur.com/economia/20231008/ypfb-aporta-el-42-de-los-recursos-para-el-pago-del-bono-juancito-pinto.html |
| 16 | EFE vía Swissinfo, nota sobre educación y covid en Bolivia, marzo de 2021 | B (prensa/agencia) | Texto leído | https://www.swissinfo.ch/spa/contrastes-y-desigualdades-de-la-educaci%c3%b3n-en-tiempos-de-covid-en-bolivia/46459268 |
| WB | Banco Mundial, blog "Learning from a randomized evaluation of OLPC in Peru" | B (blog de organismo) | Texto leído | https://blogs.worldbank.org/edutech/OLPC-peru |

**Conteo de nivel A con texto leído:** [1], [2], [3], [4], [5], [6] y [7] (siete) con texto de la fuente. [8], [9] y [11] solo páginas o resúmenes. [10] no abierta. Se cumple el mínimo de 4 nivel A leídos con texto. Fuentes distintas abiertas: 17 en total con el blog del Banco Mundial.

---

## 9. No confirmado

- **Año y edición exactos** del manual de la CEPAL [1] y del libro de Belli [2]; los tomé del mapa general o del nombre del archivo.
- **Todas las fórmulas de tasas** (matriculación, permanencia, abandono, promoción) están reconstruidas de memoria; no abrí un manual estadístico del Ministerio de Educación que las defina. El CUI y la razón de costo-efectividad sí vienen de [1] y [2].
- **Costo por alumno descontado** [2]: leí la descripción y un ejemplo (Mauricio, cifras de rupias), pero no la fórmula completa.
- **Aprendizaje ajustado por años de escolaridad (LAYS)**: solo vi el título de un documento de apoyo en la página del Banco Mundial [8]; no confirmo que el panel lo use.
- **Informe completo "Smart Buys" de 2023**: solo leí la página resumen [8].
- **Metaanálisis de tutorías**: el 0,37 DE es del documento de trabajo de 2020; la versión publicada reporta 0,288 DE según un resultado de búsqueda que no abrí. Usé ambos con esa advertencia.
- **Evaluación de OLPC en Perú**: no pude abrir la página del BID (error 403). El detalle de 319 escuelas y de la relación computadoras por alumno viene de un resultado de búsqueda, no de lectura directa. El estudio posterior "Laptops in the Long-Run" también aparece solo en un resultado de búsqueda.
- **Programa de alfabetización "Yo, sí puedo"** y la declaratoria de Bolivia como libre de analfabetismo: solo vi resultados de búsqueda (en su mayoría medios afines al gobierno y una columna crítica); no abrí ninguna. Cifras citadas allí (819.417 alfabetizados de 824.101) y la discrepancia 2,9% contra 3,8% no verificadas.
- **Paros del magisterio**: el dato de 77% de escuelas con clases normales (marzo de 2023) y el acuerdo del 21/4/2025 aparecen en resultados de búsqueda, no los abrí. No encontré el total de días de clase perdidos en Bolivia.
- **ERCE 2019 en Bolivia**: un resultado de búsqueda indica que Bolivia no aplicó las pruebas en 2019 por el contexto sociopolítico y que el último puntaje comparable es el TERCE 2013 (662 de 1.150, según prensa). No abrí esas fuentes; no uso cifras de aprendizaje de Bolivia en el documento.
- **Datos de abandono por área rural y urbana actuales**: solo tengo cifras nacionales de 2016 [13] y cifras de 2007 [5]. El informe [5] dice que el abandono es mayor entre residentes rurales, pero no cuantifiqué la brecha aquí.
- **Reglamento Básico de Preinversión del SNIP** y guías sectoriales de educación: no los encontré ni los leí. No confirmo si hoy se exige costo-eficiencia para proyectos educativos municipales.
- **Estado actual de la Ley 070**: la versión que leí es la original de la Gaceta (2010); no verifiqué modificaciones posteriores.
- **Monto del Bono Juancito Pinto en 2026**: Bs 300 según una nota de prensa [14] que cita al presidente y al ministro y un Decreto Supremo 5712; no vi el decreto. La cifra de Bs 690 millones no cuadra exactamente con 2.256.646 x 300 (la nota no lo explica).
- **Estacionalidad del año escolar boliviano** (mes de cierre) y mes de pago del bono: solo tengo datos puntuales de 2020, 2021, 2023 y 2026 en las notas.
- **SROI**: no abrí la guía del Cabinet Office; la sección 3 solo la menciona por referencia al mapa general.
- **Rotación docente, uso real de equipos, sobrecosto rural de conectividad**: sin dato boliviano abierto.

---

## 10. Cifras que necesitan validación local

| Cifra (usada en la sección 5 o 6) | Origen | Quién podría aportarla |
|----------------------------------|--------|------------------------|
| Pérdida de días de clase por paros y conflictos (-5% a -15% del año) | Estimación | Ministerio de Educación (calendario escolar y días efectivos), Dirección Departamental de Educación, federaciones de maestros |
| Aumento del abandono por choques económicos o sequía (+1 a +3 puntos) | Estimación | INE (encuestas de hogares), Ministerio de Educación (Registro Único de Estudiantes, RUDE), UNICEF Bolivia |
| Abandono en alumnas por embarazo adolescente (+2 a +5 puntos) | Estimación | Ministerio de Salud, UNICEF/UNFPA, direcciones distritales |
| Rotación de docentes capacitados (-20% a -40% en 12 meses) | Estimación | Direcciones distritales, Ministerio de Educación (escalafón, interinatos), docentes de la carrera de pedagogía |
| Caída de uso de equipos sin mantenimiento (20% a 50% del plan) | Estimación; hay casos cualitativos en [12] | Direcciones de escuelas con laboratorios, gobiernos municipales, empresas proveedoras |
| Efecto en aprendizaje de la nivelación y tutoría en Bolivia (+0,10 a +0,30 DE) | Rangos de otros países [7][9] | Investigadores locales, universidades, evaluaciones piloto de ONG educativas |
| Costo de conectividad rural por escuela y por alumno | Sin dato boliviano abierto | Entel, AGETIC, ATT, municipios rurales |
| Costo de una evaluación de impacto como porcentaje del presupuesto (3% a 8%) | Estimación | Consultoras de evaluación, UDAPE, docentes de evaluación de proyectos |
| Caída de asistencia en meses de cosecha o zafra (-20% a -50%) | Estimación | Direcciones distritales rurales, ONG de trabajo infantil, INE |
| Aporte de contrapartida municipal (0% a 50% del comprometido durante 3 a 9 meses) | Estimación | Municipios, VIPFE/Ministerio de Planificación, Ministerio de Economía (ejecución presupuestaria) |
| Caída de cobertura al cerrar financiamiento (-30% a -100%) y retorno del abandono en 1 a 2 años | Estimación | ONG con programas finalizados, evaluaciones ex-post |
| Escalamiento: pérdida de calidad al pasar de 5 a 40 escuelas | Estimación; el caso de [7] muestra que puede llegar a cero | Programas que escalaron, J-PAL/Pratham, ministerio |
| Tasas actuales de matriculación, permanencia, abandono y promoción por área y nivel | Sin dato actual abierto (hay cifras de 2007 y 2016) | Ministerio de Educación (SIE), INE |
| Gasto operativo de programas de transferencia de 3% a 6% adicional por verificar condicionalidad | Estimación sobre base de 3,8%-4,1% de [3] | Ministerio de Educación, BDP |
| Duración del año escolar y meses de cierre y pago de bonos | Datos parciales | Ministerio de Educación (calendario escolar anual) |
| Rango de costo por alumno en proyectos de equipamiento y capacitación en Bolivia | Sin dato abierto | Ministerio de Educación, gobiernos municipales, proyectos del BID y el Banco Mundial |
