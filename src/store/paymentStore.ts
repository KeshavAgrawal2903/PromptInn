import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: string;
}

interface PaymentState {
  loading: boolean;
  error: string | null;
  processPayment: (bookingId: string, amount: number, currency: string, paymentMethod: string) => Promise<Payment>;
  getPaymentStatus: (paymentId: string) => Promise<Payment>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  loading: false,
  error: null,
  processPayment: async (bookingId, amount, currency, paymentMethod) => {
    set({ loading: true, error: null });
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          booking_id: bookingId,
          amount,
          currency,
          status: 'completed',
          payment_method: paymentMethod
        }])
        .select()
        .single();

      if (error) throw error;
      
      set({ loading: false });
      return data as Payment;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Payment failed', loading: false });
      throw error;
    }
  },
  getPaymentStatus: async (paymentId) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data as Payment;
  }
}));