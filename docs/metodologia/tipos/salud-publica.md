# Tipo de proyecto: Salud pública o sin cobro (ficha B5)

Investigación metodológica para el simulador SIMPRO. Fecha de redacción: 22/10/2026.

## Cómo leer este documento

- **[Fuente Sx]** significa que la afirmación viene de una fuente de la sección 8 que abrí y leí. **[Interpretación]** es mi lectura. **Estimación** es una cifra mía, sin fuente, que hay que calibrar (sección 10).
- Las situaciones de la sección 5 usan magnitudes como puntos porcentuales o múltiplos del valor normal del mes. Las que no tienen fuente están marcadas.
- Las fórmulas que armé de memoria están marcadas como "reconstruida de memoria".
- Todo lo que no pude abrir o confirmar está en la sección 9. Las cifras de Bolivia que dependen de datos que no encontré están en la sección 10.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

Un proyecto de salud pública entrega un servicio (vacuna, tamizaje, tratamiento, vivienda mejorada, agua segura, un centro equipado, una brigada móvil) a una población y **no cobra** por él, o cobra algo simbólico. Quien lo financia es el Estado (nivel central, gobernación, municipio), un cooperante o una ONG. El beneficio no entra a la caja: son **enfermedades evitadas, muertes evitadas y años de vida sana ganados**.

Cómo aporta valor, en cadena:

1. **Insumos**: plata, personal, vacunas, equipos, combustible.
2. **Productos** (lo que el proyecto entrega): dosis aplicadas, controles prenatales realizados, viviendas rociadas.
3. **Cobertura**: qué parte de la población objetivo realmente recibió el producto.
4. **Resultado**: qué cambió en la salud (menos casos, menos muertes, menos desnutrición).

El manual de CEPAL separa justamente "eficiencia en producir productos" de "efectividad en lograr el objetivo": producir muchas atenciones baratas no garantiza que mejore la salud [Fuente S1]. El Banco Mundial hace una advertencia parecida: se usan indicadores de proceso (por ejemplo, niños inmunizados) porque son medibles, pero llevan escondida la suposición de que el producto produce salud; los indicadores de resultado (muertes evitadas) se enfocan mejor en el objetivo [Fuente S2].

**Contexto boliviano (lo que verifiqué):**

- La Ley 1152 (2019) amplía la atención gratuita a quienes no tienen seguro social de corto plazo, como paso hacia un sistema universal y gratuito. El primer nivel (promoción, prevención, atención general) lo financian municipios y gobiernos indígenas con 15,5% de su coparticipación tributaria; el nivel central paga al personal de salud público, los programas nacionales y el tercer y cuarto nivel [Fuente S7].
- La Defensoría del Pueblo visitó 72 de 126 centros integrales de primer nivel y encontró que el 79% de los verificados no estaba acreditado, además de falta de equipos, medicamentos y personal [Fuente S8].
- Chagas: una nota de prensa de 2025 cita 2.172.371 personas infectadas y que cerca de la mitad no sabe que lo tiene [Fuente S14].
- Mortalidad materna: la cifra depende de la fuente (160, 206 o 235 por 100.000 según el año y quien mida) y Bolivia aparecía con la más alta de Sudamérica en 2011 [Fuente S10].
- Desnutrición crónica en menores de 5 años: 16% en 2016 (meta oficial 9%); anemia 53,7% [Fuente S9]. No encontré el dato de la EDSA 2023.

**[Interpretación]** En el simulador, el alumno no gana "plata": gana **cobertura efectiva** y **casos evitados por boliviano invertido**, y debe sostener el servicio cuando se acabe el financiamiento.

---

## 2. Indicadores propios y cómo se calculan

Notación: *P* = población objetivo; *C* = costo; *Cob* = cobertura.

| # | Indicador | Fórmula | Fuente / estado |
|---|-----------|---------|-----------------|
| 1 | Cobertura | personas que recibieron el servicio / *P* | Definición estándar; la usa el programa de Chagas de Bolivia como proporción de embarazadas tamizadas [S6]. Fórmula reconstruida de memoria. |
| 2 | Cobertura efectiva | *Cob* × (proporción que completa el esquema o tratamiento) × eficacia de la intervención | Reconstruida de memoria. Idea apoyada en S2 (efecto = nº de inmunizaciones × eficacia de la vacuna × incidencia y letalidad). |
| 3 | Costo por persona alcanzada (costo por beneficiario) | *C* total del período / personas alcanzadas | Es el "costo por unidad de producto" (CUP = CTA / SAP) del manual de CEPAL [S1]. |
| 4 | Costo total anual (CTA) | costos anualizados de capital + mantenimiento + operación + costos de los usuarios | S1 (CTA = CAK + CAM + CAO + CAAU). |
| 5 | Casos evitados | *P* × incidencia sin proyecto × eficacia × cobertura efectiva, menos lo que habría pasado igual | Reconstruida de memoria. El modelo del Banco Mundial para muertes evitadas usa inmunizaciones, eficacia e incidencia/letalidad [S2]. El ajuste "menos lo que habría pasado igual" es la idea del Banco Mundial de efectos netos: en su ejemplo, 8% de la población ya compraba la vacuna en el sector privado y el efecto neto se reduce [S2]. |
| 6 | Costo por caso evitado | *C* / casos evitados | Estándar. Ejemplo real del libro: costo por muerte evitada de US$ 579 (programa total de vacunación) vs US$ 7.200 si se trata en lugar de prevenir (US$ de 1995, país del ejemplo ilustrativo) [S2]. |
| 7 | Costo por unidad de impacto (CUI) | CTA / (impacto medio anual × 100), con impacto en proporción | S1. Ejemplo del manual: 463.020 / (0,020 × 100) = 231.510 US$ por punto porcentual. |
| 8 | Impacto total ponderado (ITP) | suma de (meta de cada objetivo × peso del objetivo); los pesos suman 1 | S1. En el ejemplo, pesos 0,43 (mortalidad), 0,21, 0,21, 0,14. |
| 9 | Años de vida ganados (YLG / HYLG) | por cada muerte evitada: expectativa de vida − edad a la que habría muerto (ej.: muerte evitada a los 5 años con esperanza de vida de 70 = 65 años) | S2 (glosario). HYLG suma años por menor mortalidad y menor morbilidad. |
| 10 | AVAD o DALY | AVAD = años de vida perdidos por muerte prematura (YLL) + años vividos con discapacidad (YLD) | Suma YLL + YLD confirmada en S5. YLD = años en la condición × peso de discapacidad (0 salud perfecta, 1 muerte) [S5]. Fórmulas internas de YLL (casos × años que le faltaban) reconstruidas de memoria. |
| 11 | AVAC o QALY ganados | suma de años de vida × peso de calidad de vida (1 = año plenamente funcional, fracciones para años con limitaciones) | S2 (describe QALY). El libro dice que los pesos son intensivos en datos y que no hay método estándar probado en países en desarrollo. |
| 12 | Costo por AVAD (o AVAC) evitado | *C* / AVAD evitados | Estándar. Es la medida que se compara con umbrales (sección 3). |
| 13 | Razón incremental costo-efectividad (ICER) | (C de la alternativa − C de la base) / (efecto de la alternativa − efecto de la base) | Reconstruida de memoria. Idea coincide con S3 y S4: cuánta salud adicional compra el gasto adicional. |
| 14 | Dosis perdidas | 1 − (dosis aplicadas / dosis entregadas al punto de vacunación) | Reconstruida de memoria. No pude abrir estudio con cifras (sección 9). |
| 15 | Adherencia o completitud | personas que completan esquema o tratamiento / personas que lo inician | Reconstruida de memoria. Dato de referencia boliviano: en el programa de Chagas congénito 2004-2009, 70% de los niños que debían tratarse completó el tratamiento de 30 días; solo 18% volvió a la serología de 6-12 meses [S6]. |
| 16 | Brecha de última milla | población objetivo sin cobertura en comunidades dispersas / *P* | Reconstruida de memoria. S6 menciona que la población rural dispersa de municipios endémicos (alrededor de 37% de la población) queda fuera del alcance. |
| 17 | Sostenibilidad | costo recurrente anual / presupuesto local comprometido al terminar el financiamiento | Indicador propuesto por mí (**[Interpretación]**), no viene de una fuente. |

