import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CreditState {
  balance: number;
  loading: boolean;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  refreshCredits: () => void;
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set) => ({
      balance: 100000, // Starting balance (₹1,00,000 or $1,000)
      loading: false,
      addCredits: (amount) => set((state) => ({ balance: state.balance + amount })),
      deductCredits: (amount) => {
        let success = false;
        set((state) => {
          if (state.balance >= amount) {
            success = true;
            return { balance: state.balance - amount };
          }
          return state;
        });
        return success;
      },
      refreshCredits: () => {
        set({ loading: true });
        // Simulate credit refresh every 24 hours
        setTimeout(() => {
          set((state) => ({
            balance: state.balance + 50000, // Add ₹50,000 or $500
            loading: false
          }));
        }, 2000);
      },
    }),
    {
      name: 'user-credits',
    }
  )
);