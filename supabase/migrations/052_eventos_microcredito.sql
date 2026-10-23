-- ============================================================================
-- 052 — Eventos propios de proyectos de MICROCREDITO y finanzas
-- Fuente: docs/metodologia/tipos/microcredito-finanzas.md (seccion 5).
--
-- Categoria microcredito. La plantilla es una cooperativa que presta a
-- microempresarios con fondeo propio y de deuda, asi que se usaron las
-- situaciones de ese modelo (competencia y multiendeudamiento, recesion,
-- tope de tasas, reprogramacion masiva, no pago organizado, crecimiento
-- rapido, credito grupal, sobreendeudamiento, fintech, remesas y fondeo
-- barato). Las de captacion de depositos (fuga de depositos) y cartera
-- dirigida de la banca quedan para una plantilla futura. Idempotente. Aqui
-- "demanda" son los creditos colocados y "precio_venta" lo que deja cada
-- credito (tasa mas comisiones); la mora entra por "costos". Magnitudes:
-- estimaciones a calibrar (seccion 10 de la ficha). La crisis de mora de
-- Bolivia 1999-2001 y los decretos de reprogramacion de 2024 y 2026 son
-- precedentes.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('MIC001',
 'Llegan competidores y tus clientes toman varios créditos',
 'Otras entidades abren sucursales en tu zona con montos mayores o desembolso más rápido, y tus mejores clientes toman un segundo y un tercer crédito. En Bolivia, a fines de los años 90, los prestamistas de consumo atrajeron a buenos clientes con créditos más grandes y rápidos, y la mora subió de menos de 5% a casi 9%. Crecer a costa de un cliente que ya debe a otros no es crecer: el riesgo se acumula y aparece en la mora un año después.',
 'comercio', 'curado', 0.11, 3, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.08}]}'::jsonb,
 '[
   {"letra":"A","texto":"Igualar la oferta con montos mayores y aprobación más rápida","consecuencias":{"demanda":"*1.15","costos":"+5%","reputacion":"-3%"},"feedback_corto":"Conservas clientes y volumen, pero pierdes control del análisis y aumentas el riesgo de sobreendeudamiento"},
   {"letra":"B","texto":"Mantener tu método y perder algunos clientes","consecuencias":{"demanda":"*0.92","costos":"-2%","reputacion":"+2%"},"feedback_corto":"Tu cartera es más sana, pero crece menos y presiona la cobertura de los gastos fijos"},
   {"letra":"C","texto":"Consultar siempre el buró de crédito y limitar el monto según la deuda total","consecuencias":{"costos":"+2%","demanda":"*0.97","reputacion":"+3%"},"feedback_corto":"Reduces el multiendeudamiento, como hicieron las entidades que sobrevivieron la crisis, aunque algunos clientes se van y la consulta suma costo"},
   {"letra":"D","texto":"Diferenciarte con servicio y relación (visitas, educación financiera)","consecuencias":{"costos":"+3%","demanda":"*1.04","reputacion":"+4%"},"feedback_corto":"Ganas lealtad y menos mora, con más gasto operativo por cliente y un efecto que tarda"}
 ]'::jsonb),

