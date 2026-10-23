import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FlaskConical, 
  Wallet, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

const navItems = [
  { href: '/create-pool', label: 'Launch', icon: FlaskConical },
  { href: '/', label: 'Explore', icon: Home },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
];

export const Sidebar = () => {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-card/95 backdrop-blur-sm border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="h-16 flex items-center gap-2 px-2 mb-6">
            <img src="/vexlore-logo.jpg" alt="Vexlore" className="h-8 w-8 rounded-lg logo-glow" />
            <span className="text-lg font-bold tracking-tight">Vexlore</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href || (item.href === '/create-pool' && router.pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-border space-y-1">
            <a href="https://vexlore.xyz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              Website
            </a>
            <a href="https://t.me/VexloreBot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              Telegram Bot
            </a>
            <a href="https://x.com/Vexlorebot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              X / Twitter
            </a>
            <a href="https://github.com/robinnnn0101-ship-it/vexlorepad" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
