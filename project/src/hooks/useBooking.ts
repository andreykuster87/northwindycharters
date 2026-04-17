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

    const { data: trip, error: tripErr } = await supabase
      .from('trips').select('sailor_id').eq('id', boat.id).single();
    if (tripErr) throw tripErr;

    const { data: cnt, error: cntErr } = await supabase.rpc('next_counter', { counter_key: 'booking_counter' });
    if (cntErr) throw cntErr;

    const { error: insErr } = await supabase.from('bookings').insert({
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
    if (insErr) {
      if (insErr.message?.includes('OVERBOOK')) throw new Error('OVERBOOK');
      throw insErr;
    }

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