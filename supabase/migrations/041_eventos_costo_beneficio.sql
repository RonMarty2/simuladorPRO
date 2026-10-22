-- ============================================================================
-- 041 — Eventos propios de proyectos de COSTO-BENEFICIO (ahorro y eficiencia)
-- Fuente: docs/metodologia/tipos/ahorro-eficiencia.md (seccion 5, situaciones).
--
-- Categoria costo_beneficio (paneles solares, flota electrica, camara de frio,
-- seguridad, mantenimiento preventivo, digitalizacion): el beneficio es un ahorro
-- o una perdida evitada, no un ingreso nuevo. Idempotente.
-- Aqui "demanda" representa el ahorro realmente logrado (nivel de realizacion
-- sobre lo prometido) y "precio_venta" el valor unitario de lo que se ahorra
-- (por ejemplo la tarifa de energia o el precio del combustible).
-- Magnitudes: estimaciones a calibrar (seccion 10 de la ficha).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('CBN001',
 'El medidor muestra menos ahorro del que prometió el proveedor',
 'Pasados los primeros meses, el medidor marca un ahorro menor que el de la oferta. Nadie mintió: el modelo de ingeniería suponía condiciones ideales y el equipo funciona distinto en tu planta. En evaluaciones reales, el ahorro medido suele ser entre 38% y 63% del proyectado, aunque en instalaciones bien dimensionadas puede acercarse más.',
 'sectorial', 'curado', 0.12, 4, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratar una medición independiente","consecuencias":{"caja":"-3%","reputacion":"+5%"},"feedback_corto":"Sabes la verdad y tienes base para reclamar, pero pagas la verificación y pierdes tiempo"},
   {"letra":"B","texto":"Reclamar al proveedor con el contrato de desempeño o el seguro de ahorros, si lo firmaste","consecuencias":{"caja":"+4%","reputacion":"-3%"},"feedback_corto":"Recuperas parte del faltante, pero sin cláusula previa no hay nada que reclamar y el proveedor puede dejar de dar soporte"},
   {"letra":"C","texto":"Aceptar el número real y recalcular el plan","consecuencias":{"costos":"-3%","reputacion":"+1%"},"feedback_corto":"No pierdes tiempo en disputas, pero absorbes toda la pérdida y sigues sin saber la causa"},
   {"letra":"D","texto":"Ajustar la operación para llegar al ahorro prometido (horarios, mantenimiento, calibración)","consecuencias":{"costos":"+2%","demanda":"*1.10"},"feedback_corto":"Parte de la brecha puede ser de operación y se recupera barato, con horas de personal; si la causa era el diseño, pierdes meses"}
 ]'::jsonb),

('CBN002',
 'Cambia la tarifa de la energía de la red',
 'La electricidad de la distribuidora, hoy barata por el gas barato de las termoeléctricas, empieza a corregirse, o el Estado decide mantenerla baja. El valor de cada kilovatio que ahorras sube o baja en la misma proporción. El VAN de un proyecto de ahorro es en buena parte una apuesta sobre un precio regulado.',
 'macroeconomico', 'curado', 0.10, 5, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":1.20}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ampliar el sistema (fase 2) ahora","consecuencias":{"deuda":"+10%","demanda":"*1.15"},"feedback_corto":"Capturas más ahorro si la tarifa sigue subiendo, con más deuda y más exposición si se subsidia otra vez"},
   {"letra":"B","texto":"Mantener lo que tienes y guardar caja","consecuencias":{"caja":"+4%"},"feedback_corto":"Ganas liquidez para otros golpes, pero si la tarifa sube y los equipos se encarecen, la fase 2 saldrá más cara después"},
   {"letra":"C","texto":"Cerrar con el proveedor un precio fijo de energía a 10-15 años","consecuencias":{"precio_venta":"*0.96","reputacion":"+2%"},"feedback_corto":"Ganas previsibilidad, pero si la tarifa sube pagas un precio fijo mayor al que podrías tener, y si baja, pagas de más"},
   {"letra":"D","texto":"Orientar la inversión a mejoras de eficiencia en vez de generación","consecuencias":{"caja":"-4%","demanda":"*1.06"},"feedback_corto":"El ahorro en kilovatios vale con cualquier tarifa, pero cada proyecto da menor escala de ahorro"}
 ]'::jsonb),

