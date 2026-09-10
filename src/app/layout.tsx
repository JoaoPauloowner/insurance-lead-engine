import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Insurance Lead Engine - Speed-to-Lead & Renewal Radar',
  description: 'Autonomous Speed-to-Lead acquisition, AI Voice qualification and Renewal Radar for insurance brokers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
