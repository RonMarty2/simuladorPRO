-- ============================================================================
-- 053 - Cobranza en los eventos: las opciones de 4 eventos mueven los dias de cobro
--
-- La simulacion ahora maneja `dias_cobro` (cuanto tardan tus clientes en pagarte) y
-- las cuentas por cobrar. Estos eventos hablan justamente de cobrar tarde, asi que
-- sus opciones suben o bajan los dias de cobro:
--   SAL001  la caja de salud o el Estado se atrasa en el pago
--   SAL011  convenio con el Estado para atender poblacion del SUS
--   SRV001  tu cliente mas grande se atrasa en el pago
--   SOC001  el desembolso del cooperante llega con meses de atraso
-- Idempotente: repetirla deja el mismo resultado. No cambia el codigo ni el titulo.
-- ============================================================================

UPDATE eventos SET opciones_decision = '[
 {
  "letra": "A",
  "texto": "Seguir atendiendo al pagador y financiarte con crédito bancario",
  "consecuencias": {
   "deuda": "+8%",
   "caja": "+7%",
   "dias_cobro": "+30"
  },
  "feedback_corto": "Mantienes volumen y vínculo, pero pagas intereses y, si el atraso se prolonga, el crédito se agota"
 },
 {
  "letra": "B",
  "texto": "Reducir cupos o dejar de atender al pagador atrasado",
  "consecuencias": {
   "demanda": "*0.88",
   "caja": "+3%",
   "dias_cobro": "-10"
  },
  "feedback_corto": "Dejas de acumular cartera dudosa, pero pierdes pacientes y ocupación mientras el costo fijo sigue"
 },
 {
  "letra": "C",
  "texto": "Invertir en facturación y cumplimiento documental",
  "consecuencias": {
   "costos": "+3%",
   "caja": "+3%",
   "reputacion": "+1%",
   "dias_cobro": "-15"
  },
  "feedback_corto": "Bajan los expedientes devueltos, con un gasto fijo adicional que no elimina el atraso de fondo"
 },
 {
  "letra": "D",
  "texto": "Dar prioridad a pacientes de bolsillo y aseguradora privada",
  "consecuencias": {
   "demanda": "*0.93",
   "caja": "+4%",
   "precio_venta": "*1.02",
   "dias_cobro": "-25"
  },
  "feedback_corto": "Cobras rápido y cuidas la caja, pero renuncias a volumen y la capacidad ociosa pesa en el margen"
 }
]'::jsonb WHERE codigo = 'SAL001';

UPDATE eventos SET opciones_decision = '[
 {
  "letra": "A",
  "texto": "Firmar el convenio para llenar capacidad ociosa",
  "consecuencias": {
   "demanda": "*1.20",
   "precio_venta": "*0.94",
   "caja": "-4%",
   "dias_cobro": "+45"
  },
  "feedback_corto": "Obtienes volumen estable, con pagos tardíos, dependencia política y tarifas bajas"
 },
 {
  "letra": "B",
  "texto": "Firmar con límite de cupo, por ejemplo 20% de la capacidad",
  "consecuencias": {
   "demanda": "*1.10",
   "caja": "-2%",
   "dias_cobro": "+15"
  },
  "feedback_corto": "Limitas el riesgo de cobro, con menos volumen, y el pagador puede pedir más"
 },
 {
  "letra": "C",
  "texto": "No firmar y apostar a pacientes de bolsillo y aseguradoras",
  "consecuencias": {
   "caja": "+3%",
   "demanda": "*0.98"
  },
  "feedback_corto": "Mantienes una caja sana, pero queda capacidad ociosa si la demanda privada es chica"
 },
 {
  "letra": "D",
  "texto": "Firmar solo para servicios de alta complejidad con mejor tarifa",
  "consecuencias": {
   "demanda": "*1.08",
   "precio_venta": "*1.03",
   "caja": "-3%",
   "dias_cobro": "+30"
  },
  "feedback_corto": "Ganas mejor margen por atención, con riesgo de procedimientos costosos que el Estado paga tarde"
 }
]'::jsonb WHERE codigo = 'SAL011';

UPDATE eventos SET opciones_decision = '[
 {
  "letra": "A",
  "texto": "Aceptar el plazo largo y financiarte con un préstamo puente",
  "consecuencias": {
   "deuda": "+6%",
   "caja": "+6%",
   "dias_cobro": "+30"
  },
  "feedback_corto": "Conservas al cliente y la relación, pero pagas intereses y, si se atrasa otra vez, el préstamo se vuelve permanente"
 },
 {
  "letra": "B",
  "texto": "Exigir el plazo original o frenar el trabajo",
  "consecuencias": {
   "demanda": "*0.90",
   "reputacion": "-3%",
   "caja": "+2%",
   "dias_cobro": "-15"
  },
  "feedback_corto": "Proteges tu caja, pero puedes perder al cliente más grande, y si pesa 40% de tus ingresos la pérdida supera el interés"
 },
 {
  "letra": "C",
  "texto": "Aceptar el plazo largo a cambio de un anticipo o descuento por pago anticipado",
  "consecuencias": {
   "caja": "+4%",
   "precio_venta": "*0.97",
   "dias_cobro": "+15"
  },
  "feedback_corto": "Mantienes la relación y mejoras la caja, a costa de reducir tu margen o depender más de ese cliente"
 },
 {
  "letra": "D",
  "texto": "Vender la factura a un tercero (factoraje) si existe en tu plaza",
  "consecuencias": {
   "caja": "+5%",
   "costos": "+2%",
   "dias_cobro": "-25"
  },
  "feedback_corto": "Obtienes caja inmediata, con una comisión o descuento, y no siempre está disponible en Bolivia"
 }
]'::jsonb WHERE codigo = 'SRV001';

UPDATE eventos SET opciones_decision = '[
 {
  "letra": "A",
  "texto": "Seguir operando con tu reserva propia",
  "consecuencias": {
   "caja": "-8%",
   "reputacion": "+3%",
   "dias_cobro": "+30"
  },
  "feedback_corto": "El servicio no se interrumpe ni pierdes beneficiarios, pero se agota la reserva y no queda margen para otro imprevisto"
 },
 {
  "letra": "B",
  "texto": "Reducir las actividades a lo esencial hasta que llegue el tramo",
  "consecuencias": {
   "costos": "-6%",
   "demanda": "*0.88",
   "reputacion": "-3%",
   "dias_cobro": "+30"
  },
  "feedback_corto": "Proteges la caja, pero baja la cobertura y el cooperante verá resultados menores en la siguiente evaluación"
 },
 {
  "letra": "C",
  "texto": "Pedir un préstamo puente a un banco o a otro donante",
  "consecuencias": {
   "caja": "+6%",
   "deuda": "+8%",
   "dias_cobro": "-15"
  },
  "feedback_corto": "Evitas recortar, pero pagas intereses o condiciones, con fondos que eran para el proyecto"
 },
 {
  "letra": "D",
  "texto": "Despedir temporalmente al personal contratado por proyecto",
  "consecuencias": {
   "costos": "-10%",
   "demanda": "*0.85",
   "reputacion": "-6%",
   "dias_cobro": "+30"
  },
  "feedback_corto": "Alivio inmediato de caja, pero pierdes gente capacitada, pagas la recontratación y la confianza de las comunidades"
 }
]'::jsonb WHERE codigo = 'SOC001';
