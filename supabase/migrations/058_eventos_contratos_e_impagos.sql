-- ============================================================================
-- 058 - Eventos de ALQUILER, SALUD PRIVADA, EDUCACION PRIVADA y CONCESION que mueven
--       la ocupacion contratada y los impagos
--
-- El motor ahora lleva dos variables propias de los negocios con contratos y cobranza:
--   "ocupacion": ocupacion contratada frente al plan ("-15%" = 15% menos inquilinos,
--                alumnos o clientes). Cambia de golpe en el evento y luego se mueve despacio.
--   "impagos":   multiplica los impagos normales ("*2" = el doble de inquilinos morosos,
--                glosas o pensiones sin pagar). Se normaliza con los meses.
-- Se marcan con 'tipo:alquiler', 'tipo:salud_privada', 'tipo:educacion_privada' y
-- 'tipo:concesion'. Idempotente. Magnitudes a calibrar con casos reales.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('ALQ012',
 'Tu inquilino mas grande deja de pagar',
 'El inquilino que ocupa la mayor parte de tus espacios se atrasa tres meses y pide renegociar. Si lo desalojas, el espacio queda vacio; si lo sostienes, tu flujo sufre.',
 'riesgo', 'curado', 0.10, 4, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"impagos","operacion":"multiplicar","valor":2.5}]}'::jsonb,
 '[
   {"letra":"A","texto":"Renegociar un plan de pago con garantia","consecuencias":{"impagos":"*0.6","costos":"+1%"},"feedback_corto":"Conservas al inquilino y recuperas parte de lo adeudado, con riesgo de que vuelva a fallar"},
   {"letra":"B","texto":"Iniciar el desalojo por la via legal","consecuencias":{"ocupacion":"-12%","impagos":"*0.8","caja":"-3%"},"feedback_corto":"Cortas la perdida, pero el espacio queda vacio y el juicio cuesta y tarda"},
   {"letra":"C","texto":"Pedir un deposito adicional y una garantia solidaria","consecuencias":{"impagos":"*0.7","reputacion":"-2%"},"feedback_corto":"Reduces el riesgo, aunque puedes perder al inquilino si se ofende"},
   {"letra":"D","texto":"Tolerar el atraso y esperar que se ponga al dia","consecuencias":{"impagos":"*1.2"},"feedback_corto":"Evitas el conflicto, pero la deuda crece y tus gastos no esperan"}
 ]'::jsonb),

('ALQ013',
 'Se abre un edificio nuevo con mejores condiciones en la zona',
 'Un competidor inaugura un edificio mas moderno a pocas cuadras, con ofertas de lanzamiento. Algunos de tus inquilinos empiezan a mirar.',
 'competencia', 'curado', 0.10, 5, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"ocupacion","operacion":"multiplicar","valor":0.94}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar la renta para retener a los que dudan","consecuencias":{"precio_venta":"*0.93","ocupacion":"+4%"},"feedback_corto":"Frenas la salida a cambio de menos ingreso de todos"},
   {"letra":"B","texto":"Renovar areas comunes y servicios","consecuencias":{"caja":"-5%","reputacion":"+5%","ocupacion":"+3%"},"feedback_corto":"Mejoras el atractivo con una inversion, y el efecto tarda en verse"},
   {"letra":"C","texto":"Ofrecer contratos largos con renta congelada","consecuencias":{"precio_venta":"*0.97","ocupacion":"+5%"},"feedback_corto":"Aseguras ocupacion futura renunciando a subir la renta"},
   {"letra":"D","texto":"No hacer nada y mantener la renta","consecuencias":{"ocupacion":"-5%"},"feedback_corto":"Proteges el precio, pero se van los inquilinos mas sensibles"}
 ]'::jsonb),

('ALQ014',
 'Una falla grande exige reparar el edificio',
 'Una filtracion o una falla electrica obliga a una reparacion mayor. Si el edificio queda con problemas, los inquilinos pueden irse.',
 'operativo', 'curado', 0.10, 6, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.08}]}'::jsonb,
 '[
   {"letra":"A","texto":"Hacer la reparacion completa y definitiva","consecuencias":{"caja":"-8%","reputacion":"+3%"},"feedback_corto":"Resuelves de raiz con un desembolso grande"},
   {"letra":"B","texto":"Hacer un arreglo provisional barato","consecuencias":{"caja":"-2%","reputacion":"-3%","ocupacion":"-3%"},"feedback_corto":"Ahorras hoy, pero el problema vuelve y los inquilinos se quejan"},
   {"letra":"C","texto":"Repartir parte del costo con los inquilinos via expensas","consecuencias":{"caja":"-4%","ocupacion":"-4%","reputacion":"-2%"},"feedback_corto":"Reduces tu gasto, a costa de molestar a quienes pagan"},
   {"letra":"D","texto":"Contratar un seguro y reclamar la cobertura","consecuencias":{"caja":"-3%","costos":"+1%"},"feedback_corto":"Trasladas parte del riesgo, con tramite y deducible"}
 ]'::jsonb),

