import styles from './Skeleton.module.css';

interface SkeletonProps {
  type?: 'text' | 'title' | 'rectangle' | 'circle';
  width?: string;
  height?: string;
  count?: number;
}

export default function Skeleton({
  type = 'text',
  width = '100%',
  height = '1rem',
  count = 1
}: SkeletonProps) {
  const elements = Array(count).fill(null);

  return (
    <>
      {elements.map((_, index) => (
        <div
          key={index}
          className={`${styles.skeleton} ${styles[type]}`}
          style={{ width, height }}
        />
      ))}
    </>
  );
}

export function ResultCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton type="title" height="2rem" />
      <div className={styles.content}>
        <Skeleton count={3} />
        <Skeleton width="60%" />
      </div>
      <div className={styles.footer}>
        <Skeleton width="30%" />
      </div>
    </div>
  );
} 