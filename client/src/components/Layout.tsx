import { Link, useLocation } from "wouter";
import { ShieldCheck, ScanLine, User, HeartPulse } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: ShieldCheck },
    { href: "/scan", label: "Scan", icon: ScanLine },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/emergency", label: "SOS", icon: HeartPulse, isEmergency: true },
  ];

  return (
    <div className="min-h-screen flex flex-col md:max-w-4xl lg:max-w-6xl mx-auto bg-background/50 relative md:shadow-2xl overflow-hidden md:my-8 md:rounded-3xl md:border border-border">
      {/* Top Header */}
      <header className="px-6 py-6 flex items-center justify-between z-10 relative bg-white/50 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            AllerGuard
          </span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium",
                  isActive && !item.isEmergency ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                  item.isEmergency && "text-destructive hover:bg-destructive/10"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="max-w-md md:max-w-4xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile Only */}
      <nav className="fixed bottom-0 w-full left-0 right-0 md:hidden bg-white/80 backdrop-blur-xl border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 relative",
                  isActive && !item.isEmergency ? "text-primary" : "text-muted-foreground",
                  item.isEmergency && "text-destructive hover:text-red-600",
                  !item.isEmergency && "hover:bg-primary/5 hover:text-primary"
                )}
              >
                {isActive && !item.isEmergency && (
                  <span className="absolute -top-1 w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_8px_rgba(var(--primary),0.5)]" />
                )}
                <div className={cn(
                  "flex items-center justify-center transition-transform duration-300",
                  isActive ? "scale-110" : "scale-100",
                  item.isEmergency && "bg-destructive/10 text-destructive p-2.5 rounded-full"
                )}>
                  <Icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium transition-all",
                  isActive ? "opacity-100" : "opacity-70",
                  item.isEmergency && "text-destructive"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