('ALQ015',
 'La inflacion permite reajustar las rentas',
 'La inflacion subio y tus contratos permiten un reajuste. Subir mucho puede vaciar espacios, subir poco te deja atras frente a tus costos.',
 'financiero', 'curado', 0.12, 4, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Reajustar 12% a todos","consecuencias":{"precio_venta":"*1.12","ocupacion":"-4%"},"feedback_corto":"Capturas mas por espacio, pero algunos se van"},
   {"letra":"B","texto":"Reajustar 6% acompanando la inflacion","consecuencias":{"precio_venta":"*1.06","ocupacion":"-1%"},"feedback_corto":"Sigues a tus costos sin asustar a nadie"},
   {"letra":"C","texto":"Reajustar solo a los contratos que vencen","consecuencias":{"precio_venta":"*1.04","reputacion":"+2%"},"feedback_corto":"Un camino prudente que cuida la relacion"},
   {"letra":"D","texto":"No reajustar para no perder inquilinos","consecuencias":{"ocupacion":"+2%","costos":"+2%"},"feedback_corto":"Retienes ocupacion, pero tu margen real se achica"}
 ]'::jsonb),

('SAL012',
 'Una aseguradora glosa una parte grande de tus facturas',
 'Una aseguradora rechaza como no cubierto un porcentaje de tus atenciones del ultimo trimestre, con observaciones en los expedientes. El dinero que contabas como ingreso no llega.',
 'financiero', 'curado', 0.12, 4, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"glosas","operacion":"multiplicar","valor":2.5}]}'::jsonb,
 '[
   {"letra":"A","texto":"Armar un equipo que audite y responda cada glosa","consecuencias":{"glosas":"*0.55","costos":"+2%"},"feedback_corto":"Recuperas buena parte con trabajo administrativo extra"},
   {"letra":"B","texto":"Aceptar la glosa para no pelearte con la aseguradora","consecuencias":{"glosas":"*1.1","reputacion":"+1%"},"feedback_corto":"Cuidas la relacion y absorbes la perdida"},
   {"letra":"C","texto":"Capacitar a medicos y admision para llenar bien los expedientes","consecuencias":{"costos":"+2%","glosas":"*0.75"},"feedback_corto":"Reduces glosas futuras, aunque no recuperas las actuales"},
   {"letra":"D","texto":"Dejar de atender a esa aseguradora","consecuencias":{"ocupacion":"-5%","glosas":"*0.5"},"feedback_corto":"Cortas la perdida, pero tambien los pacientes que traia"}
 ]'::jsonb),

('SAL013',
 'La caja de salud se atrasa meses en pagarte',
 'La caja de salud, que es tu mayor pagador, demora los pagos y acumula deuda contigo. Tienes personal e insumos que pagar cada mes.',
 'financiero', 'curado', 0.10, 5, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"dias_cobro","operacion":"sumar","valor":45}]}'::jsonb,
 '[
   {"letra":"A","texto":"Descontar facturas con un banco o factoring","consecuencias":{"dias_cobro":"-35","costos":"+2%"},"feedback_corto":"Recuperas liquidez ya, pagando un costo por adelantado"},
   {"letra":"B","texto":"Seguir atendiendo y financiarte con proveedores","consecuencias":{"costos":"+2%","reputacion":"-2%"},"feedback_corto":"Sostienes la operacion, estirando a tus proveedores"},
   {"letra":"C","texto":"Limitar la atencion a pacientes de esa caja","consecuencias":{"ocupacion":"-6%","dias_cobro":"-20"},"feedback_corto":"Reduces la exposicion, perdiendo pacientes y volumen"},
   {"letra":"D","texto":"Presionar con una gestion conjunta con otras clinicas","consecuencias":{"dias_cobro":"-15","reputacion":"+1%"},"feedback_corto":"Sumas fuerza para que paguen, con resultado incierto"}
 ]'::jsonb),

('SAL014',
 'Un medico muy solicitado se va y se lleva a sus pacientes',
 'Uno de los especialistas que mas pacientes te traia abre su propio consultorio y varios de sus pacientes lo siguen.',
 'operativo', 'curado', 0.08, 6, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"ocupacion","operacion":"multiplicar","valor":0.9}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratar rapido un reemplazo de buen nivel","consecuencias":{"costos":"+4%","ocupacion":"+5%"},"feedback_corto":"Recuperas parte de la demanda con un costo fijo mayor"},
   {"letra":"B","texto":"Ofrecer a otros especialistas participacion en los ingresos","consecuencias":{"costos":"+2%","ocupacion":"+3%","reputacion":"+2%"},"feedback_corto":"Alineas intereses, cediendo parte del margen"},
   {"letra":"C","texto":"Hacer un acuerdo para que siga atendiendo en tu clinica","consecuencias":{"ocupacion":"+4%","precio_venta":"*0.97"},"feedback_corto":"Lo conservas, con condiciones economicas mejores para el"},
   {"letra":"D","texto":"Aceptar la perdida y reordenar la agenda","consecuencias":{"costos":"-2%","ocupacion":"-3%"},"feedback_corto":"Ajustas el gasto, pero tu oferta queda mas floja"}
 ]'::jsonb),

