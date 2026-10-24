-- ============================================================================
-- 059 - Eventos de MEDIOS, EVENTOS, FRANQUICIA y TECNOLOGIA con variables propias
--
-- El motor ahora lleva, segun el rubro:
--   medios:     "audiencia" (frente al plan; se construye y se pierde de a poco) e
--               "impagos" (anunciantes que pagan tarde o no pagan).
--   franquicia: "marca" (fuerza de la marca frente al plan; cambia con retraso).
--   tecnologia: "usuarios_activos" (frente al plan; una plataforma crece y se vacia de a poco).
--   eventos:    calendario propio: casi todo se vende en las semanas del evento y los
--               gastos de preparacion empiezan meses antes. Estos eventos mueven la
--               demanda y los costos de esa temporada.
-- Se marcan con 'tipo:medios', 'tipo:eventos', 'tipo:franquicia' y 'tipo:tecnologia'.
-- Idempotente. Magnitudes a calibrar con casos reales.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('MED011',
 'Tu anunciante mas grande se va a la competencia',
 'El anunciante que pagaba la mayor parte de tu pauta firma con otro medio. No es solo un cliente menos: es una parte importante de tus ingresos.',
 'riesgo', 'curado', 0.10, 4, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ofrecerle un paquete exclusivo con descuento para recuperarlo","consecuencias":{"precio_venta":"*0.96","impagos":"*0.9"},"feedback_corto":"Puedes retenerlo, pero a menor precio y con mas dependencia de un solo cliente"},
   {"letra":"B","texto":"Salir a vender a muchos anunciantes pequenos","consecuencias":{"costos_comercializacion":"+6%","precio_venta":"*1.04"},"feedback_corto":"Diversificas el riesgo, con mas esfuerzo comercial"},
   {"letra":"C","texto":"Recortar costos para aguantar con menos ingreso","consecuencias":{"costos":"-6%","audiencia":"-3%","reputacion":"-3%"},"feedback_corto":"Cuidas la caja, pero el contenido y la audiencia sufren"},
   {"letra":"D","texto":"Apostar por nuevas fuentes: suscripciones, eventos o contenido de marca","consecuencias":{"costos":"+4%","reputacion":"+3%","precio_venta":"*1.03"},"feedback_corto":"Abres otras vias de ingreso, con inversion y tiempo antes de ver resultados"}
 ]'::jsonb),

('MED012',
 'Tu audiencia cae por un cambio en la plataforma',
 'La red social o el buscador donde te encuentra tu publico cambia su algoritmo. De un mes a otro llega bastante menos gente a tu contenido.',
 'riesgo', 'curado', 0.10, 5, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"audiencia","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Adaptar el contenido al nuevo formato que premia la plataforma","consecuencias":{"costos":"+3%","audiencia":"+7%"},"feedback_corto":"Recuperas parte del alcance con trabajo y costo"},
   {"letra":"B","texto":"Llevar a la audiencia a un canal propio (boletin, app, WhatsApp)","consecuencias":{"costos":"+2%","audiencia":"+4%","reputacion":"+3%"},"feedback_corto":"Reduces la dependencia de la plataforma, con resultados lentos"},
   {"letra":"C","texto":"Pagar publicidad para recuperar el alcance","consecuencias":{"costos_comercializacion":"+8%","audiencia":"+8%"},"feedback_corto":"Recuperas rapido, pagando por algo que antes era gratis"},
   {"letra":"D","texto":"Esperar a que la plataforma cambie otra vez","consecuencias":{"audiencia":"-4%"},"feedback_corto":"No gastas, pero tu audiencia sigue cayendo"}
 ]'::jsonb),

