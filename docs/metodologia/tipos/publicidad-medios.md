# Publicidad y medios (tipo A3): investigación para SIMPRO

Fecha de la investigación: 22 de octubre de 2026. Documento de investigación; no modifica el producto.

## Cómo leer este documento

- **[Sn]** significa que lo dice la fuente número n de la sección 8 y que la abrí. Cuando solo vi una ficha o resumen, lo digo.
- Texto sin marca, o marcado **Interpretación**, es razonamiento mío. No es una cita.
- **Estimación** significa que la cifra es un supuesto mío para el simulador, sin fuente. No es un dato del mundo real.
- Las cifras con fuente son de su país y fecha (casi todas de Estados Unidos, años 2007 a 2015). Sirven para entender el orden de magnitud, no como parámetro para Bolivia.
- Lo que no pude verificar está en la sección 9.

---

## 1. Qué es y cómo aporta valor este tipo de proyecto

**Qué es.** Un proyecto de publicidad y medios junta una audiencia (espectadores, oyentes, lectores, seguidores) y cobra a terceros (anunciantes) por poner mensajes delante de esa audiencia. Ejemplos: canal de YouTube, podcast, radio, medio digital, cuenta de influencer, canal de TV local.

**Cómo aporta valor.** Tiene dos clientes a la vez:

1. La audiencia recibe contenido (información, entretenimiento) casi siempre gratis o muy barato.
2. El anunciante paga por llegar a esa audiencia.

La literatura económica llama a esto mercado de dos lados. Anderson y Jullien lo resumen así: las plataformas "quieren atraer consumidores para vender su atención a los anunciantes"; el contenido es "el cebo" y los anuncios suelen ser una molestia para quien mira [S3]. Evans describe lo mismo para internet: muchos sitios adoptaron el modelo de la TV abierta, "generar tráfico regalando el contenido y vender ese tráfico a los anunciantes" [S2].

**Consecuencias para un simulador (Interpretación):**

- El activo del negocio es la audiencia, no el equipo ni el local. Se gana y se pierde mes a mes.
- El ingreso no depende solo de cuánta gente te mira, sino de cuánto vale esa gente para el anunciante (quiénes son, dónde viven, cuánto compran) y de cuántos espacios logras vender.
- Hay una tensión permanente: más anuncios dan más ingreso hoy, pero molestan y pueden espantar audiencia mañana [S1, S3].
- Además hay una tercera parte invisible: la plataforma (YouTube, Facebook, TikTok) que controla el alcance y muchas veces el pago. En Bolivia en 2025, según DataReportal, el alcance publicitario estimado era 5,88 millones en YouTube, 7,60 millones en Facebook, 2,40 millones en Instagram y 7,63 millones en TikTok (adultos de 18 años o más); la propia fuente aclara que no son usuarios activos mensuales [S10].

---

## 2. Indicadores propios y cómo se calculan

Cada indicador dice de dónde sale la definición. Donde no pude abrir una fuente de la definición, lo marco.

### 2.1 Indicadores de audiencia

| Indicador | Qué mide | Fórmula | Fuente / estado |
|---|---|---|---|
| Impresión | Una vez que se muestra un anuncio | Conteo | YouTube: "se cuenta cada vez que se muestra un anuncio" [S7] |
| Reproducción (playback) con anuncio | Una vez que se ve un video y tuvo anuncios | Conteo | [S7] |
| Impresión visible (viewable) | Anuncio que de verdad pudo ser visto | 50 % de los píxeles en pantalla durante al menos 1 segundo continuo (display) | [S13], que cita las guías del MRC (Media Rating Council). Fuente de nivel C; no abrí el documento del MRC |
| Descarga de podcast (IAB) | Una escucha "contable" | Solo cuenta si se pidió al menos ~60 segundos del audio, se deduplican pedidos repetidos en 24 horas y se excluyen bots | [S12], blog de un host de podcasts que cita al IAB; no abrí el documento del IAB |
| Alcance (reach) | Personas distintas expuestas | Personas únicas expuestas / población objetivo | Definición estándar de la industria. **No abrí una fuente que la defina**; sección 9 |
| Frecuencia | Veces promedio que cada persona alcanzada vio el mensaje | Impresiones totales / personas alcanzadas | Idem |
| GRP (puntos de rating bruto) | Peso total de una pauta | Alcance (%) x frecuencia promedio | Idem. Los resultados de búsqueda coincidían en esta identidad, pero no abrí ninguno |

### 2.2 Indicadores de precio e ingreso

| Indicador | Qué mide | Fórmula | Fuente / estado |
|---|---|---|---|
| CPM (costo por mil) | Lo que paga el anunciante por 1.000 impresiones | (Costo de la pauta / impresiones) x 1.000 | Evans: "el método de precio más común en publicidad se basa en el costo por espectador, expresado como el costo de llegar a mil espectadores (CPM)" [S2]. YouTube: "lo que paga un anunciante por 1.000 impresiones" [S7] |
| CPM basado en reproducciones | Lo que paga el anunciante por 1.000 reproducciones con anuncio | (Costo / reproducciones con anuncio) x 1.000 | [S7] |
| RPM (ingreso por mil) | Lo que gana el creador o medio por cada mil unidades | (Ingreso estimado / unidades) x 1.000. En YouTube la unidad son las vistas del video; en AdSense, páginas vistas o impresiones | YouTube: "cuánto dinero ganaste por 1.000 vistas" [S7]. AdSense: fórmula y ejemplo (US$ 180 con 45.000 impresiones da RPM US$ 4,00) [S9]. Google aclara que es una estimación, no ganancia real [S9] |
| CPC (costo por clic) | Lo que paga el anunciante por clic | Costo / clics | Evans lo menciona como forma de cobro de las redes de anuncios contextuales [S2]. La fórmula es estándar; no vi una definición formal |
| CTR (tasa de clics) | Qué parte de las impresiones recibe un clic | Clics / impresiones | Definición estándar; **no abrí fuente** (sección 9) |
| Tasa de ocupación o llenado (fill rate) | Qué parte del inventario se vende o se llena con anuncio | Espacios vendidos / espacios disponibles | Un glosario de terceros lo define como "porcentaje de veces que un espacio se llena con un anuncio" (visto solo en resumen de búsqueda). Otro texto dice que las solicitudes sin llenar no generan ingreso. Ambos sin abrir; **nivel C, no confirmado** |
| Inventario | Espacios publicitarios que el medio puede vender | Minutos de pauta por hora x horas emitidas; o impresiones por visita x visitas | **Interpretación** |
| Carga publicitaria (ad load) | Cuánto anuncio se mete en el contenido | Minutos (o espacios) de anuncio por hora de contenido | Anderson y Coate muestran el rango en EE. UU. (minutos no programáticos de 12,5 a 21 por hora en TV de red en 1999) y límites legales de 6 a 9 minutos por hora en Europa [S1]. Concepto de "ad volume" en [S3] |
| Ingreso por usuario (ARPU) | Ingreso medio por persona de la audiencia | Ingreso total / audiencia | **Interpretación** (el concepto de "ingreso por espectador" aparece en [S1] y [S3]) |
| Comisión de red o agencia | Parte del ingreso que se queda el intermediario | % retenido | Evans: Google retuvo cerca de 16 % de lo que pagaron los anunciantes en sus socios entre T4 2006 y T3 2007; se cree que 15 a 20 % en la red contextual; en otras redes hasta 50 % según entrevistas con expertos [S2] |
| Concentración de clientes | Qué parte del ingreso depende del mayor anunciante | Ingreso del mayor anunciante / ingreso total | **Interpretación**, útil para el simulador |

