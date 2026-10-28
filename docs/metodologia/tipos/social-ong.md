# Tipo B3: Proyectos sociales y de ONG

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que abrí esa fuente y leí la parte citada (en la sección 8 aclaro cuánto leí de cada una).
- **Interpretación** o **estimación** es razonamiento mío para traducirlo a un simulador. No es una cita. Toda magnitud que no viene de una fuente está marcada como "estimación".
- Lo que no pude abrir o confirmar está en la sección 9. No lo uses como dato.
- Los números de las fuentes son los de su fecha y país; ninguno es un parámetro listo para el motor.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

Un proyecto social o de ONG busca un **cambio en una población objetivo** (por ejemplo, niños que dejan de desnutrirse, familias con agua segura, jóvenes que terminan el colegio). No vende nada: se financia con donaciones, cooperación internacional o fondos públicos. Por eso no tiene ingresos por ventas y, medido como negocio, siempre "pierde plata".

Lo que dice la fuente principal para este tipo, el manual de CEPAL [S1]:

- El proceso productivo de la gestión social es: insumos + procesos/actividades = productos; y luego efectos e impactos. Los productos (lo que el proyecto entrega) son parte interna; los efectos e impactos ocurren en la población y su relación con los productos "es una estimación" que hay que explicitar antes y verificar después [S1, sección 1].
- Un proyecto es **sustentable** si tiene la capacidad instalada (recursos físicos, humanos y financieros) para operar, y es **sostenible** si los impactos perduran en el tiempo. Hay impactos que solo duran mientras el programa opera (el manual da el ejemplo de los subsidios a servicios básicos) y otros más permanentes (terminar un nivel educativo, una vacuna) [S1].
- Los proyectos sociales se justifican por cobertura y focalización: llegar a quienes tienen la necesidad (población objetivo) y no a otros [S1].

El Banco Mundial pone el mismo punto de otra forma: aun los proyectos con grandes beneficios pasan por períodos flacos en que fondos externos deben sostenerlos, y "el perfil del flujo de caja es a menudo tan importante como los beneficios totales" [S2, sección sobre sostenibilidad financiera, traducción mía].

**Cómo aporta valor, en palabras simples** (interpretación): el valor está en el cambio que el proyecto causa y que no habría ocurrido igual sin él. La plata solo es el medio. Por eso un simulador de este tipo debería premiar al alumno por (a) llegar a las personas correctas, (b) lograr el cambio al menor costo razonable, (c) mantener la operación sin depender de un solo financiador y (d) rendir cuentas con evidencia, no por tener caja positiva.

## 2. Indicadores propios y cómo se calculan

Cada fórmula dice de dónde sale. Las que son interpretación mía están marcadas.

### 2.1 Cadena de resultados y marco lógico

El marco lógico (ILPES/CEPAL) organiza el proyecto en una matriz de cuatro niveles de objetivos (Fin, Propósito, Componentes, Actividades) y cuatro columnas (resumen narrativo, indicadores, medios de verificación, supuestos) [S3]. Reglas que leí:

- **Lógica vertical**: si hacemos las Actividades y se cumplen ciertos supuestos, producimos los Componentes; si producimos los Componentes y se cumplen otros supuestos, logramos el Propósito; y así hasta contribuir al Fin [S3, sección de supuestos].
- Los **supuestos son riesgos fuera del control directo de la gerencia** del proyecto (por ejemplo, que lleguen los fondos de contraparte, un cambio de prioridades del gobierno, una huelga, una devaluación fuerte) [S3].
- El manual dice que no se trata de listar toda eventualidad, sino las que tienen "un grado razonable de probabilidad" [S3].

Uso en el simulador (interpretación): los eventos de la sección 5 son, casi todos, supuestos del marco lógico que fallan o se cumplen.

### 2.2 Cobertura y focalización [S1, sección 1.5]

- Cobertura = personas atendidas / tamaño de la población objetivo x 100.
- Cobertura **neta** = POA / POP x 100, donde POA es la población objetivo atendida y POP la población objetivo programada.
- Cobertura **bruta** = (POA + PNOA) / POP x 100, donde PNOA es población no objetivo atendida. La bruta puede pasar de 100%.
- Error de inclusión: entregar a quien no es población objetivo. Error de exclusión: no entregar a quien sí lo es. Si ambos son cero, la focalización es perfecta [S1].
- El manual aclara que no conviene focalizar cuando hacerlo cuesta más que distribuir a todos (por ejemplo, vacunas ante una epidemia) [S1].

### 2.3 Costos y eficiencia [S1, sección 4]

- **Costo por unidad de producto**: CUP = CTA / SAP, donde CTA es el costo total anual y SAP la cantidad de productos entregados en el año. Es un indicador de **eficiencia** [S1].
- **Costo por beneficiario** (interpretación): costo total / personas atendidas. Es un CUP donde el producto es "una persona atendida". Cuidado: no dice si la persona cambió.
- **Costo por beneficiario con resultado** (interpretación): costo total / personas que lograron el cambio. Es lo que más se acerca al costo-efectividad cuando hay un resultado discreto (terminó el año, salió de desnutrición).
- El manual advierte: la eficiencia en producir productos "no implica efectividad en el logro de los objetivos de impacto" [S1, sección 4.2].

### 2.4 Costo por unidad de impacto (costo-efectividad) [S1, sección 4.3]

- **CUI** (por objetivo): CUI_ij = CTA_i / (OB_ij x 100), donde OB_ij es el impacto medio anual de la alternativa i en el objetivo j (meta de impacto dividida el número de períodos), normalmente en porcentaje. Si hay varios objetivos, todos deben estar en la misma escala.
- **CUIA** (agregado): CUIA_i = CTA_i / (ITP_i x 100), con ITP un índice ponderado de impacto. El manual aclara que los valores no son comparables con otras evaluaciones, solo entre las alternativas evaluadas.
- Ejemplo del propio manual: CUI11 = 463.020 / (0,020 x 100) = 231.510 (US$ por unidad de impacto) para la alternativa 1 de un consultorio [S1].
- **CUI real ex post**: CUIr = costos reales / impactos alcanzados, para comparar con lo proyectado [S1, sección 7.3].
- Banco Mundial [S2, cap. 7]: en el análisis de costo-efectividad los beneficios se miden en unidades no monetarias (puntaje de pruebas, matriculados, niños vacunados). Su ejemplo (de Levin, 1983, hipotético) calcula costo por punto: 300/20 = 15, 100/4 = 25, 150/15 = 10, 50/10 = 5. Es decir, se divide el **costo** entre el **efecto**; menor es mejor.
- J-PAL lo expresa al revés: efecto por dólar, por ejemplo "años adicionales de escolaridad por cada US$ 100 gastados" = impacto medio por estudiante x estudiantes alcanzados, sobre el costo total, incluyendo costos de quien implementa **y de los beneficiarios** [S8].
- Advertencia del Banco Mundial [S2]: los cocientes de costo-efectividad se usan con seguridad solo si el numerador o el denominador son iguales entre alternativas. Si varían ambos, pregunta si la ganancia marginal justifica el costo marginal (en su ejemplo, pasar de tutoría entre pares a instrucción por computadora cuesta US$ 20 por punto adicional).
- Cuando hay varios objetivos no monetarios se usa costo-efectividad **ponderado** (se reducen a una sola medida con pesos) [S2].

### 2.5 SROI (retorno social de la inversión) [S4]

