-- ============================================================================
-- 039 — Eventos propios de proyectos de MARKETING y CAMPAÑAS
-- Fuente: docs/metodologia/tipos/marketing.md (seccion 5, situaciones).
--
-- Categoria marketing (planes y campañas evaluados por las ventas adicionales
-- que de verdad generan). Idempotente. Aqui "demanda" representa las ventas
-- adicionales que causa la campaña; "costos" el gasto de la campania.
-- Magnitudes: estimaciones a calibrar (seccion 10 de la ficha).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('MKT001',
 'El panel muestra un ROAS de 6, pero casi todas las ventas ya iban a ocurrir',
 'La agencia celebra un retorno de 6 veces. Pero casi todas las ventas atribuidas vienen de remarketing y de búsquedas con el nombre de tu marca: gente que ya te había elegido. Lo notas cuando pausas una semana y las ventas casi no cambian. El retorno reportado puede ser de 2 a 5 veces el real.',
 'sectorial', 'curado', 0.12, 4, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener el gasto porque el panel dice que el retorno es alto","consecuencias":{"costos":"+3%","reputacion":"-2%"},"feedback_corto":"No arriesgas ventas visibles, pero sigues pagando por ventas que ocurrirían igual"},
   {"letra":"B","texto":"Pausar el remarketing y la marca por 4 semanas como prueba","consecuencias":{"costos":"-8%","demanda":"*0.93","reputacion":"+4%"},"feedback_corto":"Descubres la venta real que aporta la campaña, aunque si sí aportaba pierdes ventas esas semanas y el resultado es ruidoso"},
   {"letra":"C","texto":"Recortar a la mitad y reasignar a captar clientes nuevos","consecuencias":{"costos":"-3%","demanda":"*1.04"},"feedback_corto":"Compromiso entre ambos, pero cada cliente nuevo cuesta más y se ve menos en el panel"},
   {"letra":"D","texto":"Pedirle a la agencia una prueba con grupo de control","consecuencias":{"costos":"+4%","reputacion":"+5%"},"feedback_corto":"Obtienes una medición creíble, a cambio de honorarios, tiempo y la probable respuesta de que no hay datos suficientes"}
 ]'::jsonb),

('MKT002',
 'Tu audiencia se satura: mismo público, mismos anuncios',
 'Llevas dos meses mostrando los mismos anuncios al mismo público, en una ciudad que en Bolivia suele ser un mercado chico. La frecuencia sube, el costo por cliente nuevo también, y cada boliviano extra rinde menos que el anterior.',
 'sectorial', 'curado', 0.11, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85},{"campo":"costo_marketing","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir el presupuesto para romper la saturación","consecuencias":{"costos":"+8%","demanda":"*1.04"},"feedback_corto":"Puedes captar por volumen, pero el último boliviano rinde muy poco y el retorno marginal puede ser negativo"},
   {"letra":"B","texto":"Renovar las creatividades y los segmentos","consecuencias":{"costos":"+4%","demanda":"*1.10"},"feedback_corto":"Reactivas el interés, con un gasto fijo en producir material que no siempre funciona"},
   {"letra":"C","texto":"Mantener el presupuesto y abrir otra ciudad o canal","consecuencias":{"caja":"-4%","demanda":"*1.08"},"feedback_corto":"Llegas a audiencia nueva, pero requiere logística y es una apuesta sin datos previos"},
   {"letra":"D","texto":"Bajar el gasto a un nivel de mantenimiento","consecuencias":{"costos":"-6%","demanda":"*0.92"},"feedback_corto":"Proteges la caja, pero pierdes parte del arrastre acumulado y del crecimiento"}
 ]'::jsonb),

