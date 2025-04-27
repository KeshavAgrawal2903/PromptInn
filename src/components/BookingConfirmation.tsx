import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Users, CreditCard } from 'lucide-react';
import Confetti from 'react-confetti';
import { format } from 'date-fns';
import { Booking } from '../store/bookingStore';

interface BookingConfirmationProps {
  booking: Booking;
  hotel: any;
  onClose: () => void;
}

export function BookingConfirmation({ booking, hotel, onClose }: BookingConfirmationProps) {
  const [showConfetti, setShowConfetti] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showConfetti && <Confetti />}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 relative"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your stay at {hotel.name} has been successfully booked.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Calendar className="w-5 h-5 mr-3" />
            <div>
              <p className="font-medium">Check-in</p>
              <p>{format(new Date(booking.check_in), 'PPP')}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Calendar className="w-5 h-5 mr-3" />
            <div>
              <p className="font-medium">Check-out</p>
              <p>{format(new Date(booking.check_out), 'PPP')}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Users className="w-5 h-5 mr-3" />
            <div>
              <p className="font-medium">Guests</p>
              <p>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <CreditCard className="w-5 h-5 mr-3" />
            <div>
              <p className="font-medium">Total Paid</p>
              <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                {hotel.location.toLowerCase().includes('india') ? '₹' : '$'}
                {booking.total_price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg mb-6">
          <p className="text-green-800 dark:text-green-200 text-sm">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
}