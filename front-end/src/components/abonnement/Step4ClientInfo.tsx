"use client";

import { motion } from "framer-motion";
import { CustomerInfo } from "./types";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, MapPin, Gift, Sparkles } from "lucide-react";
import { useState } from "react";

interface Step4ClientInfoProps {
  customerInfo: CustomerInfo;
  onCustomerChange: (info: CustomerInfo) => void;
  onNext: () => void;
  onBack: () => void;
  /** Afficher un état de chargement sur le bouton de confirmation */
  isSubmitting?: boolean;
}

export default function Step4ClientInfo({
  customerInfo,
  onCustomerChange,
  onNext,
  onBack,
  isSubmitting = false,
}: Step4ClientInfoProps) {
  const [wantsAccount, setWantsAccount] = useState(false);

  const updateField = <K extends keyof CustomerInfo>(
    field: K,
    value: CustomerInfo[K]
  ) => {
    onCustomerChange({ ...customerInfo, [field]: value });
  };

  const isValid =
    customerInfo.firstName &&
    customerInfo.lastName &&
    customerInfo.email &&
    customerInfo.phone &&
    customerInfo.address;

  const isPasswordValid = !wantsAccount || (customerInfo.password && customerInfo.password.length >= 8);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Account Creation Promo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-secondary to-secondary-500 rounded-2xl p-6 text-white shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Gift className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold font-sans mb-1">
              Créez un compte et obtenez -10% !
            </h3>
            <p className="text-white/90 text-sm font-sans mb-4">
              En créant un compte, vous bénéficiez de 10% de réduction sur votre première commande 
              et vous pouvez suivre vos livraisons facilement.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setWantsAccount(!wantsAccount)}
                className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  wantsAccount
                    ? "bg-white border-white"
                    : "border-white/60 hover:border-white"
                )}
              >
                {wantsAccount && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </div>
              <span className="font-medium font-sans">Oui, je veux créer un compte !</span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <div className="bg-card border-2 border-secondary/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-secondary-850" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-sans text-secondary-850">
              Informations personnelles
            </h3>
            <p className="text-sm font-sans text-secondary-850/60">
              Remplissez vos informations de contact
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium font-sans text-secondary-850">Prénom</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/60" />
              <input
                type="text"
                placeholder="Votre prénom"
                value={customerInfo.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent font-sans text-secondary-850 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium font-sans text-secondary-850">Nom</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/60" />
              <input
                type="text"
                placeholder="Votre nom"
                value={customerInfo.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent font-sans text-secondary-850 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium font-sans text-secondary-850">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/60" />
              <input
                type="email"
                placeholder="votre@email.com"
                value={customerInfo.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent font-sans text-secondary-850 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium font-sans text-secondary-850">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/60" />
              <input
                type="tel"
                placeholder="+213 6 00 00 00 00"
                value={customerInfo.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent font-sans text-secondary-850 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2 mt-4">
          <label className="text-sm font-medium font-sans text-secondary-850">
            Adresse complète
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 w-5 h-5 text-secondary/60" />
            <textarea
              placeholder="Numéro, rue, code postal, ville..."
              value={customerInfo.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={3}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent font-sans text-secondary-850 transition-colors duration-200 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Password Section (conditional) */}
      {wantsAccount && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border-2 border-secondary/5 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-sans text-secondary-850">
                Créer votre compte
              </h3>
              <p className="text-sm font-sans text-secondary-850/60">
                Choisissez un mot de passe sécurisé
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium font-sans text-secondary-850">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="Minimum 8 caractères"
                value={customerInfo.password || ""}
                onChange={(e) => updateField("password", e.target.value)}
                className="w-full h-12 px-5 rounded-full border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent font-sans text-secondary-850 transition-colors duration-200"
              />
              {customerInfo.password && customerInfo.password.length < 8 && (
                <p className="text-sm font-sans text-secondary">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              )}
            </div>

            <div className="bg-primary-100 rounded-2xl p-4 flex items-center gap-3 border-2 border-primary-200">
              <div className="w-8 h-8 bg-primary-300 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-secondary-850" />
              </div>
              <p className="text-secondary-850 text-sm font-medium font-sans">
                Super ! Vous bénéficierez de -10% sur cette commande !
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Special Instructions */}
      <div className="bg-card border-2 border-secondary/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold font-sans text-secondary-850 mb-4">
          Instructions spéciales (optionnel)
        </h3>
        <textarea
          placeholder="Allergies, préférences alimentaires, instructions de livraison..."
          value={customerInfo.notes || ""}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={3}
          className="w-full px-5 py-3 rounded-2xl border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent font-sans text-secondary-850 transition-colors duration-200 resize-none"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 h-14 px-6 rounded-full border-2 border-secondary/30 text-secondary-850 font-semibold font-sans hover:bg-secondary/5 transition-colors"
        >
          Retour
        </motion.button>
        <motion.button
          onClick={onNext}
          disabled={!isValid || !isPasswordValid || isSubmitting}
          whileHover={isValid && isPasswordValid && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={isValid && isPasswordValid && !isSubmitting ? { scale: 0.98 } : {}}
          className={cn(
            "flex-1 h-14 px-6 rounded-full font-semibold font-sans transition-all",
            isValid && isPasswordValid && !isSubmitting
              ? "bg-secondary text-white hover:bg-secondary/90 shadow-md"
              : "bg-primary-200 text-secondary-850/40 cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Création en cours..." : "Confirmer la commande"}
        </motion.button>
      </div>
    </motion.div>
  );
}
