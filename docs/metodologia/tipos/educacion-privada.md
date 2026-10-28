# Educación y formación con cobro (colegios privados, institutos, academias, universidades privadas): ficha metodológica para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que yo la abrí y leí (el alcance de lo leído está en esa sección).
- Todo lo que no lleva [Sn] es **interpretación mía** (cómo traducirlo a un simulador). No es cita.
- Una magnitud marcada **(estimación)** la puse yo para que el simulador tenga un orden de magnitud razonable; no viene de una fuente. Una magnitud con [Sn] viene de esa fuente, en su contexto (otro país, otro nivel educativo, otra fecha), así que tampoco es un parámetro "verdadero" para tu proyecto.
- Cuando una cifra la dice una parte interesada (por ejemplo, la asociación de colegios privados), lo aclaro: es una afirmación, no un dato verificado.
- Lo que no pude verificar está en la sección 9. Las magnitudes que necesitan validación local están en la sección 10.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto de educación con cobro vende formación a cambio de matrícula y pensiones (colegio privado, instituto técnico, academia, curso de capacitación, universidad privada). Cobra por **cohorte de alumnos** y por **cupo**: la aula, el docente y el laboratorio tienen capacidad limitada, y cada alumno que se queda paga durante muchos meses (años, en un colegio).

**Cómo aporta valor.** Hay dos valores distintos que conviene separar:

1. **Valor para el alumno y la familia.** La educación se compra como inversión. La literatura de retornos de la educación estima, con una base de 1.120 estimaciones en 139 países, que un año extra de escolaridad rinde en promedio alrededor de 9% al año en ingresos privados, estable por décadas; en América Latina y el Caribe el promedio regional es de 11,0% [S3]. Para educación superior, el retorno privado promedio es de 15,8% y el social de 10,5% (promedios mundiales) [S3]. Esto sirve para entender por qué una familia acepta pagar: compara lo que paga y lo que deja de ganar mientras estudia contra lo que ganará después [S3].
2. **Valor para el dueño del proyecto.** Es un negocio de ingresos recurrentes por cohorte, con costos muy rígidos (docentes, edificio) y capacidad fija. Una universidad privada multinacional que cotiza en bolsa describe lo mismo: programas de cuatro a cinco años que dan visibilidad de ingresos, casi todo cobrado de forma privada (sin crédito estudiantil estatal) y una retención histórica de 79% anual [S8]. En un colegio, la lógica es la misma pero con pensión regulada por el Estado en Bolivia (ver sección 5).

**Qué lo hace distinto para un simulador.** El motor genérico (caja, ingresos, costos, reputación) no captura cuatro rasgos de este tipo:

- **Calendario.** El ingreso no es parejo: en Bolivia las unidades educativas privadas cobran "diez pensiones anuales" [S10], mientras la planilla docente corre todo el año (esto último es interpretación mía; ver sección 9). Las inscripciones se concentran en pocos días de enero [S20].
- **Cohortes que se pierden.** El alumno que se va deja un cupo que en muchos casos no se vuelve a llenar a mitad de año (en la universidad, Laureate lo señala como riesgo: las transferencias entre universidades no son comunes en algunos mercados, así que es menos probable reponer a quien abandona [S8]).
- **Precio intervenido.** En colegios privados bolivianos el Ministerio de Educación fijó tope, congeló o prohibió el aumento de la pensión según el año [S10, S11, S12, S13, S14]. La pensión no es una variable libre del alumno-empresario.
- **Costo docente que sube por decreto o por salario mínimo, aunque la pensión no pueda subir** [S14, S19].

---

## 2. Indicadores propios y cómo se calculan

Convención: **mes t**. Marco qué parte viene de fuente y qué parte es fórmula mía (la mayoría de los indicadores operativos de un colegio no los encontré en una fuente abierta; ver sección 9).

### 2.1 Indicadores de volumen y capacidad

| Indicador | Qué es | Fórmula | Fuente |
|---|---|---|---|
| **Matriculados** | Alumnos que pagan en el mes | Matriculados al inicio + inscripciones - retiros - egresados | Definición básica (mía) |
| **Ocupación de cupos** | Qué parte de la capacidad se está usando | Matriculados / (aulas x alumnos máximos por aula) | Fórmula mía. El tope máximo para universidades privadas es 50 estudiantes por aula teórica y 25 en laboratorio o taller; si se pasa, hay que abrir un grupo paralelo [S2, art. 48] |
| **Alumnos por grupo** | Tamaño efectivo del curso | Matriculados del curso / grupos abiertos | Mía |
| **Alumnos por docente** | Carga docente | Matriculados / docentes equivalentes a tiempo completo | Mía |
| **Punto de equilibrio en alumnos** | Alumnos mínimos para no perder | Costos fijos mensuales / (pensión neta mensual - costo variable por alumno) | Fórmula estándar de costos; mía |
| **Grupo mínimo viable** | Alumnos mínimos para abrir un curso o paralelo | Costo del grupo (docente + aula + materiales) / pensión neta por alumno | Mía |

Por qué importa el **grupo mínimo**: el docente se paga igual con 12 que con 30 alumnos. La carrera o el curso con pocos inscritos suele perder plata aunque "tenga alumnos".

### 2.2 Indicadores de retención y deserción

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Retención anual** | Estudiantes del año anterior que regresan este año (sin contar a los que se gradúan) / estudiantes del año anterior (sin graduados) | Definición de Laureate: "proportion of prior year students returning in the current year (excluding graduating students)". Promedio histórico de 79% en cinco años, en Perú y México [S8] |
| **Deserción intersemestral** | Estudiantes que no vuelven a matricularse en el semestre siguiente / estudiantes del semestre | Definición operativa de la UCB: "proporción intersemestral de estudiantes que no vuelven a matricularse en un periodo académico actual" [S5] |
| **Deserción como balance** | Matrícula del primer período - egresados del período + reintegrados en el siguiente | Definición citada en el artículo de la UAJMS (Tarija) [S6] |
| **Tipos de deserción** | Intra-semestral (retiro en el semestre), inter-semestral (no vuelve), parcial (se presume regreso), total, institucional (deja esa universidad) y del sistema (deja toda la educación superior) | [S6], citando el glosario de RIACES |
| **Deserción acumulada de cohorte** | 1 - (alumnos de la cohorte que siguen / alumnos que entraron) | Mía. Dato de contexto: el artículo de Tarija cita un estudio de 2005 de universidades públicas bolivianas donde, para Derecho, Medicina e Ingeniería Civil, la deserción específica llegaba a 50-60% y la titulación solo a 19-27% [S6]. Es cita de segunda mano, de universidades públicas y de hace veinte años |

Magnitud observada en Bolivia con la medición intersemestral: en tres carreras de la UCB Cochabamba, la deserción fue de 2,17% (semestre I-2020) y 0,49% (II-2020) en una; 3,91% y 0,83% en otra; 1,07% y 1,36% en la tercera, durante la pandemia y con becas de hasta 60% como política de retención [S5]. No es un promedio nacional ni de colegios.

**Diferencia clave colegio vs. universidad.** En un colegio, la deserción es baja mientras el alumno está dentro y el riesgo mayor es **no volver a inscribirse el año siguiente** (pasar a un colegio fiscal o a otro privado). En la universidad, el abandono es gradual y se concentra entre el primer y el sexto semestre [S6].

### 2.3 Indicadores de ingreso, costo y cobranza

| Indicador | Fórmula | Fuente |
|---|---|---|
| **Ingreso por alumno (ARPU)** | Ingreso del período / alumnos promedio del período | Mía. Laureate descompone el crecimiento de ingresos en "matrícula promedio" (+US$ 92,4 millones en 2025) y "mezcla de programas, precios y momento" (+US$ 40,5 millones) [S8]; esa separación (cantidad vs. precio) es la correcta para el simulador |
| **Costo docente sobre ingresos** | Planilla docente / ingresos por pensiones | Mía. Una afirmación de la asociación de colegios privados (Andecop, 2016): "70% de las pensiones se destina a sueldos y 30% a infraestructura" [S14]. Es afirmación de parte interesada, no auditada |
| **Morosidad de pensiones** | Pensiones vencidas no cobradas / pensiones facturadas | Mía. No encontré una cifra boliviana de morosidad (sección 9) |
| **Cartera por cobrar** | Acumulado de pensiones vencidas no cobradas | Mía |
| **Becas** | Becas otorgadas / matrícula anual | Las universidades privadas deben conceder becas equivalentes al 10% de su matrícula anual [S2, art. 16] |
| **Ingreso de caja vs. ingreso devengado** | Cobros del mes vs. pensión que corresponde al mes | Mía. En colegio, si se cobran 10 pensiones y se pagan 12 meses de sueldo, hay dos meses de caja sin ingreso |
| **Margen operativo de referencia** | EBITDA ajustado / ingresos | Laureate (Perú y México) reportó 30,5% en 2025 (US$ 518,9 millones sobre US$ 1.701,9 millones), 39,9% en Perú y 26,1% en México; son cálculos a partir de las cifras del 10-K, y corresponden a una operación multinacional de escala, no a un colegio o instituto boliviano [S8] |

