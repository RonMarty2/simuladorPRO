-- ============================================================================
-- 038 — Eventos propios de proyectos de EVENTOS y SERVICIOS CON FECHAS PICO
-- Fuente: docs/metodologia/tipos/eventos-servicios-sorpresa.md (seccion 5).
--
-- Categoria eventos (festivales, ferias, producciones, servicios de sorpresa
-- como el envio de flores con el "patron" vestido de charro). Idempotente.
-- Magnitudes: estimaciones a calibrar (seccion 10 de la ficha). Aqui "demanda"
-- representa los pedidos o la asistencia del periodo.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('EVE001',
 'Llega la fecha pico y los pedidos superan tu capacidad',
 'A pocos días de la fecha más fuerte del año (San Valentín, Día de la Madre, Carnaval) entran más pedidos de los que tu equipo puede cumplir. Cada hora del día pico es capacidad que no se recupera después, y algunos clientes ofrecen pagar más.',
 'oportunidad', 'curado', 0.12, 3, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.40}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cerrar pedidos al llegar al tope","consecuencias":{"demanda":"*0.85","reputacion":"+4%"},"feedback_corto":"Entregas puntuales y reputación intacta, pero dejas de vender en tu mejor día y los rechazados se van con otro"},
   {"letra":"B","texto":"Subir el precio en la fecha pico","consecuencias":{"precio_venta":"*1.20","demanda":"*0.92","reputacion":"-4%"},"feedback_corto":"Llenas la capacidad con quienes más pagan, pero hay quejas por abusar de la fecha"},
   {"letra":"C","texto":"Contratar personal eventual solo por el día","consecuencias":{"costos":"+6%","demanda":"*1.10","reputacion":"-5%"},"feedback_corto":"Más capacidad, pero con menos calidad por personal sin entrenar y más riesgo de fallas y malas reseñas"},
   {"letra":"D","texto":"Ofrecer entregas o funciones adelantadas con descuento","consecuencias":{"precio_venta":"*0.94","demanda":"*1.05"},"feedback_corto":"Alivias el día más cargado, pero a algunos clientes les quita la gracia y pierdes ingreso por el descuento"}
 ]'::jsonb),

('EVE002',
 'Cancelaciones de último momento y destinatarios que rechazan la sorpresa',
 'Un cliente cancela dos horas antes, otro pide la entrega y la persona no está o se enoja y rechaza el servicio. Si ya compraste el material o armaste el pedido, el costo ya está hecho. En fechas pico entre 5% y 15% de los pedidos puede caerse.',
 'servicios', 'curado', 0.11, 3, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cobrar un anticipo de 50% no reembolsable","consecuencias":{"caja":"+4%","demanda":"*0.95"},"feedback_corto":"Reduces cancelaciones y cubres el costo del material, pero ahuyentas a clientes indecisos y hay más reclamos"},
   {"letra":"B","texto":"Cobrar todo al entregar","consecuencias":{"demanda":"*1.04","caja":"-4%"},"feedback_corto":"Más conversión, pero asumes la pérdida del material y del tiempo si cancelan o rechazan"},
   {"letra":"C","texto":"Permitir reprogramar sin costo hasta 24 horas antes","consecuencias":{"reputacion":"+4%","demanda":"*0.97"},"feedback_corto":"Buena experiencia, pero en días llenos reprogramar te quita capacidad que podías vender"},
   {"letra":"D","texto":"Aceptar más pedidos de los que caben esperando cancelaciones","consecuencias":{"demanda":"*1.08","reputacion":"-6%"},"feedback_corto":"Llenas la capacidad, pero si nadie cancela dejas sin servicio a un cliente que ya pagó"}
 ]'::jsonb),

('EVE003',
 'Lluvia, bloqueo o paro el día del pico',
 'Llueve fuerte, o hay un bloqueo o paro de transporte en la ciudad justo el día de mayor demanda. Las entregas o la asistencia se complican, se maltrata el material y algunos clientes cancelan. El riesgo de un solo día se paga con la reputación de todo el año.',
 'logistico', 'curado', 0.10, 4, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.70}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener la promesa de hora exacta y arriesgar","consecuencias":{"reputacion":"-6%","demanda":"*1.10"},"feedback_corto":"Si funciona destacas, pero si falla vienen reseñas malas y reembolsos"},
   {"letra":"B","texto":"Avisar y reprogramar al día siguiente con un obsequio","consecuencias":{"costos":"+3%","reputacion":"+2%"},"feedback_corto":"Reduces el enojo, pero llenas la capacidad del día siguiente con atrasos y regalas margen"},
   {"letra":"C","texto":"Reembolso total a quien se atrase","consecuencias":{"caja":"-7%","reputacion":"+5%"},"feedback_corto":"Proteges la reputación, pero pagas con caja en el peor día y se pierde el material ya comprado"},
   {"letra":"D","texto":"Tener un plan B logístico (movilidad adicional, rutas por zona)","consecuencias":{"costos":"+4%","demanda":"*1.12","reputacion":"+2%"},"feedback_corto":"Reduces el riesgo de tráfico, pero es un costo fijo que usas pocas veces al año"}
 ]'::jsonb),

