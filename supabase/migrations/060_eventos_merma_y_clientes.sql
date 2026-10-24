-- ============================================================================
-- 060 - Eventos de GASTRONOMIA, PRODUCCION, COMERCIO y SERVICIOS con merma y cartera
--
-- El motor ahora lleva, segun el rubro:
--   gastronomia, produccion y comercio: "merma" (frente a la prevista; desperdicio,
--     productos vencidos, robos, rechazos). Sube sola cuando baja la demanda y se
--     normaliza con los meses. "*2" = el doble de merma.
--   servicios: cartera de clientes ("ocupacion"; cambia despacio porque los clientes
--     tienen contratos) e "impagos" (clientes que no pagan una factura).
-- Se marcan con 'tipo:gastronomia', 'tipo:produccion', 'tipo:comercio' y 'tipo:servicios'.
-- Idempotente. Magnitudes a calibrar con casos reales.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('PRD013',
 'Se corta la refrigeracion y se echa a perder el stock',
 'Una falla electrica o del equipo de frio deja sin enfriar la mercaderia durante una noche. Al abrir encuentras producto perdido y no sabes que parte se puede vender.',
 'operativo', 'curado', 0.10, 3, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"merma","operacion":"multiplicar","valor":2.0}]}'::jsonb,
 '[
   {"letra":"A","texto":"Descartar todo lo dudoso y reponer cuanto antes","consecuencias":{"caja":"-4%","merma":"*0.8","reputacion":"+2%"},"feedback_corto":"Cuidas a tus clientes con un gasto alto en el momento"},
   {"letra":"B","texto":"Vender lo que parezca en buen estado con descuento","consecuencias":{"precio_venta":"*0.97","merma":"*0.9","reputacion":"-3%"},"feedback_corto":"Recuperas parte del valor, con riesgo para tu imagen"},
   {"letra":"C","texto":"Reclamar al seguro y al proveedor del equipo","consecuencias":{"caja":"-1%","merma":"*0.95"},"feedback_corto":"Puedes recuperar algo, pero el tramite es lento e incierto"},
   {"letra":"D","texto":"Comprar un generador o un equipo de respaldo","consecuencias":{"caja":"-5%","merma":"*0.85"},"feedback_corto":"Reduces el riesgo futuro con una inversion ahora"}
 ]'::jsonb),

('PRD014',
 'Las compras se desalinearon con las ventas: mercaderia parada',
 'Compraste para un nivel de ventas que no llego. En la bodega quedan productos que rotan lento y algunos se acercan a su fecha de vencimiento.',
 'operativo', 'curado', 0.12, 4, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"merma","operacion":"multiplicar","valor":1.5}]}'::jsonb,
 '[
   {"letra":"A","texto":"Hacer una liquidacion con descuento para rotar el stock","consecuencias":{"precio_venta":"*0.94","merma":"*0.7"},"feedback_corto":"Convertes stock en caja a costa de margen"},
   {"letra":"B","texto":"Armar combos o paquetes con productos de baja rotacion","consecuencias":{"costos":"+1%","merma":"*0.8","demanda":"*1.02"},"feedback_corto":"Mueves el stock con un poco de trabajo creativo"},
   {"letra":"C","texto":"Devolver parte al proveedor, aceptando una comision","consecuencias":{"caja":"-2%","merma":"*0.85"},"feedback_corto":"Limitas la perdida, con un costo por devolver"},
   {"letra":"D","texto":"Esperar a que se venda de a poco","consecuencias":{"merma":"*1.2"},"feedback_corto":"No haces nada y el stock se sigue envejeciendo"}
 ]'::jsonb),