### 2.4 Indicadores de retorno de la educación (lado del alumno)

El alumno (y su familia) decide si paga mirando su propio retorno. Dos métodos de la literatura [S3]:

- **Método de descuento completo:** la tasa de retorno es la que iguala el valor de los ingresos de toda la vida del individuo con el valor actual de los costos de estudiar. Los costos privados son los **ingresos que deja de ganar mientras estudia más las pensiones y gastos**; el beneficio es lo que gana de más frente a quien tiene el nivel inmediato anterior [S3].
- **Función de ingresos de Mincer:** el coeficiente de los años de escolaridad en una regresión del logaritmo del ingreso es el retorno por año extra. La forma exacta de la ecuación la **reconstruyo de memoria**, no la leí en el texto; el paper solo dice que se usa el coeficiente de años de escolaridad de la función de Mincer [S3]. El mismo paper aclara que los retornos de Mincer y de descuento completo "no son directamente comparables" porque difieren en escala [S3].

Uso en el simulador: no es un indicador del dueño del proyecto sino un **techo de lo que la familia puede considerar razonable pagar** (sección 3). Los valores de [S3] son promedios internacionales; no hay estimación de retorno por carrera ni por colegio para Bolivia en las fuentes que abrí.

---

## 3. Cómo se evalúa económicamente: qué complementa o reemplaza al VAN y la TIR clásicos

**Resumen.** El VAN y la TIR siguen siendo la base (hay inversión inicial en edificio, aulas y laboratorios, flujos de varios años y valor residual). Pero el flujo no puede ser "ingresos anuales planos", y la evaluación no debería ignorar tres cosas: (a) los ingresos vienen de cohortes que se van gastando, (b) la pensión puede estar intervenida, (c) el calendario de cobros y pagos no coincide.

**Por qué el flujo plano falla en este tipo:**

1. **Los ingresos dependen de la matrícula futura, que depende de la retención.** Un colegio que pierde 5 puntos de reinscripción cada año no se nota el primer año; se nota en el año 4. El VAN con matrícula constante no tiene sensibilidad a lo que más importa (interpretación mía, coherente con [S8], donde la retención de 79% es una métrica central de la compañía).
2. **Capacidad fija y costos rígidos.** Una vez construida el aula y contratado el docente, agregar el alumno 25 de un grupo cuesta casi nada, y quitar el alumno 5 del grupo duele. El punto de equilibrio en alumnos pesa más que el margen promedio.
3. **Precio regulado.** En colegios privados bolivianos el Ministerio fijó un tope (4,3% para 2016, 4% para 2019), luego prohibió el aumento (2024) y congeló las pensiones en la inscripción de 2026 [S10, S11, S13, S14]. Un VAN con "pensión sube con la inflación" supone algo que la norma ya negó en años recientes, con inflación de 20,40% en 2025 [S18]. La sensibilidad al escenario regulatorio debe estar en el análisis.
4. **Estacionalidad y capital de trabajo.** Diez pensiones de cobro frente a doce meses de costo (interpretación mía) obligan a tener caja para los meses sin ingreso. El propio conflicto entre colegios y Ministerio por "no pagar la mensualidad de febrero" [S16] muestra que el calendario de cobro es parte del riesgo.
5. **Valor residual dudoso.** Si el proyecto tiene terreno y edificio propios, el valor residual es el inmueble; si alquila, el valor residual es la **marca, la matrícula y la autorización de funcionamiento**, que dependen del Estado (en universidades, la apertura se autoriza por decreto supremo y la autorización puede revocarse o cerrarse la carrera tras dos evaluaciones desfavorables consecutivas [S1 art. 59; S2 arts. 28, 67]).

**Qué agregar al análisis:**

| Complemento | Qué responde | Fuente |
|---|---|---|
| VAN por cohorte (flujo de cada grupo que ingresa, con su retención) | Cuánto vale cada tanda de alumnos que consigo | Mía; coherente con la retención de [S8] |
| Punto de equilibrio en alumnos y grupo mínimo | Cuántos alumnos necesito para no perder | Fórmula estándar |
| Flujo de caja mensual con estacionalidad (cobros en 10 meses, pagos en 12) | Cuánto capital de trabajo hace falta | Interpretación mía; las plantillas del simulador ya traen un colchón de caja |
| Escenarios regulatorios de pensión (tope, congelamiento, libre) | Cuánto aguanta el proyecto si la pensión no sube | [S10, S11, S13, S14] |
| Retorno privado para el alumno (descuento completo o Mincer) | Si el precio es defendible frente al beneficio que recibe la familia | [S3] |
| Sensibilidad a retención, grupo mínimo, morosidad y costo docente | Cuál palanca pesa más | Mía |
| Costo por alumno graduado (no por alumno inscrito) en universidades | Qué cuesta realmente producir un egresado cuando la deserción es alta | Interpretación mía a partir de [S6] |

**Lo que no hay que hacer:** comparar el margen de Laureate (30,5%) con un colegio boliviano regulado; son modelos distintos (escala, mercado, precio libre) [S8].

---

## 4. Errores típicos de estudiantes y de emprendedores en este tipo

Nota de método: no encontré un estudio sobre errores de estudiantes bolivianos en proyectos educativos. La lista mezcla lo que dicen las fuentes (marcado) con práctica común o interpretación mía (sin marca).

**Errores de cálculo (estudiantes)**

1. **Ingreso = cupos x pensión x 12 meses.** En colegios privados bolivianos las pensiones anuales son diez, y la norma prohíbe cobros adicionales como reserva de plaza, matrícula o material [S10].
2. **Ocupación al 100% desde el primer año.** Un colegio nuevo no llena todas las aulas el primer año; además, la reinscripción nunca es 100% (retención histórica de 79% en universidades privadas de Laureate [S8]).
3. **Pensión que sube con la inflación.** Los Gobiernos fijaron topes y congelamientos [S10, S11, S13, S14].
4. **Costo docente fijo por alumno.** El costo docente es por grupo, no por alumno; y sube con el salario mínimo (que subió 20% para 2026 [S19]).
5. **Olvidar el grupo mínimo.** Abrir un curso con pocos alumnos.
6. **No separar deserción de cohorte.** Un solo porcentaje "de deserción" para todos los semestres; en la universidad se concentra entre el primer y el sexto semestre [S6].
7. **Ignorar la morosidad y las becas.** Las universidades privadas deben dar becas equivalentes al 10% de su matrícula anual [S2, art. 16].
8. **Calcular el retorno de la educación sobre el ingreso bruto.** El retorno del alumno incluye lo que deja de ganar mientras estudia [S3].
9. **Subestimar la inversión regulatoria.** En universidades, la autorización exige título de propiedad a nombre de la entidad, estudios de factibilidad, docentes y equipamiento [S2, art. 29].

**Errores de emprendedores**

1. **Abrir con infraestructura sobredimensionada** y esperar a que la demanda llegue.
2. **Subir la pensión sin autorización** cuando el Ministerio la congeló: la resolución de 2016 preveía multa de 10% del ingreso anual en la primera infracción y 20% en reincidencia [S14]; la norma vigente puede ser distinta (sección 9).
3. **Cobrar extras prohibidos** (matrícula, reserva de plaza, material) [S10].
4. **Depender de una sola vía de captación** (inscripciones de enero) sin plan para el resto del año.
5. **Prometer a padres que la pensión no sube y firmar contratos con cláusulas de aumento.** Las asociaciones de padres denunciaron colegios que incluían cláusulas de aumento y presionaban a los padres [S10].
6. **No mirar por qué se van los alumnos universitarios.** En la UTEPSA, el abandono se explica sobre todo por la necesidad de trabajar y la dificultad para pagar la colegiatura, no por quejas del servicio [S4].
7. **No tener plan para docentes que se van a la competencia** (interpretación mía).
8. **Pensar que acreditar es gratis o automático.** En Bolivia no existe una agencia nacional de acreditación consolidada; las universidades buscan acreditación internacional (ARCU-SUR) [S7].

---

## 5. SITUACIONES PARA LA SIMULACIÓN

Formato: nombre; qué pasa; variables que mueve (con dirección y magnitud; **(fuente)** o **(estimación)**); decisiones posibles con ventajas y costos; qué aprende el alumno.

Las magnitudes de las fuentes vienen de contextos específicos (a veces de otros países). Las marcadas "estimación" son mías y conviene calibrarlas con un colegio, instituto o universidad real antes de implementarlas.

Nota general: las situaciones 1 a 4 y 12 aplican sobre todo a **colegios privados**; la 7, 8, 9 y 10 a **universidades e institutos**; las demás sirven para ambos.

