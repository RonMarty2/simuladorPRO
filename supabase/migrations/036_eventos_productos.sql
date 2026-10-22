-- ============================================================================
-- 036 — Eventos propios de los proyectos de PRODUCTOS (comprar, fabricar y vender)
-- Fuente: docs/metodologia/tipos/producto-unidades.md (seccion 5, situaciones).
--
-- Aplican a las categorias gastronomia, produccion y comercio (el modelo clasico:
-- panaderias, cafeterias, fabricas, tiendas, distribuidoras). Idempotente.
--
-- Magnitudes: estimaciones a calibrar con datos de Bolivia (seccion 10 de la
-- ficha). Solo mueven variables que el motor ya maneja.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('PRD001',
 'Faltan dólares: tu insumo importado se encarece',
 'Los bancos casi no venden dólares al tipo de cambio oficial y el importador paga comisiones o compra en el mercado paralelo. Tus insumos importados (harina especial, envases, repuestos o mercadería terminada) suben entre 10% y 30% en bolivianos. El stock viejo es más barato que el que vas a reponer.',
 'macroeconomico', 'curado', 0.12, 3, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.12}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir el precio de inmediato","consecuencias":{"precio_venta":"*1.08","demanda":"*0.92"},"feedback_corto":"Proteges el margen, pero pierdes clientes frente a quien aún vende con stock viejo o informal"},
   {"letra":"B","texto":"Absorber el costo unos meses","consecuencias":{"costos":"+6%","caja":"-3%"},"feedback_corto":"No pierdes clientes, pero el margen se achica y la caja se debilita"},
   {"letra":"C","texto":"Cambiar a un insumo local o sustituto","consecuencias":{"costos":"-4%","reputacion":"-5%"},"feedback_corto":"Pagas en bolivianos y dependes menos del dólar, aunque puede bajar la calidad del producto"},
   {"letra":"D","texto":"Comprar por adelantado todo el stock que puedas","consecuencias":{"caja":"-12%","costos":"-3%"},"feedback_corto":"Congelas el costo, pero inmovilizas caja y corres riesgo de vencimiento"}
 ]'::jsonb),

('PRD002',
 'Tu producto tiene precio regulado y el insumo sube',
 'El precio de venta de tu producto está atado a un acuerdo con el Estado, como el pan de batalla, pero tus insumos suben. En un caso real, el quintal de harina pasó de Bs 210 a Bs 250 y algunos panificadores subieron el pan de Bs 0,50 a Bs 1, otros lo achicaron.',
 'sectorial', 'curado', 0.09, 4, ARRAY['tipo:gastronomia','tipo:produccion'],
 '{"variables_afectadas":[{"campo":"costo_insumos","operacion":"multiplicar","valor":1.12}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar el acuerdo y la harina subvencionada","consecuencias":{"costos":"-5%","demanda":"*1.02"},"feedback_corto":"Costo controlado, pero con precio atado y dependencia de un solo proveedor estatal"},
   {"letra":"B","texto":"Subir el precio por tu cuenta","consecuencias":{"precio_venta":"*1.15","demanda":"*0.88","reputacion":"-4%"},"feedback_corto":"Recuperas margen, pero pierdes clientes frente a quienes mantienen el precio y arriesgas conflicto con el gremio"},
   {"letra":"C","texto":"Achicar el producto","consecuencias":{"precio_venta":"*1.06","reputacion":"-7%"},"feedback_corto":"Mantienes el precio nominal, pero el cliente lo nota y tu marca se deteriora"},
   {"letra":"D","texto":"Diversificar a productos de precio libre (pasteles, pan especial)","consecuencias":{"caja":"-5%","precio_venta":"*1.08","costos":"+2%"},"feedback_corto":"Mayor margen y precio propio, pero exige inversión, otra clase de clientes y más merma"}
 ]'::jsonb),

('PRD003',
 'Bloqueos: el proveedor no llega y los clientes tampoco',
 'Los bloqueos de carreteras interrumpen el transporte de insumos y de producto terminado. La entrega pasa de 2 días a entre 7 y 15, las ventas caen entre 20% y 60% en el mes más duro y el costo de transporte sube. Son estimaciones de gremios, no mediciones oficiales.',
 'logistico', 'curado', 0.11, 5, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.65},{"campo":"costos_logistica","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Tener un colchón de stock de seguridad más alto","consecuencias":{"caja":"-8%","demanda":"*1.20","reputacion":"+4%"},"feedback_corto":"Sigues vendiendo cuando otros no, pero inmovilizas capital y arriesgas vencimientos todo el año"},
   {"letra":"B","texto":"Buscar un proveedor local alternativo","consecuencias":{"costos":"+4%","demanda":"*1.10"},"feedback_corto":"Dependes menos del tramo bloqueado, aunque puede ser más caro o de menor calidad"},
   {"letra":"C","texto":"Aprovechar la escasez para subir el precio","consecuencias":{"precio_venta":"*1.18","reputacion":"-9%"},"feedback_corto":"Más margen por unidad, pero te ven como especulador y puede reaccionar la autoridad"},
   {"letra":"D","texto":"Parar y esperar","consecuencias":{"reputacion":"-4%","demanda":"*0.90"},"feedback_corto":"No gastas más, pero los costos fijos siguen y los clientes se van a quien sí tenía"}
 ]'::jsonb),

