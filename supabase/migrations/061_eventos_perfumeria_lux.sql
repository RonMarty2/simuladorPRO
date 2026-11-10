-- ============================================================================
-- 061 — Banco de situaciones propias de perfumería retail y comercio (LUX)
-- Proyecto: Reto Perfumería LUX en Cochabamba (Investigación de Mercados y Finanzas).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('LUX001',
 'Comparacion con Marketplace: perfume arabe 30% mas barato',
 'Varios clientes llegan a tu tienda mostrando publicaciones de Facebook Marketplace en Cochabamba donde ofrecen una fragancia arabe inspirada un 30% mas barata que tu producto de disenador. Preguntan por que pagar mas en tu tienda.',
 'comercio', 'curado', 0.14, 2, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Capacitar al personal para explicar notas olfativas sin desprestigiar","consecuencias":{"costos_comercializacion":"+3%","demanda":"*1.08","reputacion":"+3%"},"feedback_corto":"Educar requiere paciencia pero genera compra informada y confianza duradera"},
   {"letra":"B","texto":"Bajar el precio de inmediato para igualar la oferta de Marketplace","consecuencias":{"precio_venta":"*0.88","demanda":"*1.12","caja":"-3%"},"feedback_corto":"Ganas volumen de corto plazo destruyendo tu margen y desvalorizando tu marca"},
   {"letra":"C","texto":"Incorporar tambien esa linea arabe formal en tienda con garantia y probador","consecuencias":{"costos":"+4%","demanda":"*1.15","caja":"-2%"},"feedback_corto":"Amplias tu oferta captando ese segmento sin perder tu posicion formal"},
   {"letra":"D","texto":"Descalificar las publicaciones informales en tus redes sociales","consecuencias":{"reputacion":"-4%","demanda":"*0.95"},"feedback_corto":"Atacar a la competencia informal sin pruebas genera rechazo y desconfianza"}
 ]'::jsonb),

('LUX002',
 'Rumor en redes: afirman que la tienda vende perfumes rellenados',
 'Un comentario en TikTok y grupos de compra-venta de Cochabamba asegura que compraste frascos originales vacios para rellenarlos con esencias baratas. El video se comparte mas de doscientas veces en pocas horas.',
 'riesgo', 'curado', 0.08, 4, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"sumar","valor":-0.12}]}'::jsonb,
 '[
   {"letra":"A","texto":"Publicar video mostrando sellos aduaneros, importacion y lote de origen","consecuencias":{"costos_comercializacion":"+2%","reputacion":"+6%","demanda":"*1.05"},"feedback_corto":"La evidencia documental frena el rumor y refuerza tu reputacion formal"},
   {"letra":"B","texto":"Borrar comentarios y amenazar con demandas legales en un comunicado frio","consecuencias":{"reputacion":"-6%","demanda":"*0.90"},"feedback_corto":"La censura suele alimentar la sospecha en redes sociales"},
   {"letra":"C","texto":"Invitar a clientes y creadores locales a destapar frascos sellados en vivo","consecuencias":{"caja":"-1%","reputacion":"+5%","costos_comercializacion":"+2%"},"feedback_corto":"Involucras a la comunidad y muestras apertura asumiendo el costo del probador"},
   {"letra":"D","texto":"Lanzar una promocion de 2x1 para desviar la atencion rapido","consecuencias":{"precio_venta":"*0.90","caja":"+3%","reputacion":"-3%"},"feedback_corto":"Consigues caja inmediata pero confirmas indirectamente la duda"}
 ]'::jsonb),

('LUX003',
 'Meta rechaza anuncio por afirmacion sobre autenticidad no verificable',
 'Tu campana publicitaria en Instagram es rechazada por prometer 100% garantizado original sin adjuntar documentacion regulatoria exigida por Meta. La pauta se frena y el costo por contacto en WhatsApp se dispara.',
 'marketing', 'curado', 0.12, 3, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"costos_comercializacion","operacion":"multiplicar","valor":1.15}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reescribir el copy enfocandose en la experiencia sensorial y asesoria","consecuencias":{"costos_comercializacion":"*0.92","demanda":"*1.04"},"feedback_corto":"Cumples politicas y comunicas valor real sin caer en promesas absolutas"},
   {"letra":"B","texto":"Subir el presupuesto de puja para forzar la aprobacion en anuncios alternos","consecuencias":{"costos_comercializacion":"+8%","caja":"-3%"},"feedback_corto":"Solucion cara que sube tu costo de adquisicion sin mejorar el mensaje"},
   {"letra":"C","texto":"Trasladar presupuesto a alianzas con micro-creadores locales de Cochabamba","consecuencias":{"costos_comercializacion":"+3%","demanda":"*1.08","reputacion":"+2%"},"feedback_corto":"Canal organico cercano a tu publico objetivo de 20 a 40 anos"},
   {"letra":"D","texto":"Pausar toda pauta digital y depender solo de transeuntes de la calle","consecuencias":{"costos_comercializacion":"-10%","demanda":"*0.82"},"feedback_corto":"Ahorras gasto de inmediato pero el flujo de clientes se desploma"}
 ]'::jsonb),