('MIC002',
 'Recesión o bloqueos: las ventas de tus clientes caen',
 'Un shock golpea a los pequeños negocios: bloqueos de carreteras, escasez de dólares o caída del consumo interno. El ingreso de tus clientes puede bajar entre 10% y 30% durante 3 a 9 meses. En Bolivia 1999-2001 la caída del consumo fue uno de los impulsores de la mora. El microcrédito no es inmune a la economía: depende de la caja de microempresarios que sí se afecta.',
 'macroeconomico', 'curado', 0.10, 4, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.08},{"campo":"demanda","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Apretar la cobranza y exigir cuotas completas","consecuencias":{"caja":"+3%","reputacion":"-5%","costos":"+3%"},"feedback_corto":"Cuidas el flujo de corto plazo, pero más clientes caen en mora real y hay riesgo reputacional y político"},
   {"letra":"B","texto":"Reprogramar caso por caso a quien lo pida","consecuencias":{"costos":"+3%","reputacion":"+2%","demanda":"*0.98"},"feedback_corto":"Conservas al buen cliente, pero el crédito reprogramado queda con más riesgo y puede esconder el deterioro"},
   {"letra":"C","texto":"Frenar nuevos desembolsos y guardar liquidez","consecuencias":{"demanda":"*0.85","caja":"+4%"},"feedback_corto":"Proteges la caja, pero el ingreso baja justo cuando la cartera rinde menos y pierdes crecimiento"},
   {"letra":"D","texto":"Seguir prestando de forma selectiva a los clientes que sobrevivieron","consecuencias":{"demanda":"*1.06","costos":"+4%","reputacion":"+2%"},"feedback_corto":"Puedes captar clientes que otras entidades dejan, con análisis fino y capital para soportar más mora"}
 ]'::jsonb),

('MIC003',
 'El regulador fija un tope a tu tasa activa',
 'Bolivia regula tasas máximas para el crédito productivo según el tamaño de la unidad, por ejemplo 11,5% anual para micro en el Decreto 2055 de 2014. Los topes no incluyen seguros, formularios u otros recargos. La tasa no se elige: se despeja del costo operativo, el fondeo y la pérdida. Un tope por debajo de la tasa de equilibrio obliga a cambiar el modelo, no solo el precio.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cumplir el tope y reducir gastos (menos sucursales, más digital)","consecuencias":{"costos":"-5%","demanda":"*0.95","reputacion":"-2%"},"feedback_corto":"Cumples y mantienes el producto, con menos atención presencial, mala para las zonas rurales"},
   {"letra":"B","texto":"Mover la cartera a créditos no regulados con tasa libre","consecuencias":{"precio_venta":"*1.08","costos":"+5%","reputacion":"-4%"},"feedback_corto":"Mejora el margen, con mayor riesgo, cuestionamiento reputacional y choque con tu cartera dirigida"},
   {"letra":"C","texto":"Subir comisiones y seguros fuera del tope","consecuencias":{"precio_venta":"*1.05","reputacion":"-6%","demanda":"*0.95"},"feedback_corto":"Recuperas margen, pero el costo total para el cliente sube, el regulador puede reglamentarlo y pierdes confianza"},
   {"letra":"D","texto":"Crecer en volumen para diluir costos fijos","consecuencias":{"demanda":"*1.12","costos":"+3%","deuda":"+8%"},"feedback_corto":"Ganas economía de escala, con más capital y control, y el riesgo del crecimiento rápido"}
 ]'::jsonb),

('MIC004',
 'Presión para reprogramar masivamente por un decreto de alivio',
 'El Gobierno emite normas que obligan a las entidades a atender pedidos de reprogramación o refinanciamiento. La cartera reprogramada puede llegar a entre 5% y 20% del total. La mora aparente baja al reprogramar, pero la mora real puede subir después. Reprogramar es una herramienta, no una solución: alivia la caja del cliente a cambio de postergar la pérdida, y la contabilidad puede esconder el problema.',
 'financiero', 'curado', 0.09, 5, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aprobar casi todo lo que piden","consecuencias":{"costos":"+5%","reputacion":"+2%","caja":"-3%"},"feedback_corto":"Cumples la norma y cuidas la relación, pero mezclas buenos y malos deudores y la mora aparece después"},
   {"letra":"B","texto":"Evaluar uno a uno con visita del asesor","consecuencias":{"costos":"+3%","reputacion":"-1%","demanda":"*0.97"},"feedback_corto":"Separas al cliente recuperable del que no, con más gasto operativo, demoras y reclamos"},
   {"letra":"C","texto":"Reprogramar solo con cuota inicial o garantía adicional","consecuencias":{"caja":"+2%","reputacion":"-3%"},"feedback_corto":"Filtras a quien puede pagar, pero puede contradecir la norma si se interpreta como rechazo"},
   {"letra":"D","texto":"Constituir previsiones adicionales antes de que aparezca la mora","consecuencias":{"costos":"+4%","reputacion":"+3%","caja":"+1%"},"feedback_corto":"Te preparas, pero baja la utilidad ahora sin ingreso extra"}
 ]'::jsonb),

