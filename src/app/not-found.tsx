import Image from 'next/image';
import Link from 'next/link';

import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page} aria-labelledby="not-found-title">
      <h1 id="not-found-title" className="sr-only">
        404 - Page not found
      </h1>

      <div className={styles.contentGlow} aria-hidden="true" />

      <section className={styles.content}>
        <p className={styles.eyebrow}>Timeline error / 404</p>

        <div className={styles.heroMark}>
          <span className={styles.number}>404</span>
          <span className={styles.chefFrame}>
            <Image
              src="/dashboard/mascot.png"
              alt=""
              fill
              preload
              sizes="16rem"
              className={styles.chef}
            />
          </span>
        </div>

        <p className={styles.errorWord}>ERROR</p>
        <p className={styles.message}>Hang tight while we rewind the timeline!!</p>

        <Link href="/dashboard" prefetch={false} className={styles.homeLink}>
          Return to dashboard <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}