### 2.3 Indicadores de causalidad (clave para vender)

Estos no son del medio sino del anunciante, pero determinan cuánto está dispuesto a pagar.

- **ROI de la publicidad**: (margen que la publicidad causó menos su costo) / costo. Lewis y Rao lo calculan con experimentos con grupo de control y muestran que medirlo es muy difícil: en 25 experimentos con grandes minoristas y corredores de bolsa de EE. UU., la mediana del intervalo de confianza del ROI era más ancha que 100 puntos porcentuales [S4].
- **Ventas incrementales**: la diferencia entre lo que vendió el anunciante con y sin ver el anuncio. Blake, Nosko y Tadelis, con experimentos en eBay, hallaron que los retornos de la publicidad en buscadores eran "una fracción" de las estimaciones convencionales, y que los anuncios de la propia marca no tenían beneficio medible a corto plazo, porque casi todo el tráfico que dejó de pagarse volvió igual por búsqueda gratis [S5].

---

## 3. Cómo se evalúa económicamente

**Qué dice el método clásico y dónde falla (Interpretación).** El VAN y la TIR descuentan flujos de caja. En un proyecto de medios el cálculo mecánico es fácil, pero el supuesto central ("la audiencia es X todos los meses") casi nunca se cumple: la audiencia es una variable que crece, se estanca o cae, y el ingreso depende de ella con retraso (primero audiencia, después anunciantes).

**Qué complementa al VAN/TIR (Interpretación, apoyada en las fuentes indicadas):**

1. **Flujo por audiencia, no por año.** Modelar ingreso = audiencia x precio por mil x ocupación x (1 - comisión). El VAN sale de esa cadena, no de un ingreso plano. Respaldo: la teoría de medios modela el ingreso por espectador como función del nivel de anuncios [S1, S3].
2. **Punto de equilibrio en audiencia.** Cuántos miles de impresiones por mes se necesitan para cubrir costo fijo del contenido. Es más didáctico que la TIR y aterriza en una meta operativa.
3. **Margen por mil (unit economics).** RPM menos costo de producir por mil. Si el RPM neto es menor que el costo por mil, crecer pierde plata.
4. **Escenarios y sensibilidad sobre la audiencia, el precio por mil y la ocupación.** Evans muestra que el CPM en display varió de menos de US$ 1 a más de US$ 100 en 2007 según ubicación, formato y tipo de audiencia [S2]; esa amplitud justifica sensibilizar el precio, no usar un valor único.
5. **Prueba de causalidad cuando el anunciante evalúa.** Como el anunciante exige resultados y medirlos es difícil [S4, S5], el medio que ofrece pruebas (grupo de control, códigos de descuento, ventas atribuidas con prudencia) puede defender mejor su tarifa.
6. **Valor terminal prudente.** Al final de los 5 años, la audiencia vale algo, pero su valor es incierto. **Interpretación**: conviene usar un valor residual conservador o cero y mostrar el VAN con y sin él.
7. **Riesgo de plataforma.** Si el alcance depende de un algoritmo ajeno, se evalúa con un escenario de caída de alcance.

**Por qué no reemplaza al VAN, solo lo complementa:** el proyecto sí produce ingresos monetarios, así que el VAN y la TIR siguen siendo válidos. Lo que cambia es cómo se construye el ingreso que entra al VAN.

---

## 4. Errores típicos

Marco con (F) lo que respalda una fuente abierta y con (I) lo que es interpretación mía.

### De estudiantes

1. Suponer una audiencia fija o creciente de forma lineal durante 5 años. (I; contrasta con los datos de que la audiencia y el reparto entre plataformas cambian, p. ej. [S11]).
2. Confundir seguidores con audiencia que genera ingreso. Seguidores no es alcance, y alcance no es vistas con anuncio (distinción entre impresión, reproducción con anuncio y vista en [S7]). (F parcial)
3. Calcular ingreso como "audiencia x CPM de un blog extranjero". Los precios dependen del país, del formato y de la audiencia [S2]. (F parcial)
4. Olvidar la comisión del intermediario o de la plataforma (15 a 50 % en las redes descritas por Evans) [S2]. (F)
5. Suponer 100 % de ocupación del inventario. (I)
6. Ignorar que RPM no es lo mismo que CPM: el RPM incluye vistas sin anuncio y es lo que recibe el creador, no lo que paga el anunciante [S7]. (F)
7. No incluir el costo de producir contenido, que escala con la frecuencia de publicación. (I)
8. Suponer que la publicidad siempre funciona: los estudios muestran retornos mucho menores a los que reportan las plataformas [S4, S5]. (F)

### De emprendedores

1. Depender de una sola fuente de ingreso: un anunciante, la pauta estatal o una plataforma. (F parcial: la pauta estatal discrecional es citada como fuente principal de varios medios bolivianos [S14, S15, S19].)
2. Vender demasiada publicidad y perder audiencia. (F: es el equilibrio central de [S1, S3].)
3. Pagar por seguidores o tráfico inflado. El anunciante lo descubre por la medición. (I; las reglas de filtrado de bots del IAB apuntan en esa dirección [S12])
4. Confiar en métricas de la propia plataforma sin verificar. (F parcial [S5])
5. No considerar cómo se cobra desde Bolivia: umbral de pago de AdSense de unos US$ 100, comisiones bancarias, conversión a bolivianos [S18]; y TikTok no figura entre los países habilitados para monetizar [S17]. (F, con fuentes de nivel B y C)
6. Confundir creatividad con modelo de negocio: contenido bueno que no tiene a quién venderlo. (I)

---

## 5. SITUACIONES PARA LA SIMULACIÓN

En cada situación: **magnitud (fuente)** indica si viene de una fuente; **(estimación)** si es mía. Las magnitudes son rangos para calibrar, no verdades. Las decisiones están pensadas para que no haya una opción obviamente correcta.

---

