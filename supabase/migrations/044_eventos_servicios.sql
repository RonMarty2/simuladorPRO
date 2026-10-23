-- ============================================================================
-- 044 — Eventos propios de proyectos de SERVICIOS
-- Fuente: docs/metodologia/tipos/servicios-software-a-medida.md (seccion 5).
--
-- La categoria servicios mezcla consultoras y agencias con negocios como
-- lavanderia o salon de belleza, por eso se usaron solo las situaciones que
-- valen para cualquier negocio de servicios con personal y clientes
-- recurrentes (cobranza lenta, cliente ancla, personal clave, costo laboral,
-- cartera vacia, cobro en dolares y licitacion publica). Las situaciones
-- exclusivas de software (precio fijo, IA, incidentes de seguridad) quedan
-- para la categoria tecnologia. Idempotente. Aqui "demanda" son las horas o
-- servicios vendidos y "precio_venta" la tarifa. Magnitudes: estimaciones a
-- calibrar (seccion 10 de la ficha).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('SRV001',
 'Tu cliente más grande se atrasa en el pago',
 'Tu mayor cliente avisa que va a pagar a 120 días en vez de 60 por un cambio en su área de finanzas. Tú tienes sueldos que pagar a fin de mes. Un proyecto con VAN positivo puede quedarse sin caja: el capital de trabajo es el costo oculto de cobrar tarde, y cada decisión tiene su precio.',
 'financiero', 'curado', 0.12, 3, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar el plazo largo y financiarte con un préstamo puente","consecuencias":{"deuda":"+6%","caja":"+6%"},"feedback_corto":"Conservas al cliente y la relación, pero pagas intereses y, si se atrasa otra vez, el préstamo se vuelve permanente"},
   {"letra":"B","texto":"Exigir el plazo original o frenar el trabajo","consecuencias":{"demanda":"*0.90","reputacion":"-3%","caja":"+2%"},"feedback_corto":"Proteges tu caja, pero puedes perder al cliente más grande, y si pesa 40% de tus ingresos la pérdida supera el interés"},
   {"letra":"C","texto":"Aceptar el plazo largo a cambio de un anticipo o descuento por pago anticipado","consecuencias":{"caja":"+4%","precio_venta":"*0.97"},"feedback_corto":"Mantienes la relación y mejoras la caja, a costa de reducir tu margen o depender más de ese cliente"},
   {"letra":"D","texto":"Vender la factura a un tercero (factoraje) si existe en tu plaza","consecuencias":{"caja":"+5%","costos":"+2%"},"feedback_corto":"Obtienes caja inmediata, con una comisión o descuento, y no siempre está disponible en Bolivia"}
 ]'::jsonb),

('SRV002',
 'Se va tu cliente ancla',
 'El cliente que representaba gran parte de tus ingresos reduce o termina el contrato por un cambio de estrategia, de proveedor o de presupuesto. Es el riesgo de concentración: si pesaba 40% y se va, tus ingresos caen 40%, y tu equipo queda sin trabajo mientras los sueldos siguen corriendo.',
 'comercio', 'curado', 0.09, 5, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.70}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener a todo el equipo mientras vendes proyectos nuevos","consecuencias":{"caja":"-8%","reputacion":"+3%","demanda":"*1.10"},"feedback_corto":"No pierdes talento, que es lo más difícil de recuperar, pero quemas caja cada mes sin facturar"},
   {"letra":"B","texto":"Reducir el equipo de inmediato","consecuencias":{"costos":"-8%","demanda":"*0.92","reputacion":"-4%"},"feedback_corto":"Ahorras costos, pero pierdes gente que costó contratar y capacitar, y si llega un contrato no tendrás capacidad"},
   {"letra":"C","texto":"Reasignar al equipo a desarrollar un servicio o producto propio","consecuencias":{"caja":"-4%","demanda":"*1.06"},"feedback_corto":"Usas las horas ociosas en algo con valor futuro, aunque no genera ingreso hoy y puede no venderse"},
   {"letra":"D","texto":"Bajar la tarifa para ganar un cliente nuevo rápido","consecuencias":{"precio_venta":"*0.92","demanda":"*1.18"},"feedback_corto":"Recuperas utilización pronto, pero el cliente nuevo queda acostumbrado a la tarifa baja y el margen cae"}
 ]'::jsonb),

