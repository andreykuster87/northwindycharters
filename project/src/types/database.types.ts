export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sailors: {
        Row: {
          id: string
          name: string
          verified: boolean
          phone: string
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          verified?: boolean
          phone: string
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          verified?: boolean
          phone?: string
          photo_url?: string | null
          created_at?: string
        }
      }
      boats: {
        Row: {
          id: string
          sailor_id: string
          name: string
          photo_url: string
          capacity: number
          price_per_hour: number
          marina_location: string
          safety_equipment: string
          cancellation_policy: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          sailor_id: string
          name: string
          photo_url: string
          capacity: number
          price_per_hour: number
          marina_location: string
          safety_equipment: string
          cancellation_policy: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          sailor_id?: string
          name?: string
          photo_url?: string
          capacity?: number
          price_per_hour?: number
          marina_location?: string
          safety_equipment?: string
          cancellation_policy?: string
          description?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          boat_id: string
          customer_name: string
          customer_phone: string
          booking_date: string
          time_slot: string
          status: string
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          boat_id: string
          customer_name: string
          customer_phone: string
          booking_date: string
          time_slot: string
          status?: string
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          boat_id?: string
          customer_name?: string
          customer_phone?: string
          booking_date?: string
          time_slot?: string
          status?: string
          total_price?: number
          created_at?: string
        }
      }
    }
  }
}
