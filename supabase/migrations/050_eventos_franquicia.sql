-- ============================================================================
-- 050 — Eventos propios de proyectos de FRANQUICIA (comprar una)
-- Fuente: docs/metodologia/tipos/franquicia-licencia.md (seccion 5).
--
-- Categoria franquicia. La plantilla es la de un franquiciado (quien compra),
-- asi que se usaron las situaciones de ese lado. Las situaciones del
-- franquiciante (vender rapido, estandarizar, controlar ventas ocultas)
-- quedan para una plantilla futura. Idempotente. Aqui "demanda" son las
-- ventas del local y "precio_venta" el ticket promedio. Magnitudes:
-- estimaciones a calibrar (seccion 10 de la ficha). El caso de Burger King en
-- Costa Rica y la salida de McDonalds de Bolivia (2002) son precedentes.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('FRA001',
 'Tu local vende menos de lo que prometió el franquiciante',
 'Al comprar, el franquiciante mostró las ventas promedio de las unidades existentes, tomadas de sus mejores locales. Tu local, en otro barrio, vende entre 20% y 35% menos de lo proyectado durante 6 a 12 meses. La regalía se paga sobre las ventas, pero tus costos fijos no bajan. El promedio de la red no es tu proyección.',
 'comercio', 'curado', 0.12, 2, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar la regalía íntegra y ajustar costos","consecuencias":{"costos":"-4%","reputacion":"-3%"},"feedback_corto":"No rompes la relación ni el contrato, pero los recortes pueden bajar la calidad que exige la marca y traer una auditoría"},
   {"letra":"B","texto":"Pedir una reducción temporal de regalías o apoyo de marketing local","consecuencias":{"caja":"+3%","reputacion":"+1%"},"feedback_corto":"Alivias la caja ya, pero el franquiciante puede negarse o pedir algo a cambio, y sienta un precedente"},
   {"letra":"C","texto":"Invertir en marketing local propio","consecuencias":{"caja":"-5%","demanda":"*1.12"},"feedback_corto":"Puedes acelerar las ventas, pero consumes caja justo cuando hay menos y sin garantía de retorno"},
   {"letra":"D","texto":"Evaluar una salida anticipada y vender la unidad","consecuencias":{"caja":"+4%","demanda":"*0.90","reputacion":"-3%"},"feedback_corto":"Limitas la pérdida, pero la transferencia necesita aprobación del franquiciante y se vende barato en pleno bajo rendimiento"}
 ]'::jsonb),

('FRA002',
 'Al renovar, suben la regalía y el aporte de publicidad',
 'Vence el primer período del contrato. El franquiciante propone renovar con una regalía entre 1 y 2 puntos más alta y un mayor aporte al fondo de publicidad, argumentando inversión en la marca. Ya tienes clientela y local invertido, y menos opciones que cuando firmaste: el poder de negociación cambia con el tiempo.',
 'financiero', 'curado', 0.09, 5, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.04}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar el aumento","consecuencias":{"costos":"+3%","reputacion":"+1%"},"feedback_corto":"Aseguras la renovación, con un margen más bajo por años que puede volverse inviable si ya era justo"},
   {"letra":"B","texto":"Negociar a cambio de plazo más largo o territorio exclusivo","consecuencias":{"costos":"+1%","demanda":"*1.04"},"feedback_corto":"Compensas con valor de largo plazo, pero quedas atado más tiempo y el franquiciante puede rechazar"},
   {"letra":"C","texto":"No renovar y convertir el local en marca propia","consecuencias":{"demanda":"*0.60","costos":"-4%","caja":"-5%"},"feedback_corto":"Eliminas los cargos y el margen es tuyo, pero pierdes marca, proveedores y clientes atraídos por ella, y puede haber cláusula de no competencia"},
   {"letra":"D","texto":"Organizarte con otros franquiciados para negociar en bloque","consecuencias":{"costos":"+1%","reputacion":"-2%","demanda":"*1.02"},"feedback_corto":"Tienes más poder, pero tensas la relación y el franquiciante puede responder con auditorías"}
 ]'::jsonb),

