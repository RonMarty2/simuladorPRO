-- ============================================================================
-- 035 — Eventos propios del tipo "suscripciones y membresías"
-- Fuente: docs/metodologia/tipos/suscripcion-saas.md (seccion 5, situaciones).
--
-- Se marcan con 'tipo:suscripcion': solo les llegan a proyectos de ese tipo
-- (gimnasio, academia online, coworking, podcast premium). Idempotente.
--
-- Las magnitudes son estimaciones a calibrar (ver seccion 10 de la ficha).
-- Las consecuencias usan solo variables que el motor ya maneja; "demanda"
-- representa el nivel de socios activos (altas menos bajas).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('SUS001',
 'Llega la ola de inscripciones de inicio de año',
 'Por el calendario escolar y los propósitos de enero entran muchos socios nuevos de golpe. Una parte importante nunca usa el servicio de verdad y se da de baja en los primeros meses. Tu soporte y tu infraestructura se ven exigidos.',
 'oportunidad', 'curado', 0.12, 3, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aprovechar la ola con más gasto en publicidad y comisiones a vendedores","consecuencias":{"costos_comercializacion":"+10%","demanda":"*1.15","caja":"-5%"},"feedback_corto":"Llegas a más gente mientras hay interés, pero el costo por socio sube y muchos se van antes de recuperarlo"},
   {"letra":"B","texto":"Captar solo con canales orgánicos y recomendaciones","consecuencias":{"demanda":"*1.03","reputacion":"+2%"},"feedback_corto":"Quienes llegan recomendados suelen quedarse más, pero dejas parte de la ola a la competencia"},
   {"letra":"C","texto":"Invertir en una buena bienvenida (guía, llamada, contenido de primeros pasos)","consecuencias":{"costos":"+3%","reputacion":"+6%","demanda":"*1.05"},"feedback_corto":"Reduces las bajas de los meses 2 a 4, a cambio de un gasto fijo con retorno incierto"},
   {"letra":"D","texto":"Cobrar un año adelantado con descuento a quienes entran en la ola","consecuencias":{"caja":"+8%","precio_venta":"*0.94"},"feedback_corto":"Entra caja ya y fijas al socio por 12 meses, pero con descuento permanente y la obligación de servirlo todo el año"}
 ]'::jsonb),

('SUS002',
 'Fallan los cobros: socios que se dan de baja sin querer',
 'Tarjetas vencidas, topes mensuales, QR sin pagar y débitos rechazados hacen que parte de tus socios se "caiga" sin haberlo decidido. Los controles a las tarjetas en dólares complican aún más los cobros de servicios por internet.',
 'financiero', 'curado', 0.10, 4, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pasar el cobro principal a QR o transferencia en bolivianos","consecuencias":{"demanda":"*0.97","caja":"+2%"},"feedback_corto":"Eliminas el problema del dólar, pero el QR exige que el socio pague cada mes y tendrás que perseguir morosos"},
   {"letra":"B","texto":"Contratar un sistema de cobro con reintentos y avisos automáticos","consecuencias":{"costos":"+3%","demanda":"*1.04"},"feedback_corto":"Recuperas buena parte de los cobros fallidos, pagando desarrollo y comisión por transacción"},
   {"letra":"C","texto":"Ofrecer descuento por pagar el año adelantado","consecuencias":{"caja":"+6%","precio_venta":"*0.95"},"feedback_corto":"Un solo cobro al año y caja por adelantado, a cambio de descuento y posibles reclamos de devolución"},
   {"letra":"D","texto":"No hacer nada y absorber la pérdida","consecuencias":{"demanda":"*0.97"},"feedback_corto":"Cero costo, pero miras solo las bajas y asumes que son decisión del socio"}
 ]'::jsonb),

('SUS003',
 'Sube el costo de lo que pagas en dólares',
 'Pagas en dólares servidores, licencias, herramientas o contenido, y cobras en bolivianos. Las restricciones de pago al exterior encarecen esos servicios y el tipo de cambio efectivo sube.',
 'macroeconomico', 'curado', 0.09, 6, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.12}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir la cuota en bolivianos","consecuencias":{"precio_venta":"*1.08","demanda":"*0.94"},"feedback_corto":"Proteges el margen, pero algunos socios se van y abres espacio a competidores locales"},
   {"letra":"B","texto":"Cambiar a proveedores locales o más baratos","consecuencias":{"costos":"-4%","caja":"-4%","reputacion":"-2%"},"feedback_corto":"Pagas en bolivianos sin tope, pero migrar cuesta tiempo y la calidad o la escala pueden ser menores"},
   {"letra":"C","texto":"Cobrar una parte en dólares a clientes empresa","consecuencias":{"precio_venta":"*1.04","costos":"+1%"},"feedback_corto":"Te cubres con quienes tienen dólares, pero solo sirve para algunos clientes y complica la administración"},
   {"letra":"D","texto":"Absorber el costo para no perder socios","consecuencias":{"costos":"+5%"},"feedback_corto":"No hay bajas extra, pero tu margen se erosiona y, si sigue subiendo, pierdes dinero por socio"}
 ]'::jsonb),

