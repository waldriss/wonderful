"use client"

import { useState } from 'react'
import { ChevronDown, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProductCategory = 'Tous' | 'Plats' | 'Jus' | 'Desserts' | 'Snacks'

interface CategorySelectorProps {
  categories: ProductCategory[];
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  className?: string;
}

/**
 * Dropdown menu for product category selection
 */
const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleCategorySelect = (category: ProductCategory) => {
    onSelectCategory(category)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative group w-full sm:w-auto", className)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "h-12 px-5 border-2 border-secondary rounded-full flex items-center gap-2 text-secondary",
          "font-sans font-semibold text-lg tracking-wide hover:bg-secondary/5 transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
        )}
      >
        <ShoppingBag className="h-5 w-5" />
        <span>{selectedCategory}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 right-0 mt-2 bg-primary-100 rounded-3xl border-2 border-secondary/20 font-sans font-medium z-30 animate-in fade-in slide-in-from-top-2 duration-150">
            <ul 
              className="py-2"
              role="listbox"
              aria-label="Categories"
            >
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => handleCategorySelect(category)}
                    className={cn(
                      "block w-full text-left px-4 py-2 text-sm hover:bg-primary-100 transition-colors duration-150",
                      selectedCategory === category ? 'text-secondary font-medium' : 'text-secondary-850'
                    )}
                    role="option"
                    aria-selected={selectedCategory === category}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default CategorySelector
