-- ============================================================================
-- 034 — Eventos propios del tipo "turismo y hospitalidad"
-- Fuente: docs/metodologia/tipos/hoteleria-turismo.md (seccion 5, situaciones).
--
-- Se marcan con 'tipo:turismo' en sectores_afectados: solo les llegan a proyectos
-- cuyo tipoNegocio sea "turismo" (hostal boutique, operadora de turismo, etc.).
-- No toca eventos existentes ni columnas. Idempotente (ON CONFLICT DO NOTHING).
--
-- Magnitudes: las cifras de bloqueos (ocupacion de 5% a 20%) vienen de gremios
-- bolivianos 2026; el resto son estimaciones a calibrar con datos locales
-- (ver seccion 10 de la ficha). Las consecuencias solo mueven variables que el
-- motor ya maneja: caja, deuda, demanda, precio, costos y reputacion.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('TUR001',
 'Bloqueos de carreteras: semanas sin turistas',
 'Grupos de presión cortan las rutas por varias semanas. Las cámaras hoteleras reportan ocupación de apenas 5% a 20% y algunos negocios declaran feriado colectivo. Tus costos fijos (personal, cuota, servicios) siguen corriendo igual.',
 'sectorial', 'curado', 0.12, 6, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.45}]}'::jsonb,
 '[
   {"letra":"A","texto":"Declarar feriado colectivo y reducir personal","consecuencias":{"costos":"-12%","reputacion":"-8%"},"feedback_corto":"Bajas el gasto, pero pierdes gente capacitada y no sabes cuántos volverán"},
   {"letra":"B","texto":"Suspender el funcionamiento hasta que se despeje","consecuencias":{"costos":"-18%","demanda":"*0.80","reputacion":"-5%"},"feedback_corto":"Ahorras servicios, pero reabrir cuesta y parte de los clientes ya se fue a otro lado"},
   {"letra":"C","texto":"Bajar la tarifa para captar mercado local y empresas de la zona","consecuencias":{"precio_venta":"*0.85","demanda":"*1.20"},"feedback_corto":"Entra algo de caja, pero una tarifa baja cuesta subirla después"},
   {"letra":"D","texto":"Aguantar con caja propia y un aporte de los socios","consecuencias":{"caja":"+6%","reputacion":"+3%"},"feedback_corto":"Mantienes equipo y reputación, pero si el bloqueo se alarga el aporte se consume"}
 ]'::jsonb),

('TUR002',
 'Alertas de viaje: otros países advierten sobre Bolivia',
 'Después del conflicto, varios países recomiendan a sus ciudadanos evitar viajar a Bolivia. Las autoridades estiman que el daño de imagen puede durar entre seis meses y un año. Las reservas internacionales se enfrían.',
 'internacional', 'curado', 0.09, 8, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.75}]}'::jsonb,
 '[
   {"letra":"A","texto":"Campaña de promoción con descuento al turista nacional","consecuencias":{"costos_comercializacion":"+6%","precio_venta":"*0.92","demanda":"*1.12"},"feedback_corto":"Llenas parte de la capacidad, pero el turista nacional gasta menos por noche"},
   {"letra":"B","texto":"Ofrecer cancelación gratis hasta 7 días antes a mercados extranjeros","consecuencias":{"demanda":"*1.10","caja":"-4%"},"feedback_corto":"Reduces el miedo a reservar, pero te quedan habitaciones vacías de último momento"},
   {"letra":"C","texto":"Apuntar a mercados cercanos (Perú, Argentina, Brasil, Chile)","consecuencias":{"costos_comercializacion":"+4%","precio_venta":"*0.95","demanda":"*1.08"},"feedback_corto":"Viajes más cortos y baratos para ellos, pero gastan menos por visita"},
   {"letra":"D","texto":"No hacer nada y esperar a que pase","consecuencias":{"reputacion":"-3%"},"feedback_corto":"No gastas, pero pierdes meses de ingresos y cuota frente a quien sí se movió"}
 ]'::jsonb),

('TUR003',
 'Dependes de las plataformas de reserva y suben la comisión',
 'La mayoría de tus reservas llega por plataformas en línea que cobran entre 10% y 20% de cada reserva. Esta vez te avisan que suben la comisión y que van a ofrecer descuentos a tus huéspedes sin consultarte.',
 'comercio', 'curado', 0.10, 5, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[{"campo":"costos_comercializacion","operacion":"multiplicar","valor":1.08}]}'::jsonb,
 '[
   {"letra":"A","texto":"Seguir en todas las plataformas","consecuencias":{"demanda":"*1.05","precio_venta":"*0.96"},"feedback_corto":"Mantienes visibilidad y ocupación, pero tu margen se achica y controlas menos el precio"},
   {"letra":"B","texto":"Impulsar venta directa (WhatsApp, web propia, descuento por reservar directo)","consecuencias":{"costos_comercializacion":"+5%","demanda":"*0.95","precio_venta":"*1.03"},"feedback_corto":"Recuperas margen, pero inviertes en web y pierdes visibilidad al comienzo"},
   {"letra":"C","texto":"Trabajar con agencias mayoristas y operadores de tours","consecuencias":{"demanda":"*1.12","precio_venta":"*0.93"},"feedback_corto":"Te llenan habitaciones con grupos, a una tarifa especial y con comisión negociada"},
   {"letra":"D","texto":"Limitar la disponibilidad en plataformas los días de alta demanda","consecuencias":{"demanda":"*0.97","precio_venta":"*1.04"},"feedback_corto":"Vendes esos días a mejor precio, pero te ven menos"}
 ]'::jsonb),

