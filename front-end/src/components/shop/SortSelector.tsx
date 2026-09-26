"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'alphabetical'

interface SortOptionItem {
  value: SortOption;
  label: string;
}

interface SortSelectorProps {
  options: SortOptionItem[];
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
  className?: string;
}

/**
 * Dropdown menu for product sorting options
 */
const SortSelector: React.FC<SortSelectorProps> = ({
  options,
  currentSort,
  onSortChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSortSelect = (option: SortOptionItem) => {
    onSortChange(option.value)
    setIsOpen(false)
  }

  const currentSortLabel = options.find((opt: SortOptionItem) => opt.value === currentSort)?.label || 'Trier par'

  return (
    <div className={cn("relative h-12 flex-1 sm:flex-initial", className)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "h-12 px-5 border-2 border-secondary/10 bg-[#fbd9c9] rounded-full flex items-center gap-2",
          "text-secondary font-sans font-medium hover:border-secondary transition-colors duration-200",
          "w-full sm:w-auto whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-secondary/20"
        )}
      >
        <span>
          {currentSortLabel}
        </span>
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
          <div className="absolute right-0 mt-2 w-52 bg-[#fbd9c9]/70 backdrop-blur-lg rounded-3xl border-2 border-secondary/10 font-sans  z-30 animate-in fade-in slide-in-from-top-2 duration-150">
            <ul 
              className="py-2"
              role="listbox"
              aria-label="Sort options"
            >
              {options.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => handleSortSelect(option)}
                    className={cn(
                      "block w-full text-left px-4 py-[6px] text-sm hover:bg-primary-100 transition-colors duration-150",
                      currentSort === option.value ? 'text-secondary font-medium' : 'text-secondary-850'
                    )}
                    role="option"
                    aria-selected={currentSort === option.value}
                  >
                    {option.label}
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

export default SortSelector
