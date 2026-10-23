-- ============================================================================
-- 048 — Eventos propios de proyectos de SALUD PRIVADA (clinicas y centros)
-- Fuente: docs/metodologia/tipos/salud-privada.md (seccion 5, situaciones).
--
-- Categoria salud_privada (clinica privada con consultorios, laboratorio,
-- imagenologia e internacion). Idempotente. Aqui "demanda" representa las
-- atenciones (consultas, estudios, dias-cama) y "precio_venta" la tarifa
-- media por atencion. Magnitudes: estimaciones a calibrar (seccion 10 de la
-- ficha). Los casos reales (deuda del Ministerio de Salud con centros
-- privados, dolar flexible 2025-2026) se usan como precedentes.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('SAL001',
 'La caja de salud o el Estado se atrasa en el pago',
 'Una parte importante de tus pacientes llega por convenio con una caja de salud o un programa del Estado. Atiendes y facturas, pero el pago llega meses después, a veces en cuotas, y los expedientes se devuelven por errores de documentación. En Bolivia el Ministerio de Salud reconoció en 2026 una deuda de Bs 500 millones con centros públicos y privados, con denuncias de hasta 10 meses de impago. Ingreso no es caja: tú pagas sueldos e insumos hoy.',
 'financiero', 'curado', 0.12, 3, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Seguir atendiendo al pagador y financiarte con crédito bancario","consecuencias":{"deuda":"+8%","caja":"+7%"},"feedback_corto":"Mantienes volumen y vínculo, pero pagas intereses y, si el atraso se prolonga, el crédito se agota"},
   {"letra":"B","texto":"Reducir cupos o dejar de atender al pagador atrasado","consecuencias":{"demanda":"*0.88","caja":"+3%"},"feedback_corto":"Dejas de acumular cartera dudosa, pero pierdes pacientes y ocupación mientras el costo fijo sigue"},
   {"letra":"C","texto":"Invertir en facturación y cumplimiento documental","consecuencias":{"costos":"+3%","caja":"+3%","reputacion":"+1%"},"feedback_corto":"Bajan los expedientes devueltos, con un gasto fijo adicional que no elimina el atraso de fondo"},
   {"letra":"D","texto":"Dar prioridad a pacientes de bolsillo y aseguradora privada","consecuencias":{"demanda":"*0.93","caja":"+4%","precio_venta":"*1.02"},"feedback_corto":"Cobras rápido y cuidas la caja, pero renuncias a volumen y la capacidad ociosa pesa en el margen"}
 ]'::jsonb),

('SAL002',
 'Una aseguradora te propone una tarifa menor a cambio de volumen',
 'Una aseguradora o comercializadora de planes de salud te ofrece mantenerte en su red a una tarifa menor, o más pacientes a cambio de bajar el precio. Tiene poder de negociación porque concentra buena parte de los ingresos del sector. Las atenciones pueden subir entre 10% y 30%, pero la tarifa media baja entre 10% y 25%.',
 'comercio', 'curado', 0.10, 4, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.15},{"campo":"precio_venta","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar la tarifa menor por el volumen","consecuencias":{"precio_venta":"*0.92","demanda":"*1.12"},"feedback_corto":"Llenas capacidad ociosa, pero baja el margen por atención y, si suben los insumos, puedes atender con pérdida"},
   {"letra":"B","texto":"Negociar una tarifa por paquete a precio cerrado","consecuencias":{"precio_venta":"*0.97","demanda":"*1.08","costos":"+2%"},"feedback_corto":"Ganas previsibilidad, pero asumes el riesgo de complicaciones que cuestan más que el paquete"},
   {"letra":"C","texto":"Rechazar y concentrarte en pacientes de bolsillo","consecuencias":{"demanda":"*0.95","precio_venta":"*1.02","caja":"+2%"},"feedback_corto":"Mantienes tarifa y cobro inmediato, pero pierdes volumen y queda capacidad vacía"},
   {"letra":"D","texto":"Aceptar solo con pago a 30 días y ajuste por tipo de cambio","consecuencias":{"demanda":"*1.04","caja":"+3%","reputacion":"+1%"},"feedback_corto":"Proteges caja y margen, pero la aseguradora puede preferir a otra clínica"}
 ]'::jsonb),

