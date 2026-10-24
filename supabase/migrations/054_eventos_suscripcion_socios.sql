-- ============================================================================
-- 054 - Eventos de suscripcion que mueven SOCIOS y BAJAS (no solo caja y demanda)
--
-- El motor ahora lleva los socios mes a mes en los proyectos de suscripcion
-- (gimnasio, academia, coworking, podcast, SaaS). Estos eventos usan dos campos nuevos:
--   "socios": cambio inmediato de los socios activos ("+6%" = entran 6% mas).
--   "churn":  multiplica las bajas del plan ("*0.8" = se van 20% menos socios);
--             se diluye con los meses igual que los demas efectos.
-- Se marcan con 'tipo:suscripcion'. Idempotente. Magnitudes a calibrar con gremios.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('SUS011',
 'Un competidor abre cerca con una membresia a la mitad de precio',
 'Un negocio nuevo del mismo rubro abre a pocas cuadras con una cuota de entrada muy baja y mucha publicidad. Tus socios mas sensibles al precio empiezan a preguntar si vale la pena quedarse.',
 'competencia', 'curado', 0.10, 4, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"churn","operacion":"multiplicar","valor":1.5},{"campo":"demanda","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Igualar la cuota del competidor","consecuencias":{"precio_venta":"*0.88","churn":"*0.7"},"feedback_corto":"Frenas la fuga de socios, pero bajas el ingreso de todos, incluso de quienes no se iban a ir"},
   {"letra":"B","texto":"Mantener el precio y mejorar el servicio (mas clases, atencion, contenido)","consecuencias":{"costos":"+4%","reputacion":"+6%","churn":"*0.85"},"feedback_corto":"Retienes a los que valoran la calidad, a cambio de un gasto fijo mayor"},
   {"letra":"C","texto":"Lanzar un plan basico mas barato aparte, sin tocar el principal","consecuencias":{"precio_venta":"*0.96","socios":"+4%","churn":"*0.9"},"feedback_corto":"Capturas al socio sensible al precio, con el riesgo de que tus socios actuales se pasen al plan barato"},
   {"letra":"D","texto":"No hacer nada y recortar gastos para aguantar","consecuencias":{"costos":"-3%","churn":"*1.1"},"feedback_corto":"Ahorras hoy, pero dejas que se vayan los socios que mas dudan"}
 ]'::jsonb),

('SUS012',
 'Tus socios quieren traer a sus amigos',
 'Varios socios te cuentan que recomiendan el lugar y piden algo a cambio. Es la forma mas barata de crecer, si la haces bien y no regalas demasiado.',
 'oportunidad', 'curado', 0.12, 3, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Regalar un mes gratis por cada referido que se quede","consecuencias":{"socios":"+7%","costos_comercializacion":"+6%","caja":"-3%"},"feedback_corto":"Crece la base rapido, pero cada alta te cuesta un mes de cuota"},
   {"letra":"B","texto":"Hacer un sorteo mensual entre quienes refieran","consecuencias":{"socios":"+3%","caja":"-1%"},"feedback_corto":"Barato y sin comprometer la cuota, aunque trae pocos socios"},
   {"letra":"C","texto":"Dar un descuento permanente al socio y al amigo que entra","consecuencias":{"socios":"+9%","precio_venta":"*0.95"},"feedback_corto":"Entran muchos, pero el descuento queda para siempre sobre toda la base"},
   {"letra":"D","texto":"Dejarlo pasar este mes","consecuencias":{"caja":"+2%","reputacion":"-1%"},"feedback_corto":"No gastas, pero desperdicias la recomendacion espontanea"}
 ]'::jsonb),

('SUS013',
 'Muchos socios piden pagar por todo el ano a cambio de descuento',
 'Un grupo de socios fieles propone pagar 12 meses adelantados si les haces un descuento. Te daria caja ahora y los ataria a ti por un ano.',
 'financiero', 'curado', 0.10, 5, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Ofrecer 15% de descuento por el plan anual a toda la base","consecuencias":{"caja":"+10%","precio_venta":"*0.92","churn":"*0.7"},"feedback_corto":"Entra mucha caja y bajan las bajas, pero resignas una parte del ingreso de todo el ano"},
   {"letra":"B","texto":"Ofrecer 8% de descuento solo a quienes llevan mas de un ano","consecuencias":{"caja":"+4%","precio_venta":"*0.97","churn":"*0.85"},"feedback_corto":"Premias la lealtad con un costo menor y un efecto mas chico"},
   {"letra":"C","texto":"Rechazar: prefieres la cuota mensual sin descuento","consecuencias":{"reputacion":"-2%","churn":"*1.05"},"feedback_corto":"Cuidas el precio, pero algunos socios fieles se sienten poco valorados"},
   {"letra":"D","texto":"Pagar el ano solo con beneficios (invitados, clases extra), sin descuento","consecuencias":{"caja":"+6%","costos":"+2%","churn":"*0.8"},"feedback_corto":"Fidelizas sin bajar el precio, aunque los beneficios tienen costo"}
 ]'::jsonb),