('FRA003',
 'Sospechas del uso del fondo de publicidad',
 'Cada franquiciado aporta un porcentaje de sus ventas a un fondo común de marketing, pero sospechas que se gasta en la central o en promociones que benefician a otras ciudades, no en la tuya. El fondo de publicidad es un bien común: quién lo controla y cómo se cobra importa. Según el uso, las ventas pueden variar entre -3% y +8%.',
 'sectorial', 'curado', 0.09, 4, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.97}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pedir una auditoría del fondo","consecuencias":{"costos":"+2%","reputacion":"-2%","demanda":"*1.03"},"feedback_corto":"Obtienes evidencia, pero tiene costo y tensión, y solo vale si el contrato lo permite"},
   {"letra":"B","texto":"Proponer un comité de franquiciados que supervise el fondo","consecuencias":{"costos":"+1%","reputacion":"+3%","demanda":"*1.03"},"feedback_corto":"Ganas confianza y reduces disputas, aunque da poder de voto a los franquiciados y frena las decisiones rápidas"},
   {"letra":"C","texto":"Pedir que parte del fondo vaya a marketing local","consecuencias":{"caja":"-2%","demanda":"*1.06"},"feedback_corto":"Adaptas la promoción a tu zona, pero pierdes escala y consistencia de marca"},
   {"letra":"D","texto":"Aceptar la decisión centralizada y seguir","consecuencias":{"reputacion":"-1%","demanda":"*0.98"},"feedback_corto":"Ganas rapidez y coherencia de marca, con la sospecha instalada"}
 ]'::jsonb),

('FRA004',
 'El franquiciante abre otra unidad a dos barrios de la tuya',
 'El franquiciante aprueba vender otra unidad cerca de la tuya porque la zona tiene mucha demanda. Tus ventas bajan entre 5% y 15%. Tu contrato dice poco o nada sobre exclusividad. Un territorio no definido es una fuente de conflicto, no un detalle, y más unidades no siempre significan más valor para el sistema.',
 'comercio', 'curado', 0.08, 5, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Negociar una compensación o la prioridad para operar la nueva unidad","consecuencias":{"deuda":"+8%","demanda":"*1.12"},"feedback_corto":"Conviertes el conflicto en oportunidad de multiunidad, con más capital y más riesgo concentrado"},
   {"letra":"B","texto":"Reclamar por la vía del arbitraje","consecuencias":{"caja":"-4%","reputacion":"-4%","demanda":"*1.03"},"feedback_corto":"Puedes obtener compensación, pero en Bolivia no hay centro especializado y un arbitraje internacional puede ser inalcanzable para una pyme"},
   {"letra":"C","texto":"Reforzar tu marketing local para defender tu clientela","consecuencias":{"caja":"-3%","demanda":"*1.06"},"feedback_corto":"Defiendes tu zona sin pelear, con gasto sin garantía de retorno"},
   {"letra":"D","texto":"Aceptar la nueva unidad y ajustar tu estructura","consecuencias":{"costos":"-3%","reputacion":"-2%"},"feedback_corto":"Evitas el conflicto, pero absorbes la pérdida de ventas para siempre"}
 ]'::jsonb),

('FRA005',
 'Tu proveedor obligatorio sube el precio de los insumos',
 'El contrato te obliga a comprar insumos clave al franquiciante o a proveedores aprobados. El precio sube, o el costo del insumo importado se encarece por el tipo de cambio o la falta de divisas, mientras tu precio de venta está limitado por el mercado. El costo de ventas puede subir entre 4% y 10%. Los insumos obligatorios son una regalía escondida.',
 'macroeconomico', 'curado', 0.11, 3, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.08}]}'::jsonb,
 '[
   {"letra":"A","texto":"Trasladar el costo al precio","consecuencias":{"precio_venta":"*1.05","demanda":"*0.94"},"feedback_corto":"Proteges el margen, pero baja la demanda porque el precio es un freno"},
   {"letra":"B","texto":"Pedir autorización para un proveedor local alternativo","consecuencias":{"costos":"-4%","reputacion":"-2%"},"feedback_corto":"Bajas el costo, pero el franquiciante puede negarse por control de calidad"},
   {"letra":"C","texto":"Absorber el costo temporalmente","consecuencias":{"costos":"+3%","caja":"-2%"},"feedback_corto":"Mantienes precio y clientes, y erosionas la caja"},
   {"letra":"D","texto":"Presionar con otros franquiciados para renegociar compras en conjunto","consecuencias":{"costos":"-3%","reputacion":"-2%"},"feedback_corto":"Ganas poder de compra, con tensión en la relación y un franquiciante que puede perder margen"}
 ]'::jsonb),