('LUX004',
 'Subida del dolar paralelo y precio de reposicion del perfume estrella',
 'El distribuidor mayorista te notifica que las proximas reposiciones de tu fragancia mas vendida suben un 18% debido al tipo de cambio paralelo y fletes. Tu stock actual solo alcanza para tres semanas.',
 'financiero', 'curado', 0.15, 3, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ajustar el precio de venta gradualmente preservando el margen unitario","consecuencias":{"precio_venta":"*1.08","demanda":"*0.95"},"feedback_corto":"Proteges tu rentabilidad aunque algunos compradores pospongan su compra"},
   {"letra":"B","texto":"Comprar de golpe un lote grande con caja propia antes de que vuelva a subir","consecuencias":{"caja":"-15%","costos":"-4%","merma":"*1.1"},"feedback_corto":"Congelas costo favorable pero inmovilizas capital de trabajo en bodega"},
   {"letra":"C","texto":"Absorber la subida recortando gastos de publicidad para no tocar precios","consecuencias":{"costos_comercializacion":"-6%","demanda":"*0.92"},"feedback_corto":"Mantienes precios congelados a costa de reducir tus ventas totales"},
   {"letra":"D","texto":"Negociar pago diferido a 60 dias aceptando una tasa de recargo","consecuencias":{"deuda":"+8%","costos":"+2%"},"feedback_corto":"Alivias la presion inmediata de caja endeudando tu operacion futura"}
 ]'::jsonb),

('LUX005',
 'Quiebre de stock antes del Dia de la Madre en Cochabamba',
 'Faltan diez dias para el Dia de la Madre (pico comercial del semestre) y el distribuidor no tiene inventario del cofre de regalo mas pedido por las familias cochabambinas.',
 'operativo', 'curado', 0.11, 5, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Armar sets propios combinando fragancias en stock con estuches elegantes","consecuencias":{"costos":"+3%","demanda":"*1.12","precio_venta":"*1.05"},"feedback_corto":"Resolucion creativa que aprovecha el inventario existente con buen margen"},
   {"letra":"B","texto":"Comprar a otro comerciante formal local pagando precio de reventa","consecuencias":{"costos":"+8%","demanda":"*1.06"},"feedback_corto":"Cumples con los clientes pero dejas casi todo el margen en la compra"},
   {"letra":"C","texto":"Ofrecer certificados de regalo con un beneficio extra para el mes siguiente","consecuencias":{"caja":"+4%","demanda":"*1.03"},"feedback_corto":"Captas liquidez por adelantado y trasladas la entrega a semanas tranquilas"},
   {"letra":"D","texto":"Avisar a clientes que no habra stock y ofrecer solo lo que queda en tienda","consecuencias":{"reputacion":"-3%","demanda":"*0.90"},"feedback_corto":"Pierdes las ventas del pico del ano y desvias compradores a otros"}
 ]'::jsonb),

('LUX006',
 'Influencer local ofrece colaboracion exclusiva para publico 20 a 40 anos',
 'Una creadora de contenido de Cochabamba con mas de ochenta mil seguidores en tu segmento objetivo propone hacer tres reels de recomendacion olfativa a cambio de dos perfumes de gama alta y un honorario en efectivo.',
 'marketing', 'curado', 0.10, 4, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"costos_comercializacion","operacion":"multiplicar","valor":1.06}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar la colaboracion con un codigo de descuento medible en ventas","consecuencias":{"caja":"-2%","demanda":"*1.14","reputacion":"+2%"},"feedback_corto":"Permite medir el retorno exacto de la inversion en ventas incrementales"},
   {"letra":"B","texto":"Ofrecerle unicamente productos de regalo en canje sin pago monetario","consecuencias":{"caja":"-1%","demanda":"*1.04"},"feedback_corto":"Minimizas salida de dinero pero el contenido suele ser menos comprometido"},
   {"letra":"C","texto":"Rechazar la oferta e invertir ese mismo monto en pauta segmentada propia","consecuencias":{"costos_comercializacion":"+3%","demanda":"*1.07"},"feedback_corto":"Controlas directamente tu mensaje publicitario con menor alcance organico"},
   {"letra":"D","texto":"Invitarla a atender personalmente una tarde de cata olfativa en tu tienda","consecuencias":{"caja":"-3%","demanda":"*1.10","reputacion":"+4%"},"feedback_corto":"Genera experiencia directa y trafico fisico a tu local"}
 ]'::jsonb),

