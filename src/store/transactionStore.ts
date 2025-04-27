import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Transaction {
  id: string;
  booking_id: string;
  amount: number;
  source_currency: string;
  target_currency: string;
  conversion_rate: number;
  converted_amount: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'debit' | 'credit' | 'conversion';
  description: string;
  created_at: string;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  createTransaction: (data: Omit<Transaction, 'id' | 'created_at'>) => Promise<Transaction>;
  fetchTransactions: () => Promise<void>;
  getExchangeRate: (from: string, to: string) => Promise<number>;
}

const EXCHANGE_RATES = {
  'USD_INR': 75,
  'INR_USD': 1/75,
  'EUR_INR': 85,
  'INR_EUR': 1/85,
  // Add more currency pairs as needed
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  createTransaction: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        transactions: [transaction, ...state.transactions],
        loading: false
      }));

      return transaction as Transaction;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Transaction failed', loading: false });
      throw error;
    }
  },

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          bookings (
            hotel_id,
            hotels (
              name,
              location
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ transactions: data as Transaction[], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch transactions', loading: false });
    }
  },

  getExchangeRate: async (from: string, to: string) => {
    // In a real app, you would call an external API for live rates
    const rate = EXCHANGE_RATES[`${from}_${to}`];
    if (!rate) throw new Error('Exchange rate not available');
    return rate;
  }
}));