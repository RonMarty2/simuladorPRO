-- ============================================================================
-- 049 — Eventos propios de proyectos de EDUCACION PRIVADA (colegios)
-- Fuente: docs/metodologia/tipos/educacion-privada.md (seccion 5).
--
-- Categoria educacion_privada. La plantilla es un colegio privado, asi que se
-- usaron las situaciones de colegio (pension congelada, salario minimo,
-- inflacion y paso al colegio fiscal, morosidad, clases a distancia,
-- inscripciones, docentes clave, cobros no permitidos y dias perdidos). Las
-- situaciones universitarias (acreditacion, laboratorios, competencia virtual)
-- quedan para cuando exista una plantilla de universidad o instituto.
-- Idempotente. Aqui "demanda" son los alumnos matriculados y "precio_venta"
-- la pension. Magnitudes: estimaciones a calibrar (seccion 10 de la ficha).
-- Los casos (RM 0001/2024, salario minimo 2026) son precedentes reales.
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('EDP001',
 'El Ministerio congela las pensiones',
 'Al inicio de la gestión el Ministerio de Educación decide que las pensiones de los colegios privados no suben. En 2016 fijó un tope de 4,3%, en 2019 de 4% y en 2024 prohibió cualquier aumento y cobros adicionales a las diez pensiones anuales. Si tus costos suben más que la pensión, el margen se erosiona cada mes. El riesgo regulatorio es un riesgo del proyecto, no del entorno lejano.',
 'sectorial', 'curado', 0.12, 3, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.96}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cumplir y absorber el congelamiento","consecuencias":{"costos":"+4%","reputacion":"+2%"},"feedback_corto":"No tienes riesgo legal ni fuga por precio, pero el margen se erosiona cada mes si la inflación sigue alta"},
   {"letra":"B","texto":"Subir igual por acuerdo interno con los padres","consecuencias":{"precio_venta":"*1.05","reputacion":"-8%","demanda":"*0.95"},"feedback_corto":"Proteges el margen, pero arriesgas multa de 10% del ingreso anual, denuncias de padres y pérdida de alumnos"},
   {"letra":"C","texto":"Mantener la pensión y recortar gasto (paralelos más grandes, mantenimiento postergado)","consecuencias":{"costos":"-5%","reputacion":"-4%"},"feedback_corto":"Ahorras ya, pero baja la calidad percibida y puedes abrir otro problema con quienes exigen cupos reducidos"},
   {"letra":"D","texto":"Mantener la pensión y crear ingresos opcionales fuera de ella (talleres, cursos de verano, alquiler de espacios)","consecuencias":{"caja":"+4%","costos":"+2%","reputacion":"+1%"},"feedback_corto":"No tocas la pensión, pero requiere capacidad ociosa y esfuerzo de gestión, y hay que verificar que el cobro no esté prohibido"}
 ]'::jsonb),

('EDP002',
 'Sube el salario mínimo y tu pensión no puede subir',
 'El Gobierno sube el salario mínimo 20%, de Bs 2.750 a Bs 3.300, y la inflación del año anterior fue de dos dígitos. El costo docente es el mayor costo del colegio y se mueve por decreto. El piso de quienes ganan cerca del mínimo sube 20%, y la planilla total puede subir entre 8% y 15%. Hay que tener un plan para el mes en que sube el costo y el ingreso no.',
 'laboral', 'curado', 0.10, 4, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"costos_personal","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ajustar toda la planilla","consecuencias":{"costos":"+5%","reputacion":"+3%"},"feedback_corto":"Das estabilidad al equipo y menos rotación, pero la caja se tensa de inmediato y sin alza de pensión se comen las reservas"},
   {"letra":"B","texto":"Ajustar solo hasta el mínimo y negociar el resto","consecuencias":{"costos":"+2%","reputacion":"-3%"},"feedback_corto":"Cumples la norma al menor costo, pero docentes con experiencia pueden sentirse castigados y buscar otro colegio"},
   {"letra":"C","texto":"Reducir horas de contrato o personal de apoyo","consecuencias":{"costos":"-3%","reputacion":"-4%"},"feedback_corto":"Contienes el gasto, con sobrecarga y menor calidad"},
   {"letra":"D","texto":"Pedir a la comisión un aumento autorizado, con datos de costos","consecuencias":{"costos":"+3%","caja":"-2%","reputacion":"+1%"},"feedback_corto":"Es el camino institucional y puede traer un aumento, pero el resultado es incierto y llega meses después"}
 ]'::jsonb),

