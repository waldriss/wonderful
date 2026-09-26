"use client";

import { motion } from "framer-motion";
import { DeliverySchedule, PaymentMethod, DeliveryDay } from "./types";
import { cn } from "@/lib/utils";
import { MapPin, Clock, CreditCard, Banknote, Calendar } from "lucide-react";

interface Step3DeliveryInfoProps {
  deliverySchedule: DeliverySchedule;
  onDeliveryChange: (schedule: DeliverySchedule) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS_OF_WEEK: { id: DeliveryDay; label: string; shortLabel: string }[] = [
  { id: "monday", label: "Lundi", shortLabel: "Lun" },
  { id: "tuesday", label: "Mardi", shortLabel: "Mar" },
  { id: "wednesday", label: "Mercredi", shortLabel: "Mer" },
  { id: "thursday", label: "Jeudi", shortLabel: "Jeu" },
  { id: "friday", label: "Vendredi", shortLabel: "Ven" },
  { id: "saturday", label: "Samedi", shortLabel: "Sam" },
  { id: "sunday", label: "Dimanche", shortLabel: "Dim" },
];

const DELIVERY_LOCATIONS = [
  { id: "home", label: "À domicile", icon: "🏠", description: "Livraison directement chez vous" },
  { id: "work", label: "Au bureau", icon: "🏢", description: "Livraison sur votre lieu de travail" },
  { id: "pickup", label: "Point relais", icon: "📍", description: "Récupérez votre commande en point relais" },
];

const TIME_SLOTS = [
  { id: "morning", label: "Matin", time: "8h - 12h", icon: "🌅" },
  { id: "noon", label: "Midi", time: "12h - 14h", icon: "☀️" },
  { id: "afternoon", label: "Après-midi", time: "14h - 18h", icon: "🌤️" },
  { id: "evening", label: "Soir", time: "18h - 21h", icon: "🌙" },
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    id: "cash", 
    label: "Paiement à la livraison", 
    description: "Payez en espèces lors de la réception",
    icon: <Banknote className="w-6 h-6" />
  },
  { 
    id: "card", 
    label: "Carte bancaire", 
    description: "Paiement sécurisé par carte",
    icon: <CreditCard className="w-6 h-6" />
  },
];

export default function Step3DeliveryInfo({
  deliverySchedule,
  onDeliveryChange,
  onNext,
  onBack,
}: Step3DeliveryInfoProps) {
  const toggleDay = (day: DeliveryDay) => {
    const newDays = deliverySchedule.days.includes(day)
      ? deliverySchedule.days.filter((d) => d !== day)
      : [...deliverySchedule.days, day];
    onDeliveryChange({ ...deliverySchedule, days: newDays });
  };

  const isValid = deliverySchedule.days.length > 0 && 
                  deliverySchedule.location && 
                  deliverySchedule.timeSlot && 
                  deliverySchedule.paymentMethod;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Days Selection */}
      <div className="bg-card border-2 border-secondary/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-secondary-850" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-sans text-secondary-850">Jours de livraison</h3>
            <p className="text-sm font-sans text-secondary-850/60">Sélectionnez vos jours de livraison préférés</p>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = deliverySchedule.days.includes(day.id);
            return (
              <motion.button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-1 rounded-xl font-sans transition-all duration-200",
                  isSelected
                    ? "bg-secondary text-white shadow-sm"
                    : "bg-primary-100 text-secondary-850 hover:bg-primary-200"
                )}
              >
                <span className="text-xs font-medium hidden sm:block">{day.label}</span>
                <span className="text-xs font-medium sm:hidden">{day.shortLabel}</span>
              </motion.button>
            );
          })}
        </div>
        {deliverySchedule.days.length > 0 && (
          <p className="mt-4 text-sm font-sans text-secondary font-medium">
            {deliverySchedule.days.length} jour{deliverySchedule.days.length > 1 ? "s" : ""} sélectionné{deliverySchedule.days.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Location Selection */}
      <div className="bg-card border-2 border-secondary/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-sans text-secondary-850">Lieu de livraison</h3>
            <p className="text-sm font-sans text-secondary-850/60">Où souhaitez-vous être livré ?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DELIVERY_LOCATIONS.map((location) => {
            const isSelected = deliverySchedule.location === location.id;
            return (
              <motion.button
                key={location.id}
                onClick={() => onDeliveryChange({ ...deliverySchedule, location: location.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-secondary bg-secondary/5"
                    : "border-secondary/5 hover:border-secondary/20 bg-card"
                )}
              >
                <span className="text-3xl mb-2">{location.icon}</span>
                <span className={cn(
                  "font-semibold font-sans",
                  isSelected ? "text-secondary" : "text-secondary-850"
                )}>
                  {location.label}
                </span>
                <span className="text-xs font-sans text-secondary-850/60 text-center mt-1">
                  {location.description}
                </span>
              </motion.button>
            );
          })}
        </div>

        {deliverySchedule.location && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4"
          >
            <input
              type="text"
              placeholder="Entrez votre adresse complète"
              value={deliverySchedule.address || ""}
              onChange={(e) => onDeliveryChange({ ...deliverySchedule, address: e.target.value })}
              className="w-full h-12 px-5 rounded-full border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent font-sans text-secondary-850 transition-colors duration-200"
            />
          </motion.div>
        )}
      </div>

      {/* Time Slot Selection */}
      <div className="bg-card border-2 border-secondary/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-secondary-850" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-sans text-secondary-850">Heure de livraison</h3>
            <p className="text-sm font-sans text-secondary-850/60">À quelle heure préférez-vous être livré ?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TIME_SLOTS.map((slot) => {
            const isSelected = deliverySchedule.timeSlot === slot.id;
            return (
              <motion.button
                key={slot.id}
                onClick={() => onDeliveryChange({ ...deliverySchedule, timeSlot: slot.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-secondary bg-secondary/5"
                    : "border-secondary/5 hover:border-secondary/20 bg-card"
                )}
              >
                <span className="text-2xl mb-2">{slot.icon}</span>
                <span className={cn(
                  "font-semibold font-sans",
                  isSelected ? "text-secondary" : "text-secondary-850"
                )}>
                  {slot.label}
                </span>
                <span className="text-xs font-sans text-secondary-850/60">{slot.time}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-card border-2 border-secondary/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-secondary-850" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-sans text-secondary-850">Mode de paiement</h3>
            <p className="text-sm font-sans text-secondary-850/60">Comment souhaitez-vous payer ?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = deliverySchedule.paymentMethod === method.id;
            return (
              <motion.button
                key={method.id}
                onClick={() => onDeliveryChange({ ...deliverySchedule, paymentMethod: method.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-secondary bg-secondary/5"
                    : "border-secondary/5 hover:border-secondary/20 bg-card"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  isSelected ? "bg-secondary/10 text-secondary" : "bg-primary-200 text-secondary-850"
                )}>
                  {method.icon}
                </div>
                <div className="text-left">
                  <span className={cn(
                    "font-semibold font-sans block",
                    isSelected ? "text-secondary" : "text-secondary-850"
                  )}>
                    {method.label}
                  </span>
                  <span className="text-xs font-sans text-secondary-850/60">{method.description}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
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
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
          className={cn(
            "flex-1 h-14 px-6 rounded-full font-semibold font-sans transition-all",
            isValid
              ? "bg-secondary text-white hover:bg-secondary/90 shadow-md"
              : "bg-primary-200 text-secondary-850/40 cursor-not-allowed"
          )}
        >
          Continuer
        </motion.button>
      </div>
    </motion.div>
  );
}
