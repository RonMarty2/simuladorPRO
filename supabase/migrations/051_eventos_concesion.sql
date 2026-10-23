-- ============================================================================
-- 051 — Eventos propios de proyectos de CONCESION de infraestructura
-- Fuente: docs/metodologia/tipos/concesion-infraestructura.md (seccion 5).
--
-- Categoria concesion. La plantilla es una cooperativa de agua potable con
-- tarifa regulada, asi que se usaron las situaciones que valen para un
-- servicio regulado de red (tarifa congelada, protestas por alzas, agua no
-- facturada, morosidad y conexiones clandestinas, sequia, deuda en dolares,
-- nueva autoridad, mantenimiento mayor, covenant de deuda y ampliacion con
-- aporte publico). Las situaciones de peaje y transporte quedan para una
-- plantilla futura. Idempotente. Aqui "demanda" son los m3 vendidos y
-- "precio_venta" la tarifa. Magnitudes: estimaciones a calibrar (seccion 10
-- de la ficha). Los casos (peaje La Paz-Oruro 2015, agua de Cochabamba,
-- tarifas por escasez de la AAPS 2023) son precedentes reales.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('CON001',
 'La tarifa queda congelada mientras suben los costos',
 'La autoridad no aprueba el reajuste tarifario o lo posterga, y los costos de salarios, repuestos, energía y combustible siguen subiendo. La inflación de 2025 en Bolivia fue de 20,40%. En 2015 un ministro reconoció que las tarifas de peaje databan de 1992 y cubrían un tercio del mantenimiento necesario. La tarifa regulada no sigue al costo automáticamente y el rezago se acumula.',
 'macroeconomico', 'curado', 0.12, 3, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.06}]}'::jsonb,
 '[
   {"letra":"A","texto":"Presentar el pedido de ajuste con informes técnicos y sociales completos y esperar","consecuencias":{"costos":"+3%","precio_venta":"*1.02","reputacion":"+2%"},"feedback_corto":"Es el camino formal y queda respaldado si sale, pero demora meses o años y mientras tanto pierdes margen"},
   {"letra":"B","texto":"Recortar costos y gastos de mantenimiento para aguantar","consecuencias":{"costos":"-5%","reputacion":"-4%"},"feedback_corto":"Proteges la caja ahora, pero baja la calidad y el activo se deteriora"},
   {"letra":"C","texto":"Buscar ingresos fuera de la tarifa regulada (conexiones, servicios no regulados)","consecuencias":{"caja":"+4%","costos":"+2%"},"feedback_corto":"No dependes de la autoridad, aunque el alcance es limitado y requiere inversión"},
   {"letra":"D","texto":"Financiar el déficit con deuda de corto plazo","consecuencias":{"deuda":"+6%","caja":"+6%"},"feedback_corto":"Sigues operando sin tocar la calidad, con más gasto financiero y problemas de deuda si el ajuste no llega"}
 ]'::jsonb),

('CON002',
 'Una alza de tarifa provoca protestas',
 'Se aprueba una alza grande y los usuarios reaccionan con protestas, rechazo al pago o bloqueos. En 2015 la ABC subió el peaje La Paz-Oruro de Bs 8 a Bs 17 y el Gobierno suspendió la nueva tarifa por siete días. En Cochabamba, la concesión del agua terminó tras protestas por alzas iniciales. La tarifa óptima económica no es la viable políticamente, y la forma de introducirla importa tanto como el monto.',
 'sectorial', 'curado', 0.09, 5, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":1.15},{"campo":"demanda","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aplicar el alza completa de una vez","consecuencias":{"precio_venta":"*1.08","demanda":"*0.90","reputacion":"-8%"},"feedback_corto":"Recuperas margen rápido, con la máxima probabilidad de protesta y de reversión"},
   {"letra":"B","texto":"Aplicar el alza escalonada en 2 o 3 pasos","consecuencias":{"precio_venta":"*1.04","demanda":"*0.97","reputacion":"-2%"},"feedback_corto":"Hay menos rechazo, pero el ingreso extra llega más lento y la inflación se come parte"},
   {"letra":"C","texto":"Negociar antes con los usuarios y atar el alza a una mejora visible","consecuencias":{"costos":"+2%","precio_venta":"*1.03","reputacion":"+4%"},"feedback_corto":"Ganas legitimidad, con tiempo y gasto de relacionamiento, y puede salir una tarifa menor a la que necesitas"},
   {"letra":"D","texto":"Pedir un subsidio al municipio para cubrir la diferencia","consecuencias":{"caja":"+5%","reputacion":"+1%","demanda":"*1.02"},"feedback_corto":"La tarifa no sube, pero dependes de un presupuesto público que también está en tensión"}
 ]'::jsonb),