**Ejemplo numérico simple (todo inventado, solo para enseñar):** campaña con costo de Bs 600.000 que cubre 10.000 niños, evita 80 casos hospitalizados. Costo por beneficiario = Bs 60. Costo por caso evitado = Bs 7.500. Para pasar a costo por AVAD hay que multiplicar los casos evitados por los AVAD de cada caso, y eso exige un peso de discapacidad y una duración de la enfermedad de una fuente local (no se inventa en el aula).

---

## 3. Cómo se evalúa económicamente cuando no hay ingreso

### 3.1 Por qué el VAN no sirve solo
El VAN descuenta flujos de caja. Aquí el flujo es todo costo, así que el VAN siempre sale negativo y no distingue un buen proyecto de uno malo. Convertir una vida en plata es discutible: el Banco Mundial describe el enfoque de capital humano (valor de la vida = ingresos futuros) y critica que valora menos a quien gana poco, a jubilados y a niños, y que ignora el dolor y el sufrimiento; dice que a lo sumo da una cota inferior [Fuente S2]. Por eso se compara **costo por resultado** entre alternativas.

### 3.2 Lo que reemplaza al VAN/TIR

| Método | Qué responde | Cuándo usarlo | Fuente |
|--------|--------------|---------------|--------|
| Costo-mínimo / costo por unidad de producto | ¿Cuál alternativa entrega una atención al menor costo? | Cuando se asume que todas las alternativas tienen el mismo impacto | S1 |
| Costo-impacto (costo por unidad de impacto, CUI) | ¿Cuánto cuesta un punto de impacto en cada objetivo? | Proyectos sociales con objetivos medibles | S1 |
| Costo-efectividad | ¿Cuánto cuesta cada muerte, caso o año de vida evitado? | Un solo tipo de resultado, comparando alternativas | S2 |
| Costo-efectividad ponderada | Igual pero con pesos subjetivos | Resultados múltiples; el Banco Mundial pide "extrema cautela" y pesos explícitos | S2 |
| Costo por AVAD/AVAC | Permite comparar enfermedades distintas | Cuando hay que decidir entre vacunar o tratar diabetes, por ejemplo | S2, S3, S5 |
| Análisis costo-beneficio (poner precio a la salud) | ¿Beneficios en plata > costos? | Posible, pero con la crítica de valorar la vida | S2 |
| SROI | Cuánto valor social por cada Bs invertido, descontando lo que habría pasado igual | Informes a financiadores | Descrito en la taxonomía del proyecto (guía del Cabinet Office); **yo no abrí esa guía** |
| VAN social | Costos y beneficios a precios sociales | Si el sistema de inversión pública lo exige | No confirmado (ver 9) |

### 3.3 Reglas prácticas que enseña la bibliografía

1. **Comparar alternativas, no aprobar una sola.** La decisión es "de estas tres formas de llegar a la meta, ¿cuál cuesta menos por resultado?". En el ejemplo del manual de CEPAL, tres alternativas de consultorio tienen costos anuales entre US$ 463.020 y US$ 592.672; la que mejor impacto ponderado logra (23,6% vs 16,1%) no es la más barata [Fuente S1].
2. **Descontar los beneficios, no la salud en sí.** El Banco Mundial explica por qué una muerte evitada hoy "vale más" que una evitada mañana: se descuentan los beneficios que el efecto genera [Fuente S2]. (La tasa exacta recomendada no la leí; ver 9.)
3. **Prevención no siempre le gana al tratamiento.** El libro advierte que la prevención se aplica a mucha gente que nunca se enfermaría, y que el resultado puede ser distinto en enfermedades de baja incidencia [S2]. Además: agregar la vacuna BCG a un programa existente resultó costo-efectivo (US$ 797 por muerte evitada vs US$ 1.950 de tratar), pero como programa independiente no (US$ 3.247) [S2]. **Lección para el simulador:** lo mismo puede ser buena idea como complemento y mala idea como proyecto solo.
4. **Efectos netos, no brutos.** Si el sector privado ya cubría a una parte, el efecto real del programa gratuito es menor [S2].

### 3.4 Umbrales de costo-efectividad: qué dijo la OMS y qué se le critica

- Desde 2001 la Comisión de Macroeconomía y Salud de la OMS propuso umbrales como múltiplo del PIB per cápita; en 2005 WHO-CHOICE consideró "muy costo-efectiva" una intervención que evita un AVAD por menos de un PIB per cápita, y "costo-efectiva" si cuesta menos de tres veces el PIB per cápita [Fuente S3, S4].
- Críticas [S3, S4]: (a) no son específicos del país; (b) casi cualquier intervención con beneficio detectable los pasa, así que no ordenan prioridades; (c) ignoran la capacidad de pagar: un tratamiento "muy costo-efectivo" puede costar más que todo el presupuesto si se da a todos los que lo necesitan; (d) no hay evidencia de que la disposición a pagar suba con el PIB; (e) pueden incentivar a ajustar los supuestos para cruzar el umbral.
- Ejemplo de S4: en Zambia las mallas antimosquito (I$ 29 por AVAD) y el tratamiento antirretroviral (I$ 963 por AVAD) pasan el umbral, pero I$ 1 millón en mallas evita unas 33 veces más AVAD que en antirretrovirales.
- Alternativas propuestas: tablas de ligas (ordenar intervenciones por ICER y financiar de arriba hacia abajo hasta agotar el presupuesto) [S4]; marcos de decisión con varios criterios, incluyendo impacto presupuestario, equidad y factibilidad [S3].
- **Para el simulador [Interpretación]:** usar el umbral solo como semáforo, y mostrar siempre al lado el **impacto presupuestario** (cuánto cuesta escalarlo a toda la población) y la **sostenibilidad**. Un alumno que dice "es costo-efectivo, entonces se aprueba" comete el error que S3 y S4 critican.
- Qué umbral usar en Bolivia: no lo confirmé (requiere el PIB per cápita actual; ver 10).

### 3.5 Una crítica al AVAD que el alumno debe conocer
Grosse y coautores sostienen que los pesos de discapacidad reflejan cómo valoran ciertos expertos los estados de salud y no la discapacidad medida, y que a todos con la misma condición se les asigna el mismo peso sin considerar su entorno; recomiendan no usar el AVAD para evaluar condiciones discapacitantes [Fuente S5]. El Banco Mundial anota que el ponderador por edad del AVAD es "altamente subjetivo" y que el AVAC es intensivo en datos [S2]. **[Interpretación]** Por eso en el simulador conviene mostrar el AVAD como una herramienta, con sus pesos visibles y editables.

---

## 4. Errores típicos de estudiantes y de equipos de proyecto

Marco: los puntos con fuente indican de dónde sale; el resto son errores que **[Interpretación]** deduzco de la literatura y de los hallazgos bolivianos.

