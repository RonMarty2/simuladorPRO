-- ============================================================================
-- 043 — Eventos propios de proyectos de AGRICULTURA y agroindustria
-- Fuente: docs/metodologia/tipos/agro-campana.md (seccion 5, situaciones).
--
-- Categoria agricultura (quinua, hidroponia, cafe, ganaderia y similares).
-- Idempotente. Aqui "demanda" representa el volumen cosechado o vendible,
-- "precio_venta" el precio recibido y "costos" el costo por hectarea o lote.
-- Magnitudes: estimaciones a calibrar (seccion 10 de la ficha). Los casos
-- reales de Bolivia (sequia 2023-2024, suspension de exportacion de carne
-- 2025, falta de diesel) se usan como precedentes, no como datos exactos.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('AGR001',
 'Sequía en plena siembra: las lluvias llegan tarde',
 'Las lluvias llegan tarde y de forma esporádica. Se siembra tarde y el cultivo no se desarrolla bien. En la campaña de verano 2023-2024 Bolivia vivió una de las sequías más fuertes en 30 años, con rendimientos de 800 a 900 kg por hectárea que no cubrían los costos. El gasto ya está hecho: el costo por hectárea casi no baja aunque la cosecha sí.',
 'sectorial', 'curado', 0.10, 3, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.65}]}'::jsonb,
 '[
   {"letra":"A","texto":"Sembrar igual, tarde, con todo el paquete tecnológico","consecuencias":{"caja":"-8%","demanda":"*1.15"},"feedback_corto":"Si llueve recuperas el calendario, pero si no llueve pierdes todo el gasto y hay que financiarlo"},
   {"letra":"B","texto":"Sembrar solo una parte de la superficie y reservar caja","consecuencias":{"caja":"-3%","demanda":"*0.90"},"feedback_corto":"Limitas la pérdida máxima, pero el ingreso total es menor aun en un buen año y los costos fijos se reparten en menos hectáreas"},
   {"letra":"C","texto":"Cambiar a un cultivo de ciclo corto o menos exigente en agua","consecuencias":{"caja":"-5%","demanda":"*1.08","precio_venta":"*0.95"},"feedback_corto":"Bajas la exposición a la sequía, pero es otro paquete tecnológico, otro mercado y por lo general menor margen por hectárea"},
   {"letra":"D","texto":"Pedir reprogramar la deuda antes de cosechar","consecuencias":{"deuda":"+4%","caja":"+4%","reputacion":"-3%"},"feedback_corto":"Alivias la cuota de esta campaña, con más intereses y desgaste con el acreedor"}
 ]'::jsonb),

('AGR002',
 'Helada, granizada o inundación sobre tu parcela',
 'Un evento localizado destruye entre 30% y 100% de una parte del cultivo. Bolivia tiene el Seguro Agrario Pachamama, gratuito pero solo para agricultura familiar de hasta 3 hectáreas y con una suma fija por hectárea afectada, menor al costo de producción de la mayoría de los cultivos comerciales. Quien produce a escala comercial necesita otra protección o asume el riesgo.',
 'sectorial', 'curado', 0.09, 4, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cobrar el seguro estatal si te corresponde","consecuencias":{"caja":"+3%","reputacion":"-1%"},"feedback_corto":"No pagas prima, pero cubre pocas hectáreas y una suma fija que puede ser menor a tu pérdida"},
   {"letra":"B","texto":"Comprar una póliza comercial para la próxima campaña","consecuencias":{"caja":"-4%","demanda":"*1.05"},"feedback_corto":"Cubres más y mejor, pero pagas la prima y en un seguro indexado puedes perder sin cobrar o cobrar sin haber perdido"},
   {"letra":"C","texto":"Diversificar parcelas, cultivos y fechas de siembra","consecuencias":{"caja":"-3%","costos":"+3%","demanda":"*1.10"},"feedback_corto":"Un evento local ya no destruye todo, a cambio de menos especialización, más manejo y menor escala por cultivo"},
   {"letra":"D","texto":"Asumir el riesgo y armar un fondo de contingencia","consecuencias":{"caja":"-5%","reputacion":"+2%"},"feedback_corto":"No pagas primas, pero inmovilizas caja que también necesitas para la próxima campaña"}
 ]'::jsonb),