('EVE004',
 'Un video se vuelve viral y los pedidos se multiplican',
 'Una entrega o función que grabaste llega a cientos de miles de personas y los mensajes pasan de unos cuantos a miles, incluso en fechas que no son pico. La demanda se multiplica por 2 a 5 durante algunas semanas.',
 'oportunidad', 'curado', 0.08, 5, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar todo y escalar rápido (contratar, comprar más)","consecuencias":{"costos":"+10%","caja":"-5%","demanda":"*1.12"},"feedback_corto":"Capturas la ola, pero si baja quedas con costos fijos y personal sobrante"},
   {"letra":"B","texto":"Abrir lista de espera y subir el precio","consecuencias":{"precio_venta":"*1.15","demanda":"*0.92","reputacion":"-2%"},"feedback_corto":"Cuidas la calidad y capturas mejor margen, pero algunos clientes se enfrían y la espera genera quejas"},
   {"letra":"C","texto":"Incorporar un sistema de atención al cliente","consecuencias":{"costos":"+3%","reputacion":"+5%","demanda":"*1.06"},"feedback_corto":"No pierdes pedidos por el chat, con un pago mensual y entrenamiento"},
   {"letra":"D","texto":"Licenciar la marca a operadores de otras ciudades","consecuencias":{"caja":"+4%","reputacion":"-5%"},"feedback_corto":"Creces sin inversión propia, pero pierdes el control de la calidad y de la marca"}
 ]'::jsonb),

('EVE005',
 'Aparecen imitadores con tu misma idea y precios más bajos',
 'Otros negocios copian tu idea, tu personaje o incluso tu nombre y venden más barato. Cuando el producto es fácil de copiar, la ventaja está en la marca y en la calidad de ejecución. Tu demanda puede caer entre 10% y 30% si el imitador baja el precio 30%.',
 'comercio', 'curado', 0.09, 5, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar el precio para igualar","consecuencias":{"precio_venta":"*0.88","demanda":"*1.10"},"feedback_corto":"Mantienes el volumen, pero el margen cae y empiezas una guerra de precios"},
   {"letra":"B","texto":"Diferenciarte con calidad (mejor personaje, puntualidad garantizada)","consecuencias":{"caja":"-4%","costos":"+2%","reputacion":"+7%"},"feedback_corto":"Defiendes tu margen, pero invertir cuesta y pierdes a los clientes sensibles al precio"},
   {"letra":"C","texto":"Registrar la marca y reclamar","consecuencias":{"caja":"-3%","reputacion":"+2%"},"feedback_corto":"Protección a largo plazo, con dinero y tiempo legales y un resultado incierto"},
   {"letra":"D","texto":"Lanzar una segunda línea más económica","consecuencias":{"demanda":"*1.06","precio_venta":"*0.96","costos":"+2%"},"feedback_corto":"Cubres el segmento barato, pero canibalizas tu línea principal y complicas la operación"}
 ]'::jsonb),

('EVE006',
 'Crisis reputacional en redes',
 'Se difunde un video negativo: un repartidor que llega tarde, un servicio que sorprendió a quien no debía, un susto por ruido o una acusación contra el dueño. Si tu negocio vive de las redes, la reputación es un activo con valor económico.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.80},{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Responder rápido, pedir disculpas y compensar al cliente","consecuencias":{"caja":"-3%","reputacion":"+10%"},"feedback_corto":"Contienes el daño, pero cuesta dinero y puedes aceptar una culpa que no es toda tuya"},
   {"letra":"B","texto":"Borrar o ignorar","consecuencias":{"reputacion":"-6%","demanda":"*0.95"},"feedback_corto":"No gastas, pero parece que ocultas algo y el hecho puede crecer igual"},
   {"letra":"C","texto":"Cambiar la imagen del personaje o de la marca","consecuencias":{"caja":"-4%","reputacion":"+5%","demanda":"*0.95"},"feedback_corto":"Te separas de lo ocurrido, pero pierdes el reconocimiento que habías ganado"},
   {"letra":"D","texto":"Contratar a alguien que maneje la comunicación","consecuencias":{"costos":"+4%","reputacion":"+7%"},"feedback_corto":"Profesionalizas la respuesta, con un gasto fijo que pesa más en los meses valle"}
 ]'::jsonb),

