-- ============================================================================
-- 042 — Eventos propios de proyectos de ALQUILER Y RENTA de activos
-- Fuente: docs/metodologia/tipos/alquiler-activos.md (seccion 5, situaciones).
--
-- Categoria alquiler (edificio de departamentos, salon de eventos, parqueo,
-- locales, equipos). Idempotente. Aqui "demanda" representa la ocupacion y
-- "precio_venta" la renta que se cobra. Magnitudes: estimaciones a calibrar
-- (seccion 10 de la ficha). El ejemplo de la Ley 1342 de 2020 es un precedente
-- boliviano real, pero aqui se usa como evento hipotetico.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('ALQ001',
 'Tu inquilino principal avisa que no renueva',
 'El inquilino que paga la mayor renta, el local ancla o la empresa que alquilaba todo, avisa que se va. La unidad queda vacía entre 2 y 6 meses hasta conseguir otro, mientras tus gastos fijos (impuestos, servicios, seguro y la cuota de la deuda) no bajan. La renta de lista no es la renta que se cobra.',
 'sectorial', 'curado', 0.12, 4, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.75}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar la renta para llenar rápido","consecuencias":{"precio_venta":"*0.90","demanda":"*1.18"},"feedback_corto":"Se ocupa pronto y se corta la pérdida, pero la renta nueva queda más baja por todo el contrato y reduce el valor del activo"},
   {"letra":"B","texto":"Esperar al inquilino bueno a la renta de lista","consecuencias":{"caja":"-5%","precio_venta":"*1.02"},"feedback_corto":"Proteges la renta y el valor, pero son meses de ingreso cero y la caja puede no alcanzar para la cuota"},
   {"letra":"C","texto":"Acondicionar el espacio (pintura, instalaciones, fachada) y relanzar","consecuencias":{"caja":"-6%","precio_venta":"*1.05","demanda":"*1.08"},"feedback_corto":"Atraes un mejor inquilino y justificas la renta, pero con gasto inmediato, retorno incierto y más meses vacío"},
   {"letra":"D","texto":"Subdividir o cambiar el uso (un local grande en dos)","consecuencias":{"caja":"-8%","demanda":"*1.15","costos":"+3%"},"feedback_corto":"Diversificas el riesgo y puedes subir la renta total, con obra, permisos municipales y más trabajo de administración"}
 ]'::jsonb),

('ALQ002',
 'Un inquilino deja de pagar y el desalojo es lento',
 'Un inquilino deja de pagar. Debes decidir cómo recuperar el inmueble o la plata. En Bolivia el sistema judicial puede ser lento, y hay casos de contratos sin respaldo legal. Recuperar la unidad puede tomar entre 3 y 12 meses y costar entre 1 y 4 meses de renta en gastos legales.',
 'financiero', 'curado', 0.11, 3, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.96}]}'::jsonb,
 '[
   {"letra":"A","texto":"Iniciar de inmediato la demanda de desalojo","consecuencias":{"caja":"-5%","demanda":"*0.92","reputacion":"-2%"},"feedback_corto":"Das una señal firme y es la vía para recuperar la unidad, pero pagas honorarios, esperas meses y no hay renta mientras dura"},
   {"letra":"B","texto":"Negociar un plan de pagos y mantener al inquilino","consecuencias":{"caja":"+2%","demanda":"*1.02"},"feedback_corto":"Puedes recuperar parte de lo adeudado y evitas la vacancia, pero si no cumple pierdes más tiempo y otros inquilinos pueden pedir lo mismo"},
   {"letra":"C","texto":"Ejecutar la garantía o el depósito, si lo hay","consecuencias":{"caja":"+3%","demanda":"*0.97"},"feedback_corto":"Es rápido y barato, pero la garantía suele cubrir 1 a 3 meses, y si el contrato es verbal no hay con qué"},
   {"letra":"D","texto":"Exigir mejor garantía a los futuros inquilinos (depósito mayor, fiador, contrato notariado)","consecuencias":{"demanda":"*0.95","precio_venta":"*1.02","reputacion":"+2%"},"feedback_corto":"Reduces el riesgo futuro, pero se achica el grupo de inquilinos posibles y la unidad tarda más en alquilarse"}
 ]'::jsonb),