1. **Medir actividades y creer que son resultados.** "Se hicieron 5.000 controles" no dice si bajó la desnutrición (S1, S2 sobre indicadores de proceso vs resultado).
2. **Usar el VAN en un proyecto sin ingreso**, o inventar un "ingreso" simbólico para que el VAN salga positivo.
3. **Declarar éxito porque pasa el umbral de la OMS** sin mirar presupuesto ni equidad (S3, S4).
4. **Cobertura inflada o mal calculada.** En el programa de Chagas congénito, en 2009 se tamizaron más mujeres (106.724) que las embarazadas registradas (83.208), señal de repetición de pruebas por fallas en el registro [S6]. Si el denominador está mal, la cobertura engaña.
5. **Suponer que quien empieza termina.** En ese mismo programa solo 24% de los recién nacidos expuestos volvió a la segunda prueba y 18% a la serología de 6-12 meses; 22% de los niños diagnosticados no inició tratamiento porque la madre ya había salido de la maternidad [S6].
6. **Olvidar el último tramo.** La población rural dispersa queda fuera; los establecimientos del primer nivel suelen no tener laboratorio [S6].
7. **No costear lo recurrente.** Presupuestar la compra del equipo y no su mantenimiento, la reposición de insumos o el sueldo de quien lo opera. Con la Ley 1152 el primer nivel depende del 15,5% de la coparticipación municipal [S7]; un proyecto que deja gastos al municipio sin acuerdo previo se cae al terminar el donante.
8. **Dar por hecho que el personal se queda.** S6 subraya que el éxito del programa dependía de personal motivado y que hacen falta capacitación, supervisión y estabilidad laboral. La OMS tiene una guía de 2021 sobre atraer y retener personal en zonas rurales (solo confirmé el alcance de la página, no el contenido; ver sección 9).
9. **No descontar lo que habría pasado igual** (efecto bruto vs neto) [S2].
10. **No considerar la cadena de frío ni los insumos como parte del costo y del riesgo** (sin cifras abiertas; ver 9).
11. **Comparar costo por beneficiario entre programas muy distintos** y concluir que el más barato es mejor. El manual de CEPAL separa claramente costo por producto de costo por impacto [S1].
12. **Ignorar la demanda y la confianza de la comunidad.** El brote de sarampión de 2025 mostró reticencia en colonias menonitas y desinformación en El Alto [S12].
13. **Tratar la adherencia como 100%** en tratamientos largos o esquemas de varias dosis.
14. **Prometer cero muertes en la meta.** Metas no creíbles. La meta oficial boliviana de desnutrición crónica era 9% y en 2016 estaba en 16% [S9].

---

## 5. SITUACIONES PARA LA SIMULACION

Convenciones: Bolivia cuando hay dato abierto. Las magnitudes marcadas "estimación" son mías y deben calibrarse (sección 10). Los nombres de variables siguen la sección 6.

### S-1. Falla de la cadena de frío

**Qué pasa.** Un refrigerador del centro de acopio se descompone o hay un corte de luz de varios días en una zona rural, y las vacunas quedan fuera de rango de temperatura. Para vacunas termosensibles, el lote debe descartarse o usarse sin garantía. No encontré cifras bolivianas de pérdida por cadena de frío (ver 9).

**Variables que mueve.**
- Dosis disponibles: -10% a -40% de las dosis del mes si hay que descartar un lote (estimación).
- Cobertura efectiva: baja el mes siguiente si no hay reposición (estimación).
- Costo de reposición: sube 5% a 15% del gasto del mes en vacunas más transporte de urgencia (estimación).
- Confianza comunitaria: baja levemente si hubo gente que fue y no se vacunó (estimación).

**Decisiones posibles.**
1. *Descartar el lote y pedir reposición.* Ventaja: no se aplica nada dudoso, protege la credibilidad técnica. Costo: hasta que llega la reposición hay niños sin vacunar y el costo por beneficiario sube.
2. *Aplicar con la pérdida de temperatura "dentro de lo tolerable" según criterio local.* Ventaja: no se pierde el lote ni el mes de campaña. Costo: riesgo de aplicar dosis sin efecto; los niños figuran como cubiertos, pero no protegidos. El error aparece después en un brote.
3. *Comprar un equipo con respaldo de energía (panel solar o generador).* Ventaja: reduce el riesgo en los meses siguientes. Costo: inversión que no está en el plan, y consume la reserva de caja; solo se justifica si hay muchas zonas de riesgo.
4. *Trasladar los frascos a otro establecimiento con cadena de frío funcional y vacunar allí.* Ventaja: salva parte del lote. Costo: obliga a la gente a viajar, baja la asistencia, pone más presión a otro establecimiento.

**Qué aprende el alumno.** Que "dosis comprada" no es "persona protegida": la cobertura efectiva depende de que el insumo llegue en condiciones, y que invertir en resiliencia cuesta hoy y se nota recién cuando falla algo.

### S-2. Reticencia comunitaria a vacunarse o a recibir el servicio

**Qué pasa.** En parte de la zona objetivo hay desconfianza: rumores, razones religiosas, barrera de idioma. En el brote de sarampión de 2025 en Bolivia, hubo reticencia histórica en colonias menonitas (más de 150 colonias en el país, concentradas en Santa Cruz) y desinformación en El Alto; la mayoría de las familias terminó aceptando, no todas, tras visitas repetidas con traductores locales y líderes comunitarios [Fuente S12].

**Variables que mueve.**
- Cobertura en el segmento: -20 a -50 puntos respecto a la zona sin reticencia (estimación).
- Costo por beneficiario alcanzado en ese segmento: x1,5 a x3 si se hacen visitas repetidas (estimación).
- Riesgo de brote: sube mientras el segmento sin cubrir supere el umbral de inmunidad de grupo (concepto; el valor depende de la enfermedad).

**Decisiones posibles.**
1. *Inversión en diálogo: traductores, líderes, visitas casa a casa.* Ventaja: es lo que funcionó en el brote de 2025 según S12; sube la confianza para próximas campañas. Costo: caro por persona y lento; el riesgo de brote persiste varias semanas.
2. *Concentrar el esfuerzo en las zonas receptivas y dejar la reticente para después.* Ventaja: menor costo por persona vacunada y mejor cobertura total en el corto plazo. Costo: queda una bolsa susceptible; si llega un caso importado, el brote empieza ahí.
3. *Lanzar campaña masiva de comunicación en medios.* Ventaja: llega a mucha gente a bajo costo por contacto. Costo: se sabe que el contacto no es lo mismo que cambio de conducta; puede no mover al segmento duro (**[Interpretación]**).
4. *Exigir el esquema para trámites o servicios (escuelas, guarderías).* Ventaja: sube la cobertura rápido. Costo: puede generar rechazo, exclusión de niños y conflicto con la comunidad; riesgo reputacional.

**Qué aprende el alumno.** Que el costo por beneficiario no es plano: el último 10% de cobertura es el más caro y es donde se define si hay brote.

### S-3. Brote importado que obliga a un bloqueo vacunal de emergencia

**Qué pasa.** Aparece un caso de una enfermedad prevenible (por ejemplo sarampión) en una zona bajo tu proyecto. En 2025 un solo caso confirmado en Tarabuco (Chuquisaca) activó un bloqueo epidemiológico y vacunación intensiva; el país declaró emergencia nacional y aplicó más de un millón de dosis con un esquema acortado para 1 a 4 años [Fuente S12]. La OPS recomienda vigilancia activa, alta cobertura con dos dosis y acción rápida, y declarar emergencia para movilizar recursos [Fuente S13].

**Variables que mueve.**
- Casos activos: pueden subir en un orden de magnitud por mes si la cobertura es baja (estimación, depende del R0 de la enfermedad).
- Gasto operativo del mes: +30% a +100% (brigadas, horas extra, transporte) (estimación).
- Costo por caso evitado: baja si se interviene rápido, sube si se tarda.
- Reputación institucional: sube si se actúa rápido.

**Decisiones posibles.**
1. *Redirigir al equipo del proyecto al bloqueo y suspender actividades programadas.* Ventaja: respuesta rápida, evita casos. Costo: se atrasan las metas del plan original (por ejemplo, controles de rutina); el equipo se agota.
2. *Contratar personal temporal para el bloqueo y seguir con lo programado.* Ventaja: no se interrumpe lo rutinario. Costo: gasto extra no presupuestado, capacitación rápida, riesgo de baja calidad.
3. *Esperar a que el nivel departamental o nacional mande instrucciones.* Ventaja: no se gasta fuera de convenio y se respeta la cadena de mando. Costo: pérdida de días críticos; si el brote crece, el costo final es mayor.
4. *Pedir ayuda al cooperante o a la OPS para financiamiento de emergencia.* Ventaja: moviliza recursos externos (en 2025, apoyo técnico con financiamiento de Canadá [S12]). Costo: demora de trámites, condiciones, y dependencia.

