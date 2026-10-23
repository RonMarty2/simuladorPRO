-- ============================================================================
-- 046 — Eventos de COMUNICACION institucional para proyectos de MARKETING
-- Fuente: docs/metodologia/tipos/comunicacion-institucional.md (seccion 5).
--
-- Complementa la 039 (marketing y campanias) con situaciones propias de la
-- comunicacion: crisis por error propio, rumores, recortes de presupuesto,
-- alcance sin cambio de conducta, el ROI de la comunicacion, conflictos
-- sociales que acaparan la agenda y contracampanias. Categoria marketing.
-- Idempotente. Aqui "demanda" es el alcance o las ventas atribuibles,
-- "reputacion" la confianza en la marca. Magnitudes: estimaciones a calibrar
-- (seccion 10 de la ficha).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('MKT012',
 'Un error propio daña a tus clientes y se hace público',
 'Un producto o servicio tuyo falla y perjudica a la gente. En Bolivia, la crisis de la gasolina que dañó motores mostró el costo de responder tarde y con versiones cambiantes. Cuando el público te atribuye mucha responsabilidad, la teoría de crisis recomienda reparar con disculpa o compensación. El silencio no es neutral: sin respuesta, la confianza puede caer entre 10 y 25 puntos en el mes.',
 'sectorial', 'curado', 0.08, 4, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pedir disculpas en público de inmediato y compensar","consecuencias":{"caja":"-6%","reputacion":"+6%"},"feedback_corto":"La confianza se recupera más rápido y cortas los rumores, a cambio de un gasto directo y de reconocer responsabilidad"},
   {"letra":"B","texto":"Esperar el informe técnico antes de hablar","consecuencias":{"reputacion":"-6%","demanda":"*0.94"},"feedback_corto":"No dices algo que luego haya que corregir, pero el vacío lo llenan los rumores y la confianza cae más"},
   {"letra":"C","texto":"Negar o minimizar el problema","consecuencias":{"reputacion":"-10%","demanda":"*0.90","costos":"-1%"},"feedback_corto":"No cuesta nada hoy ni admites culpa, pero si luego se prueba el error el golpe es mucho mayor"},
   {"letra":"D","texto":"Un vocero técnico y una hoja de ruta con fechas","consecuencias":{"costos":"+3%","reputacion":"+3%"},"feedback_corto":"Das orden y credibilidad, aunque tarda en prepararse y exige que el equipo técnico coopere"}
 ]'::jsonb),

('MKT013',
 'Circula un rumor falso contra tu marca en WhatsApp y redes',
 'Una noticia falsa sobre tu organización se comparte en redes y cadenas de WhatsApp. Si llega a más de 30% de tu audiencia, la confianza puede bajar entre 3 y 8 puntos. Aquí eres víctima, no responsable, pero corregir también tiene costos: desmentir puede amplificar el rumor entre quienes no lo conocían.',
 'sectorial', 'curado', 0.09, 3, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Desmentir con datos y verificadores externos","consecuencias":{"costos":"+2%","reputacion":"+4%"},"feedback_corto":"Ganas credibilidad, con tiempo del equipo y el riesgo de amplificar el rumor entre quienes no lo habían visto"},
   {"letra":"B","texto":"Ignorar y dejar que se apague solo","consecuencias":{"reputacion":"-4%","demanda":"*0.96"},"feedback_corto":"No gastas nada, pero si el rumor crece llegas tarde"},
   {"letra":"C","texto":"Pautar un contramensaje dirigido a quienes vieron el rumor","consecuencias":{"caja":"-4%","reputacion":"+2%","demanda":"*1.03"},"feedback_corto":"Llegas rápido a las personas correctas, con gasto de pauta y una imagen defensiva"},
   {"letra":"D","texto":"Pedir a aliados y líderes de opinión que lo desmientan","consecuencias":{"reputacion":"+3%","costos":"+1%"},"feedback_corto":"Usas confianza prestada, pero dependes de terceros y puede verse como una operación coordinada"}
 ]'::jsonb),

('MKT014',
 'Recortan tu presupuesto a mitad de la campaña',
 'La dirección o el financiador recorta entre 25% y 40% del presupuesto en el mes 4 de una campaña de 12. El efecto de una campaña se desvanece cuando cortas la presencia, y por debajo de una frecuencia mínima el mensaje deja de recordarse.',
 'financiero', 'curado', 0.10, 4, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.94}]}'::jsonb,
 '[
   {"letra":"A","texto":"Recortar todos los canales por igual","consecuencias":{"costos":"-6%","demanda":"*0.88"},"feedback_corto":"Es simple, pero quedas por debajo de la frecuencia efectiva en todos los canales y pierdes el efecto en todos"},
   {"letra":"B","texto":"Concentrar en el canal más eficiente y abandonar los demás","consecuencias":{"costos":"-6%","demanda":"*0.93"},"feedback_corto":"Mantienes frecuencia en una audiencia reducida, a costa de perder alcance y parte del público objetivo"},
   {"letra":"C","texto":"Pausar y reanudar con fuerza más adelante","consecuencias":{"costos":"-8%","demanda":"*0.85","reputacion":"-2%"},"feedback_corto":"No estiras un presupuesto insuficiente, pero la recordación cae y hay que reconstruirla"},
   {"letra":"D","texto":"Pasar a medios propios y ganados (redes, prensa, voluntarios)","consecuencias":{"costos":"-4%","demanda":"*0.95","reputacion":"+1%"},"feedback_corto":"El costo es bajo, pero el alcance es mucho menor y controlas menos el mensaje"}
 ]'::jsonb),

