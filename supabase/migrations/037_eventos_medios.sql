-- ============================================================================
-- 037 — Eventos propios de proyectos de MEDIOS y PUBLICIDAD
-- Fuente: docs/metodologia/tipos/publicidad-medios.md (seccion 5, situaciones).
--
-- Categoria medios (portal de noticias, radio, canal de YouTube, podcast).
-- Idempotente. En estos eventos "demanda" representa la audiencia y
-- "precio_venta" la tarifa por espacio publicitario. Magnitudes: estimaciones
-- a calibrar (seccion 10 de la ficha).
-- ============================================================================

INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES

('MED001',
 'Cambia el algoritmo: tu alcance se cae',
 'La plataforma donde vive tu audiencia (YouTube, Facebook, TikTok) cambia lo que recomienda y tus vistas por contenido bajan de golpe, aunque publiques igual. Tu audiencia no es tuya: vive en una plataforma ajena.',
 'tecnologico', 'curado', 0.12, 4, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.70}]}'::jsonb,
 '[
   {"letra":"A","texto":"Publicar más contenido","consecuencias":{"costos":"+6%","demanda":"*1.10","reputacion":"-3%"},"feedback_corto":"Puedes recuperar vistas si el formato funciona, pero sube el gasto y hay riesgo de cansancio y menor calidad"},
   {"letra":"B","texto":"Diversificar a otra plataforma (video corto, podcast, boletín)","consecuencias":{"caja":"-4%","costos":"+3%","demanda":"*1.06"},"feedback_corto":"Reduces el riesgo a largo plazo, pero son meses de esfuerzo con poco ingreso"},
   {"letra":"C","texto":"Pagar para impulsar el contenido","consecuencias":{"caja":"-7%","demanda":"*1.12"},"feedback_corto":"Efecto inmediato, pero el dinero no se recupera si lo comprado no genera suscriptores ni anuncios"},
   {"letra":"D","texto":"Aguantar y no cambiar nada","consecuencias":{"reputacion":"-3%"},"feedback_corto":"No gastas, pero si la caída es permanente pierdes meses de ingreso"}
 ]'::jsonb),

('MED002',
 'Se va tu anunciante ancla',
 'El anunciante que aportaba la mayor parte de tus ingresos recorta su presupuesto o cambia de medio. En Bolivia los grandes anunciantes (bancos, telefonía, cerveceras, comercio) son pocos, y el hueco que dejan es grande mientras tus costos fijos siguen igual.',
 'comercio', 'curado', 0.10, 5, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.70}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar la tarifa para llenar espacios con muchos clientes pequeños","consecuencias":{"precio_venta":"*0.85","demanda":"*1.10"},"feedback_corto":"Llenas el inventario, pero la tarifa baja queda como precio de referencia para siempre"},
   {"letra":"B","texto":"Cobrar más a menos clientes con paquetes exclusivos","consecuencias":{"precio_venta":"*1.08","demanda":"*0.95","costos":"+2%"},"feedback_corto":"Mejor margen por cliente, pero exige venta consultiva, ciclos largos y más dependencia"},
   {"letra":"C","texto":"Vender directo en bolivianos a negocios locales","consecuencias":{"costos":"+3%","demanda":"*1.06","caja":"-2%"},"feedback_corto":"Diversificas, aunque son tickets chicos y requieren más gestión y cobranza"},
   {"letra":"D","texto":"Recortar costos y esperar","consecuencias":{"costos":"-6%","reputacion":"-5%"},"feedback_corto":"Proteges la caja, pero puedes deteriorar la calidad y la audiencia"}
 ]'::jsonb),