('AGR003',
 'Cae el precio internacional de tu producto',
 'El precio del producto de exportación cae por sobreoferta mundial. La quinua boliviana llegó a unos 6.600 dólares por tonelada en 2014 y bajó a cerca de 2.000 mientras más de 100 países empezaron a producirla. Tu costo por hectárea no cambia: el calendario agrícola no se detiene porque el precio baje.',
 'macroeconomico', 'curado', 0.10, 5, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.65}]}'::jsonb,
 '[
   {"letra":"A","texto":"Vender toda la cosecha ahora, al precio bajo","consecuencias":{"caja":"+6%","precio_venta":"*0.95"},"feedback_corto":"Cobras y pagas deudas, pero realizas la pérdida del todo"},
   {"letra":"B","texto":"Guardar la cosecha esperando que el precio suba","consecuencias":{"caja":"-5%","costos":"+3%","precio_venta":"*1.08"},"feedback_corto":"Puedes captar una recuperación, pero pagas almacenamiento, arriesgas plagas y merma, y la caja queda inmovilizada con cuotas por pagar"},
   {"letra":"C","texto":"Buscar un comprador directo o armar marca propia","consecuencias":{"caja":"-6%","precio_venta":"*1.15","demanda":"*0.92"},"feedback_corto":"Saltas intermediarios y ganas margen, pero exige tiempo, calidad certificada y una escala que un productor solo rara vez tiene"},
   {"letra":"D","texto":"Pasar parte de la superficie a otro cultivo","consecuencias":{"costos":"+4%","demanda":"*1.06"},"feedback_corto":"Diversificas, con curva de aprendizaje y sin garantía de que el suelo o el clima del lugar lo permitan"}
 ]'::jsonb),

('AGR004',
 'El Estado suspende las exportaciones de tu producto',
 'Para bajar el precio interno, el Gobierno suspende exportar un producto. En febrero de 2025 se suspendió la exportación de carne bovina y la Cámara de Exportadores calculó pérdidas de 500.000 dólares diarios. Tu producto solo puede venderse en el mercado interno, a un precio menor al de exportación, y mantenerlo sin vender cuesta cada día.',
 'macroeconomico', 'curado', 0.08, 6, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.75}]}'::jsonb,
 '[
   {"letra":"A","texto":"Vender todo en el mercado interno al precio bajo","consecuencias":{"caja":"+5%","precio_venta":"*0.93"},"feedback_corto":"Cobras de inmediato y sin riesgo extra, con menor margen, y tu oferta adicional presiona aún más el precio local"},
   {"letra":"B","texto":"Retener el producto esperando que levanten la restricción","consecuencias":{"caja":"-6%","costos":"+4%","precio_venta":"*1.10"},"feedback_corto":"Puedes recuperar el precio de exportación, pero mantener el producto cuesta, pierde peso o calidad, y si dura la restricción la caja se acaba"},
   {"letra":"C","texto":"Presionar junto al gremio para negociar la reapertura","consecuencias":{"caja":"-2%","reputacion":"+2%","demanda":"*1.04"},"feedback_corto":"Puede reabrir el acceso, pero toma tiempo, el resultado es incierto y no depende solo de ti"},
   {"letra":"D","texto":"Orientarte al mercado interno a largo plazo (faena o venta directa)","consecuencias":{"caja":"-7%","costos":"-3%","demanda":"*1.08"},"feedback_corto":"Dependes menos de la política de exportación, con inversión inicial y un precio base menor en el mercado interno"}
 ]'::jsonb),

('AGR005',
 'La cuota del crédito de campaña no coincide con la cosecha',
 'Pediste prestado para sembrar. Si la cuota es mensual y el ingreso llega una vez al año, hay meses en que la caja sale sin que entre nada. El costo real de la deuda no es solo la tasa: es el desajuste entre cuándo pagas y cuándo cobras. Después de una mala campaña, el gremio pidió reprogramar créditos a cinco años.',
 'financiero', 'curado', 0.11, 3, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.94}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pasar a un crédito con cuota única en la cosecha","consecuencias":{"deuda":"+5%","caja":"+6%"},"feedback_corto":"La deuda sigue el flujo real del cultivo, con tasa o garantía por lo general mayores y no siempre disponible"},
   {"letra":"B","texto":"Mantener cuotas mensuales más baratas y financiarlas con otra caja","consecuencias":{"caja":"-5%","deuda":"-2%"},"feedback_corto":"La tasa es menor, pero hay que sostener la cuota durante los meses de gasto y una mala campaña lleva a la mora"},
   {"letra":"C","texto":"Financiarte con proveedores de insumos o anticipo del comprador","consecuencias":{"caja":"+5%","precio_venta":"*0.95","costos":"+2%"},"feedback_corto":"Reduces deuda bancaria, pero pagas un recargo implícito en insumos o un descuento en tu precio y dependes de ese proveedor o comprador"},
   {"letra":"D","texto":"Reducir la superficie para no depender de deuda","consecuencias":{"deuda":"-8%","demanda":"*0.90"},"feedback_corto":"Tomas menos riesgo, con menor escala y menor ingreso potencial"}
 ]'::jsonb),