('FRA006',
 'Auditoría de estándares: el franquiciante encuentra incumplimientos',
 'Una visita del franquiciante encuentra fallas de limpieza, recetas, uniformes o atención y te da un plazo para corregir antes de aplicar sanciones. Corregir cuesta entre 2% y 6% de tus gastos. Los estándares son el producto que se vende, y un incumplimiento grave puede afectar la marca de todas las unidades.',
 'operativo', 'curado', 0.10, 3, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.03}]}'::jsonb,
 '[
   {"letra":"A","texto":"Corregir de inmediato con inversión","consecuencias":{"caja":"-4%","reputacion":"+4%"},"feedback_corto":"Evitas la sanción y proteges el contrato, con gasto de caja y tiempo"},
   {"letra":"B","texto":"Cuestionar el estándar por costoso o no aplicable al mercado local","consecuencias":{"costos":"-1%","reputacion":"-4%"},"feedback_corto":"Puedes lograr una adaptación, pero te arriesgas a ser tratado como incumplidor y la adaptación sola no garantiza ventas"},
   {"letra":"C","texto":"Pedir capacitación y acompañamiento al franquiciante","consecuencias":{"costos":"+1%","reputacion":"+3%"},"feedback_corto":"Mejoras sin sanción, con horas de soporte y tiempo de tu equipo"},
   {"letra":"D","texto":"Corregir lo mínimo para pasar y seguir","consecuencias":{"costos":"-2%","reputacion":"-5%","demanda":"*0.97"},"feedback_corto":"Ahorras ahora, pero la reincidencia puede terminar en la rescisión del contrato"}
 ]'::jsonb),

('FRA007',
 'El franquiciante no te renueva el contrato',
 'Tu contrato llega a su fin y el franquiciante decide no renovar porque quiere tomar la zona con unidades propias o por un conflicto. Tienes local, personal y clientes asociados a la marca. Si rebautizas, las ventas pueden caer entre 30% y 60%. En Costa Rica, un franquiciado de Burger King cerró 29 restaurantes con 434 despidos cuando venció su contrato.',
 'comercio', 'curado', 0.06, 6, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.55}]}'::jsonb,
 '[
   {"letra":"A","texto":"Seguir con marca propia en el mismo local","consecuencias":{"caja":"-6%","demanda":"*1.15","costos":"-3%"},"feedback_corto":"Conservas local y clientes, con reinversión en imagen y posibles cláusulas de no competencia"},
   {"letra":"B","texto":"Pelear la renovación por arbitraje","consecuencias":{"caja":"-5%","demanda":"*1.05","reputacion":"-3%"},"feedback_corto":"Puedes obtener compensación, pero en Bolivia no hay centro ni ley específica y el costo y el tiempo son altos"},
   {"letra":"C","texto":"Vender el local al franquiciante o a otro franquiciado","consecuencias":{"caja":"+8%","demanda":"*0.85"},"feedback_corto":"Liquidas, con poco poder de negociación y un precio castigado"},
   {"letra":"D","texto":"Negociar la renovación con nuevas condiciones","consecuencias":{"costos":"+3%","demanda":"*1.20"},"feedback_corto":"Conservas la continuidad, con condiciones más duras"}
 ]'::jsonb),