---

### Situación 1. El Ministerio congela o prohíbe el aumento de la pensión

**Qué pasa.** Al inicio de la gestión el Ministerio de Educación decide que las pensiones de los colegios privados no suben. En 2016 fijó un tope de 4,3% (inflación del año previo: 2,95%) [S14]; en 2019, 4% (inflación de 2018: 1,51%) [S13]; en 2024, la Resolución Ministerial 0001/2024 prohibió cualquier aumento y cobros adicionales a las diez pensiones anuales [S10]; en 2026, la RM 001/2026 congeló las pensiones durante la inscripción y previó que en abril una comisión mixta (Ministerio de Educación, Ministerio de Economía y la asociación de colegios) analice un posible incremento [S11]. La asociación (Andecop) respondió que cada colegio evaluaría su "costo educativo" [S11].

**Variables que mueve.**
- Pensión mensual: no sube (0% en 2024; tope 4% a 4,3% en años anteriores) **(fuente)**.
- Margen: baja si los costos suben más que la pensión. Con inflación de 20,40% en 2025 [S18] y salario mínimo +20% [S19], la brecha puede ser de más de diez puntos **(cálculo mío a partir de las fuentes)**.
- Riesgo de sanción: sube si el alumno decide subir igual (multa de 10% del ingreso anual en 2016, 20% en reincidencia **[S14]**).
- Reputación frente a los padres: baja si se sube por fuera de la norma.

**Decisiones del alumno.**
1. *Cumplir y absorber el congelamiento (mantener la pensión).* Ventaja: cero riesgo legal y cero fuga de alumnos por precio. Costo: el margen se erosiona cada mes; si la inflación sigue alta, hay que recortar costos o gastar reservas.
2. *Subir igual por "acuerdo interno" con los padres.* Ventaja: protege el margen. Costo: la autoridad invitó a los padres a denunciar el incremento [S10]; riesgo de multa y de perder alumnos; la asociación de padres denunció presiones de colegios sobre las familias [S10].
3. *Mantener la pensión y recortar gasto (menos horas de docente contratado, paralelos más grandes, mantenimiento postergado).* Ventaja: ahorro inmediato. Costo: baja la calidad percibida y la reputación; el Gobierno exige "cupos reducidos" y calidad según la asociación [S14], por lo que recortar puede abrir otro problema.
4. *Mantener la pensión y construir ingresos permitidos fuera de la pensión (talleres extracurriculares opcionales, alquiler de espacios, cursos de verano).* Ventaja: no toca la pensión. Costo: requiere capacidad ociosa y esfuerzo de gestión; hay que verificar que el cobro no sea de los prohibidos (reserva, matrícula, material) [S10].

**Qué aprende.** Que cuando el precio lo fija o limita el Estado, la ventaja competitiva pasa a ser la estructura de costos, y que el riesgo regulatorio es un riesgo del proyecto, no del entorno lejano.

---

### Situación 2. Alza del salario mínimo y de la planilla con pensión fija

**Qué pasa.** El Gobierno sube el salario mínimo nacional 20% (de Bs 2.750 a Bs 3.300) desde enero de 2026 [S19]. La asociación de colegios sostiene desde hace años que las pensiones deberían subir igual que el salario que acuerda el Gobierno (en 2018 el incremento fue de 5,5% y la pensión subió 4% en 2019 [S13]; en 2015, las pensiones subieron 4% y los salarios 8,5% según la asociación [S14]). El caso 2026 es más fuerte: además de congelar la pensión, la inflación de 2025 fue de 20,40% [S18].

**Variables que mueve.**
- Costo de planilla: sube. El piso del personal que gana cerca del mínimo sube 20% **(fuente)**. El efecto sobre la planilla total depende de cuánta gente está cerca del mínimo y de cuánto se ajusten los demás sueldos (estimación: +8% a +15% de la planilla total).
- Margen: baja si la pensión está congelada.
- Rotación de docentes: baja si se ajusta; sube si no se ajusta y la competencia sí lo hace (estimación).

**Decisiones del alumno.**
1. *Ajustar la planilla completa (todos los sueldos).* Ventaja: estabilidad del equipo y menos rotación. Costo: la caja se tensa de inmediato; sin alza de pensión se come las reservas.
2. *Ajustar solo hasta el mínimo y negociar el resto.* Ventaja: cumple la norma al menor costo. Costo: docentes con experiencia pueden sentirse castigados y buscar otro colegio.
3. *Reducir horas de contrato o contratar menos personal de apoyo.* Ventaja: contiene el gasto. Costo: sobrecarga y menor calidad.
4. *Pedir un aumento de pensión a la comisión (en caso 2026, la comisión de abril) con datos de costos.* Ventaja: es el camino institucional; puede traer un aumento autorizado. Costo: el resultado es incierto y la decisión llega meses después de que subieron los costos.

**Qué aprende.** Que el costo docente es el mayor costo del proyecto, que se mueve por decreto, y que hay que tener un plan para el mes en que sube el costo y el ingreso no.

---

### Situación 3. Inflación alta y familias que pasan al colegio fiscal

**Qué pasa.** Con inflación de dos dígitos, una parte de las familias deja de poder pagar un colegio privado. No encontré cifras bolivianas recientes de migración de privado a fiscal. En la pandemia, el Ministerio registró que la matrícula en unidades educativas privadas cayó 13,1% en 2021 mientras la fiscal creció 1,9% [S9]. En la región: en Bogotá, 19.120 estudiantes pasaron de privados a públicos entre el cierre de 2019 e inicio de 2020 y unos 4.371 entre marzo y septiembre de 2020 [S21]; en Paraguay, el ministro informó unos 45.000 alumnos más en colegios públicos en 2026 por migración desde privados, frente a movimientos habituales de 1.500 a 2.000 [S22].

**Variables que mueve.**
- Reinscripciones de enero: bajan (estimación: -3% a -10% de la matrícula del año anterior en un año de shock; la referencia es -13,1% en pandemia **[S9]**, un caso extremo).
- Altas nuevas: bajan (estimación).
- Morosidad: sube (ver situación 4).
- Pensión promedio efectiva: baja si se dan descuentos.

**Decisiones del alumno.**
1. *Mantener precio y calidad, y aceptar una matrícula menor.* Ventaja: preserva el margen por alumno y el posicionamiento. Costo: aulas con menos alumnos, mayor costo por alumno; riesgo de no llegar al grupo mínimo.
2. *Descuentos por hermanos o por pago adelantado.* Ventaja: retiene familias y mejora caja. Costo: baja el ingreso por alumno; la norma de pensión puede limitar qué cobros son válidos (verificar).
3. *Lanzar un plan de pensión más barata (turno tarde, grupos más grandes, menos servicios).* Ventaja: captura a las familias sensibles al precio. Costo: puede canibalizar el plan regular y diluir la marca.
4. *Reforzar lo que el colegio fiscal no ofrece (idiomas, tecnología, seguimiento).* Ventaja: diferencia. Costo: inversión previa y resultado incierto.

**Qué aprende.** Que la demanda de educación privada es sensible al ingreso de las familias y que el colegio fiscal es el sustituto de referencia.

---

### Situación 4. Morosidad de pensiones

**Qué pasa.** Algunas familias dejan de pagar. Los colegios sostienen que las pensiones son su único ingreso y deben pagar salarios (afirmación de Andecop en abril de 2020 [S17]). En 2020 el Ministerio y Andecop acordaron reprogramar pagos para familias afectadas por la cuarentena [S17]. En 2022 el Ministerio llegó a pedir a los padres que no pagaran la mensualidad de febrero mientras no hubiera acuerdo sobre el aumento [S16]. No encontré cifras bolivianas de morosidad ni una norma específica sobre qué puede hacer el colegio con el alumno moroso (sección 9).

**Variables que mueve.**
- Cobros del mes: bajan (estimación: la morosidad pasa de 3-5% a 10-20% de las pensiones en un año de crisis).
- Cartera por cobrar: sube.
- Caja: baja; la planilla se paga igual.
- Reputación: baja si el colegio presiona de forma visible.
- Deserción: sube si el colegio retiene documentos o excluye al alumno (el alumno se va).

**Decisiones del alumno.**
1. *Plan de pagos y reprogramación.* Ventaja: recupera parte de lo adeudado y mantiene al alumno. Costo: la caja entra tarde; algunos nunca pagan.
2. *Cobranza firme (avisos, cartas, restricción de servicios no básicos).* Ventaja: reduce morosidad. Costo: conflicto con los padres y riesgo de denuncia o reclamo ante el Ministerio.
3. *Descuento por pago adelantado o por pago puntual.* Ventaja: mejora la caja y reduce la mora futura. Costo: menor ingreso por alumno.
4. *Fondo de becas o ayuda para familias en dificultad.* Ventaja: retiene al alumno y sostiene la reputación. Costo: ingreso que no entra, y puede generar expectativas.