('MED003',
 'Una entidad estatal te ofrece pauta con condiciones',
 'Una institución del Estado ofrece contratar pauta importante. En Bolivia la publicidad estatal fue una fuente de ingresos clave de los medios y su reparto fue discrecional: los independientes denuncian que se les restringe y los alineados reciben más. Con un cambio de gobierno, las reglas pueden cambiar.',
 'oportunidad', 'curado', 0.09, 6, ARRAY['tipo:medios'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar sin condiciones","consecuencias":{"caja":"+9%","reputacion":"-10%"},"feedback_corto":"Caja inmediata, pero dependes del contrato y pierdes credibilidad ante tu audiencia"},
   {"letra":"B","texto":"Aceptar con límite (máximo 20% del ingreso) y política editorial escrita","consecuencias":{"caja":"+4%","reputacion":"+2%"},"feedback_corto":"Proteges tu independencia, aunque dejas dinero sobre la mesa y el contrato puede no aceptarlo"},
   {"letra":"C","texto":"Rechazar la oferta","consecuencias":{"reputacion":"+6%","caja":"-2%"},"feedback_corto":"Cuidas tu reputación, pero sin esa caja puedes no sobrevivir al próximo valle"},
   {"letra":"D","texto":"Aceptar y usar el ingreso para diversificar (membresías, otros clientes)","consecuencias":{"caja":"+5%","costos":"+3%","reputacion":"-4%"},"feedback_corto":"Conviertes una dependencia en un puente, si tienes disciplina y el plazo alcanza"}
 ]'::jsonb),

('MED004',
 'Temporada alta de pauta y luego el valle',
 'La inversión publicitaria se concentra en ciertas épocas (fin de año, Día de la Madre, Carnaval, campañas electorales) y cae en otras. En el pico tu ocupación llega al 90%, en el valle puede caer al 40%. El flujo mensual importa más que el promedio anual.',
 'oportunidad', 'curado', 0.11, 4, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.20}]}'::jsonb,
 '[
   {"letra":"A","texto":"Vender paquetes anuales con descuento y pago adelantado","consecuencias":{"caja":"+6%","precio_venta":"*0.92"},"feedback_corto":"Caja anticipada y ocupación estable, pero con menor precio y sin aprovechar el pico"},
   {"letra":"B","texto":"Subir la tarifa en el pico y vender suelto","consecuencias":{"precio_venta":"*1.12","demanda":"*0.96"},"feedback_corto":"Más margen, pero te arriesgas a no vender en el valle"},
   {"letra":"C","texto":"Guardar parte del ingreso del pico como fondo para el valle","consecuencias":{"caja":"+3%","reputacion":"+1%"},"feedback_corto":"Seguridad para los meses flojos, a costa de no invertir ese dinero en crecer"},
   {"letra":"D","texto":"Crear productos para el valle (programas especiales, eventos)","consecuencias":{"caja":"-4%","costos":"+3%","demanda":"*1.08"},"feedback_corto":"Llenas el valle, con inversión y esfuerzo adicional"}
 ]'::jsonb),

('MED005',
 'Tu contenido es marcado como no apto para anunciantes',
 'Un video, episodio o programa sobre un tema político, violento o sensible es marcado como no apto para anunciantes, o una marca te pide retirar su anuncio. El contenido afectado deja de generar ingresos aunque la audiencia lo vea.',
 'sectorial', 'curado', 0.09, 5, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"precio_venta","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Autocensurarte hacia temas seguros","consecuencias":{"precio_venta":"*1.06","demanda":"*0.90","reputacion":"-4%"},"feedback_corto":"Ingreso estable, pero pierdes identidad y quizás a la audiencia que te seguía por tu estilo"},
   {"letra":"B","texto":"Mantener la línea y financiarte con membresías o aportes","consecuencias":{"demanda":"*0.95","reputacion":"+7%","caja":"-2%"},"feedback_corto":"Audiencia fiel y diferenciación, con menos ingreso publicitario"},
   {"letra":"C","texto":"Hacer dos líneas: contenido apto para anunciantes y contenido libre","consecuencias":{"costos":"+5%","precio_venta":"*1.03"},"feedback_corto":"Repartes el riesgo, pero duplicas el trabajo y confundes la marca"},
   {"letra":"D","texto":"Apelar y reclamar a la plataforma","consecuencias":{"costos":"+1%","reputacion":"-1%"},"feedback_corto":"Puedes recuperar la monetización, pero demora semanas y no hay garantía"}
 ]'::jsonb),