('AGR006',
 'Suben los insumos por la falta de dólares',
 'Semilla, fertilizante, agroquímicos y repuestos importados se encarecen entre 15% y 60% según el insumo, por la falta de dólares y la inflación. Si el precio de venta no sube, el margen por hectárea se achica, y el capital de trabajo que necesitas para la campaña es mayor.',
 'macroeconomico', 'curado', 0.11, 4, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Comprar todos los insumos al inicio de la campaña","consecuencias":{"caja":"-8%","costos":"-4%"},"feedback_corto":"Fijas el costo antes de otra alza, pero inmovilizas caja, tomas más deuda y arriesgas uso inadecuado o vencimiento"},
   {"letra":"B","texto":"Reducir dosis o sustituir por insumos más baratos","consecuencias":{"costos":"-5%","demanda":"*0.92"},"feedback_corto":"Gastas menos hoy, con riesgo de menor rendimiento o más plagas: lo barato en caja puede salir caro en cosecha"},
   {"letra":"C","texto":"Pasar a prácticas con menos insumo externo (abono verde, rotación)","consecuencias":{"costos":"-3%","demanda":"*0.95","reputacion":"+2%"},"feedback_corto":"Dependes menos del dólar a mediano plazo, con una transición que puede bajar el rendimiento al principio"},
   {"letra":"D","texto":"Comprar en grupo con otros productores o por cooperativa","consecuencias":{"costos":"-4%","caja":"-2%"},"feedback_corto":"Ganas poder de negociación, a cambio de coordinación, plazos de entrega y tiempo"}
 ]'::jsonb),

('AGR007',
 'Falta de diésel en siembra o cosecha',
 'La maquinaria y el transporte dependen del diésel. Cuando no llega a tiempo, se siembra tarde o se cosecha tarde y el rendimiento baja entre 5% y 25%. El calendario agrícola es rígido: una semana de retraso en la fecha correcta pesa más que el sobreprecio del combustible.',
 'logistico', 'curado', 0.10, 3, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Comprar combustible a sobreprecio en el mercado paralelo","consecuencias":{"caja":"-5%","costos":"+3%","demanda":"*1.10"},"feedback_corto":"Cumples el calendario, con un costo adicional y posible riesgo legal o de calidad del combustible"},
   {"letra":"B","texto":"Postergar las labores hasta que haya diésel","consecuencias":{"demanda":"*0.92","costos":"-2%"},"feedback_corto":"No pagas sobreprecio, pero pierdes rendimiento por el calendario y arriesgas el clima de la cosecha"},
   {"letra":"C","texto":"Contratar servicios de maquinaria a terceros","consecuencias":{"caja":"-4%","demanda":"*1.06"},"feedback_corto":"No dependes de tu propio abastecimiento, pagas más y dependes de que el contratista esté disponible"},
   {"letra":"D","texto":"Invertir en tanques para almacenar combustible cuando haya","consecuencias":{"caja":"-6%","costos":"-3%","demanda":"*1.04"},"feedback_corto":"Aseguras el suministro en la próxima campaña, con capital inmovilizado y exigencias de regulación"}
 ]'::jsonb),

('AGR008',
 'Un bloqueo frena la salida de tu producto perecible',
 'Un bloqueo, un frente frío o la escasez de combustible encarecen o impiden sacar el producto. En el trópico de Cochabamba el flete refrigerado de pescado subió entre 100% y 150%. Un lote que no sale a tiempo sigue consumiendo alimento o se pierde: en producto perecible, el tiempo cuesta dinero.',
 'logistico', 'curado', 0.10, 4, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"costos_logistica","operacion":"multiplicar","valor":1.20},{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar el flete caro y entregar igual","consecuencias":{"caja":"-5%","reputacion":"+3%"},"feedback_corto":"Cumples con tu comprador y proteges la relación, con un margen casi nulo o negativo en ese lote"},
   {"letra":"B","texto":"Esperar y mantener el lote","consecuencias":{"costos":"+4%","demanda":"*0.93"},"feedback_corto":"No pagas flete caro, pero consumes más alimento, arriesgas mortalidad y puedes perder la ventana de venta"},
   {"letra":"C","texto":"Vender en el mercado local a menor precio","consecuencias":{"caja":"+3%","precio_venta":"*0.90"},"feedback_corto":"Cobras rápido, con un precio menor y el mercado cercano saturado"},
   {"letra":"D","texto":"Procesar el lote (congelar, filetear, secar) para guardarlo","consecuencias":{"caja":"-7%","costos":"+3%","precio_venta":"*1.06"},"feedback_corto":"Alargas la vida del producto y ganas valor, con inversión en equipo y frío y más costos de operación"}
 ]'::jsonb),