### Situación 1. Cambio de algoritmo: el alcance cae

**Qué pasa.** La plataforma donde vive tu audiencia (YouTube, Facebook, TikTok) cambia lo que recomienda. Tus vistas por contenido bajan de golpe, aunque publiques igual. En Bolivia el alcance publicitario estimado de Facebook, YouTube y TikTok es grande pero está concentrado en pocas plataformas [S10], lo que aumenta la dependencia.

**Variables que mueve.**
- Audiencia mensual: baja 20 a 50 % en 2 a 3 meses (estimación).
- Ingreso por RPM: baja en proporción (mecánica directa [S7]).
- Costo de producción: sin cambio al inicio.
- Reputación ante anunciantes: baja si no cumples el alcance prometido (estimación).

**Decisiones posibles.**
1. *Publicar más.* Ventaja: puede recuperar vistas rápido si el formato funciona. Costo: sube el gasto de producción, riesgo de cansancio y de bajar calidad.
2. *Diversificar a otra plataforma (video corto, podcast, boletín).* Ventaja: reduce el riesgo a largo plazo. Costo: dos a cuatro meses de esfuerzo con poco ingreso, y puedes tener un contenido regular en todos y destacado en ninguno.
3. *Pagar para impulsar contenido.* Ventaja: efecto inmediato. Costo: dinero que no recuperas si el alcance comprado no genera suscriptores o anuncios; los estudios sobre publicidad pagada muestran retornos bajos [S5].
4. *Aguantar y no cambiar nada.* Ventaja: no gastas. Costo: si la caída es permanente, pierdes meses de ingreso.

**Qué aprende el alumno.** El activo (audiencia) no es tuyo cuando vive en una plataforma ajena. Diversificar cuesta hoy y paga mañana.

---

### Situación 2. El anunciante ancla se va

**Qué pasa.** Un anunciante que aportaba la mayor parte de tu ingreso recorta su presupuesto o cambia de medio. En Bolivia los anunciantes grandes (bancos, telefonía, cerveceras, comercio) son pocos; un recorte por ajuste de costos en una economía con tensión cambiaria puede dejar un hueco grande (el contexto de crisis económica aparece mencionado en [S15]; la afectación a pauta privada específica no la verifiqué).

**Variables que mueve.**
- Ingreso mensual: baja 25 a 60 % si el cliente pesaba eso (estimación; depende de la concentración de clientes).
- Ocupación del inventario: baja.
- Caja: baja de golpe con costos fijos intactos.

**Decisiones posibles.**
1. *Bajar la tarifa (CPM) para llenar espacios con muchos clientes pequeños.* Ventaja: llena inventario. Costo: baja el RPM de forma duradera y se queda como precio de referencia.
2. *Cobrar una tarifa más alta a menos clientes con paquetes exclusivos.* Ventaja: mejor margen por cliente. Costo: más venta consultiva, ciclo largo y más dependencia.
3. *Cubrir con venta directa en bolivianos a negocios locales.* Ventaja: diversifica. Costo: tickets chicos, más gestión y cobranza.
4. *Recortar costos y esperar.* Ventaja: protege caja. Costo: puede deteriorar calidad y audiencia.

**Qué aprende el alumno.** Riesgo de concentración y la diferencia entre ocupar espacios y cuidar el precio.

---

### Situación 3. Pauta estatal: oferta con condiciones

**Qué pasa.** Una entidad estatal ofrece contratar pauta importante. En Bolivia se documenta que la publicidad estatal fue una de las principales fuentes de ingreso de los medios y que su reparto fue discrecional: los medios independientes denunciaron que se les restringe o niega, y los alineados reciben más [S14, S15, S16, S19]. En los últimos cuatro meses de la gestión Arce (la fuente no da las fechas exactas) se gastaron al menos Bs 31,1 millones en 71 contratos con 42 medios (Bolivia Verifica citada por Infobae) [S15]. Con un cambio de gobierno, las reglas pueden cambiar.

**Variables que mueve.**
- Ingreso: sube 20 a 40 % (estimación).
- Reputación ante la audiencia independiente: baja si la audiencia percibe alineamiento (estimación).
- Riesgo futuro: depende del contrato y del gobierno (fuente: [S14, S15]).
- Pagos: puede haber demoras (estimación).

**Decisiones posibles.**
1. *Aceptar sin condiciones.* Ventaja: caja inmediata. Costo: dependencia y posible pérdida de credibilidad; cuando cambie el gobierno, el contrato puede cortarse.
2. *Aceptar con límite (máximo 20 % del ingreso, política editorial escrita).* Ventaja: protege independencia. Costo: dejas plata sobre la mesa; el contrato puede no aceptar tus límites.
3. *Rechazar.* Ventaja: reputación. Costo: sin esa caja puedes no sobrevivir el valle.
4. *Aceptar y usar el ingreso para diversificar (membresías, otros clientes).* Ventaja: transforma una dependencia en puente. Costo: exige disciplina, y el plazo puede no alcanzar.

**Qué aprende el alumno.** Una fuente de ingreso grande y cómoda tiene un costo de reputación y de dependencia; ser sostenible implica decidir de dónde no cobrar.

---

### Situación 4. Temporada alta y valle publicitario

**Qué pasa.** La inversión publicitaria se concentra en ciertas épocas (fin de año, Día de la Madre, Carnaval, campañas electorales) y cae en otras. Para Bolivia no encontré datos de estacionalidad de pauta (sección 9), así que la forma exacta es estimación.

**Variables que mueve.**
- Demanda de espacios y CPM: sube en temporada alta, baja en valle (estimación: +30 a +80 % en pico y -20 a -40 % en valle).
- Ocupación: del 90 % en pico al 40 % en valle (estimación).
- Caja: se acumula en pico y se consume en valle.

**Decisiones posibles.**
1. *Vender paquetes anuales con descuento (pago adelantado).* Ventaja: caja anticipada y ocupación estable. Costo: precio por mil más bajo y pierdes el pico.
2. *Subir tarifa en pico y vender suelto.* Ventaja: más margen. Costo: riesgo de no vender en valle y de depender del pico.
3. *Reservar parte del ingreso del pico para el valle (fondo de caja).* Ventaja: seguridad. Costo: no inviertes ese dinero en crecer.
4. *Crear productos de valle (programas especiales, eventos).* Ventaja: llena el valle. Costo: inversión y esfuerzo adicional.

**Qué aprende el alumno.** El flujo mensual importa más que el promedio anual; la caja de un mes malo puede matar a un proyecto con buen VAN.

---

### Situación 5. Contenido rechazado por anunciantes o desmonetizado

**Qué pasa.** Un video, episodio o programa es marcado como no apto para anunciantes (tema político, violento o sensible), o un anunciante pide retirar su marca de tu contenido. YouTube exige cumplir sus pautas de contenido adecuado para anunciantes para participar en el programa de socios [S8].

