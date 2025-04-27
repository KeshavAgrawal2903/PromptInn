import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useCreditStore } from '../store/creditStore';
import { PaymentModal } from './PaymentModal';
import { BookingConfirmation } from './BookingConfirmation';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface BookingModalProps {
  hotel: any;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ hotel, isOpen, onClose }: BookingModalProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const { createBooking } = useBookingStore();
  const { balance, deductCredits } = useCreditStore();

  if (!isOpen) return null;

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return hotel.price_per_night * nights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const total = calculateTotal();
    if (total > balance) {
      toast.error('Insufficient credits! Please refresh your balance.');
      return;
    }

    try {
      const booking = await createBooking({
        hotel_id: hotel.id,
        check_in: checkIn.toISOString().split('T')[0],
        check_out: checkOut.toISOString().split('T')[0],
        guests,
        total_price: total,
        status: 'pending'
      });
      
      if (deductCredits(total)) {
        setConfirmedBooking(booking);
        toast.success('Payment successful!');
      } else {
        toast.error('Payment failed! Insufficient credits.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  if (confirmedBooking) {
    return (
      <BookingConfirmation
        booking={confirmedBooking}
        hotel={hotel}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Book {hotel.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Check-in Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <DatePicker
                selected={checkIn}
                onChange={date => setCheckIn(date)}
                minDate={new Date()}
                className="pl-10 w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholderText="Select check-in date"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Check-out Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <DatePicker
                selected={checkOut}
                onChange={date => setCheckOut(date)}
                minDate={checkIn || new Date()}
                className="pl-10 w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholderText="Select check-out date"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Guests
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                min="1"
                max="10"
                className="pl-10 w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Available Credits:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{balance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600 dark:text-gray-300">Total:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {hotel.location.toLowerCase().includes('india') ? '₹' : '$'}
                {calculateTotal().toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {checkIn && checkOut ? (
                `for ${Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights`
              ) : 'Select dates to see total'}
            </p>
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
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}