('EDP003',
 'Inflación alta: familias que pasan al colegio fiscal',
 'Con inflación de dos dígitos, parte de las familias deja de poder pagar un colegio privado. En la pandemia, la matrícula en colegios privados cayó 13,1% mientras la fiscal creció. En un año de shock las reinscripciones de enero pueden bajar entre 3% y 10%. El colegio fiscal es el sustituto de referencia.',
 'macroeconomico', 'curado', 0.10, 4, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.93}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener precio y calidad y aceptar una matrícula menor","consecuencias":{"demanda":"*0.97","reputacion":"+1%"},"feedback_corto":"Preservas el margen por alumno y el posicionamiento, pero hay aulas con menos alumnos y riesgo de no llegar al grupo mínimo"},
   {"letra":"B","texto":"Dar descuentos por hermanos o por pago adelantado","consecuencias":{"precio_venta":"*0.97","demanda":"*1.04","caja":"+2%"},"feedback_corto":"Retienes familias y mejoras caja, con menor ingreso por alumno"},
   {"letra":"C","texto":"Lanzar un plan de pensión más barata (turno tarde, grupos más grandes)","consecuencias":{"precio_venta":"*0.95","demanda":"*1.09","reputacion":"-2%"},"feedback_corto":"Capturas a las familias sensibles al precio, pero puedes canibalizar el plan regular y diluir la marca"},
   {"letra":"D","texto":"Reforzar lo que el colegio fiscal no ofrece (idiomas, tecnología, seguimiento)","consecuencias":{"caja":"-4%","demanda":"*1.05","reputacion":"+4%"},"feedback_corto":"Te diferencias, con inversión previa y resultado incierto"}
 ]'::jsonb),

('EDP004',
 'Suben las familias que no pagan la pensión',
 'Algunas familias dejan de pagar. Los colegios sostienen que las pensiones son su único ingreso y con ellas pagan los sueldos. En una crisis la morosidad puede pasar de 3% o 5% a 10% o 20% de las pensiones. La planilla se paga igual y la cartera por cobrar es parte del capital de trabajo. Cobrar duro y retener al alumno pueden ser objetivos opuestos.',
 'financiero', 'curado', 0.11, 3, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.94}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ofrecer plan de pagos y reprogramación","consecuencias":{"caja":"-2%","demanda":"*1.02","reputacion":"+2%"},"feedback_corto":"Recuperas parte de lo adeudado y mantienes al alumno, pero la caja entra tarde y algunos nunca pagan"},
   {"letra":"B","texto":"Cobranza firme (avisos, cartas, restricción de servicios no básicos)","consecuencias":{"caja":"+3%","reputacion":"-5%","demanda":"*0.97"},"feedback_corto":"Reduces la morosidad, pero hay conflicto con los padres y riesgo de reclamo ante el Ministerio"},
   {"letra":"C","texto":"Descuento por pago adelantado o puntual","consecuencias":{"precio_venta":"*0.98","caja":"+3%"},"feedback_corto":"Mejoras la caja y reduces la mora futura, con menor ingreso por alumno"},
   {"letra":"D","texto":"Crear un fondo de becas para familias en dificultad","consecuencias":{"caja":"-3%","reputacion":"+4%","demanda":"*1.03"},"feedback_corto":"Retienes al alumno y sostienes la reputación, con ingreso que no entra y expectativas que se generan"}
 ]'::jsonb),

