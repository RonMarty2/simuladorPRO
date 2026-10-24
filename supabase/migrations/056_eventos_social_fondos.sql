-- ============================================================================
-- 056 - Eventos de proyectos SOCIALES que mueven los FONDOS que financian el proyecto
--
-- El motor ahora trata a los proyectos sociales distinto: no venden, los financia un
-- tercero (municipio, gobernacion, donante) y el beneficio no entra a la caja. Estos
-- eventos usan el campo nuevo:
--   "presupuesto": multiplica los fondos que llegan ("*0.7" = llega 30% menos de lo previsto);
--                  se recupera de a poco con los meses.
-- Se marcan con 'tipo:social'. Idempotente. Magnitudes a calibrar con instituciones.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('SOC012',
 'El municipio recorta el presupuesto del proyecto',
 'Por una caida de ingresos del municipio, el concejo recorta las transferencias a varios programas, y el tuyo esta entre ellos. Los gastos de operar siguen igual.',
 'financiero', 'curado', 0.10, 4, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"presupuesto","operacion":"multiplicar","valor":0.7}]}'::jsonb,
 '[
   {"letra":"A","texto":"Recortar horarios y actividades para ajustarte a los fondos","consecuencias":{"demanda":"*0.9","costos":"-8%","reputacion":"-4%"},"feedback_corto":"Cuidas la reserva, pero atiendes a menos gente y se resiente la confianza de la comunidad"},
   {"letra":"B","texto":"Buscar un donante o cooperacion que cubra la diferencia","consecuencias":{"presupuesto":"*1.2","costos":"+2%"},"feedback_corto":"Si lo consigues, recuperas parte del recorte, con trabajo y tiempo del equipo"},
   {"letra":"C","texto":"Cubrir el hueco con la reserva y esperar que se restituya","consecuencias":{"caja":"-8%"},"feedback_corto":"Mantienes el servicio hoy, pero si el recorte dura la reserva se acaba"},
   {"letra":"D","texto":"Pedir aporte en especie o trabajo voluntario a la comunidad","consecuencias":{"costos":"-5%","reputacion":"+3%","demanda":"*0.97"},"feedback_corto":"Reduces el costo y refuerzas el vinculo, a cambio de depender de la buena voluntad"}
 ]'::jsonb),

('SOC013',
 'El desembolso del financiador se demora varios meses',
 'El tramite administrativo del financiador se atrasa. Los fondos estan aprobados, pero no llegan, y tu personal y tus proveedores siguen esperando el pago.',
 'financiero', 'curado', 0.12, 3, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"dias_cobro","operacion":"sumar","valor":45}]}'::jsonb,
 '[
   {"letra":"A","texto":"Seguir operando con la reserva hasta que lleguen los fondos","consecuencias":{"caja":"-4%","dias_cobro":"-15"},"feedback_corto":"No cortas el servicio, pero la reserva se consume mientras esperas"},
   {"letra":"B","texto":"Pedir un adelanto o un credito puente","consecuencias":{"deuda":"+8%","dias_cobro":"-20"},"feedback_corto":"Resuelves la liquidez, a cambio de pagar intereses con fondos del proyecto"},
   {"letra":"C","texto":"Reducir el servicio al minimo hasta que lleguen","consecuencias":{"demanda":"*0.85","reputacion":"-5%"},"feedback_corto":"Cuidas la caja, pero la gente que depende del servicio queda sin atencion"},
   {"letra":"D","texto":"Reclamar formalmente y movilizar a la comunidad para presionar","consecuencias":{"reputacion":"+2%","dias_cobro":"-10","costos":"+1%"},"feedback_corto":"Puede acelerar el pago, aunque desgasta la relacion con el financiador"}
 ]'::jsonb),

('SOC014',
 'Cambian las autoridades y revisan todos los convenios',
 'Despues de las elecciones, las nuevas autoridades revisan los convenios heredados. Tu programa queda en pausa mientras deciden si lo continuan.',
 'politico', 'curado', 0.06, 8, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"presupuesto","operacion":"multiplicar","valor":0.6}]}'::jsonb,
 '[
   {"letra":"A","texto":"Presentar resultados y beneficiarios a las nuevas autoridades","consecuencias":{"presupuesto":"*1.3","costos":"+2%","reputacion":"+4%"},"feedback_corto":"Si tus cifras son claras, recuperas el apoyo; si no las tienes, pierdes tiempo"},
   {"letra":"B","texto":"Esperar a que la nueva gestion decida","consecuencias":{"presupuesto":"*0.85","reputacion":"-2%"},"feedback_corto":"No gastas esfuerzo, pero dejas que otros decidan sobre tu proyecto"},
   {"letra":"C","texto":"Buscar apoyo de la comunidad y de otras instituciones","consecuencias":{"presupuesto":"*1.15","costos":"+1%","reputacion":"+3%"},"feedback_corto":"Le das respaldo al proyecto, con tiempo y gestiones"},
   {"letra":"D","texto":"Reducir al minimo el programa mientras tanto","consecuencias":{"demanda":"*0.8","costos":"-10%"},"feedback_corto":"Preservas fondos, pero el servicio y la confianza se debilitan"}
 ]'::jsonb),

