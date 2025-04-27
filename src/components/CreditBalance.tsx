import React from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { useCreditStore } from '../store/creditStore';
import toast from 'react-hot-toast';

export function CreditBalance() {
  const { balance, loading, refreshCredits } = useCreditStore();

  const handleRefresh = () => {
    refreshCredits();
    toast.success('Credits refreshed! Check your new balance.');
  };

  return (
    <div className="flex items-center space-x-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center">
        <Wallet className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
        <span className="font-semibold text-gray-900 dark:text-white">
          {balance.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          })}
        </span>
      </div>
      <button
        onClick={handleRefresh}
        disabled={loading}
        className={`flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
}