('EDP005',
 'Clases a distancia obligadas y descuento exigido por el Ministerio',
 'Por una emergencia, las clases pasan a modalidad a distancia o semipresencial. El Ministerio puede exigir descuentos según la pensión: hasta 10% o 35% a distancia. Una disrupción reduce tu ingreso por decisión regulatoria antes de reducir tus costos, porque docentes y planilla siguen. Aquí la caja, y no el VAN, decide quién sobrevive.',
 'sectorial', 'curado', 0.07, 5, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.85}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aplicar el descuento y volver cuanto antes a la presencialidad","consecuencias":{"costos":"-2%","reputacion":"+2%"},"feedback_corto":"Cumples y recuperas el ingreso pleno, pero la presencialidad exige protocolos y puede enfrentar restricciones"},
   {"letra":"B","texto":"Invertir en una plataforma virtual de calidad y mantener lo híbrido","consecuencias":{"caja":"-6%","reputacion":"+5%","demanda":"*1.04"},"feedback_corto":"Te diferencias de quienes improvisan, con inversión sin retorno seguro y el descuento aplicándose igual"},
   {"letra":"C","texto":"Pedir reprogramación y flexibilidad a cambio de compromiso de pago","consecuencias":{"caja":"+2%","reputacion":"+1%"},"feedback_corto":"Reduces la mora, con caja tardía"},
   {"letra":"D","texto":"Recortar planilla con contratos por horas","consecuencias":{"costos":"-6%","reputacion":"-6%"},"feedback_corto":"Alivias el costo, pero pierdes equipo y reputación docente"}
 ]'::jsonb),

('EDP006',
 'Temporada de inscripciones floja: no se llenan los cursos',
 'La captación se concentra en pocos días: inscripciones en enero y clases desde febrero. El colegio que no llena el curso no recibe otra oportunidad hasta el año siguiente, y la capacidad es fija. Una captación floja se paga durante todo el año: el docente se paga igual con 12 que con 30 alumnos.',
 'comercio', 'curado', 0.11, 2, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir fuerte en publicidad y puertas abiertas antes de enero","consecuencias":{"caja":"-5%","demanda":"*1.12","reputacion":"+2%"},"feedback_corto":"Consigues más inscripciones, pero es gasto fijo inicial y, si no llegan, queda el costo"},
   {"letra":"B","texto":"Dar descuento de inscripción a los primeros inscritos","consecuencias":{"precio_venta":"*0.97","demanda":"*1.08","caja":"+2%"},"feedback_corto":"Llenas rápido y aseguras caja inicial, con menor ingreso por alumno y la duda de que el cobro sea compatible con la norma"},
   {"letra":"C","texto":"Abrir menos grupos y cerrar los que no llegan al mínimo","consecuencias":{"costos":"-4%","demanda":"*0.95","reputacion":"-2%"},"feedback_corto":"Proteges el margen, pero pierdes alumnos que no encuentran cupo y la fama de colegio chico"},
   {"letra":"D","texto":"Captar por referidos de las familias actuales","consecuencias":{"costos":"+1%","demanda":"*1.04","reputacion":"+2%"},"feedback_corto":"Gastas poco y los alumnos se quedan más, pero el crecimiento es lento"}
 ]'::jsonb),

('EDP007',
 'Se va un docente clave o una parte del equipo',
 'Un docente popular, o el coordinador académico, recibe una oferta de otro colegio que paga más. Si se va, los alumnos y las familias que lo valoraban pueden irse con él. El docente es a la vez el costo principal y el activo principal, y subirle el sueldo a uno puede generar un efecto en cadena sobre toda la planilla.',
 'laboral', 'curado', 0.10, 4, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.96}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subirle el sueldo para retenerlo","consecuencias":{"costos":"+3%","reputacion":"+1%","demanda":"*1.02"},"feedback_corto":"Evitas la fuga, pero el efecto en cadena puede encarecer toda la planilla"},
   {"letra":"B","texto":"Dejarlo ir y contratar por horas a su reemplazo","consecuencias":{"costos":"-2%","reputacion":"-4%","demanda":"*0.95"},"feedback_corto":"Ganas flexibilidad, pero dependes de docentes que tienen otros empleos y pierdes a quienes lo seguían"},
   {"letra":"C","texto":"Capacitar a docentes propios y formar reemplazos internos","consecuencias":{"caja":"-3%","reputacion":"+3%"},"feedback_corto":"Reduces la dependencia a largo plazo, con inversión sin retorno inmediato, y el capacitado puede irse igual"},
   {"letra":"D","texto":"Contratar más docentes de planta por encima del mínimo","consecuencias":{"costos":"+5%","reputacion":"+4%","demanda":"*1.03"},"feedback_corto":"Ganas calidad, continuidad e identidad, con costo fijo alto y menos flexibilidad si baja la matrícula"}
 ]'::jsonb),

