// src/lib/config.ts
// Datos del negocio — reemplaza estos placeholders por los datos reales antes de publicar

export const WHATSAPP_NUMBER = "584141234567"; // formato internacional, sin '+' ni espacios

export const PAYMENT_INFO = {
  pago_movil: {
    label: "Pago Móvil",
    details: ["Banco: Banesco", "Teléfono: 0414-1234567", "Cédula: V-12345678"],
  },
  zelle: {
    label: "Zelle",
    details: ["Correo: pagos@ladespensa.com", "Nombre: La Despensa C.A."],
  },
  binance: {
    label: "Binance Pay",
    details: ["Pay ID: 123456789", "Usuario: LaDespensaVE"],
  },
  efectivo: {
    label: "Efectivo contra entrega",
    details: ["Pagas en efectivo (Bs o USD) al recibir tu pedido."],
  },
} as const;

export type PaymentMethodKey = keyof typeof PAYMENT_INFO;
