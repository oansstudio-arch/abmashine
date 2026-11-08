import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Dumbbell, Home as HomeIcon, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminPanel from '@/components/AdminPanel';
import GoalWatcher from '@/components/GoalWatcher';

const TABS = [
  { to: '/home', label: 'Home', icon: HomeIcon },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Layout() {
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);
  const taps = useRef([]);

  useEffect(() => {
    const onTap = () => {
      const now = Date.now();
      taps.current = [...taps.current.filter((t) => now - t < 6000), now];
      if (taps.current.length >= 20) {
        taps.current = [];
        setAdminOpen(true);
      }
    };
    window.addEventListener('click', onTap);
    return () => window.removeEventListener('click', onTap);
  }, []);

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 aurora opacity-80" />

      <main className="relative mx-auto w-full max-w-md px-5 pb-4 pt-7 tab-safe">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-3 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn('relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition-colors',
                    isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 -z-10 rounded-2xl brand-gradient opacity-90"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]')} />
                    <span className="tracking-wide">{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <GoalWatcher />
      <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  );
}