**Qué aprende el alumno.** Que una emergencia convierte el costo por caso evitado en el indicador clave, que la velocidad de respuesta vale más que el presupuesto y que la planificación debe incluir una reserva para contingencias.

### S-4. Temporada de dengue que desborda el servicio

**Qué pasa.** Con las lluvias de verano sube el dengue en el oriente. En 2023 el Ministerio de Salud reportó 8.895 casos y 29 muertes hasta el 21 de febrero, 76% en Santa Cruz, con serotipo 2 descrito como muy agresivo para niños y adultos mayores; la respuesta incluyó eliminación de criaderos con apoyo de municipio y fuerzas armadas, y brigadas médicas [Fuente S11]. Tu proyecto (por ejemplo, un programa de agua y saneamiento o de salud comunitaria) se ve presionado a atender el brote.

**Variables que mueve.**
- Consultas/atenciones: 1,5x a 3x el valor normal durante 6 a 10 semanas (estimación; S11 solo da conteos acumulados).
- Personal disponible: baja por enfermedad y por fatiga (estimación).
- Gasto en insumos (sueros, pruebas): +20% a +60% (estimación).
- Actividades de prevención programadas: se atrasan.

**Decisiones posibles.**
1. *Sumarte a la eliminación de criaderos en los barrios con más casos.* Ventaja: ataca la causa; algo de impacto de largo plazo en otras enfermedades por vector. Costo: movilizar gente y dinero que no estaba; los resultados no se ven inmediatamente.
2. *Reforzar la atención clínica y la derivación de casos graves.* Ventaja: salva vidas ya. Costo: no baja el número de casos; se gasta en tratamiento más que en prevención.
3. *Mantener el plan y dejar el dengue a los servicios públicos.* Ventaja: se cumplen metas originales. Costo: se ve como poca respuesta al contexto; riesgo reputacional ante autoridades y comunidad.
4. *Campaña educativa en escuelas y barrios sobre eliminación de criaderos.* Ventaja: bajo costo, sostenible. Costo: efecto incierto y lento; requiere constancia.

**Qué aprende el alumno.** Que prevención y tratamiento compiten por los mismos recursos en una crisis, y que el contexto epidemiológico cambia el costo por resultado de un proyecto aunque no cambie su diseño.

### S-5. El médico o enfermera rural renuncia o no llega

**Qué pasa.** El profesional destinado al establecimiento rural se va (mejor oferta, aislamiento, falta de vivienda) y el puesto queda vacío varios meses. La Defensoría encontró falta de recursos humanos, equipos, medicamentos e infraestructura como problemas recurrentes en los centros de primer nivel [Fuente S8]. El programa de Chagas congénito dependía de personal motivado y pedía estabilidad laboral [Fuente S6]. La OMS publicó en 2021 una guía de atracción y retención de personal en zonas rurales; solo confirmé su alcance, no sus recomendaciones (sección 9).

**Variables que mueve.**
- Personal disponible: -1 puesto durante 2 a 6 meses (estimación).
- Atenciones/mes: -30% a -70% del establecimiento afectado (estimación).
- Cobertura en la zona: baja con rezago de 1 a 2 meses.
- Costo de contratación: incentivo adicional de 10% a 40% del sueldo para atraer a un reemplazo (estimación).

**Decisiones posibles.**
1. *Ofrecer incentivos (bono de zona, vivienda, transporte).* Ventaja: más probabilidad de cubrir y retener. Costo: eleva costos recurrentes; crea desigualdad con el personal de otras zonas.
2. *Cubrir con brigada móvil desde el centro más cercano.* Ventaja: no se interrumpe el servicio del todo. Costo: menor frecuencia, mayor costo por atención, desgaste del equipo de la brigada.
3. *Capacitar a un promotor comunitario para tareas básicas.* Ventaja: presencia local permanente y barata. Costo: limita lo que se puede resolver; riesgo de error clínico y de sobrecarga del promotor.
4. *Esperar a que el SEDES o el municipio designe reemplazo.* Ventaja: sin costo extra. Costo: tiempo incierto, cobertura cae y la comunidad pierde confianza.

**Qué aprende el alumno.** Que el personal es un insumo crítico y escaso, que rotación significa perder lo aprendido, y que los incentivos pagan hoy y se sostienen solo si hay presupuesto recurrente.

### S-6. Se pierde el seguimiento de los casos tratados

**Qué pasa.** Un tratamiento requiere varias visitas, pero la gente no vuelve: cambia de domicilio, está lejos, o no ve necesidad. En el programa nacional de Chagas congénito 2004-2009 solo 24% de los recién nacidos expuestos volvió a la segunda prueba y 18% a la serología de 6-12 meses; de 1.093 casos diagnosticados, 78% inició el tratamiento y 70% lo completó [Fuente S6]. El tratamiento es efectivo (96% de los controlados salió negativo), pero quien se pierde no cuenta.

**Variables que mueve.**
- Adherencia: cae 20 a 40 puntos si el seguimiento exige muchas visitas lejanas (estimación basada en la tendencia de S6).
- Casos que se confirman tarde: suben.
- Costo por caso curado: sube, porque se gasta en detectar pero no en curar.
- Calidad de datos: empeora (domicilios falsos).

**Decisiones posibles.**
1. *Visitas domiciliarias de seguimiento.* Ventaja: recupera pacientes y aumenta adherencia. Costo: personal y transporte; mucho más caro por caso.
2. *Incentivo a la persona (bono, canasta) si completa el esquema.* Ventaja: efectivo en otros programas sociales de Bolivia, como el Bono Juana Azurduy, que paga por controles prenatales y parto institucional (hasta Bs 1.820 en 33 meses según el decreto [no abierto, ver 9]). Costo: gasto recurrente; la gente puede ir solo por el bono.
3. *Reducir las visitas al mínimo y aceptar la pérdida.* Ventaja: menor costo por paciente alcanzado. Costo: menor efectividad, quedan casos sin tratar.
4. *Digitalizar el registro con identificación y recordatorios.* Ventaja: mejor trazabilidad a largo plazo. Costo: inversión inicial; en comunidades sin señal o celular no funciona; requiere capacitación.

**Qué aprende el alumno.** Que la efectividad real = eficacia × cobertura × adherencia, y que un programa excelente en laboratorio puede ser mediocre por pérdida de seguimiento.

### S-7. Faltan medicamentos o insumos de diagnóstico

**Qué pasa.** Se agotan reactivos, jeringas, antiparasitarios o suplementos. La Defensoría reportó falta o insuficiencia de medicamentos, demoras de pago a proveedores y compras con burocracia en el SUS [Fuente S8]. El programa de Chagas se basaba en pruebas y medicamentos entregados gratis por el programa nacional [Fuente S14].

**Variables que mueve.**
- Stock de insumos críticos: llega a cero durante 1 a 3 meses (estimación).
- Atenciones completas: -20% a -60% (estimación).
- Gasto de bolsillo de los pacientes: sube (S8 menciona que los pacientes a veces deben comprar).
- Costo de compra de emergencia: +20% a +50% sobre precio normal (estimación).

**Decisiones posibles.**
1. *Comprar con fondos del proyecto a proveedor privado.* Ventaja: se restablece el servicio. Costo: precio mayor, y se usan fondos previstos para otras partidas; se rompe la política de gratuidad si luego no se reembolsa.
2. *Priorizar a los pacientes más graves y postergar al resto.* Ventaja: cuida vidas en riesgo inmediato. Costo: otros casos se agravan o se pierden; tensión ética.
3. *Pedir préstamo de insumos a un establecimiento vecino.* Ventaja: rápido y sin plata. Costo: se traslada el problema, y el vecino puede faltar.
4. *Suspender temporalmente las actividades afectadas y comunicarlo.* Ventaja: transparente; no se gasta de más. Costo: cobertura cae y la gente pierde confianza.

**Qué aprende el alumno.** Que la cadena de suministro es parte del proyecto, que un stock de seguridad tiene un costo (guardar) y un beneficio (no parar), y que la política de gratuidad choca con los trámites reales de compra.

