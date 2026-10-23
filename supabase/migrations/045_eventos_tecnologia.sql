-- ============================================================================
-- 045 — Eventos propios de proyectos de TECNOLOGIA (plataformas y software)
-- Fuentes: docs/metodologia/tipos/plataforma-marketplace.md y
-- servicios-software-a-medida.md (seccion 5, situaciones).
--
-- La categoria tecnologia mezcla un SaaS (suscripcion) con una app de
-- delivery (comision por pedido), por eso solo se usaron situaciones que
-- valen para ambos: seguridad, fallas tras el lanzamiento, competidor con
-- capital, precio o comision, incidente de confianza, cobros digitales,
-- nuevos ingresos sobre la base de usuarios y costos en dolares. Las
-- situaciones solo de reparto (combustible, repartidores) quedan fuera.
-- Idempotente. Aqui "demanda" son usuarios o pedidos activos y "precio_venta"
-- la suscripcion o comision. Magnitudes: estimaciones a calibrar (seccion 10
-- de las fichas).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('TEC001',
 'Filtración de datos en tu plataforma',
 'Un incidente de seguridad expone datos de tus usuarios o de tus clientes empresa. Te exigen compensación y una revisión completa del sistema. Es un riesgo operativo del negocio digital: el costo puede ser de uno a seis meses de ingresos de los clientes afectados, según el contrato, y el daño de reputación viaja más rápido que tu respuesta.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Asumir responsabilidad, avisar rápido y compensar","consecuencias":{"caja":"-7%","reputacion":"+4%"},"feedback_corto":"Preservas la confianza a largo plazo, pero sale caja y puede sentar un precedente"},
   {"letra":"B","texto":"Investigar primero y negociar según los hallazgos","consecuencias":{"caja":"-2%","reputacion":"-5%","demanda":"*0.95"},"feedback_corto":"No pagas por algo que quizá no fue tu culpa, pero el cliente puede sentir que te defiendes en vez de ayudar"},
   {"letra":"C","texto":"Ofrecer horas de remediación y mejoras de seguridad sin cargo","consecuencias":{"costos":"+4%","reputacion":"+1%"},"feedback_corto":"Gastas horas en vez de caja, pero son horas que sacas de desarrollar el producto"},
   {"letra":"D","texto":"Invertir en auditoría de seguridad y seguro de responsabilidad","consecuencias":{"caja":"-6%","costos":"-2%","reputacion":"+3%"},"feedback_corto":"Reduces incidentes futuros y limitas la exposición, con un gasto fijo cuyo beneficio es invisible mientras no pasa nada"}
 ]'::jsonb),

('TEC002',
 'Fallas graves poco después del lanzamiento',
 'A las pocas semanas de lanzar o entregar, aparecen errores graves y tus clientes exigen corrección sin costo. El mantenimiento tiene un costo continuo de corregir y evolucionar el sistema. Las horas de garantía pueden ser entre 5% y 15% de las del proyecto, y los parches rápidos crean deuda técnica que cobrará intereses después.',
 'operativo', 'curado', 0.11, 3, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.06}]}'::jsonb,
 '[
   {"letra":"A","texto":"Corregir de inmediato sin cobrar","consecuencias":{"costos":"+4%","reputacion":"+4%"},"feedback_corto":"Ganas reputación y confianza, con horas no pagadas que sacas de otras tareas"},
   {"letra":"B","texto":"Corregir y ofrecer un plan de soporte mensual","consecuencias":{"costos":"+2%","caja":"+3%","reputacion":"-1%"},"feedback_corto":"Conviertes el problema en ingreso recurrente, aunque el cliente puede sentir que le cobras por tus errores"},
   {"letra":"C","texto":"Frenar las funciones nuevas y dedicar un ciclo a estabilizar","consecuencias":{"demanda":"*0.96","costos":"-3%","reputacion":"+3%"},"feedback_corto":"Pagas hoy la deuda técnica para ahorrar mañana, pero retrasas el crecimiento y el ritmo de novedades"},
   {"letra":"D","texto":"Arreglar con parches rápidos y seguir con el plan","consecuencias":{"costos":"+1%","reputacion":"-4%","demanda":"*1.03"},"feedback_corto":"Mantienes el calendario, pero la deuda técnica sube y las fallas pueden volver peor"}
 ]'::jsonb),