('MIC005',
 'Un movimiento de deudores exige no pagar o condonación',
 'Grupos de deudores se organizan para dejar de pagar o exigir perdón de deudas. En Bolivia, en 2000 y 2001, asociaciones de deudores protestaron contra microfinancieras y prestamistas, exigieron condonación y en 2001 tomaron la Superintendencia de Bancos con dinamita. El activo más valioso del microcrédito es la cultura de pago, y se puede destruir por una mala racha con política de por medio.',
 'sectorial', 'curado', 0.06, 6, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener firmeza total y exigir cumplimiento","consecuencias":{"caja":"+2%","reputacion":"-6%","costos":"+3%"},"feedback_corto":"No premias el incumplimiento, pero escalas el conflicto y hay riesgo reputacional y político"},
   {"letra":"B","texto":"Negociar caso por caso con refinanciamiento","consecuencias":{"costos":"+3%","reputacion":"+3%","demanda":"*0.97"},"feedback_corto":"Reduces el conflicto y separas al que no puede del que no quiere, con tiempo y la señal de que protestar funciona"},
   {"letra":"C","texto":"Hacer una campaña de información sobre las condonaciones falsas","consecuencias":{"caja":"-2%","reputacion":"+3%"},"feedback_corto":"Atacas la causa, pero no siempre llegas a tiempo y hay que presupuestarlo"},
   {"letra":"D","texto":"Coordinar con otras entidades y el regulador una respuesta común","consecuencias":{"costos":"+1%","reputacion":"+2%"},"feedback_corto":"Evitas ser la única entidad exigente, pero dependes de otros y puede parecer un cartel"}
 ]'::jsonb),

('MIC006',
 'Creces muy rápido y los asesores nuevos no están entrenados',
 'La cooperativa crece 40% o más al año y contrata asesores a velocidad. En estudios de CGAP, entidades que crecieron entre 33% y 67% anual fallaron en capacitación, sistemas y control, y la mora pasó de cerca de 2% a 7% y luego a 13%. El crecimiento rápido no falla ese año: falla en la cohorte del siguiente. La mora de hoy es consecuencia de decisiones de hace 12 a 24 meses.',
 'operativo', 'curado', 0.09, 5, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.12},{"campo":"costos","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Seguir creciendo a toda velocidad","consecuencias":{"demanda":"*1.15","costos":"+6%","reputacion":"-4%"},"feedback_corto":"Ganas ingresos y escala, pero el deterioro llega tarde, cuando el crecimiento ya fue alto"},
   {"letra":"B","texto":"Crecer al ritmo que permita capacitar, con tope de contrataciones","consecuencias":{"demanda":"*0.95","costos":"+1%","reputacion":"+3%"},"feedback_corto":"Tu cartera es sana, pero pierdes mercado ante competidores y el costo fijo pesa más"},
   {"letra":"C","texto":"Cambiar el incentivo de los asesores: pagar por calidad de cartera además de volumen","consecuencias":{"demanda":"*0.97","costos":"-3%","reputacion":"+3%"},"feedback_corto":"Corriges un conflicto de intereses, con menor producción a corto plazo y posible rotación de asesores"},
   {"letra":"D","texto":"Invertir en sistemas y controles internos antes de crecer más","consecuencias":{"caja":"-5%","costos":"-3%","reputacion":"+2%"},"feedback_corto":"Sostienes el crecimiento futuro, con un gasto que no da ingreso inmediato"}
 ]'::jsonb),