- Ratio = valor presente del valor social creado / valor presente de la inversión. Un 3:1 significa que cada 1 invertido crea 3 de valor social [S4].
- Para no inflar el resultado, la guía descuenta: **deadweight** (parte del resultado que habría ocurrido igual sin el proyecto), **desplazamiento** (parte que solo movió el problema a otro lado), **atribución** (parte causada por otras organizaciones o personas) y **drop-off** (caída del efecto en años siguientes).
- Drop-off, según la guía: se resta un porcentaje fijo del nivel de resultado restante al final de cada año; ejemplo: un resultado de 100 que dura tres años con 10% anual de caída vale 100, 90 y 81 [S4].
- La guía dice que el deadweight "siempre será una estimación" porque no hay comparación perfecta, y que se calcula con grupos de comparación o tendencias de referencia [S4].
- La guía advierte contra comparar ratios entre organizaciones sin contexto [S4].
- Combinación de los descuentos (interpretación): impacto neto = resultado bruto x (1 - deadweight) x (1 - desplazamiento) x (1 - atribución), luego se aplica el drop-off año a año. La guía trata cada uno como un porcentaje que se descuenta; el orden multiplicativo es mi lectura.

### 2.6 Evaluación de impacto

- Impacto verdadero = diferencia entre lo observado y lo que habría pasado sin el proyecto (el contrafactual). Para medirlo el manual de CEPAL describe modelos experimental, cuasiexperimental y no experimental, con línea de base y grupo de control seleccionados antes de empezar [S1, cap. 7]. El libro *Impact Evaluation in Practice* (Gertler y otros) es el texto de referencia; solo confirmé su ficha y resumen (ver S9 y sección 9).
- Ojo con la palabra "impacto": los criterios OECD/DAC 2019 definen impacto como los efectos de alto nivel, positivos o negativos, buscados o no, y reconocen que se suele confundir con "atribución válida" de la evaluación de impacto [S5].
- Los seis criterios OECD/DAC (pertinencia, coherencia, eficacia, eficiencia, impacto, sostenibilidad) son la referencia que usan cooperantes para evaluar. Eficiencia: "hasta qué punto la intervención entrega resultados de manera económica y a tiempo". Sostenibilidad: "¿durarán los beneficios?", incluye capacidades financieras, económicas, sociales, ambientales e institucionales [S5].

### 2.7 Indicadores financieros de la organización (interpretación, salvo lo citado)

| Indicador | Fórmula | Fuente o nota |
|---|---|---|
| Ratio de gastos indirectos | gastos administrativos y de recaudación / gasto total | Los topes típicos son 10% a 15% en fundaciones y 15% en contratos públicos de organizaciones estudiadas en EE.UU.; el costo real de las mismas fue de 17% a 35% [S10] |
| Concentración del financiador principal | aporte del mayor financiador / ingreso total del año | Interpretación; no hallé una fuente que fije un umbral |
| Reserva operativa (meses) | caja libre / gasto mensual fijo | Interpretación |
| Fondos comprometidos vs. desembolsados | monto firmado - monto efectivamente recibido | Interpretación; el atraso de desembolso es un supuesto típico del marco lógico [S3] |
| Costo de rendición de cuentas | horas de informes x costo hora | Interpretación; solo 20% de las fundaciones encuestadas decían cubrir el tiempo de informes [S10] |

## 3. Cómo se evalúa económicamente

**Qué reemplaza y qué complementa al VAN/TIR clásico**

1. **El VAN/TIR financiero no sirve como criterio de decisión.** Sin ingresos, el VAN siempre sale negativo y no distingue un buen proyecto de uno malo. El manual de CEPAL dice que en proyectos sociales los beneficios "difícilmente pueden expresarse en moneda" y que el análisis costo-beneficio queda muy limitado [S1] (interpretación del texto: es la razón de fondo para no usar VAN/TIR).
2. **Se reemplaza por costo-impacto o costo-efectividad** (CUI, CUIA, costo por beneficiario con resultado). Con dinero fijo se elige la alternativa de menor costo por unidad de impacto [S1, S2]. Con un solo objetivo medible basta; con varios, se usa efectividad ponderada o el índice multicriterio del manual (criterios social, técnico, económico, institucional) [S1, S2].
3. **El VAN se mantiene, pero para costos.** Se usa el valor presente de los costos (o el costo anual equivalente) como numerador del CUI y para ver si el proyecto es sustentable: si la suma de desembolsos esperados cubre el valor presente de los gastos de los 5 años. Es interpretación; el manual trabaja con costo total anual [S1].
4. **Se complementa con costo-beneficio social cuando el beneficio se puede valorar.** El manual del Banco Mundial trata el análisis económico con precios sociales (precios sombra), distintos de los de mercado, para reflejar el costo de oportunidad para la sociedad [S2, glosario y capítulos 9 a 11]. Un "VAN social" puede dar positivo aunque el flujo de caja sea siempre negativo. No pude abrir la normativa boliviana de preinversión (sección 9), así que no afirmo qué tasa o precios sombra usa Bolivia.
5. **El SROI da un ratio parecido al VAN** pero convirtiendo resultados sociales a plata con "proxies" financieros (por ejemplo, el valor de una hora de voluntariado a salario de mercado) y descontando deadweight, atribución y drop-off [S4]. La guía lo plantea como marco para informar decisiones, no como número único para comparar organizaciones [S4].
6. **La evaluación de impacto aporta el dato que los demás métodos asumen**: cuánto del cambio lo causó el proyecto. Sin contrafactual, el costo por beneficiario y hasta el SROI se calculan con supuestos [S1, S4, S9].
7. **La sostenibilidad pasa a primer plano.** Un proyecto de 5 años financiado por un cooperante puede tener un CUI excelente y dejar de funcionar el mes 61. Por eso criterio de sostenibilidad en OECD/DAC [S5] y en el Banco Mundial [S2].

Por qué importa para el simulador (interpretación): el puntaje del alumno no debería ser "VAN positivo" sino un tablero con (1) cobertura neta, (2) costo por beneficiario con resultado, (3) CUI real contra el proyectado, (4) SROI o impacto neto, (5) meses de reserva y concentración de financiador, (6) cumplimiento y rendición de cuentas.

## 4. Errores típicos de estudiantes y de organizaciones

Cada ítem dice si viene de una fuente o es interpretación mía.

1. **Medir productos como si fueran impacto** (cantidad de talleres, de personas capacitadas, de kits entregados). El manual lo separa explícitamente: eficiencia en productos no implica logro de impacto [S1]. Lo que pasa en la práctica universitaria es interpretación mía.
2. **Calcular el costo por beneficiario con solo el costo directo.** El estudio de IFPRI sobre PROGRESA advierte que los costos administrativos agregados engañan, que hay que mirar la estructura de costos y que los **costos privados** que asumen los hogares (tiempo, transporte) no deben ignorarse [S7, solo resumen]. J-PAL incluye los costos de los beneficiarios en el costo total [S8].
3. **Comparar costos por beneficiario entre proyectos distintos** sin ver qué se logró. El Banco Mundial [S2] y IFPRI [S7] advierten que las comparaciones engañan; la guía SROI advierte lo mismo con los ratios [S4].
4. **Ignorar el contrafactual (deadweight).** Atribuir al proyecto todo el cambio observado, incluido el que habría pasado igual (por ejemplo, la tendencia de matrícula que ya subía) [S4].
5. **Presupuestar con 0% de gastos indirectos** o con el tope del cooperante, no con el costo real. Gregory y Howard muestran organizaciones que declaraban 13% a 22% de gastos indirectos cuando su costo real era 17% a 35%, y lo llaman "ciclo de inanición" [S10].
6. **Depender de un solo financiador sin plan.** El contexto boliviano reciente muestra cómo el viraje de un cooperante debilita incluso a organizaciones que no recibían fondos directos, sino a través de socios locales [S11]. La regla de "máx. X% por financiador" es interpretación mía.
7. **Confundir sustentable con sostenible.** Tener caja para operar (sustentable) no garantiza que el cambio perdure al irse el fondo (sostenible) [S1].
8. **Marco lógico sin supuestos útiles** (poner "que todo salga bien") o con supuestos que en realidad son riesgos controlables por el proyecto. Los supuestos deben estar fuera del control directo de la gerencia [S3].
9. **No tener línea de base.** Sin valor inicial del indicador no se puede medir el cambio; el manual dedica un capítulo a estimarla [S1, sección 2.3].
10. **Olvidar el costo de cumplir con el cooperante y con el Estado** (informes, auditoría, registro). Solo 20% de las fundaciones encuestadas por Gregory y Howard cubrían el tiempo de informes [S10]. En Bolivia además hay registro obligatorio y reportes anuales [S12, S13].
11. **Poner ingresos por ventas inventados** para que cierre el flujo. Es un error de modelado propio de un curso que solo conoce VAN (interpretación).
12. **Cobertura sin focalización**: contar a todos los atendidos aunque no pertenezcan a la población objetivo (cobertura bruta que se confunde con neta) [S1].

