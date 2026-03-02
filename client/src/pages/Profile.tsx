import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCircle, Save, Phone, Languages } from "lucide-react";
import { useLocalUser } from "@/hooks/use-local-user";
import { useUser, useCreateUser, useUpdateUser } from "@/hooks/use-users";

const ALL_ALLERGIES = ["Peanuts", "Tree Nuts", "Milk", "Egg", "Wheat", "Soy", "Fish", "Shellfish", "Sesame", "Mustard"];

export default function Profile() {
  const { userId, saveUserId } = useLocalUser();
  const { data: user, isLoading: isLoadingUser } = useUser(userId);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [language, setLanguage] = useState("en");

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAllergies(user.allergies);
      setEmergencyContact(user.emergencyContact || "");
      setLanguage(user.languagePreference);
    }
  }, [user]);

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Name is required");

    const payload = {
      name,
      allergies,
      languagePreference: language,
      emergencyContact: emergencyContact || null
    };

    try {
      if (user) {
        await updateMutation.mutateAsync({ id: user.id, ...payload });
      } else {
        const newUser = await createMutation.mutateAsync(payload);
        saveUserId(newUser.id);
      }
      alert("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (userId && isLoadingUser) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-6 pb-12"
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <UserCircle className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">Your Profile</h1>
          <p className="text-muted-foreground">Personalize your safety settings</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold mb-2">General Info</h3>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Emergency Contact
              </label>
              <input 
                type="tel"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                Preferred Language
              </label>
              <select 
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-all text-foreground appearance-none"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-3xl">
            <label className="block text-xl font-bold text-foreground mb-4">My Allergies</label>
            <p className="text-sm text-muted-foreground mb-6">Select all that apply to you. We'll check for these during every scan.</p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {ALL_ALLERGIES.map(allergy => {
                const isActive = allergies.includes(allergy);
                return (
                  <button
                    type="button"
                    key={allergy}
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-4 py-2.5 md:px-6 rounded-xl text-sm md:text-base font-bold transition-all duration-200 border-2 ${
                      isActive 
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105" 
                        : "bg-background text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full md:max-w-md py-5 rounded-2xl font-bold text-xl bg-foreground text-background shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? "Saving..." : (
              <>
                <Save className="w-6 h-6" />
                Save Profile Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