('MED006',
 'Tienes audiencia, pero cobrar desde Bolivia es un problema',
 'Algunas plataformas no están habilitadas para pagar a Bolivia. Otras liberan el pago recién al llegar a un mínimo (alrededor de US$ 100), piden verificación y los bancos cobran comisión o convierten con pérdida. El ingreso reconocido no es caja.',
 'financiero', 'curado', 0.09, 4, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"caja","operacion":"multiplicar","valor":0.96}]}'::jsonb,
 '[
   {"letra":"A","texto":"Usar cuentas o intermediarios en otro país","consecuencias":{"caja":"+4%","costos":"+2%","reputacion":"-3%"},"feedback_corto":"Monetizas de inmediato, pero con riesgo de suspensión, comisiones y complicaciones tributarias"},
   {"letra":"B","texto":"Quedarte solo con plataformas que sí pagan en Bolivia","consecuencias":{"precio_venta":"*0.95","reputacion":"+2%"},"feedback_corto":"Seguridad en el cobro, pero dependes de un canal quizás menos rentable"},
   {"letra":"C","texto":"Vender patrocinio directo a empresas locales con factura en bolivianos","consecuencias":{"costos":"+4%","demanda":"*1.04","caja":"+3%"},"feedback_corto":"No dependes del pago de la plataforma, pero necesitas equipo de ventas y emitir facturas"},
   {"letra":"D","texto":"Cobrar a tu audiencia con QR o transferencia (membresía local)","consecuencias":{"caja":"+2%","demanda":"*0.97"},"feedback_corto":"Cobras en bolivianos, aunque la audiencia boliviana paga poco por contenido"}
 ]'::jsonb),

