import { Search } from "lucide-react"
import { ChangeEvent } from "react"

interface SearchInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search input component with search icon
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = ""
}) => {
  return (
    <div className={`relative flex-1 ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-secondary/40 
                  focus:border-secondary focus:outline-none bg-transparent text-secondary-850 font-sans
                  transition-colors duration-200 focus:ring-2 focus:ring-secondary/20"
        aria-label="Search products"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary" />
    </div>
  )
}

export default SearchInput