**Variables que mueve.**
- RPM del contenido afectado: baja a casi cero (estimación; la plataforma no monetiza).
- Ocupación con anunciantes sensibles: baja (estimación).
- Audiencia: puede subir si el tema es popular (estimación).

**Decisiones posibles.**
1. *Autocensurarse hacia temas seguros.* Ventaja: ingreso estable. Costo: pierde identidad y puede perder la audiencia que te seguía por tu estilo.
2. *Mantener la línea y financiar con membresías o aportes.* Ventaja: audiencia fiel y diferenciación. Costo: audiencia menor y menos ingreso publicitario.
3. *Hacer dos líneas: contenido apto para anunciantes y contenido libre.* Ventaja: reparte riesgo. Costo: duplica trabajo y confunde la marca.
4. *Apelar y reclamar a la plataforma.* Ventaja: puede recuperar la monetización. Costo: demora de semanas y sin garantía.

**Qué aprende el alumno.** Ser monetizable y ser relevante pueden tirar en direcciones opuestas.

---

### Situación 6. Cobrar desde Bolivia: pago, tipo de cambio y plataforma no habilitada

**Qué pasa.** Ya tienes audiencia, pero cobrar es un problema. TikTok no figura oficialmente entre los países habilitados para monetizar, y algunos creadores usan cuentas de otros países o plataformas como Payoneer [S17]. En YouTube/AdSense el pago se libera al alcanzar un umbral (aprox. US$ 100), requiere PIN por correo, la cuenta bancaria debe coincidir con el nombre del titular y los bancos pueden cobrar comisión o convertir a bolivianos con pérdida [S18]. Las condiciones exactas de la plataforma en Bolivia hoy no las pude confirmar con una fuente oficial.

**Variables que mueve.**
- Caja efectiva: retraso de 1 a 3 meses en el cobro y pérdida del 2 a 6 % por comisión y conversión (estimación).
- Riesgo de cierre de cuenta si usas una cuenta en otro país (estimación; [S17] no analiza ese riesgo).
- Costo administrativo: sube.

**Decisiones posibles.**
1. *Usar cuentas o intermediarios en otro país.* Ventaja: permite monetizar de inmediato. Costo: riesgo de suspensión, comisiones y complicaciones tributarias.
2. *Quedarse con plataformas que sí pagan en Bolivia.* Ventaja: seguridad. Costo: depender de un canal quizá menos rentable.
3. *Vender patrocinio directo a empresas locales (factura en Bs).* Ventaja: no depende de la plataforma de pago. Costo: requiere equipo de ventas y emitir facturas.
4. *Cobrar a la audiencia con QR o transferencia (membresía local).* Ventaja: cobro en Bs. Costo: la audiencia boliviana paga poco por contenido (en la región, no más de 18 % paga por noticias según el reporte Reuters 2025 citado por LatAm Journalism Review [S11]; no incluye a Bolivia).

**Qué aprende el alumno.** El ingreso reconocido no es caja. Cobrar tiene fricciones propias del país.

---

### Situación 7. Demasiada publicidad: el equilibrio con la audiencia

**Qué pasa.** Un anunciante grande ofrece pagar mucho si aumentas el espacio para sus anuncios. Si aceptas, subes la carga publicitaria. La teoría dice que la audiencia se molesta con los anuncios y que el medio debe igualar el ingreso extra por anuncio con la pérdida de espectadores [S1, S3].

**Variables que mueve.**
- Ingreso mensual: sube de inmediato (+15 a +30 %, estimación).
- Audiencia: baja de forma gradual por anuncio extra (estimación: -2 a -5 % mensual si se pasa de cierto umbral).
- Reputación: baja.

**Decisiones posibles.**
1. *Aceptar toda la oferta.* Ventaja: más ingreso hoy. Costo: audiencia en caída; a los tres meses el inventario vale menos.
2. *Aceptar solo la mitad y cobrar tarifa premium por exclusividad.* Ventaja: protege la experiencia. Costo: el anunciante puede irse a otro medio.
3. *Cambiar el formato (patrocinio integrado en vez de cortes).* Ventaja: menos molestia. Costo: más trabajo creativo y el anunciante controla menos el mensaje.
4. *Ofrecer una versión sin anuncios por suscripción.* Ventaja: monetiza a los más molestos. Costo: complejidad y poca conversión inicial (estimación: 1 a 5 % de la audiencia).

**Qué aprende el alumno.** El ingreso de hoy se compra con audiencia de mañana. Hay un nivel de anuncios que maximiza el ingreso, y no es el máximo posible [S1, S3].

---

### Situación 8. El anunciante exige resultados

**Qué pasa.** Un cliente importante dice que no renovará si no demuestras ventas generadas. Medir el efecto real de un anuncio es difícil incluso para grandes empresas: Lewis y Rao necesitaron experimentos con millones de personas y aun así los intervalos eran muy anchos [S4]. Blake y otros hallaron que gran parte de las ventas que se atribuían a la publicidad habrían ocurrido igual [S5]. Además, los contratos de TV suelen incluir una garantía de rating: si el programa no llega al nivel pactado, el canal da tiempo adicional de pauta (make-good) [S2].

**Variables que mueve.**
- Renovación del cliente: depende de la respuesta.
- Tarifa: puede bajar 10 a 30 % si ofreces garantía (estimación).
- Costo de medición: sube (códigos de descuento, paneles, encuestas).

**Decisiones posibles.**
1. *Garantizar un resultado (pago por venta o por clic).* Ventaja: cierra el trato. Costo: pasas el riesgo al medio; si la campaña no vende, ganas menos.
2. *Ofrecer garantía de audiencia con reposición (make-good).* Ventaja: compromiso medible. Costo: regalas espacios si no cumples, perdiendo inventario.
3. *Ofrecer un piloto de 2 meses con grupo de control (ciudades o semanas sin anuncio).* Ventaja: evidencia honesta. Costo: tiempo, y el resultado puede ser desfavorable.
4. *Rechazar y mantener tarifa fija por audiencia.* Ventaja: no cargas riesgo. Costo: puedes perder al cliente.

**Qué aprende el alumno.** Vender audiencia no es lo mismo que vender ventas. La incertidumbre de medir se negocia.

---

### Situación 9. Audiencia inflada o tráfico inválido

**Qué pasa.** Una parte de tus números son bots, vistas repetidas o seguidores comprados (propios o heredados de una agencia). Al auditarlos, el anunciante o la plataforma descuentan. En podcasts, el estándar del IAB excluye bots, pedidos repetidos en 24 horas y descargas de menos de ~60 segundos [S12].