('SRV003',
 'Se va tu mejor profesional',
 'Una empresa del exterior o un competidor le ofrece más sueldo a la persona que lidera tu proyecto clave. Reemplazarla cuesta entre 3 y 6 meses de sueldo en reclutamiento, capacitación y curva de aprendizaje. En este negocio el costo principal es la gente, y la gente se va: retener tiene costo, pero no retener también.',
 'laboral', 'curado', 0.11, 4, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contraofertar con aumento y retenerla","consecuencias":{"costos":"+4%","demanda":"*1.06","reputacion":"+2%"},"feedback_corto":"Conservas conocimiento y continuidad, pero sube tu costo fijo y otros empleados pueden pedir lo mismo"},
   {"letra":"B","texto":"Dejarla ir y contratar un reemplazo","consecuencias":{"caja":"-4%","demanda":"*0.95","reputacion":"-3%"},"feedback_corto":"Evitas la espiral salarial, con tiempo de búsqueda, curva de aprendizaje y riesgo para el proyecto"},
   {"letra":"C","texto":"Formar personal joven propio con convenio con universidades","consecuencias":{"caja":"-5%","costos":"-2%","demanda":"*1.05"},"feedback_corto":"Bajas el costo y ganas fidelidad a largo plazo, pero tarda años y exige una inversión inicial"},
   {"letra":"D","texto":"Subcontratar a un freelance para cubrir el hueco","consecuencias":{"costos":"+5%","demanda":"*1.02","reputacion":"-2%"},"feedback_corto":"Es rápido y flexible, con mayor tarifa por hora, menos conocimiento del proyecto y riesgo de calidad"}
 ]'::jsonb),

('SRV004',
 'Sube el costo laboral y tu tarifa está congelada',
 'El Gobierno decreta un aumento del salario mínimo, o un segundo aguinaldo. Aunque no obligue a subir los sueldos de quienes ya ganan más, el mercado presiona y tu equipo pide ajustes. Tu costo de nómina sube entre 5% y 20%, pero tus tarifas están atadas a contratos vigentes: esa asimetría es un riesgo estructural del negocio.',
 'laboral', 'curado', 0.10, 5, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"costos_personal","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Absorber el aumento y mantener las tarifas","consecuencias":{"costos":"+3%","reputacion":"+2%"},"feedback_corto":"No arriesgas clientes, pero el margen baja y, si ya era delgado, entras en pérdida"},
   {"letra":"B","texto":"Subir tarifas a clientes nuevos y renegociar con los vigentes","consecuencias":{"precio_venta":"*1.07","demanda":"*0.92"},"feedback_corto":"Trasladas el costo, pero algunos clientes se van y en contratos vigentes puede no ser posible"},
   {"letra":"C","texto":"Invertir en productividad (herramientas, automatización)","consecuencias":{"caja":"-5%","costos":"-4%"},"feedback_corto":"Bajas el costo por entregable, pero requiere inversión y tiempo y el resultado es incierto"},
   {"letra":"D","texto":"Reducir el equipo y quedarte con los mejores","consecuencias":{"costos":"-6%","demanda":"*0.90","reputacion":"-3%"},"feedback_corto":"Baja la nómina, con menor capacidad y riesgo para los proyectos en curso"}
 ]'::jsonb),