('LUX007',
 'Clientes piden por WhatsApp el mismo aroma pero mas barato',
 'El canal de atencion de WhatsApp recibe constantes mensajes de jovenes preguntando si tienes el mismo aroma pero mas economico, comparando con contratipos o perfumes a granel que compran en ferias.',
 'comercio', 'curado', 0.13, 2, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Crear catalogo con presentaciones travel de menor desembolso inicial","consecuencias":{"costos_comercializacion":"+2%","demanda":"*1.10","caja":"+2%"},"feedback_corto":"Facilitas probar productos autenticos sin rebajar el precio por mililitro"},
   {"letra":"B","texto":"Capacitar al equipo en guiones amables explicando duracion y seguridad","consecuencias":{"costos":"+1%","reputacion":"+3%","demanda":"*1.05"},"feedback_corto":"Educa al consumidor y destaca la garantia sanitaria del comercio formal"},
   {"letra":"C","texto":"Responder con mensajes automaticos descartando consultas de bajo presupuesto","consecuencias":{"reputacion":"-3%","demanda":"*0.92"},"feedback_corto":"Trato distante que frustra a futuros clientes que podrian evolucionar"},
   {"letra":"D","texto":"Vender decants fraccionados sin autorizacion de los fabricantes","consecuencias":{"caja":"+4%","reputacion":"-5%","costos":"-2%"},"feedback_corto":"Genera caja rapida pero expone tu negocio a riesgos legales y sanitarios"}
 ]'::jsonb),

('LUX008',
 'Cadena formal competidora abre a dos cuadras con fuerte descuento',
 'Una cadena nacional de farmacias y cosmetica inaugura sucursal a pocas cuadras con una campana masiva de 25% de descuento en perfumeria durante su mes de apertura.',
 'competencia', 'curado', 0.09, 6, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.84}]}'::jsonb,
 '[
   {"letra":"A","texto":"Diferenciarse por asesoria olfativa experta, muestras y fidelizacion","consecuencias":{"costos_comercializacion":"+3%","demanda":"*1.10","reputacion":"+4%"},"feedback_corto":"Un minorista gana en servicio personalizado lo que no puede en volumen"},
   {"letra":"B","texto":"Entrar en guerra de precios igualando el 25% de descuento","consecuencias":{"precio_venta":"*0.80","demanda":"*1.08","caja":"-5%"},"feedback_corto":"Una cadena grande tiene espaldas financieras que un negocio local no aguanta"},
   {"letra":"C","texto":"Lanzar combos complementarios con beneficios exclusivos para registrados","consecuencias":{"costos":"+2%","demanda":"*1.07","caja":"+2%"},"feedback_corto":"Aumenta el ticket promedio defendiendo el margen general"},
   {"letra":"D","texto":"Esperar a que termine su mes de promocion sin hacer cambios","consecuencias":{"demanda":"*0.92"},"feedback_corto":"Inaccion que cede cuota de mercado en clientes indecisos"}
 ]'::jsonb),

('LUX009',
 'Devolucion conflictiva: cliente asegura que el perfume no huele igual',
 'Un cliente vuelve al dia siguiente exigiendo devolucion del dinero de un frasco de 100 ml ya abierto, argumentando que no fija igual que uno que probo en un viaje al exterior.',
 'servicio', 'curado', 0.11, 3, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"sumar","valor":-0.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Revisar el lote, explicar factores de fijacion y ofrecer otra linea olfativa","consecuencias":{"caja":"-1%","reputacion":"+4%","demanda":"*1.03"},"feedback_corto":"El cliente se siente escuchado y transformas un conflicto en fidelizacion"},
   {"letra":"B","texto":"Negar la queja mostrando el cartel de no se aceptan devoluciones","consecuencias":{"reputacion":"-6%","demanda":"*0.94"},"feedback_corto":"Postura rigida que suele terminar en quejas en redes sociales"},
   {"letra":"C","texto":"Reembolsar el dinero completo de inmediato para evitar discusiones","consecuencias":{"caja":"-2%","merma":"*1.2"},"feedback_corto":"Cierras el caso pero te quedas con un producto abierto que va a merma"},
   {"letra":"D","texto":"Enviar el frasco a peritaje con distribuidor y prestarle un tester","consecuencias":{"costos":"+1%","reputacion":"+2%"},"feedback_corto":"Procedimiento profesional que demuestra seriedad tecnica"}
 ]'::jsonb),

