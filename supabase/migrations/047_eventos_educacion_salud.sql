-- ============================================================================
-- 047 — Eventos de EDUCACION y SALUD publicas para proyectos SOCIALES
-- Fuentes: docs/metodologia/tipos/educacion-publica.md y salud-publica.md
-- (seccion 5, situaciones).
--
-- Complementa la 040 (social y ONG). La categoria social incluye una posta
-- de salud, una capacitacion tecnica y agua potable rural, por eso solo se
-- usaron situaciones que valen para cualquiera de los tres: comunidad
-- reticente, personal clave que se va, ultima milla bloqueada, equipo sin
-- mantenimiento, duplicacion con un programa estatal, dato de cobertura que
-- no cuadra, medir actividades o impacto y sumar un componente.
-- Idempotente. Aqui "demanda" es la cobertura o los beneficiarios atendidos.
-- Magnitudes: estimaciones a calibrar (seccion 10 de las fichas).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('SOC012',
 'Parte de la comunidad desconfía del servicio',
 'En una parte de la zona hay desconfianza: rumores, razones religiosas o barrera de idioma. En el brote de sarampión de 2025 en Bolivia, la mayoría de las familias reticentes terminó aceptando tras visitas repetidas con traductores y líderes comunitarios, pero no todas. El último 10% de cobertura es el más caro por persona, y es donde se define si el servicio realmente llega.',
 'sectorial', 'curado', 0.10, 4, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en diálogo: traductores, líderes y visitas casa por casa","consecuencias":{"caja":"-6%","costos":"+3%","demanda":"*1.12","reputacion":"+4%"},"feedback_corto":"Es lo que funcionó en brotes recientes y sube la confianza futura, pero es caro por persona y lento"},
   {"letra":"B","texto":"Concentrarte en las zonas receptivas y dejar la reticente para después","consecuencias":{"costos":"-3%","demanda":"*1.04","reputacion":"-3%"},"feedback_corto":"Bajas el costo por persona atendida, pero queda una bolsa sin cubrir donde luego aparece el problema"},
   {"letra":"C","texto":"Lanzar una campaña masiva de comunicación en medios","consecuencias":{"caja":"-4%","demanda":"*1.04"},"feedback_corto":"Llegas a mucha gente con bajo costo por contacto, pero contacto no es cambio de conducta y puede no mover al segmento duro"},
   {"letra":"D","texto":"Exigir el servicio como requisito para otros trámites","consecuencias":{"demanda":"*1.10","reputacion":"-6%"},"feedback_corto":"Sube la cobertura rápido, pero puede generar rechazo, exclusión y conflicto con la comunidad"}
 ]'::jsonb),

('SOC013',
 'El profesional o técnico clave se va y el puesto queda vacío',
 'La persona destinada al servicio en la zona rural, sea el médico, el instructor o el operador técnico, se va por una mejor oferta, por aislamiento o por falta de vivienda, y el puesto queda vacío varios meses. La atención puede caer entre 30% y 70% en ese punto. El personal es un insumo crítico y escaso, y los incentivos pagan hoy pero solo se sostienen con presupuesto recurrente.',
 'laboral', 'curado', 0.10, 4, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ofrecer incentivos (bono de zona, vivienda, transporte)","consecuencias":{"costos":"+5%","demanda":"*1.10","reputacion":"+2%"},"feedback_corto":"Aumentas la probabilidad de cubrir y retener, pero suben los costos recurrentes y crea desigualdad con otras zonas"},
   {"letra":"B","texto":"Cubrir con una brigada móvil desde el centro más cercano","consecuencias":{"costos":"+4%","demanda":"*1.04","reputacion":"-1%"},"feedback_corto":"No se interrumpe del todo el servicio, con menor frecuencia, mayor costo por atención y desgaste del equipo"},
   {"letra":"C","texto":"Capacitar a un promotor comunitario para tareas básicas","consecuencias":{"caja":"-2%","demanda":"*1.06","reputacion":"-2%"},"feedback_corto":"Tienes presencia local permanente y barata, pero limita lo que se puede resolver y hay riesgo de error y sobrecarga"},
   {"letra":"D","texto":"Esperar a que la autoridad designe un reemplazo","consecuencias":{"demanda":"*0.92","reputacion":"-4%"},"feedback_corto":"No cuesta nada extra, pero el tiempo es incierto, la cobertura cae y la comunidad pierde confianza"}
 ]'::jsonb),