**Qué aprende.** A tratar la cartera por cobrar como parte del capital de trabajo, y que cobrar duro y retener al alumno pueden ser objetivos opuestos.

---

### Situación 5. Clases a distancia obligadas y descuento exigido por el Ministerio

**Qué pasa.** Por una emergencia (pandemia, bloqueos, conflicto) las clases deben pasar a modalidad a distancia o semipresencial. En enero de 2021 el Ministerio presentó una escala de descuentos obligatorios según la modalidad y la mensualidad: con mensualidad de hasta Bs 500: -10% a distancia, -5% semipresencial; de Bs 501 a 1.500: -25% y -15%; de Bs 1.500 o más: -35% y -20%; presencial: 0% [S15]. Mientras tanto, la asociación advertía que el 85% de los colegios privados estarían por cerrar o cambiar de rubro (afirmación de Andecop, abril de 2020, no verificada) [S17].

**Variables que mueve.**
- Ingresos: bajan según la escala **(fuente)**.
- Costos: bajan poco (docentes y planilla siguen; se ahorran servicios y mantenimiento); suben los costos de plataforma, conectividad y capacitación (estimación).
- Calidad percibida: baja (la brecha de acceso a internet afecta más a los hogares vulnerables [S5]).
- Reinscripciones: bajan si la familia percibe que paga lo mismo por menos.

**Decisiones del alumno.**
1. *Aplicar el descuento y volver cuanto antes a la presencialidad.* Ventaja: cumple y recupera el ingreso pleno. Costo: la presencialidad requiere protocolos y puede enfrentar restricciones.
2. *Invertir en plataforma virtual de calidad y mantener la modalidad híbrida.* Ventaja: diferencia frente a quienes improvisan. Costo: inversión sin retorno seguro; el descuento sigue aplicándose.
3. *Pedir reprogramación y flexibilidad a las familias a cambio de compromiso de pago.* Ventaja: reduce la mora. Costo: caja tardía.
4. *Recortar planilla (contratos por horas, reducir personal).* Ventaja: alivia el costo. Costo: pérdida de equipo y reputación docente.

**Qué aprende.** Que una disrupción reduce el ingreso por decisión regulatoria antes que el costo, y que la caja y no el VAN decide quién sobrevive.

---

### Situación 6. Temporada de inscripciones: captar y llenar los grupos

**Qué pasa.** La captación se concentra en pocos días: en 2026, inscripciones del 19 al 23 de enero, con clases desde el 2 de febrero y fin de gestión el 2 de diciembre, 200 días de clase [S20]. El colegio nuevo que no llena el curso no recibe otra oportunidad hasta el año siguiente, salvo traslados. En universidades privadas hay dos o más ingresos al año y, en modelos modulares como el de la UTEPSA, se cursa una materia por mes [S4]. En Laureate, el trimestre 1 es el de matrícula principal en Perú y el 3 en México [S8].

**Variables que mueve.**
- Inscripciones nuevas del año: se definen en pocos días **(fuente: calendario)**.
- Grupos abiertos: dependen del mínimo viable.
- Gasto de captación: ferias, publicidad, becas de ingreso.
- Ocupación de cupos: sube con captación; baja con deserción.

**Decisiones del alumno.**
1. *Invertir fuerte en publicidad y puertas abiertas antes de enero.* Ventaja: más inscripciones el primer año. Costo: gasto fijo inicial; si la inscripción no llega, queda el costo.
2. *Descuento de inscripción para los primeros inscritos.* Ventaja: llena rápido y asegura caja inicial. Costo: menor ingreso por alumno; hay que verificar que sea compatible con la norma de cobros (sección 9).
3. *Abrir menos grupos y cerrar los que no llegan al mínimo.* Ventaja: protege el margen. Costo: se pierde alumnos que no encuentran cupo; reputación de "colegio chico".
4. *Captar por referidos (familias actuales).* Ventaja: menor costo y alumnos con mejor retención (hipótesis de práctica; no la confirmé). Costo: crecimiento lento.

**Qué aprende.** Que la capacidad es fija y la demanda llega por temporada; una captación floja se paga durante todo el año.

---

### Situación 7. El alumno universitario deja de estudiar por necesidad de trabajar

**Qué pasa.** En un estudio con 437 estudiantes que abandonaron una universidad privada de Santa Cruz (UTEPSA), los factores socioeconómicos, en particular la necesidad de trabajar y la dificultad para pagar la colegiatura, fueron los principales motivos de abandono; también aparecieron el desajuste entre la oferta y los horarios de quienes trabajan y la desconexión entre expectativas y realidad de la carrera [S4]. El artículo de la UAJMS en Tarija llega a una conclusión parecida: el factor económico es determinante, seguido de la falta de orientación vocacional, y la deserción ocurre más entre el primer y sexto semestre [S6]. En la UCB Cochabamba, durante la pandemia, becas de hasta 60% (Apoyo Económico Universal) ayudaron a que más de 600 estudiantes se beneficiaran en el primer semestre de 2020 y se llegara a 95% de inscritos en el segundo semestre; igual hubo deserción por causas familiares, económicas, de conectividad, de rendimiento y personales [S5].

**Variables que mueve.**
- Deserción semestral: sube con crisis económica. Referencia de línea base: 0,5% a 4% por semestre en tres carreras de la UCB en 2020 con becas **(fuente [S5])**. En un año de crisis sin ayuda, la cifra del simulador sería mayor (estimación: 5% a 12% por semestre en el primer año de carrera).
- Ingresos: bajan con la matrícula; bajan más con becas.
- Costo de retención (becas, tutorías, horarios flexibles): sube.

**Decisiones del alumno.**
1. *Becas parciales a quienes demuestren necesidad (hasta 50-60%).* Ventaja: retiene alumnos que ya pagaron la captación y evita cupo vacío. Costo: ingreso menor por alumno; riesgo de que alumnos que no la necesitan la pidan.
2. *Horarios nocturnos, sabatinos o modulares para quienes trabajan.* Ventaja: atrae y retiene a un segmento grande. Costo: costo de docentes por turno adicional y menor uso del espacio en horas pico.
3. *Plan de financiamiento propio (pago en cuotas, pago diferido a la titulación).* Ventaja: reduce la causa económica del abandono. Costo: cartera por cobrar y riesgo de impago; sin crédito estatal estudiantil (Laureate señala que en México y Perú casi todo el ingreso es de pago privado [S8]).
4. *Orientación vocacional y tutorías desde el primer semestre.* Ventaja: ataca la causa vocacional. Costo: gasto fijo, resultado lento y difícil de medir.

**Qué aprende.** Que un abandono es ingreso futuro perdido y que la causa principal puede ser externa a la calidad de la institución.

---

### Situación 8. Evaluación externa y acreditación de carreras

**Qué pasa.** En Bolivia las universidades públicas autónomas se rigen por el Sistema de la Universidad Boliviana (SUB) y las privadas dependen del Ministerio de Educación; la Agencia Plurinacional de Evaluación y Acreditación de la Educación Superior Universitaria (APEAESU), prevista en la Ley 070, no se consolidó, y por eso las universidades buscan acreditación internacional (ARCU-SUR) [S7]. Para las privadas, la autoevaluación es obligatoria y se reporta al Ministerio, y el Ministerio puede cerrar carreras tras dos verificaciones desfavorables consecutivas (la tercera notificación es de cierre) [S2, arts. 35, 67]. En el sistema SUB, el reglamento exige informes cada cuatro años con miras a la acreditación [S7].

**Variables que mueve.**
- Costo del proceso: sube (autoevaluación, pares evaluadores, mejoras de infraestructura y de docentes) (estimación).
- Captación: sube si la acreditación se percibe como señal de calidad (hipótesis; no encontré medición boliviana).
- Riesgo de cierre de carrera: baja con evaluación favorable.
- Reputación: sube/baja según el resultado.

**Decisiones del alumno.**
1. *Invertir en acreditación internacional de las carreras principales.* Ventaja: diferenciación y atractivo para estudiantes y empleadores. Costo: gasto alto, años de preparación y requisitos de docentes y laboratorios que elevan el costo fijo.
2. *Cumplir solo con la autoevaluación y verificaciones del Ministerio.* Ventaja: menor costo. Costo: menos diferenciación; riesgo si una verificación sale desfavorable.
3. *Concentrar la acreditación en una carrera bandera.* Ventaja: efecto de marca con menor gasto. Costo: las demás carreras quedan relegadas.
4. *Esperar a que los competidores lo hagan.* Ventaja: ahorro. Costo: pérdida de matrícula frente a quienes ya están acreditados (hipótesis).

**Qué aprende.** Que la calidad certificada es un activo que cuesta y que el regulador puede cerrar un programa.