### S-8. Termina el financiamiento y hay que decidir qué se queda

**Qué pasa.** En el año 4 el cooperante anuncia que el convenio no se renueva. Con la Ley 1152 el primer nivel debe financiarse con el 15,5% de la coparticipación municipal y el personal de salud con recursos del Tesoro [Fuente S7], pero el municipio no incluyó tus gastos recurrentes en su presupuesto.

**Variables que mueve.**
- Aportes de financiadores: caen a cero desde el mes del cierre (dato del convenio).
- Costos recurrentes que debe asumir otro: los sueldos, insumos, mantenimiento.
- Sostenibilidad: queda determinada por lo acordado antes.
- Cobertura: puede caer 30% a 100% según lo que se transfiera (estimación).

**Decisiones posibles.**
1. *Transferir el servicio al municipio/SEDES con capacitación y manuales.* Ventaja: lo logrado puede continuar. Costo: si no hay presupuesto comprometido, se transfiere una obligación sin plata y el servicio se degrada.
2. *Reducir el servicio al núcleo esencial para que sea asumible.* Ventaja: más probable que se sostenga. Costo: se pierde cobertura y se excluye gente que ya se había incluido.
3. *Buscar nuevos financiadores.* Ventaja: puede mantener todo. Costo: lleva tiempo y esfuerzo (estimación: 6 a 12 meses), y dependes de otro donante.
4. *Cerrar con una evaluación y dejar documentación.* Ventaja: ordenado, deja aprendizaje. Costo: se pierde el servicio y a los beneficiarios.

**Qué aprende el alumno.** Que la sostenibilidad se decide en el diseño (acuerdos firmados, costos recurrentes asumidos), no al final, y que un proyecto costo-efectivo puede igual fracasar por no ser sostenible.

### S-9. Camino cortado por lluvia o bloqueo: la última milla

**Qué pasa.** La brigada móvil no puede llegar a las comunidades altas o del oriente por derrumbes, bloqueos o crecida de ríos. El representante de la OPS/OMS en Bolivia señaló que el altiplano y las selvas son zonas de difícil acceso y que muchas mujeres mueren en el camino a los hospitales [Fuente S10]. S6 documenta que la población rural dispersa de municipios endémicos queda en buena parte sin cubrir.

**Variables que mueve.**
- Cobertura de la zona aislada: 0 durante 1 a 4 semanas (estimación).
- Costo por beneficiario en esa zona: x2 a x5 si se usan alternativas (helicóptero, caminata, lancha) (estimación).
- Calendario de campaña: se atrasa y se comprime el resto.
- Cadena de frío: riesgo si los insumos quedan en tránsito.

**Decisiones posibles.**
1. *Esperar a que se abra el camino.* Ventaja: sin costo extra. Costo: ventana de vacunación o de tratamiento perdida; atraso en indicadores.
2. *Usar un medio alternativo (lancha, mula, avioneta).* Ventaja: se cumple la meta. Costo: costo por persona muy alto; sin plan de cadena de frío se pierden dosis.
3. *Dejar insumos y capacitar a un promotor local para que aplique.* Ventaja: presencia permanente, bajo costo. Costo: calidad variable y riesgo si el promotor no está capacitado o supervisado.
4. *Concentrar a la gente en un punto accesible.* Ventaja: más barato. Costo: la gente debe caminar horas, asistencia baja; los más vulnerables no llegan.

**Qué aprende el alumno.** Que la cobertura no es uniforme y que cada punto de cobertura adicional en zonas aisladas cuesta mucho más; que hay que decidir explícitamente a quién no se llega.

### S-10. Una emergencia obstétrica en zona remota

**Qué pasa.** Una embarazada con hemorragia está a horas del hospital. El OPS/OMS Bolivia señaló que muchas mujeres mueren antes de llegar y que, aun llegando, la hemorragia se controla tarde o falta técnica simple; el Ministerio de Salud implementaba un protocolo "código rojo" en siete hospitales (2016) y destacaba el Bono Juana Azurduy y Mi Salud (atención y parto en casa) [Fuente S10]. La mortalidad materna es un caso de "nadie sabe cuántas vidas salvó" porque el denominador es chico y se ve de a una.

**Variables que mueve.**
- Muertes maternas: eventos discretos con probabilidad alta en zonas remotas sin transporte (estimación; la razón nacional ronda 160-235 por 100.000 nacidos vivos según la fuente [S10]).
- Reputación comunitaria: sube mucho si se salva a la madre.
- Gasto: costo de traslado de emergencia de Bs elevado (estimación).

**Decisiones posibles.**
1. *Financiar un fondo de traslado de emergencia con vehículo disponible.* Ventaja: reduce demoras, mejora acceso. Costo: gasto fijo permanente aunque se use poco; difícil de justificar solo por "costo por caso evitado".
2. *Capacitar a parteras y promotores en detección de signos de alarma y referencia.* Ventaja: bajo costo, aprovecha lo local. Costo: sólo ayuda si hay transporte y un centro resolutivo; riesgo si falta articulación.
3. *Subsidiar casas de espera cerca del hospital para madres de zonas remotas.* Ventaja: reduce el riesgo de último momento. Costo: las mujeres deben dejar su hogar y familia; baja aceptación.
4. *Concentrar recursos en control prenatal y dejar el traslado a los servicios.* Ventaja: se puede medir en cobertura. Costo: no evita el evento más grave; los números de proceso se ven bien y las muertes persisten.

**Qué aprende el alumno.** Que los resultados más graves son eventos raros y trágicos, que cuesta justificar la prevención con un costo por caso evitado, y que se necesita combinar intervenciones (demora en decidir, en llegar y en recibir atención).

### S-11. Oportunidad: el municipio o el SEDES ofrece cofinanciar

**Qué pasa.** El gobierno municipal propone aportar una parte del costo (personal, local, combustible) a cambio de ampliar la cobertura a barrios que le interesan políticamente. La Ley 1152 asigna al municipio el financiamiento del primer nivel con 15,5% de la coparticipación [Fuente S7].

**Variables que mueve.**
- Aportes de contraparte: +20% a +50% del presupuesto (estimación).
- Cobertura potencial: sube.
- Autonomía del proyecto: baja (condiciones políticas).
- Sostenibilidad: sube si el compromiso es de largo plazo, baja si dura un solo año electoral.

**Decisiones posibles.**
1. *Aceptar y ampliar a los barrios que pide el municipio.* Ventaja: más cobertura y compromiso local. Costo: esos barrios pueden no ser los de mayor riesgo; el costo por caso evitado puede empeorar.
2. *Aceptar con condiciones: convenio firmado con aporte por varios años.* Ventaja: mejora la sostenibilidad. Costo: negociación lenta; puede perderse la oportunidad.
3. *Rechazar para mantener la focalización en los de mayor riesgo.* Ventaja: máxima efectividad por Bs. Costo: se pierde financiamiento y apoyo político; menos sostenible.
4. *Aceptar solo en especie (local, personal) y no en dinero.* Ventaja: menos riesgo de interferencia. Costo: el aporte en especie se retira fácilmente.

**Qué aprende el alumno.** Que focalizar mejora la costo-efectividad pero la sostenibilidad exige alianzas, y que a veces el dilema es entre la eficiencia y la política.

### S-12. El programa se duplica con otro del Estado

**Qué pasa.** Un programa nacional llega al mismo grupo con un servicio parecido (por ejemplo, nuevo paquete SUS o campaña nacional) a los pocos meses de iniciar el tuyo. El Banco Mundial advierte que el efecto neto es menor cuando otros ya cubrían a parte de la población (su ejemplo: 8% compraba en privado y la mitad pasaba al programa gratuito, por lo que el efecto neto fue 19/20 del bruto) [Fuente S2]. La Defensoría observó también falta de coordinación entre niveles de gobierno [Fuente S8].

**Variables que mueve.**
- Población objetivo no cubierta por otros: cae 10% a 40% (estimación).
- Casos evitados netos: bajan en la misma proporción.
- Costo por caso evitado: sube.

