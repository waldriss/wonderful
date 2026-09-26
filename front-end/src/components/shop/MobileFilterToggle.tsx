import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

interface MobileFilterToggleProps {
  onClick: () => void;
  className?: string;
  filterCount?: number;
}

/**
 * Toggle button to open mobile filter panel - animations removed
 */
const MobileFilterToggle: React.FC<MobileFilterToggleProps> = ({ 
  onClick, 
  className = "",
  filterCount = 0
}) => {
  return (
    <Button 
      variant="outline" 
      className={`h-12 px-5 border-2 border-secondary/30 text-secondary flex items-center gap-2 hover:border-secondary lg:hidden relative ${className}`}
      onClick={onClick}
    >
      <Filter className="h-5 w-5" />
      <span>Filtres</span>
      
      {filterCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {filterCount}
        </span>
      )}
    </Button>
  );
};

export default MobileFilterToggle;