('PRD004',
 'La inflación sube: ¿cuánto trasladas al precio?',
 'Los costos suben de forma general y el Banco Central reconoce que el ajuste del diésel puede trasladarse a los precios. Decides cuándo y cuánto ajustar tu precio, sabiendo que no ajustar también es una decisión con costo.',
 'macroeconomico', 'curado', 0.12, 4, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"costos_generales","operacion":"multiplicar","valor":1.07}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir el precio poco y seguido","consecuencias":{"precio_venta":"*1.05","demanda":"*0.98","costos":"+1%"},"feedback_corto":"El cliente casi no lo nota, pero das más trabajo (listas, etiquetas) y corres detrás de la inflación"},
   {"letra":"B","texto":"Subir de una vez, fuerte","consecuencias":{"precio_venta":"*1.10","demanda":"*0.90"},"feedback_corto":"Te ahorras ajustes, pero un salto grande puede espantar clientes"},
   {"letra":"C","texto":"Mantener el precio y recortar costos o calidad","consecuencias":{"costos":"-4%","reputacion":"-6%"},"feedback_corto":"Conservas la clientela, pero el producto empeora o se agotan los recortes posibles"},
   {"letra":"D","texto":"Poner cláusula de ajuste al costo a los clientes mayoristas","consecuencias":{"precio_venta":"*1.04","demanda":"*0.97"},"feedback_corto":"Proteges el margen en ventas grandes, aunque algunos clientes se van a un proveedor sin cláusula"}
 ]'::jsonb),

('PRD005',
 'Competencia informal y contrabando con precios más bajos',
 'Vendedores sin factura, sin impuestos o con mercadería de contrabando ofrecen lo mismo más barato. Para muchas empresas bolivianas, la competencia informal es su mayor obstáculo. Tú sigues pagando facturas e impuestos, así que tu margen se comprime.',
 'comercio', 'curado', 0.10, 4, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar el precio para competir","consecuencias":{"precio_venta":"*0.92","demanda":"*1.08"},"feedback_corto":"Frenas la fuga, pero con margen chico: si el informal puede bajar más, pierdes igual"},
   {"letra":"B","texto":"Diferenciarte (calidad, garantía, factura, servicio)","consecuencias":{"caja":"-4%","reputacion":"+8%","demanda":"*1.04"},"feedback_corto":"Atiendes a quien valora lo formal, aunque el mercado es más chico y la inversión se paga más tarde"},
   {"letra":"C","texto":"Enfocarte en clientes que exigen factura (empresas, instituciones)","consecuencias":{"demanda":"*1.06","caja":"-3%"},"feedback_corto":"Más estabilidad, pero con plazos de cobro largos y más exigencias"},
   {"letra":"D","texto":"Aceptar menos volumen y bajar costos fijos","consecuencias":{"costos":"-6%","demanda":"*0.95"},"feedback_corto":"Sobrevives con menos, pero el negocio se achica"}
 ]'::jsonb),

('PRD006',
 'Se vence lo que no vendes: merma de perecibles',
 'Vendes productos con fecha de vencimiento o de calidad, como pan, lácteos, fruta o platos preparados. Si pides de más, lo que sobra se pierde; si pides de menos, pierdes ventas. Una merma normal en perecibles de vida corta ronda entre 3% y 10% de lo comprado.',
 'sectorial', 'curado', 0.11, 3, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.04}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pedir o producir poco, ajustado al día típico","consecuencias":{"costos":"-3%","demanda":"*0.95"},"feedback_corto":"Casi no hay merma, pero faltan productos en los días buenos y algunos clientes se van"},
   {"letra":"B","texto":"Pedir de más para no fallar nunca","consecuencias":{"costos":"+5%","reputacion":"+3%"},"feedback_corto":"Nivel de servicio alto, pero la merma se come el margen"},
   {"letra":"C","texto":"Rematar al final del día o hacer promociones","consecuencias":{"costos":"-2%","precio_venta":"*0.97"},"feedback_corto":"Recuperas parte del costo, pero acostumbras al cliente a esperar el descuento"},
   {"letra":"D","texto":"Invertir en conservación o producir según pedido","consecuencias":{"caja":"-6%","costos":"-4%"},"feedback_corto":"Menos merma, a cambio de inversión (refrigeración, sistema de pedidos) y menos venta por impulso"}
 ]'::jsonb),