## 5. Situaciones para la simulación

Convenciones: las magnitudes están en puntos porcentuales o en múltiplos del valor normal del mes. Cuando la magnitud viene de una fuente lo indico; el resto es **estimación** mía y debe calibrarse. Los nombres de variables siguen la sección 6.

### S-1. Desembolso del cooperante atrasado

**Qué pasa.** El convenio dice que el cooperante transfiere por tramos trimestrales contra informe aprobado. Revisan tu informe, piden aclaraciones y el tramo llega tres meses tarde. Mientras tanto tienes que pagar sueldos y al equipo en terreno. En el marco lógico esto es el supuesto clásico "los fondos de contraparte llegan a tiempo" [S3]. Que el flujo de caja de los proyectos con financiamiento externo tenga períodos flacos es advertencia del Banco Mundial [S2].

**Variables que mueve.**
- Desembolsos recibidos: 0 durante 2 a 4 meses y luego recupera el acumulado (estimación).
- Caja: baja el equivalente a 2 a 4 meses de gasto fijo (estimación).
- Beneficiarios activos: -10% a -30% si se frena la entrega (estimación).
- Confianza del cooperante: sin efecto directo; sube si el informe es limpio.

**Decisiones posibles.**
1. *Seguir operando con reserva propia.* Ventaja: no se interrumpe el servicio ni se pierde a los beneficiarios. Costo: se agota la reserva; si hay otro imprevisto, no queda margen.
2. *Reducir actividades a lo esencial hasta que llegue el tramo.* Ventaja: protege la caja. Costo: baja cobertura y atrasa metas del marco lógico; en la siguiente evaluación el cooperante ve resultados menores.
3. *Pedir un adelanto o préstamo puente (a un banco o a otro donante).* Ventaja: evita recortar. Costo: intereses o condiciones y dependencia de un segundo actor; el préstamo se paga con fondos que son para el proyecto.
4. *Despedir temporalmente al personal contratado por proyecto.* Ventaja: alivio inmediato de caja. Costo: pérdida de gente capacitada, costo de recontratar y de volver a ganar la confianza de las comunidades.

**Qué aprende el alumno.** Que en un proyecto financiado por terceros el problema de caja viene de los plazos del financiador, no de la falta de plata total, y que la reserva operativa tiene un valor que no aparece en el VAN.

### S-2. El financiador principal sale o recorta su aporte

**Qué pasa.** Tu organización recibe 70% de su ingreso de un solo cooperante. Ese cooperante anuncia que reorienta su cooperación o que termina el convenio antes de lo previsto. Hay antecedentes reales: la suspensión de fondos de USAID en 2025 dejó incierto el panorama para organizaciones bolivianas que ni siquiera recibían fondos directos, solo vía socios locales [S11]; el dossier de un gremio de fundraising habla de unos 10.000 contratos de USAID cancelados y 60.000 millones de dólares recortados globalmente, según una fuente que él cita (Imray, 2025) [S14, nivel de confianza menor; ver sección 9]. En Bolivia, USAID ya había cerrado operaciones el 30 de septiembre de 2013 tras ser expulsada [S11].

**Variables que mueve.**
- Ingresos de donantes: -30% a -100% del aporte del principal a partir de 1 a 3 meses del anuncio (estimación; el dato real depende del convenio).
- Concentración de financiador: queda en cero o cambia de forma abrupta.
- Reserva operativa: se consume al ritmo del gasto.
- Cobertura neta: cae si no se reemplaza el fondo.

**Decisiones posibles.**
1. *Salir a buscar varios financiadores pequeños (donaciones individuales, empresas, otras agencias).* Ventaja: diversifica y reduce el riesgo futuro. Costo: lleva 6 a 12 meses (estimación), tiene costo de recaudación y los montos son menores y más inestables.
2. *Reducir el alcance (menos comunidades o menos componentes) y mantener la calidad.* Ventaja: el costo por beneficiario con resultado puede mantenerse. Costo: excluye a población que ya fue incluida; error de exclusión sube y puede dañar la relación con las comunidades.
3. *Mantener el alcance recortando calidad (menos seguimiento, menos capacitación).* Ventaja: la cobertura se ve igual. Costo: el impacto cae sin que los números de producto lo muestren, y se paga recién en la evaluación final.
4. *Cerrar el proyecto de forma ordenada y traspasar a otra institución.* Ventaja: protege lo logrado. Costo: la organización pierde su razón de existir y a su equipo; el traspaso requiere un receptor dispuesto.

**Qué aprende el alumno.** Que la concentración en un financiador es un riesgo medible, y que cada respuesta cambia una variable distinta (cobertura, calidad, riesgo, identidad de la organización).

### S-3. Escándalo en otra ONG enfría las donaciones

**Qué pasa.** Una ONG grande del mismo rubro es investigada por desvío de fondos. En el caso real de Fundación Intervida (España, 2007), según la nota que abrí, se sospechaba que unos US$ 60 millones de apadrinamiento se desviaron a empresas no benéficas, la fundación perdió unos 70 mil afiliados y suspendió financiamiento en Perú y Guatemala y dejó de financiar Bolivia (donde trabajaba desde 1996 en el altiplano y declaraba más de 285 mil personas beneficiadas) [S15]. Tu organización, sin culpa, ve caer sus donaciones individuales y suben las preguntas de los donantes.

**Variables que mueve.**
- Donaciones individuales y de empresas: -10% a -40% durante 3 a 6 meses (estimación; el dato de S15 es de una sola organización: 70 mil afiliados perdidos, sin porcentaje).
- Confianza del donante: baja y tarda en recuperarse (estimación).
- Costo de rendición de cuentas: sube porque donantes piden más evidencia.

**Decisiones posibles.**
1. *Publicar de inmediato sus estados financieros, un informe de resultados y el costo por beneficiario.* Ventaja: diferencia a la organización y puede ganar donantes. Costo: gasto en auditoría y comunicación; expone también las debilidades (por ejemplo, gastos indirectos más altos de lo que el público esperaba).
2. *No decir nada y esperar que pase.* Ventaja: cuesta cero. Costo: si los donantes no ven transparencia, se quedan con la duda y donan a otro.
3. *Contratar una campaña de comunicación para recuperar donaciones.* Ventaja: puede frenar la caída. Costo: gasto que sale de fondos que serían para beneficiarios; si el público ve publicidad cara, empeora la percepción.
4. *Apoyarse más en financiadores institucionales y reducir la dependencia de donantes individuales.* Ventaja: ingresos más previsibles. Costo: más requisitos, plazos y control del cooperante; menos libertad.

