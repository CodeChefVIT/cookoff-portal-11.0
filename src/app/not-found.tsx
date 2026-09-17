import Image from 'next/image';
import Link from 'next/link';

import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page} aria-labelledby="not-found-title">
      <h1 id="not-found-title" className="sr-only">
        404 - Page not found
      </h1>

      <div className={styles.stage}>
        <Image
          src="/404-background.svg"
          alt=""
          fill
          preload
          unoptimized
          sizes="100vw"
          className="object-contain"
        />

        <div className="absolute top-[21.875%] left-[34.861%] size-[29.444%]">
          <Image src="/404-chef.png" alt="" fill preload sizes="29.444vw" className={styles.chef} />
        </div>

        <Link
          href="/dashboard"
          prefetch={false}
          aria-label="Return to dashboard"
          className={styles.homeLink}
        />
      </div>
    </main>
  );
}