('TEC003',
 'Entra un competidor grande con mucho capital',
 'Una empresa regional con más recursos llega a tu ciudad o a tu rubro, con descuentos, bonos y precios más bajos. Los usuarios pueden usar ambas plataformas y comparar. Contra un rival con más caja una guerra de subsidios casi nunca conviene: en una guerra de desgaste, los bolsillos profundos importan.',
 'comercio', 'curado', 0.09, 6, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Igualar descuentos y bonos","consecuencias":{"precio_venta":"*0.90","caja":"-6%","demanda":"*1.12"},"feedback_corto":"No pierdes cuota, pero pierdes margen con alta probabilidad y el rival puede sostenerlo más tiempo que tú"},
   {"letra":"B","texto":"Diferenciarte en un nicho (un barrio, un tipo de cliente) y no pelear en precio","consecuencias":{"demanda":"*0.97","reputacion":"+3%","costos":"-2%"},"feedback_corto":"Te defiendes donde el grande no llega bien, con un techo más bajo de crecimiento"},
   {"letra":"C","texto":"Pedir exclusividad a los clientes o proveedores clave a cambio de mejores condiciones","consecuencias":{"precio_venta":"*0.95","demanda":"*1.06"},"feedback_corto":"Encareces la entrada del rival, pero reduces tu margen y ellos pueden preferir a quien ofrezca más"},
   {"letra":"D","texto":"Buscar una alianza con el rival o preparar una venta","consecuencias":{"caja":"+5%","reputacion":"-3%","demanda":"*0.92"},"feedback_corto":"Preparas una salida ordenada, pero pierdes independencia y valor, y el precio depende de tu tracción"}
 ]'::jsonb),

('TEC004',
 'La caja está justa: ¿subir el precio o la comisión?',
 'La tentación es subir la suscripción o el porcentaje que cobras por transacción. Cada lado del mercado reacciona distinto: algunos clientes pagan más sin problema, otros se van o buscan alternativas, y los proveedores pueden trasladar el aumento a sus propios clientes. En Bolivia se percibe como una renta la carga que se suma sobre quienes ya operan con márgenes chicos.',
 'financiero', 'curado', 0.11, 4, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir el precio o la comisión a todos","consecuencias":{"precio_venta":"*1.10","demanda":"*0.90"},"feedback_corto":"Sube el ingreso por transacción de inmediato, pero algunos se van o se pasan a otra opción"},
   {"letra":"B","texto":"Subir solo a los clientes grandes o a los que más usan el servicio","consecuencias":{"precio_venta":"*1.05","demanda":"*0.96","reputacion":"-1%"},"feedback_corto":"Proteges a los pequeños, que cuestan más captar, pero los grandes tienen más poder para negociar o irse"},
   {"letra":"C","texto":"Mantener la tarifa base y cobrar por servicios opcionales","consecuencias":{"caja":"+4%","costos":"+2%","reputacion":"-1%"},"feedback_corto":"Obtienes un ingreso nuevo sin tocar la tarifa, con riesgo de degradar la experiencia y favorecer a quien más paga"},
   {"letra":"D","texto":"Bajar el precio a cambio de contratos más largos o exclusividad","consecuencias":{"precio_venta":"*0.94","demanda":"*1.10","caja":"+2%"},"feedback_corto":"Aseguras volumen y reduces la rotación, con menor ingreso por transacción y poca ayuda si el rival es mayor"}
 ]'::jsonb),

('TEC005',
 'Incidente de confianza: estafa o accidente que se hace viral',
 'Un hecho grave, como una estafa a un cliente, un proveedor que no entrega o un incidente que se viraliza, daña la marca. En una plataforma el usuario confía en desconocidos gracias a la marca. La reputación puede caer entre 10 y 30 puntos y la demanda entre 5% y 20% en las semanas siguientes. La confianza es el producto, y prevenir cuesta antes de que haya un problema.',
 'sectorial', 'curado', 0.09, 5, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Indemnizar y asumir la responsabilidad de inmediato","consecuencias":{"caja":"-5%","reputacion":"+5%"},"feedback_corto":"Proteges la marca y la confianza, pero sientas un precedente costoso y atraes reclamos oportunistas"},
   {"letra":"B","texto":"Investigar antes de responder y comunicar con cautela","consecuencias":{"reputacion":"-5%","demanda":"*0.94"},"feedback_corto":"Evitas errores legales, pero la viralidad corre más rápido que tu respuesta"},
   {"letra":"C","texto":"Invertir en verificación de identidad, seguros y botón de emergencia","consecuencias":{"caja":"-6%","reputacion":"+3%","demanda":"*1.05"},"feedback_corto":"Reduces incidentes futuros, con un gasto fijo cuyo beneficio no se ve mientras no pasa nada"},
   {"letra":"D","texto":"Suspender al responsable y seguir sin más medidas","consecuencias":{"costos":"-1%","reputacion":"-3%"},"feedback_corto":"Es rápido y barato, pero si hay un patrón, se repite"}
 ]'::jsonb),