**Qué aprende el alumno.** Que la confianza es un activo que no está en el balance y que la transparencia tiene costo y beneficio.

### S-4. Registro obligatorio y alineación con los planes de desarrollo (Bolivia)

**Qué pasa.** El Estado exige que las organizaciones se registren y que sus proyectos se alineen con los planes del país. Según Amnistía Internacional, el DS 5673 del 10 de agosto de 2026 regula el registro obligatorio de organizaciones nacionales y extranjeras en el Registro Único Nacional (RUN), faculta al Viceministerio de Inversión Pública y Financiamiento Externo a evaluar el cumplimiento y la alineación con los planes de desarrollo, y suma la "falta de alineación" como causal posible de revocar la personalidad jurídica [S13]. Por otro lado, el reporte de UNITAS dice que las ONG nacionales registradas pasaron de 1.980 (2015) a 206 (2025), y las internacionales de 185 a 44, y que en 2024 el 32% de los participantes de una encuesta calificó el contexto como "extremadamente restrictivo", con registro y renovación de personería como obstáculos principales [S12]. Un ministro anunció además investigaciones a ONG y fundaciones por supuesto financiamiento de movilizaciones [S12]. Aparte, hay quienes dicen que esto es rendición de cuentas legítima; Amnistía opina lo contrario [S13]. No tomo partido: lo uso como riesgo regulatorio.

**Variables que mueve.**
- Cumplimiento regulatorio: baja si hay observaciones; se pierde por completo si hay revocación (evento extremo).
- Costo de rendición de cuentas: +5% a +15% del gasto administrativo (estimación).
- Tiempo del equipo directivo: parte se destina a trámites (estimación).
- Ingresos de donantes: algunos cooperantes extranjeros se retiran del país si el entorno se endurece (estimación; S12 habla de una caída del número de ONG, sin atribuirla a cooperantes específicos).

**Decisiones posibles.**
1. *Cumplir estrictamente y contratar apoyo legal y contable.* Ventaja: reduce el riesgo de sanción y mejora la credibilidad. Costo: gasto fijo mensual que no llega a los beneficiarios.
2. *Alinear los componentes del proyecto a las prioridades de los planes de desarrollo.* Ventaja: facilita aprobaciones y posibles contrapartes públicas. Costo: puede desviar el diseño de lo que la población necesita o de lo que el cooperante quiere financiar (misión).
3. *Asumir el riesgo y operar con un perfil bajo, con trámites mínimos.* Ventaja: ahorra costos. Costo: si hay fiscalización, la sanción puede ser el cierre y se pierde todo.
4. *Asociarse con una organización mayor que ya tiene el registro y la relación con el Estado.* Ventaja: reparte el riesgo y los costos fijos. Costo: pierde autonomía y parte del crédito.

**Qué aprende el alumno.** Que el entorno regulatorio es parte del análisis de riesgo del proyecto social y que cumplir cuesta, pero no cumplir puede costar toda la operación.

### S-5. El cooperante limita los gastos indirectos al 15%

**Qué pasa.** Un nuevo convenio acepta financiar el proyecto pero pone un tope de 15% a los gastos administrativos. Tu costo real de administrar (contabilidad, informes, sistemas, directivos) es mayor. Gregory y Howard documentan este patrón en EE.UU.: topes de 10% a 15% en fundaciones y contratos públicos, organizaciones con costo real de 17% a 35%, y organizaciones que subdeclaran para cumplir, lo que refuerza la expectativa irreal de los donantes [S10].

**Variables que mueve.**
- Ratio de gastos indirectos declarado vs. real: la brecha se vuelve un déficit de entre 2 y 20 puntos del presupuesto (S10 muestra brechas de 4 a 13 puntos en 4 organizaciones; el resto es estimación).
- Calidad del monitoreo y de los datos: baja si se recortan sistemas.
- Costo por beneficiario declarado: baja (sobre el papel).

**Decisiones posibles.**
1. *Aceptar el tope y ajustar el gasto a ese número.* Ventaja: se firma el convenio y se ve eficiente. Costo: se deteriora la capacidad (informes tardíos, rotación del personal administrativo); problema que aparece después.
2. *Cargar costos administrativos dentro de rubros de programa (por ejemplo, "personal técnico").* Ventaja: cumple con el tope en papel. Costo: es subdeclarar; si el cooperante audita, es un gasto no elegible y daña la relación.
3. *Negociar un porcentaje mayor justificado con datos.* Ventaja: reconoce el costo real. Costo: puede perder la convocatoria frente a otra organización que acepte el 15%.
4. *Cubrir la diferencia con fondos propios o de otro donante flexible.* Ventaja: mantiene calidad. Costo: depende de tener fondos flexibles, que casi nunca sobran.

**Qué aprende el alumno.** Que "costo bajo" y "buen proyecto" no son lo mismo y que el recorte de infraestructura se paga con calidad.

### S-6. Error de focalización: llegan los que no son

**Qué pasa.** Se entrega un servicio (útiles, atención, capacitación) y el control posterior muestra que una parte importante de los beneficiarios no pertenece a la población objetivo, mientras que familias que sí lo son no se enteraron del proyecto. El manual de CEPAL describe estos errores de inclusión y exclusión, y define la cobertura neta y la bruta [S1]. En el Bono Juancito Pinto, programa boliviano de transferencia universal a escolares de colegios públicos, el estudio del BCB reporta gastos operativos de 4,1% del presupuesto en 2006-2011 y de 3,8% en 2012-2013; el bono es universal para ese universo y no se focaliza por ingreso [S6] (la observación sobre la falta de focalización por ingreso es interpretación mía sobre el diseño descrito).

**Variables que mueve.**
- Error de inclusión: +10 a +30 puntos de los atendidos (estimación).
- Error de exclusión: +10 a +20 puntos de la población objetivo (estimación).
- Cobertura bruta se mantiene; cobertura neta cae.
- Costo por beneficiario con resultado: sube porque parte del gasto va a quienes no lo necesitan.

**Decisiones posibles.**
1. *Rediseñar el sistema de selección (criterios, visitas, padrón).* Ventaja: mejora la cobertura neta. Costo: costo de verificar y de levantar datos; demora la entrega; puede generar conflicto con quienes ya recibían.
2. *Seguir con acceso abierto para no generar conflicto.* Ventaja: simple, rápido y bien visto localmente. Costo: gasta recursos limitados en quienes no los necesitan (el manual recomienda no focalizar solo cuando verificar cuesta más que entregar a todos) [S1].
3. *Delegar la selección en la comunidad o la autoridad local.* Ventaja: bajo costo y legitimidad local. Costo: riesgo de captura por líderes o conflictos internos (estimación mía; no la respalda una fuente abierta).
4. *Pedir a los beneficiarios mostrar documentos.* Ventaja: más objetivo. Costo: excluye a los más vulnerables, que suelen no tener papeles (estimación).

**Qué aprende el alumno.** Que cobertura alta no es sinónimo de buen proyecto y que focalizar cuesta; hay un punto en que dejar de focalizar es racional.

### S-7. Deserción de beneficiarios

**Qué pasa.** A mitad de año, la asistencia a las actividades cae porque las familias migran por trabajo, se superpone con la cosecha o el calendario escolar, o el transporte se vuelve costoso. Los resultados del proyecto dependen de que los beneficiarios completen el ciclo (por ejemplo, de varios talleres). IFPRI recuerda que los **costos privados** de los hogares para acceder al servicio no son menores [S7, resumen]. La estacionalidad agrícola como causa es estimación mía.

