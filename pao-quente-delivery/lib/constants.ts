// Constantes globais do projeto Pão Quente Delivery

export const WHATSAPP_NUMBER = "5517997749740";

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Gostaria de fazer um pedido."
)}`;

// Upload de imagens
export const MAX_UPLOAD_SIZE = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
