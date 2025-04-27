import React, { useEffect, useState } from 'react';
import { useBookingStore, Booking } from '../store/bookingStore';
import { CreditBalance } from './CreditBalance';
import { TransactionHistory } from './TransactionHistory';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Calendar, Users, CreditCard, ChevronDown, ChevronUp, Search } from 'lucide-react';

export function UserDashboard() {
  const { bookings, loading, fetchUserBookings, cancelBooking } = useBookingStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'transactions'>('bookings');

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  const filteredBookings = bookings
    .filter(booking => 
      (selectedFilter === 'all' || booking.status === selectedFilter) &&
      (searchTerm === '' || 
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.check_in.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.check_out.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      const dateA = new Date(a.check_in).getTime();
      const dateB = new Date(b.check_in).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const filterButtons = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h2>
          <CreditBalance />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b dark:border-gray-700">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === 'bookings'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === 'transactions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Transactions
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'bookings' ? (
              <motion.div
                key="bookings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex gap-2">
                    {filterButtons.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedFilter(value as any)}
                        className={`px-4 py-2 rounded-lg transition ${
                          selectedFilter === value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  >
                    <Calendar className="w-4 h-4" />
                    {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredBookings.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                      >
                        No bookings found
                      </motion.div>
                    ) : (
                      filteredBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden"
                        >
                          <div
                            onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                          >
                            <div className="flex items-center gap-6">
                              <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                  'bg-yellow-100 text-yellow-600'}
                              `}>
                                {booking.status === 'confirmed' ? '✓' : booking.status === 'cancelled' ? '×' : '!'}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  Booking #{booking.id.slice(0, 8)}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {format(new Date(booking.check_in), 'PPP')} - {format(new Date(booking.check_out), 'PPP')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`
                                px-3 py-1 rounded-full text-sm font-medium
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
                              `}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              {expandedBooking === booking.id ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedBooking === booking.id && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 border-t dark:border-gray-600">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3">
                                      <Calendar className="w-5 h-5 text-gray-400" />
                                      <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))} nights
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Users className="w-5 h-5 text-gray-400" />
                                      <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Guests</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <CreditCard className="w-5 h-5 text-gray-400" />
                                      <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          ₹{booking.total_price.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {booking.status === 'pending' && (
                                    <div className="mt-6 flex justify-end">
                                      <button
                                        onClick={() => cancelBooking(booking.id)}
                                        className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                                      >
                                        Cancel Booking
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="transactions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <TransactionHistory />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}