('MED013',
 'Una noticia tuya se hace muy conocida',
 'Un reportaje o un programa tuyo se comparte masivamente. Llega audiencia nueva, y los anunciantes empiezan a preguntar por tus tarifas.',
 'oportunidad', 'curado', 0.08, 4, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"audiencia","operacion":"multiplicar","valor":1.2}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir tus tarifas aprovechando el momento","consecuencias":{"precio_venta":"*1.1","audiencia":"-2%"},"feedback_corto":"Ganas mas por aviso, aunque algunos anunciantes se resisten"},
   {"letra":"B","texto":"Invertir en mas contenido de ese estilo para retener a la nueva audiencia","consecuencias":{"costos":"+4%","audiencia":"+6%","reputacion":"+3%"},"feedback_corto":"Intentas que el pico se vuelva audiencia estable"},
   {"letra":"C","texto":"Hacer paquetes con descuento para los primeros anunciantes","consecuencias":{"precio_venta":"*1.04","impagos":"*1.1"},"feedback_corto":"Cierras ventas rapido, con anunciantes que no conoces"},
   {"letra":"D","texto":"No hacer nada especial","consecuencias":{"audiencia":"+1%"},"feedback_corto":"El pico pasa sin dejar mucho"}
 ]'::jsonb),

('EVE011',
 'Se acerca el evento y las ventas anticipadas van lento',
 'Faltan pocas semanas y las entradas anticipadas se venden menos de lo previsto. Los gastos de preparacion ya estan comprometidos.',
 'riesgo', 'curado', 0.12, 4, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Lanzar una promocion de ultima hora","consecuencias":{"precio_venta":"*0.93","demanda":"*1.1"},"feedback_corto":"Llenas mas aforo con menos ingreso por entrada"},
   {"letra":"B","texto":"Invertir en publicidad de ultimo momento","consecuencias":{"costos_comercializacion":"+8%","demanda":"*1.08"},"feedback_corto":"Aumentas ventas, con un gasto que ya no podras recuperar si falla"},
   {"letra":"C","texto":"Cerrar alianzas con empresas para ventas corporativas","consecuencias":{"precio_venta":"*0.97","demanda":"*1.12","caja":"+3%"},"feedback_corto":"Aseguras volumen y caja antes del evento, con descuento por cantidad"},
   {"letra":"D","texto":"Recortar gastos del evento para cuidar el resultado","consecuencias":{"costos":"-8%","reputacion":"-4%"},"feedback_corto":"Cuidas la caja, pero el publico nota una experiencia mas pobre"}
 ]'::jsonb),

('EVE012',
 'Cancelan el artista principal a pocas semanas',
 'La figura principal cancela su participacion por una enfermedad o un conflicto de agenda. Parte del publico pide su dinero de vuelta.',
 'riesgo', 'curado', 0.08, 5, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.8},{"campo":"reputacion","operacion":"multiplicar","valor":0.94}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratar un reemplazo de nivel parecido, aunque mas caro","consecuencias":{"costos":"+8%","demanda":"*1.12","reputacion":"+3%"},"feedback_corto":"Cuidas el evento y tu imagen, con un costo mayor"},
   {"letra":"B","texto":"Devolver el dinero a quien lo pida y seguir con lo que tienes","consecuencias":{"caja":"-5%","reputacion":"-2%"},"feedback_corto":"Cumples con el publico, aunque el evento queda mas debil"},
   {"letra":"C","texto":"Reprogramar el evento para otra fecha","consecuencias":{"caja":"-6%","costos":"+4%","reputacion":"-3%"},"feedback_corto":"Evitas un mal evento, pero pagas nuevos gastos y desanimas al publico"},
   {"letra":"D","texto":"Ofrecer entrada a otro evento tuyo en lugar del reembolso","consecuencias":{"demanda":"*0.95","reputacion":"+1%"},"feedback_corto":"Retienes el dinero hoy, a cambio de una obligacion futura"}
 ]'::jsonb),