('EVE007',
 'Necesitas el triple de personal en el pico: fijos o eventuales',
 'El 14 de febrero y el 27 de mayo necesitas el triple de repartidores o de personal que el resto del año. Mantener gente fija todo el año consume caja en el valle; los eventuales son baratos pero menos confiables. Las horas extra y el trabajo en feriados tienen recargo.',
 'laboral', 'curado', 0.10, 3, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Plantilla fija dimensionada para el pico","consecuencias":{"costos":"+8%","reputacion":"+5%","demanda":"*1.08"},"feedback_corto":"Calidad y disponibilidad, pero pagas gente que en el valle no tiene trabajo"},
   {"letra":"B","texto":"Plantilla fija pequeña y eventuales en el pico","consecuencias":{"costos":"+3%","reputacion":"-3%","demanda":"*1.05"},"feedback_corto":"Cuesta menos, con riesgo de fallas el día clave, recargos y necesidad de entrenar"},
   {"letra":"C","texto":"Trabajar con repartidores independientes por pedido","consecuencias":{"costos":"-2%","reputacion":"-5%","demanda":"*1.04"},"feedback_corto":"Costo totalmente variable, pero menos control de la puntualidad y riesgo legal por relación laboral encubierta"},
   {"letra":"D","texto":"Limitar el negocio a lo que cabe con el equipo actual","consecuencias":{"demanda":"*0.92","reputacion":"+3%"},"feedback_corto":"Sin riesgo de calidad, pero con un techo de ventas"}
 ]'::jsonb),

('EVE008',
 'Caja apretada: compras antes de cobrar, y aparecen intentos de estafa',
 'Para el pico compras material semanas antes, y parte de los pedidos se cobra al entregar. Además circulan cuentas falsas que cobran por adelantado a nombre de negocios como el tuyo. Un VAN positivo no te salva si la caja se acaba antes del pico.',
 'financiero', 'curado', 0.09, 3, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pedir un crédito corto para financiar la compra","consecuencias":{"deuda":"+8%","caja":"+6%"},"feedback_corto":"No frenas el pico, pero pagas intereses y, si el pico falla, la deuda queda"},
   {"letra":"B","texto":"Cobrar anticipo total por canal oficial (QR o transferencia verificada)","consecuencias":{"caja":"+7%","demanda":"*0.94"},"feedback_corto":"Caja anticipada y menos fraude, pero algunos clientes desconfían de pagar antes"},
   {"letra":"C","texto":"Comprar menos material y limitar los pedidos","consecuencias":{"demanda":"*0.90","caja":"+2%"},"feedback_corto":"Menos riesgo, pero pierdes ventas en tu mejor día"},
   {"letra":"D","texto":"Negociar con el proveedor un pago diferido","consecuencias":{"costos":"+3%","caja":"+4%"},"feedback_corto":"Alivias la caja, a cambio de un precio más alto o de perder el descuento por pago contado"}
 ]'::jsonb),

('EVE009',
 'Reclamo municipal por ruido o vía pública, o un susto con tu escena',
 'Una entrega o función con música, confeti o petardos de juguete molesta a los vecinos o asusta a alguien. Las autoridades pueden sancionar el ruido y, si hay video, el caso se viraliza. No siempre sabes qué permisos municipales exige tu actividad.',
 'sectorial', 'curado', 0.07, 5, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Quitar los elementos de riesgo (ruido, petardos) en todas las entregas","consecuencias":{"reputacion":"+4%","demanda":"*0.95"},"feedback_corto":"Menos incidentes, pero la escena pierde parte del impacto que vende"},
   {"letra":"B","texto":"Pedir los permisos y asumir el costo","consecuencias":{"costos":"+3%","reputacion":"+5%"},"feedback_corto":"Seguridad legal, con tiempo y trámites y posible alza de precios"},
   {"letra":"C","texto":"Hacerlo solo en lugares privados o avisando al destinatario","consecuencias":{"demanda":"*0.93","reputacion":"+2%"},"feedback_corto":"Menos riesgo, pero se pierde la sorpresa y algunos clientes ya no contratan"},
   {"letra":"D","texto":"Seguir igual y pagar las multas cuando lleguen","consecuencias":{"caja":"-3%","reputacion":"-7%"},"feedback_corto":"Máxima experiencia, pero con incertidumbre, sanciones repetidas y daño de imagen"}
 ]'::jsonb),

('EVE010',
 'Se te cae el pico por una causa externa',
 'Una fecha comercial cambia de día, hay un paro, una pandemia o simplemente se enfría la moda, y el pico del año rinde mucho menos que el anterior. Tus costos fijos se mantienen y el material comprado se pierde.',
 'sectorial', 'curado', 0.07, 6, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.55}]}'::jsonb,
 '[
   {"letra":"A","texto":"Recortar costos fijos de inmediato (personal, alquiler)","consecuencias":{"costos":"-12%","reputacion":"-5%"},"feedback_corto":"Sobrevives, pero pierdes capacidad cuando vuelva la demanda y dañas el clima interno"},
   {"letra":"B","texto":"Pivotar a venta en línea o entrega sin personaje","consecuencias":{"demanda":"*1.20","precio_venta":"*0.92","reputacion":"-3%"},"feedback_corto":"Mantienes ingreso, pero pierdes tu diferenciación y compites con negocios tradicionales"},
   {"letra":"C","texto":"Usar la reserva de caja","consecuencias":{"caja":"-6%","reputacion":"+2%"},"feedback_corto":"No tocas el negocio, pero consumes el colchón del próximo valle (y si no hay reserva, no es posible)"},
   {"letra":"D","texto":"Cerrar temporalmente","consecuencias":{"costos":"-15%","demanda":"*0.80","reputacion":"-6%"},"feedback_corto":"Limitas pérdidas, pero pierdes marca y cartera de clientes"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