('SAL015',
 'Un brote de enfermedad llena tu clinica',
 'Un brote estacional lleva muchos pacientes a tu servicio de urgencias y consultorios. Tu capacidad esta al limite.',
 'oportunidad', 'curado', 0.08, 4, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ampliar turnos y contratar personal temporal","consecuencias":{"costos":"+6%","reputacion":"+4%"},"feedback_corto":"Atiendes a mas gente, con mas gasto y riesgo de fatiga"},
   {"letra":"B","texto":"Atender solo con la capacidad que tienes","consecuencias":{"reputacion":"-3%","costos":"+1%"},"feedback_corto":"Cuidas la calidad pero pierdes pacientes y generas esperas"},
   {"letra":"C","texto":"Derivar casos menos graves a otros centros","consecuencias":{"reputacion":"+1%","costos":"-1%"},"feedback_corto":"Te enfocas en lo que sabes hacer mejor"},
   {"letra":"D","texto":"Subir temporalmente los precios de urgencias","consecuencias":{"precio_venta":"*1.06","reputacion":"-4%"},"feedback_corto":"Ganas por paciente, aunque te arriesgas a criticas por oportunismo"}
 ]'::jsonb),

('EDP010',
 'Muchas familias se atrasan con las pensiones',
 'Una crisis economica hace que varias familias se atrasen en la pension mensual. Tu docente, tu alquiler y tus servicios no esperan.',
 'financiero', 'curado', 0.12, 4, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"pensiones_impagas","operacion":"multiplicar","valor":2.2}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ofrecer planes de pago a las familias que lo pidan","consecuencias":{"impagos":"*0.65","costos":"+1%","reputacion":"+2%"},"feedback_corto":"Cobras mas de lo atrasado cuidando la relacion"},
   {"letra":"B","texto":"Aplicar estrictamente el reglamento: sin pago no hay examen","consecuencias":{"impagos":"*0.7","ocupacion":"-5%","reputacion":"-5%"},"feedback_corto":"Cobras, pero se van alumnos y se daña tu imagen"},
   {"letra":"C","texto":"Dar becas parciales a los casos de mayor necesidad","consecuencias":{"precio_venta":"*0.96","ocupacion":"+2%","reputacion":"+3%"},"feedback_corto":"Retienes alumnos con una pequena baja de ingreso"},
   {"letra":"D","texto":"No hacer nada y absorber el atraso","consecuencias":{"impagos":"*1.15"},"feedback_corto":"No haces olas, pero tu caja carga el costo"}
 ]'::jsonb),

('EDP011',
 'Se abre un colegio nuevo con cuotas mas bajas',
 'Un colegio nuevo abre cerca con una pension menor y mucha publicidad. Algunas familias consideran cambiarse al terminar el ano.',
 'competencia', 'curado', 0.10, 5, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"ocupacion","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mejorar la propuesta academica y comunicarla","consecuencias":{"costos":"+3%","reputacion":"+5%","ocupacion":"+3%"},"feedback_corto":"Retienes a las familias que valoran la calidad, con gasto y paciencia"},
   {"letra":"B","texto":"Bajar la pension para competir","consecuencias":{"precio_venta":"*0.92","ocupacion":"+4%"},"feedback_corto":"Frenas la fuga a cambio de menos ingreso por alumno"},
   {"letra":"C","texto":"Ofrecer descuento por hermanos y pago anual","consecuencias":{"precio_venta":"*0.97","ocupacion":"+3%","caja":"+3%"},"feedback_corto":"Fidelizas y adelantas caja, con menos ingreso total"},
   {"letra":"D","texto":"Ignorar al competidor","consecuencias":{"ocupacion":"-4%"},"feedback_corto":"Mantienes tus precios, pero se van las familias mas sensibles"}
 ]'::jsonb),

