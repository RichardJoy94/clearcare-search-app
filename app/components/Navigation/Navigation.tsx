'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <a href="https://clearcarehq.com/" target="_blank" rel="noopener noreferrer">
          <img src="/logo.svg" alt="ClearCare" className={styles.logoImage} />
        </a>
      </div>

      <div className={styles.links}>
        <a href="https://clearcarehq.com/about" target="_blank" rel="noopener noreferrer" className={styles.link}>About</a>
        <a href="https://app.clearcarehq.com" className={styles.link}>Services</a>
        <a href="https://clearcarehq.com/blog" target="_blank" rel="noopener noreferrer" className={styles.link}>Blog</a>
        <a href="https://clearcarehq.com/contact" target="_blank" rel="noopener noreferrer" className={styles.link}>Contact</a>
      </div>

      <div>
        {user ? (
          <motion.div 
            className={styles.accountContainer}
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Link 
              href="/account" 
              className={`${styles.accountButton} ${pathname === '/account' ? styles.active : ''}`}
            >
              My Account
            </Link>
            <button 
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Log Out
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className={styles.authContainer}
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Link 
              href="/login" 
              className={`${styles.loginButton} ${pathname === '/login' ? styles.active : ''}`}
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className={`${styles.signupButton} ${pathname === '/signup' ? styles.active : ''}`}
            >
              Sign Up
            </Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
} 