('CON003',
 'Una parte grande del agua que produces no se factura',
 'Descubres que una parte grande del agua producida no se factura: fugas, medidores viejos o dañados, conexiones clandestinas. En Cochabamba se señaló que más de 50.000 medidores funcionaban mal. Reducir las pérdidas físicas a la mitad es un objetivo razonable. Vender más agua muchas veces se logra cobrando mejor el agua que ya produces, y la autoridad suele pedir primero resolver las pérdidas antes de subir tarifas.',
 'oportunidad', 'curado', 0.10, 4, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.02}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en reparar fugas (pérdidas físicas)","consecuencias":{"caja":"-5%","costos":"-4%","reputacion":"+2%"},"feedback_corto":"Ahorras costo de producción y liberas agua para más conexiones, pero el ahorro no se factura directamente"},
   {"letra":"B","texto":"Cambiar medidores y regularizar conexiones clandestinas (pérdidas comerciales)","consecuencias":{"caja":"-6%","demanda":"*1.10","reputacion":"-3%"},"feedback_corto":"Sube la facturación directamente, con conflicto con quienes hoy no pagan y el costo de medidores y campañas"},
   {"letra":"C","texto":"Contratar a un operador externo pagado por resultados","consecuencias":{"costos":"+3%","demanda":"*1.08"},"feedback_corto":"Traes experiencia y transfieres riesgo, pero hay que medir bien la línea de base y el operador se lleva parte del beneficio"},
   {"letra":"D","texto":"No hacer nada y pedir subir la tarifa para compensar","consecuencias":{"precio_venta":"*1.03","reputacion":"-6%"},"feedback_corto":"No inviertes, pero el usuario que paga financia el desperdicio y la autoridad pedirá resolver las pérdidas primero"}
 ]'::jsonb),

('CON004',
 'Morosidad y conexiones clandestinas',
 'Una parte de los usuarios no paga, otra se conecta sin medidor, y tienes límites legales para cortar el servicio. En la región se ha visto que cortar el servicio a los morosos es la medida más impopular y el peor mecanismo para que el cliente regularice, porque fomenta la reconexión clandestina. Parte de las pérdidas es social y no se resuelve con castigo.',
 'financiero', 'curado', 0.11, 3, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Hacer inspecciones y regularizar conexiones con multas","consecuencias":{"costos":"+2%","demanda":"*1.06","reputacion":"-3%"},"feedback_corto":"Recuperas agua facturable, con gasto en personal y conflicto con los vecinos"},
   {"letra":"B","texto":"Instalar medidores inteligentes o de prepago","consecuencias":{"caja":"-5%","demanda":"*1.08","costos":"-2%"},"feedback_corto":"Baja la morosidad y el hurto, con una inversión alta y regulación de su uso"},
   {"letra":"C","texto":"Ofrecer un plan de pago o una tarifa social a los morosos","consecuencias":{"precio_venta":"*0.98","caja":"+3%","reputacion":"+3%"},"feedback_corto":"Formalizas usuarios y cobras parte de la deuda, con menor ingreso por usuario y un precedente para otros"},
   {"letra":"D","texto":"Cortar el servicio a los morosos donde la norma lo permite","consecuencias":{"caja":"+3%","reputacion":"-6%","demanda":"*0.96"},"feedback_corto":"Ejerces presión directa, pero es la medida más impopular y fomenta la reconexión clandestina"}
 ]'::jsonb),

('CON005',
 'Sequía: hay menos agua disponible',
 'Baja el agua de las fuentes entre 10% y 30% en la temporada seca. En noviembre de 2023 la AAPS permitió a las empresas de agua solicitar tarifas incrementales por escasez para consumos altos, con informes y demostrando un déficit hídrico. El volumen disponible es otra capacidad fija, y la estructura tarifaria sirve para gestionar la demanda, no solo para recaudar.',
 'sectorial', 'curado', 0.10, 4, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85},{"campo":"costos","operacion":"multiplicar","valor":1.04}]}'::jsonb,
 '[
   {"letra":"A","texto":"Racionar el servicio por horarios","consecuencias":{"demanda":"*0.95","reputacion":"-4%","costos":"-1%"},"feedback_corto":"Proteges la fuente y evitas pedir tarifa, con menor volumen facturado y quejas"},
   {"letra":"B","texto":"Pedir tarifa escalonada por consumo","consecuencias":{"precio_venta":"*1.05","demanda":"*0.95","reputacion":"-3%"},"feedback_corto":"Reduces el uso excesivo y mejoras ingreso, con un proceso regulatorio y medidores defectuosos que distorsionan el cobro"},
   {"letra":"C","texto":"Invertir en una nueva fuente o planta","consecuencias":{"deuda":"+12%","demanda":"*1.10","reputacion":"+3%"},"feedback_corto":"Es la solución de fondo, con una inversión grande, plazo largo y necesidad de financiamiento"},
   {"letra":"D","texto":"Comprar agua en bloque o contratar camiones cisterna","consecuencias":{"costos":"+6%","demanda":"*1.06","reputacion":"+2%"},"feedback_corto":"Das alivio inmediato, a un costo alto por m³ que la tarifa regulada no reconoce"}
 ]'::jsonb),