('PRD007',
 'Temporada fuerte: se te acaba el stock justo cuando más se vende',
 'Se acerca una fecha de alta demanda (fin de año, inicio de clases, Carnaval). La demanda puede subir entre 30% y 100%. Si compras poco, te quedas sin producto; si compras demasiado, te sobra stock después de la fecha. La caja que necesitas llega antes que el ingreso.',
 'oportunidad', 'curado', 0.11, 4, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.35}]}'::jsonb,
 '[
   {"letra":"A","texto":"Comprar mucho antes, con financiamiento","consecuencias":{"deuda":"+8%","demanda":"*1.15"},"feedback_corto":"No pierdes ventas, pero pagas intereses y arriesgas una temporada floja"},
   {"letra":"B","texto":"Comprar el stock probable y reponer sobre la marcha","consecuencias":{"caja":"-3%","costos":"+1%"},"feedback_corto":"Menos capital inmovilizado, aunque si el proveedor se retrasa pierdes ventas"},
   {"letra":"C","texto":"Pactar con el proveedor entregas parciales o consignación","consecuencias":{"costos":"+3%","demanda":"*1.08"},"feedback_corto":"Reparte el riesgo, a cambio de un precio unitario más alto"},
   {"letra":"D","texto":"Vender por pedido anticipado con anticipo","consecuencias":{"caja":"+5%","demanda":"*0.95","reputacion":"+2%"},"feedback_corto":"Sabes cuánto comprar y cobras antes, pero tienes promesas que cumplir y menos venta de impulso"}
 ]'::jsonb),

('PRD008',
 'Tu proveedor único sube el precio y cambia las condiciones',
 'Un proveedor clave sube precios, acorta tu plazo de pago de 30 a 15 días y exige un pedido mínimo mayor. Como dependes de él, casi no tienes poder para negociar.',
 'comercio', 'curado', 0.09, 5, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.07},{"campo":"caja","operacion":"multiplicar","valor":0.97}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar las nuevas condiciones","consecuencias":{"costos":"+3%","caja":"-3%"},"feedback_corto":"Sigues operando sin fricción, pero con margen y caja más débiles y menos poder de negociación"},
   {"letra":"B","texto":"Buscar un segundo proveedor","consecuencias":{"costos":"+2%","caja":"-2%","reputacion":"+2%"},"feedback_corto":"Reduces la dependencia, pero cuesta tiempo, con mínimos más chicos y mayor costo por unidad"},
   {"letra":"C","texto":"Producir tú mismo el insumo","consecuencias":{"caja":"-12%","costos":"-5%"},"feedback_corto":"Ganas control, pero requiere inversión, conocimiento y una escala que quizás no tienes"},
   {"letra":"D","texto":"Comprar en conjunto con otros negocios similares","consecuencias":{"costos":"-3%","reputacion":"-1%"},"feedback_corto":"Más poder de compra, a cambio de coordinación y confianza entre negocios"}
 ]'::jsonb),

('PRD009',
 'Un cliente mayorista pide pagar a 60 días',
 'Una tienda, un restaurante o un supermercado ofrece un pedido importante, pero quiere pagar a 30, 60 o 90 días. Vender más sube la utilidad en papel, pero el cobro se demora y la caja se aprieta. Entre 2% y 5% de lo vendido a crédito se cobra tarde o no se cobra.',
 'comercio', 'curado', 0.10, 4, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar a 60 días","consecuencias":{"demanda":"*1.25","caja":"-10%"},"feedback_corto":"Ganas volumen y presencia, pero debes financiar 60 días de ventas y, si pagan tarde, te ahoga"},
   {"letra":"B","texto":"Aceptar a 30 días con descuento por pronto pago","consecuencias":{"demanda":"*1.15","precio_venta":"*0.96","caja":"-4%"},"feedback_corto":"Menos capital inmovilizado, pero con menor margen y el cliente puede no aceptar"},
   {"letra":"C","texto":"Rechazar o pedir pago al contado","consecuencias":{"demanda":"*0.98","reputacion":"-1%"},"feedback_corto":"Caja sana, pero pierdes la venta y quizás al cliente"},
   {"letra":"D","texto":"Aceptar y financiarte con una línea de crédito","consecuencias":{"demanda":"*1.25","deuda":"+8%","costos":"+2%"},"feedback_corto":"Haces la venta, pero los intereses se comen el margen si el cobro se atrasa"}
 ]'::jsonb),