**Variables que mueve.**
- Beneficiarios activos: -10% a -25% en el trimestre afectado (estimación).
- Tasa de deserción: sube; los egresados con resultado bajan.
- Costo por beneficiario con resultado: sube bastante, porque el gasto fijo ya está hecho (estimación).

**Decisiones posibles.**
1. *Adaptar horarios y lugares al calendario de las familias.* Ventaja: retiene beneficiarios. Costo: más costo logístico y más tiempo del personal.
2. *Dar incentivos (alimentos, transporte, útiles).* Ventaja: reduce el costo privado de participar. Costo: aumenta el costo por beneficiario y puede generar dependencia; ojo con efectos no buscados.
3. *Aceptar la deserción y reclutar reemplazos.* Ventaja: mantiene la cobertura nominal. Costo: los nuevos empiezan de cero y no logran el ciclo completo; el impacto promedio baja.
4. *Reducir la intensidad del programa (menos sesiones).* Ventaja: más fácil de completar. Costo: menor dosis, menor efecto esperado.

**Qué aprende el alumno.** Que el costo relevante es por beneficiario que completa, no por beneficiario inscrito.

### S-8. La evaluación de impacto muestra un efecto menor al esperado

**Qué pasa.** A mitad de proyecto, una evaluación con grupo de comparación encuentra que gran parte del cambio que se atribuía al proyecto habría ocurrido igual (alto deadweight) y que otra parte se debe a un programa estatal paralelo (atribución). Es el escenario que la guía SROI llama deadweight y atribución [S4]. A modo de referencia, el estudio del BCB sobre el Bono Juancito Pinto estimó un efecto de alrededor de 1% en matriculación, 1% en permanencia y 3,7% en promoción [S6]: es decir, efectos reales, pero pequeños frente a lo que suele prometerse en las propuestas.

**Variables que mueve.**
- Impacto neto: baja entre 30% y 70% respecto del impacto bruto reportado (estimación).
- CUI real: sube en la misma proporción (estimación; es la inversa del impacto).
- SROI: baja.
- Reputación ante el cooperante: puede subir si se muestra honestidad, bajar si se oculta.

**Decisiones posibles.**
1. *Informar el resultado completo al cooperante y rediseñar.* Ventaja: credibilidad y mejora real. Costo: riesgo de que el cooperante recorte la renovación; hay que reconocer que lo prometido no se cumplió.
2. *Informar solo indicadores de producto (personas atendidas) y no el de impacto.* Ventaja: se evita el conflicto. Costo: si luego sale a la luz, se pierde la confianza; no se aprende.
3. *Contratar otra evaluación con metodología más favorable.* Ventaja: puede mostrar mejores números. Costo: gasto, y el sesgo es evidente para un evaluador experimentado.
4. *Redirigir recursos a los grupos donde el deadweight es bajo (los más difíciles de alcanzar).* Ventaja: la guía SROI señala que el deadweight suele ser menor en grupos de difícil acceso [S4], por lo que el impacto neto mejora. Costo: esos grupos cuestan más por persona atendida; baja la cobertura.

**Qué aprende el alumno.** Que el contrafactual cambia el costo-efectividad y que ocultar un mal resultado es una decisión con costo futuro.

### S-9. Oferta de un fondo grande con condiciones que desvían la misión

**Qué pasa.** Una agencia ofrece un fondo mayor que todo tu presupuesto actual para un componente que no es el núcleo de tu organización (por ejemplo, un tema que está de moda en la cooperación). Si aceptas, ganas escala y estabilidad por 3 años; si no, te quedas con tu misión pero con menos plata. En lenguaje de cooperación esto se conoce como deriva de la misión; la caracterización como situación común es interpretación mía (no la respalda una fuente que haya abierto con ese nombre).

**Variables que mueve.**
- Ingresos de donantes: +50% a +150% del presupuesto base durante el convenio (estimación).
- Concentración de financiador: sube a más de 60% (estimación).
- Cobertura: sube en el nuevo componente, baja en el núcleo si el equipo se divide (estimación).
- Gastos indirectos: la agencia puede pagar un porcentaje fijo (ver S-5).

**Decisiones posibles.**
1. *Aceptar y contratar para el nuevo componente.* Ventaja: crece, tiene más caja y más beneficiarios. Costo: depende de un financiador y, al terminar el convenio, hay que despedir o buscar el siguiente.
2. *Aceptar solo una parte (pilotear con un equipo chico).* Ventaja: limita la concentración. Costo: crecimiento menor y el fondo puede dárselo a otra organización que acepte todo.
3. *Rechazar y seguir con el núcleo.* Ventaja: coherencia con la misión y con el conocimiento acumulado. Costo: renuncia a recursos y a presencia.
4. *Aceptar pero negociar que parte del fondo cubra fortalecimiento institucional.* Ventaja: deja capacidad instalada. Costo: la negociación puede fallar y requiere gente con experiencia (estimación).

**Qué aprende el alumno.** Que crecer no siempre es sostenible y que la concentración del financiamiento convierte una oportunidad en un riesgo.

### S-10. Fin del proyecto: ¿qué queda cuando se va el fondo?

**Qué pasa.** Falta un año para terminar el convenio de 5 años. El manual de CEPAL distingue impactos que se mantienen solo mientras opera el proyecto (como los subsidios a servicios básicos) de los que dejan un cambio más permanente [S1]. El proyecto Gestión Integral del Agua que HELVETAS ejecuta en Bolivia con la Cooperación Suiza desde 2010 contrató una consultoría para capitalizar experiencias "hacia la escalabilidad" e identificar actores a quienes transferir el trabajo [S16]; es un ejemplo de planificar la salida. Tú tienes que decidir cómo cerrar.

**Variables que mueve.**
- Ingresos de donantes: caen a cero al terminar el convenio si no hay renovación.
- Beneficiarios activos: caen en la misma proporción si el servicio depende de tu operación.
- Sostenibilidad del impacto: sube si traspasas capacidad y baja si no.
- Drop-off del efecto: si el efecto desaparece sin continuidad, el SROI de años siguientes cae (el ejemplo de la guía es 10% anual) [S4].

**Decisiones posibles.**
1. *Traspasar el servicio a un gobierno municipal o a una organización comunitaria.* Ventaja: la población sigue atendida sin tu fondo. Costo: requiere meses de capacitación; el receptor puede no tener presupuesto ni interés, y se pierde control de calidad.
2. *Convertir parte del servicio en un cobro simbólico o en un servicio con ingresos propios.* Ventaja: financia parte de la continuidad. Costo: excluye a los más pobres y puede desviar la misión.
3. *Buscar una segunda fase con el mismo cooperante u otro.* Ventaja: continuidad y experiencia. Costo: depende de una decisión ajena; si no sale, no hay plan B.
4. *Cerrar y documentar lo aprendido.* Ventaja: cumple el convenio y deja una lección. Costo: los beneficios caen cuando se va el equipo.

**Qué aprende el alumno.** Que la sostenibilidad se diseña desde el inicio y que el costo del proyecto debe incluir la transición.

### S-11. Descalce de monedas y alza de costos

**Qué pasa.** El convenio se firmó en dólares o euros pero la mayor parte de los gastos son en bolivianos; o al revés, los costos importados (medicamentos, equipos, combustible) suben más que el presupuesto en bolivianos. El marco lógico cita como ejemplo de supuesto fuera del control de la gerencia "una devaluación de envergadura" [S3]. No verifiqué la coyuntura cambiaria y de precios actual de Bolivia, así que no hay un dato del país para esta situación (ver sección 9).

