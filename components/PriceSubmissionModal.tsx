'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PriceSubmissionModal.module.css';

interface PriceSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

interface PriceSubmission {
  providerName: string;
  pricePaid: number;
  insuranceStatus: 'insured' | 'uninsured' | 'medicare' | 'medicaid';
  insurancePlan?: string;
  zipCode?: string;
  serviceName: string;
}

export function PriceSubmissionModal({ isOpen, onClose, serviceName }: PriceSubmissionModalProps) {
  const [formData, setFormData] = useState<PriceSubmission>({
    providerName: '',
    pricePaid: 0,
    insuranceStatus: 'insured',
    insurancePlan: '',
    zipCode: '',
    serviceName: serviceName
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState('');

  // List of example providers - in production, this would come from an API
  const providers = [
    'Mount Sinai Hospital',
    'NYU Langone Health',
    'NewYork-Presbyterian',
    'Memorial Sloan Kettering',
    'Lenox Hill Hospital',
    'Other'
  ];

  useEffect(() => {
    if (showThankYou) {
      const timer = setTimeout(() => {
        setShowThankYou(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showThankYou, onClose]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      serviceName: serviceName
    }));
  }, [serviceName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Debug log
    console.log('Submitting form data:', formData);

    // Client-side validation
    if (!formData.serviceName) {
      setError('Service name is missing');
      setIsSubmitting(false);
      return;
    }

    if (!formData.providerName) {
      setError('Please select a provider');
      setIsSubmitting(false);
      return;
    }

    if (!formData.pricePaid || formData.pricePaid <= 0) {
      setError('Please enter a valid price (greater than 0)');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Sending request to API...');
      const response = await fetch('/api/user-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result.error + (result.details ? `: ${result.details}` : ''));
      }

      setShowThankYou(true);
      setFormData({
        providerName: '',
        pricePaid: 0,
        insuranceStatus: 'insured',
        insurancePlan: '',
        zipCode: '',
        serviceName: serviceName // Keep the service name when resetting
      });
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit price information. Please try again.';
      setError(errorMessage);
      
      // Log additional error details
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {showThankYou ? (
            <div className={styles.thankYou}>
              <div className={styles.checkmark}>✓</div>
              <h3>Thanks!</h3>
              <p>Your info helps other patients make smarter decisions.</p>
            </div>
          ) : (
            <>
              <button onClick={onClose} className={styles.closeButton}>×</button>
              <h2>Share Your Price Experience</h2>
              <p className={styles.subtitle}>Help others by sharing what you paid for {serviceName}</p>
              
              {error && <div className={styles.error}>{error}</div>}
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="providerName">Provider Name*</label>
                  <select
                    id="providerName"
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    required
                    className={styles.select}
                  >
                    <option value="">Select a provider</option>
                    {providers.map((provider) => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="pricePaid">Price Paid*</label>
                  <div className={styles.priceInput}>
                    <span className={styles.dollarSign}>$</span>
                    <input
                      type="number"
                      id="pricePaid"
                      value={formData.pricePaid || ''}
                      onChange={(e) => setFormData({ ...formData, pricePaid: Number(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      className={styles.input}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="insuranceStatus">Insurance Status*</label>
                  <select
                    id="insuranceStatus"
                    value={formData.insuranceStatus}
                    onChange={(e) => setFormData({ ...formData, insuranceStatus: e.target.value as PriceSubmission['insuranceStatus'] })}
                    required
                    className={styles.select}
                  >
                    <option value="insured">Private Insurance</option>
                    <option value="uninsured">No Insurance</option>
                    <option value="medicare">Medicare</option>
                    <option value="medicaid">Medicaid</option>
                  </select>
                </div>

                {formData.insuranceStatus === 'insured' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="insurancePlan">Insurance Plan (Optional)</label>
                    <input
                      type="text"
                      id="insurancePlan"
                      value={formData.insurancePlan}
                      onChange={(e) => setFormData({ ...formData, insurancePlan: e.target.value })}
                      className={styles.input}
                      placeholder="e.g., Blue Cross PPO"
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="zipCode">ZIP Code (Optional)</label>
                  <input
                    type="text"
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setFormData({ ...formData, zipCode: value });
                    }}
                    className={styles.input}
                    placeholder="12345"
                    pattern="[0-9]{5}"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Price Info'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 