('SUS004',
 'Quieres subir la cuota',
 'Subir la cuota es la forma más rápida de mejorar el margen. Pero el socio puede irse, y cuánto se va depende de qué alternativas ve y de cómo se lo comuniques.',
 'sectorial', 'curado', 0.10, 5, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir 5% explicando que hay más demanda y menos competidores","consecuencias":{"precio_venta":"*1.05","demanda":"*0.99"},"feedback_corto":"Pocas bajas si el mensaje es verdad; si no lo es, dañas la confianza"},
   {"letra":"B","texto":"Subir 15% de golpe","consecuencias":{"precio_venta":"*1.15","demanda":"*0.90","reputacion":"-4%"},"feedback_corto":"Mejora fuerte del margen, pero se van más socios y la explicación de costos no ayuda"},
   {"letra":"C","texto":"Subir solo a los socios nuevos y mantener el precio a los antiguos","consecuencias":{"precio_venta":"*1.02","reputacion":"+1%"},"feedback_corto":"Casi sin bajas, pero el margen mejora lento y quedas con dos listas de precios"},
   {"letra":"D","texto":"No subir y compensar recortando costos","consecuencias":{"costos":"-4%","reputacion":"-4%"},"feedback_corto":"Sin riesgo de bajas, pero recortar costos puede bajar la calidad que el socio percibe"}
 ]'::jsonb),

('SUS005',
 'Promoción agresiva: primer mes casi gratis',
 'Quieres crecer rápido con una promoción fuerte. Atrae muchos socios, pero los que llegan por descuento tienden a irse cuando termina. En Bolivia el cliente ya está acostumbrado a precios muy bajos en servicios digitales de reventa.',
 'oportunidad', 'curado', 0.10, 4, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Tres meses a mitad de precio","consecuencias":{"demanda":"*1.30","precio_venta":"*0.80","caja":"-4%"},"feedback_corto":"Llenas la base rápido, pero muchos se van al volver al precio normal y la caja sufre"},
   {"letra":"B","texto":"Promoción solo para el plan anual","consecuencias":{"demanda":"*1.10","caja":"+7%","precio_venta":"*0.92"},"feedback_corto":"Caja adelantada y compromiso de 12 meses, aunque entra menos gente"},
   {"letra":"C","texto":"Sin promoción: prueba gratis corta","consecuencias":{"demanda":"*1.06","costos":"+1%"},"feedback_corto":"El cliente conoce el producto antes de pagar, pero creces más lento"},
   {"letra":"D","texto":"Programa de referidos: un mes gratis por cada socio nuevo","consecuencias":{"demanda":"*1.12","costos_comercializacion":"+3%"},"feedback_corto":"Solo pagas si hay un alta real, aunque puedes atraer socios del mismo perfil de poco uso"}
 ]'::jsonb),

('SUS006',
 'Aparecen cuentas compartidas y revendedores baratos',
 'Vendedores informales ofrecen un acceso parecido al tuyo a una fracción del precio, con pago por QR y activación inmediata. Pierdes sobre todo a los socios más sensibles al precio.',
 'comercio', 'curado', 0.09, 5, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar el precio o crear un plan económico","consecuencias":{"precio_venta":"*0.92","demanda":"*1.08"},"feedback_corto":"Compites en precio y frenas la fuga, pero bajas el ingreso de toda la base si migran al plan barato"},
   {"letra":"B","texto":"Reforzar el producto con funciones, soporte y garantías solo para cuentas oficiales","consecuencias":{"costos":"+4%","reputacion":"+7%","demanda":"*1.04"},"feedback_corto":"Te diferencias en lo que el revendedor no puede copiar, con una inversión de retorno incierto"},
   {"letra":"C","texto":"Bloquear cuentas compartidas y tomar medidas contra la reventa","consecuencias":{"costos":"+2%","reputacion":"-4%","demanda":"*1.03"},"feedback_corto":"Proteges el ingreso, pero molestas a algunos clientes legítimos"},
   {"letra":"D","texto":"Aceptar al revendedor como canal con precio mayorista","consecuencias":{"demanda":"*1.12","precio_venta":"*0.88"},"feedback_corto":"Ganas un canal de ventas a granel, pero pierdes el vínculo con el cliente final y margen"}
 ]'::jsonb),

