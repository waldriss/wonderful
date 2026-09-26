import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
}

interface CardSelectorProps {
  options: CardOption[];
  selected: string[];
  onChange: (value: string) => void;
  multiSelect?: boolean;
  columns?: number;
}

/**
 * Card-based selector with minimal, fast animations
 */
const CardSelector: React.FC<CardSelectorProps> = ({
  options,
  selected,
  onChange,
  multiSelect = true,
  columns = 2
}) => {
  const cardVariants = {
    selected: {
      backgroundColor: "rgba(237,103,109,0.8)",
      color: "white",

      scale: 1.02,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    unselected: {
      backgroundColor: "transparent",
      color: "rgba(237,103,109,1)",
      borderColor: "rgba(237,103,109,0.2)",
      scale: 1,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.05,
        ease: "easeOut"
      }
    }
  };

  return (
    <div 
      className={`grid gap-3 pt-[2px]`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {options.map((option, index) => {
        const isSelected = selected.includes(option.value);
        
        return (
          <motion.button
            key={option.value}
            className="p-4 rounded-xl border-2 text-left   transition-colors duration-150"
            onClick={() => onChange(option.value)}
            variants={cardVariants}
            initial="unselected"
            animate={isSelected ? "selected" : "unselected"}
            whileHover={!isSelected ? "hover" : undefined}
            whileTap="tap"
          >
            <div>
              {option.icon && (
                <div className="mb-2 transition-colors duration-150">
                  {option.icon}
                </div>
              )}
              
              <h4 className="font-sans font-semibold text-sm mb-1">
                {option.label}
              </h4>
              
              {option.description && (
                <p className={`text-xs transition-colors font-sans duration-150 ${
                  isSelected ? 'text-white/80' : 'text-secondary-700/70'
                }`}>
                  {option.description}
                </p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CardSelector;
