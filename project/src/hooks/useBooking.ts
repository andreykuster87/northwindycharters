// src/hooks/useBooking.ts — MIGRADO PARA SUPABASE
import { useState } from 'react';
import { supabase }              from '../lib/supabase';
import { generateWhatsAppLink }  from '../utils/whatsapp';
import type { BookingData }      from '../components/modals/BookingModal';
import type { CatalogBoat }      from '../lib/catalog';

interface BoatSelection {
  boat:  CatalogBoat;
  date?: string;
  slot?: string;
}

export function useBooking() {
  const [selection, setSelection] = useState<BoatSelection | null>(null);

  function selectBoat(boat: CatalogBoat, date?: string, slot?: string) {
    setSelection({ boat, date, slot });
  }

  function clearBoat() {
    setSelection(null);
  }

  async function confirmPublicBooking(bookingData: BookingData) {
    const boat        = bookingData.boat;
    const sailorPhone = selection?.boat.sailor.phone || '5511999999999';

    // Busca o trip para obter o sailor_id
    const { data: trip } = await supabase
      .from('trips').select('sailor_id').eq('id', boat.id).single();

    // Gera o próximo booking_number via contador do banco
    const { data: cnt } = await supabase.rpc('next_counter', { counter_key: 'booking_counter' });

    await supabase.from('bookings').insert({
      trip_id:        boat.id,
      sailor_id:      trip?.sailor_id || null,
      customer_name:  bookingData.customerName,
      customer_phone: bookingData.customerPhone,
      booking_date:   bookingData.date,
      time_slot:      bookingData.timeSlot || '00:00',
      passengers:     bookingData.passengers,
      notes:          bookingData.notes || '',
      total_price:    boat.price_per_hour * bookingData.passengers,
      status:         'pending',
      booking_number: Number(cnt),
      guests:         [],
    });

    const link   = generateWhatsAppLink(bookingData, sailorPhone);
    const newWin = window.open(link, '_blank');
    if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
      window.location.href = link;
    }

    setSelection(null);
  }

  return {
    selectedBoat: selection?.boat  ?? null,
    preDate:      selection?.date,
    preSlot:      selection?.slot,
    selectBoat,
    clearBoat,
    confirmPublicBooking,
  };
}