('MIC007',
 'Crédito grupal o individual: la mora se contagia entre los integrantes',
 'Un grupo solidario funciona bien en buenos tiempos porque los miembros se vigilan y se cobran entre sí, pero en una crisis un miembro que cae puede arrastrar a los demás. En Bolivia 1999-2001 el crédito grupal sufrió contagio de los malos pagadores a los buenos, y BancoSol pasó de operar en grupos a hacerlo sobre todo con crédito individual. El grupo abarata en buenos tiempos y se contagia en los malos.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener el modelo grupal","consecuencias":{"costos":"+3%","demanda":"*1.02"},"feedback_corto":"Tienes menor costo por cliente y buena información, con contagio en crisis y menos flexibilidad para el cliente que crece"},
   {"letra":"B","texto":"Pasar a los mejores clientes a crédito individual","consecuencias":{"costos":"+2%","precio_venta":"*1.03","demanda":"*0.97"},"feedback_corto":"Ganas monto y fidelidad, con más análisis y más costo por crédito, y dejas a los grupos con clientes más débiles"},
   {"letra":"C","texto":"Modelo mixto con garantía parcial del grupo y análisis individual","consecuencias":{"costos":"+1%","reputacion":"+2%"},"feedback_corto":"Buscas un balance, pero es complejo de operar y puede salir peor en ambos"},
   {"letra":"D","texto":"Exigir un ahorro previo obligatorio al grupo","consecuencias":{"costos":"-2%","demanda":"*0.95"},"feedback_corto":"Creas un colchón, pero reduces el atractivo del producto y hay que custodiar y reglamentar el ahorro"}
 ]'::jsonb),

('MIC008',
 'Acusaciones de sobreendeudamiento y cobranza agresiva',
 'Se difunden casos de clientes con deudas que no pueden pagar y de cobradores que presionan. El caso extremo es Andhra Pradesh, en India, en 2010, con denuncias de prácticas coercitivas y suicidios de prestatarios, que llevó a topes de margen. El daño por sobreendeudamiento termina siendo un riesgo del propio negocio, con efectos en reputación, regulación y mora, no solo un tema ético.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener la cobranza actual porque funciona","consecuencias":{"caja":"+2%","reputacion":"-7%"},"feedback_corto":"La mora queda controlada, pero hay riesgo de un caso mediático que arrastre a toda la entidad"},
   {"letra":"B","texto":"Adoptar un código de conducta, capacitar y abrir un canal de reclamos","consecuencias":{"costos":"+3%","reputacion":"+6%"},"feedback_corto":"Proteges a los clientes y la marca, con menor productividad de cobranza"},
   {"letra":"C","texto":"Limitar el endeudamiento total por cliente según su ingreso","consecuencias":{"demanda":"*0.93","costos":"-3%","reputacion":"+4%"},"feedback_corto":"Hay menos sobreendeudamiento, pero pierdes clientes y volumen"},
   {"letra":"D","texto":"Transparentar el costo total del crédito, con la tasa efectiva y todos los cargos","consecuencias":{"precio_venta":"*0.97","reputacion":"+5%","demanda":"*1.02"},"feedback_corto":"Ganas confianza y menos reclamos, aunque algunos clientes comparan y se van y el margen se aprieta"}
 ]'::jsonb),

('MIC009',
 'Fintech y pagos QR: nuevos competidores y un nuevo canal',
 'Los pagos con QR crecieron fuerte en Bolivia: en 2020 el 85% de los pagos eran en efectivo y en 2025 el efectivo bajó a 64% y el QR subió a 36%. Esto abre dos caminos: usar los datos de pagos para evaluar clientes y competir contra billeteras y fintech. La tecnología baja costos, entre 30% y 60% del costo de originar, pero no elimina el riesgo de crédito: si se usa para quitar el análisis humano puede repetir los errores del pasado.',
 'oportunidad', 'curado', 0.09, 6, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":0.98}]}'::jsonb,
 '[
   {"letra":"A","texto":"Lanzar un crédito digital totalmente remoto","consecuencias":{"demanda":"*1.15","costos":"+5%","reputacion":"-3%"},"feedback_corto":"Bajas el costo y ganas rapidez, pero sube la mora y el fraude y se parece al modelo de fábrica que fracasó antes"},
   {"letra":"B","texto":"Digitalizar solo pagos y desembolsos, y mantener la visita del asesor","consecuencias":{"costos":"-3%","caja":"-2%","reputacion":"+2%"},"feedback_corto":"Reduces costos de caja y mora por olvido sin perder la relación, con un ahorro menor"},
   {"letra":"C","texto":"Aliarte con una fintech o una billetera","consecuencias":{"demanda":"*1.10","precio_venta":"*0.97"},"feedback_corto":"Llegas a más clientes sin construir tecnología, pero compartes margen y datos y dependes del socio"},
   {"letra":"D","texto":"Ignorar la tendencia","consecuencias":{"demanda":"*0.95","costos":"-1%"},"feedback_corto":"No gastas ahora, pero pierdes clientes jóvenes y comercios que ya cobran por QR"}
 ]'::jsonb),