('TEC006',
 'Cobros digitales: QR, efectivo y fraude',
 'En Bolivia el QR interoperable crece con fuerza, pero la mayoría de los pagos todavía es en efectivo, y hay riesgos de suplantación de códigos QR y comprobantes falsos. Entre 1% y 3% de los pedidos o cobros pueden ser falsos si no hay controles, y la conciliación y la pasarela de pagos pueden costar entre 1% y 3% del volumen. El medio de pago es parte del producto.',
 'financiero', 'curado', 0.10, 4, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.97}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar solo pago digital (QR, tarjeta)","consecuencias":{"caja":"+3%","demanda":"*0.92"},"feedback_corto":"Cobras al instante con menos fraude y conciliación simple, pero pierdes a quienes prefieren efectivo, que siguen siendo la mayoría"},
   {"letra":"B","texto":"Aceptar efectivo y dejar el riesgo de cobranza a quien presta el servicio","consecuencias":{"costos":"-2%","reputacion":"-4%","demanda":"*1.06"},"feedback_corto":"Máxima cobertura de clientes y menor costo para ti, con tensión con tu oferta y riesgo reputacional"},
   {"letra":"C","texto":"Aceptar efectivo con un fondo de garantía de la plataforma","consecuencias":{"caja":"-4%","reputacion":"+3%","demanda":"*1.04"},"feedback_corto":"Proteges a quienes trabajan contigo, con gasto en fondo y en controles antifraude"},
   {"letra":"D","texto":"Verificar los cobros de riesgo con confirmación previa o pago anticipado","consecuencias":{"costos":"+2%","demanda":"*0.96","reputacion":"+1%"},"feedback_corto":"Bajan los pedidos falsos, pero añades fricción y pierdes algo de conversión"}
 ]'::jsonb),

('TEC007',
 'Oportunidad: nuevos ingresos sobre tu base de usuarios',
 'Con una base de usuarios activa puedes monetizar de otras formas: publicidad dentro de la app, una suscripción para clientes frecuentes o servicios financieros como adelantos y seguros. Los ingresos accesorios pueden aportar entre 1 y 4 puntos del volumen transado, pero cada opción tiene un costo para alguno de los dos lados del mercado.',
 'oportunidad', 'curado', 0.09, 6, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":1.03}]}'::jsonb,
 '[
   {"letra":"A","texto":"Vender publicidad dentro de la plataforma","consecuencias":{"caja":"+5%","reputacion":"-2%"},"feedback_corto":"Ingreso con poco costo marginal, pero quien más paga gana visibilidad y la experiencia del usuario puede empeorar"},
   {"letra":"B","texto":"Lanzar una suscripción para clientes frecuentes","consecuencias":{"caja":"-3%","demanda":"*1.12","reputacion":"+2%"},"feedback_corto":"Obtienes ingreso recurrente y retención, con un costo por beneficios sin garantía de más uso"},
   {"letra":"C","texto":"Ofrecer adelantos de ventas o seguros a tus proveedores","consecuencias":{"deuda":"+6%","caja":"+3%","reputacion":"+2%"},"feedback_corto":"Ganas lealtad e ingreso financiero, con riesgo de impago y requisitos regulatorios que hay que verificar"},
   {"letra":"D","texto":"No diversificar y mejorar el servicio actual","consecuencias":{"costos":"-2%","demanda":"*1.04"},"feedback_corto":"Mantienes el foco, pero sigues dependiendo de una sola fuente de ingreso, sensible a la competencia"}
 ]'::jsonb),

('TEC008',
 'Tus servidores y herramientas se cobran en dólares',
 'Hosting en la nube, licencias y herramientas de desarrollo se pagan en dólares, mientras tus ingresos son en bolivianos. Si el dólar sube o se vuelve difícil de conseguir, tus costos fijos se encarecen, y puede haber demoras en transferencias al exterior. Es un riesgo cambiario estructural de los negocios digitales en Bolivia.',
 'macroeconomico', 'curado', 0.10, 5, ARRAY['tipo:tecnologia'],
 '{"variables_afectadas":[{"campo":"costos_servicios","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Dejar el riesgo abierto y absorber el alza","consecuencias":{"costos":"+3%","caja":"-2%"},"feedback_corto":"Sin costo de cobertura, pero si el dólar sigue subiendo tu margen se achica sin aviso"},
   {"letra":"B","texto":"Contratar anualmente con descuento y pagar por adelantado","consecuencias":{"caja":"-6%","costos":"-4%"},"feedback_corto":"Fijas el costo y ahorras con el descuento, pero inmovilizas caja y pierdes flexibilidad si cambias de proveedor"},
   {"letra":"C","texto":"Trasladar el alza a tus clientes con un ajuste de precio","consecuencias":{"precio_venta":"*1.06","demanda":"*0.95"},"feedback_corto":"Proteges el margen, pero algunos clientes pueden irse o negociar"},
   {"letra":"D","texto":"Optimizar el consumo de infraestructura y migrar a opciones más baratas","consecuencias":{"costos":"-5%","caja":"-2%","reputacion":"-1%"},"feedback_corto":"Bajas la factura en dólares con trabajo de ingeniería y algo de riesgo de caídas en la migración"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