('CBN003',
 'Shock cambiario: tus equipos importados se encarecen',
 'El tipo de cambio pasa de la paridad fija a un régimen flexible y el dólar sube con fuerza. Paneles, inversores, variadores, sensores y repuestos son importados. Si compraste con crédito en dólares, la cuota pesa más; si tu ahorro está en bolivianos, vale menos en dólares.',
 'macroeconomico', 'curado', 0.10, 6, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.15}]}'::jsonb,
 '[
   {"letra":"A","texto":"Comprar ahora los equipos de la fase 2 para fijar el costo","consecuencias":{"caja":"-10%","costos":"-3%"},"feedback_corto":"Te adelantas a nuevos saltos, pero gastas caja ahora y si el dólar baja pagaste de más"},
   {"letra":"B","texto":"Esperar a que el tipo de cambio se estabilice","consecuencias":{"caja":"+3%","demanda":"*0.95"},"feedback_corto":"Conservas caja y puedes aprovechar una baja, pero los equipos y el costo de oportunidad pueden empeorar"},
   {"letra":"C","texto":"Buscar proveedores locales o equipos reacondicionados","consecuencias":{"costos":"-4%","reputacion":"-3%"},"feedback_corto":"Tienes menos exposición al dólar, con más riesgo de calidad, menos garantía y plazos de recambio"},
   {"letra":"D","texto":"Refinanciar la deuda en bolivianos, aunque con tasa mayor","consecuencias":{"deuda":"-4%","costos":"+3%"},"feedback_corto":"Eliminas el descalce entre ahorro en bolivianos y deuda en dólares, pagando una tasa mayor y cargos por prepago"}
 ]'::jsonb),

('CBN004',
 'Se corrige el subsidio al combustible',
 'El diésel y la gasolina suben con fuerza tras años congelados, y a la vez hay filas y desabastecimiento. Si tu proyecto sustituye combustible (generador, flota, calderas), el ahorro por litro evitado se multiplicó. Pero la misma medida de política trae escasez, problemas de calidad y presión sobre el tipo de cambio.',
 'macroeconomico', 'curado', 0.11, 5, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":1.30}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reemplazar el generador o la flota por solar, gas o eléctricos","consecuencias":{"deuda":"+12%","demanda":"*1.20"},"feedback_corto":"El ahorro por litro evitado se multiplicó, pero la inversión es alta, los equipos son importados y la instalación toma tiempo mientras el combustible sigue caro"},
   {"letra":"B","texto":"Optimizar el uso actual (rutas, mantenimiento, apagado automático)","consecuencias":{"costos":"-3%","demanda":"*1.06"},"feedback_corto":"Es barato, rápido y sin riesgo de moneda, pero el ahorro posible es limitado"},
   {"letra":"C","texto":"Trasladar el mayor costo al precio de venta","consecuencias":{"precio_venta":"*1.05","reputacion":"-4%"},"feedback_corto":"Proteges el margen si el mercado lo permite, pero pierdes clientes y no resuelves el problema de fondo"},
   {"letra":"D","texto":"Comprar y almacenar combustible por adelantado","consecuencias":{"caja":"-7%","costos":"-2%","reputacion":"-2%"},"feedback_corto":"Te cubres ante la escasez, pero inmovilizas capital y hay riesgos de calidad y de seguridad"}
 ]'::jsonb),

('CBN005',
 'Pasan los años: el equipo rinde menos y necesita mantenimiento',
 'Los paneles pierden potencia cada año, se ensucian, el inversor es la pieza que más falla y los motores pierden rendimiento. El ahorro del año 4 no es el del año 1. El payback ya recuperado no es plata libre: los costos de reposición pueden anular lo ganado.',
 'sectorial', 'curado', 0.11, 6, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratar mantenimiento preventivo con el instalador","consecuencias":{"costos":"+3%","demanda":"*1.06","reputacion":"+2%"},"feedback_corto":"El ahorro se sostiene y quedan registros para la garantía, con un pago fijo que le resta ahorro"},
   {"letra":"B","texto":"Mantener con personal propio","consecuencias":{"costos":"+1%","demanda":"*1.02","reputacion":"-2%"},"feedback_corto":"Cuesta menos, pero dependes de la capacitación y sin experiencia aparecen fallas que anulan la garantía"},
   {"letra":"C","texto":"Formar una reserva mensual para reponer el inversor","consecuencias":{"caja":"-3%","reputacion":"+3%"},"feedback_corto":"Evitas el golpe de caja cuando falle, pero inmovilizas dinero que hoy podrías usar"},
   {"letra":"D","texto":"No hacer nada y ver qué pasa","consecuencias":{"demanda":"*0.93","costos":"+2%"},"feedback_corto":"Cero costo ahora, pero el ahorro decrece y llegará una falla grave que no estaba presupuestada"}
 ]'::jsonb),

