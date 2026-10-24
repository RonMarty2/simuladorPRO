-- ============================================================================
-- 055 - Eventos de microcredito que mueven la MORA de la cartera
--
-- El motor ahora lleva la mora como variable viva en los proyectos de microcredito.
-- Estos eventos usan el campo nuevo:
--   "mora": multiplica la mora del plan ("*1.5" = la mora sube 50%, y con ella la
--           prevision que pagas); se recupera de a poco con los meses.
-- Se marcan con 'tipo:microcredito'. Idempotente. Magnitudes a calibrar con gremios.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('MIC012',
 'Una helada y una caida de precios golpean a tus clientes del campo',
 'Muchos de tus prestatarios venden productos agricolas en ferias. Una helada y un derrumbe de precios hacen que se atrasen en sus cuotas. Los oficiales empiezan a reportar clientes que no encuentran como pagar.',
 'riesgo', 'curado', 0.10, 4, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"mora","operacion":"multiplicar","valor":1.5}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reprogramar los creditos afectados con un plazo mas largo","consecuencias":{"mora":"*0.75","caja":"-3%"},"feedback_corto":"Evitas que se conviertan en incobrables, pero cobras mas tarde y tu liquidez sufre"},
   {"letra":"B","texto":"Exigir el pago y empezar la cobranza fuerte","consecuencias":{"mora":"*1.15","reputacion":"-6%"},"feedback_corto":"Recuperas algo ahora, pero la cobranza dura enoja a la comunidad y puede dispararte la mora mas adelante"},
   {"letra":"C","texto":"Dar un periodo de gracia solo a quienes demuestren el dano","consecuencias":{"mora":"*0.85","costos":"+2%","reputacion":"+3%"},"feedback_corto":"Cuidas al buen cliente con mas trabajo de tus oficiales"},
   {"letra":"D","texto":"Dejar de prestar al sector por un tiempo","consecuencias":{"demanda":"*0.9","mora":"*0.9"},"feedback_corto":"Reduces el riesgo, pero pierdes colocaciones y clientes"}
 ]'::jsonb),

('MIC013',
 'Tus clientes ya deben en otras tres entidades',
 'Al revisar la central de riesgos ves que una parte importante de tu cartera tiene deudas en varias entidades a la vez. Si uno cae, arrastra a los demas.',
 'riesgo', 'curado', 0.10, 5, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"mora","operacion":"multiplicar","valor":1.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Endurecer los requisitos: no prestar a quien ya debe en dos o mas entidades","consecuencias":{"demanda":"*0.88","mora":"*0.75"},"feedback_corto":"La cartera nueva es mas sana, pero colocas menos"},
   {"letra":"B","texto":"Seguir prestando igual, vigilando de cerca","consecuencias":{"mora":"*1.15","costos":"+2%"},"feedback_corto":"Mantienes el volumen, pero asumes mas riesgo y mas trabajo de seguimiento"},
   {"letra":"C","texto":"Ofrecer a esos clientes unificar sus deudas contigo","consecuencias":{"demanda":"*1.05","mora":"*0.9","caja":"-4%"},"feedback_corto":"Los ordenas y los fidelizas, a costa de prestarles mas"},
   {"letra":"D","texto":"Subir la tasa a los clientes con mas deudas","consecuencias":{"precio_venta":"*1.05","mora":"*1.1"},"feedback_corto":"Cobras por el riesgo, pero empujas al limite a quien ya esta apretado"}
 ]'::jsonb),

('MIC014',
 'Un grupo organizado llama a no pagar los creditos',
 'En un barrio se corre la voz de que no hay que pagar a las entidades de microfinanzas. Algunos clientes empiezan a atrasarse por solidaridad y no por necesidad.',
 'riesgo', 'curado', 0.06, 6, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"mora","operacion":"multiplicar","valor":1.6},{"campo":"reputacion","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Dialogar con los dirigentes y ofrecer reprogramar caso por caso","consecuencias":{"mora":"*0.7","costos":"+3%","reputacion":"+4%"},"feedback_corto":"Cortas el contagio con tiempo y paciencia de tu equipo"},
   {"letra":"B","texto":"Demandar judicialmente a los que se nieguen","consecuencias":{"mora":"*1.1","reputacion":"-7%","caja":"-3%"},"feedback_corto":"Das una senal fuerte, pero el conflicto se vuelve publico y caro"},
   {"letra":"C","texto":"Apoyarte en la asociacion de entidades para una respuesta conjunta","consecuencias":{"mora":"*0.8","costos":"+1%"},"feedback_corto":"Compartes el costo y el respaldo, con menos control propio"},
   {"letra":"D","texto":"No hacer nada y esperar que pase","consecuencias":{"mora":"*1.2","reputacion":"-3%"},"feedback_corto":"No gastas, pero el atraso se extiende"}
 ]'::jsonb),

