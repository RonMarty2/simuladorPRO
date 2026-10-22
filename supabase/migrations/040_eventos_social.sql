-- ============================================================================
-- 040 — Eventos propios de PROYECTOS SOCIALES y de ONG
-- Fuente: docs/metodologia/tipos/social-ong.md (seccion 5, situaciones S-1..S-14).
--
-- Categoria social (agua potable rural, capacitacion de jovenes, posta de salud:
-- el beneficio se traduce a bolivianos con supuestos). Idempotente.
-- Aqui "demanda" representa beneficiarios alcanzados (cobertura) y "caja" el
-- dinero disponible del proyecto. Magnitudes: estimaciones a calibrar (seccion 10).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('SOC001',
 'El desembolso del cooperante llega con meses de atraso',
 'El convenio dice que el cooperante transfiere por tramos contra un informe aprobado. Revisan tu informe, piden aclaraciones y el tramo llega tres meses tarde. Mientras tanto debes pagar sueldos y al equipo en terreno. En un proyecto financiado por terceros, el problema de caja suele venir de los plazos del financiador y no de la falta de plata total.',
 'financiero', 'curado', 0.12, 3, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Seguir operando con tu reserva propia","consecuencias":{"caja":"-8%","reputacion":"+3%"},"feedback_corto":"El servicio no se interrumpe ni pierdes beneficiarios, pero se agota la reserva y no queda margen para otro imprevisto"},
   {"letra":"B","texto":"Reducir las actividades a lo esencial hasta que llegue el tramo","consecuencias":{"costos":"-6%","demanda":"*0.88","reputacion":"-3%"},"feedback_corto":"Proteges la caja, pero baja la cobertura y el cooperante verá resultados menores en la siguiente evaluación"},
   {"letra":"C","texto":"Pedir un préstamo puente a un banco o a otro donante","consecuencias":{"caja":"+6%","deuda":"+8%"},"feedback_corto":"Evitas recortar, pero pagas intereses o condiciones, con fondos que eran para el proyecto"},
   {"letra":"D","texto":"Despedir temporalmente al personal contratado por proyecto","consecuencias":{"costos":"-10%","demanda":"*0.85","reputacion":"-6%"},"feedback_corto":"Alivio inmediato de caja, pero pierdes gente capacitada, pagas la recontratación y la confianza de las comunidades"}
 ]'::jsonb),

('SOC002',
 'Tu financiador principal recorta o se va',
 'Tu organización recibe cerca del 70% de su ingreso de un solo cooperante. Ese cooperante reorienta su cooperación o termina el convenio antes de lo previsto, como pasó con la suspensión de fondos de USAID en 2025. Tu cobertura depende de reemplazar ese fondo.',
 'financiero', 'curado', 0.09, 6, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.82},{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Salir a buscar varios financiadores pequeños (donaciones, empresas, otras agencias)","consecuencias":{"costos":"+5%","caja":"-3%","reputacion":"+3%"},"feedback_corto":"Diversificas y reduces el riesgo futuro, pero lleva de 6 a 12 meses, cuesta recaudar y los montos son menores e inestables"},
   {"letra":"B","texto":"Reducir el alcance (menos comunidades o componentes) manteniendo la calidad","consecuencias":{"costos":"-12%","demanda":"*0.85","reputacion":"-3%"},"feedback_corto":"El costo por beneficiario con resultado se mantiene, pero excluyes a población que ya habías incluido"},
   {"letra":"C","texto":"Mantener el alcance recortando calidad (menos seguimiento, menos capacitación)","consecuencias":{"costos":"-10%","reputacion":"-8%"},"feedback_corto":"La cobertura se ve igual, pero el impacto cae sin que los números de producto lo muestren, y se paga en la evaluación final"},
   {"letra":"D","texto":"Cerrar de forma ordenada y traspasar a otra institución","consecuencias":{"costos":"-20%","demanda":"*0.60","reputacion":"+2%"},"feedback_corto":"Proteges lo logrado, pero tu organización pierde su razón de existir y a su equipo, y el traspaso necesita un receptor dispuesto"}
 ]'::jsonb),