**Variables que mueve.**
- Costos operativos: +5% a +20% anual (estimación).
- Valor real del financiamiento en BOB: puede subir o bajar según el descalce (estimación).
- Costo por beneficiario: sube.

**Decisiones posibles.**
1. *Renegociar el presupuesto con el cooperante.* Ventaja: recupera poder de compra. Costo: demora, y algunos cooperantes no aceptan modificaciones.
2. *Recortar rubros de menor impacto.* Ventaja: mantiene los fundamentales. Costo: se pierde calidad o cobertura en lo recortado.
3. *Comprar por adelantado insumos y asegurar precios.* Ventaja: protege del alza. Costo: inmoviliza caja y hay riesgo de vencimiento o de pérdida.
4. *Aprovechar un tipo de cambio favorable para ampliar cobertura.* Ventaja: más beneficiarios. Costo: se expande sin garantía de que el tipo de cambio siga igual; luego hay que recortar.

**Qué aprende el alumno.** Que el presupuesto de un proyecto social es una estimación en monedas distintas y que hay que reservar un margen de riesgo.

### S-12. Gasto observado en la auditoría del cooperante

**Qué pasa.** La auditoría externa del cooperante observa gastos por 4% del convenio (por ejemplo, compras sin tres cotizaciones, pagos sin factura válida, personal pagado fuera del período). Si no se justifican, el cooperante exige su devolución. La facturación y el cumplimiento tributario en Bolivia son obligatorios; el material de ONG indica que las organizaciones con personería y convenio vigente están exentas del IUE [S12], pero no revisé qué documentos aceptan los cooperantes. Los rubros "no elegibles" y el 4% son estimación mía.

**Variables que mueve.**
- Caja: -2% a -6% del convenio por devolución (estimación).
- Confianza del cooperante: baja; puede suspender futuros tramos (estimación).
- Costo de rendición de cuentas: sube.

**Decisiones posibles.**
1. *Devolver lo observado y corregir los procesos.* Ventaja: limpia la relación con el cooperante. Costo: se pierde plata del proyecto y se tiene que invertir en sistemas.
2. *Discutir las observaciones con documentos de respaldo.* Ventaja: puede evitar la devolución. Costo: tiempo del equipo y riesgo de discusión que deteriore la relación.
3. *Cubrir el monto con otra fuente flexible sin informar.* Ventaja: no se afecta el convenio. Costo: oculta un problema de control interno y puede constituir un manejo indebido de fondos.
4. *Reasignar presupuesto de otro rubro para cubrir.* Ventaja: no sale plata nueva. Costo: se recortan actividades que sí tenían meta de impacto.

**Qué aprende el alumno.** Que el control interno y la documentación son un costo real del proyecto y que la rendición de cuentas es una condición para recibir el siguiente tramo.

### S-13. Bloqueos o desastre natural frenan el trabajo en terreno

**Qué pasa.** Bloqueos de caminos, inundaciones o heladas impiden llegar a las comunidades durante varias semanas. En el marco lógico esto aparece como supuesto climático, social o político [S3]. Las fuentes que abrí sobre Bolivia hablan de protestas y de conflictividad [S11, S12], pero no de bloqueos como causa de pérdida de actividad en proyectos sociales; los efectos son estimación.

**Variables que mueve.**
- Actividades ejecutadas: -30% a -100% durante 1 a 2 meses (estimación).
- Gasto fijo sigue: caja baja sin producto (estimación).
- Beneficiarios activos: -5% a -20% (estimación).

**Decisiones posibles.**
1. *Reprogramar actividades y pedir ampliación de plazo.* Ventaja: no pierde recursos. Costo: el cooperante puede negarse; se acumula trabajo para meses posteriores.
2. *Trabajar a distancia (llamadas, radio, mensajes).* Ventaja: mantiene contacto. Costo: menor calidad y cobertura; muchas comunidades no tienen conectividad.
3. *Dar ayuda de emergencia (alimentos, insumos).* Ventaja: protege a los beneficiarios y la relación. Costo: sale de los fondos del proyecto o requiere autorización; cambia el uso del dinero.
4. *Reasignar al personal a otra zona sin conflicto.* Ventaja: se usa el tiempo. Costo: población objetivo distinta a la comprometida; error de focalización.

**Qué aprende el alumno.** Que los supuestos externos del marco lógico deben tener un plan de respuesta, no solo un renglón.

### S-14. Oportunidad: cofinanciamiento de un gobierno municipal

**Qué pasa.** Un municipio ofrece aportar el 30% del presupuesto de un componente a cambio de que el proyecto trabaje en su jurisdicción y siga sus prioridades. Esto es lo que el marco lógico llama fondos de contraparte [S3], y es una forma de dar sostenibilidad: HELVETAS en Bolivia diseña su proyecto del agua alineado con el Plan Nacional de Cuencas y buscando transferir capacidades a actores públicos [S16]. El riesgo es que el aporte llegue tarde o no llegue.

**Variables que mueve.**
- Ingresos: +30% del componente (dato hipotético del caso; el porcentaje es estimación).
- Concentración: se reparte entre cooperante y municipio.
- Riesgo de atraso en el pago de la contraparte (estimación).
- Cobertura: sube en el municipio.

**Decisiones posibles.**
1. *Aceptar con convenio firmado y cláusulas de pago.* Ventaja: dinero adicional y compromiso local. Costo: los municipios tienen calendarios políticos; el convenio no garantiza el desembolso.
2. *Aceptar sin formalizar (confianza política).* Ventaja: rápido. Costo: si cambia la autoridad, se pierde el aporte y a veces el acceso a la zona.
3. *Rechazar para no depender de un actor político.* Ventaja: independencia. Costo: se renuncia a financiamiento y a la posibilidad de que el servicio continúe tras el proyecto.
4. *Aceptar pero ejecutar primero lo que no depende del municipio.* Ventaja: reduce el riesgo. Costo: demora el componente más valioso o el que más requiere coordinación.

**Qué aprende el alumno.** Que un cofinanciador local mejora la sostenibilidad pero introduce un riesgo político, y que los convenios deben prever cómo se paga y qué pasa si no se paga.

## 6. Variables propias que debería manejar el motor