('AGR009',
 'La roya o una plaga golpea tu cultivo perenne',
 'Una plaga como la roya del café debilita la planta y baja la producción por varias campañas. En cultivos perennes hay años de inversión sin cosecha, así que una plaga o una poda de rehabilitación significa años de ingreso reducido. La caída del rendimiento puede ser de 20% a 60% en un año de brote fuerte, con recuperación lenta.',
 'sectorial', 'curado', 0.08, 6, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.70},{"campo":"costo_insumos","operacion":"multiplicar","valor":1.08}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aplicar control químico u orgánico (caldo bordelés, fungicidas)","consecuencias":{"caja":"-5%","demanda":"*1.15"},"feedback_corto":"Salvas parte de la cosecha, con mano de obra e insumos y, si eres orgánico certificado, menos opciones disponibles"},
   {"letra":"B","texto":"Podar y renovar con variedades más resistentes","consecuencias":{"caja":"-8%","demanda":"*0.85","costos":"-3%"},"feedback_corto":"Recuperas productividad a mediano plazo, a costa de años de producción reducida o nula y capital para plantines"},
   {"letra":"C","texto":"Complementar con otros cultivos en la misma finca","consecuencias":{"caja":"-3%","costos":"+3%","demanda":"*1.06"},"feedback_corto":"Tienes ingresos mientras el cultivo principal se recupera, con otro manejo y menos foco"},
   {"letra":"D","texto":"Reducir o abandonar el cultivo","consecuencias":{"costos":"-6%","demanda":"*0.80","reputacion":"-3%"},"feedback_corto":"Dejas de gastar, pero pierdes la inversión hecha y la capacidad productiva"}
 ]'::jsonb),

('AGR010',
 'Conflicto de tierra: ocupación ilegal o título dudoso',
 'La tierra es el activo central del proyecto y su titularidad puede ser cuestionada. Aunque la mayor parte de la tierra está saneada, los avasallamientos (ocupaciones ilegales) son un riesgo real y su solución pasa por la justicia agroambiental, que es lenta. Si pierdes la posesión, pierdes también todo lo invertido en el predio.',
 'sectorial', 'curado', 0.07, 6, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir fuerte en el predio aunque el saneamiento esté pendiente","consecuencias":{"deuda":"+8%","demanda":"*1.12"},"feedback_corto":"Produces más desde ya, pero si hay conflicto pierdes la inversión"},
   {"letra":"B","texto":"Frenar inversiones hasta tener el título","consecuencias":{"demanda":"*0.92","caja":"+3%"},"feedback_corto":"Proteges tu capital, pero pierdes campañas de producción mientras esperas"},
   {"letra":"C","texto":"Contratar seguridad privada y asesoría legal","consecuencias":{"caja":"-4%","costos":"+3%","reputacion":"+2%"},"feedback_corto":"Reduces el riesgo de ocupación con un gasto fijo permanente que no sustituye la protección legal"},
   {"letra":"D","texto":"Alquilar o asociarte en tierra ya titulada","consecuencias":{"costos":"+4%","demanda":"*1.05","deuda":"-3%"},"feedback_corto":"Ganas seguridad jurídica, con una renta que reduce el margen y sin acumular patrimonio en tierra"}
 ]'::jsonb),

('AGR011',
 'Oportunidad: entrar a una cooperativa o asociación de productores',
 'Una organización de productores puede dar acopio, procesamiento, certificación y mercados que uno solo no consigue. La cooperativa El Ceibo, en Alto Beni, llegó a exportar entre 300 y 360 toneladas de cacao al año con unas 800 familias socias. Pero la organización tiene reglas, tiempos de pago propios y exige lealtad, y el productor aislado suele recibir el precio más bajo de la cadena.',
 'oportunidad', 'curado', 0.09, 5, ARRAY['tipo:agricultura'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Entregar toda la cosecha a la cooperativa","consecuencias":{"precio_venta":"*1.08","caja":"-3%","reputacion":"+3%"},"feedback_corto":"Accedes a mercado, asistencia técnica y precio más estable, pero cobras a su ritmo y acatas sus normas"},
   {"letra":"B","texto":"Entregar una parte y vender el resto al intermediario cuando pague mejor","consecuencias":{"caja":"+3%","precio_venta":"*1.03","reputacion":"-2%"},"feedback_corto":"Ganas liquidez y flexibilidad, pero la cooperativa puede exigir lealtad y el intermediario puede bajar su precio el año siguiente"},
   {"letra":"C","texto":"Seguir vendiendo siempre a intermediarios","consecuencias":{"caja":"+4%","precio_venta":"*0.95"},"feedback_corto":"Cobras al contado y sin trámites, con menor precio promedio y sin poder de negociación"},
   {"letra":"D","texto":"Armar una asociación propia con tus vecinos","consecuencias":{"caja":"-6%","costos":"+3%","demanda":"*1.10"},"feedback_corto":"Mantienes el control y puedes crecer, pero son años de organización, gestión y capital antes de ver resultados"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