('SOC003',
 'El cooperante pone un tope de 15% a tus gastos administrativos',
 'Un nuevo convenio acepta financiar el proyecto pero limita los gastos administrativos al 15%. Tu costo real de administrar (contabilidad, informes, sistemas, directivos) es mayor, de entre 17% y 35% según la experiencia internacional. Muchas organizaciones subdeclaran para cumplir.',
 'financiero', 'curado', 0.09, 4, ARRAY['tipo:social'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar el tope y ajustar el gasto a ese número","consecuencias":{"costos":"-6%","reputacion":"-6%"},"feedback_corto":"Firmas el convenio y te ves eficiente, pero se deteriora la capacidad (informes tardíos, rotación del personal administrativo)"},
   {"letra":"B","texto":"Cargar costos administrativos dentro de rubros de programa","consecuencias":{"costos":"-3%","reputacion":"-8%"},"feedback_corto":"Cumples el tope en papel, pero es subdeclarar: si el cooperante audita, es un gasto no elegible y daña la relación"},
   {"letra":"C","texto":"Negociar un porcentaje mayor justificado con datos","consecuencias":{"costos":"+2%","reputacion":"+5%","demanda":"*0.95"},"feedback_corto":"Se reconoce tu costo real, pero puedes perder la convocatoria frente a quien acepte el 15%"},
   {"letra":"D","texto":"Cubrir la diferencia con fondos propios o de otro donante flexible","consecuencias":{"caja":"-5%","reputacion":"+4%"},"feedback_corto":"Mantienes la calidad, si tienes fondos flexibles, que casi nunca sobran"}
 ]'::jsonb),

('SOC004',
 'Error de focalización: llegan los que no son',
 'Se entrega un servicio y el control posterior muestra que una parte importante de los beneficiarios no pertenece a la población objetivo, mientras familias que sí lo son no se enteraron del proyecto. La cobertura bruta se mantiene, pero la neta cae y el costo por beneficiario con resultado sube.',
 'sectorial', 'curado', 0.10, 4, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88}]}'::jsonb,
 '[
   {"letra":"A","texto":"Rediseñar el sistema de selección (criterios, visitas, padrón)","consecuencias":{"costos":"+5%","demanda":"*1.12","reputacion":"+4%"},"feedback_corto":"Mejoras la cobertura neta, pero verificar cuesta, demora la entrega y puede generar conflicto con quienes ya recibían"},
   {"letra":"B","texto":"Seguir con acceso abierto para no generar conflicto","consecuencias":{"reputacion":"+2%","caja":"-2%"},"feedback_corto":"Es simple y bien visto localmente, pero gastas recursos limitados en quienes no los necesitan"},
   {"letra":"C","texto":"Delegar la selección en la comunidad o la autoridad local","consecuencias":{"costos":"-2%","demanda":"*1.06","reputacion":"-3%"},"feedback_corto":"Bajo costo y legitimidad local, con riesgo de captura por líderes o conflictos internos"},
   {"letra":"D","texto":"Pedir a los beneficiarios que muestren documentos","consecuencias":{"costos":"-1%","demanda":"*0.92","reputacion":"-4%"},"feedback_corto":"Más objetivo, pero excluye a los más vulnerables, que suelen no tener papeles"}
 ]'::jsonb),

('SOC005',
 'Los beneficiarios abandonan a mitad de año',
 'La asistencia cae porque las familias migran por trabajo, hay cosecha, cambia el calendario escolar o el transporte se vuelve costoso. Tus resultados dependen de que completen el ciclo. El costo relevante es por beneficiario que completa, no por beneficiario inscrito.',
 'sectorial', 'curado', 0.11, 4, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.82}]}'::jsonb,
 '[
   {"letra":"A","texto":"Adaptar horarios y lugares al calendario de las familias","consecuencias":{"costos":"+5%","demanda":"*1.12","reputacion":"+4%"},"feedback_corto":"Retienes beneficiarios, con más costo logístico y más tiempo del personal"},
   {"letra":"B","texto":"Dar incentivos (alimentos, transporte, útiles)","consecuencias":{"costos":"+7%","demanda":"*1.15"},"feedback_corto":"Reduces el costo privado de participar, pero sube el costo por beneficiario y puede generar dependencia"},
   {"letra":"C","texto":"Aceptar la deserción y reclutar reemplazos","consecuencias":{"costos":"+2%","demanda":"*1.04","reputacion":"-3%"},"feedback_corto":"Mantienes la cobertura nominal, pero los nuevos empiezan de cero y no completan el ciclo, así que el impacto promedio baja"},
   {"letra":"D","texto":"Reducir la intensidad del programa (menos sesiones)","consecuencias":{"costos":"-4%","demanda":"*1.06","reputacion":"-4%"},"feedback_corto":"Es más fácil de completar, pero con menor dosis y menor efecto esperado"}
 ]'::jsonb),