---

### Situación 9. Requisito de docentes de planta y fuga de docentes clave

**Qué pasa.** La norma de universidades privadas exige que al menos el 10% de los docentes sea de planta a tiempo completo, docentes con grado igual o superior al de la carrera (con tope de hasta dos expertos sin grado por carrera, sin superar el 10% del plantel) y capacitación gratuita de al menos 20 horas académicas por semestre [S2, arts. 68, 70, 71]. Un docente popular puede irse a otra institución que paga más. En colegios, la asociación sostiene que el Gobierno exige docentes capacitados, infraestructura de calidad y cupos reducidos sin dar los medios [S14].

**Variables que mueve.**
- Costo docente: sube al contratar tiempo completo (estimación: un docente de planta cuesta entre 1,5 y 2,5 veces lo que un docente por hora, por la misma carga; depende de la institución).
- Calidad percibida: sube con más docentes de planta.
- Rotación: sube si hay fuga de docentes clave; baja la matrícula de la carrera que dependía de él (estimación).

**Decisiones del alumno.**
1. *Contratar docentes de planta por encima del mínimo.* Ventaja: calidad, continuidad e identidad. Costo: costo fijo alto, menos flexibilidad si baja la matrícula.
2. *Cumplir el mínimo y usar docentes por hora para el resto.* Ventaja: flexibilidad. Costo: dependencia de docentes que tienen otros empleos y pueden irse.
3. *Subir sueldos a los docentes clave para retenerlos.* Ventaja: evita la fuga. Costo: efecto en cadena sobre el resto de la planilla.
4. *Capacitar a los docentes propios y formar reemplazos internos.* Ventaja: menor dependencia a largo plazo. Costo: inversión sin retorno inmediato, y el docente capacitado puede irse igual.

**Qué aprende.** Que el docente es a la vez el costo principal y el activo principal, y que la normativa define un piso de costo fijo.

---

### Situación 10. Competencia virtual o de universidades extranjeras

**Qué pasa.** La Ley 070 dice que las universidades extranjeras que ofrezcan programas en Bolivia, en cualquier modalidad de atención, deben cumplir los requisitos de apertura de las universidades privadas y contar con autorización expresa del Ministerio de Educación, y que para dictar programas en convenio con universidades privadas bolivianas también necesitan autorización expresa [S1, art. 66]. Aun así, la oferta virtual compite por precio y flexibilidad. En Perú, Laureate describe una meta de entre 40% y 60% de las horas-crédito en línea y modelos híbridos que permiten atender a más estudiantes con el mismo espacio físico [S8]; no encontré datos de matrícula virtual en Bolivia ni cuál es la norma vigente sobre programas virtuales (el DS 4260 de 2020 figura como abrogado en una base jurídica que vi solo en buscador, sección 9).

**Variables que mueve.**
- Inscripciones de programas presenciales: bajan en el segmento que valora flexibilidad y precio (estimación: -5% a -15% en esa carrera).
- Precio promedio: presión a la baja.
- Costos de plataforma digital: suben.
- Capacidad física: libera uso del aula si se pasa a híbrido.

**Decisiones del alumno.**
1. *Lanzar una oferta híbrida o virtual propia.* Ventaja: defiende la matrícula y usa menos aula por alumno. Costo: inversión en plataforma y capacitación, y necesidad de autorización ministerial del programa.
2. *Diferenciarse con prácticas, laboratorios y red de contactos.* Ventaja: lo que el virtual no ofrece. Costo: inversión en infraestructura y convenios.
3. *Competir por precio con una pensión menor.* Ventaja: frena la fuga. Costo: erosiona el ingreso de todo el programa.
4. *Alianza con una universidad o plataforma externa.* Ventaja: acceso rápido a contenido y marca. Costo: comisión o dependencia, y la norma exige autorización para convenios [S1, art. 66].

**Qué aprende.** Que la tecnología cambia la capacidad (cuántos alumnos entran con la misma aula) y la competencia, y que la ventaja puede estar en lo presencial o en lo flexible.

---

### Situación 11. Adecuación obligatoria de infraestructura y laboratorios

**Qué pasa.** Cuando la norma cambia, la institución debe adaptarse. El reglamento de universidades privadas de 2012 dio plazos de adecuación: 18 meses para procesos académicos y administrativos, 2 años para el diseño curricular y 5 años para la infraestructura; el Ministerio podía sancionar a las que no se adecuaran [S2, disposiciones transitorias, vía el decreto DS 1433]. También fija máximos de 50 estudiantes por aula teórica y 25 por laboratorio o taller (y obliga a abrir un grupo paralelo si se excede) [S2, art. 48]. Un instituto o universidad con laboratorios insuficientes debe invertir o limitar cupos.

**Variables que mueve.**
- Inversión (capex): sube de golpe.
- Capacidad (cupos): sube si se amplía; baja si se limita por el tope por aula.
- Depreciación y mantenimiento: suben.
- Riesgo de sanción: baja con la adecuación.

**Decisiones del alumno.**
1. *Invertir ahora en laboratorios y aulas adicionales con crédito.* Ventaja: cumple y habilita crecimiento. Costo: deuda y gasto financiero; riesgo si la matrícula no sube.
2. *Limitar cupos en las carreras con laboratorios al máximo permitido.* Ventaja: sin inversión. Costo: ingreso máximo acotado; la competencia puede captar a los que no entran.
3. *Alquilar o compartir laboratorios con otra institución o empresa.* Ventaja: menor capex. Costo: dependencia del tercero y menos control del horario.
4. *Cerrar o fusionar carreras de baja matrícula y laboratorio caro.* Ventaja: reduce el costo fijo. Costo: pérdida de oferta y de alumnos.

**Qué aprende.** Que la capacidad no es solo cuánta gente cabe sino cuánta puede estudiar según la norma, y que el capex educativo tiene retorno lento.

---

### Situación 12. Cobros no permitidos y denuncia de padres

**Qué pasa.** La RM 0001/2024 prohíbe cobrar algo más que las diez pensiones anuales: reserva de plaza, matrícula, derecho de inscripción o material educativo [S10]. La asociación de padres de colegios privados denunció que varios colegios ya habían subido pensiones y que algunos contratos incluían cláusulas para aceptar un aumento (por ejemplo, de Bs 95 a Bs 100) [S10]. En 2016, la sanción por incumplir el tope era multa de 10% del ingreso anual en la primera infracción y 20% en reincidencia [S14].

**Variables que mueve.**
- Ingresos por cobros extra: se pierden si la norma se cumple.
- Riesgo de multa: sube si se mantiene el cobro.
- Reputación: baja si hay denuncias.
- Reinscripciones: bajan si los padres se organizan.

**Decisiones del alumno.**
1. *Eliminar los cobros no permitidos y compensar ajustando costos.* Ventaja: cero riesgo legal. Costo: menos ingreso.
2. *Mantener los cobros con otro nombre.* Ventaja: conserva el ingreso. Costo: riesgo de multa (10% a 20% del ingreso anual en 2016) y de pérdida de confianza.
3. *Transparentar costos con los padres y proponer una mesa de diálogo.* Ventaja: genera confianza y puede ordenar el reclamo. Costo: expone la estructura de costos; no cambia la norma.
4. *Reconvertir los cobros en servicios opcionales con precio propio (transporte, almuerzo, talleres).* Ventaja: fuente de ingreso lícita (si realmente es opcional). Costo: hay que ofrecer un servicio real, con costo y calidad, y la autoridad puede cuestionarlo (verificar).

**Qué aprende.** Que cumplir la norma es parte del modelo y que el costo del incumplimiento (multa más reputación) puede superar el ingreso extra.

---

### Situación 13. Convenio con empresas y cursos cortos (oportunidad)

**Qué pasa.** Un instituto, academia o universidad puede vender capacitación a empresas (cursos cortos, diplomados, formación técnica a medida). La Ley 070 reconoce niveles de capacitación y técnico medio y superior en institutos de carácter fiscal, privado y de convenio [S1, art. 45]. Es una fuente de ingreso distinta a la pensión: se cobra por curso y suele pagar un tercero (la empresa), no la familia. En la UTEPSA, el desajuste entre la oferta y las necesidades de quienes trabajan aparece como causa de abandono [S4], lo que sugiere demanda de formación flexible.

**Variables que mueve.**
- Ingresos: suben por contratos corporativos (estimación: +5% a +20% de ingresos del proyecto en un año).
- Capacidad ociosa: se aprovecha (turnos nocturnos, fines de semana).
- Costos: sube el costo de docentes por hora y de coordinación.
- Dependencia de pocos clientes: sube.