**Variables que mueve.**
- Audiencia contable: baja 10 a 40 % (estimación).
- Ingreso: baja o se devuelve parte de lo facturado (estimación).
- Reputación ante anunciantes: baja fuerte si el cliente lo descubre antes que tú.

**Decisiones posibles.**
1. *Limpiar y reportar números reales.* Ventaja: credibilidad a largo plazo. Costo: cifra inicial más baja y posible negociación a la baja.
2. *No decir nada y mantener cifras.* Ventaja: no pierdes tarifa hoy. Costo: si te auditan, puedes perder el cliente y la reputación.
3. *Contratar una medición externa (tercero).* Ventaja: confianza de los anunciantes. Costo: dinero fijo mensual.
4. *Cambiar el discurso a calidad de audiencia (segmento, ciudad) y no cantidad.* Ventaja: otra forma de justificar precio. Costo: exige datos que quizás no tienes.

**Qué aprende el alumno.** Los números de audiencia son la moneda del negocio; la credibilidad de la medición es un activo.

---

### Situación 10. Éxito viral: crecimiento repentino

**Qué pasa.** Un contenido se viraliza y la audiencia se duplica en semanas. Es una oportunidad, pero la mayoría de esa audiencia puede ser pasajera y los anunciantes grandes tardan en responder.

**Variables que mueve.**
- Audiencia: +50 a +200 % en un mes, luego pierde 40 a 70 % del exceso en 2 a 4 meses (estimación).
- Ingreso por RPM: sube con el volumen, pero la ocupación tarda en responder (estimación).
- Costo de servidores, edición o soporte: sube.

**Decisiones posibles.**
1. *Invertir en capacidad (equipo, producción) para aprovechar la ola.* Ventaja: puedes retener parte de la audiencia. Costo: si la ola pasa, quedas con costos fijos más altos.
2. *Vender paquetes de pauta a precio alto mientras dure.* Ventaja: monetiza el pico. Costo: si la audiencia cae, cumples mal con lo prometido.
3. *Convertir la audiencia en base propia (lista de correos, comunidad, membresía).* Ventaja: asegura retención. Costo: pide esfuerzo que no da ingreso inmediato.
4. *No cambiar nada y disfrutar el ingreso extra.* Ventaja: sin riesgo. Costo: oportunidad desperdiciada.

**Qué aprende el alumno.** La audiencia prestada se va; la retenida es la que vale para el VAN.

---

### Situación 11. Vender directo o por red de anuncios

**Qué pasa.** Una red de anuncios te ofrece llenar todo tu inventario con un CPM garantizado bajo. Por otro lado, vender tú mismo ofrece más precio pero requiere vendedores. Según Evans, en la red contextual de Google la plataforma retenía cerca de 16 a 20 % del ingreso, y en otras redes hasta 50 % según entrevistas con expertos; la red suele ofrecer al publisher un CPM garantizado y se queda con la diferencia [S2]. Los CPM variaron de menos de US$ 1 a más de US$ 100 según ubicación y tipo de audiencia (EE. UU., 2007) [S2].

**Variables que mueve.**
- Ocupación: red 80 a 95 %, directa 40 a 70 % (estimación).
- Precio por mil neto: red es menor; directa mayor (fuente cualitativa [S2]; magnitud, estimación).
- Costo de ventas: directa sube.
- Caja: la red paga más estable, la directa más lenta (estimación).

**Decisiones posibles.**
1. *Solo red.* Ventaja: simple, ocupación alta. Costo: menor RPM y sin relación con el anunciante.
2. *Solo venta directa.* Ventaja: más precio y control. Costo: espacios sin vender y gastos de equipo comercial.
3. *Mixto: directa para los mejores espacios y red para el resto.* Ventaja: llena todo. Costo: gestión compleja y el cliente directo puede ver su espacio devaluado.
4. *Contratar una agencia local con comisión.* Ventaja: llega a anunciantes que no conoces. Costo: la agencia retiene una parte y puede priorizar a otros medios.

**Qué aprende el alumno.** Cada canal de venta intercambia precio, ocupación y control.

---

### Situación 12. Competidor o fragmentación de la audiencia

**Qué pasa.** Aparecen otros creadores o medios que compiten por la atención de tu mismo público. El reporte Reuters 2025 sobre seis países de Latinoamérica indica que las audiencias de TV, prensa y sitios de noticias se achican mientras ganan creadores y plataformas de video (por ejemplo, Luzu TV en Argentina, citado por 8 % de los encuestados como fuente de noticias) [S11]. Anderson y Jullien explican que si la audiencia ve varios medios, cada medio solo puede cobrar por el "valor incremental" que aporta al anunciante, lo que baja su poder de precio [S3].

**Variables que mueve.**
- Audiencia exclusiva: baja 10 a 30 % (estimación).
- Precio por mil: baja (por el efecto de audiencia compartida [S3]; magnitud, estimación).
- Costo de adquirir audiencia: sube.

**Decisiones posibles.**
1. *Diferenciar el contenido (nicho más cerrado).* Ventaja: audiencia más leal y mejor precio por nicho. Costo: techo más bajo de audiencia.
2. *Bajar precios para retener anunciantes.* Ventaja: ocupación. Costo: deteriora el margen.
3. *Colaborar con el competidor (invitados cruzados, alianza de pauta).* Ventaja: suma audiencia. Costo: pierdes diferenciación y dependes del socio.
4. *Comprar audiencia (promoción pagada).* Ventaja: rápido. Costo: caro y de retorno dudoso [S5].

**Qué aprende el alumno.** La audiencia compartida vale menos para el anunciante que la exclusiva.

---

### Situación 13. Se va el talento clave

**Qué pasa.** La cara, voz o conductor principal (que concentra la audiencia) se va a otro medio, se enferma o pide más plata. En medios de personalidad (influencers, programas de radio o TV), la audiencia sigue a la persona. No encontré fuente sobre esto para Bolivia; es un riesgo de persona clave general.

**Variables que mueve.**
- Audiencia: baja 20 a 60 % si la persona se va (estimación).
- Costo de personal: sube si lo retienes (estimación).
- Reputación: depende de cómo se va.

**Decisiones posibles.**
1. *Subirle el pago o darle participación.* Ventaja: lo retienes. Costo: margen menor y precedente para otros.
2. *Desarrollar una marca de programa y un segundo rostro.* Ventaja: reduce la dependencia. Costo: tarda meses y puede diluir la audiencia actual.
3. *Contrato con cláusula de exclusividad y permanencia.* Ventaja: protege el activo. Costo: tensión laboral y en la práctica poco ejecutable (estimación).
4. *Dejarlo ir y reconstruir.* Ventaja: evitas pagar de más. Costo: meses de pérdida de audiencia e ingresos.

