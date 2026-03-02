import { motion } from "framer-motion";
import { Link } from "wouter";
import { ScanLine, AlertCircle, ChevronRight, ShieldCheck } from "lucide-react";
import { useLocalUser } from "@/hooks/use-local-user";
import { useUser } from "@/hooks/use-users";

export default function Home() {
  const { userId } = useLocalUser();
  const { data: user, isLoading } = useUser(userId);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full justify-center pt-8 pb-12"
    >
      <motion.div variants={item} className="text-center mb-10 md:mb-16">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl mb-6 shadow-inner">
          <ShieldCheck className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground mb-4">
          Eat with <span className="text-gradient">Confidence</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[280px] md:max-w-md mx-auto">
          Scan food labels instantly to detect hidden allergens and stay safe.
        </p>
      </motion.div>

      {/* Content Grid for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto w-full px-2">
        {/* Greeting Card */}
        {!isLoading && (
          <motion.div variants={item} className="md:col-span-2">
            {user ? (
              <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Welcome back,</p>
                  <p className="font-bold text-xl md:text-2xl">{user.name}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {user.allergies.map(a => (
                      <span key={a} className="text-xs md:text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-semibold">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href="/profile" className="p-3 bg-secondary rounded-2xl hover:bg-secondary/80 transition-all hover:scale-105">
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </Link>
              </div>
            ) : (
              <Link href="/profile" className="block w-full">
                <div className="glass-card p-6 rounded-3xl border-dashed border-2 border-primary/30 flex items-center justify-between hover:bg-primary/5 transition-all group">
                  <div>
                    <p className="font-bold text-xl text-foreground">Complete Setup</p>
                    <p className="text-sm text-muted-foreground">Add your allergies to start scanning safely</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            )}
          </motion.div>
        )}

        {/* Main Actions */}
        <motion.div variants={item} className="w-full">
          <Link 
            href="/scan"
            className="group relative overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 bg-gradient-to-br from-primary to-blue-500 rounded-3xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 h-full text-center md:text-left"
          >
            <div className="relative z-10 mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">Scan Food Label</h3>
              <p className="text-primary-foreground/90 text-sm md:text-base font-medium">Use AI to check ingredients instantly</p>
            </div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
              <ScanLine className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div className="absolute -right-6 -top-6 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
          </Link>
        </motion.div>

        <motion.div variants={item} className="w-full">
          <Link 
            href="/emergency"
            className="group relative flex flex-col md:flex-row items-center justify-between p-8 bg-white dark:bg-gray-900 border-2 border-destructive/20 rounded-3xl shadow-lg hover:border-destructive/50 hover:shadow-destructive/20 hover:-translate-y-1 transition-all duration-300 h-full text-center md:text-left"
          >
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-destructive mb-2">Emergency Mode</h3>
              <p className="text-muted-foreground text-sm md:text-base font-medium">Get immediate help and first aid steps</p>
            </div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-destructive/10 rounded-2xl flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-all text-destructive">
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
