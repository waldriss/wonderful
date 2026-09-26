"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  User, 
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  ShoppingBag,
  Save,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useProfile, useUpdateProfile, useUpdateAddress } from "@/lib/api/users";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "preferences">("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const updateAddressMutation = useUpdateAddress();

  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Algérie"
  });

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address?.street || "",
        city: profile.address?.city || "",
        postalCode: profile.address?.postalCode || "",
        country: profile.address?.country || "Algérie"
      });
    }
  }, [profile]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: true,
    dietaryRestrictions: ["Végétarien"],
    allergies: ["Fruits à coque"]
  });

  const tabs = [
    { id: "personal" as const, label: "Informations personnelles", icon: User },
    { id: "security" as const, label: "Sécurité", icon: Lock },
    { id: "preferences" as const, label: "Préférences", icon: Bell }
  ];

  const dietaryOptions = [
    "Végétarien", "Végétalien", "Sans gluten", 
    "Sans lactose", "Halal", "Casher"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
          <User className="w-8 h-8 text-secondary" />
          Mon Profil
        </h1>
        <p className="text-secondary-850/60 font-sans mt-1">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-2 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[200px] h-12 px-4 rounded-xl font-sans font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? "bg-secondary text-white"
                : "bg-transparent text-secondary-850/60 hover:bg-secondary/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {activeTab === "personal" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <h2 className="text-xl font-sans font-bold text-secondary-850 mb-6">
            Informations personnelles
          </h2>

          <div className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                  Nom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adresse
              </label>
              <input
                type="text"
                value={personalInfo.address}
                onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={personalInfo.city}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={personalInfo.postalCode}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, postalCode: e.target.value })}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={personalInfo.country}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={updateProfileMutation.isPending || updateAddressMutation.isPending}
              onClick={async () => {
                await Promise.all([
                  updateProfileMutation.mutateAsync({
                    firstName: personalInfo.firstName,
                    lastName: personalInfo.lastName,
                    phone: personalInfo.phone || null,
                  }),
                  updateAddressMutation.mutateAsync({
                    street: personalInfo.address,
                    city: personalInfo.city,
                    postalCode: personalInfo.postalCode,
                    country: personalInfo.country,
                  }),
                ]);
              }}
              className="h-12 px-8 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {updateProfileMutation.isPending || updateAddressMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : updateProfileMutation.isSuccess && updateAddressMutation.isSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {updateProfileMutation.isPending || updateAddressMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <h2 className="text-xl font-sans font-bold text-secondary-850 mb-6">
            Sécurité du compte
          </h2>

          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-850/40 hover:text-secondary-850/60"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-850/40 hover:text-secondary-850/60"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-secondary-850/50 font-sans mt-2">
                Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-12 px-8 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Changer le mot de passe
            </motion.button>
          </div>

          {/* Two-Factor Auth */}
          <div className="mt-8 pt-8 border-t-2 border-secondary/10">
            <h3 className="text-lg font-sans font-bold text-secondary-850 mb-4">
              Authentification à deux facteurs
            </h3>
            <div className="flex items-center justify-between p-4 bg-white/30 rounded-xl border border-secondary/10">
              <div>
                <p className="font-sans font-semibold text-secondary-850">
                  Activer l'authentification à deux facteurs
                </p>
                <p className="text-sm text-secondary-850/60 font-sans mt-1">
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 px-5 bg-secondary/20 text-secondary rounded-full font-sans font-semibold hover:bg-secondary/30 transition-colors duration-200"
              >
                Activer
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Notifications */}
          <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
            <h2 className="text-xl font-sans font-bold text-secondary-850 mb-6">
              Notifications
            </h2>

            <div className="space-y-4">
              {[
                { key: "emailNotifications", label: "Notifications par email", desc: "Recevoir des emails pour les mises à jour importantes" },
                { key: "smsNotifications", label: "Notifications SMS", desc: "Recevoir des SMS pour les livraisons" },
                { key: "orderUpdates", label: "Mises à jour de commandes", desc: "Être notifié de l'état de vos commandes" },
                { key: "promotions", label: "Promotions et offres", desc: "Recevoir les offres spéciales et réductions" },
                { key: "newsletter", label: "Newsletter", desc: "Recevoir notre newsletter hebdomadaire" }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white/30 rounded-xl border border-secondary/10">
                  <div>
                    <p className="font-sans font-semibold text-secondary-850">{item.label}</p>
                    <p className="text-sm text-secondary-850/60 font-sans mt-1">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setPreferences({ 
                      ...preferences, 
                      [item.key]: !preferences[item.key as keyof typeof preferences] 
                    })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      preferences[item.key as keyof typeof preferences] ? "bg-secondary" : "bg-secondary-850/20"
                    }`}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        x: preferences[item.key as keyof typeof preferences] ? 24 : 2
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
            <h2 className="text-xl font-sans font-bold text-secondary-850 mb-6">
              Préférences alimentaires
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-3">
                  Régimes alimentaires
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const newRestrictions = preferences.dietaryRestrictions.includes(option)
                          ? preferences.dietaryRestrictions.filter(r => r !== option)
                          : [...preferences.dietaryRestrictions, option];
                        setPreferences({ ...preferences, dietaryRestrictions: newRestrictions });
                      }}
                      className={`px-4 py-2 rounded-full font-sans font-medium transition-all duration-200 ${
                        preferences.dietaryRestrictions.includes(option)
                          ? "bg-secondary text-white"
                          : "bg-white/30 border-2 border-secondary/20 text-secondary-850 hover:border-secondary/40"
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-sans font-semibold text-secondary-850 mb-3">
                  Allergies et intolérances
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {preferences.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-full font-sans font-medium flex items-center gap-2"
                    >
                      {allergy}
                      <button
                        onClick={() => {
                          const newAllergies = preferences.allergies.filter((_, i) => i !== index);
                          setPreferences({ ...preferences, allergies: newAllergies });
                        }}
                        className="hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ajouter une allergie..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      setPreferences({
                        ...preferences,
                        allergies: [...preferences.allergies, e.currentTarget.value]
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
