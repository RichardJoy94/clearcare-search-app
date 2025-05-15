'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './pricing.module.css';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Search for Medical Services',
    free: true,
    pro: true,
    description: 'Search and compare healthcare services in your area'
  },
  {
    name: 'View Basic Price Ranges',
    free: true,
    pro: true,
    description: 'See min and max prices for services'
  },
  {
    name: 'Save Searches to Account',
    free: true,
    pro: true,
    description: 'Save and manage your healthcare searches'
  },
  {
    name: 'Pricing Insight',
    free: 'Locked',
    pro: 'Full Access',
    description: 'Get detailed pricing analytics and trends'
  },
  {
    name: 'Predictive Cost Estimates',
    free: 'Coming Soon',
    pro: 'Coming Soon',
    description: 'AI-powered cost predictions based on historical data'
  },
  {
    name: 'Priority Support',
    free: false,
    pro: true,
    description: '24/7 priority customer support'
  }
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const token = await user.getIdToken();
      console.log('Starting checkout process...');
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Checkout error:', data);
        alert(`Failed to start checkout process: ${data.error || 'Unknown error'}`);
        return;
      }

      if (data.url) {
        console.log('Redirecting to checkout...');
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received:', data);
        alert('Failed to start checkout process. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    }
  };

  const CheckIcon = () => (
    <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const CrossIcon = () => (
    <svg className={styles.crossIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Get Full Access with ClearCare Pro</h1>
        <p>Unlock premium insights and make informed healthcare decisions</p>
      </motion.div>

      <motion.div 
        className={styles.pricingTable}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.tableHeader}>
          <div className={styles.featureColumn}>Features</div>
          <div className={styles.planColumn}>
            <h3>Free</h3>
            <p className={styles.price}>$0<span>/month</span></p>
          </div>
          <div className={`${styles.planColumn} ${styles.proColumn}`}>
            <div className={styles.proLabel}>Recommended</div>
            <h3>Pro</h3>
            <p className={styles.price}>$4.99<span>/month</span></p>
          </div>
        </div>

        <div className={styles.tableBody}>
          {features.map((feature, index) => (
            <motion.div 
              key={feature.name}
              className={styles.featureRow}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
            >
              <div className={styles.featureName}>
                {feature.name}
                <span className={styles.featureDescription}>{feature.description}</span>
              </div>
              <div className={styles.featureValue}>
                {typeof feature.free === 'boolean' ? (
                  feature.free ? <CheckIcon /> : <CrossIcon />
                ) : (
                  <span className={feature.free === 'Coming Soon' ? styles.comingSoon : styles.locked}>
                    {feature.free}
                  </span>
                )}
              </div>
              <div className={`${styles.featureValue} ${styles.proValue}`}>
                {typeof feature.pro === 'boolean' ? (
                  feature.pro ? <CheckIcon /> : <CrossIcon />
                ) : (
                  <span className={feature.pro === 'Coming Soon' ? styles.comingSoon : styles.fullAccess}>
                    {feature.pro}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className={styles.ctaSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <button 
          className={styles.upgradeButton}
          onClick={handleUpgrade}
        >
          Upgrade to Pro
        </button>
        <p className={styles.guarantee}>30-day guarantee on request, subject to review</p>
      </motion.div>
    </div>
  );
} 