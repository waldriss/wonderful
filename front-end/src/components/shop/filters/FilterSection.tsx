"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Utensils, Clock, Target, Users, Dumbbell, Heart, Leaf, Award } from 'lucide-react'
import FilterGroup from './FilterGroup'
import RatingFilter from './RatingFilter'
import CheckboxGroup from './CheckboxGroup'
import RangeSlider from './RangeSlider'
import PillSelector from './PillSelector'
import ToggleSwitch from './ToggleSwitch'
import CardSelector from './CardSelector'
import { motion } from "framer-motion"

export interface FilterValues {
  price: [number, number];
  categories: string[];
  specifications: string[];
  allergies: string[];
  cuisineTypes: string[];
  rating: number;
  isOnSale: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  nutrition: {
    calories: [number, number];
    proteins: [number, number];
    carbs: [number, number];
    fat: [number, number];
    fiber: [number, number];
  };
  mealType: string[];
  mealTiming: string[];
  portionSize: string[];
  dietaryGoals: string[];
  prepLevel: string[];
}

interface FilterSectionProps {
  onFilterChange: (filters: FilterValues) => void;
  className?: string;
  isMobileFilterOpen: boolean;
  closeMobileFilter: () => void;
}

/**
 * Enhanced filter panel with diverse UI components and smooth animations
 */
