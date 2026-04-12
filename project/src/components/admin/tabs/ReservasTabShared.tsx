// src/components/admin/tabs/ReservasTabShared.tsx
import { getAllTrips, getBookings } from '../../../lib/localStore';

export const STATUS_CLASSES: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelado: 'bg-red-100 text-red-600 border-red-200',
};

export function getTripData(tripId: string) {
  try {
    return getAllTrips().find((t: any) => t.id === tripId);
  } catch { return null; }
}

export function getClientId(bookingId: string): string | null {
  try {
    return getBookings().find((b: any) => b.id === bookingId)?.client_id ?? null;
  } catch { return null; }
}