('SOC015',
 'Un organismo internacional ofrece financiar una ampliacion con condiciones',
 'Una cooperacion ofrece fondos adicionales para ampliar el programa, pero exige informes detallados, metas medibles y que parte del dinero se gaste en rubros que no eran tu prioridad.',
 'oportunidad', 'curado', 0.08, 5, ARRAY['tipo:social'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar todas las condiciones y ampliar el programa","consecuencias":{"presupuesto":"*1.35","demanda":"*1.15","costos":"+6%"},"feedback_corto":"Llegas a mas gente con mas fondos, pero tambien con mas informes y obligaciones"},
   {"letra":"B","texto":"Negociar para adaptar los rubros a tus prioridades","consecuencias":{"presupuesto":"*1.2","costos":"+3%"},"feedback_corto":"Obtienes menos dinero pero mas libertad, con una negociacion larga"},
   {"letra":"C","texto":"Aceptar solo una parte, la que puedes cumplir bien","consecuencias":{"presupuesto":"*1.1","reputacion":"+3%"},"feedback_corto":"Crecimiento prudente que no ahoga a tu equipo"},
   {"letra":"D","texto":"Rechazarlo para no depender de condiciones externas","consecuencias":{"reputacion":"+1%"},"feedback_corto":"Mantienes tu autonomia, pero pierdes fondos que podian servir a mas personas"}
 ]'::jsonb),

('SOC016',
 'Se dispara la demanda del servicio por una emergencia',
 'Una epidemia, una helada o una sequia en la zona hace que mucha mas gente necesite tu servicio. Tu equipo y tus insumos no dan abasto, y los fondos no suben.',
 'emergencia', 'curado', 0.08, 4, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.4}]}'::jsonb,
 '[
   {"letra":"A","texto":"Atender a todos con horas extras y compras de emergencia","consecuencias":{"costos":"+10%","reputacion":"+6%"},"feedback_corto":"Respondes a la necesidad, pero el gasto sube y la reserva se acaba rapido"},
   {"letra":"B","texto":"Priorizar los casos mas graves y derivar el resto","consecuencias":{"costos":"+3%","reputacion":"+1%"},"feedback_corto":"Cuidas tus recursos, con la decision dificil de a quien no atiendes"},
   {"letra":"C","texto":"Pedir fondos de emergencia al municipio o a la gobernacion","consecuencias":{"presupuesto":"*1.25","costos":"+5%"},"feedback_corto":"Puedes cubrir el aumento, si llegan a tiempo"},
   {"letra":"D","texto":"Seguir con el servicio normal sin cambiar nada","consecuencias":{"reputacion":"-6%","demanda":"*0.9"},"feedback_corto":"Evitas el gasto, pero la comunidad siente que no estuviste cuando te necesitaron"}
 ]'::jsonb),

('SOC017',
 'Los usuarios dejan de venir: abandono del programa',
 'Parte de la gente que se inscribio deja de asistir. Algunos no tienen tiempo, a otros les queda lejos y otros no ven el beneficio. Tu costo por persona atendida sube.',
 'operativo', 'curado', 0.10, 5, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Visitar a los que dejaron de venir y entender por que","consecuencias":{"demanda":"*1.1","costos":"+3%","reputacion":"+4%"},"feedback_corto":"Recuperas parte de la gente y aprendes que hay que cambiar, con tiempo de tu equipo"},
   {"letra":"B","texto":"Cambiar horarios y lugar para que sea mas facil llegar","consecuencias":{"demanda":"*1.08","costos":"+2%"},"feedback_corto":"Una mejora concreta con un costo moderado"},
   {"letra":"C","texto":"Ofrecer incentivos pequenos (alimentos, transporte)","consecuencias":{"demanda":"*1.12","costos":"+5%"},"feedback_corto":"Sube la asistencia, aunque puede depender del incentivo"},
   {"letra":"D","texto":"No hacer nada: quien necesita el servicio vendra","consecuencias":{"reputacion":"-3%","demanda":"*0.95"},"feedback_corto":"No gastas, pero te alejas de quienes mas lo necesitan"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
