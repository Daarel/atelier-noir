import { Link, Outlet } from 'react-router-dom';

import { ThemeToggle } from '@/components/ThemeToggle';

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header / Navbar */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold tracking-wider">
            ATELIER NOIR
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Katalog</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Masuk</Link>
            <Link to="/signup" className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">
              Daftar
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Atelier Noir. All rights reserved.
      </footer>
    </div>
  );
}