('MED007',
 'Un anunciante te paga mucho por más espacio publicitario',
 'Un anunciante grande ofrece pagar bastante si aumentas el espacio para sus anuncios. Subir la carga publicitaria da ingresos hoy, pero molesta a la audiencia, que se va despacio. Hay un nivel de anuncios que maximiza el ingreso y no es el máximo posible.',
 'oportunidad', 'curado', 0.10, 5, ARRAY['tipo:medios'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar toda la oferta","consecuencias":{"precio_venta":"*1.20","demanda":"*0.90","reputacion":"-7%"},"feedback_corto":"Más ingreso hoy, pero la audiencia cae y a los tres meses tu inventario vale menos"},
   {"letra":"B","texto":"Aceptar la mitad y cobrar tarifa premium por exclusividad","consecuencias":{"precio_venta":"*1.10","demanda":"*0.97"},"feedback_corto":"Proteges la experiencia, aunque el anunciante puede irse a otro medio"},
   {"letra":"C","texto":"Cambiar el formato a patrocinio integrado en vez de cortes","consecuencias":{"costos":"+3%","precio_venta":"*1.08","reputacion":"+3%"},"feedback_corto":"Molestas menos, a cambio de más trabajo creativo y menos control del anunciante sobre el mensaje"},
   {"letra":"D","texto":"Ofrecer una versión sin anuncios por suscripción","consecuencias":{"costos":"+2%","caja":"+2%","demanda":"*0.98"},"feedback_corto":"Monetizas a los más molestos, con complejidad y poca conversión al comienzo"}
 ]'::jsonb),

('MED008',
 'Tu anunciante principal exige resultados en ventas',
 'Un cliente importante dice que no renovará si no demuestras ventas generadas. Medir el efecto real de un anuncio es difícil incluso para grandes empresas, y muchas ventas atribuidas a la publicidad habrían ocurrido igual. Vender audiencia no es lo mismo que vender ventas.',
 'comercio', 'curado', 0.09, 6, ARRAY['tipo:medios'],
 '{"variables_afectadas":[]}'::jsonb,
 '[
   {"letra":"A","texto":"Garantizar un resultado (pago por venta o por clic)","consecuencias":{"precio_venta":"*0.85","demanda":"*1.08"},"feedback_corto":"Cierras el trato, pero pasas el riesgo al medio y ganas menos si la campaña no vende"},
   {"letra":"B","texto":"Ofrecer garantía de audiencia con reposición de espacios","consecuencias":{"precio_venta":"*0.92","reputacion":"+3%"},"feedback_corto":"Compromiso medible, pero regalas espacios si no cumples"},
   {"letra":"C","texto":"Proponer un piloto de 2 meses con grupo de control","consecuencias":{"costos":"+3%","reputacion":"+5%"},"feedback_corto":"Evidencia honesta, aunque cuesta tiempo y el resultado puede ser desfavorable"},
   {"letra":"D","texto":"Rechazar y mantener tarifa fija por audiencia","consecuencias":{"demanda":"*0.94","precio_venta":"*1.02"},"feedback_corto":"No cargas con el riesgo, pero puedes perder al cliente"}
 ]'::jsonb),

('MED009',
 'Un contenido se hace viral: tu audiencia se duplica',
 'Un contenido se viraliza y tu audiencia crece entre 50% y 200% en semanas. Es una oportunidad, pero buena parte de esa gente es pasajera: puede perder entre 40% y 70% del exceso en pocos meses. Los anunciantes grandes tardan en reaccionar.',
 'oportunidad', 'curado', 0.08, 5, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.60}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en capacidad (equipo, producción) para aprovechar la ola","consecuencias":{"caja":"-8%","costos":"+6%","demanda":"*1.10"},"feedback_corto":"Puedes retener parte de la audiencia, pero si la ola pasa quedas con costos fijos más altos"},
   {"letra":"B","texto":"Vender paquetes de pauta a precio alto mientras dure","consecuencias":{"precio_venta":"*1.15","reputacion":"-3%"},"feedback_corto":"Monetizas el pico, pero si la audiencia cae cumples mal lo que prometiste"},
   {"letra":"C","texto":"Convertir la audiencia en base propia (lista de correos, comunidad, membresía)","consecuencias":{"costos":"+3%","demanda":"*1.06","reputacion":"+4%"},"feedback_corto":"Aseguras retención, con un esfuerzo que no da ingreso inmediato"},
   {"letra":"D","texto":"No cambiar nada y disfrutar el ingreso extra","consecuencias":{"caja":"+3%"},"feedback_corto":"Sin riesgo, pero desperdicias la oportunidad de quedarte con parte de esa gente"}
 ]'::jsonb),

('MED010',
 'Se va tu conductor o rostro principal',
 'La cara, la voz o el conductor que concentra tu audiencia se va a otro medio, se enferma o pide mucho más dinero. En los medios de personalidad, la audiencia sigue a la persona: el riesgo es de continuidad y no solo de mercado.',
 'laboral', 'curado', 0.07, 7, ARRAY['tipo:medios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.80}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subirle el pago o darle participación","consecuencias":{"costos":"+6%","demanda":"*1.15","reputacion":"+2%"},"feedback_corto":"Lo retienes, pero baja tu margen y sientas un precedente para los demás"},
   {"letra":"B","texto":"Desarrollar la marca del programa y un segundo rostro","consecuencias":{"caja":"-4%","costos":"+3%","reputacion":"+4%"},"feedback_corto":"Reduces la dependencia, pero tarda meses y puede diluir la audiencia actual"},
   {"letra":"C","texto":"Exigir contrato con exclusividad y permanencia","consecuencias":{"costos":"+2%","reputacion":"-4%"},"feedback_corto":"Intentas proteger el activo, pero genera tensión laboral y es difícil de hacer cumplir"},
   {"letra":"D","texto":"Dejarlo ir y reconstruir","consecuencias":{"demanda":"*0.90","costos":"-4%","caja":"-3%"},"feedback_corto":"Evitas pagar de más, pero pierdes audiencia e ingresos durante meses"}
 ]'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
