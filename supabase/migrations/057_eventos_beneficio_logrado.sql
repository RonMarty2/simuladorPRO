-- ============================================================================
-- 057 - Eventos de COSTO-BENEFICIO y MARKETING que mueven el beneficio realmente logrado
--
-- Estos proyectos se evaluan por un beneficio que se estima (ahorro de costos, perdidas
-- evitadas, ventas adicionales de una campana). El motor ahora lleva cuanto de ese
-- beneficio se esta logrando de verdad. Estos eventos usan el campo nuevo:
--   "ahorro": multiplica el beneficio logrado ("*0.7" = se logra 30% menos de lo esperado);
--             se recupera de a poco con los meses.
-- Se marcan con 'tipo:costo_beneficio' y 'tipo:marketing'. Idempotente.
-- Magnitudes a calibrar con casos reales.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('CBN012',
 'El ahorro real es menor que el que prometio el proveedor',
 'Al medir con datos de tu propia operacion, el ahorro que logras es menor que el de la cotizacion. Parte del equipo no se usa como se debia y otra parte se parece menos a las condiciones de tu planta.',
 'operativo', 'curado', 0.12, 4, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"ahorro","operacion":"multiplicar","valor":0.8}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratar una auditoria tecnica para ajustar la operacion","consecuencias":{"caja":"-3%","ahorro":"*1.15"},"feedback_corto":"Recuperas parte del ahorro perdido, con un gasto ahora"},
   {"letra":"B","texto":"Capacitar a los operadores en el uso correcto","consecuencias":{"costos":"+2%","ahorro":"*1.1","reputacion":"+2%"},"feedback_corto":"Mejoras el uso a bajo costo, aunque tarda en notarse"},
   {"letra":"C","texto":"Reclamar al proveedor por el incumplimiento de lo prometido","consecuencias":{"ahorro":"*1.05","costos":"+1%"},"feedback_corto":"Puede traer una compensacion, pero es lento e incierto"},
   {"letra":"D","texto":"Aceptar el ahorro menor y seguir operando","consecuencias":{"ahorro":"*0.95"},"feedback_corto":"No gastas mas, pero la inversion rinde menos de lo que calculaste"}
 ]'::jsonb),

('CBN013',
 'Se posterga el mantenimiento y el equipo pierde rendimiento',
 'Por apuros de caja se salto el mantenimiento programado. Pasan los meses y el equipo rinde cada vez menos, con paradas cortas que pocos registran.',
 'operativo', 'curado', 0.12, 6, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"ahorro","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Hacer el mantenimiento completo ahora","consecuencias":{"caja":"-4%","ahorro":"*1.2"},"feedback_corto":"Recuperas el rendimiento del equipo, a costa de un desembolso grande"},
   {"letra":"B","texto":"Hacer solo lo urgente y dejar el resto para despues","consecuencias":{"caja":"-1%","ahorro":"*1.05"},"feedback_corto":"Frenas lo peor sin resolver de fondo"},
   {"letra":"C","texto":"Firmar un contrato de mantenimiento con pago mensual","consecuencias":{"costos":"+3%","ahorro":"*1.15"},"feedback_corto":"Estabilizas el rendimiento con un costo fijo mensual"},
   {"letra":"D","texto":"Seguir postergando: la caja esta primero","consecuencias":{"ahorro":"*0.9","costos":"-1%"},"feedback_corto":"Ahorras hoy, pero el beneficio de tu inversion se va apagando"}
 ]'::jsonb),

('CBN014',
 'Sube el precio de lo que dejaste de gastar: el ahorro vale mas',
 'El precio de la energia, del agua o del insumo que ahorras sube con fuerza. Cada unidad que dejas de consumir ahora vale mas.',
 'oportunidad', 'curado', 0.08, 5, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"ahorro","operacion":"multiplicar","valor":1.2}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ampliar la inversion para ahorrar aun mas","consecuencias":{"caja":"-6%","ahorro":"*1.2"},"feedback_corto":"Capturas mas del beneficio, con una nueva inversion"},
   {"letra":"B","texto":"Mantener lo que tienes y aprovechar el mayor valor","consecuencias":{"ahorro":"*1.08"},"feedback_corto":"Una mejora sin riesgo ni gasto"},
   {"letra":"C","texto":"Vender parte del ahorro a un tercero (por ejemplo, excedentes)","consecuencias":{"caja":"+4%","ahorro":"*0.95"},"feedback_corto":"Caja hoy a cambio de renunciar a parte del beneficio"},
   {"letra":"D","texto":"No hacer nada","consecuencias":{"ahorro":"*1.03"},"feedback_corto":"Te llevas lo que viene sin esfuerzo"}
 ]'::jsonb),

('CBN015',
 'Efecto rebote: como ahora sale mas barato, se usa mas',
 'Al bajar el costo de operar, tu equipo empieza a usar mas el servicio o el equipo. El ahorro por unidad es real, pero el consumo total sube y se come parte del beneficio.',
 'conductual', 'curado', 0.10, 6, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"ahorro","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Poner limites y metas de consumo por area","consecuencias":{"ahorro":"*1.1","costos":"+1%","reputacion":"-1%"},"feedback_corto":"Controlas el rebote con algo de friccion interna"},
   {"letra":"B","texto":"Medir y mostrar el consumo para generar conciencia","consecuencias":{"ahorro":"*1.06","costos":"+1%"},"feedback_corto":"Una medida suave con efecto gradual"},
   {"letra":"C","texto":"Aprovechar el mayor uso: es parte del valor del proyecto","consecuencias":{"ahorro":"*0.97","reputacion":"+2%"},"feedback_corto":"El equipo trabaja mejor, aunque tu ahorro medido baje"},
   {"letra":"D","texto":"Ignorarlo","consecuencias":{"ahorro":"*0.92"},"feedback_corto":"El rebote sigue comiendose el beneficio"}
 ]'::jsonb),

