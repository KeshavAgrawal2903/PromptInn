import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import { usePaymentStore } from '../store/paymentStore';
import { useNotificationStore } from '../store/notificationStore';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  currency: string;
}

export function PaymentModal({ isOpen, onClose, bookingId, amount, currency }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const { processPayment, loading } = usePaymentStore();
  const { createNotification } = useNotificationStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await processPayment(bookingId, amount, currency, 'credit_card');
      setShowConfetti(true);
      
      await createNotification(
        'Payment Successful',
        `Your payment of ${currency} ${amount} has been processed successfully.`,
        'payment'
      );

      toast.success('Payment processed successfully!');
      
      setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 3000);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showConfetti && <Confetti />}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Complete Payment
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  className="pl-10 w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="pl-10 w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="MM/YY"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className="pl-10 w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currency} {amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Processing Fee:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currency} 0
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : `Pay ${currency} ${amount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}