('SOC006',
 'La evaluación de impacto muestra un efecto menor al esperado',
 'A mitad de proyecto, una evaluación con grupo de comparación encuentra que gran parte del cambio que se atribuía al proyecto habría ocurrido igual, y que otra parte se debe a un programa estatal paralelo. Como referencia, el estudio del Banco Central sobre el Bono Juancito Pinto halló efectos reales pero pequeños: cerca de 1% en matriculación.',
 'sectorial', 'curado', 0.09, 6, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.95}]}'::jsonb,
 '[
   {"letra":"A","texto":"Informar el resultado completo al cooperante y rediseñar","consecuencias":{"costos":"+3%","reputacion":"+8%","caja":"-3%"},"feedback_corto":"Ganas credibilidad y mejoras de verdad, pero corres el riesgo de que el cooperante recorte la renovación"},
   {"letra":"B","texto":"Informar solo indicadores de producto (personas atendidas)","consecuencias":{"reputacion":"-8%"},"feedback_corto":"Evitas el conflicto hoy, pero si sale a la luz se pierde la confianza y no aprendes nada"},
   {"letra":"C","texto":"Contratar otra evaluación con una metodología más favorable","consecuencias":{"caja":"-4%","reputacion":"-6%"},"feedback_corto":"Puede mostrar mejores números, pero cuesta y el sesgo es evidente para un evaluador experimentado"},
   {"letra":"D","texto":"Redirigir recursos a los grupos más difíciles de alcanzar","consecuencias":{"costos":"+6%","demanda":"*0.92","reputacion":"+5%"},"feedback_corto":"El impacto neto mejora porque ahí es menor lo que habría pasado igual, pero esos grupos cuestan más por persona atendida"}
 ]'::jsonb),

('SOC007',
 'Falta un año para el fin del convenio: ¿qué queda cuando se va el fondo?',
 'Quedan doce meses de un convenio de cinco años. Algunos impactos duran solo mientras el proyecto opera, como los subsidios a servicios; otros dejan un cambio más permanente. Si no planificas la salida, el beneficio puede caer a cero apenas se acaben los fondos.',
 'sectorial', 'curado', 0.09, 8, ARRAY['tipo:social'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Traspasar el servicio a un gobierno municipal o a una organización comunitaria","consecuencias":{"costos":"+4%","reputacion":"+6%","demanda":"*1.04"},"feedback_corto":"La población sigue atendida sin tu fondo, pero requiere meses de capacitación y el receptor puede no tener presupuesto ni interés"},
   {"letra":"B","texto":"Convertir parte del servicio en cobro simbólico o con ingresos propios","consecuencias":{"caja":"+4%","demanda":"*0.92","reputacion":"-3%"},"feedback_corto":"Financias parte de la continuidad, pero excluyes a los más pobres y puedes desviar la misión"},
   {"letra":"C","texto":"Buscar una segunda fase con el mismo cooperante u otro","consecuencias":{"costos":"+3%","reputacion":"+2%"},"feedback_corto":"Continuidad y experiencia, pero dependes de una decisión ajena y, si no sale, no hay plan B"},
   {"letra":"D","texto":"Cerrar y documentar lo aprendido","consecuencias":{"costos":"-6%","demanda":"*0.80","reputacion":"+1%"},"feedback_corto":"Cumples el convenio y dejas una lección, pero los beneficios caen cuando se va el equipo"}
 ]'::jsonb),

('SOC008',
 'Descalce de monedas: el convenio en dólares y los gastos en bolivianos',
 'El convenio se firmó en dólares o euros pero la mayor parte de tus gastos son en bolivianos, o los costos importados (medicamentos, equipos, combustible) suben más que tu presupuesto. Una devaluación de envergadura es un supuesto fuera del control de la gerencia del proyecto.',
 'macroeconomico', 'curado', 0.09, 5, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.12}]}'::jsonb,
 '[
   {"letra":"A","texto":"Renegociar el presupuesto con el cooperante","consecuencias":{"caja":"+4%","reputacion":"+2%"},"feedback_corto":"Recuperas poder de compra, pero demora y algunos cooperantes no aceptan modificaciones"},
   {"letra":"B","texto":"Recortar rubros de menor impacto","consecuencias":{"costos":"-6%","demanda":"*0.95","reputacion":"-2%"},"feedback_corto":"Mantienes lo fundamental, pero pierdes calidad o cobertura en lo recortado"},
   {"letra":"C","texto":"Comprar por adelantado insumos y asegurar precios","consecuencias":{"caja":"-6%","costos":"-4%"},"feedback_corto":"Te proteges del alza, pero inmovilizas caja y hay riesgo de vencimiento o pérdida"},
   {"letra":"D","texto":"Aprovechar un tipo de cambio favorable para ampliar la cobertura","consecuencias":{"demanda":"*1.10","costos":"+4%"},"feedback_corto":"Llegas a más beneficiarios, pero sin garantía de que el tipo de cambio siga igual y luego habría que recortar"}
 ]'::jsonb),