('SRV005',
 'Se vacía la cartera: el equipo queda sin trabajo',
 'Termina un proyecto grande y el siguiente tarda tres meses en firmarse. Tu equipo está en banca: cobra sueldo y no factura. La utilización puede bajar de 75% a 40%. La utilización es la palanca más fuerte de rentabilidad del negocio, y los proyectos por entrar importan tanto como los que están en curso.',
 'sectorial', 'curado', 0.10, 4, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en ventas y marketing (eventos, referencias, preventa)","consecuencias":{"caja":"-5%","demanda":"*1.15"},"feedback_corto":"Buscas clientes nuevos, pero es un gasto sin garantía inmediata y el ciclo de venta de proyectos grandes es largo"},
   {"letra":"B","texto":"Capacitar al equipo mientras tanto","consecuencias":{"caja":"-4%","precio_venta":"*1.04","demanda":"*1.04"},"feedback_corto":"Mejoras capacidades y sube tu tarifa futura, con gasto y sin ingreso hoy"},
   {"letra":"C","texto":"Aceptar proyectos pequeños a tarifa baja para llenar horas","consecuencias":{"precio_venta":"*0.93","demanda":"*1.20","caja":"+2%"},"feedback_corto":"Recuperas utilización y caja de inmediato, pero baja tu tarifa efectiva y puedes quedar como el barato"},
   {"letra":"D","texto":"Poner a parte del equipo en vacaciones o licencia","consecuencias":{"costos":"-5%","reputacion":"-2%"},"feedback_corto":"Reduces costo sin despedir, aunque depende de acuerdos laborales y afecta el ánimo"}
 ]'::jsonb),

('SRV006',
 'Cobras en dólares y pagas en bolivianos',
 'Tu cliente del exterior te paga en dólares, pero tu nómina es en bolivianos. Un negocio de exportación de servicios tiene un riesgo cambiario estructural: si el boliviano se aprecia pierdes margen, y si hay brecha entre el dólar oficial y el paralelo, puedes tener caja atrapada que no logras convertir ni transferir.',
 'macroeconomico', 'curado', 0.09, 5, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.94}]}'::jsonb,
 '[
   {"letra":"A","texto":"Dejar el riesgo abierto","consecuencias":{"caja":"-3%","precio_venta":"*1.02"},"feedback_corto":"No pagas cobertura y, si el tipo de cambio te favorece, ganas, pero si te perjudica pierdes margen sin aviso"},
   {"letra":"B","texto":"Cubrir con un contrato a plazo (forward) o equivalente","consecuencias":{"caja":"-2%","costos":"+2%","precio_venta":"*1.05"},"feedback_corto":"Fijas tu margen, con un costo de cobertura de 1% a 3% y sin ganar si el tipo de cambio se mueve a tu favor"},
   {"letra":"C","texto":"Pasar los contratos a bolivianos","consecuencias":{"demanda":"*0.93","precio_venta":"*1.06"},"feedback_corto":"Eliminas el riesgo cambiario, pero el cliente puede no aceptar y le trasladas su riesgo, por lo que pides más precio"},
   {"letra":"D","texto":"Mantener parte de la caja en dólares","consecuencias":{"caja":"+3%","reputacion":"-1%"},"feedback_corto":"Proteges contra la depreciación, aunque depende de las normas y la tenencia o repatriación pueden tener restricciones"}
 ]'::jsonb),

('SRV007',
 'Oportunidad: licitación o contrato con una entidad pública',
 'Una entidad pública abre una convocatoria por un monto grande y atractivo. En el sector público suele haber trámites largos, cambios de autoridades y cobros lentos, entre 30 y 90 días más que en el privado. Un cliente grande no es automáticamente un buen cliente: hay que mirar el plazo de pago, el riesgo de alcance y el costo de conseguirlo.',
 'oportunidad', 'curado', 0.08, 6, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Presentar la propuesta y priorizarla","consecuencias":{"caja":"-5%","demanda":"*1.22"},"feedback_corto":"Puedes ganar un contrato grande, pero pagas la preparación y las garantías sin certeza de ganar"},
   {"letra":"B","texto":"Presentarte en alianza con otra empresa","consecuencias":{"caja":"-2%","demanda":"*1.12","precio_venta":"*0.96"},"feedback_corto":"Cumples requisitos y compartes riesgo, a cambio de compartir también el margen"},
   {"letra":"C","texto":"No presentarte y apostar a clientes privados","consecuencias":{"caja":"+3%","reputacion":"+1%"},"feedback_corto":"Tu caja es más predecible, pero pierdes la oportunidad de un contrato grande"},
   {"letra":"D","texto":"Presentarte con un precio muy bajo para ganar","consecuencias":{"precio_venta":"*0.88","demanda":"*1.30","costos":"+3%"},"feedback_corto":"Subes tus posibilidades de ganar, con margen mínimo y riesgo de pérdida si el alcance se desvía"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