('SOC014',
 'Un derrumbe o bloqueo corta el camino a las comunidades más alejadas',
 'La brigada o el equipo no puede llegar a las comunidades altas o del oriente por derrumbes, bloqueos o crecida de ríos. Muchas comunidades de difícil acceso quedan sin cubrir, y cada punto adicional de cobertura en zonas aisladas cuesta entre 2 y 5 veces más. Hay que decidir explícitamente a quién no se llega.',
 'logistico', 'curado', 0.10, 3, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.90},{"campo":"costos_logistica","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Esperar a que se abra el camino","consecuencias":{"demanda":"*0.94","reputacion":"-2%"},"feedback_corto":"No gastas extra, pero se pierde la ventana de atención y los indicadores se atrasan"},
   {"letra":"B","texto":"Usar un medio alternativo (lancha, mula, avioneta)","consecuencias":{"caja":"-7%","demanda":"*1.08","reputacion":"+3%"},"feedback_corto":"Cumples la meta, con un costo por persona muy alto"},
   {"letra":"C","texto":"Dejar insumos y capacitar a un promotor local","consecuencias":{"costos":"-2%","demanda":"*1.04","reputacion":"-1%"},"feedback_corto":"Dejas presencia permanente y barata, con calidad variable si no se supervisa"},
   {"letra":"D","texto":"Concentrar a la gente en un punto accesible","consecuencias":{"costos":"-3%","demanda":"*0.95","reputacion":"-3%"},"feedback_corto":"Sale más barato, pero la gente camina horas, baja la asistencia y los más vulnerables no llegan"}
 ]'::jsonb),

('SOC015',
 'El equipo que entregaste queda parado sin mantenimiento',
 'A los pocos meses, equipos, bombas o máquinas del proyecto están guardados o dañados por falta de mantenimiento, de repuestos, de conexión o de un técnico. En Bolivia hubo casos de computadoras entregadas a colegios que quedaron guardadas y obsoletas. Un activo físico no es un resultado: la inversión inicial es la parte chica y hay que contar quién paga el costo de operar.',
 'operativo', 'curado', 0.10, 5, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar un técnico y los repuestos con presupuesto del proyecto","consecuencias":{"caja":"-5%","costos":"+3%","demanda":"*1.14"},"feedback_corto":"El equipo vuelve a funcionar y el impacto es posible, pero crece el gasto recurrente y, al terminar el proyecto, nadie lo asume"},
   {"letra":"B","texto":"Pedir al municipio o a la comunidad que asuman el mantenimiento","consecuencias":{"demanda":"*1.05","reputacion":"-2%"},"feedback_corto":"Lo deja sostenible si acepta, pero depende de su voluntad y de su presupuesto, y el pedido puede no prosperar"},
   {"letra":"C","texto":"Rediseñar el servicio para que funcione con menos dependencia del equipo","consecuencias":{"costos":"+2%","demanda":"*1.06"},"feedback_corto":"Reduces la dependencia, con menos recursos modernos y más trabajo de preparación, sin resolver el mantenimiento"},
   {"letra":"D","texto":"Centralizar los equipos en un solo punto por zona","consecuencias":{"costos":"-3%","demanda":"*0.95","reputacion":"-2%"},"feedback_corto":"Hay menos puntos que mantener, pero algunos beneficiarios viajan más y los aislados quedan sin acceso"}
 ]'::jsonb),

('SOC016',
 'Un programa del Estado llega al mismo grupo con un servicio parecido',
 'A los pocos meses de iniciar tu proyecto, un programa nacional llega al mismo grupo con un servicio similar. El beneficio de un proyecto es lo que cambia respecto de lo que habría pasado igual: si otros ya cubrían a parte de tu población objetivo, tu efecto neto baja entre 10% y 40%, y el costo por beneficiario sube.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.82}]}'::jsonb,
 '[
   {"letra":"A","texto":"Coordinar con el programa estatal y repartirse zonas","consecuencias":{"costos":"+2%","demanda":"*1.12","reputacion":"+3%"},"feedback_corto":"Evitas la duplicación y se llega a más gente en total, con tiempo de coordinación y menos visibilidad para tu proyecto"},
   {"letra":"B","texto":"Seguir como estaba y competir","consecuencias":{"costos":"+4%","reputacion":"-4%"},"feedback_corto":"Mantienes tus metas de cobertura, pero duplicas gastos y confundes a la comunidad, con efecto neto menor"},
   {"letra":"C","texto":"Reorientarte a un grupo o componente que nadie cubre","consecuencias":{"costos":"+3%","demanda":"*1.15","reputacion":"+2%"},"feedback_corto":"Complementas en vez de competir y mejoras el efecto neto, pero hay que reformular la meta"},
   {"letra":"D","texto":"Cerrar el componente duplicado y traspasar al equipo","consecuencias":{"costos":"-6%","demanda":"*0.90","reputacion":"-3%"},"feedback_corto":"Liberas recursos, con reubicaciones o despidos y la pérdida de lo construido"}
 ]'::jsonb),