('PRD010',
 'Un competidor formal con más capital abre al lado',
 'Una cadena o un negocio con más capital abre cerca y baja precios para ganar clientes. Compra en mayor volumen, así que su costo unitario es menor que el tuyo. Las ventas pueden bajar entre 10% y 30% en los primeros meses.',
 'comercio', 'curado', 0.09, 6, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Igualar el precio","consecuencias":{"precio_venta":"*0.90","demanda":"*1.10"},"feedback_corto":"No pierdes clientes de golpe, pero es una guerra que suele perder el de menor capital"},
   {"letra":"B","texto":"Mantener el precio y diferenciarte (calidad, atención, cercanía, crédito a conocidos)","consecuencias":{"reputacion":"+7%","demanda":"*1.03","costos":"+2%"},"feedback_corto":"Margen sano con tus clientes fieles, aunque con menor volumen"},
   {"letra":"C","texto":"Especializarte en un nicho que el rival no atiende","consecuencias":{"caja":"-5%","demanda":"*1.06","precio_venta":"*1.04"},"feedback_corto":"Menos comparación de precio, pero un mercado más chico y un cambio de oferta"},
   {"letra":"D","texto":"Asociarte o comprar en conjunto con otros pequeños","consecuencias":{"costos":"-4%","reputacion":"-1%"},"feedback_corto":"Ganas poder de compra, a cambio de coordinación"}
 ]'::jsonb),

('PRD011',
 'Se rompe una máquina clave o la demanda supera tu capacidad',
 'En tu cocina o fábrica, un equipo clave se rompe. Reparar toma días, no hay producto y los costos fijos siguen corriendo. Una reparación cuesta entre 3% y 20% del valor del equipo; reemplazarlo, el 100%.',
 'produccion', 'curado', 0.09, 5, ARRAY['tipo:gastronomia','tipo:produccion'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reparar rápido, aunque sea caro","consecuencias":{"caja":"-8%","demanda":"*1.15"},"feedback_corto":"Recuperas producción pronto, pero el gasto puede ser alto"},
   {"letra":"B","texto":"Tercerizar la producción mientras tanto","consecuencias":{"costos":"+5%","demanda":"*1.12","reputacion":"-3%"},"feedback_corto":"Sigues vendiendo, con mayor costo unitario y menos control de calidad"},
   {"letra":"C","texto":"Comprar un equipo nuevo con más capacidad","consecuencias":{"deuda":"+15%","demanda":"*1.20"},"feedback_corto":"Resuelves el cuello de botella, pero con una inversión grande y más endeudamiento"},
   {"letra":"D","texto":"Poner mantenimiento preventivo y un equipo de respaldo","consecuencias":{"costos":"+3%","caja":"-4%","reputacion":"+2%"},"feedback_corto":"Reduces el riesgo de paradas, con un gasto cuyo beneficio no se ve mientras no pasa nada"}
 ]'::jsonb),

('PRD012',
 'Un supermercado te ofrece un pedido grande con condiciones duras',
 'Un supermercado o una institución quiere comprarte un volumen alto y regular, pero exige precio bajo, factura, entregas frecuentes y pago a plazo. Pasaría a ser cerca del 40% de tus ventas.',
 'oportunidad', 'curado', 0.09, 6, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar todas las condiciones","consecuencias":{"demanda":"*1.45","precio_venta":"*0.86","caja":"-8%"},"feedback_corto":"Volumen y estabilidad, pero con margen bajo y una dependencia que duele si el cliente se va o paga tarde"},
   {"letra":"B","texto":"Aceptar con límites (tope de volumen, precio mínimo, plazo máximo)","consecuencias":{"demanda":"*1.20","precio_venta":"*0.94","caja":"-4%"},"feedback_corto":"Proteges el margen, aunque puede que no te acepten esas condiciones"},
   {"letra":"C","texto":"Rechazar y priorizar clientes pequeños con mejor precio","consecuencias":{"reputacion":"+1%"},"feedback_corto":"Más diversificación y mejor margen, con menos volumen y crecimiento más lento"},
   {"letra":"D","texto":"Aceptar solo con una línea de producto dedicada","consecuencias":{"demanda":"*1.25","caja":"-9%","precio_venta":"*0.94"},"feedback_corto":"No mezclas este cliente con el resto, a cambio de una inversión específica y riesgo"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