('ALQ003',
 'Contratos en dólares y brecha cambiaria',
 'Parte del alquiler está pactada en dólares y parte en bolivianos. Con un dólar oficial sostenido por años y un paralelo muy por encima, cuánto vale un dólar depende de a qué tipo de cambio se pague y se cobre. Tus inquilinos ganan en bolivianos: si la renta está en dólares, su capacidad de pago se aprieta.',
 'macroeconomico', 'curado', 0.10, 5, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Fijar la renta en dólares","consecuencias":{"precio_venta":"*1.10","demanda":"*0.90","reputacion":"-3%"},"feedback_corto":"Proteges el valor real de tu ingreso, pero el inquilino puede no poder pagar y habrá conflictos sobre a qué tipo de cambio se paga"},
   {"letra":"B","texto":"Fijar la renta en bolivianos con ajuste periódico","consecuencias":{"precio_venta":"*1.04","demanda":"*1.03"},"feedback_corto":"Es más fácil de cobrar, pero si el paralelo sube más rápido pierdes poder adquisitivo hasta el próximo ajuste"},
   {"letra":"C","texto":"Contrato mixto (parte en dólares, parte en bolivianos)","consecuencias":{"precio_venta":"*1.06","costos":"+1%"},"feedback_corto":"Repartes el riesgo, pero es más complejo de explicar, de cobrar y de hacer cumplir"},
   {"letra":"D","texto":"No cambiar nada y absorber","consecuencias":{"reputacion":"+2%","precio_venta":"*0.97"},"feedback_corto":"No pierdes inquilinos, pero el valor real de tu ingreso se erosiona sin que nadie lo vea"}
 ]'::jsonb),

('ALQ004',
 'El Estado interviene los alquileres',
 'La autoridad congela las rentas, obliga a reducirlas o prohíbe desalojos por un período. Bolivia ya lo hizo en 2020: la Ley 1342 redujo el canon a la mitad si no había acuerdo entre las partes, congeló los aumentos y prohibió desalojos, con algunos beneficios fiscales al propietario. Un cambio futuro podría tomar otra forma.',
 'sectorial', 'curado', 0.07, 6, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Acordar una rebaja negociada con cada inquilino","consecuencias":{"precio_venta":"*0.92","reputacion":"+5%","demanda":"*1.04"},"feedback_corto":"Quien acuerda puede acceder a beneficios fiscales, pero cobras menos durante el período y casi no puedes recuperarlo"},
   {"letra":"B","texto":"Acatar la norma y esperar","consecuencias":{"precio_venta":"*0.95","reputacion":"+1%"},"feedback_corto":"Evitas conflictos legales, pero sin acuerdo se aplica la reducción automática"},
   {"letra":"C","texto":"Vender el activo antes de que la medida se endurezca","consecuencias":{"caja":"+8%","demanda":"*0.85","reputacion":"-3%"},"feedback_corto":"Sales del riesgo, pero vendes con precio bajo y pierdes el flujo futuro; si todos venden, el precio cae"},
   {"letra":"D","texto":"Cambiar el uso o el tipo de inquilino a una categoría no alcanzada","consecuencias":{"caja":"-6%","precio_venta":"*1.04","demanda":"*0.95"},"feedback_corto":"Puedes evitar el tope, pero con obras, permisos y un mercado distinto"}
 ]'::jsonb),

('ALQ005',
 'Falla grande: filtración, instalación vieja o mantenimiento mayor',
 'Una filtración de techo, una instalación eléctrica o sanitaria vieja, un ascensor o el motor de un equipo exigen una reparación de un monto mucho mayor al mantenimiento corriente: entre 5% y 20% del valor del activo. Si no la haces, el inquilino se queja o se va; si la haces, la caja sufre.',
 'sectorial', 'curado', 0.11, 5, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reparar de inmediato con tu reserva","consecuencias":{"caja":"-10%","demanda":"*1.05","reputacion":"+4%"},"feedback_corto":"Proteges la renta y el valor del activo, pero consumes la caja y, si no había reserva, te quedas sin capital de trabajo"},
   {"letra":"B","texto":"Reparar con un crédito","consecuencias":{"deuda":"+10%","demanda":"*1.05","reputacion":"+3%"},"feedback_corto":"No vacías la caja, pero aumenta la cuota y baja tu cobertura de deuda"},
   {"letra":"C","texto":"Postergar y reparar solo lo urgente","consecuencias":{"caja":"-3%","demanda":"*0.90","reputacion":"-6%"},"feedback_corto":"Ahorras hoy, pero el problema crece, los inquilinos se van o piden descuento y el deterioro se acumula"},
   {"letra":"D","texto":"Subir la renta para financiar una renovación completa","consecuencias":{"caja":"-6%","precio_venta":"*1.08","demanda":"*0.93"},"feedback_corto":"La renovación puede justificar una renta mayor, con riesgo de perder inquilinos durante la obra y de que el mercado no acepte el aumento"}
 ]'::jsonb),

