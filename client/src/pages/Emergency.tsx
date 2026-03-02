import { motion } from "framer-motion";
import { PhoneCall, AlertTriangle, ShieldAlert, HeartPulse } from "lucide-react";
import { useLocalUser } from "@/hooks/use-local-user";
import { useUser } from "@/hooks/use-users";

export default function Emergency() {
  const { userId } = useLocalUser();
  const { data: user } = useUser(userId);

  const emergencyNumber = user?.emergencyContact || "112";

  const handleCall = () => {
    window.open(`tel:${emergencyNumber}`);
  };

  return (
    <div className="pt-6 pb-12 flex flex-col min-h-full">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-destructive/10 text-destructive rounded-full font-bold text-sm mb-4 border border-destructive/20">
          <ShieldAlert className="w-4 h-4 mr-2" />
          EMERGENCY MODE
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">Need Help?</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 items-start">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex flex-col items-center justify-center py-8 bg-white dark:bg-gray-900 rounded-[4rem] border shadow-2xl p-12"
        >
          <button 
            onClick={handleCall}
            className="relative group focus:outline-none mb-8"
          >
            <div className="absolute inset-0 rounded-full emergency-pulse" />
            <div className="relative w-64 h-64 md:w-72 md:h-72 bg-gradient-to-br from-red-500 to-destructive rounded-full flex flex-col items-center justify-center shadow-2xl text-white border-4 border-white/20 group-hover:scale-95 transition-transform duration-200">
              <PhoneCall className="w-16 h-16 md:w-20 md:h-20 mb-2 animate-bounce" />
              <span className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest">Call SOS</span>
              <span className="text-lg font-bold opacity-90 mt-1">{emergencyNumber}</span>
            </div>
          </button>
          <p className="text-center text-muted-foreground font-medium max-w-xs">
            Tap the button above to immediately call your emergency contact or local services.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-6"
        >
          <div className="glass-card rounded-3xl p-8 border-l-4 border-l-destructive shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-destructive/10 rounded-2xl">
                <HeartPulse className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">First Aid Steps</h2>
            </div>
            
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1 shadow-lg shadow-destructive/20">1</div>
                <div>
                  <p className="text-lg font-bold text-foreground">Inject Epinephrine (EpiPen)</p>
                  <p className="text-muted-foreground">Do this immediately if available and prescribed for severe reactions.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1 shadow-lg shadow-destructive/20">2</div>
                <div>
                  <p className="text-lg font-bold text-foreground">Call Services ({emergencyNumber})</p>
                  <p className="text-muted-foreground">Always seek medical help right away, even if symptoms seem to improve.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1 shadow-lg shadow-destructive/20">3</div>
                <div>
                  <p className="text-lg font-bold text-foreground">Lie Flat, Legs Up</p>
                  <p className="text-muted-foreground">Keep the person lying flat with legs elevated. Do not let them stand or walk.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1 shadow-lg shadow-destructive/20">4</div>
                <div>
                  <p className="text-lg font-bold text-foreground">Monitor Breathing</p>
                  <p className="text-muted-foreground">If breathing is difficult, help them sit up slightly. Use a prescribed inhaler.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400 font-bold mb-2">
              <AlertTriangle className="w-5 h-5" />
              Important Warning
            </div>
            <p className="text-amber-700 dark:text-amber-500 text-sm">
              Anaphylaxis is a life-threatening medical emergency. When in doubt, always use epinephrine and call for help.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