('SOC017',
 'El dato de cobertura no cuadra',
 'Tus registros muestran más personas atendidas que las que figuran en el padrón de la población objetivo, por repetición de atenciones o registros defectuosos. Hay que decidir qué cifra reportar al financiador. Los indicadores de cobertura solo valen si el registro y el denominador son confiables.',
 'financiero', 'curado', 0.08, 6, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.97}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reportar la cifra corregida, más baja","consecuencias":{"caja":"-3%","reputacion":"+5%"},"feedback_corto":"Ganas transparencia y credibilidad, aunque el avance se ve menor y puede recortarse el próximo desembolso"},
   {"letra":"B","texto":"Reportar la cifra alta y corregir internamente","consecuencias":{"caja":"+2%","reputacion":"-8%"},"feedback_corto":"Cumples la meta, pero tomas decisiones con datos falsos y arriesgas el convenio si se detecta"},
   {"letra":"C","texto":"Invertir en un padrón nominal y verificación por muestreo","consecuencias":{"caja":"-4%","costos":"+2%","reputacion":"+4%"},"feedback_corto":"Corriges de raíz y mejoras las decisiones futuras, con dinero y tiempo que no estaban en el plan"},
   {"letra":"D","texto":"Pedir al financiador que flexibilice la meta mientras se corrige","consecuencias":{"reputacion":"+1%","demanda":"*0.97"},"feedback_corto":"Eres transparente y evitas presión, pero depende de la voluntad del financiador"}
 ]'::jsonb),

('SOC018',
 'El financiador pide un informe: actividades o impacto',
 'Para el informe del año 3 tienes buenos números de actividad, pero medir el impacto real exige una línea de base y un grupo de comparación. Evaluar cuesta entre 3% y 10% del presupuesto de un año y puede mostrar menos impacto del esperado. Sin contrafactual, el impacto es una opinión; sin evaluación, no puedes cambiar de rumbo.',
 'financiero', 'curado', 0.09, 6, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.97}]}'::jsonb,
 '[
   {"letra":"A","texto":"Hacer una evaluación de impacto con grupo de comparación","consecuencias":{"caja":"-6%","reputacion":"+5%"},"feedback_corto":"Obtienes un resultado creíble y base para pedir fondos, pero es caro, lento y puede mostrar un efecto pequeño"},
   {"letra":"B","texto":"Reportar solo actividades y cobertura","consecuencias":{"caja":"+1%","reputacion":"-4%"},"feedback_corto":"Es barato y cumple formalmente, pero no sabes si funciona y puedes descubrirlo tarde"},
   {"letra":"C","texto":"Medir un indicador de resultado simple con registros existentes","consecuencias":{"caja":"-2%","reputacion":"+2%"},"feedback_corto":"Es un compromiso entre costo y rigor, pero sin comparación otros factores pueden explicar el cambio"},
   {"letra":"D","texto":"Pedir asistencia técnica a una universidad","consecuencias":{"caja":"-3%","reputacion":"+4%","costos":"+1%"},"feedback_corto":"Ganas rigor a menor costo, con plazos académicos y menos control"}
 ]'::jsonb),

('SOC019',
 'Oportunidad: sumar un componente a tu paquete de servicios',
 'Con tu plataforma ya instalada (personal, transporte, logística) puedes sumar otro servicio. El costo marginal de agregar un componente puede ser mucho menor que su costo como programa independiente, y el análisis incremental responde a la pregunta de si conviene agregarlo. A cambio, tu equipo puede saturarse y bajar la calidad del servicio original.',
 'oportunidad', 'curado', 0.09, 6, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Sumar el componente completo de inmediato","consecuencias":{"costos":"+4%","demanda":"*1.15","reputacion":"-2%"},"feedback_corto":"Aprovechas mejor la estructura que ya pagas, pero el personal se sobrecarga y puede bajar la calidad del servicio original"},
   {"letra":"B","texto":"Hacer una prueba piloto en una zona","consecuencias":{"caja":"-2%","demanda":"*1.06","reputacion":"+2%"},"feedback_corto":"Aprendes sin arriesgar todo, aunque es más lento y el beneficio llega más tarde"},
   {"letra":"C","texto":"No sumar nada y mantener el foco en la meta original","consecuencias":{"costos":"-1%","reputacion":"+2%"},"feedback_corto":"Proteges la calidad, pero desperdicias capacidad instalada y el costo por beneficio queda más alto a largo plazo"},
   {"letra":"D","texto":"Subcontratar el componente a otra organización","consecuencias":{"caja":"-4%","demanda":"*1.08"},"feedback_corto":"No sobrecargas a tu equipo, pero pierdes control y coordinación, y el costo marginal es mayor"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
