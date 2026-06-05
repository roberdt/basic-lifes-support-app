import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Basic Life Support',
  description: 'Basic Life Support training scheduler and calendar access portal.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {/* Google Analytics / Google Tag Manager */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YGM5LC8RZW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RFHP2E0FNT');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