('CON006',
 'Tu deuda es en dólares y tus ingresos en bolivianos',
 'El proyecto se financió con un crédito en dólares, o importa equipos, y cobra en bolivianos con tarifa regulada. Si el dólar sube 40% y la deuda es 100% en dólares, tu servicio de deuda sube 40%. El descalce de monedas puede destruir un proyecto sólido en operación: la moneda de la deuda debe parecerse a la de los ingresos.',
 'macroeconomico', 'curado', 0.10, 4, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"deuda","operacion":"multiplicar","valor":1.12}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pedir a la autoridad un ajuste atado al tipo de cambio","consecuencias":{"precio_venta":"*1.04","demanda":"*0.97","reputacion":"-3%"},"feedback_corto":"Trasladas el riesgo a la tarifa, pero lo paga el usuario, con efectos políticos y sin garantía de aprobación"},
   {"letra":"B","texto":"Refinanciar en bolivianos","consecuencias":{"deuda":"-6%","costos":"+3%","caja":"-2%"},"feedback_corto":"Eliminas el riesgo cambiario, con tasa más alta, plazo más corto y disponibilidad limitada"},
   {"letra":"C","texto":"Cubrir con reservas en dólares","consecuencias":{"caja":"-7%","deuda":"-4%"},"feedback_corto":"Tienes una cobertura natural, pero en infraestructura local casi no hay ingresos en dólares"},
   {"letra":"D","texto":"Renegociar con el acreedor un período de gracia","consecuencias":{"deuda":"+4%","caja":"+5%"},"feedback_corto":"Alivio inmediato, con más intereses, mayor plazo y posibles nuevas garantías"}
 ]'::jsonb),

('CON007',
 'La nueva autoridad quiere revisar tu contrato',
 'Cambia el gobierno municipal o la autoridad regulatoria. La nueva gestión cuestiona el contrato o la tarifa pactada, o pide renegociar. En Brasil, el concesionario de agua de Limeira no pudo ajustar tarifas por inflación aunque el contrato lo preveía, y el alcalde dijo que el contrato era injusto y venía de una gestión anterior. El contrato depende del entorno institucional, y un buen proyecto necesita legitimidad local además de números.',
 'sectorial', 'curado', 0.07, 6, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.03}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar renegociar con concesiones (menor tarifa, más inversión)","consecuencias":{"precio_venta":"*0.96","caja":"-4%","reputacion":"+3%"},"feedback_corto":"Evitas el conflicto, con menor rentabilidad y la puerta abierta a más pedidos"},
   {"letra":"B","texto":"Defender el contrato con arbitraje o tribunales","consecuencias":{"caja":"-5%","costos":"+2%","reputacion":"-3%"},"feedback_corto":"Proteges el valor del contrato, pero es lento y caro y no garantiza que se haga cumplir"},
   {"letra":"C","texto":"Buscar aliados entre usuarios, asociaciones y el gobierno departamental","consecuencias":{"costos":"+1%","reputacion":"+5%"},"feedback_corto":"Cambias la presión política, con tiempo de gestión y complicaciones si te ven como empresa privada"},
   {"letra":"D","texto":"Ceder el contrato y salir","consecuencias":{"caja":"+8%","demanda":"*0.88","reputacion":"-4%"},"feedback_corto":"Cortas la pérdida, pero pierdes lo invertido y el activo se revierte antes de lo previsto"}
 ]'::jsonb),