('PRD015',
 'Aumentan los robos y las perdidas de mercaderia',
 'En los ultimos meses el inventario no cuadra. Pueden ser robos de clientes, de empleados o errores de registro, y no sabes cual es la causa.',
 'operativo', 'curado', 0.10, 4, ARRAY['tipo:gastronomia','tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"robos","operacion":"multiplicar","valor":1.6}]}'::jsonb,
 '[
   {"letra":"A","texto":"Instalar camaras y un control de inventario por conteos","consecuencias":{"caja":"-3%","merma":"*0.65","reputacion":"+1%"},"feedback_corto":"Reduces las perdidas con una inversion y mas control"},
   {"letra":"B","texto":"Hacer una auditoria externa del inventario","consecuencias":{"caja":"-2%","merma":"*0.8"},"feedback_corto":"Sabes donde esta el problema, antes de resolverlo"},
   {"letra":"C","texto":"Cambiar procedimientos y capacitar al personal","consecuencias":{"costos":"+1%","merma":"*0.85","reputacion":"+2%"},"feedback_corto":"Atacas la causa con tiempo y cultura de equipo"},
   {"letra":"D","texto":"Asumir la perdida como parte del negocio","consecuencias":{"merma":"*1.15"},"feedback_corto":"No gastas ahora, pero el problema crece"}
 ]'::jsonb),

('PRD016',
 'Un lote sale con defectos y los clientes lo devuelven',
 'Un lote de produccion o una partida de mercaderia llega con defectos. Varios clientes devuelven el producto o piden reposicion.',
 'calidad', 'curado', 0.10, 4, ARRAY['tipo:produccion','tipo:comercio'],
 '{"variables_afectadas":[{"campo":"merma","operacion":"multiplicar","valor":1.5},{"campo":"reputacion","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Retirar todo el lote y reponer sin costo al cliente","consecuencias":{"caja":"-4%","reputacion":"+4%","merma":"*0.8"},"feedback_corto":"Cuidas la confianza con un golpe fuerte a la caja"},
   {"letra":"B","texto":"Reponer solo a quienes reclamen","consecuencias":{"caja":"-1%","reputacion":"-2%"},"feedback_corto":"Gastas menos, pero parte de los clientes se queda con el problema"},
   {"letra":"C","texto":"Reclamar al proveedor o revisar el proceso productivo","consecuencias":{"caja":"-1%","merma":"*0.9","costos":"+1%"},"feedback_corto":"Buscas la causa para que no se repita, sin resultado inmediato"},
   {"letra":"D","texto":"Vender el lote defectuoso a menor precio por otro canal","consecuencias":{"precio_venta":"*0.97","reputacion":"-3%"},"feedback_corto":"Recuperas algo, con riesgo para tu marca"}
 ]'::jsonb),

('SRV008',
 'Tu cliente mas grande no renueva el contrato',
 'El cliente que representaba una parte importante de tu facturacion decide no renovar. No es un mal mes: es un hueco que se queda.',
 'riesgo', 'curado', 0.10, 4, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"ocupacion","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Salir a vender a varios clientes medianos para diversificar","consecuencias":{"costos_comercializacion":"+6%","ocupacion":"+6%"},"feedback_corto":"Reduces la dependencia, con esfuerzo comercial y tiempo"},
   {"letra":"B","texto":"Ofrecerle mejores condiciones para que se quede","consecuencias":{"precio_venta":"*0.94","ocupacion":"+5%"},"feedback_corto":"Puedes retenerlo, a un precio menor y con la misma dependencia"},
   {"letra":"C","texto":"Reducir tu estructura al tamano que te queda","consecuencias":{"costos":"-6%","reputacion":"-3%"},"feedback_corto":"Cuidas la caja, achicando el negocio"},
   {"letra":"D","texto":"Lanzar un nuevo servicio para tus clientes actuales","consecuencias":{"costos":"+4%","ocupacion":"+4%","reputacion":"+2%"},"feedback_corto":"Buscas ingresos nuevos con inversion e incertidumbre"}
 ]'::jsonb),

('SRV009',
 'Un cliente importante se atrasa meses en pagar tus facturas',
 'Un cliente empresa se atrasa tres meses con tus facturas, por problemas de caja de su lado. Tu equipo sigue trabajando para el y tienes que pagar sueldos.',
 'financiero', 'curado', 0.12, 4, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"impagos","operacion":"multiplicar","valor":2.2}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pausar el trabajo hasta que pague","consecuencias":{"impagos":"*0.7","ocupacion":"-4%"},"feedback_corto":"Presionas con firmeza, arriesgando la relacion"},
   {"letra":"B","texto":"Acordar un plan de pagos con garantias","consecuencias":{"impagos":"*0.75","costos":"+1%"},"feedback_corto":"Recuperas de a poco, cuidando al cliente"},
   {"letra":"C","texto":"Descontar la factura con un banco o factoring","consecuencias":{"impagos":"*0.8","caja":"-2%"},"feedback_corto":"Cobras ya a cambio de una comision"},
   {"letra":"D","texto":"Seguir trabajando confiando en que pagara","consecuencias":{"impagos":"*1.15"},"feedback_corto":"Evitas el conflicto y aumentas la exposicion"}
 ]'::jsonb),

('SRV010',
 'Un empleado clave renuncia y se lleva clientes',
 'La persona que mantenia la relacion con varios de tus clientes renuncia para trabajar por su cuenta, y algunos clientes lo siguen.',
 'operativo', 'curado', 0.08, 5, ARRAY['tipo:servicios'],
 '{"variables_afectadas":[{"campo":"ocupacion","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Hablar de inmediato con los clientes en riesgo","consecuencias":{"costos":"+2%","ocupacion":"+4%","reputacion":"+2%"},"feedback_corto":"Reafirmas la relacion con la empresa, no con una sola persona"},
   {"letra":"B","texto":"Hacer una clausula de no competencia y reclamar legalmente","consecuencias":{"caja":"-2%","reputacion":"-2%","ocupacion":"+2%"},"feedback_corto":"Proteges tu cartera con un conflicto abierto"},
   {"letra":"C","texto":"Contratar rapidamente un reemplazo con experiencia","consecuencias":{"costos":"+4%","ocupacion":"+3%"},"feedback_corto":"Recuperas capacidad, con un costo fijo mayor"},
   {"letra":"D","texto":"Aceptar la perdida y reordenar el equipo","consecuencias":{"costos":"-2%","ocupacion":"-3%"},"feedback_corto":"Ahorras, pero tu cartera queda mas chica"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
