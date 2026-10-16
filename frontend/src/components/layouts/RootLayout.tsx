import { Outlet } from 'react-router-dom';

import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';

export default function RootLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
