import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Booking {
  id: string;
  user_id: string;
  hotel_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  createBooking: (booking: Omit<Booking, 'id' | 'user_id'>) => Promise<Booking>;
  fetchUserBookings: () => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  loading: false,
  createBooking: async (booking) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .insert([{ ...booking, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create booking');

    return data as Booking;
  },
  fetchUserBookings: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ bookings: data as Booking[], loading: false });
  },
  cancelBooking: async (bookingId) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) throw error;

    set(state => ({
      bookings: state.bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      )
    }));
  },
}));