**Decisiones posibles.**
1. *Coordinar con el programa estatal y repartirse zonas.* Ventaja: se evita la duplicación; se llega a más gente en total. Costo: tiempo de coordinación; pérdida de visibilidad de tu proyecto.
2. *Seguir como estaba y competir.* Ventaja: se mantienen tus metas de cobertura. Costo: se duplican gastos y se confunde a la comunidad; los números de efecto neto bajan.
3. *Reorientarse a un grupo o componente no cubierto.* Ventaja: complementa, mejora el efecto neto. Costo: cambio de plan, hay que reformular la meta.
4. *Cerrar el componente duplicado y traspasar el equipo.* Ventaja: libera recursos. Costo: despidos o reubicaciones, y la pérdida de lo construido.

**Qué aprende el alumno.** Que el beneficio de un proyecto es lo que cambia respecto de lo que habría pasado igual, y que coordinar es parte del trabajo.

### S-13. El dato de cobertura no cuadra

**Qué pasa.** Tus registros muestran más personas vacunadas o tamizadas que las que figuran en el padrón de la población objetivo (como pasó en el programa de Chagas en 2009: 106.724 mujeres tamizadas vs 83.208 embarazadas registradas, atribuido a repetición de pruebas y registros defectuosos [Fuente S6]). Hay que decidir qué cifra reportar al financiador.

**Variables que mueve.**
- Calidad de datos: baja.
- Cobertura reportada vs real: brecha de 10% a 30% (estimación).
- Credibilidad ante el financiador: baja si se descubre después.

**Decisiones posibles.**
1. *Reportar la cifra corregida, más baja.* Ventaja: transparencia, credibilidad. Costo: el avance se ve menor; posible recorte del próximo desembolso.
2. *Reportar la cifra alta y corregir internamente.* Ventaja: se cumple la meta. Costo: riesgo ético y de perder el convenio si se detecta; las decisiones se toman con datos falsos.
3. *Invertir en un padrón nominal y verificación por muestreo.* Ventaja: corrige de raíz; mejora todas las siguientes decisiones. Costo: dinero y tiempo que no estaban en el plan.
4. *Pedir al financiador flexibilizar la meta mientras se corrige.* Ventaja: transparente y evita presión. Costo: depende de la voluntad del financiador.

**Qué aprende el alumno.** Que los datos son un activo de gestión, y que los indicadores de cobertura solo valen si el denominador y el registro son confiables.

### S-14. Elegir qué medir: actividades o impacto

**Qué pasa.** El financiador pide un informe del año 3. Tienes buenos números de actividad (controles, charlas) pero medir el impacto real (casos evitados) requiere un estudio con línea de base y grupo comparación. El manual de CEPAL describe modelos experimental, cuasi-experimental y no experimental de evaluación de impacto [Fuente S1]; el Banco Mundial dice que los indicadores de proceso se usan por practicidad pero suponen eficacia [Fuente S2].

**Variables que mueve.**
- Gasto en evaluación: 3% a 10% del presupuesto de un año (estimación).
- Información sobre impacto: aumenta si se evalúa.
- Riesgo: la evaluación puede mostrar menos impacto del esperado.

**Decisiones posibles.**
1. *Hacer una evaluación de impacto con grupo de comparación.* Ventaja: resultado creíble, base para pedir más fondos. Costo: caro, lento y puede mostrar un efecto pequeño.
2. *Reportar solo actividades y cobertura.* Ventaja: barato, cumple formalmente. Costo: no se sabe si funciona; riesgo de descubrirlo tarde.
3. *Medir un indicador de resultado simple con registros existentes (por ejemplo, hospitalizaciones en la zona).* Ventaja: compromiso entre costo y rigor. Costo: sin grupo de comparación, otros factores pueden explicar el cambio.
4. *Pedir asistencia técnica a una universidad.* Ventaja: más rigor y menor costo. Costo: plazos académicos; menor control.

**Qué aprende el alumno.** Que "lo que no se mide no se mejora" tiene un costo, y que el valor de evaluar es poder cambiar de rumbo.

### S-15. Oportunidad: agregar un componente al paquete

**Qué pasa.** Con la plataforma ya instalada (personal, transporte, cadena de frío) puedes sumar otro servicio (otra vacuna, tamizaje de anemia, desparasitación). El libro del Banco Mundial muestra que sumar BCG a un programa de vacunación existente era costo-efectivo (US$ 797 por muerte evitada vs US$ 1.950 de tratar) pero como programa independiente no (US$ 3.247) [Fuente S2].

**Variables que mueve.**
- Costo por beneficiario: sube poco (costo marginal) (estimación).
- Casos evitados: suben según el componente.
- Carga de trabajo del personal: sube; riesgo de saturar.
- Complejidad logística: sube.

**Decisiones posibles.**
1. *Sumar el componente completo de inmediato.* Ventaja: mejor costo-efectividad por aprovechar la estructura. Costo: personal sobrecargado, riesgo de bajar la calidad del servicio original.
2. *Hacer una prueba piloto en una zona.* Ventaja: se aprende sin arriesgar todo. Costo: más lento; el beneficio llega más tarde.
3. *No sumar y mantener foco en la meta original.* Ventaja: se protege la calidad. Costo: se desperdicia capacidad instalada; costo por beneficio más alto a largo plazo.
4. *Subcontratar el componente a otra organización.* Ventaja: no sobrecarga al equipo. Costo: pierdes control y coordinación; el costo marginal se vuelve más alto.

**Qué aprende el alumno.** Que el costo marginal de un componente puede ser mucho menor que su costo independiente y que el análisis incremental (ICER) responde a "¿conviene agregar esto?".

---

## 6. Variables propias que el motor del simulador debería manejar

Cada variable se actualiza mes a mes. Las fórmulas son propuestas mías (**[Interpretación]**).

| Variable | Qué representa | Cómo se actualiza cada mes |
|----------|----------------|-----------------------------|
| Población objetivo | Personas a las que apunta el proyecto | Se fija al inicio; cambia por nacimientos o migración |
| Cobertura | % de la población objetivo que recibió el servicio | Acumula lo alcanzado: (nuevos alcanzados del mes) / población; limitada por dosis, personal y acceso |
| Cobertura efectiva | Cobertura × completitud × eficacia | Se recalcula con adherencia y estado de la cadena de frío |
| Adherencia | % que completa esquema o tratamiento | Baja con distancia, rotación de personal y falta de incentivos; sube con seguimiento |
| Incidencia base | Casos esperados sin proyecto por mes | Parámetro del problema (estacional si aplica, p. ej. dengue en verano) |
| Casos evitados | Casos que no ocurrieron gracias al proyecto | Incidencia base × cobertura efectiva × eficacia, menos lo que habría ocurrido igual |
| AVAD evitados | Años de vida sana ganados | Casos evitados × AVAD por caso (peso y duración editables) |
| Costo por beneficiario | Costo del mes / personas alcanzadas | Costo operativo ÷ alcanzados; sube en zonas dispersas |
| Costo por caso evitado y por AVAD | Indicadores centrales | Costo acumulado ÷ casos (o AVAD) evitados |
| Stock de insumos | Dosis, medicamentos, reactivos | Entra por compras, sale por uso y pérdida; evento de desabastecimiento si llega a 0 |
| Integridad de cadena de frío | Probabilidad de que las dosis estén en condiciones | Baja ante cortes de energía y equipos sin mantenimiento; sube con inversión |
| Personal de salud | Profesionales y promotores disponibles | Rotación mensual; sube con incentivos; evento de renuncia |
| Confianza comunitaria | Disposición de la gente a usar el servicio | Sube con resultados y presencia continua; baja con fallas y rumores |
| Acceso de última milla | % de la población objetivo alcanzable | Baja con lluvia/bloqueos; costo por beneficiario sube con la dispersión |
| Calidad de los datos | Confiabilidad del registro de cobertura | Baja si no hay padrón; el "dato reportado" y el "real" divergen |
| Dependencia de financiador | % del presupuesto proveniente de una sola fuente | Se calcula cada mes; sube el riesgo si es alto |
| Contraparte local | Compromiso del municipio/SEDES | Evento de cofinanciamiento; determina sostenibilidad |
| Presión epidemiológica | Brotes activos en el entorno | Eventos de brote que multiplican incidencia y gasto |
| Sostenibilidad | Capacidad de continuar sin el financiador | Costo recurrente cubierto por fuentes locales / costo recurrente total |
| Ratio de costo-efectividad vs umbral | Semáforo | Costo por AVAD ÷ referencia de umbral (editable), con aviso de impacto presupuestario |

