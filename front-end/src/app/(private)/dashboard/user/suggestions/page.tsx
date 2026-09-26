"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Filter, 
  Heart,
  Plus,
  Check,
  Leaf,
  Flame,
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuggestions } from "@/lib/api/products";
import { useToggleFavorite, useFavoriteIds } from "@/lib/api/favorites";
import { resolveAppImage } from "@/lib/resolve-image";
import { formatDietTypeLabel } from "@/lib/product-labels";

const fallbackImages = ["/images/white.png", "/images/yellow.png", "/images/blue.png"];

type DietType = "all" | "BALANCED" | "VEGETARIAN" | "VEGAN" | "KETO" | "LOW_CARB" | "HIGH_PROTEIN";

export default function SuggestionsPage() {
  const router = useRouter();
  const [selectedDiet, setSelectedDiet] = useState<DietType>("all");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const { data: suggestions, isLoading } = useSuggestions();
  const { data: favoriteIds = [] } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const dietTypes = [
    { id: "all" as DietType, name: "Tous", icon: "⚖️", description: "Toutes les suggestions" },
    { id: "BALANCED" as DietType, name: "Équilibré", icon: "⚖️", description: "Alimentation variée" },
    { id: "VEGETARIAN" as DietType, name: "Végétarien", icon: "🥗", description: "Sans viande" },
    { id: "VEGAN" as DietType, name: "Végétalien", icon: "🌱", description: "100% végétal" },
    { id: "KETO" as DietType, name: "Keto", icon: "🥑", description: "Très faible en glucides" },
    { id: "LOW_CARB" as DietType, name: "Low Carb", icon: "🥩", description: "Faible en glucides" },
    { id: "HIGH_PROTEIN" as DietType, name: "Riche en protéines", icon: "💪", description: "Pour la musculation" },
  ];

  const preferences = [
    "Sans gluten",
    "Sans lactose",
    "Sans fruits à coque",
    "Halal",
    "Bio",
    "Local",
    "Épicé",
    "Rapide (<30min)"
  ];

  const allSuggestions = (suggestions ?? []).map((p, i) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    image: resolveAppImage(p.image, fallbackImages[i % 3]),
    calories: p.nutrition?.calories ?? 0,
    proteins: p.nutrition?.proteins ?? 0,
    prepTime: p.prepTime ?? 0,
    matchScore: 90 - i * 2,
    badges: (p.dietTypes ?? []).map(formatDietTypeLabel).slice(0, 3),
    dietTypes: p.dietTypes ?? [],
  }));

  const togglePreference = (pref: string) => {
    setSelectedPreferences(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const filteredSuggestions = allSuggestions.filter(s => 
    selectedDiet === "all" || s.dietTypes.some((d: string) => d.toUpperCase() === selectedDiet)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-secondary" />
          Suggestions personnalisées
        </h1>
        <p className="text-secondary-850/60 font-sans mt-1">
          Des plats adaptés à votre régime et vos préférences
        </p>
      </div>

      {/* Diet Type Selector */}
      <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-sans font-bold text-secondary-850">Type de régime</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {dietTypes.map((diet) => {
            const isSelected = selectedDiet === diet.id;
            
            return (
              <motion.button
                key={diet.id}
                onClick={() => setSelectedDiet(diet.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all duration-200",
                  isSelected
                    ? "bg-secondary border-secondary text-white"
                    : "bg-white/30 border-secondary/20 hover:border-secondary/40"
                )}
              >
                <div className="text-3xl mb-2">{diet.icon}</div>
                <p className={cn(
                  "font-sans font-semibold text-sm mb-1",
                  isSelected ? "text-white" : "text-secondary-850"
                )}>
                  {diet.name}
                </p>
                <p className={cn(
                  "text-xs font-sans",
                  isSelected ? "text-white/80" : "text-secondary-850/60"
                )}>
                  {diet.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
        <h3 className="text-lg font-sans font-bold text-secondary-850 mb-4">Préférences alimentaires</h3>
        
        <div className="flex flex-wrap gap-2">
          {preferences.map((pref) => {
            const isSelected = selectedPreferences.includes(pref);
            
            return (
              <motion.button
                key={pref}
                onClick={() => togglePreference(pref)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full border-2 font-sans font-medium text-sm transition-all duration-200 flex items-center gap-2",
                  isSelected
                    ? "bg-secondary border-secondary text-white"
                    : "bg-white/30 border-secondary/30 text-secondary hover:border-secondary"
                )}
              >
                {isSelected && <Check className="w-4 h-4" />}
                {pref}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Suggestions Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-sans font-bold text-secondary-850">
            {filteredSuggestions.length} plats recommandés
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuggestions.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(`/boutique/${meal.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/boutique/${meal.id}`);
                }
              }}
              role="link"
              tabIndex={0}
              className="bg-card border-2 border-secondary/10 rounded-2xl p-4 hover:border-secondary/30 transition-all duration-200 cursor-pointer"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image 
                    src={meal.image}
                    alt={meal.name}
                    fill
                    className="object-cover"
                  />
                  {/* Match score badge */}
                  <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {meal.matchScore}%
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-sans font-bold text-secondary-850 mb-1 truncate">
                    {meal.name}
                  </h4>
                  <p className="text-sm text-secondary-850/60 font-sans mb-2 line-clamp-2">
                    {meal.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs font-sans text-secondary-850/60 mb-2">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {meal.calories} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-green-500" />
                      {meal.proteins}g P
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {meal.prepTime} min
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {meal.badges.slice(0, 2).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-sans font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/boutique/${meal.id}`);
                      }}
                      className="flex-1 h-8 bg-secondary text-white rounded-full font-sans font-semibold text-sm hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite.mutate({ productId: meal.id, isFavorite: favoriteIds.includes(meal.id) });
                      }}
                      className="h-8 w-8 bg-white/30 border-2 border-secondary/20 rounded-full flex items-center justify-center hover:border-secondary/40 transition-colors duration-200"
                    >
                      <Heart className={cn("w-4 h-4", favoriteIds.includes(meal.id) ? "fill-red-500 text-red-500" : "text-secondary")} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