Propuesta (interpretación). "Cada mes" indica cómo se actualiza. Las que usan una fórmula de las secciones 2 y 5 la repiten.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| Población objetivo (POP) | Personas con la necesidad que el proyecto busca atender | Fija o con cambio lento (crecimiento demográfico, migración) |
| Beneficiarios activos | Personas que reciben el servicio este mes | Activos(t) = Activos(t-1) + altas - deserción; altas limitadas por capacidad financiada |
| Cobertura neta | Parte de la POP atendida | POA / POP x 100 [S1] |
| Error de inclusión / exclusión | Calidad de la focalización | Depende de la inversión en selección; sube con presión social (eventos S-6) |
| Tasa de deserción | Fracción que abandona por mes | Base más choques estacionales o de entorno (S-7, S-13) |
| Beneficiarios con resultado | Quienes completan el ciclo o logran el cambio | Los que terminan el ciclo en el mes x eficacia del servicio |
| Calidad del servicio | Intensidad y calidad del trabajo en terreno | Baja si se recorta gasto o personal; sube con capacitación |
| Impacto bruto y neto | Cambio medido vs. cambio causado | Neto = bruto x (1 - deadweight) x (1 - desplazamiento) x (1 - atribución), con drop-off anual [S4] (interpretación) |
| Costo por beneficiario / por resultado | Eficiencia | Gasto acumulado del año / beneficiarios atendidos o con resultado [S1] |
| CUI real (CUIr) | Costo por unidad de impacto | Costos reales / impactos alcanzados [S1] |
| Financiadores (lista) | Cada fuente con monto, plazo, condiciones | Convenio por tramos; desembolso mensual con atraso variable |
| Concentración del financiador principal | Riesgo de dependencia | Aporte del mayor / ingreso total (interpretación) |
| Fondos comprometidos y por recibir | Plata firmada vs. recibida | Se reduce al llegar un desembolso; se amplía al firmar nuevos convenios |
| Reserva operativa (meses) | Colchón de caja | Caja libre / gasto fijo mensual |
| Gastos indirectos (real y permitido) | Costo de administrar vs. tope del donante | Real: porcentaje base + costos de cumplimiento; Permitido: tope del convenio (S-5) |
| Confianza del donante | Reputación ante cooperantes y público | Sube con informes limpios y resultados; baja con atrasos, observaciones o escándalos (S-3, S-12) |
| Cumplimiento regulatorio | Estado de registro, informes y personería | Estado discreto (al día / observado / revocado); costo mensual fijo de cumplir (S-4) |
| Calidad de datos y línea de base | Capacidad de medir impacto | Sube con inversión en monitoreo; condiciona qué eventos de evaluación se pueden dar (S-8) |
| Plan de sostenibilidad | Avance de transición | Avanza con capacitación y convenios con receptores; pesa en el año 5 (S-10) |

Observación de diseño (interpretación): el motor actual maneja caja, ingresos, costos y reputación. Para este tipo, "ingresos" se reemplazaría por "financiamiento recibido" con condiciones (tramos, tope de indirectos, plazos), y "reputación" se separaría en confianza del donante y cumplimiento regulatorio.

## 7. Ejemplos reales de Bolivia y Latinoamérica

Solo incluyo casos cuyo enlace abrí. Lo que dice la fuente va en la columna "Qué dice la fuente".

