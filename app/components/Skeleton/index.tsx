import styles from './Skeleton.module.css';

interface SkeletonProps {
  count?: number;
}

export default function Skeleton({ count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeleton}>
          <div className={styles.header}>
            <div className={`${styles.shimmer} ${styles.title}`} />
          </div>
          <div className={styles.content}>
            <div className={`${styles.shimmer} ${styles.line}`} />
            <div className={`${styles.shimmer} ${styles.line}`} style={{ width: '85%' }} />
            <div className={`${styles.shimmer} ${styles.line}`} style={{ width: '75%' }} />
          </div>
        </div>
      ))}
    </>
  );
} 