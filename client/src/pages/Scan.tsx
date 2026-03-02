import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, X, Loader2, Search } from "lucide-react";
import Tesseract from "tesseract.js";
import { useAnalyzeScan } from "@/hooks/use-scans";
import { useLocalUser } from "@/hooks/use-local-user";
import { useUser } from "@/hooks/use-users";
import { ScanResultCard } from "@/components/ScanResultCard";

const COMMON_ALLERGIES = ["Peanuts", "Tree Nuts", "Milk", "Egg", "Wheat", "Soy", "Fish", "Shellfish"];

export default function Scan() {
  const { userId } = useLocalUser();
  const { data: user } = useUser(userId);
  
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("Preparing image...");
  
  // Local allergies state if user is not logged in, or override
  const [activeAllergies, setActiveAllergies] = useState<string[]>([]);
  const analyzeMutation = useAnalyzeScan();

  // Sync user allergies if they exist and local is empty
  if (user && activeAllergies.length === 0 && user.allergies.length > 0) {
    setActiveAllergies(user.allergies);
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    maxFiles: 1 
  });

  const handleScan = async () => {
    if (!image) return;
    
    if (activeAllergies.length === 0) {
      alert("Please select at least one allergy to check for.");
      return;
    }

    setIsScanning(true);
    try {
      setScanProgress("Extracting text via AI...");
      
      const worker = await Tesseract.createWorker("eng");
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      setScanProgress("Analyzing ingredients...");
      
      await analyzeMutation.mutateAsync({
        extractedText: text,
        allergies: activeAllergies,
        language: "en",
        userId: userId || undefined
      });

    } catch (error) {
      console.error("Scan failed", error);
      alert("Failed to analyze image. Please try again or take a clearer picture.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setImage(null);
    analyzeMutation.reset();
  };

  const toggleAllergy = (allergy: string) => {
    setActiveAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  return (
    <div className="pt-6 pb-12 flex flex-col min-h-[calc(100vh-100px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold mb-2">Scan Label</h1>
        <p className="text-muted-foreground">Upload or capture an ingredient list.</p>
      </div>

      <AnimatePresence mode="wait">
        {analyzeMutation.data ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto w-full">
            <ScanResultCard result={analyzeMutation.data} onReset={resetScan} />
          </motion.div>
        ) : isScanning ? (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-white/50 rounded-3xl border shadow-inner max-w-2xl mx-auto w-full"
          >
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8 rounded-2xl overflow-hidden border-4 border-primary/20 bg-black/5 shadow-2xl">
              {image && <img src={image} alt="Scanning" className="w-full h-full object-cover opacity-50" />}
              <div className="scan-line" />
            </div>
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-xl md:text-2xl font-bold text-foreground animate-pulse">{scanProgress}</p>
          </motion.div>
        ) : (
          <motion.div 
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1 max-w-4xl mx-auto w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div className="flex flex-col">
                {!image ? (
                  <div 
                    {...getRootProps()} 
                    className={`flex-1 min-h-[300px] border-3 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 ${
                      isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-black/5"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-bold text-center mb-1">Upload Label Image</p>
                    <p className="text-sm text-muted-foreground text-center">Drag and drop or click to browse</p>
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden shadow-xl border bg-black h-full min-h-[300px]">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <img src={image} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between">
                <div className="glass-card p-6 rounded-3xl mb-6">
                  <h3 className="font-bold text-xl mb-4">Checking for Allergies:</h3>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_ALLERGIES.map(allergy => {
                      const isActive = activeAllergies.includes(allergy);
                      return (
                        <button
                          key={allergy}
                          onClick={() => toggleAllergy(allergy)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                            isActive 
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105" 
                              : "bg-white dark:bg-gray-800 text-muted-foreground border-border hover:border-primary/30"
                          }`}
                        >
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    * Make sure the text on the label is clear and well-lit for the best results.
                  </p>
                </div>

                <button
                  disabled={!image || activeAllergies.length === 0}
                  onClick={handleScan}
                  className="w-full py-5 rounded-2xl font-bold text-xl bg-gradient-to-r from-primary to-blue-500 text-white shadow-xl shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                >
                  <Search className="w-6 h-6" />
                  Analyze Label Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