**Decisiones del alumno.**
1. *Aceptar un contrato grande con una sola empresa.* Ventaja: ingreso inmediato y previsible. Costo: dependencia; la empresa puede cambiar de proveedor.
2. *Diversificar con muchos contratos pequeños.* Ventaja: menor riesgo. Costo: más gestión comercial y menor margen por venta.
3. *Rechazar y concentrarse en el programa regular.* Ventaja: foco. Costo: se pierde un ingreso que usa capacidad ociosa.
4. *Armar un portafolio propio de cursos cortos abiertos al público.* Ventaja: usa la marca y el espacio. Costo: costo de captación alto y resultado incierto.

**Qué aprende.** Que la capacidad ociosa es una oportunidad y que el ingreso por contrato no se comporta como el ingreso por pensión.

---

### Situación 14. Días de clase perdidos por conflicto, paro o clima

**Qué pasa.** El calendario escolar boliviano establece 200 días de clase [S20]. Los bloqueos, conflictos sociales o paros pueden suspender clases (no relevé un caso boliviano concreto con cifras; interpretación mía). La institución sigue pagando salarios y arriendo y debe recuperar el contenido. En 2020, el cierre anticipado de la gestión escolar por la pandemia llevó a los colegios privados a declararse en emergencia, según un medio internacional que citó la inquietud de padres y colegios [fuente secundaria vista en buscador, sección 9].

**Variables que mueve.**
- Días de clase: bajan (estimación: -5 a -20 días en el año).
- Costos: se mantienen; suben si se recupera contenido en fines de semana o se paga horas extra.
- Calidad percibida: baja.
- Reinscripciones: bajan si los padres perciben pérdida de aprendizaje.

**Decisiones del alumno.**
1. *Clases virtuales de emergencia durante el conflicto.* Ventaja: mantiene la continuidad. Costo: requiere plataforma y capacitación; la calidad es menor (ver situación 5).
2. *Recuperar clases en sábados y vacaciones.* Ventaja: cumple el contenido. Costo: horas extra de docentes y desgaste de familias.
3. *Acortar el contenido y priorizar lo esencial.* Ventaja: costo cero. Costo: aprendizaje menor y riesgo de reclamo.
4. *Compensar a las familias (descuento, taller gratuito).* Ventaja: protege la relación. Costo: ingreso menor.

**Qué aprende.** Que el calendario es un activo y que los costos fijos corren aunque no haya clases.

---

## 6. Variables propias que el motor del simulador debería manejar para este tipo

Cada una con qué representa y cómo se actualiza cada mes. Las fórmulas son una propuesta mía; las magnitudes iniciales hay que calibrarlas (sección 10).

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| `cohortes_alumnos` | Alumnos matriculados por nivel, curso o semestre | Cada mes: alumnos + inscripciones - retiros - egresados. Las inscripciones se concentran en el mes de inscripción (enero en colegios; inicio de semestre en universidades) |
| `capacidad_cupos` | Aulas x alumnos máximos por aula | Cambia solo con inversión. Tope de referencia en universidades: 50 por aula teórica y 25 por laboratorio [S2] |
| `ocupacion` | matriculados / cupos | Calculada cada mes |
| `grupos_abiertos` | Cantidad de paralelos o cursos con docente asignado | Se abre un grupo cuando los alumnos superan el máximo; se cierra si baja del mínimo viable |
| `pension_mensual` | Cobro por alumno | Fija durante la gestión (en universidades, los costos son invariables en la gestión [S2, art. 56]); cambia por decisión del alumno si la regla lo permite |
| `regla_pension` | Escenario regulatorio: libre, con tope o congelada | Evento anual (inicio de gestión); puede cambiar por situación |
| `meses_de_cobro` | Cuántos meses al año se cobra | 10 en colegios privados [S10]; semestral en universidades |
| `planilla_docente` | Docentes x sueldo promedio + cargas | Se paga todos los meses (estimación; ver sección 9). Sube por salario mínimo, aumentos o contratación |
| `pct_docentes_planta` | Proporción de docentes a tiempo completo | Cambia por decisión; mínimo 10% en universidades [S2] |
| `desercion_mensual` | Probabilidad de que un alumno se vaya en el mes | Base por nivel + efecto de crisis + efecto de becas y tutoría; en universidad con más peso entre semestres 1 y 6 [S6] |
| `reinscripcion` | Proporción de alumnos que vuelve el año siguiente | Se calcula una vez al año (retención anual) y depende de reputación, precio relativo e inflación |
| `morosidad` | Proporción de pensiones impagas | Sube con crisis; baja con plan de pagos; alimenta `cartera_por_cobrar` |
| `cartera_por_cobrar` | Acumulado de pensiones vencidas | Acumula la mora y se reduce con cobranza efectiva y castigos |
| `becas_pct` | Proporción de matrícula con beca | Fija mínima de 10% en universidades privadas [S2]; sube por política de retención |
| `reputacion` | Percepción de calidad y confianza | Sube con resultados, acreditación y docentes; baja con denuncias, conflictos y calidad percibida baja |
| `acreditacion` | Nivel de certificación de carreras | Cambia por decisión de inversión (situación 8) y efecto en captación |
| `canal_virtual_pct` | Parte de las horas dictadas en línea | Cambia por decisión; reduce uso de aula y aumenta costo de plataforma |
| `dias_de_clase` | Días efectivos dictados en el año | 200 en 2026 [S20]; baja por eventos (situación 14) |
| `ipc_y_salario_minimo` | Inflación y salario mínimo (exógenos) | Mensual; el salario mínimo cambia una vez al año |
| `ingresos_complementarios` | Cursos cortos, convenios, alquileres | Mensual según contratos (situación 13) |
| `capex_y_depreciacion` | Inversión en aulas y laboratorios | Se registra en el mes de la inversión y se deprecia |

**Observaciones de diseño (interpretación mía).**
- Dos relojes: el **calendario escolar** (inscripción, inicio, fin) y el **mes calendario** (planilla, arriendo). El simulador debería poder tener meses con costo y sin ingreso.
- La **regla de pensión** merece ser una variable propia del escenario, no solo un evento, porque cambia el significado de "subir el precio".
- La deserción y la reinscripción deberían calcularse por cohorte, no con un promedio general.

---

## 7. Ejemplos reales de Bolivia o Latinoamérica

Solo aparecen casos cuyo enlace abrí. Lo que dice la fuente va en la columna "Qué dice la fuente"; no es mi evaluación del negocio.

