import type { Metadata } from 'next';
import {
  Bebas_Neue,
  Bruno_Ace,
  Cinzel,
  DM_Sans,
  DM_Serif_Display,
  DM_Serif_Text,
  Geist,
  Geist_Mono,
  Inria_Sans,
  Instrument_Serif,
  Inter,
  Nova_Square,
  Quicksand,
  Roboto,
  Space_Grotesk,
} from 'next/font/google';
import localFont from 'next/font/local';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import './globals.css';

import { MotionProvider } from '@/components/motion';
import { QueryProvider, ThemeProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Display serif for the "COOK OFF 11.0" wordmark and problem headings
// (src/figma/Desktop - 15.png). Exact face pending designer confirmation —
// Instrument Serif is the closest freely licensed match to the mockup.
const instrumentSerif = Instrument_Serif({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
});

// Round 1 faces, taken verbatim from Figma frame `scratch` (312:1042).
const cinzel = Cinzel({ variable: '--font-wordmark', subsets: ['latin'], weight: '900' });
const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-scratch-display',
  subsets: ['latin'],
  weight: '400',
});
const dmSerifText = DM_Serif_Text({
  variable: '--font-scratch-text',
  subsets: ['latin'],
  weight: '400',
});
const dmSans = DM_Sans({ variable: '--font-scratch-sans', subsets: ['latin'], axes: ['opsz'] });
const quicksand = Quicksand({ variable: '--font-tab', subsets: ['latin'], weight: '700' });

// Problem title + points chip, from Figma `Desktop - 15` (312:1101).
const spaceGrotesk = Space_Grotesk({
  variable: '--font-problem',
  subsets: ['latin'],
  weight: '700',
});
const roboto = Roboto({ variable: '--font-chip', subsets: ['latin'], weight: ['400', '700'] });

// R2/R3 round badge + timer digits ("ROUND 2  00:11:52"), from Figma
// `Desktop - 15/14` (312:1101, 312:1216).
const brunoAce = Bruno_Ace({ variable: '--font-round', subsets: ['latin'], weight: '400' });
const inriaSans = Inria_Sans({ variable: '--font-inria', subsets: ['latin'], weight: '700' });
// General Sans isn't on Google Fonts — self-hosted from Fontshare (free commercial licence).
const generalSans = localFont({
  src: './fonts/GeneralSans-Medium.woff2',
  variable: '--font-general',
  weight: '500',
});

// Login screen wordmark, from Figma `Qc0hMJFVUSxi6jsnhx54Vk` (352:459/352:499).
const bebasNeue = Bebas_Neue({
  variable: '--font-login-display',
  subsets: ['latin'],
  weight: '400',
});
// Login screen Google-style button copy — separate from `--font-chip` (Roboto 700,
// dedicated to the R2/R3 points chip) since these rows need 400/500 weights.
const robotoLogin = Roboto({
  variable: '--font-login-body',
  subsets: ['latin'],
  weight: ['400', '500'],
});

// Dashboard "Timeline:" heading, from Figma `Qc0hMJFVUSxi6jsnhx54Vk` (323:1984).
const novaSquare = Nova_Square({ variable: '--font-timeline', subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: 'CookOff 11.0',
  description: 'The competitive programming contest platform for CodeChef-VIT CookOff 11.0.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        instrumentSerif.variable,
        cinzel.variable,
        dmSerifDisplay.variable,
        dmSerifText.variable,
        dmSans.variable,
        quicksand.variable,
        spaceGrotesk.variable,
        roboto.variable,
        brunoAce.variable,
        inriaSans.variable,
        generalSans.variable,
        bebasNeue.variable,
        robotoLogin.variable,
        novaSquare.variable,
        'font-sans',
        inter.variable
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <NuqsAdapter>
              <MotionProvider>{children}</MotionProvider>
            </NuqsAdapter>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