('MIC015',
 'Tus oficiales de credito compiten por colocar y bajan la exigencia',
 'Hay un bono por creditos colocados y los oficiales empiezan a aprobar mas rapido, con menos visitas. Los desembolsos suben, pero tu jefe de riesgos advierte que la calidad baja.',
 'operativo', 'curado', 0.10, 4, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.15}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cambiar el bono: pagar por cartera sana a 6 meses, no por colocacion","consecuencias":{"demanda":"*0.93","mora":"*0.8","costos":"+2%"},"feedback_corto":"Colocas menos, pero la cartera nueva se paga"},
   {"letra":"B","texto":"Dejar el bono y aprovechar el impulso","consecuencias":{"demanda":"*1.1","mora":"*1.3"},"feedback_corto":"Subes los desembolsos hoy y la mora aparece unos meses despues"},
   {"letra":"C","texto":"Mantener el bono pero exigir una segunda visita antes de aprobar","consecuencias":{"costos":"+4%","mora":"*0.9"},"feedback_corto":"Controlas la calidad con mas trabajo y costo"},
   {"letra":"D","texto":"Subir el bono para premiar el crecimiento","consecuencias":{"demanda":"*1.15","costos":"+3%","mora":"*1.4"},"feedback_corto":"Crecimiento acelerado que probablemente te pase factura en la mora"}
 ]'::jsonb),

('MIC016',
 'Un sistema de calificacion de clientes te ofrece prestar con mas informacion',
 'Un proveedor te ofrece un sistema que califica a cada cliente con su historial y datos de pago. Promete menos mora, pero cuesta y tus oficiales deberan aprender a usarlo.',
 'oportunidad', 'curado', 0.08, 5, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratarlo completo y capacitar a todo el equipo","consecuencias":{"caja":"-6%","mora":"*0.75","reputacion":"+2%"},"feedback_corto":"Inviertes ahora y reduces la mora de forma sostenida"},
   {"letra":"B","texto":"Probarlo solo con los clientes nuevos","consecuencias":{"caja":"-2%","mora":"*0.92"},"feedback_corto":"Costo bajo y mejora gradual"},
   {"letra":"C","texto":"Rechazarlo: confias en el criterio de tus oficiales","consecuencias":{"mora":"*1.03"},"feedback_corto":"No gastas, pero te quedas sin una herramienta que usan tus competidores"},
   {"letra":"D","texto":"Desarrollar uno propio mas barato","consecuencias":{"caja":"-3%","costos":"+2%","mora":"*0.95"},"feedback_corto":"Lo adaptas a tu cartera, pero tarda y puede salir peor"}
 ]'::jsonb),

('MIC017',
 'El regulador exige reprogramar creditos a clientes afectados por una crisis',
 'Una crisis economica lleva al regulador a obligar a reprogramar creditos de clientes afectados. Tu mora publicada se ve mejor, pero tu liquidez cae porque recibes menos cuotas.',
 'regulatorio', 'curado', 0.07, 6, ARRAY['tipo:microcredito'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.97}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cumplir y reprogramar a todos los que lo pidan","consecuencias":{"mora":"*0.8","caja":"-5%"},"feedback_corto":"Cumples y evitas mora, pero cobras menos en estos meses"},
   {"letra":"B","texto":"Reprogramar con revision caso por caso","consecuencias":{"mora":"*0.9","costos":"+3%","caja":"-2%"},"feedback_corto":"Proteges mejor la cartera, con mas trabajo para tus oficiales"},
   {"letra":"C","texto":"Cumplir lo minimo y conseguir fondeo adicional para la liquidez","consecuencias":{"mora":"*0.9","deuda":"+8%"},"feedback_corto":"Sostienes la caja con mas deuda"},
   {"letra":"D","texto":"Resistir y apelar la norma","consecuencias":{"mora":"*1.1","reputacion":"-4%"},"feedback_corto":"Arriesgas sanciones y la relacion con tus clientes"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