('SAL003',
 'Dólar flexible: medicamentos e insumos importados se encarecen',
 'Medicamentos, descartables, reactivos y repuestos se importan en gran parte. En 2025 el Colegio Médico advirtió que algunos fármacos subieron entre 100% y 150%, y las industrias farmacéuticas alertaron que el alza llegaría a los precios en semanas. Tus tarifas se cobran en bolivianos y las pactadas con cajas y aseguradoras no se mueven. El costo de insumos de la clínica puede subir entre 15% y 60%.',
 'macroeconomico', 'curado', 0.11, 4, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.20}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir las tarifas al paciente de bolsillo","consecuencias":{"precio_venta":"*1.06","demanda":"*0.95","reputacion":"-2%"},"feedback_corto":"Proteges el margen, pero baja la demanda y el boca a boca, y las tarifas pactadas con cajas no se mueven"},
   {"letra":"B","texto":"Comprar stock grande de insumos por adelantado","consecuencias":{"caja":"-6%","costos":"-4%"},"feedback_corto":"Cubres meses a precio viejo, pero inmovilizas caja y hay riesgo de vencimiento"},
   {"letra":"C","texto":"Cambiar a proveedores nacionales o genéricos","consecuencias":{"costos":"-5%","reputacion":"-3%"},"feedback_corto":"Pagas en bolivianos, con menos variedad y la resistencia de médicos que prefieren su marca"},
   {"letra":"D","texto":"Absorber el costo y esperar que baje","consecuencias":{"costos":"+4%","reputacion":"+1%"},"feedback_corto":"No pierdes pacientes, pero el margen se erosiona y, si dura, atiendes con pérdida"}
 ]'::jsonb),

('SAL004',
 'Oportunidad: un proveedor te ofrece un equipo de alto costo',
 'Un proveedor te ofrece un tomógrafo o un laboratorio automatizado. Atrae pacientes y médicos, pero su rentabilidad depende de cuántos estudios se hagan por mes. En el sector hay una tendencia a tercerizar laboratorio e imagenología. Es una apuesta sobre la demanda futura: debajo del punto de equilibrio pierdes dinero cada mes.',
 'oportunidad', 'curado', 0.09, 6, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":1.03}]}'::jsonb,
 '[
   {"letra":"A","texto":"Comprar el equipo nuevo","consecuencias":{"deuda":"+14%","demanda":"*1.12","reputacion":"+3%"},"feedback_corto":"Ganas control, margen completo y diferenciación, pero con deuda alta y pérdidas si la utilización queda bajo el equilibrio"},
   {"letra":"B","texto":"Comprarlo usado o reacondicionado","consecuencias":{"deuda":"+7%","demanda":"*1.07","costos":"+3%"},"feedback_corto":"Invertís menos, con más paradas por falla y menor vida útil"},
   {"letra":"C","texto":"Aliarte con un centro de imagen que opere dentro de tu clínica","consecuencias":{"demanda":"*1.05","precio_venta":"*0.98"},"feedback_corto":"Sin inversión, pero cedes margen y dependes del socio"},
   {"letra":"D","texto":"Tercerizar los estudios y cobrar solo consulta y seguimiento","consecuencias":{"costos":"-2%","demanda":"*0.97"},"feedback_corto":"No inmovilizas capital, pero el paciente puede quedarse con el centro de imagen y pierdes ingresos accesorios"}
 ]'::jsonb),

('SAL005',
 'Un médico clave se va o pide más honorarios',
 'Un especialista que trae muchos pacientes amenaza con irse a otra clínica, abrir su consultorio o pedir un porcentaje mayor. En el modelo de clínica donde los médicos son externos, ellos generan la venta del servicio. Si se va, entre 5% y 25% de tus atenciones puede irse con él. Pocas clínicas tienen especialistas de planta.',
 'laboral', 'curado', 0.10, 4, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar su pedido de honorarios mayores","consecuencias":{"costos":"+4%","demanda":"*1.06","reputacion":"+1%"},"feedback_corto":"Lo retienes, pero baja el margen y otros médicos pedirán lo mismo"},
   {"letra":"B","texto":"Ofrecerle exclusividad con sueldo fijo","consecuencias":{"costos":"+5%","demanda":"*1.08"},"feedback_corto":"Cierras el riesgo de que se vaya, pero pagas aunque no haya pacientes y asumes costo fijo"},
   {"letra":"C","texto":"Dejarlo ir y reemplazarlo con dos médicos de menor trayectoria","consecuencias":{"costos":"-2%","reputacion":"-4%","demanda":"*0.90"},"feedback_corto":"Reduces dependencia, pero baja la reputación y se van los pacientes que lo seguían"},
   {"letra":"D","texto":"Darle participación en las ganancias de su unidad","consecuencias":{"precio_venta":"*0.99","demanda":"*1.07","reputacion":"+2%"},"feedback_corto":"Alineas incentivos, pero cedes ingreso futuro y complicas la contabilidad"}
 ]'::jsonb),