('MIC010',
 'Caen las remesas que sostienen a los hogares clientes',
 'Muchos hogares pagan su deuda con dinero enviado por familiares en el exterior. Las remesas bajan en las crisis internacionales, y los hogares que dependen de ellas tienen dificultades para pagar. El ingreso de esos hogares puede caer entre 15% y 30% y la mora en esa parte de tu cartera sube con un rezago de 3 a 6 meses. El riesgo de la cartera viene de la fuente de ingreso de tus clientes, aunque tu negocio parezca local.',
 'macroeconomico', 'curado', 0.08, 5, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Identificar qué parte de la cartera depende de remesas y subir previsiones ahí","consecuencias":{"costos":"+3%","caja":"-2%","reputacion":"+2%"},"feedback_corto":"Te preparas, con gasto contable ahora y una medición que exige datos que quizá no tienes"},
   {"letra":"B","texto":"Reducir el monto máximo a hogares dependientes de remesas","consecuencias":{"demanda":"*0.95","costos":"-2%"},"feedback_corto":"Tienes menos exposición, pero pierdes un segmento rentable"},
   {"letra":"C","texto":"Ofrecer cuotas que se adapten a los envíos, con pagos irregulares","consecuencias":{"costos":"+2%","demanda":"*1.04","reputacion":"+3%"},"feedback_corto":"Te ajustas a su flujo, con complejidad operativa y más seguimiento"},
   {"letra":"D","texto":"No hacer nada y esperar","consecuencias":{"costos":"+4%","reputacion":"-2%"},"feedback_corto":"No gastas, pero la mora te sorprende"}
 ]'::jsonb),

('MIC011',
 'Oportunidad: te ofrecen fondeo barato de largo plazo, con condiciones',
 'Un fondo de inversión, un organismo multilateral o un banco de desarrollo te ofrece una línea de fondeo con tasa menor a tu costo actual, a cambio de metas, por ejemplo clientes rurales, mujeres o crédito productivo, y de reportar indicadores. El costo de fondeo puede bajar entre 1 y 3 puntos. El costo de fondeo no es todo: importa su estabilidad, sus condiciones y quién puede retirarlo.',
 'oportunidad', 'curado', 0.09, 6, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":0.97}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar la línea completa y crecer","consecuencias":{"deuda":"+10%","demanda":"*1.14","costos":"-3%"},"feedback_corto":"Ganas margen y volumen, pero dependes del financista y hay presión de crecer rápido"},
   {"letra":"B","texto":"Aceptar solo una parte y mantener tu captación propia","consecuencias":{"deuda":"+5%","demanda":"*1.07","costos":"-2%"},"feedback_corto":"Diversificas el fondeo, con menor beneficio inmediato"},
   {"letra":"C","texto":"Rechazarla y financiarte con ahorros de los socios","consecuencias":{"costos":"+2%","caja":"+3%","reputacion":"+2%"},"feedback_corto":"Ganas autonomía, pero cuesta más, exige ahorristas y se puede fugar"},
   {"letra":"D","texto":"Negociar la línea con plazos largos y sin penalidades de salida","consecuencias":{"deuda":"+6%","costos":"-2%","demanda":"*1.08"},"feedback_corto":"Reduces el riesgo, aunque el financista puede pedir una tasa mayor o no aceptar"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
