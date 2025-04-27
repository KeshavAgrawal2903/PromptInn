import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, DollarSign, IndianRupee } from 'lucide-react';
import { useTransactionStore, Transaction } from '../store/transactionStore';
import { format } from 'date-fns';

export function TransactionHistory() {
  const { transactions, loading, fetchTransactions } = useTransactionStore();

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'debit':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'credit':
        return <ArrowDownRight className="w-5 h-5 text-green-500" />;
      case 'conversion':
        return <RefreshCcw className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return <DollarSign className="w-4 h-4" />;
      case 'INR':
        return <IndianRupee className="w-4 h-4" />;
      default:
        return currency;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        Transaction History
      </h3>

      <div className="space-y-4">
        <AnimatePresence>
          {transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.created_at), 'PPp')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  {getCurrencySymbol(transaction.source_currency)}
                  <span className={`font-semibold ${
                    transaction.type === 'debit' ? 'text-red-600 dark:text-red-400' :
                    transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {transaction.amount.toLocaleString()}
                  </span>
                </div>
                {transaction.type === 'conversion' && (
                  <div className="flex items-center justify-end space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    {getCurrencySymbol(transaction.target_currency)}
                    <span>{transaction.converted_amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {transactions.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No transactions found
          </p>
        )}
      </div>
    </div>
  );
}