const FilterSection: React.FC<FilterSectionProps> = ({ 
  onFilterChange, 
  className,
  isMobileFilterOpen,
  closeMobileFilter
}) => {
  // Initial filter values
  const [filters, setFilters] = useState<FilterValues>({
    price: [0, 900],
    categories: [],
    specifications: [],
    allergies: [],
    cuisineTypes: [],
    rating: 0,
    isOnSale: false,
    isNew: false,
    isBestSeller: false,
    nutrition: {
      calories: [0, 500],
      proteins: [0, 500],
      carbs: [0, 1000],
      fat: [0, 200],
      fiber: [0, 50]
    },
    mealType: [],
    mealTiming: [],
    portionSize: [],
    dietaryGoals: [],
    prepLevel: []
  });
  
  // Enhanced filter options with icons and descriptions
  const mealTypes = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation', 'Post-entraînement', 'Pré-entraînement'];
  const specifications = ['Sans Gluten', 'Sans Sucre', 'Sans Sel', 'Végétarien', 'Végétalien', 'Bio', 'Local'];
  const allergies = ['Fruits à coque', 'Lactose', 'Gluten', 'Fruits de mer', 'Oeufs', 'Soja'];
  
  const dietaryGoalCards = [
    { 
      value: 'Perte de poids', 
      label: 'Perte de poids', 
      icon: <Target className="w-5 h-5" />,
      description: 'Faible en calories'
    },
    { 
      value: 'Prise de masse', 
      label: 'Prise de masse', 
      icon: <Dumbbell className="w-5 h-5" />,
      description: 'Riche en protéines'
    },
    { 
      value: 'Maintien', 
      label: 'Maintien', 
      icon: <Heart className="w-5 h-5" />,
      description: 'Équilibré'
    },
    { 
      value: 'Détox', 
      label: 'Détox', 
      icon: <Leaf className="w-5 h-5" />,
      description: 'Naturel et purifiant'
    },
    { 
      value: 'Performance sportive', 
      label: 'Performance', 
      icon: <Award className="w-5 h-5" />,
      description: 'Optimisé pour le sport'
    },
    { 
      value: 'Récupération', 
      label: 'Récupération', 
      icon: <Clock className="w-5 h-5" />,
      description: 'Post-entraînement'
    }
  ];
  
  const portionCards = [
    { 
      value: 'Individual', 
      label: 'Individual', 
      icon: <Users className="w-4 h-4" />,
      description: '1 personne'
    },
    { 
      value: 'Duo (2 pers.)', 
      label: 'Duo', 
      icon: <Users className="w-5 h-5" />,
      description: '2 personnes'
    },
    { 
      value: 'Famille (4 pers.)', 
      label: 'Famille', 
      icon: <Users className="w-6 h-6" />,
      description: '4 personnes'
    },
    { 
      value: 'Groupe (10+ pers.)', 
      label: 'Groupe', 
      icon: <Users className="w-7 h-7" />,
      description: '10+ personnes'
    }
  ];

  // Update filter functions
  const updateFilters = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (!isMobileFilterOpen) {
      onFilterChange(newFilters);
    }
  };
  
  const updateNutrition = <K extends keyof FilterValues['nutrition']>(
    key: K, 
    value: FilterValues['nutrition'][K]
  ) => {
    const newFilters = {
      ...filters,
      nutrition: {
        ...filters.nutrition,
        [key]: value
      }
    };
    setFilters(newFilters);
    if (!isMobileFilterOpen) {
      onFilterChange(newFilters);
    }
  };

  const handlePillSelect = (key: keyof FilterValues, item: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateFilters(key, newArray as FilterValues[typeof key]);
  };

  const handleCardSelect = (key: keyof FilterValues, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(i => i !== value)
      : [...currentArray, value];
    updateFilters(key, newArray as FilterValues[typeof key]);
  };

  // Apply and reset handlers
  const applyFilters = () => {
    onFilterChange(filters);
    closeMobileFilter();
  };

  const resetFilters = () => {
    const resetValues: FilterValues = {
      price: [0, 900],
      categories: [],
      specifications: [],
      allergies: [],
      cuisineTypes: [],
      rating: 0,
      isOnSale: false,
      isNew: false,
      isBestSeller: false,
      nutrition: {
        calories: [0, 500],
        proteins: [0, 500],
        carbs: [0, 1000],
        fat: [0, 200],
        fiber: [0, 50]
      },
      mealType: [],
      mealTiming: [],
      portionSize: [],
      dietaryGoals: [],
      prepLevel: []
    };
    setFilters(resetValues);
    onFilterChange(resetValues);
  };

  return (
    <motion.div 
      className={`bg-transparent pr-6 ${className} ${
        isMobileFilterOpen ? 'fixed inset-0 z-50 overflow-auto' : ''
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Mobile header */}
      {isMobileFilterOpen && (
        <motion.div 
          className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-primary-100 pb-4 border-b border-secondary/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-2xl font-sans font-bold text-secondary">Filtres</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeMobileFilter}
            className="hover:bg-secondary/10 rounded-full"
          >
            <X className="h-6 w-6 text-secondary-850" />
          </Button>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Prix Section - Using Toggle Switches */}
        <FilterGroup title="Prix" defaultOpen={true} id="price">
          <div className="space-y-4">
            <ToggleSwitch
              label="En solde"
              checked={filters.isOnSale}
              onChange={(checked) => updateFilters('isOnSale', checked)}
              description="Produits avec remise"
            />
            
            <ToggleSwitch
              label="Nouveauté"
              checked={filters.isNew}
              onChange={(checked) => updateFilters('isNew', checked)}
              description="Derniers arrivages"
            />
            
            <ToggleSwitch
              label="Best-seller"
              checked={filters.isBestSeller}
              onChange={(checked) => updateFilters('isBestSeller', checked)}
              description="Nos produits les plus populaires"
            />

            <RangeSlider
              label="Fourchette de prix"
              value={filters.price}
              onChange={(value) => updateFilters('price', value)}
              max={900}
              unit=" DA"
            />
          </div>
        </FilterGroup>

        {/* Rating Section - Keep existing */}
        <FilterGroup title="Notation" defaultOpen={true} id="rating">
          <RatingFilter 
            minRating={filters.rating} 
            onChange={(rating) => updateFilters('rating', rating)} 
          />
        </FilterGroup>

        {/* Type de repas - Using Pills */}
        <FilterGroup title="Type de repas" defaultOpen={false} id="meal-type">
          <PillSelector
            items={mealTypes}
            selected={filters.mealType}
            onChange={(item) => handlePillSelect('mealType', item)}
            className="py-2"
          />
        </FilterGroup>

        {/* Objectif alimentaire - Using Cards */}
        <FilterGroup title="Objectif alimentaire" defaultOpen={false} id="dietary-goals">
          <CardSelector
            options={dietaryGoalCards}
            selected={filters.dietaryGoals}
            onChange={(value) => handleCardSelect('dietaryGoals', value)}
            columns={2}
          />
        </FilterGroup>

        {/* Format de livraison - Using Cards for portions */}
        <FilterGroup title="Format de livraison" defaultOpen={false} id="delivery">
          <div className="space-y-6">
            <div>
              <h4 className="text-secondary-850 font-sans font-medium mb-3">Taille des portions:</h4>
              <CardSelector
                options={portionCards}
                selected={filters.portionSize}
                onChange={(value) => handleCardSelect('portionSize', value)}
                columns={2}
              />
            </div>
            
            <div>
              <h4 className="text-secondary-850 font-sans font-medium mb-3">Planning des repas:</h4>
              <PillSelector
                items={['Repas hebdomadaire', 'Repas quotidien', 'Repas préparé', 'Livraison le jour même']}
                selected={filters.mealTiming}
                onChange={(item) => handlePillSelect('mealTiming', item)}
              />
            </div>
            
            <div>
              <h4 className="text-secondary-850 font-sans font-medium mb-3">Niveau de préparation:</h4>
              <PillSelector
                items={['Prêt à manger', 'À réchauffer', 'À préparer (<15 min)', 'Kit de cuisine complet']}
                selected={filters.prepLevel}
                onChange={(item) => handlePillSelect('prepLevel', item)}
              />
            </div>
          </div>
        </FilterGroup>

        {/* Régimes - Using Pills */}
        <FilterGroup title="Régimes" defaultOpen={false} id="regimes">
          <PillSelector
            items={specifications}
            selected={filters.specifications}
            onChange={(item) => handlePillSelect('specifications', item)}
            className="py-2"
          />
        </FilterGroup>

        {/* Allergies - Keep checkboxes for exclusion clarity */}
        <FilterGroup title="Allergènes" defaultOpen={false} id="allergens">
          <CheckboxGroup 
            title="Exclure les produits contenant:"
            items={allergies}
            selected={filters.allergies}
            onChange={(item, checked) => {
              if (checked) {
                updateFilters('allergies', [...filters.allergies, item]);
              } else {
                updateFilters('allergies', filters.allergies.filter(i => i !== item));
              }
            }}
            idPrefix="allergy"
          />
        </FilterGroup>

        {/* Nutriments Section - Keep sliders */}
        <FilterGroup title="Nutriments" defaultOpen={false} id="nutrients">
          <div className="space-y-4">
            <RangeSlider
              label="Calories"
              value={filters.nutrition.calories}
              onChange={(value) => updateNutrition('calories', value)}
              max={500}
              unit=" kcal"
            />
            
            <RangeSlider
              label="Protéines"
              value={filters.nutrition.proteins}
              onChange={(value) => updateNutrition('proteins', value)}
              max={500}
              unit="g"
            />
            
            <RangeSlider
              label="Glucides"
              value={filters.nutrition.carbs}
              onChange={(value) => updateNutrition('carbs', value)}
              max={1000}
              unit="g"
            />
            
            <RangeSlider
              label="Lipides"
              value={filters.nutrition.fat}
              onChange={(value) => updateNutrition('fat', value)}
              max={200}
              unit="g"
            />
            
            <RangeSlider
              label="Fibres"
              value={filters.nutrition.fiber}
              onChange={(value) => updateNutrition('fiber', value)}
              max={50}
              unit="g"
            />
          </div>
        </FilterGroup>

        {/* Action buttons */}
        <motion.div 
          className="pt-6 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/*<Button 
            className="w-full   h-12 text-lg font-semibold rounded-xl  "
            onClick={applyFilters}
          >
            Appliquer les filtres
          </Button>*/}

          
          <Button 
            className="w-full   h-12 text-lg font-semibold rounded-xl  "
            onClick={resetFilters}
          >
            Réinitialiser
          </Button>
        </motion.div>
      </div>

      {/* Mobile action bar */}
      {isMobileFilterOpen && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-secondary/10 z-50 flex gap-4"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Button 
            variant="outline" 
            className="flex-1 border-2 border-secondary/30 text-secondary hover:bg-secondary/10 h-12 rounded-xl"
            onClick={resetFilters}
          >
            Réinitialiser
          </Button>
          
          <Button 
            className="flex-1 bg-secondary text-white hover:bg-secondary/90 h-12 rounded-xl shadow-lg"
            onClick={applyFilters}
          >
            Appliquer
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FilterSection;