('SUS014',
 'Llega la temporada de vacaciones y los socios dejan de venir',
 'En vacaciones de verano y de invierno mucha gente viaja o cambia de rutina. Algunos socios se dan de baja por no usar el servicio, otros piden congelar su cuota.',
 'estacional', 'curado', 0.12, 3, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"churn","operacion":"multiplicar","valor":1.4}]}'::jsonb,
 '[
   {"letra":"A","texto":"Permitir congelar la membresia hasta dos meses sin costo","consecuencias":{"churn":"*0.7","caja":"-3%"},"feedback_corto":"Evitas bajas definitivas, pero durante el congelamiento no cobras"},
   {"letra":"B","texto":"Ofrecer una cuota reducida de vacaciones","consecuencias":{"precio_venta":"*0.95","churn":"*0.8"},"feedback_corto":"Mantienes al socio activo con menos ingreso"},
   {"letra":"C","texto":"No hacer nada: la membresia se cobra igual","consecuencias":{"churn":"*1.15","reputacion":"-3%"},"feedback_corto":"Cuidas la caja este mes, pero aumentan las bajas y las quejas"},
   {"letra":"D","texto":"Hacer una campana de reactivacion para cuando vuelvan","consecuencias":{"costos_comercializacion":"+5%","socios":"+3%","churn":"*0.9"},"feedback_corto":"Recuperas parte de los que se iban, con un gasto de marketing"}
 ]'::jsonb),

('SUS015',
 'Un socio tuyo se vuelve conocido y habla bien de ti en redes',
 'Alguien con muchos seguidores cuenta su experiencia con tu servicio y el video se comparte. Llegan consultas de gente nueva, pero tu capacidad de atencion es limitada.',
 'oportunidad', 'curado', 0.08, 5, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.2}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aprovechar al maximo con una promocion de bienvenida","consecuencias":{"socios":"+8%","precio_venta":"*0.97","costos":"+2%"},"feedback_corto":"Entran muchos socios, algunos solo por la promocion y se iran rapido"},
   {"letra":"B","texto":"Recibir solo a los que puedas atender bien","consecuencias":{"socios":"+4%","reputacion":"+4%","churn":"*0.9"},"feedback_corto":"Crecimiento mas lento y de socios que se quedan mas"},
   {"letra":"C","texto":"Hacerlo crecer con publicidad pagada aprovechando el momento","consecuencias":{"socios":"+10%","costos_comercializacion":"+8%","caja":"-3%"},"feedback_corto":"Mas alcance, con un costo de captacion mas alto por socio"},
   {"letra":"D","texto":"No hacer nada especial","consecuencias":{"socios":"+2%"},"feedback_corto":"Entra algo de gente, pero se enfria rapido"}
 ]'::jsonb),

('SUS016',
 'Tu servicio se queda corto: demasiados socios para tu capacidad',
 'Crecio la base y en horas pico ya no alcanza la atencion, el espacio o el soporte. Los socios empiezan a quejarse y algunos dicen que se van.',
 'operativo', 'curado', 0.10, 6, ARRAY['tipo:suscripcion'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.94},{"campo":"churn","operacion":"multiplicar","valor":1.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en ampliar capacidad (mas personal, mas horarios, mas soporte)","consecuencias":{"costos":"+6%","reputacion":"+6%","churn":"*0.75"},"feedback_corto":"Cuidas la calidad y a los socios, con un costo fijo mas alto"},
   {"letra":"B","texto":"Cerrar el ingreso de socios nuevos por un tiempo","consecuencias":{"socios":"-2%","reputacion":"+3%","churn":"*0.9"},"feedback_corto":"Proteges la calidad, pero frenas el crecimiento"},
   {"letra":"C","texto":"Subir la cuota para ordenar la demanda","consecuencias":{"precio_venta":"*1.06","churn":"*1.1"},"feedback_corto":"Ganas por socio, aunque se van los mas sensibles al precio"},
   {"letra":"D","texto":"Seguir igual y esperar que se acostumbren","consecuencias":{"costos":"-2%","reputacion":"-5%","churn":"*1.2"},"feedback_corto":"Ahorras, pero las quejas se convierten en bajas"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