**Qué aprende el alumno.** Cuando el activo es una persona, el riesgo es de continuidad, no solo de mercado.

---

### Situación 14. Sumar suscripción o membresía

**Qué pasa.** Con una audiencia fiel, puedes cobrar membresía, donaciones o contenido de pago. Anderson y Jullien distinguen medios "gratuitos" (financiados por anuncios) y "de pago" según el valor de la atención y la molestia de los anuncios [S3]; Evans nota que algunas revistas combinan cobro al lector y publicidad, con estrategias de pocos anuncios y precio alto al lector o al revés [S2]. En Bolivia, medios digitales nuevos dicen apostar a sus audiencias como posibles suscriptores y recurrir a fondos concursables de cooperación [S19]. Pagar por noticias es poco común en Latinoamérica (máximo 18 % en el reporte Reuters 2025 de seis países, que no incluye Bolivia) [S11].

**Variables que mueve.**
- Ingreso recurrente: nuevo (estimación: 1 a 5 % de la audiencia fiel paga).
- Audiencia general: puede bajar si pones contenido detrás de un muro de pago (estimación).
- Ingreso por publicidad: baja si pierdes alcance.
- Costo de cobro y soporte: sube.

**Decisiones posibles.**
1. *Muro de pago duro.* Ventaja: mayor ingreso por usuario que paga. Costo: baja la audiencia total y la pauta cae.
2. *Modelo mixto (gratis con anuncios y extras pagos).* Ventaja: mantiene alcance. Costo: baja conversión.
3. *Aportes voluntarios y fondos de cooperación.* Ventaja: no pierdes audiencia. Costo: depende de donantes con agenda propia.
4. *No tocar el modelo.* Ventaja: simplicidad. Costo: sigues expuesto a la publicidad.

**Qué aprende el alumno.** Diversificar el modelo de ingreso reduce riesgo, pero cambia a quién le debes lealtad.

---

### Situación 15. Cambio de reglas: impuestos o regulación de la publicidad

**Qué pasa.** Se anuncia un impuesto o una norma que afecta la publicidad digital o los medios. Hubo un proyecto de ley (2020 a 2021, gobierno de Luis Arce) para cobrar IVA de 13 % a servicios digitales de proveedores del exterior, incluida la difusión de publicidad en medios digitales; yo solo vi resúmenes de búsqueda y no pude confirmar si fue aprobado ni su estado actual (sección 9). Esta situación es hipotética para el simulador.

**Variables que mueve.**
- Costo de la pauta para el anunciante: sube (si se traslada el impuesto) (estimación: +13 % si se transfiere completo).
- Demanda de pauta: baja algo (estimación: -3 a -10 %).
- Costo de cumplimiento (facturación, contabilidad): sube.

**Decisiones posibles.**
1. *Trasladar el impuesto al precio.* Ventaja: proteges margen. Costo: cliente con más costo, riesgo de perder pauta.
2. *Absorber el impuesto.* Ventaja: no pierdes clientes. Costo: margen menor.
3. *Cambiar mix hacia canales locales no alcanzados.* Ventaja: evitas el impacto. Costo: puede ser menor audiencia o alcance.
4. *Formalizarte con asesoría contable.* Ventaja: evitas multas. Costo: costo fijo.

**Qué aprende el alumno.** Los cambios regulatorios son riesgo de caja; un proyecto debe prever quién paga la diferencia.

---

## 6. Variables propias que el motor debería manejar

Todas son **propuesta mía (Interpretación)**; los rangos iniciales son estimación.

| Variable | Qué representa | Cómo se actualiza cada mes |
|---|---|---|
| `audiencia_alcance` | Personas únicas alcanzadas en el mes | audiencia anterior x (1 + crecimiento orgánico - pérdida) + efecto de eventos (algoritmo, viral, talento) |
| `audiencia_retencion` | Parte de la audiencia que vuelve | Baja con carga publicitaria alta y con mala calidad; sube con constancia y comunidad |
| `frecuencia_promedio` | Veces que cada persona ve contenido o anuncios | Depende de publicaciones por mes y de la retención |
| `inventario_mensual` | Impresiones o espacios disponibles | audiencia x frecuencia x espacios por contenido |
| `ocupacion` (fill rate) | Parte del inventario vendido | Sube con equipo de ventas y reputación; baja en valle y con pérdida de clientes |
| `cpm_efectivo` | Precio neto por mil que se logra | cpm de lista x (1 - descuento) x factor estacional; baja con audiencia compartida y calidad de medición |
| `rpm` | Ingreso por mil vistas (todo incluido) | ingreso del mes / vistas x 1.000, como lo define [S7] |
| `ad_load` | Carga publicitaria | La fija el alumno; afecta retención y reputación |
| `mix_ingresos` | Ingreso por fuente: directa, red, estatal, membresía, otros | Se calcula por fuente; cada una con su propio riesgo y plazo de cobro |
| `concentracion_cliente` | Parte del ingreso del mayor anunciante | Actualizar cuando entran y salen clientes; si supera cierto umbral, aumenta la probabilidad de eventos de pérdida |
| `dependencia_plataforma` | Parte de la audiencia que viene de una sola plataforma | Disminuye con diversificación; el evento de algoritmo pesa proporcional a este valor |
| `comision_intermediario` | Parte que retiene red, plataforma o agencia | Fija por canal; Evans reporta rangos de 15 a 50 % [S2] |
| `credibilidad_medicion` | Confianza del anunciante en tus números | Sube con medición externa y transparencia; baja con tráfico inválido descubierto |
| `reputacion_editorial` | Percepción de independencia ante la audiencia | Baja con pauta alineada o exceso de anuncios; sube con constancia |
| `dias_de_cobro` | Plazo promedio de cobranza | Fuente por fuente (pauta estatal más lenta, plataforma más estable); afecta caja |
| `costo_contenido` | Costo de producir por pieza | costo por pieza x piezas por mes; sube con la frecuencia y la calidad |
| `riesgo_talento` | Dependencia de una persona clave | Aumenta cuando la audiencia se concentra en una cara; dispara el evento 13 |

---

## 7. Ejemplos reales de Bolivia y Latinoamérica (enlaces abiertos)