('MKT012',
 'Tu campana se satura: la gente ya vio el mensaje demasiadas veces',
 'Los primeros meses la campana funciono, pero ahora el publico objetivo ya vio los avisos muchas veces. Cada boliviano adicional genera menos ventas.',
 'riesgo', 'curado', 0.12, 4, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"ahorro","operacion":"multiplicar","valor":0.8}]}'::jsonb,
 '[
   {"letra":"A","texto":"Renovar el mensaje y los formatos","consecuencias":{"costos":"+4%","ahorro":"*1.2"},"feedback_corto":"Recuperas la atencion con trabajo creativo y gasto"},
   {"letra":"B","texto":"Mover la pauta a otros canales y publicos","consecuencias":{"costos":"+2%","ahorro":"*1.1"},"feedback_corto":"Llegas a gente nueva con algo de prueba y error"},
   {"letra":"C","texto":"Reducir la pauta y esperar","consecuencias":{"costos":"-5%","ahorro":"*0.95"},"feedback_corto":"Cuidas el presupuesto, pero la presencia de marca se debilita"},
   {"letra":"D","texto":"Subir la pauta para compensar","consecuencias":{"costos":"+8%","ahorro":"*1.02"},"feedback_corto":"Gastas mas para lograr casi lo mismo"}
 ]'::jsonb),

('MKT013',
 'La competencia responde con una campana propia',
 'Tu competidor principal lanza una campana fuerte justo cuando empezabas a ganar terreno. Parte de las ventas adicionales que atribuias a tu campana se las lleva el.',
 'competencia', 'curado', 0.10, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"ahorro","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Responder con una promocion directa","consecuencias":{"precio_venta":"*0.96","ahorro":"*1.15"},"feedback_corto":"Defiendes las ventas, a costa del margen de cada una"},
   {"letra":"B","texto":"Reforzar lo que te diferencia en lugar de bajar precios","consecuencias":{"costos":"+3%","ahorro":"*1.08","reputacion":"+3%"},"feedback_corto":"Construyes valor de marca, con resultados mas lentos"},
   {"letra":"C","texto":"Ignorar y seguir con tu plan","consecuencias":{"ahorro":"*0.95"},"feedback_corto":"Mantienes la calma, pero regalas terreno"},
   {"letra":"D","texto":"Aliarte con un socio para una campana conjunta","consecuencias":{"costos":"+2%","ahorro":"*1.12"},"feedback_corto":"Sumas alcance y compartes el costo, con menos control"}
 ]'::jsonb),

('MKT014',
 'Un contenido tuyo se vuelve viral',
 'Un video o una publicacion de tu campana se comparte de forma inesperada y llega a mucha mas gente de la que pagaste. Llegan consultas y ventas, aunque no sabes cuanto va a durar.',
 'oportunidad', 'curado', 0.07, 4, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"ahorro","operacion":"multiplicar","valor":1.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir rapido para aprovechar el momento","consecuencias":{"costos":"+5%","ahorro":"*1.15"},"feedback_corto":"Sacas todo el provecho si el ritmo dura; si se apaga, gastaste de mas"},
   {"letra":"B","texto":"Acompanar con atencion y stock sin gastar de mas","consecuencias":{"costos":"+1%","ahorro":"*1.05","reputacion":"+3%"},"feedback_corto":"Cuidas la experiencia de los nuevos clientes"},
   {"letra":"C","texto":"Dejar que siga solo","consecuencias":{"ahorro":"*1.02"},"feedback_corto":"No cuesta nada, pero el efecto se enfria rapido"},
   {"letra":"D","texto":"Convertir a los nuevos clientes en base propia (lista, descuentos)","consecuencias":{"costos":"+2%","ahorro":"*1.1","reputacion":"+2%"},"feedback_corto":"Intentas que el impulso se vuelva ventas repetidas"}
 ]'::jsonb),

('MKT015',
 'La medicion muestra que parte de las ventas no eran de la campana',
 'Al revisar los datos con cuidado, ves que una parte de las ventas que atribuias a la campana hubieran ocurrido igual. El beneficio real es menor que el que mostraba tu informe.',
 'riesgo', 'curado', 0.10, 6, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"ahorro","operacion":"multiplicar","valor":0.8}]}'::jsonb,
 '[
   {"letra":"A","texto":"Armar un grupo de control para medir bien el efecto real","consecuencias":{"costos":"+2%","ahorro":"*1.1","reputacion":"+2%"},"feedback_corto":"Aprendes que funciona de verdad y ajustas tu inversion"},
   {"letra":"B","texto":"Recortar la campana a lo que si funciona","consecuencias":{"costos":"-6%","ahorro":"*1.05"},"feedback_corto":"Dejas de pagar por ventas que no son tuyas"},
   {"letra":"C","texto":"Seguir igual: no hay certeza de que haya problema","consecuencias":{"ahorro":"*0.95"},"feedback_corto":"Evitas el trabajo, pero sigues pagando por un efecto dudoso"},
   {"letra":"D","texto":"Cambiar la forma de informar para que los numeros se vean mejor","consecuencias":{"reputacion":"-4%","ahorro":"*0.9"},"feedback_corto":"Maquillar los datos no mejora el negocio y daña la confianza interna"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