('SOC009',
 'La auditoría del cooperante observa gastos',
 'La auditoría externa observa gastos equivalentes a cerca del 4% del convenio: compras sin tres cotizaciones, pagos sin factura válida, personal pagado fuera del período. Si no se justifican, el cooperante exige devolverlos. La rendición de cuentas es condición para recibir el siguiente tramo.',
 'financiero', 'curado', 0.08, 6, ARRAY['tipo:social'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Devolver lo observado y corregir los procesos","consecuencias":{"caja":"-5%","costos":"+2%","reputacion":"+5%"},"feedback_corto":"Limpias la relación con el cooperante, pero pierdes plata del proyecto y debes invertir en sistemas"},
   {"letra":"B","texto":"Discutir las observaciones con documentos de respaldo","consecuencias":{"costos":"+2%","reputacion":"-1%"},"feedback_corto":"Puedes evitar la devolución, pero consume tiempo del equipo y puede deteriorar la relación"},
   {"letra":"C","texto":"Cubrir el monto con otra fuente flexible sin informar","consecuencias":{"caja":"-3%","reputacion":"-8%"},"feedback_corto":"No se afecta el convenio, pero ocultas un problema de control interno y puede ser un manejo indebido de fondos"},
   {"letra":"D","texto":"Reasignar presupuesto de otro rubro para cubrir","consecuencias":{"demanda":"*0.95","reputacion":"-2%"},"feedback_corto":"No sale plata nueva, pero recortas actividades que sí tenían meta de impacto"}
 ]'::jsonb),

('SOC010',
 'Bloqueos o un desastre natural frenan el trabajo en terreno',
 'Bloqueos de caminos, inundaciones o heladas impiden llegar a las comunidades durante varias semanas. El gasto fijo sigue corriendo sin producto. Los supuestos externos del marco lógico deben tener un plan de respuesta, no solo un renglón.',
 'logistico', 'curado', 0.10, 4, ARRAY['tipo:social'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.70}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reprogramar las actividades y pedir ampliación de plazo","consecuencias":{"costos":"+2%","reputacion":"-1%"},"feedback_corto":"No pierdes recursos, pero el cooperante puede negarse y se acumula trabajo para los meses siguientes"},
   {"letra":"B","texto":"Trabajar a distancia (llamadas, radio, mensajes)","consecuencias":{"demanda":"*1.12","reputacion":"-2%"},"feedback_corto":"Mantienes el contacto, pero con menor calidad y cobertura: muchas comunidades no tienen conectividad"},
   {"letra":"C","texto":"Dar ayuda de emergencia (alimentos, insumos)","consecuencias":{"caja":"-5%","reputacion":"+7%"},"feedback_corto":"Proteges a los beneficiarios y la relación, pero el dinero sale de los fondos del proyecto y cambia su uso"},
   {"letra":"D","texto":"Reasignar al personal a otra zona sin conflicto","consecuencias":{"demanda":"*1.10","reputacion":"-4%"},"feedback_corto":"Aprovechas el tiempo, pero atiendes a una población distinta a la comprometida"}
 ]'::jsonb),

('SOC011',
 'Un gobierno municipal ofrece cofinanciar parte del proyecto',
 'Un municipio ofrece aportar el 30% del presupuesto de un componente a cambio de que trabajes en su jurisdicción y sigas sus prioridades. Es un fondo de contraparte, una forma de dar sostenibilidad. El riesgo es que el aporte llegue tarde o no llegue, porque los municipios tienen calendarios políticos.',
 'oportunidad', 'curado', 0.09, 5, ARRAY['tipo:social'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar con convenio firmado y cláusulas de pago","consecuencias":{"caja":"+6%","demanda":"*1.10","reputacion":"+3%"},"feedback_corto":"Dinero adicional y compromiso local, aunque el convenio no garantiza el desembolso"},
   {"letra":"B","texto":"Aceptar sin formalizar, por confianza política","consecuencias":{"caja":"+4%","demanda":"*1.08","reputacion":"-3%"},"feedback_corto":"Es rápido, pero si cambia la autoridad pierdes el aporte y a veces el acceso a la zona"},
   {"letra":"C","texto":"Rechazar para no depender de un actor político","consecuencias":{"reputacion":"+1%"},"feedback_corto":"Conservas independencia, pero renuncias a financiamiento y a que el servicio continúe tras el proyecto"},
   {"letra":"D","texto":"Aceptar, pero ejecutar primero lo que no depende del municipio","consecuencias":{"caja":"+3%","demanda":"*1.04","costos":"+2%"},"feedback_corto":"Reduces el riesgo, pero demoras el componente más valioso o el que más requiere coordinación"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
