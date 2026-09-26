"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { X, Star } from 'lucide-react'

interface FilterSectionProps {
  onFilterChange: (filters: {
    price: [number, number];
    categories: string[];
    specifications: string[];
    rating: number;
    nutrition: {
      calories: [number, number];
      proteins: [number, number];
      carbs: [number, number];
    }
  }) => void;
  className?: string;
  isMobileFilterOpen: boolean;
  closeMobileFilter: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  onFilterChange, 
  className,
  isMobileFilterOpen,
  closeMobileFilter
}) => {
  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 900]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSpecifications, setSelectedSpecifications] = useState<string[]>([]);
  const [caloriesRange, setCaloriesRange] = useState<[number, number]>([0, 500]);
  const [proteinsRange, setProteinsRange] = useState<[number, number]>([0, 500]);
  const [carbsRange, setCarbsRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [isOnSale, setIsOnSale] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);

  const categories = ['Plat Principal', 'Entrée', 'Dessert', 'Boisson'];
  const specifications = ['Sans Gluten', 'Sans Sucre', 'Sans Sel', 'Végétarien', 'Végétalien', 'Bio', 'Local'];
  const allergies = ['Fruits à coque', 'Lactose', 'Gluten', 'Fruits de mer', 'Oeufs', 'Soja'];
  const cuisineTypes = ['Française', 'Italienne', 'Japonaise', 'Indienne', 'Méditerranéenne', 'Traditionnelle'];
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleSpecificationChange = (spec: string, checked: boolean) => {
    if (checked) {
      setSelectedSpecifications([...selectedSpecifications, spec]);
    } else {
      setSelectedSpecifications(selectedSpecifications.filter(s => s !== spec));
    }
  };

  const applyFilters = () => {
    onFilterChange({
      price: priceRange,
      categories: selectedCategories,
      specifications: selectedSpecifications,
      rating: minRating,
      nutrition: {
        calories: caloriesRange,
        proteins: proteinsRange,
        carbs: carbsRange,
      }
    });
    closeMobileFilter();
  };

  const resetFilters = () => {
    setPriceRange([0, 900]);
    setSelectedCategories([]);
    setSelectedSpecifications([]);
    setCaloriesRange([0, 500]);
    setProteinsRange([0, 500]);
    setCarbsRange([0, 1000]);
    setMinRating(0);
    setIsOnSale(false);
    setIsNew(false);
    setIsBestSeller(false);
    
    onFilterChange({
      price: [0, 900],
      categories: [],
      specifications: [],
      rating: 0,
      nutrition: {
        calories: [0, 500],
        proteins: [0, 500],
        carbs: [0, 1000],
      }
    });
  };

  return (
    <div className={`bg-primary-100 rounded-[32px] p-6 ${className} ${isMobileFilterOpen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      {isMobileFilterOpen && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-sans font-bold text-secondary">Filtres</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeMobileFilter}
            className="rounded-full"
          >
            <X className="h-6 w-6 text-secondary-850" />
          </Button>
        </div>
      )}

      <div className="space-y-8">
        {/* Prix Section */}
        <div>
          <h3 className="inline-block text-secondary font-sans font-bold tracking-widest mb-4 text-xl">
            Prix
            <div className={`mx-auto w-14 mt-1 h-[4px] rounded-full bg-secondary`}/>
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Checkbox 
                id="solde" 
                className="mr-2"
                checked={isOnSale}
                onCheckedChange={(checked) => setIsOnSale(!!checked)}
              />
              <label 
                htmlFor="solde" 
                className="text-secondary-850 font-sans cursor-pointer"
              >
                Solde
              </label>
            </div>

            <div className="flex items-center mb-2">
              <Checkbox 
                id="nouveau" 
                className="mr-2"
                checked={isNew}
                onCheckedChange={(checked) => setIsNew(!!checked)}
              />
              <label 
                htmlFor="nouveau" 
                className="text-secondary-850 font-sans cursor-pointer"
              >
                Nouveau
              </label>
            </div>

            <div className="flex items-center mb-4">
              <Checkbox 
                id="meilleure-vente" 
                className="mr-2"
                checked={isBestSeller}
                onCheckedChange={(checked) => setIsBestSeller(!!checked)}
              />
              <label 
                htmlFor="meilleure-vente" 
                className="text-secondary-850 font-sans cursor-pointer"
              >
                Meilleure vente
              </label>
            </div>

            <label className="text-secondary-850 font-sans">Prix</label>
            <div className="py-6">
              <Slider 
                defaultValue={priceRange} 
                max={900} 
                step={1} 
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-secondary-850 font-sans">
                <span>{priceRange[0]} DA</span>
                <span>{priceRange[1]} DA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div>
          <h3 className="inline-block text-secondary font-sans font-bold tracking-widest mb-4 text-xl">
            Notation
            <div className={`mx-auto w-14 mt-1 h-[4px] rounded-full bg-secondary`}/>
          </h3>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div 
                key={rating} 
                className="flex items-center cursor-pointer group"
                onClick={() => setMinRating(rating === minRating ? 0 : rating)}
              >
                <div className={`w-5 h-5 rounded-full border ${
                  rating <= minRating 
                    ? 'bg-secondary border-secondary' 
                    : 'bg-white border-secondary/30 group-hover:border-secondary/50'
                } mr-3 flex items-center justify-center`}>
                  {rating <= minRating && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div className="flex items-center">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < rating ? 'text-primary-400 fill-primary-400' : 'text-primary-200'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Types de cuisine */}
        <div>
          <h3 className="inline-block text-secondary font-sans font-bold tracking-widest mb-4 text-xl">
            Cuisine
            <div className={`mx-auto w-14 mt-1 h-[4px] rounded-full bg-secondary`}/>
          </h3>
          
          <div className="mb-6 space-y-2">
            {cuisineTypes.map((cuisine) => (
              <div className="flex items-center" key={cuisine}>
                <Checkbox 
                  id={`cuisine-${cuisine}`} 
                  className="mr-2"
                />
                <label 
                  htmlFor={`cuisine-${cuisine}`} 
                  className="text-secondary-850 font-sans cursor-pointer"
                >
                  {cuisine}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Régimes alimentaires et spécifications */}
        <div>
          <h3 className="inline-block text-secondary font-sans font-bold tracking-widest mb-4 text-xl">
            Régimes
            <div className={`mx-auto w-14 mt-1 h-[4px] rounded-full bg-secondary`}/>
          </h3>
          
          <div className="mb-6 space-y-2">
            {specifications.map((spec) => (
              <div className="flex items-center" key={spec}>
                <Checkbox 
                  id={spec} 
                  className="mr-2" 
                  checked={selectedSpecifications.includes(spec)}
                  onCheckedChange={(checked) => 
                    handleSpecificationChange(spec, checked as boolean)
                  }
                />
                <label 
                  htmlFor={spec} 
                  className="text-secondary-850 font-sans cursor-pointer"
                >
                  {spec}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies et intolerances */}
        <div>
          <h3 className="inline-block text-secondary font-sans font-bold tracking-widest mb-4 text-xl">
            Allergènes
            <div className={`mx-auto w-14 mt-1 h-[4px] rounded-full bg-secondary`}/>
          </h3>
          
          <div className="mb-6 space-y-2">
            <p className="text-sm text-secondary-850/70 mb-2">Exclure les produits contenant:</p>
            {allergies.map((allergy) => (
              <div className="flex items-center" key={allergy}>
                <Checkbox 
                  id={`allergy-${allergy}`} 
                  className="mr-2"
                />
                <label 
                  htmlFor={`allergy-${allergy}`} 
                  className="text-secondary-850 font-sans cursor-pointer"
                >
                  {allergy}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Nutriments Section */}
        <div>
          <h3 className="inline-block text-secondary font-sans font-bold tracking-widest mb-4 text-xl">
            Nutriments
            <div className={`mx-auto w-14 mt-1 h-[4px] rounded-full bg-secondary`}/>
          </h3>
          
          {/* Calories range */}
          <div className="mb-6">
            <h4 className="text-secondary-850 font-sans font-medium mb-2">Calories</h4>
            <Slider 
              defaultValue={caloriesRange} 
              max={500} 
              step={1} 
              value={caloriesRange}
              onValueChange={(value) => setCaloriesRange(value as [number, number])}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-secondary-850 font-sans">
              <span>{caloriesRange[0]}</span>
              <span>{caloriesRange[1]}</span>
            </div>
          </div>

          {/* Proteines range */}
          <div className="mb-6">
            <h4 className="text-secondary-850 font-sans font-medium mb-2">Proteines</h4>
            <Slider 
              defaultValue={proteinsRange} 
              max={500} 
              step={1} 
              value={proteinsRange}
              onValueChange={(value) => setProteinsRange(value as [number, number])}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-secondary-850 font-sans">
              <span>{proteinsRange[0]}</span>
              <span>{proteinsRange[1]}</span>
            </div>
          </div>

          {/* Glucides range */}
          <div className="mb-6">
            <h4 className="text-secondary-850 font-sans font-medium mb-2">Glucides</h4>
            <Slider 
              defaultValue={carbsRange} 
              max={1000} 
              step={1} 
              value={carbsRange}
              onValueChange={(value) => setCarbsRange(value as [number, number])}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-secondary-850 font-sans">
              <span>{carbsRange[0]}</span>
              <span>{carbsRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Apply filters button at the bottom for desktop view */}
        {!isMobileFilterOpen && (
          <div className="pt-4">
            <Button 
              className="w-full"
              onClick={applyFilters}
            >
              Appliquer les filtres
            </Button>
            <Button 
              variant="outline" 
              className="w-full mt-2 border-secondary text-secondary hover:bg-secondary/10"
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
          </div>
        )}

        {/* Filter actions - only show in mobile view */}
        {isMobileFilterOpen && (
          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 border-secondary text-secondary hover:bg-secondary/10"
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
            <Button 
              className="flex-1"
              onClick={applyFilters}
            >
              Appliquer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