('EDP008',
 'Denuncia de padres por cobros no permitidos',
 'La norma prohíbe cobrar algo más que las diez pensiones anuales: reserva de plaza, matrícula, derecho de inscripción o material educativo. La asociación de padres denuncia que algunos colegios subieron pensiones o incluyeron cláusulas de aumento. En 2016 la sanción era multa de 10% del ingreso anual y 20% en reincidencia. El costo del incumplimiento, multa más reputación, puede superar el ingreso extra.',
 'sectorial', 'curado', 0.08, 5, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Eliminar los cobros no permitidos y compensar ajustando costos","consecuencias":{"precio_venta":"*0.98","costos":"-2%","reputacion":"+4%"},"feedback_corto":"Eliminas el riesgo legal, con menos ingreso"},
   {"letra":"B","texto":"Mantener los cobros con otro nombre","consecuencias":{"caja":"+3%","reputacion":"-9%","demanda":"*0.95"},"feedback_corto":"Conservas el ingreso, pero arriesgas multa de 10% a 20% del ingreso anual y la confianza de los padres"},
   {"letra":"C","texto":"Transparentar los costos y abrir una mesa de diálogo con los padres","consecuencias":{"costos":"+1%","reputacion":"+5%"},"feedback_corto":"Generas confianza y ordenas el reclamo, pero expones tu estructura de costos y no cambias la norma"},
   {"letra":"D","texto":"Convertir los cobros en servicios opcionales con precio propio (transporte, almuerzo, talleres)","consecuencias":{"costos":"+2%","caja":"+2%","reputacion":"+1%"},"feedback_corto":"Obtienes una fuente lícita de ingreso si es realmente opcional, con servicio real, costo y calidad, y la autoridad puede cuestionarlo"}
 ]'::jsonb),

('EDP009',
 'Se pierden semanas de clases por bloqueos o paros',
 'Los bloqueos, conflictos sociales o paros pueden suspender entre 5 y 20 días de los 200 del calendario escolar. Sigues pagando sueldos y servicios y debes recuperar el contenido. Las familias perciben pérdida de aprendizaje y pueden no reinscribirse. Los costos fijos corren aunque no haya clases.',
 'sectorial', 'curado', 0.09, 3, ARRAY['tipo:educacion_privada'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"multiplicar","valor":0.96}]}'::jsonb,
 '[
   {"letra":"A","texto":"Dar clases virtuales de emergencia durante el conflicto","consecuencias":{"costos":"+2%","reputacion":"+3%"},"feedback_corto":"Mantienes la continuidad, aunque requiere plataforma y capacitación y la calidad es menor"},
   {"letra":"B","texto":"Recuperar clases en sábados y vacaciones","consecuencias":{"costos":"+3%","reputacion":"+1%"},"feedback_corto":"Cumples el contenido, con horas extra de docentes y desgaste de las familias"},
   {"letra":"C","texto":"Acortar el contenido y priorizar lo esencial","consecuencias":{"reputacion":"-4%","demanda":"*0.97"},"feedback_corto":"No cuesta nada, pero el aprendizaje es menor y hay riesgo de reclamo"},
   {"letra":"D","texto":"Compensar a las familias con descuento o un taller gratuito","consecuencias":{"precio_venta":"*0.98","reputacion":"+4%","demanda":"*1.02"},"feedback_corto":"Proteges la relación, con ingreso menor"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