| Caso | País | Qué dice la fuente | Enlace |
|---|---|---|---|
| Colegios privados y congelamiento de pensiones 2024 | Bolivia | La RM 0001/2024 prohíbe aumentar pensiones y cobrar algo más que las diez pensiones anuales; Andecop Cochabamba lo calificó de "irresponsabilidad" porque los sueldos docentes suben por ley; padres denunciaron cláusulas de aumento (de Bs 95 a Bs 100) | [El País, 4/1/2024](https://elpais.bo/nacional/20240104_ministerio-prohibe-el-aumento-de-pensiones-en-los-colegios-privados.html) |
| Colegios privados, congelamiento 2026 y comisión de abril | Bolivia | La RM 01/2026 (art. 76) congela las pensiones durante las inscripciones; una comisión mixta analiza en abril un posible incremento; Andecop anuncia recurso y deja a cada colegio decidir su "costo educativo" | [Los Tiempos, 9/1/2026](https://www.lostiempos.com/actualidad/pais/20260109/andecop-dice-que-cada-colegio-analizara-su-costo-educativo-definir-si) |
| Tope de pensiones 2016 (4,3%) y argumento de costos | Bolivia | Resolución 1/2016; multa de 10% del ingreso anual (20% en reincidencia); Andecop afirma que 70% de la pensión va a sueldos y que cierran 4 o 5 colegios por departamento | [eju.tv, 16/1/2016](https://eju.tv/2016/01/gobierno-boliviano-fija-43-aumento-la-pension-escolar-colegios-privados-protestan/) |
| Deserción en la UTEPSA | Bolivia (Santa Cruz) | 437 desertores encuestados de una base de 900; el motivo principal es la necesidad de trabajar y pagar la colegiatura | [Pulso, 2026](https://revistas.cardenalcisneros.es/pulso/en/article/view/8818) |
| UCB Cochabamba en pandemia | Bolivia | Becas de hasta 60%; más de 600 estudiantes beneficiados en el primer semestre de 2020; 95% de inscritos en el segundo semestre; deserción semestral por carrera entre 0,49% y 3,91% | [Revista Educación, UCB, 2024](https://www.scielo.sa.cr/pdf/edu/v48n1/2215-2644-edu-48-01-183.pdf) |
| Descuentos obligatorios por modalidad | Bolivia | Escala del Ministerio: hasta -35% a distancia y -20% semipresencial según la mensualidad | [Correo del Sur, 26/1/2021](https://correodelsur.com/sociedad/20210126/ministerio-de-educacion-presenta-escala-de-descuentos-en-pensiones-de-colegios-privados.html) |
| Matrícula privada en pandemia | Bolivia | Matrícula privada -13,1% en 2021; fiscal +1,9% (registros del Ministerio, informe de la Campaña Boliviana por el Derecho a la Educación) | [CBDE/Oxfam, 2023](https://www.bolivia.oxfam.org/wp-content/uploads/2026/05/Efectos_Covid19_educacion_-boliviana_2023.pdf) |
| Laureate Education (UPC, UPN, Cibertec, UVM, UNITEC) | Perú y México | 497.700 estudiantes; retención histórica 79%; casi todo ingreso de pago privado; meta de 40%-60% de horas en línea; segundo y cuarto trimestre son los más fuertes en ingresos | [SEC, 10-K 2025](https://www.sec.gov/Archives/edgar/data/912766/000162828026009479/laur-20251231.htm) |
| Migración de privado a público en Bogotá | Colombia | 19.120 estudiantes de privados a públicos entre cierre de 2019 e inicio de 2020; hogares de estratos 2 y 3 no pueden pagar pensiones | [El Tiempo, 27/2/2021](https://www.eltiempo.com/bogota/crisis-de-colegios-privados-crea-demanda-en-los-publicos-en-bogota-569958) |
| Migración de privado a público en Paraguay | Paraguay | Unos 45.000 alumnos más en colegios públicos en 2026 por migración desde privados; el ministro no lo atribuye solo a razones económicas | [Hoy, 13/1/2026](https://www.hoy.com.py/nacionales/2026/01/13/inedita-migracion-a-colegios-publicos-no-sucedio-ni-en-el-peor-tiempo-de-la-pandemia) |

**Sobre casos con cifras financieras de una institución privada boliviana** (matrícula, pensión, costo por alumno, resultado): no encontré ninguno que tenga cifras auditadas y abiertas. Los casos bolivianos de arriba describen regulación, deserción y pandemia, no estados financieros.

---

## 8. Fuentes numeradas con nivel

Niveles: **A** (libro, paper, organismo, norma, manual universitario), **B** (consultora, reporte sectorial, prensa, informe de ONG o de empresa), **C** (blog, práctica). "Leído" significa que obtuve el texto y lo leí en el alcance indicado.

### Nivel A

| N.º | Fuente | Alcance leído | Enlace |
|---|---|---|---|
| S1 | Ley N° 070 de la Educación "Avelino Siñani - Elizardo Pérez", 20 de diciembre de 2010 (copia de la Gaceta Oficial) | Texto extraído del PDF y leído en: art. 2 III (unidades educativas privadas), art. 45 (institutos), arts. 57 a 59 (universidades privadas) y 66 (universidades extranjeras) | https://redclade.org/wp-content/uploads/Ley-070.pdf |
| S2 | Decreto Supremo N° 1433 del 12/12/2012: Reglamento General de Universidades Privadas (transcripción en Lexivox) | Texto descargado y extraído; leí los arts. 6, 16, 28 a 31, 35, 48, 56, 67, 68, 70, 71 y las disposiciones transitorias; los montos de aranceles de trámite y las partes del Título IV de sanciones no las leí | https://www.lexivox.org/norms/BO-RE-DSN1433.html y https://www.lexivox.org/norms/BO-DS-N1433.html |
| S3 | George Psacharopoulos y Harry A. Patrinos, "Returns to Investment in Education: A Decennial Review of the Global Literature", World Bank Policy Research Working Paper 8402, 2018 (publicado también en Education Economics 26(5)) | Texto leído en las secciones de resumen, métodos, retornos de Mincer por región y nivel, y tabla 4; no leí las secciones finales | https://openknowledge.worldbank.org/server/api/core/bitstreams/270b9d54-6dcb-571d-b449-9b4143738dd3/content |
| S4 | I. Sánchez San José, L. Poquechoque Cortez y S. Torres Arroyo, "Deserción universitaria en Bolivia: análisis de factores socioeconómicos, personales y académicos", Pulso. Revista de Educación, n.º 49, 2026 | Texto completo extraído (17 páginas); leí resumen, marco teórico, método y resultados de las tablas 3 y 4; no leí la discusión completa | https://revistas.cardenalcisneros.es/pulso/en/article/view/8818 |
| S5 | A. Alemán Andrade y L. C. Kunstek Salinas, "Causas de deserción estudiantil universitaria en tiempos de pandemia en la Universidad Católica Boliviana", Revista Educación (Univ. de Costa Rica), 48(1), 2024 | Texto extraído; leí introducción, definición de deserción de la UCB y cifras de deserción por carrera; no leí los resultados cualitativos completos | https://www.scielo.sa.cr/pdf/edu/v48n1/2215-2644-edu-48-01-183.pdf |
| S6 | Susy Romero Cruz, "Investigación sobre la deserción estudiantil en la Universidad Autónoma Juan Misael Saracho de la ciudad de Tarija", Investigación y Desarrollo, vol. 1, n.º 1, mayo 2016 | Texto extraído y leído en introducción, definiciones, citas de estudios bolivianos y conclusión | https://dicyt.uajms.edu.bo/revistas/index.php/investigacion-y-desarrollo/article/download/1098/1100/2075 |
| S7 | José Luis Tiquisara Rosales, "Las vicisitudes en el proceso de construcción del sistema de evaluación y acreditación de la calidad en Bolivia", LATAM Revista Latinoamericana de Ciencias Sociales y Humanidades 6(4), 2025 | Texto extraído; leí resumen, historia normativa (Ley 3009, Ley 070, APEAESU) y la descripción del proceso del SUB | https://revistalatam.redilat.org/index.php/lt/article/view/4532 |

### Nivel B

| N.º | Fuente | Alcance leído | Enlace |
|---|---|---|---|
| S8 | Laureate Education, Form 10-K del año fiscal 2025 (documento presentado a la SEC) | Primeras 200.000 de 251.653 caracteres: descripción del negocio, retención, estacionalidad, regulación, competencia, cifras de ingresos y matrícula. Es un informe de una empresa sobre su propio negocio | https://www.sec.gov/Archives/edgar/data/912766/000162828026009479/laur-20251231.htm |
| S9 | Campaña Boliviana por el Derecho a la Educación (CBDE) con apoyo de Oxfam, "Efectos de la COVID-19 en la educación boliviana", 2023 | Texto extraído; leí sección 2.2 (matrícula pública y privada, 2018-2022). La tabla de tasas de crecimiento salió desordenada al extraer, así que solo uso el -13,1% privado en 2021 que el propio texto menciona | https://www.bolivia.oxfam.org/wp-content/uploads/2026/05/Efectos_Covid19_educacion_-boliviana_2023.pdf |
| S10 | El País (Bolivia), "Ministerio prohíbe el aumento de pensiones en los colegios privados", 4/1/2024 | Nota completa | https://elpais.bo/nacional/20240104_ministerio-prohibe-el-aumento-de-pensiones-en-los-colegios-privados.html |
| S11 | Los Tiempos, "La Andecop dice que cada colegio analizará su costo educativo...", 9/1/2026 | Nota completa | https://www.lostiempos.com/actualidad/pais/20260109/andecop-dice-que-cada-colegio-analizara-su-costo-educativo-definir-si |
| S12 | eju.tv, "Colegios particulares confirman congelamiento de pensiones hasta nuevo tratamiento", 18/1/2026 | Nota completa | https://eju.tv/?p=4868414 |
| S13 | Los Tiempos, "Advierten que colegios particulares cerrarán por el bajo incremento de pensiones", 14/1/2019 | Nota completa | https://www.lostiempos.com/actualidad/pais/20190114/advierten-que-colegios-particulares-cerraran-incremento-pensiones |
| S14 | eju.tv, "Gobierno boliviano fija 4,3% de aumento en la pensión escolar; colegios privados protestan", 16/1/2016 | Nota completa | https://eju.tv/2016/01/gobierno-boliviano-fija-43-aumento-la-pension-escolar-colegios-privados-protestan/ |
| S15 | Correo del Sur, "Ministerio de Educación presenta escala de descuentos en pensiones de colegios privados", 26/1/2021 | Nota completa | https://correodelsur.com/sociedad/20210126/ministerio-de-educacion-presenta-escala-de-descuentos-en-pensiones-de-colegios-privados.html |
| S16 | Correo del Sur, "Educación pide no pagar mensualidad de febrero en colegios privados mientras no haya acuerdo", 14/1/2022 | Nota completa | https://correodelsur.com/sociedad/20220114/educacion-pide-no-pagar-mensualidad-de-febrero-en-colegios-privados-mientras-no-haya-acuerdo.html |
| S17 | eju.tv, "Andecop dice que se ha acordado la reprogramación del pago de las pensiones...", 28/4/2020 | Nota completa | https://eju.tv/?p=1673183 |
| S18 | Correo del Sur, "Inflación del 2025 fue la más alta en 36 años", 7/1/2026 (cita al INE) | Nota completa | https://correodelsur.com/economia/20260107/inflacion-del-2025-fue-la-mas-alta-en-36-anos.html |
| S19 | Bloomberg Línea, "Rodrigo Paz aumenta un 20% el salario mínimo en Bolivia", 18/12/2025 | Nota completa | https://www.bloomberglinea.com/latinoamerica/bolivia/rodrigo-paz-aumenta-un-20-el-salario-minimo-en-bolivia/ |
| S20 | Los Tiempos, "El lunes 19 de enero comienzan las inscripciones escolares para la gestión 2026", 5/1/2026 | Nota completa | https://www.lostiempos.com/actualidad/pais/20260105/lunes-19-enero-comienzan-inscripciones-escolares-gestion-2026-bolivia |
| S21 | El Tiempo (Colombia), "Crisis de colegios privados crea demanda en los públicos en Bogotá", 27/2/2021 | Nota completa | https://www.eltiempo.com/bogota/crisis-de-colegios-privados-crea-demanda-en-los-publicos-en-bogota-569958 |
| S22 | Hoy (Paraguay), "Inédita migración a colegios públicos...", 13/1/2026 | Nota completa | https://www.hoy.com.py/nacionales/2026/01/13/inedita-migracion-a-colegios-publicos-no-sucedio-ni-en-el-peor-tiempo-de-la-pandemia |

**Conteo:** 22 fuentes numeradas. **Nivel A con texto leído: 7** (S1 a S7). Nivel B: 15. Nivel C: 0 (no usé blogs). Cumple el mínimo de 8 fuentes y de 4 de nivel A leídas. Aclaración sobre la lectura: S2 y S3 se leyeron en parte (resúmenes del contenido obtenidos con la herramienta de lectura, más verificación directa del texto de varios artículos); S1, S4, S5, S6 y S7 las extraje yo como texto de PDF.

---

## 9. No confirmado

1. **Libro de Vincent Tinto, *Leaving College*.** Solo vi fichas de catálogo (University of Chicago Press, con fechas que no coinciden entre fuentes: primera edición 1987, segunda 1993-1994). No leí el libro. Lo que sé de su modelo viene de que S4 lo cita (la deserción como falta de integración académica y social), no del libro.
2. **Cifras nacionales de morosidad de pensiones en Bolivia.** No encontré ninguna. Lo que hay son afirmaciones de Andecop sin cifras verificables.
3. **Número de colegios privados, de alumnos en privados, de institutos y de universidades privadas hoy.** Los buscadores devolvieron cifras sueltas (por ejemplo, un diagnóstico de la Red CLADE con 363 institutos técnicos tecnológicos, de los cuales 229 privados; una columna de 2016 con casi 500 institutos privados; 59 universidades en 2012, y 62 en una ponencia de 2026 que no abrí), pero **no pude abrir ninguna de esas fuentes** y se contradicen entre sí. No las uso.
4. **Participación de matrícula privada en educación superior (77% pública, 23% privada).** Salió en un resumen de búsqueda de un artículo sobre riesgo de abandono en una universidad privada; el PDF devolvió texto ilegible, no lo leí.
5. **Norma vigente de pensiones en colegios privados (reglamento de unidades educativas privadas).** Solo conozco las resoluciones anuales (2016, 2019, 2024, 2026) por prensa. No leí el texto de la RM 001/2026 ni el reglamento general. El monto de la multa vigente (10% del ingreso anual en 2016) puede haber cambiado; un resumen de búsqueda de 2024 hablaba de hasta 10% de los ingresos brutos mensuales, que no abrí.
6. **Resultado de la comisión mixta de abril de 2026** (si hubo aumento de pensión y de cuánto): no lo encontré.
7. **Qué puede hacer un colegio con un alumno moroso** (retención de libreta, impedir reinscripción): no encontré norma boliviana. Los casos que aparecieron eran de Argentina y Perú.
8. **Si los docentes de colegios privados cobran 12 meses con 10 pensiones.** Es interpretación mía; las fuentes dicen que hay diez pensiones anuales [S10] y que los colegios deben pagar salarios [S17], pero no lo dicen en esos términos.
9. **Incremento salarial de docentes en 2026** (privados o fiscales): solo conseguí el salario mínimo nacional [S19]. Un resumen de búsqueda de una nota sin fecha hablaba de 5% para cada maestro; no la pude ubicar en 2026.
10. **Normativa vigente de educación virtual o a distancia en superior.** Un resumen de búsqueda indicó que el DS 4260 (2020) figura "abrogado" en una base jurídica; no abrí esa base ni encontré el reemplazo.
11. **Cierre anticipado del año escolar 2020 y reacción de colegios privados.** Lo vi en un resumen de buscador de una nota de Blu Radio que no abrí.
12. **Retorno de la educación por carrera o por institución en Bolivia.** Solo hay promedios internacionales y regionales [S3].
13. **Costos de acreditación (ARCU-SUR o nacional).** No encontré cifras. También quedó sin abrir una ponencia de 2026 que decía que 133 carreras tienen acreditación vigente en Bolivia.
14. **La definición exacta de la ecuación de Mincer** la reconstruyo de memoria (sección 2.4).
15. **Estacionalidad de las pensiones en universidades e institutos bolivianos** (cuántas cuotas al año, cuándo se cobran): no la encontré.
16. **Base de datos del BID de universidades de Bolivia 2001-2016.** Vi la ficha en un resultado de búsqueda; no abrí los datos.
17. **Los datos de inflación 2026 en adelante.** El ministro de Economía proyectó para 2026 una inflación "por debajo de la mitad" de la de 2025 [S18]; no tengo un dato observado del año.

---

## 10. Cifras que necesitan validación local

Lista de cada magnitud que es estimación mía o que no tiene dato de Bolivia, y quién podría aportarla.

| Cifra | Valor que propuse | Estado | Quién podría aportarla |
|---|---|---|---|
| Morosidad base de pensiones y en crisis | 3-5% base; 10-20% en crisis | Estimación | Administrador de un colegio privado o de una universidad privada; Andecop; asociación de padres |
| Efecto de la inflación en la reinscripción | -3% a -10% de la matrícula en un año de shock | Estimación (referencia: -13,1% en pandemia, S9) | Director de colegio privado; Ministerio de Educación (estadísticas por dependencia) |
| Costo docente sobre ingresos en un colegio privado | 70% (afirmación de Andecop, S14) | Afirmación de parte interesada | Contador de un colegio; Andecop; auditor |
| Aumento de planilla por salario mínimo +20% | +8% a +15% de la planilla total | Estimación | Administrador de colegio; contador laboral |
| Deserción semestral universitaria en crisis | 5%-12% en el primer año de carrera | Estimación (S5 da 0,5%-4% en pandemia con becas) | Jefe de registros o bienestar estudiantil de una universidad privada |
| Costo de un docente de planta vs. por hora | 1,5 a 2,5 veces | Estimación | Dirección académica de universidad o instituto |
| Caída de inscripciones por competencia virtual | -5% a -15% en esa carrera | Estimación | Director de carrera; oficina de admisiones |
| Ingreso adicional por cursos corporativos | +5% a +20% del ingreso del proyecto | Estimación | Instituto o academia que venda capacitación a empresas |
| Días de clase perdidos por conflicto | -5 a -20 días | Estimación | Ministerio de Educación; directores |
| Cantidad de pensiones cobradas y meses de pago de planilla | 10 y 12 | 10 viene de S10; 12 es interpretación | Contador de colegio; Ministerio de Trabajo |
| Multa por incumplir la norma de pensiones | 10% del ingreso anual (2016) | Dato de 2016 de prensa; vigencia no confirmada | Ministerio de Educación (normativa vigente); abogado especializado |
| Cantidad de colegios, institutos y universidades privadas y su matrícula | Sin dato confiable | No confirmado | Ministerio de Educación (estadísticas), INE |
| Pensión promedio por nivel y ciudad | Sin dato | No confirmado | Andecop; Ministerio de Educación; relevamiento propio |
| Capex por aula y laboratorio | Sin dato | No confirmado | Constructores; dirección administrativa de una universidad |
| Costo de acreditación | Sin dato | No confirmado | Universidades privadas que pasaron por ARCU-SUR |
| Margen operativo de un colegio o instituto boliviano | Sin dato (el 30,5% de S8 es de una multinacional) | No confirmado | Contadores de colegios; Andecop |
| Retención/reinscripción anual de un colegio boliviano | Sin dato (el 79% de S8 es universitario, Perú y México) | No confirmado | Directores de colegios; Ministerio de Educación |
| Efecto de la acreditación en la captación | Sin dato | Hipótesis | Oficinas de admisiones de universidades acreditadas |
| Retorno de la educación en Bolivia por nivel | Promedio regional 11,0% (S3) | Dato regional, no boliviano | Economistas laborales; INE (encuesta de hogares); UDAPE |