('MKT003',
 'Se acerca una fecha pico: las ventas se disparan solas',
 'Se acerca el Día del Padre, Navidad u otra fecha local fuerte. Las ventas suben solas entre 100% y 400%, los medios cuestan más y todos los competidores anuncian. Tú puedes invertir fuerte creyendo que ahí está la plata, pero la venta incremental real de tu campaña puede ser pequeña.',
 'oportunidad', 'curado', 0.11, 3, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"costo_marketing","operacion":"multiplicar","valor":1.15}]}'::jsonb,
 '[
   {"letra":"A","texto":"Gastar el doble en el pico","consecuencias":{"costos":"+10%","demanda":"*1.10"},"feedback_corto":"Ganas visibilidad cuando más gente busca, pero pagas más caro por llegar a gente que igual compraba"},
   {"letra":"B","texto":"Gastar antes del pico (precalentar) y poco durante","consecuencias":{"costos":"+4%","demanda":"*1.06"},"feedback_corto":"Medios más baratos y ventas adelantadas, pero el efecto de arrastre es incierto"},
   {"letra":"C","texto":"Gastar poco y asegurar stock y atención","consecuencias":{"costos":"-3%","reputacion":"+4%","demanda":"*0.96"},"feedback_corto":"No pierdes ventas por no dar abasto, pero renuncias a ganar cuota frente a quien sí anuncia"},
   {"letra":"D","texto":"Hacer una acción de fidelización para clientes actuales","consecuencias":{"costos":"+2%","reputacion":"+6%"},"feedback_corto":"Refuerzas la relación a bajo costo, pero no captas clientes nuevos y el efecto es difícil de medir"}
 ]'::jsonb),

('MKT004',
 'El pago de la publicidad digital se bloquea',
 'Pagas Facebook o Instagram con tarjeta, pero por la escasez de divisas los bancos restringen las compras por internet. Tu tarjeta es rechazada y las campañas se pausan. Al reanudar, el costo sube un tiempo porque la plataforma vuelve a aprender.',
 'financiero', 'curado', 0.10, 4, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar con un intermediario o tarjeta externa con comisión","consecuencias":{"costos":"+6%","demanda":"*1.08"},"feedback_corto":"La campaña sigue, pero la comisión encarece cada cliente y hay riesgo de fraude o incumplimiento"},
   {"letra":"B","texto":"Mover la inversión a canales que se pagan en bolivianos (afiches, radio, alianzas)","consecuencias":{"costos":"+1%","demanda":"*1.03","reputacion":"+1%"},"feedback_corto":"Sin riesgo de pago, pero con menos medición y menos segmentación"},
   {"letra":"C","texto":"Pausar y esperar a que se normalice","consecuencias":{"costos":"-6%","demanda":"*0.90"},"feedback_corto":"No gastas, pero pierdes arrastre y posición, y los competidores ocupan tu espacio"},
   {"letra":"D","texto":"Pasar al marketing orgánico con más dedicación del dueño","consecuencias":{"costos":"-4%","demanda":"*0.97"},"feedback_corto":"Casi sin costo en efectivo, pero con horas de trabajo y resultados lentos"}
 ]'::jsonb),

('MKT005',
 'El competidor lanza una guerra de ofertas',
 'Un competidor lanza 30% de descuento y una campaña fuerte. Tus clientes empiezan a probar al otro, tu conversión baja y tus anuncios compiten por la misma atención, más cara.',
 'comercio', 'curado', 0.10, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88},{"campo":"costo_marketing","operacion":"multiplicar","valor":1.08}]}'::jsonb,
 '[
   {"letra":"A","texto":"Igualar el descuento","consecuencias":{"precio_venta":"*0.90","demanda":"*1.10"},"feedback_corto":"No pierdes clientes de inmediato, pero el margen baja y atraes clientes sensibles al precio que se irán después"},
   {"letra":"B","texto":"Mantener el precio y reforzar el valor (calidad, servicio, garantía)","consecuencias":{"costos":"+3%","reputacion":"+6%","demanda":"*1.02"},"feedback_corto":"Proteges margen y marca, aunque puedes perder volumen un tiempo"},
   {"letra":"C","texto":"Contraatacar con un beneficio exclusivo para tus clientes actuales","consecuencias":{"costos":"+2%","reputacion":"+3%","demanda":"*1.04"},"feedback_corto":"Defiendes la base con costo acotado, pero no captas nuevos y regalas a quien ya iba a comprar"},
   {"letra":"D","texto":"Esperar y observar entre 4 y 6 semanas","consecuencias":{"costos":"-3%","demanda":"*0.93"},"feedback_corto":"Ahorras, pero si el competidor sigue pierdes cuota que cuesta recuperar"}
 ]'::jsonb),