('EVE013',
 'Una lluvia fuerte amenaza el dia del evento',
 'El pronostico anuncia lluvia fuerte justo en los dias del evento. Si no tomas medidas, mucha gente puede quedarse en casa.',
 'clima', 'curado', 0.08, 5, ARRAY['tipo:eventos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Armar carpas y plan de contingencia","consecuencias":{"costos":"+5%","demanda":"*1.08"},"feedback_corto":"Cuidas la experiencia, con un gasto seguro frente a un riesgo incierto"},
   {"letra":"B","texto":"Comprar un seguro por mal tiempo","consecuencias":{"caja":"-2%","demanda":"*1.03"},"feedback_corto":"Trasladas parte del riesgo, con prima y condiciones"},
   {"letra":"C","texto":"Mover el evento a un recinto cerrado mas chico","consecuencias":{"costos":"+3%","demanda":"*0.92"},"feedback_corto":"Evitas la lluvia, pero vendes menos entradas"},
   {"letra":"D","texto":"Seguir sin cambios y confiar en el clima","consecuencias":{"demanda":"*0.9","reputacion":"-2%"},"feedback_corto":"Apuestas a que no llueva y asumes el riesgo completo"}
 ]'::jsonb),

('FRA011',
 'La casa matriz tiene un escandalo y tu marca pierde fuerza',
 'Un problema de calidad o un conflicto de la casa matriz sale en los medios. Tu local no hizo nada, pero lleva su nombre y sus clientes empiezan a dudar.',
 'riesgo', 'curado', 0.08, 6, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"marca","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Comunicar tu propia calidad y trato local","consecuencias":{"costos_comercializacion":"+4%","marca":"+4%","reputacion":"+3%"},"feedback_corto":"Separas a tu local del problema con inversion en comunicacion"},
   {"letra":"B","texto":"Reclamar a la casa matriz una compensacion o apoyo","consecuencias":{"marca":"+2%","costos":"+1%"},"feedback_corto":"Puede traer apoyo, con una relacion contractual incomoda"},
   {"letra":"C","texto":"Esperar que el tema se olvide","consecuencias":{"marca":"-3%"},"feedback_corto":"No gastas, pero la duda sigue frenando las ventas"},
   {"letra":"D","texto":"Lanzar promociones propias para sostener las ventas","consecuencias":{"precio_venta":"*0.95","marca":"+3%"},"feedback_corto":"Sostienes el volumen a costa de tu margen"}
 ]'::jsonb),

('FRA012',
 'La casa matriz sube la regalia o exige remodelar el local',
 'El contrato permite a la casa matriz actualizar los estandares. Te piden una remodelacion costosa o un aumento de la regalia.',
 'financiero', 'curado', 0.10, 5, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.06}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cumplir y remodelar el local de inmediato","consecuencias":{"caja":"-7%","marca":"+5%"},"feedback_corto":"Mantienes buenas relaciones y mejoras tu imagen, con un gasto grande"},
   {"letra":"B","texto":"Negociar un plazo y pagar en cuotas","consecuencias":{"caja":"-3%","costos":"+1%","marca":"+2%"},"feedback_corto":"Repartes el golpe en el tiempo"},
   {"letra":"C","texto":"Resistir y reclamar segun lo que dice el contrato","consecuencias":{"costos":"+1%","marca":"-3%"},"feedback_corto":"Defiendes tu posicion, con riesgo de tension con la casa matriz"},
   {"letra":"D","texto":"Evaluar vender o no renovar la franquicia","consecuencias":{"marca":"-5%","costos":"-3%"},"feedback_corto":"Dejas de invertir en una marca que ya no te conviene, con riesgo de perder valor"}
 ]'::jsonb),

('FRA013',
 'La casa matriz abre otro local muy cerca del tuyo',
 'Sin avisarte, la casa matriz o otro franquiciado abre un local de la misma marca a pocas cuadras. Tus ventas se reparten.',
 'competencia', 'curado', 0.08, 6, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"marca","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reclamar la exclusividad territorial por contrato","consecuencias":{"marca":"+3%","costos":"+2%"},"feedback_corto":"Si el contrato te protege, defiendes tu zona, con costo legal"},
   {"letra":"B","texto":"Diferenciar tu local con servicio y trato propios","consecuencias":{"marca":"+4%","costos":"+2%","reputacion":"+4%"},"feedback_corto":"Compites con el otro local usando lo que depende de ti"},
   {"letra":"C","texto":"Bajar precios para quedarte con los clientes","consecuencias":{"precio_venta":"*0.94","marca":"+3%"},"feedback_corto":"Defiendes el volumen sin mejorar el margen"},
   {"letra":"D","texto":"Aceptar la nueva situacion y ajustar tus costos","consecuencias":{"costos":"-4%","marca":"-3%"},"feedback_corto":"Te adaptas a vender menos con menos gastos"}
 ]'::jsonb),

