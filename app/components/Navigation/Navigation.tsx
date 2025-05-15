'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();
  const isLoggedIn = false; // Placeholder for auth state

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <a href="https://clearcarehq.com/" target="_blank" rel="noopener noreferrer">
          <img src="/logo.svg" alt="ClearCare" className={styles.logoImage} />
        </a>
      </div>

      <div className={styles.links}>
        <Link href="/about" className={styles.link}>About</Link>
        <Link href="/services" className={styles.link}>Services</Link>
        <Link href="/blog" className={styles.link}>Blog</Link>
        <Link href="/contact" className={styles.link}>Contact</Link>
      </div>

      <div className={styles.authLinks}>
        {isLoggedIn ? (
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