('MKT006',
 'El efecto llega tarde y el dueño quiere cortar la campaña',
 'Lanzaste una campaña de marca. En los dos primeros meses el costo por venta se ve alto y el dueño presiona. La literatura dice que el efecto de largo plazo es, en promedio, el doble del de corto plazo. Pero cortar a tiempo evita pérdidas si la campaña no funciona.',
 'sectorial', 'curado', 0.09, 4, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Cortar a los 2 meses por mal retorno","consecuencias":{"costos":"-8%","demanda":"*0.88"},"feedback_corto":"Salvas la caja, pero si el arrastre era real tiras la inversión sin cosechar"},
   {"letra":"B","texto":"Mantener 6 meses con presupuesto fijo","consecuencias":{"costos":"+4%","demanda":"*1.12"},"feedback_corto":"Das tiempo al arrastre, pero si no funciona pierdes más"},
   {"letra":"C","texto":"Mantener con indicadores de control y un punto de decisión fijado de antemano","consecuencias":{"costos":"+2%","reputacion":"+4%","demanda":"*1.06"},"feedback_corto":"Decides con criterio, aunque los indicadores intermedios pueden engañar"},
   {"letra":"D","texto":"Reducir a la mitad y reevaluar","consecuencias":{"costos":"-3%","demanda":"*0.96"},"feedback_corto":"Compromiso, pero si el efecto necesita una masa mínima, queda por debajo y no hace nada"}
 ]'::jsonb),

('MKT007',
 'Muchos clientes nuevos, pero no se quedan',
 'Una promoción de primer mes casi gratis capta el triple de clientes y el costo por cliente nuevo se ve bajísimo. Pero al terminar la promoción, la mayoría no vuelve a comprar: la retención de esa cohorte cae de 70% a menos de 40%.',
 'oportunidad', 'curado', 0.10, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.30}]}'::jsonb,
 '[
   {"letra":"A","texto":"Repetir la promoción cada mes","consecuencias":{"precio_venta":"*0.88","demanda":"*1.10","reputacion":"-4%"},"feedback_corto":"Mantienes la cifra de clientes nuevos y entra caja, pero entrenas al cliente a esperar el descuento y destruyes el margen"},
   {"letra":"B","texto":"Cambiar a una oferta más chica ligada a compras repetidas (puntos)","consecuencias":{"demanda":"*0.95","reputacion":"+4%","costos":"+1%"},"feedback_corto":"Atraes clientes con mejor retención, pero captas menos y más lento"},
   {"letra":"C","texto":"Invertir en retener a la cohorte (seguimiento y beneficio en la segunda compra)","consecuencias":{"costos":"+4%","reputacion":"+6%","demanda":"*1.05"},"feedback_corto":"Subes la retención y el valor del cliente, con horas de atención y descuentos adicionales"},
   {"letra":"D","texto":"Abandonar la promoción y volver al precio normal","consecuencias":{"precio_venta":"*1.05","demanda":"*0.88"},"feedback_corto":"Recuperas el margen, pero baja el volumen y la cifra visible de clientes"}
 ]'::jsonb),

('MKT008',
 'La campaña funciona y tu negocio no da abasto',
 'La campaña trae más pedidos de los que puedes atender. Se acaba el stock, la entrega se retrasa y aparecen quejas en las reseñas. El gasto en publicidad siguió corriendo mientras la venta se perdía.',
 'sectorial', 'curado', 0.09, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pausar la campaña hasta tener capacidad","consecuencias":{"costos":"-6%","demanda":"*0.88","reputacion":"+3%"},"feedback_corto":"No inflas expectativas, pero pierdes arrastre y posición"},
   {"letra":"B","texto":"Seguir y ampliar la capacidad con un costo temporal (horas extra, proveedor)","consecuencias":{"costos":"+5%","demanda":"*1.08","reputacion":"-2%"},"feedback_corto":"No pierdes la demanda, pero baja el margen y la calidad puede resentirse si es apurado"},
   {"letra":"C","texto":"Seguir y comunicar plazos largos","consecuencias":{"demanda":"*0.93","reputacion":"-3%"},"feedback_corto":"Filtras la demanda, pero se pierden compradores impacientes y tu imagen sufre"},
   {"letra":"D","texto":"Cambiar el mensaje a una oferta de reserva o lista de espera","consecuencias":{"costos":"+2%","demanda":"*1.02","reputacion":"+2%"},"feedback_corto":"Conviertes el exceso en demanda futura, aunque hay abandono y requiere gestión"}
 ]'::jsonb),