('CBN006',
 'Falla el proveedor: garantía, soporte o tecnología descontinuada',
 'El instalador cierra, el fabricante discontinúa el modelo o los repuestos tardan en llegar. El equipo se detiene y el ahorro baja a cero mientras la cuota de la deuda sigue corriendo. Un ahorro garantizado vale tanto como la solvencia de quien lo garantiza.',
 'sectorial', 'curado', 0.09, 6, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.60}]}'::jsonb,
 '[
   {"letra":"A","texto":"Exigir la garantía y esperar","consecuencias":{"reputacion":"-3%","demanda":"*0.95"},"feedback_corto":"Sin costo directo si el proveedor responde, pero la parada sigue y la deuda sigue corriendo"},
   {"letra":"B","texto":"Contratar a un técnico independiente para reparar","consecuencias":{"caja":"-6%","demanda":"*1.25","reputacion":"-1%"},"feedback_corto":"Es rápido, pero puedes perder la garantía y pagar más"},
   {"letra":"C","texto":"Tener un seguro de ahorros con validación independiente","consecuencias":{"costos":"+3%","caja":"+3%","reputacion":"+4%"},"feedback_corto":"Compensa el faltante de ahorro, pagando una prima y exigiendo proveedores que acepten el esquema"},
   {"letra":"D","texto":"Comprar un equipo de reserva o repuestos críticos desde el inicio","consecuencias":{"caja":"-6%","demanda":"*1.12"},"feedback_corto":"Reduces la parada, pero inmovilizas capital y los repuestos importados se encarecen con el dólar"}
 ]'::jsonb),

('CBN007',
 'Efecto rebote: el ahorro se come por mayor uso',
 'El equipo nuevo hace que usar la energía sea más barato y la planta empieza a usarlo más: más horas, más temperatura, más producción. El consumo no baja tanto como esperabas. Ahorro unitario no es ahorro total: hay que separar eficiencia de nivel de actividad.',
 'sectorial', 'curado', 0.09, 6, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Usar el ahorro para producir más (crecer)","consecuencias":{"precio_venta":"*1.04","costos":"+3%"},"feedback_corto":"La ganancia total puede superar al ahorro, pero el gasto en energía no baja y el proyecto se vuelve difícil de medir"},
   {"letra":"B","texto":"Fijar metas de consumo por unidad producida","consecuencias":{"costos":"+1%","demanda":"*1.08","reputacion":"+3%"},"feedback_corto":"Mides la eficiencia real, pero requiere medición y disciplina"},
   {"letra":"C","texto":"Bloquear automáticamente (termostatos, programación)","consecuencias":{"demanda":"*1.10","reputacion":"-3%"},"feedback_corto":"Aseguras el ahorro, con menos flexibilidad operativa y quejas del personal"},
   {"letra":"D","texto":"Ignorarlo","consecuencias":{"demanda":"*0.95"},"feedback_corto":"No hay nada que hacer, pero el payback será más largo del esperado"}
 ]'::jsonb),

('CBN008',
 'Disputa de la medición con la empresa de servicios energéticos',
 'Contrataste un esquema de ahorro compartido: la empresa pone el dinero y se queda con una parte del ahorro. Al medir, ustedes discrepan sobre cuánto se ahorró, porque cambió la producción o se agregó una máquina. Sin registro de esos eventos, no hay cómo ajustar. Quien mide, manda.',
 'comercio', 'curado', 0.08, 7, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar la medición de la empresa","consecuencias":{"precio_venta":"*0.94","reputacion":"+1%"},"feedback_corto":"Evitas el conflicto, pero puedes estar pagando por un ahorro que no existe"},
   {"letra":"B","texto":"Contratar un verificador independiente","consecuencias":{"caja":"-3%","reputacion":"+5%"},"feedback_corto":"Resuelves con datos, pagando la verificación y generando tensión con la empresa"},
   {"letra":"C","texto":"Renegociar a ahorro garantizado con financiamiento propio o bancario","consecuencias":{"deuda":"+8%","precio_venta":"*1.08"},"feedback_corto":"Te quedas con todo el ahorro después, pero necesitas crédito y asumes el riesgo de financiamiento"},
   {"letra":"D","texto":"Comprar a la empresa el equipo de forma anticipada","consecuencias":{"caja":"-10%","precio_venta":"*1.10","reputacion":"-2%"},"feedback_corto":"Terminas el reparto del ahorro, pero con un desembolso grande y sin soporte"}
 ]'::jsonb),