Nota para el panel de resultados: mostrar siempre en paralelo costo por beneficiario (eficiencia), costo por caso o AVAD evitado (efectividad) y sostenibilidad, porque cada uno puede llevar a una decisión distinta.

---

## 7. Ejemplos reales de Bolivia y Latinoamérica

Todos los enlaces fueron abiertos por mí.

1. **Programa nacional de control del Chagas congénito en Bolivia, 2004-2009 (Bolivia).** Se tamizaron 318.479 embarazadas (23,3% positivas) en 90 establecimientos de 49 de 168 municipios endémicos; 1.093 casos congénitos diagnosticados, 78% inició tratamiento con benznidazol y 70% lo completó; 96% de los controlados salió negativo; solo la mitad de los casos esperados fue detectada. Limitaciones: seguimiento, laboratorios, acceso rural, personal. Fuente: https://pmc.ncbi.nlm.nih.gov/articles/PMC3708826/ [S6]. Una nota de 2025 reporta que en 2024 se tamizaron 143.549 embarazadas (7,2% positivas) y la transmisión materno-fetal bajó de 3,9% a 1,3% [S14: https://www.eldia.com.bo/2025-04-19/tag/chagas-la-enfermedad-silenciosa-que-la-mitad-de-los-afectados-no-sabe-que-tiene.html]; es prensa, no verifiqué la fuente oficial.
2. **Respuesta al brote de sarampión en Bolivia, 2025 (Bolivia).** Emergencia nacional, vacunación con esquema acortado (dos dosis de 1 a 4 años, una dosis de 5 a 20), brigadas móviles, bloqueo epidemiológico por un solo caso en Tarabuco, trabajo con líderes y traductores en colonias menonitas, apoyo de la OPS con financiamiento de Canadá. Fuente: https://eju.tv/?p=4850740 [S12]; declaración de la OPS: https://www.lostiempos.com/node/657204 [S13]. No hay costos publicados en la fuente.
3. **Brote de dengue 2023 en Santa Cruz (Bolivia).** 8.895 casos y 29 muertes al 21/02/2023, con eliminación de criaderos y brigadas. Fuente: https://www.lostiempos.com/actualidad/pais/20230221/bolivia-se-reportan-8895-casos-dengue [S11].
4. **Reducción de mortalidad materna: Bono Juana Azurduy y Mi Salud (Bolivia).** El Ministerio de Salud (2016) los consideraba programas estrella; la OPS/OMS Bolivia también les atribuía progreso. Fuente: https://www.lostiempos.com/actualidad/nacional/20161212/bolivia-pais-mas-mortalidad-materna-region [S10]. No encontré una evaluación de impacto abierta con cifras; existe una de UDAPE/BID 2015 que no abrí.
5. **Sistema Único de Salud y primer nivel (Bolivia).** Marco legal (Ley 1152) y diagnóstico de la Defensoría: https://www.lexivox.org/norms/BO-L-N1152.html [S7]; informe defensorial (PDF): https://www.defensoria.gob.bo/uploads/files/informe-defensorial-limites-en-la-implementacion-del-sistema-unico-de-salud.pdf [S8].
6. **Latinoamérica:** no abrí un caso fuera de Bolivia con evidencia suficiente. Los ejemplos de Perú (trastuzumab y presupuesto) y de Zambia/Kenia (umbrales) citados en S3 y S4 son útiles para enseñar el límite de los umbrales, pero son de otros contextos.

---

## 8. Fuentes numeradas con nivel

Nivel A = libro, paper, organismo, manual universitario o norma. B = consultora, reporte sectorial, prensa. C = blog, práctica. "Leída" significa que accedí al texto. Todas las fuentes de esta tabla fueron abiertas.

| N.º | Fuente | Nivel | Qué leí | Enlace |
|-----|--------|-------|---------|--------|
| S1 | Ernesto Cohen y Rodrigo Martínez, *Manual: Formulación, evaluación y monitoreo de proyectos sociales*, CEPAL, División de Desarrollo Social (el archivo se llama Manual_dds_200408; año no confirmado) | A, leída | Texto extraído del PDF: costo por unidad de producto, matriz costo-impacto, CUI, ITP, ejemplo de atención primaria con tres alternativas | https://dds.cepal.org/redesoc/archivos_recursos/242/Manual_dds_200408.pdf |
| S2 | Pedro Belli y otros, *Economic Analysis of Investment Operations: Analytical Tools and Practical Applications*, World Bank Institute (la taxonomía del proyecto registra "first printing January 2001" y ISBN 0821348507 de una ficha de biblioteca; yo no abrí esa ficha) | A, leída | Texto extraído: glosario (DALY, HYLG), capítulo 7 (caveats de costo-efectividad ponderada), capítulo 9 (ejemplo de inmunización, tabla 9.6, descuento, valor de la vida, QALY) | https://documents1.worldbank.org/curated/en/792771468323717830/pdf/298210REPLACEMENT.pdf |
| S3 | Bertram MY y otros, "Cost-effectiveness thresholds: pros and cons", *Bulletin of the World Health Organization* 2016;94(12):925-930 (referencia confirmada en la búsqueda) | A, leída (PMC) | Texto: definición, regla 1x/3x PIB, críticas, ejemplos de países | https://pmc.ncbi.nlm.nih.gov/articles/PMC5153921/ |
| S4 | Marseille E, Larson B, Kazi DS, Kahn JG, Rosen S, "Thresholds for the cost-effectiveness of interventions: alternative approaches", *Bulletin of the World Health Organization* 2015;93(2):118-124 (referencia confirmada en la búsqueda) | A, leída (PMC) | Texto: críticas, ejemplo de Zambia, tablas de ligas | https://pmc.ncbi.nlm.nih.gov/articles/PMC4339959 |
| S5 | Scott D. Grosse, Donald J. Lollar, Vincent A. Campbell y Mary Chamie, "Disability and Disability-Adjusted Life Years: Not the Same", *Public Health Reports* 2009;124(2):197-202 | A, leída (PMC) | Texto: DALY = YLL + YLD, pesos, críticas | https://pmc.ncbi.nlm.nih.gov/articles/PMC2646475 |
| S6 | "Achievements and Challenges upon the Implementation of a Program for National Control of Congenital Chagas in Bolivia: Results 2004-2009", *PLoS Neglected Tropical Diseases* (según resultado de búsqueda; autores no verificados por mí) | A, leída (PMC) | Texto: cobertura, seguimiento, tratamiento, desafíos | https://pmc.ncbi.nlm.nih.gov/articles/PMC3708826/ |
| S7 | Bolivia, Ley N.º 1152 del 20 de febrero de 2019 (reproducción en LexiVox, sitio no oficial) | A (norma), leída | Objetivo, cobertura, financiamiento y competencias, primer nivel | https://www.lexivox.org/norms/BO-L-N1152.html |
| S8 | Defensoría del Pueblo de Bolivia, Informe Defensorial "Límites en la implementación del Sistema Único de Salud" (año no confirmado; menciona gestión 2021 y la investigación de 2019) | A (organismo), leída parcialmente | Resumen y hallazgos sobre primer nivel (72 de 126 centros, 79% sin acreditación), medicamentos, personal; no leí el informe completo | https://www.defensoria.gob.bo/uploads/files/informe-defensorial-limites-en-la-implementacion-del-sistema-unico-de-salud.pdf |
| S9 | UNICEF Bolivia, comunicado del 19/12/2019 sobre el estudio temático de nutrición del INE (EDSA 2016) | B | Desnutrición crónica 16%, anemia 53,7%, metas PDES | https://www.unicef.org/bolivia/comunicados-prensa/bolivia-con-dificultades-para-cumplir-metas-en-nutrici%C3%B3n-de-ni%C3%B1os-y-mujeres |
| S10 | Los Tiempos, "Bolivia, país con más mortalidad materna en la región", 12/12/2016 | B (prensa) | Cifras (160, 206, 235), causas, programas | https://www.lostiempos.com/actualidad/nacional/20161212/bolivia-pais-mas-mortalidad-materna-region |
| S11 | Los Tiempos, "En Bolivia se reportan 8.895 casos de dengue", 21/02/2023 | B (prensa) | Casos, muertes, regiones, respuesta | https://www.lostiempos.com/actualidad/pais/20230221/bolivia-se-reportan-8895-casos-dengue |
| S12 | eju.tv, nota sobre el brote de sarampión en Bolivia (28/12/2025) | B (prensa) | Casos, esquema acortado, obstáculos, respuesta | https://eju.tv/?p=4850740 |
| S13 | Los Tiempos, declaraciones de la asesora de la OPS sobre sarampión (6/7/2025) | B (prensa) | Tres pilares de respuesta, situación regional | https://www.lostiempos.com/node/657204 |
| S14 | El Día (Bolivia), nota por el Día Mundial del Chagas (19/4/2025) | B (prensa) | Cifras de Chagas, tamizaje 2024, vector | https://www.eldia.com.bo/2025-04-19/tag/chagas-la-enfermedad-silenciosa-que-la-mitad-de-los-afectados-no-sabe-que-tiene.html |