('CON008',
 'Mantenimiento mayor: ¿renovar o postergar?',
 'Los activos de la red, tuberías, bombas y medidores, llegan al fin de su vida útil, y el contrato tiene un plazo. Hay que decidir cuánto invertir en renovar. En Bolivia el transporte vial arrastra cerca de 20 años de mantenimiento insuficiente. Un activo con plazo no vale nada al final, y el mantenimiento diferido es una deuda escondida.',
 'operativo', 'curado', 0.10, 5, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.04}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener el programa completo de mantenimiento","consecuencias":{"caja":"-5%","reputacion":"+4%","demanda":"*1.02"},"feedback_corto":"La calidad se mantiene estable, con menos caja ahora"},
   {"letra":"B","texto":"Postergar el mantenimiento mayor para dar más flujo al accionista","consecuencias":{"caja":"+5%","reputacion":"-6%","demanda":"*0.96"},"feedback_corto":"Aumentas el flujo hoy, pero deterioras la red, arriesgas sanciones y dañas la reputación"},
   {"letra":"C","texto":"Negociar una extensión del plazo a cambio de renovar","consecuencias":{"deuda":"+8%","reputacion":"+2%","demanda":"*1.03"},"feedback_corto":"Recuperas la inversión en más años, con una negociación política"},
   {"letra":"D","texto":"Crear un fondo de reserva para renovación","consecuencias":{"caja":"-4%","reputacion":"+3%","costos":"-2%"},"feedback_corto":"Es previsible, con caja inmovilizada y menos dividendos al principio"}
 ]'::jsonb),

('CON009',
 'Se rompe la cobertura de tu deuda',
 'El flujo cae y la cobertura del servicio de deuda baja del nivel que exige el contrato de crédito. Si cae por debajo del umbral de bloqueo, se detienen los pagos al accionista hasta recuperar el nivel, y si cae más, el acreedor puede exigir medidas. Un proyecto rentable en VAN puede fallar por liquidez, y la estructura de deuda es parte de la viabilidad.',
 'financiero', 'curado', 0.08, 6, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.94}]}'::jsonb,
 '[
   {"letra":"A","texto":"Inyectar capital de los accionistas","consecuencias":{"caja":"+8%","reputacion":"+3%"},"feedback_corto":"Resuelves el problema y mantienes la relación con el acreedor, con más dinero en riesgo"},
   {"letra":"B","texto":"Pedir una dispensa (waiver) al acreedor","consecuencias":{"caja":"+2%","deuda":"+3%","costos":"+1%"},"feedback_corto":"Evitas la inyección, con comisión y condiciones más duras"},
   {"letra":"C","texto":"Reestructurar la deuda alargando el plazo","consecuencias":{"deuda":"+6%","caja":"+5%"},"feedback_corto":"Baja la cuota anual, con más intereses totales y nuevas garantías"},
   {"letra":"D","texto":"Recortar gastos y diferir inversiones","consecuencias":{"costos":"-5%","reputacion":"-4%","demanda":"*0.97"},"feedback_corto":"Mejoras el flujo disponible, pero puedes deteriorar el servicio"}
 ]'::jsonb),

('CON010',
 'Oportunidad: ampliar la red a zonas de menor capacidad de pago, con aporte público',
 'La norma boliviana prevé que, si una empresa de agua integra zonas donde la capacidad de pago no cubre el costo de la inversión, los gobiernos departamentales o municipales pueden aportar con transferencias. Podrías sumar entre 5% y 15% de usuarios en dos años, con tarifa social y consumo bajo. El crecimiento de un servicio regulado depende de quién paga la inversión de las conexiones nuevas.',
 'oportunidad', 'curado', 0.09, 6, ARRAY['tipo:concesion'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Extender la red con aporte público de inversión","consecuencias":{"deuda":"+4%","demanda":"*1.12","reputacion":"+4%"},"feedback_corto":"Ganas usuarios sin cargar toda la inversión, pero dependes de un desembolso que puede tardar o no llegar"},
   {"letra":"B","texto":"Extender con financiamiento propio","consecuencias":{"deuda":"+14%","demanda":"*1.15","reputacion":"+2%"},"feedback_corto":"Mantienes el control, con mucha deuda y retorno lento"},
   {"letra":"C","texto":"Extender por etapas, empezando por las zonas con mejor pago","consecuencias":{"deuda":"+6%","demanda":"*1.07","reputacion":"-2%"},"feedback_corto":"Reduces el riesgo, con críticas por dejar afuera a los más pobres"},
   {"letra":"D","texto":"No extender la red por ahora","consecuencias":{"caja":"+3%","reputacion":"-3%"},"feedback_corto":"Te quedas con estabilidad, pero pierdes crecimiento y crece la presión política"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