('MKT015',
 'La encuesta muestra mucho alcance y poco cambio de conducta',
 'La medición de mitad de campaña indica que 70% ya vio tu mensaje, pero la conducta apenas se movió. Es un patrón conocido: los efectos de las campañas masivas sobre la conducta suelen ser modestos, y alcanzar a mucha gente no es lo mismo que cambiarla. Medir solo productos, como alcance o impresiones, es un error típico.',
 'sectorial', 'curado', 0.10, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Insistir con el mismo plan, falta tiempo","consecuencias":{"caja":"-3%","reputacion":"-2%"},"feedback_corto":"No sumas costo extra, pero corres riesgo de saturación y de gastar sin efecto"},
   {"letra":"B","texto":"Pasar a acciones cara a cara (talleres, promotores, activaciones)","consecuencias":{"caja":"-6%","demanda":"*1.10","reputacion":"+3%"},"feedback_corto":"Logras más efecto por persona, pero es caro y llega a menos gente"},
   {"letra":"C","texto":"Cambiar el mensaje por uno más práctico","consecuencias":{"costos":"+3%","demanda":"*1.07"},"feedback_corto":"Puedes quitar la barrera real, pero hay que investigar y rehacer el material"},
   {"letra":"D","texto":"Redefinir la meta de conducta a conocimiento y reportar éxito en alcance","consecuencias":{"reputacion":"-5%","caja":"+2%"},"feedback_corto":"Cumples el indicador, pero es un error típico y un auditor te lo penaliza"}
 ]'::jsonb),

('MKT016',
 'Te piden demostrar el retorno de la comunicación',
 'Antes de renovar tu presupuesto, te piden el ROI. Alguien sugiere convertir las menciones en prensa en dinero equivalente, una medida invalidada por los Principios de Barcelona. Lo que se puede demostrar con honestidad es el costo por persona que cambió su conducta, con comparación, y eso requiere haber medido desde el principio.',
 'financiero', 'curado', 0.09, 6, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.98}]}'::jsonb,
 '[
   {"letra":"A","texto":"Presentar el valor publicitario equivalente: es fácil y da un número grande","consecuencias":{"caja":"+4%","reputacion":"-6%"},"feedback_corto":"Consigues un número impresionante, pero es una medida invalidada y si el auditor la detecta pierdes credibilidad"},
   {"letra":"B","texto":"Presentar el costo por persona que cambió, con comparación","consecuencias":{"costos":"+3%","reputacion":"+5%"},"feedback_corto":"El método es defendible, pero exige haber hecho encuestas y puede mostrar resultados modestos"},
   {"letra":"C","texto":"Presentar un informe cualitativo con casos y testimonios","consecuencias":{"reputacion":"+1%","caja":"-1%"},"feedback_corto":"Cuentas la historia, pero no convence a quien quiere números"},
   {"letra":"D","texto":"Proponer una evaluación externa","consecuencias":{"caja":"-5%","reputacion":"+4%"},"feedback_corto":"Ganas independencia y credibilidad, con dinero y tiempo, y puede traer malas noticias"}
 ]'::jsonb),

('MKT017',
 'Un conflicto social acapara toda la atención',
 'Bloqueos, paros o una crisis política ocupan los medios y las redes durante semanas, y tu mensaje compite con la noticia del día. El alcance efectivo puede bajar entre 30% y 60%, el costo por persona alcanzada sube, y una pauta ligera puede verse inoportuna.',
 'sectorial', 'curado', 0.09, 4, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Suspender la pauta hasta que pase","consecuencias":{"costos":"-6%","demanda":"*0.92"},"feedback_corto":"Ahorras y evitas parecer insensible, pero pierdes la continuidad"},
   {"letra":"B","texto":"Mantener el plan tal como estaba","consecuencias":{"caja":"-4%","reputacion":"-4%"},"feedback_corto":"Conservas la continuidad, pero gastas con poco efecto y arriesgas un tono inadecuado"},
   {"letra":"C","texto":"Adaptar el mensaje al momento con información útil o solidaridad","consecuencias":{"costos":"+3%","reputacion":"+4%","demanda":"*1.05"},"feedback_corto":"Ganas relevancia, pero cambias la línea y exige rapidez"},
   {"letra":"D","texto":"Pasar a canales directos (WhatsApp, radios locales, aliados)","consecuencias":{"costos":"-2%","demanda":"*1.04"},"feedback_corto":"Llegas a quien sigue conectado, con menor escala"}
 ]'::jsonb),

('MKT018',
 'Un actor opuesto lanza una contracampaña',
 'Un competidor, un grupo o un sector afectado lanza una campaña contra tu mensaje y disputa a la misma audiencia. La confianza se polariza: sube entre tus seguidores y baja entre los indecisos. En comunicación, la credibilidad pesa más que el volumen.',
 'comercio', 'curado', 0.08, 5, ARRAY['tipo:marketing'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Responder punto por punto","consecuencias":{"costos":"+3%","reputacion":"+2%","demanda":"*0.97"},"feedback_corto":"No dejas afirmaciones sin respuesta, pero entras en la agenda del otro"},
   {"letra":"B","texto":"Ignorar y sostener tu mensaje","consecuencias":{"reputacion":"-3%","costos":"-1%"},"feedback_corto":"Mantienes el control del mensaje, pero si el ataque pega pierdes terreno"},
   {"letra":"C","texto":"Buscar terceros creíbles (expertos, organismos)","consecuencias":{"caja":"-3%","reputacion":"+5%"},"feedback_corto":"Ganas credibilidad, aunque no controlas lo que digan"},
   {"letra":"D","texto":"Dialogar con el actor para bajar el conflicto","consecuencias":{"costos":"+1%","reputacion":"+1%","demanda":"*1.02"},"feedback_corto":"Puedes reducir el costo total del conflicto, pero puede leerse como debilidad"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