Conteo: 14 fuentes. Nivel A con texto leído: S1, S2, S3, S4, S5, S6 (6 de paper/manual/libro) más S7 y S8 (norma y organismo del Estado; S8 solo parcialmente). Se cumple el mínimo de 8 fuentes y 4 de nivel A leídas.

Fuentes que solo vi en resultados de búsqueda (no cuentan como leídas): ver sección 9.

---

## 9. No confirmado

1. **Umbral y PIB per cápita de Bolivia**: no busqué el dato; hace falta para aplicar la regla 1x/3x (y las propias fuentes la critican).
2. **Tasa de descuento social recomendada** y valores de los ponderadores de AVAD/AVAC para Bolivia. S2 explica el porqué del descuento, pero no leí una tasa.
3. **Pérdidas de vacunas por cadena de frío**: la búsqueda arrojó un estudio de Perú (2020, SciELO, 84% de equipos funcionales), un caso de Papúa Nueva Guinea (55% de dosis desperdiciadas en una campaña) y otro de Brasil, pero **no pude abrir** el PDF (error 403) ni verifiqué esas cifras. No las uso como fuente en el documento.
4. **Costo por niño completamente vacunado** (Gavi/OMS): no lo encontré.
5. **Guía de la OMS 2021 sobre retención de personal rural**: confirmé en su página que existe (6 de mayo de 2021, 152 páginas, ISBN 978-92-4-002424-3) y su alcance. No leí las recomendaciones. Lo que dice la búsqueda sobre "paquete de incentivos, recomendación fuerte, evidencia de baja certeza" lo vi solo en un resumen, no en el texto.
6. **Cifras actuales de Bolivia**: desnutrición crónica (EDSA 2023), mortalidad materna actual, mortalidad infantil (un resultado de búsqueda dice 20 por mil en 2022-2023, no abierto), cobertura de pentavalente. Las cifras de sarampión de 2023 (cobertura de 50% con dos dosis, según una nota de Cadena 3 que no abrí) no se usan en el documento.
7. **Totales de casos de sarampión 2025**: las fuentes difieren (161, 237, más de 500, 597); no pude reconciliarlas.
8. **Bono Juana Azurduy**: el monto (hasta Bs 1.820 en 33 meses) viene de un resumen de búsqueda del decreto, no abierto. La evaluación de UDAPE/BID 2015 no la abrí; una nota del PNUD citó un efecto de 9,51 puntos porcentuales en el parto institucional para otro programa, que no atribuyo al Bono.
9. **Sistema de inversión pública en Bolivia (SIPFE, Reglamento Básico de Preinversión, RM 115/2015)**: la búsqueda indica que existe y que un documento del BID lo califica de desactualizado en metodología de evaluación; no abrí el reglamento, así que no sé si exige costo-efectividad para proyectos de salud (tipo social), ni cómo se llama la modalidad para proyectos sin ingreso. Tampoco confirmé las competencias entre SEDES, gobernaciones y municipios; la Ley 1152 que leí no menciona a las gobernaciones para el financiamiento del primer nivel.
10. **SROI y VAN social**: SROI lo describo según la taxonomía del proyecto, sin haber abierto la guía del Cabinet Office. VAN social en Bolivia: no confirmé.
11. **Fórmulas reconstruidas de memoria**: cobertura, cobertura efectiva, casos evitados, costo por caso evitado, dosis perdidas, adherencia, ICER, YLL, brecha de última milla. Concuerdan con las ideas de las fuentes pero no las cité textualmente.
12. **Libros de referencia** (Drummond y otros, Gold y otros, Haddix) los conozco por memoria; no confirmé catálogo, por eso no los cito.
13. **Las magnitudes de las situaciones** marcadas "estimación".
14. Año de publicación exacto de S1, autores de S6 y año del informe de S8.
15. **Mi Salud, SAFCI, SEDES y programas del Ministerio de Salud**: los conozco solo por lo que mencionan S7 y S10; no abrí páginas oficiales.

---

## 10. Cifras que necesitan validación local

| Cifra | Estado | Quién podría aportarla |
|-------|--------|------------------------|
| PIB per cápita de Bolivia y umbral de referencia que usarán docentes | No buscado | INE, Banco Central de Bolivia, docente de economía de la salud |
| Incidencia anual y letalidad por enfermedad (dengue, Chagas, sarampión, neumonía, diarrea) en cada región | Parcial (dengue 2023, Chagas) | Ministerio de Salud y Deportes (SNIS-VE), SEDES |
| Eficacia de intervenciones (vacunas, benznidazol, rociado) y cobertura mínima para evitar brotes | No incluida | Ministerio de Salud, OPS/OMS Bolivia, PAI |
| Pesos de discapacidad y duración por enfermedad para el cálculo de AVAD | No incluida | OPS/OMS (Carga Global de Enfermedad), docente de salud pública |
| Costo de una dosis, costo de entrega por niño y costos operativos por brigada en Bolivia | No encontrado | PAI, SEDES, OPS (fondo rotatorio), cooperantes |
| Pérdida de dosis y fallas de cadena de frío en Bolivia | No encontrado | PAI nacional y departamental |
| Rotación y vacantes de personal rural; incentivos vigentes | No encontrado | Ministerio de Salud (RRHH), SEDES, colegios médicos |
| Magnitudes de caída de cobertura, aumento de costo y duración de eventos en las situaciones S-1 a S-15 | Estimación | Docente de la materia, SEDES, responsables de PAI y de programas municipales |
| Rango de aportes de contraparte municipal y cumplimiento de la Ley 1152 | Parcial | Gobiernos municipales, Ministerio de Economía, Defensoría |
| Cobertura de vacunación vigente (pentavalente, sarampión) por departamento | No confirmada | PAI, OPS/UNICEF (estimaciones oficiales) |
| Mortalidad materna e infantil, desnutrición crónica vigentes | Cifras de 2011 a 2016 en fuentes abiertas | INE (EDSA 2023), Ministerio de Salud |
| Porcentaje de población rural dispersa sin acceso y costo de última milla | S6 da ~37% en municipios endémicos, solo para ese contexto | INE, SEDES, Ministerio de Salud |
| Requisitos del sistema de inversión pública para proyectos sociales | No abierto | Ministerio de Planificación del Desarrollo, docente |