| Caso | País | Qué dice la fuente | Enlace |
|---|---|---|---|
| Cierre de Página Siete (2023) y salida de La Razón del papel | Bolivia | Página Siete cerró en 2023 tras 13 años y unos 80 despidos (30 periodistas). La Razón, de 34 años, dejó la edición impresa y en 2020 despidió a 93 trabajadores. La Asociación Nacional de Periodistas de Bolivia (ANPB) atribuye la crisis sobre todo al reparto discrecional de la publicidad estatal; la competencia digital contribuyó, pero no sería la causa principal. Las dos explicaciones son de la ANPB; los dueños de Página Siete atribuyen el cierre a presión del gobierno según otro resumen que no abrí | [SWI/EFE, sept. 2024](https://www.swissinfo.ch/spa/la-mala-hora-de-los-medios-impresos-en-bolivia/87531478) y [La Patria, 11/9/2024](https://lapatria.bo/2024/09/11/crisis-de-la-prensa-boliviana-medios-enfrentan-asfixia-y-precariedad-laboral/) |
| Pauta estatal en Bolivia | Bolivia | Bs 31,1 millones en los últimos cuatro meses del gobierno Arce, 71 contratos, 42 medios (Bolivia Verifica). Un estudio de Ojo Público halló más de US$ 500.000 a 28 medios vinculados al Ejecutivo entre 2018 y 2023. La ANPB pide una norma con criterios objetivos | [Infobae, 11/11/2025](https://www.infobae.com/america/america-latina/2025/11/11/bolivia-gasto-millonario-en-publicidad-estatal-durante-la-gestion-de-luis-arce-reabre-el-debate-sobre-la-pauta-oficial/) |
| Medios digitales bolivianos de nicho (Guardiana, Marco Vínculos, La Nube) | Bolivia | No dependen de la publicidad tradicional; apuestan a audiencias como posibles suscriptores y a fondos concursables de cooperación (nota de agosto de 2021; no da cifras) | [Fundación para el Periodismo](https://fundacionperiodismo.org/?p=11071) |
| Unitel (televisión comercial) | Bolivia | Pertenece a Ecor, de la familia Monasterio. Según Wikipedia, se la conoce por costos de publicidad altos frente a Red Uno y reventa los derechos de transmisión de la liga a cables. Ratings citados de 2007 y 2011 (desactualizados). Lanzó su señal HD terrestre en 2018. Fuente de nivel C | [Wikipedia](https://en.wikipedia.org/wiki/Unitel_Bolivia) |
| Monetización de TikTok y cobro de YouTube desde Bolivia | Bolivia | Bolivia no está en la lista oficial de TikTok para monetizar (Red Uno, 30/7/2026). Guía de cobro de YouTube: umbral de AdSense de unos US$ 100, PIN, comisiones y conversión a Bs (guía comercial sin fecha) | [Red Uno](https://www.reduno.com.bo/tecnologia/monetizacion-de-tiktok-en-bolivia-todo-lo-que-debes-saber-y-prevenir-2026730113827) y [Maldrich](https://www.maldrich.com/bo/guias/como-cobrar-en-youtube/) |
| Luzu TV (canal de streaming con YouTube de más de 2 millones de suscriptores) y Sin Embargo (YouTube, 2,25 millones) | Argentina / México | Citados en el Digital News Report 2025: creadores y video ganan terreno frente a la TV y la prensa. Luzu TV es fuente de noticias para el 8 % de los encuestados argentinos | [LatAm Journalism Review](https://latamjournalismreview.org/articles/content-creators-and-online-video-gain-ground-over-traditional-media-in-latin-america-new-report-finds/) |

**Lo que no encontré:** ningún caso boliviano de podcast o canal de YouTube con cifras reales de ingreso por publicidad, ni inversión publicitaria total de Bolivia. La búsqueda de podcast boliviano solo mostró que un proyecto de periodismo considera que los podcasts no son una fuente de ingreso segura salvo que tengan gran público (resumen de búsqueda; no abrí el documento).

---

## 8. Fuentes

**Nivel A (libro, paper, organismo, manual universitario)**

| N.º | Fuente | Qué leí | Enlace |
|---|---|---|---|
| S1 | Simon P. Anderson y Stephen Coate, "Market Provision of Broadcasting: A Welfare Analysis", *Review of Economic Studies* 72(4), 2005, pp. 947-972 (ficha en IDEAS). Leí la versión de trabajo de septiembre de 2003 alojada por la Universidad de Virginia | Resumen e introducción: el nivel de publicidad puede ser muy alto o muy bajo según la molestia para el espectador, la sustituibilidad de programas y el beneficio del anunciante; datos de carga publicitaria y límites en Europa. No leí el modelo completo | https://economics.virginia.edu/sites/economics.as.virginia.edu/files/2025-04/newbroad_0.pdf |
| S2 | David S. Evans, "The Economics of the Online Advertising Industry", *Review of Network Economics* 7(3), septiembre 2008 (versión alojada por Princeton; la versión de *Journal of Economic Perspectives* 2009 es otra y solo vi su ficha) | Lectura de las secciones sobre fijación de precios (CPM, CPC), modelo de tráfico por contenido, comisiones de redes y garantía de rating | https://www.cs.princeton.edu/courses/archive/spr11/cos448/web/docs/week5_optional1.pdf |
| S3 | Simon Anderson y Bruno Jullien, "The advertising-financed business model in two-sided media markets", capítulo del *Handbook of Media Economics* vol. 1, cap. 2, 2015 (leí la versión de trabajo TSE-632, borrador del 5/6/2015) | Resumen, introducción, sección 2 y tramos del modelo (molestia por anuncio, ingreso por espectador, multi-homing, TiVo) | https://economics.virginia.edu/sites/economics.as.virginia.edu/files/2025-04/wp_tse_632-AJ-Ad-Fin%20bus-model_0.pdf |
| S4 | Randall A. Lewis y Justin M. Rao, "The Unfavorable Economics of Measuring the Returns to Advertising", *Quarterly Journal of Economics* 130(4), 2015, pp. 1941-1973 | Resumen e introducción (25 experimentos, intervalos de ROI de más de 100 puntos) | https://www.gwern.net/doc/economics/advertising/2015-lewis.pdf (copia no oficial) |
| S5 | Tom Blake, Chris Nosko y Steven Tadelis, "Consumer Heterogeneity and Paid Search Effectiveness: A Large Scale Field Experiment", NBER WP 20171, mayo 2014 (publicado en *Econometrica* 83, 2015) | Resumen e introducción (anuncios de marca sin beneficio medible; retornos mucho menores que los no experimentales) | https://www.nber.org/papers/w20171.pdf |

Conteo: **5 fuentes de nivel A leídas** (S1 a S5). Todas son economía de la publicidad y de los medios; ninguna es un manual universitario de planificación de medios. Una sexta, Gabszewicz y Anderson (CEPR DP 5223, 2005), solo la vi en ficha: no pude abrir el PDF y no la uso como base.

**Nivel B (reportes, documentación oficial de plataformas, prensa especializada)**

| N.º | Fuente | Qué leí | Enlace |
|---|---|---|---|
| S7 | YouTube Help, "Understand ad revenue analytics" | Definiciones de RPM, CPM, CPM basado en reproducciones, impresiones y reproducciones monetizadas | https://support.google.com/youtube/answer/9314357/understand-ad-revenue-analytics |
| S8 | YouTube Help, requisitos del Programa de socios | Umbrales: 1.000 suscriptores y 4.000 horas de visualización o 10 millones de vistas de Shorts, mayores de 18, país habilitado, contenido apto para anunciantes | https://support.google.com/youtube/answer/72857 |
| S9 | Google AdSense Help, "RPM" | Fórmula e ejemplos de RPM | https://support.google.com/adsense/answer/190515?hl=en |
| S10 | DataReportal, Digital 2025: Bolivia | Alcance publicitario por plataforma (YouTube, Facebook, Instagram, TikTok) | https://datareportal.com/reports/digital-2025-bolivia |
| S11 | LatAm Journalism Review, resumen del Digital News Report 2025 del Instituto Reuters | Creadores y video, Luzu TV, pago por noticias (máx. 18 %) en seis países de la región (no incluye Bolivia) | https://latamjournalismreview.org/articles/content-creators-and-online-video-gain-ground-over-traditional-media-in-latin-america-new-report-finds/ |
| S14 | SWI/EFE, "La mala hora de los medios impresos en Bolivia", 11/9/2024 | Cierres, despidos, pauta estatal, estudio ANPB | https://www.swissinfo.ch/spa/la-mala-hora-de-los-medios-impresos-en-bolivia/87531478 |
| S15 | Infobae, 11/11/2025 | Gasto en pauta estatal, 71 contratos, 42 medios | URL en sección 7 |
| S16 | La Patria, 11/9/2024 | Crisis de la prensa boliviana | URL en sección 7 |
| S17 | Red Uno, monetización de TikTok en Bolivia, 30/7/2026 | País no habilitado oficialmente; requisitos de Creator Rewards | URL en sección 7 |
| S19 | Fundación para el Periodismo (2021 y 2023) | Medios digitales de nicho y dependencia de pauta estatal | URL en sección 7 |

**Nivel C (blog, glosario, enciclopedia, guía comercial)**

| N.º | Fuente | Qué leí | Enlace |
|---|---|---|---|
| S12 | Castos, "IAB podcast measurement explained" | Reglas de conteo de descargas (~60 s, 24 h, bots) | https://castos.com/iab-podcast-measurement-explained/ |
| S13 | Wikipedia, "Viewable impression" | 50 % de píxeles durante 1 segundo (MRC) | https://en.wikipedia.org/wiki/Viewable_impression |
| S18 | Maldrich, "Cómo cobrar en YouTube en Bolivia" | Umbral ~US$ 100, bancos, PIN, comisiones | https://www.maldrich.com/bo/guias/como-cobrar-en-youtube/ |
| S20 | Wikipedia, "Unitel Bolivia" | Propiedad, ratings antiguos, costos de publicidad | https://en.wikipedia.org/wiki/Unitel_Bolivia |

**Resumen:** 19 fuentes distintas abiertas (5 de nivel A, 10 de nivel B contando la documentación de plataformas, 4 de nivel C). Se cumple el mínimo de 8 fuentes y 4 de nivel A leídas. Aclaración: S1, S4 y S5 leí resumen e introducción, no el artículo entero; S2 y S3 leí tramos largos, no completos.

---

## 9. No confirmado

1. **Definiciones de alcance, frecuencia, GRP, CTR y fill rate.** Las usé como definiciones estándar de la industria. No abrí una fuente primaria (IAB, MRC, Nielsen, texto universitario) que las defina. Los resultados de búsqueda coincidían en GRP = alcance x frecuencia y en que fill rate es la parte de espacios llenados, pero son glosarios, diapositivas y blogs que no abrí.
2. **Documentos primarios del MRC y del IAB.** Viewability (50 % de píxeles, 1 segundo) y las reglas de conteo de podcast las tomé de Wikipedia y de un blog de podcasts. Un resultado de búsqueda decía que el video necesita 2 segundos continuos y que unidades grandes pueden usar 30 %; solo está en resúmenes y no lo usé.
3. **Cifra de pago de YouTube en Bolivia.** Un sitio de estimaciones (que no abrí) decía unos US$ 0,38 por 1.000 vistas. No la uso como parámetro. No tengo CPM ni RPM reales de Bolivia para ningún formato.
4. **Inversión publicitaria total de Bolivia, su reparto por medio y su estacionalidad.** No la encontré (la búsqueda con ANP, IAB Bolivia y términos afines no devolvió datos de Bolivia). Los rangos de estacionalidad de la situación 4 son estimación.
5. **Requisitos vigentes de monetización en Bolivia.** Los requisitos globales de YouTube están en S8; que Bolivia esté o no habilitada en cada programa lo tomé de guías locales (S17, S18), no de documentación oficial de la plataforma.
6. **Estado del impuesto a servicios digitales y publicidad digital en Bolivia (IVA de 13 %).** Solo vi resúmenes de búsqueda de una nota de DPL News sobre un proyecto de 2020 a 2021. No sé si fue aprobado, modificado o archivado. La situación 15 es hipotética por eso.
7. **Datos de caída de pauta privada en Bolivia** (crisis cambiaria, recortes de presupuesto). El contexto de crisis económica aparece mencionado en S15, pero no encontré cifras de recorte de pauta privada.
8. **Magnitudes de las situaciones.** Salvo las cifras citadas con fuente (comisiones de redes, CPM, rangos de intervalo de ROI, alcance por plataforma), todas las magnitudes en direcciones y porcentajes de la sección 5 son estimación mía y deben calibrarse con datos reales o con el criterio del owner.
9. **Libros de texto.** No abrí ninguna ficha de catálogo de libros de economía de medios (por ejemplo Napoli, *Audience Economics*) ni de planificación de medios, así que no cito ninguno.
10. **Anderson y Gabszewicz (2006), "The Media and Advertising: A Tale of Two-Sided Markets".** Vi la ficha en IDEAS (CEPR DP 5223 y capítulo de *Handbook of the Economics of Art and Culture*, vol. 1, Elsevier, pp. 567-614) pero no pude abrir el texto. Lo conocí a través de S3, que lo cita.
11. **Ejemplos bolivianos faltantes.** No encontré casos con cifras de ingreso de un canal de YouTube, podcast o influencer boliviano, ni de radios locales. Tampoco abrí datos de rating actuales de la TV boliviana (los de Unitel son de 2007 y 2011).
12. **Versión de Evans.** Leí la versión de 2008 de *Review of Network Economics*. La versión publicada en *Journal of Economic Perspectives* (2009) solo la vi en ficha; no verifiqué que las cifras sean idénticas.
13. **Atribución de causas del cierre de Página Siete.** La explicación citada es de la ANPB; los dueños del diario dan otra (resumen que no abrí). No juzgo cuál es correcta.