('FRA008',
 'La marca internacional se va de Bolivia',
 'El franquiciante internacional decide salir del país por baja rentabilidad, o cambia de socio local. Tu contrato queda en el aire. Los activos con imagen de marca pierden valor y, sin la marca, el flujo cae. McDonalds salió de Bolivia en 2002 avisando con diez días de anticipación. El riesgo país y el riesgo del franquiciante también son tuyos.',
 'macroeconomico', 'curado', 0.05, 7, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.60}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cerrar cuando se decide la salida","consecuencias":{"caja":"-4%","deuda":"-5%","demanda":"*0.60"},"feedback_corto":"Limitas la pérdida, pero pierdes la inversión no recuperada"},
   {"letra":"B","texto":"Reconvertir el negocio con marca propia","consecuencias":{"caja":"-7%","demanda":"*1.20","costos":"-3%"},"feedback_corto":"Aprovechas local y personal, con reinversión y un flujo menor sin la marca"},
   {"letra":"C","texto":"Negociar con el nuevo operador de la marca","consecuencias":{"costos":"+3%","demanda":"*1.25"},"feedback_corto":"Posible continuidad, con condiciones nuevas y menos poder de negociación"},
   {"letra":"D","texto":"Reclamar una indemnización","consecuencias":{"caja":"-3%","reputacion":"-2%","demanda":"*0.95"},"feedback_corto":"Puedes recuperar algo, pero es lento, caro y de resultado incierto"}
 ]'::jsonb),

('FRA009',
 'Remodelación obligatoria de la imagen del local',
 'El franquiciante cambia la identidad visual y exige a todas las unidades remodelar el local en un plazo. La inversión adicional puede ser entre 8% y 20% de la original, con 1 a 4 semanas sin ventas, y después un posible aumento de 0% a 10%. Los cambios de imagen son un costo que el VAN no previó: el contrato debería decir cuándo y cuánto pueden exigir.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Remodelar en el plazo","consecuencias":{"caja":"-7%","demanda":"*1.06","reputacion":"+2%"},"feedback_corto":"Cumples el contrato y puedes ganar ventas, con caja gastada y un cierre temporal"},
   {"letra":"B","texto":"Pedir plazo o financiamiento al franquiciante","consecuencias":{"deuda":"+4%","caja":"-2%"},"feedback_corto":"Alivias la caja, pero el franquiciante puede condicionarlo"},
   {"letra":"C","texto":"Remodelar solo parcialmente","consecuencias":{"caja":"-3%","reputacion":"-4%"},"feedback_corto":"Gastas menos, pero arriesgas incumplimiento y sanción"},
   {"letra":"D","texto":"No remodelar y prepararte para salir al vencer el contrato","consecuencias":{"demanda":"*0.90","reputacion":"-3%"},"feedback_corto":"Evitas el gasto, pero pierdes la marca y todo lo que se apoya en ella"}
 ]'::jsonb),

('FRA010',
 'Oportunidad: te ofrecen abrir más unidades',
 'Tu local funciona bien y el franquiciante te ofrece desarrollar más unidades en una ciudad vecina con un calendario de aperturas. Los operadores multiunidad con experiencia suelen sobrevivir más que los novatos, pero concentran riesgo: si el mercado cae quedas comprometido con el calendario.',
 'oportunidad', 'curado', 0.08, 7, ARRAY['tipo:franquicia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar el desarrollo multiunidad con calendario de aperturas","consecuencias":{"deuda":"+12%","demanda":"*1.20","reputacion":"+2%"},"feedback_corto":"Ganas escala y poder de negociación, con más capital en riesgo y penalidades si no abres"},
   {"letra":"B","texto":"Abrir solo una unidad más como prueba","consecuencias":{"deuda":"+5%","demanda":"*1.08"},"feedback_corto":"Aprendes con riesgo acotado, aunque tardas más en ganar escala"},
   {"letra":"C","texto":"Rechazar y mejorar el local actual","consecuencias":{"caja":"+3%","demanda":"*1.03","reputacion":"+2%"},"feedback_corto":"Proteges la caja y la calidad, pero cedes la oportunidad a otro operador"},
   {"letra":"D","texto":"Aprovechar para negociar mejores condiciones en tu contrato actual","consecuencias":{"costos":"-2%","demanda":"*1.05"},"feedback_corto":"Usas tu poder de negociación, aunque puede enfriar la oferta"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