('MKT009',
 'Sube el costo de los medios o cambia el algoritmo',
 'La plataforma cambia su algoritmo o entran más anunciantes a la misma subasta, y tu costo por clic sube entre 20% y 60%. Incluso tu cuenta puede ser restringida unas semanas por una política de anuncios.',
 'tecnologico', 'curado', 0.10, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"costo_marketing","operacion":"multiplicar","valor":1.20}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aguantar el costo más alto con el mismo presupuesto","consecuencias":{"demanda":"*0.90"},"feedback_corto":"No cambias nada, pero llegas a menos gente y cada cliente cuesta más"},
   {"letra":"B","texto":"Subir el presupuesto para mantener el volumen","consecuencias":{"costos":"+8%","demanda":"*1.05"},"feedback_corto":"Mantienes las ventas, pero un costo por cliente más alto puede superar lo que vale ese cliente"},
   {"letra":"C","texto":"Diversificar canales (alianzas, referidos, WhatsApp, medios locales)","consecuencias":{"costos":"+3%","demanda":"*1.04","reputacion":"+2%"},"feedback_corto":"Dependes menos de un solo canal, con tiempo de aprendizaje y resultados peores al inicio"},
   {"letra":"D","texto":"Mejorar la conversión (página, oferta, atención)","consecuencias":{"caja":"-3%","demanda":"*1.07"},"feedback_corto":"Reduces el costo por cliente sin gastar más en medios, con una inversión de resultado incierto"}
 ]'::jsonb),

('MKT010',
 'Un incidente de reputación: queja viral o influencer polémico',
 'Un cliente publica una queja que se hace viral, o un influencer que contrataste dice algo polémico. Tu anuncio sigue pasando mientras tu imagen se daña, y el público empieza a desconfiar de lo que antes funcionaba.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.80},{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pausar los anuncios y responder públicamente con disculpa y solución","consecuencias":{"costos":"-4%","reputacion":"+10%","demanda":"*0.95"},"feedback_corto":"Contienes el daño, pero pierdes semanas de campaña y dinero ya pagado"},
   {"letra":"B","texto":"Seguir con la campaña como si nada","consecuencias":{"costos":"+2%","reputacion":"-6%"},"feedback_corto":"No pierdes ritmo, pero pagas por mostrar tu marca a gente que ahora desconfía"},
   {"letra":"C","texto":"Cambiar el mensaje a transparencia y garantía","consecuencias":{"costos":"+4%","reputacion":"+5%"},"feedback_corto":"Puedes reforzar la confianza, con gasto en nueva creatividad y el riesgo de amplificar el tema"},
   {"letra":"D","texto":"Compensar a los afectados con descuentos o devoluciones","consecuencias":{"caja":"-4%","reputacion":"+7%"},"feedback_corto":"Reduces el enojo, a cambio de dinero directo y el riesgo de incentivar nuevas quejas"}
 ]'::jsonb),

('MKT011',
 'La agencia reporta resultados que no te cuadran',
 'La agencia presenta un informe con retorno 5 y pide renovar con más presupuesto. La caja de tu negocio no mejora al ritmo del informe. La agencia cobra un porcentaje del gasto, así que gana más cuanto más gastas.',
 'comercio', 'curado', 0.09, 6, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Renovar con más presupuesto","consecuencias":{"costos":"+8%","demanda":"*1.04"},"feedback_corto":"Confías en el experto con menos fricción, pero si el retorno está inflado pierdes más"},
   {"letra":"B","texto":"Renovar con el mismo presupuesto y exigir reporte con ventas reales (facturas, cupones)","consecuencias":{"costos":"+1%","reputacion":"+5%"},"feedback_corto":"Fuerzas la medición con tus propios datos, aunque habrá fricción y la agencia puede irse"},
   {"letra":"C","texto":"Cambiar el pago a variable por clientes nuevos verificados","consecuencias":{"costos":"-3%","demanda":"*0.96","reputacion":"+3%"},"feedback_corto":"Alineas incentivos, pero la agencia puede rechazarlo o cuidar solo lo medible"},
   {"letra":"D","texto":"Internalizar parte del trabajo contratando a una persona","consecuencias":{"costos":"+4%","caja":"-3%","reputacion":"+3%"},"feedback_corto":"Ganas control y aprendizaje, con un salario fijo y una curva de aprendizaje"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