('LUX010',
 'Decision de asignacion: queda presupuesto para una sola iniciativa',
 'Tu flujo de caja permite financiar una sola inversion este semestre: mas pauta en Meta, capacitacion tecnica en perfumeria para el personal, o una nueva linea de entrada.',
 'estrategia', 'curado', 0.10, 7, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"sumar","valor":-3000}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en capacitacion del equipo para subir conversion en tienda y WhatsApp","consecuencias":{"costos":"+2%","demanda":"*1.12","reputacion":"+3%"},"feedback_corto":"Mejora la calidad de atencion y eleva las ventas de forma duradera"},
   {"letra":"B","texto":"Poner todo en pauta digital agresiva para captar mas visitas este mes","consecuencias":{"costos_comercializacion":"+6%","demanda":"*1.10"},"feedback_corto":"Acelera el trafico con impacto que se diluye al terminar el presupuesto"},
   {"letra":"C","texto":"Comprar inventario de fragancias accesibles para atraer clientes nuevos","consecuencias":{"costos":"+5%","demanda":"*1.08","caja":"-2%"},"feedback_corto":"Amplia la base de clientes asumiendo mayor capital inmovilizado en stock"},
   {"letra":"D","texto":"Guardar el dinero en caja como colchon de reserva de seguridad","consecuencias":{"caja":"+4%","reputacion":"+1%"},"feedback_corto":"Priorizas la solvencia y reduces el riesgo ante imprevistos"}
 ]'::jsonb),

('LUX011',
 'Oferta de lote paralelo en frontera con 25% de descuento sin factura',
 'Un importador no tradicional ofrece entregarte en Cochabamba quince cajas de fragancias de alta demanda con 25% de rebaja, pero sin documentacion aduanera ni factura legal.',
 'legal', 'curado', 0.09, 5, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Rechazar categoricamente y ratificar compras exclusivas a canales formales","consecuencias":{"reputacion":"+5%","costos":"+2%"},"feedback_corto":"Proteges la esencia de tu negocio formal y evitas riesgos tributarios"},
   {"letra":"B","texto":"Aceptar el lote para maximizar tu ganancia en un producto estrella","consecuencias":{"costos":"-8%","caja":"+5%","reputacion":"-8%"},"feedback_corto":"Ganancia rapida que destruye tu coherencia como promotor de la compra formal"},
   {"letra":"C","texto":"Negociar con tu proveedor formal usando esa cotizacion como referencia","consecuencias":{"costos":"-3%","demanda":"*1.03"},"feedback_corto":"Consigues un descuento legitimo por volumen sin incurrir en riesgos legales"},
   {"letra":"D","texto":"Tomar una muestra minima para analizar su calidad de presentacion","consecuencias":{"caja":"-1%","reputacion":"-2%"},"feedback_corto":"Gasto innecesario que no resuelve tu cadena de suministro oficial"}
 ]'::jsonb),

('LUX012',
 'Cambio estacional: calor seco en Cochabamba frena notas pesadas',
 'Con la llegada de la primavera y el clima calido y seco del valle, la rotacion de perfumes amaderados y dulces decae un 25%, mientras crecen las consultas por aromas citricos y frescos.',
 'estacionalidad', 'curado', 0.12, 6, ARRAY['tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reorganizar vitrinas destacando coleccion fresca y campana de estacion","consecuencias":{"costos_comercializacion":"+2%","demanda":"*1.12"},"feedback_corto":"Alineas la propuesta visual con el clima y el estado de animo del comprador"},
   {"letra":"B","texto":"Rematar los perfumes dulces con descuento agresivo para vaciar stock","consecuencias":{"precio_venta":"*0.90","demanda":"*1.08","caja":"+2%"},"feedback_corto":"Recuperas liquidez pero sacrificas margen de productos de invierno"},
   {"letra":"C","texto":"Armar paquetes que incluyan fragancia fresca con muestra de linea calida","consecuencias":{"costos":"+2%","demanda":"*1.06"},"feedback_corto":"Mantienes la visibilidad de todo el catalogo incentivando el ticket promedio"},
   {"letra":"D","texto":"No alterar la exhibicion esperando que la demanda se reequilibre sola","consecuencias":{"merma":"*1.15","demanda":"*0.94"},"feedback_corto":"El inventario no adaptado a la temporada se estanca y eleva el costo"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
