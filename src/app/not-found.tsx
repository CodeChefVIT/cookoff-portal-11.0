import Image from 'next/image';
import Link from 'next/link';

import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#141515]"
      aria-labelledby="not-found-title"
    >
      <h1 id="not-found-title" className="sr-only">
        404 - Page not found
      </h1>

      <div className="relative aspect-[1440/1024] w-[min(100vw,140.625vh)]">
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
          className="absolute top-[72.95%] left-[46.25%] h-[5.18%] w-[10.27%] rounded-md transition-[background-color,box-shadow] duration-200 hover:bg-white/10 focus:bg-white/10 focus:ring-2 focus:ring-white focus:outline-none"
        />
      </div>
    </main>
  );
}
