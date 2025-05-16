'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSearchLimit } from '../contexts/SearchLimitContext';

export function SearchGate() {
  const { isLimitReached, isDismissed, dismissGate } = useSearchLimit();
  const router = useRouter();

  if (!isLimitReached || isDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={dismissGate}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Create a free account to continue searching
          </h2>
          
          <p className="text-gray-600 mb-6">
            Create a free account to continue searching and save your care plan.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => router.push('/signup')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Free Account
            </button>
            
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              ✨ <span className="font-semibold">Premium Feature:</span> Unlock personalized insurance insights with Premium
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 