('TEC009',
 'Tus usuarios activos bajan: la gente descargo la app y no la usa',
 'Muchos usuarios instalaron tu plataforma pero dejaron de usarla. La cifra de descargas se ve bien, pero los pedidos o las sesiones bajan.',
 'riesgo', 'curado', 0.12, 4, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"usuarios_activos","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Lanzar un programa de reactivacion con incentivos","consecuencias":{"costos_comercializacion":"+5%","usuarios_activos":"+6%"},"feedback_corto":"Recuperas a una parte, con un costo por usuario reactivado"},
   {"letra":"B","texto":"Mejorar el producto segun lo que dicen los usuarios","consecuencias":{"costos":"+4%","usuarios_activos":"+5%","reputacion":"+4%"},"feedback_corto":"Atacas la causa, con tiempo de desarrollo y resultados lentos"},
   {"letra":"C","texto":"Reducir el gasto en captar usuarios nuevos y cuidar a los actuales","consecuencias":{"costos_comercializacion":"-5%","usuarios_activos":"+2%"},"feedback_corto":"Cuidas la caja y la base que ya tienes"},
   {"letra":"D","texto":"Seguir captando usuarios nuevos para compensar","consecuencias":{"costos_comercializacion":"+8%","usuarios_activos":"+3%"},"feedback_corto":"Llenas un balde con agujeros: gastas mas para mantenerte igual"}
 ]'::jsonb),

('TEC010',
 'Un competidor con mucho capital regala el servicio para ganar usuarios',
 'Un competidor grande ofrece envios y comisiones casi gratis durante meses para quedarse con el mercado. Tus usuarios y tus socios comerciales reciben ofertas.',
 'competencia', 'curado', 0.10, 6, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"usuarios_activos","operacion":"multiplicar","valor":0.9}]}'::jsonb,
 '[
   {"letra":"A","texto":"Igualar los incentivos aunque pierdas plata un tiempo","consecuencias":{"precio_venta":"*0.9","usuarios_activos":"+6%","caja":"-4%"},"feedback_corto":"Sostienes a tus usuarios, quemando caja para aguantar mas que el rival"},
   {"letra":"B","texto":"Enfocarte en un nicho donde eres mejor","consecuencias":{"usuarios_activos":"-3%","costos":"-5%","reputacion":"+4%"},"feedback_corto":"Reduces el campo de batalla y el gasto, aceptando ser mas pequeno"},
   {"letra":"C","texto":"Mejorar el servicio a tus socios comerciales para que no se vayan","consecuencias":{"costos":"+3%","usuarios_activos":"+3%","reputacion":"+3%"},"feedback_corto":"Cuidas la oferta, que es lo que atrae a los usuarios"},
   {"letra":"D","texto":"Buscar un socio o inversionista que te acompane","consecuencias":{"caja":"+5%","precio_venta":"*0.97"},"feedback_corto":"Consigues oxigeno, cediendo parte del control o del margen"}
 ]'::jsonb),

('TEC011',
 'Tu servicio se cae justo en el dia de mayor demanda',
 'Una falla tecnica deja la plataforma fuera de linea durante horas en un feriado o un fin de semana de alta demanda. Los usuarios se quejan en redes.',
 'operativo', 'curado', 0.10, 5, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"usuarios_activos","operacion":"multiplicar","valor":0.93},{"campo":"reputacion","operacion":"multiplicar","valor":0.94}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en infraestructura y monitoreo para que no se repita","consecuencias":{"costos":"+5%","reputacion":"+5%","usuarios_activos":"+3%"},"feedback_corto":"Recuperas la confianza con una inversion que se nota"},
   {"letra":"B","texto":"Pedir disculpas y dar creditos a los usuarios afectados","consecuencias":{"caja":"-2%","reputacion":"+2%","usuarios_activos":"+2%"},"feedback_corto":"Limitas el dano a la confianza con un costo moderado"},
   {"letra":"C","texto":"Corregir lo minimo y seguir","consecuencias":{"costos":"+1%","usuarios_activos":"-2%"},"feedback_corto":"Gastas poco, pero el riesgo de una nueva caida sigue"},
   {"letra":"D","texto":"Culpar al proveedor de la nube en tus comunicaciones","consecuencias":{"reputacion":"-3%","usuarios_activos":"-3%"},"feedback_corto":"Los usuarios no quieren excusas: quieren que funcione"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