| Caso | País | Qué dice la fuente | Enlace |
|---|---|---|---|
| Bono Juancito Pinto (transferencia condicionada a escolares) | Bolivia | Estudio del BCB: efectos de alrededor de 1% en matriculación, 1% en permanencia y 3,7% en promoción; gastos operativos 4,1% del presupuesto en 2006-2011 y 3,8% en 2012-2013; auditado al menos tres gestiones. Del gráfico 4 se desprende un monto cercano a Bs 200 por beneficiario (cálculo mío: 217,1 millones / 1.085.360 estudiantes en 2006 es aprox. Bs 200) | [BCB, Revista de Análisis, 2014](https://www.bcb.gob.bo/webdocs/publicacionesbcb/2_Bono_Juancito_Pinto.pdf) |
| Proyecto Gestión Integral del Agua (HELVETAS con Cooperación Suiza) | Bolivia | Ejecutado desde 2010 en las cuencas Suches (La Paz) y Cotagaita (Potosí); alineado al Plan Nacional de Cuencas; el documento (términos de referencia, octubre 2022) busca capitalizar experiencias "hacia la escalabilidad" e identificar actores a quienes transferir. No da cifras de beneficiarios ni costos | [TdR HELVETAS](https://cebem.org/boletin/2022/helvetas_28/TDRs_capitalizacion_experiencias.pdf) |
| Descenso de ONG registradas y entorno de financiamiento | Bolivia | UNITAS (vía eju.tv, 24/5/2026): ONG nacionales de 1.980 (2015) a 206 (2025); internacionales de 185 a 44. Atribuye la caída a un entorno restrictivo. Ley 351 y DS 1597; convenios marco con Cancillería; informes anuales | [eju.tv](https://eju.tv/2026/05/cada-vez-son-menos-las-ong-que-trabajan-en-bolivia/) |
| Decreto Supremo 5673 (registro único y alineación) | Bolivia | Amnistía Internacional, 9/9/2026: el decreto de 10/8/2026 crea el registro obligatorio (RUN) y permite evaluar alineación con planes de desarrollo, con "medidas correctivas" | [Amnistía Internacional](https://www.amnesty.org/en/wp-content/uploads/sites/4/2026/09/AMR1814572026SPANISH.pdf) |
| Efecto indirecto de la suspensión de USAID | Bolivia | Hivos, 2025: organizaciones locales que dependen de fondos de USAID, y otras que los reciben vía ellas, podrían debilitarse; USAID cerró operaciones en Bolivia el 30/9/2013 | [Hivos, Enabling Environment Bolivia](https://eusee.hivos.org/assets/2025/10/Bolivia_EES_final_es.pdf) |
| Fundación Intervida, suspensión de ayuda a Bolivia | España con operación en Bolivia | Los Tiempos, 31/8/2007: por investigación de desvío de fondos, Intervida suspendió financiamiento en Perú y Guatemala y dejaba de financiar Bolivia; trabajaba aquí desde 1996 con más de 285 mil personas declaradas como beneficiadas | [Los Tiempos](https://www.lostiempos.com/actualidad/mundo/20070831/intervida-elimina-ayuda-bolivia-peru-guatemala) |
| PROGRESA (México) | Latinoamérica | Estudio IFPRI: costos administrativos de un programa de transferencias; cautela al comparar y atención a costos privados de los hogares. Solo abrí el resumen | [IFPRI, discusión 199](https://ideas.repec.org/p/fpr/fcnddp/199.html) |

No encontré, para Bolivia, una evaluación pública de costo por beneficiario o SROI de un proyecto de ONG con cifras que haya podido abrir (ver sección 9).

## 8. Fuentes

Niveles: A (libro, paper, organismo, manual universitario o de gobierno), B (consultora, reporte sectorial, prensa), C (blog, práctica). "Leído" indica lo que realmente abrí.

| N.º | Fuente | Nivel | Qué leí | Enlace |
|---|---|---|---|---|
| S1 | Ernesto Cohen y Rodrigo Martínez, *Manual: Formulación, evaluación y monitoreo de proyectos sociales*, CEPAL, División de Desarrollo Social. El texto dice que no pasó revisión editorial; no confirmé el año | A | Texto extraído y leído por secciones: cobertura, focalización, CUP, CUI, CUIA, CUIr, sustentabilidad y sostenibilidad, modelos de evaluación | https://dds.cepal.org/redesoc/archivos_recursos/242/Manual_dds_200408.pdf |
| S2 | Pedro Belli y otros, *Economic Analysis of Investment Operations*, Banco Mundial (WBI), primera impresión enero 2001 según el propio PDF | A | Capítulo 7 (costo-efectividad), pasajes sobre sostenibilidad financiera, glosario | https://documents1.worldbank.org/curated/en/792771468323717830/pdf/298210REPLACEMENT.pdf |
| S3 | Edgar Ortegón, Juan Francisco Pacheco y Adriana Prieto, *Metodología del marco lógico para la planificación, el seguimiento y la evaluación de proyectos y programas*, ILPES-CEPAL, Serie Manuales 42, Santiago, julio 2005 | A | Portada, sección de supuestos, lógica vertical y horizontal | https://digitallibrary.un.org/record/557234/files/%5EE_%5ELC_L.2350-P-ES.pdf |
| S4 | Nicholls, Lawlor, Neitzert y Goodspeed, *A guide to Social Return on Investment*, Cabinet Office (Reino Unido), 2009 según la guía | A | Secciones de deadweight, desplazamiento, atribución, drop-off, ratio | https://www.bond.org.uk/wp-content/uploads/2022/09/cabinet_office_a_guide_to_social_return_on_investment.pdf |
| S5 | OECD/DAC Network on Development Evaluation, *Better Criteria for Better Evaluation: Revised Evaluation Criteria Definitions and Principles for Use* (2019); copia alojada por el MFAT de Nueva Zelanda | A | Definiciones de eficiencia, impacto, sostenibilidad y antecedentes | https://www.mfat.govt.nz/assets/Aid-Prog-docs/Tools-and-guides/OECD-DAC-Better-Criteria-for-Better-Evaluation-Revised-Evaluation-Criteria-Definitions-and-Principles-for-Use.pdf |
| S6 | Hernán Aguilar Pacajes, "Evaluación de impacto del Bono Juancito Pinto en Bolivia", *Revista de Análisis* (BCB), vol. 21, julio-diciembre 2014, pp. 37-66 | A | Resumen, sección de presupuesto, beneficiarios y costos operativos | https://www.bcb.gob.bo/webdocs/publicacionesbcb/2_Bono_Juancito_Pinto.pdf |
| S7 | David Coady, Raul Perez y Hadid Vera-Ilamas (así figuran en la página), "Evaluating the cost of poverty alleviation transfer programs: an illustration based on PROGRESA in Mexico", IFPRI FCND Discussion Paper 199, 2005 | A | Solo resumen de la ficha | https://ideas.repec.org/p/fpr/fcnddp/199.html |
| S8 | J-PAL (MIT), "Cost-Effectiveness and Welfare Analysis" | A (centro académico) | Página sobre fórmula de costo-efectividad y costos incluidos | https://www.povertyactionlab.org/page/cost-effectiveness-and-welfare-analysis |
| S9 | Gertler, Martínez, Premand, Rawlings y Vermeersch, *Impact Evaluation in Practice*, 2.ª ed., Banco Mundial, 2016 | A (libro) | Solo ficha y resumen en RePEc; no leí contenido | https://ideas.repec.org/b/wbk/wbpubs/25030.html |
| S10 | Ann Goggins Gregory y Don Howard, "The Nonprofit Starvation Cycle", *Stanford Social Innovation Review*, otoño 2009 | B | Artículo (vía resumen estructurado de la página) | https://ssir.org/articles/entry/the_nonprofit_starvation_cycle |
| S11 | Hivos / EUSEE, *Enabling Environment Snapshot Bolivia*, 2025 | B | Secciones sobre entorno y USAID | https://eusee.hivos.org/assets/2025/10/Bolivia_EES_final_es.pdf |
| S12 | eju.tv (fuente La Razón), "Cada vez son menos las ONG que trabajan en Bolivia", 24/5/2026, citando informe de UNITAS | B | Nota completa | https://eju.tv/2026/05/cada-vez-son-menos-las-ong-que-trabajan-en-bolivia/ |
| S13 | Amnistía Internacional, "Bolivia: Decreto Supremo 5673...", AMR 18/1457/2026, 9/9/2026 | B (organización de derechos humanos, con posición propia) | Documento completo (3 páginas) | https://www.amnesty.org/en/wp-content/uploads/sites/4/2026/09/AMR1814572026SPANISH.pdf |
| S14 | Asociación Española de Fundraising, dossier "El impacto en las ONG de los recortes en USAID y cooperación internacional" (2026) | B/C (gremio; cita fuentes secundarias) | Primeras secciones sobre USAID | https://www.aefundraising.org/wp-content/uploads/2026/04/dossier-impacto-recortes-ayuda-humanitaria-1.pdf |
| S15 | Los Tiempos, "Intervida elimina ayuda a Bolivia, Perú y Guatemala", 31/8/2007 | B | Nota completa | https://www.lostiempos.com/actualidad/mundo/20070831/intervida-elimina-ayuda-bolivia-peru-guatemala |
| S16 | HELVETAS Bolivia, Términos de referencia "Capitalización de experiencias hacia la escalabilidad, Proyecto Gestión Integral del Agua" (2022) | B | Introducción y objetivos | https://cebem.org/boletin/2022/helvetas_28/TDRs_capitalizacion_experiencias.pdf |

**Conteo**: 16 fuentes. Nivel A: 9 (S1 a S9). De ellas, **leí contenido sustantivo de 6** (S1, S2, S3, S4, S5, S6) y 1 página institucional (S8); S7 y S9 solo por resumen o ficha. Cumplo el mínimo de 4 fuentes A leídas.

## 9. No confirmado

1. **Normativa boliviana de evaluación de proyectos sociales y de inversión pública.** Una búsqueda sugiere que el ILPES (Ortegón y otros) publicó una metodología general de identificación, preparación y evaluación de proyectos de inversión pública, y que Bolivia tiene el Reglamento Básico de Preinversión con precios sombra. No abrí el reglamento; no sé qué precios sombra ni tasa social usa Bolivia hoy.
2. **Libros de texto en español sobre proyectos sociales.** No abrí fichas de catálogo de Sapag Chain, Baca Urbina ni de otras ediciones; no los cito.
3. ***Impact Evaluation in Practice*.** Solo la ficha y el resumen (S9). No leí los capítulos sobre contrafactual, diferencias en diferencias o regresión discontinua; lo que digo del contrafactual viene de S1 y S4.
4. **GiveWell y sus análisis de costo-efectividad.** Solo vi un resumen de búsqueda sobre sus pesos morales y supuestos de ajuste; no abrí ninguna página de GiveWell. No uso cifras suyas.
5. **Cifras de recortes de USAID.** Los 10.000 contratos y los US$ 60.000 millones salen de un dossier gremial que cita a Imray (2025) [S14]; no abrí Imray. Úsalas solo como contexto.
6. **Efecto de los recortes de USAID sobre ONG bolivianas concretas.** Hivos [S11] dice que "podría debilitar" a organizaciones; no encontré un caso boliviano nombrado con cierre de programas por esa causa. Tampoco confirmé la causa de la caída de ONG de UNITAS: la fuente la atribuye al entorno restrictivo, no a los recortes.
7. **Diagnóstico del DS 5673.** Solo leí la posición de Amnistía [S13] y el contexto de UNITAS [S12]. No abrí el texto del decreto ni respuestas del gobierno, salvo la frase del canciller en la nota [S12]. No sé si hay recursos judiciales ni su estado.
8. **Coyuntura cambiaria y de precios en Bolivia** (situación S-11). No abrí ninguna fuente actual; la situación es genérica.
9. **Bloqueos y conflictos como causa de pérdida de actividad de proyectos sociales** (S-13): estimación, sin fuente.
10. **Costos por beneficiario reales de proyectos de ONG bolivianas.** No encontré evaluaciones públicas con cifras comparables. El monto cercano a Bs 200 del Bono Juancito Pinto es un cálculo mío a partir de dos números de un gráfico del estudio del BCB; no está declarado por la fuente como tarifa del bono.
11. **Umbral razonable de concentración de financiador** (por ejemplo, ningún donante sobre 50%): no encontré una norma; es interpretación mía.
12. **Magnitudes de las situaciones** (porcentajes de caída de donaciones, deserción, retrasos): son estimaciones mías, salvo las citadas de S6, S10, S12 y S15. Deben calibrarse con datos de ONG reales antes de entrar al motor.
13. **Rendición de cuentas a cooperantes en Bolivia** (formatos, auditorías, documentos aceptables): no abrí guías de cooperantes concretos (Suiza, Suecia, Unión Europea). Lo que digo en S-12 es genérico.
14. **Resolución Ministerial 060** (Reglamento de Evaluación y Seguimiento de Programas y Proyectos con recursos de donación): la menciona Hivos [S11] como modificada tras observaciones de OSC; no la abrí.