('SUS007',
 'El servicio se cae durante horas',
 'Un fallo técnico, un corte de conectividad o un incidente de seguridad deja tu servicio sin funcionar. Quien paga una suscripción espera que esté disponible siempre, y varios socios ya reclaman en redes.',
 'tecnologico', 'curado', 0.08, 4, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.90},{"campo":"demanda","operacion":"multiplicar","valor":0.96}]}'::jsonb,
 '[
   {"letra":"A","texto":"Compensar a todos con un mes gratis o crédito","consecuencias":{"caja":"-7%","reputacion":"+8%"},"feedback_corto":"Proteges la relación con todos, a cambio de regalar un mes de ingresos"},
   {"letra":"B","texto":"Compensar solo a quienes reclamen","consecuencias":{"caja":"-2%","reputacion":"+2%"},"feedback_corto":"Sale más barato, pero los que no reclaman pueden irse en silencio"},
   {"letra":"C","texto":"Invertir en servidores de respaldo y alertas","consecuencias":{"caja":"-8%","costos":"+2%","reputacion":"+6%"},"feedback_corto":"Reduces caídas futuras, con un gasto fijo cuyo beneficio es invisible mientras nada pasa"},
   {"letra":"D","texto":"Explicar con transparencia lo ocurrido y no compensar","consecuencias":{"reputacion":"-3%","demanda":"*0.97"},"feedback_corto":"Ahorras dinero, pero algunos socios se van igual y la confianza depende de la gravedad"}
 ]'::jsonb),

('SUS008',
 'Puedes lanzar un plan premium o módulos adicionales',
 'Hacer crecer a los socios que ya tienes sale más barato que traer nuevos. Un plan superior o un módulo extra puede subir lo que paga cada socio sin gastar en captar.',
 'oportunidad', 'curado', 0.09, 8, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Lanzar un plan premium con funciones nuevas","consecuencias":{"precio_venta":"*1.08","costos":"+3%"},"feedback_corto":"Subes lo que paga cada socio sin captar nuevos, aunque parte se queda en el plan básico"},
   {"letra":"B","texto":"Recortar funciones del plan básico para empujar al premium","consecuencias":{"precio_venta":"*1.12","demanda":"*0.93","reputacion":"-6%"},"feedback_corto":"Mueves rápido a socios al plan caro, pero empujarlos molesta y aumenta las bajas"},
   {"letra":"C","texto":"Vender módulos por separado","consecuencias":{"precio_venta":"*1.05","costos":"+2%"},"feedback_corto":"Cada socio paga lo que usa, con más complejidad de precios y de cobro"},
   {"letra":"D","texto":"No ampliar: invertir en retener a los socios actuales","consecuencias":{"costos":"+2%","reputacion":"+5%","demanda":"*1.03"},"feedback_corto":"Una base más estable, aunque no aprovechas el potencial de crecer con los que ya tienes"}
 ]'::jsonb),

('SUS009',
 'Un tercero te propone incluir tu suscripción en su oferta',
 'Un banco, una telefónica o una plataforma de pagos propone vender tu suscripción dentro de la suya, con cobro simplificado. Traen volumen, pero se quedan con parte de tu margen.',
 'oportunidad', 'curado', 0.08, 6, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar con comisión alta y exclusividad","consecuencias":{"demanda":"*1.40","precio_venta":"*0.70"},"feedback_corto":"Volumen inmediato, pero menos margen y dependencia de un socio que puede cambiar las condiciones"},
   {"letra":"B","texto":"Aceptar sin exclusividad y con comisión negociada","consecuencias":{"demanda":"*1.20","precio_venta":"*0.85"},"feedback_corto":"Puedes buscar otros socios, pero este dedicará menos esfuerzo a promocionarte"},
   {"letra":"C","texto":"Rechazar y construir tus propios canales","consecuencias":{"costos_comercializacion":"+5%","demanda":"*1.05"},"feedback_corto":"Conservas margen y relación con el cliente, a cambio de crecer más lento y gastar más en captar"},
   {"letra":"D","texto":"Probar la alianza en un piloto de tres meses","consecuencias":{"demanda":"*1.10","precio_venta":"*0.94"},"feedback_corto":"Aprendes sin comprometerte, aunque el socio puede perder interés"}
 ]'::jsonb),

('SUS010',
 'Tus socios más intensos se comen el margen',
 'Algunos socios usan el servicio mucho más que el promedio, y tu cuota es fija. Si el costo crece con el uso, el margen de ese grupo se achica.',
 'sectorial', 'curado', 0.08, 7, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.06}]}'::jsonb,
 '[
   {"letra":"A","texto":"Poner un tope de uso o límites por plan","consecuencias":{"costos":"-5%","reputacion":"-5%","demanda":"*0.97"},"feedback_corto":"Proteges el margen, pero algunos de tus socios más leales se van"},
   {"letra":"B","texto":"Subir el precio solo del plan de uso alto","consecuencias":{"precio_venta":"*1.05","demanda":"*0.97"},"feedback_corto":"Quien consume más paga más, con más complejidad y reclamos"},
   {"letra":"C","texto":"Aceptar la pérdida y apostar a que crezcan los ingresos","consecuencias":{"reputacion":"+4%","caja":"-3%"},"feedback_corto":"Ganas lealtad y crecimiento, pero perder dinero por atender a tus socios actuales es la peor señal"},
   {"letra":"D","texto":"Medir el uso por socio y reasignar planes según su consumo","consecuencias":{"costos":"+2%","precio_venta":"*1.03"},"feedback_corto":"Decides con datos, a cambio de invertir en medición"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