('TUR004',
 'Ola de reseñas negativas por un problema de servicio',
 'Un corte de agua, ruido y una mala atención en la misma semana llenan tu página de reseñas bajas. El viajero consulta las reseñas antes de reservar, y tu puntaje cae de 4,4 a 4,0.',
 'sectorial', 'curado', 0.11, 4, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.88},{"campo":"demanda","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en capacitación y arreglar la causa del problema","consecuencias":{"caja":"-6%","reputacion":"+10%"},"feedback_corto":"Atacas la raíz, pero el gasto es ahora y el puntaje tarda en recuperarse"},
   {"letra":"B","texto":"Bajar el precio hasta que mejore el puntaje","consecuencias":{"precio_venta":"*0.90","demanda":"*1.10"},"feedback_corto":"Mantienes ocupación, pero con un hotel peor puntuado y más barato"},
   {"letra":"C","texto":"Responder públicamente cada reseña y compensar a los afectados","consecuencias":{"caja":"-2%","reputacion":"+4%"},"feedback_corto":"Muestras que te importa, pero no corriges el problema de fondo"},
   {"letra":"D","texto":"Pedir reseñas a huéspedes satisfechos","consecuencias":{"reputacion":"+6%","costos":"+1%"},"feedback_corto":"Sube el promedio rápido, aunque tapa el problema en vez de resolverlo"}
 ]'::jsonb),

('TUR005',
 'Fin de semana lleno: ¿cuántos de los que reservaron llegan?',
 'Se viene un fin de semana de mucha demanda. Por experiencia, entre 10% y 15% de las reservas no se presentan. Si cobras poco por cancelar quedan habitaciones vacías; si sobrevendes y llegan todos, tienes que rechazar a alguien con reserva.',
 'servicios', 'curado', 0.10, 3, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Cobrar un depósito no reembolsable","consecuencias":{"demanda":"*0.93","caja":"+3%"},"feedback_corto":"Casi no hay no-shows, pero reservas menos gente y pareces rígido"},
   {"letra":"B","texto":"Cancelación gratuita hasta 24 horas antes","consecuencias":{"demanda":"*1.06","caja":"-3%"},"feedback_corto":"Más reservas, pero más habitaciones vacías a último momento"},
   {"letra":"C","texto":"Sobrevender entre 5% y 10% de la capacidad","consecuencias":{"caja":"+5%","reputacion":"-6%"},"feedback_corto":"Llenas la planta, pero si llegan todos reubicas a alguien y lo pagas en reputación"},
   {"letra":"D","texto":"Política flexible en plataformas y rígida en venta directa","consecuencias":{"demanda":"*1.02","costos":"+1%"},"feedback_corto":"Adaptas por tipo de cliente, a cambio de más complejidad y reclamos"}
 ]'::jsonb),

('TUR006',
 'Cambia el régimen cambiario: el dólar deja de ser fijo',
 'Bolivia pasa a un tipo de cambio que se fija a diario según las transacciones del sistema financiero. Tus insumos ligados al dólar (equipos, tecnología, algunos alimentos) se encarecen, y el poder de compra del turista extranjero en bolivianos cambia.',
 'macroeconomico', 'curado', 0.08, 10, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener tarifas en bolivianos y absorber el costo","consecuencias":{"costos":"+4%"},"feedback_corto":"Tus clientes tienen previsibilidad, pero tu margen se achica"},
   {"letra":"B","texto":"Cotizar a extranjeros en dólares","consecuencias":{"precio_venta":"*1.05","demanda":"*0.96"},"feedback_corto":"Te cubres de forma natural, pero el turista puede verte caro frente a otros destinos"},
   {"letra":"C","texto":"Comprar insumos locales y renegociar con proveedores","consecuencias":{"costos":"-3%","reputacion":"-3%"},"feedback_corto":"Reduces tu exposición al dólar, con algo menos de calidad o variedad"},
   {"letra":"D","texto":"Subir todas las tarifas un porcentaje","consecuencias":{"precio_venta":"*1.07","demanda":"*0.93"},"feedback_corto":"Proteges el margen, pero la ocupación baja según qué tan sensible sea tu cliente"}
 ]'::jsonb),

