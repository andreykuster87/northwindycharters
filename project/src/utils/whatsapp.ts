// src/utils/whatsapp.ts
import type { BookingData } from '../components/modals/BookingModal';

export function generateWhatsAppLink(booking: BookingData, sailorPhone: string): string {
  const phone = sailorPhone.replace(/\D/g, '');
  const phoneWithCountry = phone.startsWith('55') ? phone : `55${phone}`;

  const date = booking.date
    ? new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR')
    : 'A combinar';

  const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(booking.boat.price_per_hour * booking.passengers);

  const msg = [
    `🌊 *Solicitação de Reserva — NorthWindy*`,
    ``,
    `*Passeio:* ${booking.boat.name}`,
    `*Rota:* ${booking.boat.marina_location.split('·')[0].trim()}`,
    `*Data:* ${date}`,
    `*Pessoas:* ${booking.passengers}`,
    `*Total:* ${total}`,
    ``,
    `*Dados do cliente:*`,
    `Nome: ${booking.customerName}`,
    `WhatsApp: ${booking.customerPhone}`,
    booking.notes ? `Observações: ${booking.notes}` : '',
  ].filter(Boolean).join('\n');

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
}