('EDP012',
 'La reinscripcion baja: muchas familias dudan de seguir',
 'Al abrir las reinscripciones notas que menos familias de las esperadas confirman cupo para el proximo ano.',
 'operativo', 'curado', 0.10, 6, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"ocupacion","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Llamar y reunirte con cada familia que dudo","consecuencias":{"costos":"+2%","ocupacion":"+5%","reputacion":"+3%"},"feedback_corto":"Recuperas a varias con tiempo de tu equipo directivo"},
   {"letra":"B","texto":"Lanzar un descuento de reinscripcion temprana","consecuencias":{"precio_venta":"*0.97","ocupacion":"+4%","caja":"+2%"},"feedback_corto":"Cierras cupos antes, con menos ingreso por alumno"},
   {"letra":"C","texto":"Abrir cupos a familias nuevas con una campana","consecuencias":{"costos":"+4%","ocupacion":"+3%"},"feedback_corto":"Reemplazas a los que se van, con costo de captacion"},
   {"letra":"D","texto":"Esperar a ver cuantos confirman al final","consecuencias":{"ocupacion":"-3%"},"feedback_corto":"No gastas, pero llegas al inicio de clases con cupos vacios"}
 ]'::jsonb),

('CON011',
 'Los usuarios dejan de pagar la tarifa',
 'Un grupo de usuarios se organiza para no pagar la tarifa, alegando mala calidad del servicio. El contagio crece mes a mes.',
 'riesgo', 'curado', 0.10, 5, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"impagos","operacion":"multiplicar","valor":2.2}]}'::jsonb,
 '[
   {"letra":"A","texto":"Abrir una mesa de dialogo y mejorar el servicio","consecuencias":{"impagos":"*0.65","costos":"+3%","reputacion":"+5%"},"feedback_corto":"Reduces el conflicto con inversion y paciencia"},
   {"letra":"B","texto":"Cortar el servicio a los morosos","consecuencias":{"impagos":"*0.6","reputacion":"-6%","ocupacion":"-4%"},"feedback_corto":"Cobras mas, con un costo politico y de imagen alto"},
   {"letra":"C","texto":"Ofrecer planes de pago a quienes deben","consecuencias":{"impagos":"*0.75","caja":"-2%"},"feedback_corto":"Recuperas parte de lo adeudado con un cobro mas lento"},
   {"letra":"D","texto":"Esperar que el reclamo se enfrie","consecuencias":{"impagos":"*1.15","reputacion":"-2%"},"feedback_corto":"No gastas, pero el no pago se extiende"}
 ]'::jsonb),

('CON012',
 'El regulador congela la tarifa mientras sube tu costo',
 'El regulador niega el reajuste de tarifa que pedias, mientras la energia y los insumos suben. La brecha entre lo que cobras y lo que cuesta crece.',
 'regulatorio', 'curado', 0.08, 6, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.1}]}'::jsonb,
 '[
   {"letra":"A","texto":"Presentar un estudio tecnico para pedir el reajuste","consecuencias":{"caja":"-2%","precio_venta":"*1.05","reputacion":"+1%"},"feedback_corto":"Si tus numeros son solidos puedes lograr algo, con tiempo y costo"},
   {"letra":"B","texto":"Recortar mantenimiento para aguantar","consecuencias":{"costos":"-4%","reputacion":"-4%","ocupacion":"-3%"},"feedback_corto":"Alivias hoy y deterioras la red que sostiene tu negocio"},
   {"letra":"C","texto":"Eficientizar la operacion (perdidas de agua, energia)","consecuencias":{"costos":"-3%","caja":"-3%"},"feedback_corto":"Reduces el costo con inversion antes de ver el ahorro"},
   {"letra":"D","texto":"Pedir apoyo financiero al Estado como contraparte","consecuencias":{"caja":"+4%","reputacion":"-2%"},"feedback_corto":"Cubres el hueco a cambio de depender de la decision politica"}
 ]'::jsonb),

('CON013',
 'Nuevas conexiones: un barrio entero pide el servicio',
 'Un barrio crece y pide conectarse a tu red. Ampliarla cuesta, pero cada conexion nueva es un cliente por muchos anos.',
 'oportunidad', 'curado', 0.08, 6, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Ampliar la red y conectar a todos","consecuencias":{"caja":"-8%","ocupacion":"+10%","deuda":"+5%"},"feedback_corto":"Sumas muchos clientes con una inversion y deuda mayores"},
   {"letra":"B","texto":"Conectar en etapas, segun lo que puedas financiar","consecuencias":{"caja":"-4%","ocupacion":"+5%"},"feedback_corto":"Crecimiento prudente sin comprometer la caja"},
   {"letra":"C","texto":"Pedir que la comunidad o el municipio paguen la red","consecuencias":{"ocupacion":"+6%","reputacion":"+2%","costos":"+1%"},"feedback_corto":"Reduces tu inversion, aunque la negociacion tarda"},
   {"letra":"D","texto":"Postergar hasta mejorar tu situacion","consecuencias":{"reputacion":"-3%"},"feedback_corto":"Cuidas la caja, pero dejas insatisfecha a la comunidad"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