('SAL006',
 'Inspección del SEDES: observaciones a tu habilitación',
 'El SEDES supervisa que cada centro cumpla los requisitos de su especialidad y exige renovar la resolución de funcionamiento cada año. Se han hallado quirófanos precarios, falta de centrales de esterilización y servicios clausurados. Una observación te obliga a invertir entre 3% y 10% de la inversión inicial, o a cerrar un servicio entre 1 y 3 meses.',
 'sectorial', 'curado', 0.09, 5, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"costos","operacion":"multiplicar","valor":1.04}]}'::jsonb,
 '[
   {"letra":"A","texto":"Adecuar de inmediato todo lo observado","consecuencias":{"caja":"-8%","reputacion":"+4%"},"feedback_corto":"Cumples y reduces el riesgo futuro, con un gasto grande de una vez y posible pausa de servicios"},
   {"letra":"B","texto":"Priorizar lo exigido y programar el resto","consecuencias":{"caja":"-4%","reputacion":"+1%"},"feedback_corto":"Repartes el gasto, pero lo demás queda como pasivo y puede ser observado otra vez"},
   {"letra":"C","texto":"Contratar un consultor de habilitación","consecuencias":{"costos":"+3%","reputacion":"+3%","caja":"-2%"},"feedback_corto":"Hay menos errores y plazos más cortos, con honorarios fijos"},
   {"letra":"D","texto":"Operar con observaciones pendientes esperando que no haya otra inspección","consecuencias":{"costos":"-1%","reputacion":"-8%","demanda":"*0.93"},"feedback_corto":"Ahorras hoy, pero arriesgas clausura y ser noticia: es la conducta que genera el problema"}
 ]'::jsonb),

('SAL007',
 'Denuncia por mala praxis y auditoría médica',
 'Un paciente o su familia denuncia que una complicación fue negligencia. La Ley 3131 del Ejercicio Profesional Médico prevé una auditoría médica para emitir un dictamen independiente sobre el acto médico. Bolivia no tiene un tipo penal específico de mala praxis, así que se usan figuras genéricas. La documentación clínica es protección económica, y el daño de reputación puede pesar más que la indemnización.',
 'sectorial', 'curado', 0.07, 6, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cooperar con la auditoría y documentar todo","consecuencias":{"costos":"+3%","reputacion":"+3%"},"feedback_corto":"Si el acto fue correcto, la historia clínica te protege, pero toma tiempo y, si hubo falla, queda expuesta"},
   {"letra":"B","texto":"Ofrecer una compensación económica rápida para cerrar el caso","consecuencias":{"caja":"-5%","reputacion":"+1%"},"feedback_corto":"Evitas publicidad y juicio largo, pero puede leerse como admisión y atraer otros reclamos"},
   {"letra":"C","texto":"Contratar un seguro de responsabilidad profesional","consecuencias":{"costos":"+3%","caja":"+2%","reputacion":"+2%"},"feedback_corto":"Transfieres parte del riesgo, con una prima recurrente"},
   {"letra":"D","texto":"Defenderte en juicio y comunicar que actuaste según protocolo","consecuencias":{"caja":"-4%","reputacion":"-3%","demanda":"*0.95"},"feedback_corto":"Proteges a tu equipo, pero son gastos legales largos y exposición mediática"}
 ]'::jsonb),

('SAL008',
 'Un paciente sin seguro no puede pagar su internación',
 'Un paciente sin seguro termina una internación o cirugía y no puede pagar. La tentación es retenerlo, pero la jurisprudencia constitucional establece que la libertad de una persona no puede depender del pago de una deuda y que debes cobrar por vías legales. Entre 1% y 5% del ingreso de pacientes de bolsillo puede quedar incobrable. La liquidez se protege antes de prestar el servicio, no después.',
 'financiero', 'curado', 0.11, 3, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.97}]}'::jsonb,
 '[
   {"letra":"A","texto":"Exigir garantía o depósito antes de internar, salvo urgencias","consecuencias":{"caja":"+3%","demanda":"*0.95","reputacion":"-2%"},"feedback_corto":"Reduces incobrables, pero algunos pacientes se van a otra clínica y recibes críticas"},
   {"letra":"B","texto":"Plan de pagos a cuotas con pagaré","consecuencias":{"caja":"-1%","reputacion":"+2%"},"feedback_corto":"Recuperas la mayor parte con el tiempo, con demora de caja, administración e incumplimientos"},
   {"letra":"C","texto":"Crear un fondo de descuentos y contratar un trabajador social","consecuencias":{"costos":"+2%","reputacion":"+4%"},"feedback_corto":"Bajan los conflictos y mejora la imagen, con gasto fijo e ingreso no cobrado"},
   {"letra":"D","texto":"Demandar por la vía legal","consecuencias":{"caja":"-3%","reputacion":"-3%"},"feedback_corto":"Te amparas en la ley, pero es lento, caro, con baja probabilidad de cobrar y mala imagen"}
 ]'::jsonb),