('CBN009',
 'Aparece una línea de crédito verde para eficiencia energética',
 'Hay una línea de financiamiento para eficiencia energética o producción más limpia, con tasa menor que la comercial y mayor plazo, pero con auditoría previa, documentos y garantías. La forma de financiar cambia el valor del proyecto tanto como la tecnología.',
 'oportunidad', 'curado', 0.09, 4, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Tomar la línea verde","consecuencias":{"deuda":"+10%","costos":"-3%","demanda":"*1.08"},"feedback_corto":"Menor tasa y mayor plazo, pero con auditoría, documentos, tiempos de aprobación y garantías"},
   {"letra":"B","texto":"Financiar con caja propia","consecuencias":{"caja":"-10%","demanda":"*1.08"},"feedback_corto":"Sin deuda ni trámites, pero dejas a la empresa corta de liquidez para imprevistos"},
   {"letra":"C","texto":"Contratar un esquema de ahorro compartido sin inversión","consecuencias":{"precio_venta":"*0.85","demanda":"*1.08"},"feedback_corto":"No hay desembolso, pero cedes una parte grande del ahorro durante años"},
   {"letra":"D","texto":"Dividir en fases pequeñas con caja propia","consecuencias":{"caja":"-4%","demanda":"*1.03","reputacion":"+2%"},"feedback_corto":"Aprendes y reduces riesgo, aunque el ahorro total llega más tarde y pagas el costo de cada fase"}
 ]'::jsonb),

('CBN010',
 'Cae la producción por bloqueos o desabastecimiento',
 'Hay bloqueos de caminos de semanas, falta de dólares o de insumos, y tu planta produce menos. Tu ahorro baja porque ahorras un porcentaje de un consumo menor, pero los costos fijos de la inversión y de la deuda siguen igual. Un proyecto de ahorro no es inmune a los problemas del negocio principal.',
 'logistico', 'curado', 0.10, 4, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.70}]}'::jsonb,
 '[
   {"letra":"A","texto":"Renegociar las cuotas con el banco (período de gracia)","consecuencias":{"caja":"+4%","deuda":"+4%","reputacion":"-2%"},"feedback_corto":"Alivias la caja, a cambio de más intereses y un posible deterioro de tu historial"},
   {"letra":"B","texto":"Usar la caja acumulada","consecuencias":{"caja":"-6%"},"feedback_corto":"No pides favores, pero quedas sin colchón"},
   {"letra":"C","texto":"Vender energía excedente a la red, si tienes generación distribuida","consecuencias":{"caja":"+2%","demanda":"*1.06"},"feedback_corto":"Das uso a lo que sobra, pero el excedente se reconoce con hasta 24 meses de plazo y no es caja inmediata"},
   {"letra":"D","texto":"Diferir el mantenimiento preventivo","consecuencias":{"costos":"-3%","demanda":"*0.95","reputacion":"-2%"},"feedback_corto":"Ahorras hoy, pero aumenta el riesgo de fallas y de degradación"}
 ]'::jsonb),

('CBN011',
 'Los operarios no usan el sistema o lo desactivan',
 'En proyectos de automatización o digitalización, el beneficio depende de que la gente lo use. Los operarios no confían en el sistema, lo saltan o lo desactivan, y sin uso no hay ahorro. El ahorro de papel y el ahorro real se separan por la adopción.',
 'laboral', 'curado', 0.10, 5, ARRAY['tipo:costo_beneficio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Capacitar y acompañar en planta","consecuencias":{"costos":"+3%","demanda":"*1.12","reputacion":"+4%"},"feedback_corto":"Sube el uso, con horas de formación y de producción perdidas"},
   {"letra":"B","texto":"Incentivar con un bono atado al ahorro","consecuencias":{"costos":"+4%","demanda":"*1.10"},"feedback_corto":"Alineas intereses, pero reduces el ahorro neto y aparecen pugnas sobre cómo se mide"},
   {"letra":"C","texto":"Bloquear el bypass con automatización forzada","consecuencias":{"demanda":"*1.15","reputacion":"-6%"},"feedback_corto":"Aseguras el uso, pero con rigidez y resistencia del personal"},
   {"letra":"D","texto":"Rediseñar el proceso junto con los operarios","consecuencias":{"costos":"+3%","demanda":"*1.08","reputacion":"+6%"},"feedback_corto":"Aumenta la aceptación y detectas mejoras, pero lleva tiempo y puede cambiar los costos"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
