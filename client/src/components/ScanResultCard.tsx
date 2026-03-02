import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XOctagon } from "lucide-react";
import type { ScanAnalysisResponse } from "@shared/schema";

interface ScanResultCardProps {
  result: ScanAnalysisResponse;
  onReset: () => void;
}

export function ScanResultCard({ result, onReset }: ScanResultCardProps) {
  const config = {
    SAFE: {
      color: "bg-success",
      bgClass: "bg-success/10",
      borderClass: "border-success/20",
      textClass: "text-success",
      icon: CheckCircle,
      title: "Safe to Eat",
    },
    CAUTION: {
      color: "bg-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/20",
      textClass: "text-warning",
      icon: AlertTriangle,
      title: "Proceed with Caution",
    },
    "NOT SAFE": {
      color: "bg-destructive",
      bgClass: "bg-destructive/10",
      borderClass: "border-destructive/20",
      textClass: "text-destructive",
      icon: XOctagon,
      title: "Do Not Eat!",
    },
  }[result.status];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`rounded-3xl p-6 border ${config.bgClass} ${config.borderClass} shadow-xl relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
      
      <div className="flex flex-col items-center text-center space-y-4 relative z-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center ${config.color} text-white shadow-lg`}
        >
          <Icon className="w-10 h-10" />
        </motion.div>
        
        <div>
          <h2 className={`text-2xl font-bold ${config.textClass}`}>{config.title}</h2>
          <p className="mt-2 text-foreground/80 font-medium">
            {result.message}
          </p>
        </div>

        {result.matchedAllergen && (
          <div className="bg-white/60 dark:bg-black/20 px-4 py-3 rounded-2xl w-full border border-black/5 mt-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Detected Allergen</p>
            <p className="text-lg font-bold text-foreground mt-1 capitalize">{result.matchedAllergen}</p>
          </div>
        )}

        <button
          onClick={onReset}
          className="mt-6 w-full py-4 rounded-xl font-bold bg-white dark:bg-black shadow hover:shadow-md transition-all active:scale-95 text-foreground"
        >
          Scan Another Item
        </button>
      </div>
    </motion.div>
  );
}