('SAL009',
 'Pacientes que no llegan a su cita: turnos vacíos',
 'Entre 10% y 25% de los pacientes agendados no llega. Cada turno vacío es ingreso perdido para siempre. Un estudio de una sala de endoscopía con 18% de no-show estimó pérdidas de 16% del beneficio diario. Hay un dilema entre aprovechar la capacidad con sobreagendamiento y cuidar la experiencia del paciente.',
 'operativo', 'curado', 0.11, 3, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Sobreagendar un poco, por ejemplo 10% más de citas","consecuencias":{"demanda":"*1.08","reputacion":"-3%"},"feedback_corto":"Es más barato que reducir el no-show, pero cuando todos llegan hay esperas largas y médicos sobrecargados"},
   {"letra":"B","texto":"Recordatorios por mensaje y confirmación previa","consecuencias":{"costos":"+1%","demanda":"*1.04","reputacion":"+1%"},"feedback_corto":"Baja el no-show sin aumentar esperas, a cambio de un costo de mensajería o personal y una recuperación modesta"},
   {"letra":"C","texto":"Cobrar un anticipo o seña por la cita","consecuencias":{"caja":"+3%","demanda":"*0.95"},"feedback_corto":"Comprometes al paciente, pero puede espantar a los nuevos y añade fricción de cobro"},
   {"letra":"D","texto":"No hacer nada y absorber el hueco","consecuencias":{"demanda":"*0.97"},"feedback_corto":"Es simple y sin costo, pero pierdes capacidad cada día"}
 ]'::jsonb),

('SAL010',
 'Pico estacional de demanda: infecciones respiratorias y brotes',
 'En los meses fríos o ante un brote, la demanda de consultas y laboratorio sube entre 20% y 50% durante 1 a 3 meses. Para una clínica privada puede ser una oportunidad o un problema: falta de personal e insumos, esperas largas y calidad percibida que baja. Hay que dimensionar la capacidad entre el promedio y el pico.',
 'sectorial', 'curado', 0.10, 3, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.20}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratar personal temporal y comprar más insumos","consecuencias":{"costos":"+4%","demanda":"*1.12","reputacion":"+2%"},"feedback_corto":"Capturas la demanda, con un costo fijo temporal que sobra si el pico es menor al esperado"},
   {"letra":"B","texto":"Extender horarios con el personal actual","consecuencias":{"costos":"+2%","demanda":"*1.08","reputacion":"-3%"},"feedback_corto":"No contratas más gente, pero el cansancio genera errores y rotación"},
   {"letra":"C","texto":"Subir tarifas durante el pico","consecuencias":{"precio_venta":"*1.07","reputacion":"-4%"},"feedback_corto":"Capturas el exceso de demanda con margen, con fama de aprovechamiento y tarifas pactadas que no se mueven"},
   {"letra":"D","texto":"Mantener la capacidad y derivar el exceso a otros centros","consecuencias":{"demanda":"*0.95","reputacion":"+2%"},"feedback_corto":"Proteges la calidad, pero pierdes ingresos y los pacientes derivados pueden no volver"}
 ]'::jsonb),

('SAL011',
 'Oportunidad: convenio con el Estado para atender población del SUS',
 'Cuando los servicios públicos son insuficientes, la normativa permite que establecimientos privados presten servicios por convenio con gobiernos municipales. Se aplican tus aranceles y se paga por prestación mensual contra factura. Es una oportunidad de volumen, entre 15% y 50% más de atenciones, con riesgo de pago que puede tardar entre 60 y 240 días.',
 'oportunidad', 'curado', 0.09, 5, ARRAY['tipo:salud_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Firmar el convenio para llenar capacidad ociosa","consecuencias":{"demanda":"*1.20","precio_venta":"*0.94","caja":"-4%"},"feedback_corto":"Obtienes volumen estable, con pagos tardíos, dependencia política y tarifas bajas"},
   {"letra":"B","texto":"Firmar con límite de cupo, por ejemplo 20% de la capacidad","consecuencias":{"demanda":"*1.10","caja":"-2%"},"feedback_corto":"Limitas el riesgo de cobro, con menos volumen, y el pagador puede pedir más"},
   {"letra":"C","texto":"No firmar y apostar a pacientes de bolsillo y aseguradoras","consecuencias":{"caja":"+3%","demanda":"*0.98"},"feedback_corto":"Mantienes una caja sana, pero queda capacidad ociosa si la demanda privada es chica"},
   {"letra":"D","texto":"Firmar solo para servicios de alta complejidad con mejor tarifa","consecuencias":{"demanda":"*1.08","precio_venta":"*1.03","caja":"-3%"},"feedback_corto":"Ganas mejor margen por atención, con riesgo de procedimientos costosos que el Estado paga tarde"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