('TUR007',
 'Sequía: falta de agua en la ciudad',
 'Durante una sequía, los hoteles no pueden atender a huéspedes que pagan por agua caliente y baños. La autoridad prioriza hospitales, hogares y escuelas. Las cisternas cuestan entre dos y cuatro veces la tarifa normal.',
 'climatico', 'curado', 0.07, 5, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[{"campo":"costos_servicios","operacion":"multiplicar","valor":1.12}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratar cisternas y construir tanques propios","consecuencias":{"caja":"-8%","reputacion":"+4%"},"feedback_corto":"Aseguras continuidad, con inversión ahora y gasto en cada abastecimiento"},
   {"letra":"B","texto":"Reducir servicios (lavandería, duchas largas)","consecuencias":{"costos":"-3%","reputacion":"-6%"},"feedback_corto":"Bajas el consumo, pero el huésped recibe menos por lo que paga"},
   {"letra":"C","texto":"Subir la tarifa para cubrir el costo del agua","consecuencias":{"precio_venta":"*1.06","demanda":"*0.94"},"feedback_corto":"Trasladas el costo, a cambio de ocupación y reseñas"},
   {"letra":"D","texto":"Pedir a la autoridad una distribución prioritaria","consecuencias":{"reputacion":"-2%"},"feedback_corto":"No cuesta nada, pero no controlas el resultado y los hospitales van primero"}
 ]'::jsonb),

('TUR008',
 'Feriado largo o fiesta grande llena la ciudad',
 'Un feriado largo, el Carnaval u otra fiesta llena la ciudad. La ocupación puede llegar a 90% o 100% y puedes cobrar mucho más. También es donde el servicio bajo presión puede arruinarte la reputación.',
 'sectorial', 'curado', 0.11, 4, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.30}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir mucho la tarifa y exigir un mínimo de noches","consecuencias":{"precio_venta":"*1.35","reputacion":"-4%"},"feedback_corto":"Máximo ingreso por habitación, pero tus clientes habituales se molestan"},
   {"letra":"B","texto":"Mantener la tarifa para clientes fijos y vender el resto caro","consecuencias":{"precio_venta":"*1.15","reputacion":"+3%"},"feedback_corto":"Cuidas la relación con los tuyos y renuncias a parte del ingreso posible"},
   {"letra":"C","texto":"Contratar personal extra y ofrecer comida y tours","consecuencias":{"costos":"+8%","precio_venta":"*1.12","reputacion":"+2%"},"feedback_corto":"Ganas ingresos complementarios, con costos altos y riesgo de mala calidad"},
   {"letra":"D","texto":"Sobrevender para llenar todo","consecuencias":{"precio_venta":"*1.25","reputacion":"-7%"},"feedback_corto":"Ocupación máxima, pero si llegan todos tendrás que reubicar a alguien"}
 ]'::jsonb),

('TUR009',
 'Alojamientos informales y alquileres de departamentos te quitan clientes',
 'Aparecen alojamientos sin licencia y departamentos en plataformas de alquiler, con precios más bajos porque no pagan licencias ni impuestos. Pierdes sobre todo el segmento económico, y la cámara hotelera pide fiscalización.',
 'comercio', 'curado', 0.09, 6, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar el precio para competir","consecuencias":{"precio_venta":"*0.92","demanda":"*1.08"},"feedback_corto":"Frenas la fuga, pero con costos fijos altos el margen se vuelve fino"},
   {"letra":"B","texto":"Diferenciarte (servicio, ubicación, desayuno, seguridad)","consecuencias":{"caja":"-5%","reputacion":"+8%","demanda":"*1.06"},"feedback_corto":"Dejas de competir por precio, pero la inversión se paga recién después"},
   {"letra":"C","texto":"Denunciar y pedir fiscalización a la autoridad","consecuencias":{"costos":"+1%"},"feedback_corto":"Puede nivelar la cancha, pero el resultado es lento e incierto"},
   {"letra":"D","texto":"Publicar tus habitaciones también en plataformas de alquiler","consecuencias":{"demanda":"*1.07","precio_venta":"*0.96"},"feedback_corto":"Llegas al mismo cliente que te quita el sustituto, con comisión y menos control"}
 ]'::jsonb),

('TUR010',
 'Una empresa te ofrece un bloque anual de habitaciones con descuento',
 'Una minera, una constructora o un mayorista quiere reservar habitaciones todo el año con una tarifa entre 20% y 35% menor que la pública. Te da ocupación segura en los meses flojos, pero esas habitaciones no las podrás vender caro en temporada alta.',
 'oportunidad', 'curado', 0.09, 5, ARRAY['tipo:turismo'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar el bloque anual con el descuento","consecuencias":{"demanda":"*1.20","precio_venta":"*0.88"},"feedback_corto":"Ingreso predecible, pero menos habitaciones para vender caro y dependes de un cliente"},
   {"letra":"B","texto":"Aceptar solo para los meses de baja","consecuencias":{"demanda":"*1.10","precio_venta":"*0.96"},"feedback_corto":"Llenas donde sobra, aunque el cliente puede no aceptar esas condiciones"},
   {"letra":"C","texto":"Aceptar con un pago adelantado parcial","consecuencias":{"caja":"+6%","precio_venta":"*0.84","demanda":"*1.20"},"feedback_corto":"Entra caja ya, pero a una tarifa todavía menor"},
   {"letra":"D","texto":"Rechazar y vender solo al público","consecuencias":{"reputacion":"+1%"},"feedback_corto":"Conservas libertad de precio, a costa de meses con ocupación baja"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