('ALQ006',
 'Te ofrecen comprar el activo: renta o plusvalía',
 'Alguien ofrece comprar tu inmueble a un precio mayor al que habías estimado, entre 10% y 30% más. Debes decidir entre seguir cobrando la renta o realizar la plusvalía. El precio de oferta no es el valor: depende de cuánto pague el comprador por cada boliviano de renta.',
 'oportunidad', 'curado', 0.08, 6, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Vender y reinvertir en otro activo","consecuencias":{"caja":"+15%","demanda":"*0.80","costos":"+2%"},"feedback_corto":"Realizas la ganancia, pero pagas costos de transacción e impuestos y corres el riesgo de no encontrar un activo mejor"},
   {"letra":"B","texto":"Rechazar y seguir con la renta","consecuencias":{"reputacion":"+1%","caja":"+1%"},"feedback_corto":"Mantienes un flujo estable, pero si el mercado se enfría esa oferta puede no volver"},
   {"letra":"C","texto":"Vender parcialmente (una unidad o un porcentaje)","consecuencias":{"caja":"+8%","demanda":"*0.92","costos":"+2%"},"feedback_corto":"Financias mejoras y conservas parte de la renta, con complejidad legal de copropiedad"},
   {"letra":"D","texto":"Pedir un precio mayor y esperar","consecuencias":{"caja":"+2%"},"feedback_corto":"Puedes capturar más valor, pero el comprador puede retirarse"}
 ]'::jsonb),

('ALQ007',
 'Financiarte con anticrético en vez de deuda bancaria',
 'Puedes dar el inmueble en anticrético: recibes de una vez una suma grande y el anticresista usa el inmueble sin pagar alquiler hasta que le devuelvas el dinero. Es una deuda disfrazada de contrato de uso, no un ingreso. Si al vencer no puedes devolver la suma, el anticresista retiene el inmueble.',
 'financiero', 'curado', 0.08, 5, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Dar un inmueble en anticrético y usar el capital en otro activo que rinda más","consecuencias":{"caja":"+12%","deuda":"+12%","demanda":"*0.85"},"feedback_corto":"Obtienes financiamiento sin interés en efectivo, pero renuncias a la renta de ese inmueble y asumes una deuda en dólares a devolver"},
   {"letra":"B","texto":"Mantener el alquiler tradicional","consecuencias":{"reputacion":"+1%"},"feedback_corto":"Tienes flujo mensual y sin deuda, pero no obtienes el capital de golpe"},
   {"letra":"C","texto":"Usar anticrético solo con contrato público e inscrito","consecuencias":{"caja":"+9%","deuda":"+9%","demanda":"*0.88","costos":"+1%"},"feedback_corto":"Seguridad jurídica para ambos, con costo de notario y registro y menos anticresistas dispuestos"},
   {"letra":"D","texto":"Pedir crédito bancario y seguir alquilando","consecuencias":{"deuda":"+10%","caja":"+8%","costos":"+2%"},"feedback_corto":"Conservas la renta, pero la cuota de la deuda se come parte de ella y debes pasar el análisis del banco"}
 ]'::jsonb),

('ALQ008',
 'Vencen contratos: ¿subes la renta o retienes al inquilino?',
 'Vencen varios contratos a la vez y el mercado cambió desde que se firmaron. Los contratos largos hacen que la renta que cobras se desacople de la de mercado. Subir la renta mejora el valor, pero tiene un costo en vacancia y en rotación.',
 'sectorial', 'curado', 0.10, 5, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir al valor de mercado en todos los contratos","consecuencias":{"precio_venta":"*1.12","demanda":"*0.90"},"feedback_corto":"Maximizas el ingreso y el valor, pero puedes perder inquilinos y que la vacancia borre el aumento"},
   {"letra":"B","texto":"Subida moderada con contrato más largo","consecuencias":{"precio_venta":"*1.05","demanda":"*1.03","reputacion":"+2%"},"feedback_corto":"Retienes inquilinos y reduces la vacancia, pero quedas atado a un valor que el mercado puede superar"},
   {"letra":"C","texto":"No subir y priorizar la ocupación plena","consecuencias":{"demanda":"*1.05","reputacion":"+3%"},"feedback_corto":"Caja estable, pero la renta real baja con la inflación y el valor del activo no crece"},
   {"letra":"D","texto":"Indexar la renta a un índice o a una moneda","consecuencias":{"precio_venta":"*1.07","demanda":"*0.95","costos":"+1%"},"feedback_corto":"Te proteges del rezago, pero el inquilino puede rechazarlo y los ajustes por índice generan problemas según el momento"}
 ]'::jsonb),

