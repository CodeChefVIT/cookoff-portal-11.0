import Image from 'next/image';
import Link from 'next/link';

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
          src="/404-error.svg"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-contain"
        />

        <Link
          href="/dashboard"
          prefetch={false}
          aria-label="Return to dashboard"
          className="absolute top-[72.95%] left-[46.25%] h-[5.18%] w-[10.27%] rounded-md focus:ring-2 focus:ring-white focus:outline-none"
        />
      </div>
    </main>
  );
}
