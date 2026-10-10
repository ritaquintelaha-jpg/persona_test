import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Persona Studio — Product Persona Management',
  description: 'Create, manage, and update personas grounded in your product intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
      </body>
    </html>
  );
}