('ALQ009',
 'Aparece una oferta nueva en tu zona',
 'Se inaugura un edificio nuevo o un centro comercial, o aparecen muchos alquileres de corta estadía. La oferta crece más rápido que la demanda y las rentas presionan a la baja. En Santa Cruz, por ejemplo, los anuncios de alquiler de corta estadía crecieron casi 69% en un año.',
 'comercio', 'curado', 0.10, 6, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.90},{"campo":"precio_venta","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar la renta para igualar a la competencia","consecuencias":{"precio_venta":"*0.92","demanda":"*1.10"},"feedback_corto":"Mantienes la ocupación, pero reduces el ingreso y el valor, y obligas a las demás unidades a bajar también"},
   {"letra":"B","texto":"Diferenciarte (mejor servicio, amoblado, seguridad, estacionamiento)","consecuencias":{"caja":"-5%","costos":"+3%","precio_venta":"*1.04","reputacion":"+5%"},"feedback_corto":"Justificas una renta mayor, con inversión y mayores gastos de operación"},
   {"letra":"C","texto":"Cambiar de segmento (de largo plazo a estadía corta)","consecuencias":{"precio_venta":"*1.12","demanda":"*0.85","costos":"+4%"},"feedback_corto":"Puedes ganar más por noche, pero la ocupación promedio es menor, hay más gestión y rotación"},
   {"letra":"D","texto":"Esperar a que el mercado se corrija","consecuencias":{"demanda":"*0.95","caja":"-2%"},"feedback_corto":"Sin gasto, pero con meses de vacancia"}
 ]'::jsonb),

('ALQ010',
 'Estacionalidad: la caja se quiebra en el mes malo',
 'Si alquilas por noche, por evento o por hora (salón, cancha, parqueo por día), tus ingresos dependen de las temporadas. La ocupación puede oscilar entre 0,6 y 1,4 veces el promedio. La ocupación promedio engaña: la caja se quiebra en el mes malo, no en el promedio.',
 'sectorial', 'curado', 0.10, 3, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.75}]}'::jsonb,
 '[
   {"letra":"A","texto":"Usar tarifas dinámicas (más altas en temporada, más bajas fuera)","consecuencias":{"precio_venta":"*1.05","demanda":"*1.08","costos":"+1%"},"feedback_corto":"Aprovechas la demanda de cada mes, con más gestión y el riesgo de alejar a clientes habituales"},
   {"letra":"B","texto":"Ofrecer contratos mensuales en temporada baja","consecuencias":{"demanda":"*1.20","precio_venta":"*0.90"},"feedback_corto":"Llenas huecos, pero a menor ingreso por día y sin poder vender a temporada alta"},
   {"letra":"C","texto":"Formar una reserva en temporada alta para cubrir la baja","consecuencias":{"caja":"+4%","reputacion":"+1%"},"feedback_corto":"Estabilizas la caja, pero retienes dinero que podrías reinvertir"},
   {"letra":"D","texto":"Diversificar usos (eventos, reuniones, coworking)","consecuencias":{"caja":"-4%","demanda":"*1.12","costos":"+2%"},"feedback_corto":"Dependes menos de una temporada, con más complejidad operativa"}
 ]'::jsonb),

('ALQ011',
 'Sube la cuota de tu deuda o el banco endurece el crédito',
 'Tu proyecto se financió con deuda. La cuota sube por tasa variable o el banco no renueva. El activo es el mismo, pero tu ingreso debe cubrir una cuota mayor. El apalancamiento multiplica el retorno y también el riesgo.',
 'financiero', 'curado', 0.09, 6, ARRAY['tipo:alquiler'],
 '{"variables_afectadas":[{"campo":"deuda","operacion":"multiplicar","valor":1.08}]}'::jsonb,
 '[
   {"letra":"A","texto":"Refinanciar a más plazo","consecuencias":{"caja":"+4%","deuda":"+6%"},"feedback_corto":"Baja la cuota, pero pagas más interés total"},
   {"letra":"B","texto":"Pagar deuda con la venta de una unidad o con tus ahorros","consecuencias":{"deuda":"-12%","caja":"-8%","demanda":"*0.95"},"feedback_corto":"Reduces el riesgo, pero pierdes renta o vacías la caja"},
   {"letra":"C","texto":"Subir las rentas para cubrir la cuota","consecuencias":{"precio_venta":"*1.07","demanda":"*0.93"},"feedback_corto":"Proteges tu cobertura de deuda, con riesgo de vacancia"},
   {"letra":"D","texto":"Aportar más capital propio","consecuencias":{"caja":"+6%","reputacion":"+1%"},"feedback_corto":"Evitas la presión, pero baja el retorno sobre tu capital"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
